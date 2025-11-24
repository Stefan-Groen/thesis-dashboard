"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function CreateOrganizationDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    companyContext: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.companyContext.trim()) {
      toast.error("Name and company context are required")
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          companyContext: formData.companyContext,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create organization")
      }

      toast.success("Organization created successfully")
      setOpen(false)
      setFormData({ name: "", companyContext: "" })
      router.refresh()
    } catch (error) {
      console.error("Error creating organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create organization")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="size-4 mr-2" />
          Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to the system. You'll be able to add users to it afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corporation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyContext">
                Company Context <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="companyContext"
                placeholder="Describe the company, its products/services, competitors, and relevant context for article classification..."
                value={formData.companyContext}
                onChange={(e) => setFormData({ ...formData, companyContext: e.target.value })}
                rows={8}
                className="resize-none"
                required
              />
              <p className="text-sm text-muted-foreground">
                This information is used by the AI to classify articles as threats, opportunities, or neutral for this organization.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
