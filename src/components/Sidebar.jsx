import '../css/Sidebar.modules.css';
import { useState, useEffect } from 'react';
import { supabase } from '../services/DB_API';
import { useAuth } from '../services/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { updateUserTheme } from '../utils/DBfuncs';
// import Notification from './Notification';

const Sidebar = ({ isSidebarOpen, closeSidebar }) => {
    const [userData, setUserData] = useState([]);
    const { session, logoutUser } = useAuth();
    const navigate = useNavigate();


    const user = async () => {
        if (session?.user?.email) {
            const { data, error } = await supabase.from('utilizadores').select('*').eq('email', session.user.email).single();
            return error ? setUserData(null) : setUserData(data);
        }
    }

    useEffect(() => {
        user();

        const savedTheme = localStorage.getItem('theme') || 'light'
        const themeSpan = document.querySelector('#theme span');
        if (themeSpan) {
            themeSpan.textContent = savedTheme === 'light' ? 'Dark mode' : 'Light mode';
        }

    }, [session]);

    const handleLogout = async () => {
        const logout = window.confirm('Terminar sessão?')
        if (logout) {
            await logoutUser()
            navigate('/logreg');
        }
    }

    const toggleTheme = async () => {
        const isLightMode = document.body.classList.contains('light-theme');
        const newTheme = isLightMode ? 'dark' : 'light';

        document.body.classList.toggle('light-theme', newTheme === 'light');
        document.querySelector('#theme span').textContent = newTheme === 'light' ? 'Dark mode' : 'Light mode'

        await updateUserTheme(session.user.id, newTheme);
    };

    return (
        <>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className='profile'>
                    <img src={`../src/assets/imgs/${userData.foto}`} alt="Foto do utilizador" />
                    <h2>{userData ? userData.nome : 'Não há utilizadores'}</h2>
                    <div title='Fechar  menu'>
                        <svg onClick={closeSidebar} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="24" height="24">
                            <path d="m16.561,9.561l-2.439,2.439,2.439,2.439-2.121,2.121-2.439-2.439-2.439,2.439-2.121-2.121,2.439-2.439-2.439-2.439,2.121-2.121,2.439,2.439,2.439-2.439,2.121,2.121Zm7.439,2.439c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-3,0c0-4.963-4.037-9-9-9S3,7.037,3,12s4.038,9,9,9,9-4.037,9-9Z" />
                        </svg>
                    </div>
                </div>
                <div className='options'>
                    <ul>
                        {session && userData?.tipo ? <>
                            <li onClick={() => { navigate('/reservations'); closeSidebar(); }}>Gerir Reservas</li>
                            <li>Gerir Utilizadores</li>
                            <li>Gerir Salas</li>
                            <li>Gerir Equipamentos</li>
                            <li onClick={() => {navigate('/home'); closeSidebar();}}>Fazer Reserva</li>
                        </> :
                            <>
                                <li onClick={() => { navigate('/reservations'); closeSidebar(); }}>
                                    As minhas Reservas
                                </li>
                            </>}
                        <li className='theme' id='theme' title='Alternar Tema' onClick={toggleTheme}>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12,2A7,7,0,0,0,8,14.74V17a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V14.74A7,7,0,0,0,12,2ZM9,21a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V20H9Z" />
                            </svg>
                            <span></span>
                        </li>
                    </ul>
                </div>
                <p className='copyright'>&copy;2025 André Proença</p>
                <div className='logout' title='Logout'>
                    <svg onClick={handleLogout} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                        <path d="m15,2.5c0-1.381,1.119-2.5,2.5-2.5s2.5,1.119,2.5,2.5-1.119,2.5-2.5,2.5-2.5-1.119-2.5-2.5Zm4.319,10.5h4.681v-3h-3.319l-2.455-2.806c-.665-.759-1.625-1.194-2.634-1.194h-6.567l-2.396,5.391,2.741,1.219,1.604-3.609h1.529l-1.265,3.084c-.646,1.573-.07,3.375,1.428,4.322l4.333,2.466v5.128h3v-6.872l-4.439-2.525,1.668-3.992,2.09,2.389Zm-8.927,4.028l-.401.972h-5.991v-2h1.826c.111-1.253.174-2.595.174-4C6,5.373,4.657,0,3,0S0,5.373,0,12s1.343,12,3,12c.769,0,1.47-1.161,2-3.067v.067h7l.892-2.164-1.215-.692c-.499-.314-.918-.698-1.285-1.116Z" />
                    </svg>
                </div>
            </div>
        </>
    )

}

export default Sidebar;