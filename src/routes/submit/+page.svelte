<script lang="ts">
	import { enhance } from '$app/forms';
	import { Sparkles, ArrowRight, CheckCircle } from 'lucide-svelte';

	let { form } = $props();

	let submitted = $derived(form?.success);
	let error = $derived(form?.error);

	let textValue = $state('');
	let aiSuggestions = $state<{ suggestedTitle?: string; category?: string; tags?: string[] } | null>(null);
	let isLoadingSuggestions = $state(false);
	let debounceTimer: any;

	function handleInput() {
		if (textValue.trim().length > 50) {
			isLoadingSuggestions = true;
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(fetchSuggestions, 1000);
		} else {
			aiSuggestions = null;
			isLoadingSuggestions = false;
		}
	}

	async function fetchSuggestions() {
		try {
			const response = await fetch('/api/classify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: textValue })
			});

			if (!response.ok) throw new Error('Failed to classify');

			const data = await response.json();
			aiSuggestions = data;
		} catch (err) {
			console.error('Classification error:', err);
		} finally {
			isLoadingSuggestions = false;
		}
	}

	let tagsString = $derived(aiSuggestions?.tags?.join(', ') || '');
</script>

<svelte:head>
	<title>Submit a Prompt | Prompt Library</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Submit a Prompt</h1>
		<p>Share your favorite prompts for discussion on the show</p>
		<nav>
			<a href="/">Library</a>
			<a href="/submit" class="active">Submit a Prompt</a>
		</nav>
	</header>

	{#if submitted}
		<div class="success-message animate-in">
			<CheckCircle size={48} />
			<h3>🎉 Prompt Submitted!</h3>
			<p>Thank you for your submission. It will be reviewed and added to the library soon.</p>
			<a href="/" class="back-link"> ← Back to Library </a>
		</div>
	{:else}
		<div class="card animate-in" style="max-width: 700px; margin: 0 auto;">
			{#if error}
				<div class="error-box">
					{error}
				</div>
			{/if}

			<form method="POST" use:enhance>
				<div class="form-group">
					<label for="text">Your Prompt *</label>
					<textarea
						id="text"
						name="text"
						bind:value={textValue}
						oninput={handleInput}
						placeholder="Paste your prompt here... We'll suggest a title and categorize it for you!"
						required
					></textarea>
				</div>

				<!-- AI Suggestions Section -->
				{#if textValue.trim().length > 50 || aiSuggestions}
					<div class="ai-suggestion">
						<h3>
							<Sparkles size={20} />
							AI Suggestions
						</h3>

						{#if isLoadingSuggestions}
							<div class="loading">
								<div class="spinner"></div>
								<span>Analyzing your prompt...</span>
							</div>
						{:else if aiSuggestions}
							<div class="suggestions-content">
								<div class="form-group">
									<label for="suggested_title">Suggested Title</label>
									<input
										type="text"
										id="suggested_title"
										name="suggested_title"
										value={aiSuggestions.suggestedTitle}
									/>
								</div>

								<div class="form-group">
									<label for="category">Category</label>
									<input
										type="text"
										id="category"
										name="category"
										value={aiSuggestions.category}
									/>
								</div>

								<div class="form-group">
									<label for="tags">Tags (comma-separated)</label>
									<input
										type="text"
										id="tags"
										name="tags"
										value={tagsString}
										placeholder="e.g., performance, react, debugging"
									/>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<div class="form-group">
					<label for="guest_name">Your Name *</label>
					<input
						type="text"
						id="guest_name"
						name="guest_name"
						placeholder="How should we credit you?"
						required
					/>
				</div>

				<div class="form-group">
					<label for="guest_email">Email (optional)</label>
					<input
						type="email"
						id="guest_email"
						name="guest_email"
						placeholder="We'll notify you when your prompt is approved"
					/>
				</div>

				<button type="submit" class="btn-submit">
					Submit Prompt
					<ArrowRight size={18} />
				</button>
			</form>
		</div>
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
		font-size: 3rem;
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

	nav a.active {
		color: var(--brown-accent);
		border-bottom-color: var(--brown-accent);
	}

	nav a:hover {
		background: var(--brown-accent);
		color: white !important;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		margin: -0.5rem -1rem;
		border-bottom-color: transparent;
	}

	nav a.active:hover {
		color: white !important;
	}

	.card {
		background: var(--surface-card);
		padding: 2rem;
		border-radius: 24px;
		border: 1px solid var(--border-light);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
	}

	.error-box {
		background: #fef2f2;
		border: 1px solid #fee2e2;
		color: #dc2626;
		padding: 1rem;
		border-radius: 12px;
		margin-bottom: 1.5rem;
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

	textarea,
	input {
		width: 100%;
		padding: 1rem;
		border-radius: 12px;
		border: 1px solid var(--border-light);
		font-size: 1rem;
		box-sizing: border-box;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	textarea {
		min-height: 150px;
		resize: vertical;
	}

	textarea:focus,
	input:focus {
		outline: none;
		border-color: var(--brown-accent);
		background: var(--surface-card);
	}

	.ai-suggestion {
		background: var(--bg-secondary);
		border: 1px solid var(--border-medium);
		padding: 1.5rem;
		border-radius: 16px;
		margin-bottom: 1.5rem;
	}

	.ai-suggestion h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		color: var(--brown-accent);
		margin: 0 0 1rem 0;
	}

	.loading {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--brown-medium);
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(139, 92, 46, 0.1);
		border-top-color: var(--brown-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.btn-submit {
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

	.btn-submit:hover {
		background: var(--brown-accent);
		transform: translateY(-2px);
	}

	.success-message {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--brown-accent);
		border-radius: 32px;
		color: white;
	}

    :global(.success-message svg) {
        margin-bottom: 1.5rem;
    }

	.back-link {
		color: white;
		text-decoration: underline;
		margin-top: 1rem;
		display: inline-block;
		font-weight: 600;
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
