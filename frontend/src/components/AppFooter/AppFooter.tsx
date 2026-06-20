"use client";

import { useAppContext } from "../../context/AppContext";

import "./AppFooter.scss";

function AppFooter() {
    const { copy } = useAppContext();

    return (
        <footer className="app-footer">
            <div className="app-footer__group">
                <span className="app-footer__label">{copy.socials}</span>
                <a className="app-footer__link" href="https://artstation.com" target="_blank" rel="noreferrer">
                    ArtStation
                </a>
                <a className="app-footer__link" href="https://pixiv.net" target="_blank" rel="noreferrer">
                    Pixiv
                </a>
            </div>
            <a className="app-footer__donate" href="https://boosty.to" target="_blank" rel="noreferrer">
                {copy.donate}
            </a>
        </footer>
    );
}

export default AppFooter;
