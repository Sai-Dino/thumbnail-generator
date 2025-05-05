import { Header } from "@/components/header"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <LoginForm />
      </div>
    </main>
  )
}
