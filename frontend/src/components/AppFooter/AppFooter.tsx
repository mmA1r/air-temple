"use client";

import { useAppContext } from "@context/AppContext";

import "./AppFooter.scss";

function AppFooter() {
    const { copy } = useAppContext();

    const socialLinks = [
        {
            label: "Instagram",
            href: "https://www.instagram.com/_mmair_",
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

    return (
        <footer className="app-footer">
            <div className="app-footer__group">
                <span className="app-footer__label">{copy.socials}</span>
                <ul className="app-footer__links">
                    {socialLinks.map((social) => (
                        <li key={social.label}>
                            <a
                                className={`app-footer__social${social.stroke ? " app-footer__social--stroke" : ""}`}
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={social.label}
                            >
                                <svg viewBox={social.viewBox} aria-hidden="true">
                                    <path d={social.path} />
                                </svg>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <a className="app-footer__donate" href="https://boosty.to" target="_blank" rel="noreferrer">
                {copy.donate}
            </a>
        </footer>
    );
}

export default AppFooter;
