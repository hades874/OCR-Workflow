'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import FileUploader from '@/components/FileUploader';
import ProgressTracker from '@/components/ProgressTracker';
import ResultsDisplay from '@/components/ResultsDisplay';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';

type AppState = 'idle' | 'file_selected' | 'uploading' | 'processing' | 'complete' | 'error';

interface ResultFile {
  name: string;
  url: string;
  size?: string;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<ResultFile[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const { toast } = useToast();
  const {
    upload,
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    sessionId,
    reset: resetUpload,
  } = useFileUpload();

  const wsUrl = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_N8N_WEBSOCKET_URL;
    if (sessionId && baseUrl) {
      // Append sessionId as a query parameter for easy parsing on the server
      return `${baseUrl}?sessionId=${sessionId}`;
    }
    return null;
  }, [sessionId]);

  const { lastMessage, connect, disconnect } = useWebSocket(wsUrl);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAppState('file_selected');
  };

  const handleStartProcessing = async () => {
    if (!selectedFile) return;
    setAppState('uploading');
    try {
      await upload(selectedFile);
    } catch (e) {
      // error is handled in the hook's state
    }
  };
  
  const resetState = useCallback(() => {
    setAppState('idle');
    setSelectedFile(null);
    setStartTime(undefined);
    setResults([]);
    setStatusMessage('');
    setProcessingProgress(0);
    resetUpload();
    disconnect();
  }, [resetUpload, disconnect]);


  // Effect to handle upload state changes
  useEffect(() => {
    if (isUploading) {
      setAppState('uploading');
      setStatusMessage('Uploading file...');
    }
  }, [isUploading]);
  
  // Effect to handle upload errors
  useEffect(() => {
    if (uploadError) {
      setAppState('error');
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: uploadError,
      });
    }
  }, [uploadError, toast]);
  
  // Effect to transition from upload to processing
  useEffect(() => {
    if (sessionId && appState === 'uploading' && !isUploading) {
      setAppState('processing');
      setStartTime(Date.now());
      setStatusMessage('Connecting to processing service...');
      connect();
    }
  }, [sessionId, appState, isUploading, connect]);

  // Effect to handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const { type, progress, message, data } = lastMessage;
      switch (type) {
        case 'progress':
          setProcessingProgress(progress ?? 0);
          setStatusMessage(message ?? 'Processing...');
          break;
        case 'complete':
          setProcessingProgress(100);
          setResults(data?.files ?? []);
          setAppState('complete');
          disconnect();
          break;
        case 'error':
          setAppState('error');
          toast({
            variant: 'destructive',
            title: 'Processing Error',
            description: message ?? 'An unknown error occurred.',
          });
          disconnect();
          break;
      }
    }
  }, [lastMessage, disconnect, toast]);

  const renderContent = () => {
    switch (appState) {
      case 'idle':
      case 'file_selected':
        return (
          <>
            <FileUploader
              onFileSelect={handleFileSelect}
              isDisabled={isUploading}
            />
            {appState === 'file_selected' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6">
                <Button onClick={handleStartProcessing} size="lg" disabled={isUploading}>
                  Start Processing
                </Button>
              </motion.div>
            )}
          </>
        );
      case 'uploading':
      case 'processing':
        const progress = appState === 'uploading' ? uploadProgress : processingProgress;
        return <ProgressTracker progress={progress} status={statusMessage} startTime={startTime} />;
      case 'complete':
        return <ResultsDisplay files={results} onReset={resetState} />;
      case 'error':
        return (
          <div className="text-center space-y-4">
            <p className="text-destructive-foreground">An error occurred. Please try again.</p>
            <Button onClick={resetState} variant="outline">
              Start Over
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-background dark:bg-gray-900/50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4"
          >
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold">OCR Workflow Pro</h2>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground"
          >
            Unlock Your Documents
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Effortlessly extract text and data from your PDFs with our AI-powered OCR pipeline.
          </motion.p>
        </header>

        <motion.div
          layout
          className="relative bg-card p-6 sm:p-10 rounded-xl shadow-lg border"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={appState}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
