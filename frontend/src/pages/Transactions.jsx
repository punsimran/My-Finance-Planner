import React, { useState, useRef } from 'react';
import { 
  Search, ArrowUpRight, ArrowDownRight, Download, Upload, FileText,
  ShoppingBag, Car, Utensils, Zap, Home, Heart, DollarSign, Clapperboard, PiggyBank 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Income', 'Rent', 'Savings'];

const Transactions = () => {
  const { isDarkMode } = useTheme();
  const { transactions, importTransactions } = useTransactions();
  
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null); // Ref for hidden file input

  const theme = {
    card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    input: isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-50 border-slate-200 text-slate-900",
  };

  const getIcon = (cat) => {
    switch(cat) {
      case 'Food': return <Utensils size={18} />;
      case 'Transport': return <Car size={18} />;
      case 'Bills': case 'Utilities': return <Zap size={18} />;
      case 'Health': return <Heart size={18} />;
      case 'Income': case 'Salary': return <DollarSign size={18} />;
      case 'Rent': return <Home size={18} />;
      case 'Entertainment': return <Clapperboard size={18} />;
      case 'Savings': return <PiggyBank size={18} />;
      default: return <ShoppingBag size={18} />;
    }
  };

  // --- CSV Export Logic ---
  const handleExport = () => {
    if (transactions.length === 0) return toast.error("No data to export");
    
    // Ensure header matches expected import format
    const headers = ["description,amount,category,date,type"];
    const rows = transactions.map(t => 
      `"${t.description.replace(/"/g, '""')}",${t.amount},${t.category},${t.date},${t.type}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fintrack_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported!");
  };
  
  // --- CSV Import Logic ---
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading("Importing transactions...");
    
    try {
      const result = await importTransactions(file);
      toast.success(`Successfully imported ${result.count} transactions!`, { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to import CSV. Check file format (description,amount,category,date,type).", { id: loadingToast });
    }
    
    e.target.value = null; // Clear file input
  };


  // Filter Logic
  const filteredData = transactions.filter(item => {
    const matchesCategory = activeTab === 'All' || item.category === activeTab;
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-end gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme.textMain}`}>Transactions</h1>
          <p className={`text-sm ${theme.textMuted}`}>View and manage your financial activity.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            {/* Search */}
            <div className={`flex items-center px-4 py-2.5 rounded-xl border ${theme.input} flex-1`}>
                <Search size={18} className="text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Search descriptions..." 
                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Import/Export Buttons */}
            <div className="flex gap-2">
                <button 
                    onClick={handleExport}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${isDarkMode ? 'border-slate-600 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                >
                    <Download size={16} /> <span className="hidden sm:inline">Export</span>
                </button>
                
                <button 
                    onClick={handleImportClick}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
                >
                    <Upload size={16} /> <span className="hidden sm:inline">Import CSV</span>
                </button>
                {/* Hidden Input for Import */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".csv" 
                    className="hidden" 
                />
            </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === cat 
                ? 'bg-indigo-600 text-white shadow-md' 
                : `${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-200'}`
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className={`rounded-2xl border overflow-hidden ${theme.card}`}>
        <table className="w-full text-left">
          <thead className={`text-xs uppercase border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
            <tr>
              <th className="px-6 py-4 font-semibold">Transaction</th>
              <th className="px-6 py-4 font-semibold hidden sm:table-cell">Category</th>
              <th className="px-6 py-4 font-semibold hidden sm:table-cell">Date</th>
              <th className="px-6 py-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredData.map((t) => (
              <tr key={t.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400'
                    }`}>
                      {t.type === 'income' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <span className={`font-bold ${theme.textMain}`}>{t.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                     <span className="text-slate-400">{getIcon(t.category)}</span>
                     <span className={`text-sm ${theme.textMuted}`}>{t.category}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm hidden sm:table-cell ${theme.textMuted}`}>{t.date}</td>
                <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-500' : theme.textMain}`}>
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <FileText size={48} className="opacity-20" />
            <p>No transactions found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;