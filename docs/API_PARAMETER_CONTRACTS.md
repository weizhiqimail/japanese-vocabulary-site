# API 参数契约

## 原则

- 前端 `http/api` 方法必须显式构造请求参数，不允许把页面状态或查询返回对象整体透传。
- 后端使用每个业务接口自己的 DTO。DTO 声明字段会被校验，未声明字段由全局白名单剥离并忽略。
- 新增和编辑共用保存接口时，编辑操作只额外提交对应资源 ID。
- 数据库生成字段、统计字段、逻辑删除字段和关联查询结果都是只读字段，不进入保存请求。

## 写接口

| 接口 | 必要字段 | 可选字段 |
| --- | --- | --- |
| `POST /api/auth/login` | `username`、`password` | 无 |
| `POST /api/auth/logout` | 无 | 无 |
| `POST /api/collections/save` | `name`、`type`、`source`、`description` | 编辑时 `collectionId` |
| `POST /api/collections/delete` | `collectionId` | 无 |
| `POST /api/vocabularies/save` | `word`、`translation`、关系 ID 数组 | 编辑时 `wordId`；`reading`、`notes` |
| `POST /api/vocabularies/delete` | `wordId` | 无 |
| `POST /api/grammars/save` | `pattern`、`meaning`、关系 ID 数组 | 编辑时 `grammarId`；`reading`、`notes` |
| `POST /api/grammars/delete` | `grammarId` | 无 |
| `POST /api/sentences/save` | `japanese`、`translation`、关系 ID 数组 | 编辑时 `sentenceId`；`reading`、`notes` |
| `POST /api/sentences/delete` | `sentenceId` | 无 |
| `POST /api/*/relations/save` | 资源 ID、`targetResource`、`targetId` | 无 |
| `POST /api/*/relations/delete` | 资源 ID、`targetResource`、`targetId` | 无 |
| `POST /api/tags/save` | `name`、`color` | 编辑时 `tagId` |
| `POST /api/tags/delete` | `tagId` | 无 |
| `POST /api/parts-of-speech/save` | `name`、`enabled` | 新增时 `code`；编辑时 `partOfSpeechId` |
| `POST /api/study/record` | `vocabularyId`、`eventType` | 无 |
| `POST /api/study/test-answer` | `vocabularyId`、`correct` | 无 |
| `POST /api/settings/save` | `key`、`value` | 无 |
| `POST /api/imports/create` | `filename`、`candidates` | 无 |
| `POST /api/imports/review` | `candidateId`、`decision` | 无 |

## 查询接口

- 通用分页字段只有 `pageNum`、`pageSize`、`q`。
- 集合查询额外允许 `collectionId`、`type`。
- 词汇查询额外允许 `wordId`、`collectionId`、`partOfSpeechId`、`tagId`。
- 语法查询额外允许 `grammarId`、`tagId`。
- 句子查询额外允许 `sentenceId`、`tagId`。
- 标签查询额外允许 `tagId`。
- 词性查询额外允许 `partOfSpeechId`。
- 学习、复习和关系查询只接收各控制器声明的 ID、资源类型或复习模式。

## 只读字段

以下类型字段不允许由保存接口控制：

- 数据库主键原始字段 `id`；编辑必须使用业务接口约定的资源 ID 字段。
- `created_at`、`updated_at`、`deleted_at`。
- `is_default`、学习次数、复习次数、错误次数等服务端状态和统计字段。
- 标签、集合、词性和知识关系的查询展开对象。
- 旧结构中的 `cover`、`sort_method`、`is_archived`、`is_default_error_book` 等当前业务未使用字段。
