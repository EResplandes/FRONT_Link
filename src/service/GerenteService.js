import API_URL from './config.js';

const token = localStorage.getItem('token');

const headers = {
    Accept: 'application/pdf',
    'Content-Type': 'application/pdf',
    Authorization: 'Bearer ' + token
};

export default class GerenteService {
    async buscaPedidos(id) {
        return await fetch(`${API_URL}/pedidos/listar-gerente/` + id, {
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

    async buscaPedidosReprovadosRessalva(id) {
        return await fetch(`${API_URL}/gerente/listar-pedidos-reprovados-emival/` + id, {
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

    async aprovar(id) {
        return await fetch(`${API_URL}/pedidos/aprovar-fluxo/` + id, {
            method: 'GET',
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

    async aprovarPedidoDiretor(id, idLink, urgente) {
        return await fetch(`${API_URL}/pedidos/aprovar-fluxo-diretor/` + id + '/' + idLink + '/' + urgente, {
            method: 'GET',
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

    async aprovarExterno(id_pedido, idLink, idUsuario) {
        return await fetch(`${API_URL}/pedidos/aprovar-fluxo-externo/` + id_pedido + '/' + idLink + '/' + idUsuario, {
            method: 'GET',
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

    async reprovarExterno(id_pedido, idUsuario, mensagem) {
        return await fetch(`${API_URL}/pedidos/reprovar-fluxo-externo/` + id_pedido + '/' + idUsuario + '/' + mensagem, {
            method: 'GET',
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

    async reprovar(id_fluxo, mensagem) {
        return await fetch(`${API_URL}/pedidos/reprovar-fluxo/` + id_fluxo + '/' + localStorage.getItem('usuario_id') + '/' + mensagem, {
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

    async respondeMensagemEmival(novaMensagem, id_pedido) {
        return await fetch(`${API_URL}/gerente/responde-mensagem-emival/` + id_pedido, {
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

    aprovarPedidoGerente(id_fluxo, id_link, urgente, anexo) {
        const formData = new FormData();
        formData.append('idFluxo', id_fluxo ?? null);
        formData.append('idLink', id_link ?? null);
        formData.append('urgente', urgente) ?? 0;
        formData.append('anexo', anexo, 'arquivo.pdf'); // 'arquivo.pdf' é o nome que você deseja dar ao arquivo no servidor

        return fetch(`${API_URL}/gerente/aprovar-pedido-gerente`, {
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

    async buscaTodosPedidosGerente(id_gerente) {
        return await fetch(`${API_URL}/gerente/listar-pedidos/` + id_gerente, {
            method: 'GET',
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
}
