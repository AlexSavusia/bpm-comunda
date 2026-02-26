import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";
import MainSidebar from "./MainSidebar";
import { Outlet } from "react-router";

export default function MainLayout() {
    return (
        <>
            <div
                className="preloader flex-column justify-content-center align-items-center"
                style={{ height: "0px" }}
            >
                <img
                    className="animation__shake"
                    src="logo.webp"
                    alt="AdminLTELogo"
                    height="60"
                    width="60"
                    style={{ display: "none" }}
                />
            </div>

            <MainHeader />
            <MainSidebar />

            <div className="content-wrapper">
                <Outlet />
            </div>

            <MainFooter />
        </>
    );
}
