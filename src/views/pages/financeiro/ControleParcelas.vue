<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';

export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            empresaService: new EmpresaService(),
            pedidos: ref(null),
            parcelas: ref(null),
            form: ref({}),
            preloading: ref(true),
            display: ref(false),
            displayPdf: ref(false),
            urlBase: 'http://34.196.238.92/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            pdfsrcboleto: ref(null),
            pdfsrcnota: ref(null),
            conversa: ref(null),
            loading: true,
            empresas: ref(null)
        };
    },

    mounted: function () {
        // Metódo responsável por todos pedidos e suas respectivas parcelas
        this.pedidoService.buscaControleFinanceiro().then((data) => {
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
        // Metódo responsável por buscar todos pedidos
        buscaControle() {
            this.form = {};
            this.preloading = true;
            this.pedidoService.buscaControleFinanceiro().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por buscar parcelas de acordo com filtro
        filtrar() {
            this.preloading = true;
            this.pedidoService.buscaControleFinanceiroFiltros(this.form.empresa.id).then((data) => {
                if (data.resposta == 'Pedidos listados com sucesso!') {
                    this.pedidos = data.pedidos;
                    this.showSuccess('Filtro aplicado com sucesso!');
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador"!');
                }
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
                timeZone: 'UTC'
            };

            return new Intl.DateTimeFormat('pt-BR', options).format(dataFormatada);
        },

        formatarDataPadraoBR(data) {
            const partes = data.split('-');
            const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            return dataFormatada;
        },

        // Metódo responsável por ver parcelas
        visualizar(data) {
            this.display = true;
            this.parcelas = data.parcelas;
        },

        // Metódo responsável por visualizar pedido
        verPedido(data) {
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.displayPdf = true;
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

        verificaPrioridade(status) {
            return status == 'Pago' ? 'success' : 'danger';
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

        <Dialog v-model:visible="display" header="PARCELAS" :style="{ width: '50%' }" maximizable modal :contentStyle="{ height: '80%' }">
            <DataTable :value="parcelas" scrollable scrollHeight="400px" :virtualScrollerOptions="{ itemSize: 46 }" tableStyle="min-width: 50rem">
                <Column field="id" header="Id" style="width: 10%"></Column>
                <Column field="valor" header="Valor" style="width: 20%">
                    <template v-slot:body="slotProps">
                        {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                    </template>
                </Column>
                <Column field="dt_vencimento" header="Dt. Vencimento" style="width: 20%">
                    <template v-slot:body="slotProps">
                        {{ slotProps.data.dt_vencimento ? this.formatarDataPadraoBR(slotProps.data.dt_vencimento) : 'N/C' }}
                    </template>
                </Column>
                <Column field="dt_pagamento" header="Dt. Pagamentos" style="width: 20%">
                    <template v-slot:body="slotProps">
                        {{ slotProps.data.dt_pagamento ? this.formatarDataPadraoBR(slotProps.data.dt_pagamento) : 'N/C' }}
                    </template>
                </Column>
                <Column field="status" header="Status" style="width: 20%">
                    <template v-slot:body="slotProps">
                        <Badge :value="slotProps.data.status" :severity="verificaPrioridade(slotProps.data.status)" />
                    </template>
                </Column>
            </DataTable>
        </Dialog>

        <Dialog v-model:visible="displayPdf" header="PEDIDO" :style="{ width: '60%' }" maximizable modal :contentStyle="{ height: '10%' }">
            <div class="grid">
                <div class="col-12 md:col-12">
                    <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
                </div>
            </div>
        </Dialog>

        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>

            <div class="p-fluid formgrid grid mb-5 justify-content-center">
                <div class="field col-2 md:col-4">
                    <label for="Empresa">Empresa <span class="obrigatorio">*</span></label>
                    <Dropdown id="Empresa" v-model="form.empresa" :options="empresas" optionLabel="nome_empresa" placeholder="Selecione..."></Dropdown>
                </div>
                <div class="field col-2 md:col-2">
                    <label style="color: white" for="firstname2">.</label><br />
                    <Button label="Pesquisar" @click.prevent="filtrar()" icon="pi pi-search" class="p-button-info mb-1" />
                </div>
                <div class="field col-2 md:col-2">
                    <label style="color: white" for="firstname2">.</label><br />
                    <Button label="Limpar" @click.prevent="buscaControle()" icon="pi pi-trash" class="p-button-danger" />
                </div>
            </div>

            <!-- Tabela com Pedidos -->
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

                    <Column field="Nº Pedido" header="Nº Pedido" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Nº Pedido</span>
                            {{ slotProps.data.protheus }}
                        </template>
                    </Column>

                    <Column field="Fornecedor" header="Fornecedor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Fornecedor</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-4">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa }}
                        </template>
                    </Column>

                    <Column field="Comprador" header="Comprador" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Comprador</span>
                            {{ slotProps.data.comprador }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Qtd. Parcelas" header="Qtd. Parcelas" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Qtd. Parcelas</span>
                            {{ slotProps.data.total_parcelas }} x
                        </template>
                    </Column>

                    <Column field="Qtd. Parcelas Pagas" header="Qtd. Parcelas Pagas" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Qtd. Parcelas Pagas</span>
                            {{ slotProps.data.parcelas_pagas }} x
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-3 md:col-3">
                                    <Button @click.prevent="verPedido(slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                </div>
                                <div class="col-3 md:col-3 ml-4">
                                    <Button @click.prevent="visualizar(slotProps.data)" icon="pi pi-file" class="p-button-secondary" />
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
</style>
