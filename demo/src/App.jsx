import React, { useEffect, useState } from "react";
import {
  CONTENT_TYPE,
  DISPLAY_FIELD,
  DUPLICATE_STATUS,
  PAGE_SIZE_OPTIONS,
  PART_OF_SPEECH,
  PART_OF_SPEECH_OPTIONS,
  REVIEW_STATUS,
  VOCABULARY_TAG,
  VOCABULARY_TAG_OPTIONS,
} from "./enums.js";
import {
  loadDemoDatabase,
  resetDemoDatabase,
  saveDemoDatabase,
} from "./storage.js";

const initialWords = [
  {
    id: 1,
    word: "顧みる",
    reading: "かえりみる",
    translation: "回顾、回想。反省",
    pos: [PART_OF_SPEECH.INTRANSITIVE_VERB],
    tags: [VOCABULARY_TAG.WRITTEN],
    favoriteCount: 0,
    learned: false,
    review: 0,
    wrong: 2,
    updatedAt: "2026-08-03 09:30",
    collocation: "過去を顧みる",
    sentenceIds: [2],
    grammarIds: [],
    relatedWordIds: [2],
  },
  {
    id: 2,
    word: "基づく",
    reading: "もとづく",
    translation: "基于、根据",
    pos: [PART_OF_SPEECH.INTRANSITIVE_VERB],
    tags: [VOCABULARY_TAG.WRITTEN, VOCABULARY_TAG.BUSINESS],
    favoriteCount: 1,
    learned: true,
    review: 3,
    wrong: 1,
    updatedAt: "2026-08-03 10:15",
    collocation: "事実に基づく",
    sentenceIds: [1],
    grammarIds: [1],
    relatedWordIds: [1],
  },
  {
    id: 3,
    word: "取り組む",
    reading: "とりくむ",
    translation: "致力于、着手",
    pos: [PART_OF_SPEECH.INTRANSITIVE_VERB],
    tags: [VOCABULARY_TAG.BUSINESS],
    favoriteCount: 0,
    learned: false,
    review: 0,
    wrong: 0,
    updatedAt: "2026-08-02 16:00",
    collocation: "課題に取り組む",
    sentenceIds: [],
    grammarIds: [],
    relatedWordIds: [],
  },
  {
    id: 4,
    word: "見込む",
    reading: "みこむ",
    translation: "预期、估计。考虑在内",
    pos: [PART_OF_SPEECH.TRANSITIVE_VERB],
    tags: [VOCABULARY_TAG.BUSINESS],
    favoriteCount: 0,
    learned: true,
    review: 2,
    wrong: 3,
    updatedAt: "2026-08-01 20:20",
    collocation: "効果を見込む",
    sentenceIds: [4],
    grammarIds: [],
    relatedWordIds: [],
  },
  {
    id: 5,
    word: "アポ（イント）",
    reading: "",
    translation: "预约、约会",
    pos: [PART_OF_SPEECH.NOUN],
    tags: [VOCABULARY_TAG.LOANWORD, VOCABULARY_TAG.BUSINESS],
    favoriteCount: 0,
    learned: true,
    review: 1,
    wrong: 1,
    updatedAt: "2026-07-31 13:40",
    collocation: "アポを取る",
    sentenceIds: [5],
    grammarIds: [],
    relatedWordIds: [],
  },
  {
    id: 6,
    word: "しみじみ",
    reading: "しみじみ",
    translation: "深切地、痛切地。仔细地",
    pos: [PART_OF_SPEECH.ADVERB],
    tags: [VOCABULARY_TAG.MIMETIC],
    favoriteCount: 3,
    learned: true,
    review: 5,
    wrong: 4,
    updatedAt: "2026-08-03 11:05",
    collocation: "",
    sentenceIds: [],
    grammarIds: [],
    relatedWordIds: [],
  },
];

const grammars = [
  {
    id: 1,
    form: "～に基づいて",
    meaning: "以……为依据",
    connection: "名词＋に基づいて",
    relatedGrammarIds: [2, 3],
    sentenceIds: [1],
    wordIds: [2],
    deleted: false,
  },
  {
    id: 2,
    form: "～に沿って",
    meaning: "沿着……；按照……",
    connection: "名词＋に沿って",
    relatedGrammarIds: [1],
    sentenceIds: [6],
    wordIds: [],
    deleted: false,
  },
  {
    id: 3,
    form: "～を踏まえて",
    meaning: "在……基础上、考虑到……",
    connection: "名词＋を踏まえて",
    relatedGrammarIds: [1],
    sentenceIds: [7],
    wordIds: [],
    deleted: false,
  },
  {
    id: 4,
    form: "～に応じて",
    meaning: "根据……；与……相应",
    connection: "名词＋に応じて",
    relatedGrammarIds: [],
    sentenceIds: [8],
    wordIds: [],
    deleted: false,
  },
];

const sentences = [
  {
    id: 1,
    japanese: "法律に基づいて罰する。",
    translation: "依据法律进行处罚。",
    wordIds: [2],
    grammarIds: [1],
    deleted: false,
  },
  {
    id: 2,
    japanese: "過去の行いを顧みる。",
    translation: "回顾过去的行为。",
    wordIds: [1],
    grammarIds: [],
    deleted: false,
  },
  {
    id: 3,
    japanese: "家族のありがたさをしみじみ感じた。",
    translation: "深切感受到了家人的可贵。",
    wordIds: [6],
    grammarIds: [],
    deleted: false,
  },
  {
    id: 4,
    japanese: "売上の増加を見込む。",
    translation: "预计销售额会增加。",
    wordIds: [4],
    grammarIds: [],
    deleted: false,
  },
  {
    id: 5,
    japanese: "取引先とアポを取った。",
    translation: "和客户预约了会面。",
    wordIds: [5],
    grammarIds: [],
    deleted: false,
  },
  {
    id: 6,
    japanese: "方針に沿って進める。",
    translation: "按照方针推进。",
    wordIds: [],
    grammarIds: [2],
    deleted: false,
  },
  {
    id: 7,
    japanese: "結果を踏まえて判断する。",
    translation: "根据结果作出判断。",
    wordIds: [],
    grammarIds: [3],
    deleted: false,
  },
  {
    id: 8,
    japanese: "能力に応じて仕事を任せる。",
    translation: "根据能力安排工作。",
    wordIds: [],
    grammarIds: [4],
    deleted: false,
  },
];

const collections = [
  {
    id: 1,
    name: "BJT 来源词汇",
    type: "来源集合",
    progress: 68,
    note: "商务场景中的高频词汇与固定表达。",
    updatedAt: "2026-08-03",
    wordIds: [1, 2, 3, 4, 5, 6],
    grammarIds: [],
    archived: false,
  },
  {
    id: 2,
    name: "N1 来源词汇",
    type: "来源集合",
    progress: 42,
    note: "N1 阅读与听力中常见的抽象表达。",
    updatedAt: "2026-08-02",
    wordIds: [1, 2, 3, 4, 6],
    grammarIds: [],
    archived: false,
  },
  {
    id: 3,
    name: "默认收藏本",
    type: "收藏本",
    progress: 58,
    note: "普通收藏与重点收藏的默认归集。",
    updatedAt: "2026-08-03",
    wordIds: [2, 6],
    grammarIds: [],
    archived: false,
  },
  {
    id: 4,
    name: "默认错题本",
    type: "错题本",
    progress: 35,
    note: "词汇测试错误自动收集。",
    updatedAt: "2026-08-03",
    wordIds: [1, 2, 4, 5, 6],
    grammarIds: [],
    archived: false,
  },
  {
    id: 5,
    name: "默认语法错题本",
    type: "语法错题本",
    progress: 25,
    note: "语法测试错误自动收集。",
    updatedAt: "2026-08-01",
    wordIds: [],
    grammarIds: [1, 2, 3, 4],
    archived: false,
  },
  {
    id: 6,
    name: "商务重点收藏",
    type: "收藏本",
    progress: 50,
    note: "需要反复确认用法的商务词汇。",
    updatedAt: "2026-07-30",
    wordIds: [2, 3, 4, 5],
    grammarIds: [],
    archived: false,
  },
];

const importSeed = [
  {
    id: 1,
    raw: "省みる（かえりみる）反省；检讨",
    type: CONTENT_TYPE.VOCABULARY,
    word: "省みる",
    reading: "かえりみる",
    translation: "反省、检讨",
    pos: PART_OF_SPEECH.TRANSITIVE_VERB,
    duplicate: DUPLICATE_STATUS.POSSIBLE,
    status: REVIEW_STATUS.PENDING,
  },
  {
    id: 2,
    raw: "事実に基づく｜基于事实",
    type: CONTENT_TYPE.COLLOCATION,
    word: "事実に基づく",
    reading: "",
    translation: "基于事实",
    pos: "—",
    duplicate: DUPLICATE_STATUS.UNIQUE,
    status: REVIEW_STATUS.PENDING,
  },
  {
    id: 3,
    raw: "基づく もとづく 根据",
    type: CONTENT_TYPE.VOCABULARY,
    word: "基づく",
    reading: "もとづく",
    translation: "根据",
    pos: PART_OF_SPEECH.INTRANSITIVE_VERB,
    duplicate: DUPLICATE_STATUS.EXISTS,
    status: REVIEW_STATUS.SKIPPED,
  },
  {
    id: 4,
    raw: "～を踏まえて：在……基础上",
    type: CONTENT_TYPE.GRAMMAR,
    word: "～を踏まえて",
    reading: "",
    translation: "在……基础上",
    pos: "—",
    duplicate: DUPLICATE_STATUS.UNIQUE,
    status: REVIEW_STATUS.PENDING,
  },
];

const demoSeed = {
  words: initialWords,
  grammars,
  sentences,
  collections,
  importRows: importSeed,
  mastered: [],
  quizSessions: [],
  settings: {
    defaultFavoriteCollectionId: 3,
    defaultWordErrorCollectionId: 4,
    defaultGrammarErrorCollectionId: 5,
    theme: "light-blue",
  },
};

const pageMeta = {
  home: ["概览", "日本語言葉勉強 V2", "从集合、复习和测试快速继续今天的学习。"],
  collections: [
    "Vocabulary collections",
    "词汇集合",
    "来源集合、用户集合、收藏本与错题本统一管理。",
  ],
  learn: [
    "Collection study",
    "学习",
    "选择一个集合，开始学习或测试；进度会自动保存。",
  ],
  collectionStudy: ["Collection study", "集合学习", "当前集合就是学习范围。"],
  collectionTest: [
    "Collection test",
    "集合测试",
    "题目来自当前集合，并在每次作答后自动保存。",
  ],
  errors: [
    "Review",
    "默认错题本",
    "默认只显示待掌握词汇，已掌握历史仍然保留。",
  ],
  mastered: ["Review", "掌握记录", "查看每次掌握操作和最近操作时间。"],
  favorites: [
    "Review",
    "默认收藏本",
    "可以创建多个收藏本，但只有一个默认收藏本。",
  ],
  words: [
    "Vocabulary",
    "正式词库",
    "本页内查询词汇、搭配与例句，分页状态同步 URL。",
  ],
  wordDetail: [
    "Vocabulary",
    "词汇详情",
    "维护词汇、搭配、例句、语法和关联词汇。",
  ],
  grammars: ["Grammar", "语法库", "维护语法意义、接续、关联语法和例句。"],
  grammarDetail: [
    "Grammar",
    "语法详情",
    "查看语法意义、近义语法、关联词汇和例句。",
  ],
  sentences: ["Sentence", "句子库", "句子与词汇、语法分别存储并通过关系连接。"],
  sentenceDetail: ["Sentence", "句子详情", "查看句子及其关联词汇和语法。"],
  imports: [
    "Management",
    "导入审核",
    "将 AI 输出的 CSV 导入非正式词汇表，审核后才进入正式库。",
  ],
  tags: [
    "Management",
    "标签管理",
    "标签描述词汇属性，不再与 BJT、N1 来源集合混用。",
  ],
  pos: ["Management", "词性管理", "词性使用固定选项，词汇表单不允许自由输入。"],
  settings: ["Management", "系统设置", "配置默认收藏本、默认错题本和主题。"],
};

function getRoute() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "") || "home";
  const map = {
    "": "home",
    home: "home",
    collections: "collections",
    learn: "collections",
    "review/errors": "errors",
    "review/mastered": "mastered",
    "review/favorites": "favorites",
    quiz: "collections",
    words: "words",
    grammars: "grammars",
    sentences: "sentences",
    "management/imports": "imports",
    "management/tags": "tags",
    "management/pos": "pos",
    "management/settings": "settings",
  };
  const collectionRoute = path.match(/^collections\/(\d+)\/(learn|test)$/);
  const dynamic = path.match(/^(words|grammars|sentences)\/(\d+)$/);
  const dynamicPage = dynamic
    ? {
        words: "wordDetail",
        grammars: "grammarDetail",
        sentences: "sentenceDetail",
      }[dynamic[1]]
    : null;
  return {
    page: collectionRoute
      ? collectionRoute[2] === "learn"
        ? "collectionStudy"
        : "collectionTest"
      : dynamicPage || map[path] || "home",
    path,
    collectionId: collectionRoute ? Number(collectionRoute[1]) : null,
    entityId: dynamic ? Number(dynamic[2]) : null,
    params: new URLSearchParams(window.location.search),
  };
}

function href(path, params) {
  const q = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `/${path}${q}`;
}

function Icon({ name, className = "" }) {
  return <i className={`bi bi-${name} ${className}`} aria-hidden="true" />;
}

function Notifications({ items }) {
  return (
    <div className="notification-stack" aria-live="polite">
      {items.map((n) => (
        <div className="app-notification" key={n.id}>
          <Icon name={n.icon || "check-circle-fill"} className="me-2" />
          {n.text}
        </div>
      ))}
    </div>
  );
}

function Header({ page }) {
  const [, title, subtitle] = pageMeta[page] || pageMeta.home;
  return (
    <header className="page-header">
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
    </header>
  );
}

function Navbar() {
  const go = () =>
    document.querySelector(".navbar-collapse.show")?.classList.remove("show");
  return (
    <nav className="navbar navbar-expand-lg fixed-top app-navbar">
      <div className="container-xl">
        <a className="navbar-brand fw-bold" href={href("home")} onClick={go}>
          <Icon name="journal-bookmark-fill" className="me-2" />
          ことば帳 <span className="badge badge-soft ms-1">V2 Demo</span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="打开导航"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <NavLink path="home" label="首页" onClick={go} />
            <NavLink path="collections" label="集合" onClick={go} />
            <NavLink
              path="words?pageNum=1&pageSize=10"
              label="词库"
              onClick={go}
            />
            <NavLink
              path="grammars?pageNum=1&pageSize=10"
              label="语法"
              onClick={go}
            />
            <NavLink
              path="sentences?pageNum=1&pageSize=10"
              label="句子"
              onClick={go}
            />
            <NavLink path="review/mastered?pageNum=1&pageSize=10" label="复习" onClick={go} />
            <NavLink path="management/imports" label="管理" onClick={go} />
          </ul>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ path, label, onClick }) {
  const base = path.split("?")[0];
  const active = window.location.pathname === `/${base}` || (label === "复习" && window.location.pathname.startsWith("/review/")) || (label === "管理" && window.location.pathname.startsWith("/management/"));
  return (
    <li className="nav-item">
      <a className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} href={`/${path}`} onClick={onClick}>
        {label}
      </a>
    </li>
  );
}
function Drop({ label, icon, items, onClick }) {
  return (
    <li className="nav-item dropdown">
      <button
        className="nav-link dropdown-toggle btn btn-link"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <Icon name={icon} className="me-1" />
        {label}
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {items.map(([p, l]) => (
          <li key={p}>
            <a className="dropdown-item" href={href(p)} onClick={onClick}>
              {l}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

function SectionMenu({ page }) {
  const review = [["mastered", "review/mastered?pageNum=1&pageSize=10", "已掌握"], ["errors", "review/errors?pageNum=1&pageSize=10", "错题集"], ["favorites", "review/favorites?pageNum=1&pageSize=10", "收藏本"]];
  const management = [["imports", "management/imports", "导入审核"], ["tags", "management/tags", "标签"], ["pos", "management/pos", "词性"], ["settings", "management/settings", "设置"]];
  const items = review.some(([key]) => key === page) ? review : management.some(([key]) => key === page) ? management : null;
  if (!items) return null;
  return <nav className="subpage-nav section-menu nav nav-underline border-bottom mb-2" aria-label="二级菜单">{items.map(([key, path, label]) => <a className={`nav-link ${page === key ? "active" : ""}`} href={href(path)} key={key}>{label}</a>)}</nav>;
}

function Page({ page, collection, breadcrumb, children }) {
  const child = page === "collectionStudy" || page === "collectionTest";
  const detail = ["wordDetail", "grammarDetail", "sentenceDetail"].includes(page);
  return (
    <main
      className="container-xl app-main page-fade"
      key={`${page}-${collection?.id || ""}`}
    >
      <SectionMenu page={page} />
      {child ? (
        <>
          <nav className="breadcrumb-nav mb-2" aria-label="集合层级">
            <a href={href("collections")}>词汇集合</a>
            <Icon name="chevron-right" className="mx-2 text-secondary" />
            <span>{collection?.name}</span>
          </nav>
          <header className="page-header">
            <h1 className="page-title">{collection?.name}</h1>
            <p className="page-subtitle">{collection?.note}</p>
          </header>
        </>
      ) : <>{breadcrumb ? <><nav className="breadcrumb-nav mb-2" aria-label="页面层级"><a href={href(breadcrumb.path)}>{breadcrumb.parent}</a><Icon name="chevron-right" className="mx-2 text-secondary"/><span>{breadcrumb.current}</span></nav>{!detail && <header className="page-header"><h1 className="page-title">{breadcrumb.current}</h1><p className="page-subtitle">{(pageMeta[page] || pageMeta.home)[2]}</p></header>}</> : <Header page={page} />}</>}{" "}
      {children}
    </main>
  );
}

function Metrics({ words }) {
  const data = [
    [
      "collection-fill",
      "词库",
      words.length,
      "正式词汇",
      "words?pageNum=1&pageSize=10",
    ],
    [
      "check-circle-fill",
      "已学习",
      words.filter((w) => w.learned).length,
      "查看已掌握",
      "review/mastered?pageNum=1&pageSize=10",
    ],
    [
      "arrow-repeat",
      "累计复习",
      words.reduce((a, w) => a + w.review, 0),
      "选择学习集合",
      "collections",
    ],
    [
      "exclamation-diamond-fill",
      "错题",
      words.filter((w) => w.wrong).length,
      "打开错题集",
      "review/errors?pageNum=1&pageSize=10",
    ],
  ];
  return (
    <div className="row g-3">
      {data.map(([i, l, v, s, path]) => (
        <div className="col-6 col-lg-3" key={l}>
          <a
            className="metric-card d-block text-decoration-none text-body"
            href={`/${path}`}
          >
            <div className="d-flex justify-content-between">
              <div>
                <div className="text-secondary small">{l}</div>
                <div className="metric-value">{v}</div>
              </div>
              <div className="metric-icon">
                <Icon name={i} />
              </div>
            </div>
            <div className="small text-primary">
              {s} <Icon name="arrow-right" />
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

function Home({ words, collections }) {
  return (
    <>
      <Metrics words={words} />
      <div className="row g-3 mt-1">
        <div className="col-lg-8">
          <div className="section-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">最近集合</h2>
              <a
                href={href("learn")}
                className="btn btn-outline-primary btn-sm"
              >
                全部集合
              </a>
            </div>
            <div className="list-group list-group-flush">
              {collections
                .filter((c) => !c.archived)
                .slice(0, 3)
                .map((c) => (
                  <div className="list-group-item px-0" key={c.id}>
                    <div className="d-flex justify-content-between gap-3 align-items-center">
                      <div className="flex-grow-1">
                        <strong>{c.name}</strong>
                        <div className="small text-secondary mt-1">
                          {c.note}
                        </div>
                      </div>
                      <a
                        href={href(`collections/${c.id}/learn`)}
                        className="btn btn-primary btn-sm flex-shrink-0"
                      >
                        学习
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="section-card h-100">
            <h2 className="h5">最近活动</h2>
            <div className="vstack gap-3 small">
              <div>
                <span className="status-dot bg-success" />
                收藏与重点收藏自动保存
              </div>
              <div>
                <span className="status-dot bg-primary" />
                学习状态保存在浏览器
              </div>
              <div>
                <span className="status-dot bg-warning" />
                测试答案逐题保存
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CollectionCards({
  collections,
  words,
  grammars,
  management = false,
  onEdit,
  onDelete,
}) {
  return (
    <div className="row g-3">
      {collections
        .filter((c) => !c.archived)
        .map((c) => {
          const count = (c.wordIds?.length || 0) + (c.grammarIds?.length || 0);
          const mastered = (c.wordIds || []).filter(
            (id) => words.find((w) => w.id === id)?.learned,
          ).length;
          return (
            <div className="col-md-6 col-xl-4" key={c.id}>
              <article className="section-card collection-card h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="badge badge-soft collection-type-badge">
                    {c.type}
                  </span>
                  {management && (
                    <div className="dropdown">
                      <button
                        className="btn btn-light icon-button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        aria-label="集合菜单"
                      >
                        <Icon name="three-dots" />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => onEdit(c)}
                          >
                            <Icon name="pencil" className="me-2" />
                            编辑
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => onDelete(c.id)}
                          >
                            <Icon name="trash3" className="me-2" />
                            逻辑删除
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <h2 className="h5 mt-3 mb-1">{c.name}</h2>
                <p className="text-secondary small collection-note">{c.note}</p>
                <small className="text-secondary">更新 {c.updatedAt}</small>
                <div className="collection-meta small text-center my-3">
                  <div className="border rounded p-2">
                    <strong className="d-block">{count}</strong>总数
                  </div>
                  <div className="border rounded p-2">
                    <strong className="d-block">{mastered}</strong>已掌握
                  </div>
                  <div className="border rounded p-2">
                    <strong className="d-block">
                      {Math.max(0, count - mastered)}
                    </strong>
                    待掌握
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <a
                    className="btn btn-outline-primary flex-fill"
                    href={href(`collections/${c.id}/learn`)}
                  >
                    <Icon name="book" className="me-1" />
                    学习
                  </a>
                  <a
                    className="btn btn-primary flex-fill"
                    href={href(`collections/${c.id}/test`)}
                  >
                    <Icon name="patch-question" className="me-1" />
                    测试
                  </a>
                </div>
              </article>
            </div>
          );
        })}
    </div>
  );
}

function CollectionsPage({
  collections,
  setCollections,
  words,
  grammars,
  notify,
}) {
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const create = () => { const item = { id: Date.now(), name: "新词汇集合", note: "用于整理新的学习词汇。", type: "用户集合", updatedAt: new Date().toISOString().slice(0, 10), wordIds: [], grammarIds: [], archived: false }; setCollections((items) => [...items, item]); setEditing(item); setName(item.name); notify("集合已创建，请完善信息"); };
  const edit = (c) => {
    setEditing(c);
    setName(c.name);
  };
  const save = () => {
    setCollections((items) =>
      items.map((c) =>
        c.id === editing.id
          ? { ...c, name, note: editing.note, updatedAt: new Date().toISOString().slice(0, 10) }
          : c,
      ),
    );
    setEditing(null);
    notify("集合信息已保存");
  };
  const remove = (id) => {
    const target = collections.find((item) => item.id === id);
    if (!window.confirm(`确认逻辑删除「${target?.name}」吗？`)) return;
    setCollections((items) =>
      items.map((c) => (c.id === id ? { ...c, archived: true } : c)),
    );
    notify("集合已逻辑删除");
  };
  return (
    <>
      <div className="d-flex justify-content-end mb-3"><button className="btn btn-primary" onClick={create}><Icon name="plus-lg" className="me-1"/>创建集合</button></div>
      <CollectionCards
        collections={collections}
        words={words}
        grammars={grammars}
        management
        onEdit={edit}
        onDelete={remove}
      />
      {editing && (
        <Modal
          title="编辑集合"
          onClose={() => setEditing(null)}
          footer={
            <button className="btn btn-primary" onClick={save}>
              保存
            </button>
          }
        >
          <InlineInput label="集合名称" value={name} onChange={setName} />
          <div className="inline-field">
            <label className="form-label mb-0">集合说明</label>
            <textarea
              className="form-control"
              rows="3"
              value={editing.note}
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
            />
          </div>
        </Modal>
      )}
    </>
  );
}

function LearningHub({ collections, words, grammars }) {
  return (
    <CollectionCards
      collections={collections}
      words={words}
      grammars={grammars}
    />
  );
}

function DisplayToolbar({ display, setDisplay }) {
  const fields = [
    [DISPLAY_FIELD.WORD, "仅日语"],
    [DISPLAY_FIELD.READING, "仅假名"],
    [DISPLAY_FIELD.TRANSLATION, "仅翻译"],
  ];
  const toggle = (key) =>
    setDisplay((current) => ({ ...current, [key]: !current[key] }));
  return (
    <div className="toolbar d-flex flex-wrap gap-3 align-items-center">
      <span className="small fw-bold text-secondary">显示</span>
      {fields.map(([key, label]) => (
        <div className="form-check form-check-inline mb-0" key={key}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`display-${key}`}
            checked={display[key]}
            disabled={display.memory}
            onChange={() => toggle(key)}
          />
          <label className="form-check-label" htmlFor={`display-${key}`}>
            {label}
          </label>
        </div>
      ))}
      <div className="vr d-none d-sm-block" />
      <div className="form-check mb-0">
        <input
          className="form-check-input"
          type="checkbox"
          id="display-memory"
          checked={display.memory}
          onChange={() =>
            setDisplay((current) => ({ ...current, memory: !current.memory }))
          }
        />
        <label
          className="form-check-label fw-semibold"
          htmlFor="display-memory"
        >
          默记
        </label>
      </div>
    </div>
  );
}

function WordCard({
  item,
  display,
  onFavorite,
  onImportantFavorite,
  onLearn,
  sentences,
  grammars,
}) {
  const [shown, setShown] = useState({
    word: true,
    reading: false,
    translation: false,
  });
  useEffect(
    () => setShown({ word: true, reading: false, translation: false }),
    [display.memory],
  );
  const visible = (field) =>
    display.memory
      ? field === DISPLAY_FIELD.WORD || shown[field]
      : display[field];
  const field = (name, value) =>
    visible(name) ? (
      value || "—"
    ) : (
      <button
        className="btn btn-link p-0 hidden-field text-decoration-none"
        onClick={() => setShown((s) => ({ ...s, [name]: true }))}
        aria-label={`显示${name}`}
      >
        —
      </button>
    );
  const sentence = sentences.find((value) =>
    item.sentenceIds?.includes(value.id),
  );
  const grammar = grammars.find((value) => item.grammarIds?.includes(value.id));
  const favoriteCount = item.favoriteCount || 0;
  return (
    <article className="word-card">
      <div className="d-flex justify-content-between gap-2">
        <div className="word-line flex-wrap">
          <a className="word text-decoration-none" href={href(`words/${item.id}`)}>{field(DISPLAY_FIELD.WORD, item.word)}</a>
          <span className="reading">
            {field(DISPLAY_FIELD.READING, item.reading)}
          </span>
        </div>
        <div className="d-flex gap-1">
          <button
            className={`btn icon-button ${favoriteCount ? "btn-warning" : "btn-light text-secondary"}`}
            onClick={() => onFavorite(item.id)}
            aria-label={favoriteCount ? "取消收藏" : "收藏"}
            title={favoriteCount ? "取消收藏" : "收藏"}
          >
            <Icon name={favoriteCount ? "star-fill" : "star"} />
          </button>
          {favoriteCount > 0 && (
            <button
              className="btn btn-outline-warning icon-button position-relative"
              onClick={() => onImportantFavorite(item.id)}
              aria-label="重点收藏"
              title="重点收藏次数加一"
            >
              <Icon name="bookmark-star-fill" />
              <span className="favorite-count">{favoriteCount}</span>
            </button>
          )}
        </div>
      </div>
      <div className="mt-1">
        <span className="badge text-bg-light me-2">{item.pos.join("、")}</span>
        <span className="meaning">
          {field(DISPLAY_FIELD.TRANSLATION, item.translation)}
        </span>
      </div>
      {item.collocation && (
        <div className="detail-row">
          <span className="detail-label">搭配</span>
          <span>{item.collocation}</span>
        </div>
      )}
      {sentence && (
        <div className="detail-row">
          <span className="detail-label">例句</span>
          <span>
            <a href={href(`sentences/${sentence.id}`)}>{sentence.japanese}</a>
          </span>
        </div>
      )}
      {grammar && (
        <div className="detail-row">
          <span className="detail-label">语法</span>
          <span>
            <a href={href(`grammars/${grammar.id}`)}>
              {grammar.form}：{grammar.meaning}
            </a>
          </span>
        </div>
      )}
    </article>
  );
}

function CollectionStudy({
  collection,
  words,
  onFavorite,
  onImportantFavorite,
  sentences,
  grammars,
}) {
  const [display, setDisplay] = useState({
    word: true,
    reading: true,
    translation: true,
    memory: false,
  });
  const list = words.filter((w) => collection?.wordIds?.includes(w.id));
  if (!collection) return <EmptyState text="没有找到这个集合" />;
  return (
    <>
      <DisplayToolbar display={display} setDisplay={setDisplay} />
      <div className="row g-2">
        {list.map((w) => (
          <div className="col-lg-6" key={w.id}>
            <WordCard
              item={w}
              display={display}
              onFavorite={onFavorite}
              onImportantFavorite={onImportantFavorite}
              sentences={sentences}
              grammars={grammars}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function ReviewPage({ kind, words, onFavorite, onMaster, route }) {
  const keyword = route.params.get("keyword") || "";
  const source =
    kind === "favorites"
      ? words.filter((w) => w.favoriteCount > 0)
      : kind === "mastered"
        ? words.filter((w) => w.learned)
        : words.filter((w) => w.wrong > 0);
  const list = source.filter((w) =>
    `${w.word}${w.reading}${w.translation}`.includes(keyword),
  );
  const pageSize = Number(route.params.get("pageSize") || 10),
    pageNum = Number(route.params.get("pageNum") || 1);
  const path = `review/${kind}`;
  const actions = (w) => (
      <button
        className="btn btn-light icon-button"
        onClick={() => onFavorite(w.id)}
        aria-label="切换收藏"
      >
        <Icon name={w.favoriteCount > 0 ? "star-fill" : "star"} />
      </button>
  );
  return (
    <>
      <InlineSearch
        path={path}
        keyword={keyword}
        pageSize={pageSize}
        placeholder="词汇、假名或翻译"
      />
      <div className="section-card">
        <div className="d-none d-md-block">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>词汇</th>
                <th>假名</th>
                <th>翻译</th>
                <th>错误次数</th>
                <th>最近时间</th>
                <th className="text-end">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((w) => (
                <tr key={w.id}>
                  <td>
                    <a href={href(`words/${w.id}`)} className="fw-bold">
                      {w.word}
                    </a>
                  </td>
                  <td>{w.reading || "—"}</td>
                  <td>{w.translation}</td>
                  <td>{w.wrong}</td>
                  <td className="small text-secondary">{w.updatedAt}</td>
                  <td className="text-end">{actions(w)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-md-none mobile-card-list">
          {list.map((w) => (
            <article className="mobile-row-card" key={w.id}>
              <div className="d-flex justify-content-between">
                <div>
                  <a href={href(`words/${w.id}`)} className="fw-bold">
                    {w.word}
                  </a>
                  <span className="text-secondary ms-2">{w.reading}</span>
                </div>
                <span className="badge badge-soft">错误 {w.wrong}</span>
              </div>
              <p className="my-2">{w.translation}</p>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-secondary">{w.updatedAt}</small>
                <div>{actions(w)}</div>
              </div>
            </article>
          ))}
        </div>
        <Pagination
          path={path}
          pageNum={pageNum}
          pageSize={pageSize}
          total={list.length}
          params={{ keyword }}
        />
      </div>
    </>
  );
}

function ReviewNav({ active }) {
  return (
    <nav
      className="subpage-nav nav nav-underline border-bottom mb-3"
      aria-label="复习分类"
    >
      <a
        className={`nav-link ${active === "mastered" ? "active" : ""}`}
        href={href("review/mastered", { pageNum: 1, pageSize: 10 })}
      >
        已掌握
      </a>
      <a
        className={`nav-link ${active === "errors" ? "active" : ""}`}
        href={href("review/errors", { pageNum: 1, pageSize: 10 })}
      >
        错题集
      </a>
      <a
        className={`nav-link ${active === "favorites" ? "active" : ""}`}
        href={href("review/favorites", { pageNum: 1, pageSize: 10 })}
      >
        收藏本
      </a>
    </nav>
  );
}

function CollectionTest({
  collection,
  words,
  grammars,
  notify,
  onSaveAnswer,
  onWrong,
}) {
  const pool = collection?.grammarIds?.length
    ? collection.grammarIds
        .map((id) => grammars.find((g) => g.id === id))
        .filter(Boolean)
    : collection?.wordIds
        ?.map((id) => words.find((w) => w.id === id))
        .filter(Boolean) || [];
  const questions = pool.flatMap((item, index) =>
    collection?.grammarIds?.length
      ? [
          {
            id: `g-${item.id}`,
            label: `「${item.form}」的意思是？`,
            correct: item.meaning,
            options: makeOptions(
              item.meaning,
              pool.map((x) => x.meaning),
              index,
            ),
            objectId: item.id,
            type: "语法",
          },
        ]
      : [
          {
            id: `w-${item.id}-meaning`,
            label: `「${item.word}」的意思是？`,
            correct: item.translation,
            options: makeOptions(
              item.translation,
              pool.map((x) => x.translation),
              index,
            ),
            objectId: item.id,
            type: "词汇",
          },
          ...(item.reading
            ? [
                {
                  id: `w-${item.id}-reading`,
                  label: `「${item.word}」的假名是？`,
                  correct: item.reading,
                  options: makeOptions(
                    item.reading,
                    pool.map((x) => x.reading).filter(Boolean),
                    index,
                  ),
                  objectId: item.id,
                  type: "假名",
                },
              ]
            : []),
        ],
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const current = questions[index];
  if (!collection) return <EmptyState text="没有找到这个集合" />;
  if (!current)
    return (
      <div className="section-card empty-block">
        <Icon name="trophy" className="fs-1" />
        <h2 className="h5 mt-2">本组测试完成</h2>
        <p className="text-secondary">
          共完成 {questions.length} 道题，每次答案均已保存。
        </p>
        <a className="btn btn-primary" href={href("learn")}>
          返回学习集合
        </a>
      </div>
    );
  const choose = (option) => {
    if (answer) return;
    setAnswer(option);
    const correct = option === current.correct;
    onSaveAnswer({
      id: Date.now(),
      collectionId: collection.id,
      questionId: current.id,
      answer: option,
      correct,
      savedAt: new Date().toISOString(),
    });
    if (!correct)
      onWrong(current.objectId, Boolean(collection.grammarIds?.length));
    notify(
      correct ? "回答正确，已自动保存" : "回答错误，已写入默认错题本",
      correct ? "check-circle-fill" : "exclamation-circle-fill",
    );
    setTimeout(
      () => {
        setAnswer("");
        setIndex((i) => i + 1);
      },
      correct ? 650 : 1900,
    );
  };
  return (
    <div className="section-card mx-auto" style={{ maxWidth: 760 }}>
      <div className="d-flex justify-content-between mb-3">
        <span className="badge badge-soft">{current.type}题</span>
        <span className="text-secondary">
          {index + 1} / {questions.length}
        </span>
      </div>
      <h2 className="h4 mb-4">{current.label}</h2>
      <div className="d-grid gap-2">
        {current.options.map((o) => (
          <button
            className={`btn quiz-option ${answer ? (o === current.correct ? "correct" : answer === o ? "wrong" : "btn-outline-secondary") : "btn-outline-secondary"}`}
            key={o}
            onClick={() => choose(o)}
            disabled={!!answer}
          >
            {o}
          </button>
        ))}
      </div>
      {answer && (
        <div
          className={`alert mt-3 mb-0 ${answer === current.correct ? "alert-success" : "alert-danger"}`}
        >
          {answer === current.correct ? (
            "回答正确，即将进入下一题"
          ) : (
            <>回答错误。正确答案是“{current.correct}”，即将进入下一题</>
          )}
          。
        </div>
      )}
      <div className="small text-secondary mt-3">
        <Icon name={answer ? "cloud-check-fill" : "cloud"} className="me-1" />
        {answer ? "本题已自动保存" : "每次作答都会自动保存"}
      </div>
    </div>
  );
}

function makeOptions(correct, values, index) {
  const unique = [
    ...new Set(values.filter(Boolean).filter((v) => v !== correct)),
  ];
  const fallbacks = ["重新考虑", "不受限制", "逐渐变化", "立即停止"];
  return [correct, ...unique, ...fallbacks]
    .slice(0, 4)
    .sort((a, b) => ((a.length + index) % 5) - ((b.length + index) % 5));
}
function EmptyState({ text }) {
  return (
    <div className="section-card empty-block">
      <Icon name="inbox" className="fs-1" />
      <p className="mt-2 mb-0">{text}</p>
    </div>
  );
}

function WordsPage({ words, setWords, notify, route }) {
  const [keyword, setKeyword] = useState(route.params.get("keyword") || "");
  const pageSize = Number(route.params.get("pageSize") || 10);
  const pageNum = Number(route.params.get("pageNum") || 1);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ word: "差し支える", reading: "さしつかえる", translation: "妨碍、影响" });
  const [selectedPos, setSelectedPos] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const filtered = words.filter((w) => !w.deleted &&
    `${w.word}${w.reading}${w.translation}${w.collocation}${w.sentence}`.includes(
      keyword,
    ),
  );
  const apply = () => {
    window.history.pushState(
      {},
      "",
      href("words", { keyword, pageNum: 1, pageSize }),
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const save = () => {
    setLoading(true);
    setTimeout(() => {
      setWords((ws) => editing ? ws.map((item) => item.id === editing.id ? { ...item, ...draft, pos: selectedPos, tags: selectedTags, updatedAt: new Date().toLocaleString() } : item) : [...ws, {
          id: Date.now(),
          ...draft,
          pos: selectedPos,
          tags: selectedTags,
          favoriteCount: 0,
          learned: false,
          review: 0,
          wrong: 0,
          updatedAt: new Date().toLocaleString(),
          collocation: "業務に差し支える",
          sentenceIds: [],
          grammarIds: [],
          relatedWordIds: [],
        }]);
      setLoading(false);
      setModal(false);
      setEditing(null);
      notify(editing ? "词汇已更新" : "词汇已添加");
    }, 700);
  };
  const openCreate = () => { setEditing(null); setDraft({ word: "差し支える", reading: "さしつかえる", translation: "妨碍、影响" }); setSelectedPos([]); setSelectedTags([]); setModal(true); };
  const openEdit = (word) => { setEditing(word); setDraft({ word: word.word, reading: word.reading, translation: word.translation }); setSelectedPos(word.pos); setSelectedTags(word.tags); setModal(true); };
  const remove = (word) => { if (!window.confirm(`确认逻辑删除「${word.word}」吗？`)) return; setWords((items) => items.map((item) => item.id === word.id ? { ...item, deleted: true, updatedAt: new Date().toLocaleString() } : item)); notify(`已逻辑删除「${word.word}」`); };
  const row = (w) => (
    <>
      <td>
        <a
          href={href(`words/${w.id}`)}
          className="fw-bold text-decoration-none"
        >
          {w.word}
        </a>
        <div className="small text-secondary">{w.reading || "无假名"}</div>
      </td>
      <td>{w.translation}</td>
      <td>
        {w.pos.map((value) => (
          <span className="badge text-bg-light me-1" key={value}>
            {value}
          </span>
        ))}
        {w.tags.map((t) => (
          <span className="badge badge-soft me-1" key={t}>
            {t}
          </span>
        ))}
      </td>
      <td className="small">{w.collocation || "—"}</td>
      <td className="text-end">
        <button className="btn btn-light icon-button me-1" aria-label="编辑" onClick={() => openEdit(w)}>
          <Icon name="pencil" />
        </button>
        <button className="btn btn-light text-danger icon-button" aria-label="逻辑删除" onClick={() => remove(w)}><Icon name="trash3" /></button>
      </td>
    </>
  );
  return (
    <>
      <div className="toolbar query-toolbar">
        <div className="query-row">
          <input
            className="form-control"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="词汇、假名、翻译、搭配或句子"
          />
          <button className="btn btn-outline-primary" onClick={apply}>
            <Icon name="search" className="me-1" />
            查询
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus-lg" className="me-1" />
            新增
          </button>
        </div>
      </div>
      <div className="section-card">
        <div className="d-none d-md-block">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>词汇</th>
                <th>翻译</th>
                <th>词性/标签</th>
                <th>词汇搭配</th>
                <th className="text-end">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id}>{row(w)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-md-none mobile-card-list">
          {filtered.map((w) => (
            <article className="mobile-row-card" key={w.id}>
              <a href={href(`words/${w.id}`)} className="fw-bold">
                {w.word}
              </a>
              <span className="text-secondary ms-2">{w.reading}</span>
              <p className="my-2">{w.translation}</p>
              <div>
                {w.pos.map((value) => (
                  <span className="badge text-bg-light me-1" key={value}>
                    {value}
                  </span>
                ))}
                {w.tags.map((t) => (
                  <span className="badge badge-soft me-1" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="d-flex justify-content-end gap-1 mt-2"><button className="btn btn-light icon-button" onClick={() => openEdit(w)} aria-label="编辑"><Icon name="pencil" /></button><button className="btn btn-light text-danger icon-button" onClick={() => remove(w)} aria-label="逻辑删除"><Icon name="trash3" /></button></div>
            </article>
          ))}
        </div>
        <Pagination
          path="words"
          pageNum={pageNum}
          pageSize={pageSize}
          total={filtered.length}
          params={{ keyword }}
        />
      </div>
      {modal && (
        <Modal
          title={editing ? "编辑正式词汇" : "新增正式词汇"}
          onClose={() => setModal(false)}
          footer={
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  保存中
                </>
              ) : (
                <>
                  <Icon name="check-lg" className="me-1" />
                  保存
                </>
              )}
            </button>
          }
        >
          <InlineInput label="词汇" value={draft.word} onChange={(word) => setDraft({ ...draft, word })} />
          <InlineInput label="假名" value={draft.reading} onChange={(reading) => setDraft({ ...draft, reading })} />
          <div className="inline-field align-items-start">
            <label className="form-label mb-0 pt-2">翻译</label>
            <div>
              <textarea
                className="form-control text-start"
                rows="3"
                value={draft.translation}
                onChange={(event) => setDraft({ ...draft, translation: event.target.value })}
              />
              <div className="form-text">
                不同含义用「。」；相近译法用「、」。
              </div>
            </div>
          </div>
          <SearchMultiSelect
            label="词性"
            options={PART_OF_SPEECH_OPTIONS}
            selected={selectedPos}
            setSelected={setSelectedPos}
          />
          <SearchMultiSelect
            label="标签"
            options={VOCABULARY_TAG_OPTIONS}
            selected={selectedTags}
            setSelected={setSelectedTags}
          />
        </Modal>
      )}
    </>
  );
}

function SearchMultiSelect({ label, options, selected, setSelected }) {
  const [filter, setFilter] = useState("");
  const visible = options.filter((x) =>
    x.toLowerCase().includes(filter.toLowerCase()),
  );
  const toggle = (value) =>
    setSelected((items) =>
      items.includes(value)
        ? items.filter((x) => x !== value)
        : [...items, value],
    );
  return (
    <div className="inline-field align-items-start">
      <label className="form-label mb-0 pt-2">{label}</label>
      <div className="dropdown multi-select">
        <button
          className="form-select text-start"
          type="button"
          data-bs-toggle="dropdown"
          data-bs-auto-close="outside"
        >
          {selected.length ? `已选择 ${selected.length} 项` : `选择${label}`}
        </button>
        <div className="dropdown-menu p-2 w-100">
          <input
            className="form-control form-control-sm mb-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`输入过滤${label}`}
          />
          <div className="multi-options">
            {visible.map((value) => (
              <label className="dropdown-item d-flex gap-2" key={value}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selected.includes(value)}
                  onChange={() => toggle(value)}
                />
                {value}
              </label>
            ))}
          </div>
        </div>
        <div className="d-flex flex-wrap gap-1 mt-2">
          {selected.map((value) => (
            <button
              className="btn btn-sm badge badge-soft"
              type="button"
              onClick={() => toggle(value)}
              key={value}
            >
              {value}
              <Icon name="x" className="ms-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, children, footer, onClose }) {
  return (
    <>
      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title fs-5">{title}</h2>
              <button
                className="btn-close"
                onClick={onClose}
                aria-label="关闭"
              />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={onClose}>
                取消
              </button>
              {footer}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}

function Pagination({
  path,
  pageNum = 1,
  pageSize = 10,
  total = 0,
  params = {},
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const [jump, setJump] = useState(String(pageNum));
  const link = (page) =>
    href(path, {
      ...params,
      pageNum: Math.min(pages, Math.max(1, page)),
      pageSize,
    });
  const sizeLink = (size) =>
    href(path, { ...params, pageNum: 1, pageSize: size });
  return (
    <nav className="unified-pagination" aria-label="分页">
      <div className="btn-group btn-group-sm" role="group">
        <a
          className={`btn btn-outline-primary ${pageNum <= 1 ? "disabled" : ""}`}
          href={link(pageNum - 1)}
        >
          上一页
        </a>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(
          (p) => (
            <a
              className={`btn ${p === pageNum ? "btn-primary" : "btn-outline-primary"}`}
              href={link(p)}
              key={p}
            >
              {p}
            </a>
          ),
        )}
        <a
          className={`btn btn-outline-primary ${pageNum >= pages ? "disabled" : ""}`}
          href={link(pageNum + 1)}
        >
          下一页
        </a>
      </div>
      <div className="input-group input-group-sm pagination-jump">
        <input
          className="form-control"
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              window.location.href = link(Number(jump) || 1);
          }}
          aria-label="跳转页码"
        />
        <a className="btn btn-outline-primary" href={link(Number(jump) || 1)}>
          跳转
        </a>
      </div>
      <select
        className="form-select form-select-sm pagination-size"
        value={pageSize}
        onChange={(e) =>
          (window.location.href = sizeLink(Number(e.target.value)))
        }
        aria-label="每页条数"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option value={size} key={size}>
            每页 {size} 条
          </option>
        ))}
      </select>
    </nav>
  );
}

function WordDetail({ id, words, setWords, grammars, sentences, notify }) {
  const w = words.find((value) => value.id === id) || words[0];
  const relatedWords = words.filter((value) =>
    w.relatedWordIds?.includes(value.id),
  );
  const relatedSentences = sentences.filter((value) =>
    w.sentenceIds?.includes(value.id),
  );
  const relatedGrammars = grammars.filter((value) =>
    w.grammarIds?.includes(value.id),
  );
  const [tab, setTab] = useState("relations");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ word: w.word, reading: w.reading, translation: w.translation });
  const save = () => { setWords((items) => items.map((item) => item.id === w.id ? { ...item, ...draft, updatedAt: new Date().toLocaleString() } : item)); setEditing(false); notify("词汇详情已更新"); };
  const remove = () => { if (!window.confirm(`确认逻辑删除「${w.word}」吗？`)) return; setWords((items) => items.map((item) => item.id === w.id ? { ...item, deleted: true } : item)); notify(`已逻辑删除「${w.word}」`); window.history.pushState({}, "", href("words", { pageNum: 1, pageSize: 10 })); window.dispatchEvent(new PopStateEvent("popstate")); };
  return (
    <div className="section-card">
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <div>
          <h2 className="h3 mb-1">
            {w.word} <small className="text-secondary fs-5">{w.reading}</small>
          </h2>
          <p className="mb-1">{w.translation}</p>
          {w.pos.map((value) => (
            <span className="badge text-bg-light me-1" key={value}>
              {value}
            </span>
          ))}
        </div>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={() => setEditing(true)}>
            <Icon name="pencil" className="me-1" />
            编辑
          </button>
          <button className="btn btn-outline-danger" onClick={remove}>
            <Icon name="trash3" className="me-1" />
            逻辑删除
          </button>
        </div>
      </div>
      <ul className="nav nav-tabs mt-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === "relations" ? "active" : ""}`} onClick={() => setTab("relations")}>关联资料</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>学习与测试记录</button>
        </li>
      </ul>
      {tab === "relations" && <div className="row g-3 mt-1">
        {w.collocation && <RelationBox title="搭配">{w.collocation}</RelationBox>}
        {relatedWords.length > 0 && <RelationBox title="关联词汇">
          {relatedWords.length
            ? relatedWords.map((value) => (
                <a
                  className="d-block"
                  href={href(`words/${value.id}`)}
                  key={value.id}
                >
                  {value.word}（{value.reading}）
                </a>
              ))
            : "—"}
        </RelationBox>}
        {relatedSentences.length > 0 && <RelationBox title="关联句子">
          {relatedSentences.length
            ? relatedSentences.map((value) => (
                <a
                  className="d-block"
                  href={href(`sentences/${value.id}`)}
                  key={value.id}
                >
                  {value.japanese}
                </a>
              ))
            : "—"}
        </RelationBox>}
        {relatedGrammars.length > 0 && <RelationBox title="关联语法">
          {relatedGrammars.length
            ? relatedGrammars.map((value) => (
                <a
                  className="d-block"
                  href={href(`grammars/${value.id}`)}
                  key={value.id}
                >
                  {value.form}：{value.meaning}
                </a>
              ))
            : "—"}
        </RelationBox>}
      </div>}
      {tab === "history" && <div className="row g-3 mt-1"><RelationBox title="学习记录"><strong>{w.learned ? "已学习" : "未学习"}</strong><div className="small text-secondary mt-1">最近操作：{w.updatedAt || "暂无"}</div></RelationBox><RelationBox title="测试统计"><strong>错误 {w.wrong} 次</strong><div className="small text-secondary mt-1">复习 {w.review} 次 · 收藏 {w.favoriteCount || 0} 次</div></RelationBox></div>}
      {editing && <Modal title="编辑词汇" onClose={() => setEditing(false)} footer={<button className="btn btn-primary" onClick={save}>保存</button>}><InlineInput label="词汇" value={draft.word} onChange={(word) => setDraft({ ...draft, word })}/><InlineInput label="假名" value={draft.reading} onChange={(reading) => setDraft({ ...draft, reading })}/><div className="inline-field"><label className="form-label mb-0">翻译</label><textarea className="form-control" value={draft.translation} onChange={(event) => setDraft({ ...draft, translation: event.target.value })}/></div></Modal>}
    </div>
  );
}

function RelationBox({ title, children }) {
  return (
    <div className="col-md-6">
      <div className="border rounded-3 p-3 h-100">
        <div className="small text-secondary">{title}</div>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function GrammarList({
  route,
  grammars,
  setGrammars,
  sentences,
  setSentences,
  notify,
}) {
  const keyword = route.params.get("keyword") || "";
  const pageNum = Number(route.params.get("pageNum") || 1),
    pageSize = Number(route.params.get("pageSize") || 10);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    form: "～を通じて",
    meaning: "通过……",
    connection: "名词＋を通じて",
    sentenceId: "",
    newSentence: "",
    newTranslation: "",
  });
  const list = grammars.filter(
    (g) =>
      !g.deleted && `${g.form}${g.meaning}${g.connection}`.includes(keyword),
  );
  const save = () => {
    setLoading(true);
    setTimeout(() => {
      const grammarId = Date.now();
      let sentenceIds = form.sentenceId ? [Number(form.sentenceId)] : [];
      if (form.newSentence) {
        const sentenceId = grammarId + 1;
        sentenceIds = [...sentenceIds, sentenceId];
        setSentences((items) => [
          ...items,
          {
            id: sentenceId,
            japanese: form.newSentence,
            translation: form.newTranslation,
            wordIds: [],
            grammarIds: [grammarId],
            deleted: false,
          },
        ]);
      }
      if (form.sentenceId)
        setSentences((items) =>
          items.map((s) =>
            s.id === Number(form.sentenceId)
              ? { ...s, grammarIds: [...(s.grammarIds || []), grammarId] }
              : s,
          ),
        );
      setGrammars((items) => [
        ...items,
        {
          id: grammarId,
          form: form.form,
          meaning: form.meaning,
          connection: form.connection,
          relatedGrammarIds: [],
          sentenceIds,
          wordIds: [],
          deleted: false,
        },
      ]);
      setLoading(false);
      setModal(false);
      notify("语法及句子关联已保存");
    }, 650);
  };
  return (
    <>
      <InlineSearch
        path="grammars"
        keyword={keyword}
        pageSize={pageSize}
        placeholder="语法、意思、接续或例句"
        onAdd={() => setModal(true)}
      />
      <div className="row g-3">
        {list.map((g) => (
          <div className="col-md-6" key={g.id}>
            <div className="section-card h-100">
              <h2 className="h5 grammar-card-title">
                <a className="text-decoration-none" href={href(`grammars/${g.id}`)}>
                  {g.form}
                </a>
              </h2>
              <p className="fw-semibold grammar-card-meaning">{g.meaning}</p>
              <div className="small">
                <span className="text-secondary">接续：</span>
                {g.connection}
              </div>
              <div className="small mt-2">
                <span className="text-secondary">关联句子：</span>
                {g.sentenceIds.length
                  ? g.sentenceIds.map((id, index) => {
                      const sentence = sentences.find((item) => item.id === id);
                      return sentence ? (
                        <React.Fragment key={id}>
                          {index > 0 && "、"}
                          <a href={href(`sentences/${id}`)}>{sentence.japanese}</a>
                        </React.Fragment>
                      ) : null;
                    })
                  : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination
        path="grammars"
        pageNum={pageNum}
        pageSize={pageSize}
        total={list.length}
        params={{ keyword }}
      />
      {modal && (
        <Modal
          title="新增语法"
          onClose={() => setModal(false)}
          footer={
            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={save}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  保存中
                </>
              ) : (
                "保存语法"
              )}
            </button>
          }
        >
          <InlineInput
            label="语法"
            value={form.form}
            onChange={(value) => setForm({ ...form, form: value })}
          />
          <InlineInput
            label="意思"
            value={form.meaning}
            onChange={(value) => setForm({ ...form, meaning: value })}
          />
          <InlineInput
            label="接续"
            value={form.connection}
            onChange={(value) => setForm({ ...form, connection: value })}
          />
          <div className="inline-field">
            <label className="form-label mb-0">关联现有句子</label>
            <select
              className="form-select"
              value={form.sentenceId}
              onChange={(e) => setForm({ ...form, sentenceId: e.target.value })}
            >
              <option value="">不选择</option>
              {sentences
                .filter((s) => !s.deleted)
                .map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.japanese}
                  </option>
                ))}
            </select>
          </div>
          <hr />
          <InlineInput
            label="新增关联句子"
            value={form.newSentence}
            onChange={(value) => setForm({ ...form, newSentence: value })}
          />
          <InlineInput
            label="句子翻译"
            value={form.newTranslation}
            onChange={(value) => setForm({ ...form, newTranslation: value })}
          />
          <div className="form-text">
            填写新句子后，保存语法时会同时创建句子并建立双向关联。
          </div>
        </Modal>
      )}
    </>
  );
}
function GrammarDetail({ id, grammars, setGrammars, sentences, words, notify }) {
  const g = grammars.find((value) => value.id === id) || grammars[0];
  const related = grammars.filter((value) =>
    g.relatedGrammarIds?.includes(value.id),
  );
  const linkedSentences = sentences.filter((value) =>
    g.sentenceIds?.includes(value.id),
  );
  const linkedWords = words.filter((value) => g.wordIds?.includes(value.id));
  const [tab, setTab] = useState("relations");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ form: g.form, meaning: g.meaning, connection: g.connection });
  const save = () => { setGrammars((items) => items.map((item) => item.id === g.id ? { ...item, ...draft } : item)); setEditing(false); notify("语法已更新"); };
  const remove = () => { if (!window.confirm(`确认逻辑删除「${g.form}」吗？`)) return; setGrammars((items) => items.map((item) => item.id === g.id ? { ...item, deleted: true } : item)); notify(`已逻辑删除「${g.form}」`); };
  return (
    <div className="section-card">
      <div className="d-flex justify-content-between gap-2"><h2>{g.form}</h2><div><button className="btn btn-outline-primary me-2" onClick={() => setEditing(true)}><Icon name="pencil" className="me-1"/>编辑</button><button className="btn btn-outline-danger" onClick={remove}><Icon name="trash3" className="me-1"/>逻辑删除</button></div></div>
      <p className="lead text-primary">{g.meaning}</p>
      <nav className="subpage-nav nav nav-underline border-bottom mb-3"><button className={`nav-link ${tab === "relations" ? "active" : ""}`} onClick={() => setTab("relations")}>关联资料</button><button className={`nav-link ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>学习与测试记录</button></nav>
      {tab === "relations" && <>
      <dl className="row">
        <dt className="col-sm-2">接续</dt>
        <dd className="col-sm-10">{g.connection}</dd>
        <dt className="col-sm-2">近义语法</dt>
        <dd className="col-sm-10">
          {related.map((value) => (
            <a
              className="me-3"
              href={href(`grammars/${value.id}`)}
              key={value.id}
            >
              {value.form}
            </a>
          ))}
        </dd>
        <dt className="col-sm-2">关联词汇</dt>
        <dd className="col-sm-10">
          {linkedWords.map((value) => (
            <a className="me-3" href={href(`words/${value.id}`)} key={value.id}>
              {value.word}
            </a>
          ))}
        </dd>
        <dt className="col-sm-2">关联句子</dt>
        <dd className="col-sm-10">
          {linkedSentences.map((value) => (
            <a
              className="d-block"
              href={href(`sentences/${value.id}`)}
              key={value.id}
            >
              {value.japanese}
            </a>
          ))}
        </dd>
      </dl>
      </>}
      {tab === "history" && <div className="row g-3"><RelationBox title="学习记录">已加入语法集合 · 最近复习 2026-08-03</RelationBox><RelationBox title="测试统计">测试 8 次 · 错误 2 次 · 正确率 75%</RelationBox></div>}
      {editing && <Modal title="编辑语法" onClose={() => setEditing(false)} footer={<button className="btn btn-primary" onClick={save}>保存</button>}><InlineInput label="语法" value={draft.form} onChange={(form) => setDraft({ ...draft, form })}/><InlineInput label="意思" value={draft.meaning} onChange={(meaning) => setDraft({ ...draft, meaning })}/><InlineInput label="接续" value={draft.connection} onChange={(connection) => setDraft({ ...draft, connection })}/></Modal>}
    </div>
  );
}
function SentencesPage({
  route,
  sentences,
  setSentences,
  grammars,
  setGrammars,
  words,
  setWords,
  notify,
}) {
  const keyword = route.params.get("keyword") || "";
  const pageNum = Number(route.params.get("pageNum") || 1),
    pageSize = Number(route.params.get("pageSize") || 10);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    japanese: "会議を通じて理解を深めた。",
    translation: "通过会议加深了理解。",
    wordId: "",
    grammarId: "",
  });
  const list = sentences.filter(
    (s) => !s.deleted && `${s.japanese}${s.translation}`.includes(keyword),
  );
  const save = () => {
    setLoading(true);
    setTimeout(() => {
      const id = Date.now();
      const grammarIds = form.grammarId ? [Number(form.grammarId)] : [];
      const wordIds = form.wordId ? [Number(form.wordId)] : [];
      setSentences((items) => [
        ...items,
        {
          id,
          japanese: form.japanese,
          translation: form.translation,
          wordIds,
          grammarIds,
          deleted: false,
        },
      ]);
      if (form.grammarId)
        setGrammars((items) =>
          items.map((g) =>
            g.id === Number(form.grammarId)
              ? { ...g, sentenceIds: [...(g.sentenceIds || []), id] }
              : g,
          ),
        );
      if (form.wordId)
        setWords((items) =>
          items.map((w) =>
            w.id === Number(form.wordId)
              ? { ...w, sentenceIds: [...(w.sentenceIds || []), id] }
              : w,
          ),
        );
      setLoading(false);
      setModal(false);
      notify("句子已添加并建立双向关联");
    }, 650);
  };
  return (
    <>
      <InlineSearch
        path="sentences"
        keyword={keyword}
        pageSize={pageSize}
        placeholder="句子、翻译、词汇或语法"
        onAdd={() => setModal(true)}
      />
      <div className="section-card">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>日语句子</th>
                <th>翻译</th>
                <th>关联词汇</th>
                <th>关联语法</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td>
                    <a href={href(`sentences/${s.id}`)}>{s.japanese}</a>
                  </td>
                  <td>{s.translation}</td>
                  <td>
                    {s.wordIds
                      .map((id) => words.find((w) => w.id === id)?.word)
                      .filter(Boolean)
                      .join("、") || "—"}
                  </td>
                  <td>
                    {s.grammarIds
                      .map((id) => grammars.find((g) => g.id === id)?.form)
                      .filter(Boolean)
                      .join("、") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          path="sentences"
          pageNum={pageNum}
          pageSize={pageSize}
          total={list.length}
          params={{ keyword }}
        />
      </div>
      {modal && (
        <Modal
          title="新增句子"
          onClose={() => setModal(false)}
          footer={
            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={save}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  保存中
                </>
              ) : (
                "保存句子"
              )}
            </button>
          }
        >
          <InlineInput
            label="日语句子"
            value={form.japanese}
            onChange={(value) => setForm({ ...form, japanese: value })}
          />
          <InlineInput
            label="翻译"
            value={form.translation}
            onChange={(value) => setForm({ ...form, translation: value })}
          />
          <div className="inline-field">
            <label className="form-label mb-0">关联词汇</label>
            <select
              className="form-select"
              value={form.wordId}
              onChange={(e) => setForm({ ...form, wordId: e.target.value })}
            >
              <option value="">不选择</option>
              {words.map((w) => (
                <option value={w.id} key={w.id}>
                  {w.word}
                </option>
              ))}
            </select>
          </div>
          <div className="inline-field">
            <label className="form-label mb-0">关联语法</label>
            <select
              className="form-select"
              value={form.grammarId}
              onChange={(e) => setForm({ ...form, grammarId: e.target.value })}
            >
              <option value="">不选择</option>
              {grammars.map((g) => (
                <option value={g.id} key={g.id}>
                  {g.form}
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}
function SentenceDetail({ id, sentences, grammars, words }) {
  const sentence = sentences.find((value) => value.id === id) || sentences[0];
  const linkedWords = words.filter((value) =>
    sentence.wordIds?.includes(value.id),
  );
  const linkedGrammars = grammars.filter((value) =>
    sentence.grammarIds?.includes(value.id),
  );
  const [tab, setTab] = useState("relations");
  return (
    <div className="section-card">
      <h2 className="h4">{sentence.japanese}</h2>
      <p className="lead text-primary">{sentence.translation}</p>
      <nav className="subpage-nav nav nav-underline border-bottom mb-3"><button className={`nav-link ${tab === "relations" ? "active" : ""}`} onClick={() => setTab("relations")}>关联资料</button><button className={`nav-link ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>学习与测试记录</button></nav>
      {tab === "relations" && <div className="row g-3">
        {linkedWords.length > 0 && <RelationBox title="关联词汇">
          {linkedWords.length
            ? linkedWords.map((value) => (
                <a
                  className="d-block"
                  href={href(`words/${value.id}`)}
                  key={value.id}
                >
                  {value.word}（{value.reading}）
                </a>
              ))
            : "—"}
        </RelationBox>}
        {linkedGrammars.length > 0 && <RelationBox title="关联语法">
          {linkedGrammars.length
            ? linkedGrammars.map((value) => (
                <a
                  className="d-block"
                  href={href(`grammars/${value.id}`)}
                  key={value.id}
                >
                  {value.form}：{value.meaning}
                </a>
              ))
            : "—"}
        </RelationBox>}
      </div>}
      {tab === "history" && <div className="row g-3"><RelationBox title="学习记录">已阅读 3 次 · 最近阅读 2026-08-03</RelationBox><RelationBox title="测试统计">关联词汇测试 5 次 · 错误 1 次</RelationBox></div>}
    </div>
  );
}

function InlineInput({ label, value, onChange }) {
  return (
    <div className="inline-field">
      <label className="form-label mb-0">{label}</label>
      <input
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function InlineSearch({ path, keyword, pageSize, placeholder, onAdd }) {
  const [value, setValue] = useState(keyword);
  const go = () => {
    window.history.pushState(
      {},
      "",
      href(path, { keyword: value, pageNum: 1, pageSize }),
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return (
    <div className="toolbar query-toolbar">
      <div className="query-row">
        <input
          className="form-control"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder={placeholder}
        />
        <button className="btn btn-outline-primary" onClick={go}>
          <Icon name="search" className="me-1" />
          查询
        </button>
        {onAdd && (
          <button className="btn btn-primary" onClick={onAdd}>
            <Icon name="plus-lg" className="me-1" />
            新增
          </button>
        )}
      </div>
    </div>
  );
}
function KnowledgeNav({ active }) {
  return (
    <nav
      className="subpage-nav nav nav-underline border-bottom mb-3"
      aria-label="知识分类"
    >
      <a
        className={`nav-link ${active === "grammars" ? "active" : ""}`}
        href={href("grammars", { pageNum: 1, pageSize: 10 })}
      >
        语法
      </a>
      <a
        className={`nav-link ${active === "sentences" ? "active" : ""}`}
        href={href("sentences", { pageNum: 1, pageSize: 10 })}
      >
        句子
      </a>
    </nav>
  );
}

function ManagementNav({ active }) {
  const items = [
    ["imports", "management/imports", "导入审核"],
    ["tags", "management/tags", "标签"],
    ["pos", "management/pos", "词性"],
    ["settings", "management/settings", "设置"],
  ];
  return (
    <nav className="subpage-nav nav nav-underline border-bottom mb-3" aria-label="管理分类">
      {items.map(([key, path, label]) => (
        <a className={`nav-link ${active === key ? "active" : ""}`} href={href(path)} key={key}>
          {label}
        </a>
      ))}
    </nav>
  );
}

function DetailNav({ label, current, path, active = "detail" }) {
  return (
    <>
      <nav className="breadcrumb-nav mb-2" aria-label={`${label}层级`}>
        <a href={href(path, { pageNum: 1, pageSize: 10 })}>{label}</a>
        <Icon name="chevron-right" className="mx-2 text-secondary" />
        <span>{current}</span>
      </nav>
      <nav className="subpage-nav nav nav-underline border-bottom mb-3" aria-label="详情分类">
        <button className={`nav-link ${active === "detail" ? "active" : ""}`}>详情</button>
        <button className="nav-link">关联资料</button>
        <button className="nav-link">学习与测试记录</button>
      </nav>
    </>
  );
}

function ImportsPage({ notify, rows, setRows }) {
  const aiPrompt = `请将我提供的日语学习资料解析为 CSV。\n严格输出以下列：object_type,word,reading,translation,part_of_speech,tags,collection,source_text。\nobject_type 只能是：词汇、搭配、句子、语法。\ntranslation 中不同含义使用日语句号「。」分隔，相近译法使用日语逗号「、」分隔。\npart_of_speech 只能使用系统提供的固定词性枚举；不能判断时留空。\ntags 使用已有标签名称，多个标签用半角竖线分隔；不能判断时留空。\nreading 不确定时留空，禁止编造。\n只输出带表头的 UTF-8 CSV，不要输出 Markdown 代码块或额外说明。`;
  const [selected, setSelected] = useState([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const toggle = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const act = (status) => {
    setRows((rs) =>
      rs.map((r) => (selected.includes(r.id) ? { ...r, status } : r)),
    );
    notify(`已将 ${selected.length} 条标记为${status}`);
    setSelected([]);
  };
  const importCsv = () => {
    if (!fileName) {
      notify("请先选择 CSV 文件", "exclamation-circle-fill");
      return;
    }
    setImporting(true);
    setTimeout(() => {
      setRows((items) => [
        ...items,
        {
          id: Date.now(),
          raw: fileName,
          type: CONTENT_TYPE.VOCABULARY,
          word: "差し支える",
          reading: "さしつかえる",
          translation: "妨碍、影响",
          pos: PART_OF_SPEECH.INTRANSITIVE_VERB,
          duplicate: DUPLICATE_STATUS.UNIQUE,
          status: REVIEW_STATUS.PENDING,
        },
      ]);
      setImporting(false);
      notify("CSV 已导入非正式词汇表，开始审核");
    }, 800);
  };
  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-lg-7">
          <div className="section-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h5 mb-0">给 AI 的解析指令</h2>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  navigator.clipboard?.writeText(aiPrompt);
                  notify("AI 指令已复制");
                }}
              >
                <Icon name="copy" className="me-1" />
                复制
              </button>
            </div>
            <div className="prompt-box">{aiPrompt}</div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="section-card h-100">
            <h2 className="h5">导入 CSV 到审核池</h2>
            <p className="small text-secondary">
              CSV 先写入非正式词汇表，不会直接进入正式库。
            </p>
            <div className="inline-field">
              <label className="form-label mb-0">CSV 文件</label>
              <input
                className="form-control"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
            </div>
            <button
              className="btn btn-primary w-100"
              disabled={importing}
              onClick={importCsv}
            >
              {importing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  导入中
                </>
              ) : (
                <>
                  <Icon name="upload" className="me-1" />
                  导入并开始审核
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="section-card">
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
          <div>
            <strong>非正式词汇表 · 批次 #20260803-01</strong>
            <div className="small text-secondary">
              待审核{" "}
              {rows.filter((r) => r.status === REVIEW_STATUS.PENDING).length} 条
            </div>
          </div>
          <div className="btn-group">
            <button
              className="btn btn-outline-success"
              disabled={!selected.length}
              onClick={() => act(REVIEW_STATUS.APPROVED)}
            >
              批量批准
            </button>
            <button
              className="btn btn-outline-secondary"
              disabled={!selected.length}
              onClick={() => act(REVIEW_STATUS.SKIPPED)}
            >
              无需导入
            </button>
            <button
              className="btn btn-outline-danger"
              disabled={!selected.length}
              onClick={() => act(REVIEW_STATUS.REJECTED)}
            >
              拒绝
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={(e) =>
                      setSelected(e.target.checked ? rows.map((r) => r.id) : [])
                    }
                  />
                </th>
                <th>候选内容</th>
                <th>类型/词性</th>
                <th>重复检测</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={
                    selected.includes(r.id) ? "import-row-selected" : ""
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected.includes(r.id)}
                      onChange={() => toggle(r.id)}
                    />
                  </td>
                  <td>
                    <strong>{r.word}</strong>{" "}
                    <span className="text-secondary">{r.reading}</span>
                    <div>{r.translation}</div>
                    <small className="text-secondary">原文：{r.raw}</small>
                  </td>
                  <td>
                    <span className="badge badge-soft me-1">{r.type}</span>
                    {r.pos}
                  </td>
                  <td>
                    <span
                      className={`badge ${r.duplicate === DUPLICATE_STATUS.UNIQUE ? "text-bg-success" : r.duplicate === DUPLICATE_STATUS.EXISTS ? "text-bg-secondary" : "text-bg-warning"}`}
                    >
                      {r.duplicate}
                    </span>
                  </td>
                  <td>{r.status}</td>
                  <td>
                    <button
                      className="btn btn-light icon-button"
                      aria-label="编辑审核项"
                    >
                      <Icon name="pencil" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          path="management/imports"
          pageNum={1}
          pageSize={10}
          total={rows.length}
        />
      </div>
    </>
  );
}

function SimpleManagement({ type, notify }) {
  const isTag = type === "tags";
  const data = isTag ? VOCABULARY_TAG_OPTIONS : PART_OF_SPEECH_OPTIONS;
  return (
    <div className="section-card">
      <div className="query-row mb-3">
        <input
          className="form-control"
          placeholder={`搜索${isTag ? "标签" : "词性"}`}
        />
        <button className="btn btn-outline-primary">
          <Icon name="search" className="me-1" />
          查询
        </button>
        <button
          className="btn btn-primary"
          onClick={() => notify(`${isTag ? "标签" : "词性"}已创建`)}
        >
          <Icon name="plus-lg" className="me-1" />
          新增
        </button>
      </div>
      {!isTag && (
        <div className="alert alert-info py-2">
          一个词汇可以关联多个固定词性。词性枚举在数据库中只维护一份，词汇通过关联表使用，不在词汇记录中重复保存文字。
        </div>
      )}
      <div className="list-group">
        {data.map((x, i) => (
          <div
            className="list-group-item d-flex justify-content-between align-items-center"
            key={x}
          >
            <div>
              <strong>{x}</strong>
              <div className="small text-secondary">
                {isTag ? `${12 + i * 7} 个词汇使用` : "数据库固定枚举项"}
              </div>
            </div>
            <div>
              <span className="badge text-bg-success me-2">启用</span>
              <button className="btn btn-light icon-button" aria-label="编辑">
                <Icon name="pencil" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <Pagination
        path={isTag ? "management/tags" : "management/pos"}
        pageNum={1}
        pageSize={10}
        total={data.length}
      />
    </div>
  );
}
function Settings({ notify, settings, setSettings, onReset }) {
  return (
    <div className="section-card" style={{ maxWidth: 760 }}>
      <div className="inline-field align-items-start">
        <label className="form-label mb-0 pt-2">默认收藏本</label>
        <div>
          <select
            className="form-select"
            value={settings.defaultFavoriteCollectionId}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultFavoriteCollectionId: Number(e.target.value),
              })
            }
          >
            <option value="3">默认收藏本</option>
            <option value="6">商务重点收藏</option>
          </select>
          <div className="form-text">
            可以有多个收藏本，但只能选择一个默认收藏本。
          </div>
        </div>
      </div>
      <div className="inline-field">
        <label className="form-label mb-0">词汇错题本</label>
        <select
          className="form-select"
          value={settings.defaultWordErrorCollectionId}
          onChange={(e) =>
            setSettings({
              ...settings,
              defaultWordErrorCollectionId: Number(e.target.value),
            })
          }
        >
          <option value="4">默认错题本</option>
        </select>
      </div>
      <div className="inline-field">
        <label className="form-label mb-0">语法错题本</label>
        <select
          className="form-select"
          value={settings.defaultGrammarErrorCollectionId}
          onChange={(e) =>
            setSettings({
              ...settings,
              defaultGrammarErrorCollectionId: Number(e.target.value),
            })
          }
        >
          <option value="5">默认语法错题本</option>
        </select>
      </div>
      <div className="inline-field">
        <label className="form-label mb-0">主题</label>
        <select
          className="form-select"
          value={settings.theme}
          onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
        >
          <option value="light-blue">浅蓝色（默认）</option>
          <option disabled>其他主题（后续配置）</option>
        </select>
      </div>
      <div className="d-flex gap-2">
        <button
          className="btn btn-primary"
          onClick={() => notify("设置已保存到本地数据库")}
        >
          <Icon name="check-lg" className="me-1" />
          保存设置
        </button>
        <button className="btn btn-outline-danger" onClick={onReset}>
          <Icon name="arrow-counterclockwise" className="me-1" />
          重置 Demo 数据
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [database, setDatabase] = useState(() => loadDemoDatabase(demoSeed));
  const [notifications, setNotifications] = useState([]);
  const words = database.words,
    grammarRows = database.grammars,
    sentenceRows = database.sentences,
    collectionRows = database.collections;
  const setTable = (table) => (updater) =>
    setDatabase((current) => ({
      ...current,
      [table]:
        typeof updater === "function" ? updater(current[table]) : updater,
    }));
  const setWords = setTable("words"),
    setGrammars = setTable("grammars"),
    setSentences = setTable("sentences"),
    setCollections = setTable("collections"),
    setImportRows = setTable("importRows"),
    setSettings = setTable("settings");
  useEffect(() => saveDemoDatabase(database), [database]);
  useEffect(() => {
    const change = () => setRoute(getRoute());
    const click = (e) => {
      const anchor = e.target.closest("a[href]");
      if (
        !anchor ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        anchor.target === "_blank"
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      window.history.pushState({}, "", url.pathname + url.search);
      change();
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector(".navbar-collapse.show")?.classList.remove("show");
    };
    window.addEventListener("popstate", change);
    document.addEventListener("click", click);
    if (window.location.pathname === "/")
      window.history.replaceState({}, "", href("home"));
    change();
    return () => {
      window.removeEventListener("popstate", change);
      document.removeEventListener("click", click);
    };
  }, []);
  const notify = (text, icon) => {
    const id = Date.now() + Math.random();
    setNotifications((n) => [...n, { id, text, icon }]);
    setTimeout(
      () => setNotifications((n) => n.filter((x) => x.id !== id)),
      2000,
    );
  };
  const favorite = (id) => {
    const word = words.find((w) => w.id === id);
    if (!word) return;
    const next = (word.favoriteCount || 0) > 0 ? 0 : 1;
    setWords((ws) =>
      ws.map((w) =>
        w.id === id
          ? {
              ...w,
              favoriteCount: next,
              updatedAt: new Date().toLocaleString(),
            }
          : w,
      ),
    );
    setCollections((items) =>
      items.map((c) =>
        c.id === database.settings.defaultFavoriteCollectionId
          ? {
              ...c,
              wordIds: next
                ? [...new Set([...(c.wordIds || []), id])]
                : (c.wordIds || []).filter((x) => x !== id),
            }
          : c,
      ),
    );
    notify(
      next
        ? `已收藏「${word.word}」到默认收藏本`
        : `已取消收藏「${word.word}」`,
      next ? "star-fill" : "star",
    );
  };
  const importantFavorite = (id) => {
    const word = words.find((w) => w.id === id);
    if (!word || !(word.favoriteCount > 0)) return;
    const next = word.favoriteCount + 1;
    setWords((ws) =>
      ws.map((w) =>
        w.id === id
          ? {
              ...w,
              favoriteCount: next,
              updatedAt: new Date().toLocaleString(),
            }
          : w,
      ),
    );
    notify(`「${word.word}」重点收藏已增加到 ${next} 次`, "bookmark-star-fill");
  };
  const learn = (id) => {
    const word = words.find((w) => w.id === id);
    if (!word || word.learned) return;
    setWords((ws) =>
      ws.map((w) => (w.id === id ? { ...w, learned: true } : w)),
    );
    notify(`已学习「${word.word}」`);
  };
  const master = (id) => {
    const w = words.find((x) => x.id === id);
    setTable("mastered")((items) => [
      ...items,
      { id: Date.now(), word: w.word, time: new Date().toLocaleTimeString() },
    ]);
    notify(`已记录掌握「${w.word}」`);
  };
  const resetDatabase = () => {
    setDatabase(resetDemoDatabase(demoSeed));
    notify("Demo 本地数据库已重置");
  };
  const saveQuizAnswer = (record) =>
    setTable("quizSessions")((items) => [...items, record]);
  const saveWrong = (id, isGrammar) => {
    if (!isGrammar)
      setWords((items) =>
        items.map((w) =>
          w.id === id
            ? {
                ...w,
                wrong: w.wrong + 1,
                updatedAt: new Date().toLocaleString(),
              }
            : w,
        ),
      );
    const target = isGrammar
      ? database.settings.defaultGrammarErrorCollectionId
      : database.settings.defaultWordErrorCollectionId;
    setCollections((items) =>
      items.map((c) =>
        c.id === target
          ? {
              ...c,
              [isGrammar ? "grammarIds" : "wordIds"]: [
                ...new Set([
                  ...(c[isGrammar ? "grammarIds" : "wordIds"] || []),
                  id,
                ]),
              ],
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : c,
      ),
    );
  };
  let content;
  const props = {
    words,
    setWords,
    notify,
    route,
    onFavorite: favorite,
    onImportantFavorite: importantFavorite,
    onLearn: learn,
    onMaster: master,
  };
  const selectedCollection = collectionRows.find(
    (c) => c.id === route.collectionId,
  );
  switch (route.page) {
    case "home":
      content = <Home words={words} collections={collectionRows} />;
      break;
    case "collections":
      content = (
        <CollectionsPage
          collections={collectionRows}
          setCollections={setCollections}
          words={words}
          grammars={grammarRows}
          notify={notify}
        />
      );
      break;
    case "learn":
      content = (
        <LearningHub
          collections={collectionRows}
          words={words}
          grammars={grammarRows}
        />
      );
      break;
    case "collectionStudy":
      content = (
        <CollectionStudy
          collection={selectedCollection}
          {...props}
          sentences={sentenceRows}
          grammars={grammarRows}
        />
      );
      break;
    case "collectionTest":
      content = (
        <CollectionTest
          collection={selectedCollection}
          words={words}
          grammars={grammarRows}
          notify={notify}
          onSaveAnswer={saveQuizAnswer}
          onWrong={saveWrong}
        />
      );
      break;
    case "errors":
      content = <ReviewPage kind="errors" {...props} />;
      break;
    case "mastered":
      content = <ReviewPage kind="mastered" {...props} />;
      break;
    case "favorites":
      content = <ReviewPage kind="favorites" {...props} />;
      break;
    case "words":
      content = <WordsPage {...props} />;
      break;
    case "wordDetail":
      content = (
        <WordDetail id={route.entityId} words={words} setWords={setWords} grammars={grammarRows} sentences={sentenceRows} notify={notify} />
      );
      break;
    case "grammars":
      content = (
        <GrammarList route={route} grammars={grammarRows} setGrammars={setGrammars} sentences={sentenceRows} setSentences={setSentences} notify={notify} />
      );
      break;
    case "grammarDetail":
      content = (
        <GrammarDetail
            id={route.entityId}
            grammars={grammarRows}
            setGrammars={setGrammars}
            sentences={sentenceRows}
            words={words}
            notify={notify}
          />
      );
      break;
    case "sentences":
      content = (
        <SentencesPage route={route} sentences={sentenceRows} setSentences={setSentences} grammars={grammarRows} setGrammars={setGrammars} words={words} setWords={setWords} notify={notify} />
      );
      break;
    case "sentenceDetail":
      content = (
        <SentenceDetail
            id={route.entityId}
            sentences={sentenceRows}
            grammars={grammarRows}
            words={words}
          />
      );
      break;
    case "imports":
      content = (
        <ImportsPage notify={notify} rows={database.importRows} setRows={setImportRows} />
      );
      break;
    case "tags":
      content = <SimpleManagement type="tags" notify={notify} />;
      break;
    case "pos":
      content = <SimpleManagement type="pos" notify={notify} />;
      break;
    case "settings":
      content = (
        <Settings
          notify={notify}
          settings={database.settings}
          setSettings={setSettings}
          onReset={resetDatabase}
        />
      );
      break;
    default:
      content = <Home words={words} collections={collectionRows} />;
  }
  const breadcrumbMap = {
    mastered: { parent: "复习", current: "已掌握", path: "review/mastered" },
    errors: { parent: "复习", current: "错题集", path: "review/mastered" },
    favorites: { parent: "复习", current: "收藏本", path: "review/mastered" },
    imports: { parent: "管理", current: "导入审核", path: "management/imports" },
    tags: { parent: "管理", current: "标签", path: "management/imports" },
    pos: { parent: "管理", current: "词性", path: "management/imports" },
    settings: { parent: "管理", current: "设置", path: "management/imports" },
    wordDetail: { parent: "正式词库", current: words.find((w) => w.id === route.entityId)?.word || "词汇详情", path: "words?pageNum=1&pageSize=10" },
    grammarDetail: { parent: "语法", current: grammarRows.find((g) => g.id === route.entityId)?.form || "语法详情", path: "grammars?pageNum=1&pageSize=10" },
    sentenceDetail: { parent: "句子", current: sentenceRows.find((s) => s.id === route.entityId)?.japanese || "句子详情", path: "sentences?pageNum=1&pageSize=10" },
  };
  return (
    <div className="app-shell">
      <Navbar />
      <Notifications items={notifications} />
      <Page page={route.page} collection={selectedCollection} breadcrumb={breadcrumbMap[route.page]}>
        {content}
      </Page>
    </div>
  );
}
