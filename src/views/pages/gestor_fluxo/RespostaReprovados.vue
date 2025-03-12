<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import ChatService from '../../../service/ChatService';
import { generatePDF } from '../comprador/aprovacao';
import { FilterMatchMode } from 'primevue/api';

export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            chatService: new ChatService(),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            empresas: ref([]),
            pedidos: ref(null),
            status: ref(null),
            form: ref({}),
            editar: ref(false),
            preloading: ref(true),
            displayChat: ref(false),
            display: ref(false),
            urlBase: 'https://api-link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            conversa: ref(null),
            customers: null,
            loading: true
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos
        this.pedidoService.buscarRespostaPedidosReprovados(localStorage.getItem('local_id')).then((data) => {
            this.pedidos = data.pedidos;
            this.preloading = false;
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos
        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.buscarRespostaPedidosReprovados(localStorage.getItem('local_id')).then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
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
        visualizar(id, data) {
            this.display = true;
            this.pdf = data.pedido.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
        },

        chat(id, data) {
            this.chatService.buscaConversa(id).then((data) => {
                if (data.resposta == 'Chat listado com sucesso!') {
                    this.conversa = data.conversa;
                    this.displayChat = true;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        // Metódo responsável por buscar pedidos com filtros

        getStatus(dados) {
            function getnomes(dados) {
                let nomes = '';
                let qt = 0;
                dados.forEach((element) => {
                    if (qt > 0) {
                        nomes += `-` + ' ';
                    }

                    nomes += `${element.nome_usuario} ${element.funcao}` + ' ';

                    qt++;
                });
                return nomes.trim();
            }

            switch (dados.status.status) {
                case 'Analisando':
                    return `${dados.status.status} - SOLENI `;

                case 'Em Fluxo':
                    return `${dados.status.status} - ${getnomes(dados.pendentes)} `;

                default:
                    return dados.status.status;
            }
        },

        getSeverity(status) {
            switch (status) {
                case 'Reprovado':
                    return 'danger';

                case 'Excluído':
                    return 'danger';

                case 'Enviado para Emival':
                    return 'info';

                case 'Aprovado':
                    return 'success';

                case 'Aprovado com Ressalva':
                    return 'success';

                case 'Enviado para Emival':
                    return 'info';

                case 'negotiation':
                    return 'warning';

                case 'renewal':
                    return null;
            }
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
        <Dialog header="Documento" v-model:visible="display" :style="{ width: '80%' }" :modal="true">
            <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>

        <!-- Chat -->
        <Dialog header="Chat" v-model:visible="displayChat" :style="{ width: '40%' }" :modal="true">
            <div class="grid">
                <div class="col-12">
                    <div class="card timeline-container" ref="msgContainer">
                        <div v-if="conversa.length === 0" class="alert alert-warning mt-5"><h5>Não há mensagens disponíveis.</h5></div>
                        <div v-else>
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
                                            {{ slotProps.item.data_mensagem }}
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
                    </div>
                    <hr />
                </div>
            </div>
        </Dialog>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div style="margin-top: 10px" class="header-padrao">RESPOSTA DE PEDIDOS REPROVADOS</div>
            <br />

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
                    <template #empty> Nenhum pedido encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="" header="" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            <Tag v-if="slotProps.data.pedido.urgente == 1" class="mr-2" severity="danger" value="Urgente"></Tag>
                            <Tag v-else class="mr-2" severity="info" value="Normal"></Tag>
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ this.formatarData(slotProps.data.pedido.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Protheus" header="Protheus" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Protheus</span>
                            {{ slotProps.data.pedido.protheus }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.pedido.empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Fornecedor" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.pedido.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template> </Column
                    >, ,
                    <Column field="Valor" header="Valor" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.pedido.status }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div>
                                <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info mr-2" />

                                <Button @click.prevent="chat(slotProps.data.pedido.id, slotProps.data)" icon="pi pi-comments" class="p-button-secon" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-12 lg:col-6">
            <Toast />
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

.header-padrao {
    background-color: #3b82f6;
    color: white;
    font-weight: 600;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    text-align: center;
}
</style>
