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
            pedidoService: new PedidoService(),
            chatService: new ChatService(),
            displayChat: ref(false),
            confirm: new useConfirm(),
            currentIndex: 0,
            displayChat2: ref(false),
            displayChat3: ref(false),
            loading1: ref(null),
            pedidosPendentes: ref(null),
            sleep: ref(null),
            mensagemEmival: ref(null),
            pedidos: ref(null),
            pedidosAprovados: [],
            pedidosReprovados: [],
            quantidade_mensagens: ref(null),
            proximoPedido: ref(null),
            preloading: ref(true),
            ocultaFiltros: ref(false),
            displayAuditoria: ref(false),
            acimaMil: ref(false),
            display: ref(false),
            displayAcima: ref(false),
            displayPendentes: ref(false),
            pedidoAcima: ref({}),
            quantidadesPedidos: ref({}),
            form: ref({}),
            pdfsrc: ref(null),
            urlBase: 'https://api-link.gruporialma.com.br/storage',
            // urlBase: 'http://localhost:8000/storage',
            adobeApiReady: false,
            previewFilePromise: null,
            titleDocumento: '',
            titleChat: '',
            salvarMensagemPedidoStatus: ref(null),
            pedidoSelecionado: {}
        };
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
        this.pedidoService.buscaQuantidades().then((data) => {
            this.quantidadesPedidos = data.quantidades;
            this.preloading = false;
        });
    },
    created() {
        // Método responsável por buscar quantidades de pedidos para aprovação
        this.pedidoService
            .buscaQuantidades()
            .then((data) => {
                this.quantidadesPedidos = data.quantidades;
                this.preloading = false;
            })
            .catch((error) => {
                console.error('Error fetching quantities:', error);
                this.preloading = false;
            });
    },

    watch: {
        adobeApiReady: {
            handler() {
                this.$nextTick(() => {
                    this.renderPdf(`https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf`, `teste.pdf`);
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
                this.conversa = data.conversa;
                this.displayChat = true;

                this.$nextTick(function () {
                    var container = this.$refs.msgContainer;
                    container.scrollTop = container.scrollHeight + 120;
                });
            });
        },

        auditoria(data) {
            this.form.emissao = this.formatarData(data.nota[0].dt_emissao);
            this.form.dt_inclusao = this.formatarData(data.dt_inclusao);
            this.form.comprador = data.criador;
            this.displayAuditoria = true;
        },

        // Metódo responsável por buscar chat
        chatAcima(id) {
            this.id_pedido = id;
            this.chatService.buscaConversa(id).then((data) => {
                this.conversa = data.conversa;
                this.displayChat2 = true;

                this.$nextTick(function () {
                    var container = this.$refs.msgContainer;
                    container.scrollTop = container.scrollHeight + 120;
                });
            });
        },

        chatPendente(id) {
            this.id_pedido = id;
            this.chatService.buscaConversa(id).then((data) => {
                this.conversa = data.conversa;
                this.displayChat3 = true;

                this.$nextTick(function () {
                    var container = this.$refs.msgContainer;
                    container.scrollTop = container.scrollHeight + 120;
                });
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
                { embedMode: 'SIZED_CONTAINER' }
            );
        },

        renderPdfPendente(url, fileName) {
            if (!this.adobeApiReady) {
                return;
            }

            const previewConfig = {
                defaultViewMode: 'FIT_WIDTH',
                showAnnotationTools: false
            };
            this.$refs.pdfContainerPendente.innerHTML = '';
            let vieweracima = document.createElement('div');
            vieweracima.id = 'vieweracima';
            this.$refs.pdfContainerPendente.appendChild(vieweracima);
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
                { embedMode: 'SIZED_CONTAINER' }
            );
        },
        buscaQuantidades() {
            this.pedidosPendentes = false;
            this.pedidoService.buscaQuantidades().then((data) => {
                this.quantidadesPedidos = data.quantidades;
                this.preloading = false;
            });
        },

        // Metódo responsável por listagem de pedidos
        listarEmivalMenorQuinhentos() {
            this.preloading = true;
            this.acimaMil = false;
            this.pedidoService.listarEmivalMenorQuinhentos().then((data) => {
                this.pedidos = data.pedidos;
                this.ocultaFiltros = true;
                this.preloading = false;
            });
        },

        // Metódo responsável por listagem de pedidos
        listarEmivalMenorMil() {
            this.preloading = true;
            this.acimaMil = false;
            this.pedidoService.listarEmivalMenorMil().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
                this.ocultaFiltros = true;
            });
        },
        // Metódo responsável por listagem de pedidos
        listarEmivalMaiorMil() {
            this.acimaMil = true;
            this.preloading = true;
            this.pedidoService.listarEmivalMaiorMil().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
                this.ocultaFiltros = true;
            });
        },

        // Metódo responsável por listagem de pedidos pendentes
        listarPedidosPendentesEmival() {
            this.preloading = true;
            this.acimaMil = 'pendentes';
            this.pedidoService.listarPedidosPendentesEmival().then((data) => {
                this.pedidosPendentes = data.pedidos;
                this.preloading = false;
                this.ocultaFiltros = true;
            });
        },

        // Metódo responsável por aprovar
        aprovar() {
            this.pedidoService.aprovarEmival(this.pedidosAprovados).then((data) => {
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
            });
        },

        // Metódo responsávle por buscar proximo pedido
        proximoItem() {
            this.displayChat = false;
            // Verifica se currentIndex é igual ao comprimento dos pedidos
            if (this.currentIndex === this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
                this.aprovar();
                return;
            }

            // Incrementa currentIndex e verifica se está dentro dos limites do array
            if (this.currentIndex < this.pedidos.length) {
                this.pedidosAprovados.push({ id: this.pedidos[this.currentIndex].id, status: 4 });

                this.currentIndex++;

                if (this.currentIndex < this.pedidos.length) {
                    this.visualizar(this.pedidos[this.currentIndex].id, this.pedidos[this.currentIndex]);
                    localStorage.setItem('ultimoPedidoAprovado', this.currentIndex);
                }

                if (this.currentIndex == this.pedidos.length) {
                    this.visualizar(1, this.pedidos[this.currentIndex - 1]);
                    localStorage.setItem('ultimoPedidoAprovado', this.currentIndex);
                }
            } else {
                // Se currentIndex for igual ao comprimento dos pedidos, não há próximo pedido
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        // Metódo responsávle por buscar proximo pedidoAcima
        proximoItemAcima() {
            this.displayChat2 = false;
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
                        this.listarEmivalMaiorMil();
                        this.displayAcima = false;
                    }
                });
            } else {
                // Se currentIndex for igual ao comprimento dos pedidos, não há próximo pedido
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        finalizarConversa() {
            this.displayChat = false;
            // Verifica se currentIndex é igual ao comprimento dos pedidos
            if (this.currentIndex === this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
                this.display = false;
                this.listarEmivalMenorMil();
                this.listarEmivalMenorQuinhentos();
                return;
            }

            // Incrementa currentIndex e verifica se está dentro dos limites do array
            if (this.currentIndex < this.pedidos.length) {
                // Enviando id do pedido
                this.pedidoService.aprovarPedidoUnico(this.pedidoSelecionado.id).then((data) => {
                    if (data.resposta == 'Pedido aprovado com sucesso') {
                        this.showSuccess('Pedido aprovado com sucesso');
                    }

                    this.currentIndex++;

                    if (this.currentIndex < this.pedidos.length) {
                        this.visualizar(this.pedidos[this.currentIndex].id, this.pedidos[this.currentIndex]);
                        localStorage.setItem('ultimoPedidoAprovado', this.currentIndex);
                    }
                });
            } else {
                // Se currentIndex for igual ao comprimento dos pedidos, não há próximo pedido
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        async reprovarItem() {
            this.chat(this.pedidoSelecionado.id);
            this.titleChat = 'Reprovar Pedido';
            this.salvarMensagemPedidoStatus = 0;
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidos.length) {
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

        async ressalvaItem() {
            this.chat(this.pedidoSelecionado.id);
            this.salvarMensagemPedidoStatus = 2;
            this.titleChat = 'Aprovar com Ressalva';
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        async mensagemItem() {
            this.chat(this.pedidoSelecionado.id);
            this.salvarMensagemPedidoStatus = 25;
            this.titleChat = 'Mensagem';
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        async ressalvaItemAcima() {
            this.chatAcima(this.pedidoSelecionado.id);
            this.titleChat = 'Aprovar com Ressalva';
            this.salvarMensagemPedidoStatus = 3;
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        async mensagemItemAcima() {
            this.chatAcima(this.pedidoSelecionado.id);
            this.titleChat = 'Mensagem';
            this.salvarMensagemPedidoStatus = 24;
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        async mensagemPendente() {
            this.chatPendente(this.pedidoSelecionado.id);
            this.titleChat = 'Mensagem';
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidosPendentes.length) {
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },


        // Acima de 1000
        salvaMensagemPedido(status) {
            switch (status) {
                case 0: // REPROVAR PEDIDO ABAIXO DE MIL
                    this.pedidoService.aprovarEmival([{ id: this.pedidos[this.currentIndex].id, status: 3, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Pedidos Reprovado com Sucesso!');
                        this.pedidosReprovados = [];
                        this.mensagemEmival = '';

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
                    this.pedidoService.aprovarEmival([{ id: this.pedidos[this.currentIndex].id, status: 3, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Pedidos Reprovado com Sucesso!');
                        this.pedidosReprovados = [];
                        this.pedidos.splice(this.currentIndex, 1);
                        this.mensagemEmival = '';

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
                    this.pedidoService.aprovarEmival([{ id: this.pedidos[this.currentIndex].id, status: 5, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Pedidos Aprovado com Ressalva com Sucesso!');
                        this.pedidosReprovados = [];
                        this.mensagemEmival = '';

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
                    this.displayChat2 = false;
                    this.pedidoService.aprovarEmival([{ id: this.pedidos[this.currentIndex].id, status: 5, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Pedidos Aprovado com Ressalva com Sucesso!');
                        this.displayChat = false;
                        this.pedidosReprovados = [];
                        this.pedidos.splice(this.currentIndex, 1);
                        this.mensagemEmival = '';

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
                case 24: // Enviar mensagem para pedido acima de 1000
                    this.displayChat2 = false;
                    this.pedidoService.mensagemPedidoUnico([{ id: this.pedidoSelecionado.id, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Mensagem enviada com sucesso!');
                        this.displayChat = false;
                        this.pedidosReprovados = [];
                        this.pedidos.splice(this.currentIndex, 1);
                        this.mensagemEmival = '';

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
                case 25: // Enviar mensagem para pedido abaixo de 1000
                    this.pedidoService.aprovarEmival([{ id: this.pedidoSelecionado.id, status: 24, mensagem: this.mensagemEmival }]).then((data) => {
                        this.showSuccess('Mensagem enviada com succeso!');
                        this.mensagemEmival = '';

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
                default:
            }
        },

        // Abaixo de 1000
        salvaMensagem() {
            // this.chat(this.proximoPedido);

            this.proximoPedido = this.pedidos[this.currentIndex];
            // this.pedidosReprovados.push({ id: this.proximoPedido.id, status: 3, mensagem: this.mensagemEmival });
            this.pedidoService.aprovarEmival([{ id: this.proximoPedido.id, status: 3, mensagem: this.mensagemEmival }]).then((data) => {
                this.showSuccess('Pedidos Reprovado com Sucesso!');
                this.pedidosReprovados = [];
            });

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
            // Agora você pode chamar a função visualizar para exibir o próximo PDF
            this.displayChat = false;
            this.mensagemEmival = null;
        },

        salvaMensagemAcima() {
            // this.chat(this.proximoPedido);
        },

        // Metódo responsável por voltar com pedidos abaixo de 1000
        voltar() {
            if (this.currentIndex == 0) {
                return;
            }

            // Remover o último item do array pedidosAprovados
            this.pedidosAprovados.pop();

            // Recuperar o pedido anterior
            const pedidoAnterior = this.pedidos[--this.currentIndex];

            // Realizar as operações necessárias com o pedido anterior, como visualização, etc.
            this.visualizar(pedidoAnterior.id, this.pedidos[this.currentIndex]);

            // Atualizar o localStorage com o novo índice
            localStorage.setItem('currentIndex', this.currentIndex);
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

        // Metódo responsável por visualizar pdf
        visualizar(id, data) {
            if (!this.display) {
                this.pedidosAprovados = [];
            }
            this.pedidoSelecionado = data;
            this.quantidade_mensagens = data.quantidade_mensagens;
            this.titleDocumento = `Pedidos Aprovados ${this.pedidosAprovados.length} de ${this.pedidos.length} Pedidos`;
            this.display = true;
            const dataAgora = new Date();
            this.pedidoSelecionado = data;
            this.$nextTick(() => {
                this.renderPdf(`${this.urlBase}/${data.anexo}?t=${dataAgora.getSeconds()}`, `${dataAgora.getSeconds()}.pdf`);
            });
        },

        visualizarAcima(id, data) {
            this.quantidade_mensagens = data.quantidade_mensagens;
            this.pedidoSelecionado = data;
            this.titleDocumento = `Visualizando Pedido ${this.currentIndex + 1} de ${this.pedidos.length} Pedidos`;
            this.pedidoAcima = data;
            this.displayAcima = true;
            const dataAgora = new Date();
            this.$nextTick(() => {
                this.renderPdfAcima(`${this.urlBase}/${data.anexo}?t=${dataAgora.getSeconds()}`, `${dataAgora.getSeconds()}.pdf`);
            });
        },

        visualizarPendentes(id, data) {
            this.quantidade_mensagens = data.quantidade_mensagens;
            this.pedidoSelecionado = data;
            this.titleDocumento = `Visualizando Pedido ${this.currentIndex + 1} de ${this.pedidosPendentes.length} Pedidos`;
            this.pedidoAcima = data;
            this.displayPendentes = true;
            const dataAgora = new Date();
            this.$nextTick(() => {
                this.renderPdfPendente(`${this.urlBase}/${data.anexo}?t=${dataAgora.getSeconds()}`, `${dataAgora.getSeconds()}.pdf`);
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
            return res;
        },

        cobrarResposta() {
            this.pedidoService.cobrarResposta(this.pedidoSelecionado.id, this.mensagemEmival).then((data) => {
                this.displayChat3 = false;
                this.showSuccess('Resposta cobrada com sucesso!');

                this.pedidosPendentes.splice(this.currentIndex, 1);
                this.mensagemEmival = '';

                if (this.pedidosPendentes.length > 0) {
                    // Ajusta o currentIndex se necessário
                    if (this.currentIndex >= this.pedidosPendentes.length) {
                        this.currentIndex = this.pedidosPendentes.length - 1;
                    }

                    const proximoPedido = this.pedidosPendentes[this.currentIndex];
                    this.visualizarPendentes(proximoPedido.id, proximoPedido);
                } else {
                    this.listarPedidosPendentesEmival();
                    this.displayPendentes = false;
                    this.displayChat3 = false;
                }
            });
        },

        finalizarPendencia() {
            this.pedidoService.finalizarPendencia(this.pedidoSelecionado.id).then((data) => {
                this.displayChat3 = false;
                this.showSuccess('Pendência finalizada com sucesso!');

                this.pedidosPendentes.splice(this.currentIndex, 1);
                this.mensagemEmival = '';

                if (this.pedidosPendentes.length > 0) {
                    // Ajusta o currentIndex se necessário
                    if (this.currentIndex >= this.pedidosPendentes.length) {
                        this.currentIndex = this.pedidosPendentes.length - 1;
                    }

                    const proximoPedido = this.pedidosPendentes[this.currentIndex];
                    this.visualizarPendentes(proximoPedido.id, proximoPedido);
                } else {
                    this.listarPedidosPendentesEmival();
                    this.displayPendentes = false;
                    this.displayChat3 = false;
                }
            });
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>

    <Button v-if="this.pedidos != null || this.pedidosPendentes != null" label="Voltar" class="p-button-secondary"
        style="width: 20%" @click="(this.ocultaFiltros = false), (this.pedidos = null), buscaQuantidades()" />

    <div v-if="this.ocultaFiltros == false" class="grid text-center">
        <div class="col-12">
            <Splitter style="height: 300px">
                <SplitterPanel @click.prevent="listarEmivalMenorQuinhentos()"
                    class="flex align-items-center justify-content-center splitter-panel">
                    <div>
                        Total de pedidos com valor até R$ 500,00
                        <br />
                        <h3>{{ this.quantidadesPedidos.qtd_abaixoQuinhentos }} pedidos</h3>
                    </div>
                </SplitterPanel>
                <SplitterPanel @click.prevent="listarEmivalMenorMil()"
                    class="flex align-items-center justify-content-center splitter-panel">
                    <div>
                        Total de pedidos com valor de R$ 500,01 à R$ 1000,00
                        <br />
                        <h3>{{ this.quantidadesPedidos.qtd_abaixoMil }} pedidos</h3>
                    </div>
                </SplitterPanel>
                <SplitterPanel @click.prevent="listarEmivalMaiorMil()"
                    class="flex align-items-center justify-content-center splitter-panel">
                    <div>
                        Total de pedidos com o valor acima de R$ 1000,00
                        <br />
                        <h3>{{ this.quantidadesPedidos.qtd_acimaMil }} pedidos</h3>
                    </div>
                </SplitterPanel>
            </Splitter>
        </div>
        <div class="col-12">
            <Splitter style="height: 300px">
                <SplitterPanel @click.prevent="listarPedidosPendentesEmival()"
                    class="flex align-items-center justify-content-center splitter-panel">
                    <div>
                        Total de pedidos aprovados com ressalva
                        <br />
                        <h3>{{ this.quantidadesPedidos.qtd_pendentes }} pedidos</h3>
                    </div>
                </SplitterPanel>
            </Splitter>
        </div>
    </div>

    <!-- Chat -->
    <Dialog :header="this.titleChat" v-model:visible="displayChat" :style="{ width: '80%' }" :modal="true">
        <div class="grid">
            <div class="col-12">
                <div class="card timeline-container" ref="msgContainer">
                    <Timeline :value="conversa" align="alternate" class="customized-timeline">
                        <template #marker="slotProps">
                            <span
                                class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2"
                                :style="{ backgroundColor: slotProps.item.color }">
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
                <Button @click="salvaMensagemPedido(this.salvarMensagemPedidoStatus)" label="Enviar Mensagem"
                    class="mr-2 mt-3 p-button-success col-12" />
            </div>
        </div>
    </Dialog>

    <!-- Chat 2 -->
    <Dialog :header="this.titleChat" v-model:visible="displayChat2" :style="{ width: '80%' }" :modal="true">
        <div class="grid">
            <div class="col-12">
                <div class="card timeline-container" ref="msgContainer">
                    <Timeline :value="conversa" align="alternate" class="customized-timeline">
                        <template #marker="slotProps">
                            <span
                                class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2"
                                :style="{ backgroundColor: slotProps.item.color }">
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
                <Button @click="salvaMensagemPedido(this.salvarMensagemPedidoStatus)" label="Enviar Mensagem"
                    class="mr-2 mt-3 p-button-success col-12" />
            </div>
        </div>
    </Dialog>

    <!-- Chat 3 -->
    <Dialog :header="this.titleChat" v-model:visible="displayChat3" :style="{ width: '80%' }" :modal="true">
        <div class="grid">
            <div class="col-12">
                <div class="card timeline-container" ref="msgContainer">
                    <Timeline :value="conversa" align="alternate" class="customized-timeline">
                        <template #marker="slotProps">
                            <span
                                class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2"
                                :style="{ backgroundColor: slotProps.item.color }">
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
                <Button @click="cobrarResposta()" label="Enviar Mensagem" class="mr-2 mt-3 p-button-success col-12" />
                <Button @click="finalizarPendencia()" label="Finalizar Pendência"
                    class="mr-2 mt-3 p-button-info col-12" />
            </div>
        </div>
    </Dialog>

    <!-- Visualizar - Abaixo de 1000 reais -->
    <Dialog :header="this.titleDocumento" v-model:visible="display" :style="{ width: '98%' }" :modal="true">
        <div class="flex align-items-center justify-content-start">
            <label for="buttondisplay" class="font-bold block mb-2">Autorizações: </label>
            <div v-for="(message, index) in this.pedidoSelecionado.assinados" :key="index">
                <InlineMessage class="m-2" severity="success">
                    {{ formattedMessage(message) }}
                </InlineMessage>
            </div>
            <div class="ml-auto mb-3">
                <Button @click.prevent="mensagemItem()" class="align-auto" type="button" label="Chat"
                    icon="pi pi-comments" :badge="this.quantidade_mensagens" />
            </div>
        </div>
        <div class="grid flex justify-content-center">
            <div class="col-12 md:col-12">
                <div ref="pdfContainer" style="width: 100%; height: 700px; border: none"></div>
            </div>
            <div class="col-4 md:col-3">
                <Button icon="pi pi-times" label="Pedido Anterior" class="p-button-secondary"
                    style="width: 100%; height: 50px" @click.prevent="voltar()" :disabled="this.currentIndex == 0" />
            </div>
            <div class="col-4 md:col-3">
                <Button icon="pi pi-times" label="Reprovar" class="p-button-danger" style="width: 100%; height: 50px"
                    @click.prevent="reprovarItem()" />
            </div>
            <div class="col-4 md:col-3">
                <Button icon="pi pi-times" label="Aprovar c/ Ressalva" class="p-button-warning"
                    style="width: 100%; height: 50px" @click.prevent="ressalvaItem()" />
            </div>
            <div class="col-4 md:col-3">
                <Button icon="pi pi-check"
                    :label="this.currentIndex >= this.pedidos.length - 1 ? 'Aprovar Último Pedido' : 'Próximo Pedido'"
                    class="p-button-info" style="width: 100%; height: 50px" @click.prevent="proximoItem()"
                    :disabled="this.currentIndex == this.pedidos.length" />
            </div>

            <div v-if="this.pedidosAprovados.length > 0" class="col-12 md:col-12">
                <Button icon="pi pi-check" label="Finalizar Aprovações" class="p-button-success"
                    style="width: 100%; height: 50px" @click.prevent="aprovar()" />
            </div>
        </div>
    </Dialog>

    <!-- Visualizar - Acima de 1000 reais -->
    <Dialog :header="this.titleDocumento" v-model:visible="displayAcima" :style="{ width: '95%' }" :modal="true">
        <div class="flex align-items-center justify-content-start">
            <label for="buttondisplay" class="font-bold block mb-2">Autorizações: </label>
            <div v-for="(message, index) in this.pedidoSelecionado.assinados" :key="index">
                <InlineMessage class="m-2" severity="success">
                    {{ formattedMessage(message) }}
                </InlineMessage>
            </div>
            <div class="ml-auto mb-3">
                <Button @click.prevent="mensagemItemAcima()" class="align-auto" type="button" label="Chat"
                    icon="pi pi-comments" :badge="this.quantidade_mensagens" />
            </div>
        </div>

        <div class="grid justify-content-center">
            <div class="col-12 md:col-12">
                <div ref="pdfContainerAcima" style="width: 100%; height: 750px; border: none"></div>
            </div>
            <div class="col-4 md:col-3">
                <Button icon="pi pi-times" label="Pedido Anterior" class="p-button-secondary"
                    style="width: 100%; height: 50px" @click.prevent="voltarAcima()"
                    :disabled="this.currentIndex == 0" />
            </div>
            <div class="col-4 md:col-3">
                <Button icon="pi pi-times" label="Reprovar" class="p-button-danger" style="width: 100%; height: 50px"
                    @click.prevent="reprovarItemAcima()" />
            </div>
            <div class="col-4 md:col-3">
                <Button icon="pi pi-times" label="Aprovar c/ Ressalva" class="p-button-warning"
                    style="width: 100%; height: 50px" @click.prevent="ressalvaItemAcima()" />
            </div>
            <div class="col-4 md:col-3">
                <Button icon="pi pi-check" label="Aprovar" class="p-button-info" style="width: 100%; height: 50px"
                    @click.prevent="proximoItemAcima()" :disabled="this.currentIndex == this.pedidos.length" />
            </div>
        </div>
    </Dialog>

    <!-- Visualizar - Pendentes -->
    <Dialog :header="this.titleDocumento" v-model:visible="displayPendentes" :style="{ width: '95%' }" :modal="true">
        <div class="flex align-items-center justify-content-start">
            <label for="buttondisplay" class="font-bold block mb-2">Autorizações: </label>
            <div v-for="(message, index) in this.pedidoSelecionado.assinados" :key="index">
                <InlineMessage class="m-2" severity="success">
                    {{ formattedMessage(message) }}
                </InlineMessage>
            </div>
            <div class="ml-auto mb-3">
                <Button @click.prevent="mensagemPendente()" class="align-auto" type="button" label="Chat"
                    icon="pi pi-comments" :badge="this.quantidade_mensagens" />
            </div>
        </div>

        <div class="grid justify-content-center">
            <div class="col-12 md:col-12">
                <div ref="pdfContainerPendente" style="width: 100%; height: 750px; border: none"></div>
            </div>
        </div>
    </Dialog>

    <div class="grid">
        <Toast />
        <ConfirmDialog></ConfirmDialog>

        <!-- Tabela com todos pedidos com Dr Emival aprovação em conjunto - Pedidos abaixo de 1000 reais -->
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div v-if="this.pedidos && this.acimaMil == false" class="card">
                <DataTable dataKey="id" :value="pedidos" :paginator="true" :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    responsiveLayout="scroll" filterDisplay="menu" stripedRows>
                    <template #header>
                        <div class="flex justify-content-between"></div>
                    </template>
                    <template #empty> Nenhum pedido encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="" header="" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            <Tag v-if="slotProps.data.urgente == 1" class="mr-2" severity="danger" value="Urgente">
                            </Tag>
                            <Tag v-else class="mr-2" severity="info" value="Normal"></Tag>
                        </template>
                    </Column>

                    <Column field="Status" header="Status" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <span :class="{
                                'text-red': slotProps.data.status.status == 'Resposta do Pedido de Compra Aprovado com Ressalva',
                                'text-bold': slotProps.data.status.status != 'Resposta do Pedido de Compra Aprovado com Ressalva'
                            }">
                                {{ slotProps.data.status.status == 'Resposta do Pedido de Compra Aprovado com Ressalva'
                                    ? 'Resposta do Pedido de Compra Aprovado com Ressalva' : 'Novo Pedido' }}
                            </span>
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">Valor</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>
                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="col-4 md:col-4">
                                <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye"
                                    class="p-button-secondary" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Tabela com todos pedidos com Dr Emival aprovação separada acima de 1000 reais -->
            <div v-if="this.pedidos && this.acimaMil" class="card">
                <DataTable dataKey="id" :value="pedidos" :paginator="true" :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    responsiveLayout="scroll" filterDisplay="menu" stripedRows>
                    <template #header>
                        <div class="flex justify-content-between"></div>
                    </template>
                    <template #empty> Nenhum pedido encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="" header="" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            <Tag v-if="slotProps.data.urgente == 1" class="mr-2" severity="danger" value="Urgente">
                            </Tag>
                            <Tag v-else class="mr-2" severity="info" value="Normal"></Tag>
                        </template>
                    </Column>

                    <Column field="Status" header="Status" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <span :class="{
                                'text-red': slotProps.data.status.status == 'Resposta do Pedido de Compra Aprovado com Ressalva',
                                'text-bold': slotProps.data.status.status != 'Resposta do Pedido de Compra Aprovado com Ressalva'
                            }">
                                {{ slotProps.data.status.status == 'Resposta do Pedido de Compra Aprovado com Ressalva'
                                    ? 'Resposta do Pedido de Compra Aprovado com Ressalva' : 'Novo Pedido' }}
                            </span>
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>
                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="col-4 md:col-4">
                                <Button @click.prevent="visualizarAcima(slotProps.data.id, slotProps.data)"
                                    icon="pi pi-eye" class="p-button-secondary" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Tabela com todos pedidos pendentes -->
            <div v-if="this.pedidosPendentes && this.acimaMil == 'pendentes'" class="card">
                <DataTable dataKey="id" :value="pedidosPendentes" :paginator="true" :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    responsiveLayout="scroll" filterDisplay="menu" stripedRows>
                    <template #header>
                        <div class="flex justify-content-between"></div>
                    </template>
                    <template #empty> Nenhum pedido encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="Protheus" header="Protheus" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Protheus</span>
                            <Badge :value="slotProps.data.protheus" severity="info" />
                        </template>
                    </Column>

                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Comprador" header="Comprador" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">Comprador</span>
                            {{ slotProps.data.criador }}
                        </template>
                    </Column>

                    <Column field="Status" header="Status" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Comprador</span>
                            {{ slotProps.data.status.status }}
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Dt. Aprovação" header="Dt. Aprovação" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Aprovação</span>
                            {{ formatarData(slotProps.data.dt_aprovacao_emival) }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>


                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="col-4 md:col-4">
                                <Button @click.prevent="visualizarPendentes(slotProps.data.id, slotProps.data)"
                                    icon="pi pi-eye" class="p-button-secondary" />
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

.msg-aviso {
    position: absolute;
    margin-top: -46px;
    margin-left: 6%;
    z-index: 1;
}

.text-red {
    color: red;
    font-weight: 900;
}

.text-bold {
    font-weight: 900;
}
</style>
