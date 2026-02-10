
import React from 'react';
import { useStore } from '@nanostores/react';
import { activeTab, type Tab } from '../lib/uiStore';
import { Library, FolderHeart } from 'lucide-react';

export default function LibraryTabs() {
    const $activeTab = useStore(activeTab);

    const tabStyle = (tab: Tab) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        borderRadius: '12px',
        fontWeight: 600,
        background: $activeTab === tab ? 'var(--brown-accent, #8b5c2e)' : 'transparent',
        color: $activeTab === tab ? 'white' : 'var(--brown-medium, #6b5444)',
        border: 'none',
        transition: 'all 0.2s ease'
    });

    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem', background: '#f5f1e8', borderRadius: '16px', width: 'fit-content' }}>
            <button onClick={() => activeTab.set('community')} style={tabStyle('community')}>
                <Library size={18} />
                Community
            </button>
            <button onClick={() => activeTab.set('local')} style={tabStyle('local')}>
                <FolderHeart size={18} />
                My Library
            </button>
        </div>
    );
}
