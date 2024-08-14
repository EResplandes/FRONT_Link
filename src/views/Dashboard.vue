<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import DashboardService from '../service/DashboardService';
import AutenticacaoService from '../service/AutenticacaoService';
import { useRouter } from 'vue-router';

export default {
    data() {
        return {
            toast: new useToast(),
            dashboardService: new DashboardService(),
            autenticacaoService: new AutenticacaoService(),
            informacoes: ref(null),
            router: useRouter(),
            preloading: ref(true),
            display: ref(false),
            nova_senha: ref(null),
            id_usuario: ref(localStorage.getItem('usuario_id'))
        };
    },

    mounted: function () {
        // Metódo responsável por buscar informações do dashboard
        this.dashboardService.buscaInformacoes(localStorage.getItem('usuario_id')).then((data) => {
            this.informacoes = data.informacoes;
            this.preloading = false;
        });

        const usuario = localStorage.getItem('nome');

        this.showInfo(`Bem-vindo, ${usuario}!`);
    },

    methods: {
        // Metódo responsável por buscar todos pedidos do usuário logado
        buscaInformacoes() {
            this.preloading = true;
            this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos;
            });
        },

        // Metódo responsável por alterar senha
        alteraSenha() {
            this.autenticacaoService.alteraSenha(this.nova_senha, this.id_usuario).then((data) => {
                if (data.resposta == 'Senha alterada com sucesso!') {
                    this.showSuccess('Senha alterada com sucesso!');
                    localStorage.setItem('p_acesso', '0');
                    this.display = false;
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o Administrador!');
                }
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

        // Metódo responsável por mandar para rotas
        rota(id) {
            switch (id) {
                case 1:
                    this.router.push('/pedidos-aprovados');
                    break;
                case 2:
                    this.router.push('/pedidos-reprovados');
                    break;
                case 3:
                    this.router.push('/reprovados-soleni');
                    break;
                default:
                    this.router.push('/reprovados-gestor');
                    break;
            }
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>

    <Toast position="bottom-center" />

    <Dialog header="ALTERAÇÃO DE SENHA" v-model:visible="display" :style="{ width: '80%' }" :modal="true">
        <Card class="m-1" style="width: 100%; overflow: hidden; background-color: #f8f8ff">
            <template #header> </template>
            <template #title>BEM-VINDO!</template>
            <template #content>
                <p class="m-0">
                    Para garantir a sua segurança e proteger suas informações, é necessário redefinir sua senha no primeiro acesso ao sistema. Este processo é fundamental para assegurar que sua conta esteja protegida contra acessos não autorizados.
                    Agradecemos sua compreensão e colaboração
                </p>
                <hr />
                <div class="flex flex-column gap-2">
                    <label for="username">Nova senha:</label>
                    <Password id="password1" v-model="this.nova_senha" :feedback="false" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>
                    <small id="username-help">Digite sua nova senha.</small>
                </div>
            </template>
            <template #footer>
                <div class="flex gap-3 mt-1">
                    <Button @click.prevent="this.display = false" label="Alterar Mais Tarde" severity="secondary" outlined class="w-full" />
                    <Button @click.prevent="this.alteraSenha()" label="Atualizar senha" class="w-full" />
                </div>
            </template>
        </Card>
    </Dialog>

    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Pedidos Aprovados</span>
                        <div class="text-900 font-medium text-xl">{{ this.informacoes?.qtdPedidosAprovados }} pedido(s)</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-green-500 text-xl"></i>
                    </div>
                </div>
                <span @click="rota(1)" class="text-blue-500 font-medium cursor-ver-pedidos">Ver pedidos... </span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Reprovados por Emival</span>
                        <div class="text-900 font-medium text-xl">{{ this.informacoes?.qtdPedidosReprovadosEmival }} pedido(s)</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-red-500 text-xl"></i>
                    </div>
                </div>
                <span @click="rota(2)" class="text-blue-500 font-medium cursor-ver-pedidos">Ver pedidos... </span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Reprovados por Soleni</span>
                        <div class="text-900 font-medium text-xl">{{ this.informacoes?.qtdPedidosReprovadosSoleni }} pedido(s)</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-red-500 text-xl"></i>
                    </div>
                </div>
                <span @click="rota(3)" class="text-blue-500 font-medium cursor-ver-pedidos">Ver pedidos... </span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Reprovados por Gerente</span>
                        <div class="text-900 font-medium text-xl">{{ this.informacoes?.qtdPedidosReprovadosGerenteDiretor }} pedido(s)</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-red-500 text-xl"></i>
                    </div>
                </div>
                <span @click="rota(4)" class="text-blue-500 font-medium cursor-ver-pedidos">Ver pedidos... </span>
            </div>
        </div>

        <div class="col-12 xl:col-8">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-5">
                    <h5>PEDIDOS POR STATUS</h5>
                </div>
                <ul class="list-none p-0 m-0 custom-scroll">
                    <li v-for="status in informacoes?.pedidosPorStatus" :key="status.status" class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">{{ status?.status }}</span>
                        </div>
                        <div class="mt-2 md:mt-0 flex align-items-center">
                            <span class="text-blue-800 ml-3 font-medium">{{ status?.total }}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <div class="col-12 xl:col-4">
            <div class="card">
                <Card style="overflow: hidden">
                    <template #header>
                        <img alt="imagem" width="430" src="https://www.gruporialma.com.br/wp-content/uploads/2024/02/wallpaper-Rialma.png" />
                    </template>
                    <template #title>COMUNICADO</template>
                    <template #subtitle>Eduardo C. Resplandes | Desenvolvedor</template>
                    <template #content>
                        <span class="text-900 line-height-3"
                            >Para relatar erros ou enviar sugestões de melhoria, por favor, entre em contato conosco através dos seguintes meios:
                            <span class="text-700 mt-3"
                                ><span class="text-blue-500">
                                    <p class="m-0">Telefone: +55 61 3298-8817</p>
                                    <p class="m-0">E-mail: suporte@gruporialma.com.br</p></span
                                ></span
                            >
                        </span>
                    </template>
                </Card>
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

.cursor-ver-pedidos {
    cursor: pointer;
}
</style>
