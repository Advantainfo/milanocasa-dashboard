"use client"

import { useActionState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { login, type LoginFormState } from "@/server/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const initialState: LoginFormState = {}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="glow-primary-lg relative z-10 w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="bg-primary text-primary-foreground glow-primary mx-auto mb-2 flex size-10 items-center justify-center rounded-xl text-base font-bold">
            M
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Milano Casa
          </CardTitle>
          <CardDescription>Sign in to manage your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {state?.error && (
              <p className="text-destructive text-sm" role="alert">
                {state.error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
