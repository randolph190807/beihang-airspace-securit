export type JudgmentSegment = "alert" | "unknown" | "warning";

export interface DispositionScheme {
  id: string;
  name: string;
  recommended: boolean;
  successRate: string;
  range: string;
  risk: string;
  constraint: string;
  description: string;
}

export interface JudgmentTemplate {
  segment: JudgmentSegment;
  title: string;
  aiAnalysis: {
    fullText: string;
    streamDelayMs: number;
  };
  schemes: DispositionScheme[];
  approachWarning?: {
    label: string;
    description: string;
  };
}

export interface ThreatScoreDisplay {
  score: number;
  dimensions: Array<{ label: string; value: number }>;
}
