<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import FluxoService from '../../../service/FluxoService';
import GerenteService from '../../../service/GerenteService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            gerenteService: new GerenteService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            fluxoService: new FluxoService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            loading1: ref(null),
            empresas: ref(null),
            pedidos: ref(null),
            status: ref(null),
            form: ref({}),
            idPedido: ref(null),
            idFluxo: ref(null),
            editar: ref(false),
            preloading: ref(true),
            displayFluxo: ref(false),
            display: ref(false),
            urlBase: 'http://localhost:8000/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            fluxoPedido: ref(null)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos pedidos relacionas a esse usuário que não foram aprovados por ele mesmo
        this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
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
        // Metódo responsável por buscar todos pedidos do usuário logado
        buscaPedidos() {
            this.preloading = true;
            this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por aprovar fluxo
        aprovarPedido() {
            this.gerenteService.aprovar(this.idFluxo).then((data) => {
                if (data.resposta == 'Pedido aprovado com sucesso!') {
                    this.showSuccess('Pedido aprovado com suceso!');
                    this.buscaPedidos();
                    this.display = false;
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o Administrador!');
                    this.display = false;
                    this.buscaPedidos();
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
            this.idFluxo = id;
            this.pdf = data.pedido.anexo;
            // this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.pdfsrc = 'https://www.gruporialma.com.br/wp-content/uploads/2024/05/pdf-teste.pdf';
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
            <div class="grid">
                <div class="col-6 md:col-6">
                    <Button @click.prevent="aprovarPedido()" icon="pi pi-check" label="Aprovar" class="p-button-success" style="width: 100%" />
                </div>
                <div class="col-6 md:col-6">
                    <Button icon="pi pi-times" label="Reprovar" class="p-button-danger" style="width: 100%" />
                </div>
                <div class="col-12 md:col-12">
                    <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
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
                            <h5 for="empresa">Minhas Aprovações:</h5>
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
                            {{ formatarData(slotProps.data.pedido.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.pedido.empresa.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.pedido.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            R$ {{ slotProps.data.pedido.valor }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-3">
                                    <Button @click.prevent="visualizar(slotProps.data.id_fluxo, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
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
