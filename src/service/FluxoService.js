import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class FluxoService {
    async buscaFluxo(id) {
        return await fetch(`${API_URL}/fluxo/listar-fluxo/` + id, {
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
