import { useState, useEffect } from "react";
import '../css/RoomList.modules.css';
import { fetchExtraByReservation, fetchReservation, fetchReservationByUser, fetchRoomByReservation, fetchUser } from "../utils/DBfuncs";
import { useAuth } from "../services/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/DB_API";


export const ReservationList = ({ title = '' }) => {
    let aviso = 'Ainda não tem reservas'
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState('Todas');
    const [extras, setExtras] = useState([]);
    const [users, setUsers] = useState([]);
    const { session } = useAuth();
    const userID = session?.user?.id;
    const navigate = useNavigate();

    !session.user.tipo ? useEffect(() => {

        const loadReservations = async () => {
            const { data, error } = await fetchReservationByUser(userID);
            if (data) {
                setReservations(data);
                setLoading(false);
                return { data };
            }
            console.log('Erro ao carregar reservas');
            return { error };
        }

        loadReservations();
    }, [userID])

        :
        useEffect(() => {

            const loadReservations = async () => {
                const { data, error } = await fetchReservation();
                if (data) {
                    setReservations(data);
                    setLoading(false);
                    return { data };
                }
                console.log('Erro ao carregar reservas');
                return { error };
            }

            loadReservations();
        }, [userID])

    useEffect(() => {
        const loadUsers = async () => {
            const { data, error } = await fetchUser();
            if (data) {
                setUsers(data);
                setLoading(false);
                return { data };
            }
            console.log('Erro ao carregar reservas');
            return { error };
        }
        loadUsers();
    }, []);

    useEffect(() => {
        setLoading(true);
        const loadRooms = async () => {
            const roomList = await Promise.all(reservations.map(async (reservation) => {
                const { data: roomData, error } = await fetchRoomByReservation(reservation.id);
                if (roomData) {
                    return { ...roomData, reservation };
                }
                return null;
            }));

            setRooms(roomList.filter(room => room !== null));
            setLoading(false);
        };

        loadRooms();
    }, [reservations]);

    useEffect(() => {
        const loadExtras = async () => {
            const extrasList = await Promise.all(reservations.map(async (reservation) => {
                const { data: extraData, error } = await fetchExtraByReservation(reservation.id);
                if (extraData) {
                    return { ...extraData, reservation };
                }
                return null;
            }));
            setExtras(extrasList.filter(extra => extra !== null));
        }
        loadExtras();
    }, [reservations]);

    const filteredRooms = rooms.filter(room => {
        if (!selected || selected === 'Todas') return true;
        const estado = selected.at(0).toUpperCase() + selected.substring(1) + 's';
        aviso = session.user.tipo ? `Não existem reservas ${estado} de momento` : `Não tem reservas ${estado}`
        return room.reservation.estado.toLowerCase() === selected.toLowerCase();
    });

    const groupedRooms = rooms.reduce((groups, room) => {
        const status = room.reservation.estado;
        if (!groups[status]) {
            groups[status] = [];
        }
        groups[status].push(room);
        return groups;
    }, {});

    const toggleSelect = (value) => {
        setSelected(selected === value ? null : value);
    };
    
    const username = loading ? '' : users.find(user => user.id === userID)?.nome;

    const handleClick = (
        id,
        foto,
        nome,
        capacidade,
        tv,
        quadro,
        id_res,
        selectedDate,
        startTime,
        endTime,
        minCapacity,
        extra, motivo,
        descricao,
        descricao_extra,
        extra_qt,
        extras,
        username

    ) => {
        navigate('/editReservation', {
            state: {
                id,
                foto,
                nome,
                capacidade,
                tv,
                quadro,
                id_res,
                selectedDate,
                startTime,
                endTime,
                minCapacity,
                extra,
                motivo,
                descricao,
                descricao_extra,
                extra_qt,
                extras,
                username
            }
        });
    };

    const handleCancel = async (id) => {
        const { data, error } = await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', id);
        if (error) {
            console.error('Erro ao cancelar reserva:', error);
            return;
        }
        alert('Reserva cancelada com sucesso!');
        navigate(0);
        return { data };
    }

    const handleCheckIn = async (id) => {
        const { data, error } = await supabase.from('reservas').update({ estado: 'ativa' }).eq('id', id);
        if (error) {
            console.error('Erro ao confirmar reserva:', error);
            return;
        }
        navigate(0);
        alert('Reserva ativada com sucesso!');
        return { data };
    }

    const handleDelete = async (id) => {
        const { data, error } = await supabase.from('reservas').delete().eq('id', id);
        if (error) {
            console.error('Erro ao eliminar reserva:', error);
            return;
        }
        alert('Reserva eliminada com sucesso!');
        navigate(0);
    }

    const handleConfirm = async (id) => {
        const { data, error } = await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id', id);
        if (error) {
            console.error('Erro ao confirmar reserva:', error);
            return;
        }
        navigate(0);
        alert('Reserva confirmada com sucesso!');
        return { data };
    }

    const seeDetails = (
        id_res,
        id,
        nome,
        capacidade,
        tv,
        quadro,
        selectedDate,
        startTime,
        endTime,
        minCapacity,
        motivo,
        descricao,
        descricao_extra,
        extra_qt,
        comentario,
        extra,
    ) => {

        const reservationUsername = users.find(user => user.id === reservations.find(res => res.id === id_res)?.id_u)?.nome;
        navigate('/details', {
            state: {
                id_res,
                id,
                nome,
                capacidade,
                tv,
                quadro,
                selectedDate,
                startTime,
                endTime,
                minCapacity,
                motivo,
                descricao,
                descricao_extra,
                extra_qt,
                username: reservationUsername,
                comentario,
                extra,
            }
        });
    }

    if (loading) {
        return <p className="loading">A carregar...</p>;
    };

    return (
        <>
            <div className="list-container">
                <h1>{title}</h1>
                <div className="filters">
                    <div>
                        <input type="radio" id="pendente" name="satus" value={'Pendente'} checked={selected === 'Pendente'} onChange={() => toggleSelect('Pendente')} />
                        <label htmlFor="pendente">Pendentes</label>
                    </div>
                    <div>
                        <input type="radio" id="confirmada" name="satus" value={'Confirmada'} checked={selected === 'Confirmada'} onChange={() => toggleSelect('Confirmada')} />
                        <label htmlFor="confirmada">Confirmadas</label>
                    </div>
                    <div>
                        <input type="radio" id='ativa' name="satus" value={'Ativa'} checked={selected === 'Ativa'} onChange={() => toggleSelect('Ativa')} />
                        <label htmlFor="ativa">Ativas</label>
                    </div>
                    <div>
                        <input type="radio" id="cancelada" name="satus" value={'Cancelada'} checked={selected === 'Cancelada'} onChange={() => toggleSelect('Cancelada')} />
                        <label htmlFor="cancelada">Canceladas</label>
                    </div>
                    <div>
                        <input type="radio" id="expirada" name="satus" value={'Expirada'} checked={selected === 'Expirada'} onChange={() => toggleSelect('Expirada')} />
                        <label htmlFor="expirada">Expiradas</label>
                    </div>

                    <div>
                        <input type="radio" id="concluida" name="satus" value={'Concluida'} checked={selected === 'Concluida'} onChange={() => toggleSelect('Concluida')} />
                        <label htmlFor="concluida">Concluídas</label>
                    </div>
                    <div>
                        <input type="radio" id="todas" name="satus" value={'Todas'} checked={selected === 'Todas'} onChange={() => toggleSelect('Todas')} />
                        <label htmlFor="todas">Todas</label>
                    </div>
                </div>
                <div className="item-list">
                    <div className="list-title-container">
                    </div>
                    {((reservations.length <= 0 && !loading) || filteredRooms.length <= 0) && <p className="aviso">{aviso}</p>}
                    {selected === 'Todas' ? (
                        Object.entries(groupedRooms).map(([status, rooms]) => (
                            <div key={status}>
                                <h3 className="status-title">{status.at(0).toUpperCase() + status.substring(1).toLowerCase() + 's'}</h3><br />
                                {rooms.map((room, index) => (
                                    <div key={index} className={`item ${(session.user.tipo && (room.reservation.estado !== 'pendente' && room.reservation.estado !== 'confirmada')) && 'reservation'}`} id="item" onClick={(session.user.tipo && room.reservation.estado !== 'expirada' && room.reservation.estado !== 'cancelada' && room.reservation.estado !== 'ativa' && room.reservation.estado !== 'concluida') ? (() => seeDetails(room.reservation.id,
                                        room.id,
                                        room.nome,
                                        room.reservation.num_pessoas,
                                        room.tv,
                                        room.quadro,
                                        room.reservation.data,
                                        room.reservation.h_inicio,
                                        room.reservation.h_fim,
                                        room.reservation.num_pessoas,
                                        room.reservation.motivo,
                                        room.reservation.descricao,
                                        room.reservation.descricao_extra,
                                        room.reservation.extra_qt,
                                        room.reservation.comentario,
                                        username,
                                        room.reservation.extra,
                                    )) : undefined} >
                                        <img title={room.nome} src={`../src/assets/imgs/${room.foto}`} alt={room.nome || 'Imagem indisponível'} />
                                        <div className="details">
                                            {session.user.tipo ?
                                                <div title="Nome do colaborador" className="item-title">
                                                    {users.find(user => user.id === room.reservation.id_u)?.nome || 'Utilizador desconhecido'}
                                                </div>
                                                :
                                                <div title="Nome do colaborador" className="item-title">
                                                    {room.reservation.motivo || 'Sem título'}
                                                </div>
                                            }
                                            <div className="availability">
                                                <div className="recursos" title="Lugares Ocupados">
                                                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="36" height="36">
                                                        <path d="M19,13.276V5c0-2.757-2.243-5-5-5h-4c-2.757,0-5,2.243-5,5V13.276c-1.742,.621-3,2.271-3,4.224v5.5c0,.553,.448,1,1,1s1-.447,1-1v-4H20v4c0,.553,.448,1,1,1s1-.447,1-1v-5.5c0-1.953-1.258-3.602-3-4.224Zm-2-8.276V13h-2V2.184c1.161,.414,2,1.514,2,2.816Zm-6,8V2h2V13h-2ZM9,2.184V13h-2V5c0-1.302,.839-2.402,2-2.816Z" />
                                                    </svg>
                                                    <p>&nbsp;{room.reservation.num_pessoas}&nbsp;</p>
                                                </div>
                                                {room.tv > 0 &&
                                                    <div className="recursos" title="TV">
                                                        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                                            <path fill="currentColor" d="m18.5,6h-3.241l3.323-3.461c.574-.598.554-1.547-.043-2.121-.598-.573-1.546-.554-2.121.043l-4.418,4.602L7.582.461c-.573-.597-1.523-.616-2.121-.043-.597.574-.617,1.523-.043,2.121l3.323,3.461h-3.241c-3.033,0-5.5,2.467-5.5,5.5v7c0,3.033,2.467,5.5,5.5,5.5h13c3.033,0,5.5-2.467,5.5-5.5v-7c0-3.033-2.467-5.5-5.5-5.5Zm2.5,12.5c0,1.378-1.122,2.5-2.5,2.5H5.5c-1.378,0-2.5-1.122-2.5-2.5v-7c0-1.378,1.122-2.5,2.5-2.5h13c1.378,0,2.5,1.122,2.5,2.5v7Zm-7-6.5v6c0,.552-.448,1-1,1h-7c-.552,0-1-.448-1-1v-6c0-.552.448-1,1-1h7c.552,0,1,.448,1,1Zm5,.5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm0,5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Z" />
                                                        </svg>
                                                        <p>&nbsp;{room.tv}&nbsp;</p>
                                                    </div>
                                                }
                                                {room.quadro > 0 &&
                                                    <div className="recursos" title="Whiteboard">
                                                        <svg fill="currentColor" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 297 297" xmlSpace="preserve">
                                                            <g>
                                                                <path d="M287.631,15.459H157.869v-6.09c0-5.174-4.195-9.369-9.369-9.369s-9.369,4.195-9.369,9.369v6.09H9.369c-5.174,0-9.368,4.195-9.368,9.369v30.918c0,5.174,4.194,9.369,9.368,9.369h6.09v160.68c0,5.174,4.195,9.369,9.369,9.369h104.934L94.628,282.01c-3.104,4.139-2.266,10.012,1.874,13.116c1.685,1.265,3.657,1.874,5.614,1.874c2.848,0,5.661-1.294,7.502-3.748l29.513-39.35v33.729c0,5.174,4.195,9.369,9.369,9.369s9.369-4.195,9.369-9.369v-33.729l29.513,39.35c1.841,2.454,4.653,3.748,7.502,3.748c1.957,0,3.929-0.61,5.614-1.874c4.14-3.104,4.979-8.978,1.874-13.116l-35.134-46.846h104.934c5.174,0,9.368-4.195,9.368-9.369V65.115h6.091c5.174,0,9.368-4.195,9.368-9.369V24.828C296.999,19.654,292.805,15.459,287.631,15.459z M18.738,46.377v-12.18h259.523v12.18H18.738z M262.803,216.426H34.197V65.115h228.605V216.426z" />
                                                                <path d="M71.205,142.411h139.131c5.174,0,9.369-4.195,9.369-9.369c0-5.174-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369C61.836,138.216,66.031,142.411,71.205,142.411z" />
                                                                <path d="M71.205,111.493h30.918c5.174,0,9.369-4.194,9.369-9.369c0-5.174-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369C61.836,107.299,66.031,111.493,71.205,111.493z" />
                                                                <path d="M71.205,173.328h92.754c5.174,0,9.369-4.195,9.369-9.369s-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369S66.031,173.328,71.205,173.328z" />
                                                            </g>
                                                        </svg>
                                                        <p>&nbsp;{room.quadro}&nbsp;</p>
                                                    </div>
                                                }
                                                {room.reservation.extra &&
                                                    <div className="extra" title="Extras">
                                                        <svg fill="currentColor" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 388 397" preserveAspectRatio="xMidYMid meet">
                                                            <g transform="translate(0.000000,397.000000) scale(0.100000,-0.100000)" >
                                                                <path d="M1866 3879 c-54 -13 -132 -53 -255 -129 l-104 -65 -211 -6 c-116 -3 -226 -11 -244 -17 -97 -32 -175 -116 -262 -281 -78 -148 -106 -176 -259 -255 -156 -82 -241 -162 -273 -258 -6 -18 -14 -128 -17 -244 l-6 -211 -65 -104 c-87 -141 -119 -208 -132 -279 -21 -113 7 -197 132 -399 l65 -104 6 -211 c3 -116 11 -226 17 -244 32 -96 117 -176 273 -258 153 -79 181 -107 259 -256 50 -95 79 -138 130 -189 94 -96 141 -109 381 -109 206 0 198 2 350 -93 148 -93 195 -111 299 -111 103 0 158 21 304 114 145 91 139 90 345 90 240 0 287 13 381 109 51 51 80 94 130 189 78 149 106 177 260 257 88 45 130 74 181 125 95 94 101 116 108 376 l6 211 65 104 c125 202 153 286 132 399 -13 71 -45 138 -132 279 l-65 104 -6 211 c-7 260 -13 282 -108 376 -51 51 -93 80 -181 125 -154 80 -182 108 -260 256 -66 125 -133 211 -196 250 -63 39 -128 49 -317 49 -204 0 -199 -1 -343 90 -54 35 -125 74 -158 87 -67 27 -170 37 -230 22z m151 -231 c15 -7 77 -43 137 -80 174 -108 187 -112 416 -112 165 -1 200 -4 227 -18 33 -18 69 -73 144 -218 59 -114 145 -200 259 -259 145 -75 200 -111 218 -144 14 -27 17 -62 18 -227 0 -229 4 -242 112 -416 82 -133 92 -154 92 -204 0 -50 -10 -71 -92 -204 -109 -175 -112 -187 -113 -416 0 -164 -3 -200 -17 -226 -19 -35 -69 -69 -208 -140 -125 -65 -209 -146 -269 -264 -73 -142 -111 -199 -144 -218 -27 -14 -62 -17 -227 -18 -229 0 -242 -4 -416 -112 -133 -82 -154 -92 -204 -92 -50 0 -71 10 -204 92 -175 109 -187 112 -416 113 -165 0 -200 3 -227 17 -33 18 -69 73 -144 218 -59 114 -145 200 -259 259 -145 75 -200 111 -218 144 -14 27 -17 62 -18 227 0 229 -4 242 -112 416 -82 133 -92 154 -92 204 0 50 10 71 92 204 108 174 112 187 112 416 1 164 4 200 18 226 19 35 69 69 208 140 129 66 208 145 274 274 71 139 105 189 140 208 26 14 62 17 226 18 226 0 246 5 397 101 166 105 219 122 290 91z" />
                                                                <path d="M1823 2340 c-68 -5 -92 -24 -92 -70 0 -43 24 -64 82 -70 l52 -5 5 -235 c3 -129 9 -242 13 -251 8 -17 49 -39 71 -39 7 0 25 9 39 21 l27 20 2 242 3 242 57 5 c63 6 87 25 88 71 0 29 -33 69 -58 69 -175 4 -237 4 -289 0z" />
                                                                <path d="M697 2322 c-15 -16 -17 -53 -17 -313 0 -162 4 -299 8 -305 17 -27 56 -34 177 -34 69 0 135 4 145 10 28 15 40 61 25 97 -16 39 -29 43 -131 43 l-84 0 0 54 0 54 86 3 c76 4 88 7 105 28 25 30 24 62 -1 94 -19 24 -28 26 -103 29 l-82 3 0 55 0 55 91 3 c76 2 95 6 109 22 24 26 23 74 0 100 -17 18 -30 20 -165 20 -130 0 -149 -2 -163 -18z" />
                                                                <path d="M1161 2314 c-12 -15 -21 -35 -21 -45 0 -10 29 -60 65 -111 100 -143 100 -118 1 -259 -94 -135 -105 -170 -64 -209 48 -45 87 -22 172 101 38 54 71 99 75 99 3 -1 31 -37 61 -82 74 -109 102 -138 134 -138 34 0 76 41 76 73 0 14 -36 76 -86 148 -48 68 -87 129 -87 135 0 6 32 56 71 112 55 77 72 109 72 135 0 43 -26 67 -74 67 -34 0 -40 -5 -84 -66 -26 -37 -56 -78 -67 -91 l-20 -25 -50 74 c-66 97 -79 108 -119 108 -25 0 -40 -7 -55 -26z" />
                                                                <path d="M2284 2333 c-31 -22 -34 -56 -34 -333 l0 -281 25 -24 c13 -14 36 -25 50 -25 14 0 37 11 50 25 22 21 25 33 25 97 l1 73 37 -40 c20 -23 60 -67 88 -98 58 -63 84 -71 128 -36 46 36 37 74 -43 165 l-69 79 26 14 c140 71 152 261 24 355 -43 30 -46 31 -170 34 -70 1 -132 -1 -138 -5z m227 -159 c23 -21 25 -67 4 -84 -9 -7 -38 -15 -65 -18 l-50 -5 0 60 c0 33 3 63 8 67 12 13 82 -1 103 -20z" />
                                                                <path d="M2972 2333 c-7 -3 -20 -19 -28 -36 -34 -64 -204 -531 -204 -558 0 -32 21 -56 56 -65 40 -10 71 13 95 72 l21 54 108 0 107 0 12 -41 c16 -51 52 -89 86 -89 31 0 75 41 75 69 0 34 -200 554 -223 579 -20 21 -71 29 -105 15z m76 -330 l20 -53 -50 0 c-27 0 -48 4 -46 8 2 4 12 31 22 60 11 29 23 49 27 45 4 -5 16 -32 27 -60z" />
                                                            </g>
                                                        </svg>
                                                    </div>
                                                }
                                            </div>
                                            <div className="data-reserva" title="Data e hora da reunião">
                                                {room.reservation.data} - {room.reservation.h_inicio.slice(0, 5)}/{room.reservation.h_fim.slice(0, 5)}
                                            </div>
                                        </div>
                                        <div className="opcoes">
                                            {(room.reservation.estado === 'pendente' || room.reservation.estado === 'confirmada' || room.reservation.estado === 'ativa') &&

                                                <div title="Cancelar reserva" className="no" onClick={(e) => { e.stopPropagation(); window.confirm(`Pretende cancelar a reserva "${room.reservation.motivo || 'Sem título'}" marcada para ${room.reservation.data} entre as ${room.reservation.h_inicio.slice(0, 5)} e as ${room.reservation.h_fim.slice(0, 5)}?`) && handleCancel(room.reservation.id) }}>
                                                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                                        <path d="m16.561,9.561l-2.439,2.439,2.439,2.439-2.121,2.121-2.439-2.439-2.439,2.439-2.121-2.121,2.439-2.439-2.439-2.439,2.121-2.121,2.439,2.439,2.439-2.439,2.121,2.121Zm7.439,2.439c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-3,0c0-4.963-4.037-9-9-9S3,7.037,3,12s4.038,9,9,9,9-4.037,9-9Z" />
                                                    </svg>
                                                </div>
                                            }
                                            {(room.reservation.estado === 'cancelada' || room.reservation.estado === 'expirada' || room.reservation.estado === 'concluida') &&

                                                <div title="Eliminar reserva" className="no" onClick={(e) => { e.stopPropagation(); window.confirm(`Pretende Eliminar a reserva "${room.reservation.motivo || 'Sem título'}"?`) && handleDelete(room.reservation.id, e) }}>
                                                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                                        <path d="m16.561,9.561l-2.439,2.439,2.439,2.439-2.121,2.121-2.439-2.439-2.439,2.439-2.121-2.121,2.439-2.439-2.439-2.439,2.121-2.121,2.439,2.439,2.439-2.439,2.121,2.121Zm7.439,2.439c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-3,0c0-4.963-4.037-9-9-9S3,7.037,3,12s4.038,9,9,9,9-4.037,9-9Z" />
                                                    </svg>
                                                </div>
                                            }
                                            {((room.reservation.estado === 'pendente' || room.reservation.estado === 'confirmada') && !session.user.tipo) &&


                                                <div title="Editar reserva" className="edit" onClick={() => handleClick(
                                                    room.id,
                                                    room.foto,
                                                    room.nome,
                                                    room.capacidade,
                                                    room.tv,
                                                    room.quadro,
                                                    room.reservation.id,
                                                    room.reservation.data,
                                                    room.reservation.h_inicio,
                                                    room.reservation.h_fim,
                                                    room.reservation.num_pessoas,
                                                    room.reservation.extra,
                                                    room.reservation.motivo,
                                                    room.reservation.descricao,
                                                    room.reservation.descricao_extra,
                                                    room.reservation.extra_qt,
                                                    room.reservation.comentario,
                                                    username,
                                                    extras.filter(extra => extra.reservation.id === room.reservation.id),
                                                )}>
                                                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                                        <path d="M22.987,5.452c-.028-.177-.312-1.767-1.464-2.928-1.157-1.132-2.753-1.412-2.931-1.44-.237-.039-.479,.011-.682,.137-.071,.044-1.114,.697-3.173,2.438,1.059,.374,2.428,1.023,3.538,2.109,1.114,1.09,1.78,2.431,2.162,3.471,1.72-2.01,2.367-3.028,2.41-3.098,.128-.205,.178-.45,.14-.689Z" />
                                                        <path d="M12.95,5.223c-1.073,.968-2.322,2.144-3.752,3.564C3.135,14.807,1.545,17.214,1.48,17.313c-.091,.14-.146,.301-.159,.467l-.319,4.071c-.022,.292,.083,.578,.29,.785,.188,.188,.443,.293,.708,.293,.025,0,.051,0,.077-.003l4.101-.316c.165-.013,.324-.066,.463-.155,.1-.064,2.523-1.643,8.585-7.662,1.462-1.452,2.668-2.716,3.655-3.797-.151-.649-.678-2.501-2.005-3.798-1.346-1.317-3.283-1.833-3.927-1.975Z" />
                                                    </svg>
                                                </div>
                                            }
                                            {((room.reservation.estado === 'confirmada' && (!session.user.tipo || (room.reservation.id_u === 2))) || (room.reservation.estado === 'pendente' && session.user.tipo)) &&
                                                <div className="ativar" title={(session.user.tipo && (room.reservation.id_u !== 2 || room.reservation.estado === 'pendente')) ? "Confirmar reserva" : "Ativar reserva"} onClick={(e) => { e.stopPropagation(); (session.user.tipo && (room.reservation.id_u !== 2 || room.reservation.estado === 'pendente')) ? handleConfirm(room.reservation.id) : handleCheckIn(room.reservation.id) }}>                                                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 507.506 507.506" xmlSpace="preserve" width="512" height="512">
                                                    <g>
                                                        <path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z" />
                                                    </g>
                                                </svg>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))

                    ) : (
                        filteredRooms.map((room, index) =>
                            <div key={index} className={`item ${(session.user.tipo && (room.reservation.estado !== 'pendente' && room.reservation.estado !== 'confirmada')) && 'reservation'}`} id="filtered-item" onClick={(session.user.tipo && room.reservation.estado !== 'expirada' && room.reservation.estado !== 'cancelada' && room.reservation.estado !== 'ativa' && room.reservation.estado !== 'concluida') ? (() => seeDetails(room.reservation.id,
                                room.id,
                                room.nome,
                                room.reservation.num_pessoas,
                                room.tv,
                                room.quadro,
                                room.reservation.data,
                                room.reservation.h_inicio,
                                room.reservation.h_fim,
                                room.reservation.num_pessoas,
                                room.reservation.motivo,
                                room.reservation.descricao,
                                room.reservation.descricao_extra,
                                room.reservation.extra_qt,
                                room.reservation.comentario,
                                username,
                                room.reservation.extra,
                            )) : undefined} >
                                <img title={room.nome} src={`../src/assets/imgs/${room.foto}`} alt={room.nome || 'Imagem indisponível'} />
                                <div className="details">
                                    {session.user.tipo ?
                                        <div title="Nome do colaborador" className="item-title">
                                            {users.find(user => user.id === room.reservation.id_u)?.nome || 'Utilizador desconhecido'}
                                        </div>
                                        :
                                        <div title="Título da reunião" className="item-title">
                                            {room.reservation.motivo || 'Sem título'}
                                        </div>
                                    }
                                    <div className="availability">
                                        <div className="recursos" title="Lugares Ocupados">
                                            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="36" height="36">
                                                <path d="M19,13.276V5c0-2.757-2.243-5-5-5h-4c-2.757,0-5,2.243-5,5V13.276c-1.742,.621-3,2.271-3,4.224v5.5c0,.553,.448,1,1,1s1-.447,1-1v-4H20v4c0,.553,.448,1,1,1s1-.447,1-1v-5.5c0-1.953-1.258-3.602-3-4.224Zm-2-8.276V13h-2V2.184c1.161,.414,2,1.514,2,2.816Zm-6,8V2h2V13h-2ZM9,2.184V13h-2V5c0-1.302,.839-2.402,2-2.816Z" />
                                            </svg>
                                            <p>&nbsp;{room.reservation.num_pessoas}&nbsp;</p>
                                        </div>
                                        {room.tv > 0 &&
                                            <div className="recursos" title="TV">
                                                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                                    <path fill="currentColor" d="m18.5,6h-3.241l3.323-3.461c.574-.598.554-1.547-.043-2.121-.598-.573-1.546-.554-2.121.043l-4.418,4.602L7.582.461c-.573-.597-1.523-.616-2.121-.043-.597.574-.617,1.523-.043,2.121l3.323,3.461h-3.241c-3.033,0-5.5,2.467-5.5,5.5v7c0,3.033,2.467,5.5,5.5,5.5h13c3.033,0,5.5-2.467,5.5-5.5v-7c0-3.033-2.467-5.5-5.5-5.5Zm2.5,12.5c0,1.378-1.122,2.5-2.5,2.5H5.5c-1.378,0-2.5-1.122-2.5-2.5v-7c0-1.378,1.122-2.5,2.5-2.5h13c1.378,0,2.5,1.122,2.5,2.5v7Zm-7-6.5v6c0,.552-.448,1-1,1h-7c-.552,0-1-.448-1-1v-6c0-.552.448-1,1-1h7c.552,0,1,.448,1,1Zm5,.5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm0,5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Z" />
                                                </svg>
                                                <p>&nbsp;{room.tv}&nbsp;</p>
                                            </div>
                                        }
                                        {room.quadro > 0 &&
                                            <div className="recursos" title="Whiteboard">
                                                <svg fill="currentColor" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 297 297" xmlSpace="preserve">
                                                    <g>
                                                        <path d="M287.631,15.459H157.869v-6.09c0-5.174-4.195-9.369-9.369-9.369s-9.369,4.195-9.369,9.369v6.09H9.369c-5.174,0-9.368,4.195-9.368,9.369v30.918c0,5.174,4.194,9.369,9.368,9.369h6.09v160.68c0,5.174,4.195,9.369,9.369,9.369h104.934L94.628,282.01c-3.104,4.139-2.266,10.012,1.874,13.116c1.685,1.265,3.657,1.874,5.614,1.874c2.848,0,5.661-1.294,7.502-3.748l29.513-39.35v33.729c0,5.174,4.195,9.369,9.369,9.369s9.369-4.195,9.369-9.369v-33.729l29.513,39.35c1.841,2.454,4.653,3.748,7.502,3.748c1.957,0,3.929-0.61,5.614-1.874c4.14-3.104,4.979-8.978,1.874-13.116l-35.134-46.846h104.934c5.174,0,9.368-4.195,9.368-9.369V65.115h6.091c5.174,0,9.368-4.195,9.368-9.369V24.828C296.999,19.654,292.805,15.459,287.631,15.459z M18.738,46.377v-12.18h259.523v12.18H18.738z M262.803,216.426H34.197V65.115h228.605V216.426z" />
                                                        <path d="M71.205,142.411h139.131c5.174,0,9.369-4.195,9.369-9.369c0-5.174-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369C61.836,138.216,66.031,142.411,71.205,142.411z" />
                                                        <path d="M71.205,111.493h30.918c5.174,0,9.369-4.194,9.369-9.369c0-5.174-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369C61.836,107.299,66.031,111.493,71.205,111.493z" />
                                                        <path d="M71.205,173.328h92.754c5.174,0,9.369-4.195,9.369-9.369s-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369S66.031,173.328,71.205,173.328z" />
                                                    </g>
                                                </svg>
                                                <p>&nbsp;{room.quadro}&nbsp;</p>
                                            </div>
                                        }
                                        {room.reservation.extra &&
                                            <div className="extra" title="Extras">
                                                <svg fill="currentColor" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 388 397" preserveAspectRatio="xMidYMid meet">
                                                    <g transform="translate(0.000000,397.000000) scale(0.100000,-0.100000)" >
                                                        <path d="M1866 3879 c-54 -13 -132 -53 -255 -129 l-104 -65 -211 -6 c-116 -3 -226 -11 -244 -17 -97 -32 -175 -116 -262 -281 -78 -148 -106 -176 -259 -255 -156 -82 -241 -162 -273 -258 -6 -18 -14 -128 -17 -244 l-6 -211 -65 -104 c-87 -141 -119 -208 -132 -279 -21 -113 7 -197 132 -399 l65 -104 6 -211 c3 -116 11 -226 17 -244 32 -96 117 -176 273 -258 153 -79 181 -107 259 -256 50 -95 79 -138 130 -189 94 -96 141 -109 381 -109 206 0 198 2 350 -93 148 -93 195 -111 299 -111 103 0 158 21 304 114 145 91 139 90 345 90 240 0 287 13 381 109 51 51 80 94 130 189 78 149 106 177 260 257 88 45 130 74 181 125 95 94 101 116 108 376 l6 211 65 104 c125 202 153 286 132 399 -13 71 -45 138 -132 279 l-65 104 -6 211 c-7 260 -13 282 -108 376 -51 51 -93 80 -181 125 -154 80 -182 108 -260 256 -66 125 -133 211 -196 250 -63 39 -128 49 -317 49 -204 0 -199 -1 -343 90 -54 35 -125 74 -158 87 -67 27 -170 37 -230 22z m151 -231 c15 -7 77 -43 137 -80 174 -108 187 -112 416 -112 165 -1 200 -4 227 -18 33 -18 69 -73 144 -218 59 -114 145 -200 259 -259 145 -75 200 -111 218 -144 14 -27 17 -62 18 -227 0 -229 4 -242 112 -416 82 -133 92 -154 92 -204 0 -50 -10 -71 -92 -204 -109 -175 -112 -187 -113 -416 0 -164 -3 -200 -17 -226 -19 -35 -69 -69 -208 -140 -125 -65 -209 -146 -269 -264 -73 -142 -111 -199 -144 -218 -27 -14 -62 -17 -227 -18 -229 0 -242 -4 -416 -112 -133 -82 -154 -92 -204 -92 -50 0 -71 10 -204 92 -175 109 -187 112 -416 113 -165 0 -200 3 -227 17 -33 18 -69 73 -144 218 -59 114 -145 200 -259 259 -145 75 -200 111 -218 144 -14 27 -17 62 -18 227 0 229 -4 242 -112 416 -82 133 -92 154 -92 204 0 50 10 71 92 204 108 174 112 187 112 416 1 164 4 200 18 226 19 35 69 69 208 140 129 66 208 145 274 274 71 139 105 189 140 208 26 14 62 17 226 18 226 0 246 5 397 101 166 105 219 122 290 91z" />
                                                        <path d="M1823 2340 c-68 -5 -92 -24 -92 -70 0 -43 24 -64 82 -70 l52 -5 5 -235 c3 -129 9 -242 13 -251 8 -17 49 -39 71 -39 7 0 25 9 39 21 l27 20 2 242 3 242 57 5 c63 6 87 25 88 71 0 29 -33 69 -58 69 -175 4 -237 4 -289 0z" />
                                                        <path d="M697 2322 c-15 -16 -17 -53 -17 -313 0 -162 4 -299 8 -305 17 -27 56 -34 177 -34 69 0 135 4 145 10 28 15 40 61 25 97 -16 39 -29 43 -131 43 l-84 0 0 54 0 54 86 3 c76 4 88 7 105 28 25 30 24 62 -1 94 -19 24 -28 26 -103 29 l-82 3 0 55 0 55 91 3 c76 2 95 6 109 22 24 26 23 74 0 100 -17 18 -30 20 -165 20 -130 0 -149 -2 -163 -18z" />
                                                        <path d="M1161 2314 c-12 -15 -21 -35 -21 -45 0 -10 29 -60 65 -111 100 -143 100 -118 1 -259 -94 -135 -105 -170 -64 -209 48 -45 87 -22 172 101 38 54 71 99 75 99 3 -1 31 -37 61 -82 74 -109 102 -138 134 -138 34 0 76 41 76 73 0 14 -36 76 -86 148 -48 68 -87 129 -87 135 0 6 32 56 71 112 55 77 72 109 72 135 0 43 -26 67 -74 67 -34 0 -40 -5 -84 -66 -26 -37 -56 -78 -67 -91 l-20 -25 -50 74 c-66 97 -79 108 -119 108 -25 0 -40 -7 -55 -26z" />
                                                        <path d="M2284 2333 c-31 -22 -34 -56 -34 -333 l0 -281 25 -24 c13 -14 36 -25 50 -25 14 0 37 11 50 25 22 21 25 33 25 97 l1 73 37 -40 c20 -23 60 -67 88 -98 58 -63 84 -71 128 -36 46 36 37 74 -43 165 l-69 79 26 14 c140 71 152 261 24 355 -43 30 -46 31 -170 34 -70 1 -132 -1 -138 -5z m227 -159 c23 -21 25 -67 4 -84 -9 -7 -38 -15 -65 -18 l-50 -5 0 60 c0 33 3 63 8 67 12 13 82 -1 103 -20z" />
                                                        <path d="M2972 2333 c-7 -3 -20 -19 -28 -36 -34 -64 -204 -531 -204 -558 0 -32 21 -56 56 -65 40 -10 71 13 95 72 l21 54 108 0 107 0 12 -41 c16 -51 52 -89 86 -89 31 0 75 41 75 69 0 34 -200 554 -223 579 -20 21 -71 29 -105 15z m76 -330 l20 -53 -50 0 c-27 0 -48 4 -46 8 2 4 12 31 22 60 11 29 23 49 27 45 4 -5 16 -32 27 -60z" />
                                                    </g>
                                                </svg>
                                            </div>
                                        }
                                    </div>
                                    <div className="data-reserva" title="Data e hora da reunião">
                                        {room.reservation.data} - {room.reservation.h_inicio.slice(0, 5)}/{room.reservation.h_fim.slice(0, 5)}
                                    </div>
                                </div>
                                <div className="opcoes">
                                    {(room.reservation.estado === 'pendente' || room.reservation.estado === 'confirmada' || room.reservation.estado === 'ativa') &&

                                        <div title="Cancelar reserva" className="no" onClick={(e) => { e.stopPropagation(); window.confirm(`Pretende cancelar a reserva "${room.reservation.motivo || 'Sem título'}" marcada para ${room.reservation.data} entre as ${room.reservation.h_inicio.slice(0, 5)} e as ${room.reservation.h_fim.slice(0, 5)}?`) && handleCancel(room.reservation.id) }}>
                                            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                                <path d="m16.561,9.561l-2.439,2.439,2.439,2.439-2.121,2.121-2.439-2.439-2.439,2.439-2.121-2.121,2.439-2.439-2.439-2.439,2.121-2.121,2.439,2.439,2.439-2.439,2.121,2.121Zm7.439,2.439c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-3,0c0-4.963-4.037-9-9-9S3,7.037,3,12s4.038,9,9,9,9-4.037,9-9Z" />
                                            </svg>
                                        </div>
                                    }
                                    {(room.reservation.estado === 'cancelada' || room.reservation.estado === 'expirada' || room.reservation.estado === 'concluida') &&

                                        <div title="Eliminar reserva" className="no" onClick={() => window.confirm(`Pretende Eliminar a reserva "${room.reservation.motivo || 'Sem título'}"?`) && handleDelete(room.reservation.id)}>
                                            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                                <path d="m16.561,9.561l-2.439,2.439,2.439,2.439-2.121,2.121-2.439-2.439-2.439,2.439-2.121-2.121,2.439-2.439-2.439-2.439,2.121-2.121,2.439,2.439,2.439-2.439,2.121,2.121Zm7.439,2.439c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-3,0c0-4.963-4.037-9-9-9S3,7.037,3,12s4.038,9,9,9,9-4.037,9-9Z" />
                                            </svg>
                                        </div>
                                    }
                                    {((room.reservation.estado === 'pendente' || room.reservation.estado === 'confirmada') && !session.user.tipo) &&

                                        <div title="Editar reserva" className="edit" onClick={() => handleClick(
                                            room.id,
                                            room.foto,
                                            room.nome,
                                            room.capacidade,
                                            room.tv,
                                            room.quadro,
                                            room.reservation.id,
                                            room.reservation.data,
                                            room.reservation.h_inicio,
                                            room.reservation.h_fim,
                                            room.reservation.num_pessoas,
                                            room.reservation.extra,
                                            room.reservation.motivo,
                                            room.reservation.descricao,
                                            room.reservation.descricao_extra,
                                            room.reservation.extra_qt,
                                            room.reservation.comentario,
                                            username,
                                            extras.filter(extra => extra.reservation.id === room.reservation.id),
                                        )}>
                                            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                                <path d="M22.987,5.452c-.028-.177-.312-1.767-1.464-2.928-1.157-1.132-2.753-1.412-2.931-1.44-.237-.039-.479,.011-.682,.137-.071,.044-1.114,.697-3.173,2.438,1.059,.374,2.428,1.023,3.538,2.109,1.114,1.09,1.78,2.431,2.162,3.471,1.72-2.01,2.367-3.028,2.41-3.098,.128-.205,.178-.45,.14-.689Z" />
                                                <path d="M12.95,5.223c-1.073,.968-2.322,2.144-3.752,3.564C3.135,14.807,1.545,17.214,1.48,17.313c-.091,.14-.146,.301-.159,.467l-.319,4.071c-.022,.292,.083,.578,.29,.785,.188,.188,.443,.293,.708,.293,.025,0,.051,0,.077-.003l4.101-.316c.165-.013,.324-.066,.463-.155,.1-.064,2.523-1.643,8.585-7.662,1.462-1.452,2.668-2.716,3.655-3.797-.151-.649-.678-2.501-2.005-3.798-1.346-1.317-3.283-1.833-3.927-1.975Z" />
                                            </svg>
                                        </div>
                                    }
                                    {((room.reservation.estado === 'confirmada' && (!session.user.tipo || (room.reservation.id_u === 2))) || (room.reservation.estado === 'pendente' && session.user.tipo)) &&
                                        <div className="ativar" title={(session.user.tipo && (room.reservation.id_u !== 2 || room.reservation.estado === 'pendente')) ? "Confirmar reserva" : "Ativar reserva"} onClick={(e) => { e.stopPropagation(); (session.user.tipo && (room.reservation.id_u !== 2 || room.reservation.estado === 'pendente')) ? handleConfirm(room.reservation.id) : handleCheckIn(room.reservation.id) }}>                                                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 507.506 507.506" xmlSpace="preserve" width="512" height="512">
                                            <g>
                                                <path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z" />
                                            </g>
                                        </svg>
                                        </div>
                                    }
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            {!session.user.tipo &&
                <svg onClick={() => navigate('/home')} id='back-arrow' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512">
                    <path fill="currentColor" d="M10.6,12.71a1,1,0,0,1,0-1.42l4.59-4.58a1,1,0,0,0,0-1.42,1,1,0,0,0-1.41,0L9.19,9.88a3,3,0,0,0,0,4.24l4.59,4.59a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42Z" />
                </svg>
            }
        </>
    )
}