import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Briefcase, FileEdit, FileText, BarChart3, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Briefcase },
    { path: "/editor", label: "Editor", icon: FileEdit },
    { path: "/cover-letter", label: "Cover Letter", icon: FileText },
    { path: "/tracker", label: "Tracker", icon: BarChart3 },
  ];

  // Hard-coded purple color values - ABSOLUTELY NO YELLOW ALLOWED
  const PURPLE_COLORS = {
    primary: '#7C3AED',
    secondary: '#A855F7', 
    white: '#FFFFFF',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray600: '#4B5563',
    gray700: '#374151',
    gray900: '#111827'
  } as const;

  // Force remove any yellow from navigation on mount and updates
  useEffect(() => {
    const forceRemoveYellow = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        // Force all elements in nav to use our colors
        const allNavElements = nav.querySelectorAll('*');
        allNavElements.forEach((el) => {
          const element = el as HTMLElement;
          // Override any yellow colors aggressively
          if (element.style.color?.includes('yellow') || element.style.color?.includes('#ffff00')) {
            element.style.color = PURPLE_COLORS.primary;
          }
          if (element.style.backgroundColor?.includes('yellow') || element.style.backgroundColor?.includes('#ffff00')) {
            element.style.backgroundColor = 'transparent';
          }
        });
      }
    };

    forceRemoveYellow();
    // Run every 100ms to catch any dynamic changes
    const interval = setInterval(forceRemoveYellow, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.querySelector('nav');
      if (nav && !nav.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Navigation Responsive CSS */}
      <style>{`
        .desktop-nav {
          display: flex !important;
        }
        .mobile-menu-toggle {
          display: none !important;
        }
        .mobile-menu {
          display: none !important;
        }
        
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
        
        .desktop-sign-in {
          display: none !important;
        }
        
        @media (min-width: 640px) {
          .desktop-sign-in {
            display: flex !important;
          }
        }
      `}</style>
      
      <nav 
        style={{ 
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${PURPLE_COLORS.gray200}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          width: '100%'
        }}
      >
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '0 1rem',
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
                 {/* Logo */}
         <Link href="/">
           <a 
             href="/"
             style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: '0.75rem',
               textDecoration: 'none',
               cursor: 'pointer'
             }}
           >
             <div style={{
               width: '2.5rem',
               height: '2.5rem',
               background: `linear-gradient(135deg, ${PURPLE_COLORS.primary}, ${PURPLE_COLORS.secondary})`,
               borderRadius: '0.75rem',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               boxShadow: `0 2px 8px rgba(124, 58, 237, 0.3)`
             }}>
               <Briefcase 
                 size={20} 
                 style={{ 
                   color: PURPLE_COLORS.white,
                   fill: 'none',
                   stroke: PURPLE_COLORS.white,
                   strokeWidth: 2
                 }}
               />
             </div>
             <span style={{ 
               fontSize: '1.25rem', 
               fontWeight: '700', 
               color: PURPLE_COLORS.gray900,
               fontFamily: 'Inter, system-ui, sans-serif',
               letterSpacing: '-0.025em'
             }}>
               JobCraft AI
             </span>
           </a>
         </Link>

                 {/* Desktop Navigation */}
         <div 
           className="desktop-nav"
           style={{ 
             alignItems: 'center',
             gap: '0.5rem'
           }}>
           {navItems.map(({ path, label, icon: Icon }) => (
             <Link key={path} href={path}>
               <a
                 href={path}
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem',
                   padding: '0.5rem 0.75rem',
                   borderRadius: '0.5rem',
                   fontSize: '0.875rem',
                   fontWeight: '500',
                   color: location === path ? PURPLE_COLORS.primary : PURPLE_COLORS.gray600,
                   backgroundColor: location === path ? `${PURPLE_COLORS.primary}15` : 'transparent',
                   border: 'none',
                   cursor: 'pointer',
                   transition: 'all 0.15s ease-in-out',
                   textDecoration: 'none',
                   fontFamily: 'Inter, system-ui, sans-serif'
                 }}
                 onMouseEnter={(e) => {
                   if (location !== path) {
                     e.currentTarget.style.color = PURPLE_COLORS.gray900;
                     e.currentTarget.style.backgroundColor = PURPLE_COLORS.gray100;
                   }
                 }}
                 onMouseLeave={(e) => {
                   if (location !== path) {
                     e.currentTarget.style.color = PURPLE_COLORS.gray600;
                     e.currentTarget.style.backgroundColor = 'transparent';
                   }
                 }}
               >
                 <Icon 
                   size={16} 
                   style={{ 
                     color: location === path ? PURPLE_COLORS.primary : PURPLE_COLORS.gray600,
                     fill: 'none',
                     stroke: 'currentColor',
                     strokeWidth: 2
                   }}
                 />
                 <span style={{ color: 'inherit' }}>{label}</span>
               </a>
             </Link>
           ))}
         </div>

                 {/* Action Buttons */}
         <div style={{ 
           display: 'flex', 
           alignItems: 'center', 
           gap: '0.75rem' 
         }}>
           {/* Theme Toggle */}
           <button
             onClick={toggleTheme}
             style={{
               width: '2.5rem',
               height: '2.5rem',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               backgroundColor: 'transparent',
               border: 'none',
               borderRadius: '0.5rem',
               cursor: 'pointer',
               color: PURPLE_COLORS.gray600,
               transition: 'all 0.15s ease-in-out'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.backgroundColor = PURPLE_COLORS.gray100;
               e.currentTarget.style.color = PURPLE_COLORS.gray900;
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.backgroundColor = 'transparent';
               e.currentTarget.style.color = PURPLE_COLORS.gray600;
             }}
           >
             {theme === "light" ? 
               <Moon 
                 size={16} 
                 style={{ 
                   color: 'inherit',
                   fill: 'none',
                   stroke: 'currentColor',
                   strokeWidth: 2
                 }} 
               /> : 
               <Sun 
                 size={16} 
                 style={{ 
                   color: 'inherit',
                   fill: 'none',
                   stroke: 'currentColor',
                   strokeWidth: 2
                 }} 
               />
             }
           </button>

           {/* Mobile Menu Toggle */}
           <button
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="mobile-menu-toggle"
             style={{
               width: '2.5rem',
               height: '2.5rem',
               alignItems: 'center',
               justifyContent: 'center',
               backgroundColor: 'transparent',
               border: 'none',
               borderRadius: '0.5rem',
               cursor: 'pointer',
               color: PURPLE_COLORS.gray600,
               transition: 'all 0.15s ease-in-out'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.backgroundColor = PURPLE_COLORS.gray100;
               e.currentTarget.style.color = PURPLE_COLORS.gray900;
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.backgroundColor = 'transparent';
               e.currentTarget.style.color = PURPLE_COLORS.gray600;
             }}
           >
             {isMobileMenuOpen ? 
               <X 
                 size={20} 
                 style={{ 
                   color: 'inherit',
                   fill: 'none',
                   stroke: 'currentColor',
                   strokeWidth: 2
                 }} 
               /> : 
               <Menu 
                 size={20} 
                 style={{ 
                   color: 'inherit',
                   fill: 'none',
                   stroke: 'currentColor',
                   strokeWidth: 2
                 }} 
               />
             }
           </button>

                     {/* Sign In Button */}
           <button
             className="desktop-sign-in"
             style={{
               alignItems: 'center',
               padding: '0.5rem 1rem',
               fontSize: '0.875rem',
               fontWeight: '500',
               color: PURPLE_COLORS.gray700,
               backgroundColor: 'transparent',
               border: `1px solid ${PURPLE_COLORS.gray300}`,
               borderRadius: '0.5rem',
               cursor: 'pointer',
               transition: 'all 0.15s ease-in-out',
               fontFamily: 'Inter, system-ui, sans-serif'
             }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = PURPLE_COLORS.gray100;
              e.currentTarget.style.borderColor = PURPLE_COLORS.gray400;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = PURPLE_COLORS.gray300;
            }}
          >
            Sign In
          </button>

          {/* Get Started Button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: PURPLE_COLORS.white,
              background: `linear-gradient(135deg, ${PURPLE_COLORS.primary}, ${PURPLE_COLORS.secondary})`,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
              boxShadow: `0 2px 8px rgba(124, 58, 237, 0.25)`,
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
              e.currentTarget.style.boxShadow = `0 4px 12px rgba(124, 58, 237, 0.35)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = `0 2px 8px rgba(124, 58, 237, 0.25)`;
            }}
          >
            Get Started
          </button>
                 </div>
       </div>

                {/* Mobile Menu */}
         {isMobileMenuOpen && (
           <div 
             style={{
               position: 'absolute',
               top: '100%',
               left: 0,
               right: 0,
               backgroundColor: 'rgba(255, 255, 255, 0.98)',
               backdropFilter: 'blur(12px)',
               WebkitBackdropFilter: 'blur(12px)',
               borderBottom: `1px solid ${PURPLE_COLORS.gray200}`,
               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
               zIndex: 999
             }}
         >
           <div style={{ padding: '1rem' }}>
             {navItems.map(({ path, label, icon: Icon }) => (
               <Link key={path} href={path}>
                 <a
                   href={path}
                   onClick={() => setIsMobileMenuOpen(false)}
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.75rem',
                     padding: '0.75rem',
                     borderRadius: '0.5rem',
                     fontSize: '1rem',
                     fontWeight: '500',
                     color: location === path ? PURPLE_COLORS.primary : PURPLE_COLORS.gray700,
                     backgroundColor: location === path ? `${PURPLE_COLORS.primary}15` : 'transparent',
                     textDecoration: 'none',
                     fontFamily: 'Inter, system-ui, sans-serif',
                     margin: '0.25rem 0',
                     transition: 'all 0.15s ease-in-out'
                   }}
                   onMouseEnter={(e) => {
                     if (location !== path) {
                       e.currentTarget.style.backgroundColor = PURPLE_COLORS.gray100;
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (location !== path) {
                       e.currentTarget.style.backgroundColor = 'transparent';
                     }
                   }}
                 >
                   <Icon 
                     size={20} 
                     style={{ 
                       color: location === path ? PURPLE_COLORS.primary : PURPLE_COLORS.gray600,
                       fill: 'none',
                       stroke: 'currentColor',
                       strokeWidth: 2
                     }}
                   />
                   <span>{label}</span>
                 </a>
               </Link>
             ))}
             
             {/* Mobile Action Buttons */}
             <div style={{ 
               borderTop: `1px solid ${PURPLE_COLORS.gray200}`,
               marginTop: '1rem',
               paddingTop: '1rem',
               display: 'flex',
               gap: '0.5rem'
             }}>
               <button
                 style={{
                   flex: 1,
                   padding: '0.75rem 1rem',
                   fontSize: '0.875rem',
                   fontWeight: '500',
                   color: PURPLE_COLORS.gray700,
                   backgroundColor: 'transparent',
                   border: `1px solid ${PURPLE_COLORS.gray300}`,
                   borderRadius: '0.5rem',
                   cursor: 'pointer',
                   transition: 'all 0.15s ease-in-out',
                   fontFamily: 'Inter, system-ui, sans-serif'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = PURPLE_COLORS.gray100;
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = 'transparent';
                 }}
               >
                 Sign In
               </button>
               
               <button
                 style={{
                   flex: 1,
                   padding: '0.75rem 1rem',
                   fontSize: '0.875rem',
                   fontWeight: '600',
                   color: PURPLE_COLORS.white,
                   background: `linear-gradient(135deg, ${PURPLE_COLORS.primary}, ${PURPLE_COLORS.secondary})`,
                   border: 'none',
                   borderRadius: '0.5rem',
                   cursor: 'pointer',
                   transition: 'all 0.15s ease-in-out',
                   boxShadow: `0 2px 8px rgba(124, 58, 237, 0.25)`,
                   fontFamily: 'Inter, system-ui, sans-serif'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateY(-1px)';
                   e.currentTarget.style.boxShadow = `0 4px 12px rgba(124, 58, 237, 0.35)`;
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)';
                   e.currentTarget.style.boxShadow = `0 2px 8px rgba(124, 58, 237, 0.25)`;
                 }}
               >
                 Get Started
               </button>
             </div>
           </div>
                    </div>
         )}
      </nav>
    </>
  );
}
