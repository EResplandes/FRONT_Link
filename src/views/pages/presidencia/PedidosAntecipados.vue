<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import PedidoService from '../../../service/Pedido';
import ChatService from '../../../service/ChatService';

export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            chatService: new ChatService(),
            pedidos: ref(null),
            form: ref({}),
            preloading: ref(true),
            displayChat: ref(false),
            display: ref(false),
            totalPedidos: ref(500),
            totalValor: ref(null),
            urlBase: 'https://link.gruporialma.com.br/storage'
            // sortOrder: 1 // 1 para ascendente, -1 para descendente
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos
        this.pedidoService.pedidosRelatorioEmival().then((data) => {
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
        visualizar(id, data) {
            this.display = true;
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
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

        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>

            <div class="grid">
                <div class="field col-6 md:col-6">
                    <div class="card mb-0">
                        <div class="flex justify-content-between">
                            <div>
                                <span class="block text-500 font-medium mb-3">PEDIDOS</span>
                                <div class="text-900 font-medium text-xl"></div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-chart-bar text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <span class="text-green-500 font-medium"></span>
                        <span v-if="totalPedidos !== 0" class="text-500">
                            {{ this.totalPedidos }}
                        </span>
                        <span v-else class="text-500"> Nenhum pagamento até o momento!</span>
                    </div>
                </div>
                <div class="field col-6 md:col-6">
                    <div class="card mb-0">
                        <div class="flex justify-content-between">
                            <div>
                                <span class="block text-500 font-medium mb-3">VALOR</span>
                                <div class="text-900 font-medium text-xl"></div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-chart-bar text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <span class="text-green-500 font-medium"></span>
                        <span v-if="totalValor !== 0" class="text-500">
                            {{ this.totalValor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </span>
                        <span v-else class="text-500"> Nenhum pagamento até o momento!</span>
                    </div>
                </div>
            </div>

            <!-- Tabela com Pedidos -->
            <div class="card">
                <DataTable
                    dataKey="id"
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

                    <Column field="tipocompra" header="Tipo Compra" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">tipocompra</span>
                            {{ slotProps.data.compra_antecipada == 'Sim' ? 'ANTECIPADA' : 'NORMAL' }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão Link" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Dt. Criação Protheus" header="Dt. Criação Protheus" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarDataSemHora(slotProps.data.dt_protheus) }}
                        </template>
                    </Column>

                    <Column field="Dt. Emissão Nota" header="Dt. Emissão Nota" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Emissão Nota</span>
                            {{ formatarDataSemHora(slotProps.data.nota[0]?.dt_emissao) }}
                        </template>
                    </Column>

                    <Column field="Dif. Dias" header="Dif. Dias" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Emissão Nota</span>
                            {{ calcularDiferencaDias(slotProps.data.nota[0]?.dt_emissao, slotProps.data.dt_protheus) }}
                        </template>
                    </Column>

                    <Column field="Dt. Aprovação" header="Dt. Aprovação" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Aprovação</span>
                            {{ formatarData(slotProps.data.dt_aprovacao) }}
                        </template>
                    </Column>

                    <Column field="Fornecedor" header="Fornecedor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Fornecedor</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Comprador" header="Comprador" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Comprador</span>
                            {{ slotProps.data.comprador }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-3 md:col-3">
                                    <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
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
