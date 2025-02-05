import RoomList from "../components/RoomList";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar"
import { useState } from "react";
import { ReservationList } from "../components/ReservationList";
import { useAuth } from "../services/AuthProvider";

export const Reservations = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { session } = useAuth();
    let title = '';

    if (session.user.tipo){
        title = 'Gerir Reservas';
    } else{
        title = 'As minhas reservas';
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }
    return (
        <>
            <Header openSidebar={toggleSidebar} title={title}/>
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}/>
            <ReservationList />
        </>
    )
}