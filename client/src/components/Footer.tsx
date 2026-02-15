import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-gradient-to-r from-white/40 to-white/20 dark:from-slate-900/40 dark:to-slate-900/20 backdrop-blur-md border-t border-white/10 dark:border-slate-700/50">
      <div className="container flex h-14 items-center justify-between px-6">
        <p className="text-sm text-muted-foreground">
          SIREN © 2024 - Enterprise Security Operations Platform
        </p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Built with <Heart className="h-4 w-4 text-red-500" /> by Security Team
        </p>
      </div>
    </footer>
  )
}