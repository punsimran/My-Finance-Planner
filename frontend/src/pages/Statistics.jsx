import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext'; // Import Context

const Statistics = () => {
  const { isDarkMode } = useTheme();
  const { transactions } = useTransactions(); // Get Real Data
  const [filter, setFilter] = useState('monthly'); // daily, monthly, yearly

  // --- DATA PROCESSING LOGIC ---
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const dataMap = {};
    const today = new Date();
    
    // Determine the base period and filtering function
    let periods = [];
    if (filter === 'daily') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        periods = days;
    } else if (filter === 'monthly') {
        periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else { // Yearly
        const currentYear = today.getFullYear();
        for (let y = currentYear - 4; y <= currentYear; y++) periods.push(y.toString());
    }

    periods.forEach(p => dataMap[p] = { name: p, income: 0, expense: 0, net: 0 });

    // Aggregate Transactions
    transactions.forEach(t => {
      const date = new Date(t.date);
      const amount = Number(t.amount);
      let key;

      if (filter === 'daily') {
        key = date.toLocaleString('en-US', { weekday: 'short' });
      } else if (filter === 'monthly') {
        key = date.toLocaleString('en-US', { month: 'short' });
      } else {
        key = date.getFullYear().toString();
      }

      if (dataMap[key]) {
        if (t.type === 'income') {
          dataMap[key].income += amount;
          dataMap[key].net += amount;
        } else {
          dataMap[key].expense += amount;
          dataMap[key].net -= amount;
        }
      }
    });

    // Ensure array order is correct for monthly/daily
    let result = Object.values(dataMap);
    
    if (filter === 'monthly') {
        const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        result = result.sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));
    }
    
    return result;
  }, [transactions, filter]);

  // Calculate Totals for Header
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpense;


  const theme = {
    card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    buttonActive: "bg-indigo-600 text-white shadow-md",
    buttonInactive: isDarkMode ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100",
  };
  
  const handleExport = () => {
     // Placeholder for future CSV/PDF export logic 
     toast.success("Preparing export file...");
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme.textMain}`}>Statistics</h1>
          <p className={`text-sm ${theme.textMuted}`}>
            Financial analysis based on your records.
          </p>
        </div>
        
        <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
           {['daily', 'monthly', 'yearly'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 text-xs font-bold capitalize rounded-lg transition-all ${filter === f ? theme.buttonActive : theme.buttonInactive}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between ${theme.card}`}>
            <div>
               <p className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Net Flow ({filter})</p>
               <h3 className={`text-2xl font-extrabold ${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'} mt-1`}>
                  ${netFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
               <Calendar size={24} />
            </div>
         </div>
         <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between ${theme.card}`}>
            <div>
               <p className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Total Income</p>
               <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">
                  ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
               <TrendingUp size={24} />
            </div>
         </div>
         <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between ${theme.card}`}>
            <div>
               <p className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Total Expenses</p>
               <h3 className="text-2xl font-extrabold text-rose-500 mt-1">
                  ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
               <TrendingDown size={24} />
            </div>
         </div>
      </div>

      {/* Main Stats Chart */}
      <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
         <div className="flex justify-between items-center mb-8">
            <h3 className={`font-bold text-lg ${theme.textMain}`}>Cash Flow Trend</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className={theme.textMuted}>Income</span>
               </div>
               <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className={theme.textMuted}>Expenses</span>
               </div>
            </div>
         </div>
         
         {chartData.length > 0 ? (
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                     <Tooltip 
                       contentStyle={{borderRadius:'8px', border:'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} 
                     />
                     {/* Render Expenses and Income as separate areas */}
                     <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                     <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         ) : (
             <div className="h-[400px] flex items-center justify-center text-slate-400">
                 No data available for this timeframe.
             </div>
         )}
      </div>

      {/* Export Section */}
      <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between ${theme.card}`}>
         <div>
            <h3 className={`font-bold ${theme.textMain}`}>Download Report</h3>
            <p className={`text-xs ${theme.textMuted}`}>Get a detailed CSV report of your transactions.</p>
         </div>
         <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            <Download size={16} /> Export Data
         </button>
      </div>

    </div>
  );
};

export default Statistics;