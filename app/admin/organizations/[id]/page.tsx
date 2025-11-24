/**
 * Organization Detail Page
 *
 * Shows organization details and all users in the organization
 * Allows adding new users and deleting existing users
 */

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { IconArrowLeft, IconBuildingSkyscraper, IconUsers } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditOrganizationForm } from "@/components/admin/edit-organization-form"
import { UsersTable } from "@/components/admin/users-table"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import { query } from "@/lib/db"
import { notFound } from "next/navigation"

interface Organization {
  id: number
  name: string
  companyContext: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  userCount: number
}

interface User {
  id: number
  username: string
  fullName: string | null
  email: string | null
  isActive: boolean
  createdAt: Date
  lastLogin: Date | null
}

async function getOrganization(id: string): Promise<Organization | null> {
  try {
    const sql = `
      SELECT
        o.id,
        o.name,
        o.company_context,
        o.is_active,
        o.created_at,
        o.updated_at,
        COUNT(u.id) as user_count
      FROM organizations o
      LEFT JOIN users u ON o.id = u.organization_id
      WHERE o.id = $1
      GROUP BY o.id, o.name, o.company_context, o.is_active, o.created_at, o.updated_at;
    `

    const result = await query(sql, [id])

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      companyContext: row.company_context,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userCount: parseInt(row.user_count) || 0,
    }
  } catch (error) {
    console.error('Error fetching organization:', error)
    return null
  }
}

async function getOrganizationUsers(id: string): Promise<User[]> {
  try {
    const sql = `
      SELECT
        id,
        username,
        full_name,
        email,
        is_active,
        created_at,
        last_login
      FROM users
      WHERE organization_id = $1
      ORDER BY created_at DESC;
    `

    const result = await query(sql, [id])

    return result.rows.map(row => ({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const organization = await getOrganization(id)

  if (!organization) {
    notFound()
  }

  const users = await getOrganizationUsers(id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin">
                <IconArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <IconBuildingSkyscraper className="size-8 text-primary" />
                  {organization.name}
                </h1>
                <Badge variant={organization.isActive ? "default" : "secondary"}>
                  {organization.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {organization.userCount} {organization.userCount === 1 ? 'user' : 'users'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Organization Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Edit organization name and company context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditOrganizationForm organization={organization} />
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <IconUsers className="size-6" />
                    Users
                  </CardTitle>
                  <CardDescription>
                    Manage users for this organization
                  </CardDescription>
                </div>
                <CreateUserDialog organizationId={organization.id} />
              </div>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <IconUsers className="size-12 mx-auto mb-4 opacity-20" />
                  <p>No users in this organization yet.</p>
                  <p className="text-sm mt-1">Click "Add User" to create the first user.</p>
                </div>
              ) : (
                <UsersTable users={users} organizationId={organization.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
