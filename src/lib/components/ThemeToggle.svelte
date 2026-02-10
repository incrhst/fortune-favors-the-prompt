<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { Sun, Moon, Laptop } from 'lucide-svelte';

	const themes: { value: 'light' | 'dark' | 'system'; icon: any; label: string }[] = [
		{ value: 'light', icon: Sun, label: 'Light' },
		{ value: 'dark', icon: Moon, label: 'Dark' },
		{ value: 'system', icon: Laptop, label: 'System' }
	];
</script>

<div class="theme-toggle">
	{#each themes as t}
		<button
			onclick={() => theme.set(t.value)}
			class:active={$theme === t.value}
			title={t.label}
			aria-label={`Switch to ${t.label} theme`}
		>
			<t.icon size={16} />
		</button>
	{/each}
</div>

<style>
	.theme-toggle {
		display: flex;
		background: var(--bg-secondary);
		padding: 0.25rem;
		border-radius: 12px;
		gap: 0.25rem;
		width: fit-content;
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	button:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	:global(.dark) button:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	button.active {
		background: var(--surface-card);
		color: var(--brown-accent);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
</style>
