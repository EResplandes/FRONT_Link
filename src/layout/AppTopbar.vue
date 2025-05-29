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
    return `../../public/assets/img/logo_sem_fundo.png`;
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
        <Dialog :closable="false" v-model:visible="visible" modal header="MUDANÇA DE SENHA" :style="{ width: '40rem', borderRadius: '12px' }" headerClass="dialog-header-blue">
            <hr class="border-blue-200" />
            <span class="text-blue-600 block mb-5 text-sm"> Bem-vindo(a)! Para garantir a segurança da sua conta, é necessário definir uma nova senha no seu primeiro acesso. </span>
            <hr class="border-blue-200 mb-4" />

            <div class="mb-3">
                <label for="email" class="font-semibold block mb-2 text-blue-800">DIGITE UMA NOVA SENHA:</label>
                <Password id="password1" v-model="nova_senha" placeholder="Digite sua senha..." :feedback="false" :toggleMask="true" class="w-full mb-3 custom-password" inputClass="w-full" toggleMaskClass="text-blue-500"></Password>
            </div>

            <div class="mb-5">
                <label for="email" class="font-semibold block mb-2 text-blue-800">DIGITE NOVAMENTE:</label>
                <Password id="password1" v-model="nova_senha_repitida" placeholder="Digite sua senha..." :feedback="false" :toggleMask="true" class="w-full mb-3 custom-password" inputClass="w-full" toggleMaskClass="text-blue-500"></Password>
            </div>

            <div v-if="erro_senhas" class="mb-5">
                <Message severity="error" class="border-red-300 bg-red-50 text-red-700"> As senhas digitadas devem ser iguais. </Message>
            </div>

            <div class="flex justify-end gap-2">
                <Button class="w-full" type="button" label="Salvar" severity="info" @click="alteraSenhaAtual()" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"></Button>
            </div>
        </Dialog>

        <router-link to="/" class="layout-topbar-logo">
            <img width="130" :src="logoUrl" alt="logo" />
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars text-blue-800"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v text-blue-800"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="showTemplate" class="p-link layout-topbar-button" label="Sair">
                <i class="pi pi-unlock m-1 text-blue-500"></i>
            </button>
            <button @click="logout()" class="p-link layout-topbar-button" label="Sair">
                <i class="pi pi-sign-out m-1 text-blue-500"></i>
                <span class="text-blue-600">Sair</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layout-topbar {
    background: linear-gradient(135deg, #1a3a9a 0%, #1e40af 100%);
    border-bottom: 1px solid #142d7a;
    box-shadow: 0 2px 10px rgba(30, 64, 175, 0.3);
    color: white;

    /* Ajustes para elementos internos */
    .layout-topbar-button {
        color: #e0f2fe !important;
        &:hover {
            color: white !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
        }
    }

    .layout-topbar-logo img {
        filter: brightness(0) invert(1);
    }

    .layout-menu-button i,
    .layout-topbar-menu-button i {
        color: #bfdbfe !important;
    }
}

.dialog-header-blue {
    background: linear-gradient(135deg, #1a3a9a 0%, #1d4ed8 100%) !important;
    color: white !important;
    border-top-left-radius: 12px !important;
    border-top-right-radius: 12px !important;
    padding: 1.5rem !important;
    font-weight: 600 !important;
}

.custom-password {
    .p-password-input {
        padding: 0.75rem 1rem !important;
        border-radius: 8px !important;
        border: 1px solid #bfdbfe !important;
        transition: all 0.3s ease;

        &:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.2) !important;
        }
    }

    .p-password-toggle {
        color: #3b82f6 !important;
        &:hover {
            color: #1d4ed8 !important;
        }
    }
}

.layout-topbar-button {
    color: #3b82f6 !important;
    transition: all 0.3s ease;

    &:hover {
        background-color: #e0f2fe !important;
    }

    i {
        transition: all 0.3s ease;
    }
}

.layout-topbar-menu {
    background: white;
    border: 1px solid #e0f2fe;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    border-radius: 8px;

    button {
        color: #1e40af !important;
        transition: all 0.2s ease;

        &:hover {
            background-color: #f0f9ff !important;
        }
    }
}

.p-link {
    &:focus {
        box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.2) !important;
    }
}

.layout-topbar-logo img {
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }
}
</style>
