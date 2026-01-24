import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Lock, Camera, Check, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; // Import API helper

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Security State
  const [passwordForm, setPasswordForm] = useState({
      current_password: '',
      new_password: '',
      confirm_password: ''
  });
  const [passError, setPassError] = useState('');

  // Load user data when component mounts/updates
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setPreview(user.profile_picture ? `http://127.0.0.1:8000${user.profile_picture}` : null);
    }
  }, [user]);

  // Handle Image Change (Same as before)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast.error("Image is too large. Max 2MB.");
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- 1. PROFILE UPDATE HANDLER ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving profile changes...");

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    
    if (selectedFile) {
      formData.append('profile_picture', selectedFile);
    }

    const result = await updateProfile(formData);

    toast.dismiss(loadingToast);
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile.");
    }
  };

  // --- 2. PASSWORD CHANGE HANDLER ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
        setPassError("New password and confirmation do not match.");
        return;
    }
    
    const loadingToast = toast.loading("Updating password...");

    try {
        const response = await api.post('authentication/change-password/', passwordForm);

        toast.dismiss(loadingToast);
        toast.success("Password changed successfully! You will be logged out on token expiration.");
        
        // Clear form
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });

    } catch (error) {
        toast.dismiss(loadingToast);
        
        const errorData = error.response?.data;
        if (errorData?.current_password) {
            setPassError("Current password is incorrect.");
        } else if (errorData?.new_password) {
             setPassError(errorData.new_password[0]); // Display validation error
        } else {
            setPassError("Failed to change password.");
        }
    }
  };


  const theme = {
    card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    input: isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-50 border-slate-200 text-slate-900",
    activeTab: isDarkMode ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600",
  };

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${theme.textMain}`}>Settings</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Tabs */}
        <div className={`w-full lg:w-64 flex flex-col gap-1`}>
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-left transition-all ${activeTab === tab.id ? theme.activeTab : `${theme.textMuted} hover:bg-slate-50 dark:hover:bg-slate-800`}`}
             >
               <tab.icon size={18} /> {tab.label}
             </button>
           ))}
        </div>

        {/* Right Content */}
        <div className={`flex-1 p-8 rounded-2xl border shadow-sm ${theme.card}`}>
           
           {activeTab === 'profile' && (
             <form onSubmit={handleProfileSubmit} className="space-y-8">
                <h3 className={`text-lg font-bold border-b pb-4 ${theme.textMain} ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>Public Profile</h3>
                
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                   <img 
                     src={preview || "https://i.pravatar.cc/150?img=11"} 
                     alt="Avatar" 
                     className={`w-24 h-24 rounded-full object-cover ring-4 ${isDarkMode ? 'ring-slate-800' : 'ring-slate-50'}`} 
                   />
                   <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-bold text-xs cursor-pointer transition-colors shadow-sm ${isDarkMode ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'}`}>
                      <Camera size={16} /> Upload New Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                   </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`} 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`} 
                      />
                   </div>
                   <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`} 
                        />
                      </div>
                   </div>
                </div>

                <div className="flex justify-end pt-4">
                   <button 
                     type="submit"
                     className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all transform active:scale-95"
                   >
                     <Save size={18} /> Save Changes
                   </button>
                </div>
             </form>
           )}

           {activeTab === 'security' && (
             <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <h3 className={`text-lg font-bold border-b pb-4 ${theme.textMain} ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>Security</h3>
                
                {passError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 font-medium rounded-lg text-sm">
                        {passError}
                    </div>
                )}

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500">Current Password</label>
                   <input 
                     type="password" 
                     placeholder="••••••••" 
                     value={passwordForm.current_password}
                     onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                     className={`w-full px-4 py-3 rounded-xl border outline-none font-medium ${theme.input}`} 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500">New Password</label>
                   <input 
                     type="password" 
                     placeholder="••••••••" 
                     value={passwordForm.new_password}
                     onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                     className={`w-full px-4 py-3 rounded-xl border outline-none font-medium ${theme.input}`} 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500">Confirm New Password</label>
                   <input 
                     type="password" 
                     placeholder="••••••••" 
                     value={passwordForm.confirm_password}
                     onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                     className={`w-full px-4 py-3 rounded-xl border outline-none font-medium ${theme.input}`} 
                   />
                </div>
                <div className="flex justify-end pt-4">
                   <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">Update Password</button>
                </div>
             </form>
           )}

        </div>
      </div>
    </div>
  );
};

export default Settings;