import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface LocalPrompt {
    id: string;
    text: string;
    category: string;
    tags: string[];
    groupId?: string;
    createdAt: number;
    updatedAt: number;
}

export interface LocalGroup {
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
        groups: [] as LocalGroup[],
        isLoaded: false
    });

    if (browser) {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                set({
                    prompts: parsed.prompts || [],
                    groups: parsed.groups || [],
                    isLoaded: true
                });
            } else {
                update(s => ({ ...s, isLoaded: true }));
            }
        } catch (e) {
            console.error('Failed to load local prompts', e);
            update(s => ({ ...s, isLoaded: true }));
        }
    }

    // Sync to localStorage
    if (browser) {
        subscribe(state => {
            if (!state.isLoaded) return;
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    prompts: state.prompts,
                    groups: state.groups
                }));
            } catch (e) {
                console.error('Failed to save local prompts', e);
            }
        });
    }

    return {
        subscribe,
        addPrompt: (text: string, category: string = 'General', tags: string[] = []) => {
            const newPrompt: LocalPrompt = {
                id: crypto.randomUUID(),
                text,
                category,
                tags,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            update(s => ({ ...s, prompts: [newPrompt, ...s.prompts] }));
            return newPrompt;
        },
        updatePrompt: (id: string, updates: Partial<Omit<LocalPrompt, 'id' | 'createdAt'>>) => {
            update(s => ({
                ...s,
                prompts: s.prompts.map(p =>
                    p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
                )
            }));
        },
        deletePrompt: (id: string) => {
            update(s => ({ ...s, prompts: s.prompts.filter(p => p.id !== id) }));
        },
        createGroup: (name: string, description?: string, color?: string) => {
            const newGroup: LocalGroup = {
                id: crypto.randomUUID(),
                name,
                description,
                color,
                createdAt: Date.now(),
            };
            update(s => ({ ...s, groups: [...s.groups, newGroup] }));
            return newGroup;
        },
        deleteGroup: (id: string) => {
            update(s => {
                const groups = s.groups.filter(g => g.id !== id);
                const prompts = s.prompts.map(p =>
                    p.groupId === id ? { ...p, groupId: undefined } : p
                );
                return { ...s, groups, prompts };
            });
        },
        addToGroup: (promptId: string, groupId: string | undefined) => {
            update(s => ({
                ...s,
                prompts: s.prompts.map(p =>
                    p.id === promptId ? { ...p, groupId, updatedAt: Date.now() } : p
                )
            }));
        },
        importData: (data: { prompts: LocalPrompt[], groups: LocalGroup[] }) => {
            update(s => {
                const existingPromptIds = new Set(s.prompts.map(p => p.id));
                const newPrompts = data.prompts.filter(p => !existingPromptIds.has(p.id));

                const existingGroupIds = new Set(s.groups.map(g => g.id));
                const newGroups = data.groups.filter(g => !existingGroupIds.has(g.id));

                return {
                    ...s,
                    prompts: [...newPrompts, ...s.prompts],
                    groups: [...newGroups, ...s.groups]
                };
            });
        }
    };
}

export const localStore = createLocalStore();
