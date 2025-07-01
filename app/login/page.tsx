"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Rocket, Mail, Lock, AlertCircle, Info, ExternalLink, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDemoSetup, setShowDemoSetup] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const router = useRouter()

  // Get the singleton client instance
  const supabase = createClient()

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router, supabase])

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setError("")
    setDebugInfo("")
    setShowDemoSetup(false)

    try {
      setDebugInfo("🚀 Attempting demo login...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@cosmictasks.app",
        password: "demo123456",
      })

      if (error) {
        console.error("Demo login error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
        })

        if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid")) {
          setShowDemoSetup(true)
          setError("Demo account not found. The user needs to be created in Supabase Auth Dashboard first.")
          setDebugInfo("❌ User does not exist in auth.users table")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Demo account exists but email is not confirmed. Please confirm the email in Supabase Dashboard.")
          setDebugInfo("❌ Email confirmation required")
        } else {
          setError(`Demo login failed: ${error.message}`)
          setDebugInfo(`❌ Error: ${error.message}`)
        }
        return
      }

      if (data.user) {
        setDebugInfo("✅ Login successful! Redirecting...")

        // Force a small delay to ensure auth state is set
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 500)
      } else {
        setError("Login succeeded but no user data returned")
        setDebugInfo("⚠️ No user object in response")
      }
    } catch (error: any) {
      console.error("Demo login catch error:", error)
      setError("Demo account unavailable. Please try again later.")
      setDebugInfo(`❌ Catch error: ${error.message}`)
    } finally {
      setDemoLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setShowDemoSetup(false)
    setDebugInfo("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Force redirect with window.location for more reliable navigation
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Test connection function
  const testConnection = async () => {
    setDebugInfo("🔍 Testing connection...")
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        setDebugInfo(`❌ Connection test failed: ${error.message}`)
      } else {
        setDebugInfo("✅ Supabase connection working")
      }
    } catch (error: any) {
      setDebugInfo(`❌ Connection error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-space-black-lighter">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Rocket className="h-12 w-12 text-space-purple animate-float" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-space-purple to-space-blue bg-clip-text text-transparent">
            Welcome Back, Astronaut
          </CardTitle>
          <CardDescription>Sign in to continue your cosmic productivity journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && !showDemoSetup && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-space-blue">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="astronaut@cosmic.space"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 border-space-black-lighter focus:border-space-purple"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-space-blue">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50 border-space-black-lighter focus:border-space-purple"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-space-purple to-space-blue hover:from-space-purple-light hover:to-space-blue-light"
              disabled={loading || demoLoading}
            >
              {loading ? "🚀 Launching..." : "Launch Mission"}
            </Button>
          </form>

          {/* Demo Account Section */}
          <div className="mt-4 p-3 rounded-lg bg-space-black-lighter/50 border border-space-purple/30">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Want to explore without signing up?</p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-space-purple/50 text-space-purple hover:bg-space-purple/10 bg-transparent text-xs"
                  onClick={handleDemoLogin}
                  disabled={loading || demoLoading}
                >
                  {demoLoading ? "🚀 Loading Demo..." : "🚀 Try Demo Account"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-space-blue/50 text-space-blue hover:bg-space-blue/10 bg-transparent text-xs"
                  onClick={testConnection}
                  disabled={loading || demoLoading}
                >
                  🔍 Test Connection
                </Button>
              </div>

              {debugInfo && (
                <div className="text-xs text-muted-foreground bg-space-black-lighter/50 p-2 rounded border">
                  {debugInfo}
                </div>
              )}
            </div>
          </div>

          {/* Demo Setup Instructions - Only show when demo fails */}
          {showDemoSetup && (
            <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <div className="space-y-3">
                    <p className="font-medium text-amber-300">Demo Account Setup Required</p>

                    <div className="space-y-2">
                      <p className="text-amber-200 text-sm font-medium">Step 1: Create Auth User</p>
                      <ol className="list-decimal list-inside space-y-1 text-amber-200 text-xs ml-2">
                        <li>Go to your Supabase Dashboard</li>
                        <li>Navigate to Authentication → Users</li>
                        <li>Click "Add User"</li>
                        <li>
                          Email: <code className="bg-amber-900/30 px-1 rounded">demo@cosmictasks.app</code>
                        </li>
                        <li>
                          Password: <code className="bg-amber-900/30 px-1 rounded">demo123456</code>
                        </li>
                        <li>✅ Check "Auto Confirm User"</li>
                        <li>Click "Create User"</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <p className="text-amber-200 text-sm font-medium">Step 2: Add Demo Data</p>
                      <p className="text-amber-200 text-xs ml-2">
                        Run the SQL script:{" "}
                        <code className="bg-amber-900/30 px-1 rounded">create-demo-user-simple.sql</code>
                      </p>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-amber-500/50 text-amber-300 hover:bg-amber-500/10 bg-transparent"
                        onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Supabase
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-green-500/50 text-green-300 hover:bg-green-500/10 bg-transparent"
                        onClick={handleDemoLogin}
                        disabled={demoLoading}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Retry Demo
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">New to the cosmos? </span>
            <Link href="/signup" className="text-space-purple hover:text-space-purple-light font-medium">
              Create Account
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-space-blue">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
