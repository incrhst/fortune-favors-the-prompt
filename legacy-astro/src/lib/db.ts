import { neon } from '@neondatabase/serverless';

const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

const sql = connectionString
  ? neon(connectionString)
  : (async () => { throw new Error('DATABASE_URL environment variable is not set. Please configure it in your Vercel project settings.'); }) as unknown as ReturnType<typeof neon>;

export { sql };

// Types
export interface Prompt {
  id: string;
  text: string;
  suggested_title: string | null;
  category: string | null;
  tags: string[] | null;
  guest_name: string;
  guest_email: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Discussion {
  id: string;
  prompt_id: string;
  author: string;
  text: string;
  created_at: string;
}

// Query helpers
export async function getApprovedPrompts(): Promise<Prompt[]> {
  const rows = await sql`
    SELECT * FROM prompts 
    WHERE status = 'approved' 
    ORDER BY created_at DESC
  `;
  return rows as Prompt[];
}

export async function getPromptById(id: string): Promise<Prompt | null> {
  const rows = await sql`
    SELECT * FROM prompts WHERE id = ${id}
  `;
  return (rows as any[])[0] as Prompt || null;
}

export async function getDiscussionsByPromptId(promptId: string): Promise<Discussion[]> {
  const rows = await sql`
    SELECT * FROM discussions 
    WHERE prompt_id = ${promptId}
    ORDER BY created_at ASC
  `;
  return rows as Discussion[];
}

export async function createPrompt(data: {
  text: string;
  suggested_title?: string;
  category?: string;
  tags?: string[];
  guest_name: string;
  guest_email?: string;
}): Promise<Prompt> {
  const rows = await sql`
    INSERT INTO prompts (text, suggested_title, category, tags, guest_name, guest_email, status)
    VALUES (${data.text}, ${data.suggested_title || null}, ${data.category || null}, ${data.tags || []}, ${data.guest_name}, ${data.guest_email || null}, 'pending')
    RETURNING *
  `;
  return (rows as any[])[0] as Prompt;
}

export async function addDiscussion(data: {
  prompt_id: string;
  author: string;
  text: string;
}): Promise<Discussion> {
  const rows = await sql`
    INSERT INTO discussions (prompt_id, author, text)
    VALUES (${data.prompt_id}, ${data.author}, ${data.text})
    RETURNING *
  `;
  return (rows as any[])[0] as Discussion;
}
