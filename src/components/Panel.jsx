import { useEffect, useState, useRef } from 'react'
import '../css/Panel.modules.css'
import { supabase } from '../services/DB_API';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider'
import { fetchExtraByReservation, fetchReservation, fetchRoom } from '../utils/DBfuncs';


export const Panel = ({ goTo = '/home', edit = false, details = false }) => {
    const [reservations, setReservations] = useState([]);
    const [aviso, setAviso] = useState(false);
    const [msg, setMsg] = useState('');
    const [available, setAvailable] = useState(false);
    const lastExtraRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const {
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
        extra,
        extras: existingExtras,
    } = location.state || {}
    const { session } = useAuth();

    const [extras, setExtras] = useState(
        existingExtras?.length > 0
            ? existingExtras.map(extra => ({
                descricao_extra: extra.extra || '',
                extra_qt: extra.quantidade || ''
            }))
            : [{ descricao_extra: '', extra_qt: '' }]
    );

    const [formData, setFormData] = useState({
        data: selectedDate || '',
        horaInicio: startTime || '',
        horaFim: endTime || '',
        num_pessoas: minCapacity || capacidade || 0,
        motivo: motivo || '',
        descricao: descricao || '',
        comentario: '',
        extra: Boolean(existingExtras?.length > 0),
        estado: 'pendente',
        check_in: false,
        descricao_extra: extra?.descricao_extra || '',
        extra_qt: extra?.extra_qt || 0,

    });
    const selectedDateTime = new Date(`${formData.data}T${formData.horaInicio}`);
    const currentDateTime = new Date();


    useEffect(() => {
        const loadReservations = async () => {
            const { data, error } = await fetchReservation(id_res);
            if (error) throw error;
            setReservations(data || []);
        }

        if (selectedDateTime < currentDateTime) {
            setAviso(true);
            setMsg('Deve escolher uma hora de início superior à hora atual');
            return;
        }

        if (formData.horaInicio >= formData.horaFim) {
            setAviso(true);
            setMsg('A hora de início deve ser inferior à hora de término');
            return;
        }

        const isAvailable = !reservations.some(reservation => {
            if (reservation.id === id_res) return false;

            return reservation.id_s === id &&
                reservation.data === formData.data &&
                formData.horaInicio < reservation.h_fim &&
                formData.horaFim > reservation.h_inicio &&
                !reservation.estado === 'cancelada';
        });

        if (!isAvailable) {
            setAvailable(false);
            setAviso(true);
            setMsg('Esta sala já está reservada para o horário selecionado');
            return;
        }

        setAviso(false);
        setAvailable(true);
        loadReservations();

    }, [formData]);

    useEffect(() => {
        const loadExtras = async () => {
            const { data, error } = await fetchExtraByReservation(id_res || 0);
            if (error) throw error;
            if (data && data.length > 0) {
                const extras = data.map(extra => ({
                    descricao_extra: extra.extra,
                    extra_qt: extra?.quantidade || 0,
                }));
                setExtras(extras);
            }

        }
        loadExtras();

    }, [id_res])

    useEffect(() => {
        setFormData({
            ...formData,
            extra: extras.some(extra => extra?.descricao_extra?.trim() !== ''),
        })
    }, [extras]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        if (selectedDateTime < currentDateTime) {
            alert('Deve escolher uma hora de início superior à hora atual no painel anterior');
            return;
        }


        try {
            const { data, error } = await supabase
                .from('reservas')
                .insert([{
                    data: formData.data,
                    h_inicio: formData.horaInicio,
                    h_fim: formData.horaFim,
                    num_pessoas: formData.num_pessoas,
                    motivo: formData.motivo || '',
                    descricao: formData.descricao || '',
                    comentario: formData.comentario || '',
                    extra: formData.extra || false,
                    estado: 'pendente',
                    check_in: false,
                    id_s: id,
                    id_u: session.user.id,
                }]).select('*');
            if (error) throw error;

            if (formData.extra) {
                const { data: extraData, error: extraError } = await supabase
                    .from('extras')
                    .insert(extras.map(extra => ({
                        id_r: data[0].id,
                        extra: extra.descricao_extra,
                        quantidade: extra.extra_qt || 1,
                        estado: false,
                    })));

                if (extraError) throw extraError;
            }
            alert('Reserva criada com sucesso!');
            navigate(goTo)

        } catch (error) {
            console.error('Erro ao inserir:', error.message);
            alert('Erro ao enviar os dados. Tente novamente.');
        }
    };

    const validarNumero = (e) => {
        const { min, max, value } = e.target;
        const valor = parseInt(value);
        const minValue = parseInt(min);
        const maxValue = parseInt(max);

        setFormData({
            ...formData,
            num_pessoas: Math.max(minValue, Math.min(maxValue, valor))
        });
    };

    const addExtra = (e) => {
        e.preventDefault()
        setExtras([...extras, { descricao_extra: "", extra_qt: "" }]);
        setTimeout(() => {
            if (lastExtraRef.current) {
                lastExtraRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 0);
    };

    const removeExtra = (e) => {
        e.preventDefault()
        extras.length > 1 && setExtras(extras.slice(0, -1));
    };

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const updatedExtras = extras.map((extra, i) =>
            i === index ? { ...extra, [name]: value } : extra
        );
        setExtras(updatedExtras);
    };

    const handleEdit = async (id_res) => {

        const currentDate = new Date().toISOString().split('T')[0];
        const selectedDateTime = new Date(`${formData.data}T${formData.horaInicio}`);
        const currentDateTime = new Date();

        if (formData.data < currentDate) {
            alert('Não é possível fazer reservas para datas anteriores à atual');
            return;
        }

        if (selectedDateTime < currentDateTime) {
            alert('Não é possível fazer reservas para horários anteriores ao atual');
            return;
        }

        if (formData.horaInicio >= formData.horaFim) {
            alert('O horário de início deve ser anterior ao horário de término');
            return;
        }

        if (!available) {
            alert('Esta sala já está reservada para o horário selecionado\nTente outra data ou horário');
            return;
        }


        try {

            const { data, error } = await supabase
                .from('reservas')
                .update([{
                    data: formData.data,
                    h_inicio: formData.horaInicio,
                    h_fim: formData.horaFim,
                    num_pessoas: formData.num_pessoas,
                    motivo: formData.motivo || '',
                    descricao: formData.descricao || '',
                    comentario: formData.comentario || '',
                    extra: extras.filter(e => e.descricao_extra?.trim() && parseInt(e.extra_qt) > 0).length > 0,
                    estado: 'pendente',
                    check_in: false,
                    id_s: id,
                    id_u: session.user.id,
                }]).eq('id', id_res).select('*');

            if (error) throw error;



            // Handle extras updates
            if (formData.extra && extras.some(extra => extra.descricao_extra?.trim())) {
                // Get existing extras
                const { data: existingExtras } = await supabase
                    .from('extras')
                    .select('*')
                    .eq('id_r', id_res);

                // Filter valid extras (quantity > 0)
                const validExtras = extras.filter(extra =>
                    extra.descricao_extra?.trim() &&
                    parseInt(extra.extra_qt) > 0
                );

                // Delete extras with quantity 0 or that were removed
                const extrasToDelete = existingExtras.filter(existing =>
                    !validExtras.some(valid =>
                        valid.descricao_extra === existing.extra
                    )
                );

                for (const extra of extrasToDelete) {
                    await supabase
                        .from('extras')
                        .delete()
                        .eq('id_r', id_res)
                        .eq('extra', extra.extra);
                }

                // Filter new extras to insert
                const newExtras = extras.filter(extra =>
                    !existingExtras.some(existing =>
                        existing.extra === extra.descricao_extra
                    )
                );

                // Insert new extras
                if (newExtras.length > 0) {
                    const { error: extraError } = await supabase
                        .from('extras')
                        .insert(newExtras.map(extra => ({
                            id_r: id_res,
                            extra: extra.descricao_extra,
                            quantidade: parseInt(extra.extra_qt) || 1,
                            estado: false,
                        })));

                    if (extraError) throw extraError;
                }

                // Update existing extras with changed quantities
                const updatedExtras = extras.filter(extra =>
                    existingExtras.some(existing =>
                        existing.extra === extra.descricao_extra &&
                        existing.quantidade !== parseInt(extra.extra_qt)
                    )
                );

                for (const extra of updatedExtras) {
                    const { error: updateError } = await supabase
                        .from('extras')
                        .update({ quantidade: parseInt(extra.extra_qt) })
                        .eq('id_r', id_res)
                        .eq('extra', extra.descricao_extra);

                    if (updateError) throw updateError;
                }
            }
            alert('Reserva Alterada com sucesso!');
            navigate(session.user.tipo ? '/reservations' : goTo)

        } catch (error) {
            console.error('Erro ao inserir:', error.message);
            alert('Erro ao enviar os dados. Tente novamente.');
        }
    };

    const confirm = async (id_res) => {
        const { data, error } = await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id', id_res).select('*');
        if (error) throw error;
        alert('Reserva confirmada com sucesso!');
        navigate('/reservations');
    };

    const handleCancel = async (id) => {
        const { data, error } = await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', id);
        if (error) {
            console.error('Erro ao cancelar reserva:', error);
            return;
        }
        alert('Reserva cancelada com sucesso!');
        navigate('/reservations');
        return { data };
    };


    return (
        <>
            {(aviso && !session.user.tipo) && <p className='aviso'>{msg}</p>}
            <div className="panel-container">
                <div className="panel-title">
                    <h1 title='Nome da sala'>{nome}</h1>
                    <div className="items">
                        <div title='Lugares'>
                            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                <path fill="currentColor" d="M19,13.276V5c0-2.757-2.243-5-5-5h-4c-2.757,0-5,2.243-5,5V13.276c-1.742,.621-3,2.271-3,4.224v5.5c0,.553,.448,1,1,1s1-.447,1-1v-4H20v4c0,.553,.448,1,1,1s1-.447,1-1v-5.5c0-1.953-1.258-3.602-3-4.224Zm-2-8.276V13h-2V2.184c1.161,.414,2,1.514,2,2.816Zm-6,8V2h2V13h-2ZM9,2.184V13h-2V5c0-1.302,.839-2.402,2-2.816Z" />
                            </svg>
                            &nbsp;{minCapacity ? minCapacity : capacidade}
                        </div>
                        {tv > 0 &&
                            <div title='TV'>
                                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="m18.5,6h-3.241l3.323-3.461c.574-.598.554-1.547-.043-2.121-.598-.573-1.546-.554-2.121.043l-4.418,4.602L7.582.461c-.573-.597-1.523-.616-2.121-.043-.597.574-.617,1.523-.043,2.121l3.323,3.461h-3.241c-3.033,0-5.5,2.467-5.5,5.5v7c0,3.033,2.467,5.5,5.5,5.5h13c3.033,0,5.5-2.467,5.5-5.5v-7c0-3.033-2.467-5.5-5.5-5.5Zm2.5,12.5c0,1.378-1.122,2.5-2.5,2.5H5.5c-1.378,0-2.5-1.122-2.5-2.5v-7c0-1.378,1.122-2.5,2.5-2.5h13c1.378,0,2.5,1.122,2.5,2.5v7Zm-7-6.5v6c0,.552-.448,1-1,1h-7c-.552,0-1-.448-1-1v-6c0-.552.448-1,1-1h7c.552,0,1,.448,1,1Zm5,.5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm0,5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Z" />
                                </svg>
                                &nbsp;{tv}
                            </div>
                        }
                        {quadro > 0 &&
                            <div title='Whiteboard'>
                                <svg fill="currentColor" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 297 297" xmlSpace="preserve">
                                    <g>
                                        <path d="M287.631,15.459H157.869v-6.09c0-5.174-4.195-9.369-9.369-9.369s-9.369,4.195-9.369,9.369v6.09H9.369c-5.174,0-9.368,4.195-9.368,9.369v30.918c0,5.174,4.194,9.369,9.368,9.369h6.09v160.68c0,5.174,4.195,9.369,9.369,9.369h104.934L94.628,282.01c-3.104,4.139-2.266,10.012,1.874,13.116c1.685,1.265,3.657,1.874,5.614,1.874c2.848,0,5.661-1.294,7.502-3.748l29.513-39.35v33.729c0,5.174,4.195,9.369,9.369,9.369s9.369-4.195,9.369-9.369v-33.729l29.513,39.35c1.841,2.454,4.653,3.748,7.502,3.748c1.957,0,3.929-0.61,5.614-1.874c4.14-3.104,4.979-8.978,1.874-13.116l-35.134-46.846h104.934c5.174,0,9.368-4.195,9.368-9.369V65.115h6.091c5.174,0,9.368-4.195,9.368-9.369V24.828C296.999,19.654,292.805,15.459,287.631,15.459z M18.738,46.377v-12.18h259.523v12.18H18.738z M262.803,216.426H34.197V65.115h228.605V216.426z" />
                                        <path d="M71.205,142.411h139.131c5.174,0,9.369-4.195,9.369-9.369c0-5.174-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369C61.836,138.216,66.031,142.411,71.205,142.411z" />
                                        <path d="M71.205,111.493h30.918c5.174,0,9.369-4.194,9.369-9.369c0-5.174-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369C61.836,107.299,66.031,111.493,71.205,111.493z" />
                                        <path d="M71.205,173.328h92.754c5.174,0,9.369-4.195,9.369-9.369s-4.195-9.369-9.369-9.369H71.205c-5.174,0-9.369,4.195-9.369,9.369S66.031,173.328,71.205,173.328z" />
                                    </g>
                                </svg>
                                &nbsp;{quadro}
                            </div>
                        }
                        {extra &&
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
                </div>
                <hr />
                <div className="panel">
                    <form onSubmit={handleSubmit}>
                        <div className="panel-left">
                            <h2>Informações da reserva</h2>
                            <label htmlFor="data">Data da reserva</label>
                            <input readOnly={!edit} id='data' name="data" type="date" value={formData.data} onChange={handleOnChange} />
                            <label htmlFor="horaInicio">Hora início</label>
                            <input readOnly={!edit} id='hora-inicio' name="horaInicio" type="time" value={formData.horaInicio} onChange={handleOnChange} />
                            <label htmlFor="horaFim">Hora fim</label>
                            <input readOnly={!edit} id='hora-fim' name="horaFim" type="time" value={formData.horaFim} onChange={handleOnChange} />
                            <label htmlFor="num_pessoas">Número de participantes</label>
                            <input readOnly={!edit} id='num_pessoas' name="num_pessoas" type="number" onBlur={(e) => validarNumero(e)} value={formData.num_pessoas} onChange={handleOnChange} min={1} max={capacidade} required />
                        </div>
                        <hr className='separador' />
                        <div className="panel-right">
                            <h2>Opcional</h2>
                            <label htmlFor="motivo">Motivo</label>
                            <input readOnly={!edit} id='motivo' name="motivo" type="text" value={formData.motivo ? formData.motivo : motivo || ''} onChange={handleOnChange} />
                            <label htmlFor="descricao">Descricao</label>
                            <input readOnly={!edit} id='descricao' name="descricao" type="text" value={descricao ? descricao : formData.descricao} onChange={handleOnChange} />
                            <h2>{`Extras (snacks/equipamentos)`}</h2>
                            {extras.map((extra, index) => (
                                <div className='extra' ref={index === extras.length - 1 ? lastExtraRef : null} key={index}>
                                    <label htmlFor={`descricao_extra_${index}`}>Extra</label>
                                    <input readOnly={(details && !edit)} id={`descricao_extra_${index}`} name="descricao_extra" type="text" value={extra.descricao_extra} onChange={(e) => handleChange(index, e)} />
                                    <label htmlFor={`extra_qt_${index}`}>Quantidade</label>
                                    <input readOnly={(details && !edit)} id={`extra_qt_${index}`} name="extra_qt" type="number" value={extra.extra_qt} onChange={(e) => handleChange(index, e)} />
                                </div>
                            ))}
                            {!details &&
                                <div className='add' >
                                    {(extras.length > 1) &&
                                        <div title='Remover Extra'>
                                            <svg fill='currentColor' id='remove' onClick={removeExtra} xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" width="24" height="24">
                                                <path d="m16.561,9.561l-2.439,2.439,2.439,2.439-2.121,2.121-2.439-2.439-2.439,2.439-2.121-2.121,2.439-2.439-2.439-2.439,2.121-2.121,2.439,2.439,2.439-2.439,2.121,2.121Zm7.439,2.439c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-3,0c0-4.963-4.037-9-9-9S3,7.037,3,12s4.038,9,9,9,9-4.037,9-9Z" />
                                            </svg>
                                        </div>
                                    }
                                    <div title='Adicionar Extra'>
                                        <svg id='add' onClick={addExtra} xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill='currentColor' d="m16.561,9.561l-2.439,2.439,2.439,2.439-2.121,2.121-2.439-2.439-2.439,2.439-2.121-2.121,2.439-2.439-2.439-2.439,2.121-2.121,2.439,2.439,2.439-2.439,2.121,2.121Zm7.439,2.439c0,6.617-5.383,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12Zm-3,0c0-4.963-4.037-9-9-9S3,7.037,3,12s4.038,9,9,9,9-4.037,9-9Z" />
                                        </svg>
                                    </div>
                                </div>
                            }

                        </div>
                    </form>
                </div>
                <div className="btns">
                    {edit && <button id='no' onClick={() => { window.confirm('Pretende cancelar a edição da reserva?') && navigate(session.user.tipo ? '/reservations' : goTo) }}>Cancelar</button>}
                    <>
                        {!edit &&
                            <button id='no' onClick={() => { window.confirm(`Pretende cancelar a reserva?`) && navigate('/home') }}>Cancelar</button>
                        }
                        <button id='yes' type='submit' onClick={edit ? () => handleEdit(id_res) : () => handleSubmit}>Submeter</button>
                    </>
                </div>

                {session.user.tipo &&
                    <div className='back'>
                        <svg onClick={() => navigate('/reservations')} id='back-arrow' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512">
                            <path fill="currentColor" d="M10.6,12.71a1,1,0,0,1,0-1.42l4.59-4.58a1,1,0,0,0,0-1.42,1,1,0,0,0-1.41,0L9.19,9.88a3,3,0,0,0,0,4.24l4.59,4.59a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42Z" />
                        </svg>
                    </div>
                }
            </div>
        </>
    )

}