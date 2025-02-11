import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Header from './components/Header.jsx';
import AuthForm from './components/AuthForm.jsx';
import { useAuth } from './services/AuthProvider.jsx';
import { loadUserTheme, updateMissedReservations, concludeReservation } from './utils/DBfuncs.js'
import { Booking } from './pages/Booking.jsx';
import { Reservations } from './pages/Reservations.jsx';
import { EditReservation } from './components/EditReservation.jsx';
import { Details } from './pages/Details.jsx';
// import { UserManagement } from './pages/UserManagement.jsx';
import UserManagement  from './pages/UserManagement.jsx';
import RoomManagement from './pages/RoomManagement.jsx';



const PrivateRoute = ({ children }) => {
  const { session } = useAuth();

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data, error } = await updateMissedReservations();
      if (error) {
        console.error('Erro ao definir reservas expiradas:', error);
        return;
      } else {
        console.log('Reservas expiradas atualizadas:', data);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data, error } = await concludeReservation();
      if (error) {
        console.error('Erro ao definir reservas concluídas:', error);
        return;
      } else {
        console.log('Reservas concluídas atualizadas:', data);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (session.user) {
      loadUserTheme(session.user.id);
    }
  }, []);
  return session ? children : <Navigate to="/logreg" />;
};

const App = () => {

  return (

    <BrowserRouter>
      <Routes>
        <Route path='/logreg' element={<><Header isAuthPage={true} /><AuthForm /></>} />
        <Route path='/home' element={<PrivateRoute> <Home /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/logreg" />} />
        <Route path='/booking' element={<PrivateRoute><Booking /></PrivateRoute>} />
        <Route path='/reservations' element={<PrivateRoute><Reservations /></PrivateRoute>} />
        <Route path='/editReservation' element={<PrivateRoute><EditReservation /></PrivateRoute>} />
        <Route path='/details' element={<PrivateRoute><Details /></PrivateRoute>} />
        <Route path='/userManagement' element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path='/roomManagement' element={<PrivateRoute><RoomManagement /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;