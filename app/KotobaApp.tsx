"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Notifications, { type NotificationMessage } from "./components/Notifications";

type View = "home" | "learn" | "quiz" | "review" | "words" | "articles" | "management";
type Mode = "reading" | "word" | "meaning";
type DisplayField = "word" | "reading" | "meaning";
type ReviewTab = "errors" | "mastered" | "favorites";
type ManagementTab = "settings" | "development";
type FavoriteGroup = {
  id: number;
  name: string;
  note: string;
  isDefault: number | boolean;
  itemCount: number;
};
type Word = {
  id: number;
  word: string;
  reading: string | null;
  meaning: string;
  partOfSpeech: string;
  familiarity: string;
  categories: string[];
  categoryIds: number[];
  status?: "mastered" | "error";
};
type Question = {
  item: Word;
  mode: Mode;
  prompt: string;
  answer: string;
  options: string[];
};
type Article = {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
  categories: string[];
};
type CategoryConfig = {
  id: number;
  name: string;
  scope: "vocabulary" | "article" | "both";
  purpose: "study" | "topic" | "development";
  sortOrder: number;
  enabled: number | boolean;
};

const viewPaths: Record<View, string> = {
  home: "/",
  learn: "/learn",
  quiz: "/quiz",
  review: "/review/errors",
  words: "/words",
  articles: "/articles",
  management: "/management/categories",
};

function viewFromPath(pathname: string): View {
  if (pathname.startsWith("/review")) return "review";
  if (pathname.startsWith("/management")) return "management";
  const entry = Object.entries(viewPaths).find(([, path]) => path === pathname);
  return (entry?.[0] as View | undefined) ?? "home";
}

const emptyForm = {
  id: 0,
  word: "",
  reading: "",
  meaning: "",
  partOfSpeech: "",
  familiarity: "",
  categoryIds: [] as number[],
};
const emptyCategoryForm: CategoryConfig = {
  id: 0,
  name: "",
  scope: "vocabulary",
  purpose: "study",
  sortOrder: 0,
  enabled: true,
};

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function isMemoryFieldVisible(itemId: number, field: DisplayField, toggledFields: Set<string>) {
  const toggled = toggledFields.has(`${itemId}:${field}`);
  return field === "word" ? !toggled : toggled;
}

function headingId(value: string) {
  return `doc-${value.toLowerCase().replace(/[`*_()[\]{}:：，。、“”'"]/g, "").replace(/\s+/g, "-")}`;
}

function documentOutline(content: string) {
  return content.split(/\r?\n/).flatMap((line) => {
    const match = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    return match ? [{ level: match[1].length, title: match[2], id: headingId(match[2]) }] : [];
  });
}

function createQuestions(items: Word[], pool: Word[]) {
  const modes: Mode[] = ["reading", "word", "meaning"];
  return shuffle(
    modes.flatMap((mode) =>
      shuffle(items).filter((item) => mode !== "reading" || Boolean(item.reading)).map((item) => {
        const field = mode === "reading" ? "reading" : mode === "word" ? "word" : "meaning";
        const answer = item[field];
        if (!answer) return null;
        const seen = new Set([answer]);
        const distractors = shuffle(pool.filter((candidate) => candidate.id !== item.id))
          .filter((candidate) => {
            const value = candidate[field];
            if (!value || seen.has(value)) return false;
            seen.add(value);
            return true;
          })
          .slice(0, 3)
          .map((candidate) => candidate[field] as string);
        return {
          item,
          mode,
          prompt: mode === "word" ? item.meaning : item.word,
          answer,
          options: shuffle([answer, ...distractors]),
        };
      }).filter((question): question is Question => question !== null),
    ),
  );
}

export default function KotobaApp() {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<View>(() => viewFromPath(pathname));
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [mastered, setMastered] = useState<Word[]>([]);
  const [errors, setErrors] = useState<Word[]>([]);
  const [favorites, setFavorites] = useState<Word[]>([]);
  const [reviewTab, setReviewTab] = useState<ReviewTab>("errors");
  const [reviewCategoryId, setReviewCategoryId] = useState(0);
  const [reviewErrors, setReviewErrors] = useState<Word[]>([]);
  const [reviewMastered, setReviewMastered] = useState<Word[]>([]);
  const [reviewFavorites, setReviewFavorites] = useState<Word[]>([]);
  const [favoriteGroups, setFavoriteGroups] = useState<FavoriteGroup[]>([]);
  const [selectedFavoriteGroupId, setSelectedFavoriteGroupId] = useState(0);
  const [favoriteGroupDialogOpen, setFavoriteGroupDialogOpen] = useState(false);
  const [favoriteGroupEditing, setFavoriteGroupEditing] = useState({ id: 0, name: "", note: "", isDefault: false });
  const [loading, setLoading] = useState(true);
  const [groupSize, setGroupSize] = useState(30);
  const [currentGroup, setCurrentGroup] = useState<Word[]>([]);
  const [visibility, setVisibility] = useState({ word: true, reading: true, meaning: true });
  const [memoryMode, setMemoryMode] = useState(false);
  const [memoryToggles, setMemoryToggles] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizItems, setQuizItems] = useState<Word[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<Set<number>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);
  const [questionLeaving, setQuestionLeaving] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageJump, setPageJump] = useState("1");
  const [total, setTotal] = useState(0);
  const [listItems, setListItems] = useState<Word[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listVisibility, setListVisibility] = useState({ word: true, reading: true, meaning: true });
  const [listMemoryMode, setListMemoryMode] = useState(false);
  const [listMemoryToggles, setListMemoryToggles] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const notificationSequence = useRef(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [developmentArticles, setDevelopmentArticles] = useState<Article[]>([]);
  const [developmentLoading, setDevelopmentLoading] = useState(false);
  const [managementTab, setManagementTab] = useState<ManagementTab>("settings");
  const [categoryOptions, setCategoryOptions] = useState<CategoryConfig[]>([]);
  const [categoryEditing, setCategoryEditing] = useState<CategoryConfig>(emptyCategoryForm);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const studyCategories = categoryOptions.filter(
    (item) => Boolean(item.enabled) && item.purpose === "study" && (item.scope === "vocabulary" || item.scope === "both"),
  );
  const vocabularyCategories = categoryOptions.filter(
    (item) => Boolean(item.enabled) && (item.scope === "vocabulary" || item.scope === "both"),
  );
  const selectedCategory = studyCategories.find((item) => item.id === categoryId) ?? null;
  const articleRootCategory = categoryOptions.find(
    (item) => Boolean(item.enabled) && item.purpose === "study" && (item.scope === "article" || item.scope === "both"),
  ) ?? null;
  const developmentCategory = categoryOptions.find(
    (item) => Boolean(item.enabled) && item.purpose === "development" && (item.scope === "article" || item.scope === "both"),
  ) ?? null;
  const defaultFavoriteGroup = favoriteGroups.find((group) => Boolean(group.isDefault)) ?? null;

  const dismissNotification = useCallback((id: number) => {
    setNotifications((items) => items.filter((item) => item.id !== id));
  }, []);

  function setMessage(text: string) {
    if (!text) return;
    notificationSequence.current += 1;
    setNotifications((items) => [...items, { id: notificationSequence.current, text }]);
  }

  const loadCategories = useCallback(async () => {
    const response = await fetch("/api/categories");
    const data = await response.json();
    setCategoryOptions(data.items ?? []);
  }, []);

  const loadCategory = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    const [wordResponse, masteredResponse, errorResponse] = await Promise.all([
      fetch(`/api/vocabulary?categoryId=${categoryId}&all=true`),
      fetch(`/api/progress?categoryId=${categoryId}&status=mastered`),
      fetch(`/api/progress?categoryId=${categoryId}&status=error`),
    ]);
    const [wordData, masteredData, errorData] = await Promise.all([
      wordResponse.json(), masteredResponse.json(), errorResponse.json(),
    ]);
    setWords(wordData.items ?? []);
    setMastered(masteredData.items ?? []);
    setErrors(errorData.items ?? []);
    setLoading(false);
  }, [categoryId]);

  const loadFavoriteGroups = useCallback(async () => {
    const response = await fetch("/api/favorite-groups");
    const data = await response.json();
    const items = data.items ?? [];
    setFavoriteGroups(items);
    setSelectedFavoriteGroupId((current) => (
      items.some((item: FavoriteGroup) => Number(item.id) === current)
        ? current
        : Number(items.find((item: FavoriteGroup) => Boolean(item.isDefault))?.id || items[0]?.id || 0)
    ));
  }, []);

  const loadList = useCallback(async () => {
    if (!categoryId) return;
    setListLoading(true);
    try {
      const response = await fetch(
        `/api/vocabulary?categoryId=${categoryId}&page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search.trim())}`,
      );
      const data = await response.json();
      setListItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setListLoading(false);
    }
  }, [categoryId, page, pageSize, search]);

  useEffect(() => { void loadCategory(); }, [loadCategory]);
  useEffect(() => { void loadCategories(); }, [loadCategories]);
  useEffect(() => { void loadFavoriteGroups(); }, [loadFavoriteGroups]);
  useEffect(() => {
    if (!defaultFavoriteGroup) return;
    fetch(`/api/favorites?categoryId=0&groupId=${defaultFavoriteGroup.id}`)
      .then((response) => response.json())
      .then((data) => setFavorites(data.items ?? []));
  }, [defaultFavoriteGroup?.id]);
  useEffect(() => {
    const nextView = viewFromPath(pathname);
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "review" && ["errors", "mastered", "favorites"].includes(segments[1])) {
      setReviewTab(segments[1] as ReviewTab);
    }
    if (segments[0] === "management" && ["categories", "documents"].includes(segments[1])) {
      setManagementTab(segments[1] === "categories" ? "settings" : "development");
    }
    if (nextView === "quiz" && questions.length === 0) {
      setView("learn");
      router.replace(viewPaths.learn);
      return;
    }
    setView(nextView);
  }, [pathname, questions.length, router]);
  useEffect(() => {
    if (view !== "review") return;
    Promise.all([
      fetch(`/api/progress?categoryId=${reviewCategoryId}&status=error`).then((response) => response.json()),
      fetch(`/api/progress?categoryId=${reviewCategoryId}&status=mastered`).then((response) => response.json()),
      selectedFavoriteGroupId
        ? fetch(`/api/favorites?categoryId=${reviewCategoryId}&groupId=${selectedFavoriteGroupId}`).then((response) => response.json())
        : Promise.resolve({ items: [] }),
    ]).then(([errorData, masteredData, favoriteData]) => {
      setReviewErrors(errorData.items ?? []);
      setReviewMastered(masteredData.items ?? []);
      setReviewFavorites(favoriteData.items ?? []);
    });
  }, [view, reviewCategoryId, selectedFavoriteGroupId, favorites]);
  useEffect(() => {
    if (!studyCategories.length || studyCategories.some((item) => item.id === categoryId)) return;
    setCategoryId(studyCategories[0].id);
  }, [studyCategories, categoryId]);
  useEffect(() => { if (view === "words") void loadList(); }, [view, loadList]);
  useEffect(() => {
    if (view !== "articles" || articles.length || !articleRootCategory) return;
    setArticlesLoading(true);
    fetch(`/api/articles?categoryId=${articleRootCategory.id}`)
      .then((response) => response.json())
      .then((data) => {
        const items = data.items ?? [];
        setArticles(items);
        setSelectedArticleId(items[0]?.id ?? null);
      })
      .finally(() => setArticlesLoading(false));
  }, [view, articles.length, articleRootCategory]);
  useEffect(() => {
    if (view !== "management" || managementTab !== "development" || developmentArticles.length || !developmentCategory) return;
    setDevelopmentLoading(true);
    fetch(`/api/articles?categoryId=${developmentCategory.id}`)
      .then((response) => response.json())
      .then((data) => setDevelopmentArticles(data.items ?? []))
      .finally(() => setDevelopmentLoading(false));
  }, [view, managementTab, developmentArticles.length, developmentCategory]);
  useEffect(() => {
    const studiedIds = new Set([...mastered, ...errors].map((item) => item.id));
    const pool = words.filter((item) => !studiedIds.has(item.id));
    setCurrentGroup(shuffle(pool).slice(0, groupSize));
  }, [words, mastered, errors, groupSize]);

  const studiedIds = useMemo(
    () => new Set([...mastered, ...errors].map((item) => item.id)),
    [mastered, errors],
  );
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites]);
  const reviewFavoriteIds = useMemo(() => new Set(reviewFavorites.map((item) => item.id)), [reviewFavorites]);
  const developmentOutline = useMemo(
    () => documentOutline(developmentArticles[0]?.content ?? ""),
    [developmentArticles],
  );
  const pendingCount = words.filter((item) => !studiedIds.has(item.id)).length;
  const currentQuestion = questions[questionIndex];
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const selectedArticle = articles.find((article) => article.id === selectedArticleId);

  function changeView(next: View) {
    setView(next);
    router.push(viewPaths[next]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeListPage(nextPage: number) {
    const target = Math.min(pageCount, Math.max(1, nextPage));
    setPage(target);
    setPageJump(String(target));
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function selectCategory(nextId: number) {
    setCategoryId(nextId);
    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  function refreshGroup() {
    setCurrentGroup(
      shuffle(words.filter((item) => !studiedIds.has(item.id))).slice(0, groupSize),
    );
  }

  function toggleMemoryField(
    itemId: number,
    field: DisplayField,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
  ) {
    setter((current) => {
      const next = new Set(current);
      const key = `${itemId}:${field}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function CategoryPicker() {
    return (
      <div className="categoryPicker" aria-label="选择词汇分类">
        <span>词汇分类</span>
        {studyCategories.map((item) => (
          <button
            key={item.id}
            className={categoryId === item.id ? "active" : ""}
            onClick={() => selectCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
    );
  }

  function startQuiz(items = currentGroup) {
    if (!items.length || words.length < 4) {
      setMessage("当前分类没有足够的单词用于测试。");
      return;
    }
    setQuizItems(shuffle(items));
    setQuestions(createQuestions(items, words));
    setQuestionIndex(0);
    setSelected(null);
    setWrongIds(new Set());
    setQuizComplete(false);
    setQuestionLeaving(false);
    setView("quiz");
    router.push(viewPaths.quiz);
  }

  function answer(option: string) {
    if (selected || !currentQuestion) return;
    setSelected(option);
    if (option !== currentQuestion.answer) {
      setWrongIds((previous) => new Set(previous).add(currentQuestion.item.id));
    }
  }

  async function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionLeaving(true);
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      setQuestionIndex((index) => index + 1);
      setSelected(null);
      setQuestionLeaving(false);
      return;
    }
    const wrong = new Set(wrongIds);
    if (selected !== currentQuestion.answer) wrong.add(currentQuestion.item.id);
    setWrongIds(wrong);
    const results = quizItems.map((item) => ({
      vocabularyId: item.id,
      status: wrong.has(item.id) ? "error" : "mastered",
      correct: wrong.has(item.id) ? 0 : 3,
      wrong: wrong.has(item.id) ? 1 : 0,
    }));
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results }),
    });
    await loadCategory();
    setQuizComplete(true);
  }

  async function saveWord(event: React.FormEvent) {
    event.preventDefault();
    const payload = editing;
    const response = await fetch(
      editing.id ? `/api/vocabulary/${editing.id}` : "/api/vocabulary",
      {
        method: editing.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "保存失败");
      return;
    }
    setDialogOpen(false);
    setEditing(emptyForm);
    setMessage("已保存");
    await Promise.all([loadList(), loadCategory()]);
  }

  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(
      categoryEditing.id ? `/api/categories/${categoryEditing.id}` : "/api/categories",
      {
        method: categoryEditing.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryEditing),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "类别保存失败");
      return;
    }
    setCategoryDialogOpen(false);
    setCategoryEditing(emptyCategoryForm);
    setMessage("类别已保存");
    await loadCategories();
  }

  async function deleteWord(item: Word) {
    if (!window.confirm(`确定删除「${item.word}」吗？`)) return;
    await fetch(`/api/vocabulary/${item.id}`, { method: "DELETE" });
    setMessage("已删除");
    await Promise.all([loadList(), loadCategory()]);
  }

  async function toggleFavorite(item: Word, groupId = 0) {
    const isReviewGroup = groupId > 0;
    const favorite = !(isReviewGroup ? reviewFavoriteIds : favoriteIds).has(item.id);
    const groupName = isReviewGroup
      ? favoriteGroups.find((group) => group.id === groupId)?.name ?? "当前收藏组"
      : defaultFavoriteGroup?.name ?? "默认收藏组";
    if (isReviewGroup) {
      setReviewFavorites((current) => favorite ? [item, ...current.filter((word) => word.id !== item.id)] : current.filter((word) => word.id !== item.id));
    } else {
      setFavorites((current) => favorite ? [item, ...current.filter((word) => word.id !== item.id)] : current.filter((word) => word.id !== item.id));
    }
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabularyId: item.id, favorite, groupId }),
    });
    if (!response.ok) {
      setMessage("收藏操作失败，请稍后重试");
      await loadCategory();
      return;
    }
    await loadFavoriteGroups();
    setMessage(favorite ? `已收藏到「${groupName}」` : `已从「${groupName}」取消收藏`);
  }

  async function saveFavoriteGroup(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/favorite-groups", {
      method: favoriteGroupEditing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(favoriteGroupEditing),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "收藏组保存失败");
      return;
    }
    setFavoriteGroupDialogOpen(false);
    setFavoriteGroupEditing({ id: 0, name: "", note: "", isDefault: false });
    await loadFavoriteGroups();
    setMessage("收藏组已保存");
  }

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => changeView("home")}>
          <span className="brandMark">こ</span><span>ことば帳</span>
        </button>
        <nav aria-label="主导航">
          {([
            ["home", "首页"], ["learn", "学习"], ["review", "复习"],
            ["words", "词库"], ["articles", "文章"], ["management", "管理"],
          ] as [View, string][]).map(([target, label]) => (
            <button key={target} className={view === target ? "active" : ""} onClick={() => changeView(target)}>{label}</button>
          ))}
        </nav>
      </header>

      <div key={`${view}-${categoryId ?? "loading"}`} className="pageFade">
        {view === "home" && (
          <section className="hero">
            <CategoryPicker />
            <div className="eyebrow">{selectedCategory?.name ?? "加载中"} · 在线词库 · {words.length} 词</div>
            <h1>日本語言葉勉強</h1>
            <p>词汇与学习记录已连接在线数据库。每组随机检测假名、日语与中文释义，随时继续上次的进度。</p>
            <button className="primary" onClick={() => changeView("learn")}>开始今天的学习 <span>→</span></button>
            <div className="stats">
              <div><strong>{loading ? "—" : pendingCount}</strong><span>待背单词</span></div>
              <div><strong>{mastered.length}</strong><span>已经掌握</span></div>
              <div><strong>{errors.length}</strong><span>需要复习</span></div>
            </div>
            <div className="todayCard"><span className="kana">継続</span><div><b>坚持，比速度更重要。</b><small>当前分类：{selectedCategory?.name ?? "—"}</small></div></div>
          </section>
        )}

        {view === "learn" && (
          <section className="content">
            <div className="sectionHead">
              <div className="compactLearnHead"><span className="eyebrow">RANDOM LEARN · {selectedCategory?.name ?? "—"}</span><h2>学习单词</h2></div>
              <div className="pageFilters">
                <label>词汇分类
                  <select value={categoryId ?? ""} onChange={(event) => selectCategory(Number(event.target.value))}>
                    {studyCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label>每组
                  <select value={groupSize} onChange={(event) => setGroupSize(Number(event.target.value))}>
                    {[10, 20, 30, 50].map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                  词
                </label>
              </div>
            </div>
            <div className="visibilityBar">
              <span>卡片显示</span>
              {([["word", "日语"], ["reading", "假名"], ["meaning", "翻译"]] as const).map(([field, label]) => (
                <label key={field}><input type="checkbox" disabled={memoryMode} checked={visibility[field]} onChange={() => setVisibility((value) => ({ ...value, [field]: !value[field] }))} />{label}</label>
              ))}
              <label className="memoryModeToggle">
                <input
                  type="checkbox"
                  checked={memoryMode}
                  onChange={(event) => {
                    setMemoryMode(event.target.checked);
                    setMemoryToggles(new Set());
                  }}
                />
                默记模式
              </label>
              <button className="textButton" onClick={refreshGroup}>换一组 ↻</button>
            </div>
            <div className="wordGrid compactWordGrid">
              {currentGroup.map((item, index) => {
                const fieldVisible = (field: DisplayField) => (
                  memoryMode ? isMemoryFieldVisible(item.id, field, memoryToggles) : visibility[field]
                );
                return (
                <article className={`wordCard ${memoryMode ? "memoryCard" : ""}`} key={item.id}>
                  <span className="number">{String(index + 1).padStart(2, "0")}</span>
                  <button
                    className={`favoriteButton ${favoriteIds.has(item.id) ? "active" : ""}`}
                    onClick={() => void toggleFavorite(item)}
                    aria-label={favoriteIds.has(item.id) ? `取消收藏 ${item.word}` : `收藏 ${item.word}`}
                    title={favoriteIds.has(item.id) ? "取消收藏" : "收藏"}
                  >
                    {favoriteIds.has(item.id) ? "★" : "☆"}
                  </button>
                  <span
                    className={`memoryField wordMemoryField ${!fieldVisible("word") ? "memoryHidden" : ""}`}
                    role={memoryMode ? "button" : undefined}
                    tabIndex={memoryMode ? 0 : undefined}
                    onClick={() => memoryMode && toggleMemoryField(item.id, "word", setMemoryToggles)}
                  >
                    {fieldVisible("word") ? item.word : memoryMode ? "点击显示日语" : ""}
                  </span>
                  {item.reading && <span
                    className={`memoryField reading readingMemoryField ${!fieldVisible("reading") ? "memoryHidden" : ""}`}
                    role={memoryMode ? "button" : undefined}
                    tabIndex={memoryMode ? 0 : undefined}
                    onClick={() => memoryMode && toggleMemoryField(item.id, "reading", setMemoryToggles)}
                  >
                    {fieldVisible("reading") ? item.reading : memoryMode ? "点击显示假名" : ""}
                  </span>}
                  <span
                    className={`memoryField meaningMemoryField ${!fieldVisible("meaning") ? "memoryHidden" : ""}`}
                    role={memoryMode ? "button" : undefined}
                    tabIndex={memoryMode ? 0 : undefined}
                    onClick={() => memoryMode && toggleMemoryField(item.id, "meaning", setMemoryToggles)}
                  >
                    {fieldVisible("meaning") ? item.meaning : memoryMode ? "点击显示翻译" : ""}
                  </span>
                </article>
              )})}
            </div>
            {!currentGroup.length && <div className="empty">当前分类全部掌握，去背诵本回顾一下吧。</div>}
            <div className="actions">
              <button className="ghost" onClick={refreshGroup}>重新随机</button>
              <button className="primary" disabled={!currentGroup.length} onClick={() => startQuiz()}>测试这一组 <span>→</span></button>
            </div>
          </section>
        )}

        {view === "quiz" && currentQuestion && (
          <section className="quizWrap">
            {!quizComplete ? (
              <>
                <div className="quizTop"><button className="textButton" onClick={() => changeView("learn")}>← 退出测试</button><span>{questionIndex + 1} / {questions.length}</span></div>
                <div className="progressBar"><i style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
                <div className={`quizCard ${questionLeaving ? "leaving" : ""}`} key={questionIndex}>
                  <span className="modeBadge">{currentQuestion.mode === "reading" ? "选择假名" : currentQuestion.mode === "word" ? "选择日语" : "选择翻译"}</span>
                  <div className={`question ${currentQuestion.mode === "word" ? "meaningPrompt" : ""}`}>{currentQuestion.prompt}</div>
                  <div className="options">
                    {currentQuestion.options.map((option, index) => {
                      const state = selected ? option === currentQuestion.answer ? "correct" : option === selected ? "wrong" : "" : "";
                      return <button key={`${option}-${index}`} className={state} onClick={() => answer(option)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>;
                    })}
                  </div>
                  {selected && <button className="primary next" onClick={() => void nextQuestion()}>{questionIndex === questions.length - 1 ? "查看结果" : "下一题"} <span>→</span></button>}
                </div>
              </>
            ) : (
              <div className="resultCard">
                <span className="resultMark">{wrongIds.size ? "復" : "合"}</span>
                <h2>{wrongIds.size ? "这一组完成了" : "全部答对！"}</h2>
                <p>掌握 {quizItems.length - wrongIds.size} 词，需要复习 {wrongIds.size} 词，结果已保存到在线数据库。</p>
                <div className="actions">
                  {wrongIds.size > 0 && <button className="ghost" onClick={() => startQuiz(quizItems.filter((item) => wrongIds.has(item.id)))}>重测错词</button>}
                  <button className="primary" onClick={() => changeView("learn")}>学习下一组 <span>→</span></button>
                </div>
              </div>
            )}
          </section>
        )}

        {view === "review" && (
          <section className="content reviewPage">
            <div className="sectionHead">
              <div><span className="eyebrow">REVIEW · {selectedCategory?.name ?? "—"}</span><h2>复习</h2><p>集中回顾错题、已掌握词汇与收藏内容。</p></div>
            </div>
            <div className="reviewLayout">
              <aside className="reviewNav" aria-label="复习分类">
                {([
                  ["errors", "错题本", reviewErrors.length],
                  ["mastered", "背诵本", reviewMastered.length],
                  ["favorites", "收藏", reviewFavorites.length],
                ] as [ReviewTab, string, number][]).map(([target, label, count]) => (
                  <button
                    key={target}
                    className={reviewTab === target ? "active" : ""}
                    onClick={() => router.push(`/review/${target}`)}
                  >
                    <span>{label}</span><b>{count}</b>
                  </button>
                ))}
              </aside>
              <div className="reviewPanel">
                <div className="panelHead">
                  <div>
                    <h3>{reviewTab === "errors" ? "错题本" : reviewTab === "mastered" ? "背诵本" : "收藏"}</h3>
                    <p>
                      {reviewTab === "errors"
                        ? "答错的词会保存在这里，可随时重新测试。"
                        : reviewTab === "mastered"
                          ? "已经通过三种题型检测的词汇。"
                          : "你主动收藏、准备重点回顾的词汇。"}
                    </p>
                  </div>
                  {reviewTab === "errors" && reviewErrors.length > 0 && (
                    <button className="primary" onClick={() => startQuiz(reviewErrors)}>复习全部 <span>→</span></button>
                  )}
                </div>
                <div className="reviewFilters">
                  <label>词汇分类
                    <select value={reviewCategoryId} onChange={(event) => setReviewCategoryId(Number(event.target.value))}>
                      <option value={0}>全部</option>
                      {studyCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </label>
                  {reviewTab === "favorites" && (
                    <>
                      <label>收藏组
                        <select value={selectedFavoriteGroupId} onChange={(event) => setSelectedFavoriteGroupId(Number(event.target.value))}>
                          {favoriteGroups.map((group) => <option key={group.id} value={group.id}>{group.name}{group.isDefault ? "（默认）" : ""}</option>)}
                        </select>
                      </label>
                      <button className="ghost compact" onClick={() => {
                        setFavoriteGroupEditing({ id: 0, name: "", note: "", isDefault: false });
                        setFavoriteGroupDialogOpen(true);
                      }}>＋ 新建收藏组</button>
                      {favoriteGroups.find((group) => group.id === selectedFavoriteGroupId) && (
                        <button className="textButton" onClick={() => {
                          const group = favoriteGroups.find((item) => item.id === selectedFavoriteGroupId)!;
                          setFavoriteGroupEditing({ id: group.id, name: group.name, note: group.note, isDefault: Boolean(group.isDefault) });
                          setFavoriteGroupDialogOpen(true);
                        }}>编辑当前组</button>
                      )}
                    </>
                  )}
                </div>
                {reviewTab === "favorites" && favoriteGroups.find((group) => group.id === selectedFavoriteGroupId)?.note && (
                  <p className="groupNote">{favoriteGroups.find((group) => group.id === selectedFavoriteGroupId)?.note}</p>
                )}
                <div className="list reviewList">
                  {(reviewTab === "errors" ? reviewErrors : reviewTab === "mastered" ? reviewMastered : reviewFavorites).map((item) => (
                    <article key={item.id}>
                      <div><h3>{item.word}</h3><span>{item.reading}</span></div>
                      <p>{item.meaning}</p>
                      <button
                        className={`favoriteButton inlineFavorite ${(reviewTab === "favorites" ? reviewFavoriteIds : favoriteIds).has(item.id) ? "active" : ""}`}
                        onClick={() => void toggleFavorite(item, reviewTab === "favorites" ? selectedFavoriteGroupId : 0)}
                        aria-label={(reviewTab === "favorites" ? reviewFavoriteIds : favoriteIds).has(item.id) ? `取消收藏 ${item.word}` : `收藏 ${item.word}`}
                      >
                        {(reviewTab === "favorites" ? reviewFavoriteIds : favoriteIds).has(item.id) ? "★" : "☆"}
                      </button>
                    </article>
                  ))}
                </div>
                {(reviewTab === "errors" ? reviewErrors : reviewTab === "mastered" ? reviewMastered : reviewFavorites).length === 0 && (
                  <div className="empty">
                    {reviewTab === "errors" ? "还没有错题，继续保持。" : reviewTab === "mastered" ? "通过三种题型的词会出现在这里。" : "还没有收藏词汇。"}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {view === "words" && (
          <section className="content wordsPage">
            <div className="sectionHead">
              <div><span className="eyebrow">DATABASE · {selectedCategory?.name ?? "—"}</span><h2>词库管理</h2><p>在线查看、搜索、新增、编辑和删除词汇。</p></div>
              <button className="primary" disabled={!categoryId} onClick={() => { setEditing({ ...emptyForm, categoryIds: categoryId ? [categoryId] : [] }); setDialogOpen(true); }}>＋ 新增单词</button>
            </div>
            <form className="searchBar" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}>
              <select value={categoryId ?? ""} onChange={(event) => selectCategory(Number(event.target.value))} aria-label="查询分类">
                {vocabularyCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="模糊查询日语、假名或翻译" aria-label="搜索词汇" />
              <button className="primary">查询</button>
            </form>
            <div className="visibilityBar listVisibilityBar">
              <span>卡片显示</span>
              {([["word", "日语"], ["reading", "假名"], ["meaning", "翻译"]] as const).map(([field, label]) => (
                <label key={field}>
                  <input
                    type="checkbox"
                    disabled={listMemoryMode}
                    checked={listVisibility[field]}
                    onChange={() => setListVisibility((value) => ({ ...value, [field]: !value[field] }))}
                  />
                  {label}
                </label>
              ))}
              <label className="memoryModeToggle">
                <input
                  type="checkbox"
                  checked={listMemoryMode}
                  onChange={(event) => {
                    setListMemoryMode(event.target.checked);
                    setListMemoryToggles(new Set());
                  }}
                />
                默记模式
              </label>
            </div>
            <div className={`tableWrap ${listLoading ? "isLoading" : ""}`} aria-busy={listLoading}>
              {listLoading && <div className="loadingOverlay"><span className="spinner" /><b>加载中</b></div>}
              <table className="vocabularyTable">
                <colgroup><col className="wordColumn" /><col className="readingColumn" /><col className="meaningColumn" /><col className="tagColumn" /><col className="actionColumn" /></colgroup>
                <thead><tr><th>日语</th><th>假名</th><th>翻译</th><th>标签</th><th>操作</th></tr></thead>
                <tbody>
                  {listItems.map((item) => {
                    const fieldVisible = (field: DisplayField) => (
                      listMemoryMode ? isMemoryFieldVisible(item.id, field, listMemoryToggles) : listVisibility[field]
                    );
                    return (
                    <tr key={item.id}>
                      <td className={`wordCell ${!fieldVisible("word") ? "tableConcealed" : ""}`}>
                        <div className="wordCellMain">
                          <span
                            className={`tableMemoryField ${!fieldVisible("word") ? "memoryHidden" : ""}`}
                            role={listMemoryMode ? "button" : undefined}
                            tabIndex={listMemoryMode ? 0 : undefined}
                            onClick={() => listMemoryMode && toggleMemoryField(item.id, "word", setListMemoryToggles)}
                          >
                            <b>{fieldVisible("word") ? item.word : listMemoryMode ? "点击显示日语" : ""}</b>
                          </span>
                          <button
                            className={`favoriteButton tableFavorite ${favoriteIds.has(item.id) ? "active" : ""}`}
                            onClick={() => void toggleFavorite(item)}
                            aria-label={favoriteIds.has(item.id) ? `取消收藏 ${item.word}` : `收藏 ${item.word}`}
                          >
                            {favoriteIds.has(item.id) ? "★" : "☆"}
                          </button>
                        </div>
                      </td>
                      <td className={`readingCell ${!fieldVisible("reading") ? "tableConcealed" : ""}`}>
                        {item.reading && <span
                          className={`tableMemoryField ${!fieldVisible("reading") ? "memoryHidden" : ""}`}
                          role={listMemoryMode ? "button" : undefined}
                          tabIndex={listMemoryMode ? 0 : undefined}
                          onClick={() => listMemoryMode && toggleMemoryField(item.id, "reading", setListMemoryToggles)}
                        >
                          {fieldVisible("reading") ? item.reading : listMemoryMode ? "点击显示假名" : ""}
                        </span>}
                      </td>
                      <td className={`meaningCell ${!fieldVisible("meaning") ? "tableConcealed" : ""}`}>
                        <span
                          className={`tableMemoryField ${!fieldVisible("meaning") ? "memoryHidden" : ""}`}
                          role={listMemoryMode ? "button" : undefined}
                          tabIndex={listMemoryMode ? 0 : undefined}
                          onClick={() => listMemoryMode && toggleMemoryField(item.id, "meaning", setListMemoryToggles)}
                        >
                          {fieldVisible("meaning") ? item.meaning : listMemoryMode ? "点击显示翻译" : ""}
                        </span>
                      </td>
                      <td className="tagCell"><div className="miniTags">{item.categories.map((tag) => <span key={tag}>{tag}</span>)}</div></td>
                      <td className="rowActions actionCell">
                        <button onClick={() => { setEditing({ ...item }); setDialogOpen(true); }}>编辑</button>
                        <button className="danger" onClick={() => void deleteWord(item)}>删除</button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            {!listItems.length && <div className="empty">没有找到匹配词汇。</div>}
            <div className="pagination">
              <button className="ghost" disabled={page <= 1} onClick={() => changeListPage(page - 1)}>上一页</button>
              <span>第 {page} / {pageCount} 页 · 共 {total} 条</span>
              <label className="pageSizePicker">
                每页
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    changeListPage(1);
                  }}
                  aria-label="每页显示数量"
                >
                  {[20, 30, 40, 50].map((size) => <option key={size} value={size}>{size} 条</option>)}
                </select>
              </label>
              <form
                className="pageJump"
                onSubmit={(event) => {
                  event.preventDefault();
                  changeListPage(Number(pageJump) || 1);
                }}
              >
                <label htmlFor="page-jump-input">跳至</label>
                <input id="page-jump-input" type="number" min="1" max={pageCount} value={pageJump} onChange={(event) => setPageJump(event.target.value)} />
                <button className="ghost" type="submit">跳转</button>
              </form>
              <button className="ghost" disabled={page >= pageCount} onClick={() => changeListPage(page + 1)}>下一页</button>
            </div>
          </section>
        )}

        {view === "articles" && (
          <section className="content articlePage">
            <div className="sectionHead">
              <div>
                <span className="eyebrow">KNOWLEDGE · {articleRootCategory?.name ?? "—"}</span>
                <h2>文章与知识总结</h2>
                <p>按模块整理的固定知识、商务表达与业务流程。</p>
              </div>
            </div>
            {articlesLoading ? (
              <div className="articleLoading"><span className="spinner" /><b>文章加载中</b></div>
            ) : (
              <div className="articleLayout">
                <aside className="articleNav">
                  <span>文章分类</span>
                  <b>{articleRootCategory?.name ?? "—"}</b>
                  {articles.map((article) => (
                    <button
                      key={article.id}
                      className={article.id === selectedArticleId ? "active" : ""}
                      onClick={() => setSelectedArticleId(article.id)}
                    >
                      {article.title}
                    </button>
                  ))}
                </aside>
                {selectedArticle && (
                  <article className="articleReader" key={selectedArticle.id}>
                    <div className="articleTags">
                      {selectedArticle.categories.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <h1>{selectedArticle.title}</h1>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedArticle.content}</ReactMarkdown>
                  </article>
                )}
              </div>
            )}
          </section>
        )}

        {view === "management" && (
          <section className="content managementPage">
            <div className="sectionHead">
              <div><span className="eyebrow">MANAGEMENT</span><h2>管理</h2><p>维护系统配置并查看项目开发需求。</p></div>
            </div>
            <div className="settingsLayout">
              <aside className="settingsNav" aria-label="管理页面">
                <button className={managementTab === "settings" ? "active" : ""} onClick={() => router.push("/management/categories")}>类别</button>
                <button className={managementTab === "development" ? "active" : ""} onClick={() => router.push("/management/documents")}>项目文档</button>
              </aside>
              <div className="settingsPanel">
                {managementTab === "settings" ? (
                  <>
                    <div className="panelHead">
                      <div><h3>类别</h3><p>类别可用于词汇、文章或两者；学习类标签会出现在背词分类中。</p></div>
                      <button className="primary" onClick={() => { setCategoryEditing(emptyCategoryForm); setCategoryDialogOpen(true); }}>＋ 新增类别</button>
                    </div>
                    <div className="tableWrap">
                      <table>
                        <thead><tr><th>名称</th><th>适用对象</th><th>用途</th><th>状态</th><th>排序</th><th>操作</th></tr></thead>
                        <tbody>
                          {categoryOptions.map((item) => (
                            <tr key={item.id}>
                              <td><b>{item.name}</b></td>
                              <td>{item.scope === "both" ? "词汇与文章" : item.scope === "vocabulary" ? "词汇" : "文章"}</td>
                              <td>{item.purpose === "study" ? "学习分类" : item.purpose === "development" ? "开发文档" : "内容主题"}</td>
                              <td>{item.enabled ? "启用" : "停用"}</td>
                              <td>{item.sortOrder}</td>
                              <td className="rowActions"><button onClick={() => { setCategoryEditing(item); setCategoryDialogOpen(true); }}>编辑</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="configNote">类别用于历史数据关联，因此不提供删除操作；不再使用时可将其停用。</p>
                  </>
                ) : developmentLoading ? (
                  <div className="articleLoading"><span className="spinner" /><b>开发文档加载中</b></div>
                ) : developmentArticles[0] ? (
                  <div className="developmentLayout">
                    <nav className="documentToc" aria-label="项目文档目录">
                      <b>目录</b>
                      {developmentOutline.map((item) => (
                        <a key={item.id} className={`tocLevel${item.level}`} href={`#${item.id}`}>{item.title}</a>
                      ))}
                    </nav>
                    <article className="articleReader developmentReader">
                      <div className="articleTags">
                        {developmentArticles[0].categories.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                      <h1>{developmentArticles[0].title}</h1>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 id={headingId(String(children))}>{children}</h1>,
                          h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2>,
                          h3: ({ children }) => <h3 id={headingId(String(children))}>{children}</h3>,
                        }}
                      >
                        {developmentArticles[0].content}
                      </ReactMarkdown>
                    </article>
                  </div>
                ) : (
                  <div className="empty">暂无开发需求文档。</div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {dialogOpen && (
        <div className="modalBackdrop" role="presentation" onMouseDown={() => setDialogOpen(false)}>
          <form className="modal" onSubmit={saveWord} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modalHead"><h2>{editing.id ? "编辑单词" : "新增单词"}</h2><button type="button" onClick={() => setDialogOpen(false)}>×</button></div>
            <label>日语<input required value={editing.word} onChange={(event) => setEditing({ ...editing, word: event.target.value })} /></label>
            <label>假名<input required value={editing.reading} onChange={(event) => setEditing({ ...editing, reading: event.target.value })} /></label>
            <label>翻译<textarea required value={editing.meaning} onChange={(event) => setEditing({ ...editing, meaning: event.target.value })} /></label>
            <fieldset className="tagSelector">
              <legend>所属类别（可多选）</legend>
              {vocabularyCategories.map((item) => (
                <label key={item.id}>
                  <input
                    type="checkbox"
                    checked={editing.categoryIds.includes(item.id)}
                    onChange={() => setEditing({
                      ...editing,
                      categoryIds: editing.categoryIds.includes(item.id)
                        ? editing.categoryIds.filter((id) => id !== item.id)
                        : [...editing.categoryIds, item.id],
                    })}
                  />
                  {item.name}
                </label>
              ))}
            </fieldset>
            <div className="formRow">
              <label>词性<input value={editing.partOfSpeech} onChange={(event) => setEditing({ ...editing, partOfSpeech: event.target.value })} /></label>
              <label>熟悉度<input value={editing.familiarity} onChange={(event) => setEditing({ ...editing, familiarity: event.target.value })} /></label>
            </div>
            <button className="primary">保存单词</button>
          </form>
        </div>
      )}
      {categoryDialogOpen && (
        <div className="modalBackdrop" role="presentation" onMouseDown={() => setCategoryDialogOpen(false)}>
          <form className="modal" onSubmit={saveCategory} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modalHead"><h2>{categoryEditing.id ? "编辑类别" : "新增类别"}</h2><button type="button" onClick={() => setCategoryDialogOpen(false)}>×</button></div>
            <label>类别名称<input required value={categoryEditing.name} onChange={(event) => setCategoryEditing({ ...categoryEditing, name: event.target.value })} /></label>
            <div className="formRow">
              <label>适用对象
                <select value={categoryEditing.scope} onChange={(event) => setCategoryEditing({ ...categoryEditing, scope: event.target.value as CategoryConfig["scope"] })}>
                  <option value="vocabulary">词汇</option><option value="article">文章</option><option value="both">词汇与文章</option>
                </select>
              </label>
              <label>用途
                <select value={categoryEditing.purpose} onChange={(event) => setCategoryEditing({ ...categoryEditing, purpose: event.target.value as CategoryConfig["purpose"] })}>
                  <option value="study">学习分类</option><option value="topic">内容主题</option><option value="development">开发文档</option>
                </select>
              </label>
            </div>
            <div className="formRow">
              <label>排序<input type="number" min="0" value={categoryEditing.sortOrder} onChange={(event) => setCategoryEditing({ ...categoryEditing, sortOrder: Number(event.target.value) })} /></label>
              <label className="checkLine"><input type="checkbox" checked={Boolean(categoryEditing.enabled)} onChange={(event) => setCategoryEditing({ ...categoryEditing, enabled: event.target.checked })} />启用</label>
            </div>
            <button className="primary">保存类别</button>
          </form>
        </div>
      )}
      {favoriteGroupDialogOpen && (
        <div className="modalBackdrop" role="presentation" onMouseDown={() => setFavoriteGroupDialogOpen(false)}>
          <form className="modal" onSubmit={saveFavoriteGroup} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modalHead">
              <h2>{favoriteGroupEditing.id ? "编辑收藏组" : "新建收藏组"}</h2>
              <button type="button" onClick={() => setFavoriteGroupDialogOpen(false)}>×</button>
            </div>
            <label>名称
              <input required maxLength={100} value={favoriteGroupEditing.name} onChange={(event) => setFavoriteGroupEditing({ ...favoriteGroupEditing, name: event.target.value })} />
            </label>
            <label>备注
              <textarea maxLength={500} value={favoriteGroupEditing.note} onChange={(event) => setFavoriteGroupEditing({ ...favoriteGroupEditing, note: event.target.value })} placeholder="例如：商务表达、近期重点复习" />
            </label>
            <label className="checkLine">
              <input type="checkbox" checked={favoriteGroupEditing.isDefault} onChange={(event) => setFavoriteGroupEditing({ ...favoriteGroupEditing, isDefault: event.target.checked })} />
              设为默认收藏组
            </label>
            <button className="primary">保存收藏组</button>
          </form>
        </div>
      )}
      <Notifications items={notifications} onDismiss={dismissNotification} />
    </main>
  );
}
