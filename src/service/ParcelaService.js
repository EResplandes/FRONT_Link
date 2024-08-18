import API_URL from './config.js';

const token = localStorage.getItem('token');

export default class ParcelaService {
    async cadastrar(parcelas, idPedido) {
        return fetch(`${API_URL}/parcelas/cadastrar-parcela/${idPedido}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                parcelas: parcelas
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

    async buscaPedidosHoje() {
        return fetch(`${API_URL}/parcelas/listar-parcelas-hoje`, {
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

    // Requisição responsável por validar parcelas
    async validarParcelas(idPedido) {
        return await fetch(`${API_URL}/parcelas/validar-parcelas/${idPedido}`, {
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

    // Requisição responsável por reprovar parcelas e enviar para comprador
    async reprovarParcelasComprador(idPedido, novaMensagme) {
        const idUsuario = localStorage.getItem('usuario_id');
        return fetch(`${API_URL}/parcelas/reprovar-parcelas`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: idPedido,
                id_usuario: idUsuario,
                mensagem: novaMensagme
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

    async buscaParcelasFiltradas(form) {
        return fetch(`${API_URL}/parcelas/listar-parcelas-filtradas/${this.formatarDataParaYMD(form.dt_inicio)}/${this.formatarDataParaYMD(form.dt_fim)}`, {
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

    async darBaixa(idParcela, form) {
        return fetch(`${API_URL}/parcelas/dar-baixa/${idParcela}/${form.banco.id}`, {
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

    // Requisição responsável por alterar dados de parcela de acordo com id
    async alterarDadosParcela(form) {
        return fetch(`${API_URL}/parcelas/alterar-dados-parcela`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_parcela: form.id,
                valor: form.valor,
                dt_vencimento: this.formatarParaParcelasData(form.dt_vencimento)
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

    formatarParaParcelasData(data) {
        if (data) {
            // Verifica se a data está no formato correto "YYYY-MM-DD"
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            if (regex.test(data)) {
                return false;
            }

            // Caso não esteja no formato "YYYY-MM-DD", formata a data
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();

            return `${ano}-${mes}-${dia}`;
        }
        return false;
    }
}
