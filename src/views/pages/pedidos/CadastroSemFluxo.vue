<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import LinkService from '../../../service/LinkService';
import EmpresaService from '../../../service/EmpresaService';
import FuncionarioService from '../../../service/FuncionarioService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            displayConfirmationActivation: ref(false),
            linkService: new LinkService(),
            empresaService: new EmpresaService(),
            funcionarioService: new FuncionarioService(),
            visibleRight: ref(false),
            loading1: ref(null),
            links: ref(null),
            empresas: ref(null),
            gerentes: ref(null),
            diretores: ref(null),
            form: ref({}),
            preloading: ref(true)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos Links
        this.linkService.buscaLinks().then((data) => {
            if (data.resposta == 'Links listados com sucesso!') {
                this.links = data.links;
            }
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas;
            }
        });

        // Metódo responsável por buscar todos gerentes
        this.funcionarioService.buscaGerentes().then((data) => {
            if (data.resposta == 'Funcionários listados com sucesso!') {
                this.gerentes = data.funcionarios;
            }
        });

        // Metódo responsável por buscar todos diretores
        this.funcionarioService.buscaDiretores().then((data) => {
            if (data.resposta == 'Funcionários listados com sucesso!') {
                this.diretores = data.funcionarios;
                this.preloading = false;
            }
        });
    },

    methods: {
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
        <div class="col-12">
            <div class="card">
                <h5>Cadastro de Pedido</h5>
                <TabView :activeIndex="activeIndex" @tabChange="onTabChange()">
                    <TabPanel header="Formulário">
                        <div class="p-fluid formgrid grid">
                            <div class="field col-1 md:col-1">
                                <label for="firstname2">Urgente</label>
                                <InputSwitch v-model="form.urgente" />
                            </div>
                            <div class="field col-12 md:col-3">
                                <label for="firstname2">Valor <span class="obrigatorio">*</span></label>
                                <InputNumber v-tooltip.top="'Digite o valor do pedido'" v-model="form.valor" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="R$..." />
                            </div>
                            <div class="field col-12 md:col-4">
                                <label for="Link">Link <span class="obrigatorio">*</span></label>
                                <Dropdown id="Link" v-model="form.link" :options="links" optionLabel="link" placeholder="Selecione..."></Dropdown>
                            </div>
                            <div class="field col-12 md:col-4">
                                <label for="Empresa">Empresa <span class="obrigatorio">*</span></label>
                                <Dropdown id="Empresa" v-model="form.empresa" :options="empresas" optionLabel="nome_empresa" placeholder="Selecione..."></Dropdown>
                            </div>
                            <div class="field col-12">
                                <label for="descricao">Descrição: <span class="obrigatorio">*</span></label>
                                <Textarea v-tooltip.top="'Digite a descrição do pedido'" id="descricao" rows="4" v-model="form.descricao" placeholder="Digite a descrição..." />
                            </div></div
                    ></TabPanel>
                    <TabPanel header="Upload">
                        <FileUpload v-model="form.pdf" name="demo[]" accept=".pdf,.docx" :maxFileSize="1000000">
                            <template #empty>
                                <p>Arraste para anexar documento.</p>
                            </template> </FileUpload
                        ><br />
                        <div class="p-fluid formgrid grid">
                            <div class="field col-12 md:col-12">
                                <Button @click.prevent="buscaFiltros()" icon="pi pi-check" label="Cadastrar Pedido" class="mr-2 mb-2 p-button-info" />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
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
