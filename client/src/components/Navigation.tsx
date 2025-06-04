import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Briefcase, FileEdit, FileText, BarChart3 } from "lucide-react";

export default function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Briefcase },
    { path: "/editor", label: "Editor", icon: FileEdit },
    { path: "/cover-letter", label: "Cover Letter", icon: FileText },
    { path: "/tracker", label: "Tracker", icon: BarChart3 },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Briefcase className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-foreground">JobCraft AI</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <button
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    location === path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <Button variant="outline" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button className="gradient-primary text-white border-0">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
