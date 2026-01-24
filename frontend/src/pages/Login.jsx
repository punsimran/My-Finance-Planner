import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowRight, Wallet, PieChart, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { login } = useAuth(); 

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const theme = {
    bg: isDarkMode ? "bg-[#0f172a]" : "bg-slate-50",
    container: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    text: isDarkMode ? "text-slate-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    input: isDarkMode ? "bg-[#0f172a] border-slate-700 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500",
    visualPanel: isDarkMode ? "bg-gradient-to-br from-[#1e293b] to-[#0f172a]" : "bg-gradient-to-br from-indigo-50 to-white",
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // FIX 1: Declare loadingToast outside the try block
    let loadingToast;
    
    try {
      loadingToast = toast.loading(
        <span className="font-medium text-sm">Verifying credentials...</span>, 
        { style: { background: isDarkMode ? '#334155' : '#fff', color: isDarkMode ? '#fff' : '#333' } }
      );

      // Login returns { success: bool }
      const result = await login(formData.email, formData.password); 
      
      // FIX 2: Check admin status from local storage right after login
      const isAdmin = localStorage.getItem('is_admin') === 'true';

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Access Granted</span>
            <span className="text-xs opacity-90">Redirecting...</span>
          </div>,
          { id: loadingToast, duration: 2000 }
        );
        
        // FIX 3: Conditional Redirect logic
        if (isAdmin) {
             navigate('/admin'); // Admin goes to /admin
        } else {
             navigate('/'); // Standard user goes to Home (/)
        }

      } else {
        triggerShake();
        
        let errorMsg = result.msg || "Invalid credentials";
        let errorTitle = "Login Failed";

        if (errorMsg.toLowerCase().includes('password')) {
          errorTitle = "Wrong Password";
          errorMsg = "Please double-check your password.";
        } else if (errorMsg.toLowerCase().includes('found') || errorMsg.toLowerCase().includes('email')) {
          errorTitle = "Account Not Found";
          errorMsg = "That email isn't registered with us.";
        }

        toast.error(
          <div className="flex flex-col items-start">
            <span className="font-bold text-sm">{errorTitle}</span>
            <span className="text-xs opacity-90">{errorMsg}</span>
          </div>,
          { id: loadingToast, icon: <AlertTriangle className="text-red-500" size={20} /> }
        );
      }
    } catch (err) {
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error("Network error. Please check your connection.");
    }
    
    setLoading(false);
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 ${theme.bg} relative overflow-hidden font-sans`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${isDarkMode ? 'bg-blue-600' : 'bg-indigo-300'}`}></div>
         <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${isDarkMode ? 'bg-indigo-600' : 'bg-blue-300'}`}></div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .delay-100 { animation-delay: 2s; }
        
        /* Shake Animation for Errors */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* Main Container - Added 'animate-shake' class condition */}
      <div className={`relative w-full max-w-5xl min-h-[650px] flex rounded-[2rem] shadow-2xl overflow-hidden border ${theme.container} ${shake ? 'animate-shake ring-2 ring-red-500/50' : ''}`}>
        
        {/* --- LEFT PANEL --- */}
        <div className={`hidden md:flex w-5/12 relative flex-col justify-center items-center p-12 overflow-hidden ${theme.visualPanel}`}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
           <div className="relative z-10 w-full h-[350px] flex flex-col items-center justify-center">
              <div className={`absolute top-10 left-6 w-56 p-5 rounded-2xl shadow-xl backdrop-blur-md border animate-float ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white/80 border-white'}`}>
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                       <Wallet size={18} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Active</span>
                 </div>
                 <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme.textMuted}`}>Total Balance</p>
                 <h3 className={`text-2xl font-extrabold ${theme.text}`}>$42,593.00</h3>
              </div>
              <div className={`absolute top-40 right-4 w-48 p-4 rounded-2xl shadow-xl backdrop-blur-md border animate-float delay-100 ${isDarkMode ? 'bg-slate-800/90 border-slate-600' : 'bg-white/90 border-white'}`}>
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                       <PieChart size={18} />
                    </div>
                    <div>
                       <p className={`text-xs font-bold ${theme.text}`}>Spending</p>
                       <p className="text-[10px] text-slate-400">-12% this week</p>
                    </div>
                 </div>
                 <div className="flex items-end justify-between h-10 gap-1">
                    {[40, 70, 45, 90, 60].map((h, i) => (
                       <div key={i} style={{height: `${h}%`}} className="w-full bg-indigo-500 rounded-sm opacity-80"></div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="relative z-10 text-center mt-8">
              <h2 className={`text-2xl font-bold mb-2 ${theme.text}`}>Financial Clarity</h2>
              <p className={`text-sm ${theme.textMuted}`}>Login to access your real-time dashboard.</p>
           </div>
        </div>

        {/* --- RIGHT PANEL --- */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center relative">
           
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)} 
             className={`absolute top-6 right-6 p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
           >
             {isDarkMode ? <Sun size={20}/> : <Moon size={20} />}
           </button>

           <div className="max-w-sm w-full mx-auto">
              <div className="mb-10">
                 <h1 className={`text-3xl font-extrabold mb-2 ${theme.text}`}>Welcome back</h1>
                 <p className={theme.textMuted}>Please enter your details to sign in.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                       <input 
                         type="email" 
                         name="email"
                         required
                         value={formData.email}
                         onChange={handleChange}
                         className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all font-medium ${theme.input}`}
                         placeholder="name@company.com"
                       />
                    </div>
                 </div>

                 <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Password</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                       <input 
                         type={showPassword ? "text" : "password"}
                         name="password"
                         required
                         value={formData.password}
                         onChange={handleChange}
                         className={`w-full pl-11 pr-12 py-3.5 rounded-xl border outline-none transition-all font-medium ${theme.input}`}
                         placeholder="••••••••"
                       />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-500">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>

                 <div className="flex justify-end">
                    <a href="#" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">Forgot Password?</a>
                 </div>

                 <button 
                   type="submit"
                   disabled={loading}
                   className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.01] active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <>Sign In <ArrowRight size={18}/></>
                   )}
                 </button>
              </form>

              <div className="mt-8 text-center">
                 <p className={`text-sm ${theme.textMuted}`}>
                    Don't have an account? 
                    <button onClick={() => navigate('/register')} className="font-bold text-indigo-500 hover:text-indigo-600 ml-1 transition-colors">
                       Sign Up
                    </button>
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;