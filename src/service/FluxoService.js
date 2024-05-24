import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class FluxoService {
    async buscaFluxo(id) {
        return await fetch(`${API_URL}/fluxo/listar-fluxo/` + id, {
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

    async aprovarFluxo(id) {
        return await fetch(`${API_URL}/fluxo/aprovar-fluxo/` + id, {
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

    async reprovar(form, id_pedido) {
        return await fetch(`${API_URL}/fluxo/reprovar-fluxo/` + id_pedido + '/' + localStorage.getItem('usuario_id') + '/' + form.mensagem, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                mensagem: form.mensagem
            })
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

    async cadastrarFluxo(id_pedido, id_usuario) {
        return fetch(`${API_URL}/fluxo/cadastrar-fluxo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: id_pedido,
                id_usuario: id_usuario
            })
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
}
