"use client"

import { useState, useCallback } from 'react';
import axios from 'axios';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  sessionId: string | null;
}

interface UploadResult {
  sessionId: string;
  message: string;
}

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    sessionId: null,
  });

  const upload = useCallback(async (file: File) => {
    setState({ isUploading: true, progress: 0, error: null, sessionId: null });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', Date.now().toString());

    try {
      const response = await axios.post<UploadResult>(
        '/api/webhook',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? file.size;
            const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
            setState(prev => ({ ...prev, progress: percentCompleted }));
          },
        }
      );

      setState(prev => ({
        ...prev,
        isUploading: false,
        sessionId: response.data.sessionId,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      sessionId: null,
    });
  }, []);

  return { ...state, upload, reset };
}
