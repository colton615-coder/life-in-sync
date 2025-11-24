import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Home,
  Activity,
  CreditCard,
  ListTodo,
  Dumbbell,
  Bot,
  ShoppingCart,
  Calendar,
  Target,
  Link,
  Settings
} from 'lucide-react';
import { Module } from '@/lib/types';

interface FloatingDockProps {
    activeModule: Module;
    onNavigate: (module: Module) => void;
}

interface NavItemProps {
    icon: React.ElementType;
    isActive?: boolean;
    onClick?: () => void;
    id: string;
}

const NavItem = ({ icon: Icon, isActive, onClick, id }: NavItemProps) => {
    return (
        <button
            onClick={onClick}
            className="relative p-4 group flex flex-col items-center justify-center shrink-0"
            aria-label={id}
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

export const FloatingDock = ({ activeModule, onNavigate }: FloatingDockProps) => {

    // Helper to map modules to tab indices for the "active" indicator
    const isTabActive = (target: string) => {
        return activeModule === target;
    };

    const modules = [
        { id: 'dashboard', icon: Home },
        { id: 'habits', icon: Activity },
        { id: 'finance', icon: CreditCard },
        { id: 'tasks', icon: ListTodo },
        { id: 'workouts', icon: Dumbbell },
        { id: 'knox', icon: Bot },
        { id: 'shopping', icon: ShoppingCart },
        { id: 'calendar', icon: Calendar },
        { id: 'golf', icon: Target },
        { id: 'connections', icon: Link },
        { id: 'settings', icon: Settings },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] h-20 w-[90%] max-w-md rounded-3xl flex items-center px-2 overflow-x-auto no-scrollbar">
                {modules.map((module) => (
                    <NavItem
                        key={module.id}
                        id={module.id}
                        icon={module.icon}
                        isActive={isTabActive(module.id)}
                        onClick={() => onNavigate(module.id as Module)}
                    />
                ))}
            </div>
        </div>
    )
}
