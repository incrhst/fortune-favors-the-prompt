<script lang="ts">
	import { onMount } from 'svelte';
    import { browser } from '$app/environment';

	let time = $state(new Date().toISOString());

	onMount(() => {
		const timer = setInterval(() => {
			time = new Date().toISOString();
		}, 1000);
		return () => clearInterval(timer);
	});
</script>

<div class="debug-container">
	<h1>Debug Page Works!</h1>
	<p>If you can see this, the latest deployment is live.</p>
	<p>Time: {time}</p>
	<p>Environment: {browser ? 'Browser' : 'Server'}</p>
</div>

<style>
	.debug-container {
		font-family: system-ui, sans-serif;
		padding: 2rem;
		max-width: 600px;
		margin: 0 auto;
	}
</style>
