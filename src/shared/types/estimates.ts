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
  status?: string;
  issuedBy: string;
  issuedAt: string;
  isImmutable: boolean;
  changeReason?: string | null;
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
  revisionEligibility?: {
    eligible: boolean;
    reasons: string[];
  };
  hasRevisionDraft?: boolean;
  workAuthorisation?: {
    isAuthorised: boolean;
    status: string;
    approvedEstimateVersion: number | null;
    requiresApproval: boolean;
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

export type IssueRevisionPayload = {
  items: Array<{
    type: EstimateLineType;
    description: string;
    quantity: number;
    unitPrice: string;
  }>;
  changeReason: string;
  baseVersionNumber?: number;
};

export type IssueEstimateResponse = {
  created: boolean;
  idempotentReplay: boolean;
  message: string;
  estimate: IssuedEstimate;
  jobStatus: string;
};

export type ProgressUpdate = {
  id: string;
  fromStatus: string;
  toStatus: string;
  note: string | null;
  updatedBy?: {
    name?: string;
    role?: string;
  } | null;
  createdAt: string;
};

export type ProgressHistoryResponse = {
  job: any;
  isLocked: boolean;
  allowedStatuses: string[];
  updates: ProgressUpdate[];
};

export type EstimateHistoryVersionItem = {
  id: string;
  jobId: string;
  versionNumber: number;
  currency: "LKR";
  totalMinor: number;
  total: string;
  status: string;
  changeReason: string | null;
  basedOnEstimateId: string | null;
  supersededBy: string | null;
  supersededAt: string | null;
  issuedBy: string;
  issuedAt: string;
  isImmutable: boolean;
  isCurrent: boolean;
  decision: {
    action: "APPROVED" | "REJECTED";
    decidedBy: string;
    decidedAt: string;
  } | null;
  items: EstimateItem[];
};

export type EstimateHistoryResponse = {
  job: {
    id: string;
    reference: string;
    status: string;
    revision: number;
  };
  currentVersionNumber: number | null;
  revisionEligibility?: {
    eligible: boolean;
    reasons: string[];
  };
  workAuthorisation?: {
    latestVersionNumber: number | null;
    approvedVersionNumber: number | null;
    partsHoldActive: boolean;
    canContinueRepair: boolean;
    canComplete: boolean;
    repairBlockedReasons: string[];
    completionBlockedReasons: string[];
  };
  versions: EstimateHistoryVersionItem[];
};


