<script setup>
import { ref, computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const userRole = localStorage.getItem('funcao');
const nome = localStorage.getItem('nome');

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/', requiredRole: ['Administrador', 'Gestor de Fluxo', 'Diretor', 'Gerente', 'Comprador', 'Comprador Externo', 'Fiscal', 'Consultante', 'Auxiliar de Fluxo'] },
            { label: 'Todos meus pedidos', icon: 'pi pi-fw pi-book', to: '/pedidos-todos-comprador', requiredRole: ['Administrador', 'Comprador', 'Gestor de Fluxo', 'Comprador Externo', 'Gerente', 'Fiscal', 'Auxiliar de Fluxo'] }
        ]
    },
    {
        label: 'Gestor de Fluxo',
        items: [
            { label: 'Pedidos com Emival', icon: 'pi pi-fw pi-book', to: '/pedidos-emiva-gestor-fluxo', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            {
                label: 'Pedidos com Monica',
                icon: 'pi pi-fw pi-book',
                to: '/pedidos-monica',
                requiredRole: ['Gestor de Fluxo', 'Administrador']
            },
            { label: 'Pedidos com Giovana', icon: 'pi pi-fw pi-book', to: '/pedidos-giovana', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            { label: 'Análise de Fluxo', icon: 'pi pi-fw pi-sitemap', to: '/gestor-fluxo', requiredRole: ['Gestor de Fluxo', 'Administrador', 'Auxiliar de Fluxo'], requiredNome: ['Eduardo C. Resplandes', 'Soleni', 'Neide Teixeira'] },
            { label: 'Resposta Reprovados', icon: 'pi pi-fw pi-sitemap', to: '/resposta-reprovados', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            { label: 'Todos', icon: 'pi pi-fw pi-book', to: '/todos-pedidos-soleni', requiredRole: ['Gestor de Fluxo', 'Administrador'] }
        ]
    },
    {
        label: 'Departamento Pessoal',
        items: [
            { label: 'Pedidos com Emival', icon: 'pi pi-fw pi-users', to: '/pedidos-emival-dp', requiredRole: ['Comprador', 'Administrador', 'Comprador Externo'], requiredNome: ['Eduardo C. Resplandes', 'DP BRASÍLIA', 'DP'] },
            {
                label: 'Pedidos com Monica',
                icon: 'pi pi-fw pi-book',
                to: '/pedidos-monica',
                requiredRole: ['Comprador', 'Administrador', 'Comprador Externo'],
                requiredNome: ['DP BRASÍLIA', 'Eduardo C. Resplandes', 'DP', 'Soleni']
            },
            { label: 'Justificar Pedidos', icon: 'pi pi-fw pi-book', to: '/justificar-pedidos-dp', requiredRole: ['Administrador', 'Comprador', 'Comprador Externo'], requiredNome: ['Eduardo C. Resplandes', 'DP BRASÍLIA', 'DP'] },
            { label: 'Todos Pedidos', icon: 'pi pi-fw pi-book', to: '/todos-pedidos-dp', requiredRole: ['Administrador', 'Comprador', 'Comprador Externo', 'Gestor de Fluxo'], requiredNome: ['Eduardo C. Resplandes', 'DP BRASÍLIA', 'DP', 'Soleni'] }
        ]
    },
    // {
    // label: 'Comparação de Preços',
    // items: [
    // { label: 'Consulta', icon: 'pi pi-fw pi-book', to: '/consulta-precos', requiredRole: ['Apresentação'] }
    // ]
    // },
    {
        label: 'Consulta',
        items: [{ label: 'Todos', icon: 'pi pi-fw pi-book', to: '/todos-pedidos-soleni', requiredRole: ['Administrador', 'Consultante', 'Fiscal'] }]
    },
    {
        label: 'Gerente | Diretor',
        items: [
            { label: 'Para Aprovação', icon: 'pi pi-fw pi-reply', to: '/aprovacao-gerentes', requiredRole: ['Diretor', 'Gerente', 'Administrador', 'Gestor de Fluxo'] },
            { label: 'Justificar Pedidos', icon: 'pi pi-fw pi-book', to: '/justificar-pedidos-gerente', requiredRole: ['Administrador', 'Diretor', 'Gerente', 'Gestor de Fluxo'] },
            { label: 'Todos', icon: 'pi pi-fw pi-book', to: '/todos-pedidos-soleni', requiredRole: ['Gerente', 'Administrador', 'Diretor', 'Auxiliar de Fluxo'] },
            { label: 'Todos Pedidos Associados', icon: 'pi pi-fw pi-book', to: '/pedidos-gerentes', requiredRole: ['Gerente', 'Administrador', 'Diretor'] },
            { label: 'Pedidos com Emival', icon: 'pi pi-fw pi-book', to: '/pedidos-emival', requiredRole: ['Administrador', 'Gerente', 'Diretor', 'Auxiliar de Fluxo'] },
            { label: 'Pedidos com Mônica', icon: 'pi pi-fw pi-book', to: '/pedidos-monica', requiredRole: ['Administrador', 'Gerente', 'Diretor', 'Auxiliar de Fluxo'] },
            { label: 'Pedidos com Giovana', icon: 'pi pi-fw pi-book', to: '/pedidos-giovana', requiredRole: ['Administrador', 'Gerente', 'Auxiliar de Fluxo'] }
        ]
    },
    {
        label: 'Cadastro de Pedido',
        items: [
            { label: 'Cadastro SEM FLUXO', icon: 'pi pi-fw pi-book', to: '/cadastro-sem-fluxo', requiredRole: ['Gestor de Fluxo', 'Administrador', 'Comprador Externo', 'Comprador', 'Gerente', 'Auxiliar de Fluxo'] },
            { label: 'Cadastro COM FLUXO', icon: 'pi pi-fw pi-book', to: '/cadastro-pedido', requiredRole: ['Gerente', 'Administrador', 'Comprador', 'Gestor de Fluxo', 'Comprador Externo', 'Auxiliar de Fluxo'] }
            // { label: 'Cotação', icon: 'pi pi-fw pi-book', to: '/buscar-precos', requiredRole: ['Administrador'] }
            // { label: 'Consulta', icon: 'pi pi-fw pi-book', to: '/consulta-precos', requiredRole: ['Administrador', 'Comprador', 'Comprador Externo'] }
        ]
    },
    // {
    // label: 'Módulo Fiscal',
    // items: [
    // { label: 'Cadastro FISCAL', icon: 'pi pi-fw pi-book', to: '/cadastro-fiscal', requiredRole: ['Administrador', 'Fiscal'] }
    // { label: 'Pedidos para Escriturar', icon: 'pi pi-fw pi-book', to: '/pedidos-escriturar', requiredRole: ['Fiscal', 'Administrador'] },
    // { label: 'Pedidos Reprovados pelo Financeiro', icon: 'pi pi-fw pi-book', to: '/pedidos-reprovados-financeiro', requiredRole: ['Fiscal', 'Administrador'] }
    // ]
    // },
    // {
    //     label: 'Módulo Financeiro',
    //     items: [
    //         { label: 'Pedidos', icon: 'pi pi-fw pi-book', to: '/pedidos-financeiro', requiredRole: ['Financeiro', 'Administrador', 'Gestor de Fluxo'] },
    //         { label: 'Pagamentos', icon: 'pi pi-fw pi-book', to: '/pagamento-parcelas', requiredRole: ['Financeiro', 'Administrador'] },
    //         // { label: 'Controle', icon: 'pi pi-fw pi-book', to: '/pedidos-controle', requiredRole: ['Financeiro', 'Administrador'] },
    //         { label: 'Auditória', icon: 'pi pi-fw pi-book', to: '/relatorio-financeiro', requiredRole: ['Financeiro', 'Administrador', 'Gestor de Fluxo'] },
    //         { label: 'Pagamentos por Banco', icon: 'pi pi-fw pi-book', to: '/pagamentos-por-banco', requiredRole: ['Financeiro', 'Administrador'] }
    //     ]
    // },
    {
        label: 'Pedidos',
        items: [
            // { label: 'Todos', icon: 'pi pi-fw pi-book', to: '/pedidos-todos', requiredRole: ['Administrador', 'Gerente'] },
            // { label: 'Todos - Comprador Externo', icon: 'pi pi-fw pi-book', to: '/pedidos-todos-externo', requiredRole: ['Administrador', 'Gerente'] },
            // { label: 'Pedidos Aprovados', icon: 'pi pi-fw pi-check-circle', to: '/pedidos-aprovados', requiredRole: ['Gerente', 'Administrador', 'Comprador', 'Comprador Externo'] },
            // { label: 'Para Aprovação de Fluxo', icon: 'pi pi-fw pi-reply', to: '/aprovacao-gerentes', requiredRole: ['Diretor', 'Gerente', 'Administrador'] },
            // { label: 'Justificar Pedidos Reprovados por Gestor | Diretor', icon: 'pi pi-fw pi-pencil', to: '/reprovados-gestor', requiredRole: ['Comprador', 'Administrador', 'Comprador Externo', 'Fiscal'] },
            // { label: 'Justificar Pedidos Aprovados com Ressalva', icon: 'pi pi-fw pi-pencil', to: '/pedidos-ressalva', requiredRole: ['Gerente', 'Administrador', 'Comprador Externo', 'Diretor'] },
            // { label: 'Justificar Pedidos Reprovados', icon: 'pi pi-fw pi-pencil', to: '/pedidos-reprovados', requiredRole: ['Gestor de Fluxo', 'Administrador', 'Gerente', 'Comprador Externo', 'Diretor', 'Comprador', 'Fiscal'] },
            // { label: 'Justificar Notas Reprovados pelo Fiscal', icon: 'pi pi-fw pi-pencil', to: '/pedidos-reprovados-fiscal', requiredRole: ['Comprador', 'Administrador', 'Gestor de Fluxo'] },
            // { label: 'Justificar Pedidos Reprovados por Soleni', icon: 'pi pi-fw pi-pencil', to: '/reprovados-soleni', requiredRole: ['Comprador', 'Administrador', 'Gerente', 'Comprador Externo'] }
        ]
    },
    // {
    // label: 'Almoxarifado',
    // items: [{ label: 'Controle de LMs', icon: 'pi pi-fw pi-book', to: '/controle-lms-almoxarife', requiredRole: ['Administrador', 'Almoxarife'] }]
    // },
    // {
    // label: 'Listas de Materiais',
    // items: [
    // { label: 'Dashboard', icon: 'pi pi-fw pi-book', to: '/dashboard-lm', requiredRole: ['Gerente', 'Administrador'] },
    // { label: 'Cadastro LM', icon: 'pi pi-fw pi-book', to: '/cadastro-lm', requiredRole: ['Administrador', 'Engenheiro'] },
    // { label: 'Acompanhamento de LM', icon: 'pi pi-fw pi-book', to: '/alteracao-lms-engenharia', requiredRole: ['Administrador', 'Engenheiro', 'Gerente', 'Almoxarife', 'Comprador'] },
    // { label: 'Controle de LMs', icon: 'pi pi-fw pi-book', to: '/controle-lms-almoxarife', requiredRole: ['Administrador', 'Almoxarife'] },
    // { label: 'Minhas LMs', icon: 'pi pi-fw pi-book', to: '/minhas-lms', requiredRole: ['Comprador Externo', 'Comprador', 'Administrador'] },
    // { label: 'LMs', icon: 'pi pi-fw pi-book', to: '/todas-lms', requiredRole: ['Administrador', 'Diretor', 'Gerente'], requiredNome: ['Eduardo C. Resplandes', 'Paulo', 'Cairo'] }
    // ]
    // },
    {
        label: 'Administração',
        items: [
            { label: 'Usuários', icon: 'pi pi-fw pi-users', to: '/usuarios', requiredRole: ['Administrador'] },
            { label: 'Empresas', icon: 'pi pi-fw pi-building', to: '/empresas', requiredRole: ['Administrador'] }
            // { label: 'Link Externo de Aprovação', icon: 'pi pi-fw pi-users', to: '/aprovacao-externa/:id_pedido', requiredRole: ['Administrador'] }
        ]
    },
    {
        label: 'Relatórios',
        items: [
            { label: 'Pedidos Aprovados', icon: 'pi pi-fw pi-chart-bar', to: '/relatorio-aprovados', requiredRole: ['Administrador', 'Gestor de Fluxo', 'Auxiliar de Fluxo'] },
            { label: 'Pedidos Reprovados', icon: 'pi pi-fw pi-chart-bar', to: '/relatorio-reprovados', requiredRole: ['Administrador', 'Gestor de Fluxo', 'Auxiliar de Fluxo'] },
            { label: 'Informações', icon: 'pi pi-fw pi-chart-bar', to: '/graficos', requiredRole: ['Administrador', 'Gestor de Fluxo'] }
            // { label: 'Informações de Pedido', icon: 'pi pi-fw pi-building', to: '/info-pedido/:id', requiredRole: ['Administrador'] }
        ]
    },
    {
        label: 'Presidência',
        items: [
            { label: 'Emival', icon: 'pi pi-fw pi-users', to: '/emival-novo', requiredRole: ['Presidente', 'Administrador'] },
            { label: 'Emival Temp.', icon: 'pi pi-fw pi-users', to: '/emival-temporario', requiredRole: ['Presidente', 'Administrador'] },
            // { label: 'Emival 2.0', icon: 'pi pi-fw pi-users', to: '/emival-novo', requiredRole: ['Presidente', 'Administrador'] },
            { label: 'Giovana', icon: 'pi pi-fw pi-users', to: '/giovana', requiredRole: ['Diretor', 'Administrador'], requiredNome: ['Giovana', 'Eduardo C. Resplandes'] },
            { label: 'Auditoria', icon: 'pi pi-fw pi-book', to: '/pedidos-antecipados', requiredRole: ['Presidente', 'Administrador'] },
            { label: 'Mônica', icon: 'pi pi-fw pi-users', to: '/monica', requiredRole: ['Presidente', 'Administrador'], requiredNome: ['Mônica Caiado', 'Eduardo C. Resplandes'] }
        ]
    },
    // {
    // label: 'Controle de Caixa',
    // items: [{ label: 'Controle', icon: 'pi pi-fw pi-users', to: '/controle-caixa', requiredRole: ['Gestor de Fluxo', 'Administrador'], requiredNome: ['Soleni', 'Eduardo C. Resplandes'] }]
    // },
    {
        // label: 'P
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                // label: 'Landing',
                // icon: 'pi pi-fw pi-globe',
                to: '/landing/:id_pedido',
                requiredRole: ['Administrador']
            }
        ]
    }
]);

// Função para filtrar o menu com base na função do usuário
const filteredMenu = computed(() => {
    return model.value
        .map((section) => {
            const filteredItems = section.items.filter((item) => {
                const roleCheck = !item.requiredRole || item.requiredRole.includes(userRole);
                const nomeCheck = !item.requiredNome || item.requiredNome.includes(nome);
                return roleCheck && nomeCheck;
            });
            return { ...section, items: filteredItems };
        })
        .filter((section) => section.items.length > 0);
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in filteredMenu" :key="item.label">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
