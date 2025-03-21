<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import ChatService from '../../../service/ChatService';
import { PDFDocument, rgb } from 'pdf-lib';

export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            chatService: new ChatService(),
            confirm: new useConfirm(),
            pedidos: ref(null),
            idPedido: ref(null),
            status: ref(null),
            urgente: ref(0),
            conversa: ref(null),
            displayChat: ref(false),
            pedidoSelecionado: ref(null),
            pdfData: null,
            preloading: ref(true),
            display: ref(false),
            novaMensagem: ref(null),
            urlBase: 'https://api-link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos pedidos com Giovana
        this.pedidoService.pedidosGiovana().then((data) => {
            this.pedidos = data.pedidos;
            this.preloading = false;
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos do usuário logado
        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.pedidosGiovana().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        async aprovarPedido(idDestino) {
            // const pdfUrl = `http://127.0.0.1:8000/api/pdf/${this.pedidoSelecionado.id}`;
            this.pedidoService.aprovarGiovana(this.pedidoSelecionado.id, idDestino).then((data) => {
                if (data.resposta == 'Pedido aprovado com sucesso!') {
                    this.showSuccess(data.resposta);
                    this.buscaPedidos();
                    this.display = false;
                }
            });
        },

        async editPdf(idDestino) {
            try {
                // Carregar o PDF
                const pdfDoc = await PDFDocument.load(this.pdfData);
                const pages = pdfDoc.getPages();

                // Obter a primeira página
                const firstPage = pages[0];

                // Calcular a altura da página
                const { width, height } = firstPage.getSize();

                // Adicionar texto na altura desejada
                const nome = localStorage.getItem('nome') || 'Nome não encontrado';
                firstPage.drawText(`@${nome}`, {
                    x: 300, // Posição horizontal
                    y: height - 670, // Posição vertical a 50 unidades do topo
                    size: 10,
                    color: rgb(0, 0, 0)
                });

                // Salvar o PDF editado
                const pdfBytes = await pdfDoc.save();

                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                this.pedidoService.aprovarGiovanaPdf(this.pedidoSelecionado.id, idDestino, blob).then((data) => {
                    if (data.resposta == 'Pedido aprovado com sucesso!') {
                        this.showSuccess(data.resposta);
                        this.buscaPedidos();
                        this.display = false;
                    }
                });
            } catch (error) {
                console.error('Erro ao editar o PDF:', error);
                alert('Erro ao editar o PDF. Confira o console para mais detalhes.');
            }
        },

        // Metódo responsável por reprovar fluxo
        reprovarPedido() {
            this.pedidoService.reprovarGiovana(this.idPedido, this.novaMensagem).then((data) => {
                if (data.resposta == 'Pedido aprovado com sucesso!') {
                    this.showSuccess('Pedido aprovado com sucesso!');
                    this.buscaPedidos();
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }

                this.display = false;
                this.displayChat = false;
                this.preloading = false;
            });
        },

        // Metódo responsável por reprovar fluxo
        chat(id) {
            this.displayChat = true;
            this.chatService.buscaConversa(this.idPedido).then((data) => {
                if (data.resposta == 'Chat listado com sucesso!') {
                    this.conversa = data.conversa;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        // Metódo responsável por formatar data padrão br
        formatarData(data) {
            const dataFormatada = new Date(data);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC'
            };

            return new Intl.DateTimeFormat('pt-BR', options).format(dataFormatada);
        },

        // Metódo responsável por visualizar pdf
        visualizar(data) {
            this.display = true;
            this.pedidoSelecionado = data;
            this.idPedido = data.id;
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
        },

        showSuccess(mensagem) {
            this.toast.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: mensagem,
                life: 3000
            });
        },

        showError(mensagem) {
            this.toast.add({
                severity: 'error',
                summary: 'Ocorreu um erro!',
                detail: mensagem,
                life: 3000
            });
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>
    <div class="grid">
        <Toast />

        <!-- Visualizar -->
        <Dialog v-model:visible="display" maximizable modal header="Documento" :style="{ width: '80%' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex justify-content-center">
                <!-- <div class="flex-1 m-1">
                    <Button @click.prevent="aprovarPedido(1)" icon="pi pi-check" label="Aprovar e Enviar Dr. Emival" class="p-button-success" style="width: 100%" />
                </div> -->
                <div class="flex-1 m-1">
                    <Button @click.prevent="aprovarPedido(2)" icon="pi pi-check" label="Aprovar e Enviar Financeiro" class="p-button-info" style="width: 100%" />
                </div>
                <div class="flex-1 m-1">
                    <Button @click.prevent="chat()" icon="pi pi-times" label="Reprovar" class="p-button-danger" style="width: 100%" />
                </div>
            </div>
            <br />
            <div class="col-12 md:col-12">
                <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
            </div>
        </Dialog>

        <!-- Chat -->
        <Dialog header="Chat" v-model:visible="displayChat" :style="{ width: '40%' }" :modal="true">
            <div class="grid">
                <div class="col-12">
                    <div class="card timeline-container">
                        <Timeline :value="conversa" align="alternate" class="customized-timeline">
                            <template #marker="slotProps">
                                <span class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" :style="{ backgroundColor: slotProps.item.color }">
                                    <i :class="slotProps.item.icon"></i>
                                </span>
                            </template>
                            <template #content="slotProps">
                                <Card>
                                    <template #title>
                                        {{ slotProps.item.id_usuario.name }}
                                    </template>
                                    <template #subtitle>
                                        {{ this.formatarData(slotProps.item.data_mensagem) }}
                                    </template>
                                    <template #content>
                                        <h6>
                                            {{ slotProps.item.mensagem }}
                                        </h6>
                                    </template>
                                </Card>
                            </template>
                        </Timeline>
                    </div>
                    <hr />
                    <InputText class="col-12" type="text" v-model="this.novaMensagem" placeholder="Digite a mensagem..." />
                    <Button @click.prevent="reprovarPedido()" label="Reprovar e enviar mensagem" class="mr-2 mt-3 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div class="card">
                <DataTable
                    dataKey="id"
                    :value="pedidos"
                    :paginator="true"
                    :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    responsiveLayout="scroll"
                    filterDisplay="menu"
                    stripedRows
                >
                    <template #header>
                        <div class="flex justify-content-between">
                            <h5 for="empresa">Pedidos com Dr. Giovana</h5>
                        </div>
                    </template>
                    <template #empty> Nenhum pedido encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="" header="" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            <Tag v-if="slotProps.data.urgente == 1" class="mr-2" severity="danger" value="Urgente"> </Tag>
                            <Tag v-else class="mr-2" severity="info" value="Normal"></Tag>
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Nº Protheus" header="Nº Protheus" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Nº Protheus</span>
                            {{ slotProps.data.protheus }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa?.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Fornecedor" :sortable="true" class="w-4">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{
                                slotProps.data.valor.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                })
                            }}
                        </template>
                    </Column>

                    <Column field="Comprador" header="Comprador" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.criador }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-3">
                                    <Button @click.prevent="visualizar(slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                </div>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
::v-deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

::v-deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}

.titleForm {
    text-align: center;
}

.modalRigth {
    width: 500px;
}

.obrigatorio {
    color: red;
}

.txt-small {
    font-size: small;
    font-style: italic;
}

.full-screen-spinner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
}

.timeline-container {
    max-height: 300px;
    /* Defina a altura máxima desejada */
    overflow-y: auto;
    /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}
</style>
