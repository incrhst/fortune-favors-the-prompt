<script lang="ts">
	import { activeTab } from '$lib/stores/ui';
    import { auth } from '$lib/stores/auth';
	import LibraryTabs from '$lib/components/LibraryTabs.svelte';
	import LocalLibrary from '$lib/components/local/LocalLibrary.svelte';
	import { Clock, User, GitFork, Star, Verified } from 'lucide-svelte';
    import { fade } from 'svelte/transition';

	let { data } = $props();

	let searchTerm = $state('');

	function formatTimeAgo(dateStr: string): string {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
		return 'Just now';
	}

	let filteredPrompts = $derived(
		(data.prompts || []).filter((prompt: any) => {
			const term = searchTerm.toLowerCase();
			return (
				(prompt.title || '').toLowerCase().includes(term) ||
                (prompt.description || '').toLowerCase().includes(term) ||
				(prompt.category || '').toLowerCase().includes(term) ||
				(prompt.tags || []).some((t: string) => t.toLowerCase().includes(term))
			);
		})
	);

    async function forkPrompt(gistId: string) {
        if (!$auth.user) {
            window.location.href = '/auth/login';
            return;
        }

        try {
            const res = await fetch(`/api/library/fork/${gistId}`, { method: 'POST' });
            if (res.ok) {
                // Success - we might want to show a toast or change the tab
                alert('Prompt forked to your personal library!');
            }
        } catch (e) {
            console.error('Fork failed', e);
        }
    }
</script>

<svelte:head>
	<title>Prompt Library | Curated Community</title>
	<meta
		name="description"
		content="Discover the top 5% of AI prompts curated by the community for high-quality results."
	/>
</svelte:head>

<div class="container">
	<header>
		<h1>Favored Prompts</h1>
		<p>Discover and save the world's most effective AI prompts</p>
		<nav>
			<a href="/" class="active">Library</a>
			<a href="/submit">Submit for Curation</a>
		</nav>
	</header>

	<LibraryTabs />

	{#if $activeTab === 'community'}
		<div id="community-view" in:fade>
			<!-- Search -->
			<div class="search-container">
				<svg
					class="search-icon"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search curated prompts, categories, or tags..."
				/>
			</div>

			{#if data.error}
				<div class="card error-card">
					{data.error}
				</div>
			{/if}

			{#if filteredPrompts.length === 0 && !data.error}
				<div class="card empty-card">
					<h3>No curated prompts found</h3>
					<p>
						Adjust your search or <a href="/submit" class="accent-link">nominate a prompt</a>.
					</p>
				</div>
			{/if}

			<!-- Prompts Grid -->
			<div class="prompt-grid">
				{#each filteredPrompts as prompt, index (prompt.id)}
					<div
						class="prompt-card animate-in"
						style="animation-delay: {index * 0.05}s;"
					>
                        <div class="card-header">
                            {#if prompt.category}
                                <span class="badge">
                                    {prompt.category}
                                </span>
                            {/if}
                            {#if prompt.is_verified}
                                <span class="verified-icon" title="Verified Quality">
                                    <Verified size={18} />
                                </span>
                            {/if}
                        </div>

						<a href="/community/prompt/{prompt.gist_id}" class="prompt-link">
                            <h3 class="prompt-title">
                                {prompt.title}
                            </h3>

                            <p class="prompt-description">
                                {prompt.description || 'No description provided.'}
                            </p>
                        </a>

						{#if prompt.tags && prompt.tags.length > 0}
							<div class="tags-container">
								{#each prompt.tags.slice(0, 4) as tag}
									<span class="tag">#{tag}</span>
								{/each}
							</div>
						{/if}

						<div class="card-footer">
							<div class="author-info">
								<img src={prompt.author_avatar_url || 'https://github.com/identicons/null.png'} alt={prompt.author_username} class="mini-avatar" />
								<span class="author-name">@{prompt.author_username}</span>
							</div>
                            
                            <div class="actions">
                                <button class="action-btn fork" onclick={() => forkPrompt(prompt.gist_id)}>
                                    <GitFork size={16} />
                                    <span>Fork</span>
                                </button>
                            </div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<LocalLibrary />
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		margin-bottom: 3rem;
	}

	header h1 {
		font-size: 4rem;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
		letter-spacing: -2px;
	}

	header p {
		font-size: 1.25rem;
		color: var(--text-secondary);
		max-width: 600px;
	}

	nav {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	nav a {
		text-decoration: none;
		color: var(--text-secondary);
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	nav a:hover, nav a.active {
		background: var(--primary-color);
		color: white;
	}

	.search-container {
		position: relative;
		margin-bottom: 2rem;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-container input {
		width: 100%;
		padding: 1rem 1rem 1rem 3rem;
		border-radius: 1rem;
		border: 1px solid var(--border-color);
		background: var(--bg-secondary);
		font-size: 1rem;
		color: var(--text-primary);
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.search-container input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.1);
        background: var(--bg-primary);
	}

	.prompt-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.prompt-card {
		background: var(--bg-secondary);
		border-radius: 1.5rem;
		padding: 1.75rem;
		border: 1px solid var(--border-color);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.prompt-card:hover {
		transform: translateY(-6px);
		box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.15);
		border-color: var(--primary-color);
        background: var(--bg-primary);
	}

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
    }

	.badge {
		background: rgba(var(--primary-color-rgb), 0.1);
		color: var(--primary-color);
		padding: 0.35rem 0.75rem;
		border-radius: 100px;
		font-size: 0.75rem;
		font-weight: 600;
	}

    .verified-icon {
        color: #3b82f6;
    }

	.prompt-title {
		font-size: 1.25rem;
		margin-bottom: 0.75rem;
		line-height: 1.4;
		color: var(--text-primary);
        font-weight: 700;
	}

    .prompt-link {
        text-decoration: none;
        display: block;
        flex-grow: 1;
    }

	.prompt-description {
		font-size: 0.9375rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 1.5rem;
		flex-grow: 1;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.tag {
		color: var(--text-muted);
		font-size: 0.8rem;
		font-weight: 500;
		background: var(--bg-tertiary);
		padding: 0.2rem 0.6rem;
		border-radius: 6px;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1.25rem;
		border-top: 1px solid var(--border-color);
	}

	.author-info {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

    .mini-avatar {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
    }

	.author-name {
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

    .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.8rem;
        border-radius: 0.75rem;
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn:hover {
        background: var(--bg-hover);
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

	.animate-in {
		animation: slideUp 0.4s ease forwards;
		opacity: 0;
	}

    .error-card {
        text-align: center;
        color: #ef4444;
        padding: 2rem;
    }

    .empty-card {
        text-align: center;
        padding: 4rem 2rem;
    }

    .accent-link {
        color: var(--primary-color);
        text-decoration: underline;
    }

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(15px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
