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

    async enviarMensagem(id, mensagem) {
        return fetch(`${API_URL}/app/enviar-mensagem/${id}/${mensagem}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
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

    // Requisição responsável por listar todos pedidos com emival para o Gestor de Fluxo
    async pedidosEmivalGestorFluxo() {
        return await fetch(`${API_URL}/pedidos/listar-emival-gestor-fluxo`, {
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

    // Requisição responsável por listar todos pedidos com emival somente da DP
    async pedidosEmivalDp() {
        return await fetch(`${API_URL}/dp/listar-emival-dp`, {
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

    // Requisição responsável por listar todos pedidos pendentes do Emival
    async listarPedidosPendentesEmival() {
        return await fetch(`${API_URL}/app/listarPedidosPendentesEmival`, {
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
    async buscaPedidosLimitados(id_local, form) {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-limitado/${id_local}/${this.formatarDataParaYMD(form.dt_inicio)}/${this.formatarDataParaYMD(form.dt_fim)}`, {
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

    async mensagemPedidoUnico(dados) {
        return await fetch(`${API_URL}/app/enviar-mensagem/${dados[0].id}/${dados[0].mensagem}`, {
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

    // Requisição responsável por buscar pedidos com base em status e id do usuário local
    async buscaPedidosPorCompradorStatus(id_criador, id_status) {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-por-comprador-status/${id_criador}/${id_status}`, {
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
    async buscaPedidosFinanceiro() {
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

    // Requisição responsável por buscar pedidos com parcelas
    async buscaControleFinanceiro() {
        return await fetch(`${API_URL}/pedidos/listar-controle-financeiro`, {
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

    // Requisição responsável por buscar pedidos com parcelas com filtro
    async buscaControleFinanceiroFiltros(idEmpresa) {
        return await fetch(`${API_URL}/pedidos/listar-controle-financeiro-filtro/${idEmpresa}`, {
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

    // Requisição responsável por buscar todos pedidos para gestor de fluxo com filtro por data
    buscaPedidosGestorFiltro(form) {
        return fetch(`${API_URL}/pedidos/listar-pedidos-filtro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                dt_inicio: this.formatarDataParaYMD(form.dt_inicio),
                dt_fim: this.formatarDataParaYMD(form.dt_fim),
                numero_pedido: form?.numero_pedido
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

    // Requisição responsável por buscar todos pedidos para comprador externo
    buscaTodosPedidosExternosComFiltro(form) {
        return fetch(`${API_URL}/pedidos/listar-pedidos-filtro-comprador-externo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                dt_inicio: this.formatarDataParaYMD(form.dt_inicio),
                dt_fim: this.formatarDataParaYMD(form.dt_fim)
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

    // Requisição responsável por listar todos pedidos para o relatório emival
    async pedidosRelatorioEmival() {
        return await fetch(`${API_URL}/pedidos/listar-relatorio-emival`, {
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

    // Requisição responsável por listar todos pedidos para o relatório financeiro
    async pedidosAuditoriaFinanceiro() {
        return await fetch(`${API_URL}/pedidos/auditoria-financeiro`, {
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

    // Requisição responsável por listar todos pedidos com Giovana Caiado
    async pedidosGiovana() {
        return await fetch(`${API_URL}/pedidos/listar-giovana`, {
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

    // Requisição responsável por listar todos pedidos com Emival de forma temporaria
    async listarTodosPedidosEmivalTemp() {
        return await fetch(`${API_URL}/app/listar-todos-pedidos-emival-temp`, {
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

    // Requisição responsável por listar todos pedidos com Giovana Caiado
    async pedidosEmivalTodos() {
        return await fetch(`${API_URL}/app/litar-todos-pedidos-emvail`, {
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

    // Requisição responsável aprovar pedido emival temp
    async aprovarPedidoEmivalTemp(id) {
        return await fetch(`${API_URL}/app/aprovar-pedido-emival-temp/${id}`, {
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

    reprovarPedidoEmivalTemp(idPedido, mensagem) {
        return fetch(`${API_URL}/app/reprovar-pedido-emival-temp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: idPedido,
                mensagem: mensagem
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

    ressalvaPedidoEmivalTemp(idPedido, mensagem) {
        return fetch(`${API_URL}/app/ressalva-pedido-emival-temp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: idPedido,
                mensagem: mensagem
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

    // Requisição responsável aprovar pedido
    async aprovarGiovana(id, idDestino) {
        return await fetch(`${API_URL}/pedidos/aprovar-giovana/${id}/${idDestino}`, {
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

    // Requisição responsável por reprovar pedido Dr Giovana
    reprovarGiovana(idPedido, mensagem) {
        return fetch(`${API_URL}/pedidos/reprovar-giovana`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: idPedido,
                mensagem: mensagem
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

    // Metódo responsável por buscar pedidos que ja foram reprovados e seu chat
    async buscarRespostaPedidosReprovados() {
        return await fetch(`${API_URL}/pedidos/listar-pedidos-respondidos-para-emival`, {
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

    // Requisição responsável por enviar pedido para comprador justificar
    async enviarPedidoComprador(id) {
        return await fetch(`${API_URL}/pedidos/enviar-pedido-comprador/${id}`, {
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

    aprovarGiovanaPdf(id_pedido, id_destino, anexo) {
        const formData = new FormData();
        formData.append('idPedido', id_pedido ?? null);
        formData.append('idDestino', id_destino ?? null);
        formData.append('anexo', anexo, 'arquivo.pdf'); // 'arquivo.pdf' é o nome que você deseja dar ao arquivo no servidor

        return fetch(`${API_URL}/pedidos/aprovar-giovana-pdf/`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
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

    cobrarResposta(pedidoSelecionado, mensagemEmival) {
        return fetch(`${API_URL}/app/cobrar-resposta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: pedidoSelecionado,
                mensagem: mensagemEmival
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

    finalizarPendencia(id_pedido) {
        return fetch(`${API_URL}/app/finalizar-ressalva`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                id_pedido: id_pedido
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

    isValidDateFormat(dateStr) {
        // Define a expressão regular para o formato específico
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        // Testa a data fornecida contra a expressão regular
        return regex.test(dateStr);
    }
}
