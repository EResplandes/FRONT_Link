const token = localStorage.getItem('token');

import API_URL from './config.js';

export default class PedidoService {
    async aprovarEmival(pedidos) {
        const pedidosJSON = JSON.stringify(pedidos); // Convertendo pedidos para JSON
        console.log(pedidos);
        console.log('Pedidos enviados para o backend:', pedidosJSON); // Exibindo no console

        return fetch(`${API_URL}/app/aprovar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                pedidos: pedidos
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

    // Metódo responsável por buscar todos pedidos com Dr Emival
    async listarEmivalMenorQuinhentos() {
        return await fetch(`${API_URL}/app/listarEmivalMenorQuinhentos`, {
            method: 'GET',
            headers: {
                Accept: 'application/json'
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

    async listarEmivalMenorMil() {
        return await fetch(`${API_URL}/app/listarEmivalMenorMil`, {
            method: 'GET',
            headers: {
                Accept: 'application/json'
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

    async listarEmivalMaiorMil() {
        return await fetch(`${API_URL}/app/listarEmivalMaiorMil`, {
            method: 'GET',
            headers: {
                Accept: 'application/json'
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

    // Metódo responsável por buscar todos pedidos enviados para Dr Monica
    async pedidosMonica() {
        return await fetch(`${API_URL}/pedidos/listar-monica`, {
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

    // Metódo responsável por buscar todos pedidos
    async buscaPedidos() {
        return await fetch(`${API_URL}/pedidos/listar-pedidos`, {
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

    // Metódo responsável por buscar pedidos com status 6
    async buscaAnalisando() {
        return await fetch(`${API_URL}/pedidos/listar-analise`, {
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

    // Metódo responsável por buscar todos pedidos com filtros
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

    // Metódo responsável por excluir pedido de acordo com id passado
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
