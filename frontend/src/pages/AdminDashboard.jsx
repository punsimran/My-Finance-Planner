import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Loader2, 
    Edit, 
    Trash2, 
    CheckCircle,    // ADDED
    XCircle,        // ADDED
    LayoutDashboard, // ADDED
    UserCheck       // ADDED
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api'; 
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { isDarkMode } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // User currently being edited

    const theme = {
        card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
        textMain: isDarkMode ? "text-white" : "text-slate-900",
        textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
        input: isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-50 border-slate-200 text-slate-900",
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            // API call to the protected Django admin endpoint
            const response = await api.get('authentication/users/');
            const sortedUsers = response.data.sort((a, b) => b.is_superuser - a.is_superuser);
            setUsers(sortedUsers);
        } catch (error) {
            console.error("Access denied or API error:", error);
            toast.error("Access Denied: Must be a Superuser.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(`Updating user ${currentUser.username}...`);

        try {
            // Send updated fields (is_active and is_staff) to the Django detail endpoint
            const response = await api.put(`authentication/users/${currentUser.id}/`, currentUser);
            
            // Update local state and refresh list
            setUsers(users.map(u => u.id === currentUser.id ? response.data : u));
            toast.success("User updated successfully!", { id: loadingToast });
            setIsEditModalOpen(false);

        } catch (error) {
            console.error("Failed to update user:", error);
            toast.error("Failed to save changes.", { id: loadingToast });
        }
    };
    
    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) return;

        const loadingToast = toast.loading(`Deleting user ${username}...`);
        try {
            await api.delete(`authentication/users/${userId}/`);
            
            // Remove user from local state
            setUsers(users.filter(u => u.id !== userId));
            toast.success("User deleted.", { id: loadingToast });

        } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Failed to delete user.", { id: loadingToast });
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className={`text-3xl font-bold ${theme.textMain} flex items-center gap-3`}>
                <LayoutDashboard size={28} /> Admin Panel
            </h1>
            <p className={theme.textMuted}>
                Manage user access, roles, and status across the Finotic platform.
            </p>

            {/* User List Table */}
            <div className={`mt-8 p-6 rounded-2xl border shadow-sm ${theme.card}`}>
                <h2 className={`text-xl font-bold mb-4 ${theme.textMain} flex items-center gap-2`}>
                    <Users size={20} /> Registered Users ({users.length})
                </h2>

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" />
                        <p className="text-sm mt-3 text-slate-400">Loading user data...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto min-w-max">
                            <thead className={`text-xs uppercase border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                <tr>
                                    <th className="px-4 py-3">User/Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.map((u) => (
                                    <tr key={u.id} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                        <td className={`px-4 py-3 font-bold ${theme.textMain}`}>
                                            {u.username}
                                            <p className="text-xs font-normal text-slate-400">{u.email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-sm font-semibold ${u.is_superuser ? 'text-rose-500' : (u.is_staff ? 'text-indigo-500' : 'text-emerald-500')}`}>
                                                {u.is_superuser ? 'Superuser' : (u.is_staff ? 'Staff' : 'Standard')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.is_active ? 
                                                <span className="text-emerald-500 flex items-center gap-1 text-xs"><CheckCircle size={14} /> Active</span> :
                                                <span className="text-rose-500 flex items-center gap-1 text-xs"><XCircle size={14} /> Deactivated</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 space-x-2">
                                            <button 
                                                onClick={() => handleEditUser(u)}
                                                className="text-indigo-500 hover:text-indigo-700"
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {!u.is_superuser && ( // Cannot delete self/superuser
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                                    className="text-rose-500 hover:text-rose-700"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* --- Edit User Modal --- */}
            {isEditModalOpen && currentUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSaveUser} className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${theme.card}`}>
                        <h3 className={`text-2xl font-bold mb-6 ${theme.textMain}`}>Edit {currentUser.username}</h3>

                        <div className="space-y-4">
                            {/* Status Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <label className="font-medium text-sm">Account Status (Active/Deactivated)</label>
                                <input 
                                    type="checkbox"
                                    checked={currentUser.is_active}
                                    onChange={(e) => setCurrentUser({...currentUser, is_active: e.target.checked})}
                                    className="h-5 w-5 text-indigo-600 rounded"
                                />
                            </div>

                            {/* Staff Role Toggle (Cannot grant superuser from frontend) */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <label className="font-medium text-sm">Staff Role (Access to Django Admin)</label>
                                <input 
                                    type="checkbox"
                                    checked={currentUser.is_staff}
                                    onChange={(e) => setCurrentUser({...currentUser, is_staff: e.target.checked})}
                                    disabled={currentUser.is_superuser} // Prevent toggling if they are the primary superuser
                                    className="h-5 w-5 text-indigo-600 rounded"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;