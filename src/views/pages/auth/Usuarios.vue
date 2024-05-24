<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import EmpresaService from '../../../service/EmpresaService';
import FuncionarioService from '../../../service/FuncionarioService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            empresaService: new EmpresaService(),
            funcionarioService: new FuncionarioService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            loading1: ref(null),
            form: ref({}),
            editar: ref(false),
            funcionarios: ref(false),
            grupos: ref(false),
            funcoes: ref(false),
            preloading: ref(true),
            display: ref(false)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos funcionários/usuários do sistema
        this.funcionarioService.buscaFuncionarios().then((data) => {
            if (data.resposta == 'Usuários listados com sucesso!') {
                console.log(data);
                this.funcionarios = data.usuarios;
                this.preloading = false;
            }
        });

        // Metódo responsável por buscar todos grupos
        this.funcionarioService.buscaGrupos().then((data) => {
            if (data.resposta == 'Grupos listados com sucesso!') {
                this.grupos = data.grupos;
            }
        });

        // Metódo responsável por buscar todas funções
        this.funcionarioService.buscaFuncoes().then((data) => {
            if (data.resposta == 'Funções listadas com sucesso!') {
                this.funcoes = data.funcoes;
            }
        });
    },

    methods: {
        // Metódo responsável por buscar todas funcionários
        buscaFuncionarios() {
            this.preloading = true;
            this.funcionarioService.buscaFuncionarios().then((data) => {
                if (data.resposta == 'Usuários listados com sucesso!') {
                    this.funcionarios = data.usuarios;
                    this.preloading = false;
                }
            });
        },

        // Metódo responsável por abrir confiramção de desativar usuário
        confirmDesativar(id_funcionario) {
            this.confirm.require({
                message: 'Tem certeza que deseja desativar esse usuário?',
                header: 'Desativar Usuário?',
                icon: 'pi pi-info-circle',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Desativar',
                rejectClass: 'p-button-secondary p-button-outlined',
                acceptClass: 'p-button-danger',
                accept: () => {
                    this.desativarFuncionario(id_funcionario);
                },
                reject: () => {}
            });
        },

        // Metódo responsável por ativar usuário
        ativar(id_funcionario) {
            this.funcionarioService.ativaFuncionario(id_funcionario).then((data) => {
                if (data.resposta == 'Funcionário ativado com sucesso!') {
                    this.showSuccess('Funcionário ativado com sucesso!');
                    this.buscaFuncionarios();
                }
            });
        },

        // Metódo responsável por desativar usuário
        desativarFuncionario(id_funcionario) {
            this.funcionarioService.desativarFuncionario(id_funcionario).then((data) => {
                if (data.resposta == 'Funcionário desativado com sucesso!') {
                    this.showSuccess('Funcionário desativado com sucesso!');
                    this.buscaFuncionarios();
                }
            });
        },

        // Metódo responsável por cadastrar usuário
        cadastrarUsuario() {
            // Array com os nomes dos campos obrigatórios
            const camposObrigatorios = ['nome', 'email', 'funcao', 'grupo'];

            // Variável para verificar se todos os campos obrigatórios estão preenchidos
            let todosCamposPreenchidos = true;

            // Iterar sobre os campos obrigatórios
            for (const campo of camposObrigatorios) {
                // Verificar se o campo está vazio
                if (!this.form[campo]) {
                    // Se estiver vazio, exibir mensagem de erro e definir a variável como falsa
                    this.showError(`O campo ${campo.toUpperCase()} é obrigatório!`);
                    todosCamposPreenchidos = false;
                }
            }
            // Verificar se todos os campos obrigatórios foram preenchidos antes de cadastrar o pedido
            if (todosCamposPreenchidos) {
                this.funcionarioService.cadastraFuncionario(this.form).then((data) => {
                    if (data.resposta == 'Usuário criado com sucesso!') {
                        this.buscaFuncionarios();
                        this.showSuccess('Usuários cadastrado com sucesso!');
                        this.form = {};
                    } else {
                        this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                    }
                });
            }
        },

        cadastrar() {
            this.visibleRight = true;
            this.editar = false;
        },

        showSuccess(mensagem) {
            this.toast.add({ severity: 'success', summary: 'Sucesso!', detail: mensagem, life: 3000 });
        },

        showInfo(mensagem) {
            this.toast.add({ severity: 'info', summary: 'Aviso!', detail: mensagem, life: 3000 });
        },

        showError(mensagem) {
            this.toast.add({ severity: 'error', summary: 'Ocorreu um erro!', detail: mensagem, life: 3000 });
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>

    <div class="grid">
        <Toast />
        <ConfirmDialog></ConfirmDialog>

        <!-- Modal Cadastro de Empresa -->
        <Sidebar style="width: 500px" v-model:visible="visibleRight" :baseZIndex="1000" position="right">
            <h3 v-if="this.editar == false" class="titleForm">Formulário de Cadastro</h3>
            <div class="card p-fluid">
                <div class="field">
                    <label for="cpf">Nome: <span class="obrigatorio">* </span></label>
                    <InputText v-tooltip.left="'Digite a o mome do funcionário'" v-model="form.nome" id="nome" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="email">E-mail: <span class="obrigatorio">* </span></label>
                    <InputText type="email" v-tooltip.left="'Digite o e-mail do funcionário'" v-model="form.email" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="funcao">Função: <span class="obrigatorio">* </span></label>
                    <Dropdown id="funcao" v-model="form.funcao" :options="funcoes" optionLabel="funcao" placeholder="Selecione..."></Dropdown>
                </div>
                <div class="field">
                    <label for="grupo">Grupo: <span class="obrigatorio">* </span></label>
                    <Dropdown id="Grupo" v-model="form.grupo" :options="grupos" optionLabel="grupo" placeholder="Selecione..."></Dropdown>
                </div>
                <hr />
                <div class="field">
                    <Button @click.prevent="cadastrarUsuario()" label="Cadastrar" class="mr-2 mb-2 p-button-secondary" />
                </div>
            </div>
        </Sidebar>

        <!-- Tabela com todos funcionários -->
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div class="card">
                <DataTable
                    dataKey="id"
                    :value="funcionarios"
                    :paginator="true"
                    :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    responsiveLayout="scroll"
                    filterDisplay="menu"
                    stripedRows
                >
                    <template #header>
                        <div class="flex justify-content-between">
                            <h5 for="empresa">Usuários:</h5>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-2">
                                    <Button @click.prevent="cadastrar()" icon="pi pi-building" label="Cadastrar" class="p-button-secondary" style="margin-right: 0.25em" />
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #empty> Nenhum funcionário encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="Id" header="Id" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Id</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>

                    <Column field="Nome" header="Nome" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Nome</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>

                    <Column field="Email" header="Email" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">Email</span>
                            {{ slotProps.data.email }}
                        </template>
                    </Column>

                    <Column field="Função" header="Função" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Função</span>
                            {{ slotProps.data.funcao.funcao }}
                        </template>
                    </Column>

                    <Column field="Status" header="Status" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            {{ slotProps.data.status }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-6 md:col-4">
                                    <Button v-if="slotProps.data.status == 'Ativo'" @click.prevent="confirmDesativar(slotProps.data.id)" icon="pi pi-trash" label="Desativar" class="p-button-danger" />
                                    <Button v-else @click.prevent="ativar(slotProps.data.id)" icon="pi pi-check" label="Ativar" class="p-button-secondary" />
                                </div>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
::v-deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
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
</style>
