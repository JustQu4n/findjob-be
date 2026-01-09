import { BehaviorType } from 'src/database/entities/candidate-behavior-log/behavior-type.enum';

export interface BehaviorSummary {
  [BehaviorType.PASTE]: number;
  [BehaviorType.COPY]: number;
  [BehaviorType.LARGE_DELETION]: number;
  [BehaviorType.FAST_TYPING]: number;
  [BehaviorType.TAB_SWITCH]: number;
  [BehaviorType.FOCUS_LOSS]: number;
}

// Weight for each behavior type
const BEHAVIOR_WEIGHTS = {
  [BehaviorType.PASTE]: 15,           // High risk
  [BehaviorType.COPY]: 5,              // Low risk (might be legitimate)
  [BehaviorType.LARGE_DELETION]: 10,   // Medium risk (could be legitimate editing)
  [BehaviorType.FAST_TYPING]: 8,       // Medium risk
  [BehaviorType.TAB_SWITCH]: 12,       // High risk (potential cheating)
  [BehaviorType.FOCUS_LOSS]: 8,        // Medium risk
};

/**
 * Calculate risk score (0-100) based on frequency and severity of suspicious behaviors
 * @param behaviorLogs Array of behavior logs
 * @returns Risk score between 0 and 100
 */
export function calculateRiskScore(behaviorLogs: Array<{ behavior_type: BehaviorType }>): number {
  let score = 0;
  
  behaviorLogs.forEach(log => {
    score += BEHAVIOR_WEIGHTS[log.behavior_type] || 0;
  });
  
  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Get behavior summary from behavior logs
 * @param behaviorLogs Array of behavior logs
 * @returns Summary object with counts for each behavior type
 */
export function getBehaviorSummary(behaviorLogs: Array<{ behavior_type: BehaviorType }>): BehaviorSummary {
  const summary: BehaviorSummary = {
    [BehaviorType.PASTE]: 0,
    [BehaviorType.COPY]: 0,
    [BehaviorType.LARGE_DELETION]: 0,
    [BehaviorType.FAST_TYPING]: 0,
    [BehaviorType.TAB_SWITCH]: 0,
    [BehaviorType.FOCUS_LOSS]: 0,
  };

  behaviorLogs.forEach(log => {
    if (summary[log.behavior_type] !== undefined) {
      summary[log.behavior_type]++;
    }
  });

  return summary;
}

/**
 * Determine if candidate should be flagged based on behavior patterns
 * @param behaviorSummary Summary of behavior counts
 * @param riskScore Calculated risk score
 * @returns Whether candidate should be flagged
 */
export function shouldFlagCandidate(behaviorSummary: BehaviorSummary, riskScore: number): boolean {
  return (
    riskScore > 50 ||
    behaviorSummary[BehaviorType.PASTE] > 3 ||
    behaviorSummary[BehaviorType.TAB_SWITCH] > 5
  );
}
