<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import API_URL from '../service/config';
import { useToast } from 'primevue/usetoast';
import RelatorioService from '../service/RelatorioService';
import AutenticacaoService from '../service/AutenticacaoService';
import Dialog from 'primevue/dialog';

const { layoutConfig, onMenuToggle, setScale } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const relatorioService = new RelatorioService();
const autenticacaoService = new AutenticacaoService();
const visible = ref(false);
const toast = useToast();
const pedidos = ref(null);
const nomeUsuario = localStorage.getItem('nome');
const nova_senha_repitida = ref(null);
const nova_senha = ref(null);
const erro_senhas = ref(null);

onMounted(() => {
    decrementScale(1);
    bindOutsideClickListener();

    const token = localStorage.getItem('token');
    const status = localStorage.getItem('status_usuario');
    const acesso = localStorage.getItem('p_acesso');

    // Verifica se o usuário está logado
    if (token == '' || token == null || token == undefined) {
        router.push('/auth/login'); // Mandando para tela login
    }

    // Verifica se usuário logado é o Dr. Emival para não resetar a senha dele
    if (nomeUsuario != 'Emival Caiado' && acesso == 1) {
        visible.value = true;
    } else {
        visible.value = false;
    }

    relatorioService.buscaStatusPedidosPessoa(localStorage.getItem('usuario_id')).then((data) => {
        pedidos.value = data.informacoes;
    });
});

const alteraSenhaAtual = () => {
    erro_senhas.value = false;

    if (nova_senha.value == nova_senha_repitida.value) {
        autenticacaoService.alteraSenha(nova_senha.value, localStorage.getItem('usuario_id')).then((data) => {
            if (data.resposta == 'Senha alterada com sucesso!') {
                showSuccess();
                visible.value = false;
                localStorage.setItem('p_acesso', '0');
            }
        });
    } else {
        erro_senhas.value = true;
    }
};

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

const showSuccess = () => {
    toast.add({ severity: 'success', summary: 'NOVA MENSAMGEM:', detail: 'Senha alterada com sucesso!', life: 3000 });
};
</script>

<template>
    <Toast />

    <div class="layout-topbar">
        <Dialog :closable="false" v-model:visible="visible" modal header="MUDANÇA DE SENHA" :style="{ width: '40rem' }">
            <hr />
            <span class="text-surface-500 dark:text-surface-400 block mb-5">Bem-vindo(a)! Para garantir a segurança da sua conta, é necessário definir uma nova senha no seu primeiro acesso. </span>
            <hr />
            <div class="mb-3">
                <label for="email" class="font-semibold block mb-3">DIGITE UMA NOVA SENHA:</label>
                <Password id="password1" v-model="nova_senha" placeholder="Digite sua senha..." :feedback="false" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>
            </div>
            <div class="mb-5">
                <label for="email" class="font-semibold block mb-3">DIGITE NOVAMENTE:</label>
                <Password id="password1" v-model="nova_senha_repitida" placeholder="Digite sua senha..." :feedback="false" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>
            </div>
            <div v-if="erro_senhas" class="mb-5">
                <Message severity="error">As senhas digitadas devem ser iguais.</Message>
            </div>
            <div class="flex justify-end gap-2">
                <Button class="w-full" type="button" label="Salvar" severity="info" @click="alteraSenhaAtual()"></Button>
            </div>
        </Dialog>

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
                <i class="pi pi-use m-1"></i>
            </button>
            <button @click="logout()" class="p-link layout-topbar-button" label="Sair"><i class="pi pi-sign-out m-1"></i> Sair</button>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
