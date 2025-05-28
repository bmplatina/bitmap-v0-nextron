"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../lib/utils"

import { sidebarItems } from "../lib/sidebar-items";

export default function Sidebar() {
  const pathname = usePathname()

  return (
      <div className="w-64 h-full bg-background border-r flex-col hidden md:flex">
        {/* 사이드바 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {sidebarItems.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">{section.title}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                      <Link
                          key={item.title}
                          href={item.href}
                          className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                              pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                          )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                  ))}
                </div>
              </div>
          ))}
        </div>
      </div>
  )
}
