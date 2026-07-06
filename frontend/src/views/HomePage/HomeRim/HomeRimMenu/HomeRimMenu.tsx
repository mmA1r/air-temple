import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import Link from "next/link";

import type { IArcControlStyle } from "../homeRimArc";
import "./HomeRimMenu.scss";

interface IMenuItemStyle extends CSSProperties {
    "--menu-index": number;
}

interface IMenuLink {
    label: string;
    className: string;
    openClassName: string;
    style: IMenuItemStyle;
    href?: string;
    external?: boolean;
    onClick?: () => void;
}

interface IHomeRimMenuProps {
    style: IArcControlStyle;
    galleryLabel: string;
    donateLabel: string;
    glassMode: "rich" | "simple";
    setGlassMode: (glassMode: "rich" | "simple") => void;
}

function HomeRimMenu(props: IHomeRimMenuProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const nextGlassMode = props.glassMode === "rich" ? "simple" : "rich";
    const menuLinks: IMenuLink[] = [
        {
            label: props.galleryLabel,
            href: "/gallery",
            className: "home-rim-menu__link home-rim-menu__link--gallery",
            openClassName: "home-rim-menu__link home-rim-menu__link--gallery home-rim-menu__link--gallery-open",
            style: { "--menu-index": 0 },
        },
        {
            label: props.donateLabel,
            href: "https://boosty.to",
            external: true,
            className: "home-rim-menu__link home-rim-menu__link--donate",
            openClassName: "home-rim-menu__link home-rim-menu__link--donate home-rim-menu__link--donate-open",
            style: { "--menu-index": 1 },
        },
        {
            label: `Glass: ${props.glassMode}`,
            onClick: () => props.setGlassMode(nextGlassMode),
            className: "home-rim-menu__link home-rim-menu__link--glass",
            openClassName: "home-rim-menu__link home-rim-menu__link--glass home-rim-menu__link--glass-open",
            style: { "--menu-index": 2 },
        },
    ];

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

    return (
        <div className="home-rim-menu" ref={menuRef} style={props.style}>
            <button
                className="home-rim-menu__orb"
                type="button"
                onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                aria-expanded={isMenuOpen}
                aria-controls="home-menu"
                aria-label="Menu"
            >
                <span className="home-rim-menu__bar home-rim-menu__bar--top" />
                <span className="home-rim-menu__bar home-rim-menu__bar--bottom" />
            </button>
            <nav className={isMenuOpen ? "home-rim-menu__panel home-rim-menu__panel--open" : "home-rim-menu__panel"} id="home-menu" aria-label="Home navigation">
                {menuLinks.map((menuLink) => {
                    if (menuLink.href && menuLink.external) {
                        return (
                            <a
                                className={isMenuOpen ? menuLink.openClassName : menuLink.className}
                                href={menuLink.href}
                                key={menuLink.label}
                                target="_blank"
                                rel="noreferrer"
                                style={menuLink.style}
                            >
                                {menuLink.label}
                            </a>
                        );
                    }

                    if (menuLink.href) {
                        return (
                            <Link className={isMenuOpen ? menuLink.openClassName : menuLink.className} href={menuLink.href} key={menuLink.label} style={menuLink.style}>
                                {menuLink.label}
                            </Link>
                        );
                    }

                    return (
                        <button
                            className={isMenuOpen ? menuLink.openClassName : menuLink.className}
                            key={menuLink.label}
                            type="button"
                            onClick={menuLink.onClick}
                            style={menuLink.style}
                        >
                            {menuLink.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

export default HomeRimMenu;
