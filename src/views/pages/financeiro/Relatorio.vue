<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import PedidoService from '../../../service/Pedido';
import ChatService from '../../../service/ChatService';
import { FilterMatchMode } from 'primevue/api';

export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            chatService: new ChatService(),
            pedidos: ref(null),
            form: ref({}),
            parcelas: ref(null),
            preloading: ref(true),
            displayChat: ref(false),
            display: ref(false),
            displayParcelas: ref(false),
            totalPedidos: ref(500),
            totalValor: ref(null),
            filters: {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                protheus: { value: null, matchMode: FilterMatchMode.CONTAINS },
                descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
                dt_inclusao_formatada: { value: null, matchMode: FilterMatchMode.CONTAINS },
                'empresa.nome_empresa': { value: null, matchMode: FilterMatchMode.CONTAINS },
                status: { value: null, matchMode: FilterMatchMode.CONTAINS },
                valor_formatado: { value: null, matchMode: FilterMatchMode.CONTAINS }
            },
            urlBase: 'https://link.gruporialma.com.br/storage'
            // sortOrder: 1 // 1 para ascendente, -1 para descendente
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos
        this.pedidoService.pedidosAuditoriaFinanceiro().then((data) => {
            this.pedidos = data.pedidos;
            this.preloading = false;
            this.totalPedidos = data.totalPedidos;
            this.totalValor = data.totalValor;
        });
    },

    methods: {
        // Metódo responsável por formatar data padrão br
        formatarData(data) {
            if (!data) {
                return 'N/C';
            }

            if (data == null) {
                return 'N/C';
            }

            const dataFormatada = new Date(data);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'UTC'
            };
            return new Intl.DateTimeFormat('pt-BR', options).format(dataFormatada);
        },

        formatarDataSemHora(data) {
            if (!data) {
                return 'N/C';
            }

            // Dividir a data em componentes ano, mês e dia
            const [year, month, day] = data.split('-');

            // Criar um novo objeto Date usando os componentes
            const dataFormatada = new Date(year, month - 1, day); // Mês é 0-indexado

            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };

            return new Intl.DateTimeFormat('pt-BR', options).format(dataFormatada);
        },

        // Metódo responsável por visualizar pdf
        visualizar(data) {
            this.display = true;
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
        },

        formatarDataPadraoBR(data) {
            const partes = data.split('-');
            const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            return dataFormatada;
        },

        verParcelas(data) {
            this.displayParcelas = true;
            this.parcelas = data.parcelas;
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

        // Metódo por pintar linha da tabela de vermelho caso exista data de nota e sem data de aprovacao
        rowClass(data) {
            if (!data.nota[0]?.dt_emissao) {
                return 'teste';
            }

            const emissao = new Date(data.nota[0]?.dt_emissao);
            const inclusao = new Date(data.dt_inclusao);

            if (emissao < inclusao && data.compra_antecipada == 'Não') {
                data.prioridade = 1; // Definir uma propriedade de prioridade para ordenação
                return 'bg-red-500';
            } else if (data.compra_antecipada == 'Sim' && data.valor >= 20000) {
                data.prioridade = 0; // Definir uma propriedade de prioridade para ordenação
                return 'bg-yellow-200';
            } else {
                data.prioridade = 0; // Definir uma propriedade de prioridade para ordenação
                return 'bg-white';
            }
        },

        // Metódo responsável por pegar data atual
        dataAtual() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${day}/${month}/${year}`;
        },

        calcularDiferencaDias(dataEmissao, dataCriacao) {
            if (dataEmissao == null || dataEmissao == undefined || dataCriacao == null || dataCriacao == undefined) {
                return 'N/C';
            }

            const emissao = new Date(dataEmissao);
            const criacao = new Date(dataCriacao);
            const umDia = 24 * 60 * 60 * 1000; // Milissegundos em um dia
            return Math.round((emissao - criacao) / umDia);
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

        <!-- Visualizar Pedido de Compra -->
        <Dialog header="Pedido de Compra" v-model:visible="display" :modal="true" :style="{ width: '70%' }">
            <div class="grid">
                <div class="col-12 md:col-12">
                    <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
                </div>
            </div>
        </Dialog>

        <!-- Parcelas -->
        <Dialog v-model:visible="displayParcelas" header="PARCELAS" :style="{ width: '50%' }" maximizable modal :contentStyle="{ height: '80%' }">
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

        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <!-- Tabela com Pedidos -->
            <div class="card">
                <DataTable
                    dataKey="id"
                    v-model:filters="filters"
                    :value="pedidos"
                    :paginator="true"
                    :rows="100"
                    :rowClass="rowClass"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100, 200, 500]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    responsiveLayout="scroll"
                    filterDisplay="menu"
                    stripedRows
                >
                    <template #empty> Nenhum pedido encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="tipocompra" header="Tipo Compra" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">tipocompra</span>
                            {{ slotProps.data.compra_antecipada == 'Sim' ? 'ANTECIPADA' : 'NORMAL' }}
                        </template>
                    </Column>

                    <Column field="comprador" header="Comprador" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Comprador</span>
                            {{ slotProps.data.comprador }}
                        </template>
                    </Column>

                    <Column field="empresa" header="Empresa" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa }}
                        </template>
                    </Column>

                    <Column field="descricao" header="Fornecedor" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Fornecedor</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="protheus." header="N. Ped." class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Nº Ped</span>
                            {{ slotProps.data.protheus }}
                        </template>
                    </Column>

                    <Column field="dt_inclusao" header="Dt. Inclusão Link" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Nota Fiscal" header="Nota Fiscal" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Nota Fiscal</span>
                            {{ slotProps.data.nota[0]?.numero_nota }}
                        </template>
                    </Column>

                    <Column field="Dt. Emissão Nota" header="Dt. Emissão Nota" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Emissão Nota</span>
                            {{ formatarDataSemHora(slotProps.data.nota[0]?.dt_emissao) }}
                        </template>
                    </Column>

                    <Column field="dt_protheus" header="Dt. Criação Protheus" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarDataSemHora(slotProps.data.dt_protheus) }}
                        </template>
                    </Column>

                    <Column field="Dif. Dias" header="Dt. Emisssao Nota x Dt. Protheus" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Emissão Nota</span>
                            {{ calcularDiferencaDias(slotProps.data.nota[0]?.dt_emissao, slotProps.data.dt_protheus) }}
                        </template>
                    </Column>

                    <Column field="valor" header="Valor Pedido" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor Nota" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Valor Nota</span>
                            {{ slotProps.data.nota[0]?.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="dt_lancamento_fiscal" header="Dt. Lançamento Fiscal" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Lançamento Fiscal</span>
                            {{ formatarData(slotProps.data.dt_lancamento_fiscal ? slotProps.data.dt_lancamento_fiscal : null) }}
                        </template>
                    </Column>

                    <Column field="dt_validacao_finan" header="Dt. Lançamento Financeiro" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Lançamento Financeiro</span>
                            {{ formatarData(slotProps.data.dt_validacao_finan ? slotProps.data.dt_validacao_finan : null) }}
                        </template>
                    </Column>

                    <Column field="Dif. Dias" header="Dt. Lançamento Fiscal x Dt. Lançamento Financeiro" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Emissão Nota</span>
                            {{ calcularDiferencaDias(slotProps.data.dt_lancamento_fiscal, slotProps.data.dt_validacao_finan) }}
                        </template>
                    </Column>

                    <Column field="Dt. Aprovação" header="Dt. Aprovação" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Aprovação</span>
                            {{ formatarData(slotProps.data.dt_aprovacao) }}
                        </template>
                    </Column>

                    <Column field="..." header="..." class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-3 md:col-3">
                                    <Button @click.prevent="visualizar(slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                </div>
                                <div class="col-3 md:col-3 ml-4">
                                    <Button @click.prevent="verParcelas(slotProps.data)" icon="pi pi-file" class="p-button-secondary" />
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
