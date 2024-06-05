<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import ChatService from '../../../service/ChatService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            pedidoService: new PedidoService(),
            chatService: new ChatService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            displayChat: ref(false),
            confirm: new useConfirm(),
            currentIndex: 0,
            loading1: ref(null),
            sleep: ref(null),
            mensagemEmival: ref(null),
            pedidos: ref(null),
            pedidosAprovados: [],
            pedidosReprovados: [],
            proximoPedido: ref(null),
            preloading: ref(true),
            display: ref(false),
            displayAcima: ref(false),
            pedidoAcima: ref({}),
            quantidadesPedidos: ref({}),
            pdfsrc: ref(null),
            urlBase: 'https://link.gruporialma.com.br/storage', // Ambiente de Produção
            adobeApiReady: false,
            previewFilePromise: null,
            titleDocumento: '',
            titleChat: '',
            salvarMensagemPedidoStatus: ref(null),
            pedidoSelecionado: {},
            heightVH: window.innerHeight * 0.71
        };
    },

    computed: {
        pdfContainerStyle() {
            return {
                width: '100%',
                height: `${this.heightVH}px`,
                border: 'none'
            };
        }
    },

    mounted: function () {
        if (window.AdobeDC) {
            this.adobeApiReady = true;
        } else {
            document.addEventListener('adobe_dc_view_sdk.ready', () => {
                this.adobeApiReady = true;
            });
        }

        // Metódo responsável por buscar quantidades de pedidos para aprovação
        this.pedidoService.pedidosMonica().then((data) => {
            console.log(data);
            this.pedidos = data.pedidos;
            this.preloading = false;
        });
    },

    watch: {
        adobeApiReady: {
            handler() {
                this.$nextTick(() => {
                    this.renderPdfAcima(`https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf`, `teste.pdf`);
                });
            }
        },
        display(newVal) {
            if (newVal === false) {
                this.currentIndex = 0;
            }
        },
        displayAcima(newVal) {
            if (newVal === false) {
                this.currentIndex = 0;
                this.listarEmivalMaiorMil();
            }
        }
    },

    methods: {
        // Metódo responsável por buscar chat
        chat(id) {
            this.id_pedido = id;
            this.chatService.buscaConversa(id).then((data) => {
                console.log(data);
                this.conversa = data.conversa;
                this.displayChat = true;
            });
        },
        nextPage() {
            this.previewFilePromise.then((adobeViewer) => {
                adobeViewer.getAPIs().then((apis) => {
                    apis.getCurrentPage()
                        .then((currentPage) => apis.gotoLocation(currentPage + 1))
                        .catch((error) => console.error(error));
                });
            });
        },
        previousPage() {
            this.previewFilePromise.then((adobeViewer) => {
                adobeViewer.getAPIs().then((apis) => {
                    apis.getCurrentPage()
                        .then((currentPage) => {
                            if (currentPage > 1) {
                                return apis.gotoLocation(currentPage - 1);
                            }
                        })
                        .catch((error) => console.error(error));
                });
            });
        },
        zoomIn() {
            this.previewFilePromise.then((adobeViewer) => {
                adobeViewer.getAPIs().then((apis) => {
                    apis.getZoomAPIs()
                        .zoomIn()
                        .catch((error) => console.error(error));
                });
            });
        },
        zoomOut() {
            this.previewFilePromise.then((adobeViewer) => {
                adobeViewer.getAPIs().then((apis) => {
                    apis.getZoomAPIs()
                        .zoomOut()
                        .catch((error) => console.error(error));
                });
            });
        },
        renderPdf(url, fileName) {
            if (!this.adobeApiReady) {
                return;
            }
            const previewConfig = {
                defaultViewMode: 'FIT_WIDTH',
                showAnnotationTools: false
            };
            this.$refs.pdfContainer.innerHTML = '';
            let viewer = document.createElement('div');
            viewer.id = 'viewer';
            this.$refs.pdfContainer.appendChild(viewer);
            let adobeDCView = new AdobeDC.View({
                clientId: 'e8c98881c48049bbb03b3c5d5db05129',
                divId: 'viewer'
            });
            this.previewFilePromise = adobeDCView.previewFile(
                {
                    content: {
                        location: {
                            url: url
                        }
                    },
                    metaData: {
                        fileName: fileName,
                        id: fileName
                    }
                },
                { embedMode: 'SIZED_CONTAINER' }
            );
        },
        renderPdfAcima(url, fileName) {
            if (!this.adobeApiReady) {
                return;
            }
            const previewConfig = {
                defaultViewMode: 'FIT_WIDTH',
                showAnnotationTools: false
            };
            this.$refs.pdfContainerAcima.innerHTML = '';
            let vieweracima = document.createElement('div');
            vieweracima.id = 'vieweracima';
            this.$refs.pdfContainerAcima.appendChild(vieweracima);
            let adobeDCView = new AdobeDC.View({
                clientId: 'e8c98881c48049bbb03b3c5d5db05129',
                divId: 'vieweracima'
            });
            this.previewFilePromise = adobeDCView.previewFile(
                {
                    content: {
                        location: {
                            url: url
                        }
                    },
                    metaData: {
                        fileName: fileName,
                        id: fileName
                    }
                },
                previewConfig
            );

            this.zoomOut();
            this.zoomOut();
        },

        // Metódo responsável por aprovar
        aprovar() {
            this.pedidoService.aprovarMonica(this.pedidosAprovados).then((data) => {
                this.display = false;
                this.showSuccess('Pedidos aprovados com sucesso!');
                this.pedidosAprovados = [];

                if (this.pedidos[0].valor <= 500) {
                    this.listarEmivalMenorQuinhentos();
                } else if (this.pedidos[0].valor > 500 && this.pedidos[0].valor < 1000) {
                    this.listarEmivalMenorMil();
                } else {
                    this.listarEmivalMaiorMil();
                }

                console.log(data);
            });
        },

        buscaPedidos() {
            // Metódo responsável por buscar quantidades de pedidos para aprovação
            this.pedidoService.pedidosMonica().then((data) => {
                console.log(data);
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsávle por buscar proximo pedidoAcima
        proximoItemAcima() {
            // Verifica se currentIndex é igual ao comprimento dos pedidos
            if (this.currentIndex === this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
                return;
            }

            // Incrementa currentIndex e verifica se está dentro dos limites do array
            if (this.currentIndex < this.pedidos.length) {
                // Enviando id do pedido
                this.pedidoService.aprovarPedidoUnico(this.pedidoAcima.id).then((data) => {
                    if (data.resposta == 'Pedido aprovado com sucesso!') {
                        this.showSuccess('Pedido aprovado com sucesso!');
                    }

                    this.currentIndex++;

                    if (this.currentIndex < this.pedidos.length) {
                        this.visualizarAcima(this.pedidos[this.currentIndex].id, this.pedidos[this.currentIndex]);
                        localStorage.setItem('ultimoPedidoAprovado', this.currentIndex);
                    } else {
                        this.display = false;
                        this.buscaPedidos();
                    }
                });
            } else {
                // Se currentIndex for igual ao comprimento dos pedidos, não há próximo pedido
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        async reprovarItemAcima() {
            this.chat(this.pedidoSelecionado.id);
            this.titleChat = 'Reprovar Pedido';
            this.salvarMensagemPedidoStatus = 1;
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        async ressalvaItemAcima() {
            this.chat(this.pedidoSelecionado.id);
            this.titleChat = 'Aprovar com Ressalva';
            this.salvarMensagemPedidoStatus = 3;
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        // Abaixo de 1000
        salvaMensagemPedido(status) {
            // this.chat(this.proximoPedido);

            switch (status) {
                case 0: // REPROVAR PEDIDO ABAIXO DE MIL
                    this.pedidoService.aprovarMonica([{ id: this.pedidos[this.currentIndex].id, status: 3, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Pedidos Reprovado com Sucesso!');
                        this.pedidosReprovados = [];

                        this.pedidos.splice(this.currentIndex, 1);

                        if (this.currentIndex < this.pedidos.length) {
                            this.visualizar(1, this.pedidos[this.currentIndex]);
                        } else if (this.pedidos.length > 0) {
                            this.visualizar(1, this.pedidos[this.currentIndex - 1]);
                        } else {
                            this.display = false;
                            this.displayChat = false;

                            if (this.pedidos[0].valor <= 500) {
                                this.listarEmivalMenorQuinhentos();
                            } else if (this.pedidos[0].valor > 500 && this.pedidos[0].valor < 1000) {
                                this.listarEmivalMenorMil();
                            } else {
                                this.listarEmivalMaiorMil();
                            }
                        }

                        this.displayChat = false;
                        this.mensagemEmival = null;
                    });

                    break;
                case 1: // REPROVAR PEDIDO ACIMA DE MIL
                    this.pedidoService.aprovarMonica([{ id: this.pedidos[this.currentIndex].id, status: 3, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Pedidos Reprovado com Sucesso!');
                        this.pedidosReprovados = [];
                        this.pedidos.splice(this.currentIndex, 1);

                        if (this.currentIndex < this.pedidos.length) {
                            this.visualizarAcima(1, this.pedidos[this.currentIndex]);
                        } else if (this.pedidos.length > 0) {
                            this.visualizarAcima(1, this.pedidos[this.currentIndex - 1]);
                        } else {
                            this.displayAcima = false;
                            this.displayChat = false;

                            this.listarEmivalMaiorMil();
                        }

                        this.displayChat = false;
                        this.mensagemEmival = null;
                    });

                    break;
                case 2:
                    this.pedidoService.aprovarMonica([{ id: this.pedidos[this.currentIndex].id, status: 5, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Pedidos Aprovado com Ressalva com Sucesso!');
                        this.pedidosReprovados = [];

                        this.pedidos.splice(this.currentIndex, 1);

                        if (this.currentIndex < this.pedidos.length) {
                            this.visualizar(1, this.pedidos[this.currentIndex]);
                        } else if (this.pedidos.length > 0) {
                            this.visualizar(1, this.pedidos[this.currentIndex - 1]);
                        } else {
                            this.display = false;
                            this.displayChat = false;

                            if (this.pedidos[0].valor <= 500) {
                                this.listarEmivalMenorQuinhentos();
                            } else if (this.pedidos[0].valor > 500 && this.pedidos[0].valor < 1000) {
                                this.listarEmivalMenorMil();
                            } else {
                                this.listarEmivalMaiorMil();
                            }
                        }

                        this.displayChat = false;
                        this.mensagemEmival = null;
                    });
                    break;
                case 3:
                    this.pedidoService.aprovarMonica([{ id: this.pedidos[this.currentIndex].id, status: 5, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Pedidos Aprovado com Ressalva com Sucesso!');
                        this.pedidosReprovados = [];
                        this.pedidos.splice(this.currentIndex, 1);

                        if (this.currentIndex < this.pedidos.length) {
                            this.visualizarAcima(1, this.pedidos[this.currentIndex]);
                        } else if (this.pedidos.length > 0) {
                            this.visualizarAcima(1, this.pedidos[this.currentIndex - 1]);
                        } else {
                            this.displayAcima = false;
                            this.displayChat = false;

                            this.listarEmivalMaiorMil();
                        }

                        this.displayChat = false;
                        this.mensagemEmival = null;
                    });
                    break;
                default:
                    console.log('Status Não Encontrado.');
            }
        },

        salvaMensagemAcima() {
            // this.chat(this.proximoPedido);
        },

        // Metódo responsável por voltar com pedidos acima de 1000
        voltarAcima() {
            if (this.currentIndex == 0) {
                return;
            }

            // Recuperar o pedido anterior
            const pedidoAnterior = this.pedidos[--this.currentIndex];

            // Realizar as operações necessárias com o pedido anterior, como visualização, etc.
            this.visualizarAcima(1, this.pedidos[this.currentIndex]);

            // Atualizar o localStorage com o novo índice
            localStorage.setItem('currentIndex', this.currentIndex);
        },

        visualizarAcima(id, data) {
            this.pedidoSelecionado = data;
            this.titleDocumento = `Visualizando Pedido ${this.currentIndex + 1} de ${this.pedidos.length} Pedidos`;
            console.log(data.anexo);
            this.pedidoAcima = data;
            this.display = true;
            const dataAgora = new Date();
            // this.pdfsrc = ;
            this.$nextTick(() => {
                this.renderPdfAcima(`${this.urlBase}/${data.anexo}?t=${dataAgora.getSeconds()}`, `${dataAgora.getSeconds()}.pdf`);
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

        // Metódo responsável por limpagem de filtros
        limparFiltro() {
            this.buscaPedidos();
            this.showInfo('Filtro removidos com sucesso!');
            this.form = {};
        },

        formattedMessage(message) {
            const nomeUsuario = message.nome_usuario;
            const funcao = message.funcao;
            const dataAssinatura = message.data_assinatura
                ? new Date(message.data_assinatura).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                  })
                : 'Data não disponível';

            const res = `${nomeUsuario} ${funcao} - ${dataAssinatura}`;
            console.log('Formatted Message:', res);
            return res;
        }
    }
};
</script>

<template>
    <div style="z-index: 9999" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>
    <div class="grid">
        <Toast />

        <!-- Visualizar - Abaixo de 1000 reais -->
        <Dialog :header="this.titleDocumento" v-model:visible="display" :style="{ width: '90%' }" :modal="true">
            <div class="grid flex justify-content-center">
                <div class="col-12 md:col-12">
                    <div ref="pdfContainerAcima" :style="pdfContainerStyle"></div>
                </div>
                <div class="col-4 md:col-3">
                    <Button icon="pi pi-times" label="Pedido Anterior" class="p-button-secondary" style="width: 100%; height: 50px" @click.prevent="voltarAcima()" :disabled="this.currentIndex == 0" />
                </div>
                <div class="col-4 md:col-3">
                    <Button icon="pi pi-times" label="Reprovar" class="p-button-danger" style="width: 100%; height: 50px" @click.prevent="reprovarItemAcima()" />
                </div>
                <div class="col-4 md:col-3">
                    <Button icon="pi pi-times" label="Aprovar c/ Ressalva " class="p-button-warning" style="width: 100%; height: 50px" @click.prevent="ressalvaItemAcima()" />
                </div>
                <div class="col-4 md:col-3">
                    <Button
                        icon="pi pi-check"
                        :label="this.currentIndex >= this.pedidos.length - 1 ? 'Aprovar Último Pedido' : 'Próximos Pedidos'"
                        class="p-button-info"
                        style="width: 100%; height: 50px"
                        @click.prevent="proximoItemAcima()"
                        :disabled="this.currentIndex == this.pedidos.length"
                    />
                </div>

                <div v-if="this.pedidosAprovados.length > 0" class="col-12 md:col-12">
                    <Button icon="pi pi-check" label="Finalizar Aprovações" class="p-button-success" style="width: 100%; height: 50px" @click.prevent="aprovar()" />
                </div>
            </div>
        </Dialog>

        <!-- Chat -->
        <Dialog :header="this.titleChat" v-model:visible="displayChat" :style="{ width: '80%' }" :modal="true">
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
                    <InputText class="col-12" type="text" v-model="mensagemEmival" placeholder="Digite a mensagem..." />
                    <Button @click="salvaMensagemPedido(this.salvarMensagemPedidoStatus)" label="Enviar Mensagem" class="mr-2 mt-3 p-button-success col-12" />
                </div>
            </div>
        </Dialog>

        <!-- Tabela com todos pedidos -->
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
                            <h5 for="empresa">Pedidos para Aprovação | Dr. Mônica</h5>
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

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Presidente" header="Presidente" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Presidente</span>
                            Dr. {{ slotProps.data.link.link }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-4">
                                    <Button @click.prevent="visualizarAcima(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
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

.splitter-panel {
    transition: background-color 0.3s ease;
    cursor: pointer;
}

.splitter-panel:hover {
    background-color: rgb(231, 231, 231);
}
</style>
