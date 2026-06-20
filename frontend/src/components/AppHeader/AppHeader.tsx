"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale, ThemeName } from "../../types";
import { useAppContext } from "../../context/AppContext";

import "./AppHeader.scss";

function AppHeader() {
    const pathname = usePathname();
    const { copy, locale, theme, setLocale, setTheme } = useAppContext();
    const nextTheme: ThemeName = theme === "water-air" ? "fire-earth" : "water-air";
    const nextLocale: Locale = locale === "ru" ? "en" : "ru";

    function getLinkClassName(href: string) {
        return pathname === href ? "app-header__link app-header__link--active" : "app-header__link";
    }

    return (
        <header className="app-header">
            <Link className="app-header__brand" href="/">
                Air Temple
            </Link>
            <nav className="app-header__nav" aria-label="Primary navigation">
                <Link className={getLinkClassName("/")} href="/">
                    {copy.home}
                </Link>
                <Link className={getLinkClassName("/gallery")} href="/gallery">
                    {copy.gallery}
                </Link>
                <Link className={getLinkClassName("/admin")} href="/admin">
                    {copy.admin}
                </Link>
            </nav>
            <div className="app-header__controls">
                <button className="app-header__control" type="button" onClick={() => setLocale(nextLocale)}>
                    {copy.language}: {locale.toUpperCase()}
                </button>
                <button className="app-header__control" type="button" onClick={() => setTheme(nextTheme)}>
                    {copy.theme}
                </button>
            </div>
        </header>
    );
}

export default AppHeader;
