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
            chatService: new ChatService(),
            parcelaService: new ParcelaService(),
            pedidos: ref(null),
            form: ref({}),
            preloading: ref(true),
            displayChat: ref(false),
            novaMensagem: ref(null),
            displayDiretorio: ref(false),
            totalPagar: ref(0),
            totalQtd: ref(null),
            totalPagamentos: ref(null),
            display: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            pdfsrcboleto: ref(null),
            pdfsrcnota: ref(null),
            conversa: ref(null),
            customers: null,
            loading: true
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pagamentos
        this.parcelaService.buscaPedidosHoje().then((data) => {
            this.pedidos = data.parcelas;
            this.preloading = false;
            this.totalPagar = data.total;
            this.totalQtd = data.totalParcelas;
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos
        buscaPedidosHoje() {
            this.form = {};
            this.preloading = true;
            this.parcelaService.buscaPedidosHoje().then((data) => {
                this.pedidos = data.parcelas;
                this.preloading = false;
                this.totalPagar = data.total;
                this.totalQtd = data.totalParcelas;
                this.showSuccess('Filtros removidos com sucesso!');
            });
        },

        // Metódo responsável por buscar parcelas de acordo com filtro
        filtrar() {
            this.preloading = true;
            if (this.form.dt_inicio && this.form.dt_fim) {
                this.parcelaService.buscaParcelasFiltradas(this.form).then((data) => {
                    this.pedidos = data.parcelas;
                    this.totalPagar = data.total;
                    this.totalQtd = data.totalParcelas;
                    this.showSuccess('Filtros aplicados com sucesso!');
                    this.preloading = false;
                });
            } else {
                this.showError('Preencha o intevelado de datas!');
                this.preloading = false;
            }
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
                this.buscaPedidosHoje();
            });
        },

        // Metódo responsável por reprovar pedido e enviar para Comprador
        reprovarPedidoComprador() {
            this.preloading = true;
            this.pedidoService.reprovarFinanceiroParaComprador(this.novaMensagem, this.idPedido).then((data) => {
                if (data.resposta == 'Pedido reprovado e enviado para comprador com sucesso!') {
                    this.showSuccess('Pedido reprovado e enviado para comprador com sucesso!');
                    this.display = false;
                    this.displayChat = false;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
                this.buscaPedidosFinanceiro();
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

        // Metódo responsável por visualizar pdf
        visualizar(id, data) {
            this.idPedido = id;
            this.display = true;
            this.pdf = data.pedido.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.pdfsrcnota = `${this.urlBase}/${data.pedido.nota[0]?.nota}`;
            this.pdfsrcboleto = `${this.urlBase}/${data.pedido.boleto[0]?.boleto}`;
        },

        // Metódo responsável por abrir chat
        abrirChat(botao) {
            this.chat(this.idPedido); // Buscando histórico desse chat
            this.displayChat = true;
        },

        // Metódo responsável por buscal chat de pedido
        chat(id, data) {
            this.displayChat = true;
            this.chatService.buscaConversa(id).then((data) => {
                if (data.resposta == 'Chat listado com sucesso!') {
                    this.conversa = data.conversa;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        // Metódo responsável por dar baixa no pedido enviado para comprador inserir nota ou enviando para consolidar dados
        salvarPedidoPago() {
            this.preloading = true;
            this.pedidoService.pagarPedido(this.caminhoComprovante, this.idPedido).then((data) => {
                if (data.resposta == 'Pedido despachado com sucesso!') {
                    this.showSuccess('Pedido despachado com sucesso!');
                    this.display = false;
                    this.displayDiretorio = false;
                    this.buscaPedidosFinanceiro();
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

        // Metódo por pintar linha da tabela de vermelho caso data seja a atual
        rowClass(data) {
            const dtAtual = this.dataAtual();
            const dtVencimento = this.formatarData(data.dt_vencimento);
            if (dtAtual === dtVencimento) {
                return 'bg-red-500';
            } else {
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
        <Dialog header="Pedido de Compra" v-model:visible="display" :modal="true" :style="{ width: '98%' }">
            <div class="grid">
                <!-- <div class="col-4">
                    <Button @click.prevent="abrirChat(comprador)" style="width: 100%" label="Reprovar e Enviar para Comprador" icon="pi pi-times" class="p-button-danger" />
                </div> -->
                <div class="col-6">
                    <Button @click.prevent="abrirChat(fiscal)" style="width: 100%" label="Reprovar e Enviar para Fiscal" icon="pi pi-times" class="p-button-danger" />
                </div>
                <div class="col-6">
                    <Button @click.prevent="this.displayDiretorio = true" style="width: 100%" label="Pago - Anexar Comprovante" icon="pi pi-check" class="p-button-success" />
                </div>
            </div>

            <Splitter>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrc" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrcnota" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrcboleto" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
            </Splitter>
        </Dialog>

        <!-- Visualizar input para inserir diretório -->
        <Dialog header="Informe caminho onde foi salvo comprovante:" v-model:visible="displayDiretorio" :modal="true" :style="{ width: '50%' }">
            <div class="grid">
                <div class="field col-12 mt-6">
                    <InputGroup>
                        <Button style="width: 50%" label="\\server1\FILESERVER\05 FINANCEIRO$\01 - Comprovantes de Pagamentos (Fornecedores)\COMPARTILHAMENTO CLOUD\" />
                        <InputText v-model="caminhoComprovante" style="width: 50%; height: 100%" placeholder="Digite o diretório" />
                    </InputGroup>
                </div>
                <div class="field col-12">
                    <Button style="width: 100%" label="Salvar" class="p-button-success" @click="salvarPedidoPago()" />
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
                    <Button @click.prevent="reprovar()" label="Enviar" class="mr-2 mt-3 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>

            <!-- Tabela com Pedidos -->
            <div class="card">
                <div class="p-fluid formgrid grid mb-5">
                    <div class="field col-2 md:col-2">
                        <label for="firstname2">Dt de Início <span class="obrigatorio">*</span></label>
                        <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data inicial'" v-model="form.dt_inicio" showIcon iconDisplay="input" />
                    </div>
                    <div class="field col-2 md:col-2">
                        <label for="firstname2">Dt Fim <span class="obrigatorio">*</span></label>
                        <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data final'" v-model="form.dt_fim" showIcon iconDisplay="input" />
                    </div>
                    <div class="field col-2 md:col-2">
                        <label style="color: white" for="firstname2">.</label><br />
                        <Button label="Pesquisar" @click.prevent="filtrar()" icon="pi pi-search" class="p-button-info mb-1" />
                        <Button label="Limpar" @click.prevent="buscaPedidosHoje()" icon="pi pi-trash" class="p-button-danger" />
                    </div>
                    <div class="field col-3 md:col-3">
                        <div class="card mb-0">
                            <div class="flex justify-content-between mb-3">
                                <div>
                                    <span class="block text-500 font-medium mb-3">TOTAL A PAGAR</span>
                                    <div class="text-900 font-medium text-xl"></div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-chart-bar text-green-500 text-xl"></i>
                                </div>
                            </div>
                            <span class="text-green-500 font-medium"></span>
                            <span v-if="totalPagar !== 0" class="text-500">
                                {{ totalPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                            </span>
                            <span v-else class="text-500"> Nenhum pagamento até o momento!</span>
                        </div>
                    </div>
                    <div class="field col-3 md:col-3">
                        <div class="card mb-0">
                            <div class="flex justify-content-between mb-3">
                                <div>
                                    <span class="block text-500 font-medium mb-3">Qtd. DE PAGAMENTOS</span>
                                    <div class="text-900 font-medium text-xl"></div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-chart-bar text-blue-500 text-xl"></i>
                                </div>
                            </div>
                            <span class="text-green-500 font-medium"></span>
                            <span class="text-500"> {{ this.totalQtd }}</span>
                        </div>
                    </div>
                </div>

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

                    <Column field="Dt. Venc" header="Dt. Venc" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Venc</span>
                            {{ formatarData(slotProps.data.dt_vencimento) }}
                        </template>
                    </Column>

                    <Column field="Fornecedor" header="Fornecedor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Fornecedor</span>
                            {{ slotProps.data.pedido.descricao }}
                        </template>
                    </Column>

                    <Column field="Nº Pedido" header="Nº Pedido" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Nº Pedido</span>
                            {{ slotProps.data.pedido.protheus }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-4">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.pedido.empresa }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor_parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Comprador" header="Comprador" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Comprador</span>
                            {{ slotProps.data.pedido.criador }}
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
</style>
