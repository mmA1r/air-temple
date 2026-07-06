import { useEffect, useState } from "react";

import type { Locale, ThemeName } from "@app-types";

import HomeRimControl from "./HomeRimControl/HomeRimControl";
import HomeRimMenu from "./HomeRimMenu/HomeRimMenu";
import { arcViewBox, getArcControlStyles } from "./homeRimArc";
import "./HomeRim.scss";

interface IHomeRimCopy {
    language: string;
    theme: string;
    gallery: string;
    donate: string;
}

interface IHomeRimProps {
    copy: IHomeRimCopy;
    locale: Locale;
    theme: ThemeName;
    setLocale: (locale: Locale) => void;
    setTheme: (theme: ThemeName) => void;
}

function HomeRim(props: IHomeRimProps) {
    const [isCompactViewport, setIsCompactViewport] = useState(false);
    const [glassMode, setGlassMode] = useState<"rich" | "simple">("rich");
    const nextTheme: ThemeName = props.theme === "water-air" ? "fire-earth" : "water-air";
    const nextLocale: Locale = props.locale === "ru" ? "en" : "ru";
    const arcControlStyles = getArcControlStyles(isCompactViewport);

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

    return (
        <div className="home-rim">
            <div className={`home-rim__glass home-rim__glass--${glassMode}`} aria-hidden="true" />
            <svg
                className="home-rim__arc"
                viewBox={`0 0 ${arcViewBox.width} ${arcViewBox.height}`}
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path className="home-rim__arc-path" d="M-80 184C214 58 604 22 1280 184" />
            </svg>

            <HomeRimControl
                className="home-rim__control--locale"
                style={arcControlStyles.locale}
                label={props.copy.language}
                labelId="home-locale-label"
                labelPath="M18 58C42 22 78 14 104 40"
                startOffset="18%"
                ariaLabel={`${props.copy.language}: ${props.locale.toUpperCase()}`}
                onClick={() => props.setLocale(nextLocale)}
            >
                <span className="home-rim-control__orb-text">{props.locale}</span>
            </HomeRimControl>

            <HomeRimControl
                className="home-rim__control--theme"
                style={arcControlStyles.theme}
                label={props.copy.theme}
                labelId="home-theme-label"
                labelPath="M16 58C42 18 80 14 106 42"
                startOffset="16%"
                ariaLabel={props.copy.theme}
                onClick={() => props.setTheme(nextTheme)}
            >
                <span className="home-rim-control__theme-dot" aria-hidden="true" />
            </HomeRimControl>

            <HomeRimMenu
                style={arcControlStyles.menu}
                galleryLabel={props.copy.gallery}
                donateLabel={props.copy.donate}
                glassMode={glassMode}
                setGlassMode={setGlassMode}
            />
        </div>
    );
}

export default HomeRim;
