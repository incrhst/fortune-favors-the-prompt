
import React from 'react';
import { useStore } from '@nanostores/react';
import { activeTab } from '../lib/uiStore';

export default function LocalViewWrapper({ children }: { children: React.ReactNode }) {
    const $activeTab = useStore(activeTab);

    if ($activeTab !== 'local') return null;

    return <>{children}</>;
}
