import { e as createComponent, k as renderHead, n as renderComponent, r as renderTemplate, g as addAttribute, l as renderScript } from '../chunks/astro/server_CxrRaeHu.mjs';
import 'piccolore';
/* empty css                                 */
import { getApprovedPrompts } from '../chunks/db_zlFVlrBb.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import 'react';
import { useStore } from '@nanostores/react';
import { atom } from 'nanostores';
import { Library, FolderHeart } from 'lucide-react';
export { renderers } from '../renderers.mjs';

const activeTab = atom("community");

function LibraryTabs() {
  const $activeTab = useStore(activeTab);
  const tabStyle = (tab) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    cursor: "pointer",
    borderRadius: "12px",
    fontWeight: 600,
    background: $activeTab === tab ? "var(--brown-accent, #8b5c2e)" : "transparent",
    color: $activeTab === tab ? "white" : "var(--brown-medium, #6b5444)",
    border: "none",
    transition: "all 0.2s ease"
  });
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", marginBottom: "2rem", padding: "0.5rem", background: "#f5f1e8", borderRadius: "16px", width: "fit-content" }, children: [
    /* @__PURE__ */ jsxs("button", { onClick: () => activeTab.set("community"), style: tabStyle("community"), children: [
      /* @__PURE__ */ jsx(Library, { size: 18 }),
      "Community"
    ] }),
    /* @__PURE__ */ jsxs("button", { onClick: () => activeTab.set("local"), style: tabStyle("local"), children: [
      /* @__PURE__ */ jsx(FolderHeart, { size: 18 }),
      "My Library"
    ] })
  ] });
}

function LocalViewWrapper({ children }) {
  const $activeTab = useStore(activeTab);
  if ($activeTab !== "local") return null;
  return /* @__PURE__ */ jsx(Fragment, { children });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let prompts = [];
  let error = "";
  try {
    prompts = await getApprovedPrompts();
  } catch (e) {
    error = "Failed to load prompts. Please try again later.";
    console.error(e);
  }
  function formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 6e4);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    return "Just now";
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/png" href="/favicon.png"><meta name="description" content="A curated library of AI prompts submitted by show guests for discussion and inspiration."><title>Prompt Library | Guest Submissions</title>${renderHead()}</head> <body> <div class="container"> <header> <h1>Prompt Library</h1> <p>Your collection of prompts, ready to revisit and refine</p> <nav> <a href="/" class="active">Library</a> <a href="/submit">Submit a Prompt</a> </nav> </header> ${renderComponent($$result, "LibraryTabs", LibraryTabs, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/davidbain/difiledem/Downloads/code/prompt/src/components/LibraryTabs", "client:component-export": "default" })} <div id="community-view"> <!-- Search --> <div class="search-container"> <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <circle cx="11" cy="11" r="8"></circle> <path d="m21 21-4.35-4.35"></path> </svg> <input type="text" id="search" placeholder="Search prompts, categories, or tags..."> </div> ${error && renderTemplate`<div class="card" style="text-align: center; color: #ef4444;"> ${error} </div>`} ${prompts.length === 0 && !error && renderTemplate`<div class="card" style="text-align: center;"> <h3>No prompts yet!</h3> <p style="margin: 1rem 0; color: var(--brown-medium);">
Be the first to <a href="/submit" style="color: var(--brown-accent);">submit a prompt</a> for discussion.
</p> </div>`} <!-- Prompts Grid --> <div class="prompt-grid" id="prompts-grid"> ${prompts.map((prompt, index) => renderTemplate`<a${addAttribute(`/prompt/${prompt.id}`, "href")} class="card animate-in prompt-card"${addAttribute(`animation-delay: ${index * 0.1}s; text-decoration: none; color: inherit; cursor: pointer;`, "style")}${addAttribute(prompt.text.toLowerCase(), "data-text")}${addAttribute(prompt.category?.toLowerCase() || "", "data-category")}${addAttribute(prompt.tags?.join(" ").toLowerCase() || "", "data-tags")}> ${prompt.category && renderTemplate`<span class="badge" style="margin-bottom: 1rem;"> ${prompt.category} </span>`} <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; line-height: 1.4;"> ${prompt.suggested_title || prompt.text.slice(0, 60) + "..."} </h3> <p style="color: var(--brown-medium); font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;"> ${prompt.text} </p> ${prompt.tags && prompt.tags.length > 0 && renderTemplate`<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;"> ${prompt.tags.slice(0, 3).map((tag) => renderTemplate`<span class="tag">#${tag}</span>`)} </div>`} <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-light);"> <span class="meta"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <circle cx="12" cy="12" r="10"></circle> <polyline points="12,6 12,12 16,14"></polyline> </svg> ${formatTimeAgo(prompt.created_at)} </span> <span class="meta" style="color: var(--brown-accent);">
by ${prompt.guest_name} </span> </div> </a>`)} </div> </div> ${renderComponent($$result, "LocalViewWrapper", LocalViewWrapper, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/davidbain/difiledem/Downloads/code/prompt/src/components/LocalViewWrapper", "client:component-export": "default" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "LocalLibrary", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/Users/davidbain/difiledem/Downloads/code/prompt/src/components/local/LocalLibrary", "client:component-export": "default" })} ` })} </div> ${renderScript($$result, "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/index.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/index.astro", void 0);

const $$file = "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
