import Header from "../components/Header";
import { Panel } from "../components/Panel";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

export const Details = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }
    return (
        <>
            <Header title='Reservar' openSidebar={toggleSidebar} />
            <Panel details={true} />
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}></Sidebar>
        </>
    )
}