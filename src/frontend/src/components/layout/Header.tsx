import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  MessageSquare,
  User,
  Search,
  Settings,
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onOpenAssistant: () => void
}

export default function Header({ onOpenAssistant }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(true)
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)

  useEffect(() => {
    // Fetch auth status
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser({ email: data.email, name: data.name })
        }
      })
      .catch(() => {
        // Default for local dev
        setUser({ email: 'user@databricks.com' })
      })
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search suppliers, materials, products..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* AI Assistant Button */}
        <motion.button
          onClick={onOpenAssistant}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-gradient-to-r from-brand-teal to-brand-teal/80",
            "text-white font-medium text-sm",
            "hover:shadow-lg hover:shadow-brand-teal/20 transition-all"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Assistant</span>
        </motion.button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-risk-critical rounded-full" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-accent transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 ml-2 border-l border-border">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-muted-foreground">
              {user?.email || 'Loading...'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}
