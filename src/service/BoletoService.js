import API_URL from './config.js';

const token = localStorage.getItem('token');

const headers = {
    Authorization: 'Bearer ' + token
};

export default class BoletoService {
    async cadastrarBoleto(form, id_pedido) {
        const formData = new FormData();
        formData.append('boleto', form?.pdfBoleto ?? null);

        return await fetch(`${API_URL}/boletos/cadastrar/${id_pedido}`, {
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
