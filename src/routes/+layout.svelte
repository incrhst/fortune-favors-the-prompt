<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { setAuth } from '$lib/stores/auth';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import '../styles/global.css';
	
	let { children, data } = $props();

	onMount(() => {
		theme.init();
		setAuth(data.user);
	});
</script>

<div class="fixed-theme-toggle">
    <UserMenu />
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
