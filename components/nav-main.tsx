"use client"

import Link from "next/link"
import { type Icon } from "@tabler/icons-react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  label,
  labelIcon,
  labelUrl,
}: {
  items: {
    title: string
    url: string
    icon?: Icon | LucideIcon
  }[]
  label?: string
  labelIcon?: Icon | LucideIcon
  labelUrl?: string
}) {
  // Capitalize the icon component for JSX rendering
  const LabelIcon = labelIcon

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel asChild>
          <Link href={labelUrl || "#"} className="flex items-center gap-2">
            {LabelIcon && <LabelIcon className="size-4" />}
            <span>{label}</span>
          </Link>
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} className="pl-6">
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
