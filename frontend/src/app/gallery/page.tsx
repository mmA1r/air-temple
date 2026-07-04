import type { Metadata } from "next";

import GalleryPage from "@views/GalleryPage/GalleryPage";

export const metadata: Metadata = {
    title: "Gallery",
    description: "Browse Air Temple digital paintings grouped by year.",
};

function Page() {
    return <GalleryPage />;
}

export default Page;
