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

    async aprovarExterno(id_pedido) {
        return await fetch(`${API_URL}/pedidos/aprovar-fluxo-externo/` + id_pedido + '/' + localStorage.getItem('usuario_id'), {
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
