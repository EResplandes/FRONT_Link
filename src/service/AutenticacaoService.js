import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class AutenticacaoService {
    async login(form) {
        return await fetch(`${API_URL}/autenticacao/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                email: form.email,
                password: form.senha
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

    async token() {
        return await fetch(`${API_URL}/autenticacao/token`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
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

    async alteraSenha(nova_senha, id_usuario) {
        console.log(nova_senha, id_usuario);
        return await fetch(`${API_URL}/autenticacao/alterar-senha/` + id_usuario, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                nova_senha: nova_senha
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
