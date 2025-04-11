import API_URL from './config.js';

const token = localStorage.getItem('token');

const headers = {
    Authorization: 'Bearer ' + token
};

export default class BancoService {
    async listarBancos(form, id_pedido) {
        return await fetch(`${API_URL}/bancos/listar-bancos`, {
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
