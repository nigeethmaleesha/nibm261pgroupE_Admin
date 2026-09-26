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
  createdAt: string;
  updatedAt: string;
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
