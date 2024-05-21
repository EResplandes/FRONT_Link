<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import DashboardService from '../service/DashboardService';

export default {
    data() {
        return {
            toast: new useToast(),
            dashboardService: new DashboardService(),
            informacoes: ref(null),
            preloading: ref(true)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar informações do dashboard
        this.dashboardService.buscaInformacoes().then((data) => {
            this.informacoes = data.informacoes;
            this.preloading = false;
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos do usuário logado
        buscaInformacoes() {
            this.preloading = true;
            this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos;
            });
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>

    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-6">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">CENTRAIS</span>
                        <div class="text-900 font-medium text-xl">{{ this.informacoes?.qtd_centrais_total }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-bar text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{ this.informacoes?.qtd_centrais_hoje }} NOVOS</span>
                <span class="text-500"> PEDIDOS HOJE</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-6">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">RT V</span>
                        <div class="text-900 font-medium text-xl">{{ this.informacoes?.qtd_rtv_total }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-bar text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{ this.informacoes?.qtd_rtv_hoje }} NOVOS </span>
                <span class="text-500"> PEDIDOS HOJE</span>
            </div>
        </div>
        <!-- <div class="col-12 lg:col-3 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">EMIVAL</span>
                        <div class="text-900 font-medium text-xl">2</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-bar text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">520 </span>
                <span class="text-500"> PEDIDOS HOJE</span>
            </div>
        </div>
        <div class="col-12 lg:col-3 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">EMIVAL</span>
                        <div class="text-900 font-medium text-xl">2</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-bar text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">520 </span>
                <span class="text-500"> PEDIDOS HOJE</span>
            </div>
        </div> -->
    </div>

    <Fieldset>
        <template #legend>
            <div class="flex align-items-center pl-2">
                <Avatar image="https://media.licdn.com/dms/image/C4E03AQFgSYhROpDDDw/profile-displayphoto-shrink_400_400/0/1653436652339?e=1721260800&v=beta&t=vcwxnYiXNqI7Zr1sYy3RMGFT1YKIabgTnzsubpZ4xuI" shape="circle" />
                <span class="font-bold p-3">Eduardo C. Resplandes | Desenvolvedor FullStack</span>
            </div>
        </template>
        <h6 class="">Bem-vindos ao Protheus Web 2.0 !</h6>
        <hr />
        <br />
        <p class="m-0">
            É com grande entusiasmo que damos as boas-vindas a todos os usuários ao Protheus Web 2.0, a mais recente evolução em nossa plataforma de aprovação de pedidos. Estamos empolgados em apresentar essa nova versão, repleta de recursos
            aprimorados e uma interface ainda mais amigável, projetada para otimizar sua experiência de uso.
        </p>
        <br />
        <p class="m-0">
            Neste momento, gostaríamos de informar que o Protheus Web 2.0 está em fase de testes. Como resultado, é possível que você encontre alguns pequenos contratempos ou erros durante a sua navegação. Pedimos, por gentileza, que nos ajude a
            aprimorar ainda mais essa ferramenta, reportando qualquer problema que encontrar.
        </p>
        <br />
        <p class="m-0">Para relatar erros ou enviar sugestões de melhoria, por favor, entre em contato conosco através dos seguintes meios:</p>
        <br />
        <p class="m-0">Telefone: Ramal +55 61 3298-8817</p>
        <p class="m-0">E-mail: ti@gruporialma.com.br</p>
        <br />
        <p class="m-0">
            Sua colaboração é fundamental para garantir que o Protheus Web 2.0 atinja todo o seu potencial e ofereça a melhor experiência possível aos nossos usuários. Agradecemos antecipadamente pela sua ajuda e compreensão durante esta fase de
            testes.
        </p>
        <br />
        <p class="m-0">Estamos ansiosos para ouvir seus feedbacks e trabalhar juntos para tornar o Protheus Web 2.0 ainda melhor!</p>
    </Fieldset>
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
    max-height: 300px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}
</style>
