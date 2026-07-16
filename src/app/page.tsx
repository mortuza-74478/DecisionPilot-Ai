'use client';

import * as React from 'react';
import { SidebarHistory } from '@/components/layout/SidebarHistory';
import { DecisionWorkspace } from '@/components/features/DecisionWorkspace';
import { ApiKeysModal } from '@/components/features/ApiKeysModal';
import { Menu, X, Info } from 'lucide-react';
import { useDecisionStore } from '@/store/useDecisionStore';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const { init } = useDecisionStore();

  // Sync state on load
  React.useEffect(() => {
    init();
  }, [init]);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 1. Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <SidebarHistory onOpenSettings={() => setIsSettingsOpen(true)} />
      </div>

      {/* 2. Mobile Sidebar Slide-over Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div 
            className="w-72 h-full bg-card border-r border-border animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarHistory onOpenSettings={() => {
              setIsSettingsOpen(true);
              setIsMobileSidebarOpen(false);
            }} />
          </div>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden border-b border-border/80 bg-card/50 backdrop-blur-md px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/10">
              DP
            </div>
            <span className="font-bold text-xs">DecisionPilot AI</span>
          </div>

          <div className="w-8 h-8" /> {/* Spacer to center name */}
        </header>

        {/* Workspace content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DecisionWorkspace />
        </div>
      </div>

      {/* 4. Secure Settings Modal */}
      <ApiKeysModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </main>
  );
}
