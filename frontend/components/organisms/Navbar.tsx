'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/auth'
import { AuthService } from '@/services/auth.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GITHUB_OAUTH_URL } from '@/lib/constants'

export function Navbar() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, logout } = useAuth()
  const { accessToken, refreshToken } = useAuthStore()

  const handleLogout = async () => {
    if (refreshToken) {
      try { await AuthService.logout(refreshToken) } catch {}
    }
    logout()
    queryClient.clear()
    router.replace('/')
  }
  const dashboardHref = user?.role === 'creator' ? '/creator' : '/dashboard'

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <BrandLogo />

        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            Browse
          </Link>

          {isAuthenticated && user ? (
            <>
              <Link href={dashboardHref} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                Dashboard
              </Link>
              <UserMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <LoginButton />
          )}
        </nav>
      </div>
    </header>
  )
}

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-xl font-bold text-slate-900">Ocean Across</span>
      <Badge variant="secondary" className="text-xs">Sessions</Badge>
    </Link>
  )
}

function LoginButton() {
  return (
    <Button size="sm" onClick={() => { window.location.href = GITHUB_OAUTH_URL }} className="gap-2">
      <GitHubIcon />
      Sign in with GitHub
    </Button>
  )
}

function UserMenu({ user, onLogout }: { user: NonNullable<ReturnType<typeof useAuth>['user']>; onLogout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-slate-400">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <Badge variant="outline" className="w-fit text-xs capitalize">{user.role}</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={user.role === 'creator' ? '/creator' : '/dashboard'}>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}
