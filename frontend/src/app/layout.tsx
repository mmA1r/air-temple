import type { Metadata, Viewport } from "next";

import AppShell from "@components/AppShell/AppShell";
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

function RootLayout(props: IRootLayoutProps) {
    return (
        <html lang="en">
            <body>
                <AppShell>
                    {props.children}
                </AppShell>
            </body>
        </html>
    );
}

export default RootLayout;
