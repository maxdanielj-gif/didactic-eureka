export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface AIProfile {
  name: string;
  personality: string[];
  appearance: string;
  backstory: string;
  referenceImageUrl?: string;
  relationship: string;
}

export interface UserProfile {
  name: string;
  bio: string;
}

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: number;
  tags: string[];
  isAIGenerated?: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  type: 'generated' | 'uploaded';
  timestamp: number;
  prompt?: string;
  context?: string;
  tags: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  timestamp: number;
  isAIGenerated?: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSave: boolean;
}

const STORAGE_KEYS = {
  MESSAGES: 'ai_companion_messages',
  AI_PROFILE: 'ai_companion_profile',
  USER_PROFILE: 'ai_companion_user',
  MEMORY: 'ai_companion_memory',
  GALLERY: 'ai_companion_gallery',
  JOURNAL: 'ai_companion_journal',
  SETTINGS: 'ai_companion_settings',
};

export const saveMessages = (messages: Message[]): void => {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
};

export const getMessages = (): Message[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
};

export const saveAIProfile = (profile: AIProfile): void => {
  localStorage.setItem(STORAGE_KEYS.AI_PROFILE, JSON.stringify(profile));
};

export const getAIProfile = (): AIProfile => {
  const data = localStorage.getItem(STORAGE_KEYS.AI_PROFILE);
  return data ? JSON.parse(data) : {
    name: 'Companion',
    personality: ['friendly', 'empathetic', 'witty'],
    appearance: '',
    backstory: '',
    relationship: 'friend',
  };
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getUserProfile = (): UserProfile => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : {
    name: 'User',
    bio: '',
  };
};

export const saveMemory = (memories: MemoryEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(memories));
};

export const getMemory = (): MemoryEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEMORY);
  return data ? JSON.parse(data) : [];
};

export const saveGallery = (images: GalleryImage[]): void => {
  localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(images));
};

export const getGallery = (): GalleryImage[] => {
  const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
  return data ? JSON.parse(data) : [];
};

export const saveJournal = (entries: JournalEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
};

export const getJournal = (): JournalEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  return data ? JSON.parse(data) : [];
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    theme: 'light',
    notifications: true,
    autoSave: true,
  };
};

export const exportAllData = (): string => {
  const allData = {
    messages: getMessages(),
    aiProfile: getAIProfile(),
    userProfile: getUserProfile(),
    memory: getMemory(),
    gallery: getGallery(),
    journal: getJournal(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(allData, null, 2);
};

export const importAllData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.messages) saveMessages(data.messages);
    if (data.aiProfile) saveAIProfile(data.aiProfile);
    if (data.userProfile) saveUserProfile(data.userProfile);
    if (data.memory) saveMemory(data.memory);
    if (data.gallery) saveGallery(data.gallery);
    if (data.journal) saveJournal(data.journal);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};