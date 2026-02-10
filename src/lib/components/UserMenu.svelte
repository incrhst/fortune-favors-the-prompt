<script lang="ts">
    import { auth } from '$lib/stores/auth';
    import { LogIn, LogOut, Github, User, ChevronDown, Bot } from 'lucide-svelte';
    import { fade, slide } from 'svelte/transition';
    import AgentSettingsModal from './AgentSettingsModal.svelte';

    let isOpen = $state(false);
    let showAgentSettings = $state(false);

    function toggle() {
        isOpen = !isOpen;
    }

    function close() {
        isOpen = false;
    }
</script>

<div class="user-menu-container">
    {#if $auth.isLoaded}
        {#if $auth.user}
            <button class="user-profile-button" onclick={toggle} aria-label="User menu">
                {#if $auth.user.avatarUrl}
                    <img src={$auth.user.avatarUrl} alt={$auth.user.username} class="avatar" />
                {:else}
                    <div class="avatar-placeholder">
                        <User size={20} />
                    </div>
                {/if}
                <span class="username">{$auth.user.username}</span>
                <ChevronDown size={16} class="chevron {isOpen ? 'open' : ''}" />
            </button>

            {#if isOpen}
                <div class="dropdown-overlay" onclick={close} onkeydown={(e) => e.key === 'Escape' && close()} role="button" tabindex="0"></div>
                <div class="dropdown" transition:slide={{ duration: 200 }}>
                    <div class="dropdown-header">
                        <p class="name">{$auth.user.username}</p>
                        <p class="role">GitHub Contributor</p>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="/library" class="dropdown-item" onclick={close}>
                        <Github size={18} />
                        Personal Gists
                    </a>
                    <button class="dropdown-item" onclick={() => { showAgentSettings = true; close(); }}>
                        <Bot size={18} />
                        Agent Settings
                    </button>
                    <a href="/auth/logout" class="dropdown-item logout">
                        <LogOut size={18} />
                        Logout
                    </a>
                </div>
            {/if}
        {:else}
            <a href="/auth/login" class="login-button">
                <Github size={20} />
                <span>Connect GitHub</span>
            </a>
        {/if}
    {/if}
</div>

<style>
    .user-menu-container {
        position: relative;
    }

    .user-profile-button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 9999px;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
    }

    .user-profile-button:hover {
        background: var(--bg-hover);
        border-color: var(--primary-color);
    }

    .avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: var(--bg-tertiary);
    }

    .avatar-placeholder {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: var(--bg-tertiary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
    }

    .username {
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .chevron {
        transition: transform 0.2s;
    }

    .chevron.open {
        transform: rotate(180deg);
    }

    .login-button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1.25rem;
        background: var(--primary-color);
        color: white;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
    }

    .login-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.4);
        filter: brightness(1.1);
    }

    .dropdown-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100;
    }

    .dropdown {
        position: absolute;
        top: calc(100% + 0.75rem);
        right: 0;
        width: 220px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 1rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        z-index: 101;
        overflow: hidden;
    }

    .dropdown-header {
        padding: 1rem;
        background: var(--bg-secondary);
    }

    .dropdown-header p {
        margin: 0;
    }

    .dropdown-header .name {
        font-weight: 600;
        color: var(--text-primary);
    }

    .dropdown-header .role {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: 0.25rem;
    }

    .dropdown-divider {
        height: 1px;
        background: var(--border-color);
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: var(--text-primary);
        text-decoration: none;
        transition: background 0.2s;
        font-size: 0.9375rem;
    }

    .dropdown-item:hover {
        background: var(--bg-hover);
    }

    .dropdown-item.logout {
        color: #ef4444;
    }

    .dropdown-item.logout:hover {
        background: rgba(239, 68, 68, 0.05);
    }

    @media (max-width: 640px) {
        .username {
            display: none;
        }
    }
</style>
