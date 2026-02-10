<script lang="ts">
	import { activeTab } from '$lib/stores/ui';
	import LibraryTabs from '$lib/components/LibraryTabs.svelte';
	import LocalLibrary from '$lib/components/local/LocalLibrary.svelte';
	import { Clock, User } from 'lucide-svelte';

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
		data.prompts.filter((prompt: any) => {
			const term = searchTerm.toLowerCase();
			return (
				prompt.text.toLowerCase().includes(term) ||
				(prompt.suggested_title || '').toLowerCase().includes(term) ||
				(prompt.category || '').toLowerCase().includes(term) ||
				(prompt.tags || []).some((t: string) => t.toLowerCase().includes(term))
			);
		})
	);
</script>

<svelte:head>
	<title>Prompt Library | Guest Submissions</title>
	<meta
		name="description"
		content="A curated library of AI prompts submitted by show guests for discussion and inspiration."
	/>
</svelte:head>

<div class="container">
	<header>
		<h1>Favored Prompts</h1>
		<p>Your collection of prompts, ready to revisit and refine</p>
		<nav>
			<a href="/" class="active">Library</a>
			<a href="/submit">Submit a Prompt</a>
		</nav>
	</header>

	<LibraryTabs />

	{#if $activeTab === 'community'}
		<div id="community-view">
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
					placeholder="Search prompts, categories, or tags..."
				/>
			</div>

			{#if data.error}
				<div class="card" style="text-align: center; color: #ef4444;">
					{data.error}
				</div>
			{/if}

			{#if filteredPrompts.length === 0 && !data.error}
				<div class="card" style="text-align: center;">
					<h3>No prompts yet!</h3>
					<p style="margin: 1rem 0; color: var(--brown-medium);">
						Be the first to <a href="/submit" style="color: var(--brown-accent);"
							>submit a prompt</a
						> for discussion.
					</p>
				</div>
			{/if}

			<!-- Prompts Grid -->
			<div class="prompt-grid">
				{#each filteredPrompts as prompt, index (prompt.id)}
					<a
						href="/prompt/{prompt.id}"
						class="card animate-in"
						style="animation-delay: {index * 0.1}s; text-decoration: none; color: inherit; cursor: pointer;"
					>
						{#if prompt.category}
							<span class="badge" style="margin-bottom: 1rem;">
								{prompt.category}
							</span>
						{/if}

						<h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; line-height: 1.4;">
							{prompt.suggested_title || prompt.text.slice(0, 60) + '...'}
						</h3>

						<p
							style="color: var(--brown-medium); font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;"
						>
							{prompt.text}
						</p>

						{#if prompt.tags && prompt.tags.length > 0}
							<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
								{#each prompt.tags.slice(0, 3) as tag}
									<span class="tag">#{tag}</span>
								{/each}
							</div>
						{/if}

						<div
							style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-light);"
						>
							<span class="meta">
								<Clock size={14} />
								{formatTimeAgo(prompt.created_at)}
							</span>
							<span class="meta" style="color: var(--brown-accent);">
								<User size={14} style="display: inline; vertical-align: middle; margin-right: 4px;" />
								by {prompt.guest_name}
							</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{:else}
		<LocalLibrary />
	{/if}
</div>

<style>
	/* Use the existing styles from global.css, but adding some local overrides if needed */
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		margin-bottom: 3rem;
	}

	header h1 {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		color: var(--brown-dark);
	}

	nav {
		display: flex;
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	nav a {
		text-decoration: none;
		color: var(--brown-medium);
		font-weight: 600;
		padding-bottom: 0.25rem;
		border-bottom: 2px solid transparent;
		transition: all 0.2s ease;
	}

	nav a.active {
		color: var(--brown-accent);
		border-bottom-color: var(--brown-accent);
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
		color: var(--brown-medium);
		pointer-events: none;
	}

	.search-container input {
		width: 100%;
		padding: 1rem 1rem 1rem 3rem;
		border-radius: 12px;
		border: 1px solid var(--border-light);
		background: white;
		font-size: 1rem;
		color: var(--brown-dark);
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.search-container input:focus {
		outline: none;
		border-color: var(--brown-accent);
		box-shadow: 0 0 0 4px rgba(139, 92, 46, 0.1);
	}

	.prompt-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.card {
		background: white;
		padding: 1.5rem;
		border-radius: 20px;
		border: 1px solid var(--border-light);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px rgba(44, 24, 16, 0.08);
		border-color: var(--brown-accent);
	}

	.badge {
		background: var(--brown-light);
		color: var(--brown-accent);
		padding: 0.4rem 0.8rem;
		border-radius: 100px;
		font-size: 0.8rem;
		font-weight: 600;
		width: fit-content;
	}

	.tag {
		color: var(--brown-medium);
		font-size: 0.85rem;
		font-weight: 500;
		background: #f8f5f0;
		padding: 0.2rem 0.6rem;
		border-radius: 6px;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--brown-medium);
	}

	.animate-in {
		animation: slideUp 0.5s ease forwards;
		opacity: 0;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
