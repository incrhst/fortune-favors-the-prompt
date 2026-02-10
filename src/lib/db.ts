import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

const sql = DATABASE_URL
  ? neon(DATABASE_URL)
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

export interface User {
  github_id: number;
  username: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  last_login: string;
  total_prompts: number;
  public_prompts: number;
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

export async function upsertUser(data: {
  github_id: number;
  username: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}): Promise<User> {
  const rows = await sql`
    INSERT INTO users (github_id, username, name, email, avatar_url, last_login)
    VALUES (${data.github_id}, ${data.username}, ${data.name || null}, ${data.email || null}, ${data.avatar_url || null}, NOW())
    ON CONFLICT (github_id) DO UPDATE SET
      username = EXCLUDED.username,
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      avatar_url = EXCLUDED.avatar_url,
      last_login = NOW()
    RETURNING *
  `;
  return (rows as any[])[0] as User;
}

export interface CuratedPrompt {
  id: string;
  gist_id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[];
  author_username: string;
  author_avatar_url: string | null;
  quality_score: number;
  created_at: string;
  is_featured: boolean;
  is_verified: boolean;
}

export async function getCuratedPrompts(options: {
  category?: string;
  limit?: number;
  offset?: number;
  featuredOnly?: boolean;
} = {}): Promise<CuratedPrompt[]> {
  const { category, limit = 20, offset = 0, featuredOnly = false } = options;

  let whereClause = 'WHERE is_hidden = false';
  const params: any[] = [];

  if (category) {
    whereClause += ` AND category = $${params.length + 1}`;
    params.push(category);
  }

  if (featuredOnly) {
    whereClause += ` AND is_featured = true`;
  }

  // Tagged templates return rows directly, but raw query returns result object
  const rows = await sql.query(
    `SELECT * FROM curated_prompts 
     ${whereClause} 
     ORDER BY quality_score DESC, created_at DESC 
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  return (rows as any).rows as CuratedPrompt[];
}

export async function getCuratedPromptByGistId(gistId: string): Promise<CuratedPrompt | null> {
  const rows = await sql`SELECT * FROM curated_prompts WHERE gist_id = ${gistId}`;
  return (rows as any)[0] || null;
}

export async function nominatePrompt(data: {
  gist_id: string;
  title: string;
  nominated_by: string;
}): Promise<void> {
  await sql`
    INSERT INTO curation_queue (gist_id, title, nominated_by)
    VALUES (${data.gist_id}, ${data.title}, ${data.nominated_by})
    ON CONFLICT (gist_id) DO UPDATE SET
      votes = curation_queue.votes + 1
  `;
}
