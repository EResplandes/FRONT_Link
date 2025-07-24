<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import LmService from '../../../../service/LmService';
import PedidoService from '../../../../service/Pedido';

export default {
    data() {
        return {
            toast: new useToast(),
            confirm: new useConfirm(),
            lmService: new LmService(),
            pedidoService: new PedidoService(),
            displayConfirmation: ref(false),
            lms: ref(null),
            informacoes: ref(null),
            compradores: ref(null),
            materiais: ref(null),
            novaMensagem: ref(null),
            form: ref({}),
            pedidos: ref(null),
            lancamentos: ref(null),
            chat: ref(null),
            preloading: ref(true),
            lmSelecionada: ref(null),
            compradorSelecionado: ref(null),
            materialSelecionado: ref(null),
            menuLateralChatLms: ref(false),
            modalVisualizarLm: ref(false),
            modalEdicaoMaterial: ref(false),
            modalLancarFaturamento: ref(false),
            modalHistoricoLancamentos: ref(false),
            menuLateralChat: ref(false)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas LM
        this.lmService.buscaLmsAlmoxarifado().then((data) => {
            this.lms = data.lms;
            this.informacoes = data.informacoes;
        });

        // Metódo responsável por buscar todas os pedidos
        this.pedidoService.buscaPedidosPorComprador(localStorage.getItem('usuario_id')).then((data) => {
            this.pedidos = data.pedidos.map((pedido) => ({
                ...pedido,
                dt_inclusao_formatada: this.formatarData(pedido.dt_inclusao),
                valor_formatado: pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            }));
            this.preloading = false;
        });

        this.preloading = false;
    },

    methods: {
        async buscarLms() {
            this.lmService.buscaLmsAssociadas().then((data) => {
                this.lms = data.lm;
                this.informacoes = data.informacoes;
            });
        },

        async buscaChat(idMaterial) {
            this.lmService.buscaChat(idMaterial).then((data) => {
                this.chat = data.chat;
            });
        },

        async listarLancamentos() {
            this.lmService.listarLancamentos(this.materialSelecionado).then((data) => {
                this.lancamentos = data.lancamentos;
            });
        },

        async enviarMensagem() {
            this.lmService.enviarMensagem(this.novaMensagem, this.materialSelecionado).then((data) => {
                if (data.status === 200) {
                    this.menuLateralChat = false;
                    this.showSuccess(data.resposta);
                    this.novaMensagem = '';
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        associarMaterialLmPedido(pedido) {
            this.lmService.associarMaterialLmPedido(pedido.id, this.materialSelecionado).then((data) => {
                if (data.status === 200) {
                    this.buscarLms();
                    this.showSuccess(data.resposta);
                    this.modalVisualizarLm = false;
                    this.modalEdicaoMaterial = false;
                }
            });
        },

        cadastrarFaturamento() {
            this.lmService.cadastrarLancamentoMaterial(this.form, this.materialSelecionado).then((data) => {
                if (data.status === 200) {
                    this.buscarLms();
                    this.showSuccess(data.resposta);
                    this.modalLancarFaturamento = false;
                    this.modalLancarFaturamento = false;
                    this.form = {};
                } else {
                    this.showError(data.erro);
                }
            });
        },

        buscaChatLm(idLm) {
            this.lmService.buscaChatLm(idLm).then((data) => {
                this.chat = data.chat;
            });
        },

        // Modal de finalização de lm
        confirmEnvio(idLm) {
            this.confirm.require({
                message: `Tem certeza que deseja finalizar essa Lista de Material?`,
                header: 'Lista de Material',
                icon: 'pi pi-info-circle',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Finalizar',
                rejectClass: 'p-button-danger p-button-outlined',
                acceptClass: 'p-button-success',
                accept: () => {
                    this.finalizarListaMaterial(idLm);
                },
                reject: () => {}
            });
        },

        finalizarListaMaterial(idLm) {
            this.lmService.finalizarLm(idLm).then((data) => {
                if (data.status === 200) {
                    this.buscarLms();
                    this.showSuccess(data.resposta);
                } else {
                    this.showError(data.erro);
                }
            });
        },

        abrirModalVisualizarLm(lm) {
            this.modalVisualizarLm = true;
            this.lmSelecionada = lm.id;
            this.materiais = lm.materiais;
        },

        abrirModalFaturamentoItem(lm) {
            this.modalLancarFaturamento = true;
            this.materialSelecionado = lm.id;
        },

        async enviarMensagemLm() {
            this.lmService.enviarMensagemLm(this.novaMensagem, this.lmSelecionada).then((data) => {
                if (data.status === 200) {
                    this.menuLateralChatLms = false;
                    this.showSuccess(data.resposta);
                    this.novaMensagem = '';
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        abrirModalEdicaoMaterial(material) {
            this.materialSelecionado = material.id;
            this.modalEdicaoMaterial = true;
        },

        abrirModalHistoricoLancamentos(material) {
            this.materialSelecionado = material.id;
            this.modalHistoricoLancamentos = true;
            this.listarLancamentos();
        },

        abrirChatMaterial(dados) {
            this.materialSelecionado = dados.id;
            this.buscaChat(dados.id);
            this.menuLateralChat = true;
        },

        abrirChatLm(dados) {
            this.lmSelecionada = dados.id;
            this.buscaChatLm(dados.id);
            this.menuLateralChatLms = true;
        },

        abrirNotaFiscal(data) {
            window.open('http://localhost:8000/storage/' + data.nota, '_blank');
        },

        abrirPedidoCompra(data) {
            window.open('http://localhost:8000/storage/' + data.pedido, '_blank');
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

        formatarDataChat(data) {
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

        verificaStatus(status) {
            switch (status) {
                case 'Novo':
                    return 'success'; // Verde
                case 'Cotação':
                    return 'info'; // Vermelho
                case 'Finalizado':
                    return 'secondary'; // Amarelo
                default:
                    return 'secondary'; // Cinza (para status desconhecidos)
            }
        },

        uploadPdf() {
            this.form.nota = this.$refs.nota.files[0];
        },

        getRowClass(data) {
            return data.quantidade == data.quantidade_entregue ? 'row-complete' : '';
        }
    }
};
</script>

<template>
    <!-- <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div> -->
    <div class="grid">
        <Toast />
        <ConfirmDialog></ConfirmDialog>

        <!-- Histórico de Chat -->
        <!-- Modal Cadastro de Empresa -->
        <Sidebar style="width: 600px" v-model:visible="menuLateralChat" :baseZIndex="1000" position="right">
            <h2 class="text-center">CHAT</h2>
            <div>
                <div class="grid">
                    <div class="col-12">
                        <div class="card timeline-container">
                            <Timeline :value="chat" align="alternate" class="customized-timeline">
                                <template #marker="slotProps">
                                    <span class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" :style="{ backgroundColor: slotProps.item.color }">
                                        <i :class="slotProps.item.icon"></i>
                                    </span>
                                </template>
                                <template #content="slotProps">
                                    <Card>
                                        <template #title>
                                            {{ slotProps.item.usuario }}
                                        </template>
                                        <template #subtitle>
                                            {{ this.formatarDataChat(slotProps.item.data_mensagem) }}
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
                        <Button @click.prevent="enviarMensagem()" label="Enviar" class="mr-2 mt-3 p-button-primary col-12" />
                    </div>
                </div>
            </div>
        </Sidebar>

        <!-- Modal Chat de Lms -->
        <Sidebar style="width: 600px" v-model:visible="menuLateralChatLms" :baseZIndex="1000" position="right">
            <h2 class="text-center">CHAT</h2>
            <div>
                <div class="grid">
                    <div class="col-12">
                        <div class="card timeline-container">
                            <Timeline :value="chat" align="alternate" class="customized-timeline">
                                <template #marker="slotProps">
                                    <span class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" :style="{ backgroundColor: slotProps.item.color }">
                                        <i :class="slotProps.item.icon"></i>
                                    </span>
                                </template>
                                <template #content="slotProps">
                                    <Card>
                                        <template #title>
                                            {{ slotProps.item.usuario }}
                                        </template>
                                        <template #subtitle>
                                            {{ this.formatarDataChat(slotProps.item.data_mensagem) }}
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
                        <Button @click.prevent="enviarMensagemLm()" label="Enviar" class="mr-2 mt-3 p-button-primary col-12" />
                    </div>
                </div>
            </div>
        </Sidebar>

        <!-- Modal para listar todos itens da LM -->
        <Dialog v-model:visible="modalVisualizarLm" maximizable modal header="ITENS" :style="{ width: '80rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex flex-column justify-content-center align-items-center gap-3">
                <DataTable :value="materiais" showGridlines tableStyle="min-width: 50rem" :rowClass="getRowClass">
                    <Column field="id" header="ID"></Column>
                    <Column field="descricao" header="Descrição"></Column>
                    <Column field="unidade" header="Unidade"></Column>
                    <Column field="quantidade" header="Quantidade"></Column>
                    <Column field="quantidade_entregue" header="Quantidade Entregue"></Column>
                    <Column header="Quantidade Pendente">
                        <template #body="slotProps">
                            {{ slotProps.data.quantidade - slotProps.data.quantidade_entregue }}
                        </template>
                    </Column>
                    <Column field="id_pedido" header="Pedido"></Column>
                    <Column header="...">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <!-- <Button icon="pi pi-user" @click.prevent="abrirModalEdicaoMaterial(slotProps.data)" class="p-button-rounded p-button-info" /> -->
                                <Button :disabled="slotProps.data.quantidade == slotProps.data.quantidade_entregue" icon="pi pi-pencil" @click.prevent="abrirModalFaturamentoItem(slotProps.data)" class="p-button-rounded p-button-success" />
                                <Button icon="pi pi-book" @click.prevent="abrirModalHistoricoLancamentos(slotProps.data)" class="p-button-rounded p-button-warning" />
                                <Button icon="pi pi-comments" @click.prevent="abrirChatMaterial(slotProps.data)" class="p-button-rounded p-button-primary" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </Dialog>

        <!-- Modal edição de material -->
        <Dialog v-model:visible="modalEdicaoMaterial" maximizable modal header="ASSOCIAR PEDIDO" :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex flex-column justify-content-center align-items-center gap-3">
                <DataTable :value="pedidos" showGridlines tableStyle="min-width: 50rem">
                    <Column field="id" header="ID"></Column>
                    <Column field="descricao" header="Fornecedor"></Column>
                    <Column field="protheus" header="Protheus"></Column>
                    <Column field="status.status" header="Pedido"></Column>
                    <Column header="...">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-check" @click.prevent="associarMaterialLmPedido(slotProps.data)" class="p-button p-button-info" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </Dialog>

        <!-- Modal edição de material -->
        <Dialog v-model:visible="modalLancarFaturamento" maximizable modal header="CADASTRAR LANÇAMENTO" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="p-fluid formgrid grid">
                <div class="field col-12 md:col-3">
                    <label for="firstname2">Qtd. Entregue <span class="obrigatorio">*</span></label>
                    <InputNumber v-model="form.quantidade_entregue" v-tooltip.top="'Digite a quantidade entregue'" placeholder="Digite..." />
                </div>

                <div class="field col-12 md:col-3">
                    <label for="firstname2">Nº Nota Fiscal <span class="obrigatorio">*</span></label>
                    <InputNumber v-model="form.numero_nota" v-tooltip.top="'Digite o número da nota fiscal'" placeholder="Digite..." />
                </div>

                <div class="field col-12 md:col-3">
                    <label for="firstname2">Data Entrega <span class="obrigatorio">*</span></label>
                    <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione o prazo'" v-model="form.data_entrega" showIcon iconDisplay="input" />
                </div>

                <div class="field col-1 md:col-2">
                    <label for="firstname2">Nota <span class="obrigatorio">*</span></label>
                    <FileUpload chooseLabel="Selecionar" @change="uploadPdf" mode="basic" type="file" ref="nota" name="demo[]" accept=".pdf,.docx" :maxFileSize="999999999"></FileUpload>
                </div>

                <div class="col-12">
                    <Button style="width: 100%" @click.prevent="cadastrarFaturamento()" label="Cadastrar" class="p-button-success" :disabled="!form.quantidade_entregue || !form.numero_nota || !form.data_entrega || !form.nota" />
                </div>
            </div>
        </Dialog>

        <!-- Modal edição de material -->
        <Dialog v-model:visible="modalHistoricoLancamentos" maximizable modal header="LANÇAMENTOS" :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <DataTable :value="lancamentos" showGridlines tableStyle="min-width: 50rem">
                <Column field="id" header="ID"></Column>
                <Column field="quantidade_entregue" header="Qtd. Entregue"></Column>
                <Column field="numero_nota" header="Nº da Nota"></Column>
                <Column field="created_at" header="Dt. Lançamento">
                    <template #body="slotProps">
                        <span>{{ formatarData(slotProps.data.dt_entrega) }}</span>
                    </template>
                </Column>
                <Column field="created_at" header="Nota">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" @click.prevent="abrirNotaFiscal(slotProps.data)" class="p-button-rounded p-button-info" />
                    </template>
                </Column>
                <!-- <Column field="created_at" header="Pedido">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" @click.prevent="abrirPedidoCompra(slotProps.data)" class="p-button-rounded p-button-info" />
                    </template>
                </Column> -->
            </DataTable>
        </Dialog>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div style="margin-top: 10px" class="header-padrao">TODAS LM's <br /></div>
            <DataTable :value="lms" showGridlines tableStyle="min-width: 50rem">
                <Column field="id" header="ID"></Column>
                <Column field="lm" header="LM"></Column>
                <Column field="aplicacao" header="Aplicação"></Column>
                <Column field="empresa" header="Empresa"></Column>
                <Column field="local" header="Local"></Column>
                <Column field="solicitante" header="Solicitante"></Column>
                <Column field="dt_solicitacao" header="Dt. Solicitação">
                    <template #body="slotProps">
                        <span>{{ formatarData(slotProps.data.dt_solicitacao) }}</span>
                    </template>
                </Column>
                <Column field="prazo" header="Prazo Estipulado">
                    <template #body="slotProps">
                        <span>{{ formatarData(slotProps.data.prazo) }}</span>
                    </template>
                </Column>
                <Column field="status" header="Status">
                    <template #body="slotProps">
                        <Badge :value="slotProps.data.status" :severity="verificaStatus(slotProps.data.status)" />
                    </template>
                </Column>
                <Column field="comprador" header="Comprador"></Column>
                <Column header="...">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button icon="pi pi-eye" @click.prevent="abrirModalVisualizarLm(slotProps.data)" class="p-button-rounded p-button-info" />
                            <Button icon="pi pi-comments" @click.prevent="abrirChatLm(slotProps.data)" class="p-button-rounded p-button-secondary" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div class="col-12 lg:col-6">
            <Toast />
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
    max-height: 800px;
    /* Defina a altura máxima desejada */
    overflow-y: auto;
    /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}

.header-padrao {
    background-color: #3b82f6;
    color: white;
    font-weight: 600;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    text-align: center;
}
</style>
