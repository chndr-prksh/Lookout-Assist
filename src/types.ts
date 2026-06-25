export interface AnalysisResult {
  whatThisIs: string;
  whatToDoNext: string[];
  confidence: "High" | "Medium" | "Low";
  confidenceReason: string;
  safetyTriggered: boolean;
  safetyExplanation: string;
}

export type InputType =
  | "blurry"
  | "unsafe"
  | "unfamiliar"
  | "foreign_sign"
  | "error_screen"
  | "control_panel"
  | "confusing_form"
  | "unlabeled_product";

export interface TestCase {
  id: string;
  description: string;
  inputType: InputType;
  expectedBehavior: string;
  category: string;
  svgContent: string;
}

export interface TestResult {
  testId: string;
  status: "idle" | "running" | "passed" | "failed" | "error";
  actualOutput?: AnalysisResult;
  errorMessage?: string;
}
