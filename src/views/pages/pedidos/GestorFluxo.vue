<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import FluxoService from '../../../service/FluxoService';
import ChatService from '../../../service/ChatService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            pedidoService: new PedidoService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            chatService: new ChatService(),
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
            editar: ref(false),
            preloading: ref(true),
            displayFluxo: ref(false),
            displayChat: ref(false),
            display: ref(false),
            urlBase: 'https://api-link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            fluxoPedido: ref(null),
            userLogado: localStorage.getItem('nome'),
            validaExclusaoButton: localStorage.getItem('grupo')
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos com status 6
        this.pedidoService.buscaAnalisando().then((data) => {
            if (this.userLogado == 'Soleni' || this.userLogado == 'Eduardo C. Resplandes') {
                this.pedidos = data.pedidos;
            } else {
                this.pedidos = data.pedidos;
                this.pedidos = this.pedidos.filter((pedido) => pedido.criador !== 'DP');
            }

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
        // Metódo responsável por buscar todos pedidos com status 6
        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.buscaAnalisando().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por aprovar fluxo
        aprovarFluxo() {
            this.fluxoService.aprovarFluxo(this.idPedido).then((data) => {
                if (data.resposta == 'Fluxo aprovado com sucesso!') {
                    this.showSuccess('Fluxo aprovado com sucesso!');
                    this.preloading = true;
                    this.display = false;
                    this.displayFluxo = false;
                    this.buscaPedidos();
                } else {
                    this.showError('Ocorreu um erro, entre em contato com o Administrador!');
                }
            });
        },

        // Metódo responsável por enviar mensagem para Dr Emival ou Dr. Monica
        enviarMensagem() {
            this.preloading = true;
            this.fluxoService.reprovar(this.form, this.idPedido).then((data) => {
                if (data.resposta == 'Pedido reprovado com sucesso!') {
                    this.showSuccess('Pedido reprovado com sucesso!');
                    this.display = false;
                    this.displayChat = false;
                    this.displayFluxo = false;
                    this.form = {};
                }
                this.buscaPedidos();
                this.preloading = false;
            });
        },

        // Metódo responsável por reprovar fluxo
        reprovarFluxo() {
            this.chatService.buscaConversa(this.idPedido).then((data) => {
                this.conversa = data.conversa;
                this.displayChat = true;
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
        visualizar(id, anexo) {
            this.idPedido = id;
            this.display = true;
            this.pdf = anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
        },

        fluxo(id, data) {
            this.idPedido = id;

            this.chatService.buscaConversa(this.idPedido).then((data) => {
                this.conversa = data.conversa;
            });

            this.fluxoService.buscaFluxo(id).then((data) => {
                if (data.resposta == 'Fluxo listado com sucesso!') {
                    this.fluxoPedido = data.fluxo;
                    this.displayFluxo = true;
                }
            });
        },

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
        },

        showSuccess(mensagem) {
            this.toast.add({ severity: 'success', summary: 'Sucesso!', detail: mensagem, life: 3000 });
        },

        showInfo(mensagem) {
            this.toast.add({ severity: 'info', summary: 'Aviso!', detail: mensagem, life: 3000 });
        },

        showError(mensagem) {
            this.toast.add({ severity: 'error', summary: 'Ocorreu um erro!', detail: mensagem, life: 3000 });
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
            <Button @click.prevent="fluxo(this.idPedido)" label="Tomada de Ação" class="mr-2 mb-2 p-button-info col-12" />

            <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
        </Dialog>

        <!-- Fluxo -->
        <Dialog header="" v-model:visible="displayFluxo" :style="{ width: '70%' }" :modal="true">
            <div class="grid">
                <div class="col-6">
                    <div class="card timeline-container">
                        <h3>Chat</h3>
                        <div>
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
                                            {{ slotProps.item.data_mensagem }}
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
                        <InputText class="col-12" type="text" v-model="form.mensagem" placeholder="Digite a mensagem..." />
                        <Button @click.prevent="enviarMensagem()" label="Reprovar e enviar mensagem" class="mr-2 mt-3 p-button-danger col-12" />
                    </div>
                </div>

                <div class="col-6">
                    <div class="card timeline-container">
                        <h3>Fluxo</h3>
                        <Timeline :value="fluxoPedido" align="alternate" class="customized-timeline">
                            <template #marker="slotProps">
                                <span class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" :style="{ backgroundColor: slotProps.item.color }">
                                    <i :class="slotProps.item.icon"></i>
                                </span>
                            </template>
                            <template #content="slotProps">
                                <Card>
                                    <template #title>
                                        {{ slotProps.item.usuario.name }}
                                    </template>
                                    <template #subtitle>
                                        {{ slotProps.item.usuario.funcao.funcao }}
                                    </template>
                                </Card>
                            </template>
                        </Timeline>
                    </div>
                    <Button @click.prevent="aprovarFluxo()" label="Aprovar" class="mr-2 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div class="header-padrao">ANÁLISE DE FLUXO</div>

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

                    <Column field="" header="" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Categoria</span>
                            <Tag v-if="slotProps.data.urgente == 1" class="mr-2" severity="danger" value="Urgente"></Tag>
                            <Tag v-else class="mr-2" severity="info" value="Normal"></Tag>
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ this.formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Protheus" header="Protheus" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Protheus</span>
                            {{ slotProps.data.protheus }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Fornecedor" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Valor</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Local" header="Local" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Local</span>
                            {{ slotProps.data.local }}
                        </template>
                    </Column>

                    <Column field="Criador" header="Criador" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Criador</span>
                            {{ slotProps.data.criador }}
                        </template>
                    </Column>

                    <Column field="Link" header="Link" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Link</span>
                            {{ slotProps.data.link }}
                        </template>
                    </Column>

                    <Column field="Tipo Pedido" header="Tipo Pedido" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Tipo Pedido</span>
                            {{ slotProps.data.tipo_pedido }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-">
                                    <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data.anexo)" icon="pi pi-eye" class="p-button-secondary" />
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column v-if="this.validaExclusaoButton == 'Administrador'" field="Urgente" header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-1 mr-6">
                                    <Button @click.prevent="urgente(slotProps.data.id)" label="Urgente" class="p-button-danger" />
                                </div>
                                <div class="col-4 md:col-1 ml-6">
                                    <Button @click.prevent="normal(slotProps.data.id)" label="Normal" class="p-button-info" />
                                </div>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
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
    max-height: 700px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
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
