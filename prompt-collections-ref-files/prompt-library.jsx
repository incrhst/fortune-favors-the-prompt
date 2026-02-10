import React, { useState } from 'react';
import { Search, MessageSquare, Clock, X, ChevronRight, Upload, FileText, FolderPlus, Folder, Plus, Check } from 'lucide-react';
import Papa from 'papaparse';

const PromptLibrary = () => {
  const [prompts, setPrompts] = useState([]);
  const [collections, setCollections] = useState([{ id: 'all', name: 'All Prompts', color: '#8b5c2e' }]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newComment, setNewComment] = useState('');
  const [discussions, setDiscussions] = useState({});
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCollectionPicker, setShowCollectionPicker] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedPrompts = results.data.map((row, index) => ({
          id: Date.now() + index,
          title: row.title || `Prompt ${index + 1}`,
          text: row.prompt || '',
          context: row.context || '',
          collections: row.collections ? row.collections.split(';').map(c => c.trim()) : [],
          timestamp: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          tags: extractTags(row.prompt || ''),
          discussion: []
        }));
        
        // Extract unique collections from CSV
        const csvCollections = new Set();
        parsedPrompts.forEach(p => {
          p.collections.forEach(c => csvCollections.add(c));
        });
        
        // Merge with existing collections
        const newCollections = [
          { id: 'all', name: 'All Prompts', color: '#8b5c2e' },
          ...Array.from(csvCollections).map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            color: getRandomColor()
          }))
        ];
        
        setCollections(newCollections);
        setPrompts(parsedPrompts);
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message);
      }
    });
  };

  const getRandomColor = () => {
    const colors = [
      '#8b5c2e', '#6b7c52', '#7c526b', '#526b7c', '#7c6b52', 
      '#5c7c52', '#52527c', '#7c5252', '#527c7c'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const extractTags = (text) => {
    const tags = [];
    const keywords = {
      'code': ['code', 'debug', 'function', 'class', 'programming'],
      'analysis': ['analyze', 'analysis', 'examine', 'study'],
      'writing': ['write', 'draft', 'compose', 'create'],
      'research': ['research', 'investigate', 'find', 'search'],
      'explain': ['explain', 'describe', 'clarify', 'teach']
    };

    const lowerText = text.toLowerCase();
    for (const [tag, words] of Object.entries(keywords)) {
      if (words.some(word => lowerText.includes(word))) {
        tags.push(tag);
      }
    }
    return tags.length > 0 ? tags : ['general'];
  };

  const addComment = (promptId, comment) => {
    setDiscussions(prev => ({
      ...prev,
      [promptId]: [...(prev[promptId] || []), {
        author: 'You',
        text: comment,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        })
      }]
    }));
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    
    const newCollection = {
      id: newCollectionName.toLowerCase().replace(/\s+/g, '-'),
      name: newCollectionName,
      color: getRandomColor()
    };
    
    setCollections([...collections, newCollection]);
    setNewCollectionName('');
    setShowNewCollectionModal(false);
  };

  const togglePromptCollection = (promptId, collectionName) => {
    setPrompts(prompts.map(p => {
      if (p.id === promptId) {
        const hasCollection = p.collections.includes(collectionName);
        return {
          ...p,
          collections: hasCollection 
            ? p.collections.filter(c => c !== collectionName)
            : [...p.collections, collectionName]
        };
      }
      return p;
    }));
  };

  const getCollectionColor = (collectionName) => {
    const collection = collections.find(c => c.name === collectionName);
    return collection ? collection.color : '#8b5c2e';
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = 
      prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.context && prompt.context.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCollection = 
      selectedCollection === 'all' || 
      prompt.collections.includes(collections.find(c => c.id === selectedCollection)?.name);
    
    return matchesSearch && matchesCollection;
  });

  const getCollectionCount = (collectionId) => {
    if (collectionId === 'all') return prompts.length;
    const collectionName = collections.find(c => c.id === collectionId)?.name;
    return prompts.filter(p => p.collections.includes(collectionName)).length;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1e8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '2rem',
      display: 'flex',
      gap: '2rem'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Work+Sans:wght@400;500;600&display=swap');
        
        .prompt-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .prompt-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(139, 92, 46, 0.15);
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .tag {
          transition: all 0.2s ease;
        }
        
        .tag:hover {
          transform: scale(1.05);
          background: #8b5c2e;
          color: white;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #8b5c2e;
        }
        
        .modal-backdrop {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .upload-zone {
          transition: all 0.3s ease;
        }

        .upload-zone:hover {
          border-color: #8b5c2e;
          background: white;
        }

        .collection-item {
          transition: all 0.2s ease;
        }

        .collection-item:hover {
          background: #f5f1e8;
          transform: translateX(4px);
        }

        .collection-item.active {
          background: white;
          border-left: 4px solid #8b5c2e;
        }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: '280px',
        flexShrink: 0,
        position: 'sticky',
        top: '2rem',
        height: 'fit-content'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 30px rgba(139, 92, 46, 0.1)',
          border: '1px solid #f0e6d6'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#2c1810',
              margin: 0
            }}>
              Collections
            </h3>
            <button
              onClick={() => setShowNewCollectionModal(true)}
              style={{
                background: 'linear-gradient(135deg, #8b5c2e 0%, #a67c52 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Plus size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {collections.map(collection => (
              <div
                key={collection.id}
                className={`collection-item ${selectedCollection === collection.id ? 'active' : ''}`}
                onClick={() => setSelectedCollection(collection.id)}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedCollection === collection.id ? 'white' : 'transparent',
                  borderLeft: selectedCollection === collection.id ? `4px solid ${collection.color}` : '4px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Folder size={18} style={{ color: collection.color }} />
                  <span style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: '0.95rem',
                    color: '#2c1810',
                    fontWeight: selectedCollection === collection.id ? '600' : '400'
                  }}>
                    {collection.name}
                  </span>
                </div>
                <span style={{
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: '0.8rem',
                  color: '#8b7355',
                  background: '#f5f1e8',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}>
                  {getCollectionCount(collection.id)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: '3.5rem',
            fontWeight: '700',
            color: '#2c1810',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            Prompt Library
          </h1>
          <p style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: '1.1rem',
            color: '#6b5444',
            fontWeight: '400'
          }}>
            Import your prompts from CSV and organize into collections
          </p>
        </div>

        {/* Upload Section */}
        {prompts.length === 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <label
              className="upload-zone"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                border: '3px dashed #e8dcc8',
                borderRadius: '20px',
                background: '#fdfbf7',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <Upload size={48} style={{ color: '#8b5c2e', marginBottom: '1.5rem' }} />
              <h3 style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: '1.5rem',
                color: '#2c1810',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Upload Your Prompts
              </h3>
              <p style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: '1rem',
                color: '#6b5444',
                marginBottom: '1rem'
              }}>
                Drop a CSV file here or click to browse
              </p>
              <p style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: '0.85rem',
                color: '#8b7355',
                marginBottom: '1rem'
              }}>
                Expected format: <code style={{ 
                  background: '#f5f1e8', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}>title, prompt, context, collections</code>
              </p>
              <p style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: '0.8rem',
                color: '#8b7355',
                fontStyle: 'italic'
              }}>
                Collections should be semicolon-separated (e.g., "Work;Personal")
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}

        {/* Re-upload Button */}
        {prompts.length > 0 && (
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
            <label style={{
              background: 'linear-gradient(135deg, #8b5c2e 0%, #a67c52 100%)',
              color: 'white',
              padding: '0.875rem 1.5rem',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              fontFamily: "'Work Sans', sans-serif",
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              border: 'none'
            }}>
              <Upload size={18} />
              Upload New CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            
            <div style={{
              background: 'white',
              padding: '0.875rem 1.5rem',
              borderRadius: '12px',
              border: '2px solid #e8dcc8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FileText size={18} style={{ color: '#8b5c2e' }} />
              <span style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: '0.95rem',
                color: '#2c1810',
                fontWeight: '600'
              }}>
                {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {prompts.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              position: 'relative',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(139, 92, 46, 0.08)',
              border: '2px solid #e8dcc8'
            }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '1.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8b5c2e'
              }} />
              <input
                type="text"
                placeholder="Search prompts, titles, context, or tags..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem 1.25rem 3.5rem',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontFamily: "'Work Sans', sans-serif",
                  background: 'transparent'
                }}
              />
            </div>
          </div>
        )}

        {/* Prompts Grid */}
        {prompts.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredPrompts.map((prompt, index) => (
              <div
                key={prompt.id}
                className="prompt-card"
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  boxShadow: '0 8px 30px rgba(139, 92, 46, 0.1)',
                  border: '1px solid #f0e6d6',
                  animationDelay: `${index * 0.1}s`,
                  position: 'relative'
                }}
              >
                {/* Collections Badge */}
                {prompt.collections.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    display: 'flex',
                    gap: '0.25rem',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                    maxWidth: '60%'
                  }}>
                    {prompt.collections.slice(0, 2).map(collection => (
                      <div
                        key={collection}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: getCollectionColor(collection)
                        }}
                        title={collection}
                      />
                    ))}
                    {prompt.collections.length > 2 && (
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#8b7355',
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '600'
                      }}>
                        +{prompt.collections.length - 2}
                      </div>
                    )}
                  </div>
                )}

                <div onClick={() => setSelectedPrompt(prompt)} style={{ cursor: 'pointer' }}>
                  {/* Title */}
                  <h3 style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: '#2c1810',
                    marginBottom: '1rem',
                    lineHeight: '1.3',
                    paddingRight: '4rem'
                  }}>
                    {prompt.title}
                  </h3>

                  {/* Prompt Text */}
                  <p style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a3929',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {prompt.text}
                  </p>

                  {/* Context Preview */}
                  {prompt.context && (
                    <p style={{
                      fontFamily: "'Work Sans', sans-serif",
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      color: '#8b7355',
                      marginBottom: '1.5rem',
                      fontStyle: 'italic',
                      background: '#fdfbf7',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      borderLeft: '3px solid #e8dcc8',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {prompt.context}
                    </p>
                  )}

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {prompt.tags.map(tag => (
                      <span
                        key={tag}
                        className="tag"
                        style={{
                          background: '#f5f1e8',
                          color: '#6b5444',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: '500'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f0e6d6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b7355', fontSize: '0.85rem' }}>
                      <Clock size={14} />
                      <span style={{ fontFamily: "'Work Sans', sans-serif" }}>{prompt.timestamp}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5c2e', fontSize: '0.85rem' }}>
                      <MessageSquare size={14} />
                      <span style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: '600' }}>
                        {(discussions[prompt.id] || []).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add to Collection Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCollectionPicker(showCollectionPicker === prompt.id ? null : prompt.id);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: '#f5f1e8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    fontFamily: "'Work Sans', sans-serif",
                    color: '#6b5444',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#8b5c2e'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f5f1e8'}
                >
                  <FolderPlus size={14} />
                </button>

                {/* Collection Picker Dropdown */}
                {showCollectionPicker === prompt.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      bottom: '3.5rem',
                      right: '1rem',
                      background: 'white',
                      border: '2px solid #e8dcc8',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      boxShadow: '0 8px 20px rgba(139, 92, 46, 0.2)',
                      minWidth: '200px',
                      zIndex: 10
                    }}
                  >
                    {collections.filter(c => c.id !== 'all').map(collection => (
                      <div
                        key={collection.id}
                        onClick={() => togglePromptCollection(prompt.id, collection.name)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          background: prompt.collections.includes(collection.name) ? '#fdfbf7' : 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f1e8'}
                        onMouseLeave={(e) => e.currentTarget.style.background = prompt.collections.includes(collection.name) ? '#fdfbf7' : 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: collection.color
                          }} />
                          <span style={{
                            fontFamily: "'Work Sans', sans-serif",
                            fontSize: '0.85rem',
                            color: '#2c1810'
                          }}>
                            {collection.name}
                          </span>
                        </div>
                        {prompt.collections.includes(collection.name) && (
                          <Check size={14} style={{ color: collection.color }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {prompts.length > 0 && filteredPrompts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem'
          }}>
            <Search size={48} style={{ color: '#e8dcc8', marginBottom: '1rem' }} />
            <p style={{
              fontFamily: "'Work Sans', sans-serif",
              fontSize: '1.1rem',
              color: '#8b7355'
            }}>
              No prompts match your search
            </p>
          </div>
        )}
      </div>

      {/* New Collection Modal */}
      {showNewCollectionModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowNewCollectionModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(44, 24, 16, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 30px 60px rgba(139, 92, 46, 0.3)'
            }}
          >
            <h3 style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#2c1810',
              marginBottom: '1.5rem'
            }}>
              New Collection
            </h3>
            
            <input
              type="text"
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createCollection()}
              autoFocus
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e8dcc8',
                borderRadius: '12px',
                fontSize: '1rem',
                fontFamily: "'Work Sans', sans-serif",
                marginBottom: '1.5rem'
              }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowNewCollectionModal(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  borderRadius: '10px',
                  border: '2px solid #e8dcc8',
                  background: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: "'Work Sans', sans-serif",
                  cursor: 'pointer',
                  color: '#6b5444'
                }}
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5c2e 0%, #a67c52 100%)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: "'Work Sans', sans-serif",
                  cursor: 'pointer'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedPrompt(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(44, 24, 16, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '3rem',
              position: 'relative',
              boxShadow: '0 30px 60px rgba(139, 92, 46, 0.3)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPrompt(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: '#f5f1e8',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#8b5c2e';
                e.currentTarget.querySelector('svg').style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5f1e8';
                e.currentTarget.querySelector('svg').style.color = '#2c1810';
              }}
            >
              <X size={20} style={{ color: '#2c1810' }} />
            </button>

            {/* Collections Badges */}
            {selectedPrompt.collections.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}>
                {selectedPrompt.collections.map(collection => (
                  <span
                    key={collection}
                    style={{
                      background: getCollectionColor(collection),
                      color: 'white',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Folder size={12} />
                    {collection}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: '2.2rem',
              lineHeight: '1.3',
              color: '#2c1810',
              marginBottom: '1.5rem',
              fontWeight: '700',
              paddingRight: '3rem'
            }}>
              {selectedPrompt.title}
            </h2>

            {/* Prompt Text */}
            <div style={{
              background: '#fdfbf7',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e8dcc8',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: '1.05rem',
                lineHeight: '1.7',
                color: '#2c1810',
                margin: 0
              }}>
                {selectedPrompt.text}
              </p>
            </div>

            {/* Context */}
            {selectedPrompt.context && (
              <div style={{
                background: '#f5f1e8',
                padding: '1.5rem',
                borderRadius: '12px',
                borderLeft: '4px solid #8b5c2e',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#8b5c2e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}>
                  Context
                </div>
                <p style={{
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#4a3929',
                  margin: 0
                }}>
                  {selectedPrompt.context}
                </p>
              </div>
            )}

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {selectedPrompt.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: '#f5f1e8',
                    color: '#6b5444',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '500'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Time */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#8b7355',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '2px solid #f0e6d6'
            }}>
              <Clock size={16} />
              <span style={{ fontFamily: "'Work Sans', sans-serif" }}>{selectedPrompt.timestamp}</span>
            </div>

            {/* Discussion Section */}
            <div>
              <h3 style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: '1.5rem',
                color: '#2c1810',
                marginBottom: '1.5rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <MessageSquare size={24} />
                Discussion
              </h3>

              {/* Existing Comments */}
              <div style={{ marginBottom: '1.5rem' }}>
                {(discussions[selectedPrompt.id] || []).length === 0 ? (
                  <p style={{
                    fontFamily: "'Work Sans', sans-serif",
                    color: '#8b7355',
                    fontStyle: 'italic'
                  }}>
                    No comments yet. Start the discussion!
                  </p>
                ) : (
                  (discussions[selectedPrompt.id] || []).map((comment, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#fdfbf7',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        marginBottom: '1rem',
                        border: '1px solid #f0e6d6'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: '600',
                          color: '#8b5c2e',
                          fontSize: '0.9rem'
                        }}>
                          {comment.author}
                        </div>
                        <div style={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: '0.8rem',
                          color: '#8b7355'
                        }}>
                          {comment.timestamp}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'Work Sans', sans-serif",
                        color: '#2c1810',
                        lineHeight: '1.6'
                      }}>
                        {comment.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <div style={{
                background: '#fdfbf7',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '2px solid #e8dcc8'
              }}>
                <textarea
                  placeholder="Add your thoughts, learnings, or follow-up ideas..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '1rem',
                    border: '1px solid #e8dcc8',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontFamily: "'Work Sans', sans-serif",
                    resize: 'vertical',
                    marginBottom: '1rem'
                  }}
                />
                <button
                  onClick={() => {
                    if (newComment.trim()) {
                      addComment(selectedPrompt.id, newComment);
                      setNewComment('');
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #8b5c2e 0%, #a67c52 100%)',
                    color: 'white',
                    padding: '0.875rem 2rem',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    fontFamily: "'Work Sans', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Add Comment
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;
