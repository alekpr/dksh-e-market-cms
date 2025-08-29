import { LoginForm } from "@/components/login-form"
import { TestLoginPanel } from "@/components/test-login-panel"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <LoginForm />
        <TestLoginPanel />
      </div>
    </div>
  )
}
