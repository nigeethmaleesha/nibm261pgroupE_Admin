export type EstimateLineType = "PART" | "LABOUR";

export type EstimateItem = {
  id: string;
  lineNumber: number;
  type: EstimateLineType;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  unitPrice: string;
  lineTotalMinor: number;
  lineTotal: string;
};

export type IssuedEstimate = {
  id: string;
  jobId: string;
  versionNumber: number;
  currency: "LKR";
  totalMinor: number;
  total: string;
  issuedBy: string;
  issuedAt: string;
  isImmutable: boolean;
  items: EstimateItem[];
};

export type EstimateJobContext = {
  id: string;
  reference: string;
  status: string;
  revision: number;
  deviceType: string;
  makeModel: string;
  serialNumber: string | null;
  reportedFault: string;
  receivedAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    contactNumber: string;
  };
};

export type DiagnosisContext = {
  id: string;
  findings: string | null;
  recommendedWork: string | null;
  publicSummary: string | null;
  isUnrepairable: boolean;
  unrepairableReason: string | null;
  completedAt: string | null;
};

export type EstimateContextResponse = {
  job: EstimateJobContext;
  diagnosis: DiagnosisContext | null;
  eligibility: {
    eligible: boolean;
    reasons: string[];
  };
  currentEstimate: IssuedEstimate | null;
};

export type IssueEstimatePayload = {
  items: Array<{
    type: EstimateLineType;
    description: string;
    quantity: number;
    unitPrice: string;
  }>;
};

export type IssueEstimateResponse = {
  created: boolean;
  idempotentReplay: boolean;
  message: string;
  estimate: IssuedEstimate;
  jobStatus: string;
};
