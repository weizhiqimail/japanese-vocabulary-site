# 数据库结构

数据库使用 MySQL，连接字符串来自 `DATABASE_URL`。完整、可执行且带字段注释的定义位于 `db/schema.sql`。

## 核心表

- `vocabularies`：唯一正式词库，保存词汇、假名、翻译、备注及学习/收藏汇总。
- `parts_of_speech`、`tags`：固定词性和可管理标签；`vocabulary_parts_of_speech`、`vocabulary_tags`、`grammar_tags`、`sentence_tags` 分别维护知识对象的多对多分类关系。
- `collections`、`collection_vocabularies`：来源集合、自建集合、收藏本与错题本，以及集合成员统计。
- `grammars`、`sentences`：分别保存语法和句子；语法和句子均可选择多个标签。词汇表达搭配统一作为句子，通过 `vocabulary_sentences` 关联，不再维护独立搭配模型。
- `vocabulary_relations`：核心词库内词汇关系。
- `vocabulary_grammars`、`vocabulary_sentences`、`grammar_sentences`：知识对象交叉关联。关系表只保存双方数据库 ID，不保存匹配片段。
- `study_events`：逐次学习、复习和掌握事件。
- `test_sessions`、`test_answers`：测试会话和逐题作答历史。
- `import_batches`、`import_candidates`：CSV 导入批次和非正式词汇审核池。
- `settings`：默认错题本等系统配置。

## 数据原则

正式对象只逻辑删除。集合引用正式词汇 ID，不复制正文。学习/测试历史保存事件，汇总字段只用于快速展示。固定词性通过稳定 `code` 与代码枚举对应，不允许在词汇表单中自由创建。

语法不保存接续、用法字段；句子不保存来源字段。执行 `npm run db:migrate` 会幂等创建缺失关系表，并删除上述已废弃字段，但不会删除任何业务记录或处理未在结构文件中定义的表。

项目完成从零重建时已经永久删除全部历史表；数据库只保留本文列出的正式表。
