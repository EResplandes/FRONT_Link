<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import EmpresaService from '../../../service/EmpresaService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            empresaService: new EmpresaService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            loading1: ref(null),
            form: ref({}),
            editar: ref(false),
            empresas: ref(false),
            preloading: ref(true),
            display: ref(false)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas;
                this.preloading = false;
            }
        });
    },

    methods: {
        // Metódo responsável por buscar todas empresas
        buscaEmpresas() {
            this.preloading = true;
            this.empresaService.buscaEmpresas().then((data) => {
                if (data.resposta == 'Empresas listados com sucesso!') {
                    this.empresas = data.empresas;
                    this.preloading = false;
                }
            });
        },

        // Metódo responsável por cadastrar empresa
        cadastrarEmpresa() {
            this.empresaService.cadastrar(this.form).then((data) => {
                if (data.resposta == 'Empresa cadastrada com sucesso!') {
                    this.showSuccess('Empresa cadastrada com sucesso!');
                    this.buscaEmpresas();
                } else {
                    for (const campo in data.errors) {
                        if (Object.hasOwnProperty.call(data.errors, campo)) {
                            const mensagensErro = data.errors[campo];
                            for (const mensagem of mensagensErro) {
                                this.showError(mensagem);
                            }
                        }
                    }
                }
            });
        },

        // Metódo responsável por abrir confiramção de exclusão
        confirmDeletar(id_empresa) {
            this.confirm.require({
                message: 'Tem certeza de que deseja excluir a empresa?',
                header: 'Exclusão de Empresa',
                icon: 'pi pi-info-circle',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Deletar',
                rejectClass: 'p-button-secondary p-button-outlined',
                acceptClass: 'p-button-danger',
                accept: () => {
                    this.deletarEmpresa(id_empresa);
                },
                reject: () => {}
            });
        },

        // Metódo responsável por deletar empresa
        deletarEmpresa(id) {
            this.empresaService.deletar(id).then((data) => {
                if (data.resposta == 'Empresa deletada com sucesso!') {
                    this.showSuccess('Empresa deletada com sucesso!');
                    this.buscaEmpresas();
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
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
                    <label for="cpf">Empresa: <span class="obrigatorio">* </span></label>
                    <InputText v-tooltip.left="'Digite a o mome da empresa'" v-model="form.nome_empresa" id="empresa" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="cpf">CNPJ: <span class="obrigatorio">* </span><span class="text-1">(Somente números)</span></label>
                    <InputNumber v-tooltip.left="'Digite o CNPJ da empresa'" v-model="form.cnpj" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="cpf">Inscrição Estadual: <span class="obrigatorio">* </span></label>
                    <InputNumber v-tooltip.left="'Digite a inscrição estadual da empresa'" v-model="form.inscricao_estadual" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="cpf">Filial: </label>
                    <InputNumber v-tooltip.left="'Digite a filial da empresa'" v-model="form.filial" placeholder="Digite..." />
                </div>
                <hr />
                <div class="field">
                    <Button @click.prevent="cadastrarEmpresa()" label="Cadastrar" class="mr-2 mb-2 p-button-secondary" />
                </div>
            </div>
        </Sidebar>

        <!-- Tabela com todos pedidos com Dr Emival -->
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div class="card">
                <DataTable
                    dataKey="id"
                    :value="empresas"
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
                    <template #empty> Nenhuma empresa encontrada! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="Id" header="Id" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Id</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-4">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="CNPJ" header="CNPJ" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.cnpj }}
                        </template>
                    </Column>

                    <Column field="Incrição Estadual" header="Incrição Estadual" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Incrição Estadual</span>
                            {{ slotProps.data.inscricao_estadual }}
                        </template>
                    </Column>

                    <Column field="filiar" header="Filial" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Filial</span>
                            {{ slotProps.data.filial }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-6 md:col-4">
                                    <Button @click.prevent="confirmDeletar(slotProps.data.id)" icon="pi pi-trash" label="Deletar" class="p-button-danger" />
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
