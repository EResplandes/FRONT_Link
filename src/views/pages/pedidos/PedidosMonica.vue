<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            pedidoService: new PedidoService(),
            empresaService: new EmpresaService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            loading1: ref(null),
            pedidos: ref(null),
            form: ref({}),
            editar: ref(false),
            preloading: ref(true),
            display: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            validaExclusaoButton: localStorage.getItem('grupo')
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos com Monica
        this.pedidoService.pedidosMonica().then((data) => {
            this.pedidos = data.pedidos;
            this.preloading = false;
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas;
            }
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos que estão com Mônica
        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.pedidosMonica().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por excluir pedido
        excluirPedido(id_pedido) {
            this.pedidoService.excluirPedido(id_pedido).then((data) => {
                if (data.resposta == 'Pedido excluído com sucesso!') {
                    this.showSuccess('Pedido excluído com sucesso!');
                    this.buscaPedidos();
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

        // Metódo responsável por abrir confiramção de exclusão
        confirmDeletar(id_pedido) {
            this.confirm.require({
                message: 'Tem certeza de que deseja excluir o pedido?',
                header: 'Exclusão de Pedido',
                icon: 'pi pi-info-circle',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Deletar',
                rejectClass: 'p-button-secondary p-button-outlined',
                acceptClass: 'p-button-danger',
                accept: () => {
                    this.excluirPedido(id_pedido);
                },
                reject: () => {}
            });
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

        // Metódo responsável por definir pedido como urgente
        urgente(idPedido) {
            this.preloading = true;
            this.pedidoService.pedidoUrgente(idPedido).then((data) => {
                if (data.resposta == 'Pedido foi definido como urgente com sucesso!') {
                    this.buscaPedidos();
                    this.showSuccess('Pedido definido como urgente com sucesso!');
                    this.preloading = false;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        // Metódo responsável por definir pedido como normal
        normal(idPedido) {
            this.preloading = true;
            this.pedidoService.pedidoNormal(idPedido).then((data) => {
                if (data.resposta == 'Pedido foi definido como normal com sucesso!') {
                    this.buscaPedidos();
                    this.showSuccess('Pedido foi definido como normal com sucesso!');
                    this.preloading = false;
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

    <!-- Visualizar -->
    <Dialog header="Documento" v-model:visible="display" :style="{ width: '80%' }" :modal="true">
        <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
    </Dialog>

    <div class="grid">
        <Toast />
        <ConfirmDialog></ConfirmDialog>
        <!-- Modal Filtros -->
        <Sidebar style="width: 500px" v-model:visible="visibleRight" :baseZIndex="1000" position="right">
            <h3 v-if="this.editar == false" class="titleForm">Filtros</h3>

            <div class="card p-fluid">
                <div class="field">
                    <label for="empresa">Empresa:</label>
                    <Dropdown v-model="form.empresa" :options="empresas" showClear optionLabel="nome_empresa" placeholder="Selecione..." class="w-full" />
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
                    <Calendar dateFormat="dd/mm/yy" v-tooltip.left="'Selecione a data de inclusão'" v-model="form.dt_inclusao" showIcon :showOnFocus="false" class="" />
                </div>
                <hr />
                <div class="field">
                    <Button @click.prevent="buscaFiltros()" label="Filtrar" class="mr-2 mb-2 p-button-secondary" />
                    <Button @click.prevent="limparFiltro()" label="Limpar Filtros" class="mr-2 mb-2 p-button-danger" />
                </div>
            </div>
        </Sidebar>

        <!-- Tabela com todos pedidos com Dr(a) Mônica -->
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
                            <h5 for="empresa">Pedidos com Mônica:</h5>
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

                    <Column field="Protheus" header="Protheus" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Protheus</span>
                            {{ slotProps.data.protheus }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Fornecedor" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Urgência" header="Urgência" class="w-4">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="button-container">
                                <Button v-if="slotProps.data.urgente == 0" @click.prevent="urgente(slotProps.data.id)" label="Urgente" class="p-button-danger" />
                                <Button v-else @click.prevent="normal(slotProps.data.id)" label="Normal" class="p-button-info" />
                            </div>
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="button-container">
                                <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                <Button v-if="this.validaExclusaoButton == 'Administrador'" @click.prevent="confirmDeletar(slotProps.data.id)" icon="pi pi-trash" class="p-button-danger" />
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

.button-container {
    display: flex;
    gap: 10px; /* ajusta o espaço entre os botões conforme necessário */
}
</style>
