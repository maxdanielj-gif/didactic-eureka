const BASE_URL = import.meta.env.DEV ? '/api' : 'https://danielzbog70.lastapp.dev';
const APP_ID = '74c31b9e-6a21-4fe3-b7db-b136797e000e';

export interface UserData {
  id: string;
  provider: string;
  created_at: string;
}

export interface AITextResponse {
  response: string;
  memory_update?: string;
  image_trigger?: boolean;
  image_prompt?: string;
}

export interface AIImageAnalysis {
  analysis: string;
  response: string;
  detected_elements: string[];
  emotional_tone: string;
  suggested_reply: string;
}

export interface ImageGenerationResponse {
  result: string;
}

export interface VoiceSettings {
  gender: 'male' | 'female';
  pitch: number;
  speed: number;
}

export const initializeUser = async (): Promise<UserData> => {
  try {
    const response = await fetch(`${BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: APP_ID,
        table_name: 'users',
        data: {
          provider: 'anonymous',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize user');
    }

    const userData: UserData = await response.json();
    localStorage.setItem('user_data', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Error initializing user:', error);
    throw error;
  }
};

export const getUserId = (): string => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    const parsed = JSON.parse(userData);
    return parsed.id;
  }
  return '';
};

export const uploadFile = async (file: File): Promise<string> => {
  try {
    const userId = getUserId();
    const formData = new FormData();
    formData.append('app_id', APP_ID);
    formData.append('user_id', userId);
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/data/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const sendTextQuery = async (query: string): Promise<AITextResponse> => {
  try {
    const formData = new URLSearchParams();
    formData.append('app_id', APP_ID);
    formData.append('query', query);

    const response = await fetch(`${BASE_URL}/aiapi/answertext`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending text query:', error);
    throw error;
  }
};

export const analyzeImage = async (imageFile: File): Promise<AIImageAnalysis> => {
  try {
    const formData = new FormData();
    formData.append('app_id', APP_ID);
    formData.append('image', imageFile);

    const response = await fetch(`${BASE_URL}/aiapi/answerimage`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const generateImage = async (referenceImageUrl: string, prompt: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('app_id', APP_ID);
    formData.append('uid', 'f7ff67a2edd551d0b57f974de2f040529418415f8cf02a1da9eeedb99f98942a');
    formData.append('image_urls', JSON.stringify([referenceImageUrl]));
    formData.append('prompt', prompt);

    const response = await fetch(`${BASE_URL}/aiapi/image2image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data: ImageGenerationResponse = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Get voice settings from localStorage
export const getVoiceSettings = (): VoiceSettings => {
  const stored = localStorage.getItem('voice_settings');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    gender: 'female',
    pitch: 1.0,
    speed: 1.0,
  };
};

// Save voice settings to localStorage
export const saveVoiceSettings = (settings: VoiceSettings): void => {
  localStorage.setItem('voice_settings', JSON.stringify(settings));
};

// Text-to-Speech functionality with voice settings
export const textToSpeech = (text: string, settings?: VoiceSettings): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const voiceSettings = settings || getVoiceSettings();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Filter voices by gender preference
    const preferredVoices = voices.filter(voice => {
      const voiceName = voice.name.toLowerCase();
      if (voiceSettings.gender === 'female') {
        return voiceName.includes('female') || voiceName.includes('woman') || 
               voiceName.includes('samantha') || voiceName.includes('victoria');
      } else {
        return voiceName.includes('male') || voiceName.includes('man') || 
               voiceName.includes('daniel') || voiceName.includes('alex');
      }
    });
    
    // Use preferred voice if available, otherwise use default
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0];
    }
    
    utterance.rate = voiceSettings.speed;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported in this browser');
  }
};

export const stopTextToSpeech = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Speech-to-Text functionality
export const startSpeechToText = (
  onResult: (transcript: string) => void,
  onError?: (error: string) => void
): (() => void) | null => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported in this browser');
    onError?.('Speech recognition not supported in this browser');
    return null;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    onResult(finalTranscript || interimTranscript);
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    onError?.(event.error);
  };

  recognition.start();

  return () => {
    recognition.stop();
  };
};