<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import EmpresaService from '../../../../service/EmpresaService';
import LmService from '../../../../service/LmService';

export default {
    data() {
        return {
            toast: new useToast(),
            empresaService: new EmpresaService(),
            lmService: new LmService(),
            preloading: ref(true),
            empresas: ref(null),
            locais: ref(null),
            qtd_itens: ref(null),
            form: ref({
                urgente: 0
            }),
            campos: ref([]),
            camposAtivos: ref(false)
        };
    },

    mounted: function () {
        this.preloading = false;

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas;
            }
        });

        // Metódo responsável por buscar todos locais
        this.lmService.listarLocais().then((data) => {
            console.log(data);
            this.locais = data.locais;
        });

    },

    methods: {
        // Metódo responsável por gerar quantidade de campos
        gerarCampos() {
            this.camposAtivos = true;
            this.campos = Array.from({ length: this.qtd_itens }, () => ({
                descricao: null,
                quantidade: null,
                unidade: null
            }));
        },

        // Metódo responsável por cadastrar LM
        cadastrarLm() {
            this.lmService.cadastrarLm(this.form, this.campos).then((data) => {
                if (data.status == 200) {
                    this.showSuccess(data.resposta);
                    this.form = {};
                } else {
                    this.showError(data.resposta);
                }
            });
        },

        showSuccess(mensagem) {
            this.toast.add({ severity: 'success', summary: 'Sucesso!', detail: mensagem, life: 3000 });
        },

        showError(mensagem) {
            this.toast.add({ severity: 'error', summary: 'Ocorreu um erro!', detail: mensagem, life: 3000 });
        }
    }
};
</script>

<template>
    <!-- <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div> -->

    <div class="grid">
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div class="card">
                <h5>Cadastro de LM</h5>
                <TabView :activeIndex="activeIndex">
                    <TabPanel header="Formulário">
                        <div class="p-fluid formgrid grid">
                            <div class="field col-1 md:col-1">
                                <label for="firstname2">Urgente</label><br />
                                <InputSwitch :trueValue="1" :falseValue="0" :modelValue="form.urgente" v-model="form.urgente" />
                            </div>

                            <div class="field col-12 md:col-5">
                                <label for="firstname2">LM <span class="obrigatorio">*</span></label>
                                <InputText v-tooltip.top="'Digite o nome da LM'" v-model="form.lm" inputId="minmaxfraction" placeholder="Digite..." />
                            </div>

                            <div class="field col-12 md:col-5">
                                <label for="firstname2">Prazo <span class="obrigatorio">*</span></label>
                                <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione o prazo'" v-model="form.prazo" showIcon iconDisplay="input" />
                            </div>

                            <div class="field col-12 md:col-6">
                                <label for="Empresa">Empresa <span class="obrigatorio">*</span></label>
                                <Dropdown id="Empresa" v-model="form.empresa" :options="empresas" optionLabel="nome_empresa" placeholder="Selecione..."></Dropdown>
                            </div>

                            <div class="field col-12 md:col-6">
                                <label for="Empresa">Local <span class="obrigatorio">*</span></label>
                                <Dropdown id="Empresa" v-model="form.local" :options="locais" optionLabel="local" placeholder="Selecione..."></Dropdown>
                            </div>

                            <div class="field col-12">
                                <label for="aplicacao">Aplicação: <span class="obrigatorio">*</span></label>
                                <Textarea v-tooltip.top="'Digite a aplicação dos materias'" id="aplicacao" rows="4" v-model="form.aplicacao" placeholder="Digite o fornecedor..." />
                            </div>

                            <div class="col-12">
                                <Button style="width: 100%" @click.prevent="cadastrarLm()" label="Cadastrar" class="p-button-success" :disabled="!form.lm || !form.prazo || !form.empresa || !form.aplicacao || !camposAtivos" />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
            <div class="card">
                <h5>Cadastro Materias</h5>
                <div class="grid">
                    <Divider />
                    <div class="col-12">
                        <div v-if="!this.camposAtivos" class="p-fluid formgrid grid mb-5 p-3">
                            <div class="field col-4 md:col-6">
                                <label for="firstname2">Quantidade de Itens: <span class="obrigatorio">*</span></label>
                                <InputNumber v-model="qtd_itens" inputId="minmax-buttons" mode="decimal" showButtons :min="0" :max="100" />
                            </div>
                            <div class="field col-4 md:col-6">
                                <label style="color: white" for="firstname2">.</label>
                                <Button style="width: 100%" label="Gerar Campos" class="p-button-info" @click="gerarCampos()" />
                            </div>
                        </div>

                        <div v-if="camposAtivos" style="background-color: whitesmoke; padding: 5px; margin-bottom: 25px">
                            <h3 style="text-align: center">Materiais</h3>
                        </div>

                        <div class="materiais-container">
                            <div v-for="(campo, index) in campos" :key="index" class="p-fluid formgrid grid mb-5 px-5">
                                <div class="col-12">
                                    <h5>Item Nº: {{ index + 1 }}</h5>
                                </div>
                                <div class="field col-1 md:col-1">
                                    <label :for="'unidade-' + index">Unidade:</label>
                                    <InputText v-model="campo.unidade" :inputId="'unidade-' + index" />
                                </div>
                                <div class="field col-2 md:col-2">
                                    <label :for="'quantidade-' + index">Quantidade:</label>
                                    <InputNumber v-model="campo.quantidade" :inputId="'quantidade-' + index" />
                                </div>
                                <div class="field col-9 md:col-9">
                                    <label :for="'descricao-' + index">Descrição do Material:</label>
                                    <Textarea v-model="campo.descricao" :inputId="'descricao-' + index" />
                                </div>
                                <Divider />
                            </div>
                        </div>
                    </div>
                </div>
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

.aviso-nota {
    font-size: small;
}
</style>
