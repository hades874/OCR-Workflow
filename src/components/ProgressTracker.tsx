'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Activity } from 'lucide-react';
import { formatTime, calculateETA } from '@/lib/utils';
import { Progress } from './ui/progress';

interface ProgressTrackerProps {
  progress: number;
  status: string;
  startTime?: number;
}

export default function ProgressTracker({
  progress,
  status,
  startTime,
}: ProgressTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  const eta = useMemo(() => {
    return calculateETA(progress, elapsedTime);
  }, [progress, elapsedTime]);

  useEffect(() => {
    if (!startTime) {
      setElapsedTime(0);
      return;
    };

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">
            Processing Document
          </span>
          <span className="text-sm font-bold text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Status */}
      <div className="flex items-center justify-center space-x-2 py-2">
        <Activity className="w-4 h-4 text-primary animate-pulse" />
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>

      {/* Time Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Elapsed Time</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {formatTime(elapsedTime)}
          </p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Estimated Time Remaining</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {eta > 0 ? formatTime(eta) : '--'}
          </p>
        </div>
      </div>
    </div>
  );
}
