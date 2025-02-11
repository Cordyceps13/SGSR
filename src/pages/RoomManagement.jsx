import Header from "../components/Header";
import RoomList from "../components/RoomList";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const RoomManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }
    return (
        <>
            <Header title='Gerir Salas' openSidebar={toggleSidebar} />
            <RoomList manage={true}></RoomList>
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}></Sidebar>
        </>
    )
}

export default RoomManagement;