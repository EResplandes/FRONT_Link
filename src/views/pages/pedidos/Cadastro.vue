<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import LinkService from '../../../service/LinkService';
import EmpresaService from '../../../service/EmpresaService';
import CadastrarPedidoService from '../../../service/CadastraPedidoService';
import FuncionarioService from '../../..//service/FuncionarioService';
import LocalService from '../../../service/LocalService';
import MetodoService from '../../../service/MetodoService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            displayConfirmationActivation: ref(false),
            linkService: new LinkService(),
            empresaService: new EmpresaService(),
            metodoService: new MetodoService(),
            funcionarioService: new FuncionarioService(),
            cadastrarPedidoService: new CadastrarPedidoService(),
            localService: new LocalService(),
            visibleRight: ref(false),
            loading1: ref(null),
            links: ref(null),
            empresas: ref(null),
            metodos: ref(null),
            displayParcelas: ref(false),
            parcelas: ref([]),
            gerentes: ref(null),
            diretores: ref(null),
            locais: ref(null),
            form: ref({
                urgente: 0
            }),
            preloading: ref(true),
            validaInputUrgente: localStorage.getItem('grupo')
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos Links
        this.linkService.buscaLinks().then((data) => {
            if (data.resposta == 'Links listados com sucesso!') {
                const localId = localStorage.getItem('local_id');

                if (localId != '1') {
                    // Filtra o link para remover aquelas com local_id diferente de 1
                    this.links = data.links.filter((links) => links.id == 2);
                } else {
                    // Se o local_id não estiver definido no localStorage ou for 1, mantenha todas as empresas
                    this.links = data.links;
                }
            }
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas;
            }
        });

        // Metódo responsável por buscar todos metodos de pagamentos
        this.metodoService.buscaMetodos().then((data) => {
            if (data.resposta === 'Metodos listados com sucesso!') {
                this.metodos = data.metodos;
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

        // Metódo responsável por buscar todos locais
        this.localService.buscaLocais().then((data) => {
            if (data.resposta == 'Locais listados com sucesso!') {
                this.locais = data.locais;
                this.preloading = false;
            }
        });
    },

    methods: {
        // Metódo responsável por cadastrar pedido
        cadastrarPedido() {
            // Array com os nomes dos campos obrigatórios
            const camposObrigatorios = ['valor', 'dt_vencimento', 'link', 'empresa', 'descricao', 'fluxo', 'local', 'protheus', 'dt_criacao_pedido'];

            // Variável para verificar se todos os campos obrigatórios estão preenchidos
            let todosCamposPreenchidos = true;

            if (this.form.nota) {
                if (!this.form.dt_emissao) {
                    this.showError('Informe a data de emissão da nota fiscal!');
                    todosCamposPreenchidos = false;
                }

                if (!this.form.boleto) {
                    this.showError('Anexe o boleto!');
                    todosCamposPreenchidos = false;
                }
            }

            // if (this.parcelas[0] == null || this.parcelas.length === 0) {
            //     this.showError('Gere as parcelas!');
            //     todosCamposPreenchidos = false;
            // }

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
                this.preloading = true;
                this.cadastrarPedidoService.comFluxo(this.form, this.parcelas).then((data) => {
                    if (data.resposta == 'Pedido cadastrado com sucesso!') {
                        this.preloading = false;
                        this.showSuccess('Pedido cadastrado com sucesso!');
                        this.form = {};
                        window.location.reload();
                    } else {
                        this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                    }
                });
            }
        },

        // Metódo responsável por gerar quantidade de parcelas
        gerarParcelas() {
            this.parcelas = Array.from({ length: this.qtd_parcelas }, () => ({
                dataVencimento: null,
                valor: null
            }));
        },

        showSuccess(mensagem) {
            this.toast.add({ severity: 'success', summary: 'Sucesso!', detail: mensagem, life: 3000 });
        },

        showInfo(mensagem) {
            this.toast.add({ severity: 'info', summary: 'Aviso!', detail: mensagem, life: 3000 });
        },

        showError(mensagem) {
            this.toast.add({ severity: 'error', summary: 'Ocorreu um erro!', detail: mensagem, life: 3000 });
        },

        uploadPdf() {
            this.form.pdf = this.$refs.pdf.files[0];
        },

        uploadPdfNota() {
            this.form.nota = this.$refs.pdfNota.files[0];
        },

        uploadPdfBoleto() {
            this.form.boleto = this.$refs.pdfBoleto.files[0];
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>

    <!-- Geração de Parcelas -->
    <Dialog v-model:visible="displayParcelas" header="PARCELAS" :style="{ width: '60%' }" maximizable modal :contentStyle="{ height: '80%' }">
        <div class="grid">
            <div class="col-12">
                <Button @click.prevent="this.displayParcelas = false" style="width: 100%" label="Salvar Parcelas" class="p-button-success" />
            </div>

            <Divider />
            <div class="col-12">
                <div class="p-fluid formgrid grid mb-5 p-3">
                    <div class="field col-4 md:col-6">
                        <label for="firstname2">Quantidade de Parcelas: <span class="obrigatorio">*</span></label>
                        <InputNumber v-model="qtd_parcelas" inputId="minmax-buttons" mode="decimal" showButtons :min="0" :max="100" />
                    </div>
                    <div class="field col-4 md:col-6">
                        <label style="color: white" for="firstname2">.</label>
                        <Button style="width: 100%" label="Gerar Parcelas" class="p-button-info" @click="gerarParcelas()" />
                    </div>
                </div>

                <div style="background-color: whitesmoke; padding: 5px; margin-bottom: 25px">
                    <h3 style="text-align: center">Parcelas</h3>
                </div>

                <div class="parcelas-container">
                    <div v-for="(parcela, index) in parcelas" :key="index" class="p-fluid formgrid grid mb-5 px-5">
                        <div class="col-12">
                            <h5>Parcela de Nº {{ index + 1 }}</h5>
                        </div>
                        <div class="field col-6 md:col-6">
                            <label :for="'data-vencimento-' + index">Data de Vencimento:</label>
                            <Calendar v-model="parcela.dataVencimento" :inputId="'data-vencimento-' + index" />
                        </div>
                        <div class="field col-6 md:col-6">
                            <label :for="'valor-parcela-' + index">Valor da Parcela:</label>
                            <InputNumber v-model="parcela.valor" :inputId="'valor-parcela-' + index" mode="currency" currency="BRL" locale="pt-BR" />
                        </div>
                        <Divider />
                    </div>
                </div>
            </div>
        </div>
    </Dialog>

    <div class="grid">
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div class="card">
                <h5>Cadastro de Pedido</h5>
                <TabView :activeIndex="activeIndex">
                    <TabPanel header="Formulário">
                        <div class="p-fluid formgrid grid">
                            <div v-if="this.validaInputUrgente == 'Administrador' || this.validaInputUrgente == 'Gestor de Fluxo'" class="field col-1 md:col-1">
                                <label for="firstname2">Urgente</label><br />
                                <InputSwitch :trueValue="1" :falseValue="0" :modelValue="form.urgente" v-model="form.urgente" />
                            </div>

                            <div class="field col-12 md:col-2">
                                <label for="firstname2">Valor <span class="obrigatorio">*</span></label>
                                <InputNumber v-tooltip.top="'Digite o valor do pedido'" v-model="form.valor" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="R$..." />
                            </div>

                            <div class="field col-12 md:col-2">
                                <label for="firstname2">Nº Pedido no Protheus <span class="obrigatorio">* </span></label>
                                <InputText type="number" v-tooltip.top="'Digite o numero do pedido'" v-model="form.protheus" />
                            </div>

                            <div class="field col-12 md:col-2">
                                <label for="firstname2">Dt de Vencimento <span class="obrigatorio">*</span></label>
                                <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data de vencimento'" v-model="form.dt_vencimento" showIcon iconDisplay="input" />
                            </div>

                            <div class="field col-12 md:col-2">
                                <label for="firstname2">Dt de Criação Pedido <span class="obrigatorio">*</span></label>
                                <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data de criação de pedido no Protheus'" v-model="form.dt_criacao_pedido" showIcon iconDisplay="input" />
                            </div>

                            <div class="field col-1 md:col-3">
                                <label for="firstname2">PDF <span class="obrigatorio">*</span></label>
                                <FileUpload chooseLabel="Selecionar Arquivo" @change="uploadPdf" mode="basic" type="file" ref="pdf" name="demo[]" accept=".pdf,.docx" :maxFileSize="999999999"></FileUpload>
                            </div>
                            <div class="field col-12 md:col-3 mt-2">
                                <label for="Link">Link <span class="obrigatorio">*</span></label>
                                <Dropdown id="Link" v-model="form.link" :options="links" optionLabel="link" placeholder="Selecione..."></Dropdown>
                            </div>
                            <div class="field col-12 md:col-3 mt-2">
                                <label for="Empresa">Empresa <span class="obrigatorio">*</span></label>
                                <Dropdown id="Empresa" v-model="form.empresa" :options="empresas" optionLabel="nome_empresa" placeholder="Selecione..."></Dropdown>
                            </div>
                            <div class="field col-12 md:col-3 mt-2">
                                <label for="Local">Local <span class="obrigatorio">*</span></label>
                                <Dropdown id="Local" v-model="form.local" :options="locais" optionLabel="local" placeholder="Selecione..."></Dropdown>
                            </div>
                            <div class="field col-12 md:col-3 mt-2">
                                <label for="Metodos">Formas de Pagamentos: <span class="obrigatorio">*</span></label>
                                <Dropdown id="Metodos" v-model="form.metodos" :options="metodos" optionLabel="metodo_pagamento" placeholder="Selecione..."></Dropdown>
                            </div>
                            <div class="field col-12">
                                <label for="descricao">Fornecedor: <span class="obrigatorio">*</span></label>
                                <Textarea v-tooltip.top="'Digite o forncedor'" id="descricao" rows="4" v-model="form.descricao" placeholder="Digite o fornecedor..." />
                            </div>
                            <!-- <Divider />
                            <div class="col-12 mb-2">
                                <h5>Cadastro de Nota Fiscal <span class="text-400 aviso-nota">(somente se a compra foi efetuada anteriormente!)</span></h5>
                            </div>
                            <div class="field col-12 md:col-2">
                                <label for="firstname2">Dt de Emissão da Nota</label>
                                <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data de emissão da nota fiscal'" v-model="form.dt_emissao" showIcon iconDisplay="input" />
                            </div>
                            <div class="field col-1 md:col-2">
                                <label for="firstname2">Anexo</label>
                                <FileUpload chooseLabel="Selecionar Arquivo" @change="uploadPdfNota" mode="basic" type="file" ref="pdfNota" name="demo[]" accept=".pdf,.docx" :maxFileSize="999999999"></FileUpload>
                            </div>
                            <Divider />
                            <div class="col-12 mb-2">
                                <h5>Cadastro de Boleto <span class="text-400 aviso-nota">(somente se a compra foi efetuada anteriormente!)</span></h5>
                            </div>
                            <div class="field col-1 md:col-2">
                                <label for="firstname2">Anexo</label>
                                <FileUpload chooseLabel="Selecionar Arquivo" @change="uploadPdfBoleto" mode="basic" type="file" ref="pdfBoleto" name="demo[]" accept=".pdf,.docx" :maxFileSize="999999999"></FileUpload>
                            </div>
                            <div class="field col-1 md:col-2">
                                <label class="mb-2" for="firstname2">Gerar Parcelas</label>
                                <Button :disabled="!this.form.boleto" @click.prevent="this.displayParcelas = true" icon="pi pi-check" label="Gerar" class="mr-2 mb-2 p-button-info" />
                            </div> -->
                        </div>
                    </TabPanel>
                    <TabPanel header="Fluxo" class="p-tabview-selected-secondary">
                        <div class="p-fluid formgrid grid">
                            <div class="field col-4 md:col-4">
                                <h6>GERENTES</h6>
                                <Listbox v-model="form.fluxo" :options="gerentes" multiple optionLabel="nome" class="w-full mt-4" />
                            </div>
                            <div class="field col-4 md:col-4">
                                <h6>DIRETORES</h6>
                                <Listbox v-model="form.fluxo" :options="diretores" multiple optionLabel="nome" class="w-full mt-4" />
                            </div>
                            <div class="field col-4 md:col-4">
                                <h6>FLUXO</h6>
                                <Listbox :options="form.fluxo" multiple optionLabel="nome" class="w-full mt-4" />
                            </div>
                            <div class="field col-12 md:col-12 mt-5">
                                <Button @click.prevent="cadastrarPedido()" icon="pi pi-check" label="Cadastrar Pedido" class="mr-2 mb-2 p-button-info" />
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

.aviso-nota {
    font-size: small;
}
</style>
