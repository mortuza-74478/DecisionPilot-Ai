export type ConfidenceLevel = 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';

export interface FollowUpQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'boolean' | 'number';
  options?: string[];
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export interface DecisionMatrixRow {
  name: string;
  scores: Record<string, number>; // Maps criteria to a rating 1-10
  overallScore: number; // Overall weighted average score 1-100
}

export interface DecisionResult {
  summary: string;
  recommendedOption: string;
  confidence: {
    score: ConfidenceLevel;
    reason: string;
  };
  reasoning: string[];
  pros: Record<string, string[]>; // Option name -> List of pros
  cons: Record<string, string[]>; // Option name -> List of cons
  tradeOffs: string;
  hiddenRisks: string[];
  longTermImpact: string;
  assumptions: string[];
  missingInfo: string[];
  alternativeOption: string;
  nextActions: string[];
  matrix: {
    criteria: string[];
    rows: DecisionMatrixRow[];
  };
}

export interface Decision {
  id: string;
  title: string;
  category: string;
  question: string;
  status: 'idle' | 'questioning' | 'reasoning' | 'completed' | 'error';
  followUpQuestions: FollowUpQuestion[];
  answers: Record<string, string>; // questionId -> user response
  options: string[]; // Options evaluated, e.g. ["Macbook Pro", "Dell XPS"]
  result?: DecisionResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedDecisionSummary {
  id: string;
  title: string;
  category: string;
  question: string;
  createdAt: string;
  updatedAt: string;
}
