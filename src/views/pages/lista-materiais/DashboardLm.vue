<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import DashboardLmService from '../../../service/DashboardLmService';
import LmService from '../../../service/LmService';
import { useRouter } from 'vue-router';

export default {
    data() {
        return {
            toast: new useToast(),
            dashboardLmService: new DashboardLmService(),
            lmService: new LmService(),
            informacoes: ref(null),
            historico: ref(null),
            lmsPorStatus: [],
            router: useRouter(),
            preloading: ref(true),
            lms: ref(null),
            display: ref(false),
            barData: null,
            barOptions: null,
            carregando: ref(true),
            id_usuario: ref(localStorage.getItem('usuario_id'))
        };
    },

    mounted: function () {
        // Metódo responsável por buscar informações do dashboard
        this.dashboardLmService.buscaInformacoes().then((data) => {
            this.informacoes = data.lms;
            this.historico = data.lms.historicos;
            this.lmsPorStatus = data.lms.lms_por_status;
            this.preloading = false;
            this.setGrafico();
        });

        // Metódo responsável por buscar todas LM's
        this.lmService.buscaLms().then((data) => {
            this.lms = data.lm;
            this.carregando = false;
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos do usuário logado
        buscaInformacoes() {
            this.preloading = true;
            this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos;
            });
        },

        showSuccess(mensagem) {
            this.toast.add({ severity: 'success', summary: 'Sucesso!', detail: mensagem, life: 3000 });
        },

        showInfo(mensagem) {
            this.toast.add({ severity: 'info', summary: '', detail: mensagem, life: 3000 });
        },

        showError(mensagem) {
            this.toast.add({ severity: 'error', summary: 'Ocorreu um erro!', detail: mensagem, life: 3000 });
        },

        formatarDataPtBr(data) {
            data = new Date(data);
            return data.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Sao_Paulo' // importante para ajustar o fuso
            });
        },

        setGrafico() {
            const dadosLms = this.lmsPorStatus || [];

            const documentStyle = getComputedStyle(document.documentElement);

            // Lista de cores para os status (adicione mais se necessário)
            const cores = [
                documentStyle.getPropertyValue('--blue-600'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--pink-500'),
                documentStyle.getPropertyValue('--orange-500'),
                documentStyle.getPropertyValue('--purple-500'),
                documentStyle.getPropertyValue('--cyan-500'),
                documentStyle.getPropertyValue('--teal-500')
            ];

            this.barData = {
                labels: dadosLms.map((item) => item.status.status),
                datasets: [
                    {
                        label: 'Total por Status',
                        backgroundColor: dadosLms.map((_, index) => cores[index % cores.length]),
                        borderColor: '#fff',
                        data: dadosLms.map((item) => item.total)
                    }
                ]
            };

            this.barOptions = {};
        },

        formatarDataPtBrTabela(prazo) {
            return new Date(prazo).toLocaleDateString('pt-BR');
        },

        verificarPrazo(data, status) {
            if (status == 'Finalizada') return 'Finalizada';
            const prazo = new Date(data);
            const hoje = new Date();
            prazo.setHours(0, 0, 0, 0);
            hoje.setHours(0, 0, 0, 0);

            if (prazo >= hoje) {
                return 'Dentro do Prazo';
            } else {
                return 'Atrasado';
            }
        }
    }
};
</script>

<template>
    <!-- <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div> -->

    <Toast position="bottom-center" />

    <div class="grid">
        <!-- Total de LM's -->
        <div class="col-12 lg:col-6 xl:col-6">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total de LM's</span>
                        <div class="text-900 font-medium text-xl">
                            <template v-if="preloading">
                                <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="6" fill="transparent" animationDuration=".5s" />
                            </template>
                            <template v-else> {{ informacoes?.total_lms }} lista(s) </template>
                        </div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-green-500 text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-blue-500 font-medium cursor-ver-pedidos">Ver listas... </span> -->
            </div>
        </div>

        <!-- Total de LM's Atrasadas -->
        <div class="col-12 lg:col-6 xl:col-6">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total de LM's Atrasadas</span>
                        <div class="text-900 font-medium text-xl">
                            <template v-if="preloading">
                                <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="6" fill="transparent" animationDuration=".5s" />
                            </template>
                            <template v-else> {{ informacoes?.total_lms_atrasadas }} lista(s) atrasada(s) </template>
                        </div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-red-500 text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-blue-500 font-medium cursor-ver-pedidos">Ver listas... </span> -->
            </div>
        </div>
        <!-- Coluna da tabela de LM's -->
        <div class="col-8 xl:col-8">
            <div class="card" style="height: 75vh; overflow-y: auto">
                <div class="w-full mb-3">
                    <h5 class="text-left">Listas de Materiais</h5>
                </div>
                <DataTable :value="lms" responsiveLayout="scroll" :loading="carregando" style="min-height: 75vh">
                    <template #loading>
                        <div class="flex justify-center items-center h-40">
                            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </div>
                    </template>
                    <Column field="id" header="ID"></Column>
                    <Column field="solicitante" header="Solicitante"></Column>
                    <Column field="comprador" header="Comprador"></Column>
                    <Column field="local" header="Local"></Column>
                    <Column field="status" header="Status"></Column>
                    <Column field="prazo" header="Prazo">
                        <template #body="slotProps">
                            {{ formatarDataPtBrTabela(slotProps.data.prazo) }}
                        </template>
                    </Column>
                    <Column field="status_prazo" header="Status Prazo">
                        <template #body="slotProps">
                            <span
                                :class="{
                                    'text-red': verificarPrazo(slotProps.data.prazo, slotProps.data.status) === 'Atrasado',
                                    'text-green': verificarPrazo(slotProps.data.prazo, slotProps.data.status) === 'Finalizada',
                                    'text-blue': verificarPrazo(slotProps.data.prazo, slotProps.data.status) === 'Dentro do Prazo'
                                }"
                            >
                                {{ verificarPrazo(slotProps.data.prazo, slotProps.data.status) }}
                            </span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- Coluna com Histórico + Gráfico -->
        <div class="col-4 xl:col-4">
            <!-- Histórico de LM's -->
            <div class="card mb-3">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5>
                        Histórico de LM's
                        <i class="pi pi-bell text-orange-500 ml-2"></i>
                    </h5>
                </div>
                <div style="max-height: 300px; overflow-y: auto">
                    <template v-if="preloading">
                        <div class="flex justify-content-center align-items-center" style="height: 150px">
                            <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="6" fill="transparent" animationDuration=".5s" />
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="hist in historico" :key="hist.id">
                            <ul class="p-0 mx-0 mt-0 mb-4 list-none">
                                <li v-if="hist.lm.status == 'Solicitado'" class="flex align-items-center py-2 border-bottom-1 surface-border">
                                    <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                        <i class="pi pi-bell text-xl text-blue-500"></i>
                                    </div>
                                    <span class="block text-600 font-medium"> Solicitante: {{ hist.lm.solicitante }} </span>
                                    <span class="block text-600 font-medium">
                                        {{ hist.mensagem }}
                                        <span class="text-700">às {{ formatarDataPtBr(hist.data_observacao) }}</span>
                                    </span>
                                </li>
                                <li v-else class="flex align-items-center py-2 border-bottom-1 surface-border">
                                    <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                        <i class="pi pi-bell text-xl text-blue-500"></i>
                                    </div>
                                    <span class="block text-600 font-medium"> Comprador: {{ hist.lm.comprador }} </span>
                                    <span class="block text-600 font-medium">
                                        {{ hist.mensagem }}
                                        <span class="text-700">às {{ formatarDataPtBr(hist.data_observacao) }}</span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Gráfico de Status -->
            <div class="card">
                <div class="w-full mb-4">
                    <h5 class="text-left">LM's Por Status</h5>
                </div>
                <div class="card flex flex-column align-items-center" style="min-height: 300px">
                    <template v-if="preloading">
                        <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="6" fill="transparent" animationDuration=".5s" />
                    </template>
                    <template v-else>
                        <Chart type="doughnut" :data="barData" :options="barOptions"></Chart>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
::v-deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

.custom-scroll {
    max-height: 300px; /* Define a altura máxima da lista */
    overflow-y: auto; /* Habilita o scroll vertical */
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
    max-height: 300px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}

.text-red {
    color: red;
    font-weight: bold; /* opcional para destacar mais */
}

.text-green {
    color: green;
    font-weight: bold;
}

.text-blue {
    color: blue;
    font-weight: bold;
}

.cursor-ver-pedidos {
    cursor: pointer;
}

html,
body,
#app {
    height: 100%;
    margin: 0;
}
</style>
