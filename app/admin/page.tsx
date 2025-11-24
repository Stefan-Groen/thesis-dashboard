/**
 * Admin Dashboard Page
 *
 * Displays all organizations with ability to create, edit, toggle active status
 * Only accessible to stefan.groen
 */

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { IconBuildingSkyscraper, IconPlus, IconSettings, IconUsers } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrganizationsTable } from "@/components/admin/organizations-table"
import { CreateOrganizationDialog } from "@/components/admin/create-organization-dialog"
import { query } from "@/lib/db"

interface Organization {
  id: number
  name: string
  companyContext: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  userCount: number
}

async function getOrganizations(): Promise<Organization[]> {
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
      GROUP BY o.id, o.name, o.company_context, o.is_active, o.created_at, o.updated_at
      ORDER BY o.created_at DESC;
    `

    const result = await query(sql)

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      companyContext: row.company_context,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userCount: parseInt(row.user_count) || 0,
    }))
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return []
  }
}

export default async function AdminPage() {
  const organizations = await getOrganizations()

  const totalUsers = organizations.reduce((sum, org) => sum + org.userCount, 0)
  const activeOrgs = organizations.filter(org => org.isActive).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <IconSettings className="size-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage organizations and users
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Organizations
              </CardTitle>
              <IconBuildingSkyscraper className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeOrgs} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <IconUsers className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Across all organizations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Users per Org
              </CardTitle>
              <IconUsers className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizations.length > 0 ? (totalUsers / organizations.length).toFixed(1) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Mean distribution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Organizations Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Organizations</CardTitle>
                <CardDescription>
                  Manage all organizations and their settings
                </CardDescription>
              </div>
              <CreateOrganizationDialog />
            </div>
          </CardHeader>
          <CardContent>
            <OrganizationsTable organizations={organizations} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
