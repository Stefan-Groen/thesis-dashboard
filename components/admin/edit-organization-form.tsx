"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Organization {
  id: number
  name: string
  companyContext: string
  isActive: boolean
}

interface EditOrganizationFormProps {
  organization: Organization
}

export function EditOrganizationForm({ organization }: EditOrganizationFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: organization.name,
    companyContext: organization.companyContext,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.companyContext.trim()) {
      toast.error("Name and company context are required")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/organizations/${organization.id}`, {
        method: "PUT",
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
        throw new Error(data.error || "Failed to update organization")
      }

      toast.success("Organization updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update organization")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          placeholder="Describe the company, its products/services, competitors, and relevant context..."
          value={formData.companyContext}
          onChange={(e) => setFormData({ ...formData, companyContext: e.target.value })}
          rows={12}
          className="resize-none font-mono text-sm"
          required
        />
        <p className="text-sm text-muted-foreground">
          This information is used by the AI to classify articles as threats, opportunities, or neutral for this organization.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
