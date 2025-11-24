import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Home, Activity, CreditCard, Menu } from 'lucide-react';
import { Module } from '@/lib/types';

interface FloatingDockProps {
    activeModule: Module;
    onNavigate: (module: Module) => void;
    onOpenDrawer: () => void;
}

interface NavItemProps {
    icon: React.ElementType;
    isActive?: boolean;
    onClick?: () => void;
}

const NavItem = ({ icon: Icon, isActive, onClick }: NavItemProps) => {
    return (
        <button
            onClick={onClick}
            className="relative p-4 group flex flex-col items-center justify-center w-full"
        >
            <div className={cn(
                "transition-all duration-300",
                isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-slate-400 group-hover:text-slate-200"
            )}>
                <Icon size={24} strokeWidth={1.5} />
            </div>
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_cyan]"
                />
            )}
        </button>
    )
}

export const FloatingDock = ({ activeModule, onNavigate, onOpenDrawer }: FloatingDockProps) => {

    // Helper to map modules to tab indices for the "active" indicator
    const isTabActive = (target: string) => {
        return activeModule === target;
    };

    // If the active module isn't one of the main dock items (e.g., 'settings'),
    // we don't show the dot under any of them (or maybe under menu? Let's keep it clean).

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] h-20 w-[90%] max-w-md rounded-3xl flex items-center justify-around px-2">
                <NavItem
                    icon={Home}
                    isActive={isTabActive('dashboard')}
                    onClick={() => onNavigate('dashboard')}
                />
                <NavItem
                    icon={Activity}
                    isActive={isTabActive('habits')}
                    onClick={() => onNavigate('habits')}
                />
                <NavItem
                    icon={CreditCard}
                    isActive={isTabActive('finance')}
                    onClick={() => onNavigate('finance')}
                />
                <NavItem
                    icon={Menu}
                    isActive={false} // Menu is a trigger, not a persistent state
                    onClick={onOpenDrawer}
                />
            </div>
        </div>
    )
}
