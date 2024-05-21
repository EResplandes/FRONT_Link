const token = localStorage.getItem('token');

import API_URL from './config.js';

export default class StatusService {
    async buscaStatus() {
        return await fetch(`${API_URL}/status/listar-status`, {
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
