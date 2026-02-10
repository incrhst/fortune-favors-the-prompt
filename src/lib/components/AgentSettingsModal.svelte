<script lang="ts">
    import { page } from '$app/stores';
    import { X, Copy, Check, ExternalLink, Bot } from 'lucide-svelte';
    import { fade, scale } from 'svelte/transition';

    let { show = $bindable(false) } = $props();

    let copied = $state(false);
    let sessionKey = $derived($page.data.sessionKey);

    async function copyToClipboard() {
        if (!sessionKey) return;
        try {
            await navigator.clipboard.writeText(sessionKey);
            copied = true;
            setTimeout(() => (copied = false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }

    function close() {
        show = false;
    }
</script>

{#if show}
    <div class="modal-overlay" onclick={close} transition:fade={{ duration: 200 }}>
        <div class="modal-content" onclick={(e) => e.stopPropagation()} transition:scale={{ duration: 200, start: 0.95 }}>
            <header>
                <div class="title-group">
                    <Bot size={24} class="bot-icon" />
                    <h2>Agent Integration</h2>
                </div>
                <button class="close-button" onclick={close}>
                    <X size={20} />
                </button>
            </header>

            <div class="body">
                <section>
                    <h3>Your API Key</h3>
                    <p class="description">Use this key to authenticate your AI agents (Cursor, Antigravity, etc.) with your Favored Prompts library.</p>
                    
                    <div class="key-container">
                        <div class="key-display">
                            {sessionKey ? (sessionKey.substring(0, 12) + '••••••••••••••••') : 'Not logged in'}
                        </div>
                        <button class="copy-button" onclick={copyToClipboard} class:success={copied}>
                            {#if copied}
                                <Check size={18} />
                                <span>Copied!</span>
                            {:else}
                                <Copy size={18} />
                                <span>Copy Key</span>
                            {/if}
                        </button>
                    </div>
                </section>

                <div class="divider"></div>

                <section>
                    <h3>Setup Instructions</h3>
                    <div class="steps">
                        <div class="step">
                            <span class="number">1</span>
                            <div class="text">
                                <strong>For Cursor/Antigravity:</strong>
                                <p>Go to Settings > MCP and add a new server using the <code>command</code> type.</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="number">2</span>
                            <div class="text">
                                <strong>Command Path:</strong>
                                <p>Point it to your local <code>mcp-server/index.js</code> file.</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="number">3</span>
                            <div class="text">
                                <strong>Environment Variables:</strong>
                                <p>Add <code>FAVORED_PROMPTS_API_KEY</code> with your copied key.</p>
                            </div>
                        </div>
                    </div>
                    
                    <a href="/AGENT_INTEGRATION.md" target="_blank" class="docs-link">
                        <span>View Full Agent Guide</span>
                        <ExternalLink size={14} />
                    </a>
                </section>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 1.5rem;
    }

    .modal-content {
        background: var(--bg-primary);
        color: var(--text-primary);
        border: 1px solid var(--border-medium);
        border-radius: 1.5rem;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-medium);
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .title-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .bot-icon {
        color: var(--brown-accent);
    }

    header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .close-button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        display: flex;
        transition: all 0.2s;
    }

    .close-button:hover {
        background: var(--border-light);
        color: var(--text-primary);
    }

    .body {
        padding: 1.5rem;
    }

    section {
        margin-bottom: 1.5rem;
    }

    h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
    }

    .description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0 0 1rem 0;
        line-height: 1.5;
    }

    .key-container {
        display: flex;
        gap: 0.75rem;
        background: var(--bg-secondary);
        padding: 0.5rem;
        border-radius: 0.75rem;
        border: 1px solid var(--border-medium);
        align-items: center;
    }

    .key-display {
        flex: 1;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.875rem;
        padding: 0.5rem;
        color: var(--text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .copy-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--brown-accent);
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 120px;
        justify-content: center;
    }

    .copy-button:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
    }

    .copy-button.success {
        background: #10b981;
    }

    .divider {
        height: 1px;
        background: var(--border-medium);
        margin-bottom: 1.5rem;
    }

    .steps {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.25rem;
    }

    .step {
        display: flex;
        gap: 1rem;
    }

    .number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        background: var(--border-light);
        color: var(--text-secondary);
        border-radius: 50%;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
        margin-top: 2px;
    }

    .text strong {
        display: block;
        font-size: 0.875rem;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
    }

    .text p {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--text-secondary);
        line-height: 1.4;
    }

    code {
        background: var(--border-light);
        padding: 0.125rem 0.25rem;
        border-radius: 4px;
        font-size: 0.75rem;
    }

    .docs-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--brown-accent);
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 600;
        transition: opacity 0.2s;
    }

    .docs-link:hover {
        opacity: 0.8;
    }
</style>
