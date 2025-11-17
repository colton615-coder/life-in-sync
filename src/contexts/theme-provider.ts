import { createContext } from "react";
import { ThemeProviderState } from "@/components/ThemeProvider";

export const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
    undefined
  )
