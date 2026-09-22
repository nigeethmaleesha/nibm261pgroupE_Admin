export type InternalRole = "owner_staff" | "technician";

export type InternalUser = {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  role: InternalRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OtpStartResponse = {
  message: string;
  requiresOtp?: boolean;
  email?: string;
  otpPurpose?: string;
  otpExpiresInSeconds?: number;
  resendAvailableInSeconds?: number;
  account?: InternalUser;
  technician?: InternalUser;
};

export type VerifyLoginResponse = {
  message: string;
  user: InternalUser;
  tokenStorage?: string;
  accessTokenExpiresIn?: string;
  refreshTokenExpiresIn?: string;
};

export type VerifyAccountResponse = {
  message: string;
  user: InternalUser;
};

export type ForgotPasswordVerifyResponse = {
  message: string;
  resetToken: string;
  resetTokenExpiresIn?: string;
};

export type MessageResponse = { message: string };
export type MeResponse = { user: InternalUser };

export type TechnicianListResponse = {
  count: number;
  technicians: InternalUser[];
};

export type TechnicianCreateResponse = OtpStartResponse & {
  technician: InternalUser;
};

export type TechnicianToggleResponse = {
  message: string;
  technician: InternalUser;
};
