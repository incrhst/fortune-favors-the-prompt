<script lang="ts">
    import { activeTab } from '$lib/stores/ui';
    import { Library, FolderHeart } from 'lucide-svelte';
</script>

<div class="tabs-container">
    <button 
        onclick={() => activeTab.set('community')} 
        class:active={$activeTab === 'community'}
    >
        <Library size={18} />
        Community
    </button>
    <button 
        onclick={() => activeTab.set('local')} 
        class:active={$activeTab === 'local'}
    >
        <FolderHeart size={18} />
        My Library
    </button>
</div>

<style>
    .tabs-container {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        padding: 0.5rem;
        background: #f5f1e8;
        border-radius: 16px;
        width: fit-content;
    }

    button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        border-radius: 12px;
        font-weight: 600;
        border: none;
        transition: all 0.2s ease;
        background: transparent;
        color: var(--brown-medium, #6b5444);
    }

    button.active {
        background: var(--brown-accent, #8b5c2e);
        color: white;
    }
</style>
