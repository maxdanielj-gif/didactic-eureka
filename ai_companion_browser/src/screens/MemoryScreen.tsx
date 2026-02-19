import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveMemory, getMemory } from '../services/storage';
import type { MemoryEntry } from '../services/storage';

const MemoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'ai'>('all');

  useEffect(() => {
    setMemories(getMemory());
  }, []);

  const filteredMemories = memories.filter(memory => {
    if (filterType === 'all') return true;
    if (filterType === 'ai') return memory.isAIGenerated === true;
    if (filterType === 'user') return !memory.isAIGenerated;
    return true;
  });

  const handleAddMemory = () => {
    if (!newMemory.trim()) return;

    const memory: MemoryEntry = {
      id: Date.now().toString(),
      content: newMemory,
      timestamp: Date.now(),
      tags: [],
      isAIGenerated: false,
    };

    const updated = [...memories, memory];
    setMemories(updated);
    saveMemory(updated);
    setNewMemory('');
  };

  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    saveMemory(updated);
  };

  const handleStartEdit = (memory: MemoryEntry) => {
    setEditingId(memory.id);
    setEditContent(memory.content);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const updated = memories.map(m =>
      m.id === editingId ? { ...m, content: editContent } : m
    );
    setMemories(updated);
    saveMemory(updated);
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="min-h-screen bg-nature-bg safe-top safe-bottom">
      <header className="glass-effect border-b border-nature-border sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/chat')}
            className="p-2 hover:bg-forest-primary/10 rounded-lg transition-colors touch-manipulation"
            aria-label="Back"
          >
            <i className="fa fa-arrow-left text-2xl text-forest-primary"></i>
          </button>
          <h1 className="text-xl font-semibold text-forest-primary">Memory</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="glass-effect border-b border-nature-border sticky top-[57px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-3 font-medium transition-all touch-manipulation ${
                filterType === 'all'
                  ? 'text-forest-primary border-b-2 border-forest-primary'
                  : 'text-gray-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('user')}
              className={`flex-1 py-3 font-medium transition-all touch-manipulation ${
                filterType === 'user'
                  ? 'text-forest-primary border-b-2 border-forest-primary'
                  : 'text-gray-500'
              }`}
            >
              <i className="fa fa-user mr-2"></i>
              User
            </button>
            <button
              onClick={() => setFilterType('ai')}
              className={`flex-1 py-3 font-medium transition-all touch-manipulation ${
                filterType === 'ai'
                  ? 'text-forest-primary border-b-2 border-forest-primary'
                  : 'text-gray-500'
              }`}
            >
              <i className="fa fa-robot mr-2"></i>
              AI
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
            <i className="fa fa-plus-circle mr-3"></i>
            Add New Memory
          </h2>
          <textarea
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="Add a memory for your AI companion to remember..."
            rows={3}
            className="input-field resize-none mb-4"
          />
          <button
            onClick={handleAddMemory}
            disabled={!newMemory.trim()}
            className="btn-primary w-full"
          >
            <i className="fa fa-plus mr-2"></i>
            Add Memory
          </button>
        </div>

        <div className="space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa fa-brain text-6xl text-forest-primary/30 mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Memories Yet</h2>
              <p className="text-gray-500">
                {filterType === 'all' 
                  ? 'Add memories for your AI companion to remember'
                  : filterType === 'ai'
                  ? 'AI-generated memories will appear here'
                  : 'Your memories will appear here'}
              </p>
            </div>
          ) : (
            filteredMemories.map((memory) => (
              <div key={memory.id} className="card animate-slide-up">
                {editingId === memory.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="input-field resize-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 btn-primary"
                      >
                        <i className="fa fa-check mr-2"></i>
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 btn-secondary"
                      >
                        <i className="fa fa-times mr-2"></i>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-gray-800 leading-relaxed flex-1">{memory.content}</p>
                      {memory.isAIGenerated && (
                        <span className="ml-2 px-2 py-1 bg-forest-primary/10 text-forest-primary text-xs rounded-full">
                          <i className="fa fa-robot mr-1"></i>
                          AI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {new Date(memory.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        {!memory.isAIGenerated && (
                          <button
                            onClick={() => handleStartEdit(memory)}
                            className="px-3 py-1 text-forest-primary hover:bg-forest-primary/10 rounded-lg transition-colors touch-manipulation"
                          >
                            <i className="fa fa-edit mr-1"></i>
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMemory(memory.id)}
                          className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                        >
                          <i className="fa fa-trash mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default MemoryScreen;