"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Category = "BJT" | "N1" | "BJT-外来语";
type View = "home" | "learn" | "quiz" | "errors" | "mastered" | "words";
type Mode = "reading" | "word" | "meaning";
type Word = {
  id: number;
  category: Category;
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
  familiarity: string;
  status?: "mastered" | "error";
};
type Question = {
  item: Word;
  mode: Mode;
  prompt: string;
  answer: string;
  options: string[];
};

const categories: Category[] = ["BJT", "N1", "BJT-外来语"];
const emptyForm = {
  id: 0,
  word: "",
  reading: "",
  meaning: "",
  partOfSpeech: "",
  familiarity: "",
};

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function createQuestions(items: Word[], pool: Word[]) {
  const modes: Mode[] = ["reading", "word", "meaning"];
  return shuffle(
    modes.flatMap((mode) =>
      shuffle(items).map((item) => {
        const field = mode === "reading" ? "reading" : mode === "word" ? "word" : "meaning";
        const seen = new Set([item[field]]);
        const distractors = shuffle(pool.filter((candidate) => candidate.id !== item.id))
          .filter((candidate) => {
            if (seen.has(candidate[field])) return false;
            seen.add(candidate[field]);
            return true;
          })
          .slice(0, 3)
          .map((candidate) => candidate[field]);
        return {
          item,
          mode,
          prompt: mode === "word" ? item.meaning : item.word,
          answer: item[field],
          options: shuffle([item[field], ...distractors]),
        };
      }),
    ),
  );
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [category, setCategory] = useState<Category>("BJT");
  const [words, setWords] = useState<Word[]>([]);
  const [mastered, setMastered] = useState<Word[]>([]);
  const [errors, setErrors] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupSize, setGroupSize] = useState(10);
  const [currentGroup, setCurrentGroup] = useState<Word[]>([]);
  const [visibility, setVisibility] = useState({ word: true, reading: true, meaning: true });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizItems, setQuizItems] = useState<Word[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<Set<number>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [listItems, setListItems] = useState<Word[]>([]);
  const [editing, setEditing] = useState(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const loadCategory = useCallback(async () => {
    setLoading(true);
    const [wordResponse, masteredResponse, errorResponse] = await Promise.all([
      fetch(`/api/vocabulary?category=${encodeURIComponent(category)}&all=true`),
      fetch(`/api/progress?category=${encodeURIComponent(category)}&status=mastered`),
      fetch(`/api/progress?category=${encodeURIComponent(category)}&status=error`),
    ]);
    const [wordData, masteredData, errorData] = await Promise.all([
      wordResponse.json(), masteredResponse.json(), errorResponse.json(),
    ]);
    setWords(wordData.items ?? []);
    setMastered(masteredData.items ?? []);
    setErrors(errorData.items ?? []);
    setLoading(false);
  }, [category]);

  const loadList = useCallback(async () => {
    const response = await fetch(
      `/api/vocabulary?category=${encodeURIComponent(category)}&page=${page}&pageSize=20&search=${encodeURIComponent(search)}`,
    );
    const data = await response.json();
    setListItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }, [category, page, search]);

  useEffect(() => { void loadCategory(); }, [loadCategory]);
  useEffect(() => { if (view === "words") void loadList(); }, [view, loadList]);
  useEffect(() => {
    const masteredIds = new Set(mastered.map((item) => item.id));
    const pool = words.filter((item) => !masteredIds.has(item.id));
    setCurrentGroup(shuffle(pool).slice(0, groupSize));
  }, [words, mastered, groupSize]);

  const pendingCount = words.length - mastered.length;
  const currentQuestion = questions[questionIndex];
  const pageCount = Math.max(1, Math.ceil(total / 20));

  function changeView(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeCategory(next: Category) {
    setCategory(next);
    setPage(1);
    setSearch("");
    setSearchInput("");
    setView("home");
  }

  function refreshGroup() {
    const masteredIds = new Set(mastered.map((item) => item.id));
    setCurrentGroup(
      shuffle(words.filter((item) => !masteredIds.has(item.id))).slice(0, groupSize),
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
    setView("quiz");
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
      setQuestionIndex((index) => index + 1);
      setSelected(null);
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
    const payload = { ...editing, category };
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

  async function deleteWord(item: Word) {
    if (!window.confirm(`确定删除「${item.word}」吗？`)) return;
    await fetch(`/api/vocabulary/${item.id}`, { method: "DELETE" });
    setMessage("已删除");
    await Promise.all([loadList(), loadCategory()]);
  }

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => changeView("home")}>
          <span className="brandMark">こ</span><span>ことば帳</span>
        </button>
        <nav aria-label="主导航">
          {([
            ["home", "首页"], ["learn", "学习"], ["errors", "错题本"],
            ["mastered", "背诵本"], ["words", "词库"],
          ] as [View, string][]).map(([target, label]) => (
            <button key={target} className={view === target ? "active" : ""} onClick={() => changeView(target)}>{label}</button>
          ))}
        </nav>
        <select className="categorySelect" value={category} onChange={(event) => changeCategory(event.target.value as Category)} aria-label="词汇分类">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </header>

      <div key={`${view}-${category}`} className="pageFade">
        {view === "home" && (
          <section className="hero">
            <div className="eyebrow">{category} · 在线词库 · {words.length} 词</div>
            <h1>今天，也记住<br /><em>一点点。</em></h1>
            <p>词汇与学习记录已连接在线数据库。每组随机检测假名、日语与中文释义，随时继续上次的进度。</p>
            <button className="primary" onClick={() => changeView("learn")}>开始今天的学习 <span>→</span></button>
            <div className="stats">
              <div><strong>{loading ? "—" : pendingCount}</strong><span>待背单词</span></div>
              <div><strong>{mastered.length}</strong><span>已经掌握</span></div>
              <div><strong>{errors.length}</strong><span>需要复习</span></div>
            </div>
            <div className="todayCard"><span className="kana">継続</span><div><b>坚持，比速度更重要。</b><small>当前分类：{category}</small></div></div>
          </section>
        )}

        {view === "learn" && (
          <section className="content">
            <div className="sectionHead">
              <div><span className="eyebrow">RANDOM LEARN · {category}</span><h2>随机学习一组</h2></div>
              <label>每组
                <input type="number" min="4" max="100" value={groupSize} onChange={(event) => setGroupSize(Math.max(4, Math.min(100, Number(event.target.value) || 10)))} />
                词
              </label>
            </div>
            <div className="visibilityBar">
              <span>卡片显示</span>
              {([["word", "日语"], ["reading", "假名"], ["meaning", "翻译"]] as const).map(([field, label]) => (
                <label key={field}><input type="checkbox" checked={visibility[field]} onChange={() => setVisibility((value) => ({ ...value, [field]: !value[field] }))} />{label}</label>
              ))}
              <button className="textButton" onClick={refreshGroup}>换一组 ↻</button>
            </div>
            <div className="wordGrid">
              {currentGroup.map((item, index) => (
                <article className="wordCard" key={item.id}>
                  <span className="number">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className={!visibility.word ? "concealed" : ""}>{visibility.word ? item.word : "••••"}</h3>
                  <div className={`reading ${!visibility.reading ? "concealed" : ""}`}>{visibility.reading ? item.reading : "••••"}</div>
                  <p className={!visibility.meaning ? "concealed" : ""}>{visibility.meaning ? item.meaning : "••••••"}</p>
                </article>
              ))}
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
                <div className="quizCard" key={questionIndex}>
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

        {(view === "errors" || view === "mastered") && (
          <section className="content">
            <div className="sectionHead">
              <div><span className="eyebrow">{view === "errors" ? "REVIEW" : "MASTERED"} · {category}</span><h2>{view === "errors" ? "错题本" : "背诵本"}</h2></div>
              {view === "errors" && errors.length > 0 && <button className="primary" onClick={() => startQuiz(errors)}>复习全部 <span>→</span></button>}
            </div>
            <div className="list">
              {(view === "errors" ? errors : mastered).map((item) => (
                <article key={item.id}><div><h3>{item.word}</h3><span>{item.reading}</span></div><p>{item.meaning}</p></article>
              ))}
            </div>
            {(view === "errors" ? errors : mastered).length === 0 && <div className="empty">{view === "errors" ? "还没有错题，继续保持。" : "通过三种题型的词会出现在这里。"}</div>}
          </section>
        )}

        {view === "words" && (
          <section className="content wordsPage">
            <div className="sectionHead">
              <div><span className="eyebrow">DATABASE · {category}</span><h2>词库管理</h2><p>在线查看、搜索、新增、编辑和删除词汇。</p></div>
              <button className="primary" onClick={() => { setEditing(emptyForm); setDialogOpen(true); }}>＋ 新增单词</button>
            </div>
            <form className="searchBar" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput); }}>
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="模糊查询日语、假名或翻译" aria-label="搜索词汇" />
              <button className="primary">查询</button>
            </form>
            <div className="tableWrap">
              <table>
                <thead><tr><th>日语</th><th>假名</th><th>翻译</th><th>词性</th><th>操作</th></tr></thead>
                <tbody>
                  {listItems.map((item) => (
                    <tr key={item.id}>
                      <td><b>{item.word}</b></td><td>{item.reading}</td><td>{item.meaning}</td><td>{item.partOfSpeech || "—"}</td>
                      <td className="rowActions">
                        <button onClick={() => { setEditing({ ...item }); setDialogOpen(true); }}>编辑</button>
                        <button className="danger" onClick={() => void deleteWord(item)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!listItems.length && <div className="empty">没有找到匹配词汇。</div>}
            <div className="pagination">
              <button className="ghost" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</button>
              <span>第 {page} / {pageCount} 页 · 共 {total} 条</span>
              <button className="ghost" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>下一页</button>
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
            <div className="formRow">
              <label>词性<input value={editing.partOfSpeech} onChange={(event) => setEditing({ ...editing, partOfSpeech: event.target.value })} /></label>
              <label>熟悉度<input value={editing.familiarity} onChange={(event) => setEditing({ ...editing, familiarity: event.target.value })} /></label>
            </div>
            <button className="primary">保存到 {category}</button>
          </form>
        </div>
      )}
      {message && <button className="toast" onClick={() => setMessage("")}>{message}</button>}
    </main>
  );
}
