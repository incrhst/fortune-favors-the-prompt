import { writable } from 'svelte/store';

export interface User {
    id: number;
    username: string;
    avatarUrl?: string;
}

export const auth = writable<{
    user: User | null;
    isLoaded: boolean;
}>({
    user: null,
    isLoaded: false
});

export function setAuth(user: User | null) {
    auth.set({ user, isLoaded: true });
}
