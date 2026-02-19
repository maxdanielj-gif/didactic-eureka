import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateImage } from '../services/api';
import { downloadFile } from '../services/api';
import { saveGallery, getGallery, getAIProfile } from '../services/storage';
import type { GalleryImage } from '../services/storage';

const ImageGeneratorScreen: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const aiProfile = getAIProfile();
    if (!aiProfile.referenceImageUrl) {
      alert('Please upload a reference image in AI Profile first');
      return;
    }

    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(aiProfile.referenceImageUrl, prompt);
      setGeneratedImage(imageUrl);

      const galleryImage: GalleryImage = {
        id: Date.now().toString(),
        url: imageUrl,
        type: 'generated',
        timestamp: Date.now(),
        prompt: prompt,
        tags: [],
      };

      const gallery = getGallery();
      saveGallery([...gallery, galleryImage]);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      await downloadFile(generatedImage, `generated-image-${Date.now()}.jpg`);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const handleReset = () => {
    setPrompt('');
    setGeneratedImage(null);
  };

  const aiProfile = getAIProfile();

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
          <h1 className="text-xl font-semibold text-forest-primary">Image Generator</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl pb-24">
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-image mr-3"></i>
              Reference Image
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Using reference image from AI Profile
            </p>
            {aiProfile.referenceImageUrl ? (
              <div className="flex justify-center">
                <img
                  src={aiProfile.referenceImageUrl}
                  alt="AI Reference"
                  className="w-32 h-32 rounded-full object-cover shadow-nature"
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fa fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                <p className="text-gray-600 mb-4">No reference image found</p>
                <button
                  onClick={() => navigate('/ai-profile')}
                  className="btn-primary"
                >
                  <i className="fa fa-upload mr-2"></i>
                  Upload in AI Profile
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
              <i className="fa fa-pen mr-3"></i>
              Generation Prompt
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              rows={4}
              className="input-field resize-none mb-4"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !aiProfile.referenceImageUrl}
              className="btn-primary w-full"
            >
              {isGenerating ? (
                <>
                  <i className="fa fa-spinner fa-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fa fa-magic mr-2"></i>
                  Generate Image
                </>
              )}
            </button>
          </div>

          {generatedImage && (
            <div className="card animate-fade-in">
              <h2 className="text-lg font-semibold text-forest-primary mb-4 flex items-center">
                <i className="fa fa-image mr-3"></i>
                Generated Image
              </h2>
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full rounded-xl shadow-nature-lg mb-4"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 btn-primary"
                >
                  <i className="fa fa-download mr-2"></i>
                  Download
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 btn-secondary"
                >
                  <i className="fa fa-redo mr-2"></i>
                  Generate New
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ImageGeneratorScreen;