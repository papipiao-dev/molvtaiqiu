---
name: CueMatch Velocity · 找球友（墨绿台球）
domain: mysportsbook.cn
subdomain: billiards.mysportsbook.cn
workflow: macOS (VS Code + 微信开发者工具)
---

# “找球友”微信小程序原型代码审查、合并与开发规范

## 1. 项目基础信息与协同环境

- **产品定位**：基于地理位置（LBS）的附近台球球友发现与约局社交微信小程序。
- **核心业务链路**：
  1. **LBS 定位与地图/列表双视图**：展示周边球房与球友分布、活跃时间、擅长项目（中式黑八/九球/斯诺克等）、实力段位及台费分摊规则。
  2. **微信消息策略驱动的打招呼闭环**：通过预设礼貌约局短语发起邀约（`idle` → `waiting`），对方同意后解锁微信号一键复制（`accepted`），若婉拒或 24 小时超时则按规则冷却或自动重置（`declined` / `expired`）。
- **域名与环境隔离**：
  - 主域名：`mysportsbook.cn`
  - 墨绿台球业务二级域名：`billiards.mysportsbook.cn`
  - 开发期未完成备案前，前端请求统一经由 `config/env.js` 指向云服务器 IP 非 80 端口（如 `http://<SERVER_IP>:8000/api`），待域名认证与 HTTPS 证书就绪后一键切换至 `https://billiards.mysportsbook.cn/api`。
- **macOS 开发工作流**：VS Code（编码与 AI 辅助生成） + 微信开发者工具（开启「不校验合法域名」进行模拟器热重载与真机 `gcj02` 定位调试）。

---

## 2. 双文件代码全面体检与修复报告

在将 `主要页面.html` 与 `地图选择新位置.html` 合并为单文件（`index.html`）的过程中，排查并修复了以下 **12 项结构、样式与交互缺陷**：

### 2.1 `主要页面.html` 问题清单与修复方案

| 编号 | 问题类型 | 问题描述 | 修复方案 |
| :--- | :--- | :--- | :--- |
| **1** | HTML 文档结构错误 | `<meta>`、`<title>`、Tailwind CDN 脚本及 `<style>` 标签被错误放置于 `<body>` 内部，`<head></head>` 为空，易导致移动端视口缩放异常与样式闪烁。 | 将所有元数据、字体预连接、Tailwind 配置与全局动画样式规范迁移回 `<head>` 内。 |
| **2** | Tailwind v3 类名失效 | 代码中多处使用 `shadow-xs`、`backdrop-blur-xs`、`rounded-2xs`、`active:scale-98`，但标准 Tailwind v3 默认不包含这些尺寸档位，导致阴影、毛玻璃与按压缩放失效。 | 在 `tailwind.config.theme.extend` 中显式补充 `boxShadow.xs`、`backdropBlur.xs`、`borderRadius.2xs` 与 `scale.98`，确保视觉细节 100% 生效。 |
| **3** | 左上角位置入口无交互 | 顶部栏左上角「裕民路南苑六村」胶囊按钮缺少 `id` 与点击事件绑定，无法打开位置选择页。 | 绑定 `onclick="openLocationPicker()"`，并在确认新地点后同步更新顶部胶囊文案与地图“我在这”悬浮气泡。 |
| **4** | 单选弹窗选中态不同步 | 在个人资料抽屉中切换「实力段位」或「台费分摊规则」后，仅修改了外层展示文字，弹窗内部列表的绿色边框与 `✓` 勾选项仍停留在初始默认项上。 | 重写 `chooseLevel()` 与 `chooseSplit()`，遍历更新 `.level-option-item` 与 `.split-option-item` 的边框、背景、文字高亮及 `✓` 显隐状态。 |
| **5** | 常玩项目可全部取消 | `toggleGameChip()` 允许用户取消勾选全部 6 项球类（变成已选 0 项），违背档案必填约束。 | 增加最小选中数量校验：当仅剩 1 项时拦截取消操作并弹出红色 Toast 提示「至少保留1个常玩项目」。 |
| **6** | 地图球友数量与列表不一致 | 列表模式包含 5 位球友（阿杰、小林、峰哥、陈教练、老周），但地图模式遗漏了「老周」的定位 Pin。 | 在地图视图中补全「老周」的定位气泡（`data-player-id="laozhou"`），实现双视图数据完全同源。 |
| **7** | 地图缺少选中高亮与空白关闭 | 点击地图上的球友 Pin 弹出底部卡片后，Pin 本身无选中反馈，且点击地图空白区域无法收起底部卡片。 | 为当前选中的 Pin 添加 `bounce-pin` 呼吸浮动动效，并在 `#view-map` 绑定空白点击关闭逻辑 `handleMapBackgroundClick()`。 |
| **8** | 隐私开关状态未同步地图 | 切换「地图隐身模式」时未更新 `aria-checked` 属性，且地图上的「我在这」锚点无视觉变化。 | 同步更新 `aria-checked`，开启隐身时降低 `#user-map-pin` 透明度并将气泡文字切换为「已隐身」。 |

### 2.2 `地图选择新位置.html` 问题清单与修复方案

| 编号 | 问题类型 | 问题描述 | 修复方案 |
| :--- | :--- | :--- | :--- |
| **9** | 重复加载外链样式表 | `<head>` 中第 8 行与第 12 行重复引入了两次完全相同的 `Material Symbols Outlined` 字体链接。 | 去重并清理冗余 `<link>` 引用。 |
| **10** | 字体图标在弱网/微信端退化风险 | 依赖 Google Fonts 图标连字（如 `arrow_back`、`location_on`），一旦网络受限，界面上会直接暴露英文单词而非图标。 | 全部替换为轻量化内联矢量 `<svg>` 图标，确保离线与微信 WebView 环境下 100% 稳定渲染。 |
| **11** | 页面完全静态无交互 | 返回按钮、搜索输入框、清空按钮、右下角定位/缩放按钮、POI 列表点选及底部「确认选择此地点」按钮均无 JS 逻辑。 | 完整实现关键词实时检索（`filterPoiList`）、POI 列表单选联动地图中心气泡与画布平移（`selectPoiItem`）、地图缩放（`zoomPickerMap`）与当前位置复位（`resetPickerToCurrentLocation`）。 |
| **12** | 独立页面缺少与主页的数据闭环 | 原文件为孤立页面，无法将选中的地点回传给主页面。 | 合并为全屏滑入抽屉 `#location-picker-view`（`z-[65]`），点击「确认选择此地点」后自动回写主页面左上角位置名称并关闭当前遮罩层。 |

---

## 3. 合并后单文件交互架构与层级规范

合并后的 `index.html` 采用单一移动端容器（最大宽度 `420px`），所有视图与弹窗通过严格的 `z-index` 层级管理，避免遮挡冲突：

```text
[z-10 ~ z-20]  主视图层：地图模式 (#view-map) / 列表模式 (#view-list) / 定位提示条 (#location-banner)
[z-30]         主页面顶栏 Header（左上角位置选择按钮 + 标题 + 胶囊） & 地图底部球友卡片 (#map-bottom-card)
[z-60]         个人资料全屏抽屉 (#profile-drawer)
[z-65]         地图选择新位置全屏抽屉 (#location-picker-view)  <-- 由主页面左上角位置按钮触发
[z-70]         实力段位 ActionSheet (#level-modal-backdrop) & 台费分摊规则 ActionSheet (#split-modal-backdrop)
[z-80]         打招呼短语选择 ActionSheet (#phrase-modal-backdrop) & 微信手机号授权弹窗 (#phone-auth-backdrop)
[z-85]         男女专属卡通头像选择 ActionSheet (#avatar-modal-backdrop)
[z-100]        全局悬浮 Toast 提示气泡 (#global-toast)
```

---

## 4. 统一视觉设计规范（Design Tokens）

整合 `DESIGN.md` 与 `选择新位置.md` 中的 **CueMatch Velocity** 规范，在后续转译为微信小程序 `app.wxss` 时保持以下核心 Token：

### 4.1 色彩体系
- **品牌主绿（Primary Container / WeChat Accent）**：`#10B981` / `#07C160`（主操作按钮、在线状态指示点、选中勾选徽章）
- **墨绿深色（Primary Forest / Hover）**：`#006C49` / `#059669`（品牌深墨绿徽章、按钮按压态、当前定位图标）
- **浅薄荷绿底色（Mint Wash）**：`#ECFDF5` / `#E8F8F0`（选中标签填充、状态横幅背景）
- **中性文字与表面**：
  - 页面画布底色：`#F8FAFC` / `#FAF8FF`
  - 卡片纯白表面：`#FFFFFF`
  - 主标题文字：`#131B2E` / `#0F172A`
  - 次级正文文字：`#3C4A42` / `#334155`
  - 辅助说明文字：`#6C7A71` / `#64748B`
  - 分割线与描边：`#E2E8F0`

### 4.2 圆角与触控尺寸
- **卡片与抽屉顶部圆角**：`16px ~ 24px`（小程序对应 `32rpx ~ 48rpx`）
- **控件与按钮圆角**：`12px`（`24rpx`），胶囊标签与切换栏 `9999px`
- **主确认按钮高度**：`50px`（`100rpx`），底部操作栏需兼容 iOS 底部安全区 `env(safe-area-inset-bottom)`

---

## 5. 微信小程序原生改造对照指南

在 macOS 下通过 **VS Code + CodeBuddy** 将本合并原型转译为微信小程序原生页面（`pages/index/index`、`pages/location-picker/index`、`pages/profile/index`）时，遵循以下映射规则：

| 原型功能模块 | HTML 原型实现 | 微信小程序原生替换方案 |
| :--- | :--- | :--- |
| **首页附近球友地图** | SVG 矢量底图 + 绝对定位球友头像 Pin | 使用原生 `<map longitude="{{lng}}" latitude="{{lat}}" markers="{{markers}}" show-location bindmarkertap="onMarkerTap">`（坐标系必须设为 `gcj02`）。 |
| **选择新位置页** | `#location-picker-view` 地图 + 搜索 + POI 列表 | 可直接调用微信内置 `wx.chooseLocation()`，或使用 `<map bindregionchange="onRegionChange">` 配合腾讯位置服务周边 POI 搜索接口实现定制版选点页。 |
| **发起打招呼** | 点击选择 4 条预设约局短语并更新状态 | 在按钮 `bindtap` 同步阶段调用 `wx.requestSubscribeMessage()` 订阅约球通知模板，再通过 `utils/request.js` 提交邀约记录。 |
| **登录与默认头像** | 手机号授权半屏 + 男女卡通头像选择 | 使用 `<button open-type="getPhoneNumber" bindgetphonenumber="onGetPhoneNumber">` 获取动态令牌 `code`，结合本地固定男女卡通头像与三类球风预设昵称完成冷启动。 |
| **接口环境切换** | 内存 Mock 数据 (`playersData` / `poiListData`) | 在 `config/env.js` 中隔离 `dev`（服务器 IP 端口）与 `prod`（`https://billiards.mysportsbook.cn/api`），域名认证完成后一键切换上线。 |