<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import LmService from '../../../../service/LmService';

export default {
    data() {
        return {
            toast: new useToast(),
            confirm: new useConfirm(),
            lmService: new LmService(),
            displayConfirmation: ref(false),
            lms: ref(null),
            informacoes: ref(null),
            lancamentos: ref(null),
            compradores: ref(null),
            chat: ref(null),
            novaMensagem: ref(null),
            materialSelecionado: ref(null),
            menuLateralChat: ref(null),
            menuLateralChatLms: ref(null),
            materiais: ref(null),
            preloading: ref(true),
            lmSelecionada: ref(null),
            compradorSelecionado: ref(null),
            modalAssociarComprador: ref(null),
            modalHistoricoLancamentos: ref(null),
            modalVisualizarLm: ref(null)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas LM
        this.lmService.buscaLms().then((data) => {
            this.lms = data.lm;
            this.informacoes = data.informacoes;
        });

        // Metódo responsável por buscar todos os compradores
        this.lmService.listarCompradores().then((data) => {
            this.compradores = data.compradores;
        });

        this.preloading = false;
    },

    methods: {
        // Metódo responsável por buscar lms
        async buscarLms() {
            this.lmService.buscaLms().then((data) => {
                this.lms = data.lm;
                this.informacoes = data.informacoes;
            });
        },

        abrirModalAssociarComprador(id_lm) {
            this.modalAssociarComprador = true;
            this.lmSelecionada = id_lm;
        },

        abrirModalVisualizarLm(lm) {
            this.modalVisualizarLm = true;
            this.materiais = lm.materiais;
        },

        buscaChat(idMaterial) {
            this.lmService.buscaChat(idMaterial).then((data) => {
                this.chat = data.chat;
            });
        },

        buscaChatLm(idLm) {
            this.lmService.buscaChatLm(idLm).then((data) => {
                this.chat = data.chat;
            });
        },

        abrirNotaFiscal(data) {
            window.open('http://localhost:8000/storage/' + data.nota, '_blank');
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

        associarComprador() {
            this.lmService.associarComprador(this.lmSelecionada, this.compradorSelecionado.id).then((data) => {
                if (data.status === 200) {
                    this.buscarLms();
                    this.showSuccess(data.resposta);
                    this.modalAssociarComprador = false;
                }
            });
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

        abrirModalHistoricoLancamentos(material) {
            this.materialSelecionado = material.id;
            this.modalHistoricoLancamentos = true;
            this.listarLancamentos();
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

        getBadgeClass(id) {
            switch (id) {
                case 1:
                    return 'p-badge p-badge-info'; // Badge azul para "Solicitado"
                case 2:
                    return 'p-badge p-badge-warning'; // Badge amarelo para "Aguardando"
                case 3:
                    return 'p-badge p-badge-success'; // Badge verde para "Processo de Compra"
                case 4:
                    return 'p-badge p-badge-danger'; // Badge vermelho para "Finalizada"
                default:
                    return 'p-badge p-badge-secondary'; // Badge cinza para outros casos
            }
        },

        getStatusName(id) {
            switch (id) {
                case 1:
                    return 'Aguardando';
                case 2:
                    return 'Cotação';
                case 3:
                    return 'Analisando';
                case 4:
                    return 'Link';
                case 5:
                    return 'Autorizado';
                case 6:
                    return 'Pedido Enviado';
                case 7:
                    return 'Entrega Parcial';
                case 8:
                    return 'Entrega Finalizada';
                default:
                    return 'Status Desconhecido'; // Caso não exista o id
            }
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
        <ConfirmDialog></ConfirmDialog>

        <!-- Modal Chat de Materias -->
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

        <!-- Modal para associar comprador a LM -->
        <Dialog v-model:visible="modalAssociarComprador" maximizable modal header="Associar Comprador" :style="{ width: '25rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex flex-column justify-content-center align-items-center gap-3">
                <Dropdown id="Comprador" v-model="compradorSelecionado" :options="compradores" optionLabel="name" placeholder="Selecione..."></Dropdown>
                <Button @click.prevent="associarComprador()" type="submit" severity="secondary" label="ASSOCIAR" />
            </div>
        </Dialog>

        <!-- Modal para listar todos itens da LM -->
        <Dialog v-model:visible="modalVisualizarLm" maximizable modal header="ITENS" :style="{ width: '100rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex flex-column justify-content-center align-items-center gap-3">
                <DataTable :value="materiais" showGridlines tableStyle="min-width: 50rem">
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
                    <Column header="Status">
                        <template #body="slotProps">
                            <span :class="getBadgeClass(slotProps.data.id_status)">
                                {{ getStatusName(slotProps.data.id_status) }}
                            </span>
                        </template>
                    </Column>
                    <Column field="id_pedido" header="Pedido"></Column>
                    <Column header="...">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-comments" @click.prevent="abrirChatMaterial(slotProps.data)" class="p-button-rounded p-button-primary" />
                                <Button icon="pi pi-book" @click.prevent="abrirModalHistoricoLancamentos(slotProps.data)" class="p-button-rounded p-button-warning" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </Dialog>

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

        <!-- Tabela com todos lms -->
        <div class="col-12">
            <div style="margin-top: 10px" class="header-padrao">TODAS LM's <br /></div>
            <DataTable :value="lms" showGridlines tableStyle="min-width: 50rem">
                <Column field="lm" header="LM"></Column>
                <Column field="aplicacao" header="Aplicação"></Column>
                <Column field="local" header="Local"></Column>
                <Column field="empresa" header="Empresa"></Column>
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
                            <Button icon="pi pi-pencil" @click.prevent="abrirModalAssociarComprador(slotProps.data.id)" class="p-button-rounded p-button-success" @click="editar(slotProps.data)" />
                            <Button icon="pi pi-eye" @click.prevent="abrirModalVisualizarLm(slotProps.data)" class="p-button-rounded p-button-info" />
                            <Button icon="pi pi-comments" @click.prevent="abrirChatLm(slotProps.data)" class="p-button-rounded p-button-secondary" />
                            <!-- <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deletar(slotProps.data)" /> -->
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
    max-height: 300px;
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
