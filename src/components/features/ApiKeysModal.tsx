'use client';

import * as React from 'react';
import { useDecisionStore } from '@/store/useDecisionStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Key, Eye, EyeOff, ShieldCheck, Info } from 'lucide-react';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose }) => {
  const { apiKeys, saveApiKeys } = useDecisionStore();

  const [geminiKey, setGeminiKey] = React.useState('');
  const [openaiKey, setOpenaiKey] = React.useState('');
  
  const [showGemini, setShowGemini] = React.useState(false);
  const [showOpenai, setShowOpenai] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState(false);

  // Sync keys from store when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setGeminiKey(apiKeys.gemini || '');
      setOpenaiKey(apiKeys.openai || '');
      setSuccessMsg(false);
    }
  }, [isOpen, apiKeys]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKeys({
      gemini: geminiKey.trim() || null,
      openai: openaiKey.trim() || null,
    });
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm leading-none">Secure API Configurations</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          <div className="p-3 bg-muted/40 rounded-lg flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              API keys are saved <strong>only locally</strong> in your browser's local storage and never sent to our servers.
              If keys are not supplied, DecisionPilot will operate in <strong>Simulation Fallback Mode</strong> using rich offline decision flows.
            </p>
          </div>

          {/* Gemini Key */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Google Gemini API Key
            </label>
            <div className="relative">
              <Input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={apiKeys.gemini ? '••••••••••••••••••••' : 'Enter Gemini API Key...'}
                className="pr-10 bg-muted/20"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${apiKeys.gemini ? 'bg-green-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] text-muted-foreground">
                {apiKeys.gemini ? 'Live Generation Active (Gemini)' : 'Inactive (Simulation Fallback)'}
              </span>
            </div>
          </div>

          {/* OpenAI Key */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              OpenAI API Key
            </label>
            <div className="relative">
              <Input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={apiKeys.openai ? '••••••••••••••••••••' : 'Enter OpenAI API Key...'}
                className="pr-10 bg-muted/20"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${apiKeys.openai ? 'bg-green-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] text-muted-foreground">
                {apiKeys.openai ? 'Live Generation Active (OpenAI)' : 'Inactive (Simulation Fallback)'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} size="sm">
              Cancel
            </Button>
            
            {successMsg ? (
              <Button type="button" variant="secondary" size="sm" className="bg-green-500/10 text-green-500 border border-green-500/20" disabled>
                <ShieldCheck className="w-4 h-4 mr-1.5 animate-pulse" />
                Saved Successfully!
              </Button>
            ) : (
              <Button type="submit" variant="default" size="sm">
                Save Configurations
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
