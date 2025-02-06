import { fetchUser } from "../utils/DBfuncs"
import { useEffect, useState } from "react"
import '../css/RoomList.modules.css'

export const UsersList = () => {
    const [user, setUser] = useState([]);

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


    // const handleDelete = async (userId, username) => {
    //     const { error } = await deleteUser(userId, username);
    //     if (!error) {
    //         setRooms(users.filter(user => user.id !== userId));
    //     } else {
    //         console.error("Erro ao apagar utilizador:", error);
    //     }
    // };


    return (
        <div className="list-container">
            {user.map((u, index) => {
                return (
                    <div className="item" key={index}>
                        <div className="foto"><img height={100} src={`../src/assets/imgs/${u.foto}`} alt="Foto de perfil" /></div>
                        <div className="user-info">
                            <div className="detail1">
                                <p>{`Nome: ${u.nome}`}</p>
                                <p>{`Email: ${u.email}`}</p>
                            </div>
                            <div className="detail2">
                                <p>{`Admin: ${u.tipo}`}</p>
                                <p>{`Tema: ${u.tema}`}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}