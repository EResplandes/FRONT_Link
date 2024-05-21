const token = localStorage.getItem('token');

import API_URL from './config.js';

const headers = {
    // Accept: 'multipart/form-data',
    // 'Content-Type': 'multipart/form-data',
    Authorization: 'Bearer ' + token
};

export default class PedidoService {
    async aprovarEmival(pedidos) {
        const pedidosJSON = JSON.stringify(pedidos); // Convertendo pedidos para JSON
        return fetch(`${API_URL}/app/aprovar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                pedidos: pedidos
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

    // Requisição responsável por listar todos pedidos com emival para o Gestor de Fluxo
    async pedidosEmival() {
        return await fetch(`${API_URL}/pedidos/listar-emival`, {
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

    // Requisição responsável por listar todos pedidos menor que 500 para app aprovação
    async listarEmivalMenorQuinhentos() {
        return await fetch(`${API_URL}/app/listarEmivalMenorQuinhentos`, {
            method: 'GET',
            headers: {
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

    // Requisição responsável por listar todos pedidos entre 500 e 1000 para app aprovação
    async listarEmivalMenorMil() {
        return await fetch(`${API_URL}/app/listarEmivalMenorMil`, {
            method: 'GET',
            headers: {
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

    // Requisição responsável por listar todos pedidos maior que 1000 para app aprovaçãos
    async listarEmivalMaiorMil() {
        return await fetch(`${API_URL}/app/listarEmivalMaiorMil`, {
            method: 'GET',
            headers: {
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

    // Requisição responsável por buscar pedidos reprovados para justicar
    async listarPedidosParaJustificar() {
        return await fetch(`${API_URL}/pedidos/listar-justificar?id_usuario=` + localStorage.getItem('usuario_id'), {
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

    // Requisição responsável por buscar todos pedidos enviados para Dr Monica
    async pedidosMonica() {
        return await fetch(`${API_URL}/pedidos/listar-monica`, {
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

    // Requisição responsável por buscar todos pedidos
    async buscaPedidos() {
        return await fetch(`${API_URL}/pedidos/listar-pedidos`, {
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

    // Requisição responsável por buscar pedidos com status 6
    async buscaAnalisando() {
        return await fetch(`${API_URL}/pedidos/listar-analise`, {
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

    // Requisição responsável por buscar todos pedidos com filtros
    async filtroPedidos(form) {
        let descricao = form.descricao;
        let empresa = form.empresa?.id;
        let valor = form.valor;
        let dt_inclusao = form.dt_inclusao;
        let urgente = form.urgente;

        let url = `${API_URL}/pedidos/filtro-emival`;

        if (descricao || empresa || valor || dt_inclusao || urgente) {
            url += '?';

            if (descricao) {
                url += `descricao=${encodeURIComponent(descricao)}&`;
            }
            if (empresa) {
                url += `empresa=${encodeURIComponent(empresa)}&`;
            }
            if (valor) {
                url += `valor=${encodeURIComponent(valor)}&`;
            }
            if (dt_inclusao) {
                url += `dt_inclusao=${encodeURIComponent(dt_inclusao)}&`;
            }
            if (urgente) {
                url += `urgente=${encodeURIComponent(urgente)}&`;
            }
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + token
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Requisição responsável por excluir pedido de acordo com id passado
    async excluirPedido(id_pedido) {
        return await fetch(`${API_URL}/pedidos/deletar/` + id_pedido, {
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

    // Requisição responsável por buscar pedidos reprovados status 3
    async buscaReprovados(id) {
        return await fetch(`${API_URL}/pedidos/listar-reprovado/` + id, {
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

    // Requisição responsável por aprovar apenas 1 pedido
    async aprovarPedidoUnico(id_pedido) {
        return await fetch(`${API_URL}/app/aprovar-acima/` + id_pedido, {
            method: 'PUT',
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

    // Requisição responsável por buscar pedidos reprovados status 3
    async buscaQuantidades() {
        return await fetch(`${API_URL}/app/listarQuantidades`, {
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

    // Requisição responsável por buscar pedidos aprovador por criador
    async buscaAprovadosPedidos(id) {
        return await fetch(`${API_URL}/pedidos/pedidos-aprovados/` + id, {
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

    // Requisição responsável por buscar informações e fluxo do pedido
    async buscaInformacoesPedido(id) {
        return await fetch(`${API_URL}/pedidos/informacoes-pedido/` + id, {
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

    // Requisição responsável por responder pedido reprovado
    respondePedidoReprovado(novoAnexo, novaMensagem, id_pedido) {
        let idCriador = localStorage.getItem('usuario_id');
        const formData = new FormData();
        formData.append('mensagem', novaMensagem);
        formData.append('id_criador', idCriador);
        formData.append('anexo', novoAnexo ?? null);

        return fetch(`${API_URL}/pedidos/responde-reprovado/` + id_pedido, {
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
}
