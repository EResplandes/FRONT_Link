const token = localStorage.getItem('token');

import API_URL from './config.js';

export default class LmService {
    // Metódo para cadastrar LM - Tela Engenharia
    async cadastrarLm(form, campos) {
        return await fetch(`${API_URL}/lm/cadastrar-lm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                aplicacao: form?.aplicacao,
                lm: form?.lm,
                urgente: form?.urgente,
                prazo: this.formatarDataParaYMD(form?.prazo),
                id_solicitante: localStorage.getItem('usuario_id'),
                id_empresa: form?.empresa?.id,
                id_local: form?.local.id,
                materiais: campos
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

    // Metódo para buscar todas LM's - Tela Gerentes
    async buscaLms() {
        return await fetch(`${API_URL}/lm/listar-lms`, {
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

    // Metódo para buscar todas LM's - Tela Gerentes
    async buscaLmsAlmoxarifado() {
        return await fetch(`${API_URL}/lm/listar-lms-almoxarifado`, {
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

    // Metódo para buscar todas LM's - Tela Compradores
    async buscaLmsAssociadas() {
        let idComprador = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/lm/lm-associadas/${idComprador}`, {
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

    // Metódo associar pedido a item de uma lm - Tela Comprador
    async associarMaterialLmPedido(idPedido, idItem) {
        return await fetch(`${API_URL}/lm/associar-pedido/${idPedido}/${idItem}`, {
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

    // Metódo responsável por buscar compradores - Tela Gerentes
    async listarCompradores() {
        return await fetch(`${API_URL}/lm/listar-compradores`, {
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

    // Metódo responsável por associar um comprador a uma LM - Tela Gerentes
    async associarComprador(id_lm, id_comprador) {
        let idGerente = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/lm/associar-comprador/${id_lm}/${id_comprador}/${idGerente}`, {
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

    // Metódo responsável por cadastrar lançamento de material - Tela comprador
    cadastrarLancamentoMaterial(form, materialSelecionado) {
        const formData = new FormData();
        formData.append('quantidade_entregue', form?.quantidade_entregue ?? null);
        formData.append('numero_nota', form?.numero_nota ?? null);
        formData.append('dt_entrega', this.formatarDataParaYMD(form?.data_entrega) ?? null);
        formData.append('nota', form?.nota ?? null);
        formData.append('id_material', materialSelecionado ?? null);
        formData.append('id_usuario', localStorage.getItem('usuario_id') ?? null);

        return fetch(`${API_URL}/lm/cadastrar-lancamento`, {
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

    // Metódo responsável por buscar lançamentos de um material - Tela Comprador
    async listarLancamentos(id_material) {
        return await fetch(`${API_URL}/lm/listar-lancamentos/${id_material}`, {
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

    // Metódo responsável por listar todos locais
    async listarLocais() {
        return await fetch(`${API_URL}/lm/listar-locais`, {
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

    // Metódo responsável por buscar chat de material atráves do id do material
    async buscaChat(idMaterial) {
        return await fetch(`${API_URL}/lm/listar-chat/${idMaterial}`, {
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

    // Metódo responsável por buscar chat da lm atráves do id da lm
    async buscaChatLm(idLm) {
        return await fetch(`${API_URL}/lm/listar-chat-lm/${idLm}`, {
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

    // Metódo responsável por enviar mensagem
    async enviarMensagem(novaMensagem, id_material) {
        return await fetch(`${API_URL}/lm/enviar-mensagem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                mensagem: novaMensagem,
                id_usuario: localStorage.getItem('usuario_id'),
                id_material: id_material
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

    // Metódo responsável por enviar mensagem em uma lm
    async enviarMensagemLm(novaMensagem, id_lm) {
        return await fetch(`${API_URL}/lm/enviar-mensagem-lm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                mensagem: novaMensagem,
                id_usuario: localStorage.getItem('usuario_id'),
                id_lm: id_lm
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

    // Metódo responsável por cadastrar novo material a uma lm existente por parte da engenharia
    async cadastrarNovoMaterial(material) {
        console.log(material);
        return await fetch(`${API_URL}/lm/cadastrar-novo-material`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                descricao: material.descricao,
                descritiva: material.descritiva,
                indicador: material.indicador,
                unidade: material.unidade,
                quantidade: material.quantidade,
                id_lm: material.id_lm,
                usuario: localStorage.getItem('nome')
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

    // Metódo responsável por cadastrar novo material a uma lm existente por parte da engenharia
    async autorizarQuantitativo(quantidades) {
        return await fetch(`${API_URL}/lm/autorizar-quantidade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
                materiais: quantidades,
                usuario: localStorage.getItem('nome')
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

    // Metódo responsável por finalizar LM
    async finalizarLm(idLm) {
        return await fetch(`${API_URL}/lm/finalizar-lm/${idLm}`, {
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

    // Metódo responsável por iniciar LM
    async iniciarLm(idLm) {
        let idComprador = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/lm/iniciar-lm/${idLm}/${idComprador}`, {
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

    // Metódo responsável por listar todos status de uma LM
    async listarStatusLm() {
        return await fetch(`${API_URL}/lm/listar-status-lm`, {
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

    // Metódo responsável por listar todos status de um material
    async listarStatusMaterial() {
        return await fetch(`${API_URL}/lm/listar-status-materiais`, {
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

    // Metódo respomsável por alterar status de uma lm
    async alterarStatusLm(idLm, idStatus) {
        let idComprador = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/lm/alterar-status-lm/${idLm}/${idStatus}/${idComprador}`, {
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

    // Metódo respomsável por alterar status de uma lm
    async alterarStatusMaterial(idMaterial, idStatus) {
        let idComprador = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/lm/alterar-status-material/${idMaterial}/${idStatus}/${idComprador}`, {
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

    // Metódo responsável por liberar Material para Almoxarife
    async liberaMaterialAlmoxarife(idMaterial) {
        let idComprador = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/lm/liberar-material/${idMaterial}/${idComprador}`, {
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

    // Metódo responsável por buscar anexos de uma lm
    async listarAnexos(idLm) {
        return await fetch(`${API_URL}/lm/listar-anexos/${idLm}`, {
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

    // Metódo responsável por bloquear material para o almoxarife
    async bloqueiaMaterialAlmoxarife(idMaterial) {
        let idComprador = localStorage.getItem('usuario_id');
        return await fetch(`${API_URL}/lm/bloquear-material/${idMaterial}/${idComprador}`, {
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

    // Metódo responsável por validar função do usuário
    async validaFuncao() {
        let idComprador = localStorage.getItem('usuario_id');
        let funcao = localStorage.getItem('funcao');
        return await fetch(`${API_URL}/lm/valida-funcao-usuario/${idComprador}/${funcao}`, {
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

    // Metódo responsável por salvar anexo
    async salvarAnexo(data) {
        const form = new FormData();
        form.append('id_usuario', data.id_usuario ?? '');
        form.append('id_lm', data.id_lm ?? '');
        form.append('anexo', data.anexo ?? '');
        form.append('observacao', data.observacao ?? '');

        return await fetch(`${API_URL}/lm/salvar-anexo`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token
                // NÃO inclua 'Content-Type': 'multipart/form-data' — o browser define isso automaticamente com o boundary
            },
            body: form
        })
            .then((res) => res.json())
            .catch((error) => {
                console.error('Error:', error);
                throw error;
            });
    }

    // Metódo responsável por formatar data
    formatarDataParaYMD(data) {
        if (data) {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa do zero, então somamos 1
            const ano = data.getFullYear();

            return `${ano}-${mes}-${dia}`;
        } else {
            return `0000-00-00`;
        }
    }
}
