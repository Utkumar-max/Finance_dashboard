import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  Moon, 
  Sun, 
  User, 
  Shield, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  History,
  X,
  Trash2,
  Edit2,
  MoreVertical,
  ChevronDown,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from './lib/utils';
import { Transaction, Role, TransactionType } from './types';
import { MOCK_TRANSACTIONS, CATEGORIES } from './constants';

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm", className)}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, type }: { 
  title: string; 
  value: number; 
  icon: any; 
  trend?: string;
  type: 'balance' | 'income' | 'expense' 
}) => {
  const colors = {
    balance: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    income: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    expense: "text-rose-600 bg-rose-50 dark:bg-rose-900/20"
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-xl", colors[type])}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.startsWith('+') ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-rose-600 bg-rose-50 dark:bg-rose-900/20"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1 tracking-tight dark:text-white">
          {formatCurrency(value)}
        </h3>
      </div>
    </Card>
  );
};

// --- Main App ---

export default function App() {
  const [role, setRole] = useState<Role>('admin');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for new transaction
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'expense',
    category: 'Food',
    amount: 0,
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Derived stats
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return {
      totalBalance: income - expenses,
      totalIncome: income,
      totalExpenses: expenses
    };
  }, [transactions]);

  // Chart data
  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    let balance = 0;
    return sorted.map(t => {
      balance += t.type === 'income' ? t.amount : -t.amount;
      return {
        date: format(parseISO(t.date), 'MMM dd'),
        balance
      };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories = Array.from(new Set(expenses.map(t => t.category)));
    return categories.map(cat => ({
      name: cat,
      value: expenses.filter(t => t.category === cat).reduce((acc, t) => acc + t.amount, 0)
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchQuery, filterType]);

  // Insights
  const insights = useMemo(() => {
    const highestCategory = categoryData[0];
    const avgExpense = stats.totalExpenses / (transactions.filter(t => t.type === 'expense').length || 1);
    return {
      highestCategory,
      avgExpense
    };
  }, [categoryData, stats, transactions]);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description) return;
    
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: newTx.date!,
      amount: Number(newTx.amount),
      category: newTx.category!,
      type: newTx.type!,
      description: newTx.description!
    };

    setTransactions([transaction, ...transactions]);
    setIsAddModalOpen(false);
    setNewTx({
      type: 'expense',
      category: 'Food',
      amount: 0,
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const deleteTransaction = (id: string) => {
    if (role !== 'admin') return;
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col p-6 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Wallet size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FinTrack</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              activeTab === 'dashboard' 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              activeTab === 'transactions' 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            )}
          >
            <History size={20} />
            Transactions
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-zinc-300 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                {role === 'admin' ? <Shield size={16} /> : <User size={16} />}
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Current Role</p>
                <p className="text-sm font-bold capitalize">{role}</p>
              </div>
            </div>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-white dark:bg-zinc-800 border-none rounded-lg text-xs font-medium py-2 px-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin (Full Access)</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 md:px-8 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            <Wallet className="text-blue-600" />
            <span className="font-bold">FinTrack</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
            <p className="text-xs text-zinc-500">Welcome back, here's your financial summary.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-blue-600 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {role === 'admin' && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Transaction</span>
              </button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard 
                    title="Total Balance" 
                    value={stats.totalBalance} 
                    icon={Wallet} 
                    trend="+12.5%"
                    type="balance" 
                  />
                  <StatCard 
                    title="Total Income" 
                    value={stats.totalIncome} 
                    icon={ArrowUpRight} 
                    trend="+8.2%"
                    type="income" 
                  />
                  <StatCard 
                    title="Total Expenses" 
                    value={stats.totalExpenses} 
                    icon={ArrowDownLeft} 
                    trend="-3.1%"
                    type="expense" 
                  />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" />
                        Balance Trend
                      </h3>
                      <div className="flex gap-2">
                        <span className="text-xs font-medium text-zinc-400">Last 30 Days</span>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#27272a" : "#f4f4f5"} />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: isDarkMode ? '#71717a' : '#a1a1aa' }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: isDarkMode ? '#71717a' : '#a1a1aa' }}
                            tickFormatter={(val) => `$${val}`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#18181b' : '#fff', 
                              border: 'none', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="balance" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorBalance)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold flex items-center gap-2">
                        <PieChartIcon size={20} className="text-emerald-600" />
                        Spending Breakdown
                      </h3>
                    </div>
                    <div className="flex-1 min-h-0 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#18181b' : '#fff', 
                              border: 'none', 
                              borderRadius: '12px'
                            }}
                          />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                {/* Insights Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                    <h4 className="text-sm font-bold text-blue-600 mb-2">Top Spending</h4>
                    <p className="text-2xl font-bold dark:text-white">
                      {insights.highestCategory?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-blue-600/70 mt-1">
                      You spent {formatCurrency(insights.highestCategory?.value || 0)} this month.
                    </p>
                  </Card>
                  <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                    <h4 className="text-sm font-bold text-emerald-600 mb-2">Average Expense</h4>
                    <p className="text-2xl font-bold dark:text-white">
                      {formatCurrency(insights.avgExpense)}
                    </p>
                    <p className="text-xs text-emerald-600/70 mt-1">
                      Per transaction average.
                    </p>
                  </Card>
                  <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30">
                    <h4 className="text-sm font-bold text-purple-600 mb-2">Savings Rate</h4>
                    <p className="text-2xl font-bold dark:text-white">
                      {stats.totalIncome > 0 ? Math.round((stats.totalBalance / stats.totalIncome) * 100) : 0}%
                    </p>
                    <p className="text-xs text-purple-600/70 mt-1">
                      Of your income was saved.
                    </p>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="transactions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
                      <button 
                        onClick={() => setFilterType('all')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          filterType === 'all' ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600" : "text-zinc-500"
                        )}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setFilterType('income')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          filterType === 'income' ? "bg-zinc-100 dark:bg-zinc-800 text-emerald-600" : "text-zinc-500"
                        )}
                      >
                        Income
                      </button>
                      <button 
                        onClick={() => setFilterType('expense')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          filterType === 'expense' ? "bg-zinc-100 dark:bg-zinc-800 text-rose-600" : "text-zinc-500"
                        )}
                      >
                        Expenses
                      </button>
                    </div>
                    <button className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-blue-600 transition-colors">
                      <Download size={20} />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <Card className="p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((t) => (
                            <motion.tr 
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              key={t.id} 
                              className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {format(parseISO(t.date), 'MMM dd, yyyy')}
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold dark:text-white">{t.description}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                  {t.category}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "text-sm font-bold",
                                  t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                                )}>
                                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {role === 'admin' ? (
                                    <>
                                      <button className="p-2 text-zinc-400 hover:text-blue-600 transition-colors">
                                        <Edit2 size={16} />
                                      </button>
                                      <button 
                                        onClick={() => deleteTransaction(t.id)}
                                        className="p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-xs text-zinc-400 italic">View Only</span>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-20 text-center">
                              <div className="flex flex-col items-center gap-3 text-zinc-400">
                                <Search size={48} strokeWidth={1} />
                                <p className="text-lg font-medium">No transactions found</p>
                                <p className="text-sm">Try adjusting your search or filters.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">Add Transaction</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Type</label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => setNewTx({...newTx, type: 'income'})}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                          newTx.type === 'income' ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm" : "text-zinc-500"
                        )}
                      >
                        Income
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewTx({...newTx, type: 'expense'})}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                          newTx.type === 'expense' ? "bg-white dark:bg-zinc-800 text-rose-600 shadow-sm" : "text-zinc-500"
                        )}
                      >
                        Expense
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                      <input 
                        type="number" 
                        required
                        value={newTx.amount || ''}
                        onChange={(e) => setNewTx({...newTx, amount: Number(e.target.value)})}
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                  <input 
                    type="text" 
                    required
                    value={newTx.description}
                    onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="What was this for?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Category</label>
                    <select 
                      value={newTx.category}
                      onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Date</label>
                    <input 
                      type="date" 
                      required
                      value={newTx.date}
                      onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 mt-4"
                >
                  Confirm Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
