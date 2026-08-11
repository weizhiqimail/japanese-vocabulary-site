# 日志说明

## 文件位置与命名

NestJS 启动时在仓库根目录创建 `logs/`，每次启动使用一个新的日志文件：

```text
logs/jvs-YYYY-MM-DD-NNN.log
```

`NNN` 是当天已有文件的递增序号，例如 `jvs-2026-08-11-001.log`。`logs/` 已加入 `.gitignore`，运行日志不会进入 Git。

## 日志类别

- `STARTUP`：服务启动、页面 URL、Swagger URL 和日志文件路径。
- `HTTP`：请求开始、完成状态、耗时、请求 ID、方法和路径。
- `DB`：TypeORM 最终执行 SQL、绑定参数、慢查询、数据库错误和迁移事件。
- `BUSINESS`：控制器业务调用、登录判断、学习/复习、导入审核和数据维护结果。
- `EXCEPTION`：HTTP 异常、业务异常、数据库异常及可用堆栈。
- `SYSTEM`：NestJS 模块初始化、路由映射等框架日志。

每行同时包含 ISO 时间、类别和级别，便于文本检索或后续日志采集。

## 性能与安全

文件输出使用 Node.js WriteStream，并通过微任务把写入移出当前调用栈；业务请求不会等待日志落盘。进程正常关闭时会结束日志流。

日志层会把键名包含 `password`、`token`、`cookie` 或 `authorization` 的元数据替换为 `[REDACTED]`。包含密码或会话令牌字段的 INSERT/UPDATE SQL 会保留 SQL 模板，但绑定参数整体脱敏。HTTP 日志不记录请求体。

当前策略按每次启动创建文件，不自动删除旧文件。长期部署时应由运行平台或计划任务按保留天数归档和清理，避免磁盘持续增长。
