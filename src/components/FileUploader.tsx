'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { Button } from './ui/button';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  isDisabled?: boolean;
}

export default function FileUploader({
  onFileSelect,
  onFileRemove,
  accept = '*/*',
  isDisabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setIsDragging(true);
  }, [isDisabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (isDisabled) return;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile, isDisabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if(onFileRemove) onFileRemove();
    if (inputRef.current) {
        inputRef.current.value = "";
    }
  }, [onFileRemove]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <div
              className={cn(
                'relative border-2 border-dashed rounded-lg p-8 transition-colors duration-200 text-center',
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50',
                isDisabled && 'opacity-50 cursor-not-allowed bg-secondary'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isDisabled}
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop your file here or{' '}
                    <span className="text-primary font-semibold">browse files</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file_display"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border rounded-lg p-4 bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-primary/10 rounded">
                  <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                onClick={removeFile}
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                disabled={isDisabled}
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
