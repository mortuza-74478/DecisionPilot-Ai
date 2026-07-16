'use client';

import * as React from 'react';
import { useDecisionStore } from '@/store/useDecisionStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { HelpCircle, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

export const QuestionPanel: React.FC = () => {
  const { decisions, activeDecisionId, submitAnswers, isLoading } = useDecisionStore();

  const decision = decisions.find((d) => d.id === activeDecisionId);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (!decision || decision.status !== 'questioning') return null;

  const handleInputChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    
    decision.followUpQuestions.forEach((q) => {
      if (q.required && (!answers[q.id] || answers[q.id].trim() === '')) {
        nextErrors[q.id] = 'This field is required to run the decision model.';
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await submitAnswers(answers);
  };

  // Calculate questionnaire completion progress percentage
  const totalQuestions = decision.followUpQuestions.length;
  const completedQuestions = decision.followUpQuestions.filter(
    (q) => answers[q.id] && answers[q.id].trim() !== ''
  ).length;
  const progressPercent = Math.round((completedQuestions / totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Title block */}
      <div className="mb-8 text-center md:text-left">
        <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-widest bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-1 rounded-full mb-3 inline-block">
          Step 2: Collect Context
        </span>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Gathering Decision Variables</h2>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          AI detected missing factors. Answer the variables below to build a structural model comparing your choices.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 bg-card border border-border/80 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            <span>Questionnaire Progress</span>
            <span>{completedQuestions} of {totalQuestions} Answered</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-extrabold text-sm md:text-lg bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
          {decision.followUpQuestions.map((q) => {
            const hasError = !!errors[q.id];

            return (
              <div key={q.id} className="space-y-2 border-b border-border/40 pb-5 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/95">
                      {q.question}
                      {q.required && <span className="text-destructive font-semibold">*</span>}
                    </label>
                    {q.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        {q.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2.5">
                  {q.type === 'text' && (
                    <Input
                      value={answers[q.id] || ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'Type your response...'}
                      className={hasError ? 'border-destructive focus-visible:ring-destructive' : 'bg-muted/10'}
                    />
                  )}

                  {q.type === 'number' && (
                    <Input
                      type="number"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'Enter a number...'}
                      className={hasError ? 'border-destructive focus-visible:ring-destructive' : 'bg-muted/10'}
                    />
                  )}

                  {q.type === 'select' && q.options && (
                    <Select
                      value={answers[q.id] || ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      options={['-- Select an option --', ...q.options]}
                      className={hasError ? 'border-destructive focus-visible:ring-destructive' : 'bg-muted/10'}
                    />
                  )}

                  {q.type === 'boolean' && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={answers[q.id] === 'true' ? 'default' : 'outline'}
                        onClick={() => handleInputChange(q.id, 'true')}
                        className="flex-1 text-xs h-9 rounded-lg"
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={answers[q.id] === 'false' ? 'default' : 'outline'}
                        onClick={() => handleInputChange(q.id, 'false')}
                        className="flex-1 text-xs h-9 rounded-lg"
                      >
                        No
                      </Button>
                    </div>
                  )}
                </div>

                {hasError && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors[q.id]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Submission */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full md:w-auto px-6 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.01] transition-all"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate Decision Matrix</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
