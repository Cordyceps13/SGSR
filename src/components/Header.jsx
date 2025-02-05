import '../css/Header.modules.css';
import { useState, useEffect } from 'react';
import Notification from './Notification.jsx';
import { useAuth } from '../services/AuthProvider.jsx';

const Header = ({title = 'Salas de Reuniões', openSidebar, isAuthPage}) => {
    const [notification, setNotification] = useState(0);
    const {session} = useAuth();

    return (
        <div className="container">
            <nav className="header wrapper">
                {!isAuthPage && session && 
                <div className='h-menu' title='Menu'>
                    <svg onClick={openSidebar} className="h-menu-icon" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" xmlSpace="preserve" width="512" height="512">
                        <g>
                            <path d="M480,224H32c-17.673,0-32,14.327-32,32s14.327,32,32,32h448c17.673,0,32-14.327,32-32S497.673,224,480,224z" />
                            <path d="M32,138.667h448c17.673,0,32-14.327,32-32s-14.327-32-32-32H32c-17.673,0-32,14.327-32,32S14.327,138.667,32,138.667z" />
                            <path d="M480,373.333H32c-17.673,0-32,14.327-32,32s14.327,32,32,32h448c17.673,0,32-14.327,32-32S497.673,373.333,480,373.333z" />
                        </g>
                    </svg>
                    {notification > 0 && (
                        <Notification notification={notification}/>
                    )}
                    {/* <button onClick={() => setNotification(notification +1)}>click</button> */}
                </div>}
                <h1 className="page-title">{title}</h1>
                {!isAuthPage && session && 
                <div className="search-bar" title='Pesquisar aqui'>
                    <input className='search-input' type="text" name="search-input" placeholder='Pesquisar...' />
                    <svg className='icon' xmlns="http://www.w3.org/2000/svg" id="Outline"  viewBox="0 0 24 24" width="24" height="36">
                        <path fill='currentColor' d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z" />
                    </svg>
                </div>}
            </nav>
        </div>
    );
}

export default Header;