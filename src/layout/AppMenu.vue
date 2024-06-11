<script setup>
import { ref, computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const userRole = localStorage.getItem('funcao');
const nome = localStorage.getItem('nome');

// Adicionando a propriedade `requiredRole` aos itens do menu
const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/', requiredRole: ['Administrador', 'Gestor de Fluxo', 'Diretor', 'Gerente', 'Comprador'] },
            { label: 'Todos meus pedidos', icon: 'pi pi-fw pi-book', to: '/pedidos-todos-comprador', requiredRole: ['Administrador', 'Comprador', 'Gestor de Fluxo', 'Comprador Externo', 'Gerente'] }
        ]
    },
    {
        label: 'Gestor de Fluxo',
        items: [
            { label: 'Pedidos com Emival', icon: 'pi pi-fw pi-book', to: '/pedidos-emival', requiredRole: ['Gestor de Fluxo', 'Administrador', 'Comprador Externo'] },
            { label: 'Pedidos com Monica', icon: 'pi pi-fw pi-book', to: '/pedidos-monica', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            { label: 'Análise de Fluxo', icon: 'pi pi-fw pi-sitemap', to: '/gestor-fluxo', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            { label: 'Todos', icon: 'pi pi-fw pi-book', to: '/todos-pedidos-soleni', requiredRole: ['Gestor de Fluxo', 'Administrador'] }
        ]
    },
    {
        label: 'Cadastro de Pedido',
        items: [
            { label: 'Cadastro SEM FLUXO', icon: 'pi pi-fw pi-book', to: '/cadastro-sem-fluxo', requiredRole: ['Gestor de Fluxo', 'Administrador', 'Comprador Externo', 'Comprador'] },
            { label: 'Cadastro COM FLUXO', icon: 'pi pi-fw pi-book', to: '/cadastro-pedido', requiredRole: ['Gerente', 'Administrador', 'Comprador', 'Gestor de Fluxo'] }
        ]
    },
    {
        label: 'Módulo Fiscal',
        items: [
            { label: 'Pedidos para Escriturar', icon: 'pi pi-fw pi-book', to: '/pedidos-escriturar', requiredRole: ['Fiscal', 'Administrador'] },
            { label: 'Pedidos Reprovados pelo Financeiro', icon: 'pi pi-fw pi-book', to: '/pedidos-reprovados-financeiro', requiredRole: ['Fiscal', 'Administrador'] }
        ]
    },
    {
        label: 'Módulo Financeiro',
        items: [
            { label: 'Pedidos', icon: 'pi pi-fw pi-book', to: '/pedidos-financeiro', requiredRole: ['Fiscal', 'Administrador'] },
            { label: 'Pagamentos', icon: 'pi pi-fw pi-book', to: '/pagamento-parcelas', requiredRole: ['Fiscal', 'Administrador'] },
            { label: 'Pedidos | Conferência', icon: 'pi pi-fw pi-book', to: '/pedidos-financeiro', requiredRole: ['Fiscal', 'Administrador'] }
        ]
    },
    {
        label: 'Meus pedidos',
        items: [
            { label: 'Todos', icon: 'pi pi-fw pi-book', to: '/pedidos-todos', requiredRole: ['Administrador', 'Comprador', 'Gerente'] },
            { label: 'Todos - Comprador Externo', icon: 'pi pi-fw pi-book', to: '/pedidos-todos-externo', requiredRole: ['Administrador', 'Comprador Externo'] },
            { label: 'Pedidos Aprovados', icon: 'pi pi-fw pi-check-circle', to: '/pedidos-aprovados', requiredRole: ['Gerente', 'Administrador', 'Comprador', 'Comprador Externo'] },
            { label: 'Para Aprovação de Fluxo', icon: 'pi pi-fw pi-reply', to: '/aprovacao-gerentes', requiredRole: ['Diretor', 'Gerente', 'Administrador'] },
            { label: 'Justificar Pedidos Reprovados por Gestor | Diretor', icon: 'pi pi-fw pi-pencil', to: '/reprovados-gestor', requiredRole: ['Comprador', 'Administrador'] },
            { label: 'Justificar Pedidos Aprovados com Ressalva', icon: 'pi pi-fw pi-pencil', to: '/pedidos-ressalva', requiredRole: ['Gerente', 'Administrador', 'Comprador Externo', 'Diretor'] },
            { label: 'Justificar Pedidos Reprovados', icon: 'pi pi-fw pi-pencil', to: '/pedidos-reprovados', requiredRole: ['Gestor de Fluxo', 'Administrador', 'Gerente', 'Comprador Externo', 'Diretor'] },
            { label: 'Justificar Notas Reprovados pelo Fiscal', icon: 'pi pi-fw pi-pencil', to: '/pedidos-reprovados-fiscal', requiredRole: ['Comprador', 'Administrador', 'Gestor de Fluxo'] },
            { label: 'Justificar Pedidos Reprovados por Soleni', icon: 'pi pi-fw pi-pencil', to: '/reprovados-soleni', requiredRole: ['Comprador', 'Administrador', 'Gerente'] }
        ]
    },
    {
        label: 'Administração',
        items: [
            { label: 'Usuários', icon: 'pi pi-fw pi-users', to: '/usuarios', requiredRole: ['Administrador'] },
            { label: 'Empresas', icon: 'pi pi-fw pi-building', to: '/empresas', requiredRole: ['Administrador'] },
            { label: 'Link Externo de Aprovação', icon: 'pi pi-fw pi-users', to: '/aprovacao-externa/:id_pedido', requiredRole: ['Administrador'] }
        ]
    },
    {
        label: 'Relatórios',
        items: [
            { label: 'Pedidos Aprovados', icon: 'pi pi-fw pi-chart-bar', to: '/relatorio-aprovados', requiredRole: ['Administrador', 'Gestor de Fluxo'] },
            { label: 'Pedidos Reprovados', icon: 'pi pi-fw pi-chart-bar', to: '/relatorio-reprovados', requiredRole: ['Administrador', 'Gestor de Fluxo'] },
            { label: 'Informações', icon: 'pi pi-fw pi-chart-bar', to: '/graficos', requiredRole: ['Administrador', 'Gestor de Fluxo'] }
        ]
    },
    {
        label: 'Presidência',
        items: [
            { label: 'Emival', icon: 'pi pi-fw pi-users', to: '/emival', requiredRole: ['Presidente', 'Administrador'] },
            { label: 'Mônica', icon: 'pi pi-fw pi-users', to: '/monica', requiredRole: ['Presidente', 'Administrador'], requiredNome: ['Mônica Caiado', 'Eduardo C. Resplandes'] }
        ]
    },
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'Landing',
                icon: 'pi pi-fw pi-globe',
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
