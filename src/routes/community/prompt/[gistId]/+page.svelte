<script lang="ts">
    import { auth } from '$lib/stores/auth';
	import { ChevronLeft, Clock, User, MessageSquare, ArrowRight, CheckCircle, GitFork, Verified, Star } from 'lucide-svelte';
    import { fade } from 'svelte/transition';

	let { data, form } = $props();

	let prompt = $derived(data.prompt);
	let discussions = $derived(data.discussions);

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

    async function forkPrompt() {
        if (!$auth.user) {
            window.location.href = '/auth/login';
            return;
        }

        try {
            const res = await fetch(`/api/library/fork/${prompt.gist_id}`, { method: 'POST' });
            if (res.ok) {
                alert('Prompt forked to your personal library!');
            }
        } catch (e) {
            console.error('Fork failed', e);
        }
    }
</script>

<svelte:head>
	<title>{prompt.title} | Community Prompt</title>
</svelte:head>

<div class="container" in:fade>
	<header>
		<a href="/" class="back-link">
			<ChevronLeft size={18} />
			Back to Community
		</a>
		<h1>{prompt.title}</h1>
	</header>

	<div class="layout">
		<main>
			<div class="card main-card">
				<div class="card-header">
					{#if prompt.category}
						<span class="badge">
							{prompt.category}
						</span>
					{/if}
                    {#if prompt.is_verified}
                        <span class="verified-badge">
                            <Verified size={16} />
                            Verified Quality
                        </span>
                    {/if}
				</div>

				<div class="prompt-content">
					<p>{prompt.description}</p>
                    <div class="code-block">
                        <pre><code>{prompt.text || 'Loading content...'}</code></pre>
                    </div>
				</div>

				{#if prompt.tags && prompt.tags.length > 0}
					<div class="tags-container">
						{#each prompt.tags as tag}
							<span class="tag">#{tag}</span>
						{/each}
					</div>
				{/if}

				<div class="meta-footer">
					<div class="author-info">
						<img src={prompt.author_avatar_url || 'https://github.com/identicons/null.png'} alt={prompt.author_username} class="avatar" />
						<div class="author-details">
							<span class="name">@{prompt.author_username}</span>
							<span class="date">Nominated {formatTimeAgo(prompt.created_at)}</span>
						</div>
					</div>
					
                    <div class="stats">
                        <div class="stat">
                            <Star size={18} />
                            <span>{prompt.quality_score}</span>
                        </div>
                    </div>
				</div>
			</div>

			<section class="discussion-section">
				<h2>
					<MessageSquare size={22} />
					Discussion ({discussions.length})
				</h2>

				<div class="comments-list">
					{#if discussions.length === 0}
						<div class="empty-comments">
							<p>No comments yet. Be the first to start the discussion!</p>
						</div>
					{/if}

					{#each discussions as comment}
						<div class="comment-card">
							<div class="comment-header">
								<span class="author">@{comment.author}</span>
								<span class="time">{formatTimeAgo(comment.created_at)}</span>
							</div>
							<p>{comment.text}</p>
						</div>
					{/each}
				</div>
                
                <div class="add-comment">
                    <p class="login-msg">Log in to join the discussion.</p>
                </div>
			</section>
		</main>

		<aside class="sidebar">
			<div class="action-card">
				<h3>Use this Prompt</h3>
				<p>Save this prompt to your personal library to use it in your own projects.</p>
				<button class="btn-primary" onclick={forkPrompt}>
					<GitFork size={20} />
					Fork to Library
				</button>
			</div>

            <div class="info-card">
                <h3>Quality Score</h3>
                <div class="score-display">
                    <span class="score-value">{prompt.quality_score}</span>
                    <span class="score-label">Community Rating</span>
                </div>
                <div class="score-bar">
                    <div class="score-progress" style="width: {Math.min(100, prompt.quality_score * 10)}%"></div>
                </div>
            </div>
		</aside>
	</div>
</div>

<style>
	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		margin-bottom: 2.5rem;
	}

	.back-link {
		color: var(--text-secondary);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-weight: 500;
        transition: color 0.2s;
	}

    .back-link:hover {
        color: var(--primary-color);
    }

	header h1 {
		font-size: 2.5rem;
		margin: 0;
		color: var(--text-primary);
        font-weight: 800;
        letter-spacing: -0.02em;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 2.5rem;
	}

	.main-card {
		background: var(--bg-secondary);
		padding: 2.5rem;
		border-radius: 2rem;
		border: 1px solid var(--border-color);
        margin-bottom: 3rem;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.badge {
		background: rgba(var(--primary-color-rgb), 0.1);
		color: var(--primary-color);
		padding: 0.4rem 0.9rem;
		border-radius: 100px;
		font-size: 0.8125rem;
		font-weight: 700;
	}

    .verified-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #3b82f6;
        font-size: 0.875rem;
        font-weight: 600;
        background: rgba(59, 130, 246, 0.1);
        padding: 0.4rem 0.9rem;
        border-radius: 100px;
    }

	.prompt-content {
		margin-bottom: 2.5rem;
	}

    .prompt-content p {
        font-size: 1.125rem;
        line-height: 1.6;
        color: var(--text-secondary);
        margin-bottom: 2rem;
    }

    .code-block {
        background: var(--bg-primary);
        padding: 1.5rem;
        border-radius: 1rem;
        border: 1px solid var(--border-color);
        overflow-x: auto;
    }

    .code-block pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-all;
    }

    .code-block code {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.9375rem;
        color: var(--text-primary);
    }

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 2.5rem;
	}

	.tag {
		color: var(--text-muted);
		font-size: 0.875rem;
		font-weight: 500;
		background: var(--bg-tertiary);
		padding: 0.35rem 0.85rem;
		border-radius: 0.75rem;
	}

	.meta-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 2rem;
		border-top: 1px solid var(--border-color);
	}

	.author-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

    .avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        border: 2px solid var(--bg-primary);
    }

    .author-details {
        display: flex;
        flex-direction: column;
    }

	.author-details .name {
		font-weight: 700;
		color: var(--text-primary);
	}

    .author-details .date {
        font-size: 0.8125rem;
        color: var(--text-muted);
    }

    .stats {
        display: flex;
        gap: 1.5rem;
    }

    .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #f59e0b;
        font-weight: 700;
        font-size: 1.125rem;
    }

	.discussion-section h2 {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		font-size: 1.75rem;
		color: var(--text-primary);
		margin-bottom: 2rem;
        font-weight: 800;
	}

    .comment-card {
        background: var(--bg-secondary);
        padding: 1.5rem;
        border-radius: 1.25rem;
        border: 1px solid var(--border-color);
        margin-bottom: 1rem;
    }

    .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
    }

    .comment-header .author {
        font-weight: 700;
        color: var(--text-primary);
    }

    .comment-header .time {
        font-size: 0.8125rem;
        color: var(--text-muted);
    }

    .comment-card p {
        margin: 0;
        line-height: 1.5;
        color: var(--text-secondary);
    }

    .empty-comments {
        padding: 3rem;
        text-align: center;
        background: var(--bg-secondary);
        border-radius: 1.25rem;
        border: 2px dashed var(--border-color);
        color: var(--text-muted);
    }

    .add-comment {
        margin-top: 2rem;
        padding: 1.5rem;
        background: var(--bg-tertiary);
        border-radius: 1.25rem;
        text-align: center;
    }

    .login-msg {
        color: var(--text-muted);
        font-weight: 500;
    }

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.action-card, .info-card {
		background: var(--bg-secondary);
		padding: 1.75rem;
		border-radius: 1.5rem;
		border: 1px solid var(--border-color);
	}

	.action-card h3, .info-card h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.125rem;
        font-weight: 700;
	}

	.action-card p {
		font-size: 0.9375rem;
		color: var(--text-secondary);
		line-height: 1.5;
		margin-bottom: 1.5rem;
	}

	.btn-primary {
		width: 100%;
		padding: 1rem;
		background: var(--primary-color);
		color: white;
		border: none;
		border-radius: 1rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(var(--primary-color-rgb), 0.3);
        filter: brightness(1.1);
	}

    .score-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 1.25rem;
    }

    .score-value {
        font-size: 3rem;
        font-weight: 800;
        color: #f59e0b;
        line-height: 1;
    }

    .score-label {
        font-size: 0.8125rem;
        color: var(--text-muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .score-bar {
        height: 8px;
        background: var(--bg-tertiary);
        border-radius: 4px;
        overflow: hidden;
    }

    .score-progress {
        height: 100%;
        background: #f59e0b;
        border-radius: 4px;
    }

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
		.sidebar {
			order: -1;
		}
	}
</style>
