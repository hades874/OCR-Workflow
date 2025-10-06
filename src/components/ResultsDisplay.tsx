'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface ResultFile {
  name: string;
  url: string;
  size?: string;
}

interface ResultsDisplayProps {
  files: ResultFile[];
  onReset?: () => void;
}

export default function ResultsDisplay({ files, onReset }: ResultsDisplayProps) {
  const handleDownload = (file: ResultFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Success Message */}
      <motion.div
        variants={itemVariants}
        className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="font-semibold text-foreground">
              Processing Complete!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your document has been successfully processed. Download the results below.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Download Cards */}
      <motion.div variants={itemVariants} className="space-y-3">
        {files.map((file) => (
          <Card key={file.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  {file.size && (
                    <p className="text-sm text-muted-foreground">{file.size}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleDownload(file)}
                aria-label={`Download ${file.name}`}
              >
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Process Another Button */}
      {onReset && (
        <motion.div variants={itemVariants} className="text-center pt-4">
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Process Another Document
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
