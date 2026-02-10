<script lang="ts">
	import '../styles/global.css';
	let { children } = $props();
</script>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
