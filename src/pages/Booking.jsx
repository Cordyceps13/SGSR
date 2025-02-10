import Header from "../components/Header"
import { Panel } from "../components/Panel.jsx";
import Sidebar from "../components/Sidebar"
import { useState } from "react";
import { useAuth } from "../services/AuthProvider.jsx";

export const Booking = () => {
    const { session } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    return (
        <>
            <Header title="Reservar" openSidebar={toggleSidebar} />
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}></Sidebar>
            <Panel goTo={'/home'} />

        </>
    )
} 