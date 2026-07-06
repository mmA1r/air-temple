import { gsap } from "gsap";

import type { ThemeName } from "@app-types";

const themeVariableNames = [
    "background",
    "surface",
    "text",
    "muted",
    "accent",
    "mark-a",
    "mark-b",
    "hero-fallback",
    "hero-ink",
    "hero-shadow",
    "theme-water-opacity",
    "theme-fire-opacity",
    "glass-tint-top",
    "glass-tint-bottom",
    "glass-blur",
    "glass-saturate",
    "glass-contrast",
    "bubble-ink",
    "bubble-hover",
    "gallery-frame-radius",
] as const;

type ThemeVariableName = (typeof themeVariableNames)[number];
type ThemeVariableTarget = Record<`--${ThemeVariableName}`, string>;

function resolveThemeValue(value: string, style: CSSStyleDeclaration, seenNames: Set<string> = new Set()): string {
    const trimmedValue = value.trim();
    const variableMatch = trimmedValue.match(/^var\((--[^),\s]+)(?:,\s*([^)]+))?\)$/);

    if (!variableMatch) {
        return trimmedValue;
    }

    const variableName = variableMatch[1];
    const fallbackValue = variableMatch[2] ?? "";

    if (seenNames.has(variableName)) {
        return fallbackValue.trim();
    }

    seenNames.add(variableName);

    const resolvedValue = style.getPropertyValue(variableName).trim();

    return resolveThemeValue(resolvedValue || fallbackValue, style, seenNames);
}

function getTransitionDuration(style: CSSStyleDeclaration): number {
    const durationValue = Number(style.getPropertyValue("--theme-transition-duration"));

    return Number.isFinite(durationValue) && durationValue > 0 ? durationValue : 0.76;
}

function getTransitionEase(style: CSSStyleDeclaration): string {
    const ease = style.getPropertyValue("--theme-transition-ease").trim();

    return ease || "power1.inOut";
}

function getThemeVariableTargets(style: CSSStyleDeclaration, nextTheme: ThemeName): ThemeVariableTarget {
    return themeVariableNames.reduce<Partial<ThemeVariableTarget>>((targets, name) => {
        const baseVariableName = `--${name}` as const;
        const themeVariableName = `--${name}_${nextTheme}`;
        const themeValue = resolveThemeValue(style.getPropertyValue(themeVariableName), style);

        if (themeValue) {
            targets[baseVariableName] = themeValue;
        }

        return targets;
    }, {}) as ThemeVariableTarget;
}

function setCurrentThemeVariables(root: HTMLElement, style: CSSStyleDeclaration) {
    themeVariableNames.forEach((name) => {
        const baseVariableName = `--${name}`;
        const currentValue = resolveThemeValue(style.getPropertyValue(baseVariableName), style);

        if (currentValue) {
            root.style.setProperty(baseVariableName, currentValue);
        }
    });
}

export function animateThemeVariables(nextTheme: ThemeName) {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    const targets = getThemeVariableTargets(style, nextTheme);
    const duration = getTransitionDuration(style);
    const ease = getTransitionEase(style);

    gsap.killTweensOf(root);
    setCurrentThemeVariables(root, style);

    root.dataset.themeTransitioning = "true";
    root.dataset.theme = nextTheme;

    gsap.to(root, {
        ...targets,
        duration,
        ease,
        onComplete: () => {
            Object.keys(targets).forEach((targetName) => {
                root.style.removeProperty(targetName);
            });
            delete root.dataset.themeTransitioning;
        },
    });
}
