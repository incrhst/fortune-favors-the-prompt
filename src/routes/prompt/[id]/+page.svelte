<script lang="ts">
	import { enhance } from '$app/forms';
	import { ChevronLeft, Clock, User, MessageSquare, ArrowRight, CheckCircle } from 'lucide-svelte';

	let { data, form } = $props();

	let prompt = $derived(data.prompt);
	let discussions = $derived(data.discussions);
	let commentAdded = $derived(form?.success);
	let error = $derived(form?.error);

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
</script>

<svelte:head>
	<title>{prompt.suggested_title || 'Prompt Detail'} | Prompt Library</title>
</svelte:head>

<div class="container">
	<header>
		<a href="/" class="back-link">
			<ChevronLeft size={18} />
			Back to Library
		</a>
		<h1>
			{prompt.suggested_title || 'Prompt Detail'}
		</h1>
		<nav>
			<a href="/">Library</a>
			<a href="/submit">Submit a Prompt</a>
		</nav>
	</header>

	<div class="card animate-in" style="max-width: 800px; margin: 0 auto;">
		<!-- Category Badge -->
		{#if prompt.category}
			<span class="badge" style="margin-bottom: 1.5rem;">
				{prompt.category}
			</span>
		{/if}

		<!-- Prompt Text -->
		<div class="prompt-box">
			<p>{prompt.text}</p>
		</div>

		<!-- Tags -->
		{#if prompt.tags && prompt.tags.length > 0}
			<div class="tags-container">
				{#each prompt.tags as tag}
					<span class="tag">#{tag}</span>
				{/each}
			</div>
		{/if}

		<!-- Meta -->
		<div class="meta-row">
			<span class="meta">
				<Clock size={16} />
				{formatTimeAgo(prompt.created_at)}
			</span>
			<span class="meta author">
				<User size={16} />
				by {prompt.guest_name}
			</span>
		</div>

		<!-- Discussion Section -->
		<div class="discussion-section">
			<h2>
				<MessageSquare size={24} />
				Discussion ({discussions.length})
			</h2>

			{#if commentAdded}
				<div class="success-box">
					<CheckCircle size={20} />
					Comment added successfully!
				</div>
			{/if}

			{#if error}
				<div class="error-box">
					{error}
				</div>
			{/if}

			<!-- Existing Comments -->
			<div class="comments-list">
				{#if discussions.length === 0}
					<p class="empty-text">No comments yet. Start the discussion!</p>
				{/if}

				{#each discussions as comment}
					<div class="discussion-item">
						<div class="author-name">{comment.author}</div>
						<p>{comment.text}</p>
						<span class="meta time">
							{formatTimeAgo(comment.created_at)}
						</span>
					</div>
				{/each}
			</div>

			<!-- Add Comment Form -->
			<div class="comment-form-card">
				<form method="POST" action="?/addComment" use:enhance>
					<div class="form-group">
						<label for="author">Your Name</label>
						<input
							type="text"
							id="author"
							name="author"
							placeholder="How should we credit you?"
							required
						/>
					</div>

					<div class="form-group">
						<label for="comment-text">Your Comment</label>
						<textarea
							id="comment-text"
							name="text"
							placeholder="Add your thoughts or notes about this prompt..."
							required
						></textarea>
					</div>

					<button type="submit" class="btn-primary">
						Add Comment
						<ArrowRight size={18} />
					</button>
				</form>
			</div>
		</div>
	</div>
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

	.back-link {
		color: var(--brown-accent);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	nav {
		display: flex;
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	nav a {
		text-decoration: none;
		color: var(--text-secondary);
		font-weight: 600;
		padding-bottom: 0.25rem;
		border-bottom: 2px solid transparent;
		transition: all 0.2s ease;
	}

	nav a:hover {
		background: var(--brown-accent);
		color: white;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		margin: -0.5rem -1rem;
		border-bottom-color: transparent;
	}

	.card {
		background: var(--surface-card);
		padding: 2.5rem;
		border-radius: 24px;
		border: 1px solid var(--border-light);
	}

	.badge {
		background: var(--brown-light);
		color: var(--brown-accent);
		padding: 0.4rem 0.8rem;
		border-radius: 100px;
		font-size: 0.8rem;
		font-weight: 600;
		display: inline-block;
	}

	.prompt-box {
		background: var(--bg-secondary);
		padding: 2rem;
		border-radius: 16px;
		border-left: 4px solid var(--brown-accent);
		margin-bottom: 1.5rem;
	}

	.prompt-box p {
		font-size: 1.25rem;
		line-height: 1.7;
		color: var(--text-primary);
		margin: 0;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.tag {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 500;
		background: var(--bg-secondary);
		padding: 0.25rem 0.75rem;
		border-radius: 8px;
	}

	.meta-row {
		display: flex;
		gap: 2rem;
		padding: 1.5rem 0;
		border-top: 1px solid var(--border-light);
		border-bottom: 1px solid var(--border-light);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.author {
		color: var(--brown-accent);
	}

	.discussion-section {
		margin-top: 3rem;
	}

	.discussion-section h2 {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 1.5rem;
		color: var(--text-primary);
		margin-bottom: 2rem;
	}

	.success-box {
		background: #d1fae5;
		border: 1px solid #a7f3d0;
		color: #065f46;
		padding: 1rem;
		border-radius: 12px;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.error-box {
		background: #fef2f2;
		border: 1px solid #fee2e2;
		color: #dc2626;
		padding: 1rem;
		border-radius: 12px;
		margin-bottom: 1.5rem;
	}

	.comments-list {
		margin-bottom: 2.5rem;
	}

	.empty-text {
		color: #888;
		font-style: italic;
	}

	.discussion-item {
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-light);
	}

	.discussion-item:last-child {
		border-bottom: none;
	}

	.author-name {
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.discussion-item p {
		margin: 0;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	.time {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.comment-form-card {
		background: var(--bg-secondary);
		padding: 2rem;
		border-radius: 20px;
		border: 1px solid var(--border-medium);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--brown-dark);
	}

	input,
	textarea {
		width: 100%;
		padding: 0.8rem 1rem;
		border-radius: 12px;
		border: 1px solid var(--border-light);
		font-size: 1rem;
		box-sizing: border-box;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	textarea {
		min-height: 120px;
		resize: vertical;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--brown-accent);
		background: var(--surface-card);
	}

	.btn-primary {
		width: 100%;
		padding: 1rem;
		background: var(--brown-dark);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}

	.btn-primary:hover {
		background: var(--brown-accent);
	}

	.animate-in {
		animation: slideUp 0.5s ease forwards;
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
