export interface ArchivedJobCustomer {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  alternateContactNumber?: string | null;
  address?: string | null;
}

export interface ArchivedJobDevice {
  deviceType: string;
  makeModel: string;
  serialNumber?: string | null;
  reportedFault: string;
  physicalCondition?: string | null;
  accessories?: string[];
}

export interface ArchivedJobHandover {
  collectedAt: string;
  collectedBy: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
  } | null;
  customerIdentityConfirmed: boolean;
  deviceHandedOver: boolean;
  outcome?: "repaired" | "unrepaired" | string | null;
  notes?: string | null;
}

export interface ArchivedJobSummary {
  id: string;
  reference: string;
  customer: ArchivedJobCustomer;
  device: ArchivedJobDevice;
  status: "Collected";
  outcome: "repaired" | "unrepaired";
  outcomeDisplay: string;
  handover: ArchivedJobHandover;
  assignedTechnician: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
  } | null;
  repairSummary?: string | null;
  returnReason?: string | null;
  receivedAt: string;
  closedAt: string;
  updatedAt: string;
}

export interface ArchivedJobSearchResponse {
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  jobs: ArchivedJobSummary[];
}

export interface EventLedgerItem {
  id: string;
  timestamp: string;
  eventType: string;
  category: "intake" | "assignment" | "diagnosis" | "estimate" | "workshop" | "qc" | "handover";
  title: string;
  description: string;
  actor?: {
    id?: string;
    fullName: string;
    role?: string;
  } | null;
  badge?: {
    label: string;
    color: string;
  };
  isInternalOnly?: boolean;
}

export interface EstimateLineItem {
  id: string;
  lineNumber: number;
  itemType: "part" | "labour" | string;
  partDescription: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
}

export interface EstimateDossierItem {
  id: string;
  versionNumber: number;
  status: string;
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  reasonForRevision?: string | null;
  issuedAt: string;
  issuedBy?: {
    id: string;
    fullName: string;
    role?: string;
  } | null;
  decision?: {
    action: "APPROVED" | "REJECTED" | string;
    decidedAt?: string | null;
    decidedByCustomer?: boolean;
    notes?: string | null;
    rejectionReason?: string | null;
  } | null;
  items: EstimateLineItem[];
}

export interface ArchivedJobDossier {
  isReadOnly: true;
  outcome: "repaired" | "unrepaired";
  outcomeDisplay: string;
  summary: {
    totalEstimates: number;
    totalWorkshopNotes: number;
    totalAuditEvents: number;
    durationDays: number;
    isRepaired: boolean;
  };
  job: {
    id: string;
    reference: string;
    status: "Collected";
    deviceType: string;
    makeModel: string;
    serialNumber: string | null;
    reportedFault: string;
    physicalCondition: string | null;
    accessories: string[];
    receivedAt: string;
    createdAt: string;
    updatedAt: string;
    revision: number;
    customerSnapshot: ArchivedJobCustomer;
    customer: string;
    createdBy?: {
      id: string;
      fullName: string;
      role?: string;
    } | null;
  };
  handover: ArchivedJobHandover;
  assignment: {
    currentTechnician: {
      id: string;
      fullName: string;
      email: string;
      role?: string;
    } | null;
    assignedBy: {
      id: string;
      fullName: string;
      role?: string;
    } | null;
    assignedAt: string | null;
    auditHistory: Array<{
      id: string;
      previousTechnician?: { fullName: string } | null;
      assignedTechnician?: { fullName: string } | null;
      assignedBy?: { fullName: string } | null;
      assignedAt: string;
    }>;
  };
  diagnosis: {
    isRecorded: boolean;
    startedAt: string | null;
    startedBy?: { fullName: string } | null;
    completedAt: string | null;
    completedBy?: { fullName: string } | null;
    findings: string | null;
    recommendedWork: string | null;
    publicSummary: string | null;
    internalNotes: string | null; // Staff audit access
    isUnrepairable: boolean;
    unrepairableReason: string | null;
  } | null;
  estimates: EstimateDossierItem[];
  qcCompletion: {
    completedAt: string | null;
    completedBy?: { fullName: string } | null;
    faultResolved: boolean;
    functionalTestPassed: boolean;
    functionalTestNotes?: string | null;
    customerSummary?: string | null;
    internalNotes?: string | null;
  } | null;
  returnDetails: {
    returnedAt: string | null;
    returnedBy?: { fullName: string } | null;
    reason?: string | null;
    notes?: string | null;
  } | null;
  partsHold: {
    active: boolean;
    requiredPart?: string | null;
    reason?: string | null;
    internalNote?: string | null;
    placedAt?: string | null;
    releasedAt?: string | null;
    resolutionNote?: string | null;
  } | null;
  workshopLogs: Array<{
    id: string;
    entryId: string;
    message: string;
    isPublic: boolean;
    recordedBy?: { fullName: string } | null;
    createdAt: string;
  }>;
  eventLedger: EventLedgerItem[];
}

export interface ArchiveFilterParams {
  query?: string;
  startDate?: string;
  endDate?: string;
  outcome?: "all" | "repaired" | "unrepaired" | "";
  page?: number;
  limit?: number;
}
