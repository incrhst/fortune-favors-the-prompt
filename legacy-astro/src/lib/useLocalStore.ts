import { useState, useEffect } from 'react';

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

export function useLocalStore() {
    const [prompts, setPrompts] = useState<LocalPrompt[]>([]);
    const [groups, setGroups] = useState<LocalGroup[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setPrompts(parsed.prompts || []);
                setGroups(parsed.groups || []);
            }
        } catch (e) {
            console.error('Failed to load local prompts', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to storage whenever state changes
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ prompts, groups }));
        } catch (e) {
            console.error('Failed to save local prompts', e);
        }
    }, [prompts, groups, isLoaded]);

    const addPrompt = (text: string, category: string = 'General', tags: string[] = []) => {
        const newPrompt: LocalPrompt = {
            id: crypto.randomUUID(),
            text,
            category,
            tags,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setPrompts(prev => [newPrompt, ...prev]);
        return newPrompt;
    };

    const updatePrompt = (id: string, updates: Partial<Omit<LocalPrompt, 'id' | 'createdAt'>>) => {
        setPrompts(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        ));
    };

    const deletePrompt = (id: string) => {
        setPrompts(prev => prev.filter(p => p.id !== id));
    };

    const createGroup = (name: string, description?: string, color?: string) => {
        const newGroup: LocalGroup = {
            id: crypto.randomUUID(),
            name,
            description,
            color,
            createdAt: Date.now(),
        };
        setGroups(prev => [...prev, newGroup]);
        return newGroup;
    };

    const deleteGroup = (id: string) => {
        setGroups(prev => prev.filter(g => g.id !== id));
        // Ungroup prompts that were in this group
        setPrompts(prev => prev.map(p =>
            p.groupId === id ? { ...p, groupId: undefined } : p
        ));
    };

    const addToGroup = (promptId: string, groupId: string | undefined) => {
        updatePrompt(promptId, { groupId });
    };

    const importData = (data: { prompts: LocalPrompt[], groups: LocalGroup[] }) => {
        // Merge strategy: Append imported, handle ID collisions by generating new IDs if needed? 
        // For simplicity, we'll just append and assume UUIDs are unique enough.
        // Actually, let's filter out exact ID matches to avoid duplicates if importing same data twice.

        setPrompts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPrompts = data.prompts.filter(p => !existingIds.has(p.id));
            return [...newPrompts, ...prev];
        });

        setGroups(prev => {
            const existingIds = new Set(prev.map(g => g.id));
            const newGroups = data.groups.filter(g => !existingIds.has(g.id));
            return [...newGroups, ...prev];
        });
    };

    return {
        prompts,
        groups,
        isLoaded,
        addPrompt,
        updatePrompt,
        deletePrompt,
        createGroup,
        deleteGroup,
        addToGroup,
        importData
    };
}
