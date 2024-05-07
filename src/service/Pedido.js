const token = localStorage.getItem('token');

import API_URL from './config.js';

export default class PedidoService {
    async login(form) {
        return await fetch(`${API_URL}/autenticacao/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                email: form.email,
                password: form.senha
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

    async pedidosEmival() {
        return await fetch(`${API_URL}/pedidos/listar-emival`, {
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

    async filtroPedidos(form) {
        let descricao = form.descricao;
        let empresa = form.empresa?.id;
        let valor = form.valor;
        let dt_inclusao = form.dt_inclusao;
        let urgente = form.urgente;

        let url = `${API_URL}/pedidos/filtro-emival`;

        if (descricao || empresa || valor || dt_inclusao || urgente) {
            url += '?';

            if (descricao) {
                url += `descricao=${encodeURIComponent(descricao)}&`;
            }
            if (empresa) {
                url += `empresa=${encodeURIComponent(empresa)}&`;
            }
            if (valor) {
                url += `valor=${encodeURIComponent(valor)}&`;
            }
            if (dt_inclusao) {
                url += `dt_inclusao=${encodeURIComponent(dt_inclusao)}&`;
            }
            if (urgente) {
                url += `urgente=${encodeURIComponent(urgente)}&`;
            }
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + token
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async excluirPedido(id_pedido) {
        return await fetch(`${API_URL}/pedidos/deletar/` + id_pedido, {
            method: 'DELETE',
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
