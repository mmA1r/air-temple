"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

import { AppContextProvider, useAppContextValue } from "@context/AppContext";
import type { ThemeName } from "@app-types";

interface IAppShellProps {
    children: React.ReactNode;
    initialTheme: ThemeName;
}

function AppShellContent(props: IAppShellProps) {
    const pathname = usePathname();
    const appContext = useAppContextValue(props.initialTheme);
    const isHomePage = pathname === "/";

    useEffect(() => {
        document.documentElement.dataset.theme = appContext.theme;
        document.documentElement.lang = appContext.locale;
    }, [appContext.locale, appContext.theme]);

    return (
        <AppContextProvider value={appContext}>
            <div className={isHomePage ? "app-shell app-shell--home" : "app-shell"}>
                <main className={isHomePage ? "app-shell__main app-shell__main--home" : "app-shell__main"}>
                    {props.children}
                </main>
            </div>
        </AppContextProvider>
    );
}

function AppShell(props: IAppShellProps) {
    return <AppShellContent initialTheme={props.initialTheme}>{props.children}</AppShellContent>;
}

export default AppShell;
