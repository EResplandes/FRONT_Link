const token = localStorage.getItem('token');

import API_URL from './config.js';

export default class MonicaService {
    // Requisição responsável por buscar quantidades
    async buscaQuantidades() {
        return await fetch(`${API_URL}/monica/listarQuantidades`, {
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

    // Requisição responsável por aprovar
    async aprovarMonica(pedidos) {
        const pedidosJSON = JSON.stringify(pedidos); // Convertendo pedidos para JSON
        return fetch(`${API_URL}/monica/aprovar`, {
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

    // Requisição responsável por listar todos pedidos menor que 500 para app aprovação
    async listarMonicaMenorQuinhentos() {
        return await fetch(`${API_URL}/monica/listarMonicaMenorQuinhentos`, {
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

    // Requisição responsável por listar todos pedidos entre 500 e 1000 para app aprovação
    async listarMonicaMenorMil() {
        return await fetch(`${API_URL}/monica/listarMonicaMenorMil`, {
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

    // Requisição responsável por listar todos pedidos maior que 1000 para app aprovaçãos
    async listarMonicaMaiorMil() {
        return await fetch(`${API_URL}/monica/listarMonicaMaiorMil`, {
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

    // Requisição responsável por aprovar apenas 1 pedido
    async aprovarPedidoUnico(id_pedido) {
        return await fetch(`${API_URL}/monica/aprovar-acima/` + id_pedido, {
            method: 'PUT',
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
