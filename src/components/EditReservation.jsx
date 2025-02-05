import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx';
import { Panel } from './Panel.jsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const EditReservation = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    return (
        <>
            <Header title="Reserva" openSidebar={toggleSidebar} />
            <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={toggleSidebar}></Sidebar>
            <Panel goTo='/reservations' edit={true} />
            <svg onClick={() => navigate('/reservations')} id='back-arrow' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512">
                <path fill="currentColor" d="M10.6,12.71a1,1,0,0,1,0-1.42l4.59-4.58a1,1,0,0,0,0-1.42,1,1,0,0,0-1.41,0L9.19,9.88a3,3,0,0,0,0,4.24l4.59,4.59a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42Z" />
            </svg>
        </>
    );
}