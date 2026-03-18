"use client"

import {
  Target,
  CheckCircle,
  Users,
  Megaphone,
  BarChart3,
  MessageSquare,
  MessageCircle,
  Phone,
  Puzzle,
} from "lucide-react"

const sidebarItems = [
  { icon: Target, label: "Get Leads", active: false },
  { icon: CheckCircle, label: "Verify", active: false },
  { icon: Users, label: "Accounts", active: false },
  { icon: Megaphone, label: "Campaign", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: MessageSquare, label: "Conversations", active: true },
  { icon: MessageCircle, label: "Chats", active: false },
  { icon: Phone, label: "Contacts", active: false },
  { icon: Puzzle, label: "Integrations", active: false },
]

export const Sidebar = () => {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
      {sidebarItems.map((item, index) => (
        <div
          key={index}
          className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
            item.active ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <item.icon className="w-5 h-5" />
        </div>
      ))}
    </div>
  )
}
