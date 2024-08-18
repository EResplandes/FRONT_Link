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
            dadosAlterar: ref({}),
            destino: ref(null),
            parcelas: ref(null),
            caminhoComprovante: ref(null),
            displayPedidoBoletoNota: ref(null),
            preloading: ref(true),
            displayChat: ref(false),
            novaMensagem: ref(null),
            displayDiretorio: ref(false),
            display: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            pdfsrcboleto: ref(null),
            pdfsrcnota: ref(null),
            conversa: ref(null),
            displayAlterar: ref(null),
            customers: null,
            loading: true
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos
        this.pedidoService.buscaPedidosFinanceiro().then((data) => {
            this.pedidos = data.pedidos;
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
            console.log(data);
            this.parcelas = data.parcelas;
            this.idPedido = id;
            this.display = true;
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.pdfsrcboleto = `${this.urlBase}/${data.boleto[0].boleto}`;
            this.pdfsrcnota = `${this.urlBase}/${data.nota[0].nota}`;
        },

        // Metódo responsável por abrir chat
        abrirChat() {
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
        },

        formatarDataParaYMD(data) {
            if (data) {
                const d = new Date(data);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();

                return `${day}/${month}/${year}`;
            } else {
                return false;
            }
        },

        // Metódo responsável por validar parcelas
        validarParcelas() {
            this.preloading = true;
            this.parcelaService.validarParcelas(this.idPedido).then((data) => {
                if (data.resposta == 'Validação de parcelas realizada com sucesso!') {
                    this.showSuccess('Validação de parcelas realizada com sucesso!');
                    this.buscaPedidosFinanceiro();
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
                this.display = false;
                this.preloading = false;
            });
        },

        // Metódo responsável por reprovar parcelas
        reprovarParcelas() {
            this.preloading = true;
            this.parcelaService.reprovarParcelasComprador(this.idPedido, this.novaMensagem).then((data) => {
                if (data.resposta == 'Pedido reprovado com sucesso!') {
                    this.showSuccess('Pedido reprovado com sucesso!');
                    this.buscaPedidosFinanceiro;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
                this.display = false;
                this.displayChat = false;
                this.preloading = false;
            });
        },

        // Metódo responsável por abrir modal para alterar valor da parcela
        abrirModalAlterarParcelas(data) {
            this.dadosAlterar = data;
            this.displayAlterar = true;
        },

        // Metódo responsável pro alterar dados da parcela
        alterarDados() {
            this.preloading = true;
            this.parcelaService.alterarDadosParcela(this.dadosAlterar).then((data) => {
                this.showSuccess('Informações atualizadas com sucesso!');
                this.preloading = false;
                this.displayAlterar = false;
                this.buscaPedidosFinanceiro();
            });
        },

        // Metódo responsável por abrir modal
        visualizarPdfs() {
            this.displayPedidoBoletoNota = true;
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
                    <Button @click.prevent="abrirChat()" style="width: 100%" label="REPROVAR E ENVIAR PARA COMRPADOR" icon="pi pi-times" class="p-button-danger" />
                </div>

                <div class="col-6">
                    <Button style="width: 100%" @click.prevent="validarParcelas()" label="VALIDAR PARCELAS" class="p-button-success" />
                </div>

                <div class="col-12">
                    <Button style="width: 100%" @click.prevent="visualizarPdfs()" label="VISUALIZAR PEDIDO, BOLETO E NOTA" class="p-button-info" />
                </div>

                <Divider />

                <div style="height: 900px" class="col-7 timeline-container">
                    <iframe :src="pdfsrcboleto" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </div>

                <div class="col-5">
                    <div style="background-color: whitesmoke; padding: 5px; margin-bottom: 25px">
                        <h3 style="text-align: center">Parcelas</h3>
                    </div>

                    <div class="parcelas-container">
                        <DataTable :value="parcelas">
                            <Column field="id" header="ID"></Column>
                            <Column field="Valor" header="VALOR" class="w-2">
                                <template #body="slotProps">
                                    <span class="p-column-title">CNPJ</span>
                                    {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                                </template>
                            </Column>
                            <Column field="dt_vencimento" header="DT. VENCIMENTO" class="w-3">
                                <template #body="slotProps">
                                    <span class="p-column-title">Descrição</span>
                                    {{ this.formatarData(slotProps.data.dt_vencimento) }}
                                </template>
                            </Column>
                            <Column field="status" header="STATUS"></Column>
                            <Column field="..." header="..." class="w-3">
                                <template #body="slotProps">
                                    <span class="p-column-title">...</span>
                                    <Button icon="pi pi-pencil" severity="secondary" @click.prevent="abrirModalAlterarParcelas(slotProps.data)" />
                                </template>
                            </Column>
                        </DataTable>
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
                                        {{ this.formatarDataParaYMD(slotProps.item.data_mensagem) }}
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
                    <Button @click.prevent="reprovarParcelas()" label="Enviar" class="mr-2 mt-3 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <!-- Dialog para alterar dados de parcela -->
        <Dialog header="ALTERAR DADOS PARCELA" v-model:visible="displayAlterar" :style="{ width: '40%' }" :modal="true">
            <div class="grid">
                <div class="field col-12 md:col-4">
                    <label for="firstname2">ID PARCELA</label>
                    <InputNumber v-model="dadosAlterar.id" inputId="minmaxfraction" disabled />
                </div>
                <div class="field col-12 md:col-4">
                    <label for="firstname2">VALOR</label>
                    <InputNumber v-tooltip.top="'Digite o valor da parcela'" v-model="dadosAlterar.valor" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="R$..." />
                </div>
                <div class="field col-12 md:col-4">
                    <label for="firstname2">DT DE VENCIMENTO</label>
                    <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data de vencimento da parcela'" v-model="dadosAlterar.dt_vencimento" showIcon iconDisplay="input" />
                </div>
                <div class="field col-12 md:col-12">
                    <Button @click.prevent="alterarDados()" style="width: 100%" label="ALTERAR DADOS" severity="success" />
                </div>
            </div>
        </Dialog>

        <!-- Dialog com todos pdf relacionados a um pedido -->
        <Dialog v-model:visible="displayPedidoBoletoNota" maximizable modal header="Header" :style="{ width: '90%' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <Splitter>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrc" style="width: 100%; height: 1200px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrcnota" style="width: 100%; height: 1200px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrcboleto" style="width: 100%; height: 1200px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
            </Splitter>
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

                    <Column field="Nº Protheus" header="Nº Protheus" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Nº Protheus</span>
                            {{ slotProps.data.protheus }}
                        </template>
                    </Column>

                    <Column field="Dt. Venc" header="Dt. Venc" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Venc</span>
                            {{ formatarData(slotProps.data.dt_vencimento) }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa }}
                        </template>
                    </Column>

                    <Column field="Fornecedor" header="Fornecedor" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">Fornecedor</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Comprador" header="Comprador" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Comprador</span>
                            {{ slotProps.data.comprador }}
                        </template>
                    </Column>

                    <Column field="Local" header="Local" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Local</span>
                            {{ slotProps.data.local }}
                        </template>
                    </Column>

                    <Column field="..." header="..." class="w-1">
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
