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
            displayChatRessalva: ref(false),
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
        this.pedidoService.listarTodosPedidosEmivalTemp().then((data) => {
            this.pedidos = data.pedidos;
            this.preloading = false;
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos do usuário logado
        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.listarTodosPedidosEmivalTemp().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por reprovar fluxo
        reprovarPedidoEmivalTemp() {
            this.pedidoService.reprovarPedidoEmivalTemp(this.idPedido, this.novaMensagem).then((data) => {
                this.showSuccess('Pedido reprovado com sucesso!');
                this.buscaPedidos();
                this.display = false;
                this.displayChat = false;
                this.preloading = false;
                this.novaMensagem = '';
            });
        },

        ressalvaPedidoEmivalTemp() {
            this.pedidoService.ressalvaPedidoEmivalTemp(this.idPedido, this.novaMensagem).then((data) => {
                this.showSuccess('Pedido aprovado com ressalva com sucesso!');
                this.buscaPedidos();
                this.displayChatRessalva = false;
                this.display = false;
                this.preloading = false;
                this.novaMensagem = '';
            });
        },

        // Metódo responsável por aprovar pedido
        aprovar() {
            this.pedidoService.aprovarPedidoEmivalTemp(this.idPedido).then((data) => {
                this.showSuccess('Pedido aprovado com sucesso!');
                this.buscaPedidos();
                this.display = false;
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

        chatRessalva(id) {
            this.displayChatRessalva = true;
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
            const dialog = document.querySelector('.p-dialog');
            if (dialog) {
                dialog.classList.add('p-dialog-maximized');
            }
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
        <Dialog v-model:visible="display" :maximized="true" modal header="Documento" :style="{ width: '100%', height: '100vh', margin: '0', padding: '0' }" breakpoints="{ }">
            <div style="width: 100%; height: 80vh; display: flex; flex-direction: column">
                <!-- Área do iframe -->
                <div style="flex: 1; overflow: hidden">
                    <iframe :src="pdfsrc" style="width: 100%; height: 100%; border: none"> Oops! ocorreu um erro. </iframe>
                </div>
                <!-- Área dos botões -->
                <div class="flex justify-content-center" style="display: flex; padding: 10px; background-color: #f9f9f9; gap: 10px">
                    <Button @click.prevent="chat(1)" icon="pi pi-times" label="Reprovar" class="p-button-danger" style="flex: 1" />
                    <Button @click.prevent="chatRessalva(2)" icon="pi pi-check" label="Aprovar c/ Ressalva" class="p-button-info" style="flex: 1" />
                    <Button @click.prevent="aprovar(1)" icon="pi pi-check" label="Aprovar" class="p-button-success" style="flex: 1" />
                </div>
            </div>
        </Dialog>

        <!-- Chat -->
        <Dialog header="Chat" v-model:visible="displayChat" :style="{ width: '60%' }" :modal="true">
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
                    <Button @click.prevent="reprovarPedidoEmivalTemp()" label="Reprovar e enviar mensagem" class="mr-2 mt-3 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <!-- Chat -->
        <Dialog header="Chat" v-model:visible="displayChatRessalva" :style="{ width: '60%' }" :modal="true">
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
                    <Button @click.prevent="ressalvaPedidoEmivalTemp()" label="Aprovar com Ressalva e Enviar Mensagem" class="mr-2 mt-3 p-button-success col-12" />
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
                    max
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
                            <h5 for="empresa">Pedidos com Dr. Emival</h5>
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
