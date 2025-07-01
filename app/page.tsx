import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Target, BookOpen, BarChart3, Zap, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-space-black-lighter bg-space-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Rocket className="h-8 w-8 text-space-purple animate-float" />
            <span className="text-2xl font-bold bg-gradient-to-r from-space-purple to-space-blue bg-clip-text text-transparent">
              Cosmic Tasks
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-space-blue hover:text-space-purple">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-space-purple to-space-blue hover:from-space-purple-light hover:to-space-blue-light">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-space-purple via-space-blue to-space-purple-light bg-clip-text text-transparent animate-pulse-glow">
              Launch Your Productivity Into Orbit
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              A space-themed personal task tracker that helps you focus on what matters most. Set daily focuses, track
              progress, and reflect on your cosmic journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-space-purple to-space-blue hover:from-space-purple-light hover:to-space-blue-light text-lg px-8 py-6"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Your Mission
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-space-purple text-space-purple hover:bg-space-purple hover:text-white text-lg px-8 py-6 bg-transparent"
                >
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-space-blue to-space-purple bg-clip-text text-transparent">
            Mission Control Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter hover:border-space-purple transition-colors">
              <CardHeader>
                <Target className="h-12 w-12 text-space-purple mb-4 animate-float" />
                <CardTitle className="text-space-blue">Daily Focus</CardTitle>
                <CardDescription>
                  Set one primary focus each day and track your progress toward achieving it.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter hover:border-space-blue transition-colors">
              <CardHeader>
                <Zap className="h-12 w-12 text-space-blue mb-4 animate-float" />
                <CardTitle className="text-space-purple">Task Management</CardTitle>
                <CardDescription>
                  Organize your tasks with categories, priorities, and due dates in a cosmic interface.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter hover:border-space-green transition-colors">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-space-green mb-4 animate-float" />
                <CardTitle className="text-space-green">Daily Reflection</CardTitle>
                <CardDescription>
                  End each day with reflection on accomplishments, learnings, and improvements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter hover:border-space-gold transition-colors">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-space-gold mb-4 animate-float" />
                <CardTitle className="text-space-gold">Progress Analytics</CardTitle>
                <CardDescription>
                  Visualize your productivity patterns and track your cosmic journey over time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter hover:border-space-purple-light transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-space-purple-light mb-4 animate-float" />
                <CardTitle className="text-space-purple-light">Secure & Private</CardTitle>
                <CardDescription>
                  Your personal data is protected with enterprise-grade security and encryption.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter hover:border-space-blue-light transition-colors">
              <CardHeader>
                <Rocket className="h-12 w-12 text-space-blue-light mb-4 animate-float" />
                <CardTitle className="text-space-blue-light">Space Theme</CardTitle>
                <CardDescription>
                  Beautiful cosmic design that makes productivity feel like an adventure.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-space-purple/20 to-space-blue/20 border-space-purple">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4 text-space-purple">Ready to Launch?</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Join the cosmic productivity revolution and transform how you manage your daily tasks and goals.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-space-purple to-space-blue hover:from-space-purple-light hover:to-space-blue-light text-lg px-8 py-6"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Begin Your Journey
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-space-black-lighter bg-space-black/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Cosmic Tasks. Launching productivity into the stratosphere.</p>
        </div>
      </footer>
    </div>
  )
}
