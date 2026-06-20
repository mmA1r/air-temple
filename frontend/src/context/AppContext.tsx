"use client";

import { createContext, useContext } from "react";

import useLocalStorageState from "../hooks/useLocalStorageState";
import { translations } from "../i18n/translations";
import type { Locale, ThemeName } from "../types";

type Copy = (typeof translations)["ru"];

interface IAppContext {
    copy: Copy;
    locale: Locale;
    theme: ThemeName;
    setLocale: (locale: Locale) => void;
    setTheme: (theme: ThemeName) => void;
}

const AppContext = createContext<IAppContext | null>(null);

interface IAppContextProviderProps {
    children: React.ReactNode;
    value: IAppContext;
}

export function AppContextProvider(props: IAppContextProviderProps) {
    return <AppContext.Provider value={props.value}>{props.children}</AppContext.Provider>;
}

export function useAppContextValue(): IAppContext {
    const [locale, setLocale] = useLocalStorageState<Locale>("air-temple-locale", "ru");
    const [theme, setTheme] = useLocalStorageState<ThemeName>("air-temple-theme", "water-air");

    return {
        copy: translations[locale],
        locale,
        theme,
        setLocale,
        setTheme,
    };
}

export function useAppContext(): IAppContext {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useAppContext must be used within AppContextProvider");
    }

    return context;
}
