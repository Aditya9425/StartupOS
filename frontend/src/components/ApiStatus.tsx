'use client'

import { useEffect, useState } from 'react'

export default function ApiStatus() {
  const [isWakingUp, setIsWakingUp] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWakingUp(true)
    }, 3000)

    const checkHealth = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 
            'http://localhost:8000'}/api/health`
        )
        if (res.ok) {
          setIsWakingUp(false)
          setIsReady(true)
          clearTimeout(timer)
        }
      } catch {
        // Backend not ready yet
      }
    }

    checkHealth()

    const interval = setInterval(checkHealth, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  if (!isWakingUp || isReady) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50
      bg-zinc-900 border-b border-zinc-800 
      py-2 px-4 text-center">
      <p className="text-xs text-zinc-400">
        <span className="inline-block w-1.5 h-1.5 
          rounded-full bg-zinc-500 animate-pulse 
          mr-2 align-middle" />
        AI agents are starting up — 
        this takes ~30 seconds on first load
      </p>
    </div>
  )
}
