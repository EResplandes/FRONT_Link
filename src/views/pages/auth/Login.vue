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
            form: ref({})
        };
    },
    methods: {
        login() {
            this.autenticacaoService.login(this.form).then((data) => {
                if (data.resposta != 'Autenticação realizada com sucesso!') {
                    this.addMessage('error');
                } else {
                    // Salva no localStorage os dados do usuário
                    console.log(data.usuario[0].id);
                    localStorage.clear();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('usuario_id', data.usuario[0].id);
                    localStorage.setItem('usuario_email', data.usuario[0].email);
                    localStorage.setItem('nome', data.usuario[0].nome);
                    localStorage.setItem('funcao', data.usuario[0].funcao.funcao);
                    localStorage.setItem('grupo', data.usuario[0].grupo.grupo);
                    localStorage.setItem('local_id', data.usuario[0]?.local?.id);

                    if (data.usuario[0].id == '1') {
                        this.router.push('/emival'); // Mandando para tela principal
                    } else {
                        console.log('caiu aqui!');
                        this.router.push('/'); // Mandando para tela principal
                    }
                }
            });
        },

        addMessage(type) {
            if (type === 'success') {
                this.message = [{ severity: 'success', detail: 'Mensagem de sucesso!', content: 'Autenticação feita com sucesso!', id: this.count++ }];
            } else if (type === 'error') {
                this.message = [{ severity: 'error', detail: 'Mensagem de erro!', content: 'Usuário ou senha inválidos!', id: this.count++ }];
            }
        }
    }
};
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--surface-600) 10%, rgba(999, 999, 999, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Link Web</div>
                    </div>

                    <transition-group name="p-message" tag="div">
                        <Message v-for="msg of message" :severity="msg.severity" :key="msg.content">{{ msg.content }} </Message>
                    </transition-group>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Digite seu e-mail" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="form.email" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Senha</label>
                        <Password id="password1" v-model="form.senha" placeholder="Digite sua senha..." :feedback="false" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5"></div>
                        <Button @click.prevent="login()" label="Entrar" class="w-full p-3 text-xl"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
