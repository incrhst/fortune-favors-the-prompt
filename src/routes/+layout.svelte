<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import '../styles/global.css';
	let { children } = $props();

	onMount(() => {
		theme.init();
	});
</script>

<div class="fixed-theme-toggle">
	<ThemeToggle />
</div>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.fixed-theme-toggle {
		position: fixed;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 1000;
	}
</style>
