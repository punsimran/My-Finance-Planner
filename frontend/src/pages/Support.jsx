import React, { useState, useRef } from 'react';
import { 
  Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, AlertCircle, HelpCircle 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';


const Support = () => {
  const { isDarkMode } = useTheme();
  const formRef = useRef();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  // Theme Configuration
  const theme = {
    card: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    input: isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-50 border-slate-200 text-slate-900",
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    setTimeout(() => {
      setLoading(false);
      setStatus('success');
      e.target.reset();
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${theme.textMain}`}>Help & Support</h1>
        <p className={`text-sm ${theme.textMuted}`}>Have a question? We are here to help.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: CONTACT INFO --- */}
        <div className="space-y-6">
           {/* Info Card */}
           <div className={`p-6 rounded-3xl border shadow-sm ${theme.card}`}>
              <h3 className={`font-bold text-lg mb-6 ${theme.textMain}`}>Contact Information</h3>
              
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                       <Mail size={20} />
                    </div>
                    <div>
                       <p className={`text-sm font-bold ${theme.textMain}`}>Email Us</p>
                       <p className={`text-xs ${theme.textMuted}`}>support@fintrack.com</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                       <Phone size={20} />
                    </div>
                    <div>
                       <p className={`text-sm font-bold ${theme.textMain}`}>Call Us</p>
                       <p className={`text-xs ${theme.textMuted}`}>+1 (555) 123-4567</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600">
                       <MapPin size={20} />
                    </div>
                    <div>
                       <p className={`text-sm font-bold ${theme.textMain}`}>Location</p>
                       <p className={`text-xs ${theme.textMuted}`}>123 Finance Street, NY</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* FAQ Mini */}
           <div className={`p-6 rounded-3xl border shadow-sm bg-gradient-to-br from-indigo-600 to-violet-600 text-white`}>
              <div className="flex items-center gap-2 mb-3">
                 <HelpCircle size={20} className="text-indigo-200" />
                 <h3 className="font-bold">Quick FAQ</h3>
              </div>
              <p className="text-xs text-indigo-100 mb-4 leading-relaxed">
                 Experiencing issues with charts? Try clearing your cache or checking your internet connection first.
              </p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
                 Visit Help Center
              </button>
           </div>
        </div>

        {/* --- RIGHT COLUMN: CONTACT FORM --- */}
        <div className={`lg:col-span-2 p-8 rounded-3xl border shadow-sm ${theme.card}`}>
           
           <h3 className={`font-bold text-xl mb-6 ${theme.textMain}`}>Send us a Message</h3>

           {status === 'success' && (
             <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 size={20} />
                <div>
                   <p className="font-bold text-sm">Message Sent Successfully!</p>
                   <p className="text-xs opacity-80">We'll get back to you within 24 hours.</p>
                </div>
             </div>
           )}

           {status === 'error' && (
             <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 flex items-center gap-3">
                <AlertCircle size={20} />
                <p className="font-bold text-sm">Something went wrong. Please try again.</p>
             </div>
           )}

           <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Your Name</label>
                    <input 
                      type="text" 
                      name="user_name"
                      required
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Email Address</label>
                    <input 
                      type="email" 
                      name="user_email"
                      required
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Subject</label>
                 <div className="relative">
                    <MessageSquare size={18} className="absolute left-4 top-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      name="subject"
                      required
                      placeholder="How can we help?"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Message</label>
                 <textarea 
                    name="message"
                    required
                    rows="5"
                    placeholder="Describe your issue or question..."
                    className={`w-full px-4 py-3 rounded-xl border outline-none font-medium resize-none transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`}
                 ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {loading ? 'Sending...' : <>Send Message <Send size={18} /></>}
                 </button>
              </div>

           </form>
        </div>

      </div>
    </div>
  );
};

export default Support;