'use client';

import * as React from 'react';
import { useDecisionStore } from '@/store/useDecisionStore';
import { QuestionPanel } from './QuestionPanel';
import { ThinkingIndicator } from './ThinkingIndicator';
import { DecisionMatrix } from './DecisionMatrix';
import { RiskAnalysis } from './RiskAnalysis';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { 
  copyReportToClipboard, shareDecision, exportToPdf 
} from '@/utils/exportUtils';
import { 
  Sparkles, Check, Copy, Share2, FileDown, 
  RefreshCcw, AlertTriangle, ArrowRight, ShieldCheck, 
  HelpCircle, Compass, GraduationCap, Briefcase, 
  Smartphone, CreditCard, ShoppingBag, Landmark, Globe, CheckCircle2
} from 'lucide-react';

export const DecisionWorkspace: React.FC = () => {
  const { 
    decisions, 
    activeDecisionId, 
    isLoading, 
    error,
    createDecision,
    refineDecision,
    submitAnswers
  } = useDecisionStore();

  const decision = decisions.find((d) => d.id === activeDecisionId);

  // Form states for landing page / new decisions
  const [newQuestion, setNewQuestion] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('General Decision');

  // Refinement feedback input
  const [refinementInput, setRefinementInput] = React.useState('');

  // Copy & Share tooltip status
  const [copied, setCopied] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const [shareText, setShareText] = React.useState('');

  const categories = [
    { name: 'General Decision', desc: 'Any life or logic comparison', icon: <Globe className="w-5 h-5" /> },
    { name: 'Career', desc: 'Job offers, promotions, fields', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Technology', desc: 'Frameworks, laptops, providers', icon: <Smartphone className="w-5 h-5" /> },
    { name: 'Education', desc: 'Universities, courses, bootcamps', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Finance', desc: 'Investments, credit cards, assets', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Shopping', desc: 'Phones, cars, subscription bundles', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Business', desc: 'Startup ideas, legal structures', icon: <Landmark className="w-5 h-5" /> },
    { name: 'Travel', desc: 'Destinations, flight paths, moves', icon: <Compass className="w-5 h-5" /> }
  ];

  const handleStartDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    await createDecision(selectedCategory, newQuestion.trim());
    setNewQuestion('');
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput.trim()) return;
    await refineDecision(refinementInput.trim());
    setRefinementInput('');
  };

  const handleCopy = async () => {
    if (!decision) return;
    const success = await copyReportToClipboard(decision);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (!decision) return;
    const res = shareDecision(decision);
    if (res.success) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } else if (res.url) {
      navigator.clipboard.writeText(res.url);
      setShareText('Link copied to clipboard!');
      setShared(true);
      setTimeout(() => {
        setShared(false);
        setShareText('');
      }, 2000);
    }
  };

  const handleRetry = async () => {
    if (!decision) return;
    // Resubmit with whatever answers were already saved, or go back to questioning
    await submitAnswers(decision.answers);
  };

  // 1. Landing Onboarding View (Default state)
  if (!decision) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 flex-1 flex flex-col justify-center animate-in fade-in duration-300">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Make Smarter Decisions with{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              DecisionPilot AI
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Eliminate cognitive bias. DecisionPilot is a structured decision intelligence platform that parses criteria, weights variables, maps out risks, and offers explainable recommendations.
          </p>
        </div>

        {/* Input Question Form */}
        <form onSubmit={handleStartDecision} className="max-w-2xl mx-auto w-full mb-12 space-y-4">
          <div className="relative">
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. Which laptop should I buy for programming and light gaming?"
              className="py-6 pl-5 pr-14 rounded-2xl border-border shadow-lg shadow-blue-500/[0.02] focus-visible:ring-2 focus-visible:ring-blue-500"
              maxLength={200}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newQuestion.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-9"
            >
              Analyze
            </Button>
          </div>
        </form>

        {/* Category Picker */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
            Select a Decision Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/[0.03] dark:bg-blue-500/[0.02] text-foreground'
                      : 'border-border bg-card/40 hover:bg-card/90 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {cat.icon}
                  </div>
                  <h4 className="text-xs font-bold leading-tight">{cat.name}</h4>
                  <p className="text-[10px] opacity-75 mt-0.5 leading-snug">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading / Reasoning View
  if (decision.status === 'reasoning') {
    return <ThinkingIndicator status="reasoning" />;
  }

  // 3. Questioning View
  if (decision.status === 'questioning') {
    return <QuestionPanel />;
  }

  // 4. Error View
  if (decision.status === 'error') {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Analysis Failed</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {decision.error || 'An unexpected API error occurred while processing the decision model.'}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleRetry} variant="default" className="flex items-center gap-1.5 rounded-lg">
            <RefreshCcw className="w-4 h-4" />
            <span>Retry Generation</span>
          </Button>
        </div>
      </div>
    );
  }

  // 5. Results Dashboard (Completed View)
  const result = decision.result;
  if (!result) return null;

  return (
    <div className="flex-1 overflow-y-auto print:overflow-visible">
      {/* Print Layout Header (Hidden on screen) */}
      <div className="hidden print:block p-8 border-b border-border mb-8">
        <h1 className="text-2xl font-bold">DecisionPilot AI - Structured Report</h1>
        <p className="text-xs text-muted-foreground">Generated on {new Date(decision.updatedAt).toLocaleDateString()}</p>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6 space-y-8 print:p-0">
        {/* Main Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-border/60 pb-6 print:border-none">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-md">
                {decision.category}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Updated {new Date(decision.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
              {decision.question}
            </h2>
          </div>

          {/* Share / Export Action buttons */}
          <div className="flex items-center gap-2 print:hidden shrink-0">
            <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-lg h-9 text-xs">
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-lg h-9 text-xs">
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              {shared ? (shareText ? 'Copied Link!' : 'Shared!') : 'Share'}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPdf} className="rounded-lg h-9 text-xs">
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              PDF
            </Button>
          </div>
        </div>

        {/* Top Recommendation Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-blue-500/25 dark:border-blue-500/15 bg-blue-500/[0.01] overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Primary Recommendation</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg md:text-xl font-black text-foreground">
                  {result.recommendedOption}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Score Gauge */}
          <Card className="border-border">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  AI Confidence Level
                </span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <h4 className="text-xl font-black bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent capitalize">
                    {result.confidence.score}
                  </h4>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed leading-normal">
                {result.confidence.reason}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Structured Explainability Why Bullet Points */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Why This Recommendation?</span>
          </h3>
          <ul className="space-y-3">
            {result.reasoning.map((reason, rIdx) => (
              <li key={rIdx} className="text-xs leading-relaxed text-foreground/80 flex items-start gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Comparison Matrix Section */}
        <DecisionMatrix result={result} />

        {/* Deep Analysis Tabs (Pros/Cons, Risks, Assumptions) */}
        <RiskAnalysis result={result} />

        {/* Bottom Refinement & Next Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          {/* Next Actions */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-blue-500" />
              <span>Suggested Next Actions</span>
            </h4>
            <ul className="space-y-2.5">
              {result.nextActions.map((act, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md bg-muted text-[10px] font-bold flex items-center justify-center text-foreground shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="mt-0.5 leading-snug">{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Refine Decision Panel */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <RefreshCcw className="w-4 h-4 text-purple-500" />
                <span>Refine Decision Parameters</span>
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed leading-normal">
                Want to adjust inputs? Type additional conditions (e.g. "Limit budget to $1000" or "Prioritize learning curve") and regenerate.
              </p>
            </div>

            <form onSubmit={handleRefine} className="flex gap-2 mt-4">
              <Input
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                placeholder="Adjust weights or constraints..."
                className="h-9 text-xs"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" className="h-9 px-3 rounded-lg text-xs" isLoading={isLoading}>
                Refine
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
