import { fetchUser } from "../services/DBfuncs"
import { useEffect, useState } from "react"

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
    },[]);


      // const handleDelete = async (userId, username) => {
    //     const { error } = await deleteUser(userId, username);
    //     if (!error) {
    //         setRooms(users.filter(user => user.id !== userId));
    //     } else {
    //         console.error("Erro ao apagar utilizador:", error);
    //     }
    // };
    

    return (
        <div>
            {user.map((u) => {
                return (
                    <div>
                        <p>{`Nome: ${u.nome}`}</p>
                        <p>{`Email: ${u.email}`}</p>
                        <p>{`Tipo: ${u.tipo}`}</p>
                        <p>{`Password: ${u.password}`}</p>
                        <p>{`Tema: ${u.tema}`}</p>
                        <p>Foto: <img height={100} src={`../src/assets/imgs/${u.foto}`} alt="Foto de perfil"/></p>
                        <br /><br /><br />
                    </div>
                )
            })}
        </div>
    )
}