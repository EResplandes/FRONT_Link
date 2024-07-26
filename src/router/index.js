import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/pedidos-emival',
                    name: 'pedidos-emival',
                    component: () => import('@/views/pages/pedidos/PedidosEmival.vue')
                },
                {
                    path: '/pedidos-antecipados',
                    name: 'pedidos-antecipados',
                    component: () => import('@/views/pages/presidencia/PedidosAntecipados.vue')
                },
                {
                    path: '/pedidos-monica',
                    name: 'pedidos-monica',
                    component: () => import('@/views/pages/pedidos/PedidosMonica.vue')
                },
                {
                    path: '/todos-pedidos-soleni',
                    name: 'todos-pedidos-soleni',
                    component: () => import('@/views/pages/gestor_fluxo/TodosPedidos.vue')
                },
                {
                    path: '/pedidos-controle',
                    name: 'pedidos-controle',
                    component: () => import('@/views/pages/financeiro/ControleParcelas.vue')
                },
                {
                    path: '/pedidos-todos',
                    name: 'pedidos-todos',
                    component: () => import('@/views/pages/pedidos/Todos.vue')
                },
                {
                    path: '/pedidos-todos-comprador',
                    name: 'pedidos-todos-comprador',
                    component: () => import('@/views/pages/comprador/TodosPedidos.vue')
                },
                {
                    path: '/pedidos-escriturar',
                    name: 'pedidos-escriturar',
                    component: () => import('@/views/pages/fiscal/Escriturar.vue')
                },
                {
                    path: '/pedidos-reprovados-fiscal',
                    name: 'pedidos-reprovados-fiscal',
                    component: () => import('@/views/pages/comprador/PedidosReprovadosFiscal.vue')
                },
                {
                    path: '/pedidos-reprovados-financeiro',
                    name: 'pedidos-reprovados-financeiro',
                    component: () => import('@/views/pages/fiscal/ReprovadosFinanceiro.vue')
                },
                {
                    path: '/pedidos-todos-externo',
                    name: 'pedidos-todos-externo',
                    component: () => import('@/views/pages/comprador/TodosPedidosCompradorExterno.vue')
                },
                {
                    path: '/pedidos-reprovados',
                    name: 'pedidos-reprovados',
                    component: () => import('@/views/pages/pedidos/Reprovados.vue')
                },
                {
                    path: '/pedidos-ressalva',
                    name: 'pedidos-ressalva',
                    component: () => import('@/views/pages/pedidos/Ressalva.vue')
                },
                {
                    path: '/pedidos-financeiro',
                    name: 'pedidos-financeiro',
                    component: () => import('@/views/pages/financeiro/GeracaoParcelas.vue')
                },
                {
                    path: '/relatorio-financeiro',
                    name: 'relatorio-financeiro',
                    component: () => import('@/views/pages/financeiro/Relatorio.vue')
                },
                {
                    path: '/pagamento-parcelas',
                    name: 'pagamento-parcelas',
                    component: () => import('@/views/pages/financeiro/Pagamento.vue')
                },
                {
                    path: '/pedidos-justificar',
                    name: 'pedidos-justificar',
                    component: () => import('@/views/pages/pedidos/Justificar.vue')
                },
                {
                    path: '/gestor-fluxo',
                    name: 'gestor-fluxo',
                    component: () => import('@/views/pages/pedidos/GestorFluxo.vue')
                },
                {
                    path: '/cadastro-pedido',
                    name: 'cadastro-pedido',
                    component: () => import('@/views/pages/pedidos/Cadastro.vue')
                },
                {
                    path: '/cadastro-sem-fluxo',
                    name: 'cadastro-sem-fluxo',
                    component: () => import('@/views/pages/pedidos/CadastroSemFluxo.vue')
                },
                {
                    path: '/aprovacao-gerentes',
                    name: 'aprovacao-gerentes',
                    component: () => import('@/views/pages/gerente/Aprovacao.vue')
                },
                {
                    path: '/aprovacao-externa/:id_pedido',
                    name: 'aprovacao-externa',
                    component: () => import('@/views/pages/gerente/AprovacaoExterna.vue')
                },
                {
                    path: '/pedidos-aprovados',
                    name: 'pedidos-aprovados',
                    component: () => import('@/views/pages/comprador/PedidosAprovados.vue')
                },
                {
                    path: '/empresas',
                    name: 'empresas',
                    component: () => import('@/views/pages/empresa/Empresa.vue')
                },
                {
                    path: '/reprovados-gestor',
                    name: 'reprovados-gestor',
                    component: () => import('@/views/pages/comprador/PedidosFluxoReprovados.vue')
                },
                {
                    path: '/reprovados-soleni',
                    name: 'reprovados-soleni',
                    component: () => import('@/views/pages/comprador/PedidosReprovadosSoleni.vue')
                },
                {
                    path: '/usuarios',
                    name: 'usuarios',
                    component: () => import('@/views/pages/auth/Usuarios.vue')
                },
                {
                    path: '/emival',
                    name: 'emival',
                    component: () => import('@/views/pages/presidencia/Emival.vue')
                },
                {
                    path: '/monica',
                    name: 'monica',
                    component: () => import('@/views/pages/presidencia/Monica.vue')
                },
                {
                    path: '/relatorio-aprovados',
                    name: 'relatorio-aprovados',
                    component: () => import('@/views/pages/relatorios/Aprovados.vue')
                },
                {
                    path: '/relatorio-reprovados',
                    name: 'relatorio-reprovados',
                    component: () => import('@/views/pages/relatorios/Reprovados.vue')
                },
                {
                    path: '/graficos',
                    name: 'graficos',
                    component: () => import('@/views/pages/relatorios/Graficos.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/Input.vue')
                },
                {
                    path: '/uikit/floatlabel',
                    name: 'floatlabel',
                    component: () => import('@/views/uikit/FloatLabel.vue')
                },
                {
                    path: '/uikit/invalidstate',
                    name: 'invalidstate',
                    component: () => import('@/views/uikit/InvalidState.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/Button.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/Table.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/List.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/Tree.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/Panels.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/Overlay.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/Media.vue')
                },
                {
                    path: '/uikit/menu',
                    component: () => import('@/views/uikit/Menu.vue'),
                    children: [
                        {
                            path: '/uikit/menu',
                            component: () => import('@/views/uikit/menu/PersonalDemo.vue')
                        },
                        {
                            path: '/uikit/menu/seat',
                            component: () => import('@/views/uikit/menu/SeatDemo.vue')
                        },
                        {
                            path: '/uikit/menu/payment',
                            component: () => import('@/views/uikit/menu/PaymentDemo.vue')
                        },
                        {
                            path: '/uikit/menu/confirmation',
                            component: () => import('@/views/uikit/menu/ConfirmationDemo.vue')
                        }
                    ]
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/Messages.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/File.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/Chart.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/Misc.vue')
                },
                {
                    path: '/blocks',
                    name: 'blocks',
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/utilities/icons',
                    name: 'icons',
                    component: () => import('@/views/utilities/Icons.vue')
                },
                {
                    path: '/pages/timeline',
                    name: 'timeline',
                    component: () => import('@/views/pages/Timeline.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/utilities/Documentation.vue')
                }
            ]
        },
        {
            path: '/landing/:id_pedido',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
