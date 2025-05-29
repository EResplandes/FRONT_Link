import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class DashboardLmService {
    async buscaInformacoes() {
        return await fetch(`${API_URL}/lm/informacoes-dashboard`, {
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
