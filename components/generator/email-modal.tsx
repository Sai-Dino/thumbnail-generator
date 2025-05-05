"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Check, RefreshCw } from "lucide-react"

type EmailModalProps = {
  open: boolean
  onClose: () => void
  onVerified: () => void
}

export function EmailModal({ open, onClose, onVerified }: EmailModalProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
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

    // Mock email verification
    setTimeout(() => {
      setIsSubmitting(false)
      setIsVerified(true)

      // Mock delay before closing and triggering download
      setTimeout(() => {
        onVerified()
        onClose()

        // Reset state for next time
        setTimeout(() => {
          setIsVerified(false)
          setEmail("")
        }, 500)
      }, 1500)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify your email to download</DialogTitle>
          <DialogDescription>
            Enter your email address to receive your thumbnail. We'll also send you updates about new features.
          </DialogDescription>
        </DialogHeader>

        {!isVerified ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
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
              <div className="text-sm text-gray-500 dark:text-gray-400">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full font-display">
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Email Verified!</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Your download will start automatically in a moment.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
