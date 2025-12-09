"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconHome,
  IconNews,
  IconCircle,
  IconStar,
  IconUser,
  IconLogout,
  IconFileText,
  IconSettings,
  IconSparkles as IconAI,
  IconBrandLinkedin,
  IconExternalLink,
  IconWand,
  IconMail,
  IconHelp,
} from "@tabler/icons-react"
import { OctagonAlert, Lightbulb } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { ThemeToggleSlider } from "@/components/theme-toggle-slider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
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
      icon: OctagonAlert,
    },
    {
      title: "Opportunities",
      url: "/dashboard/opportunities",
      icon: Lightbulb,
    },
    {
      title: "Neutral",
      url: "/dashboard/neutral",
      icon: IconCircle,
    },
    {
      title: "Starred",
      url: "/dashboard/starred",
      icon: IconStar,
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

        {/* Features Section */}
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <Link href="#" className="flex items-center gap-2">
              <IconWand className="size-4" />
              <span>Features</span>
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1">
              <Link
                href="/dashboard/summary"
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-md transition-colors text-sm"
              >
                <IconAI className="size-4" />
                <span>AI Overview</span>
                <span className="ml-0.5 text-[7px] font-normal align-super bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                  beta
                </span>
              </Link>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-0">
        {/* Contact Section */}
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <Link href="#" className="flex items-center gap-2">
              <IconMail className="size-4" />
              <span>Contact</span>
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {/* Thesis Link */}
              <Link
                href="https://drive.google.com/file/d/1VP-katLsR3I07dTy8LLeXDfBUjHFFNgz/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-md transition-colors text-sm"
              >
                <IconFileText className="size-4" />
                <span>Thesis</span>
                <IconExternalLink className="size-3 ml-auto" />
              </Link>

              {/* LinkedIn Link */}
              <Link
                href="https://www.linkedin.com/in/stefan-groen-557223265/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-md transition-colors text-sm"
              >
                <IconBrandLinkedin className="size-4" />
                <span>LinkedIn</span>
                <IconExternalLink className="size-3 ml-auto" />
              </Link>

              {/* Help Link */}
              <Link
                href="/dashboard/help"
                className="flex items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-md transition-colors text-sm"
              >
                <IconHelp className="size-4" />
                <span>Help</span>
                <IconExternalLink className="size-3 ml-auto" />
              </Link>

              {/* Get Support Link */}
              <a
                href="mailto:s.s.groen@student.rug.nl"
                onClick={(e) => {
                  // Fallback alert if mailto doesn't work
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                  if (!isMobile) {
                    const confirmed = confirm(
                      'Please send an email to:\ns.s.groen@student.rug.nl\n\nClick OK to open your email client.'
                    )
                    if (!confirmed) {
                      e.preventDefault()
                    }
                  }
                }}
                className="flex items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-md transition-colors text-sm"
              >
                <IconMail className="size-4" />
                <span>Get Support</span>
                <IconExternalLink className="size-3 ml-auto" />
              </a>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

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
