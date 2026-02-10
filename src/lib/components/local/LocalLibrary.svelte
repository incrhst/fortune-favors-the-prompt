<script lang="ts">
	import { onMount } from 'svelte';
	import { localStore } from '$lib/stores/local';
	import { auth } from '$lib/stores/auth';
	import { activeTab } from '$lib/stores/ui';
	import { Search, Plus, Trash2, Edit2, FolderPlus, Share2, RefreshCw, Cloud, Star, MoreVertical, FileUp } from 'lucide-svelte';
    import { fade, slide } from 'svelte/transition';

	let searchTerm = $state('');
	let selectedCollectionId = $state<string | undefined>(undefined);
	let isEditing = $state<any | null>(null);
	let isCreating = $state(false);
	let newCollectionModalOpen = $state(false);
	let newCollectionName = $state('');
    let fileInput = $state<HTMLInputElement | null>(null);
    let activeCollectionPromptId = $state<string | null>(null);

	let promptForm = $state({ text: '', category: '', tags: '' });

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const dataStr = params.get('data');
		if (dataStr) {
			try {
				const json = decodeURIComponent(atob(dataStr));
				const data = JSON.parse(json);
				if (data.prompts && Array.isArray(data.prompts)) {
					if (confirm(`Import ${data.prompts.length} prompts?`)) {
						localStore.importData(data);
						const newUrl = window.location.pathname;
						window.history.replaceState({}, '', newUrl);
						activeTab.set('local');
					}
				}
			} catch (e) {
				console.error('Failed to import data:', e);
			}
		}
	});

	let filteredPrompts = $derived(
		$localStore.prompts.filter((p) => {
			const matchesCollection = selectedCollectionId ? p.collectionIds.includes(selectedCollectionId) : true;
			const searchLower = searchTerm.toLowerCase();
			const matchesSearch =
				(p.text || '').toLowerCase().includes(searchLower) ||
                (p.title || '').toLowerCase().includes(searchLower) ||
				(p.category || '').toLowerCase().includes(searchLower) ||
				(p.tags || []).some((t) => t.toLowerCase().includes(searchLower));
			return matchesCollection && matchesSearch;
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
			const newPrompt = localStore.addPrompt(promptForm.text, promptForm.category, tagsArray, selectedCollectionId ? [selectedCollectionId] : []);
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

	function handleCreateCollection() {
		if (newCollectionName.trim()) {
			localStore.createCollection(newCollectionName.trim());
			newCollectionName = '';
			newCollectionModalOpen = false;
		}
	}

    function handleCsvImport(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            const lines = text.split('\n');
            const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
            
            const importedPrompts = lines.slice(1).filter(line => line.trim()).map(line => {
                // Simple CSV parsing (doesn't handle quoted commas, but good enough for now)
                const values = line.split(',').map(v => v.trim());
                const prompt: any = {};
                headers.forEach((header, i) => {
                    prompt[header] = values[i];
                });

                // Handle collections (semicolon-separated)
                let collectionIds: string[] = [];
                if (prompt.collections) {
                    const names = prompt.collections.split(';').map((n: string) => n.trim());
                    names.forEach((name: string) => {
                        if (!name) return;
                        // Find or create collection
                        let coll = $localStore.collections.find(c => c.name.toLowerCase() === name.toLowerCase());
                        if (!coll) {
                            coll = localStore.createCollection(name);
                        }
                        collectionIds.push(coll.id);
                    });
                }

                return {
                    text: prompt.text || prompt.content || '',
                    title: prompt.title || (prompt.text || '').slice(0, 50),
                    category: prompt.category || 'General',
                    tags: (prompt.tags || '').split(';').map((t: string) => t.trim()).filter(Boolean),
                    collectionIds
                };
            });

            if (confirm(`Import ${importedPrompts.length} prompts?`)) {
                importedPrompts.forEach(p => {
                    localStore.addPrompt(p.text, p.category, p.tags, p.collectionIds);
                });
            }
            if (fileInput) fileInput.value = '';
        };
        reader.readAsText(file);
    }

    function togglePromptCollection(promptId: string, collectionId: string) {
        localStore.toggleCollection(promptId, collectionId);
    }

    async function nominateToCommunity(prompt: any) {
        if (!$auth.user) return;
        
        if (!prompt.gistId) {
            alert('This prompt needs to be synced with GitHub before nominating.');
            return;
        }

        try {
            const res = await fetch('/api/community/nominate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gistId: prompt.gistId })
            });

            if (res.ok) {
                alert('Nomination submitted! The community will now vote on your prompt.');
            } else {
                const data = await res.json();
                alert(data.message || 'Nomination failed.');
            }
        } catch (e) {
            console.error('Nomination failed', e);
        }
    }

	function handleShare() {
		const dataToShare = {
			prompts: filteredPrompts
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
	<div class="loading-state">
        <RefreshCw size={24} class="spin" />
        <p>Syncing your library...</p>
    </div>
{:else}
	<div class="local-layout" in:fade>
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="sidebar-header">
				<h3>Collections</h3>
				<button onclick={() => (newCollectionModalOpen = true)} class="icon-btn" title="New Collection">
					<Plus size={18} />
				</button>
			</div>

			<ul class="collection-list">
				<li
					onclick={() => (selectedCollectionId = undefined)}
					class:active={selectedCollectionId === undefined}
				>
					<span>All Prompts</span>
                    <span class="count">{$localStore.prompts.length}</span>
				</li>
				{#each $localStore.collections as collection}
					<li
						onclick={() => (selectedCollectionId = collection.id)}
						class:active={selectedCollectionId === collection.id}
					>
                        <div class="collection-info">
                            <span class="dot" style="background: {collection.color}"></span>
						    <span>{collection.name}</span>
                        </div>
						<div class="collection-actions">
                            <span class="count">{$localStore.prompts.filter(p => p.collectionIds.includes(collection.id)).length}</span>
							<button
								onclick={(e) => {
									e.stopPropagation();
									if (confirm('Delete collection?')) localStore.deleteCollection(collection.id);
								}}
								class="delete-btn"
							>
								<Trash2 size={14} />
							</button>
						</div>
					</li>
				{/each}
			</ul>

			{#if newCollectionModalOpen}
				<div class="modal" transition:slide>
					<input
						autofocus
						type="text"
						placeholder="Collection name..."
						bind:value={newCollectionName}
                        onkeydown={(e) => e.key === 'Enter' && handleCreateCollection()}
					/>
					<div class="modal-actions">
						<button class="btn-primary-sm" onclick={handleCreateCollection}>Create</button>
						<button class="btn-ghost-sm" onclick={() => (newCollectionModalOpen = false)}>Cancel</button>
					</div>
				</div>
			{/if}

            {#if $auth.user}
                <div class="sync-status">
                    <Cloud size={16} class="sync-icon" />
                    <span>Syncing with GitHub</span>
                </div>
            {/if}

            <div class="csv-info">
                <a href="/csv_guide.md" target="_blank" class="info-link">
                    <MoreVertical size={14} />
                    <span>CSV Import Format</span>
                </a>
            </div>
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
						placeholder="Filter your collection..."
						bind:value={searchTerm}
					/>
				</div>
                <div class="toolbar-actions">
                    <input
                        type="file"
                        accept=".csv"
                        bind:this={fileInput}
                        onchange={handleCsvImport}
                        style="display: none"
                    />
                    <button onclick={() => fileInput?.click()} title="Import CSV" class="btn-outline">
                        <FileUp size={18} />
                        <span>Import</span>
                    </button>
                    <button
                        onclick={() => {
                            isCreating = true;
                            promptForm = { text: '', category: 'General', tags: '' };
                        }}
                        class="btn-primary"
                    >
                        <Plus size={18} /> 
                        <span>New Prompt</span>
                    </button>
                    <button onclick={handleShare} title="Share current view" class="btn-outline">
                        <Share2 size={18} />
                    </button>
                </div>
			</div>

			{#if isCreating || isEditing}
				<div class="editor-card" transition:slide>
					<h3>{isEditing ? 'Edit Prompt' : 'Create Prompt'}</h3>
					<textarea
						bind:value={promptForm.text}
						placeholder="What's your prompt today? Use markdown if you like..."
					></textarea>
					<div class="editor-row">
						<input
							type="text"
							placeholder="Category (e.g. Design)"
							bind:value={promptForm.category}
						/>
						<input
							type="text"
							placeholder="Tags (comma separated)"
							bind:value={promptForm.tags}
						/>
					</div>
					<div class="editor-actions">
						<button class="btn-ghost" onclick={() => { isCreating = false; isEditing = null; }}>Cancel</button>
						<button onclick={handleSavePrompt} class="btn-primary">Save Changes</button>
					</div>
				</div>
			{/if}

			<div class="prompt-grid">
				{#each filteredPrompts as prompt (prompt.id)}
					<div class="prompt-card">
						<div class="card-header">
                            <div class="header-left">
                                <span class="badge">{prompt.category}</span>
                                <div class="collection-dots">
                                    {#each prompt.collectionIds as cid}
                                        {@const collection = $localStore.collections.find(c => c.id === cid)}
                                        {#if collection}
                                            <span class="dot-sm" style="background: {collection.color}" title={collection.name}></span>
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                            <div class="card-actions">
                                {#if $auth.user && prompt.gistId}
                                    <button class="nominate-btn" onclick={() => nominateToCommunity(prompt)} title="Nominate for curated community">
                                        <Star size={16} />
                                    </button>
                                {/if}
                                <div class="popover-wrapper">
                                    <button 
                                        onclick={() => activeCollectionPromptId = activeCollectionPromptId === prompt.id ? null : prompt.id} 
                                        title="Add to Collection"
                                        class:active={activeCollectionPromptId === prompt.id}
                                    >
                                        <FolderPlus size={16} />
                                    </button>
                                    {#if activeCollectionPromptId === prompt.id}
                                        <div class="popover" transition:fade={{ duration: 100 }}>
                                            <div class="popover-header">Assign to Collection</div>
                                            {#each $localStore.collections as collection}
                                                <button 
                                                    class="popover-item" 
                                                    onclick={() => togglePromptCollection(prompt.id, collection.id)}
                                                >
                                                    <span class="dot-sm" style="background: {collection.color}"></span>
                                                    <span>{collection.name}</span>
                                                    {#if prompt.collectionIds.includes(collection.id)}
                                                        <span class="check-mark">✓</span>
                                                    {/if}
                                                </button>
                                            {/each}
                                            {#if $localStore.collections.length === 0}
                                                <div class="popover-empty">No collections yet</div>
                                            {/if}
                                            <button 
                                                class="popover-add" 
                                                onclick={() => {
                                                    newCollectionModalOpen = true;
                                                    activeCollectionPromptId = null;
                                                }}
                                            >
                                                <Plus size={14} /> New Collection
                                            </button>
                                        </div>
                                    {/if}
                                </div>
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
                        </div>

						<h4 class="card-title">{prompt.title || 'Untitled Prompt'}</h4>
						<p class="prompt-text">{prompt.text}</p>

						<div class="card-footer">
                            <div class="tags">
                                {#each prompt.tags as tag}
                                    <span>#{tag}</span>
                                {/each}
                            </div>
                            {#if prompt.gistId}
                                <div class="gist-indicator" title="Synced to Gist">
                                    <Cloud size={14} />
                                </div>
                            {/if}
                        </div>
					</div>
				{/each}

				{#if filteredPrompts.length === 0 && !isCreating}
					<div class="empty-state">
                        <div class="empty-icon">
                            <Plus size={48} />
                        </div>
						<h3>No prompts found</h3>
                        <p>Start your collection by adding a new prompt.</p>
					</div>
				{/if}
			</div>
		</main>
	</div>
{/if}

<style>
    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 400px;
        color: var(--text-secondary);
        gap: 1rem;
    }

    .spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

	.local-layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 3rem;
		min-height: 600px;
	}

	.sidebar {
		border-right: 1px solid var(--border-color);
		padding-right: 2rem;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.sidebar-header h3 { 
        margin: 0; 
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-muted);
    }

    .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        padding: 0.25rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .icon-btn:hover {
        background: var(--bg-tertiary);
        color: var(--primary-color);
    }

	.collection-list { list-style: none; padding: 0; margin-bottom: 2rem; }
	.collection-list li {
		padding: 0.75rem 1rem;
		cursor: pointer;
		border-radius: 0.75rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.2s;
        color: var(--text-secondary);
        font-weight: 500;
        margin-bottom: 0.25rem;
	}

	.collection-list li:hover { 
        background-color: var(--bg-hover); 
        color: var(--text-primary);
    }

	.collection-list li.active {
		background-color: rgba(var(--primary-color-rgb), 0.1);
		color: var(--primary-color);
        font-weight: 600;
	}

    .collection-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .count {
        font-size: 0.7rem;
        background: var(--bg-tertiary);
        padding: 0.15rem 0.5rem;
        border-radius: 100px;
        color: var(--text-muted);
        font-weight: 600;
    }

    .collection-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

	.delete-btn { 
        border: none; 
        background: none; 
        color: #ef4444; 
        cursor: pointer; 
        padding: 0.25rem; 
        display: flex; 
        align-items: center;
        opacity: 0.7;
    }

    .delete-btn:hover { opacity: 1; }

	.modal { 
        padding: 1.25rem; 
        background: var(--bg-secondary); 
        border: 1px solid var(--border-color); 
        border-radius: 1rem; 
        margin-bottom: 1.5rem;
    }

	.modal input { 
        width: 100%; 
        padding: 0.75rem; 
        margin-bottom: 1rem; 
        border: 1px solid var(--border-color); 
        border-radius: 0.75rem; 
        background: var(--bg-primary); 
        color: var(--text-primary);
        font-size: 0.9375rem;
    }

	.modal-actions { display: flex; gap: 0.75rem; }
    
    .btn-primary-sm {
        flex: 1;
        padding: 0.5rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
    }

    .btn-ghost-sm {
        flex: 1;
        padding: 0.5rem;
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        cursor: pointer;
    }

    .sync-status {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(59, 130, 246, 0.05);
        color: #3b82f6;
        border-radius: 1rem;
        font-size: 0.8125rem;
        font-weight: 500;
    }

    .sync-icon {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    .csv-info {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
    }

    .info-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.8125rem;
        transition: color 0.2s;
    }

    .info-link:hover {
        color: var(--primary-color);
    }

	.toolbar { display: flex; gap: 1rem; margin-bottom: 2.5rem; align-items: center; }
	.search-box { flex: 1; position: relative; }
	.search-box input { 
        width: 100%; 
        padding: 0.875rem 0.875rem 0.875rem 2.75rem; 
        border-radius: 1rem; 
        border: 1px solid var(--border-color); 
        background: var(--bg-secondary); 
        color: var(--text-primary); 
        font-size: 1rem;
    }
    .search-box input:focus {
        outline: none;
        background: var(--bg-primary);
        border-color: var(--primary-color);
    }

	.search-icon-wrapper { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex; }

	.btn-primary {
		display: flex; align-items: center; gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		background: var(--primary-color);
		color: white;
		border: none;
		border-radius: 1rem;
		cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
	}

    .btn-primary:hover {
        transform: translateY(-1px);
        filter: brightness(1.1);
        box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
    }

	.btn-outline { 
        padding: 0.875rem; 
        border: 1px solid var(--border-color); 
        border-radius: 1rem; 
        background: var(--bg-secondary); 
        color: var(--text-primary); 
        cursor: pointer; 
        display: flex; 
        align-items: center;
        transition: all 0.2s;
    }

    .btn-outline:hover {
        background: var(--bg-hover);
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

	.editor-card {
		background: var(--bg-secondary); 
        padding: 2rem; 
        border-radius: 1.5rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); 
        margin-bottom: 2.5rem;
		border: 1px solid var(--border-color);
	}
	.editor-card h3 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 700; }
	.editor-card textarea { 
        width: 100%; 
        min-height: 150px; 
        padding: 1.25rem; 
        margin-bottom: 1.5rem; 
        border-radius: 1rem; 
        border: 1px solid var(--border-color); 
        background: var(--bg-primary); 
        color: var(--text-primary); 
        resize: vertical;
        font-size: 1rem;
        line-height: 1.6;
    }
	.editor-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
	.editor-row input { 
        padding: 0.875rem; 
        border-radius: 0.75rem; 
        border: 1px solid var(--border-color); 
        background: var(--bg-primary); 
        color: var(--text-primary);
        font-size: 0.9375rem;
    }
	.editor-actions { display: flex; gap: 1.25rem; justify-content: flex-end; }
	.btn-ghost { 
        padding: 0.875rem 1.5rem; 
        background: transparent; 
        border: 1px solid var(--border-color); 
        border-radius: 1rem; 
        cursor: pointer; 
        color: var(--text-primary);
        font-weight: 600;
    }

	.prompt-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
	.prompt-card { 
        position: relative; 
        padding: 1.75rem; 
        background: var(--bg-secondary); 
        border: 1px solid var(--border-color); 
        border-radius: 1.5rem; 
        display: flex;
        flex-direction: column;
        transition: all 0.2s;
    }

    .prompt-card:hover {
        border-color: var(--primary-color);
        background: var(--bg-primary);
    }

    .popover-wrapper {
        position: relative;
    }

    .popover {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 100;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        padding: 0.5rem;
        min-width: 180px;
        margin-top: 0.5rem;
        backdrop-filter: blur(10px);
    }

    .popover-header {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        padding: 0.5rem;
        font-weight: 700;
    }

    .popover-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.6rem 0.75rem;
        border: none;
        background: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: 0.5rem;
        transition: all 0.2s;
        font-size: 0.875rem;
        justify-content: flex-start;
    }

    .popover-item:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
    }

    .check-mark {
        margin-left: auto;
        color: var(--primary-color);
        font-weight: bold;
    }

    .popover-empty {
        padding: 1rem;
        text-align: center;
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .popover-add {
        width: 100%;
        padding: 0.6rem 0.75rem;
        border: 1px solid transparent;
        background: none;
        color: var(--primary-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
        margin-top: 0.5rem;
        border-radius: 0.5rem;
    }

    .popover-add:hover {
        background: rgba(var(--primary-color-rgb), 0.1);
        border-color: rgba(var(--primary-color-rgb), 0.2);
    }

	.card-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 1.25rem;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .collection-dots {
        display: flex;
        gap: 4px;
    }

    .dot-sm {
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
    
	.card-actions { display: flex; gap: 0.5rem; }
	.card-actions button { 
        background: var(--bg-tertiary); 
        border: none; 
        cursor: pointer; 
        color: var(--text-muted); 
        padding: 0.5rem; 
        display: flex; 
        align-items: center;
        border-radius: 0.5rem;
        transition: all 0.2s;
    }

    .card-actions button:hover {
        background: var(--bg-hover);
        color: var(--primary-color);
    }

    .nominate-btn:hover {
        color: #f59e0b !important;
        background: rgba(245, 158, 11, 0.1) !important;
    }

	.badge { 
        font-size: 0.75rem; 
        padding: 0.35rem 0.75rem; 
        background: var(--bg-tertiary); 
        border: 1px solid var(--border-color);
        border-radius: 100px; 
        color: var(--text-secondary);
        font-weight: 600;
    }

    .card-title {
        font-size: 1.125rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: var(--text-primary);
        line-height: 1.4;
    }
    
    .prompt-text {
        font-size: 1rem;
        line-height: 1.6;
        color: var(--text-primary);
        flex-grow: 1;
        margin-bottom: 1.5rem;
    }

    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1.25rem;
        border-top: 1px solid var(--border-color);
    }

	.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tags span { 
        background: var(--bg-tertiary); 
        padding: 0.2rem 0.5rem; 
        border-radius: 0.35rem; 
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 500;
    }

    .gist-indicator {
        color: #10b981;
    }

	.empty-state { 
        grid-column: 1/-1; 
        text-align: center; 
        padding: 5rem 2rem; 
        color: var(--text-muted); 
    }

    .empty-icon {
        width: 80px;
        height: 80px;
        background: var(--bg-secondary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        color: var(--border-color);
    }

    .empty-state h3 {
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }
</style>
