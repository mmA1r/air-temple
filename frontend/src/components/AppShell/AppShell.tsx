"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

import AppFooter from "@components/AppFooter/AppFooter";
import AppHeader from "@components/AppHeader/AppHeader";
import { AppContextProvider, useAppContextValue } from "@context/AppContext";

interface IAppShellProps {
    children: React.ReactNode;
}

function AppShellContent(props: IAppShellProps) {
    const pathname = usePathname();
    const appContext = useAppContextValue();
    const isHomePage = pathname === "/";

    useEffect(() => {
        document.documentElement.dataset.theme = appContext.theme;
        document.documentElement.lang = appContext.locale;
    }, [appContext.locale, appContext.theme]);

    return (
        <AppContextProvider value={appContext}>
            <div className={isHomePage ? "app-shell app-shell--home" : "app-shell"}>
                {!isHomePage && <AppHeader />}
                <main className={isHomePage ? "app-shell__main app-shell__main--home" : "app-shell__main"}>
                    {props.children}
                </main>
                {!isHomePage && <AppFooter />}
            </div>
        </AppContextProvider>
    );
}

function AppShell(props: IAppShellProps) {
    return <AppShellContent>{props.children}</AppShellContent>;
}

export default AppShell;
