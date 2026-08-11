# 数据库结构

完整可执行定义位于 `docs/schema.sql`，后端运行副本位于 `backend/database/schema.sql`。迁移使用 `CREATE TABLE IF NOT EXISTS` 和幂等基础数据写入，不删除既有业务记录。

原有业务表保持不变，包括词汇、词性、标签、集合、语法、句子、知识关系、学习事件、测试和导入审核数据。

新增认证表：

- `app_users`：登录名、显示名、启用状态及当前测试阶段的明文密码。
- `auth_sessions`：用户 ID、令牌哈希、过期和撤销时间。浏览器保存随机原始令牌，数据库只保存 SHA-256。

TypeORM 的 `synchronize` 永久关闭，避免框架根据实体自动修改正式数据库。结构变更必须同时更新两个 schema 文件和本文档。

## 旧数据兼容

`backend/database/compatibility.sql`（文档副本为 `docs/compatibility.sql`）用于同一个 `daziwordsapp` 数据库中已经存在的早期表。迁移策略是：

- 保留全部旧表和旧记录；
- 只为同名表补充新业务需要的字段；
- 将旧 `vocabulary` 数据以相同 ID 复制到 `vocabularies`，已存在 ID 不覆盖；
- 将旧集合成员、词性、语法和句子关系复制到新的正式关系表；
- 不删除或重命名历史表，保证本地全量覆盖线上时所有数据仍在。

迁移脚本会先检测旧 `vocabulary` 表。检测到旧结构时先运行兼容迁移，再运行正式 schema；空数据库则直接执行正式 schema。

## 环境

- 本地数据库读取 `backend/.env.local`。
- 生产数据库读取 `backend/.env.production`。
- 两种环境使用同一套 schema，数据相互独立，只有显式数据库同步命令会覆盖线上数据。
