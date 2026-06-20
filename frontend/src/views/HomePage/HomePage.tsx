"use client";

import Link from "next/link";

import ElementMark from "../../components/ElementMark/ElementMark";
import { useAppContext } from "../../context/AppContext";

import "./HomePage.scss";

function HomePage() {
    const { copy } = useAppContext();

    return (
        <section className="home-page">
            <div className="home-page__content">
                <p className="home-page__eyebrow">Digital painting archive</p>
                <h1 className="home-page__title">{copy.heroTitle}</h1>
                <p className="home-page__lead">{copy.heroLead}</p>
                <Link className="home-page__button" href="/gallery">
                    {copy.openGallery}
                </Link>
            </div>
            <div className="home-page__visual" aria-hidden="true">
                <ElementMark />
            </div>
        </section>
    );
}

export default HomePage;
