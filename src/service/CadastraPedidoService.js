import API_URL from './config.js';

const token = localStorage.getItem('token');

const headers = {
    // Accept: 'multipart/form-data',
    // 'Content-Type': 'multipart/form-data',
    Authorization: 'Bearer ' + token
};

export default class CadastraPedidoService {
    semFluxo(form) {
        const formData = new FormData();
        formData.append('descricao', form.descricao);
        formData.append('valor', form.valor);
        formData.append('urgente', form.urgente);
        formData.append('anexo', form.pdf);
        formData.append('id_link', form.link?.id);
        formData.append('id_empresa', form.empresa?.id);

        console.log(formData);

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
        console.log(form.fluxo);
        const formData = new FormData();
        formData.append('descricao', form.descricao);
        formData.append('valor', form.valor);
        formData.append('urgente', form.urgente);
        formData.append('anexo', form.pdf);
        formData.append('id_link', form.link?.id);
        formData.append('id_empresa', form.empresa?.id);
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
}
