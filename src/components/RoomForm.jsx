import { useState } from 'react';
import { updateUser } from '../utils/DBfuncs';
import { useNavigate } from 'react-router-dom';

const RoomForm = ({ user, onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user.nome || '',
        tipo: user.tipo || false,
    });
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await updateUser(user.id, formData);
        if (error) {
            console.error("Erro ao atualizar utilizador:", error);
            return;
        }
        alert('Utilizador atualizado com sucesso');
        onClose();
        navigate(0);
    };


    return (
        <>
            <div className="backdrop">
                <div className='form-container' >
                    <h2>Editar Utilizador</h2>
                    <form onSubmit={handleSubmit} id='user-form'>
                        <label >
                            <strong>Nome:&nbsp;</strong>
                            <input id='name' type="text" name="name" value={formData.name} onChange={handleChange} />
                        </label>
                        <label>
                            <strong>Admin: &nbsp;&nbsp;</strong>
                            <input  id='tipo' type="checkbox" name="tipo" checked={formData.tipo} onChange={handleChange} />
                        </label>
                        <div className='buttons'>
                            <button id='no' onClick={onClose}>Cancelar</button>
                            <button id='yes' type="submit">Submeter</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );


}

export default RoomForm;