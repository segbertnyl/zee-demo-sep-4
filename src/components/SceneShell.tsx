import { LeftRail } from '@/components/LeftRail'
import { NavTrailBar } from '@/components/NavTrailBar'
import type { ReactNode } from 'react'

/* Hyper-minimal shell. Slim left rail on the left, scene content on the right. */

export function SceneShell({ children }: { children: ReactNode }) {
  return (
    <div className="dot-ground relative flex min-h-screen">
      <LeftRail />
      <main className="relative flex flex-1 flex-col pl-[76px]">
        <NavTrailBar />
        {children}
      </main>
    </div>
  )
}
