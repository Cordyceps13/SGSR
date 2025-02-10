import { fetchUser } from "../utils/DBfuncs"
import { useEffect, useState } from "react"
import '../css/RoomList.modules.css'
import { useNavigate } from "react-router-dom";
import { deleteUser } from "../utils/DBfuncs";
import EditForm from "./EditForm";

export const UsersList = () => {
    const [user, setUser] = useState([]);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);


    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const { data, error } = await fetchUser();
            if (error) {
                return { error }
            }
            setUser(Array.isArray(data) ? data : []);
        };
        load();
    }, []);

    const handleEdit = (u) => {
        setSelectedUser(u);
        setShowEditForm(true);
    };

    const handleDelete = async (userId) => {
        const { error } = await deleteUser(userId);
        if (error) {
            console.error("Erro ao eliminar utilizador:", error);
        }
        navigate(0);
    };


    return (
        <>
            <div className="list-container">
                {user.map((u, index) => {
                    return (
                        <div className="item reservation" key={index}>
                            <div className="foto"><img src={`../src/assets/imgs/${u.foto}`} alt="Foto de perfil" /></div>
                            <div className="user-info">
                                <p><strong>Nome: </strong>{u.nome}</p>
                                <p><strong>Email: </strong>{u.email}</p>
                                <p><strong>Admin: </strong>{`${u.tipo}`}</p>
                            </div>
                            <div className="opcoes">
                                <div title="Eliminar Utilizador" className="cancel" onClick={() => handleDelete(u.id)} >
                                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                        <path d="m16.561,9.561l-2.439,2.439,2.439,2.439-2.121,2.121-2.439-2.439-2.439,2.439-2.121-2.121,2.439-2.439-2.439-2.439,2.121-2.121,2.439,2.439,2.439-2.439,2.121,2.121Zm7.439,2.439c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-3,0c0-4.963-4.037-9-9-9S3,7.037,3,12s4.038,9,9,9,9-4.037,9-9Z" />
                                    </svg>
                                </div>
                                <div title="Editar reserva" className="edit"  onClick={() => handleEdit(u)}>
                                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                        <path d="M22.987,5.452c-.028-.177-.312-1.767-1.464-2.928-1.157-1.132-2.753-1.412-2.931-1.44-.237-.039-.479,.011-.682,.137-.071,.044-1.114,.697-3.173,2.438,1.059,.374,2.428,1.023,3.538,2.109,1.114,1.09,1.78,2.431,2.162,3.471,1.72-2.01,2.367-3.028,2.41-3.098,.128-.205,.178-.45,.14-.689Z" />
                                        <path d="M12.95,5.223c-1.073,.968-2.322,2.144-3.752,3.564C3.135,14.807,1.545,17.214,1.48,17.313c-.091,.14-.146,.301-.159,.467l-.319,4.071c-.022,.292,.083,.578,.29,.785,.188,.188,.443,.293,.708,.293,.025,0,.051,0,.077-.003l4.101-.316c.165-.013,.324-.066,.463-.155,.1-.064,2.523-1.643,8.585-7.662,1.462-1.452,2.668-2.716,3.655-3.797-.151-.649-.678-2.501-2.005-3.798-1.346-1.317-3.283-1.833-3.927-1.975Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            {showEditForm && <EditForm user={selectedUser} onClose={() => setShowEditForm(false)} />}
        </>
    )
}