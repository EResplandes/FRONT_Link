import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class ChatService {
    async buscaConversa(id) {
        return await fetch(`${API_URL}/chat/listar-conversa/` + id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            }
        })
            .then((res) => res.json())
            .then((d) => {
                return d;
            })
            .catch((error) => {
                console.error('Error:', error);
                throw error;
            });
    }

    async enviarMensagem(form) {
        return fetch(`${API_URL}/chat/enviar-mensagem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: form.id_pedido,
                id_usuario: localStorage.getItem('usuario_id'),
                mensagem: form.mensagem
            })
        })
            .then((res) => res.json())
            .then((d) => {
                console.log(d);
                return d;
            })
            .catch((error) => {
                console.error('Error:', error);
                throw error;
            });
    }
}
