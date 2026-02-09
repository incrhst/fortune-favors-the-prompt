import { e as createComponent, k as renderHead, r as renderTemplate } from '../chunks/astro/server_d30vpj_X.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Debug = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Debug Page</title>${renderHead()}</head> <body style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto;"> <h1>Debug Page Works!</h1> <p>If you can see this, the latest deployment is live.</p> <p>Time: ${(/* @__PURE__ */ new Date()).toISOString()}</p> </body></html>`;
}, "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/debug.astro", void 0);

const $$file = "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/debug.astro";
const $$url = "/debug";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Debug,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
