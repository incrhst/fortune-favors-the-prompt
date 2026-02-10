# PRD: Favored Prompts - GitHub Gists Backend with Curated Community

**Version:** 2.0  
**Last Updated:** February 10, 2026  
**Status:** Ready for Implementation  
**Owner:** Engineering Team

---

## Executive Summary

Transform the prompt library from localStorage-only to a cloud-synced system using GitHub Gists for personal storage and a curated Neon database for community discovery. This hybrid architecture provides unlimited personal storage at zero cost while maintaining fast, searchable community features within Neon's free tier limits.

**Key Benefits:**
- ✅ Zero infrastructure cost for personal libraries
- ✅ Automatic version history for every prompt
- ✅ Cross-device sync via GitHub
- ✅ Curated community discovery
- ✅ True data ownership (user's GitHub account)
- ✅ Stays within Neon free tier (0.5GB) even at 100K+ users

---

## Problem Statement

### Current State
- Personal prompts stored in localStorage (~5-10MB limit)
- No sync across devices/browsers
- Data lost if browser cache cleared
- Community features use Neon database (approaching storage limits)
- No version history or recovery

### Desired State
- Cloud-backed personal libraries with unlimited storage
- Automatic sync across all devices
- Version history for prompt iterations
- Scalable community discovery within free tier
- User owns their data on GitHub

### Success Criteria
- 80%+ of active users connect GitHub
- <2s sync latency for prompt updates
- Community search returns results in <500ms
- Stay under 100MB Neon usage at 10K users
- Zero infrastructure costs

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER DEVICE                          │
│                                                              │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │   SvelteKit  │◄──────────────────►│ localStorage │       │
│  │     App      │                    │   (cache)    │       │
│  └──────┬───────┘                    └──────────────┘       │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ HTTPS
          │
┌─────────▼────────────────────────────────────────────────────┐
│                    VERCEL (Edge Functions)                    │
│                                                               │
│  ┌─────────────────┐           ┌──────────────────┐         │
│  │  Auth Routes    │           │  API Routes      │         │
│  │  /auth/login    │           │  /api/community  │         │
│  │  /auth/callback │           │  /api/curation   │         │
│  └─────────────────┘           └────────┬─────────┘         │
│                                          │                    │
└──────────────────────────────────────────┼────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     │
         ┌──────────────────┐  ┌──────────────────┐           │
         │  GitHub API      │  │  Neon Database   │           │
         │                  │  │                  │           │
         │ Personal Gists:  │  │ Curated Prompts: │           │
         │ - 1 index gist   │  │ - Top 5% only    │           │
         │ - 1 gist/prompt  │  │ - Search index   │           │
         │ - Version hist.  │  │ - Metadata cache │           │
         │                  │  │ - Analytics      │           │
         └──────────────────┘  └──────────────────┘           │
                    │                     │                     │
                    └─────────────────────┴─────────────────────┘
```

### Storage Architecture

**Two-Tier System:**

| Storage Layer | Purpose | Capacity | Cost |
|--------------|---------|----------|------|
| **GitHub Gists** | Personal libraries (source of truth) | Unlimited | $0 |
| **Neon Database** | Curated community index (cache) | 0.5GB free | $0 |
| **localStorage** | Offline cache (fallback) | ~5-10MB | $0 |

---

## Data Models

### GitHub Gists Structure

#### Personal Library Index Gist
```json
{
  "description": "Favored Prompts - Library Index",
  "public": false,
  "files": {
    "index.json": {
      "content": {
        "version": 1,
        "updated": "2026-02-10T12:00:00Z",
        "prompts": [
          {
            "gistId": "abc123...",
            "title": "Code Review - Performance Optimization",
            "category": "CODE_REVIEW",
            "tags": ["optimization", "performance"],
            "created": "2026-01-15T10:30:00Z",
            "updated": "2026-02-10T11:45:00Z",
            "isPublic": false,
            "useCount": 12,
            "lastUsed": "2026-02-09T14:20:00Z"
          }
        ]
      }
    }
  }
}
```

#### Individual Prompt Gist
```json
{
  "description": "Code Review - Performance Optimization",
  "public": false,
  "files": {
    "prompt.md": {
      "content": "# Performance Optimization Review\n\nAnalyze the following code..."
    },
    "metadata.json": {
      "content": {
        "category": "CODE_REVIEW",
        "tags": ["optimization", "performance"],
        "created": "2026-01-15T10:30:00Z",
        "updated": "2026-02-10T11:45:00Z",
        "appVersion": "2.0",
        "useCount": 12,
        "lastUsed": "2026-02-09T14:20:00Z",
        "isPublic": false
      }
    }
  }
}
```

### Neon Database Schema

```sql
-- Users table
CREATE TABLE users (
  github_id BIGINT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200),
  email VARCHAR(200),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW(),
  
  -- Stats
  total_prompts INT DEFAULT 0,
  public_prompts INT DEFAULT 0
);

CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_created ON users(created_at DESC);

-- Curated community prompts (TOP 5% ONLY)
CREATE TABLE curated_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gist_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Cached data for search/display
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Author
  author_username VARCHAR(100) NOT NULL,
  author_avatar_url VARCHAR(500),
  
  -- Quality signals
  github_stars INT DEFAULT 0,
  github_forks INT DEFAULT 0,
  app_views INT DEFAULT 0,
  app_uses INT DEFAULT 0,
  app_forks INT DEFAULT 0,
  quality_score DECIMAL(7,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  indexed_at TIMESTAMP DEFAULT NOW(),
  last_synced TIMESTAMP DEFAULT NOW(),
  
  -- Curation
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  featured_at TIMESTAMP,
  
  FOREIGN KEY (author_username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX idx_quality_score ON curated_prompts(quality_score DESC);
CREATE INDEX idx_category ON curated_prompts(category);
CREATE INDEX idx_tags ON curated_prompts USING GIN(tags);
CREATE INDEX idx_created_at ON curated_prompts(created_at DESC);
CREATE INDEX idx_author ON curated_prompts(author_username);
CREATE INDEX idx_featured ON curated_prompts(is_featured) WHERE is_featured = true;

-- Full-text search
CREATE INDEX idx_search ON curated_prompts 
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Curation queue (nominations for indexing)
CREATE TABLE curation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gist_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200),
  
  nominated_by VARCHAR(100) NOT NULL,
  nominated_at TIMESTAMP DEFAULT NOW(),
  votes INT DEFAULT 1,
  
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(100),
  review_note TEXT,
  
  FOREIGN KEY (nominated_by) REFERENCES users(username)
);

CREATE INDEX idx_queue_status ON curation_queue(status);
CREATE INDEX idx_queue_votes ON curation_queue(votes DESC);

-- Votes on curation queue
CREATE TABLE curation_votes (
  queue_id UUID NOT NULL,
  username VARCHAR(100) NOT NULL,
  voted_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (queue_id, username),
  FOREIGN KEY (queue_id) REFERENCES curation_queue(id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Admin/moderator roles
CREATE TABLE admins (
  github_username VARCHAR(100) PRIMARY KEY,
  role VARCHAR(20) NOT NULL, -- admin, moderator, curator
  
  added_by VARCHAR(100),
  added_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP,
  
  FOREIGN KEY (github_username) REFERENCES users(username) ON DELETE CASCADE
);

-- Analytics (aggregated daily)
CREATE TABLE daily_stats (
  date DATE PRIMARY KEY,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  total_prompts INT DEFAULT 0,
  new_prompts INT DEFAULT 0,
  public_prompts INT DEFAULT 0,
  searches INT DEFAULT 0,
  prompt_views INT DEFAULT 0,
  prompt_forks INT DEFAULT 0
);
```

**Capacity Planning:**
```
Storage Calculation:
- Average curated_prompts row: ~2KB
- Target: Top 5% of prompts
- At 10K users × 50 prompts = 500K total prompts
- Top 5% = 25,000 indexed prompts
- Storage: 25,000 × 2KB = 50MB (10% of 0.5GB limit)

- At 100K users × 50 prompts = 5M total prompts  
- Top 5% = 250,000 indexed prompts
- Storage: 250,000 × 2KB = 500MB (100% of limit)

Conclusion: Can support 100K+ users on free tier
```

---

## Quality Score Algorithm

```typescript
function calculateQualityScore(prompt: {
  github_stars: number;
  github_forks: number;
  app_views: number;
  app_uses: number;
  app_forks: number;
  created_at: Date;
  is_featured: boolean;
  is_verified: boolean;
}): number {
  const recencyBonus = isWithinDays(prompt.created_at, 30) ? 50 : 0;
  const featuredBonus = prompt.is_featured ? 100 : 0;
  const verifiedBonus = prompt.is_verified ? 75 : 0;
  
  return (
    (prompt.github_stars * 10) +
    (prompt.github_forks * 20) +
    (prompt.app_views * 0.5) +
    (prompt.app_uses * 2) +
    (prompt.app_forks * 15) +
    recencyBonus +
    featuredBonus +
    verifiedBonus
  );
}

// Auto-index thresholds
const AUTO_INDEX_THRESHOLD = 100; // Quality score
const AUTO_APPROVE_VOTES = 10;    // Curation votes
```

---

## Authentication & Authorization

### GitHub OAuth Flow

```typescript
// 1. User clicks "Connect GitHub"
// 2. Redirect to GitHub OAuth
const authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams({
  client_id: GITHUB_CLIENT_ID,
  redirect_uri: `${BASE_URL}/auth/callback`,
  scope: 'gist,read:user,user:email',
  state: csrfToken, // CSRF protection
})}`;

// 3. GitHub redirects back with code
// 4. Exchange code for access token
const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  body: JSON.stringify({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
  }),
});

// 5. Get user info
const user = await fetch('https://api.github.com/user', {
  headers: { Authorization: `Bearer ${accessToken}` }
});

// 6. Create encrypted session
const session = await encryptSession({
  userId: user.id,
  username: user.login,
  accessToken,
  isAdmin: await checkIsAdmin(user.login),
});

// 7. Set httpOnly cookie
cookies.set('session', session, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
});
```

### Admin Roles

| Role | Permissions |
|------|-------------|
| **User** | View community, fork prompts, manage personal library |
| **Curator** | + Nominate prompts, vote on curation queue |
| **Moderator** | + Approve/reject nominations, feature prompts, hide inappropriate content |
| **Admin** | + Manage users, access analytics, assign roles |

```typescript
// Check admin access
async function checkIsAdmin(username: string): Promise<boolean> {
  const result = await db.queryOne(`
    SELECT role FROM admins WHERE github_username = $1
  `, [username]);
  
  return !!result;
}

// Check specific permission
async function hasPermission(username: string, permission: string): Promise<boolean> {
  const role = await getRole(username);
  
  const permissions = {
    curator: ['nominate', 'vote'],
    moderator: ['nominate', 'vote', 'curate', 'feature', 'hide'],
    admin: ['nominate', 'vote', 'curate', 'feature', 'hide', 'manage_users', 'analytics'],
  };
  
  return permissions[role]?.includes(permission) || false;
}
```

---

## Core Features & User Flows

### 1. Personal Library Management

#### Create New Prompt
```
1. User writes prompt in editor
2. Clicks "Save to My Library"
3. → App creates new GitHub gist (private)
4. → App updates index gist
5. → App saves to localStorage (cache)
6. → Syncs in background
7. Prompt appears in "My Library" immediately
```

#### Edit Existing Prompt
```
1. User edits prompt content
2. Auto-save debounced (2 seconds)
3. → App updates gist (creates new version)
4. → App updates index gist timestamp
5. → GitHub maintains version history
6. User can view history, restore previous versions
```

#### Sync Strategy
```typescript
interface SyncConfig {
  triggers: {
    onCreate: true,
    onUpdate: true,
    onDelete: true,
    onInterval: 60000, // 1 minute
    onPageFocus: true,
  },
  
  debounce: 2000, // Wait 2s for rapid changes
  retryStrategy: {
    maxRetries: 3,
    backoff: 'exponential', // 1s, 2s, 4s
  },
  
  conflictResolution: 'last-write-wins', // With timestamp comparison
}
```

### 2. Community Discovery

#### Browse Curated Prompts
```
1. User visits "Community" tab
2. → App fetches curated prompts from Neon (fast)
3. → Results show metadata (title, author, stats)
4. User can filter by:
   - Category (CODE_REVIEW, RESEARCH, EDUCATION, etc.)
   - Tags
   - Sort by: Quality Score, Recent, Most Used
5. Pagination (50 per page)
```

#### Search Prompts
```
1. User enters search query
2. → Full-text search on Neon (curated prompts only)
3. → Returns ranked results by relevance
4. User clicks prompt
5. → Fetches live content from GitHub gist
6. → Increments view count
7. Shows prompt with "Fork to My Library" button
```

#### Fork to Personal Library
```
1. User clicks "Fork to My Library"
2. → App forks GitHub gist to user's account
3. → App adds to user's index gist
4. → Increments fork count in Neon
5. Forked prompt appears in "My Library"
```

### 3. Publishing Flow

#### Make Prompt Public
```
1. User has private prompt in library
2. Clicks "Share with Community"
3. → Modal confirms: "Make this prompt public?"
4. User confirms
5. → App updates gist to public
6. → App adds to curation_queue (status: pending)
7. → Shows "Pending review" badge
```

#### Auto-Curation Logic
```sql
-- Runs hourly via cron job
WITH eligible AS (
  SELECT 
    q.gist_id,
    q.title,
    q.votes,
    g.stargazers_count as stars,
    g.forks_count as forks
  FROM curation_queue q
  JOIN github_gists g ON g.id = q.gist_id
  WHERE q.status = 'pending'
)
SELECT gist_id FROM eligible
WHERE 
  votes >= 10 OR
  (stars * 10 + forks * 20 + votes * 5) >= 100
ORDER BY (stars * 10 + forks * 20 + votes * 5) DESC
LIMIT 100;

-- Auto-approve these
```

### 4. Version History

#### View History
```
1. User opens prompt in library
2. Clicks "View History" button
3. → App fetches gist commits from GitHub API
4. → Shows timeline of versions with timestamps
5. User can preview any version
```

#### Restore Previous Version
```
1. User views version history
2. Clicks "Restore" on old version
3. → Confirms: "Replace current version?"
4. → App updates gist with old content (creates new version)
5. → Current content preserved in history
```

### 5. Admin Curation

#### Review Queue
```
1. Admin visits /admin/curation
2. → Shows pending nominations sorted by votes
3. For each prompt:
   - Preview content
   - See GitHub stats (stars, forks)
   - See nomination count
   - Calculate quality score
4. Admin can:
   - ✓ Approve (adds to curated_prompts)
   - ✗ Reject (status: rejected)
   - ⭐ Feature (bonus quality score)
   - 🔒 Hide (is_hidden: true)
```

#### Manage Admins
```
1. Admin visits /admin/users
2. → Shows current admin list
3. Can add new admin:
   - Enter GitHub username
   - Select role (curator, moderator, admin)
   - Confirm
4. Can remove admins (except self)
```

---

## API Endpoints

### Personal Library

```typescript
// GET /api/library/index
// Returns user's library index (lightweight)
{
  prompts: [
    { gistId, title, category, tags, updated }
  ]
}

// GET /api/library/prompt/:gistId
// Returns full prompt content
{
  gistId, title, content, metadata, versions
}

// POST /api/library/prompt
// Creates new prompt
body: { title, content, category, tags }
→ Creates gist, updates index, returns gistId

// PATCH /api/library/prompt/:gistId
// Updates existing prompt
body: { title?, content?, metadata? }
→ Updates gist, creates new version

// DELETE /api/library/prompt/:gistId
// Deletes prompt
→ Deletes gist, removes from index

// GET /api/library/prompt/:gistId/history
// Returns version history
→ Fetches GitHub gist commits

// POST /api/library/prompt/:gistId/restore
body: { sha }
→ Restores version, creates new commit
```

### Community

```typescript
// POST /api/community/search
body: { query, filters: { categories, tags }, sort, limit, offset }
→ Full-text search on curated_prompts
{
  results: [...],
  total, 
  hasMore
}

// GET /api/community/prompt/:id
// Returns cached prompt metadata + live GitHub content
{
  id, gistId, title, description, author,
  stats: { stars, forks, views, uses },
  content, // fetched live from GitHub
}

// POST /api/community/prompt/:id/view
// Increments view count
→ Updates app_views in curated_prompts

// POST /api/community/prompt/:id/fork
// Forks to user's library
→ Forks GitHub gist
→ Adds to user's index
→ Increments app_forks

// POST /api/community/publish
body: { gistId }
→ Makes gist public
→ Adds to curation_queue
```

### Curation

```typescript
// GET /api/curation/queue
// Returns pending nominations (admin only)
{
  pending: [
    {
      id, gistId, title, nominated_by,
      votes, nominated_at, quality_score
    }
  ]
}

// POST /api/curation/nominate
body: { gistId }
→ Adds to curation_queue or increments votes

// POST /api/curation/approve/:id
// Approves nomination (moderator+)
→ Fetches gist from GitHub
→ Inserts into curated_prompts
→ Updates queue status

// POST /api/curation/reject/:id
body: { note }
// Rejects nomination (moderator+)
→ Updates queue status

// POST /api/curation/feature/:promptId
// Features a curated prompt (moderator+)
→ Sets is_featured = true
→ Recalculates quality_score
```

### Admin

```typescript
// GET /api/admin/stats
// Returns analytics (admin only)
{
  users: { total, active, new },
  prompts: { total, public, curated },
  activity: { searches, views, forks }
}

// POST /api/admin/users/add
body: { username, role }
→ Adds user to admins table

// DELETE /api/admin/users/:username
→ Removes from admins table

// GET /api/admin/users
→ Returns all admins
```

---

## Implementation Phases

### Phase 1: GitHub Gists Backend (Weeks 1-2)

**Goal:** Replace localStorage with GitHub Gists for personal libraries

**Tasks:**
- [ ] GitHub OAuth integration
  - [ ] Create OAuth app
  - [ ] Implement auth routes (/auth/login, /auth/callback, /auth/logout)
  - [ ] Session encryption/decryption
  - [ ] Auth middleware (hooks.server.ts)
- [ ] Personal library service
  - [ ] Create index gist on first sync
  - [ ] Create individual prompt gists
  - [ ] Update prompt gists
  - [ ] Delete prompt gists
  - [ ] Sync index gist
- [ ] Sync strategy
  - [ ] Debounced auto-sync (2s)
  - [ ] Offline queue
  - [ ] Retry logic with exponential backoff
  - [ ] Conflict resolution (last-write-wins)
- [ ] Migration tool
  - [ ] Export localStorage prompts
  - [ ] Bulk upload to GitHub
  - [ ] Keep localStorage as cache
- [ ] UI components
  - [ ] Settings panel (connect/disconnect GitHub)
  - [ ] Sync indicator
  - [ ] Migration modal

**Success Metrics:**
- [ ] OAuth flow completes in <5s
- [ ] Sync latency <2s
- [ ] Migration success rate >95%

### Phase 2: Curated Community (Weeks 3-4)

**Goal:** Implement hybrid community discovery with Neon

**Tasks:**
- [ ] Database schema
  - [ ] Create all tables
  - [ ] Set up indexes
  - [ ] Seed with initial data
- [ ] Curation system
  - [ ] Quality score algorithm
  - [ ] Auto-curation job (cron)
  - [ ] Nomination flow
  - [ ] Vote system
- [ ] Community API
  - [ ] Search endpoint
  - [ ] Browse/filter endpoints
  - [ ] Fork endpoint
  - [ ] Publish endpoint
- [ ] Background sync job
  - [ ] Sync GitHub stats (stars, forks)
  - [ ] Update quality scores
  - [ ] Run every 6 hours
- [ ] UI components
  - [ ] Community browse view
  - [ ] Search interface
  - [ ] Prompt card with stats
  - [ ] Fork button

**Success Metrics:**
- [ ] Search returns results in <500ms
- [ ] Neon storage <100MB at 10K users
- [ ] Top 5% curation rate maintained

### Phase 3: Admin Dashboard (Week 5)

**Goal:** Enable curation and moderation

**Tasks:**
- [ ] Admin authorization
  - [ ] Create admins table
  - [ ] Seed initial admin
  - [ ] Role-based access control
  - [ ] Protected routes
- [ ] Curation dashboard
  - [ ] Queue view with sorting/filtering
  - [ ] Approve/reject actions
  - [ ] Feature prompts
  - [ ] Bulk operations
- [ ] User management
  - [ ] Add/remove admins
  - [ ] Role assignment
  - [ ] Activity log
- [ ] Analytics dashboard
  - [ ] User metrics
  - [ ] Prompt metrics
  - [ ] Growth charts
  - [ ] Export data

**Success Metrics:**
- [ ] Curation queue processing time <5min per prompt
- [ ] Admin dashboard loads in <1s

### Phase 4: Advanced Features (Week 6+)

**Goal:** Enhanced discovery and user experience

**Tasks:**
- [ ] Version history UI
  - [ ] Timeline view
  - [ ] Diff viewer
  - [ ] Restore function
- [ ] Collections/playlists
  - [ ] Create collection
  - [ ] Add prompts to collection
  - [ ] Share collections
- [ ] Recommendation engine
  - [ ] Based on user's library
  - [ ] Collaborative filtering
  - [ ] Trending prompts
- [ ] Import from URL
  - [ ] Paste any gist URL
  - [ ] Import directly to library
  - [ ] Bulk import
- [ ] Export options
  - [ ] Export as JSON
  - [ ] Export as Markdown
  - [ ] Share collection URL

**Success Metrics:**
- [ ] Collection feature adoption >20%
- [ ] Recommendation click-through rate >15%

---

## Success Metrics

### Adoption Metrics
- **GitHub connection rate:** >80% of active users
- **Sync success rate:** >99%
- **Migration completion rate:** >95%
- **Daily active users:** +30% MoM growth

### Performance Metrics
- **Sync latency:** <2s (p95)
- **Search response time:** <500ms (p95)
- **Dashboard load time:** <1s (p95)
- **Gist creation time:** <3s (p95)

### Engagement Metrics
- **Prompts per user:** >20 average
- **Public prompts:** >10% of total
- **Fork rate:** >5% of prompt views
- **Return user rate:** >60% weekly

### Scale Metrics
- **Neon storage usage:** <100MB at 10K users, <500MB at 100K users
- **API rate limit safety:** <50% of GitHub limits used
- **Concurrent users:** 1,000+ supported
- **Curation queue:** <24hr turnaround for top-voted prompts

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| GitHub API rate limits | High | Medium | Aggressive caching, debouncing, request batching |
| GitHub downtime | Medium | Low | Offline queue, localStorage fallback, retry logic |
| OAuth token expiry | Medium | Medium | Refresh token flow, graceful re-auth prompts |
| Sync conflicts | Medium | Low | Last-write-wins with timestamps, manual merge option |
| Neon storage overflow | High | Low | Auto-purge low-quality prompts, monitoring alerts |
| Database cold starts | Low | Medium | Connection pooling, keep-alive pings |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low GitHub adoption | High | Medium | Clear value prop, seamless migration, onboarding flow |
| Spam/low-quality prompts | Medium | High | Quality score threshold, admin moderation, reporting |
| User privacy concerns | High | Low | Private by default, clear data ownership messaging |
| Scalability ceiling | High | Low | Designed for 100K+ users on free tier |

### Mitigation Strategies

**Rate Limit Protection:**
```typescript
const rateLimiter = {
  maxRequests: 4500, // 90% of GitHub's 5000/hr limit
  window: 3600000,
  requestQueue: [],
  
  async throttle(fn: () => Promise<any>) {
    // Wait if approaching limit
    while (this.getRequestCount() > this.maxRequests * 0.9) {
      await sleep(1000);
    }
    return await fn();
  }
};
```

**Offline Support:**
```typescript
// Queue operations when offline
if (!navigator.onLine) {
  offlineQueue.push({ type: 'update', gistId, data });
  localStorage.set('offline_queue', offlineQueue);
  showToast('Saved offline. Will sync when online.');
}

// Process queue when back online
window.addEventListener('online', async () => {
  const queue = offlineQueue.get();
  for (const op of queue) {
    await processOperation(op);
  }
  offlineQueue.clear();
});
```

**Storage Monitoring:**
```typescript
// Daily job to check Neon usage
async function monitorStorage() {
  const usage = await db.queryOne(`
    SELECT pg_database_size(current_database()) as bytes;
  `);
  
  const usagePercent = (usage.bytes / (500 * 1024 * 1024)) * 100;
  
  if (usagePercent > 80) {
    // Alert admins
    await sendAlert('Neon storage at ' + usagePercent + '%');
    
    // Auto-purge lowest quality prompts
    await db.query(`
      DELETE FROM curated_prompts
      WHERE quality_score < 50
      AND indexed_at < NOW() - INTERVAL '90 days'
    `);
  }
}
```

---

## Open Questions & Decisions Needed

### 1. Curation Threshold
**Question:** What percentage of prompts should be indexed in Neon?

**Options:**
- A) Top 5% (recommended) - ~25K prompts at 500K total
- B) Top 10% - ~50K prompts at 500K total
- C) Dynamic threshold based on quality score >100

**Decision:** Start with **Option A (Top 5%)**, adjust based on usage

---

### 2. De-indexing Strategy
**Question:** Should prompts be removed from Neon if quality drops?

**Options:**
- A) Never remove once indexed
- B) Remove if quality score drops below threshold
- C) Remove if inactive for 90+ days AND low quality

**Decision:** **Option C** - keeps database fresh, maintains quality

---

### 3. Public by Default?
**Question:** Should prompts be public or private by default?

**Options:**
- A) Private by default (recommended) - user opts into sharing
- B) Public by default - user opts out
- C) Ask on first save

**Decision:** **Option A (Private)** - safer for users, builds trust

---

### 4. Sync Frequency
**Question:** How often to sync GitHub stats (stars, forks) to Neon?

**Options:**
- A) Real-time on every view (expensive)
- B) Every 6 hours via cron (recommended)
- C) Daily
- D) On-demand only

**Decision:** **Option B (6 hours)** - balance freshness and API usage

---

### 5. localStorage Strategy
**Question:** What role should localStorage play after GitHub sync?

**Options:**
- A) Remove entirely - always fetch from GitHub
- B) Keep as read-only cache
- C) Keep as read-write cache with sync

**Decision:** **Option C** - offline support, faster loads

---

## Appendix

### A. GitHub Gist API Reference

```typescript
// List user's gists
GET https://api.github.com/gists
Headers: Authorization: Bearer {token}

// Get specific gist
GET https://api.github.com/gists/{gist_id}

// Create gist
POST https://api.github.com/gists
{
  description: string,
  public: boolean,
  files: {
    [filename]: { content: string }
  }
}

// Update gist
PATCH https://api.github.com/gists/{gist_id}
{
  description?: string,
  files: {
    [filename]: { content: string }
  }
}

// Delete gist
DELETE https://api.github.com/gists/{gist_id}

// Fork gist
POST https://api.github.com/gists/{gist_id}/forks

// Get version history
GET https://api.github.com/gists/{gist_id}/commits

// Get specific version
GET https://api.github.com/gists/{gist_id}/{sha}

// Rate limit status
GET https://api.github.com/rate_limit
```

### B. Environment Variables

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Session encryption
AUTH_SECRET=random_64_char_string

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# App
PUBLIC_BASE_URL=https://yourapp.vercel.app
NODE_ENV=production

# Optional: Monitoring
SENTRY_DSN=https://...
POSTHOG_KEY=phc_...
```

### C. Deployment Checklist

**Pre-deployment:**
- [ ] GitHub OAuth app created and configured
- [ ] Environment variables set in Vercel
- [ ] Database schema deployed to Neon
- [ ] Initial admin seeded in database
- [ ] Rate limiting tested
- [ ] Error monitoring configured

**Post-deployment:**
- [ ] Test OAuth flow end-to-end
- [ ] Create test prompt and sync
- [ ] Verify curation queue works
- [ ] Test admin dashboard access
- [ ] Monitor error rates for 24h
- [ ] Verify Neon connection pooling

### D. Monitoring & Alerts

**Key Metrics to Track:**
```typescript
// Application metrics
- Sync success rate (target: >99%)
- API response times (target: p95 <2s)
- Error rate (target: <0.1%)
- GitHub API rate limit usage (alert: >80%)

// Business metrics
- Daily active users
- New GitHub connections
- Prompts created/day
- Community searches/day
- Curation queue length (alert: >100)

// Infrastructure
- Neon storage usage (alert: >400MB)
- Database connection pool (alert: >80%)
- Vercel function errors
- Cold start rates
```

**Alert Thresholds:**
```yaml
critical:
  - sync_success_rate < 95%
  - error_rate > 1%
  - neon_storage > 450MB
  - github_rate_limit > 90%

warning:
  - sync_success_rate < 99%
  - error_rate > 0.5%
  - neon_storage > 400MB
  - github_rate_limit > 80%
  - curation_queue > 100
```

---

## Approval & Sign-off

**Prepared by:** Engineering Team  
**Review by:** Product, Design, Infrastructure  
**Approved by:** _____________  
**Date:** _____________

**Next Steps:**
1. Technical design review
2. Sprint planning
3. Begin Phase 1 implementation