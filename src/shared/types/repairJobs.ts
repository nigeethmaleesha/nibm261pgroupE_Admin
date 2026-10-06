export type RepairCustomer = {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
};

export type CustomerLookupResponse = {
  count: number;
  customers: RepairCustomer[];
};

export type RepairJobTechnician = {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string | null;
  role: "technician" | string;
  isActive: boolean;
  isEmailVerified: boolean;
};

export type RepairJobAssignment = {
  technician: RepairJobTechnician | null;
  assignedBy: {
    id: string;
    fullName: string;
    email: string;
    contactNumber?: string | null;
    role: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
  } | null;
  assignedAt: string | null;
};

export type RepairEstimateSummary = {
  id: string;
  versionNumber: number;
  currency: string;
  totalMinor: number;
  status: string;
  issuedAt: string;
  decision: {
    action: string;
    decidedBy: string | null;
    decidedAt: string | null;
  } | null;
};

export type RepairJob = {
  id: string;
  reference: string;
  customer: RepairCustomer;
  deviceType: string;
  makeModel: string;
  serialNumber: string | null;
  reportedFault: string;
  receivedAt: string;
  status: "Received" | string;
  workAuthorisation?: {
    latestVersionNumber: number | null;
    approvedVersionNumber: number | null;
    partsHoldActive: boolean;
    canContinueRepair: boolean;
    canComplete: boolean;
    repairBlockedReasons: string[];
    completionBlockedReasons: string[];
  };
  createdBy: string;
  assignedTechnician?: RepairJobTechnician | null;
  assignedAt?: string | null;
  assignment?: RepairJobAssignment;
  currentEstimate?: RepairEstimateSummary | null;
  partsHold?: {
    active: boolean;
    requiredPart?: string | null;
    reason?: string | null;
    internalNote?: string | null;
    placedAt?: string | null;
    releasedAt?: string | null;
    resolutionNote?: string | null;
  } | null;
  completionDetails?: {
    completedAt?: string | null;
    completedBy?: string | null;
    faultResolved?: boolean;
    functionalTestPassed?: boolean;
    functionalTestNotes?: string | null;
    customerSummary?: string | null;
    internalNotes?: string | null;
  } | null;
  returnDetails?: {
    returnedAt?: string | null;
    returnedBy?: string | null;
    reason?: string | null;
    notes?: string | null;
  } | null;
  collectionDetails?: {
    collectedAt?: string | null;
    collectedBy?:
      | string
      | {
          id: string;
          fullName: string;
          email: string;
          contactNumber?: string | null;
          role?: string;
        }
      | null;
    customerIdentityConfirmed?: boolean;
    deviceHandedOver?: boolean;
    outcome?: "repaired" | "unrepaired" | "Repaired" | "Unrepaired" | string | null;
    notes?: string | null;
  } | null;
  revision?: number;
  createdAt: string;
  updatedAt: string;
};

export type RepairJobSearchItem = {
  id: string;
  reference: string;
  customer: RepairCustomer;
  deviceType: string;
  makeModel: string;
  serialNumber: string | null;
  reportedFault: string;
  receivedAt: string;
  status: string;
  assignedTechnician: RepairJobTechnician | null;
  assignedAt: string | null;
  revision: number;
  updatedAt: string;
};

export type RepairJobSearchResponse = {
  count: number;
  jobs: RepairJobSearchItem[];
};

export type RepairJobDetailResponse = {
  job: RepairJob;
};

export type AssignRepairJobResponse = {
  changed: boolean;
  message: string;
  job: RepairJob;
};

export type CreateRepairJobPayload = {
  customerId: string;
  deviceType: string;
  makeModel: string;
  serialNumber?: string;
  reportedFault: string;
};

export type CreateRepairJobResponse = {
  message: string;
  idempotentReplay: boolean;
  job: RepairJob;
};

// SCRUM-120: Staff Handover Types
export type HandoverDevicePayload = {
  customerIdentityConfirmed: boolean;
  deviceHandedOver: boolean;
  notes?: string;
  expectedRevision?: number;
};

export type HandoverDeviceResponse = {
  success: boolean;
  message: string;
  job: RepairJob;
  update?: any;
  alreadyCollected?: boolean;
};
