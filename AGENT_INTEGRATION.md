# Favored Prompts Agent Integration Guide

This guide describes how automated agents (like Cursor, Antigravity, or custom scripts) can interact with the Favored Prompts platform to manage prompt libraries.

## Authentication

Agents should authenticate using the `X-API-Key` header.

### How to get an API Key
1. Log in to the Favored Prompts web app.
2. Click on your profile/username in the top right.
3. Select **Agent Settings**.
4. Click **Copy Key**.

> [!NOTE]
> The API key is currently an encrypted session string that contains your GitHub access token. Keep it secret!

## API Endpoints

### 1. Library Management

#### GET `/api/library/index`
Retrieves the user's current library index.

**Request:**
```bash
curl -H "X-API-Key: YOUR_API_KEY" https://favored-prompts.com/api/library/index
```

#### POST `/api/library/prompt`
Creates a new prompt in the user's library and creates a corresponding GitHub Gist.

**Request Body:**
```json
{
  "title": "My New Prompt",
  "content": "# Prompt Title\n\nPrompt content here...",
  "category": "CODE_REVIEW",
  "tags": ["optimization", "performance"],
  "isPublic": false
}
```

### 2. Community Access

#### POST `/api/community/search`
Searches the community library.

**Request Body:**
```json
{
  "query": "refactor react component",
  "filters": {
    "category": "FRONTEND"
  }
}
```

---

## Gist Schema (Data Model)

Every prompt is stored as a GitHub Gist with two files:

1. `prompt.md`: The raw prompt content in Markdown format.
2. `metadata.json`: Metadata including category, tags, and timestamps.

### `metadata.json` Format
```json
{
  "category": "STRING",
  "tags": ["ARRAY", "OF", "STRINGS"],
  "created": "ISO_TIMESTAMP",
  "updated": "ISO_TIMESTAMP"
}
```

## Creating GitHub Gists Manually
If you want to share a prompt to Favored Prompts without using the API, you can create a Gist with the `favored-prompts` description and include the `prompt.md` and `metadata.json` files. The platform will pick it up on the next sync.
