/**
 * Back Button Component
 *
 * Client-side component that navigates back using browser history
 */

"use client"

import { useRouter } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => router.back()}
    >
      <IconArrowLeft className="size-4" />
    </Button>
  )
}
