"use client";

import { useEffect } from "react";

import AppFooter from "../AppFooter/AppFooter";
import AppHeader from "../AppHeader/AppHeader";
import { AppContextProvider, useAppContextValue } from "../../context/AppContext";

interface IAppShellProps {
    children: React.ReactNode;
}

function AppShellContent(props: IAppShellProps) {
    const appContext = useAppContextValue();

    useEffect(() => {
        document.documentElement.dataset.theme = appContext.theme;
        document.documentElement.lang = appContext.locale;
    }, [appContext.locale, appContext.theme]);

    return (
        <AppContextProvider value={appContext}>
            <div className="app-shell">
                <AppHeader />
                <main className="app-shell__main">{props.children}</main>
                <AppFooter />
            </div>
        </AppContextProvider>
    );
}

function AppShell(props: IAppShellProps) {
    return <AppShellContent>{props.children}</AppShellContent>;
}

export default AppShell;
