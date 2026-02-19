import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveJournal, getJournal } from '../services/storage';
import type { JournalEntry } from '../services/storage';

const JournalScreen: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'all' | 'user' | 'ai'>('all');

  useEffect(() => {
    setEntries(getJournal());
  }, []);

  const filteredEntries = entries.filter(entry => {
    if (filterType === 'all') return true;
    if (filterType === 'ai') return entry.isAIGenerated === true;
    if (filterType === 'user') return !entry.isAIGenerated;
    return true;
  });

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      content: newEntry,
      timestamp: Date.now(),
      isAIGenerated: false,
    };

    const updated = [...entries, entry].sort((a, b) => b.timestamp - a.timestamp);
    setEntries(updated);
    saveJournal(updated);
    setNewEntry('');
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveJournal(updated);
  };

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

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
          <h1 className="text-xl font-semibold text-forest-primary">Journal</h1>
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
            <i className="fa fa-pen mr-3"></i>
            New Entry
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field mb-4"
          />
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Write your journal entry..."
            rows={6}
            className="input-field resize-none mb-4"
          />
          <button
            onClick={handleAddEntry}
            disabled={!newEntry.trim()}
            className="btn-primary w-full"
          >
            <i className="fa fa-plus mr-2"></i>
            Add Entry
          </button>
        </div>

        <div className="space-y-6">
          {Object.keys(groupedEntries).length === 0 ? (
            <div className="text-center py-12">
              <i className="fa fa-book text-6xl text-forest-primary/30 mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Entries Yet</h2>
              <p className="text-gray-500">
                {filterType === 'all'
                  ? 'Start journaling your thoughts and experiences'
                  : filterType === 'ai'
                  ? 'AI-generated journal entries will appear here'
                  : 'Your journal entries will appear here'}
              </p>
            </div>
          ) : (
            Object.keys(groupedEntries)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((date) => (
                <div key={date} className="space-y-4">
                  <h3 className="text-lg font-semibold text-forest-primary flex items-center">
                    <i className="fa fa-calendar mr-2"></i>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  {groupedEntries[date].map((entry) => (
                    <div key={entry.id} className="card animate-slide-up">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap flex-1">
                          {entry.content}
                        </p>
                        {entry.isAIGenerated && (
                          <span className="ml-2 px-2 py-1 bg-forest-primary/10 text-forest-primary text-xs rounded-full">
                            <i className="fa fa-robot mr-1"></i>
                            AI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {new Date(entry.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                        >
                          <i className="fa fa-trash mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
          )}
        </div>
      </main>
    </div>
  );
};

export default JournalScreen;