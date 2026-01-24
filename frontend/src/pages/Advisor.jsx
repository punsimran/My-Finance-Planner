import React, { useState, useMemo } from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Loader2, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import api from '../services/api'; 
import toast from 'react-hot-toast';

const Advisor = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const { transactions, loading: dataLoading } = useTransactions();
    
    const [advice, setAdvice] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    
    const hasData = transactions.filter(t => t.type === 'expense').length > 0;

    const fetchAdvice = async () => {
        if (!hasData) {
            toast.error("Please record at least one transaction to generate an analysis.");
            setAdvice(null);
            return;
        }

        setLoadingAI(true);
        setAdvice(null); 
        
        // Show loading toast (optional, as we have the screen loader now)
        const loadingToast = toast.loading("Compiling financial report...");

        try {
            // Calling the secure Django Backend endpoint
            const response = await api.get('authentication/advisor/insights/');
            
            setAdvice(response.data);
            toast.success("Analysis complete!", { id: loadingToast });
        } catch (error) {
            toast.error("Failed to fetch advice from backend.", { id: loadingToast });
            setAdvice({ 
                summary: "Error connecting to the AI backend service.", 
                recommendations: ["Ensure your Django server is running and configured."], 
                spending_warning: "N/A" 
            });
        } finally {
            setLoadingAI(false);
        }
    };

    const theme = {
        card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
        textMain: isDarkMode ? "text-white" : "text-slate-900",
        textMuted: isDarkMode ? "text-slate-300" : "text-slate-600",
    };

    // --- CSS FOR CUTE RUNNING ANIMATION ---
    const AgentAnimation = () => (
        <div className="flex-1 flex flex-col items-center justify-center space-y-5 py-10">
            <style>{`
                @keyframes run-x {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .agent-track {
                    width: 100%;
                    height: 8px;
                    background: ${isDarkMode ? '#334155' : '#e2e8f0'};
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                }
                .agent-runner {
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(45deg, #7c3aed, #4f46e5);
                    border-radius: 50%;
                    position: absolute;
                    top: -6px; /* Center on the track */
                    animation: run-x 1.5s cubic-bezier(0.68, -0.55, 0.26, 1.55) infinite alternate;
                    box-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
                }
            `}</style>
            
            <div className="w-48 h-48 rounded-full bg-indigo-500/10 flex items-center justify-center relative">
                <Sparkles size={48} className="text-indigo-500" />
            </div>
            <p className={`font-semibold text-lg ${theme.textMain}`}>Compiling Report...</p>
            <div className="agent-track w-full max-w-sm">
                <div className="agent-runner"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <h1 className={`text-2xl font-bold ${theme.textMain}`}>AI Financial Advisor</h1>
                <button 
                    onClick={fetchAdvice}
                    disabled={loadingAI || dataLoading || !hasData}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    {loadingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {loadingAI ? "Analyzing..." : "Generate Insights"}
                </button>
            </div>

            {/* AI Output Card */}
            <div className={`p-8 rounded-3xl border shadow-xl ${theme.card} space-y-6 min-h-[350px] flex flex-col`}>
                <div className="flex items-center gap-4 pb-4 border-slate-100 dark:border-slate-700">
                    <Zap size={32} className="text-indigo-500" />
                    <h2 className={`text-xl font-extrabold ${theme.textMain}`}>Your Financial Snapshot</h2>
                </div>

                {/* --- LOADING STATE / INITIAL STATE --- */}
                {loadingAI ? (
                    <AgentAnimation />
                ) : !advice ? (
                     <div className="flex-1 flex items-center justify-center text-center py-10">
                        <p className={theme.textMuted}>
                           {!hasData ? "Record a few transactions to unlock AI analysis." : "Click 'Generate Insights' to start."}
                        </p>
                     </div>
                ) : (
                /* --- RESULTS DISPLAY --- */
                    <div className="space-y-6">
                        
                        {/* Summary */}
                        <div className={`p-4 rounded-xl border-l-4 border-indigo-400 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                            <h3 className="font-bold text-indigo-500 mb-1">
                                Analysis Summary
                            </h3>
                            <p className={`text-sm ${theme.textMuted}`}>
                                {advice.summary}
                            </p>
                        </div>
                        
                        {/* Warning */}
                        {advice.spending_warning && advice.spending_warning !== 'N/A' && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                                <AlertTriangle size={20} className="text-rose-500 shrink-0" />
                                <p className="text-sm text-rose-300">
                                    <span className="font-bold">Urgent Warning:</span> {advice.spending_warning}
                                </p>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="space-y-3 pt-2">
                            <h3 className={`font-bold text-lg ${theme.textMain}`}>Actionable Recommendations</h3>
                            <ul className="space-y-2">
                                {Array.isArray(advice.recommendations) && advice.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle size={20} className="text-emerald-500 mt-1 shrink-0" />
                                        <span className={theme.textMuted}>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Advisor;