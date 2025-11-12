"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconHome,
  IconNews,
  IconAlertTriangle,
  IconSparkles,
  IconCircle,
  IconStarFilled,
  IconUser,
  IconLogout,
  IconFileText,
  IconSettings,
  IconSparkles as IconAI,
} from "@tabler/icons-react"
import { useSession, signOut } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { ThemeToggleSlider } from "@/components/theme-toggle-slider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const data = {
  navMain: [
    {
      title: "All Articles",
      url: "/dashboard/articles",
      icon: IconNews,
    },
    {
      title: "Threats",
      url: "/dashboard/threats",
      icon: IconAlertTriangle,
    },
    {
      title: "Opportunities",
      url: "/dashboard/opportunities",
      icon: IconSparkles,
    },
    {
      title: "Neutral",
      url: "/dashboard/neutral",
      icon: IconCircle,
    },
    {
      title: "Starred",
      url: "/dashboard/starred",
      icon: IconStarFilled,
    },
    {
      title: "AI Overview",
      url: "/dashboard/summary",
      icon: IconAI,
    },
    {
      title: "Own Articles",
      url: "/dashboard/user_uploaded",
      icon: IconUser,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    })
  }

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "?"

    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="px-2 py-2 flex items-center gap-2 hover:bg-muted/50 rounded-md transition-colors">
          <IconHome className="size-5" />
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          label="Pages"
          labelIcon={IconHome}
          labelUrl="/dashboard"
        />
      </SidebarContent>
      <SidebarFooter className="p-2">
        {/* Theme Toggle Slider */}
        <ThemeToggleSlider />

        {/* User Account Section */}
        {status === "authenticated" && session?.user && (
          <div className="mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-2 h-auto py-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || session.user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{session.user.username}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" side="top">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || session.user.username}
                    </p>
                    {session.user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    )}
                    <p className="text-xs leading-none text-muted-foreground">
                      @{session.user.username}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <Link href="/dashboard/account">
                  <DropdownMenuItem className="cursor-pointer">
                    <IconSettings className="size-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                  onClick={handleLogout}
                >
                  <IconLogout className="size-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
