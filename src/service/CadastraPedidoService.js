import API_URL from './config.js';

const token = localStorage.getItem('token');

const headers = {
    // Accept: 'multipart/form-data',
    // 'Content-Type': 'multipart/form-data',
    Authorization: 'Bearer ' + token
};

export default class CadastraPedidoService {
    semFluxo(form) {
        let idCriador = localStorage.getItem('usuario_id');

        const formData = new FormData();
        formData.append('descricao', form?.descricao ?? null);
        formData.append('valor', form?.valor ?? null);
        formData.append('urgente', form?.urgente) ?? null;
        formData.append('dt_vencimento', this.formatarDataParaYMD(form?.dt_vencimento));
        formData.append('anexo', form?.pdf ?? null);
        formData.append('id_link', form?.link?.id ?? null);
        formData.append('id_empresa', form?.empresa?.id ?? null);
        formData.append('id_local', form?.local?.id ?? null);
        formData.append('id_criador', idCriador);

        return fetch(`${API_URL}/pedidos/cadastrar-sem-fluxo`, {
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

    comFluxo(form) {
        const formData = new FormData();
        formData.append('descricao', form?.descricao ?? null);
        formData.append('valor', form?.valor ?? null);
        formData.append('urgente', form?.urgente) ?? null;
        formData.append('dt_vencimento', this.formatarDataParaYMD(form?.dt_vencimento));
        formData.append('anexo', form?.pdf ?? null);
        formData.append('id_link', form?.link?.id ?? null);
        formData.append('id_empresa', form?.empresa?.id ?? null);
        formData.append('id_local', form?.local?.id ?? null);
        formData.append('id_criador', localStorage.getItem('usuario_id'));
        // Crie um array de objetos com a chave "id_usuario"
        const usuarios = form.fluxo.map((item) => ({ id_usuario: item.id }));

        // Adicione o array de objetos ao FormData
        formData.append('fluxo', JSON.stringify(usuarios));

        console.log(formData);

        return fetch(`${API_URL}/pedidos/cadastrar`, {
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
