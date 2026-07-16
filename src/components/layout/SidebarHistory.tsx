'use client';

import * as React from 'react';
import { useDecisionStore } from '@/store/useDecisionStore';
import { 
  Search, Trash2, Edit2, Settings, Plus, Sun, Moon, Check, X, 
  Sparkles, ShieldCheck, Compass, GraduationCap, Briefcase, 
  Smartphone, CreditCard, ShoppingBag, Landmark, Globe
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface SidebarHistoryProps {
  onOpenSettings: () => void;
}

export const SidebarHistory: React.FC<SidebarHistoryProps> = ({ onOpenSettings }) => {
  const {
    decisions,
    activeDecisionId,
    theme,
    init,
    setActiveDecisionId,
    deleteDecision,
    renameDecision,
    toggleTheme,
    resetActiveDecisionFlow
  } = useDecisionStore();

  const [search, setSearch] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  React.useEffect(() => {
    init();
  }, [init]);

  const filteredDecisions = decisions.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.question.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'career':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-green-400" />;
      case 'technology':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'travel':
        return <Compass className="w-4 h-4 text-amber-400" />;
      case 'finance':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-pink-400" />;
      case 'business':
        return <Landmark className="w-4 h-4 text-sky-400" />;
      default:
        return <Globe className="w-4 h-4 text-slate-400" />;
    }
  };

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleRename = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      await renameDecision(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this decision?')) {
      await deleteDecision(id);
    }
  };

  return (
    <aside className="w-72 border-r border-border bg-card flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div 
          onClick={resetActiveDecisionFlow}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10">
            DP
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-wide">DecisionPilot</h1>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">AI Intelligence</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={resetActiveDecisionFlow}
          className="w-8 h-8 rounded-lg"
          title="New Decision"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Search History */}
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions..."
            className="pl-9 h-9 rounded-lg bg-muted/30 focus:bg-transparent"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredDecisions.length === 0 ? (
          <div className="py-8 px-4 text-center text-xs text-muted-foreground">
            {search ? 'No matches found.' : 'No decisions saved yet.'}
          </div>
        ) : (
          filteredDecisions.map((dec) => {
            const isActive = dec.id === activeDecisionId;
            const isEditing = dec.id === editingId;

            return (
              <div
                key={dec.id}
                onClick={() => !isEditing && setActiveDecisionId(dec.id)}
                className={`group relative flex flex-col gap-1.5 p-3 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-secondary text-secondary-foreground border border-border/85'
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                {isEditing ? (
                  <form 
                    onSubmit={(e) => handleRename(dec.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 w-full"
                  >
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-7 text-xs py-1 px-2 focus-visible:ring-1 focus-visible:ring-offset-0"
                      autoFocus
                    />
                    <button type="submit" className="p-1 text-green-500 hover:bg-muted rounded">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditingId(null)}
                      className="p-1 text-destructive hover:bg-muted rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between pr-8">
                      <h4 className="text-xs font-semibold truncate leading-tight w-full pr-1">
                        {dec.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize font-medium">
                        {getCategoryIcon(dec.category)}
                        {dec.category}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60">
                        {new Date(dec.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Action buttons (shown on hover) */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => startRename(dec.id, dec.title, e)}
                        className="p-1 hover:bg-muted-foreground/15 text-muted-foreground hover:text-foreground rounded transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(dec.id, e)}
                        className="p-1 hover:bg-destructive/15 text-muted-foreground hover:text-destructive rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2.5 rounded-lg hover:bg-muted/40"
        >
          <Settings className="w-4 h-4" />
          <span>API Config</span>
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
        </Button>
      </div>
    </aside>
  );
};
