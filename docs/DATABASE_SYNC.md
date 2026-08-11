# 本地数据库全量覆盖线上数据库

`npm run db:sync:online` 不带确认参数时一定拒绝执行。实际执行方式：

```bash
npm run db:sync:online -- OVERWRITE_ONLINE
```

执行前提：

1. 安装 MySQL 客户端，并确保 `mysqldump`、`mysql` 位于 PATH。
2. `backend/.env.local` 指向本地数据库。
3. `backend/.env.production` 指向线上数据库。
4. 已人工确认线上数据可以被本地数据全部覆盖。

脚本顺序：

1. 拒绝把 localhost 识别为线上地址。
2. 将线上数据库备份到 `backend/backups/online-before-sync-*.sql`。
3. 全量导出本地数据库，包括表结构、数据、触发器和存储过程。
4. 使用包含 `DROP TABLE` 的本地转储覆盖线上数据库。

`backend/backups/` 和所有 `.env*` 均被 Git 忽略。该命令不属于 `build`、`start` 或普通部署流程，避免误触发。
