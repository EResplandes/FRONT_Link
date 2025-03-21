import API_URL from './config.js';

const token = localStorage.getItem('token');

const headers = {
    Authorization: 'Bearer ' + token
};

export default class NotaService {
    // Requisição responsável por cadastrar
    async cadastrarNota(form, id_pedido) {
        const formData = new FormData();
        formData.append('nota', form?.pdf ?? null);
        formData.append('boleto', form?.pdfBoleto ?? null);

        return await fetch(`${API_URL}/notas/cadastrar/${id_pedido}`, {
            method: 'POST',
            headers: headers,
            body: formData
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

    // Requisição responsável por cadastrar somente nota
    async cadastrarSomenteNota(form, id_pedido) {
        const formData = new FormData();
        formData.append('nota', form?.pdf ?? null);
        formData.append('boleto', form?.pdfBoleto ?? null);

        return await fetch(`${API_URL}/notas/cadastrar-somente-nota/${id_pedido}`, {
            method: 'POST',
            headers: headers,
            body: formData
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

    // Requisição responsável por listar todos pedidos no fiscal
    async pedidosEscriturar() {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-escriturar`, {
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

    // Requisição responsável por listar todos pedidos reprovados pelo fiscal de acordo com ID
    async pedidosReprovadosFiscalPorComprador(id) {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-reprovados-fiscal/${id}`, {
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

    // Requisição responsável por dar baixa em nota
    async darBaixa(id, form) {
        return await fetch(`${API_URL}/notas/dar-baixa/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                dt_emissao: this.formatarDataParaYMD(form.dt_emissao) ?? null,
                valor: form.valor ?? null,
                numero_nota: form.nota_fiscal ?? null
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

    // Requisição responsável por rerpvoar nota
    async reprovarNota(id, mensagem) {
        let idUsuario = localStorage.getItem('usuario_id');

        return await fetch(`${API_URL}/notas/reprovar/${id}/${mensagem}/${idUsuario}`, {
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
