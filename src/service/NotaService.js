import API_URL from './config.js';

const token = localStorage.getItem('token');

const headers = {
    Authorization: 'Bearer ' + token
};

export default class NotaService {
    // Requisição responsável por cadastrar
    async cadastrarNota(form, id_pedido) {
        const formData = new FormData();
        formData.append('nota', form?.pdf ?? null);
        formData.append('boleto', form?.pdfBoleto ?? null);

        return await fetch(`${API_URL}/notas/cadastrar/${id_pedido}`, {
            method: 'POST',
            headers: headers,
            body: formData
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

    // Requisição responsável por cadastrar somente nota
    async cadastrarSomenteNota(form, id_pedido) {
        const formData = new FormData();
        formData.append('nota', form?.pdf ?? null);
        formData.append('boleto', form?.pdfBoleto ?? null);

        return await fetch(`${API_URL}/notas/cadastrar-somente-nota/${id_pedido}`, {
            method: 'POST',
            headers: headers,
            body: formData
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

    // Requisição responsável por listar todos pedidos no fiscal
    async pedidosEscriturar() {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-escriturar`, {
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

    // Requisição responsável por listar todos pedidos reprovados pelo fiscal de acordo com ID
    async pedidosReprovadosFiscalPorComprador(id) {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-reprovados-fiscal/${id}`, {
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

    // Requisição responsável por dar baixa em nota
    async darBaixa(id) {
        return await fetch(`${API_URL}/notas/dar-baixa/${id}`, {
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

    // Requisição responsável por rerpvoar nota
    async reprovarNota(id, mensagem) {
        let idUsuario = localStorage.getItem('usuario_id');

        return await fetch(`${API_URL}/notas/reprovar/${id}/${mensagem}/${idUsuario}`, {
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
