const crypto = require('crypto');
const { THEME_SCRIPT } = require('./themeScript');

// The theme script has to run before first paint, which means inline. Rather
// than weakening the policy with 'unsafe-inline', allow exactly this one script
// by hash — derived from the same constant the document renders, so the two can
// never drift apart. src/__tests__/themeScript.test.ts guards that pairing.
const themeScriptHash = `'sha256-${crypto.createHash('sha256').update(THEME_SCRIPT).digest('base64')}'`;

// Everything is self-hosted (fonts via next/font, images/icons from /public,
// inline styles required by framer-motion/styled-jsx). Applied in production
// only — the dev server needs eval and websockets for HMR/react-refresh.
const contentSecurityPolicy = [
    `script-src 'self' ${themeScriptHash}`,
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // The site never calls a third party from the browser. The one outbound
    // call to the Anthropic API happens server-side in /api/ask, which CSP
    // does not govern.
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
].join('; ');

module.exports = { contentSecurityPolicy, themeScriptHash };
