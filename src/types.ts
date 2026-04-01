export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
}

export type Role = 'admin' | 'viewer';

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}
