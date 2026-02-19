import BrandingBadge from './components/BrandingBadge';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatScreen from './screens/ChatScreen';
import AIProfileScreen from './screens/AIProfileScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import MemoryScreen from './screens/MemoryScreen';
import GalleryScreen from './screens/GalleryScreen';
import ImageGeneratorScreen from './screens/ImageGeneratorScreen';
import JournalScreen from './screens/JournalScreen';
import SettingsScreen from './screens/SettingsScreen';
import { initializeUser } from './services/api';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = localStorage.getItem('user_data');
        if (!userData) {
          await initializeUser();
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-primary to-fresh-primary flex items-center justify-center">
        <div className="animate-pulse-soft">
          <i className="fa fa-spinner fa-spin text-6xl text-white"></i>
          <BrandingBadge />
        </div>
        <BrandingBadge />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/ai-profile" element={<AIProfileScreen />} />
        <Route path="/user-profile" element={<UserProfileScreen />} />
        <Route path="/memory" element={<MemoryScreen />} />
        <Route path="/gallery" element={<GalleryScreen />} />
        <Route path="/image-generator" element={<ImageGeneratorScreen />} />
        <Route path="/journal" element={<JournalScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;