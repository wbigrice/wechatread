# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 项目目的

本仓库用于基于**微信读书（WeRead）**个人阅读数据，生成「微信读书书架墙 / 阅读档案」可视化页面（参考 `image.png` 等 6 张截图：书架墙、分类占比、阅读进度分布、阅读时间热力图、月度阅读小结）。

- 数据来源：微信读书官方 Agent API（`https://i.weread.qq.com/api/agent/gateway`），需 `WEREAD_API_KEY` 环境变量鉴权。
- 当前仓库仅有参考截图与已安装的 `weread-skills` Skill，**尚无业务代码**。从零搭建时，技术栈与目录结构由实现者决定（见下「架构倾向」）。

## 已安装 Skill：`weread-skills`（项目级）

位置：`.codebuddy/skills/weread-skills/`。调用任何微信读书接口前，**必须先**阅读 `SKILL.md` 并加载对应能力文档，禁止凭字段名猜测含义。

关键约束（来自 `SKILL.md`）：
- 鉴权：`Authorization: Bearer $WEREAD_API_KEY`，Key 格式 `wrk-xxxxxxxx`。未设置时提示用户 `export WEREAD_API_KEY=<你的apikey>`。
- 请求体所有业务参数**平铺**在 body 顶层，不要包在 `params`/`data`/`body` 内。
- 每次请求 body **必须**带 `"skill_version": "1.0.4"`（取 `SKILL.md` 顶部 version）。
- 回包出现 `upgrade_info` 字段时，必须**立即暂停**并按指引升级，不得忽略。
- 时间戳字段展示时转 `YYYY-MM-DD`；阅读时长（秒）转 `X小时Y分钟`。
- 优先使用回包 `deepLink` 字段做跳转（展示为 `[打开阅读]({deepLink})`），无则不要手动拼 `weread://`。
- 书架数量 = `books.length + albums.length + (mp 非空 ? 1 : 0)`。

常用接口（详见各 `*.md`）：`/store/search`（搜书拿 bookId）、`/shelf/sync`（书架）、`/user/notebooks`（笔记）、`/readdata/*`（阅读统计）、`/_list`（列出全部接口）。

## 常用命令

仓库暂无构建系统。以下为预期命令（代码落地后按需调整）：

- **依赖安装（推荐 venv）**：`python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt` — 隔离依赖，避免污染全局 Python。
- **配置 API Key（临时）**：`set WEREAD_API_KEY=wrk-你的key` — 让 Skill/脚本接入微信读书账号；永久请写入系统环境变量。
- **启动本地预览**：`python -m http.server 8000` — 在 `http://localhost:8000` 查看生成的静态书架墙页面。
- **运行测试（单文件）**：`python -m pytest tests/test_shelf.py` — 验证书架统计/接口解析等逻辑；若用 unittest 则 `python -m unittest tests.test_shelf`。
- **获取全部可用接口**：`curl -X POST .../agent/gateway -H "Authorization: Bearer $WEREAD_API_KEY" -d "{\"api_name\":\"/_list\",\"skill_version\":\"1.0.4\"}"` — 列出接口参数定义，开发新能力前先查。

## 架构倾向（从零搭建时）

目标产物是一个**静态可视化页面**，建议分层：

1. **数据层**：封装对 `weread-skills` 网关的调用（search → shelf → readdata → notes），把 JSON 回包裁剪为页面需要的字段，负责 `skill_version` 上报、`deepLink` 透传、时间戳/时长格式化。
2. **聚合层**：将原始接口数据聚合成书架墙所需的视图模型（分类占比、进度分布、时间热力图、月度小结），对应截图中的各模块。
3. **渲染层**：用 HTML/CSS（可加 ECharts/Canvas）渲染书架墙与统计图表；纯静态输出，便于 `http.server` 预览或部署到 Pages。

优先复用 `weread-skills` 的接口定义，不要重复实现鉴权与参数规范。

## 重要约定

- `WEREAD_API_KEY` 属个人凭证，**严禁**写入代码、提交或日志。
- 展示阅读数据须遵循 Skill 的字段解释优先级与格式化规则，不要直接翻译字段名。
- 本仓库 `.codebuddy/` 为项目数据目录，不要当作临时缓存删除。
