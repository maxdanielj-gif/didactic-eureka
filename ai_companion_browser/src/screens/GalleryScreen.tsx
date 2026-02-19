import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { getGallery, saveGallery } from '../services/storage';
import { downloadFile } from '../services/api';
import type { GalleryImage } from '../services/storage';

const GalleryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'generated' | 'uploaded'>('all');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setImages(getGallery());
  }, []);

  const filteredImages = activeTab === 'all' 
    ? images 
    : images.filter(img => img.type === activeTab);

  const toggleImageSelection = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };

  const handleDownloadSingle = async (image: GalleryImage) => {
    try {
      await downloadFile(image.url, `image-${image.id}.jpg`);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const handleBatchDownload = async () => {
    if (selectedImages.size === 0) return;

    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const selectedImageObjects = images.filter(img => selectedImages.has(img.id));

      for (const image of selectedImageObjects) {
        try {
          const response = await fetch(image.url);
          const blob = await response.blob();
          zip.file(`image-${image.id}.jpg`, blob);
        } catch (error) {
          console.error(`Error adding image ${image.id} to zip:`, error);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gallery-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSelectedImages(new Set());
    } catch (error) {
      console.error('Error creating zip:', error);
      alert('Failed to download images as ZIP');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    const updated = images.filter(img => img.id !== id);
    setImages(updated);
    saveGallery(updated);
    selectedImages.delete(id);
    setSelectedImages(new Set(selectedImages));
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
          <h1 className="text-xl font-semibold text-forest-primary">Gallery</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="glass-effect border-b border-nature-border sticky top-[57px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 font-medium transition-all touch-manipulation ${
                activeTab === 'all'
                  ? 'text-forest-primary border-b-2 border-forest-primary'
                  : 'text-gray-500'
              }`}
            >
              <i className="fa fa-th mr-2"></i>
              All
            </button>
            <button
              onClick={() => setActiveTab('generated')}
              className={`flex-1 py-3 font-medium transition-all touch-manipulation ${
                activeTab === 'generated'
                  ? 'text-forest-primary border-b-2 border-forest-primary'
                  : 'text-gray-500'
              }`}
            >
              <i className="fa fa-robot mr-2"></i>
              Generated
            </button>
            <button
              onClick={() => setActiveTab('uploaded')}
              className={`flex-1 py-3 font-medium transition-all touch-manipulation ${
                activeTab === 'uploaded'
                  ? 'text-forest-primary border-b-2 border-forest-primary'
                  : 'text-gray-500'
              }`}
            >
              <i className="fa fa-upload mr-2"></i>
              Uploaded
            </button>
          </div>
        </div>
      </div>

      {selectedImages.size > 0 && (
        <div className="glass-effect border-b border-nature-border sticky top-[113px] z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-forest-primary font-medium">
              {selectedImages.size} selected
            </span>
            <button
              onClick={handleBatchDownload}
              disabled={isDownloading}
              className="btn-primary py-2 px-4 text-sm"
            >
              {isDownloading ? (
                <>
                  <i className="fa fa-spinner fa-spin mr-2"></i>
                  Downloading...
                </>
              ) : (
                <>
                  <i className="fa fa-file-archive mr-2"></i>
                  Download ZIP
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6 pb-24">
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <i className="fa fa-images text-6xl text-forest-primary/30 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Images Yet</h2>
            <p className="text-gray-500">
              {activeTab === 'all'
                ? 'Images will appear here'
                : activeTab === 'generated'
                ? 'Generated images will appear here'
                : 'Uploaded images will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="relative group animate-fade-in">
                <div
                  className={`relative rounded-xl overflow-hidden shadow-nature hover:shadow-nature-lg transition-all cursor-pointer ${
                    selectedImages.has(image.id) ? 'ring-4 ring-forest-primary' : ''
                  }`}
                  onClick={() => toggleImageSelection(image.id)}
                >
                  <img
                    src={image.url}
                    alt={image.prompt || 'Gallery image'}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
                  {selectedImages.has(image.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-forest-primary rounded-full flex items-center justify-center">
                      <i className="fa fa-check text-white text-sm"></i>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSingle(image);
                    }}
                    className="flex-1 py-2 px-3 bg-white border-2 border-nature-border rounded-lg hover:border-forest-primary transition-colors text-sm touch-manipulation"
                  >
                    <i className="fa fa-download"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                    className="flex-1 py-2 px-3 bg-white border-2 border-nature-border rounded-lg hover:border-red-500 hover:text-red-500 transition-colors text-sm touch-manipulation"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
                {image.prompt && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">{image.prompt}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GalleryScreen;