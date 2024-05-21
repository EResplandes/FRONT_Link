import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import rialmaImg from '../../../../public/assets/img/rialma.png'; // Importa a imagem diretamente

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
    doc.text(`Data de Emissão: ${dataHoraFormatada}`, 150, 10);

    doc.setFontSize(6);
    doc.text('Pedido de Compra autorizado pelo LinkWeb', 107, 120, null, null, 'center');
    doc.line(150, 123, 60, 123); // Linha abaixo para Assinatura
    doc.setFontSize(12);
    doc.text('PRESIDENTE', 107, 130, null, null, 'center');

    // Define o título da tabela
    const headers = [['Registro', 'Local', 'Descrição', 'Status', 'Autorização', 'Criação', 'Aprovação']];

    // Formata os dados da tabela
    const tableData = data.pedido.map((pedido) => {
        const dataInclusao = new Date(pedido.dt_inclusao);
        const diaAssinatura = String(dataInclusao.getDate()).padStart(2, '0');
        const mesAssinatura = String(dataInclusao.getMonth() + 1).padStart(2, '0');
        const anoAssinatura = dataInclusao.getFullYear();
        const dataFormatadaInclusao = `${diaAssinatura}/${mesAssinatura}/${anoAssinatura}`;

        const dataCriacao = new Date(pedido.dt_aprovacao);
        const diaCriacao = String(dataCriacao.getDate()).padStart(2, '0');
        const mesCriacao = String(dataCriacao.getMonth() + 1).padStart(2, '0');
        const anoCriacao = dataCriacao.getFullYear();
        const dataFormatadaAprovacao = `${diaCriacao}/${mesCriacao}/${anoCriacao}`;

        return ['Pedido', pedido.local, pedido.descricao, pedido.status, pedido.link, dataFormatadaInclusao, dataFormatadaAprovacao];
    });

    // Adiciona a tabela ao documento PDF
    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 50, // Posição Y inicial da tabela
        theme: 'grid', // Estilo da tabela
        headStyles: { fillColor: [2, 79, 147], halign: 'center' }, // Cor de fundo e alinhamento centralizado do cabeçalho da tabela
        alternateRowStyles: { fillColor: [255, 255, 255] }, // Cor de fundo das linhas alternadas da tabela
        columnStyles: {
            0: { columnWidth: 20 }, // Registro
            1: { columnWidth: 20 }, // Local
            2: { columnWidth: 40 }, // Descrição
            3: { columnWidth: 30 }, // Status
            4: { columnWidth: 20 }, // Autorização
            5: { columnWidth: 25 }, // Dt. Criação
            6: { columnWidth: 25 } // Dt. Aprovação
        },
        bodyStyles: { halign: 'center' } // Alinhamento centralizado das células da tabela
    });

    // // Adiciona Assinatura
    // doc.line(90, 143, 400, 143); // Linha abaixo de "Nº Contrato"
    // doc.text(`PEDIDO ASSINADO PELO LINK WEB POR`, 130, 50);

    // Salva o documento PDF com o nome 'aprovacao.pdf'
    doc.save('aprovacao.pdf');
}
