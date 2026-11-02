# 写信弹窗

主题默认通过邮件客户端联系作者。写信弹窗是可选界面，开启前需要自行实现兼容的后端，纯静态托管无法直接发信。

```toml
[params.contact]
email = 'hello@example.org'

[params.letter]
enable = true
endpoint = '/api/letter'
challenge_endpoint = '/api/letter-challenge'
image = 'images/mkm-letter.png'
```

`image` 可替换为自己的站内图片或完整网址，设为空字符串可隐藏插画。收件人标题使用 `params.author`，没有作者时使用站点标题。配置中的 email 只用于界面展示，不会让静态页面自动具备发信能力。

前端请求与响应约定以 [assets/js/letter.js](../assets/js/letter.js) 为准：

- 校验接口：接收 GET 请求，返回 `{ "a": 3, "b": 4, "id": "提交编号", "token": "签名凭证", "expiresIn": 300 }`；`expiresIn` 单位为秒，编号与签名由服务端生成。前端显示加法题，并在寄出前等待至少 1.5 秒。
- 寄信接口：接收 POST JSON，字段为 `message`、`contact`、`website`、`requestId`、`challengeToken`、`challengeAnswer`；成功返回 `{ "ok": true }`，失败返回非 2xx 状态和 `{ "error": "说明" }`，可附 `refreshChallenge: true` 要求重做校验。
- 接口错误也返回 JSON，前端保留未寄出的内容，不自动重试。

生产服务应在服务端验证同源、大小、校验凭证和提交编号，并实现持久化限额与去重。SMTP 凭据只留在后端环境中。本主题不打包原博客的邮件账号、Cloudflare Functions 或服务器策略。
