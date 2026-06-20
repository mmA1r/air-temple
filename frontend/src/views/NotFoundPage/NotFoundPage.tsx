"use client";

import Link from "next/link";

import { useAppContext } from "../../context/AppContext";

import "./NotFoundPage.scss";

function NotFoundPage() {
    const { copy } = useAppContext();

    return (
        <section className="not-found-page">
            <p className="not-found-page__eyebrow">404</p>
            <h1 className="not-found-page__title">Page not found</h1>
            <Link className="not-found-page__link" href="/">
                {copy.home}
            </Link>
        </section>
    );
}

export default NotFoundPage;
