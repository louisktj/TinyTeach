
import React, { useState, useCallback } from 'react';
import * as geminiService from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
  
const Spinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-md text-slate-700">{message}</p>
    </div>
  );

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      setEditedImageUrl(null);
      setError(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleEdit = useCallback(async () => {
    if (!originalImage || !prompt) {
      setError('Please upload an image and enter an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const base64Image = await fileToBase64(originalImage);
      const editedImage = await geminiService.editImage(base64Image, originalImage.type, prompt);
      setEditedImageUrl(editedImage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-slate-600 mb-2">1. Upload Image</label>
              <input 
                id="image-upload"
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 transition"
              />
            </div>
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-600 mb-2">2. Describe Your Edit</label>
                <input
                    type="text"
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Add a retro filter"
                    className="w-full bg-white/50 border border-slate-300 text-slate-800 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
            </div>
        </div>
        <button
            onClick={handleEdit}
            disabled={isLoading || !originalImage || !prompt}
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95 shadow-md hover:shadow-lg"
            >
            {isLoading ? 'Editing...' : 'Apply Edit'}
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center mb-8">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-slate-700">Original</h3>
          <div className="aspect-square bg-white/30 rounded-lg flex items-center justify-center border-2 border-slate-300">
            {previewUrl ? (
                <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-md"/>
            ) : (
                <p className="text-slate-500">Upload an image to see it here</p>
            )}
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-slate-700">Edited</h3>
          <div className="aspect-square bg-white/30 rounded-lg flex items-center justify-center border-2 border-slate-300">
            {isLoading && <Spinner message="Applying your edit..."/>}
            {!isLoading && editedImageUrl && (
                <img src={editedImageUrl} alt="Edited" className="max-w-full max-h-full object-contain rounded-md"/>
            )}
            {!isLoading && !editedImageUrl && (
                <p className="text-slate-500">Your edited image will appear here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
