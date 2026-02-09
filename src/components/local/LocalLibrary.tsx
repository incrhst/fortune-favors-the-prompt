
import React, { useState } from 'react';
import { useLocalStore, type LocalPrompt, type LocalGroup } from '../../lib/useLocalStore';
import { Search, Plus, Trash2, Edit2, FolderPlus, Share2, MoreVertical, X, Check } from 'lucide-react';

export default function LocalLibrary() {
    const store = useLocalStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
    const [isEditing, setIsEditing] = useState<LocalPrompt | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupModalOpen, setNewGroupModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    // Group creation state
    const [newGroupName, setNewGroupName] = useState('');

    // Prompt creation/editing state
    const [promptForm, setPromptForm] = useState({ text: '', category: '', tags: '' });

    const filteredPrompts = store.prompts.filter(p => {
        const matchesGroup = selectedGroupId ? p.groupId === selectedGroupId : true;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            p.text.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower) ||
            p.tags.some(t => t.toLowerCase().includes(searchLower));
        return matchesGroup && matchesSearch;
    });

    const handleSavePrompt = () => {
        const tagsArray = promptForm.tags.split(',').map(t => t.trim()).filter(Boolean);

        if (isEditing) {
            store.updatePrompt(isEditing.id, {
                text: promptForm.text,
                category: promptForm.category,
                tags: tagsArray,
                groupId: selectedGroupId // Keep in current group if creating new, but for edit? Maybe keep existing group unless moved.
                // Actually for simplicity, if editing, we just update text/cat/tags. 
            });
            setIsEditing(null);
        } else {
            const newPrompt = store.addPrompt(promptForm.text, promptForm.category, tagsArray);
            if (selectedGroupId) {
                store.addToGroup(newPrompt.id, selectedGroupId);
            }
            setIsCreating(false);
        }
        setPromptForm({ text: '', category: '', tags: '' });
    };

    const startEdit = (prompt: LocalPrompt) => {
        setPromptForm({
            text: prompt.text,
            category: prompt.category,
            tags: prompt.tags.join(', '),
        });
        setIsEditing(prompt);
        setIsCreating(false);
    };

    const handleCreateGroup = () => {
        if (newGroupName.trim()) {
            store.createGroup(newGroupName.trim());
            setNewGroupName('');
            setNewGroupModalOpen(false);
        }
    };

    const handleShare = () => {
        // Basic sharing implementation: Encode current view into URL
        const dataToShare = {
            prompts: filteredPrompts,
            groups: selectedGroupId ? store.groups.filter(g => g.id === selectedGroupId) : []
        };
        const json = JSON.stringify(dataToShare);
        const encoded = btoa(encodeURIComponent(json)); // Base64 encode for URL safety
        const url = `${window.location.origin}/share?data=${encoded}`;

        navigator.clipboard.writeText(url).then(() => {
            alert('Share link copied to clipboard!');
        });
    };

    if (!store.isLoaded) return <div>Loading library...</div>;

    return (
        <div className="local-library-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', minHeight: '600px' }}>

            {/* Sidebar - Groups */}
            <aside className="sidebar" style={{ borderRight: '1px solid var(--border-light, #e5e7eb)', paddingRight: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>My Library</h3>
                    <button onClick={() => setNewGroupModalOpen(true)} title="New Group" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <FolderPlus size={18} />
                    </button>
                </div>

                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li
                        onClick={() => setSelectedGroupId(undefined)}
                        style={{
                            padding: '0.5rem',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            backgroundColor: selectedGroupId === undefined ? 'var(--brown-light, #f5f1e8)' : 'transparent',
                            fontWeight: selectedGroupId === undefined ? 'bold' : 'normal'
                        }}
                    >
                        All Prompts
                    </li>
                    {store.groups.map(group => (
                        <li
                            key={group.id}
                            onClick={() => setSelectedGroupId(group.id)}
                            style={{
                                padding: '0.5rem',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                backgroundColor: selectedGroupId === group.id ? 'var(--brown-light, #f5f1e8)' : 'transparent',
                                fontWeight: selectedGroupId === group.id ? 'bold' : 'normal',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>{group.name}</span>
                            {selectedGroupId === group.id && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete group?')) store.deleteGroup(group.id); }}
                                    style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>

                {newGroupModalOpen && (
                    <div style={{ padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginTop: '1rem' }}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Group Name"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleCreateGroup} style={{ flex: 1, padding: '0.25rem' }}>Create</button>
                            <button onClick={() => setNewGroupModalOpen(false)} style={{ flex: 1, padding: '0.25rem' }}>Cancel</button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                    <div className="search-container" style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                        <input
                            type="text"
                            placeholder="Search local prompts..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <button
                        onClick={() => { setIsCreating(true); setPromptForm({ text: '', category: 'General', tags: '' }); }}
                        className="btn-primary"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'var(--brown-dark, #2c1810)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={18} /> New Prompt
                    </button>
                    <button
                        onClick={handleShare}
                        title="Share current view"
                        style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
                    >
                        <Share2 size={18} />
                    </button>
                </div>

                {/* Editor (Inline or Modal) */}
                {(isCreating || isEditing) && (
                    <div className="editor-card" style={{
                        background: 'white', padding: '1.5rem', borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '2rem',
                        border: '1px solid var(--brown-light, #f5f1e8)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>{isEditing ? 'Edit Prompt' : 'New Prompt'}</h3>
                        <textarea
                            value={promptForm.text}
                            onChange={e => setPromptForm({ ...promptForm, text: e.target.value })}
                            placeholder="Enter your prompt text here..."
                            style={{ width: '100%', minHeight: '100px', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Category (e.g. Coding)"
                                value={promptForm.category}
                                onChange={e => setPromptForm({ ...promptForm, category: e.target.value })}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                            <input
                                type="text"
                                placeholder="Tags (comma separated)"
                                value={promptForm.tags}
                                onChange={e => setPromptForm({ ...promptForm, tags: e.target.value })}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setIsCreating(false); setIsEditing(null); }}
                                style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePrompt}
                                style={{ padding: '0.5rem 1rem', background: 'var(--brown-accent, #8b5c2e)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Save Prompt
                            </button>
                        </div>
                    </div>
                )}

                {/* Prompt List */}
                <div className="prompt-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {filteredPrompts.map(prompt => (
                        <div key={prompt.id} className="card prompt-card" style={{ position: 'relative', padding: '1.5rem', background: 'white', border: '1px solid #eee', borderRadius: '12px' }}>
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => startEdit(prompt)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => { if (confirm('Delete this prompt?')) store.deletePrompt(prompt.id); }}
                                    title="Delete"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block', fontSize: '0.8rem', padding: '0.25rem 0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
                                {prompt.category}
                            </span>

                            <p style={{ margin: '1rem 0', lineHeight: '1.5', minHeight: '3rem' }}>{prompt.text}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                                {prompt.tags.map((tag, i) => (
                                    <span key={i}>#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {filteredPrompts.length === 0 && !isCreating && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#888' }}>
                            <p>No prompts found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
