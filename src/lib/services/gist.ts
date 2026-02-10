export interface GistPrompt {
    gistId: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    collections?: string[];
    updated_at: string;
    isPublic: boolean;
}

export interface GistIndex {
    version: number;
    updated: string;
    collections: {
        id: string;
        name: string;
        color: string;
    }[];
    prompts: {
        gistId: string;
        title: string;
        category?: string;
        tags?: string[];
        collectionIds?: string[];
        created: string;
        updated: string;
        isPublic: boolean;
    }[];
}

const GIST_INDEX_FILENAME = 'favored-prompts-index.json';

export class GistService {
    constructor(private accessToken: string) { }

    private async request(path: string, options: RequestInit = {}) {
        const response = await fetch(`https://api.github.com${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                Accept: 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'GitHub API request failed');
        }

        if (response.status === 204) return null;
        return response.json();
    }

    async getLibraryIndex(): Promise<GistIndex | null> {
        const gists = await this.request('/gists');
        const indexGist = gists.find((g: any) => g.files[GIST_INDEX_FILENAME]);

        if (!indexGist) return null;

        const fullGist = await this.request(`/gists/${indexGist.id}`);
        return JSON.parse(fullGist.files[GIST_INDEX_FILENAME].content);
    }

    async saveLibraryIndex(index: GistIndex, existingId?: string): Promise<string> {
        const payload = {
            description: 'Favored Prompts - Library Index',
            public: false,
            files: {
                [GIST_INDEX_FILENAME]: {
                    content: JSON.stringify(index, null, 2)
                }
            }
        };

        if (existingId) {
            const gist = await this.request(`/gists/${existingId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
            return gist.id;
        } else {
            const gist = await this.request('/gists', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            return gist.id;
        }
    }

    async upsertLibraryIndex(index: GistIndex): Promise<string> {
        const gists = await this.request('/gists');
        const indexGist = gists.find((g: any) => g.files[GIST_INDEX_FILENAME]);

        const payload = {
            description: 'Favored Prompts - Library Index',
            public: false,
            files: {
                [GIST_INDEX_FILENAME]: {
                    content: JSON.stringify(index, null, 2)
                }
            }
        };

        if (indexGist) {
            const gist = await this.request(`/gists/${indexGist.id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
            return gist.id;
        } else {
            const gist = await this.request('/gists', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            return gist.id;
        }
    }

    async createPromptGist(prompt: Omit<GistPrompt, 'gistId' | 'updated_at'>): Promise<string> {
        const payload = {
            description: prompt.title,
            public: prompt.isPublic,
            files: {
                'prompt.md': {
                    content: prompt.content
                },
                'metadata.json': {
                    content: JSON.stringify({
                        category: prompt.category,
                        tags: prompt.tags,
                        collections: prompt.collections,
                        created: new Date().toISOString()
                    }, null, 2)
                }
            }
        };

        const gist = await this.request('/gists', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        return gist.id;
    }

    async updatePromptGist(gistId: string, prompt: Partial<GistPrompt>): Promise<void> {
        const files: any = {};
        if (prompt.content !== undefined) {
            files['prompt.md'] = { content: prompt.content };
        }

        // We might need to fetch existing metadata to preserve fields, 
        // but for now we'll just update what we have.
        if (prompt.category !== undefined || prompt.tags !== undefined || prompt.collections !== undefined) {
            const existing = await this.getPromptGist(gistId);
            files['metadata.json'] = {
                content: JSON.stringify({
                    category: prompt.category ?? existing.category,
                    tags: prompt.tags ?? existing.tags,
                    collections: prompt.collections ?? existing.collections,
                    updated: new Date().toISOString()
                }, null, 2)
            };
        }

        await this.request(`/gists/${gistId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                description: prompt.title,
                public: prompt.isPublic,
                files
            })
        });
    }

    async getPromptGist(gistId: string): Promise<GistPrompt> {
        const gist = await this.request(`/gists/${gistId}`);
        const metadata = gist.files['metadata.json']
            ? JSON.parse(gist.files['metadata.json'].content)
            : {};

        return {
            gistId: gist.id,
            title: gist.description,
            content: gist.files['prompt.md'].content,
            category: metadata.category,
            tags: metadata.tags,
            collections: metadata.collections,
            updated_at: gist.updated_at,
            isPublic: gist.public
        };
    }

    async deletePromptGist(gistId: string): Promise<void> {
        await this.request(`/gists/${gistId}`, {
            method: 'DELETE'
        });
    }
}
