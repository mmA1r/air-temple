"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import Link from "next/link";

import AirEmblem from "@components/ui/icons/WaterKoi/WaterKoi";
import GalleryPortal from "@components/ui/icons/Air/Air";
import { useAppContext } from "@context/AppContext";

import "./HomePage.scss";

interface ISocialLink {
    label: string;
    href: string;
    viewBox: string;
    path: string;
    stroke?: boolean;
}

interface IArcPoint {
    x: number;
    y: number;
}

interface IArcControlStyle extends CSSProperties {
    "--arc-x": string;
    "--arc-y": string;
    "--arc-angle": string;
}

interface IMenuItemStyle extends CSSProperties {
    "--menu-index": number;
}

interface IThemeBlend {
    from: ThemeName;
    to: ThemeName;
    id: number;
}

export type Locale = "ru" | "en";
export type ThemeName = "water-air" | "fire-earth";

const arcPoints = {
    start: { x: -80, y: 184 },
    controlA: { x: 214, y: 58 },
    controlB: { x: 604, y: 22 },
    end: { x: 1280, y: 184 },
};

const arcViewBox = {
    width: 1200,
    height: 260,
    visibleHeightPercent: 34,
};

function getCubicPoint(progress: number): IArcPoint {
    const inverseProgress = 1 - progress;
    const inverseProgressSquared = inverseProgress * inverseProgress;
    const progressSquared = progress * progress;

    return {
        x:
            inverseProgressSquared * inverseProgress * arcPoints.start.x +
            3 * inverseProgressSquared * progress * arcPoints.controlA.x +
            3 * inverseProgress * progressSquared * arcPoints.controlB.x +
            progressSquared * progress * arcPoints.end.x,
        y:
            inverseProgressSquared * inverseProgress * arcPoints.start.y +
            3 * inverseProgressSquared * progress * arcPoints.controlA.y +
            3 * inverseProgress * progressSquared * arcPoints.controlB.y +
            progressSquared * progress * arcPoints.end.y,
    };
}

function getCubicDerivative(progress: number): IArcPoint {
    const inverseProgress = 1 - progress;

    return {
        x:
            3 * inverseProgress * inverseProgress * (arcPoints.controlA.x - arcPoints.start.x) +
            6 * inverseProgress * progress * (arcPoints.controlB.x - arcPoints.controlA.x) +
            3 * progress * progress * (arcPoints.end.x - arcPoints.controlB.x),
        y:
            3 * inverseProgress * inverseProgress * (arcPoints.controlA.y - arcPoints.start.y) +
            6 * inverseProgress * progress * (arcPoints.controlB.y - arcPoints.controlA.y) +
            3 * progress * progress * (arcPoints.end.y - arcPoints.controlB.y),
    };
}

function getArcControlStyle(progress: number): IArcControlStyle {
    const point = getCubicPoint(progress);
    const derivative = getCubicDerivative(progress);
    const xPercent = (point.x / arcViewBox.width) * 100;
    const yPercent = (point.y / arcViewBox.height) * arcViewBox.visibleHeightPercent;
    const angle = Math.atan2(derivative.y, derivative.x) * (180 / Math.PI);

    return {
        "--arc-x": `${xPercent}%`,
        "--arc-y": `${yPercent}%`,
        "--arc-angle": `${angle}deg`,
    };
}

function getArcControlStyles(isCompactViewport: boolean) {
    if (isCompactViewport) {
        return {
            locale: getArcControlStyle(0.5),
            theme: getArcControlStyle(0.545),
            menu: getArcControlStyle(0.635),
        };
    }

    return {
        locale: getArcControlStyle(0.34),
        theme: getArcControlStyle(0.385),
        menu: getArcControlStyle(0.89),
    };
}

const socialLinks: ISocialLink[] = [
    {
        label: "Instagram",
        href: "https://www.instagram.com/_mmair_/",
        viewBox: "0 0 25 25",
        path: "M19 4.7a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm5.4 2.9c0-1-.2-2-.5-3a6 6 0 0 0-1.4-2c-.6-.7-1.3-1.2-2.1-1.5-1-.3-2-.5-3-.5L12.5.5h-5c-1 0-2 .3-2.9.6-.8.3-1.5.8-2 1.4-.7.6-1.2 1.3-1.5 2.1-.3 1-.5 2-.5 3l-.1 4.9v5c0 1 .3 2 .6 2.9.3.8.8 1.5 1.4 2 .6.7 1.3 1.2 2.1 1.5 1 .3 2 .5 3 .5l4.9.1h5c1 0 2-.3 2.9-.6.8-.3 1.5-.8 2-1.4.7-.6 1.2-1.3 1.5-2.1.3-1 .5-2 .5-3l.1-4.9v-5Zm-2.1 9.7c0 .8-.2 1.5-.4 2.2-.2.6-.5 1-1 1.4-.3.4-.8.7-1.3 1a78 78 0 0 1-7 .5L7.6 22c-.7 0-1.5 0-2.3-.3a4 4 0 0 1-1.3-1c-.4-.3-.7-.8-.9-1.3-.3-.7-.4-1.5-.5-2.3V7.7c0-.8.2-1.6.5-2.3.2-.5.5-1 .9-1.3l1.3-1c.8-.2 1.5-.4 2.3-.4h9.6c.8 0 1.5.2 2.2.4.6.2 1 .6 1.5 1 .4.4.7.8.9 1.3.2.8.4 1.5.4 2.3a78 78 0 0 1 0 9.6Zm-9.8-11a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z",
    },
    {
        label: "ArtStation",
        href: "https://www.artstation.com/mmair",
        viewBox: "0 0 25 25",
        path: "M4.7 22.5h13.48l-2.8-5.04H.5l2.03 3.65c.4.83 1.22 1.39 2.17 1.39ZM13.4 13.88 7.93 4.06l-5.46 9.82H13.4ZM24.01 19.02c.1-.16 1-1.46.1-2.9L16.26 1.83A2.42 2.42 0 0 0 14.1.5H9.94l12.15 21.98L24 19.02Z",
    },
    {
        label: "Pixiv",
        href: "https://www.pixiv.net/en/users/39363802",
        viewBox: "0 0 27 25",
        path: "M6.94 3.76V23.5m-1.33 0h2.67m-1.34-6.46s1.92 2.32 8.3 2.32c6.38 0 10.26-4.72 10.26-8.66 0-3.95-3.08-9.2-10.04-9.2C8.49 1.5 3.64 5.8 1.5 7.87l.65 1.31",
        stroke: true,
    },
    {
        label: "DeviantArt",
        href: "https://www.deviantart.com/mma1r",
        viewBox: "0 0 19 25",
        path: "M18.5.5h-5.4l-2.7 4.1-.3.3a1 1 0 0 1-.4.1H.5v6h4.3l.5.1.3.3.1.3-.1.4L.5 20v4.5h5.4l2.7-4.1.3-.3.4-.1h9.2v-6h-4.3a1 1 0 0 1-.5-.1.8.8 0 0 1-.3-.3l-.1-.3.1-.4L18.5 5V.5Z",
    },
];

function HomePage() {
    const { copy, locale, theme, setLocale, setTheme } = useAppContext();
    const menuRef = useRef<HTMLDivElement | null>(null);
    const previousThemeRef = useRef(theme);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCompactViewport, setIsCompactViewport] = useState(false);
    const [glassMode, setGlassMode] = useState<"rich" | "simple">("rich");
    const [themeBlend, setThemeBlend] = useState<IThemeBlend | null>(null);
    const nextTheme: ThemeName = theme === "water-air" ? "fire-earth" : "water-air";
    const nextLocale: Locale = locale === "ru" ? "en" : "ru";
    const nextGlassMode = glassMode === "rich" ? "simple" : "rich";
    const arcControlStyles = getArcControlStyles(isCompactViewport);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!menuRef.current?.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 760px)");

        function updateViewportState() {
            setIsCompactViewport(mediaQuery.matches);
        }

        updateViewportState();
        mediaQuery.addEventListener("change", updateViewportState);

        return () => {
            mediaQuery.removeEventListener("change", updateViewportState);
        };
    }, []);

    useEffect(() => {
        if (previousThemeRef.current === theme) {
            return;
        }

        const blendId = Date.now();

        setThemeBlend({
            from: previousThemeRef.current,
            to: theme,
            id: blendId,
        });
        previousThemeRef.current = theme;

        const timeoutId = window.setTimeout(() => {
            setThemeBlend((currentBlend) => (currentBlend?.id === blendId ? null : currentBlend));
        }, 1050);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [theme]);

    return (
        <div className="home-page" data-glass={glassMode}>
            <section className="home-page__cover" aria-labelledby="home-title">
                {themeBlend && (
                    <div
                        className="home-page__theme-blend"
                        data-from={themeBlend.from}
                        data-to={themeBlend.to}
                        key={themeBlend.id}
                        aria-hidden="true"
                    />
                )}

                <div className="home-page__stage" aria-hidden="true" />

                <div className="home-page__mark">
                    <AirEmblem />
                </div>

                <Link className="home-page__mobile-gallery" href="/gallery" aria-label={copy.openGallery}>
                    <span className="home-page__mobile-gallery-text">{copy.gallery}</span>
                    <span className="home-page__mobile-gallery-line" />
                    <span className="home-page__mobile-gallery-symbol" aria-hidden="true">
                        <svg viewBox="0 0 30 30">
                            <path d="M13.47 12.63c-7.12 4.78.12 13.42 10.24 8.95-11.66 3.4-12.95-7.13-10.24-8.95Z" />
                            <path d="M16.12 20.9c11.23-1.56 10.7-9.96 10.7-13.6 5.05 4.77 1.93 17.04-10.7 13.6Z" />
                            <path d="M24.72 15.14C27.42 3.9 18.26 1.3 12.85 1.57c7.43-1.99 17.5 1.9 11.87 13.57Z" />
                            <path d="M21.9 1.85c-7.07-2.77-15.86.9-19.6 3.9 0 0 6.05-9.7 19.6-3.9ZM15.87 17.87c7.11-4.77-.12-13.42-10.24-8.95 11.66-3.4 12.94 7.13 10.24 8.95Z" />
                            <path d="M13.21 9.6C2 11.16 2.93 19.24 2.93 22.82-2.12 18.07.59 6.16 13.2 9.6Z" />
                            <path d="M4.62 15.13c-2.38 11.8 7.27 13.58 12.44 12.7-6.68 2.8-17.4-.29-12.44-12.7Z" />
                            <path d="M8.7 28.73c7.27 1.87 15.6-2.87 19.48-5.65 0 0-5.47 10.48-19.49 5.65Z" />
                        </svg>
                    </span>
                </Link>

                <div className="home-page__rim">
                    <div className="home-page__glass" aria-hidden="true" />
                    <svg
                        className="home-page__arc"
                        viewBox={`0 0 ${arcViewBox.width} ${arcViewBox.height}`}
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path className="home-page__arc-path" d="M-80 184C214 58 604 22 1280 184" />
                    </svg>

                    <div className="home-page__rim-control home-page__rim-control--locale" style={arcControlStyles.locale}>
                        <svg className="home-page__rim-text" viewBox="0 0 120 76" aria-hidden="true">
                            <path id="home-locale-label" d="M18 58C42 22 78 14 104 40" />
                            <text>
                                <textPath href="#home-locale-label" startOffset="18%">
                                    {copy.language}
                                </textPath>
                            </text>
                        </svg>
                        <button
                            className="home-page__orb"
                            type="button"
                            onClick={() => setLocale(nextLocale)}
                            aria-label={`${copy.language}: ${locale.toUpperCase()}`}
                        >
                            <span className="home-page__orb-text">{locale}</span>
                        </button>
                    </div>

                    <div className="home-page__rim-control home-page__rim-control--theme" style={arcControlStyles.theme}>
                        <svg className="home-page__rim-text" viewBox="0 0 120 76" aria-hidden="true">
                            <path id="home-theme-label" d="M16 58C42 18 80 14 106 42" />
                            <text>
                                <textPath href="#home-theme-label" startOffset="16%">
                                    {copy.theme}
                                </textPath>
                            </text>
                        </svg>
                        <button
                            className="home-page__orb"
                            type="button"
                            onClick={() => setTheme(nextTheme)}
                            aria-label={copy.theme}
                        >
                            <span className="home-page__theme-dot" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="home-page__menu" ref={menuRef} style={arcControlStyles.menu}>
                        <button
                            className="home-page__orb home-page__orb--menu"
                            type="button"
                            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                            aria-expanded={isMenuOpen}
                            aria-controls="home-menu"
                            aria-label="Menu"
                        >
                            <span />
                            <span />
                        </button>
                        <nav
                            className={isMenuOpen ? "home-page__menu-panel home-page__menu-panel--open" : "home-page__menu-panel"}
                            id="home-menu"
                            aria-label="Home navigation"
                        >
                            <Link className="home-page__menu-link" href="/gallery" style={{ "--menu-index": 0 } as IMenuItemStyle}>
                                {copy.gallery}
                            </Link>
                            <a
                                className="home-page__menu-link"
                                href="https://boosty.to"
                                target="_blank"
                                rel="noreferrer"
                                style={{ "--menu-index": 1 } as IMenuItemStyle}
                            >
                                {copy.donate}
                            </a>
                            <button
                                className="home-page__menu-link"
                                type="button"
                                onClick={() => setGlassMode(nextGlassMode)}
                                style={{ "--menu-index": 2 } as IMenuItemStyle}
                            >
                                Glass: {glassMode}
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="home-page__identity">
                    <h1 className="home-page__title" id="home-title">
                        mmAir
                    </h1>
                </div>

                <ul className="home-page__socials" aria-label={copy.socials}>
                    {socialLinks.map((socialLink) => (
                        <li className="home-page__social-item" key={socialLink.label}>
                            <a
                                className={socialLink.stroke ? "home-page__social home-page__social--stroke" : "home-page__social"}
                                href={socialLink.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={socialLink.label}
                            >
                                <svg viewBox={socialLink.viewBox} aria-hidden="true">
                                    <path d={socialLink.path} />
                                </svg>
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default HomePage;
