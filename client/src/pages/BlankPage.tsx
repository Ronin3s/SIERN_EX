import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export function BlankPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="text-muted-foreground text-lg">The page you're looking for doesn't exist.</p>
        </div>
        <Button onClick={() => navigate("/")} className="gap-2 gradient-button">
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}