import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState("")
  const { login, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page user was trying to access before login
  const from = (location.state as any)?.from?.pathname || "/"

  // Clear errors when component mounts or when inputs change
  useEffect(() => {
    clearError()
    setLocalError("")
  }, [email, password, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!email || !password) {
      setLocalError("Please fill in all fields")
      return
    }

    const success = await login(email, password)
    if (success) {
      navigate(from, { replace: true })
    }
    // Error will be handled by AuthContext and displayed via the error state
  }

  // Handle demo credential clicks
  const fillCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setLocalError("")
    clearError()
  }

  const displayError = localError || error

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {displayError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {displayError}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <Button variant="outline" className="w-full" disabled={isLoading}>
                  Login with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
          
          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Demo Credentials:</h4>
            <div className="text-xs space-y-1">
              <div 
                className="cursor-pointer hover:bg-muted-foreground/10 p-1 rounded transition-colors"
                onClick={() => fillCredentials('store.admin@dksh.com', 'admin123')}
              >
                <strong>Admin:</strong> store.admin@dksh.com / admin123
              </div>
              <div 
                className="cursor-pointer hover:bg-muted-foreground/10 p-1 rounded transition-colors"
                onClick={() => fillCredentials('test.admin@dksh.com', 'password123')}
              >
                <strong>User:</strong> test.admin@dksh.com / password123
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click on any credential to auto-fill the form
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
