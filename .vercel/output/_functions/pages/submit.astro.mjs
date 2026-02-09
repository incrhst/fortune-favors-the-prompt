import { e as createComponent, k as renderHead, r as renderTemplate, l as renderScript, h as createAstro } from '../chunks/astro/server_d30vpj_X.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Submit = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Submit;
  let submitted = false;
  let error = "";
  if (Astro2.request.method === "POST") {
    try {
      const formData = await Astro2.request.formData();
      const text = formData.get("text");
      const guestName = formData.get("guest_name");
      const guestEmail = formData.get("guest_email");
      const suggestedTitle = formData.get("suggested_title");
      const category = formData.get("category");
      const tagsRaw = formData.get("tags");
      const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
      if (!text || !guestName) {
        error = "Please fill in all required fields.";
      } else {
        const { createPrompt } = await import('../chunks/db_Bscd1bOd.mjs');
        await createPrompt({
          text,
          guest_name: guestName,
          guest_email: guestEmail || void 0,
          suggested_title: suggestedTitle || void 0,
          category: category || void 0,
          tags: tags.length > 0 ? tags : void 0
        });
        submitted = true;
      }
    } catch (e) {
      console.error("Submission error:", e);
      error = "Failed to submit prompt. Please try again.";
    }
  }
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Submit your prompt for discussion on the show."><title>Submit a Prompt | Prompt Library</title>${renderHead()}</head> <body> <div class="container"> <header> <h1>Submit a Prompt</h1> <p>Share your favorite prompts for discussion on the show</p> <nav> <a href="/">Library</a> <a href="/submit" class="active">Submit a Prompt</a> </nav> </header> ${submitted && renderTemplate`<div class="success-message animate-in"> <h3>🎉 Prompt Submitted!</h3> <p>Thank you for your submission. It will be reviewed and added to the library soon.</p> <a href="/" style="color: white; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">
← Back to Library
</a> </div>`} ${!submitted && renderTemplate`<div class="card animate-in" style="max-width: 700px;"> ${error && renderTemplate`<div style="background: #fef2f2; border: 1px solid #fee2e2; color: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;"> ${error} </div>`} <form method="POST" id="submit-form"> <div class="form-group"> <label for="text">Your Prompt *</label> <textarea id="text" name="text" placeholder="Paste your prompt here... We'll suggest a title and categorize it for you!" required></textarea> </div> <!-- AI Suggestions Section --> <div class="ai-suggestion" id="ai-suggestions" style="display: none;"> <h3> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <path d="M12 2L2 7l10 5 10-5-10-5z"></path> <path d="M2 17l10 5 10-5"></path> <path d="M2 12l10 5 10-5"></path> </svg>
AI Suggestions
</h3> <div id="loading-suggestions" class="loading"> <div class="spinner"></div> <span>Analyzing your prompt...</span> </div> <div id="suggestions-content" style="display: none;"> <div class="form-group"> <label for="suggested_title">Suggested Title</label> <input type="text" id="suggested_title" name="suggested_title"> </div> <div class="form-group"> <label for="category">Category</label> <input type="text" id="category" name="category"> </div> <div class="form-group"> <label for="tags">Tags (comma-separated)</label> <input type="text" id="tags" name="tags" placeholder="e.g., performance, react, debugging"> </div> </div> </div> <div class="form-group"> <label for="guest_name">Your Name *</label> <input type="text" id="guest_name" name="guest_name" placeholder="How should we credit you?" required> </div> <div class="form-group"> <label for="guest_email">Email (optional)</label> <input type="email" id="guest_email" name="guest_email" placeholder="We'll notify you when your prompt is approved"> </div> <button type="submit" class="btn btn-primary" style="width: 100%;">
Submit Prompt
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"> <polyline points="9,18 15,12 9,6"></polyline> </svg> </button> </form> </div>`} </div> ${renderScript($$result, "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/submit.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/submit.astro", void 0);

const $$file = "/Users/davidbain/difiledem/Downloads/code/prompt/src/pages/submit.astro";
const $$url = "/submit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Submit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
