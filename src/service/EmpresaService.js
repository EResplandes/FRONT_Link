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

    async cadastrar(form) {
        return fetch(`${API_URL}/empresas/cadastrar-empresa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                nome_empresa: form.nome_empresa,
                cnpj: form.cnpj,
                inscricao_estadual: form.inscricao_estadual,
                filial: form.filial
            })
        })
            .then((res) => res.json())
            .then((d) => {
                console.log(d);
                return d;
            })
            .catch((error) => {
                console.error('Error:', error);
                throw error;
            });
    }

    async deletar(id) {
        return await fetch(`${API_URL}/empresas/deletar-empresa/` + id, {
            method: 'DELETE',
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
