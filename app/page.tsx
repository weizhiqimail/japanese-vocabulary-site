"use client";

import { useEffect, useMemo, useState } from "react";
import { vocabulary, type VocabularyItem } from "./vocabulary";

type View = "home" | "learn" | "quiz" | "errors" | "mastered";
type Mode = "reading" | "word" | "meaning";
type Progress = { mastered: string[]; errors: string[] };
type Question = {
  item: VocabularyItem;
  mode: Mode;
  prompt: string;
  answer: string;
  options: string[];
};

const STORAGE_KEY = "kotoba-note-progress-v1";
const keyOf = (item: VocabularyItem) => item.word;

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeOptions(item: VocabularyItem, mode: Mode) {
  const field: keyof VocabularyItem =
    mode === "reading" ? "reading" : mode === "word" ? "word" : "meaning";
  const distractors = shuffle(
    vocabulary.filter((candidate) => candidate.word !== item.word),
  )
    .slice(0, 3)
    .map((candidate) => candidate[field]);
  return shuffle([item[field], ...distractors]);
}

function createQuestions(items: VocabularyItem[]): Question[] {
  return items.flatMap((item) => [
    {
      item,
      mode: "reading" as const,
      prompt: item.word,
      answer: item.reading,
      options: makeOptions(item, "reading"),
    },
    {
      item,
      mode: "word" as const,
      prompt: item.meaning,
      answer: item.word,
      options: makeOptions(item, "word"),
    },
    {
      item,
      mode: "meaning" as const,
      prompt: item.word,
      answer: item.meaning,
      options: makeOptions(item, "meaning"),
    },
  ]);
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [groupSize, setGroupSize] = useState(10);
  const [groupStart, setGroupStart] = useState(0);
  const [progress, setProgress] = useState<Progress>({
    mastered: [],
    errors: [],
  });
  const [quizItems, setQuizItems] = useState<VocabularyItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongWords, setWrongWords] = useState<Set<string>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const pending = useMemo(
    () => vocabulary.filter((item) => !progress.mastered.includes(keyOf(item))),
    [progress.mastered],
  );
  const currentGroup = useMemo(
    () => pending.slice(groupStart, groupStart + groupSize),
    [pending, groupStart, groupSize],
  );
  const errorItems = vocabulary.filter((item) =>
    progress.errors.includes(keyOf(item)),
  );
  const masteredItems = vocabulary.filter((item) =>
    progress.mastered.includes(keyOf(item)),
  );
  const currentQuestion = questions[questionIndex];

  function startQuiz(items = currentGroup) {
    if (!items.length) return;
    setQuizItems(items);
    setQuestions(createQuestions(items));
    setQuestionIndex(0);
    setSelected(null);
    setWrongWords(new Set());
    setQuizComplete(false);
    setView("quiz");
  }

  function answer(option: string) {
    if (selected || !currentQuestion) return;
    setSelected(option);
    if (option !== currentQuestion.answer) {
      setWrongWords((previous) =>
        new Set(previous).add(keyOf(currentQuestion.item)),
      );
    }
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((index) => index + 1);
      setSelected(null);
      return;
    }

    const wrong = new Set(wrongWords);
    if (selected !== currentQuestion.answer) {
      wrong.add(keyOf(currentQuestion.item));
    }
    setWrongWords(wrong);
    const correct = quizItems
      .map(keyOf)
      .filter((word) => !wrong.has(word));
    setProgress((previous) => ({
      mastered: [...new Set([...previous.mastered, ...correct])],
      errors: [
        ...new Set([
          ...previous.errors.filter((word) => !correct.includes(word)),
          ...wrong,
        ]),
      ],
    }));
    setQuizComplete(true);
  }

  function resetProgress() {
    if (!window.confirm("确定清空错题本和背诵记录吗？")) return;
    setProgress({ mastered: [], errors: [] });
    setGroupStart(0);
  }

  const pageCount = Math.max(1, Math.ceil(pending.length / groupSize));
  const currentPage = Math.min(
    pageCount,
    Math.floor(groupStart / groupSize) + 1,
  );

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setView("home")}>
          <span className="brandMark">こ</span>
          <span>ことば帳</span>
        </button>
        <nav aria-label="主导航">
          <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}>首页</button>
          <button className={view === "learn" ? "active" : ""} onClick={() => setView("learn")}>学习</button>
          <button className={view === "errors" ? "active" : ""} onClick={() => setView("errors")}>错题本</button>
          <button className={view === "mastered" ? "active" : ""} onClick={() => setView("mastered")}>背诵本</button>
        </nav>
      </header>

      {view === "home" && (
        <section className="hero">
          <div className="eyebrow">BJT 商务日语词库 · {vocabulary.length} 词</div>
          <h1>今天，也记住<br /><em>一点点。</em></h1>
          <p>从你的学习笔记整理而来。每组依次检测假名、日语与中文释义，轻量练习，稳步积累。</p>
          <button className="primary" onClick={() => setView("learn")}>开始今天的学习 <span>→</span></button>
          <div className="stats">
            <div><strong>{pending.length}</strong><span>待背单词</span></div>
            <div><strong>{progress.mastered.length}</strong><span>已经掌握</span></div>
            <div><strong>{progress.errors.length}</strong><span>需要复习</span></div>
          </div>
          <div className="todayCard">
            <span className="kana">継続</span>
            <div><b>坚持，比速度更重要。</b><small>记录保存在当前浏览器中</small></div>
          </div>
        </section>
      )}

      {view === "learn" && (
        <section className="content">
          <div className="sectionHead">
            <div><span className="eyebrow">LEARN</span><h2>选择今天的一组</h2></div>
            <label>每组
              <input
                type="number"
                min="4"
                max="100"
                value={groupSize}
                onChange={(event) => {
                  setGroupSize(Math.max(4, Math.min(100, Number(event.target.value) || 10)));
                  setGroupStart(0);
                }}
              />词
            </label>
          </div>
          <div className="groupMeta">
            <span>第 {currentPage} / {pageCount} 组</span>
            <span>{currentGroup.length} 个待背单词</span>
          </div>
          <div className="wordGrid">
            {currentGroup.map((item, index) => (
              <article className="wordCard" key={item.word}>
                <span className="number">{String(groupStart + index + 1).padStart(2, "0")}</span>
                <h3>{item.word}</h3>
                <div className="reading">{item.reading}</div>
                <p>{item.meaning}</p>
              </article>
            ))}
          </div>
          {!currentGroup.length && <div className="empty">全部词汇都已进入背诵本，做得漂亮。</div>}
          <div className="actions">
            <button className="ghost" disabled={groupStart === 0} onClick={() => setGroupStart(Math.max(0, groupStart - groupSize))}>上一组</button>
            <button className="primary" disabled={!currentGroup.length} onClick={() => startQuiz()}>测试这一组 <span>→</span></button>
            <button className="ghost" disabled={groupStart + groupSize >= pending.length} onClick={() => setGroupStart(groupStart + groupSize)}>下一组</button>
          </div>
        </section>
      )}

      {view === "quiz" && currentQuestion && (
        <section className="quizWrap">
          {!quizComplete ? (
            <>
              <div className="quizTop">
                <button className="textButton" onClick={() => setView("learn")}>← 退出测试</button>
                <span>{questionIndex + 1} / {questions.length}</span>
              </div>
              <div className="progressBar"><i style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
              <div className="quizCard">
                <span className="modeBadge">
                  {currentQuestion.mode === "reading" ? "选择假名" : currentQuestion.mode === "word" ? "选择日语" : "选择翻译"}
                </span>
                <div className={`question ${currentQuestion.mode === "word" ? "meaningPrompt" : ""}`}>{currentQuestion.prompt}</div>
                <div className="options">
                  {currentQuestion.options.map((option, index) => {
                    const state = selected
                      ? option === currentQuestion.answer
                        ? "correct"
                        : option === selected
                          ? "wrong"
                          : ""
                      : "";
                    return (
                      <button key={option} className={state} onClick={() => answer(option)}>
                        <span>{String.fromCharCode(65 + index)}</span>{option}
                      </button>
                    );
                  })}
                </div>
                {selected && (
                  <button className="primary next" onClick={nextQuestion}>
                    {questionIndex === questions.length - 1 ? "查看结果" : "下一题"} <span>→</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="resultCard">
              <span className="resultMark">{wrongWords.size ? "復" : "合"}</span>
              <h2>{wrongWords.size ? "这一组完成了" : "全部答对！"}</h2>
              <p>掌握 {quizItems.length - wrongWords.size} 词，需要复习 {wrongWords.size} 词。</p>
              <div className="actions">
                {wrongWords.size > 0 && <button className="ghost" onClick={() => startQuiz(quizItems.filter((item) => wrongWords.has(item.word)))}>重测错词</button>}
                <button className="primary" onClick={() => { setGroupStart(0); setView("learn"); }}>学习下一组 <span>→</span></button>
              </div>
            </div>
          )}
        </section>
      )}

      {(view === "errors" || view === "mastered") && (
        <section className="content">
          <div className="sectionHead">
            <div>
              <span className="eyebrow">{view === "errors" ? "REVIEW" : "MASTERED"}</span>
              <h2>{view === "errors" ? "错题本" : "背诵本"}</h2>
              <p>{view === "errors" ? "答错过的词会留在这里，答对三种题型后移入背诵本。" : "三种题型都通过的词汇。"}</p>
            </div>
            {view === "errors" && errorItems.length > 0 && <button className="primary" onClick={() => startQuiz(errorItems)}>复习全部 <span>→</span></button>}
          </div>
          <div className="list">
            {(view === "errors" ? errorItems : masteredItems).map((item) => (
              <article key={item.word}>
                <div><h3>{item.word}</h3><span>{item.reading}</span></div>
                <p>{item.meaning}</p>
              </article>
            ))}
          </div>
          {(view === "errors" ? errorItems : masteredItems).length === 0 && (
            <div className="empty">{view === "errors" ? "还没有错题，继续保持。" : "完成一组测试后，掌握的词会出现在这里。"}</div>
          )}
          <button className="reset" onClick={resetProgress}>清空所有学习记录</button>
        </section>
      )}
    </main>
  );
}
