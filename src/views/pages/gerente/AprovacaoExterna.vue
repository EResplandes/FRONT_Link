<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import PedidoExterno from '../../../service/PedidoExternoService';
import GerenteService from '../../../service/GerenteService';

export default {
    data() {
        return {
            toast: new useToast(),
            router: useRouter(),
            route: useRoute(),
            gerenteService: new GerenteService(),
            pedidoExternoService: new PedidoExterno(),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            informacoes: ref({}),
            id_pedido: ref(this.$route.params.id_pedido),
            adobeApiReady: false,
            previewFilePromise: null,
            form: ref({}),
            confirmaAprovacao: ref(false),
            fluxoValidado: ref(true),
            displayChat: ref(false),
            novaMensagem: ref(),
            API_URL: 'https://link.gruporialma.com.br/storage'
        };
    },

    beforeMount: function () {
        if (!localStorage.getItem('token')) {
            localStorage.setItem('id_pedido_externo', this.id_pedido);
            this.router('/');
        }
    },

    mounted: function () {
        // Metódo responsável por verificar se tem fluxo para esse usuário
        if (localStorage.getItem('usuario_id')) {
            this.form.id_pedido = this.id_pedido;
            this.form.id_usuario = localStorage.getItem('usuario_id');

            this.pedidoExternoService.validaFluxo(this.form).then((data) => {
                if (data.resposta == 'Fluxo válido!') {
                    this.fluxoValidado = true;
                } else {
                    this.fluxoValidado = false;
                }
            });
        }

        if (window.AdobeDC) {
            File;
            this.adobeApiReady = true;
        } else {
            document.addEventListener('adobe_dc_view_sdk.ready', () => {
                this.adobeApiReady = true;
            });
        }

        // Requisição para buscar informações do pedido
        this.pedidoExternoService.buscaInformacoes(this.id_pedido).then((data) => {
            this.informacoes = data.pedido[0];
            this.renderPdf();
        });
    },

    methods: {
        // Metódo responsável por aprovar fluxo
        aprovarPedido(idLink) {
            this.gerenteService.aprovarExterno(this.id_pedido, idLink, localStorage.getItem('usuario_id')).then((data) => {
                if (data.resposta == 'Pedido aprovado com sucesso!') {
                    this.confirmaAprovacao = true;
                }
            });
        },

        // Metódo responsável por reprovar abrir modal mensagem
        chat() {
            this.displayChat = true;
        },

        // Metódo responsável por reprovar pedido
        reprovarPedido() {
            this.gerenteService.reprovarExterno(this.id_pedido, localStorage.getItem('usuario_id'), this.novaMensagem).then((data) => {
                if (data.resposta == 'Pedido reprovado com sucesso!') {
                    this.confirmaAprovacao = true;
                    this.displayChat = false;
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
                            //url: 'https://www.gruporialma.com.br/wp-content/uploads/2024/05/pdf-teste.pdf'
                            url: `${this.API_URL}/${this.informacoes?.anexo}`
                        }
                    },
                    metaData: {
                        fileName: 'Teste',
                        id: 'fileName'
                    }
                },
                previewConfig
            );

            this.zoomIn();
            this.zoomIn();
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
        }
    }
};
</script>

<template>
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
                <Button @click.prevent="reprovarPedido()" label="Enviar" class="mr-2 mt-3 p-button-success col-12" />
            </div>
        </div>
    </Dialog>

    <div v-if="this.fluxoValidado && this.confirmaAprovacao == false" class="grid">
        <Toast />
        <Card style="overflow: hidden; width: 100%">
            <template #header>
                <div ref="pdfContainer" style="width: 100%; height: 60vh; border: none"></div>
            </template>
            <template #footer>
                <div class="flex gap-3">
                    <Button @click.prevent="this.aprovarPedido(2)" label="Aprovar e Enviar Dr. Emival" severity="success" class="w-full" />
                    <Button @click.prevent="this.aprovarPedido(1)" label="Aprovar e Enviar Dr. Mônica" severity="warning" class="w-full" />
                    <Button @click.prevent="this.chat()" label="Reprovar" severity="danger" class="w-full" />
                </div>
            </template>
        </Card>
    </div>
    <div class="grid">
        <div v-if="this.confirmaAprovacao" class="surface-ground flex align-items-center justify-content-center mt-6 w-full">
            <div class="flex flex-column align-items-center justify-content-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(0, 128, 0, 0.6) 0%, rgba(0, 128, 0, 0.4) 20%, rgba(0, 128, 0, 0.2) 50%, rgba(0, 128, 0, 0) 100%)">
                    <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                        <span class="font-bold text-3xl">Pedido finalizado com sucesso!</span><br />
                        <div class="text-600 mb-5">O pedido de número {{ this.id_pedido }} foi finalizado com sucesso!!</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="grid">
        <div v-if="this.fluxoValidado == false" class="surface-ground flex align-items-center justify-content-center mt-6 w-full">
            <div class="flex flex-column align-items-center justify-content-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(255, 0, 0, 0.6) 0%, rgba(255, 0, 0, 0.4) 20%, rgba(255, 0, 0, 0.2) 50%, rgba(255, 0, 0, 0) 100%)">
                    <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                        <span class="font-bold text-3xl">Link Inválido!</span><br />
                        <div class="text-600 mb-5">O pedido de número {{ this.id_pedido }} foi finalizado ou não pertence ao seu fluxo!</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
