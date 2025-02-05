import { useState, useEffect } from "react";
import '../css/RoomList.modules.css';
import { fetchReservation, fetchRoom } from "../utils/DBfuncs";
import { useNavigate } from "react-router-dom";


const RoomList = () => {
    let aviso = '';
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const hMinima = '09:00';
    const hMaxima = '18:00';
    const dataAtual = new Date().toISOString().split('T')[0];
    const horaAtual = new Date().toLocaleTimeString('pt-PT', { hour12: false }).slice(0, 5);
    const horaAtualMais30 = new Date(new Date().getTime() + 30 * 60 * 1000).toLocaleTimeString('pt-PT', { hour12: false }).slice(0, 5);
    const navigate = useNavigate();

    // Estados dos filtros
    const [minCapacity, setMinCapacity] = useState(0);
    const [selectedDate, setSelectedDate] = useState(dataAtual);
    const [startTime, setStartTime] = useState(horaAtual);
    const [endTime, setEndTime] = useState('18:00');

    useEffect(() => {

        const loadReservations = async () => {
            const { data, error } = await fetchReservation();
            if (data) {
                setReservations(data);
                return { data };
            }
            console.log('Erro ao carregar reservas');
            return { error }
        }

        const loadRooms = async () => {
            const { data, error } = await fetchRoom();
            if (data) {
                setRooms(data);
                setLoading(false);
                return { data };
            }
            console.log('Erro ao carregar salas');
            return { error };
        }

        loadReservations();
        loadRooms();

    }, [selectedDate]);

    useEffect(() => {

        setStartTime(horaAtualMais30);
    }, []);

    if (loading) {
        return <p className="loading">A carregar...</p>;
    }

    const isRoomAvailable = (roomId) => {
        if (!selectedDate || !startTime || !endTime) {
            return true;
        }

        const salaReservada = reservations.some(({ id_s, data, h_inicio, h_fim, estado }) => {
            const mesmaSala = id_s === roomId;
            const mesmaData = data === selectedDate;
            const horariosConflitantes = startTime < h_fim && endTime > h_inicio;
            const estadoValido = estado !== 'cancelada' && estado !== 'expirada';

            return mesmaSala && mesmaData && horariosConflitantes && estadoValido;
        });

        return !salaReservada;
    };

    const filteredRooms = rooms.filter(({ id, capacidade }) => {

        if (endTime < hMinima || endTime > hMaxima || startTime < hMinima || startTime > hMaxima) {
            aviso = 'Os horários devem estar compreendidos entre as 09:00h e as 18:00h';
            return false;
        }

        if (startTime <= horaAtual) {
            aviso = 'A hora de início deve ser superior à hora atual';
            return false;
        }

        if (startTime >= endTime) {
            aviso = 'A hora de início deve ser inferior à hora de término';
            return false;
        }

        if (minCapacity > 10) {
            aviso = 'A lotação máxima é de 10 pessoas';
            return false;
        }
        if (minCapacity < 0) {
            aviso = 'A lotação mínima é de 1 pessoa';
            return false;
        }

        const atendeCapacidade = !minCapacity || capacidade >= Number(minCapacity);
        const estaDisponivel = isRoomAvailable(id);

        if (!estaDisponivel) {
            aviso = ('Não existem salas disponíveis com os filtros atuais');
        }

        return atendeCapacidade && estaDisponivel;

    });


    const handleClick = (id, foto, nome, capacidade, tv, quadro) => {
        const horaAtual = new Date().toLocaleTimeString('pt-PT', { hour12: false }).slice(0, 5);

        if (startTime <= horaAtual) {
            alert('A hora de início deve ser superior à hora atual.');
            return;
        }


        navigate('/booking', {
            state: {
                id,
                foto,
                nome,
                capacidade,
                tv,
                quadro,
                selectedDate,
                startTime,
                endTime,
                minCapacity
            }
        });
    };


    return (
        <>
            <div className="list-container">
                <h1>{'Iniciar Reserva'}</h1>
                    <div className="filters">
                        <input title="Intoduzir número de pessoas" type="number" placeholder="Num Pessoas" onChange={(e) => (setMinCapacity(e.target.value))} />
                        <input title="Escolher data" type="date" id="date" min={dataAtual} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        <div>
                            <p>Inicio</p>
                            <input onChange={(e) => setStartTime(e.target.value)} title="Escolher hora de início" type="time" value={startTime} />
                            <p>Fim</p>
                            <input onChange={(e) => setEndTime(e.target.value)} title="Escolher hora de término" type="time" value={endTime} />
                        </div>
                    </div>
                <div className=" item-list">
                    <div className="list-title-container">
                        {/* {notification > 0 && <Notification notification={notification} className='item-notification' />} */}
                    </div>
                    {filteredRooms.length <= 0 ?
                        <p className="aviso" dangerouslySetInnerHTML={{ __html: aviso }} />
                        :
                        (filteredRooms.map(({ id, foto, nome, capacidade, tv, quadro }) => {
                            return (
                                <div key={id} onClick={() => handleClick(id, foto, nome, capacidade, tv, quadro)} className="item">
                                    <img title={nome} src={`../src/assets/imgs/${foto}`} alt={nome || 'Imagem indisponível'} />
                                    <div className="details">
                                        <div title="Nome da sala" className="item-title">{nome}</div>
                                        <div className="availability">
                                            <div className="recursos" title="Lugares">
                                                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="36" height="36">
                                                    <path d="M19,13.276V5c0-2.757-2.243-5-5-5h-4c-2.757,0-5,2.243-5,5V13.276c-1.742,.621-3,2.271-3,4.224v5.5c0,.553,.448,1,1,1s1-.447,1-1v-4H20v4c0,.553,.448,1,1,1s1-.447,1-1v-5.5c0-1.953-1.258-3.602-3-4.224Zm-2-8.276V13h-2V2.184c1.161,.414,2,1.514,2,2.816Zm-6,8V2h2V13h-2ZM9,2.184V13h-2V5c0-1.302,.839-2.402,2-2.816Z" />
                                                </svg>
                                                <p>&nbsp;{capacidade}&nbsp;</p>
                                            </div>
                                            {tv > 0 &&
                                                <div className="recursos" title="TV">
                                                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                                        <path fill="currentColor" d="m18.5,6h-3.241l3.323-3.461c.574-.598.554-1.547-.043-2.121-.598-.573-1.546-.554-2.121.043l-4.418,4.602L7.582.461c-.573-.597-1.523-.616-2.121-.043-.597.574-.617,1.523-.043,2.121l3.323,3.461h-3.241c-3.033,0-5.5,2.467-5.5,5.5v7c0,3.033,2.467,5.5,5.5,5.5h13c3.033,0,5.5-2.467,5.5-5.5v-7c0-3.033-2.467-5.5-5.5-5.5Zm2.5,12.5c0,1.378-1.122,2.5-2.5,2.5H5.5c-1.378,0-2.5-1.122-2.5-2.5v-7c0-1.378,1.122-2.5,2.5-2.5h13c1.378,0,2.5,1.122,2.5,2.5v7Zm-7-6.5v6c0,.552-.448,1-1,1h-7c-.552,0-1-.448-1-1v-6c0-.552.448-1,1-1h7c.552,0,1,.448,1,1Zm5,.5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm0,5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Z" />
                                                    </svg>
                                                    <p>&nbsp;{tv}&nbsp;</p>
                                                </div>
                                            }
                                            {quadro > 0 &&
                                                <div className="recursos" title="Whiteboard">
                                                    <svg fill="currentColor" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 297 297" xmlSpace="preserve">
                                                        <g>
                                                            <path d="M287.631,15.459H157.869v-6.09c0-5.174-4.195-9.369-9.369-9.369s-9.369,4.195-9.369,9.369v6.09H9.369c-5.174,0-9.368,4.195-9.368,9.369v30.918c0,5.174,4.194,9.369,9.368,9.369h6.09v160.68c0,5.174,4.195,9.369,9.369,9.369h104.934L94.628,282.01c-3.104,4.139-2.266,10.012,1.874,13.116c1.685,1.265,3.657,1.874,5.614,1.874c2.848,0,5.661-1.294,7.502-3.748l29.513-39.35v33.729c0,5.174,4.195,9.369,9.369,9.369s9.369-4.195,9.369-9.369v-33.729l29.513,39.35c1.841,2.454,4.653,3.748,7.502,3.748c1.957,0,3.929-0.61,5.614-1.874c4.14-3.104,4.979-8.978,1.874-13.116l-35.134-46.846h104.934c5.174,0,9.368-4.195,9.368-9.369V65.115h6.091c5.174,0,9.368-4.195,9.368-9.369V24.828C296.999,19.654,292.805,15.459,287.631,15.459z M18.738,46.377v-12.18h259.523v12.18H18.738z M262.803,216.426H34.197V65.115h228.605V216.426z" />
                                                            <path d="M71.205,142.411h139.131c5.174,0,9.369-4.195,9.369-9.369c0-5.174-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369C61.836,138.216,66.031,142.411,71.205,142.411z" />
                                                            <path d="M71.205,111.493h30.918c5.174,0,9.369-4.194,9.369-9.369c0-5.174-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369C61.836,107.299,66.031,111.493,71.205,111.493z" />
                                                            <path d="M71.205,173.328h92.754c5.174,0,9.369-4.195,9.369-9.369s-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369S66.031,173.328,71.205,173.328z" />
                                                        </g>
                                                    </svg>
                                                    <p>&nbsp;{quadro}&nbsp;</p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        }))
                    }
                </div>
            </div>
        </>
    )
}

export default RoomList;