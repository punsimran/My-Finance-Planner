import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Target, X, Check, ListMinus, TrendingUp, AlertTriangle, Trash2, Edit, Utensils, ShoppingBag, Car, Clapperboard, Zap, HeartPulse, Home, PiggyBank, Calendar, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import toast from 'react-hot-toast';
import api from '../services/api'; // Ensure API is imported for manual PUT request

// Available categories for setting limits
const AVAILABLE_LIMIT_CATEGORIES = [
    { id: 'Food', icon: Utensils },
    { id: 'Shopping', icon: ShoppingBag },
    { id: 'Transport', icon: Car },
    { id: 'Utilities', icon: Zap },
    { id: 'Health', icon: HeartPulse },
    { id: 'Rent', icon: Home },
    { id: 'Entertainment', icon: Clapperboard },
];

const initialLimitFormState = {
    id: null,
    category: AVAILABLE_LIMIT_CATEGORIES[0].id,
    amount: 300,
    period_start: new Date().toISOString().substring(0, 7) + '-01',
};

const Budget = () => {
    const { isDarkMode } = useTheme();
    const { 
        goals, 
        addGoal, 
        transactions, 
        limits, 
        saveBudgetLimits, 
        deleteGoal, 
        deleteLimit, 
        loading: loadingGoals,
        getBudgetPrediction
    } = useTransactions();
    
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    
    const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', deadline: '' });
    
    const [currentLimitData, setCurrentLimitData] = useState(initialLimitFormState);
    const [suggestedAmount, setSuggestedAmount] = useState(null); 
    const [loadingPrediction, setLoadingPrediction] = useState(false);
    
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); 


    const theme = {
        card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
        textMain: isDarkMode ? "text-white" : "text-slate-900",
        textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
        input: isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900",
    };

    // --- SPENDING LIMITS CALCULATION (CORE LOGIC) ---
    const calculatedLimits = useMemo(() => {
        return limits.map(limit => {
            const limitMonthYear = limit.period_start.substring(0, 7);
            
            const spent = transactions
                .filter(t => 
                    t.category === limit.category && 
                    t.type === 'expense' && 
                    t.date.startsWith(limitMonthYear)
                )
                .reduce((sum, t) => sum + Number(t.amount), 0);
            
            const limitAmount = Number(limit.limit_amount);
            const percentage = limitAmount > 0 ? (spent / limitAmount) * 100 : 0;
            const isOver = percentage > 100;
            
            return {
                ...limit,
                spent: spent,
                limit: limitAmount,
                percentage: Math.min(percentage, 100),
                isOver: isOver,
                isWarning: percentage > 80 && percentage <= 100,
            };
        });
    }, [transactions, limits]);


    // --- ML PREDICTION CONTEXTUAL DATA ---
    const spendingContext = useMemo(() => {
        if (!currentLimitData) return { lastMonth: 0, average: 0 };
        
        const category = currentLimitData.category;
        const periodStart = currentLimitData.period_start;

        const currentMonth = periodStart.substring(0, 7);
        const [year, month] = currentMonth.split('-').map(Number);
        const lastMonth = new Date(year, month - 2, 1).toISOString().substring(0, 7);

        const history = transactions.filter(t => t.category === category && t.type === 'expense');
        
        const spentLast = history
            .filter(t => t.date.startsWith(lastMonth))
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const uniqueMonths = new Set(history.map(t => t.date.substring(0, 7))).size || 1;
        const totalSpent = history.reduce((sum, t) => sum + Number(t.amount), 0);
        const averageSpent = totalSpent / uniqueMonths;
        
        return { lastMonth: spentLast, average: averageSpent };
    }, [currentLimitData, transactions]);


    // --- HANDLERS ---
    
    const handleOpenLimitModal = (limitData) => {
        const data = limitData ? {
            id: limitData.id,
            category: limitData.category,
            amount: limitData.limit, 
            period_start: limitData.period_start,
        } : initialLimitFormState;
        
        setCurrentLimitData(data);
        setIsLimitModalOpen(true);
    };

    const handleDataChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'period_start') {
            newValue = value + '-01';
        }
        
        setCurrentLimitData(prev => ({
            ...prev,
            [name]: newValue,
            period_start: name === 'period_start' ? newValue : prev.period_start,
            amount: name === 'amount' ? newValue : prev.amount,
            category: name === 'category' ? value : prev.category,
        }));
    };
    
    const handleCreateGoal = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Creating goal...");
        
        const result = await addGoal({
            name: newGoal.name,
            target_amount: parseFloat(newGoal.target_amount),
            deadline: newGoal.deadline || null
        });

        toast.dismiss(loadingToast);
        if (result.success) {
            toast.success("Goal created successfully!");
            setIsGoalModalOpen(false);
            setNewGoal({ name: '', target_amount: '', deadline: '' });
        } else {
            toast.error(result.msg || "Failed to create goal.");
        }
    };
    
    const handleSaveLimit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(currentLimitData.id ? "Updating limit..." : "Saving limit...");
        
        const limitPayload = {
            category: currentLimitData.category,
            limit_amount: parseFloat(currentLimitData.amount),
            period_start: currentLimitData.period_start,
        };

        let result;
        
        if (currentLimitData.id) {
            const apiEndpoint = `transactions/limits/${currentLimitData.id}/`;
            try {
                // Manually call PUT/PATCH
                await api.put(apiEndpoint, limitPayload);
                result = { success: true };
            } catch (error) {
                result = { success: false, msg: error.response?.data?.non_field_errors?.[0] || "Failed to update limit." };
            }
        } else {
            // CREATING (POST)
            result = await saveBudgetLimits([limitPayload]); 
        }

        toast.dismiss(loadingToast);
        if (result.success) {
            toast.success(`Limit ${currentLimitData.id ? 'updated' : 'set'} for ${currentLimitData.category}!`);
            setIsLimitModalOpen(false);
            setCurrentLimitData(initialLimitFormState); 
        } else {
            toast.error(result.msg || "Error saving budget limit.");
        }
    };

    const handleDeleteGoal = async (id) => {
        const loadingToast = toast.loading("Deleting goal...");
        const result = await deleteGoal(id);
        toast.dismiss(loadingToast);
        if (result.success) {
            toast.success("Goal deleted.");
            setConfirmDeleteId(null);
        } else {
            toast.error(result.msg || "Failed to delete.");
        }
    };

    const handleDeleteLimit = async (id) => {
        const loadingToast = toast.loading("Deleting limit...");
        const result = await deleteLimit(id);
        toast.dismiss(loadingToast);
        if (result.success) {
            toast.success("Limit deleted.");
            setConfirmDeleteId(null);
        } else {
            toast.error(result.msg || "Failed to delete.");
        }
    };

    
    // --- EFFECT: Fetch prediction whenever modal data changes (category/month) ---
    useEffect(() => {
        // Only run for NEW limits and when modal is open
        if (isLimitModalOpen && !currentLimitData.id) { 
             const fetchAndSetPrediction = async () => {
                 setLoadingPrediction(true);
                 setSuggestedAmount(null);
                 
                 const category = currentLimitData.category;
                 const periodStart = currentLimitData.period_start;

                 // Fetch prediction
                 const result = await getBudgetPrediction(category, periodStart);

                 if (result.success) {
                     setSuggestedAmount(result.suggestion);
                     // Auto-fill the amount field with the suggestion
                     setCurrentLimitData(prev => ({
                         ...prev,
                         amount: result.suggestion.toFixed(2), 
                     }));
                 } else {
                     setSuggestedAmount(400.00); // Fail-safe default
                     setCurrentLimitData(prev => ({
                         ...prev,
                         amount: '400.00',
                     }));
                 }
                 setLoadingPrediction(false);
             };
             fetchAndSetPrediction();
        } else if (isLimitModalOpen && currentLimitData.id) {
             setSuggestedAmount(null); // Clear suggestion when editing existing limit
        }
    }, [isLimitModalOpen, currentLimitData?.category, currentLimitData?.period_start, getBudgetPrediction]);


    return (
        <div className="space-y-10">
            
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
                <div>
                   <h1 className={`text-2xl font-bold ${theme.textMain}`}>Budget & Goals</h1>
                   <p className={`text-sm ${theme.textMuted}`}>Manage spending limits and track savings progress.</p>
                </div>
            </div>

            {/* === SECTION 1: SPENDING LIMITS (Budgeting) === */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold ${theme.textMain}`}>Monthly Spending Limits</h2>
                    <button 
                        onClick={() => handleOpenLimitModal(null)} // Open for creation
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all"
                    >
                        <ListMinus size={16} /> Set Limits
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {calculatedLimits.length === 0 ? (
                        <div className={`md:col-span-3 p-8 text-center rounded-2xl ${theme.card}`}>
                             <p className="text-lg font-semibold">No active spending limits set.</p>
                             <p className={theme.textMuted}>Click 'Set Limits' to define your budget.</p>
                        </div>
                    ) : (
                        calculatedLimits.map((limit) => (
                            <div key={limit.id} className={`p-5 rounded-2xl border shadow-sm ${theme.card} relative group`}>
                                
                                {/* Edit Button Overlay */}
                                <button 
                                    onClick={() => handleOpenLimitModal(limit)}
                                    className="absolute top-3 right-10 p-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-500"
                                >
                                    <Edit size={18} />
                                </button>
                                
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className={`font-bold ${theme.textMain}`}>{limit.category} Budget</h4>
                                    <button onClick={() => setConfirmDeleteId({id: limit.id, type: 'limit'})} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <p className={`text-2xl font-extrabold ${limit.isOver ? 'text-rose-500' : theme.textMain}`}>
                                    ${limit.spent.toLocaleString()}
                                </p>
                                <p className={`text-sm ${theme.textMuted}`}>
                                    of ${limit.limit.toLocaleString()} limit ({limit.period_start.substring(0, 7)})
                                </p>

                                <div className="mt-4 space-y-2">
                                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-500 ${limit.isOver ? 'bg-rose-500' : limit.isWarning ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                                            style={{ width: `${limit.percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>{limit.percentage.toFixed(0)}% Used</span>
                                        {limit.isOver && <span className="text-rose-500 font-bold">OVER BUDGET!</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>


            {/* === SECTION 2: SAVINGS GOALS (Jars/Vaults) === */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold ${theme.textMain}`}>Savings Goals (Vaults)</h2>
                    <button 
                        onClick={() => setIsGoalModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all"
                    >
                        <Target size={16} /> Create Goal
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loadingGoals ? (
                        <div className={`md:col-span-3 p-8 text-center rounded-2xl ${theme.card}`}>Loading Goals...</div>
                    ) : goals.length === 0 ? (
                        <div className={`md:col-span-3 p-12 text-center rounded-2xl ${theme.card}`}>
                            <TrendingUp size={40} className="text-indigo-400 mx-auto mb-4" />
                            <p className="text-lg font-semibold">Ready to start saving?</p>
                            <p className={theme.textMuted}>Click 'Create Goal' above!</p>
                        </div>
                    ) : (
                        goals.map((goal) => {
                            const percent = parseFloat(goal.progress);
                            const isComplete = percent >= 100;
                            const remaining = Number(goal.target_amount) - Number(goal.saved_amount);
                            
                            return (
                                <div key={goal.id} className={`p-6 rounded-2xl border shadow-sm ${theme.card} hover:shadow-xl transition-shadow`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className={`font-bold text-lg ${theme.textMain}`}>{goal.name}</h3>
                                        <button onClick={() => setConfirmDeleteId({id: goal.id, type: 'goal'})} className="text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <p className={`text-3xl font-extrabold ${theme.textMain}`}>
                                        ${Number(goal.saved_amount).toLocaleString()}
                                    </p>
                                    <p className={`text-xs ${theme.textMuted}`}>
                                        Target: ${Number(goal.target_amount).toLocaleString()}
                                    </p>

                                    <div className="mt-6 space-y-2">
                                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000`} 
                                                style={{ width: `${percent}%`, background: isComplete ? '#10b981' : '#6366f1' }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">
                                            {isComplete ? "Goal achieved! 🎉" : `Need $${remaining.toLocaleString()} more.`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>


            {/* --- MODAL 1: CREATE GOAL (Savings Jars) --- */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${theme.card} relative`}>
                        <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between">
                            <h2 className={`text-lg font-bold ${theme.textMain}`}>Set Saving Goal</h2>
                            <button type="button" onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateGoal} className="p-6 space-y-5">
                            
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${theme.textMain}`}>Goal Name</label>
                                <input type="text" required placeholder="e.g. New Laptop" name="name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${theme.input}`} />
                            </div>

                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${theme.textMain}`}>Target Amount ($)</label>
                                <input type="number" step="0.01" required placeholder="2000.00" name="target_amount" value={newGoal.target_amount} onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${theme.input}`} />
                            </div>

                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${theme.textMain}`}>Deadline (Optional)</label>
                                <input type="date" name="deadline" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${theme.input}`} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsGoalModalOpen(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                                <button type="submit" className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"><Check size={18} /> Create Goal</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
            
            {/* --- MODAL 2: SET SPENDING LIMITS (Monthly Budgets) --- */}
            {isLimitModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${theme.card} relative`}>
                        <div className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between">
                            <h2 className={`text-lg font-bold ${theme.textMain}`}>{currentLimitData.id ? 'Edit Limit' : 'Set Monthly Limits'}</h2>
                            <button type="button" onClick={() => setIsLimitModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveLimit} className="p-6 space-y-4">
                            <p className="text-sm text-slate-400">Define the spending limit and the starting month for this budget.</p>
                            
                            {/* Category Selector (GRID UI) */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${theme.textMain}`}>CATEGORY</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {AVAILABLE_LIMIT_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            disabled={!!currentLimitData.id} 
                                            onClick={() => setCurrentLimitData({...currentLimitData, category: cat.id})}
                                            className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                                                currentLimitData.category === cat.id 
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                                : `${theme.input} hover:border-indigo-300`
                                            } ${currentLimitData.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <cat.icon size={18} />
                                            <span className="text-[10px] font-bold uppercase">{cat.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${theme.textMain}`}>Limit Amount ($)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    required
                                    value={currentLimitData.amount}
                                    onChange={handleDataChange}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${theme.input}`}
                                />
                            </div>
                            
                            {/* ML Prediction and Context (IMPROVED SECTION) */}
                            {!currentLimitData.id && (
                                <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'} text-sm`}>
                                    <span className={`block font-bold mb-2 ${theme.textMain}`}>AI Prediction Context</span>
                                    
                                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                                        <div className="p-1.5 rounded bg-indigo-50 dark:bg-indigo-900/40">
                                            <span className="block font-bold">Limit:</span>
                                            <span className="text-indigo-500 font-extrabold text-lg">
                                                {loadingPrediction ? <Loader2 size={16} className="animate-spin mx-auto" /> : `$${suggestedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}`}
                                            </span>
                                            <span className="block text-slate-400">Suggested</span>
                                        </div>
                                        <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-900/40">
                                            <span className="block font-bold">Last Month:</span>
                                            <span className="text-emerald-500 font-extrabold text-lg">${spendingContext.lastMonth.toLocaleString()}</span>
                                            <span className="block text-slate-400">Actual Spent</span>
                                        </div>
                                        <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-900/40">
                                            <span className="block font-bold">Avg. Spent:</span>
                                            <span className="text-amber-500 font-extrabold text-lg">${spendingContext.average.toLocaleString()}</span>
                                            <span className="block text-slate-400">Historical</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Period Start Month */}
                            <div className="space-y-2">
                                <label className={`text-sm font-semibold ${theme.textMain}`}>Starting Month</label>
                                <input 
                                    type="month"
                                    required
                                    // Disabled if editing because you can't move an active limit period
                                    disabled={!!currentLimitData.id}
                                    value={currentLimitData.period_start.substring(0, 7)} // Bind only to YYYY-MM part
                                    onChange={handleDataChange}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none text-sm ${theme.input} ${currentLimitData.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg transition-all">
                                    {currentLimitData.id ? 'Update Limit' : 'Save Limits'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- UI BASED DELETE CONFIRMATION MODAL --- */}
            {(confirmDeleteId && (goals.find(g => g.id === confirmDeleteId.id) || calculatedLimits.find(l => l.id === confirmDeleteId.id))) && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className={`w-full max-w-sm rounded-xl shadow-2xl ${theme.card} relative p-6 text-center`}>
                        <AlertTriangle size={32} className="text-rose-500 mx-auto mb-4" />
                        <h3 className={`text-xl font-bold mb-2 ${theme.textMain}`}>Confirm Deletion</h3>
                        <p className={`text-sm ${theme.textMuted} mb-6`}>
                            Are you sure you want to permanently delete this item? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setConfirmDeleteId(null)} 
                                className={`px-4 py-2 rounded-lg font-bold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    // Determine if it's a goal or limit based on context
                                    if (goals.find(g => g.id === confirmDeleteId.id)) {
                                        handleDeleteGoal(confirmDeleteId.id);
                                    } else {
                                        handleDeleteLimit(confirmDeleteId.id);
                                    }
                                }} 
                                className="px-4 py-2 rounded-lg font-bold text-white bg-rose-600 hover:bg-rose-700"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budget;