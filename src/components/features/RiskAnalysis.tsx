'use client';

import * as React from 'react';
import { DecisionResult } from '@/types/decision';
import { Card, CardContent } from '../ui/card';
import { 
  AlertTriangle, CheckCircle2, XCircle, HelpCircle, 
  TrendingUp, Scale, ArrowRight, Lightbulb 
} from 'lucide-react';

interface RiskAnalysisProps {
  result: DecisionResult;
}

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ result }) => {
  const [activeTab, setActiveTab] = React.useState<'proscons' | 'risks' | 'assumptions'>('proscons');

  const tabs = [
    { id: 'proscons', label: 'Pros & Cons', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'risks', label: 'Risks & Long-Term Impact', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'assumptions', label: 'Assumptions & Missing Info', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ] as const;

  const optionNames = Object.keys(result.pros);

  return (
    <div className="space-y-5">
      {/* Custom Tabs */}
      <div className="flex border-b border-border/80 gap-4 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all px-1 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-blue-500 text-blue-500 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[220px]">
        {/* Tab 1: Pros & Cons */}
        {activeTab === 'proscons' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Trade-offs Section */}
            <div className="p-4 bg-muted/30 border border-border/85 rounded-xl flex gap-3 items-start">
              <Scale className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Core Trade-off Summary</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  {result.tradeOffs}
                </p>
              </div>
            </div>

            {/* Pros/Cons per Option */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {optionNames.map((optName, idx) => {
                const optPros = result.pros[optName] || [];
                const optCons = result.cons[optName] || [];

                return (
                  <Card key={idx} className="border border-border/70 overflow-hidden bg-card/50">
                    <div className="p-4 border-b border-border/60 bg-muted/20 font-bold text-xs">
                      Option: {optName}
                    </div>
                    <CardContent className="p-4 grid grid-cols-1 gap-4 divide-y md:divide-y-0 divide-border/40">
                      {/* Pros */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-green-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          Pros / Advantages
                        </h5>
                        <ul className="space-y-1.5">
                          {optPros.map((pro, pIdx) => (
                            <li key={pIdx} className="text-[11px] leading-relaxed text-muted-foreground flex items-start gap-1.5">
                              <span className="text-green-500 font-bold mt-0.5">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div className="space-y-2 pt-4 md:pt-0">
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-destructive flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-destructive" />
                          Cons / Disadvantages
                        </h5>
                        <ul className="space-y-1.5">
                          {optCons.map((con, cIdx) => (
                            <li key={cIdx} className="text-[11px] leading-relaxed text-muted-foreground flex items-start gap-1.5">
                              <span className="text-destructive font-bold mt-0.5">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Risks & Long Term Impact */}
        {activeTab === 'risks' && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* Hidden Risks */}
            <div className="bg-destructive/5 dark:bg-destructive/10 border border-destructive/10 dark:border-destructive/20 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span>Critical Blindspots & Hidden Risks</span>
              </h4>
              <ul className="space-y-2 text-xs">
                {result.hiddenRisks.map((risk, rIdx) => (
                  <li key={rIdx} className="text-[11px] leading-relaxed text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Long-Term Impact */}
            <div className="bg-card border border-border rounded-xl p-5 flex gap-4 items-start shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">Estimated Long-Term Impact (2-5 Years)</h4>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {result.longTermImpact}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Assumptions & Missing Info */}
        {activeTab === 'assumptions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in-50 duration-200">
            {/* Assumptions */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Assumptions Made by AI</span>
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                To bridge details not explicitly defined in the question, the AI assumed the following:
              </p>
              <ul className="space-y-2">
                {result.assumptions.map((ass, aIdx) => (
                  <li key={aIdx} className="text-[11px] leading-relaxed text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{ass}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Information */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span>Missing Context Details</span>
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                These elements were unavailable but would have made the analysis 100% precise:
              </p>
              <ul className="space-y-2">
                {result.missingInfo.map((info, mIdx) => (
                  <li key={mIdx} className="text-[11px] leading-relaxed text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
