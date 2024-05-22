<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import ChatService from '../../../service/ChatService';

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
            empresas: ref(null),
            pedidos: ref(null),
            funcionarios: ref(null),
            id_pedido: ref(null),
            id_usuario: ref(null),
            status: ref(null),
            conversa: ref(null),
            novaMensagem: ref(null),
            form: ref({}),
            editar: ref(false),
            preloading: ref(true),
            display: ref(false),
            displayChat: ref(false),
            displayAnexo: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos reprovados
        this.pedidoService.buscaPedidosRessalva(localStorage.getItem('local_id')).then((data) => {
            this.pedidos = data.pedidos;
            this.preloading = false;
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas;
            }
        });

        // Metódo responsável por buscar todos status
        this.statusService.buscaStatus().then((data) => {
            if (data.resposta == 'Status listados com sucesso!') {
                this.status = data.itens;
            }
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos reprovados
        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.buscaPedidosRessalva(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por buscar chat
        chat(id) {
            this.id_pedido = id;
            this.chatService.buscaConversa(id).then((data) => {
                this.conversa = data.conversa;
                this.displayChat = true;
            });
        },

        // Metódo responsável por enviar mensagem para Dr Emival ou Dr. Monica
        enviarMensagem() {
            this.preloading = true;
            console.log(this.id_pedido);
            this.pedidoService.respondePedidoRessalva(this.novaMensagem, this.id_pedido).then((data) => {
                console.log(data);
                if (data.resposta == 'Pedido respondido com sucesso!') {
                    this.showSuccess('Pedido respondido com sucesso!');
                    this.displayChat = false;
                    this.buscaPedidos();
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o Administrador');
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
        visualizar(id, data) {
            this.display = true;
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
        },

        filtrar() {
            this.visibleRight = true;
            this.editar = false;
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

        // Metódo responsável por limpagem de filtros
        limparFiltro() {
            this.buscaPedidos();
            this.showInfo('Filtro removidos com sucesso!');
            this.form = {};
        }
    }
};
</script>

<template>
    <div style="z-index: 9999" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>
    <div class="grid">
        <Toast />

        <!-- Visualizar -->
        <Dialog header="Documento" v-model:visible="display" :style="{ width: '80%' }" :modal="true">
            <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
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
                    <InputText class="col-12" type="text" v-model="novaMensagem" placeholder="Digite a mensagem..." />
                    <Button @click.prevent="enviarMensagem()" label="Enviar" class="mr-2 mt-3 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <!-- Modal Filtros -->
        <Sidebar style="width: 500px" v-model:visible="visibleRight" :baseZIndex="1000" position="right">
            <h3 v-if="this.editar == false" class="titleForm">Filtros</h3>

            <div class="card p-fluid">
                <div class="field">
                    <label for="empresa">Empresa:</label>
                    <Dropdown v-model="form.empresa" :options="empresas" showClear optionLabel="nome_empresa" placeholder="Selecione..." class="w-full" />
                </div>
                <div class="field">
                    <label for="empresa">Status:</label>
                    <Dropdown v-model="form.status" :options="status" showClear optionLabel="status" placeholder="Selecione..." class="w-full" />
                </div>
                <div class="field">
                    <label for="cpf">Descrição: </label>
                    <InputText v-tooltip.left="'Digite a descrição do pedido'" v-model="form.descricao" id="cnpj" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="cpf">Valor: </label>
                    <InputNumber v-tooltip.left="'Digite o valor do pedido'" v-model="form.valor" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="cpf">Dt. In clusão:</label>
                    <Calendar v-tooltip.left="'Selecione a data de inclusão'" v-model="form.dt_inclusao" showIcon :showOnFocus="false" class="" />
                </div>
                <hr />
                <div class="field">
                    <Button @click.prevent="buscaFiltros()" label="Filtrar" class="mr-2 mb-2 p-button-secondary" />
                    <Button @click.prevent="limparFiltro()" label="Limpar Filtros" class="mr-2 mb-2 p-button-danger" />
                </div>
            </div>
        </Sidebar>

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
                            <h5 for="empresa">Pedidos Aprovados com Ressalva:</h5>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-2">
                                    <Button @click.prevent="filtrar()" icon="pi pi-search" label="Filtrar" class="p-button-secondary" style="margin-right: 0.25em" />
                                </div>
                                <div class="col-6 md:col-4">
                                    <Button @click.prevent="limparFiltro()" icon="pi pi-trash" label="Limpar" class="mr-2 mb-2 p-button-danger" />
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #empty> Nenhum pedido encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="" header="" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            <Tag v-if="slotProps.data.urgente == 1" class="mr-2" severity="danger" value="Urgente"></Tag>
                            <Tag v-else class="mr-2" severity="info" value="Normal"></Tag>
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Presidente" header="Presidente" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Presidente</span>
                            Dr. {{ slotProps.data.link.link }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-4">
                                    <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                </div>
                                <div class="col-4 md:col-4">
                                    <Button @click="chat(slotProps.data.id)" icon="pi pi-comments" class="p-button-secondary" />
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
    max-height: 300px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}
</style>
