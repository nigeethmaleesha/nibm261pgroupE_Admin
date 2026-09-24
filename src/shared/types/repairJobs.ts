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
  status: string;
  createdBy?: string;
  assignedTechnician?: RepairJobTechnician | null;
  assignedAt?: string | null;
  assignment?: RepairJobAssignment;
  currentEstimate?: RepairEstimateSummary | null;
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
