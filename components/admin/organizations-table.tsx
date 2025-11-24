"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconEye, IconToggleLeft, IconToggleRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { formatDate } from "@/lib/format-date"

interface Organization {
  id: number
  name: string
  companyContext: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  userCount: number
}

interface OrganizationsTableProps {
  organizations: Organization[]
}

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  const router = useRouter()
  const [togglingId, setTogglingId] = React.useState<number | null>(null)

  const handleToggleActive = async (org: Organization) => {
    setTogglingId(org.id)

    try {
      const response = await fetch(`/api/admin/organizations/${org.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !org.isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle organization status')
      }

      toast.success(`Organization ${!org.isActive ? 'activated' : 'deactivated'} successfully`)
      router.refresh()
    } catch (error) {
      console.error('Error toggling organization:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to toggle organization status')
    } finally {
      setTogglingId(null)
    }
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No organizations found.</p>
        <p className="text-sm mt-1">Click "Create Organization" to add the first one.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-medium">{org.name}</TableCell>
              <TableCell>
                <Badge variant={org.isActive ? "default" : "secondary"}>
                  {org.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{org.userCount}</TableCell>
              <TableCell>
                {formatDate(org.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(org)}
                    disabled={togglingId === org.id}
                  >
                    {org.isActive ? (
                      <IconToggleRight className="size-4 mr-2" />
                    ) : (
                      <IconToggleLeft className="size-4 mr-2" />
                    )}
                    {togglingId === org.id ? 'Toggling...' : (org.isActive ? 'Deactivate' : 'Activate')}
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/admin/organizations/${org.id}`}>
                      <IconEye className="size-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
