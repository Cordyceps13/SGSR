import { useState } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import RoomList from '../components/RoomList.jsx';

const Home = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // const [isOpen, setIsOpen] = useState(false);


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    return (
        <>
            <Header title='Salas' openSidebar={toggleSidebar} />
            <RoomList title='Iniciar Reserva' ></RoomList>
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}></Sidebar>
        </>
    )
}

export default Home;