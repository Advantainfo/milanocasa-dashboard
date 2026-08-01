"use client"

import { useActionState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { login, type LoginFormState } from "@/server/actions/auth"
import { LogoMark } from "@/components/brand/logo-mark"
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
import { useDictionary } from "@/lib/i18n/dictionary-provider"

const initialState: LoginFormState = {}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const dict = useDictionary()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="glow-primary-lg relative z-10 w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="bg-primary/10 ring-primary/40 glow-primary text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-xl ring-1">
            <LogoMark className="size-7" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Milano Casa
          </CardTitle>
          <CardDescription>{dict.auth.signInTagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{dict.auth.email}</Label>
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
              <Label htmlFor="password">{dict.auth.password}</Label>
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
              {isPending ? <Loader2 className="size-4 animate-spin" /> : dict.auth.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
