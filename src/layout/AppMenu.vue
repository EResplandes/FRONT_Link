<script setup>
import { ref, computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const userRole = localStorage.getItem('funcao');

// Adicionando a propriedade `requiredRole` aos itens do menu
const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/', requiredRole: ['Administrador', 'Gestor de Fluxo', 'Diretor', 'Gerente', 'Comprador'] }]
    },
    {
        label: 'Gestor de Fluxo',
        items: [
            { label: 'Pedidos com Emival', icon: 'pi pi-fw pi-book', to: '/pedidos-emival', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            { label: 'Pedidos com Monica', icon: 'pi pi-fw pi-book', to: '/pedidos-monica', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            { label: 'Todos', icon: 'pi pi-fw pi-book', to: '/pedidos-todos', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            { label: 'Análise de Fluxo', icon: 'pi pi-fw pi-book', to: '/gestor-fluxo', requiredRole: ['Gestor de Fluxo', 'Administrador'] },
            { label: 'Cadastro sem Fluxo', icon: 'pi pi-fw pi-book', to: '/cadastro-sem-fluxo', requiredRole: ['Gestor de Fluxo', 'Administrador'] }
        ]
    },
    {
        label: 'Meus pedidos',
        items: [
            { label: 'Cadastro de Pedido', icon: 'pi pi-fw pi-book', to: '/cadastro-pedido', requiredRole: ['Gerente', 'Administrador', 'Comprador'] },
            { label: 'Pedidos Aprovados', icon: 'pi pi-fw pi-check-circle', to: '/pedidos-aprovados', requiredRole: ['Gerente', 'Administrador', 'Comprador'] },
            { label: 'Pedidos Aprovados com Ressalva', icon: 'pi pi-fw pi-check-circle', to: '/pedidos-ressalva', requiredRole: ['Gerente', 'Administrador'] },
            { label: 'Para Aprovação de Fluxo', icon: 'pi pi-fw pi-check-circle', to: '/aprovacao-gerentes', requiredRole: ['Diretor', 'Gerente', 'Administrador'] },
            { label: 'Pedidos Reprovados', icon: 'pi pi-fw pi-book', to: '/pedidos-reprovados', requiredRole: ['Gestor de Fluxo', 'Administrador', 'Gerente'] }
        ]
    },
    {
        label: 'Administração',
        items: [
            { label: 'Usuários', icon: 'pi pi-fw pi-users', to: '/usuarios', requiredRole: ['Administrador'] },
            { label: 'Empresas', icon: 'pi pi-fw pi-building', to: '/empresas', requiredRole: ['Administrador'] },
            { label: 'Link Externo de Aprovação', icon: 'pi pi-fw pi-building', to: '/aprovacao-externa/:id_pedido', requiredRole: ['Administrador'] }
        ]
    },
    {
        label: 'Presidência',
        items: [
            { label: 'Emival', icon: 'pi pi-fw pi-users', to: '/emival', requiredRole: ['Presidente', 'Administrador'] }
            // { label: 'Mônica', icon: 'pi pi-fw pi-building', to: '/monica', requiredRole: ['Presidente', 'Administrador'] }
        ]
    }
]);

// Função para filtrar o menu com base na função do usuário
const filteredMenu = computed(() => {
    return model.value
        .map((section) => {
            const filteredItems = section.items.filter((item) => {
                return !item.requiredRole || item.requiredRole.includes(userRole);
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
