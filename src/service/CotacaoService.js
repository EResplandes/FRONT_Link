import API_URL from './config.js';

const token = localStorage.getItem('token');
const usuario_id = localStorage.getItem('usuario_id');

const headers = {
    Authorization: 'Bearer ' + token
};

export default class CotacaoService {
    // Requisição responsável por buscar preços de item
    async buscarPrecos(form) {
        return await fetch(`${API_URL}/cotacoes/buscar-precos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                item: form.item
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

    // Requisição responsável por buscar todas  cotações
    async buscarCotacoes(id_usuario) {
        return await fetch(`${API_URL}/cotacoes/buscar-cotacoes/${id_usuario}`, {
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

    // Requisição responsável por cadastrar cotação
    async cadastrarCotacao(form) {
        return await fetch(`${API_URL}/cotacoes/cadastrar-cotacao`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_comprador: usuario_id,
                finalidade: form.finalidade,
                rm: form.rm,
                id_local: form.local.id,
                id_empresa: form.empresa.id
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
