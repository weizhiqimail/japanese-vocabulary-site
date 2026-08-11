
1. 区分数据库，本地模式，使用本地的数据库，配置信息如下，上线后发布用的是之前配置的在线数据库
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=daziwordsapp
DB_USER=root
DB_PASSWORD=<local-password>
DB_POOL_SIZE=10
DB_CONNECT_TIMEOUT_MS=5000

2. 所有的数据，在本地调试，测试，发布的时候，保留一个脚本命令，将本地所有的数据库里的数据，全量覆盖线上数据库。

3. 补充一个登录模块，密码用明文存储在数据库里，不需要什么验证，测试项目，没必要，需要了再改进。项目登录了才能访问，所以你需要登录验证校验等逻辑，前端页面对于登录校验的拦截等等，你来处理。

4. 现在，保留数据库里的所有数据，技术改造整个项目，新项目放在 D:\program\japanese-vocabulary-site-v2 里，在这个目录里，前端放在 frontend 目录下，后端放在backend目录下。

前后端分离，使用nest.js作为所有的后端服务，配套使用各种辅助工具。
前端使用 react，ui 库使用 @chakra-ui/react，确保现在的整体交互风格不变。

前端的脚手架，使用 vite 构建 ts 版本的 react，需要的工具你就自己添加。
后端使用 nest-cli 生成，也是 ts 版本。

5. 后端的模块划分，有要求，参考 D:\program\dazi_words_app\dazi_words_backend 这个目录下的src的目录结构，分拆 common config entities filters helpers interceptors middlewares modules pipes shared-modules types 等等

注意，entities 里的每一个 entity ，都是由自己的配置，对外统一暴露是通过 index.ts，然后给到 share-modules 里做共享。

modules 里，每一个 module 有 service controller dto config，但是，只参考模块结构，不要直接用代码，参考即可。

6. 前端的模块划分，也要有要求，参考 D:\program\dazi_words_app\dazi_words_frontend 目录下的 src 目录里的内容，路由、组件、页面、布局、该分拆就要分拆。

7. 注意哈，你生成的代码，都是在D:\program\japanese-vocabulary-site-v2 目录下的 frontend 和 backend ，把一些文档，文件，之类的固定的内容，放在 docs 目录下，docs, frontend, backend 三个目录平级，前后端都需要自己的 readme，放在自己的目录下，最外部也需要一个 readme。

8. 开发的时候，前后端两个服务，通过代理服务调用。构建发布的时候，将前端构建后的产物，全部拷贝到backend 的 web目录下，作为前端的静态资源。后端使用中间件，将这些资源作为页面访问请求处理。所有的业务API接口，都用 api 作为根路径，与页面路由区分。

9. 最后部署的时候，可能需要 chatGPT 或 cloudflare 的一些功能服务，可以直接编写对应的代码，脚本处理。

10. nest 里的数据库服务哈，尽量使用链式的js代码生成SQL语句，减少直接使用SQL语句。

11. 还需要 swagger 的接口文档。

12. 这次项目改造。把原来的 D:\program\japanese-vocabulary-site 的 git 拷贝过来，沿用旧有的 git 记录，我不放在一块，是因为我可能还要用到一些代码。但是你要知道，我只是把代码放在另一个目录里，不是新启一个项目。

13. 本地数据库如果连不上，先不考虑数据库的问题，主要是改造代码。

开始执行，授予你访问 D:\program\dazi_words_app 目录下的所有文件的查看权限。授予你 D:\program\japanese-vocabulary-site-v2 目录下的读写权限。























































