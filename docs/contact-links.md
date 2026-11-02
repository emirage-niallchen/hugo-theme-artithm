# 侧栏联系方式

编辑 `hugo.toml` 的 `[params.contact]` 即可。它们出现在作者卡片「写信给我」下方，桌面侧栏和手机菜单共用。保存后重新构建/部署即可生效。

## 填网址，直接跳转

把空字符串改成自己的完整主页地址：

```toml
[params.contact]
github = 'https://github.com/yourname'
xiaohongshu = ''
douyin = ''
zhihu = ''
bilibili = ''
wechat = { account = '', qrcode = '', note = '' }
youtube = ''
x = ''
sspai = ''
substack = ''
medium = ''
v2ex = ''
ghost = ''
```

空白的平台不显示图标，也不留下空位。请修改已有配置，不要重复添加 `[params.contact]`。

## 填账号或二维码，点击弹出

把该平台的值换成内联表。所有平台都支持以下字段，按需填写：

```toml
wechat = { account = '你的公众号名称或微信号', qrcode = '/images/contact/wechat.png', note = '在微信中搜索，或扫码关注' }
```

- `account`：显示的账号或名称，可一键复制。
- `qrcode`：二维码图片路径，也支持完整 HTTPS 图片地址。
- `note`：补充说明。
- `url`：可选，弹窗中增加「前往主页」链接。

例如只有账号时也可以显示；只有网址时仍直接跳转：

```toml
xiaohongshu = { account = '你的小红书号', url = 'https://www.xiaohongshu.com/user/profile/你的ID' }
wechat = { account = '你的公众号名称' }
```

二维码文件放进 `static/images/contact/`，配置中的路径从 `/images/contact/` 开始，不含 `static`。请上传平台生成的真实二维码；项目没有预填二维码。

只填 `url` 会直接跳转；填了 `account`、`qrcode`、`note` 中任意一项就会弹出名片。清空所有字段即可隐藏。弹窗支持关闭按钮、Esc 和点击遮罩关闭，关闭后焦点回到原图标。

## 图标与排序

在 `data/contact.yml` 移动条目即可排序。各平台使用本地 SVG 和品牌原色，不依赖第三方图标接口。GitHub、X、Medium 等原本是黑白品牌，保留原色。

图标来源和授权见 `docs/contact-icons.md`。已有 Ghost 入口继续保留，可填地址启用。
