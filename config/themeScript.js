// Runs before first paint, doing two things that must happen before the browser
// draws anything:
//
//   1. Resolve the stored theme onto <html>, so a visitor who chose light never
//      sees a dark frame first (and vice versa).
//   2. Mark that JavaScript is running. Scroll-reveal starts hidden and is
//      revealed by script, so without this marker a visitor with JavaScript off
//      would be left staring at a page of invisible sections.
//
// CommonJS on purpose: next.config.js requires this same string to derive the
// Content-Security-Policy hash that allows it. Sharing one source is what keeps
// the policy from silently drifting out of step with the script it permits —
// see the guard in src/__tests__/themeScript.test.ts.
//
// Kept deliberately tiny and total: any failure (disabled storage, a private
// window, a hostile extension) falls through to the dark default in globals.css
// rather than throwing before the page renders.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var l=t==='light'||(t!=='dark'&&window.matchMedia('(prefers-color-scheme: light)').matches);var c=document.documentElement.classList;c.toggle('light',l);c.toggle('dark',!l);}catch(e){}try{document.documentElement.classList.add('js');}catch(e){}})();`;

module.exports = { THEME_SCRIPT };
