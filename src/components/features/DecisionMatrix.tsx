'use client';

import * as React from 'react';
import { DecisionResult } from '@/types/decision';
import { Award, Check, Sparkles } from 'lucide-react';

interface DecisionMatrixProps {
  result: DecisionResult;
}

export const DecisionMatrix: React.FC<DecisionMatrixProps> = ({ result }) => {
  const { criteria, rows } = result.matrix;
  
  // Sort rows so the recommended option or highest score is displayed prominently
  const recommendedRow = rows.find(r => r.name === result.recommendedOption);
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (score >= 5) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  const getOverallProgressColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (score >= 40) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gradient-to-r from-destructive to-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Multi-Criteria Decision Matrix</span>
        </h3>
        <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full border border-border/80 bg-muted/20">
          Scale 1-10 (Higher is Better)
        </span>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4 font-semibold">Evaluated Option</th>
                {criteria.map((crit, idx) => (
                  <th key={idx} className="p-4 font-semibold text-center whitespace-nowrap">
                    {crit}
                  </th>
                ))}
                <th className="p-4 font-bold text-right">Overall Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {rows.map((row, idx) => {
                const isRecommended = row.name === result.recommendedOption;
                
                return (
                  <tr 
                    key={idx} 
                    className={`transition-colors hover:bg-muted/10 ${
                      isRecommended ? 'bg-blue-500/[0.02] dark:bg-blue-500/[0.01]' : ''
                    }`}
                  >
                    {/* Option Name Column */}
                    <td className="p-4 font-semibold text-foreground relative">
                      {isRecommended && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r" />
                      )}
                      <div className="flex items-center gap-2">
                        <span>{row.name}</span>
                        {isRecommended && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/15 uppercase tracking-wide">
                            <Award className="w-3 h-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Criteria Value Columns */}
                    {criteria.map((crit, cIdx) => {
                      const score = row.scores[crit] ?? 5;
                      return (
                        <td key={cIdx} className="p-4 text-center">
                          <span className={`inline-block w-8 py-0.5 text-center font-bold rounded-md border text-[11px] ${getScoreColor(score)}`}>
                            {score}
                          </span>
                        </td>
                      );
                    })}

                    {/* Overall Score Column */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full rounded-full ${getOverallProgressColor(row.overallScore)}`}
                            style={{ width: `${row.overallScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-sm text-foreground">
                          {row.overallScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Visual Quick Takeaway */}
      {recommendedRow && (
        <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 rounded-xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400">Why it won: {result.recommendedOption}</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Scored <strong className="text-foreground">{recommendedRow.overallScore}%</strong> overall. 
              Excelled particularly in criteria like {
                Object.entries(recommendedRow.scores)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(entry => `"${entry[0]}" (rating ${entry[1]}/10)`)
                  .join(' and ')
              }.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
