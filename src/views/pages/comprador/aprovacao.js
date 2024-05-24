import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRious from 'qrious';
import rialmaImg from '../../../../public/assets/img/rialma.png'; // Importa a imagem diretamente
import API_URL from '../../../service/config';

// Função para adicionar um zero à esquerda para valores menores que 10
function pad(valor) {
    return valor < 10 ? '0' + valor : valor;
}

// Obtém a data e hora atual
const dataAtual = new Date();
const dia = pad(dataAtual.getDate());
const mes = pad(dataAtual.getMonth() + 1);
const ano = dataAtual.getFullYear();
const horas = pad(dataAtual.getHours());
const minutos = pad(dataAtual.getMinutes());
const segundos = pad(dataAtual.getSeconds());

// Formata a data e hora como uma string
const dataHoraFormatada = `${dia}/${mes}/${ano} às ${horas}:${minutos}:${segundos}`;

export function generatePDF(data) {
    // Verifica o status do pedido
    const statusDoPedido = data.pedido[0].status;
    console.log(data);

    // Cria um novo documento PDF com orientação paisagem (horizontal)
    const doc = new jsPDF();

    // Adiciona o título principal
    doc.setFont('helvetica', 'bold'); // Define a fonte para Helvetica em negrito
    doc.setFontSize(14);
    doc.text('GRUPO RIALMA S.A', 107, 20, null, null, 'center');

    // Adiciona a descrição abaixo do título principal
    doc.setFontSize(12);
    doc.text('AUTORIZAÇÃO PEDIDO DE COMPRA', 105, 30, null, null, 'center');

    // Adiciona o cabeçalho com o nome e imagem da empresa do diretório público
    doc.addImage(rialmaImg, 'PNG', 5, 5, 30, 10); // Adiciona a imagem

    // Data de Emissão
    doc.setFontSize(8);
    doc.text(`Dt. de Emissão`, 175, 10);
    doc.text(`${dataHoraFormatada}`, 170, 15);

    // Gerar QR Code com o link do pedido
    const qr = new QRious({
        value: `https://link.gruporialma.com.br/site/#/landing/${data.pedido[0].id}`, // Link com o ID do pedido
        size: 50
    });
    const qrDataUrl = qr.toDataURL(); // Obtém a URL da imagem do QR code

    // Adiciona o QR code ao PDF
    doc.addImage(qrDataUrl, 'PNG', 170, 20, 30, 30); // Ajuste a posição e tamanho conforme necessário

    doc.setFontSize(6);
    doc.setTextColor(255, 0, 0);
    doc.text('Pedido de Compra autorizado pelo LinkWeb', 107, 120, null, null, 'center');
    doc.line(150, 123, 60, 123); // Linha abaixo para Assinatura
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('PRESIDENTE', 107, 130, null, null, 'center');

    // Define o título da tabela
    const headers = [['', 'Local', 'Descrição', 'Valor', 'Status', 'Autorização', 'Criação', 'Aprovação']];

    // Formatação dos dados da tabela
    const tableData = data.pedido.map((pedido) => {
        // Formatação da data de inclusão
        const dataInclusao = new Date(pedido.dt_inclusao);
        const diaInclusao = pad(dataInclusao.getDate());
        const mesInclusao = pad(dataInclusao.getMonth() + 1);
        const anoInclusao = dataInclusao.getFullYear();
        const horaInclusao = pad(dataInclusao.getHours());
        const minutoInclusao = pad(dataInclusao.getMinutes());
        const dataFormatadaInclusao = `${diaInclusao}/${mesInclusao}/${anoInclusao} ${horaInclusao}:${minutoInclusao}`;

        // Formatação da data de aprovação
        const dataAprovacao = new Date(pedido.dt_assinatura);
        const diaAprovacao = pad(dataAprovacao.getDate());
        const mesAprovacao = pad(dataAprovacao.getMonth() + 1);
        const anoAprovacao = dataAprovacao.getFullYear();
        const horaAprovacao = pad(dataAprovacao.getHours());
        const minutoAprovacao = pad(dataAprovacao.getMinutes());
        const dataFormatadaAprovacao = `${diaAprovacao}/${mesAprovacao}/${anoAprovacao} ${horaAprovacao}:${minutoAprovacao}`;

        return ['1', pedido.local, pedido.descricao, pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), pedido.status, `${pedido.link} @`, dataFormatadaInclusao, dataFormatadaAprovacao];
    });

    // Adiciona a tabela ao documento PDF
    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 50, // Posição Y inicial da tabela
        theme: 'grid', // Estilo da tabela
        headStyles: {
            fillColor: [240, 240, 240],
            halign: 'center',
            textColor: [0, 0, 0]
        },
        alternateRowStyles: { fillColor: [255, 255, 255] }, // Cor de fundo das linhas alternadas da tabela
        columnStyles: {
            0: { halign: 'center', columnWidth: 5 },
            1: { halign: 'center', columnWidth: 15 },
            2: { halign: 'center', columnWidth: 40 },
            3: { halign: 'center', columnWidth: 30 },
            4: { halign: 'center', columnWidth: 15 },
            5: { halign: 'center', columnWidth: 20 },
            6: { halign: 'center', columnWidth: 25 },
            7: { halign: 'center', columnWidth: 30 }
        },
        bodyStyles: { halign: 'center', fontSize: 8 }
    });

    // Se o status do pedido for "Aprovado com Ressalva", faça a requisição fetch
    if (statusDoPedido === 'Aprovado com Ressalva') {
        fetch(`${API_URL}/chat/listar-conversa/` + data.pedido[0].id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro ao fazer requisição');
                }
                return response.json();
            })
            .then((data) => {
                if (data.resposta && data.conversa && data.conversa.length > 0) {
                    const mensagemResposta = data.resposta;
                    const conversa = data.conversa.map((item) => `${item.id_usuario.name}: ${item.mensagem}`).join('\n');
                    console.log(data);
                    // Adiciona as mensagens ao documento PDF
                    doc.setFontSize(10);

                    doc.line(10, 245, 200, 245); // Define as coordenadas para desenhar a linha horizontal
                    doc.text('Histórico de Conversa / Ressalva:', 10, 260, { align: 'left' }); // Alinha o texto à direita
                    doc.setFontSize(8);
                    doc.text(`${conversa}´`, 10, 265, { align: 'left', maxWidth: 190 }); // Alinha o texto à esquerda e define a largura máxima para ajustar o texto

                    // Salva o PDF após adicionar as mensagens
                    doc.save('aprovacao.pdf');
                }
            })
            .catch((error) => {
                console.error('Erro ao fazer requisição:', error);
                // Em caso de erro na requisição, salva o PDF sem as mensagens
                doc.save('aprovacao.pdf');
            });
    } else {
        // Se o status do pedido não for "Aprovado com Ressalva", salva o PDF sem fazer a requisição
        doc.save('aprovacao.pdf');
    }
}
