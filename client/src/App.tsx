import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Auth from "@/components/Auth";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
import CoverLetter from "@/pages/CoverLetter";
import Tracker from "@/pages/Tracker";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/editor" component={Editor} />
        <Route path="/cover-letter" component={CoverLetter} />
        <Route path="/tracker" component={Tracker} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  // Aggressive yellow color elimination - monitors DOM for any yellow colors
  useEffect(() => {
    const removeYellowColors = () => {
      const yellowPatterns = [
        '#ffff00', '#FFFF00', 'yellow', 'rgb(255,255,0)', 'rgb(255, 255, 0)',
        'hsl(60,100%,50%)', 'hsl(60, 100%, 50%)'
      ];
      
      const purpleReplacement = 'rgb(124, 58, 237)';
      
      // PRIORITY: Check navigation/header elements first
      const navElements = document.querySelectorAll('nav *, header *');
      navElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const computed = window.getComputedStyle(element);
        
        // Force override any yellow in navigation
        if (yellowPatterns.some(pattern => 
          computed.color?.includes(pattern) || 
          computed.backgroundColor?.includes(pattern) ||
          computed.borderColor?.includes(pattern) ||
          htmlElement.style.color?.includes(pattern) ||
          htmlElement.style.backgroundColor?.includes(pattern)
        )) {
          htmlElement.style.color = purpleReplacement + ' !important';
          htmlElement.style.backgroundColor = 'transparent !important';
          htmlElement.style.borderColor = purpleReplacement + ' !important';
        }
      });
      
      // Check all elements for yellow styles
      document.querySelectorAll('*').forEach((element) => {
        const computed = window.getComputedStyle(element);
        const htmlElement = element as HTMLElement;
        
        // Check computed styles
        if (yellowPatterns.some(pattern => 
          computed.color?.includes(pattern) || 
          computed.backgroundColor?.includes(pattern) ||
          computed.borderColor?.includes(pattern)
        )) {
          htmlElement.style.color = purpleReplacement;
          htmlElement.style.backgroundColor = 'transparent';
          htmlElement.style.borderColor = purpleReplacement;
        }
        
        // Check inline styles
        const style = htmlElement.style;
        if (style.color && yellowPatterns.some(p => style.color.includes(p))) {
          style.color = purpleReplacement;
        }
        if (style.backgroundColor && yellowPatterns.some(p => style.backgroundColor.includes(p))) {
          style.backgroundColor = 'transparent';
        }
        if (style.borderColor && yellowPatterns.some(p => style.borderColor.includes(p))) {
          style.borderColor = purpleReplacement;
        }
        
        // Check SVG elements
        if (element.tagName === 'path' || element.tagName === 'circle' || element.tagName === 'rect') {
          const fill = element.getAttribute('fill');
          const stroke = element.getAttribute('stroke');
          
          if (fill && yellowPatterns.some(p => fill.includes(p))) {
            element.setAttribute('fill', purpleReplacement);
          }
          if (stroke && yellowPatterns.some(p => stroke.includes(p))) {
            element.setAttribute('stroke', purpleReplacement);
          }
        }
      });
    };
    
    // Run immediately
    removeYellowColors();
    
    // Run every 500ms to catch dynamically added elements
    const interval = setInterval(removeYellowColors, 500);
    
    // Also run on DOM mutations
    const observer = new MutationObserver(removeYellowColors);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'fill', 'stroke']
    });
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
