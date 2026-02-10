<script lang="ts">
	import { enhance } from '$app/forms';
	import { Sparkles, ArrowRight, CheckCircle, ChevronLeft } from 'lucide-svelte';
    import { fade, slide } from 'svelte/transition';

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
	<title>Submit for Guest Spotlight | Prompt Library</title>
</svelte:head>

<div class="container" in:fade>
	<header>
		<a href="/" class="back-link">
			<ChevronLeft size={18} />
			Back to Library
		</a>
		<h1>Guest Spotlight</h1>
		<p>Share your most effective prompts to be featured in our curated community spotlight.</p>
	</header>

	{#if submitted}
		<div class="success-message animate-in">
			<CheckCircle size={56} />
			<h3>Submission Received!</h3>
			<p>Thank you for contributing. Our curators will review your prompt for the next community spotlight.</p>
			<a href="/" class="btn-primary">Return to Library</a>
		</div>
	{:else}
		<div class="card main-form-card animate-in">
			{#if error}
				<div class="error-box">
					{error}
				</div>
			{/if}

			<form method="POST" use:enhance>
				<div class="form-group grid-full">
					<label for="text">Your Prompt</label>
					<textarea
						id="text"
						name="text"
						bind:value={textValue}
						oninput={handleInput}
						placeholder="Paste your prompt instructions here..."
						required
					></textarea>
				</div>

				<!-- AI Suggestions Section -->
				{#if textValue.trim().length > 50 || aiSuggestions}
					<div class="ai-suggestion-container" transition:slide>
						<div class="ai-header">
							<Sparkles size={18} />
							<span>Smart Suggestions</span>
						</div>

						{#if isLoadingSuggestions}
							<div class="loading">
								<div class="spinner"></div>
								<span>Analyzing prompt structure...</span>
							</div>
						{:else if aiSuggestions}
							<div class="suggestions-grid">
								<div class="form-group">
									<label for="suggested_title">Generated Title</label>
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

								<div class="form-group grid-full">
									<label for="tags">Tags (Keywords)</label>
									<input
										type="text"
										id="tags"
										name="tags"
										value={tagsString}
										placeholder="e.g., system-role, creative-writing"
									/>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<div class="personal-grid">
					<div class="form-group">
						<label for="guest_name">Display Name</label>
						<input
							type="text"
							id="guest_name"
							name="guest_name"
							placeholder="How should we credit you?"
							required
						/>
					</div>

					<div class="form-group">
						<label for="guest_email">Contact Email (Private)</label>
						<input
							type="email"
							id="guest_email"
							name="guest_email"
							placeholder="We'll notify you of approval"
						/>
					</div>
				</div>

				<button type="submit" class="btn-submit">
					<span>Submit to Spotlight</span>
					<ArrowRight size={20} />
				</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	header {
		margin-bottom: 3.5rem;
		text-align: center;
	}

	.back-link {
		color: var(--text-secondary);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
		font-weight: 500;
	}

	header h1 {
		font-size: 3.5rem;
		margin: 0 0 1rem 0;
		color: var(--text-primary);
        font-weight: 800;
        letter-spacing: -0.03em;
	}

    header p {
        font-size: 1.125rem;
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
    }

	.main-form-card {
		background: var(--bg-secondary);
		padding: 3rem;
		border-radius: 2.5rem;
		border: 1px solid var(--border-color);
		box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.1);
	}

	.error-box {
		background: #fef2f2;
		border: 1px solid #fee2e2;
		color: #dc2626;
		padding: 1rem;
		border-radius: 1rem;
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 2rem;
	}

    .grid-full {
        grid-column: 1 / -1;
    }

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
        font-size: 0.9375rem;
	}

	textarea,
	input {
		width: 100%;
		padding: 1rem 1.25rem;
		border-radius: 1rem;
		border: 1px solid var(--border-color);
		font-size: 1rem;
		box-sizing: border-box;
		background: var(--bg-primary);
		color: var(--text-primary);
        transition: all 0.2s;
	}

	textarea {
		min-height: 200px;
		resize: vertical;
        line-height: 1.6;
	}

	textarea:focus,
	input:focus {
		outline: none;
		border-color: var(--brown-accent);
		background: var(--bg-primary);
        box-shadow: 0 0 0 4px rgba(139, 92, 46, 0.1);
	}

	.ai-suggestion-container {
		background: var(--bg-tertiary);
		padding: 2rem;
		border-radius: 1.5rem;
		margin-bottom: 2.5rem;
        border: 1px dashed var(--border-color);
	}

	.ai-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
		color: var(--brown-accent);
		margin-bottom: 1.5rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
	}

    .suggestions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }

	.loading {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: var(--text-muted);
        padding: 1rem 0;
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 3px solid var(--border-color);
		border-top-color: var(--brown-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

    .personal-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-top: 1rem;
    }

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.btn-submit {
		width: 100%;
		padding: 1.25rem;
		background: var(--brown-accent);
		color: white;
		border: none;
		border-radius: 1.25rem;
		font-size: 1.125rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		transition: all 0.3s;
        box-shadow: 0 10px 20px -5px rgba(139, 92, 46, 0.3);
        margin-top: 1rem;
	}

	.btn-submit:hover {
		transform: translateY(-3px);
        box-shadow: 0 15px 30px -8px rgba(139, 92, 46, 0.4);
        filter: brightness(1.1);
	}
    
    .btn-primary {
		padding: 1rem 2.5rem;
		background: var(--brown-accent);
		color: white;
		border: none;
		border-radius: 1rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
        display: inline-block;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(139, 92, 46, 0.2);
        transition: all 0.2s;
	}

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(139, 92, 46, 0.3);
    }

	.success-message {
		text-align: center;
		padding: 5rem 3rem;
		background: var(--bg-secondary);
		border-radius: 3rem;
		color: var(--text-primary);
        border: 1px solid var(--border-color);
	}

    .success-message h3 {
        font-size: 2rem;
        font-weight: 800;
        margin: 1.5rem 0 1rem;
    }

    .success-message p {
        color: var(--text-secondary);
        margin-bottom: 2.5rem;
        line-height: 1.6;
    }

    .success-message :global(svg) {
        color: #10b981;
    }

    .btn-primary {
		padding: 1rem 2.5rem;
		background: var(--primary-color);
		color: white;
		border: none;
		border-radius: 1rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
        display: inline-block;
        text-decoration: none;
	}

	.animate-in {
		animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

    @media (max-width: 640px) {
        .suggestions-grid, .personal-grid {
            grid-template-columns: 1fr;
        }
        .main-form-card {
            padding: 2rem;
        }
        header h1 {
            font-size: 2.5rem;
        }
    }
</style>
