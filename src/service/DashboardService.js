import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class DashboardService {
    async buscaInformacoes(id) {
        return await fetch(`${API_URL}/dashboard/${id}`, {
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
