# ECNU-AutoLogin

一个用于华东师范大学统一认证页面的一键自动填充并自动登录的浏览器扩展。
主要文件为 `content.js`  与 `manifest.json` 。

---

## 功能简介

* 自动等待登录页渲染并填充账号密码（兼容 Angular/React 框架渲染与双向绑定）。
* 自动点击登录按钮触发登录流程。
* 仅注入到 ECNU SSO 登录页：`https://sso.ecnu.edu.cn/login*`。

---

## 先决条件

* Chromium 系列浏览器（Chrome / Edge / Brave 等） 支持 Manifest V3。
* 你需要有 ECNU 的账号（学号/工号）和密码。

---

## 快速安装（开发者模式加载）

1. 将仓库 / 文件放到一个文件夹（例如 `ecnu-autologin/`）。
2. 在浏览器地址栏打开 `chrome://extensions/`（或 Edge 的扩展页面），开启 **开发者模式**。
3. 点击 **加载已解压的扩展程序**（Load unpacked），选择你放置 `manifest.json` 与 `content.js` 的文件夹并加载。
4. 访问 `https://sso.ecnu.edu.cn/login` 测试自动登录是否生效。

---

## 配置方法（修改账号/选择器）

在 `content.js` 顶部有一个配置区（请用你自己的凭据替换占位符）：

```js
// ================= 配置区 =================
const CREDENTIALS = {
    username: "your_student_id_here", // 替换为你的学号/账号
    password: "your_password_here"    // 替换为你的密码
};
// =========================================
```

脚本中同时定义了选择器映射（用于定位账号框 / 密码框 / 登录按钮）：

```js
const SELECTORS = {
    username: "#nameInput",
    password: "input[type='password']",
    button: "#submitBtn"
};
```

详情逻辑在 `content.js` 中实现：`waitForElement`（等待元素动态渲染）、`simulateInput`（兼容框架的输入模拟）、`runAutoLogin`（主逻辑）。

---

## 工作原理

* 加载时通过 `content_scripts` 注入到匹配页面。
* `waitForElement` 使用 `MutationObserver` 与超时控制，等待动态渲染的输入框出现（适配 Angular/React）。
* `simulateInput` 会：设置 `element.value`、尝试使用原生 setter，并派发 `input` 与 `change` 事件以触发框架层面的 model 更新。
* 填充后短暂延迟（脚本中为 300ms），再查找并点击登录按钮以提交表单。

---

## 常见问题 & 排查建议

* **为什么没填充？**

  * 检查你是否在 `content.js` 正确替换了 `CREDENTIALS`。
  * 打开浏览器 DevTools，查看 Console 是否有超时或选择器找不到的报错（`Timeout waiting for ...`）。
  * 检查页面 URL 是否精确匹配 `manifest.json` 中的 `matches`（`https://sso.ecnu.edu.cn/login*`）。 

* **如何修改注入时机？**

  * `manifest.json` 中 `content_scripts.run_at` 目前为 `document_idle`，若需要可调整为 `document_end` / `document_start`（需注意页面渲染差异）。

---

## 自定义与扩展想法

* 支持多个账号并在 popup 中选择。
* 使用 `chrome.runtime.sendMessage` / `background service worker` 来管理凭据读取与注入。
* 增加 UI（扩展图标 popup），允许用户启用/禁用自动登录或手动触发。
* 将选择器转为可配置的 JSON 或选项页，便于在页面更新时快速修正。

---

## 开发者备注

* 使用的是 Manifest V3（`manifest_version: 3`）。主权限使用 `scripting` 并声明了主机权限 `https://sso.ecnu.edu.cn/*`。 
* `content.js` 内实现了兼容性处理，针对现代框架的值设置和事件派发做了额外处理。

---