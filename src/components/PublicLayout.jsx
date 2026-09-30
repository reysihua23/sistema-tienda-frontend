// components/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ searchQuery, setSearchQuery }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}