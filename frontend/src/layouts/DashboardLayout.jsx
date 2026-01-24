import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart, 
  Settings, 
  HelpCircle, 
  Menu, 
  X, 
  Bell, 
  Search, 
  Sun,
  Moon,
  LogOut,
  List,
  Wallet,
  Sparkles,
  Users // Admin icon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Base flag to check if the current layout is being used for the /admin/* routes
  const isViewingAdminSection = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const theme = {
    // ... (theme definitions)
    bg: isDarkMode ? "bg-[#0f172a]" : "bg-[#f8fafc]",
    sidebar: isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    text: isDarkMode ? "text-slate-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    hover: isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50",
    active: isDarkMode 
      ? "bg-indigo-900/30 text-indigo-400 border-r-2 border-indigo-400" 
      : "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600",
  };
  
  const isSuperuser = user?.is_superuser;

  // --- DYNAMIC NAVIGATION ITEMS (FIXED LOGIC) ---
  const navItems = useMemo(() => {
    const userFinancialLinks = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: PieChart, label: 'Statistics', path: '/dashboard/stats' },
      { icon: List, label: 'Transactions', path: '/dashboard/transactions' },
      { icon: Wallet, label: 'Budget', path: '/dashboard/budget' },
      { icon: Sparkles, label: 'AI Advisor', path: '/dashboard/advisor' },
      { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];
    
    const adminManagementLinks = [
      { icon: Users, label: 'User Management', path: '/admin' }, // User List is the Admin root
      // Admin should still see their own settings, but not the full financial dashboard
      // { icon: Settings, label: 'Admin Settings', path: '/dashboard/settings' }, 
    ];
    
    // If the user is currently in the Admin section, show only Admin links.
    if (isSuperuser && isViewingAdminSection) {
      return adminManagementLinks;
    }
    
    // Default: Show the standard user links.
    return userFinancialLinks;

  }, [isSuperuser, isViewingAdminSection]); 

  // Helper to determine the current link's active state
  const isCurrentPathActive = (path) => {
    // Handle the complex Admin path matching (base /admin or nested /admin/user/:id)
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname.startsWith('/admin/user/');
    }
    // Handle the general dashboard links
    return location.pathname.startsWith(path);
  };
  
  // Helper to get the clean header title
  const getHeaderTitle = () => {
    if (location.pathname === '/admin') return 'Admin Panel';
    if (location.pathname.startsWith('/admin/user/')) return 'User Detail';
    
    const pathSegment = location.pathname.split('/').pop();
    if (!pathSegment || pathSegment === 'dashboard') return 'Dashboard';
    
    return pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);
  };


  const getProfileImage = () => {
    if (user?.profile_picture) {
      return `http://127.0.0.1:8000${user.profile_picture}`;
    }
    if (user?.avatar?.startsWith('data:image')) {
        return user.avatar;
    }
    const name = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username;
    return `https://i.pravatar.cc/150?u=${name || 'user'}`;
  };

  return (
    <div className={`min-h-screen flex ${theme.bg} ${theme.text} font-sans transition-colors duration-300`}>
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 
        border-r transition-transform duration-300 ease-in-out
        flex flex-col
        ${theme.sidebar}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-transparent cursor-pointer" onClick={() => navigate('/')}>
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md mr-3">F</div>
           <span className="text-xl font-bold tracking-tight">Finotic</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                isCurrentPathActive(item.path)
                  ? theme.active 
                  : `${theme.textMuted} ${theme.hover}`
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer (Support & Logout) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
           {/* Only show Support if it's the standard user view */}
           {!isViewingAdminSection && (
             <button 
               onClick={() => {
                 navigate('/dashboard/support');
                 setIsSidebarOpen(false);
               }}
               className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                 location.pathname === '/dashboard/support' 
                   ? theme.active 
                   : `${theme.textMuted} ${theme.hover}`
               }`}
             >
               <HelpCircle size={18} /> Support
             </button>
           )}
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
           >
             <LogOut size={18} /> Log Out
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header (STICKY) */}
        <header className={`h-20 flex items-center justify-between px-4 lg:px-8 border-b sticky top-0 z-30 backdrop-blur-sm bg-opacity-95 ${theme.sidebar}`}>
           <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                 <Menu size={24} />
              </button>
              
              {/* Page Title */}
              <h2 className="text-xl font-bold hidden sm:block">
                {getHeaderTitle()}
              </h2>
           </div>

           <div className="flex items-center gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className={`hidden sm:flex items-center px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                 <Search size={16} className="text-slate-400 mr-2" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="bg-transparent border-none outline-none text-sm w-32 lg:w-48 placeholder-slate-400" 
                 />
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className={`p-2 rounded-full border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                 {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

              {/* Profile Section */}
              <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold leading-none">{user?.first_name || user?.username || 'User'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.is_superuser ? 'Admin' : 'Free Plan'}</p>
                 </div>
                 {/* Updated Image Source Logic */}
                 <img 
                   src={getProfileImage()} 
                   alt="Profile" 
                   className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 shadow-sm" 
                 />
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
           <Outlet /> 
        </div>

      </main>
    </div>
  );
};

export default DashboardLayout;