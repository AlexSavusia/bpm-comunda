import {IoIosDocument} from "react-icons/io";
import {MdAlbum} from "react-icons/md";
import {IoCalculatorOutline, IoListOutline} from "react-icons/io5";

export default function MainSidebar() {
    return (
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
            <a href="/" className="brand-link">
                <img src="logo.webp" alt="AdminLTE Logo" className="brand-image img-circle elevation-3"/>
                <span className="brand-text font-weight-light">Конструктор</span>
            </a>
            <div className="sidebar">
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="image">
                        <img src="logo.webp" className="img-circle elevation-2" alt="User Image"/>
                    </div>
                    <div className="info">
                        <a href="#" className="d-block">Alexander Pierce</a>
                    </div>
                </div>
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
                        
                    </ul>
                </nav>
            </div>
        </aside>
    )
}