<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import PedidoService from '../../service/Pedido';

export default {
    data() {
        return {
            router: useRouter(),
            route: useRoute(),
            pedidoService: new PedidoService(),
            id_pedido: ref(this.$route.params.id_pedido),
            informacoes: ref(null)
        };
    },

    beforeMount: function () {
        // Requisição para buscar informações do pedido
        this.pedidoService.buscaInformacoesPedido(this.id_pedido).then((data) => {
            this.informacoes = data;
        });
    }
};
</script>

<template>
    <div class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden center text-center">
            <div
                id="hero"
                class="flex flex-column pt-4 px-4 lg:px-8 overflow-hidden pb-6"
                style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgba(0, 0, 0, 1) 0%, #003360 100%); clip-path: ellipse(150% 87% at 93% 13%)"
            >
                <div class="mx-4 md:mx-8 mt-0 center text-center">
                    <img width="200px" src="https://www.gruporialma.com.br/wp-content/uploads/2023/12/imagem_2023-12-01_162149885.png" />
                    <h3 style="color: white" class="font-bold line-height-2">Validação via QRCODE</h3>
                </div>
            </div>

            <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8">
                <div class="grid justify-content-center">
                    <div class="col-6 md:col-6 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0 p-2">
                        <div
                            style="height: 160px; padding: 10px; border-radius: 1px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))"
                        >
                            <div class="p-3 surface-card h-full" style="border-radius: 8px">
                                <div class="icon-wrapper flex align-items-center justify-content-center bg-green-200 mb-3">
                                    <i class="pi pi-fw pi-money-bill text-2xl text-cyan-700 p-1"></i>
                                </div>
                                <h5 class="mb-2 text-900">Valor</h5>
                                <span class="text-600">{{ this.informacoes.pedido[0].valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-6 md:col-6 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0 p-2">
                        <div
                            style="height: 160px; padding: 10px; border-radius: 1px; background: linear-gradient(90deg, rgba(187, 199, 205, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(145, 210, 204, 0.2))"
                        >
                            <div class="p-3 surface-card h-full" style="border-radius: 8px">
                                <div class="icon-wrapper flex align-items-center justify-content-center bg-bluegray-200 mb-3">
                                    <i class="pi pi-fw pi-building text-2xl text-bluegray-700 p-1"></i>
                                </div>
                                <h5 class="mb-2 text-900">Empresa</h5>
                                <span class="text-600">{{ this.informacoes.pedido[0].empresa }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-6 md:col-6 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0 p-2">
                        <div
                            style="height: 160px; padding: 10px; border-radius: 1px; background: linear-gradient(90deg, rgba(187, 199, 205, 0.2), rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(145, 226, 237, 0.2), rgba(160, 210, 250, 0.2))"
                        >
                            <div class="p-3 surface-card h-full" style="border-radius: 8px">
                                <div class="icon-wrapper flex align-items-center justify-content-center bg-orange-200 mb-3">
                                    <i class="pi pi-fw pi-map-marker text-2xl text-orange-700 p-1"></i>
                                </div>
                                <h5 class="mb-2 text-900">Local</h5>
                                <span class="text-600">{{ this.informacoes.pedido[0].local }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-6 md:col-6 lg:col-4 p-0 lg:pb-5 mt-4 lg:mt-0 p-2">
                        <div
                            style="height: 160px; padding: 10px; border-radius: 1px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))"
                        >
                            <div class="p-3 surface-card h-full" style="border-radius: 8px">
                                <div class="icon-wrapper flex align-items-center justify-content-center bg-yellow-200 mb-3">
                                    <i class="pi pi-fw pi-align-justify text-2xl text-yellow-700 p-1"></i>
                                </div>
                                <h5 class="mb-2 text-900">Descrição</h5>
                                <span class="text-600">{{ this.informacoes.pedido[0].descricao }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>
