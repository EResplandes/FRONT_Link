import API_URL from './config.js';

const token = localStorage.getItem('token');
const usuarioLogadoId = localStorage.getItem('usuario_id');

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

    async reprovar(mensagem, id_pedido) {
        return await fetch(`${API_URL}/fluxo/reprovar-fluxo/` + id_pedido + '/' + localStorage.getItem('usuario_id') + '/' + mensagem, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                mensagem: mensagem
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

    async buscaIndicadores() {
        return await fetch(`${API_URL}/fluxo/indicadores`, {
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

    async aprovarFluxoComRessalva(id_pedido, mensagem) {
        return fetch(`${API_URL}/fluxo/aprovar-fluxo-com-ressalva`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: id_pedido,
                mensagem: mensagem,
                id_usuario: usuarioLogadoId
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
