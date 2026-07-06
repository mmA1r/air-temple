import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

import AppShell from "@components/AppShell/AppShell";
import type { ThemeName } from "@app-types";
import "@styles/index.scss";

export const metadata: Metadata = {
    title: {
        default: "Air Temple | Digital Painting Gallery",
        template: "Air Temple | %s",
    },
    description: "A personal digital painting gallery with artwork archives, process sequences, and source downloads.",
    applicationName: "Air Temple",
    openGraph: {
        title: "Air Temple | Digital Painting Gallery",
        description: "A personal digital painting gallery with artwork archives, process sequences, and source downloads.",
        type: "website",
        siteName: "Air Temple",
    },
    twitter: {
        card: "summary_large_image",
        title: "Air Temple | Digital Painting Gallery",
        description: "A personal digital painting gallery with artwork archives, process sequences, and source downloads.",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#eef8fb" },
        { media: "(prefers-color-scheme: dark)", color: "#1f1714" },
    ],
};

interface IRootLayoutProps {
    children: React.ReactNode;
}

const themeCookieKey = "air-temple-theme";

function getValidTheme(value: string | undefined): ThemeName {
    return value === "fire-earth" ? "fire-earth" : "water-air";
}

async function RootLayout(props: IRootLayoutProps) {
    const cookieStore = await cookies();
    const initialTheme = getValidTheme(cookieStore.get(themeCookieKey)?.value);

    return (
        <html lang="en" data-theme={initialTheme}>
            <body>
                <AppShell initialTheme={initialTheme}>
                    {props.children}
                </AppShell>
            </body>
        </html>
    );
}

export default RootLayout;
