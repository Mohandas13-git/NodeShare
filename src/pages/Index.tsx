import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Code2, Lock, Share2, Zap } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">NodeShare</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline" size="lg">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
          <div className="inline-block animate-scale-in">
            <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary-glow mb-6">
              ✨ Share code snippets instantly
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Your Code,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Beautifully Shared
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, store, and share your code snippets with syntax highlighting. 
            Perfect for developers who love clean, organized code.
          </p>
          
          <div className="flex gap-4 justify-center pt-6">
            <Button onClick={() => navigate("/auth")} size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
              Get Started Free
            </Button>
            <Button onClick={() => navigate("/explore")} variant="outline" size="lg">
              Explore Notes
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[{
          icon: Code2,
          title: "Syntax Highlighting",
          description: "Beautiful code rendering with support for multiple languages"
        }, {
          icon: Share2,
          title: "Easy Sharing",
          description: "Share your code snippets publicly or keep them private"
        }, {
          icon: Lock,
          title: "Secure Storage",
          description: "Your code is safely stored and always accessible"
        }, {
          icon: Zap,
          title: "Lightning Fast",
          description: "Create and access your snippets in seconds"
        }].map((feature, i) => <div key={i} className="bg-card border border-border rounded-lg p-6 hover:shadow-card transition-shadow animate-fade-in" style={{
          animationDelay: `${i * 100}ms`
        }}>
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>)}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code2 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  NodeShare

                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Share your code beautifully. Built for developers who care about their craft.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/explore")} className="hover:text-primary transition-colors">Explore</button></li>
                <li><button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors">Sign Up</button></li>
                <li><button onClick={() => navigate("/dashboard")} className="hover:text-primary transition-colors">Dashboard</button></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 CodeShare. Built for developers, by developers.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Code2 className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Zap className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;