import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { auth } from './auth';

export interface LocalPrompt {
    id: string; // Internal UUID
    gistId?: string; // GitHub Gist ID if synced
    title?: string; // Added title support
    text: string;
    category: string;
    tags: string[];
    collectionIds: string[]; // Support multiple collections
    createdAt: number;
    updatedAt: number;
}

export interface LocalCollection {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt: number;
}

const STORAGE_KEY = 'anon-prompts-v1';

function createLocalStore() {
    const { subscribe, set, update } = writable({
        prompts: [] as LocalPrompt[],
        collections: [] as LocalCollection[],
        isLoaded: false,
        isSyncing: false
    });

    if (browser) {
        // Load from localStorage initially
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                set({
                    prompts: (parsed.prompts || []).map((p: any) => ({
                        ...p,
                        collectionIds: p.collectionIds || (p.groupId ? [p.groupId] : [])
                    })),
                    collections: parsed.collections || parsed.groups || [],
                    isLoaded: true,
                    isSyncing: false
                });
            } else {
                update(s => ({ ...s, isLoaded: true }));
            }
        } catch (e) {
            console.error('Failed to load local prompts', e);
            update(s => ({ ...s, isLoaded: true }));
        }

        // Subscribe to auth changes to trigger sync
        auth.subscribe(async ($auth) => {
            if ($auth.user && $auth.isLoaded) {
                await syncWithGists();
            }
        });
    }

    async function syncWithGists() {
        update(s => ({ ...s, isSyncing: true }));
        try {
            const res = await fetch('/api/library/index');
            if (res.ok) {
                const remoteIndex = await res.json();
                update(s => {
                    const localPrompts = [...s.prompts];

                    // Merge remote collections
                    if (remoteIndex.collections) {
                        remoteIndex.collections.forEach((remoteColl: any) => {
                            const exists = s.collections.some(c => c.id === remoteColl.id);
                            if (!exists) {
                                s.collections.push({
                                    id: remoteColl.id,
                                    name: remoteColl.name,
                                    color: remoteColl.color || '#8b5c2e',
                                    createdAt: Date.now()
                                });
                            }
                        });
                    }

                    // Merge remote prompts into local
                    remoteIndex.prompts.forEach((remote: any) => {
                        const localIndex = localPrompts.findIndex(p => p.gistId === remote.gistId);
                        if (localIndex === -1) {
                            // New remote prompt, add to local
                            localPrompts.push({
                                id: crypto.randomUUID(),
                                gistId: remote.gistId,
                                text: '', // Need to fetch content if not in index
                                title: remote.title,
                                category: remote.category || 'General',
                                tags: remote.tags || [],
                                collectionIds: remote.collectionIds || [],
                                createdAt: new Date(remote.created).getTime(),
                                updatedAt: new Date(remote.updated).getTime()
                            });
                        } else {
                            // Update local if remote is newer
                            const remoteUpdated = new Date(remote.updated).getTime();
                            if (remoteUpdated > localPrompts[localIndex].updatedAt) {
                                localPrompts[localIndex] = {
                                    ...localPrompts[localIndex],
                                    title: remote.title || localPrompts[localIndex].title,
                                    category: remote.category || 'General',
                                    tags: remote.tags || [],
                                    collectionIds: remote.collectionIds || localPrompts[localIndex].collectionIds,
                                    updatedAt: remoteUpdated
                                };
                            }
                        }
                    });

                    return { ...s, prompts: localPrompts, collections: s.collections };
                });
            }
        } catch (e) {
            console.error('Sync failed', e);
        } finally {
            update(s => ({ ...s, isSyncing: false }));
        }
    }

    // Sync state to localStorage
    if (browser) {
        subscribe(state => {
            if (!state.isLoaded) return;
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    prompts: state.prompts,
                    collections: state.collections
                }));
            } catch (e) {
                console.error('Failed to save local prompts', e);
            }
        });
    }

    return {
        subscribe,
        addPrompt: async (text: string, category: string = 'General', tags: string[] = [], collectionIds: string[] = []) => {
            const id = crypto.randomUUID();
            const title = text.slice(0, 50);
            const newPrompt: LocalPrompt = {
                id,
                title,
                text,
                category,
                tags,
                collectionIds,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            update(s => ({ ...s, prompts: [newPrompt, ...s.prompts] }));

            // If logged in, sync to Gist
            const $auth = get(auth);
            if ($auth.user) {
                try {
                    const res = await fetch('/api/library/prompt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title,
                            content: text,
                            category,
                            tags,
                            collections: collectionIds,
                            isPublic: false
                        })
                    });
                    if (res.ok) {
                        const { gistId } = await res.json();
                        update(s => ({
                            ...s,
                            prompts: s.prompts.map(p => p.id === id ? { ...p, gistId } : p)
                        }));
                    }
                } catch (e) {
                    console.error('Failed to sync new prompt to Gist', e);
                }
            }

            return newPrompt;
        },
        updatePrompt: async (id: string, updates: Partial<Omit<LocalPrompt, 'id' | 'createdAt'>>) => {
            let gistId: string | undefined;
            update(s => {
                const prompt = s.prompts.find(p => p.id === id);
                gistId = prompt?.gistId;
                return {
                    ...s,
                    prompts: s.prompts.map(p =>
                        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
                    )
                };
            });

            if (gistId) {
                try {
                    // Map collectionIds to collections for Gist API compatibility
                    const syncUpdates = { ...updates };
                    if (updates.collectionIds) {
                        (syncUpdates as any).collections = updates.collectionIds;
                        delete syncUpdates.collectionIds;
                    }

                    await fetch(`/api/library/prompt/${gistId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(syncUpdates)
                    });
                } catch (e) {
                    console.error('Failed to sync update to Gist', e);
                }
            }
        },
        deletePrompt: async (id: string) => {
            let gistId: string | undefined;
            update(s => {
                const prompt = s.prompts.find(p => p.id === id);
                gistId = prompt?.gistId;
                return { ...s, prompts: s.prompts.filter(p => p.id !== id) };
            });

            if (gistId) {
                try {
                    await fetch(`/api/library/prompt/${gistId}`, {
                        method: 'DELETE'
                    });
                } catch (e) {
                    console.error('Failed to sync delete to Gist', e);
                }
            }
        },
        createCollection: (name: string, description?: string, color?: string) => {
            const newCollection: LocalCollection = {
                id: crypto.randomUUID(),
                name,
                description,
                color: color || '#8b5c2e',
                createdAt: Date.now(),
            };
            update(s => ({ ...s, collections: [...s.collections, newCollection] }));
            return newCollection;
        },
        deleteCollection: (id: string) => {
            update(s => {
                const collections = s.collections.filter(c => c.id !== id);
                const prompts = s.prompts.map(p => ({
                    ...p,
                    collectionIds: p.collectionIds.filter(cid => cid !== id)
                }));
                return { ...s, collections, prompts };
            });
        },
        toggleCollection: (promptId: string, collectionId: string) => {
            update(s => ({
                ...s,
                prompts: s.prompts.map(p => {
                    if (p.id !== promptId) return p;
                    const exists = p.collectionIds.includes(collectionId);
                    const newIds = exists
                        ? p.collectionIds.filter(id => id !== collectionId)
                        : [...p.collectionIds, collectionId];
                    return { ...p, collectionIds: newIds, updatedAt: Date.now() };
                })
            }));
        },
        importData: (data: { prompts: LocalPrompt[], collections: LocalCollection[] }) => {
            update(s => {
                const existingPromptIds = new Set(s.prompts.map(p => p.id));
                const newPrompts = data.prompts.filter(p => !existingPromptIds.has(p.id));

                const existingCollIds = new Set(s.collections.map(c => c.id));
                const newColls = (data.collections || []).filter(c => !existingCollIds.has(c.id));

                return {
                    ...s,
                    prompts: [...newPrompts, ...s.prompts],
                    collections: [...newColls, ...s.collections]
                };
            });
        }
    };
}

export const localStore = createLocalStore();
