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
            displayConfirmation: ref(false),
            pedidoService: new PedidoService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            chatService: new ChatService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            loading1: ref(null),
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
            filters: {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                protheus: { value: null, matchMode: FilterMatchMode.CONTAINS },
                criador: { value: null, matchMode: FilterMatchMode.CONTAINS },
                descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
                'local.local': { value: null, matchMode: FilterMatchMode.CONTAINS },
                dt_inclusao_formatada: { value: null, matchMode: FilterMatchMode.CONTAINS },
                'empresa.nome_empresa': { value: null, matchMode: FilterMatchMode.CONTAINS },
                'status.status': { value: null, matchMode: FilterMatchMode.CONTAINS },
                valor_formatado: { value: null, matchMode: FilterMatchMode.CONTAINS }
            },
            loading: true
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos
        this.pedidoService.buscaTodosPedidos().then((data) => {
            this.pedidos = data.pedidos.map((pedido) => ({
                ...pedido,
                dt_inclusao_formatada: this.formatarData(pedido.dt_inclusao),
                valor_formatado: pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            }));
            this.preloading = false;
            this.loading = false;
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas.map((empresa) => empresa.nome_empresa);
            }
        });

        // Metódo responsável por buscar todos status
        this.statusService.buscaStatus().then((data) => {
            if (data.resposta == 'Status listados com sucesso!') {
                this.status = data.itens.map((status) => status.status);
            }
        });
    },

    methods: {
        imprimirAutorizacao(data) {
            try {
                generatePDF(data);
                this.preloading = false;
            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
            } finally {
                this.loading = false;
            }
        },

        buscaInformacoesPedido(id) {
            this.preloading = true;
            this.pedidoService.buscaInformacoesPedido(id).then((data) => {
                this.imprimirAutorizacao(data);
            });
        },

        // Metódo responsável por buscar todos pedidos
        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.buscaTodosPedidos(localStorage.getItem('local_id')).then((data) => {
                this.pedidos = data.pedidos.map((pedido) => ({
                    ...pedido,
                    dt_inclusao_formatada: this.formatarData(pedido.dt_inclusao),
                    valor_formatado: pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                }));
                this.preloading = false;
                this.loading = false;
            });
        },

        // Metódo responsável por buscar todos pedidos de acordo com filtro
        filtrar() {
            this.preloading = true;
            this.pedidoService.buscaPedidosGestorFiltro(this.form).then((data) => {
                this.pedidos = data.pedidos.map((pedido) => ({
                    ...pedido,
                    dt_inclusao_formatada: this.formatarData(pedido.dt_inclusao),
                    valor_formatado: pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                }));

                this.form = {};
                this.preloading = false;
                this.showInfo('Filtro aplicado com sucesso!');
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
            this.pdf = data.anexo;
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

        showSuccess(mensagem) {
            this.toast.add({ severity: 'success', summary: 'Sucesso!', detail: mensagem, life: 3000 });
        },

        showInfo(mensagem) {
            this.toast.add({ severity: 'info', summary: 'Aviso!', detail: mensagem, life: 3000 });
        },

        showError(mensagem) {
            this.toast.add({ severity: 'error', summary: 'Ocorreu um erro!', detail: mensagem, life: 3000 });
        },

        // Metódo responsável por buscar pedidos com filtros
        buscaFiltros() {
            this.preloading = true;
            this.pedidoService.filtroPedidos(this.form).then((data) => {
                if (data.resposta == 'Pedidos para o Dr. Emival Caiado!') {
                    this.pedidos = data.pedidos;
                    this.form = {};
                    this.showInfo('Filtros aplicados com sucesso!');
                    this.preloading = false;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        // Metódo responsável por limpagem de filtros
        limparFiltro() {
            this.buscaPedidos();
            this.showInfo('Filtro removidos com sucesso!');
            this.form = {};
        },

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
            <div class="header-padrao">FILTROS</div>
            <br />

            <div class="p-fluid formgrid grid justify-content-center">
                <div class="field col-2 md:col-2">
                    <label for="firstname2">Dt de Início</label>
                    <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data'" v-model="form.dt_inicio" showIcon iconDisplay="input" />
                </div>
                <div class="field col-2 md:col-2">
                    <label for="firstname2">Dt Fim</label>
                    <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data'" v-model="form.dt_fim" showIcon iconDisplay="input" />
                </div>
                <div class="field col-2 md:col-2">
                    <label for="firstname2">Nº Pedido</label>
                    <InputNumber v-tooltip.top="'Digite o número do pedido'" v-model="form.numero_pedido" showIcon iconDisplay="input" />
                </div>
                <div class="field col-2 md:col-2">
                    <label style="color: white" for="firstname2">.</label><br />
                    <Button label="Pesquisar" @click.prevent="filtrar()" icon="pi pi-search" class="p-button-info" />
                </div>
                <div class="field col-2 md:col-2">
                    <label style="color: white" for="firstname2">.</label><br />
                    <Button label="Limpar Filtros" @click.prevent="buscaPedidos()" icon="pi pi-search" class="p-button-danger" />
                </div>
            </div>
            <Divider></Divider>
            <div style="margin-top: 10px" class="header-padrao">LISTAGEM DE TODOS PEDIDOS <br /><span style="font-size: 10px">( Limitado a os últimos 500 pedidos )</span></div>
            <br />

            <div class="card">
                <DataTable
                    v-model:filters="filters"
                    :value="pedidos"
                    paginator
                    :rows="10"
                    dataKey="id"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    filterDisplay="row"
                    :loading="loading"
                    :globalFilterFields="['descricao', 'empresa.nome_empresa', 'country.name', 'representative.name', 'status.status']"
                >
                    <template #empty> Nenhum Pedido Encontrado. </template>
                    <template #loading> Loading customers data. Please wait. </template>
                    <Column field="dt_inclusao_formatada" header="Dt. Inclusão" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.dt_inclusao_formatada }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pela Dt. de Inclusão" />
                        </template>
                    </Column>
                    <Column field="protheus" header="Nº Protheus" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.protheus }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pela Dt. de Inclusão" />
                        </template>
                    </Column>
                    <Column field="valor_formatado" header="Valor" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.valor_formatado }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pelo Valor" />
                        </template>
                    </Column>
                    <Column field="descricao" header="Fornecedor" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.descricao }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pela Descrição" />
                        </template>
                    </Column>

                    <Column field="empresa.nome_empresa" header="Empresa" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.empresa.nome_empresa }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="empresas" placeholder="Selecione uma Empresa" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                                <template #option="slotProps">
                                    {{ slotProps.option }}
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <Column field="status.status" header="Status" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 16rem">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <Tag :value="getStatus(data)" :severity="getSeverity(data.status.status)" />
                            </div>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="status" placeholder="Selecione um Status" class="p-column-filter" style="min-width: 16rem" :showClear="true">
                                <template #option="slotProps">
                                    {{ slotProps.option }}
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <Column field="criador" header="Criador" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ data.criador }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar" />
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="flex gap-2">
                                <!-- Usando Flexbox para alinhar os botões lado a lado -->
                                <!-- Botão de Visualizar -->
                                <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />

                                <!-- Botão de Chat -->
                                <Button @click.prevent="chat(slotProps.data.id, slotProps.data)" icon="pi pi-comments" class="p-button-secon" />

                                <!-- Botão de Imprimir (exibido condicionalmente) -->
                                <Button
                                    v-if="
                                        ['Aprovado', 'Aprovado com Ressalva', 'Resposta do Pedido de Compra Aprovado com Ressalva', 'Retorno do Pedido de Compra Aprovado com Ressalva', 'Enviado para Financeiro', 'Enviado para Fiscal'].includes(
                                            slotProps.data.status.status
                                        )
                                    "
                                    @click.prevent="buscaInformacoesPedido(slotProps.data.id)"
                                    icon="pi pi-print"
                                    class="p-button-secondary"
                                />
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
