
import { atom } from 'nanostores';

export type Tab = 'community' | 'local';

export const activeTab = atom<Tab>('community');
