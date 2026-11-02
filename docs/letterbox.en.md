# Letter dialog

[简体中文](letterbox.md) · English

By default, the theme opens the visitor's mail app to contact the author. The letter dialog is optional and needs a compatible backend of your own. A static host alone cannot send mail.

```toml
[params.contact]
email = 'hello@example.org'

[params.letter]
enable = true
endpoint = '/api/letter'
challenge_endpoint = '/api/letter-challenge'
image = 'images/mkm-letter.png'
```

Set `image` to a site image path or a full URL, or use an empty string to hide the illustration. The recipient heading uses `params.author`, falling back to the site title. The configured email address is used for display; it does not give a static page the ability to send mail.

The request and response format is defined by [assets/js/letter.js](../assets/js/letter.js):

- Challenge endpoint: Accepts GET and returns `{ "a": 3, "b": 4, "id": "request-id", "token": "signed-token", "expiresIn": 300 }`. `expiresIn` is in seconds. The server generates the ID and signed token. The interface shows an addition question and waits at least 1.5 seconds before allowing submission.
- Send endpoint: Accepts POST JSON with `message`, `contact`, `website`, `requestId`, `challengeToken`, and `challengeAnswer`. Return `{ "ok": true }` on success. On failure, return a non-2xx status and `{ "error": "Error message" }`. Include `refreshChallenge: true` to request a new challenge.
- Errors must also return JSON. The interface keeps the unsent message and does not retry automatically.

In production, validate the origin, payload size, challenge token, and request ID on the server. Use persistent rate limits and duplicate detection. Keep SMTP credentials in the backend environment. This theme does not include the blog's mail accounts, Cloudflare Functions, or server policies.
