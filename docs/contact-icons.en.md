# Contact brand icons

[简体中文](contact-icons.md) · English

Icons are stored in `layouts/partials/icon/` and embedded in the HTML during the build. They do not make requests to an external icon service. The SVGs keep their brand colors in dark mode. Trademarks belong to their respective owners.

- Xiaohongshu, Zhihu, bilibili, WeChat, Substack, Medium, and V2EX: [Simple Icons](https://github.com/simple-icons/simple-icons), [CC0-1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md). Paths come from `icons/<platform>.svg`, with brand colors added. Xiaohongshu has a red background; Zhihu and WeChat have white backgrounds.
- Douyin: [SuperTinyIcons / TikTok](https://github.com/edent/SuperTinyIcons/blob/master/images/svg/tiktok.svg), [CC0-1.0](https://github.com/edent/SuperTinyIcons/blob/master/LICENSE). Reused paths are expanded to avoid duplicate SVG IDs when desktop and mobile layouts are rendered together.
- Sspai: The SVG from the mobile header of the [Sspai website](https://sspai.com/). It keeps the circular emblem in brand red and white, with the wordmark removed.
- GitHub, YouTube, X, Ghost, and email: Existing SVGs from the project.

The added or replaced SVGs were retrieved on 2026-10-29. To add another platform, register its `key` and `label` in `data/contact.yml`, add an SVG partial with the same key, and fill in its URL or contact card fields under `[params.contact]`.
