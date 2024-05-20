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
    doc.text('GRUPO RIALMA S.A', 103, 20, null, null, 'center');

    // Adiciona a descrição abaixo do título principal
    doc.setFontSize(12);
    doc.text('AUTORIZAÇÃO PEDIDO DE COMPRA', 103, 30, null, null, 'center');

    // Adiciona o cabeçalho com o nome e imagem da empresa do diretório público
    doc.addImage(rialmaImg, 'PNG', 15, 5, 30, 20); // Adiciona a imagem

    // Data de Emissão
    doc.setFontSize(8);
    doc.text(`Data de Emissão: ${dataHoraFormatada}`, 145, 10);

    // Define o título da tabela
    const headers = [['NOME', 'EMAIL', 'DT. ASSINATURA', 'DT. INCLUSÃO']];

    // Formata os dados da tabela
    const tableData = data.pedido.map((pedido) => {
        const dataAssinatura = new Date(pedido.data_assinatura);
        const diaAssinatura = String(dataAssinatura.getDate()).padStart(2, '0');
        const mesAssinatura = String(dataAssinatura.getMonth() + 1).padStart(2, '0');
        const anoAssinatura = dataAssinatura.getFullYear();
        const dataFormatadaAssinatura = `${diaAssinatura}/${mesAssinatura}/${anoAssinatura}`;

        const dataCriacao = new Date(pedido.data_criacao);
        const diaCriacao = String(dataCriacao.getDate()).padStart(2, '0');
        const mesCriacao = String(dataCriacao.getMonth() + 1).padStart(2, '0');
        const anoCriacao = dataCriacao.getFullYear();
        const dataFormatadaCriacao = `${diaCriacao}/${mesCriacao}/${anoCriacao}`;

        return ['Pedido', pedido.descricao, pedido.status.status, dataFormatadaAssinatura, dataFormatadaCriacao, informacoes.usuario.status];
    });

    // Adiciona a tabela ao documento PDF
    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 100, // Posição Y inicial da tabela
        theme: 'grid', // Estilo da tabela
        headStyles: { fillColor: [2, 79, 147] }, // Cor de fundo do cabeçalho da tabela
        alternateRowStyles: { fillColor: [255, 255, 255] }, // Cor de fundo das linhas alternadas da tabela
        columnStyles: {
            0: { columnWidth: 40 }, // Registro
            1: { columnWidth: 60 }, // Descricao
            2: { columnWidth: 30 }, // Status
            3: { columnWidth: 30 } // Data Inclusão
        }
    });

    // // Adiciona Assinatura
    // doc.line(90, 143, 400, 143); // Linha abaixo de "Nº Contrato"
    // doc.text(`PEDIDO ASSINADO PELO LINK WEB POR`, 130, 50);

    // Salva o documento PDF com o nome 'aprovacao.pdf'
    doc.save('aprovacao.pdf');
}
