"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, RefreshCw } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    // Mock email magic link
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 2000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Log in to your account</CardTitle>
        <CardDescription>Enter your email to receive a magic link for passwordless login.</CardDescription>
      </CardHeader>
      <CardContent>
        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-4 w-full font-display">
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Mail className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Check your inbox</h3>
            <p className="text-gray-500 dark:text-gray-400">
              We've sent a magic link to <strong>{email}</strong>. Click the link in the email to log in.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don't have an account? It will be created automatically.
        </p>
      </CardFooter>
    </Card>
  )
}
