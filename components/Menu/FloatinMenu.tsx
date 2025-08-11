'use client';

import { useState } from 'react';
import {
    Menu,
    X,
    Backpack,
    User,
    Clipboard,
    Trophy,
    Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InventorySheet from "@/components/Menu/Inventory/InventorySheet";
import StatsSheet from "@/components/Menu/Stats/StatsSheet";
import {useRouter} from "next/navigation";

export default function FloatingMenu() {
    const router = useRouter();
    const [activeMenu, setActiveMenu] = useState<null | "inventory" | "menu" | "stats" | "quest" | "achievements" | "settings">(null);

    const menuItems = [
        {
            icon: Backpack,
            label: "Inventory",
            id: "inventory",
            onClick: () => setActiveMenu("inventory"),
        },
        {
            icon: User,
            label: "Stats",
            id: "stats",
            onClick: () => setActiveMenu("stats"),
        },
        {
            icon: Clipboard,
            label: "Quest",
            id: "quest",
            onClick: () => router.push("/quest"),
        },
        {
            icon: Trophy,
            label: "Achievements",
            id: "achievements",
            onClick: () => setActiveMenu("achievements"),
        },
        {
            icon: Settings,
            label: "Settings",
            id: "settings",
            onClick: () => setActiveMenu("settings"),
        },
    ];

    const isMenuOpen = activeMenu !== null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {isMenuOpen &&
                menuItems.map((item, index) => (
                    <button
                        key={item.label}
                        onClick={() => {
                            item.onClick();
                        }}
                        className={cn(
                            "flex items-center gap-2 backdrop-blur bg-white/80 text-gray-800 font-medium shadow-lg px-4 py-2 rounded-full text-sm transition-all duration-300",
                            "hover:bg-white/90 animate-in fade-in slide-in-from-bottom-2"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <item.icon className="w-4 h-4 text-blue-600" />
                        {item.label}
                    </button>
                ))}

            <button
                onClick={() => {
                    setActiveMenu(isMenuOpen ? null : "menu");
                }}
                className={cn(
                    "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300",
                    isMenuOpen
                        ? "bg-red-500 hover:bg-red-600 rotate-45"
                        : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>

            {/* Conditionally render inventory */}
            <InventorySheet open={activeMenu === "inventory"} onClose={() => setActiveMenu(null)} />
            <StatsSheet open={activeMenu === "stats"} onClose={() => setActiveMenu(null)} />
        </div>
    );
}
