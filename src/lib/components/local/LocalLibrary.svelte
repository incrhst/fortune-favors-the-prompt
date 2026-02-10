<script lang="ts">
	import { onMount } from 'svelte';
	import { localStore } from '$lib/stores/local';
	import { activeTab } from '$lib/stores/ui';
	import { Search, Plus, Trash2, Edit2, FolderPlus, Share2 } from 'lucide-svelte';

	let searchTerm = $state('');
	let selectedGroupId = $state<string | undefined>(undefined);
	let isEditing = $state<any | null>(null);
	let isCreating = $state(false);
	let newGroupModalOpen = $state(false);
	let newGroupName = $state('');

	let promptForm = $state({ text: '', category: '', tags: '' });

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const dataStr = params.get('data');
		if (dataStr) {
			try {
				const json = decodeURIComponent(atob(dataStr));
				const data = JSON.parse(json);
				if (data.prompts && Array.isArray(data.prompts)) {
					if (confirm(`Import ${data.prompts.length} prompts and ${data.groups?.length || 0} groups?`)) {
						localStore.importData(data);
						const newUrl = window.location.pathname;
						window.history.replaceState({}, '', newUrl);
						activeTab.set('local');
					}
				}
			} catch (e) {
				console.error('Failed to import data:', e);
				alert('Invalid share link.');
			}
		}
	});

	let filteredPrompts = $derived(
		$localStore.prompts.filter((p) => {
			const matchesGroup = selectedGroupId ? p.groupId === selectedGroupId : true;
			const searchLower = searchTerm.toLowerCase();
			const matchesSearch =
				p.text.toLowerCase().includes(searchLower) ||
				p.category.toLowerCase().includes(searchLower) ||
				p.tags.some((t) => t.toLowerCase().includes(searchLower));
			return matchesGroup && matchesSearch;
		})
	);

	function handleSavePrompt() {
		const tagsArray = promptForm.tags
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);

		if (isEditing) {
			localStore.updatePrompt(isEditing.id, {
				text: promptForm.text,
				category: promptForm.category,
				tags: tagsArray
			});
			isEditing = null;
		} else {
			const newPrompt = localStore.addPrompt(promptForm.text, promptForm.category, tagsArray);
			if (selectedGroupId) {
				localStore.addToGroup(newPrompt.id, selectedGroupId);
			}
			isCreating = false;
		}
		promptForm = { text: '', category: '', tags: '' };
	}

	function startEdit(prompt: any) {
		promptForm = {
			text: prompt.text,
			category: prompt.category,
			tags: prompt.tags.join(', ')
		};
		isEditing = prompt;
		isCreating = false;
	}

	function handleCreateGroup() {
		if (newGroupName.trim()) {
			localStore.createGroup(newGroupName.trim());
			newGroupName = '';
			newGroupModalOpen = false;
		}
	}

	function handleShare() {
		const dataToShare = {
			prompts: filteredPrompts,
			groups: selectedGroupId ? $localStore.groups.filter((g) => g.id === selectedGroupId) : []
		};
		const json = JSON.stringify(dataToShare);
		const encoded = btoa(encodeURIComponent(json));
		const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;

		navigator.clipboard.writeText(url).then(() => {
			alert('Share link copied to clipboard!');
		});
	}
</script>

{#if !$localStore.isLoaded}
	<div>Loading library...</div>
{:else}
	<div class="local-layout">
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="sidebar-header">
				<h3>My Library</h3>
				<button onclick={() => (newGroupModalOpen = true)} title="New Group">
					<FolderPlus size={18} />
				</button>
			</div>

			<ul class="group-list">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					onclick={() => (selectedGroupId = undefined)}
					class:active={selectedGroupId === undefined}
				>
					All Prompts
				</li>
				{#each $localStore.groups as group}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						onclick={() => (selectedGroupId = group.id)}
						class:active={selectedGroupId === group.id}
					>
						<span>{group.name}</span>
						{#if selectedGroupId === group.id}
							<button
								onclick={(e) => {
									e.stopPropagation();
									if (confirm('Delete group?')) localStore.deleteGroup(group.id);
								}}
								class="delete-btn"
							>
								<Trash2 size={14} />
							</button>
						{/if}
					</li>
				{/each}
			</ul>

			{#if newGroupModalOpen}
				<div class="modal">
					<input
						autofocus
						type="text"
						placeholder="Group Name"
						bind:value={newGroupName}
					/>
					<div class="modal-actions">
						<button onclick={handleCreateGroup}>Create</button>
						<button onclick={() => (newGroupModalOpen = false)}>Cancel</button>
					</div>
				</div>
			{/if}
		</aside>

		<!-- Main -->
		<main>
			<div class="toolbar">
				<div class="search-box">
					<div class="search-icon-wrapper">
						<Search size={18} />
					</div>
					<input
						type="text"
						placeholder="Search local prompts..."
						bind:value={searchTerm}
					/>
				</div>
				<button
					onclick={() => {
						isCreating = true;
						promptForm = { text: '', category: 'General', tags: '' };
					}}
					class="btn-primary"
				>
					<Plus size={18} /> New Prompt
				</button>
				<button onclick={handleShare} title="Share current view" class="btn-outline">
					<Share2 size={18} />
				</button>
			</div>

			{#if isCreating || isEditing}
				<div class="editor-card">
					<h3>{isEditing ? 'Edit Prompt' : 'New Prompt'}</h3>
					<textarea
						bind:value={promptForm.text}
						placeholder="Enter your prompt text here..."
					></textarea>
					<div class="editor-row">
						<input
							type="text"
							placeholder="Category (e.g. Coding)"
							bind:value={promptForm.category}
						/>
						<input
							type="text"
							placeholder="Tags (comma separated)"
							bind:value={promptForm.tags}
						/>
					</div>
					<div class="editor-actions">
						<button onclick={() => { isCreating = false; isEditing = null; }}>Cancel</button>
						<button onclick={handleSavePrompt} class="save-btn">Save Prompt</button>
					</div>
				</div>
			{/if}

			<div class="prompt-grid">
				{#each filteredPrompts as prompt (prompt.id)}
					<div class="card prompt-card">
						<div class="card-actions">
							<button onclick={() => startEdit(prompt)} title="Edit">
								<Edit2 size={16} />
							</button>
							<button
								onclick={() => {
									if (confirm('Delete this prompt?')) localStore.deletePrompt(prompt.id);
								}}
								class="delete-btn"
								title="Delete"
							>
								<Trash2 size={16} />
							</button>
						</div>

						<span class="badge">{prompt.category}</span>
						<p>{prompt.text}</p>

						<div class="tags">
							{#each prompt.tags as tag}
								<span>#{tag}</span>
							{/each}
						</div>
					</div>
				{/each}

				{#if filteredPrompts.length === 0 && !isCreating}
					<div class="empty-state">
						<p>No prompts found. Create one to get started!</p>
					</div>
				{/if}
			</div>
		</main>
	</div>
{/if}

<style>
	.local-layout {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: 2rem;
		min-height: 600px;
	}

	.sidebar {
		border-right: 1px solid var(--border-light);
		padding-right: 1rem;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.sidebar-header h3 { margin: 0; }
	.sidebar-header button { background: none; border: none; cursor: pointer; color: var(--text-secondary); }

	.group-list { list-style: none; padding: 0; }
	.group-list li {
		padding: 0.5rem;
		cursor: pointer;
		border-radius: 6px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: background 0.2s;
	}
	.group-list li:hover { background-color: var(--bg-secondary); }
	.group-list li.active {
		background-color: var(--bg-secondary);
		font-weight: bold;
		color: var(--brown-accent);
	}

	.delete-btn { border: none; background: none; color: #ef4444; cursor: pointer; padding: 0; display: flex; align-items: center; }

	.modal { padding: 1rem; background: var(--surface-card); border: 1px solid var(--border-light); border-radius: 8px; margin-top: 1rem; }
	.modal input { width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; border: 1px solid var(--border-light); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); }
	.modal-actions { display: flex; gap: 0.5rem; }
	.modal-actions button { flex: 1; padding: 0.25rem; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-light); background: var(--bg-secondary); color: var(--text-primary); }

	.toolbar { display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; }
	.search-box { flex: 1; position: relative; }
	.search-box input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.5rem; border-radius: 8px; border: 1px solid var(--border-light); background: var(--surface-card); color: var(--text-primary); }
	.search-icon-wrapper { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex; }

	.btn-primary {
		display: flex; align-items: center; gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--brown-dark);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.btn-outline { padding: 0.75rem; border: 1px solid var(--border-light); border-radius: 8px; background: var(--surface-card); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; }

	.editor-card {
		background: var(--surface-card); padding: 1.5rem; border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 2rem;
		border: 1px solid var(--border-light);
	}
	.editor-card h3 { margin-top: 0; margin-bottom: 1rem; }
	.editor-card textarea { width: 100%; min-height: 100px; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid var(--border-light); background: var(--bg-primary); color: var(--text-primary); resize: vertical; }
	.editor-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
	.editor-row input { padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-light); background: var(--bg-primary); color: var(--text-primary); }
	.editor-actions { display: flex; gap: 1rem; justify-content: flex-end; }
	.editor-actions button { padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--border-light); border-radius: 6px; cursor: pointer; color: var(--text-primary); }
	.save-btn { background: var(--brown-accent) !important; color: white !important; border: none !important; }

	.prompt-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
	.prompt-card { position: relative; padding: 1.5rem; background: var(--surface-card); border: 1px solid var(--border-light); border-radius: 12px; }
	.card-actions { position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; }
	.card-actions button { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.25rem; display: flex; align-items: center; }

	.badge { margin-bottom: 1rem; display: inline-block; font-size: 0.8rem; padding: 0.25rem 0.5rem; background: var(--bg-secondary); border-radius: 4px; color: var(--text-secondary); }
	.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); margin-top: 1rem; }
	.tags span { background: var(--bg-secondary); padding: 0.2rem 0.5rem; border-radius: 4px; }
	.empty-state { grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted); }
</style>
