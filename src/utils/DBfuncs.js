import { supabase } from "../services/DB_API.js";
import bcrypt from 'bcryptjs';

/*****************************************************************************************************/
/*                                            UTILIZADORES                                           */
/*****************************************************************************************************/
export const createUser = async (formData) => {
    const hashedPassword = await bcrypt.hash(formData.pass, 10);
    const { data, error } = await supabase.from('utilizadores').insert([{
        nome: formData.name,
        email: formData.email,
        password: hashedPassword,
        tipo: formData.tipo || false,
    }]);

    if (formData.pass !== formData.rePass) {
        alert('As Passwords não coincidem')
        return
    }
    if (error) {
        return { error };
    }
    alert('Conta criada com sucesso');
    return { data };
};

export const fetchUser = async () => {
    const session = JSON.parse(localStorage.getItem('session'));
    const { data: userData, error: userError } = await supabase.from('utilizadores').select('*').eq('email', session.user.email).single();
    if (userError) {
        return { error: userError }
    }

    if (userData.tipo) {
        const { data, error } = await supabase.from('utilizadores').select('*')
        return error ? { error } : { data };
    }
    return { data: userData }
};

export const deleteUser = async (id, username) => {
    const confirmDelete = window.confirm("Tem certeza de que deseja apagar este utilizador?");
    if (!confirmDelete) return;

    const { data, error } = await supabase.from('utilizadores').delete().eq('id', id);
    console.log(id)
    if (error) {
        return { error };
    }
    alert(`Utilizador ${username} excluído da base de dados`);
    return { data };
};

export const login = async (formData) => {
    const { data: user, error } = await supabase.from('utilizadores').select('*').eq('email', formData.email).single();

    if (error || !user) {
        alert('Ainda não tem conta registada!');
        return;
    }

    const isPasswordValid = await bcrypt.compare(formData.pass, user.password);

    if (!isPasswordValid) {
        alert('Password errada');
        return;
    }

    const session = { user };
    localStorage.setItem('session', JSON.stringify(session));
    alert(`Bem vind@ ${session.user.nome}`)
    return { data: session };
};

/*****************************************************************************************************/
/*                                               SALAS                                               */
/*****************************************************************************************************/
export const fetchRoom = async () => {
    const { data, error } = await supabase.from('salas').select('*');
    return error ? { error } : { data };
}

export const fetchExtraByReservation = async (reservationID) => {
    const { data, error } = await supabase
        .from('extras')
        .select('*')
        .eq('id_r', reservationID);
        return error ? { error } : { data };
}

export const updateMissedReservations = async () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 14);
    const checkTime = currentTime.toLocaleTimeString('pt-PT', { hour12: false }).slice(0, 5);

    const { data, error } = await supabase
        .from('reservas')
        .update({ estado: 'expirada' })
        .eq('data', currentDate)
        .lt('h_inicio', checkTime)
        .in('estado', ['pendente', 'confirmada'])
        .select();

    return { data, error };
};

export const fetchReservation = async () => {
    const { data, error } = await supabase.from('reservas').select('*');
    return error ? { error } : { data };
}

export const fetchRoomByReservation = async (reservationID) => {
    try {
        // Buscar as reservas com a chave estrangeira da sala
        const { data, error } = await supabase
            .from("reservas")
            .select("*, salas(*)")  // Seleciona todos os campos de "reservas" e os dados da sala associada
            .eq("id", reservationID); // Filtra pela chave primária da reserva (id)

        if (error) {
            console.error("Erro ao buscar a reserva:", error.message);
            return { error };
        }

        // Se não houver dados, retorna um erro ou uma resposta vazia
        if (data.length === 0) {
            console.log("Nenhuma reserva encontrada");
            return { error: "Nenhuma reserva encontrada" };
        }

        // Se a reserva for encontrada, retorna a sala associada
        const room = data[0].salas;  // A chave estrangeira "salas" estará dentro da resposta

        return { data: room };  // Retorna a sala associada à reserva
    } catch (err) {
        console.error("Erro inesperado ao buscar a sala da reserva:", err);
        return { error: err.message };
    }
};

export const fetchReservationByUser = async (userID) => {
    const {data, error} = await supabase.from('reservas').select('*').eq('id_u', userID);
    return error ? { error } : { data };
}

/*****************************************************************************************************/
/*                                               MISC                                                */
/*****************************************************************************************************/
export const updateUserTheme = async (id, tema) => {
    const { data, error } = await supabase.from('utilizadores').update({ tema }).eq('id', id);

    if (error) {
        console.error('Erro ao atualizar tema:', error);
        return false;
    }

    console.log('Tema atualizado com sucesso!');
    return true;
}

export const loadUserTheme = async (userId) => {
    const { data, error } = await supabase
        .from('utilizadores')
        .select('tema')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Erro ao carregar tema do utilizador:', error);
        return;
    }

    const theme = data.tema || 'dark';
    document.body.classList.toggle('light-theme', theme === 'light');
};
