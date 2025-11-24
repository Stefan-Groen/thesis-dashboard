"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconTrash } from "@tabler/icons-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { formatDate } from "@/lib/format-date"

interface User {
  id: number
  username: string
  fullName: string | null
  email: string | null
  isActive: boolean
  createdAt: Date
  lastLogin: Date | null
}

interface UsersTableProps {
  users: User[]
  organizationId: number
}

export function UsersTable({ users, organizationId }: UsersTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = React.useState<number | null>(null)

  const handleDeleteUser = async (user: User) => {
    setDeletingId(user.id)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      toast.success(`User '${user.username}' deleted successfully`)
      router.refresh()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.fullName || <span className="text-muted-foreground">—</span>}</TableCell>
              <TableCell>{user.email || <span className="text-muted-foreground">—</span>}</TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLogin ? formatDate(user.lastLogin) : <span className="text-muted-foreground">Never</span>}
              </TableCell>
              <TableCell className="text-right">
                {user.username !== 'stefan.groen' ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === user.id}
                      >
                        <IconTrash className="size-4 mr-2" />
                        {deletingId === user.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete user <strong>{user.username}</strong>?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Badge variant="outline">Admin</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
