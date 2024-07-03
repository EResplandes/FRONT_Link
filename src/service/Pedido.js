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

    async aprovarMonica(pedidos) {
        const pedidosJSON = JSON.stringify(pedidos); // Convertendo pedidos para JSON
        return fetch(`${API_URL}/app/aprovar-monica`, {
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

    // Requisição responsável por definir pedido como urgente pela soleni
    async pedidoUrgente(idPedido) {
        return await fetch(`${API_URL}/pedidos/alterar-urgente/${idPedido}`, {
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

    // Requisição responsável por definir pedido como normal pela soleni
    async pedidoNormal(idPedido) {
        return await fetch(`${API_URL}/pedidos/alterar-normal/${idPedido}`, {
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

    // Requisição responsável por buscar todos pedidos de acordo com local
    async buscaPedidos(id_local) {
        return await fetch(`${API_URL}/pedidos/listar-pedidos/` + id_local, {
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

    // Requisição responsável por buscar todos pedidos de acordo com local
    async buscaPedidosPorComprador(id_usuario) {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-por-comprador/` + id_usuario, {
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

    // Requisição responsável por buscar todos pedidos com local 2 e 3
    async buscaTodosPedidosExternos() {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-externos`, {
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
    async buscaTodosPedidos() {
        return await fetch(`${API_URL}/pedidos/listar-pedidos/`, {
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

    // Requisição responsável por reprovar apenas 1 pedidi
    async reprovarPedidoUnico(id_pedido, mensagem) {
        const idUsuario = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/app/reprovar-acima/${id_pedido}/${idUsuario}/${mensagem}`, {
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

    // Requisição responsável por aprovar com ressalva apenas 1 pedido
    async ressalvaPedidoUnico(id_pedido, mensagem) {
        const idUsuario = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/app/ressalva-acima/${id_pedido}/${idUsuario}/${mensagem}`, {
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

    // Requisição responsável por buscar quantidades
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

    // Requisição responsável por buscar informações e fluxo do pedido
    async buscaInformacoesPedidoAlterar(id) {
        return await fetch(`${API_URL}/pedidos/informacoes-pedido-alterar/` + id, {
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

    // Requisição responsável por buscar pedidos aprovados com ressalva de acordo com id do criador
    async buscaPedidosRessalva(id) {
        return await fetch(`${API_URL}/pedidos/listar-ressalva/` + id, {
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

    // Requisição responsável por responder pedido com status Pedido aprovado com ressalva
    respondePedidoRessalva(novaMensagem, id_pedido) {
        return fetch(`${API_URL}/pedidos/responde-ressalva/` + id_pedido, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_usuario: parseInt(localStorage.getItem('usuario_id'), 10),
                mensagem: novaMensagem
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

    // Requisição responsável por buscar pedidos reprovados por gerente ou diretor com statys 10
    async buscaReprovadosFluxo(id) {
        return await fetch(`${API_URL}/pedidos/listar-reprovados-fluxo/` + id, {
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

    // Requisição responsável por buscar pedidos reprovados por Soleni com statys 11
    async buscaReprovadosSoleni(id) {
        return await fetch(`${API_URL}/pedidos/listar-reprovados-soleni/` + id, {
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

    // Requisição responsável por buscar pedidos com status 15 - Enviado para financeiro
    async buscaPedidosFinanceiro(id) {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-financeiro`, {
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

    // Requisição responsável por buscar pedidos reprovados com financeiro
    async buscaPedidosReprovadosFinanceiro() {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-reprovados-finaceiro`, {
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
    respondePedidoReprovadoFluxo(novoAnexo, novaMensagem, id_pedido) {
        let idCriador = localStorage.getItem('usuario_id');
        const formData = new FormData();
        formData.append('mensagem', novaMensagem);
        formData.append('id_usuario', idCriador);
        formData.append('anexo', novoAnexo ?? null);

        return fetch(`${API_URL}/pedidos/responde-reprovado-fluxo/` + id_pedido + '/' + localStorage.getItem('usuario_id') + '/' + novaMensagem, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token
            },
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

    // Requisição responsável por responder pedido reprovado pela Soleni
    respondePedidoReprovadoSoleni(novoAnexo, novaMensagem, id_pedido) {
        let idCriador = localStorage.getItem('usuario_id');
        const formData = new FormData();
        formData.append('mensagem', novaMensagem);
        formData.append('id_usuario', idCriador);
        formData.append('anexo', novoAnexo ?? null);

        return fetch(`${API_URL}/pedidos/responde-reprovado-soleni/` + id_pedido, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token
            },
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

    // Requisição responsável por responder pedido reprovado
    atualizarInformacoesPedido(form, id) {
        const formData = new FormData();
        formData.append('descricao', form?.descricao ?? null);
        formData.append('valor', form?.valor ?? null);
        formData.append('urgente', form?.urgente) ?? 0;

        console.log(form.dt_vencimento);
        if (this.isValidDateFormat(form.dt_vencimento)) {
            formData.append('dt_vencimento', form?.dt_vencimento);
        } else {
            formData.append('dt_vencimento', this.formatarDataParaYMD(form?.dt_vencimento));
        }

        formData.append('anexo', form?.pdf ?? null);
        formData.append('id_empresa', form?.empresa?.id ?? null);
        formData.append('protheus', form?.protheus);

        return fetch(`${API_URL}/pedidos/atualizada-dados-pedido/` + id, {
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

    // Requisição responsável por responder pedido reprovado pela Soleni
    respondePedidoReprovadoFiscal(novoAnexo, novaMensagem, idNota) {
        let idCriador = localStorage.getItem('usuario_id');
        const formData = new FormData();
        formData.append('mensagem', novaMensagem);
        formData.append('id_usuario', idCriador);
        formData.append('nota', novoAnexo ?? null);

        return fetch(`${API_URL}/pedidos/responde-reprovado-fiscal/` + idNota, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token
            },
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

    // Requisição responsável por reprovar pedido do financeiro para fiscal mudando status para 20
    reprovarFinanceiroParaFiscal(novaMensagem, id_pedido) {
        return fetch(`${API_URL}/pedidos/reprovar-pedido-financeiro-fiscal/` + id_pedido, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_usuario: parseInt(localStorage.getItem('usuario_id'), 10),
                mensagem: novaMensagem
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

    // Requisição responsável por reprovar pedido do financeiro para comprador mudando status para 19
    reprovarFinanceiroParaComprador(novaMensagem, id_pedido) {
        return fetch(`${API_URL}/pedidos/reprovar-pedido-financeiro-comprador/` + id_pedido, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_usuario: parseInt(localStorage.getItem('usuario_id'), 10),
                mensagem: novaMensagem
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

    // Requisição responsável pagar pedido alterando status para 17 ou 18
    pagarPedido(comprovante, id_pedido) {
        return fetch(`${API_URL}/pedidos/pagar-pedido/` + id_pedido, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                comprovante: comprovante
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

    // Requisição responsável por responder pedido reprovado pela Soleni
    respondePedidoReprovadoFinanceiro(novoAnexo, novaMensagem, id_pedido) {
        let idCriador = localStorage.getItem('usuario_id');
        const formData = new FormData();
        formData.append('mensagem', novaMensagem);
        formData.append('id_usuario', idCriador);
        formData.append('anexo', novoAnexo ?? null);

        return fetch(`${API_URL}/pedidos/responde-reprovado-financeiro/` + id_pedido, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token
            },
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

    isValidDateFormat(dateStr) {
        // Define a expressão regular para o formato específico
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        // Testa a data fornecida contra a expressão regular
        return regex.test(dateStr);
    }
}
