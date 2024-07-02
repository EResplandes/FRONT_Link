import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class GerenteService {
    async buscaPedidos(id) {
        return await fetch(`${API_URL}/pedidos/listar-gerente/` + id, {
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

    async aprovar(id) {
        return await fetch(`${API_URL}/pedidos/aprovar-fluxo/` + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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

    async aprovarPedidoDiretor(id, idLink, urgente) {
        console.log(id, idLink);
        return await fetch(`${API_URL}/pedidos/aprovar-fluxo-diretor/` + id + '/' + idLink + '/' + urgente, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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

    async aprovarExterno(id_pedido, idLink, idUsuario) {
        return await fetch(`${API_URL}/pedidos/aprovar-fluxo-externo/` + id_pedido + '/' + idLink + '/' + idUsuario, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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

    async reprovarExterno(id_pedido, idUsuario, mensagem) {
        return await fetch(`${API_URL}/pedidos/reprovar-fluxo-externo/` + id_pedido + '/' + idUsuario + '/' + mensagem, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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

    async reprovar(id_fluxo, mensagem) {
        return await fetch(`${API_URL}/pedidos/reprovar-fluxo/` + id_fluxo + '/' + localStorage.getItem('usuario_id') + '/' + mensagem, {
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
}
