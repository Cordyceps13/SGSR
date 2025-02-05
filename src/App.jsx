import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Header from './components/Header.jsx';
import AuthForm from './components/AuthForm.jsx';
import { useAuth } from './services/AuthProvider.jsx';
import { loadUserTheme, updateMissedReservations } from './utils/DBfuncs.js'
import { Booking } from './pages/Booking.jsx';
import { Reservations } from './pages/Reservations.jsx';
import { EditReservation } from './components/EditReservation.jsx';


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
      </Routes>
    </BrowserRouter>
  )
}

export default App;