<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import EmpresaService from '../../../../service/EmpresaService';
import LmService from '../../../../service/LmService';
import * as XLSX from 'xlsx';

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
            camposAtivos: ref(false),
            // Variáveis para o Excel Importer
            isLoading: false,
            error: null,
            importedData: null,
            displayModalCadastroMateriais: false
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
            this.locais = data.locais;
        });
    },

    methods: {
        // Método para lidar com upload de arquivo Excel
        // Método modificado para trabalhar com FileUpload do PrimeVue
        handleFileUpload(event) {
            this.error = null;

            // O FileUpload do PrimeVue passa um objeto diferente
            const file = event.files[0]; // Acessa o arquivo de forma diferente

            if (!file) return;

            try {
                this.isLoading = true;
                const reader = new FileReader();

                reader.onload = (e) => {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, {
                        type: 'array',
                        cellFormula: true,
                        cellDates: true,
                        dense: true
                    });

                    this.processWorkbook(workbook);
                    this.isLoading = false;
                };

                reader.onerror = (error) => {
                    console.error('Erro ao ler arquivo:', error);
                    this.error = 'Erro ao ler o arquivo.';
                    this.isLoading = false;
                };

                reader.readAsArrayBuffer(file);
            } catch (err) {
                console.error('Erro ao processar arquivo:', err);
                this.error = 'Erro ao processar o arquivo. Verifique se é um Excel válido.';
                this.isLoading = false;
            }
        },

        readFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsArrayBuffer(file);
            });
        },

        processWorkbook(workbook) {
            // Processa a planilha MONT.LISTA
            const sheetName = 'MONT.LISTA';
            if (workbook.SheetNames.includes(sheetName)) {
                const worksheet = workbook.Sheets[sheetName];
                const rawData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    raw: false,
                    dateNF: 'dd/mm/yyyy'
                });

                const rows = rawData.filter((row) => row.some((cell) => cell !== ''));

                // Pula o cabeçalho e mapeia os dados
                this.campos = rows.slice(1).map((row) => ({
                    indicador: row[1] || '',
                    descricao: row[2] || '',
                    descritiva: row[3] || '',
                    quantidade: row[4] || '',
                    unidade: row[5] || '',
                    linhaCompleta: row.join(' | ')
                }));

                this.camposAtivos = true;
                this.importedData = this.campos;
                this.campos.shift();
                this.campos = this.campos.filter((item) => item.indicador !== '0');
            } else {
                this.error = 'Planilha "MONT.LISTA" não encontrada no arquivo.';
            }
        },

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
            // Adiciona os campos importados ao formulário
            if (this.importedData) {
                this.form.itens = this.importedData;
            }

            this.lmService.cadastrarLm(this.form, this.campos).then((data) => {
                if (data.status == 200) {
                    this.showSuccess(data.resposta);
                    this.form = {};
                    this.campos = [];
                    this.camposAtivos = false;
                    this.importedData = null;
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
        },

        abrirModalCadastroMateriais() {
            this.displayModalCadastroMateriais = true;
        },

        cancelarCadastroMateriaisManualmente() {
            this.campos = [];
            this.qtd_itens = null;
            this.camposAtivos = false;
            this.displayModalCadastroMateriais = false;
        }
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-6">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>

            <Dialog v-model:visible="this.displayModalCadastroMateriais" maximizable modal header="Cadastro de Material" :style="{ width: '100rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
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
                                    <label :for="'unidade-' + index">Indicador:</label>
                                    <InputText v-model="campo.indicador" :inputId="'unidade-' + index" />
                                </div>
                                <div class="field col-1 md:col-1">
                                    <label :for="'unidade-' + index">Unidade:</label>
                                    <InputText v-model="campo.unidade" :inputId="'unidade-' + index" />
                                </div>
                                <div class="field col-1 md:col-1">
                                    <label :for="'quantidade-' + index">Quantidade:</label>
                                    <InputNumber v-model="campo.quantidade" :inputId="'quantidade-' + index" />
                                </div>
                                <div class="field col-5 md:col-4">
                                    <label :for="'descricao-' + index">Descrição do Material:</label>
                                    <Textarea v-model="campo.descritiva" :inputId="'descricao-' + index" />
                                </div>
                                <div class="field col-5 md:col-4">
                                    <label :for="'descricao-' + index">Descritiva:</label>
                                    <Textarea v-model="campo.descricao" :inputId="'descricao-' + index" />
                                </div>
                                <Divider />
                            </div>
                            <Button v-if="camposAtivos" style="width: 100%" label="Cancelar" class="p-button-danger mb-3" @click="cancelarCadastroMateriaisManualmente()" />
                            <Button v-if="camposAtivos" style="width: 100%" label="Salvar" class="p-button-info" @click="this.displayModalCadastroMateriais = false" />
                        </div>
                    </div>
                </div>
            </Dialog>

            <div class="card">
                <h5>Cadastro de LM</h5>
                <TabView :activeIndex="activeIndex">
                    <TabPanel header="Formulário">
                        <div class="p-fluid formgrid grid">
                            <div class="field col-12 md:col-6">
                                <label for="firstname2">LM <span class="obrigatorio">*</span></label>
                                <InputText v-tooltip.top="'Digite o nome da LM'" v-model="form.lm" inputId="minmaxfraction" placeholder="Digite..." />
                            </div>

                            <div class="field col-12 md:col-6">
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

                            <div class="field col-12">
                                <label for="excel">Excel com lista de materiais: <span class="obrigatorio">*</span></label>
                                <FileUpload mode="basic" name="excelFile" accept=".xlsx, .xls" :maxFileSize="1000000" @select="handleFileUpload" chooseLabel="Selecionar Arquivo Excel" :auto="false" />
                                <div v-if="isLoading" class="loading"><i class="pi pi-spinner pi-spin"></i> Processando arquivo...</div>
                                <div v-if="error" class="error-message"><i class="pi pi-exclamation-circle"></i> {{ error }}</div>
                            </div>

                            <div class="col-12">
                                <Button style="width: 100%" @click.prevent="cadastrarLm()" label="Cadastrar" class="p-button-success" :disabled="!form.lm || !form.prazo || !form.empresa || !form.aplicacao || !camposAtivos" />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
        <div class="col-6">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div class="card">
                <h5>Pré-visualização dos Itens</h5>
                <div v-if="camposAtivos">
                    <DataTable :value="campos" showGridlines stripedRows :rows="5" paginator>
                        <Column field="indicador" header="Indicador"></Column>
                        <Column field="descricao" header="Descrição"></Column>
                        <Column field="descritiva" header="Descritiva"></Column>
                        <Column field="unidade" header="Unidade"></Column>
                        <Column field="quantidade" header="Quantidade"></Column>
                    </DataTable>
                    <div class="field col-12 mt-3">
                        <h5>Total de itens: {{ campos.length }}</h5>
                    </div>
                </div>
                <div v-else class="p-4 text-center">
                    <p>Nenhum item carregado ainda.</p>
                    <p>Importe um arquivo Excel ou</p>
                    <Button label="Gerar Campos Manualmente" @click="abrirModalCadastroMateriais()" class="p-button-secondary" />
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

.loading {
    color: var(--primary-color);
    margin-top: 0.5rem;
}

.error-message {
    color: #d32f2f;
    background-color: #fde0e0;
    padding: 0.5rem;
    border-radius: 4px;
    margin-top: 0.5rem;
}
</style>
