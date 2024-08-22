import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import rialmaImg from '../../../../../public/assets/img/rialma.png'; // Importa a imagem diretamente

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
    doc.text('RELATÓRIO DE PEDIDOS REPROVADOS', 105, 30, null, null, 'center');

    // Adiciona o cabeçalho com o nome e imagem da empresa do diretório público
    doc.addImage(rialmaImg, 'PNG', 5, 5, 30, 10); // Adiciona a imagem

    // Data de Emissão
    doc.setFontSize(8);
    doc.text(`Dt. de Emissão`, 175, 10);
    doc.text(`${dataHoraFormatada}`, 170, 15);

    doc.setFontSize(6);
    doc.setTextColor(255, 0, 0);
    doc.text('Pedidos de Compra reprovados pelo LinkWeb', 107, 120, null, null, 'center');
    doc.line(150, 123, 60, 123); // Linha abaixo para Assinatura
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('PRESIDENTE', 107, 130, null, null, 'center');

    // Define o título da tabela
    const headers = [['', 'Local', 'Fornecedor', 'Valor', 'Status', 'Motivo', 'Presidente', 'Reprovação']];

    const tableData = data.map((pedido, index) => {
        const local = pedido.local;
        const descricao = pedido.descricao;
        const valor = pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const status = pedido.status;
        const motivo = pedido.mensagem.mensagem;
        const presidente = pedido.presidente;
        const dt_vencimento = pedido.dt_vencimento;
        const dt_reprovacao = pedido.dt_reprovacao;

        return [index + 1, local, descricao, valor, status, motivo, `${presidente} @`, dt_reprovacao];
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
            2: { halign: 'center', columnWidth: 35 },
            3: { halign: 'center', columnWidth: 30 },
            4: { halign: 'center', columnWidth: 20 },
            5: { halign: 'center', columnWidth: 20 },
            6: { halign: 'center', columnWidth: 25 },
            7: { halign: 'center', columnWidth: 30 },
        },
        bodyStyles: { halign: 'center', fontSize: 7 }
    });

    doc.save('aprovacao.pdf');
}
