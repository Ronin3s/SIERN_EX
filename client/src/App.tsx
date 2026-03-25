import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout"
import { BlankPage } from "./pages/BlankPage"
import { Dashboard } from "./pages/Dashboard"
import { ProcessMonitor } from "./pages/ProcessMonitor"
import { IntegrityScanner } from "./pages/IntegrityScanner"
import { IOCHunt } from "./pages/IOCHunt"
import { BehavioralDetection } from "./pages/BehavioralDetection"
import { ResponseCenter } from "./pages/ResponseCenter"
import { NodeManager } from "./pages/NodeManager"
import { PersistenceMonitor } from "./pages/PersistenceMonitor"
import { Settings } from "./pages/Settings"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="processes" element={<ProcessMonitor />} />
              <Route path="scanner" element={<IntegrityScanner />} />
              <Route path="ioc-hunt" element={<IOCHunt />} />
              <Route path="behavioral" element={<BehavioralDetection />} />
              <Route path="response" element={<ResponseCenter />} />
              <Route path="nodes" element={<NodeManager />} />
              <Route path="nodes/:nodeId/persistence" element={<PersistenceMonitor />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<BlankPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App