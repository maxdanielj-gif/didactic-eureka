import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserProfile, getUserProfile } from '../services/storage';
import type { UserProfile } from '../services/storage';

const UserProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    saveUserProfile(profile);
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
          <h1 className="text-xl font-semibold text-forest-primary">User Profile</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-forest-primary to-fresh-primary rounded-full flex items-center justify-center shadow-nature-lg">
                <i className="fa fa-user text-4xl text-white"></i>
              </div>
            </div>
            <h2 className="text-center text-2xl font-bold text-forest-primary mb-2">
              {profile.name || 'Your Name'}
            </h2>
            <p className="text-center text-gray-500">Personal Profile</p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-signature mr-3"></i>
              Your Name
            </h2>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your name"
              className="input-field"
            />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-info-circle mr-3"></i>
              About You
            </h2>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell your AI companion about yourself..."
              rows={8}
              className="input-field resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              Share your interests, hobbies, preferences, and anything you'd like your companion to know about you.
            </p>
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

export default UserProfileScreen;