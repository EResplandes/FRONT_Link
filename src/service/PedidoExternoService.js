import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class PedidoExternoService {
    async buscaInformacoes(id_pedido) {
        return await fetch(`${API_URL}/pedidos/informacoes-pedido/` + id_pedido, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            }
        })
            .then((res) => res.json())
            .then((d) => {
                this.informacoes = d;
                console.log(this.informacoes);
            })
            .catch((error) => {
                console.error('Error:', error);
                throw error;
            });
    }

    async validaFluxo(form) {
        return await fetch(`${API_URL}/fluxo/verifica-fluxo/` + form.id_pedido + '/' + form.id_usuario, {
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
}
