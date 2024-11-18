import API_URL from './config.js';

const token = localStorage.getItem('token');

const headers = {
    Authorization: 'Bearer ' + token
};

export default class DpService {
    async listarPedidosParaJustificar() {
        return await fetch(`${API_URL}/dp/listar-pedidos-justificar`, {
            method: 'GET',
            headers: headers
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

    async listarPedidos() {
        return await fetch(`${API_URL}/dp/listar-pedidos`, {
            method: 'GET',
            headers: headers
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
