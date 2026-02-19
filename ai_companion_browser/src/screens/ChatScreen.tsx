import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendTextQuery, uploadFile, analyzeImage, generateImage, textToSpeech, stopTextToSpeech, startSpeechToText } from '../services/api';
import { saveMessages, getMessages, saveGallery, getGallery, getAIProfile, getUserProfile, getMemory, saveMemory, getJournal, saveJournal, exportAllData, importAllData } from '../services/storage';
import type { Message, GalleryImage, MemoryEntry, JournalEntry } from '../services/storage';

const ChatScreen: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const exportInputRef = useRef<HTMLInputElement>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const loadedMessages = getMessages();
    setMessages(loadedMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Cleanup speech recognition on unmount
    return () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
      stopTextToSpeech();
    };
  }, []);

  const generateAIMemory = async (userMessage: string, aiResponse: string): Promise<void> => {
    try {
      const memoryPrompt = `Based on this conversation, generate a brief memory entry (1-2 sentences) that the AI should remember:\nUser: ${userMessage}\nAI: ${aiResponse}\n\nGenerate only the memory text, nothing else.`;

      const memoryResponse = await sendTextQuery(memoryPrompt);
      
      if (memoryResponse.response && memoryResponse.response.trim()) {
        const memory: MemoryEntry = {
          id: Date.now().toString(),
          content: memoryResponse.response.trim(),
          timestamp: Date.now(),
          tags: [],
          isAIGenerated: true,
        };

        const currentMemories = getMemory();
        saveMemory([...currentMemories, memory]);
      }
    } catch (error) {
      console.error('Error generating AI memory:', error);
    }
  };

  const generateAIJournalEntry = async (userMessage: string, aiResponse: string): Promise<void> => {
    try {
      const journalPrompt = `Based on this conversation, write a brief journal entry (2-3 sentences) from the AI's perspective about this interaction:\nUser: ${userMessage}\nAI: ${aiResponse}\n\nWrite only the journal entry text, nothing else.`;

      const journalResponse = await sendTextQuery(journalPrompt);
      
      if (journalResponse.response && journalResponse.response.trim()) {
        const entry: JournalEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          content: journalResponse.response.trim(),
          timestamp: Date.now(),
          isAIGenerated: true,
        };

        const currentEntries = getJournal();
        saveJournal([...currentEntries, entry]);
      }
    } catch (error) {
      console.error('Error generating AI journal entry:', error);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    const userMessageText = textToSend;
    if (!messageText) setInputText('');
    setIsLoading(true);

    try {
      const aiProfile = getAIProfile();
      const userProfile = getUserProfile();
      const memory = getMemory();

      const contextQuery = `
        AI Name: ${aiProfile.name}
        AI Personality: ${aiProfile.personality.join(', ')}
        AI Relationship: ${aiProfile.relationship}
        User Name: ${userProfile.name}
        User Bio: ${userProfile.bio}
        Memory: ${memory.map(m => m.content).join('; ')}
        
        User Message: ${userMessageText}
      `;

      const response = await sendTextQuery(contextQuery);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.response,
        timestamp: Date.now(),
      };

      if (response.image_trigger && response.image_prompt && aiProfile.referenceImageUrl) {
        try {
          const generatedImageUrl = await generateImage(aiProfile.referenceImageUrl, response.image_prompt);
          aiMessage.imageUrl = generatedImageUrl;
          aiMessage.imagePrompt = response.image_prompt;

          const galleryImage: GalleryImage = {
            id: Date.now().toString(),
            url: generatedImageUrl,
            type: 'generated',
            timestamp: Date.now(),
            prompt: response.image_prompt,
            context: userMessageText,
            tags: [],
          };

          const gallery = getGallery();
          saveGallery([...gallery, galleryImage]);
        } catch (error) {
          console.error('Error generating image:', error);
        }
      }

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);

      // Generate AI memory and journal entry in background
      generateAIMemory(userMessageText, response.response);
      generateAIJournalEntry(userMessageText, response.response);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingText(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingText.trim()) return;

    const messageIndex = messages.findIndex(m => m.id === editingMessageId);
    if (messageIndex === -1) return;

    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: editingText,
    };

    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
    setMessages(messagesToKeep);
    saveMessages(messagesToKeep);

    setEditingMessageId(null);
    setEditingText('');

    await handleSendMessage(editingText);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleRerollMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const previousUserMessage = messages[messageIndex - 1];
    if (previousUserMessage.role !== 'user') return;

    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);
    saveMessages(messagesToKeep);

    await handleSendMessage(previousUserMessage.content);
  };

  const handleDeleteMessage = (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const updatedMessages = messages.slice(0, messageIndex);
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
  };

  const handleTextToSpeech = (text: string) => {
    if (isSpeaking) {
      stopTextToSpeech();
      setIsSpeaking(false);
    } else {
      textToSpeech(text);
      setIsSpeaking(true);
      
      // Reset speaking state when speech ends
      setTimeout(() => {
        setIsSpeaking(false);
      }, text.length * 50); // Rough estimate
    }
  };

  const handleSpeechToText = () => {
    if (isListening) {
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      setIsListening(false);
    } else {
      const stopFn = startSpeechToText(
        (transcript) => {
          setInputText(transcript);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          stopListeningRef.current = null;
        }
      );
      
      if (stopFn) {
        stopListeningRef.current = stopFn;
        setIsListening(true);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isLoading) return;

    setIsLoading(true);

    try {
      const imageUrl = await uploadFile(file);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Shared an image',
        timestamp: Date.now(),
        imageUrl,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);

      const galleryImage: GalleryImage = {
        id: Date.now().toString(),
        url: imageUrl,
        type: 'uploaded',
        timestamp: Date.now(),
        tags: [],
      };

      const gallery = getGallery();
      saveGallery([...gallery, galleryImage]);

      const analysis = await analyzeImage(file);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: analysis.response,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);

      generateAIMemory('Shared an image', analysis.response);
      generateAIJournalEntry('Shared an image', analysis.response);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isLoading) return;

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;

        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `Shared file: ${file.name}`,
          timestamp: Date.now(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        saveMessages(updatedMessages);

        const response = await sendTextQuery(`Analyze this file content: ${content}`);

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: response.response,
          timestamp: Date.now(),
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        saveMessages(finalMessages);

        generateAIMemory(`Shared file: ${file.name}`, response.response);
        generateAIJournalEntry(`Shared file: ${file.name}`, response.response);
        
        setIsLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-companion-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importAllData(content);
      if (success) {
        window.location.reload();
      }
    };
    reader.readAsText(file);
    setMenuOpen(false);
  };

  const aiProfile = getAIProfile();

  return (
    <div className="min-h-screen bg-nature-bg flex flex-col safe-top safe-bottom">
      <header className="glass-effect border-b border-nature-border sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-forest-primary/10 rounded-lg transition-colors touch-manipulation"
            aria-label="Menu"
          >
            <i className="fa fa-bars text-2xl text-forest-primary"></i>
          </button>
          <div className="flex items-center space-x-3">
            {aiProfile.referenceImageUrl && (
              <img src={aiProfile.referenceImageUrl} alt={aiProfile.name} className="w-10 h-10 rounded-full object-cover" />
            )}
            <div>
              <h1 className="text-lg font-semibold text-forest-primary">{aiProfile.name}</h1>
              <p className="text-xs text-gray-500">{aiProfile.relationship}</p>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-up safe-top safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-nature-border">
              <h2 className="text-2xl font-bold text-forest-primary">Menu</h2>
            </div>
            <nav className="p-4 space-y-1">
              <button
                onClick={() => { navigate('/chat'); setMenuOpen(false); }}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-comment-dots text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">Chat</span>
              </button>
              <button
                onClick={() => { navigate('/ai-profile'); setMenuOpen(false); }}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-robot text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">AI Profile</span>
              </button>
              <button
                onClick={() => { navigate('/user-profile'); setMenuOpen(false); }}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-user text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">User Profile</span>
              </button>
              <button
                onClick={() => { navigate('/memory'); setMenuOpen(false); }}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-brain text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">Memory</span>
              </button>
              <button
                onClick={() => { navigate('/gallery'); setMenuOpen(false); }}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-images text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">Gallery</span>
              </button>
              <button
                onClick={() => { navigate('/image-generator'); setMenuOpen(false); }}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-magic text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">Image Generator</span>
              </button>
              <button
                onClick={() => { navigate('/journal'); setMenuOpen(false); }}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-book text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">Journal</span>
              </button>
              <button
                onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-cog text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">Settings</span>
              </button>
              <div className="border-t border-nature-border my-2"></div>
              <button
                onClick={handleExportData}
                className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation"
              >
                <i className="fa fa-download text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">Export Backup</span>
              </button>
              <label className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-forest-primary/10 transition-colors touch-manipulation cursor-pointer">
                <i className="fa fa-upload text-2xl text-forest-primary"></i>
                <span className="text-lg font-medium text-gray-800">Import Backup</span>
                <input
                  type="file"
                  ref={exportInputRef}
                  onChange={handleImportData}
                  accept=".json"
                  className="hidden"
                />
              </label>
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-forest-primary to-forest-light text-white'
                    : 'bg-white shadow-nature text-black'
                }`}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Shared"
                    className="w-full rounded-xl mb-2 max-h-64 object-cover"
                  />
                )}
                {editingMessageId === message.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full p-2 border rounded text-gray-800"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <i className="fa fa-check mr-1"></i>
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        <i className="fa fa-times mr-1"></i>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex space-x-2">
                        {message.role === 'ai' && (
                          <button
                            onClick={() => handleTextToSpeech(message.content)}
                            className="text-xs px-2 py-1 rounded text-gray-400 hover:text-gray-600"
                          >
                            <i className={`fa ${isSpeaking ? 'fa-stop' : 'fa-volume-up'}`}></i>
                          </button>
                        )}
                        {message.role === 'user' && (
                          <button
                            onClick={() => handleEditMessage(message)}
                            className={`text-xs px-2 py-1 rounded ${
                              message.role === 'user'
                                ? 'text-white/70 hover:text-white'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                        )}
                        {message.role === 'ai' && (
                          <button
                            onClick={() => handleRerollMessage(message.id)}
                            className="text-xs px-2 py-1 rounded text-gray-400 hover:text-gray-600"
                          >
                            <i className="fa fa-redo"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            message.role === 'user'
                              ? 'text-white/70 hover:text-white'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-white shadow-nature rounded-2xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-forest-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-forest-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-forest-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-nature-border safe-bottom">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={isLoading}
              className="p-3 hover:bg-forest-primary/10 rounded-xl transition-colors disabled:opacity-50 touch-manipulation"
              aria-label="Upload image"
            >
              <i className="fa fa-image text-xl text-forest-primary"></i>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-3 hover:bg-forest-primary/10 rounded-xl transition-colors disabled:opacity-50 touch-manipulation"
              aria-label="Upload file"
            >
              <i className="fa fa-file-upload text-xl text-forest-primary"></i>
            </button>
            <button
              onClick={handleSpeechToText}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-colors disabled:opacity-50 touch-manipulation ${
                isListening ? 'bg-red-500 text-white' : 'hover:bg-forest-primary/10 text-forest-primary'
              }`}
              aria-label="Speech to text"
            >
              <i className={`fa ${isListening ? 'fa-stop' : 'fa-microphone'} text-xl`}></i>
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 input-field"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-gradient-to-r from-forest-primary to-forest-light text-white rounded-xl hover:shadow-nature-lg transition-all disabled:opacity-50 touch-manipulation"
              aria-label="Send message"
            >
              <i className="fa fa-paper-plane text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;