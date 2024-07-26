<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import ChatService from '../../../service/ChatService';
import NotasService from '../../../service/NotaService';
import { FilterMatchMode } from 'primevue/api';

export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            chatService: new ChatService(),
            notasService: new NotasService(),
            confirm: new useConfirm(),
            idPedido: ref(null),
            empresas: ref([]),
            empresa: ref([]),
            pedidos: ref(null),
            displayData: ref(null),
            status: ref(null),
            form: ref({}),
            preloading: ref(true),
            displayChat: ref(false),
            display: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            newMessage: ref(null),
            pdfsrc: ref(null),
            pdfsrcnota: ref(null),
            conversa: ref(null),
            customers: null,
            filters: {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                protheus: { value: null, matchMode: FilterMatchMode.CONTAINS },
                descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
                dt_inclusao_formatada: { value: null, matchMode: FilterMatchMode.CONTAINS },
                empresa: { value: null, matchMode: FilterMatchMode.CONTAINS },
                valor_formatado: { value: null, matchMode: FilterMatchMode.CONTAINS }
            },
            loading: true
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos
        this.notasService.pedidosEscriturar().then((data) => {
            this.pedidos = data.pedidos;
            this.preloading = false;
            this.loading = false;
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas.map((empresa) => empresa.nome_empresa);
            }
        });
    },

    methods: {
        // Metódo responsável por bucsar todos pedidos
        buscaPedidos() {
            this.notasService.pedidosEscriturar().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
                this.loading = false;
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

        // Metódo responsável por dar baixa na nota
        darBaixa() {
            this.preloading = true;
            this.notasService.darBaixa(this.idPedido, this.form).then((data) => {
                if (data.resposta == 'Nota escriturada e enviada para o Financeiro com sucesso!') {
                    this.buscaPedidos();
                    this.showSuccess('Nota escriturada e enviada para o Financeiro com sucesso!');
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o Administrador');
                }
                this.display = false;
                this.displayData = false;
            });
        },

        // Metódo responsável por visualizar pdf
        visualizar(id, data) {
            this.idPedido = id;
            this.display = true;
            this.pdf = data.pedido.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.pdfsrcnota = `${this.urlBase}/${data.nota}`;
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

                case 'Enviado para Fiscal':
                    return 'warning';

                case 'renewal':
                    return null;
            }
        },

        chat(id) {
            this.displayChat = true;
            this.chatService.buscaConversa(id).then((data) => {
                if (data.resposta == 'Chat listado com sucesso!') {
                    this.conversa = data.conversa;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        abrirChat() {
            this.chat(this.idPedido);
            this.displayChat = true;
        },

        enviarMensagem() {
            this.preloading = true;
            this.notasService.reprovarNota(this.idPedido, this.newMessage).then((data) => {
                if (data.resposta == 'Nota reprovada com sucesso') {
                    this.displayChat = false;
                    this.display = false;
                    this.buscaPedidos();
                    this.showSuccess('Nota reprovada com sucesso');
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
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
                    <InputText class="col-12" type="text" v-model="newMessage" placeholder="Digite a mensagem..." />
                    <Button @click.prevent="enviarMensagem()" label="Enviar" class="mr-2 mt-3 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <!-- Visualizar Pedido de Compra -->
        <Dialog header="Pedido de Compra" v-model:visible="display" :modal="true" :style="{ width: '90%' }">
            <div class="grid">
                <div class="col-6">
                    <Button @click.prevent="abrirChat()" style="width: 100%" label="Reprovar e Enviar para Comprador" icon="pi pi-times" class="p-button-danger" />
                </div>
                <div class="col-6">
                    <Button @click.prevent="this.displayData = true" style="width: 100%" label="Escriturar e Enviar para Financeiro" icon="pi pi-check" class="p-button-success" />
                </div>
            </div>

            <Splitter>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrc" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrcnota" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
            </Splitter>
        </Dialog>

        <Dialog header="FORMULÁRIO" v-model:visible="displayData" :modal="true" :style="{ width: '30%' }">
            <div class="p-fluid formgrid grid">
                <div class="field col-4 md:col-4">
                    <label for="firstname2">Valor <span class="obrigatorio">*</span></label>
                    <InputNumber v-tooltip.top="'Digite o valor da nota fiscal'" v-model="form.valor" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="R$..." />
                </div>
                <div class="field col-4 md:col-4">
                    <label for="firstname2">Nº da Nota <span class="obrigatorio">* </span></label>
                    <InputText type="number" v-tooltip.top="'Digite o numero da nota fiscal'" v-model="form.nota_fiscal" />
                </div>
                <div class="field col-4 md:col-4">
                    <label for="firstname2">Dt. Emissão Nota <span class="obrigatorio">* </span></label>
                    <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data de emissão da nota fiscal'" v-model="form.dt_emissao" showIcon iconDisplay="input" />
                </div>
                <div class="col-12">
                    <Button @click.prevent="darBaixa()" style="width: 100%" label="Escriturar e Enviar para Financeiro" icon="pi pi-check" class="p-button-success" />
                </div>
            </div>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div class="card">
                <DataTable
                    v-model:filters="filters"
                    :value="pedidos"
                    paginator
                    :rows="10"
                    dataKey="id"
                    filterDisplay="row"
                    :loading="loading"
                    :globalFilterFields="['descricao', 'empresa.nome_empresa', 'country.name', 'representative.name', 'status']"
                >
                    <template #empty> Nenhum Pedido Encontrado. </template>
                    <template #loading> Loading customers data. Please wait. </template>

                    <Column field="dt_inclusao_formatada" header="Dt. Inclusão" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ this.formatarData(data.dt_inclusao_nota) }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pela Dt. de Inclusão" />
                        </template>
                    </Column>

                    <Column field="protheus" header="Nº Protheus" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.pedido.protheus }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pela Dt. de Inclusão" />
                        </template>
                    </Column>

                    <Column field="valor_formatado" header="Valor" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pelo Valor" />
                        </template>
                    </Column>

                    <Column field="descricao" header="Fornecedor" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.pedido.descricao }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pela Descrição" />
                        </template>
                    </Column>

                    <Column field="empresa" header="Empresa" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.pedido.empresa }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="empresas" placeholder="Selecione uma Empresa" class="p-column-filter" style="min-width: 12rem" :showClear="true">
                                <template #option="slotProps">
                                    {{ slotProps.option }}
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-3 md:col-3 mr-1">
                                    <Button @click.prevent="visualizar(slotProps.data.pedido.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
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
