import MainHeader from "./MainHeader.tsx";
import MainFooter from "./MainFooter.tsx";
import MainSidebar from "./MainSidebar.tsx";
import {Outlet} from "react-router";

export default function MainLayout() {
    return (
        <>
            <div className="preloader flex-column justify-content-center align-items-center " style={{height:'0px'}}>
                <img className="animation__shake" src="logo.webp" alt="AdminLTELogo" height="60" width="60"
                     style={{display: 'none'}}/>
            </div>
            <MainHeader/>
            <MainSidebar/>
            <div className="content-wrapper">
                <Outlet/>
            </div>
            <MainFooter/></>

    )
}