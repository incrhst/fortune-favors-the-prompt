import React, { useState } from 'react';
import { Search, MessageSquare, Clock, Tag, X, ChevronRight } from 'lucide-react';

const PromptLibrary = () => {
  const samplePrompts = [
    {
      id: 1,
      text: "Analyze the following code and suggest performance optimizations, focusing on time complexity and memory usage.",
      timestamp: "2 hours ago",
      category: "Code Review",
      tags: ["optimization", "performance"],
      discussion: [
        { author: "You", text: "This helped me identify a nested loop issue" },
        { author: "Team", text: "Consider adding profiling benchmarks" }
      ]
    },
    {
      id: 2,
      text: "Write a comprehensive market analysis for sustainable fashion startups targeting Gen Z consumers in urban areas.",
      timestamp: "5 hours ago",
      category: "Research",
      tags: ["market analysis", "fashion", "gen-z"],
      discussion: []
    },
    {
      id: 3,
      text: "Create a weekly meal plan that's high in protein, vegetarian, and optimized for busy professionals with limited cooking time.",
      timestamp: "1 day ago",
      category: "Lifestyle",
      tags: ["nutrition", "meal-planning"],
      discussion: [
        { author: "You", text: "Great suggestions, saved 3 hours per week" }
      ]
    },
    {
      id: 4,
      text: "Explain quantum entanglement to a high school student using everyday analogies and visual metaphors.",
      timestamp: "2 days ago",
      category: "Education",
      tags: ["physics", "teaching"],
      discussion: []
    },
    {
      id: 5,
      text: "Debug this React component that's causing memory leaks when unmounting, particularly with event listeners and API calls.",
      timestamp: "3 days ago",
      category: "Code Review",
      tags: ["react", "debugging", "memory-leak"],
      discussion: [
        { author: "Team", text: "Also check useEffect cleanup functions" },
        { author: "You", text: "Fixed! The issue was in the websocket subscription" }
      ]
    },
    {
      id: 6,
      text: "Generate a persuasive email to potential investors highlighting our AI-driven analytics platform's unique value proposition.",
      timestamp: "5 days ago",
      category: "Business",
      tags: ["email", "pitch", "investors"],
      discussion: []
    }
  ];

  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newComment, setNewComment] = useState('');

  const filteredPrompts = samplePrompts.filter(prompt =>
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f1e8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '2rem'
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
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '3rem' }}>
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
          Your collection of prompts, ready to revisit and refine
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '2rem' }}>
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
            placeholder="Search prompts, categories, or tags..."
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

      {/* Prompts Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredPrompts.map((prompt, index) => (
          <div
            key={prompt.id}
            className="prompt-card"
            onClick={() => setSelectedPrompt(prompt)}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 30px rgba(139, 92, 46, 0.1)',
              cursor: 'pointer',
              border: '1px solid #f0e6d6',
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Category Badge */}
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #8b5c2e 0%, #a67c52 100%)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '600',
              fontFamily: "'Work Sans', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              {prompt.category}
            </div>

            {/* Prompt Text */}
            <p style={{
              fontFamily: "'Work Sans', sans-serif",
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#2c1810',
              marginBottom: '1.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {prompt.text}
            </p>

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
                <span style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: '600' }}>{prompt.discussion.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
              maxWidth: '700px',
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
              onMouseEnter={(e) => e.target.style.background = '#8b5c2e'}
              onMouseLeave={(e) => e.target.style.background = '#f5f1e8'}
            >
              <X size={20} style={{ color: '#2c1810' }} />
            </button>

            {/* Category */}
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #8b5c2e 0%, #a67c52 100%)',
              color: 'white',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: '600',
              fontFamily: "'Work Sans', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1.5rem'
            }}>
              {selectedPrompt.category}
            </div>

            {/* Prompt Text */}
            <h2 style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: '1.8rem',
              lineHeight: '1.4',
              color: '#2c1810',
              marginBottom: '1.5rem',
              fontWeight: '600'
            }}>
              {selectedPrompt.text}
            </h2>

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
                {selectedPrompt.discussion.length === 0 ? (
                  <p style={{
                    fontFamily: "'Work Sans', sans-serif",
                    color: '#8b7355',
                    fontStyle: 'italic'
                  }}>
                    No comments yet. Start the discussion!
                  </p>
                ) : (
                  selectedPrompt.discussion.map((comment, idx) => (
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
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: '600',
                        color: '#8b5c2e',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem'
                      }}>
                        {comment.author}
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
                  placeholder="Add your thoughts or notes about this prompt..."
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
                      alert('Comment added! (Demo)');
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
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
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
