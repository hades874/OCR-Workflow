'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const N8N_FORM_URL = 'https://stage-n8n.10minuteschool.com/form-test/268b2b65-4c84-4b07-aab9-57bc47c4a873';

export default function Home() {

  const handleStartProcess = () => {
    window.open(N8N_FORM_URL, '_blank', 'noopener,noreferrer');
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
          className="relative bg-card p-6 sm:p-10 rounded-xl shadow-lg border flex flex-col items-center justify-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-foreground">Ready to start?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Click the button below to open the submission form. You'll be able to upload your file and start the OCR process directly through our n8n workflow.
            </p>
            <Button
              onClick={handleStartProcess}
              size="lg"
              className="group"
            >
              Start OCR Process
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
