'use client';

import { useState, useEffect } from 'react';
import { useAbout } from '@/hooks/useApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { UploadedFileData } from '@/types';

interface AboutFormData {
  name: string;
  avatar: string;
  intro: string;
  description: string;
}

export default function AboutSettingsPage() {
  const { about, isLoading, mutate } = useAbout();
  const { uploading, uploadProgress, uploadedData, error: uploadError, handleFileChange, reset } = useFileUpload({
    onSuccess: (data: UploadedFileData) => {
      setFormData((prev) => ({ ...prev, avatar: data.url }));
      setSaveSuccess(false);
      setSaveError(null);
    },
    onError: (error: string) => {
      console.error('Upload failed:', error);
      setSaveError('Failed to upload image');
    }
  });

  const [formData, setFormData] = useState<AboutFormData>({
    name: '',
    avatar: '',
    intro: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize form data when about data loads
  useEffect(() => {
    if (about) {
      setFormData({
        name: about.name || '',
        avatar: about.avatar || '',
        intro: about.intro || '',
        description: about.description || '',
      });
    }
  }, [about]);

  // Sync uploaded data to form
  useEffect(() => {
    if (uploadedData) {
      setFormData((prev) => ({ ...prev, avatar: uploadedData.url }));
    }
  }, [uploadedData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      setSaveSuccess(true);
      mutate();
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">About Page Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage the content displayed on the About page
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-start gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No photo
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              {uploading && (
                <p className="mt-2 text-sm text-gray-500">Uploading... {uploadProgress}%</p>
              )}
              {uploadError && (
                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Recommended: Square image, at least 400x400 pixels
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Photographer Information
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="e.g., Alens"
              />
            </div>

            <div>
              <label
                htmlFor="intro"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Introduction *
              </label>
              <textarea
                id="intro"
                name="intro"
                value={formData.intro}
                onChange={handleChange}
                required
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Brief introduction about yourself..."
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Detailed Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="More detailed information about your photography experience..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          {saveSuccess && (
            <span className="text-green-600 text-sm">Saved successfully!</span>
          )}
          {saveError && (
            <span className="text-red-600 text-sm">{saveError}</span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
