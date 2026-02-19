import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../services/api';
import { saveAIProfile, getAIProfile } from '../services/storage';
import type { AIProfile } from '../services/storage';

const AIProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AIProfile>(getAIProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const personalityOptions = [
    'friendly', 'empathetic', 'witty', 'sarcastic', 'playful',
    'serious', 'caring', 'adventurous', 'intellectual', 'romantic'
  ];

  const relationshipOptions = [
    'friend', 'best friend', 'romantic partner', 'mentor', 'spouse', 'companion'
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadFile(file);
      setProfile({ ...profile, referenceImageUrl: imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const togglePersonality = (trait: string) => {
    const current = profile.personality || [];
    if (current.includes(trait)) {
      setProfile({ ...profile, personality: current.filter(t => t !== trait) });
    } else {
      setProfile({ ...profile, personality: [...current, trait] });
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    saveAIProfile(profile);
    setShowSuccess(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(false);
    }, 2000);
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
          <h1 className="text-xl font-semibold text-forest-primary">AI Profile</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-image mr-3"></i>
              Reference Image
            </h2>
            <div className="flex flex-col items-center space-y-4">
              {profile.referenceImageUrl && (
                <img
                  src={profile.referenceImageUrl}
                  alt="AI Reference"
                  className="w-32 h-32 rounded-full object-cover shadow-nature"
                />
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary w-full sm:w-auto"
              >
                <i className="fa fa-upload mr-2"></i>
                Upload Reference Image
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-signature mr-3"></i>
              Name
            </h2>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter AI name"
              className="input-field"
            />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-heart mr-3"></i>
              Relationship
            </h2>
            <select
              value={profile.relationship}
              onChange={(e) => setProfile({ ...profile, relationship: e.target.value })}
              className="custom-select"
            >
              {relationshipOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-brain mr-3"></i>
              Personality Traits
            </h2>
            <div className="flex flex-wrap gap-2">
              {personalityOptions.map(trait => (
                <button
                  key={trait}
                  onClick={() => togglePersonality(trait)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all touch-manipulation ${
                    profile.personality?.includes(trait)
                      ? 'bg-gradient-to-r from-forest-primary to-fresh-primary text-white shadow-nature'
                      : 'bg-white border-2 border-nature-border text-gray-700 hover:border-forest-primary'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-user mr-3"></i>
              Appearance
            </h2>
            <textarea
              value={profile.appearance}
              onChange={(e) => setProfile({ ...profile, appearance: e.target.value })}
              placeholder="Describe physical appearance..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-book-open mr-3"></i>
              Backstory
            </h2>
            <textarea
              value={profile.backstory}
              onChange={(e) => setProfile({ ...profile, backstory: e.target.value })}
              placeholder="Write a detailed backstory..."
              rows={6}
              className="input-field resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary w-full"
          >
            {isSaving ? (
              <>
                <i className="fa fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : showSuccess ? (
              <>
                <i className="fa fa-check mr-2"></i>
                Saved!
              </>
            ) : (
              <>
                <i className="fa fa-save mr-2"></i>
                Save Profile
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AIProfileScreen;