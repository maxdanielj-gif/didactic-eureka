import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportAllData, importAllData, clearAllData, getSettings, saveSettings } from '../services/storage';
import { getVoiceSettings, saveVoiceSettings, textToSpeech, stopTextToSpeech } from '../services/api';
import type { AppSettings } from '../services/storage';
import type { VoiceSettings } from '../services/api';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(getVoiceSettings());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `indigo-ai-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importAllData(content);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          window.location.reload();
        }, 2000);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleVoiceSettingChange = (key: keyof VoiceSettings, value: any) => {
    const updated = { ...voiceSettings, [key]: value };
    setVoiceSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleTestVoice = () => {
    if (isTesting) {
      stopTextToSpeech();
      setIsTesting(false);
    } else {
      setIsTesting(true);
      textToSpeech('Hello! This is a test of the voice settings.', voiceSettings);
      setTimeout(() => setIsTesting(false), 3000);
    }
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
          <h1 className="text-xl font-semibold text-forest-primary">Settings</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-volume-up mr-3"></i>
              Voice Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Gender
                </label>
                <select
                  value={voiceSettings.gender}
                  onChange={(e) => handleVoiceSettingChange('gender', e.target.value as 'male' | 'female')}
                  className="custom-select"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch: {voiceSettings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => handleVoiceSettingChange('pitch', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lower</span>
                  <span>Higher</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speed: {voiceSettings.speed.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.speed}
                  onChange={(e) => handleVoiceSettingChange('speed', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>

              <button
                onClick={handleTestVoice}
                className="btn-secondary w-full"
              >
                {isTesting ? (
                  <>
                    <i className="fa fa-stop mr-2"></i>
                    Stop Test
                  </>
                ) : (
                  <>
                    <i className="fa fa-play mr-2"></i>
                    Test Voice
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-sliders-h mr-3"></i>
              App Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Notifications</p>
                  <p className="text-sm text-gray-500">Receive app notifications</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={`relative w-14 h-8 rounded-full transition-colors touch-manipulation ${
                    settings.notifications ? 'bg-forest-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Auto Save</p>
                  <p className="text-sm text-gray-500">Automatically save conversations</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                  className={`relative w-14 h-8 rounded-full transition-colors touch-manipulation ${
                    settings.autoSave ? 'bg-forest-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.autoSave ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-database mr-3"></i>
              Data Management
            </h2>
            <div className="space-y-3">
              <button onClick={handleExport} className="btn-secondary w-full">
                <i className="fa fa-download mr-2"></i>
                Export All Data
              </button>
              <label className="btn-secondary w-full cursor-pointer block text-center">
                <i className="fa fa-upload mr-2"></i>
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="card border-2 border-red-200">
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
              <i className="fa fa-exclamation-triangle mr-3"></i>
              Danger Zone
            </h2>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-3 px-6 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors touch-manipulation"
              >
                <i className="fa fa-trash mr-2"></i>
                Clear All Data
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-600 font-medium">
                  Are you sure? This action cannot be undone!
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 py-3 px-6 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors touch-manipulation"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card bg-gradient-to-br from-forest-primary/5 to-fresh-primary/5">
            <h2 className="text-lg font-semibold text-forest-primary mb-2">About</h2>
            <p className="text-gray-600 mb-2">indigo AI</p>
            <p className="text-sm text-gray-500">Version 1.0.0</p>
            <p className="text-sm text-gray-500 mt-4">
              Your personal AI companion that lives in your browser. All data is stored locally and privately.
            </p>
          </div>
        </div>
      </main>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa fa-check text-3xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Import Successful!</h3>
              <p className="text-gray-600">Reloading app...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;