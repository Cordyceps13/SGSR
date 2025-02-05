import Header from "../components/Header"
import { Panel } from "../components/Panel.jsx";
import Sidebar from "../components/Sidebar"
import { useState } from "react";

export const Booking = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    return (
        <>
            <Header title="Reserva" openSidebar={toggleSidebar}/>
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}></Sidebar>
            <Panel edit={false} />
        </>
    )
} 