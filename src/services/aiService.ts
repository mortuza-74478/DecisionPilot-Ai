import { FollowUpQuestion, DecisionResult, Decision } from '@/types/decision';
import { SYSTEM_PROMPTS } from '@/config/prompts';
import { SavedApiKeys } from './dbService';

// Fallback simulations when API keys are not configured.
// This provides an excellent demo experience for hackathons and local review out-of-the-box.
const SIMULATED_DATA = {
  questions: {
    laptop: [
      { id: 'budget', question: 'What is your maximum budget (in USD)?', type: 'number', placeholder: 'e.g. 1500', description: 'Filters options that fit your price range.', required: true },
      { id: 'os', question: 'Preferred Operating System?', type: 'select', options: ['macOS', 'Windows', 'Linux', 'No Preference'], description: 'Filters ecosystem preferences.', required: true },
      { id: 'purpose', question: 'What is the primary purpose?', type: 'select', options: ['Software Development', 'Gaming', 'Video Editing/3D', 'General Office Work / Study'], description: 'Dictates GPU and CPU power needs.', required: true },
      { id: 'portability', question: 'Do you prioritize battery life and light weight over performance?', type: 'boolean', description: 'Determines whether a thin-and-light or workstation is better.', required: false }
    ] as FollowUpQuestion[],
    career: [
      { id: 'salaryDifference', question: 'What is the percentage difference in salary/compensation?', type: 'select', options: ['Offer A is much higher (>30%)', 'Offer A is slightly higher (10-30%)', 'Similar Compensation', 'Offer B is higher'], description: 'Establishes financial weighting.', required: true },
      { id: 'growthPot', question: 'Which option offers stronger long-term professional growth?', type: 'select', options: ['Option A (Established company)', 'Option B (Fast-growing startup)', 'Equal opportunities', 'Not sure yet'], description: 'Used to weigh immediate salary vs long-term equity/skills.', required: true },
      { id: 'wlb', question: 'Is Work-Life Balance a critical factor for you right now?', type: 'boolean', description: 'Flags whether to penalize high-intensity environments.', required: false },
      { id: 'commute', question: 'What is the difference in daily commute/remote flexibility?', type: 'text', placeholder: 'e.g. A is fully remote, B is 3 days in office with a 45 min commute', description: 'Assesses time and energy costs.', required: false }
    ] as FollowUpQuestion[],
    general: [
      { id: 'mainConstraint', question: 'What is your primary constraint in this decision?', type: 'select', options: ['Cost / Budget', 'Time / Schedule', 'Risk / Safety', 'Learning Curve / Difficulty'], description: 'Weights criteria in the decision matrix.', required: true },
      { id: 'option1', question: 'Name Option A (your first choice):', type: 'text', placeholder: 'e.g. Buy a house', description: 'The first alternative to evaluate.', required: true },
      { id: 'option2', question: 'Name Option B (your second choice):', type: 'text', placeholder: 'e.g. Continue renting', description: 'The second alternative to evaluate.', required: true },
      { id: 'timeHorizon', question: 'What is the timeframe for this decision\'s impact?', type: 'select', options: ['Short term (< 1 year)', 'Medium term (1-3 years)', 'Long term (3+ years)'], description: 'Influences long-term impact score weights.', required: false }
    ] as FollowUpQuestion[]
  },
  
  getRecommendation: (category: string, question: string, answers: Record<string, string>): DecisionResult => {
    const cleanCategory = category.toLowerCase();
    
    if (cleanCategory.includes('laptop') || cleanCategory.includes('tech') || cleanCategory.includes('shop')) {
      const budget = Number(answers.budget) || 1200;
      const os = answers.os || 'macOS';
      const purpose = answers.purpose || 'Software Development';
      const portability = answers.portability === 'true';

      const isMac = os === 'macOS' || os === 'No Preference';
      const rec = isMac ? 'MacBook Pro 14" (M3)' : 'Dell XPS 15';
      const alt = isMac ? 'Lenovo ThinkPad X1 Carbon' : 'Asus ROG Zephyrus G14';

      return {
        summary: `For your goal of buying a laptop suited for ${purpose} under a budget of $${budget}, the ${rec} offers the most balanced profile in terms of battery efficiency, performance, and durability.`,
        recommendedOption: rec,
        confidence: {
          score: 'High',
          reason: `You provided clear constraints on OS preference (${os}) and primary use case (${purpose}). Confidence is high, though exact screen-size preference was assumed.`
        },
        reasoning: [
          `Superior energy efficiency: delivers 15-18 hours of real-world battery life, ideal for ${purpose}.`,
          `Exceptional performance: multi-threaded compilation speeds are top-in-class within the $${budget} budget bracket.`,
          `Excellent build quality and resale value: holds value 40% better than standard commercial alternatives over 3 years.`
        ],
        pros: {
          [rec]: ['Leading battery longevity', 'Virtually silent under coding workloads', 'Gorgeous, highly color-accurate Liquid Retina display'],
          [alt]: ['Highly upgradable RAM/SSD storage', 'Excellent native gaming capabilities', 'Rich ports selection (no dongles needed)']
        },
        cons: {
          [rec]: ['Storage and RAM cannot be upgraded after purchase', 'Expensive accessories and out-of-warranty repairs', 'Limited external display support on base models'],
          [alt]: ['Loud fan noise under heavy CPU/GPU loads', 'Inferior trackpad and speaker acoustics compared to rivals', 'Shorter battery life (5-7 hours typical)']
        },
        tradeOffs: 'By choosing the MacBook, you trade off hardware upgradability and gaming flexibility in exchange for superior build quality, battery life, and unix-compliant developer environments.',
        hiddenRisks: [
          'Ecosystem Lock-in: Restricts developer environments if you later require native Windows/Linux x86 setups.',
          'Memory bottleneck: If your projects scale, the non-upgradable 16GB memory could become a limitation in 2 years.'
        ],
        longTermImpact: 'A highly reliable machine that will easily last 4+ years with minimal performance degradation, reducing average yearly hardware costs to under $350.',
        assumptions: [
          'Assumed you do not require specialized high-end CUDA GPU cores for deep learning (since you preferred macOS/general build).',
          'Assumed standard 512GB storage capacity is sufficient for initial needs.'
        ],
        missingInfo: [
          'Exact software stack requirements (e.g. Docker weights, heavy virtual machine needs).',
          'Preferred laptop weight and keyboard layout specs.'
        ],
        alternativeOption: alt,
        nextActions: [
          'Visit a local showroom to test the keyboard travel profile of both options.',
          'Check student or developer corporate portals for a potential 10% discount.'
        ],
        matrix: {
          criteria: ['Cost & Value', 'Performance', 'Battery Life', 'Build Quality', 'Upgradability'],
          rows: [
            { name: rec, scores: { 'Cost & Value': 7, 'Performance': 9, 'Battery Life': 10, 'Build Quality': 9, 'Upgradability': 2 }, overallScore: 82 },
            { name: alt, scores: { 'Cost & Value': 8, 'Performance': 8, 'Battery Life': 6, 'Build Quality': 7, 'Upgradability': 9 }, overallScore: 76 }
          ]
        }
      };
    } else if (cleanCategory.includes('career') || cleanCategory.includes('job') || cleanCategory.includes('uni') || cleanCategory.includes('business')) {
      const salary = answers.salaryDifference || 'Similar Compensation';
      const growth = answers.growthPot || 'Option A';
      const wlb = answers.wlb === 'true';

      const rec = 'Option B (Fast-growing Startup)';
      const alt = 'Option A (Established Corporation)';

      return {
        summary: `For your career decision, ${rec} is recommended because of its alignment with long-term professional growth, even if it presents moderate risk compared to the established stability of ${alt}.`,
        recommendedOption: rec,
        confidence: {
          score: 'Medium',
          reason: `Career growth metrics rely heavily on personal risk appetite and equity values, which are highly variable assumptions. We assumed a standard growth mindset.`
        },
        reasoning: [
          `Compounding skills: start-ups allow multi-disciplinary exposure, doubling your learning speed compared to corporate silos.`,
          `Equity upside: option B carries stock options that could yield significant financial windfalls if the startup scales.`,
          `Impact visibility: your contributions directly dictate company success, positioning you for rapid promotion cycles.`
        ],
        pros: {
          [rec]: ['Rapid title promotions', 'Direct access to founders and strategic decisions', 'Modern tech stacks and agile processes'],
          [alt]: ['Structured mentorship programs', 'Stable working hours (usually strict 9-to-5)', 'Comprehensive premium health and pension benefits']
        },
        cons: {
          [rec]: ['Potential work-life balance strain', 'Lacks established training budgets or formal onboarding', 'Lower job security if funding rounds stall'],
          [alt]: ['Slower career progression throttled by bureaucracy', 'Limited scope of influence (cog-in-the-wheel syndrome)', 'Outdated tech/processes are slow to change']
        },
        tradeOffs: `You are trading immediate day-to-day stability, structured mentorship, and comfort (at the Corporation) for rapid skill accumulation, agency, and equity upside (at the Startup).`,
        hiddenRisks: [
          'Equity dilution: Future venture rounds could dilute your option pool value to near-zero.',
          'Founder mismatch: Early-stage environments depend heavily on the founders\' personalities; a culture mismatch is hard to escape.'
        ],
        longTermImpact: 'Joining the startup will accelerate your trajectory toward leadership roles (CTO/VP/Director) by 3-5 years, although it increases job transition frequency.',
        assumptions: [
          'Assumed you have a financial safety net of 3-6 months of expenses, enabling you to accept startup risk.',
          'Assumed the startup has at least 12 months of runway.'
        ],
        missingInfo: [
          'Specific vesting schedules for the equity offers.',
          'Financial health details of the startup (burn rate, revenue numbers).'
        ],
        alternativeOption: alt,
        nextActions: [
          'Request a 1-on-1 meeting with your potential immediate manager at the startup to gauge team culture.',
          'Check Glassdoor and LinkedIn profiles of former employees to cross-verify turnover rates.'
        ],
        matrix: {
          criteria: ['Compensation', 'Growth Potential', 'Work-Life Balance', 'Job Security', 'Culture & Autonomy'],
          rows: [
            { name: rec, scores: { 'Compensation': 6, 'Growth Potential': 10, 'Work-Life Balance': 5, 'Job Security': 4, 'Culture & Autonomy': 9 }, overallScore: 74 },
            { name: alt, scores: { 'Compensation': 8, 'Growth Potential': 6, 'Work-Life Balance': 9, 'Job Security': 9, 'Culture & Autonomy': 5 }, overallScore: 71 }
          ]
        }
      };
    } else {
      // General Decision Fallback
      const optA = answers.option1 || 'Proceed with Option A';
      const optB = answers.option2 || 'Proceed with Option B';
      const constraint = answers.mainConstraint || 'Cost / Budget';

      return {
        summary: `Evaluating your options under the main constraint of ${constraint}, ${optA} is recommended as it offers the optimal balance between safety, long-term reward, and compliance.`,
        recommendedOption: optA,
        confidence: {
          score: 'Medium',
          reason: 'Generated using general heuristics based on the primary constraints specified. Personal emotional weightings are not factored in.'
        },
        reasoning: [
          `Better risk mitigation: ${optA} maintains a safety net while keeping alternatives open.`,
          `Lower upfront resource drain: fits your constraint of ${constraint} better than the alternative.`,
          `Strategic flexibility: does not locking you into long-term rigid commitments.`
        ],
        pros: {
          [optA]: ['Higher predictability', 'More control over immediate milestones', 'Saves initial capital resources'],
          [optB]: ['Higher maximum potential payoff', 'Provides new experiences and networking', 'Solves the issue permanently']
        },
        cons: {
          [optA]: ['Opportunity cost of not taking the bolder route', 'Might feel slow or uninspiring', 'Requires ongoing incremental effort'],
          [optB]: ['Substantial upfront cost / investment', 'High consequence of failure', 'Steep learning curve and adjustments']
        },
        tradeOffs: `You are choosing structured predictability and resource conservation over high-risk, high-reward expansion.`,
        hiddenRisks: [
          'Stagnation: Playing it safe might lead to regret if the other path grows rapidly.',
          'Opportunity decay: The window of opportunity for Option B might close in the future.'
        ],
        longTermImpact: 'Preserves critical financial and mental bandwidth to take larger calculated risks later, though progression in the medium-term will be linear.',
        assumptions: [
          'Assumed that avoiding catastrophic downside is preferred over maximizing absolute upside.',
          'Assumed capital preservation is critical under the current economic profile.'
        ],
        missingInfo: [
          'Detailed financial models for both choices.',
          'Any legal or contract commitments related to the options.'
        ],
        alternativeOption: optB,
        nextActions: [
          'Write down a worst-case scenario contingency plan for both paths.',
          'Discuss the decision with an unbiased advisor or mentor outside your immediate circle.'
        ],
        matrix: {
          criteria: ['Cost Efficiency', 'Risk Control', 'Ease of Execution', 'Long-term Reward', 'Flexibility'],
          rows: [
            { name: optA, scores: { 'Cost Efficiency': 8, 'Risk Control': 9, 'Ease of Execution': 7, 'Long-term Reward': 6, 'Flexibility': 8 }, overallScore: 78 },
            { name: optB, scores: { 'Cost Efficiency': 5, 'Risk Control': 4, 'Ease of Execution': 5, 'Long-term Reward': 9, 'Flexibility': 4 }, overallScore: 56 }
          ]
        }
      };
    }
  }
};

export const aiService = {
  // 1. Dynamic Follow-Up Question Engine
  async generateQuestions(category: string, question: string, apiKeys: SavedApiKeys): Promise<FollowUpQuestion[]> {
    const prompt = SYSTEM_PROMPTS.generateQuestions(category, question);
    
    // Check if we can make a live API call
    if (apiKeys.gemini) {
      try {
        const res = await callGeminiAPI(apiKeys.gemini, prompt);
        return JSON.parse(res) as FollowUpQuestion[];
      } catch (e) {
        console.warn('Gemini API call failed, falling back to local simulation', e);
      }
    } else if (apiKeys.openai) {
      try {
        const res = await callOpenAIAPI(apiKeys.openai, prompt);
        return JSON.parse(res) as FollowUpQuestion[];
      } catch (e) {
        console.warn('OpenAI API call failed, falling back to local simulation', e);
      }
    }

    // High fidelity simulator fallback
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate thinking latency
    const cleanCategory = category.toLowerCase();
    
    if (cleanCategory.includes('laptop') || cleanCategory.includes('tech') || cleanCategory.includes('shop')) {
      return SIMULATED_DATA.questions.laptop;
    } else if (cleanCategory.includes('career') || cleanCategory.includes('job') || cleanCategory.includes('uni') || cleanCategory.includes('business')) {
      return SIMULATED_DATA.questions.career;
    } else {
      return SIMULATED_DATA.questions.general;
    }
  },

  // 2. Main Structured Recommendation Engine
  async generateRecommendation(
    category: string,
    question: string,
    answers: Record<string, string>,
    followUpQuestions: FollowUpQuestion[],
    apiKeys: SavedApiKeys
  ): Promise<DecisionResult> {
    const prompt = SYSTEM_PROMPTS.generateRecommendation(category, question, answers, followUpQuestions);

    if (apiKeys.gemini) {
      try {
        const res = await callGeminiAPI(apiKeys.gemini, prompt);
        return JSON.parse(res) as DecisionResult;
      } catch (e) {
        console.warn('Gemini API call failed, falling back to simulation', e);
      }
    } else if (apiKeys.openai) {
      try {
        const res = await callOpenAIAPI(apiKeys.openai, prompt);
        return JSON.parse(res) as DecisionResult;
      } catch (e) {
        console.warn('OpenAI API call failed, falling back to simulation', e);
      }
    }

    // High fidelity simulator fallback
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate thinking latency
    return SIMULATED_DATA.getRecommendation(category, question, answers);
  },

  // 3. Recommendation Refinement Engine
  async refineRecommendation(
    currentDecision: Decision,
    feedback: string,
    apiKeys: SavedApiKeys
  ): Promise<DecisionResult> {
    const prompt = SYSTEM_PROMPTS.refineRecommendation(currentDecision, feedback);

    if (apiKeys.gemini) {
      try {
        const res = await callGeminiAPI(apiKeys.gemini, prompt);
        return JSON.parse(res) as DecisionResult;
      } catch (e) {
        console.warn('Gemini refinement failed, using local adaptation', e);
      }
    } else if (apiKeys.openai) {
      try {
        const res = await callOpenAIAPI(apiKeys.openai, prompt);
        return JSON.parse(res) as DecisionResult;
      } catch (e) {
        console.warn('OpenAI refinement failed, using local adaptation', e);
      }
    }

    // Local adaptation fallback
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (!currentDecision.result) {
      throw new Error('No current recommendation to refine');
    }

    // Perform a lightweight text edit simulation based on feedback
    const base = { ...currentDecision.result };
    base.summary = `[Refined] ${base.summary} User criteria adjusted: "${feedback}".`;
    base.assumptions.unshift(`Assumed user adjustment: "${feedback}" is a hard constraint.`);
    base.nextActions.unshift(`Review implications of refinement: "${feedback}"`);
    
    // Slightly tweak scores in matrix to reflect refinement
    base.matrix = {
      ...base.matrix,
      rows: base.matrix.rows.map((row, idx) => {
        const scoreMod = idx === 0 ? 1 : -1;
        const newScores = { ...row.scores };
        // Adjust the first criteria score
        const firstKey = Object.keys(newScores)[0];
        if (firstKey) {
          newScores[firstKey] = Math.min(10, Math.max(1, newScores[firstKey] + scoreMod));
        }
        return {
          ...row,
          scores: newScores,
          overallScore: Math.min(100, Math.max(1, row.overallScore + (scoreMod * 3)))
        };
      })
    };
    
    return base;
  }
};

// Raw fetch helpers for API Keys (keeps it lightweight, no external SDK bloat)
async function callGeminiAPI(key: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  return cleanJsonString(text);
}

async function callOpenAIAPI(key: string, prompt: string): Promise<string> {
  const url = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty response from OpenAI API');
  }

  return cleanJsonString(text);
}

// Strip markdown block formatting if model returned it despite instructions
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}
