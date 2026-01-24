import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, User, Lock, Trash2, Check, X, CreditCard, LayoutDashboard, AlertTriangle, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminUserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const theme = {
        card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
        textMain: isDarkMode ? "text-white" : "text-slate-900",
        input: isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-50 border-slate-200 text-slate-900",
    };

    // --- FETCH USER DETAILS & METRICS ---
    const fetchUserDetail = async () => {
        setLoading(true);
        try {
            const detailResponse = await api.get(`authentication/admin/users/${userId}/`);
            setTargetUser(detailResponse.data);
            setProfileData({
                first_name: detailResponse.data.first_name || '',
                email: detailResponse.data.email,
                is_active: detailResponse.data.is_active,
                is_staff: detailResponse.data.is_staff,
                is_superuser: detailResponse.data.is_superuser,
            });
        } catch (error) {
            toast.error("Could not load user data.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetail();
    }, [userId]);

    // --- HANDLE USER PROFILE/STATUS UPDATE (PUT) ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const loadingToast = toast.loading("Saving changes...");

        // Payload for update (PUT)
        const payload = {
            first_name: profileData.first_name,
            email: profileData.email,
            is_active: profileData.is_active,
            is_staff: profileData.is_staff,
        };

        try {
            await api.put(`authentication/users/${userId}/`, payload);
            toast.success("User profile updated.", { id: loadingToast });
            fetchUserDetail(); // Refresh data
        } catch (error) {
            toast.error("Update failed. Email may be taken.", { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    // --- HANDLE USER DELETION ---
    const handleDeleteUser = async () => {
        if (!window.confirm(`PERMANENT DELETE: Are you sure you want to delete ${targetUser.username}?`)) return;

        try {
            await api.delete(`authentication/users/${userId}/`);
            toast.success("User account deleted.");
            navigate('/admin'); // Redirect back to admin list
        } catch (error) {
            toast.error("Failed to delete user.");
        }
    };
    
    if (loading || !targetUser) {
        return (
            <div className="text-center py-20">
                <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto" />
                <p className="mt-3 text-slate-400">Loading user details...</p>
            </div>
        );
    }
    
    const { metrics } = targetUser;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="flex justify-between items-center border-b pb-4 dark:border-slate-800">
                <h1 className={`text-3xl font-bold ${theme.textMain}`}>
                    User: {targetUser.username}
                </h1>
                <div className="space-x-3">
                    <button 
                        onClick={() => navigate('/admin')} 
                        className="text-indigo-500 hover:text-indigo-700 text-sm font-semibold"
                    >
                        &larr; Back to List
                    </button>
                    <button 
                        onClick={handleDeleteUser}
                        className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-700"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* --- 1. USER METRICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl ${theme.card}`}>
                    <LayoutDashboard size={20} className="text-indigo-500 mb-2" />
                    <p className="text-xs text-slate-500">Total Transactions</p>
                    <h3 className={`text-xl font-extrabold ${theme.textMain}`}>{metrics.transaction_count}</h3>
                </div>
                <div className={`p-6 rounded-2xl ${theme.card}`}>
                    <UserCheck size={20} className="text-emerald-500 mb-2" />
                    <p className="text-xs text-slate-500">Total Income Recorded</p>
                    <h3 className={`text-xl font-extrabold text-emerald-500`}>${metrics.total_income.toLocaleString()}</h3>
                </div>
                <div className={`p-6 rounded-2xl ${theme.card}`}>
                    <CreditCard size={20} className="text-rose-500 mb-2" />
                    <p className="text-xs text-slate-500">Total Expenses Recorded</p>
                    <h3 className={`text-xl font-extrabold text-rose-500`}>${metrics.total_expense.toLocaleString()}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- 2. ACCOUNT MANAGEMENT FORM --- */}
                <div className={`p-8 rounded-2xl shadow-sm ${theme.card} space-y-6`}>
                    <h2 className={`text-xl font-bold ${theme.textMain}`}>Account Status & Roles</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        
                        {/* Name */}
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
                           <input 
                             type="text" 
                             value={profileData.first_name}
                             onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                             className={`w-full px-4 py-3 rounded-lg border outline-none ${theme.input}`}
                           />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">Email (Username)</label>
                           <input 
                             type="email" 
                             value={profileData.email}
                             onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                             className={`w-full px-4 py-3 rounded-lg border outline-none ${theme.input}`}
                           />
                        </div>

                        {/* Status Checkbox */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="font-medium text-sm">Active Account</label>
                            <input 
                                type="checkbox"
                                checked={profileData.is_active}
                                onChange={(e) => setProfileData({...profileData, is_active: e.target.checked})}
                                className="h-5 w-5 text-indigo-600 rounded"
                            />
                        </div>

                        {/* Role Checkbox */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="font-medium text-sm">Staff/Admin Role</label>
                            <input 
                                type="checkbox"
                                checked={profileData.is_staff}
                                onChange={(e) => setProfileData({...profileData, is_staff: e.target.checked})}
                                disabled={profileData.is_superuser} // Cannot demote superuser flag easily
                                className="h-5 w-5 text-indigo-600 rounded"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- 3. TRANSACTION HISTORY (View All Button) --- */}
                <div className={`p-8 rounded-2xl shadow-sm ${theme.card} space-y-6`}>
                    <h2 className={`text-xl font-bold ${theme.textMain}`}>Transaction History</h2>
                    <p className="text-sm text-slate-500">
                        View all {metrics.transaction_count} transactions associated with this user.
                    </p>
                    
                    <button 
                        onClick={() => navigate(`/dashboard/transactions?user=${userId}`)} // Future feature: pass user filter
                        className="w-full px-6 py-3 bg-slate-900 text-white dark:bg-slate-700 rounded-lg font-bold hover:bg-indigo-600 transition-colors"
                    >
                        View Full History
                    </button>

                    <div className="pt-4 border-t dark:border-slate-700">
                        <h3 className="text-lg font-bold mt-4">Danger Zone</h3>
                        <p className="text-xs text-rose-500 mb-4">
                            Use caution when deleting accounts or records.
                        </p>
                        <button 
                            onClick={() => handleDeleteUser(targetUser.id, targetUser.username)}
                            className="w-full px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-bold hover:bg-rose-200 transition-colors"
                        >
                            Permanently Delete User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;