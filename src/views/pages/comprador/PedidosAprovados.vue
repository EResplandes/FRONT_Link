<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import PedidoService from '../../../service/Pedido';
import ParcelaService from '../../../service/ParcelaService';
import NotaService from '../../../service/NotaService';
import BoletoService from '../../../service/BoletoService';
import { generatePDF } from './aprovacao';

export default {
    data() {
        return {
            toast: new useToast(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            parcelaService: new ParcelaService(),
            boletoService: new BoletoService(),
            pedidoService: new PedidoService(),
            notaService: new NotaService(),
            confirm: new useConfirm(),
            parcelasCadastradas: ref(false),
            empresas: ref(null),
            parcelas: ref([]),
            pedidos: ref(null),
            status: ref(null),
            form: ref({}),
            idPedido: ref(null),
            idFluxo: ref(null),
            editar: ref(false),
            preloading: ref(true),
            displayFluxo: ref(false),
            liberaBotaoCadastrarBoleto: ref(false),
            display: ref(false),
            displayNota: ref(false),
            displayParcelas: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            fluxoPedido: ref(null),
            informacoesPedidos: ref(null),
            validaAnexo: localStorage.getItem('nome')
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos pedidos relacionas a esse usuário que foram aprovados
        this.pedidoService.buscaAprovadosPedidos(localStorage.getItem('usuario_id')).then((data) => {
            this.pedidos = data.pedidos;
            this.preloading = false;
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas;
            }
        });

        // Metódo responsável por buscar todos status
        this.statusService.buscaStatus().then((data) => {
            if (data.resposta == 'Status listados com sucesso!') {
                this.status = data.itens;
            }
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos do usuário logado
        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.buscaAprovadosPedidos(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por formatar data padrão br
        formatarData(data) {
            const dataFormatada = new Date(data);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC'
            };

            return new Intl.DateTimeFormat('pt-BR', options).format(dataFormatada);
        },

        // Metódo responsável por cadastrar parcelas
        cadastarParcelas() {
            this.parcelasCadastradas = true;
            this.preloading = true;
            this.parcelaService.cadastrar(this.parcelas, this.idPedido).then((data) => {
                if (data.resposta == 'Parcelas cadastradas com sucesso!') {
                    this.preloading = false;
                    this.showSuccess('Parcelas cadastradas com sucesso!');
                    this.parcelas = null;
                    this.qtd_parcelas = null;
                    this.displayParcelas = false;
                    this.liberaBotaoCadastrarBoleto = true;
                }
            });
        },

        // Metódo responsável por visualizar pdf
        visualizar(id, data) {
            this.display = true;
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
        },

        imprimirAutorizacao(data) {
            try {
                generatePDF(data);
                this.preloading = false;
            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
            } finally {
                this.loading = false;
            }
        },

        buscaInformacoesPedido(id) {
            this.preloading = true;
            this.pedidoService.buscaInformacoesPedido(id).then((data) => {
                this.imprimirAutorizacao(data);
            });
        },

        modalForm(id, status, data) {
            this.status = status;
            this.idPedido = id;
            this.pdf = data.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.displayNota = true;
        },

        // Metódo responsável por cadastrar nota e boleto em conjunto
        cadastrarNota() {
            const camposObrigatorios = ['pdf', 'pdfBoleto'];

            // Variável para verificar se todos os campos obrigatórios estão preenchidos
            let todosCamposPreenchidos = true;

            // Iterar sobre os campos obrigatórios
            for (const campo of camposObrigatorios) {
                // Verificar se o campo está vazio
                if (!this.form[campo]) {
                    // Se estiver vazio, exibir mensagem de erro e definir a variável como falsa
                    this.showError(`O campo NOTA e BOLETO é obrigatório!`);
                    todosCamposPreenchidos = false;
                }
            }

            if (todosCamposPreenchidos) {
                this.preloading = true;
                this.notaService.cadastrarNota(this.form, this.idPedido).then((data) => {
                    if (data.resposta == 'Nota cadastrada com suceso!') {
                        this.displayNota = false;
                        this.showSuccess('Nota cadastrada com sucesso!');
                        this.buscaPedidos();
                        this.preloading = false;
                        this.form = {};
                    }
                });
            }
        },

        // Metódo responsável por cadastrar somente nota
        cadastrarSomenteNota() {
            const camposObrigatorios = ['pdf'];

            // Variável para verificar se todos os campos obrigatórios estão preenchidos
            let todosCamposPreenchidos = true;

            // Iterar sobre os campos obrigatórios
            for (const campo of camposObrigatorios) {
                // Verificar se o campo está vazio
                if (!this.form[campo]) {
                    // Se estiver vazio, exibir mensagem de erro e definir a variável como falsa
                    this.showError(`O campo NOTA é obrigatório!`);
                    todosCamposPreenchidos = false;
                }
            }

            if (todosCamposPreenchidos) {
                this.preloading = true;
                this.notaService.cadastrarSomenteNota(this.form, this.idPedido).then((data) => {
                    if (data.resposta == 'Nota cadastrada com suceso!') {
                        this.displayNota = false;
                        this.showSuccess('Nota cadastrada com sucesso!');
                        this.buscaPedidos();
                        this.preloading = false;
                        this.form = {};
                    }
                });
            }
        },

        // Metódo responsável por cadastrar somente boleto e enviar para pagamento sem nota
        cadastrarBoleto() {
            const camposObrigatorios = ['pdfBoleto'];

            // Variável para verificar se todos os campos obrigatórios estão preenchidos
            let todosCamposPreenchidos = true;

            // Iterar sobre os campos obrigatórios
            for (const campo of camposObrigatorios) {
                // Verificar se o campo está vazio
                if (!this.form[campo]) {
                    // Se estiver vazio, exibir mensagem de erro e definir a variável como falsa
                    this.showError(`O campo BOLETO é obrigatório!`);
                    todosCamposPreenchidos = false;
                }
            }

            if (todosCamposPreenchidos) {
                this.preloading = true;
                this.boletoService.cadastrarBoleto(this.form, this.idPedido).then((data) => {
                    if (data.resposta == 'Boleto cadastrado com suceso!') {
                        this.displayNota = false;
                        this.showSuccess('Boleto cadastrado com sucesso, pedido enviado para pagamento!');
                        this.buscaPedidos();
                        this.preloading = false;
                        this.form = {};
                    }
                });
            }
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

        uploadPdfBoleto() {
            this.form.pdfBoleto = this.$refs.pdfBoleto.files[0];
        },

        // Metódo responsável por gerar quantidade de parcelas
        gerarParcelas() {
            this.parcelas = Array.from({ length: this.qtd_parcelas }, () => ({
                dataVencimento: null,
                valor: null
            }));
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

        <!-- Visualizar -->
        <Dialog header="Documento" v-model:visible="display" :style="{ width: '80%' }" :modal="true">
            <div class="grid">
                <div class="col-12 md:col-12">
                    <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
                </div>
            </div>
        </Dialog>

        <!-- Geração de Parcelas -->
        <Dialog v-model:visible="displayParcelas" header="PARCELAS" :style="{ width: '80%' }" maximizable modal :contentStyle="{ height: '80%' }">
            <div class="grid">
                <div class="col-12">
                    <Button @click.prevent="cadastarParcelas()" style="width: 100%" label="Salvar Parcelas" class="p-button-success" />
                </div>

                <Divider />

                <div style="height: 800px" class="col-7">
                    <iframe :src="pdfsrc" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </div>

                <div class="col-5">
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

        <!-- Inserir nota -->
        <Dialog header="Nota" v-model:visible="displayNota" :style="{ width: '40%' }" :modal="true">
            <div class="grid mt-1">
                <div class="field col-6 md:col-6">
                    <label for="firstname2">Selecione a Nota:</label><br />
                    <FileUpload style="width: 100%" chooseLabel="Selecionar Nota" @change="uploadPdf" mode="basic" type="file" ref="pdf" name="demo[]" accept=".pdf,.docx" :maxFileSize="999999999"></FileUpload>
                </div>
                <div v-if="this.status != 'Sem Nota'" class="field col-6 md:col-6">
                    <label for="firstname2">Selecione o Boleto: <span style="color: red">*</span></label>
                    <FileUpload style="width: 100%" chooseLabel="Selecionar Boleto" @change="uploadPdfBoleto" mode="basic" type="file" ref="pdfBoleto" name="demo[]" accept=".pdf,.docx" :maxFileSize="999999999"></FileUpload>
                </div>

                <div class="col-12 md:col-12">
                    <Button style="width: 100%" @click="this.displayParcelas = true" label="Gerar Parcelas" :disabled="!this.form.pdfBoleto" class="p-button-warning" />
                </div>

                <div v-if="this.status != 'Sem Nota'" class="col-12 md:col-12">
                    <Button style="width: 100%" @click.prevent="cadastrarBoleto()" label="Cadastrar (SOMENTE BOLETO) - Pagamento Antecipado" :disabled="!this.liberaBotaoCadastrarBoleto" class="p-button-success" />
                </div>
                <div v-if="this.status != 'Sem Nota'" class="col-12 md:col-12">
                    <Button style="width: 100%" @click.prevent="cadastrarNota()" label="Cadastrar" class="p-button-info" />
                </div>
                <div v-if="this.status == 'Sem Nota'" class="col-12 md:col-12">
                    <Button style="width: 100%" @click.prevent="cadastrarSomenteNota()" label="Cadastrar Nota" class="p-button-info" />
                </div>
            </div>
        </Dialog>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div class="header-padrao">MEUS PEDIDOS APROVADOS</div>

            <div class="card">
                <DataTable
                    dataKey="id"
                    :value="pedidos"
                    :paginator="true"
                    :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    responsiveLayout="scroll"
                    filterDisplay="menu"
                    stripedRows
                >
                    <template #empty> Nenhum pedido encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="" header="" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            <Tag v-if="slotProps.data.urgente == 1" class="mr-2" severity="danger" value="Urgente"></Tag>
                            <Tag v-else class="mr-2" severity="info" value="Normal"></Tag>
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Nº do Protheus" header="Nº do Protheus" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Nº do Protheus</span>
                            {{ slotProps.data.protheus }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Fornecedor" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="Status" header="Status" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            {{ slotProps.data.status.status }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-3 md:col-3">
                                    <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                </div>
                                <div class="col-3 md:col-3 ml-1">
                                    <Button @click.prevent="buscaInformacoesPedido(slotProps.data.id)" icon="pi pi-print" class="p-button-secondary" />
                                </div>
                                <!-- v-if="slotProps.data.status.status == 'Aprovado' || slotProps.data.status.status == 'Aprovado com Ressalva' || slotProps.data.status.status == 'Sem Nota'" -->
                                <div class="col-3 md:col-3 ml-1">
                                    <Button @click.prevent="modalForm(slotProps.data.id, slotProps.data.status.status, slotProps.data)" icon="pi pi-folder-open" class="p-button-warning" />
                                </div>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-12 lg:col-6">
            <Toast />
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

.timeline-container {
    max-height: 300px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}

.parcelas-container {
    max-height: 450px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}

.header-padrao {
    background-color: #3b82f6;
    color: white;
    font-weight: 600;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    text-align: center;
}
</style>
