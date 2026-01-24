import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; // 1. Import Auth

const Register = () => {
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { register } = useAuth(); // 2. Get register function

  // 3. CHANGED: State matches Django requirements
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Added Error state

  const theme = {
    bg: isDarkMode ? "bg-[#0f172a]" : "bg-slate-50",
    container: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    text: isDarkMode ? "text-slate-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    input: isDarkMode ? "bg-[#0f172a] border-slate-700 text-white focus:border-violet-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500",
    visualPanel: isDarkMode ? "bg-gradient-to-br from-[#1e293b] to-[#0f172a]" : "bg-gradient-to-br from-violet-50 to-white",
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 4. Client side validation
    if (formData.password !== formData.password2) {
        setError("Passwords do not match");
        setLoading(false);
        return;
    }

    // 5. Call API
    const result = await register(formData);

    if (result.success) {
        navigate('/'); // Go to home/dashboard
    } else {
        setError(result.msg); // Show API error
    }
    setLoading(false);
  };

  const getStrength = (pass) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length > 7) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };
  const strength = getStrength(formData.password);

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 ${theme.bg} relative overflow-hidden font-sans`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${isDarkMode ? 'bg-violet-600' : 'bg-purple-300'}`}></div>
         <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${isDarkMode ? 'bg-indigo-600' : 'bg-blue-300'}`}></div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .delay-100 { animation-delay: 2s; }
      `}</style>

      <div className={`relative w-full max-w-5xl min-h-[650px] flex rounded-[2rem] shadow-2xl overflow-hidden border ${theme.container}`}>
        
        {/* LEFT PANEL (VISUALS) */}
        <div className={`hidden md:flex w-5/12 relative flex-col justify-center items-center p-12 overflow-hidden ${theme.visualPanel}`}>
           
           <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
           
           <div className="relative z-10 w-full h-[350px] flex flex-col items-center justify-center">
              
              <div className={`absolute top-16 right-6 w-56 p-6 rounded-3xl shadow-xl backdrop-blur-md border animate-float ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white/80 border-white'}`}>
                 <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 mb-4">
                     <ShieldCheck size={20} />
                 </div>
                 <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>Bank Grade</h3>
                 <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                     Your data is encrypted with 256-bit SSL technology.
                 </p>
              </div>

              <div className={`absolute top-56 left-6 w-48 p-4 rounded-3xl shadow-xl backdrop-blur-md border animate-float delay-100 ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white/80 border-white'}`}>
                  <div className="flex justify-between items-center mb-4">
                      <span className={`text-xs font-bold uppercase ${theme.textMuted}`}>Growth</span>
                      <TrendingUp size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex items-end gap-1 h-12">
                      {[30, 50, 40, 70, 60, 90].map((h, i) => (
                          <div key={i} style={{height: `${h}%`}} className="flex-1 bg-violet-500 rounded-sm"></div>
                      ))}
                  </div>
              </div>
           </div>

           <div className="relative z-10 text-center mt-6">
              <h2 className={`text-2xl font-bold mb-2 ${theme.text}`}>Join FinTrack</h2>
              <p className={`text-sm ${theme.textMuted}`}>Start your journey to financial freedom.</p>
           </div>
        </div>

        {/* RIGHT PANEL (REGISTER FORM) */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center relative">
           
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)} 
             className={`absolute top-6 right-6 p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
           >
             {isDarkMode ? <Sun size={20}/> : <Moon size={20} />}
           </button>

           <div className="max-w-sm w-full mx-auto">
              <div className="mb-8">
                 <h1 className={`text-3xl font-extrabold mb-2 ${theme.text}`}>Create Account</h1>
                 <p className={theme.textMuted}>Join us and manage your finance faster.</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                 
                 <div className="space-y-1.5">
                    <label className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Username</label>
                    <div className="relative">
                       <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                       <input 
                         type="text" 
                         name="username"
                         required
                         value={formData.username}
                         onChange={handleChange}
                         className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all font-medium ${theme.input}`}
                         placeholder="johndoe"
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Email</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                       <input 
                         type="email" 
                         name="email"
                         required
                         value={formData.email}
                         onChange={handleChange}
                         className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all font-medium ${theme.input}`}
                         placeholder="hello@example.com"
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Password</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                       <input 
                         type={showPassword ? "text" : "password"} 
                         name="password"
                         required
                         value={formData.password}
                         onChange={handleChange}
                         className={`w-full pl-11 pr-12 py-3.5 rounded-xl border outline-none transition-all font-medium ${theme.input}`}
                         placeholder="Create a password"
                       />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-violet-500">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>

                 {/* Confirm Password (Required by Django) */}
                 <div className="space-y-1.5">
                    <label className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Confirm Password</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                       <input 
                         type="password" 
                         name="password2"
                         required
                         value={formData.password2}
                         onChange={handleChange}
                         className={`w-full pl-11 pr-12 py-3.5 rounded-xl border outline-none transition-all font-medium ${theme.input}`}
                         placeholder="Confirm your password"
                       />
                    </div>
                 </div>

                 {/* Progress Bars */}
                 <div className="flex gap-2 pt-2">
                     {[1, 2, 3, 4].map((step) => (
                         <div 
                           key={step} 
                           className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                             strength >= step 
                               ? 'bg-[#8b5cf6]' 
                               : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                           }`}
                         ></div>
                     ))}
                 </div>

                 <button 
                   type="submit"
                   disabled={loading}
                   className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] transition-all transform hover:scale-[1.01] active:scale-[0.98] flex justify-center items-center gap-2 mt-4 disabled:opacity-70"
                 >
                   {loading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <>Get Started <ArrowRight size={18}/></>
                   )}
                 </button>

              </form>

              <div className="mt-8 text-center">
                 <p className={`text-sm ${theme.textMuted}`}>
                    Already have an account? 
                    <button onClick={() => navigate('/login')} className="font-bold text-violet-500 hover:text-violet-600 ml-1 transition-colors">
                       Sign In
                    </button>
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Register;