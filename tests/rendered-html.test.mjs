import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the vocabulary application and local GitHub corner", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>日本語言葉勉強｜日语词汇学习<\/title>/);
  assert.match(html, /<h1>日本語言葉勉強<\/h1>/);
  assert.match(html, /class="githubCorner"/);
  assert.match(html, /href="https:\/\/github\.com\/weizhiqimail\/japanese-vocabulary-site"/);
  assert.match(html, /src="\/icons\/github\/github\.png"/);
});

test("keeps the GitHub asset local and removes the project-document route", async () => {
  const [component, route, css] = await Promise.all([
    readFile(new URL("../app/components/GitHubCorner.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/[view]/[subview]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(component, /src="\/icons\/github\/github\.png"/);
  assert.doesNotMatch(component, /githubassets\.com|https:\/\/.*\.(png|svg)/);
  assert.doesNotMatch(route, /documents/);
  assert.match(css, /\.githubCorner:hover \.githubCatTail/);
  assert.match(css, /@keyframes githubTailWag/);
  assert.match(css, /\.wordsPage \.tableWrap \{ overflow-x: hidden; \}/);
});
