<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import AutenticacaoService from '../../../service/AutenticacaoService';
import { useRouter } from 'vue-router';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            autenticacaoService: new AutenticacaoService(),
            router: useRouter(),
            email: ref(null),
            password: ref(null),
            message: ref([]),
            count: ref(0),
            remember: ref(false),
            form: ref({}),
            loading: ref(false)
        };
    },
    methods: {
        async login() {
            this.loading = true;
            const camposObrigatorios = ['email', 'senha'];
            let todosCamposPreenchidos = true;

            for (const campo of camposObrigatorios) {
                if (!this.form[campo]) {
                    this.showError(`O campo ${campo.toUpperCase()} é obrigatório!`);
                    todosCamposPreenchidos = false;
                }
            }

            if (!todosCamposPreenchidos) {
                this.loading = false;
                return;
            }

            try {
                const data = await this.autenticacaoService.login(this.form);

                if (data.usuario[0].status != 'Ativo') {
                    this.showError('Usuário inativo, entre em contato com o Administrador!');
                    return;
                }

                if (data.resposta != 'Autenticação realizada com sucesso!') {
                    this.addMessage('error');
                    return;
                }

                // Salva no localStorage os dados do usuário
                localStorage.clear();
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario_id', data.usuario[0].id);
                localStorage.setItem('usuario_email', data.usuario[0].email);
                localStorage.setItem('nome', data.usuario[0].nome);
                localStorage.setItem('funcao', data.usuario[0].funcao.funcao);
                localStorage.setItem('grupo', data.usuario[0].grupo.grupo);
                localStorage.setItem('local_id', data.usuario[0]?.local?.id);
                localStorage.setItem('p_acesso', data.usuario[0].p_acesso);
                localStorage.setItem('status_usuario', data.usuario[0].status);

                // Redirecionamentos específicos
                if (data.usuario[0].id == '1') {
                    this.router.push('/emival-novo');
                } else if (data.usuario[0].id == '3') {
                    this.router.push('/monica');
                } else {
                    this.router.push('/');
                }
            } catch (error) {
                this.addMessage('error');
            } finally {
                this.loading = false;
            }
        },

        addMessage(type) {
            if (type === 'success') {
                this.message = [{ severity: 'success', detail: 'Mensagem de sucesso!', content: 'Autenticação feita com sucesso!', id: this.count++ }];
            } else if (type === 'error') {
                this.message = [{ severity: 'error', detail: 'Mensagem de erro!', content: 'Usuário ou senha inválidos!', id: this.count++ }];
            }
        },

        showError(mensagem) {
            this.toast.add({ severity: 'error', summary: 'Ocorreu um erro!', detail: mensagem, life: 3000 });
        }
    }
};
</script>

<template>
    <div class="login-container">
        <Toast position="top-right" />

        <div class="login-background">
            <div class="login-card">
                <div class="login-header">
                    <div class="logo-container">
                        <i class="pi pi-link" style="font-size: 2.5rem; color: #3b82f6"></i>
                        <h1>Link Web</h1>
                    </div>
                    <p class="welcome-text">Bem-vindo de volta! Por favor faça login para continuar.</p>
                </div>

                <div class="login-form">
                    <div class="input-group">
                        <span class="p-float-label">
                            <InputText id="email" type="email" v-model="form.email" class="w-full" autocomplete="username" />
                            <label for="email">E-mail</label>
                        </span>
                        <i class="pi pi-envelope input-icon"></i>
                    </div>

                    <div class="input-group mt-5">
                        <span class="p-float-label">
                            <InputText type="password" id="password" v-model="form.senha" :feedback="false" :toggleMask="true" class="w-full" inputClass="w-full" autocomplete="current-password" />
                            <label for="password">Senha</label>
                        </span>
                        <i class="pi pi-lock input-icon"></i>
                    </div>

                    <div class="flex justify-content-between align-items-center mb-5">
                        <div class="flex align-items-center">
                            <Checkbox id="remember" v-model="remember" :binary="true" />
                            <label for="remember" class="ml-2 text-sm">Lembrar-me</label>
                        </div>
                        <!-- <a href="#" class="text-sm text-blue-500 hover:text-blue-700">Esqueceu a senha?</a> -->
                    </div>

                    <Button @click.prevent="login()" label="Entrar" class="w-full login-button" :loading="loading" />
                    <div class="mt-6">
                        <transition-group name="message-fade" tag="div" class="message-container">
                            <div v-for="msg of message" :key="msg.id || msg.content" :class="['custom-message', `custom-message-${msg.severity}`]" class="message-animation">
                                <span class="message-text">{{ msg.content }}</span>
                            </div>
                        </transition-group>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.login-background {
    width: 100%;
    max-width: 28rem;
    perspective: 1000px;
}

.login-card {
    background: white;
    border-radius: 1.5rem;
    padding: 2.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    transform-style: preserve-3d;
}

.login-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.logo-container h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e40af;
    margin-left: 0.75rem;
}

.welcome-text {
    color: #64748b;
    font-size: 0.875rem;
}

.login-form {
    margin-bottom: 1.5rem;
}

.input-group {
    position: relative;
    margin-bottom: 1.5rem;
}

.input-icon {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    color: #94a3b8;
    z-index: 1;
}

.p-float-label {
    display: block;
}

.p-float-label label {
    left: 2.5rem !important;
    color: #94a3b8 !important;
}

.p-inputtext,
.p-password input {
    padding-left: 3rem !important;
    border-radius: 0.75rem !important;
    border: 1px solid #e2e8f0 !important;
    transition: all 0.3s ease;
}

.p-inputtext:focus,
.p-password input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.2) !important;
}

.login-button {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
    border: none !important;
    border-radius: 0.75rem !important;
    padding: 1rem !important;
    font-weight: 600 !important;
    transition: all 0.3s ease;
}

.login-button:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
    transform: translateY(-2px);
}

.login-button:active {
    transform: translateY(0);
}

.login-footer {
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
}

.message-animation {
    margin-bottom: 1rem;
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 640px) {
    .login-card {
        padding: 1.5rem;
    }
}

/* Estilo para o container das mensagens */
.message-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
}

/* Estilo base para todas as mensagens */
.custom-message {
    padding: 1rem;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    margin-bottom: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Estilo específico para mensagens de erro */
.custom-message-error {
    background-color: #fee2e2; /* fundo vermelho claro */
    border: 1px solid #fca5a5;
}

/* Estilo do texto da mensagem */
.message-text {
    color: #dc2626; /* vermelho escuro */
    font-weight: bold; /* negrito */
    font-size: 1rem;
}

/* Animações */
.message-animation {
    animation: messageIn 0.3s ease-out;
}

@keyframes messageIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-fade-enter-active,
.message-fade-leave-active {
    transition: all 0.3s ease;
}

.message-fade-enter-from,
.message-fade-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>
