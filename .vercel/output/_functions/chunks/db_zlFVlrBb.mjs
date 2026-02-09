import { neon } from '@neondatabase/serverless';

const connectionString = "postgresql://neondb_owner:npg_q0ITkw7iGunU@ep-gentle-king-af7m37m3-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";
const sql = neon(connectionString) ;
async function getApprovedPrompts() {
  const rows = await sql`
    SELECT * FROM prompts 
    WHERE status = 'approved' 
    ORDER BY created_at DESC
  `;
  return rows;
}
async function getPromptById(id) {
  const rows = await sql`
    SELECT * FROM prompts WHERE id = ${id}
  `;
  return rows[0] || null;
}
async function getDiscussionsByPromptId(promptId) {
  const rows = await sql`
    SELECT * FROM discussions 
    WHERE prompt_id = ${promptId}
    ORDER BY created_at ASC
  `;
  return rows;
}
async function createPrompt(data) {
  const rows = await sql`
    INSERT INTO prompts (text, suggested_title, category, tags, guest_name, guest_email, status)
    VALUES (${data.text}, ${data.suggested_title || null}, ${data.category || null}, ${data.tags || []}, ${data.guest_name}, ${data.guest_email || null}, 'pending')
    RETURNING *
  `;
  return rows[0];
}
async function addDiscussion(data) {
  const rows = await sql`
    INSERT INTO discussions (prompt_id, author, text)
    VALUES (${data.prompt_id}, ${data.author}, ${data.text})
    RETURNING *
  `;
  return rows[0];
}

export { addDiscussion, createPrompt, getApprovedPrompts, getDiscussionsByPromptId, getPromptById, sql };
