<script lang="ts">
    import { activeTab } from '$lib/stores/ui';
    import { Library, FolderHeart } from 'lucide-svelte';
</script>

<div class="tabs-container">
    <button 
        on:click={() => activeTab.set('community')} 
        class:active={$activeTab === 'community'}
    >
        <Library size={18} />
        Community
    </button>
    <button 
        on:click={() => activeTab.set('local')} 
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
        background: var(--bg-secondary);
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
        color: var(--text-secondary);
    }

    button.active {
        background: var(--brown-accent);
        color: white;
    }
</style>
