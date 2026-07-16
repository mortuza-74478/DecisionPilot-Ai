'use client';

import * as React from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';

interface ThinkingIndicatorProps {
  status: 'idle' | 'questioning' | 'reasoning' | 'completed' | 'error';
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ status }) => {
  const steps = [
    'Parsing decision goal and constraints...',
    'Extracting criteria weights and priorities...',
    'Generating evaluation options...',
    'Building structured comparison model...',
    'Identifying pros and cons list...',
    'Assessing critical blindspots and hidden risks...',
    'Calculating overall weighted scores...',
    'Generating alternative recommendation pathways...',
    'Writing explainable reasoning model...'
  ];

  const [currentStepIdx, setCurrentStepIdx] = React.useState(0);

  React.useEffect(() => {
    if (status !== 'reasoning') {
      setCurrentStepIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500); // cycle step every 1.5 seconds

    return () => clearInterval(interval);
  }, [status, steps.length]);

  if (status !== 'reasoning') return null;

  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center space-y-8 animate-in fade-in duration-300">
      {/* Orb Spinner */}
      <div className="relative w-24 h-24 mx-auto">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 blur-xl opacity-40 animate-pulse-slow" />
        {/* Border spinner */}
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin" />
        {/* Inner static orb */}
        <div className="absolute inset-2 rounded-full bg-card border border-border flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          AI Decision Engine reasoning
        </h3>
        <p className="text-xs text-muted-foreground">
          Running multi-criteria analysis. This may take a few seconds...
        </p>
      </div>

      {/* Structured steps log */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-left max-w-sm mx-auto space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIdx;
          const isActive = idx === currentStepIdx;
          
          return (
            <div 
              key={idx} 
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                isDone || isActive ? 'opacity-100' : 'opacity-30'
              }`}
            >
              {isDone ? (
                <div className="w-4.5 h-4.5 rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-500 border border-green-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              ) : isActive ? (
                <Loader2 className="w-4.5 h-4.5 text-blue-500 animate-spin shrink-0" />
              ) : (
                <div className="w-4.5 h-4.5 rounded-full border border-border shrink-0" />
              )}
              <span className={`text-[11px] font-medium leading-none ${
                isActive ? 'text-foreground font-bold' : isDone ? 'text-muted-foreground/80' : 'text-muted-foreground/60'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
