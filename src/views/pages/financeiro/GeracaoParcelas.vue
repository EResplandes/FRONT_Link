<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import PedidoService from '../../../service/Pedido';
import ChatService from '../../../service/ChatService';
import ParcelaService from '../../../service/ParcelaService';

export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            parcelaService: new ParcelaService(),
            chatService: new ChatService(),
            pedidos: ref(null),
            form: ref({}),
            destino: ref(null),
            parcelas: ref([]),
            caminhoComprovante: ref(null),
            preloading: ref(true),
            displayChat: ref(false),
            novaMensagem: ref(null),
            displayDiretorio: ref(false),
            display: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            conversa: ref(null),
            customers: null,
            loading: true
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos
        this.pedidoService.buscaPedidosFinanceiro(localStorage.getItem('local_id')).then((data) => {
            this.pedidos = data.pedidos;
            console.log(data);
            this.preloading = false;
            this.loading = false;
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos
        buscaPedidosFinanceiro() {
            this.preloading = true;
            this.pedidoService.buscaPedidosFinanceiro(localStorage.getItem('local_id')).then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por reprovar pedido e enviar para Fiscal
        reprovarPedidoFiscal() {
            this.preloading = true;
            this.pedidoService.reprovarFinanceiroParaFiscal(this.novaMensagem, this.idPedido).then((data) => {
                if (data.resposta == 'Pedido reprovado e enviado para fiscal com sucesso!') {
                    this.showSuccess('Pedido reprovado e enviado para fiscal com sucesso!');
                    this.display = false;
                    this.displayChat = false;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
                this.buscaPedidosFinanceiro();
            });
        },

        // Metódo responsável por cadastrar parcelas
        cadastarParcelas() {
            this.preloading = true;
            this.parcelaService.cadastrar(this.parcelas, this.idPedido).then((data) => {
                if (data.resposta == 'Parcelas cadastradas com sucesso!') {
                    this.preloading = false;
                    this.showSuccess('Parcelas cadastradas com sucesso!');
                    this.parcelas = null;
                    this.qtd_parcelas = null;
                    this.buscaPedidosFinanceiro();
                    this.display = false;
                }
            });
        },

        // Metódo responsável por gerar quantidade de parcelas
        gerarParcelas() {
            this.parcelas = Array.from({ length: this.qtd_parcelas }, () => ({
                dataVencimento: null,
                valor: null
            }));
        },

        // Função de validação
        validarParcelas() {
            return this.parcelas.every((parcela) => parcela.dataVencimento && parcela.valor);
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

        // Metódo responsável por visualizar pdf
        visualizar(id, data) {
            this.idPedido = id;
            this.display = true;
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.pdfsrcboleto = `${this.urlBase}/${data.boleto[0].boleto}`;
        },

        // Metódo responsável por abrir chat
        abrirChat(botao) {
            this.destino = botao;
            this.chat(this.idPedido); // Buscando histórico desse chat
            this.displayChat = true;
        },

        // Metódo responsável por buscal chat de pedido
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

        showSuccess(mensagem) {
            this.toast.add({ severity: 'success', summary: 'Sucesso!', detail: mensagem, life: 3000 });
        },

        showInfo(mensagem) {
            this.toast.add({ severity: 'info', summary: 'Aviso!', detail: mensagem, life: 3000 });
        },

        showError(mensagem) {
            this.toast.add({ severity: 'error', summary: 'Ocorreu um erro!', detail: mensagem, life: 3000 });
        },

        // Metódo responsável por pegar data atual
        dataAtual() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${day}/${month}/${year}`;
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
        <Dialog header="Pedido de Compra" v-model:visible="display" :modal="true" :style="{ width: '90%' }">
            <div class="grid">
                <div class="col-6">
                    <Button @click.prevent="abrirChat(fiscal)" style="width: 100%" label="Reprovar e Enviar para Fiscal" icon="pi pi-times" class="p-button-danger" />
                </div>

                <div class="col-6">
                    <Button @click.prevent="cadastarParcelas()" style="width: 100%" label="Salvar Parcelas" class="p-button-success" :disabled="!validarParcelas()" />
                </div>

                <Divider />

                <div style="height: 900px" class="col-7 timeline-container">
                    <Splitter layout="vertical">
                        <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                            <iframe :src="pdfsrc" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                        </SplitterPanel>

                        <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                            <iframe :src="pdfsrcboleto" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                        </SplitterPanel>
                    </Splitter>
                </div>

                <div class="col-5">
                    <div class="p-fluid formgrid grid mb-5 p-3">
                        <div class="field col-4 md:col-4">
                            <label for="firstname2">Quantidade de Parcelas: <span class="obrigatorio">*</span></label>
                            <InputNumber v-model="qtd_parcelas" inputId="minmax-buttons" mode="decimal" showButtons :min="0" :max="100" />
                        </div>
                        <div class="field col-4 md:col-4">
                            <label style="color: white" for="firstname2">.</label>
                            <Button style="width: 100%" label="Gerar Parcelas" class="p-button-info" @click="gerarParcelas()" />
                        </div>
                    </div>

                    <div style="background-color: whitesmoke; padding: 5px; margin-bottom: 25px">
                        <h3 style="text-align: center">Parcelas</h3>
                    </div>

                    <div class="parcelas-container">
                        <div v-for="(parcela, index) in parcelas" :key="index" class="p-fluid formgrid grid mb-5 px-5">
                            <div class="col-12">
                                <h5>Parcela de Nº {{ index + 1 }}</h5>
                            </div>
                            <div class="field col-6 md:col-6">
                                <label :for="'data-vencimento-' + index">Data de Vencimento:</label>
                                <Calendar v-model="parcela.dataVencimento" :inputId="'data-vencimento-' + index" />
                            </div>
                            <div class="field col-6 md:col-6">
                                <label :for="'valor-parcela-' + index">Valor da Parcela:</label>
                                <InputNumber v-model="parcela.valor" :inputId="'valor-parcela-' + index" mode="currency" currency="BRL" locale="pt-BR" />
                            </div>
                            <Divider />
                        </div>
                    </div>
                </div>
            </div>
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
                    <Button @click.prevent="reprovarPedidoFiscal()" label="Enviar" class="mr-2 mt-3 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>

            <h4 class="px-3">Pedidos Enviados Financeiro</h4>

            <Divider />

            <!-- Tabela com Pedidos -->
            <div class="card">
                <DataTable
                    class="mt-5"
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

                    <Column field="Dt. Venc" header="Dt. Venc" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Venc</span>
                            {{ formatarData(slotProps.data.dt_vencimento) }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Fornecedor" :sortable="true" class="w-4">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Comprador" header="Comprador" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Comprador</span>
                            {{ slotProps.data.comprador }}
                        </template>
                    </Column>

                    <Column field="Status" header="Status" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            {{ slotProps.data.status }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-3">
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
.timeline-container {
    max-height: 700px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}

.parcelas-container {
    max-height: 450px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}
</style>
