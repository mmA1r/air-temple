"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import GalleryPortal from "@components/ui/icons/GalleryPortal/GalleryPortal";
import { useAppContext } from "@context/AppContext";
import usePresentationArtworks from "@hooks/usePresentationArtworks";
import type { IArtwork } from "@app-types";

import "./PresentationCollage.scss";

const itemDepths = [0.32, 0.18, 0.4, 0.24, 0.34, 0.16, 0.28];
const skeletonItems = [1, 2, 3, 4, 5];

function getPreviewUrl(artwork: IArtwork): string {
    const webVariant = artwork.coverAsset?.variants.find((variant) => variant.name.toLowerCase().includes("web"));

    return webVariant?.url || artwork.coverAsset?.url || "";
}

function PresentationCollage() {
    const { copy, locale } = useAppContext();
    const { artworks, hasError, isLoading } = usePresentationArtworks(locale);
    const sectionRef = useRef<HTMLElement>(null);
    const dividerAnimationRef = useRef<SVGAnimateElement>(null);

    useEffect(() => {
        const section = sectionRef.current;

        if (!section || isLoading || hasError || artworks.length === 0) {
            return;
        }

        const activeSection = section;
        const revealElements = Array.from(activeSection.querySelectorAll<HTMLElement>("[data-reveal]"));
        const itemElements = Array.from(activeSection.querySelectorAll<HTMLElement>("[data-depth]"));
        const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let hasAnimatedDivider = false;
        let animationFrameId: number | null = null;
        let pointerX = 0;
        let pointerY = 0;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");

                    if (entry.target.hasAttribute("data-divider") && !hasAnimatedDivider) {
                        dividerAnimationRef.current?.beginElement();
                        hasAnimatedDivider = true;
                    }

                    observer.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -12%", threshold: 0.08 },
        );

        revealElements.forEach((element) => observer.observe(element));

        if (window.location.hash === "#presentation") {
            activeSection.scrollIntoView();
        }

        function updateMotion() {
            animationFrameId = null;

            if (reducedMotionQuery.matches) {
                return;
            }

            const sectionRect = activeSection.getBoundingClientRect();
            const travelDistance = window.innerHeight + sectionRect.height;
            const progress = Math.min(1, Math.max(0, (window.innerHeight - sectionRect.top) / travelDistance));

            itemElements.forEach((element) => {
                const depth = Number(element.dataset.depth || 0);
                const scrollOffset = (0.5 - progress) * depth * 150;
                const pointerOffsetX = pointerX * depth * 18;
                const pointerOffsetY = pointerY * depth * 12;

                element.style.setProperty("--collage-shift-x", `${pointerOffsetX.toFixed(2)}px`);
                element.style.setProperty("--collage-shift-y", `${(scrollOffset + pointerOffsetY).toFixed(2)}px`);
            });
        }

        function scheduleMotionUpdate() {
            if (animationFrameId === null) {
                animationFrameId = window.requestAnimationFrame(updateMotion);
            }
        }

        function handlePointerMove(event: PointerEvent) {
            const sectionRect = activeSection.getBoundingClientRect();

            pointerX = ((event.clientX - sectionRect.left) / sectionRect.width - 0.5) * 2;
            pointerY = ((event.clientY - sectionRect.top) / sectionRect.height - 0.5) * 2;
            scheduleMotionUpdate();
        }

        function handlePointerLeave() {
            pointerX = 0;
            pointerY = 0;
            scheduleMotionUpdate();
        }

        if (!reducedMotionQuery.matches) {
            window.addEventListener("scroll", scheduleMotionUpdate, { passive: true });
            activeSection.addEventListener("pointermove", handlePointerMove, { passive: true });
            activeSection.addEventListener("pointerleave", handlePointerLeave);
            scheduleMotionUpdate();
        }

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", scheduleMotionUpdate);
            activeSection.removeEventListener("pointermove", handlePointerMove);
            activeSection.removeEventListener("pointerleave", handlePointerLeave);

            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [artworks, hasError, isLoading]);

    if (isLoading) {
        return (
            <section className="presentation-collage presentation-collage--loading" aria-hidden="true">
                {skeletonItems.map((item) => (
                    <span className={`presentation-collage__skeleton presentation-collage__skeleton--${item}`} key={item} />
                ))}
            </section>
        );
    }

    if (hasError || artworks.length === 0) {
        return null;
    }

    return (
        <section
            id="presentation"
            className={`presentation-collage presentation-collage--count-${artworks.length}`}
            aria-label={copy.gallery}
            ref={sectionRef}
        >
            <svg
                className="presentation-collage__divider"
                viewBox="0 0 1440 180"
                preserveAspectRatio="none"
                aria-hidden="true"
                data-divider
                data-reveal
            >
                <path d="M0 62C310 8 522 154 808 93C1067 38 1238 14 1440 72V180H0V62Z">
                    <animate
                        ref={dividerAnimationRef}
                        attributeName="d"
                        begin="indefinite"
                        dur="1.2s"
                        fill="freeze"
                        from="M0 62C310 8 522 154 808 93C1067 38 1238 14 1440 72V180H0V62Z"
                        to="M0 90C260 145 488 20 786 76C1050 126 1258 122 1440 54V180H0V90Z"
                    />
                </path>
            </svg>
            <img
                className="presentation-collage__cloud"
                src="/legacy/intro/fore-cloud.webp"
                alt=""
                aria-hidden="true"
                decoding="async"
            />
            <div className="presentation-collage__scene">
                {artworks.map((artwork, index) => (
                    <Link
                        className={`presentation-collage__item presentation-collage__item--${index + 1}`}
                        href={`/artworks/${artwork.slug}`}
                        aria-label={artwork.title}
                        data-depth={itemDepths[index]}
                        data-reveal
                        key={artwork.id}
                    >
                        <img
                            className="presentation-collage__image"
                            src={getPreviewUrl(artwork)}
                            alt={artwork.title}
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            decoding="async"
                        />
                    </Link>
                ))}
            </div>
            <div className="presentation-collage__portal" data-reveal>
                <GalleryPortal label={copy.openGallery} tone="surface" />
            </div>
        </section>
    );
}

export default PresentationCollage;
