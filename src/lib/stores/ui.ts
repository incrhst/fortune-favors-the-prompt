import { writable } from 'svelte/store';

export type Tab = 'community' | 'local';

export const activeTab = writable<Tab>('community');
