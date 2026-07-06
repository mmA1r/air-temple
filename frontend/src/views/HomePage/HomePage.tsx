"use client";

import AirEmblem from "@components/ui/icons/WaterKoi/WaterKoi";
import { useAppContext } from "@context/AppContext";

import HomeMobileGallery from "./HomeMobileGallery/HomeMobileGallery";
import HomeRim from "./HomeRim/HomeRim";
import HomeSocials from "./HomeSocials/HomeSocials";
import "./HomePage.scss";

function HomePage() {
    const { copy, locale, theme, setLocale, setTheme } = useAppContext();

    return (
        <div className="home-page">
            <section className="home-page__cover" aria-labelledby="home-title">
                <div className="home-page__stage" aria-hidden="true" />

                <div className="home-page__mark">
                    <AirEmblem />
                </div>

                <HomeMobileGallery label={copy.gallery} ariaLabel={copy.openGallery} />

                <HomeRim copy={copy} locale={locale} theme={theme} setLocale={setLocale} setTheme={setTheme} />

                <div className="home-page__identity">
                    <h1 className="home-page__title" id="home-title">
                        mmAir
                    </h1>
                </div>

                <HomeSocials label={copy.socials} />
            </section>
        </div>
    );
}

export default HomePage;
