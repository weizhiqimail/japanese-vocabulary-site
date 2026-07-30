# 部署说明

## GitHub

GitHub 是源代码的正式版本来源：

```text
https://github.com/weizhiqimail/japanese-vocabulary-site.git
```

本地验证通过后推送 `main`。认证交给 Git Credential Manager 或 GitHub Personal Access Token，令牌不得写入远程地址或仓库文件。

## OpenAI Sites

生产地址：

```text
https://kotoba-bjt-notebook.daziiiiiiiiiiii.chatgpt.site
```

`.openai/hosting.json` 保存既有 Sites `project_id`。迁移或重新克隆仓库时必须保留此文件，不能重复创建 Sites 项目。

标准发布顺序：

1. 完成功能、文档和数据库同步。
2. 本地构建通过。
3. 提交并推送 GitHub。
4. 用户明确“确认发布”。
5. 将同一提交对应的源码保存为 Sites 版本并部署生产。
6. 检查部署状态和线上关键流程。

本地 `.env` 不随 Git 克隆；新开发目录需要单独安全复制或重新创建。生产数据库连接使用 Sites 环境变量。

