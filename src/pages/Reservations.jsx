import RoomList from "../components/RoomList";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar"
import { useState } from "react";
import { ReservationList } from "../components/ReservationList";

export const Reservations = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }
    return (
        <>
            <Header openSidebar={toggleSidebar} title="As minhas reservas"/>
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}/>
            <ReservationList />
        </>
    )
}