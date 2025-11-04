import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"

export const Layout = () => {
    return (
        <ScrollToTop>
            {/* App shell makes a full-height column so footer can sit at the bottom */}
            <div className="app-shell">
                <Navbar />
                <main className="app-main">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ScrollToTop>
    )
}