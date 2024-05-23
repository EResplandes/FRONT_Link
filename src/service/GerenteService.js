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

    async reprovar(form, id_fluxo) {
        return await fetch(`${API_URL}/pedidos/reprovar-fluxo/` + id_fluxo, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                mensagem: form.mensagem,
                id_usuario: parseInt(form.id_usuario, 10)
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
