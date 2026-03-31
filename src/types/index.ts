export enum UserRole {
  ADMIN = 'admin',
  COMPANY_ADMIN = 'company_admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
}

export enum TransactionType {
  ACCRUAL = 'accrual',
  DEBIT = 'debit',
  BURN = 'burn',
  REFERRAL = 'referral',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  referralCode: string;
  referredBy?: string;
  user?: User;
}

export interface Wallet {
  id: string;
  customerId: string;
  companyId: string;
  balance: number;
  company?: Company;
}

export interface BonusLot {
  id: string;
  walletId: string;
  amount: number;
  remaining: number;
  expiresAt: string;
  createdAt: string;
  transactionId?: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  status: TransactionStatus;
  sellerId?: string;
  storeId?: string;
  createdAt: string;
  store?: Store;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  accrualPercent: number;
  isActive: boolean;
}

export interface Store {
  id: string;
  companyId: string;
  name: string;
  address: string;
  isActive: boolean;
  company?: Company;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  customer?: Customer;
}

export interface RegisterData {
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  password: string;
  referralCode?: string;
}
