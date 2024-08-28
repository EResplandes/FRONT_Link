import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class CaixaService {
    async buscaCaixas() {
        return await fetch(`${API_URL}/caixas/listar-caixas`, {
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

    async cadastrarCaixa(form) {
        return fetch(`${API_URL}/caixas/cadastrar-caixa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                funcionario: form.funcionario,
                funcao_funcionario: form.funcao,
                cpf: form.cpf,
                banco: form?.banco,
                agencia: form?.agencia,
                conta: form?.conta
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

    async deletarCaixa(id) {
        return await fetch(`${API_URL}/caixas/excluir-caixa/${id}`, {
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

    async buscasCaixasComFiltro(funcionario) {
        return fetch(`${API_URL}/caixas/filtrar-caixa-por-funcionario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                funcionario: funcionario
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

    async buscaHistoricoCaixa(id, tipo) {
        return await fetch(`${API_URL}/caixas/listar-controle-caixa/${id}/${tipo}`, {
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

    async cadastraFluxoDeCaixa(form, idCaixa) {
        return fetch(`${API_URL}/caixas/cadastrar-fluxo-de-caixa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_caixa: idCaixa,
                dt_lancamento: this.formatarDataParaYMD(form.dt_lancamento),
                discriminacao: form.discriminacao,
                debito: form.debito,
                credito: form?.credito,
                observacao: form?.observacao,
                tipo_caixa: 'Ajuda de Custo'
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

    formatarDataParaYMD(data) {
        if (data) {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa do zero, então somamos 1
            const ano = data.getFullYear();

            return `${ano}-${mes}-${dia}`;
        } else {
            return false;
        }
    }
}
