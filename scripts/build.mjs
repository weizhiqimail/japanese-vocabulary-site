import { cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("无法定位 npm CLI，请通过 npm run build 执行本脚本");
const run = (args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [npmCli, ...args], { cwd, shell: false, stdio: "inherit" });
  child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`npm ${args.join(" ")} 退出码 ${code}`)));
});
await run(["run", "build"], path.join(root, "frontend"));
const web = path.join(root, "backend", "web");
await rm(web, { recursive: true, force: true });
await mkdir(web, { recursive: true });
await cp(path.join(root, "frontend", "dist"), web, { recursive: true });
await run(["run", "build"], path.join(root, "backend"));
console.log("前端静态资源已复制到 backend/web，NestJS 构建完成。");
