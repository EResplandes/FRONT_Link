<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import API_URL from '../../../service/config';
import PedidoExterno from '../../../service/PedidoExternoService';

export default {
    data() {
        return {
            toast: new useToast(),
            router: useRouter(),
            route: useRoute(),
            pedidoExternoService: new PedidoExterno(),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            informacoes: ref(null),
            id_pedido: ref(this.$route.params.id_pedido),
            adobeApiReady: false,
            previewFilePromise: null,
            form: ref({}),
            fluxoValidado: ref(false)
        };
    },

    beforeMount: function () {
        if (!localStorage.getItem('token')) {
            localStorage.setItem('id_pedido_externo', this.id_pedido);
            this.router('/');
        }

        // Requisição para buscar informações do pedido
        this.pedidoExternoService.buscaInformacoes(this.id_pedido).then((data) => {
            this.informacoes = data;
        });

        // Metódo responsável por verificar se tem fluxo para esse usuário
        if (localStorage.getItem('usuario_id')) {
            this.form.id_pedido = this.id_pedido;
            this.form.id_usuario = localStorage.getItem('usuario_id');

            this.pedidoExternoService.validaFluxo(this.form).then((data) => {
                if (data.resposta == 'Fluxo válido!') {
                    this.fluxoValidado = false;
                } else {
                    this.fluxoValidado = true;
                }
            });
        } else {
            localStorage.setItem('linkAprovacao', true);
            this.router.push('/'); // Mandando para tela principal
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

        this.renderPdf();
    },

    methods: {
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
                            url: 'https://www.gruporialma.com.br/wp-content/uploads/2024/05/pdf-teste.pdf'
                            // url: `${API_URL}/${this.informacoes.pedido[0].anexo}`
                        }
                    },
                    metaData: {
                        fileName: 'Teste',
                        id: 'fileName'
                    }
                },
                previewConfig
            );
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
    <div class="grid">
        <Toast />
        <Card v-if="!this.validaFluxo" style="overflow: hidden; width: 100%">
            <template #header>
                <div ref="pdfContainer" style="width: 100%; height: 60vh; border: none"></div>
            </template>
            <template #footer>
                <div class="flex gap-3">
                    <Button label="Reprovar" severity="danger" class="w-full" />
                    <Button label="Aprovar" severity="success" class="w-full" />
                </div>
            </template>
        </Card>

        <div v-else class="surface-ground flex align-items-center justify-content-center mt-6 w-full">
            <div class="flex flex-column align-items-center justify-content-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 10%, rgba(0, 0, 0, 0) 30%)">
                    <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                        <span class="font-bold text-3xl">Link inválido!</span><br />
                        <div class="text-600 mb-5">Esse fluxo não existe ou já foi assinado!</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
