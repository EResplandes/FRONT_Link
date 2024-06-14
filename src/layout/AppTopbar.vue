<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import API_URL from '../service/config';
import { useToast } from 'primevue/usetoast';
import RelatorioService from '../service/RelatorioService';

const { layoutConfig, onMenuToggle, setScale } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const relatorioService = new RelatorioService();
const visible = ref(false);
const toast = useToast();
const pedidos = ref(null);
const nomeUsuario = localStorage.getItem('nome');

onMounted(() => {
    decrementScale(1);
    bindOutsideClickListener();

    const token = localStorage.getItem('token');
    const status = localStorage.getItem('status_usuario');

    // Verifica se o usuário está logado
    if (token == '' || token == null || token == undefined) {
        router.push('/auth/login'); // Mandando para tela login
    }

    relatorioService.buscaStatusPedidosPessoa(localStorage.getItem('usuario_id')).then((data) => {
        pedidos.value = data.informacoes;
    });

    // // Verifica se o usuário está ativo, se não estiver ele deslogado o usuário
    // if (status != 'Ativo') {
    //     localStorage.clear();
    //     router.push('/auth/access'); // Mandando para tela login
    // }
});

const decrementScale = (v) => {
    setScale(layoutConfig.scale.value - v);
    applyScale();
};

const logout = () => {
    localStorage.clear();
    router.push('/auth/login'); // Mandando para tela login
};

const applyScale = () => {
    document.documentElement.style.fontSize = layoutConfig.scale.value + 'px';
};

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = computed(() => {
    return `https://www.gruporialma.com.br/wp-content/uploads/2023/12/imagem_2023-12-01_162149885.png`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};
const onSettingsClick = () => {
    topbarMenuActive.value = false;
    router.push('/documentation');
};
const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

const showTemplate = () => {
    if (!visible.value) {
        toast.add({ severity: 'success', summary: 'Can you send me the report?', group: 'bc' });
        visible.value = true;
    }
};
const onClose = () => {
    visible.value = false;
};

const applyRowStyle = () => {
    return '#1ea97c';
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="logo" />
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="showTemplate" class="p-link layout-topbar-button" label="Sair">
                <i class="pi pi-bell m-1"></i>
            </button>
            <button @click="logout()" class="p-link layout-topbar-button" label="Sair">
                <i class="pi pi-sign-out m-1"></i>
            </button>
        </div>

        <Toast position="bottom-right" group="bc" @close="onClose">
            <template #message="slotProps">
                <div class="flex flex-column align-items-start" style="flex: 1; max-height: 600px; overflow-y: auto">
                    <li>
                        <ul v-for="pedido in pedidos">
                            <span style="font-weight: 800">{{ pedido.status }} <Badge style="background-color: black" :value="pedido.total"></Badge></span>
                        </ul>
                    </li>
                </div>
            </template>
        </Toast>
    </div>
</template>

<style lang="scss" scoped></style>
