import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, MoreHorizontal, 
  ShoppingBag, Plus, X, Check, Utensils, Car, Clapperboard, 
  Zap, HeartPulse, Home, PiggyBank, DollarSign, Target 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import toast from 'react-hot-toast';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // --- REAL DATA FROM CONTEXT ---
  // Get limits and goals now
  const { transactions, addTransaction, goals, limits, fetchGoals } = useTransactions(); 
  
  const [chartFilter, setChartFilter] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTx, setNewTx] = useState({
    type: 'expense',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    goal: ''
  });

  // --- CALCULATE REAL STATS ---
  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0), 
  [transactions]);

  const totalExpense = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0), 
  [transactions]);

  const balance = totalIncome - totalExpense;

  // --- CHART LOGIC ---
  const getChartData = (filter) => {
    if (!transactions.length) return [];
    const dataMap = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let periods = [];
    if (filter === 'weekly') periods = days;
    else if (filter === 'monthly') periods = months;
    else periods = [new Date().getFullYear().toString()];

    periods.forEach(p => dataMap[p] = 0);

    transactions.forEach(t => {
      const date = new Date(t.date);
      const amount = Number(t.amount);
      let key;

      if (filter === 'weekly') key = date.toLocaleString('en-US', { weekday: 'short' });
      else if (filter === 'monthly') key = date.toLocaleString('en-US', { month: 'short' });
      else key = date.getFullYear().toString();

      if (dataMap[key] !== undefined) {
        if (t.type === 'income') dataMap[key] += amount;
        else dataMap[key] -= amount; 
      }
    });

    let result = Object.keys(dataMap).map(key => ({ name: key, value: dataMap[key] }));

    if (filter === 'weekly') result.sort((a, b) => days.indexOf(a.name) - days.indexOf(b.name));
    if (filter === 'monthly') result.sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));

    return result;
  };
  const barData = useMemo(() => getChartData(chartFilter), [transactions, chartFilter]);
  
  // Calculate Pie Chart Data from Real Expenses
  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    
    const data = Object.keys(categoryTotals).map((cat, index) => ({
      name: cat,
      value: categoryTotals[cat],
      color: colors[index % colors.length]
    }));

    if (data.length === 0) return [{ name: 'No Data', value: 100, color: '#e2e8f0' }];
    return data;
  }, [transactions]);

  // --- 5. BUDGET VISUAL CALCULATION (NEW/UPDATED) ---
  const budgetVisualData = useMemo(() => {
    // Get current YYYY-MM
    const currentMonth = new Date().toISOString().substring(0, 7); 
    
    // Filter limits for the current month and calculate spending
    return limits
      .filter(l => l.period_start.startsWith(currentMonth))
      .map(limit => {
        const spent = transactions
          .filter(t => t.category === limit.category && t.type === 'expense' && t.date.startsWith(currentMonth))
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const percentage = Number(limit.limit_amount) > 0 ? (spent / Number(limit.limit_amount)) * 100 : 0;
        
        return {
          category: limit.category,
          percentage: Math.min(percentage, 100),
          isOver: percentage > 100,
          id: limit.id,
        };
      }).slice(0, 2); // Show only the top 2 budgets
  }, [transactions, limits]);


  // --- CATEGORIES LIST ---
  const CATEGORY_LIST = [
    { id: 'Food', icon: Utensils },
    { id: 'Salary', icon: DollarSign },
    { id: 'Entertainment', icon: Clapperboard },
    { id: 'Utilities', icon: Zap },
    { id: 'Transport', icon: Car },
    { id: 'Shopping', icon: ShoppingBag },
    { id: 'Health', icon: HeartPulse },
    { id: 'Rent', icon: Home },
    { id: 'Savings', icon: PiggyBank },
  ];

  // --- HANDLERS ---
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description) return;
    
    const loadingToast = toast.loading('Saving transaction...');

    const payload = {
        ...newTx,
        amount: parseFloat(newTx.amount),
        goal: newTx.goal || null, 
        category: (newTx.goal && newTx.type === 'income') ? 'Savings' : newTx.category
    };

    const result = await addTransaction(payload);

    if (result.success) {
      toast.success('Transaction added!', { id: loadingToast });
      setIsModalOpen(false);
      
      fetchGoals(); 
      
      // Reset form
      setNewTx({
        type: 'expense',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Food',
        goal: ''
      });
    } else {
      toast.error('Failed to save.', { id: loadingToast });
    }
  };

  const theme = {
    card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    input: isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-50 border-slate-200 text-slate-900",
    buttonActive: "bg-indigo-600 text-white shadow-md",
    buttonInactive: isDarkMode ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100",
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* --- TOP STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance */}
        <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
           <div className="flex justify-between items-start">
              <div>
                 <p className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Total Balance</p>
                 <h3 className={`text-3xl font-extrabold mt-2 ${theme.textMain}`}>${balance.toLocaleString()}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                 <Wallet size={20} />
              </div>
           </div>
           <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-1"><ArrowUpRight size={12}/> +2.5%</span>
              <span className="text-xs text-slate-400">vs last month</span>
           </div>
        </div>

        {/* Income */}
        <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
           <div className="flex justify-between items-start">
              <div>
                 <p className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Total Income</p>
                 <h3 className={`text-3xl font-extrabold mt-2 ${theme.textMain}`}>${totalIncome.toLocaleString()}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                 <ArrowDownRight size={20} />
              </div>
           </div>
           <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-1"><ArrowUpRight size={12}/> +12%</span>
              <span className="text-xs text-slate-400">vs last month</span>
           </div>
        </div>

        {/* Expenses */}
        <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
           <div className="flex justify-between items-start">
              <div>
                 <p className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Expenses</p>
                 <h3 className={`text-3xl font-extrabold mt-2 ${theme.textMain}`}>${totalExpense.toLocaleString()}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                 <ArrowUpRight size={20} />
              </div>
           </div>
           <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1"><ArrowUpRight size={12}/> +4%</span>
              <span className="text-xs text-slate-400">vs last month</span>
           </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Charts & List (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
           
           {/* Bar Chart */}
           <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                 <h3 className={`font-bold text-lg ${theme.textMain}`}>Cash Flow</h3>
                 <div className={`flex p-1 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    {['weekly', 'monthly', 'yearly'].map((filter) => (
                       <button
                         key={filter}
                         onClick={() => setChartFilter(filter)}
                         className={`px-4 py-1.5 text-xs font-bold capitalize rounded-md transition-all ${chartFilter === filter ? theme.buttonActive : theme.buttonInactive}`}
                       >
                         {filter}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="h-[300px] w-full" style={{ outline: 'none' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={chartFilter === 'weekly' ? 40 : 20} key={chartFilter}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}} 
                      contentStyle={{borderRadius:'8px', border:'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} 
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((e, i) => (
                        <Cell key={i} fill={e.value < 0 ? '#ef4444' : '#7c3aed'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Recent Transactions List */}
           <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
              <div className="flex justify-between items-center mb-4">
                 <h3 className={`font-bold text-lg ${theme.textMain}`}>Recent Transactions</h3>
                 <button 
                    onClick={() => navigate('/dashboard/transactions')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                 >
                    View All
                 </button>
              </div>
              <div className="space-y-3">
                 {transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                             <ShoppingBag size={20} />
                          </div>
                          <div>
                             <p className={`text-sm font-bold ${theme.textMain}`}>{t.description}</p>
                             <p className="text-xs text-slate-400 mt-0.5">{t.date} • {t.category}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className={`block text-sm font-bold ${t.type === 'income' ? 'text-emerald-500' : theme.textMain}`}>
                             {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
                       </div>
                    </div>
                 ))}
                 {transactions.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">No transactions yet.</div>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Stats & Tools (1/3 width) */}
        <div className="space-y-6">
           
           {/* Pie Chart */}
           <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
              <div className="flex justify-between items-center mb-2">
                 <h3 className={`font-bold text-lg ${theme.textMain}`}>Expenses</h3>
                 <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
              </div>
              <div className="h-[200px] w-full relative">
                 <ResponsiveContainer>
                    <PieChart>
                       <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Center Text */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className={`block text-xl font-extrabold ${theme.textMain}`}>${totalExpense.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">Total</span>
                 </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-2 mt-2">
                 {pieData.slice(0, 3).map((p) => (
                    <div key={p.name} className="flex justify-between text-xs font-medium">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{background: p.color}}></div>
                          <span className={theme.textMuted}>{p.name}</span>
                       </div>
                       <span className={theme.textMain}>${p.value}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Quick Add Button */}
           <div className={`p-6 rounded-2xl border shadow-sm text-center ${theme.card}`}>
              <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                 <Plus size={24} />
              </div>
              <h3 className={`font-bold text-lg ${theme.textMain}`}>Quick Add</h3>
              <p className={`text-xs mt-1 mb-6 ${theme.textMuted}`}>Create new transaction record</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
              >
                 Add New
              </button>
           </div>

           {/* Simple Budget Visual (UPDATED SECTION) */}
           <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
              <div className="flex justify-between items-center mb-4">
                 <h3 className={`font-bold text-lg ${theme.textMain}`}>Monthly Budget</h3>
              </div>
              <div className="space-y-4">
                 {/* Check if limits exist */}
                 {budgetVisualData.length > 0 ? (
                    budgetVisualData.map((budget) => (
                        <div key={budget.id}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{budget.category}</span>
                                <span className="font-bold text-indigo-600">{budget.percentage.toFixed(0)}%</span>
                            </div>
                            {/* Progress Bar matching image */}
                            <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                               <div 
                                  className={`h-1.5 rounded-full`} 
                                  style={{ width: `${budget.percentage}%`, background: budget.isOver ? '#ef4444' : '#6366f1' }}
                               ></div>
                            </div>
                        </div>
                    ))
                 ) : (
                    <div className="text-center py-2 text-slate-400 text-sm">
                        No active limits. Set limits on the Budget page.
                    </div>
                 )}
              </div>
           </div>

        </div>
      </div>

      {/* --- ADD TRANSACTION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${theme.card} relative`}>
            
            <div className="px-6 py-5 border-b dark:border-slate-700 flex items-center justify-between">
              <h2 className={`text-lg font-bold ${theme.textMain}`}>Add Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-6">
              {/* Type Switcher */}
              <div className={`p-1 rounded-xl flex ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'expense', goal: ''})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTx.type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-500'}`}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'income', goal: ''})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTx.type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500'}`}
                >
                  Income
                </button>
              </div>

              {/* Goal Contribution/Withdrawal Section (NEW) */}
              {newTx.type !== 'expense' && goals.length > 0 && (
                <div className="space-y-2 p-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700">
                    <label className={`text-sm font-bold text-indigo-500 flex items-center gap-2`}>
                        <Target size={16}/> Link to Savings Goal
                    </label>
                    <select 
                        value={newTx.goal}
                        onChange={(e) => {
                            setNewTx({...newTx, goal: e.target.value});
                        }}
                        className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${theme.input} appearance-none`}
                    >
                        <option value="">-- No Goal (General Income) --</option>
                        {goals.map(g => (
                            <option key={g.id} value={g.id}>{g.name} (${g.saved_amount} / ${g.target_amount})</option>
                        ))}
                    </select>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className={`text-sm font-semibold ${theme.textMain}`}>Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Weekly Groceries" 
                  value={newTx.description}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`}
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${theme.textMain}`}>Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00" 
                    value={newTx.amount}
                    onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${theme.textMain}`}>Date</label>
                  <input 
                    type="date" 
                    required
                    value={newTx.date}
                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`}
                  />
                </div>
              </div>

              {/* Category Grid (Disabled if goal is selected) */}
              <div className="space-y-2">
                <label className={`text-sm font-semibold ${theme.textMain}`}>Category</label>
                <div className="grid grid-cols-4 gap-3">
                  {CATEGORY_LIST.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      // Disable category selection if a goal is selected for income
                      disabled={!!newTx.goal && newTx.type === 'income'} 
                      onClick={() => setNewTx({...newTx, category: cat.id})}
                      className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                        newTx.category === cat.id 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : `${theme.input} hover:border-indigo-300`
                      }`}
                    >
                      <cat.icon size={18} />
                      <span className="text-[10px] font-bold uppercase">{cat.id}</span>
                    </button>
                  ))}
                </div>
                 {(newTx.goal && newTx.type === 'income') && 
                    <p className="text-xs text-indigo-500 mt-1">Category set to 'Savings' for goal contribution.</p>
                 }
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Save Transaction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardHome;