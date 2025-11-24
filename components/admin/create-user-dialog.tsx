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
import { toast } from "sonner"

interface CreateUserDialogProps {
  organizationId: number
}

export function CreateUserDialog({ organizationId }: CreateUserDialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("Username and password are required")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName || null,
          email: formData.email || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      toast.success("User created successfully")
      setOpen(false)
      setFormData({ username: "", password: "", fullName: "", email: "" })
      router.refresh()
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="size-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to this organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                placeholder="john.doe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, dots, and underscores allowed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
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
              {isCreating ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
