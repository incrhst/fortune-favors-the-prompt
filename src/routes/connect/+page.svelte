<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import { Check, Copy, Terminal, Shield, ArrowRight, Server, Key } from 'lucide-svelte';

    let { data } = $props();
    let copied = $state(false);

    let serverUrl = `${data.origin}/api/mcp`;
    
    // Configuration object for Claude Desktop
    let config = $derived({
        "mcpServers": {
            "favored-prompts": {
                "command": "npx",
                "args": [
                    "-y",
                    "@modelcontextprotocol/server-sse-client", // Using a generic SSE client adapter
                    serverUrl
                ],
                "env": {
                    "MCP_API_KEY": data.apiKey || "YOUR_SESSION_KEY_HERE"
                }
            }
        }
    });

    function copyConfig() {
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
        copied = true;
        setTimeout(() => copied = false, 2000);
    }

    function copyKey() {
        navigator.clipboard.writeText(data.apiKey);
        alert('API Key copied!');
    }
</script>

<svelte:head>
    <title>Connect Agent | Favored Prompts</title>
</svelte:head>

<div class="container" in:fade>
    <header>
        <div class="icon-wrapper">
            <Terminal size={32} />
        </div>
        <h1>Connect Your Agent</h1>
        <p>Give your AI agent access to your curated prompt library.</p>
    </header>

    {#if !data.apiKey}
        <div class="warning-card">
            <Shield size={24} />
            <div class="warning-text">
                <h3>Authentication Required</h3>
                <p>Please log in to generate your connection keys.</p>
            </div>
            <a href="/auth/login" class="btn-primary">Log In</a>
        </div>
    {:else}
        <div class="config-card">
            <div class="card-header">
                <h3>Claude Desktop Configuration</h3>
                <span class="badge">Automatic Setup</span>
            </div>
            
            <p class="instruction">
                Paste this into your <code>claude_desktop_config.json</code> file to instantly connect.
            </p>

            <div class="code-block">
                <pre><code>{JSON.stringify(config, null, 2)}</code></pre>
                <button class="copy-btn" onclick={copyConfig} class:copied>
                    {#if copied}
                        <Check size={18} />
                        <span>Copied</span>
                    {:else}
                        <Copy size={18} />
                        <span>Copy Config</span>
                    {/if}
                </button>
            </div>

            <div class="details-grid">
                <div class="detail-item">
                    <span class="label"><Server size={14}/> Server URL</span>
                    <code class="value">{serverUrl}</code>
                </div>
                <div class="detail-item">
                    <span class="label"><Key size={14}/> API Key</span>
                    <div class="key-value">
                        <code class="value masked">{data.apiKey.slice(0, 12)}...</code>
                        <button class="icon-btn-sm" onclick={copyKey} title="Copy Key">
                            <Copy size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="steps-section">
            <h3>How to use</h3>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <p>Open Claude Desktop settings</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <p>Click "Developer" -> "Edit Config"</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <p>Paste the configuration block</p>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <p>Restart Claude Desktop</p>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 4rem 2rem;
    }

    header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .icon-wrapper {
        width: 64px;
        height: 64px;
        background: var(--bg-tertiary);
        border-radius: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        color: var(--primary-color);
    }

    h1 {
        font-size: 2.5rem;
        margin: 0 0 1rem;
        color: var(--text-primary);
        font-weight: 800;
    }

    header p {
        font-size: 1.125rem;
        color: var(--text-secondary);
    }

    .config-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        margin-bottom: 3rem;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .card-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
    }

    .badge {
        background: rgba(var(--primary-color-rgb), 0.1);
        color: var(--primary-color);
        padding: 0.25rem 0.75rem;
        border-radius: 100px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    .instruction {
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
    }

    .instruction code {
        background: var(--bg-tertiary);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-size: 0.9em;
    }

    .code-block {
        background: #1e1e1e;
        border-radius: 1rem;
        padding: 1.5rem;
        position: relative;
        margin-bottom: 2rem;
        border: 1px solid #333;
    }

    .code-block pre {
        margin: 0;
        overflow-x: auto;
    }

    .code-block code {
        color: #e5e5e5;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .copy-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        border-radius: 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        transition: all 0.2s;
    }

    .copy-btn:hover {
        background: rgba(255,255,255,0.2);
    }

    .copy-btn.copied {
        background: #10b981;
        border-color: #10b981;
        color: white;
    }

    .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .label {
        font-size: 0.875rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .value {
        font-family: monospace;
        background: var(--bg-primary);
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid var(--border-color);
        font-size: 0.9rem;
        color: var(--text-primary);
        display: block;
    }

    .key-value {
        display: flex;
        gap: 0.5rem;
    }
    
    .key-value .value { flex: 1; }

    .icon-btn-sm {
        padding: 0.5rem;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        cursor: pointer;
        color: var(--text-secondary);
    }

    .warning-card {
        background: #fff3cd;
        border: 1px solid #ffeeba;
        color: #856404;
        padding: 2rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .warning-text h3 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
    }

    .warning-text p {
        margin: 0;
    }

    .steps-section h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: var(--text-primary);
    }

    .steps {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
    }

    .step {
        background: var(--bg-tertiary);
        padding: 1.5rem;
        border-radius: 1rem;
        text-align: center;
        border: 1px solid var(--border-color);
    }

    .step-number {
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        margin: 0 auto 1rem;
    }

    .step p {
        margin: 0;
        font-size: 0.9375rem;
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    .btn-primary {
		padding: 0.875rem 1.5rem;
		background: var(--primary-color);
		color: white;
		border: none;
		border-radius: 1rem;
		cursor: pointer;
        font-weight: 600;
        text-decoration: none;
	}

    @media (max-width: 640px) {
        .details-grid, .steps {
            grid-template-columns: 1fr;
        }
    }
</style>
