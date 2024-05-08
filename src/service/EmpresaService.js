import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class EmpresaService {
    async buscaEmpresas() {
        return await fetch(`${API_URL}/empresas/listar-empresas`, {
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
