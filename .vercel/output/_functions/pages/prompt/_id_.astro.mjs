import { e as createComponent, g as addAttribute, k as renderHead, r as renderTemplate, h as createAstro } from '../../chunks/astro/server_d30vpj_X.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                    */
import { addDiscussion, getPromptById, getDiscussionsByPromptId } from '../../chunks/db_Bscd1bOd.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  if (!id) {
    return Astro2.redirect("/");
  }
  let prompt = null;
  let discussions = [];
  let commentAdded = false;
  let error = "";
  if (Astro2.request.method === "POST") {
    try {
      const formData = await Astro2.request.formData();
      const author = formData.get("author");
      const text = formData.get("text");
      if (author && text) {
        await addDiscussion({ prompt_id: id, author, text });
        commentAdded = true;
      }
    } catch (e) {
      console.error("Comment error:", e);
      error = "Failed to add comment.";
    }
  }
  try {
    prompt = await getPromptById(id);
    if (prompt) {
      discussions = await getDiscussionsByPromptId(id);
    }
  } catch (e) {
    console.error("Error loading prompt:", e);
  }
  if (!prompt) {
    return Astro2.redirect("/");
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
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(prompt.text.slice(0, 155), "content")}><title>${prompt.suggested_title || "Prompt Detail"} | Prompt Library</title>${renderHead()}</head> <body> <div class="container"> <header> <a href="/" style="color: var(--brown-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <polyline points="15,18 9,12 15,6"></polyline> </svg>
Back to Library
</a> <h1 style="font-size: 2.5rem;"> ${prompt.suggested_title || "Prompt Detail"} </h1> <nav> <a href="/">Library</a> <a href="/submit">Submit a Prompt</a> </nav> </header> <div class="card animate-in" style="max-width: 800px;"> <!-- Category Badge --> ${prompt.category && renderTemplate`<span class="badge" style="margin-bottom: 1.5rem;"> ${prompt.category} </span>`} <!-- Prompt Text --> <div style="background: var(--cream-bg); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--brown-accent); margin-bottom: 1.5rem;"> <p style="font-size: 1.1rem; line-height: 1.7; color: var(--brown-dark);"> ${prompt.text} </p> </div> <!-- Tags --> ${prompt.tags && prompt.tags.length > 0 && renderTemplate`<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;"> ${prompt.tags.map((tag) => renderTemplate`<span class="tag">#${tag}</span>`)} </div>`} <!-- Meta --> <div style="display: flex; gap: 2rem; padding: 1.5rem 0; border-top: 2px solid var(--border-light); border-bottom: 2px solid var(--border-light);"> <span class="meta"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <circle cx="12" cy="12" r="10"></circle> <polyline points="12,6 12,12 16,14"></polyline> </svg> ${formatTimeAgo(prompt.created_at)} </span> <span class="meta" style="color: var(--brown-accent);"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path> <circle cx="12" cy="7" r="4"></circle> </svg>
by ${prompt.guest_name} </span> </div> <!-- Discussion Section --> <div style="margin-top: 2rem;"> <h2 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;"> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path> </svg>
Discussion (${discussions.length})
</h2> ${commentAdded && renderTemplate`<div style="background: #d1fae5; border: 1px solid #a7f3d0; color: #065f46; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
Comment added successfully!
</div>`} ${error && renderTemplate`<div style="background: #fef2f2; border: 1px solid #fee2e2; color: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;"> ${error} </div>`} <!-- Existing Comments --> <div style="margin-bottom: 1.5rem;"> ${discussions.length === 0 && renderTemplate`<p style="color: var(--brown-muted); font-style: italic;">
No comments yet. Start the discussion!
</p>`} ${discussions.map((comment) => renderTemplate`<div class="discussion-item"> <div class="author">${comment.author}</div> <p>${comment.text}</p> <span class="meta" style="margin-top: 0.5rem; display: block;"> ${formatTimeAgo(comment.created_at)} </span> </div>`)} </div> <!-- Add Comment Form --> <div style="background: var(--cream-bg); padding: 1.5rem; border-radius: 16px; border: 2px solid var(--border-medium);"> <form method="POST"> <div class="form-group"> <label for="author">Your Name</label> <input type="text" id="author" name="author" placeholder="How should we credit you?" required> </div> <div class="form-group"> <label for="comment-text">Your Comment</label> <textarea id="comment-text" name="text" placeholder="Add your thoughts or notes about this prompt..." required style="min-height: 100px;"></textarea> </div> <button type="submit" class="btn btn-primary">
Add Comment
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <polyline points="9,18 15,12 9,6"></polyline> </svg> </button> </form> </div> </div> </div> </div> </body></html>`;
}, "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/prompt/[id].astro", void 0);

const $$file = "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/prompt/[id].astro";
const $$url = "/prompt/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
