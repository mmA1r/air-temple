import type { CSSProperties } from "react";

interface IArcPoint {
    x: number;
    y: number;
}

export interface IArcControlStyle extends CSSProperties {
    "--arc-x": string;
    "--arc-y": string;
    "--arc-angle": string;
}

export const arcViewBox = {
    width: 1200,
    height: 260,
    visibleHeightPercent: 34,
};

const arcPoints = {
    start: { x: -80, y: 184 },
    controlA: { x: 214, y: 58 },
    controlB: { x: 604, y: 22 },
    end: { x: 1280, y: 184 },
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

export function getArcControlStyles(isCompactViewport: boolean) {
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
