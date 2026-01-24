import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  PieChart, 
  ArrowRight, 
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sun,
  Moon,
  LayoutDashboard,
  Wallet
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import user1 from '../assets/users/user1.jpeg';
import user2 from '../assets/users/user2.jpeg';
import user3 from '../assets/users/user3.jpeg';
import logo from  '../assets/logo.png';

const logoImg = logo;


const HomePage = () => {
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { user } = useAuth(); 
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  const dashboardPath = isAdmin ? '/admin' : '/dashboard';
  const ctaDestination = user ? dashboardPath : '/register';
  const ctaLabel = user ? "Go to Dashboard" : "Create Free Account";


  // Helper classes to switch themes easily
  const theme = {
    bg: isDarkMode ? "bg-[#0f172a]" : "bg-slate-50/50",
    text: isDarkMode ? "text-slate-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-600",
    // Navbar is now Sticky
    nav: isDarkMode ? "bg-[#0f172a]/90 border-slate-800" : "bg-white/90 border-slate-200",
    card: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100",
    cardHover: isDarkMode ? "hover:bg-slate-700" : "hover:bg-white",
    footer: isDarkMode ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200",
    heading: isDarkMode ? "text-white" : "text-slate-900",
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      
      {/* --- Ambient Background Gradients --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-500 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-200/40'}`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-500 ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-200/40'}`} />
      </div>

      {/* --- STICKY NAVIGATION --- */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${theme.nav}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src={logoImg} 
                alt="FinTrack Logo" 
                className="h-45 w-auto object-contain" 
                style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`text-sm font-semibold transition-colors hover:text-indigo-600 ${theme.textMuted}`}>Features</a>
              <a href="#how-it-works" className={`text-sm font-semibold transition-colors hover:text-indigo-600 ${theme.textMuted}`}>How it works</a>
              <a href="#pricing" className={`text-sm font-semibold transition-colors hover:text-indigo-600 ${theme.textMuted}`}>Pricing</a>
            </div>

            {/* Auth Buttons + Theme Toggle */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Dark Mode Toggle Button */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className={`h-6 w-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

              {/* AUTH LOGIC: Show Dashboard Button if logged in */}
              {user ? (
                <button 
                  onClick={() => navigate(dashboardPath)} // Redirect to /admin or /dashboard
                  className={`flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg transform hover:-translate-y-0.5 ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'}`}
                >
                  <LayoutDashboard size={18} /> {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className={`text-sm font-bold px-4 py-2 hover:opacity-80 ${theme.heading}`}
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className={`text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg transform hover:-translate-y-0.5 ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'}`}
                  >
                    Start Tracking Free
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setIsDarkMode(!isDarkMode)}>
                 {isDarkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={theme.textMuted}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t absolute w-full px-4 py-6 flex flex-col gap-4 shadow-xl z-50 ${theme.nav}`}>
            <a href="#features" className={`font-medium ${theme.textMuted}`}>Features</a>
            <a href="#how-it-works" className={`font-medium ${theme.textMuted}`}>How it works</a>
            <hr className={isDarkMode ? 'border-slate-800' : 'border-slate-100'} />
            
            {user ? (
               <button onClick={() => navigate(dashboardPath)} className="bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                 <LayoutDashboard size={18} /> {isAdmin ? 'Admin Panel' : 'Dashboard'}
               </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className={`text-left font-medium ${theme.heading}`}>Log in</button>
                <button onClick={() => navigate('/register')} className="bg-indigo-600 text-white py-3 rounded-lg font-semibold">Get Started</button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Content */}
          <div className="max-w-2xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${isDarkMode ? 'bg-indigo-900/30 border-indigo-800 text-indigo-300' : 'bg-indigo-100 border-indigo-200 text-indigo-800'}`}>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              New: AI Expense Insights
            </div>
            
            <h1 className={`text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 ${theme.heading}`}>
              Master your money, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                Build your wealth.
              </span>
            </h1>
            
            <p className={`text-lg mb-8 leading-relaxed max-w-lg font-medium ${theme.textMuted}`}>
              Stop guessing where your money goes. Track expenses, set smart budgets, and watch your savings grow with our intuitive dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={() => navigate(ctaDestination)} // Redirect to /admin or /register
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20"
              >
                {ctaLabel} <ArrowRight size={20} />
              </button>
              <button className={`flex items-center justify-center gap-2 border px-8 py-4 rounded-xl font-bold transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
                View Demo
              </button>
            </div>
            
            {/* Trusted Users Section */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <img src={user1} alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                <img src={user2} alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                <img src={user3} alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  +2k
                </div>
              </div>
              <div>
                <p className={`font-bold ${theme.heading}`}>Trusted by 10,000+</p>
                <p className={`text-xs font-medium ${theme.textMuted}`}>Smart savers worldwide</p>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="relative hidden lg:block">
            {/* Main Card */}
            <div className="relative z-20 bg-slate-900 rounded-[2rem] p-8 shadow-2xl shadow-slate-900/20 border border-slate-800 transform rotate-[-2deg] hover:rotate-0 transition-all duration-500 ease-out">
              
              {/* Fake Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Total Balance</h3>
                    <p className="text-slate-400 text-xs">Updated just now</p>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold px-3 py-1 rounded-full">
                  +2.4%
                </div>
              </div>

              {/* Big Number */}
              <div className="mb-10">
                <h2 className="text-5xl font-bold text-white tracking-tight mb-2">$24,562.00</h2>
                <p className="text-slate-400 font-medium">Available funds</p>
              </div>

              {/* Fake Bars Graph */}
              <div className="flex justify-between items-end h-40 gap-4 mb-2">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="w-full bg-slate-800 rounded-t-lg relative group overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all duration-1000 group-hover:bg-indigo-400"
                      style={{ height: `${h}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Card Behind */}
            <div className={`absolute top-12 -right-8 w-72 p-6 rounded-2xl shadow-xl border z-30 animate-bounce-slow ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                  <PieChart size={24} />
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${theme.heading}`}>Spending Limit</h4>
                  <p className={`text-xs font-medium ${theme.textMuted}`}>Monthly Budget</p>
                </div>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden mb-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div className="bg-orange-500 h-full w-[70%]"></div>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className={theme.textMuted}>$1,200 used</span>
                <span className="text-orange-500">70%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className={`py-24 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-500 font-bold tracking-wide uppercase text-sm mb-3">Why choose FinTrack?</h2>
            <h3 className={`text-3xl md:text-4xl font-extrabold mb-4 ${theme.heading}`}>Everything you need to manage your personal finances</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`p-8 rounded-2xl border transition-all group ${theme.card} ${theme.cardHover} hover:shadow-xl hover:shadow-indigo-500/10`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${isDarkMode ? 'bg-blue-900/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                <PieChart size={28} />
              </div>
              <h4 className={`text-xl font-bold mb-3 ${theme.heading}`}>Smart Budgeting</h4>
              <p className={`leading-relaxed ${theme.textMuted}`}>Create custom budgets for different categories. We'll alert you before you overspend.</p>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 rounded-2xl border transition-all group ${theme.card} ${theme.cardHover} hover:shadow-xl hover:shadow-indigo-500/10`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                <Shield size={28} />
              </div>
              <h4 className={`text-xl font-bold mb-3 ${theme.heading}`}>Bank-Grade Security</h4>
              <p className={`leading-relaxed ${theme.textMuted}`}>Your data is encrypted with 256-bit SSL. We never sell your personal information.</p>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 rounded-2xl border transition-all group ${theme.card} ${theme.cardHover} hover:shadow-xl hover:shadow-indigo-500/10`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${isDarkMode ? 'bg-purple-900/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
                <TrendingUp size={28} />
              </div>
              <h4 className={`text-xl font-bold mb-3 ${theme.heading}`}>Growth Analytics</h4>
              <p className={`leading-relaxed ${theme.textMuted}`}>Visualize your net worth over time with beautiful, easy-to-understand charts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-slate-900/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to take control?</h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of users who are saving more and stressing less. Start your journey to financial freedom today.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-2xl"
            >
              Get Started for Free
            </button>
            <p className="mt-6 text-slate-500 text-sm">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className={`border-t transition-colors duration-300 pt-16 pb-8 ${theme.footer}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                {/* Footer Logo using Image */}
                <img 
                  src={logoImg} 
                  alt="FinTrack Logo" 
                  className="h-8 w-auto object-contain" 
                  style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }} 
                />
              </div>
              <p className={`text-sm font-medium ${theme.textMuted}`}>
                Making personal finance simple, secure, and smart for everyone.
              </p>
            </div>
            
            <div>
              <h4 className={`font-bold mb-4 ${theme.heading}`}>Product</h4>
              <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
                <li className="hover:text-indigo-600 cursor-pointer font-medium">Features</li>
                <li className="hover:text-indigo-600 cursor-pointer font-medium">Pricing</li>
                <li className="hover:text-indigo-600 cursor-pointer font-medium">Security</li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-bold mb-4 ${theme.heading}`}>Company</h4>
              <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
                <li className="hover:text-indigo-600 cursor-pointer font-medium">About Us</li>
                <li className="hover:text-indigo-600 cursor-pointer font-medium">Careers</li>
                <li className="hover:text-indigo-600 cursor-pointer font-medium">Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-bold mb-4 ${theme.heading}`}>Legal</h4>
              <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
                <li className="hover:text-indigo-600 cursor-pointer font-medium">Privacy Policy</li>
                <li className="hover:text-indigo-600 cursor-pointer font-medium">Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <p className={`text-sm font-medium ${theme.textMuted}`}>© 2024 FinTrack Inc. All rights reserved.</p>
            <div className="flex gap-6">
               <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors transform hover:-translate-y-1">
                 <Facebook size={20} />
               </a>
               <a href="#" className="text-slate-400 hover:text-sky-500 transition-colors transform hover:-translate-y-1">
                 <Twitter size={20} />
               </a>
               <a href="#" className="text-slate-400 hover:text-pink-600 transition-colors transform hover:-translate-y-1">
                 <Instagram size={20} />
               </a>
               <a href="#" className="text-slate-400 hover:text-blue-700 transition-colors transform hover:-translate-y-1">
                 <Linkedin size={20} />
               </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;