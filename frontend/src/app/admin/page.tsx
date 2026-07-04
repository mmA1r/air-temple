import type { Metadata } from "next";

import AdminPage from "@views/AdminPage/AdminPage";

export const metadata: Metadata = {
    title: "Admin",
    robots: {
        index: false,
        follow: false,
    },
};

function Page() {
    return <AdminPage />;
}

export default Page;
