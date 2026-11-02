# 联系方式品牌图标

图标均保存在 `layouts/partials/icon/`，构建时内嵌到 HTML，不会向外部图标服务发送请求。SVG 使用固定品牌颜色，夜间模式仍保留原色。品牌标识的商标权归各平台所有。

- 小红书、知乎、bilibili、微信、Substack、Medium、V2EX：[Simple Icons](https://github.com/simple-icons/simple-icons)，[CC0-1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md)。原始路径来自 `icons/<平台>.svg`；补充品牌颜色，小红书增加红色底板，知乎和微信增加白色底板。
- 抖音：[SuperTinyIcons / TikTok](https://github.com/edent/SuperTinyIcons/blob/master/images/svg/tiktok.svg)，[CC0-1.0](https://github.com/edent/SuperTinyIcons/blob/master/LICENSE)。展开复用路径，避免桌面和手机同时渲染时 SVG ID 重复。
- 少数派：[少数派官网](https://sspai.com/) 页头内嵌的手机版 SVG；保留圆形「派」标识路径，去掉横版文字，使用品牌红和白色。
- GitHub、YouTube、X、Ghost、邮件：沿用项目已有 SVG。

本次新增或替换的 SVG 获取于 2026-10-29。后续增加平台时，在 `data/contact.yml` 注册 `key` 和 `label`，增加同名 SVG，再在 `[params.contact]` 填写网址或名片字段即可。
