import '../css/AuthForm.modules.css';
import { useState } from 'react';
import { createUser, login } from '../utils/DBfuncs';
import { useAuth } from '../services/AuthProvider';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
    const [registerForm, setRegisterForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        pass: '',
        rePass: ''
    });
    const { loginUser, session } = useAuth();
    const navigate = useNavigate();

    const toggleForm = () => {
        setRegisterForm(!registerForm);
        setFormData({
            name: '',
            email: '',
            pass: '',
            rePass: ''
        });
    };

    const handleOnChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (registerForm) {
            const { data, error } = await createUser(formData);
            if (error) {
                return { error }
            }
            toggleForm();
            return { data };
        }
        const { data, error } = await login(formData);
        if (error) {
            return { error }
        }
        loginUser(data)
        session.user.tipo ? navigate('/reservations') : navigate('/home');
    };

    return (
        <div className="form-container">
            <h2 className="auth-title">{registerForm ? 'Efetuar Registo' : 'Iniciar sessão'}</h2>
            <form className="auth-form" onSubmit={handleSubmit} >
                {registerForm &&
                    <input name='name' onChange={handleOnChange} type="text" value={formData.name || ''} placeholder="Nome..." />
                }
                <input name='email' onChange={handleOnChange} type="email" value={formData.email || ''} placeholder="Email..." />
                <input className={!registerForm ? 'pass' : ''} name='pass' onChange={handleOnChange} type="password" value={formData.pass || ''} placeholder="Password..." />

                {registerForm &&
                    <>
                        <input className='pass' name='rePass' onChange={handleOnChange} type="password" value={formData.rePass || ''} placeholder="Repetir password..." />
                        <svg onClick={toggleForm} xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="24" height="24">
                            <path fill='currentColor' d="M10.6,12.71a1,1,0,0,1,0-1.42l4.59-4.58a1,1,0,0,0,0-1.42,1,1,0,0,0-1.41,0L9.19,9.88a3,3,0,0,0,0,4.24l4.59,4.59a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42Z" />
                        </svg>
                    </>
                }
                <button type="submit">Ok</button>
            </form>
            {!registerForm && <h5 onClick={toggleForm}>Ainda não me registei</h5>}
        </div>
    );
};

export default AuthForm;