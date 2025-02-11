import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { UsersList } from "../components/UsersList";
import { useState } from "react";

const UserManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }


    return (
        <>
            <Header title="Gerir Utilizadores" openSidebar={toggleSidebar} />
            <UsersList />
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}></Sidebar>
        </>
    )
}

export default UserManagement;