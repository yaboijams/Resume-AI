import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { 
  Brain, 
  Search, 
  Wand2, 
  FileText, 
  ClipboardList, 
  Users,
  Star,
  Rocket,
  CheckCircle,
  ArrowRight,
  Upload,
  BarChart3
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Search,
      title: "ATS Match Scoring",
      description: "Get instant compatibility scores between your resume and job descriptions with keyword analysis.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Wand2,
      title: "AI Resume Tailoring", 
      description: "Automatically customize your resume for each job using GPT-4 powered optimization.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: FileText,
      title: "Smart Cover Letters",
      description: "Generate personalized cover letters with adjustable tone and company-specific content.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: ClipboardList,
      title: "Application Tracker",
      description: "Never lose track of applications with status monitoring and follow-up reminders.",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Universal Field Support",
      description: "Works for any industry with AI that adapts to field-specific requirements.",
      gradient: "from-pink-500 to-pink-600"
    },
    {
      icon: Star,
      title: "Beginner-Friendly",
      description: "Guided onboarding helps you get started whether you're new to job hunting or experienced.",
      gradient: "from-indigo-500 to-indigo-600"
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: "Upload & Analyze",
      description: "Upload your resume and paste job descriptions for instant AI analysis."
    },
    {
      icon: Wand2,
      title: "AI Optimization", 
      description: "Let our GPT-4 system tailor your resume and generate compelling cover letters."
    },
    {
      icon: Rocket,
      title: "Apply & Track",
      description: "Submit optimized applications and track progress with our comprehensive dashboard."
    }
  ];

  const stats = [
    { label: "Resumes Optimized", value: "50K+" },
    { label: "Success Rate", value: "89%" },
    { label: "User Rating", value: "4.9★" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <Brain className="h-4 w-4 mr-2" />
                AI-Powered Job Application Assistant
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Land Your Dream Job with{" "}
                <span className="text-gradient">AI Precision</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Transform your job search with our premium AI assistant. Get ATS-optimized resumes, 
                personalized cover letters, and intelligent application tracking—all powered by GPT-4.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="btn-primary" onClick={() => window.location.href = "/api/login"}>
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline">
                  <FileText className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative">
              <Card className="shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Resume Analysis</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Live</span>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-purple-200 dark:border-purple-700 rounded-xl p-6 mb-6 bg-purple-50/50 dark:bg-purple-900/20">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Drop your resume here or</p>
                      <Button variant="link" className="text-purple-600 dark:text-purple-400 p-0">browse files</Button>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm opacity-90">ATS Match Score</p>
                        <p className="text-2xl font-bold">87%</p>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <BarChart3 className="h-8 w-8" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start">
                      <Wand2 className="h-4 w-4 mr-2 text-purple-500" />
                      Tailor Resume
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      Cover Letter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Get Hired</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with proven job search strategies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover group">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Simple 3-Step <span className="text-gradient">Workflow</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From upload to hired in three easy steps. Our streamlined process gets you results faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center group relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{index + 1}. {step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-purple-400 transform translate-x-4">
                    <div className="absolute right-0 top-1/2 transform translate-y--1/2 translate-x-2">
                      <ArrowRight className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" className="btn-primary" onClick={() => window.location.href = "/api/login"}>
              <Rocket className="h-5 w-5 mr-2" />
              Start Your Job Search Journey
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful job seekers who have landed their dream roles with JobCraft AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => window.location.href = "/api/login"}>
              <CheckCircle className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">JobCraft AI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering job seekers with AI-powered tools to land their dream careers. 
                Built by developers who understand the job search struggle.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 JobCraft AI. All rights reserved. Made with ❤️ for job seekers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
