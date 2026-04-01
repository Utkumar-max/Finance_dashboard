import { Transaction } from './types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-03-01', amount: 2500, category: 'Salary', type: 'income', description: 'Monthly Salary' },
  { id: '2', date: '2024-03-02', amount: 80, category: 'Food', type: 'expense', description: 'Dinner at Italian' },
  { id: '3', date: '2024-03-05', amount: 120, category: 'Utilities', type: 'expense', description: 'Electricity Bill' },
  { id: '4', date: '2024-03-07', amount: 45, category: 'Transport', type: 'expense', description: 'Uber ride' },
  { id: '5', date: '2024-03-10', amount: 300, category: 'Shopping', type: 'expense', description: 'New sneakers' },
  { id: '6', date: '2024-03-12', amount: 150, category: 'Entertainment', type: 'expense', description: 'Movie night' },
  { id: '7', date: '2024-03-15', amount: 500, category: 'Freelance', type: 'income', description: 'Web project' },
  { id: '8', date: '2024-03-18', amount: 60, category: 'Food', type: 'expense', description: 'Lunch with friends' },
  { id: '9', date: '2024-03-20', amount: 200, category: 'Health', type: 'expense', description: 'Gym membership' },
  { id: '10', date: '2024-03-22', amount: 100, category: 'Transport', type: 'expense', description: 'Gas station' },
  { id: '11', date: '2024-03-25', amount: 1200, category: 'Rent', type: 'expense', description: 'Monthly Rent' },
  { id: '12', date: '2024-03-28', amount: 50, category: 'Food', type: 'expense', description: 'Grocery shopping' },
];

export const CATEGORIES = [
  'Salary',
  'Food',
  'Utilities',
  'Transport',
  'Shopping',
  'Entertainment',
  'Freelance',
  'Health',
  'Rent',
  'Other'
];
