<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import CaixaService from '../../../service/CaixaService';
export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            caixaService: new CaixaService(),
            confirm: new useConfirm(),
            form: ref({}),
            caixas: ref(null),
            historico: ref(null),
            idCaixa: ref(null),
            funcionario: ref(null),
            preloading: ref(false),
            displayCadastroCaixa: ref(false),
            displayExcluirCaixa: ref(false),
            displayHistoricoCaixa: ref(false),
            displaCadastroControleCaixa: ref(false)
        };
    },

    mounted: function () {
        this.preloading = true;
        this.caixaService.buscaCaixas().then((data) => {
            this.caixas = data.caixas;
            this.preloading = false;
        });
    },

    methods: {
        listarCaixas() {
            this.preloading = true;
            this.caixaService.buscaCaixas().then((data) => {
                if (data.resposta == 'Caixas listados com sucesso') {
                    this.showSuccess('Caixas listados com sucesso');
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o administrador!');
                }

                this.caixas = data.caixas;
                this.preloading = false;
            });
        },

        listarCaixasComFiltro() {
            this.preloading = true;
            this.caixaService.buscasCaixasComFiltro(this.funcionario).then((data) => {
                this.caixas = data.caixas;
                this.preloading = false;
                this.funcionario = null;
            });
        },

        cadastrarCaixa() {
            this.preloading = true;
            this.caixaService.cadastrarCaixa(this.form).then((data) => {
                if (data.resposta === 'Caixa cadastrado com sucesso!') {
                    this.showSuccess('Caixa cadastrado com sucesso!');
                    this.displayCadastroCaixa = false;
                    this.form = {};
                    this.listarCaixas();
                } else if (data.errors) {
                    // Percorre cada erro no objeto "errors" e exibe utilizando "showError"
                    for (const [field, messages] of Object.entries(data.errors)) {
                        messages.forEach((message) => {
                            this.showError(message);
                        });
                    }
                } else {
                    this.showError('Ocorreu um erro, entre em contato com o Administrador!');
                }
                this.preloading = false;
            });
        },

        visualizarHistoricoCaixa(id) {
            this.idCaixa = id;
            this.preloading = true;
            this.displayHistoricoCaixa = true;
            this.caixaService.buscaHistoricoCaixa(id, 'Ajuda de Custo').then((data) => {
                this.historico = data.controles;
                this.preloading = false;
            });
        },

        excluirCaixa(id) {
            this.preloading = true;
            this.caixaService.deletarCaixa(id).then((data) => {
                if (data.resposta === 'Caixa excluído com sucesso!') {
                    this.showSuccess('Caixa excluído com sucesso!');
                    this.listarCaixas();
                } else {
                    this.showError('O caixa já contem registro ativo, para exclusão entre em contato com o Administrador!');
                }
                this.preloading = false;
            });
        },

        confirmDeletar(id) {
            this.confirm.require({
                message: 'Deseja realmente exluir esse caixa?',
                header: 'EXCLUSÃO DE CAIXA',
                icon: 'pi pi-info-circle',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Deletar',
                rejectClass: 'p-button-secondary p-button-outlined',
                acceptClass: 'p-button-danger',
                accept: () => {
                    this.excluirCaixa(id);
                }
            });
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
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>

    <ConfirmDialog></ConfirmDialog>

    <!-- Dialog de Cadastro de Caixa -->
    <Dialog v-model:visible="displayCadastroCaixa" maximizable modal header="CADASTRO DE CAIXA" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="grid">
            <div class="card p-fluid">
                <div class="formgrid grid">
                    <div class="field col-12">
                        <h4>Informações Pessoais</h4>
                    </div>
                    <div class="field col-4">
                        <label for="funcionario">Funcionário <span class="obrigatorio">*</span></label>
                        <InputText v-model="form.funcionario" id="funcionario" type="text" />
                    </div>
                    <div class="field col-4">
                        <label for="cpf">CPF <span class="obrigatorio">*</span></label>
                        <InputNumber v-model="form.cpf" id="cpf" type="text" />
                    </div>
                    <div class="field col-4">
                        <label for="funcao">Função <span class="obrigatorio">*</span></label>
                        <InputText v-model="form.funcao" id="funcao" type="text" />
                    </div>
                    <Divider />
                    <div class="field col-12">
                        <h4>Dados Bancários</h4>
                    </div>
                    <div class="field col">
                        <label for="banco">Banco</label>
                        <InputText v-model="form.banco" id="banco" type="text" />
                    </div>
                    <div class="field col">
                        <label for="agencia">Agência</label>
                        <InputText v-model="form.agencia" id="agencia" type="text" />
                    </div>
                    <div class="field col">
                        <label for="conta">Conta</label>
                        <InputText v-model="form.conta" id="conta" type="text" />
                    </div>
                    <Divider />
                    <div class="field col">
                        <Button @click.prevent="cadastrarCaixa()" label="Cadastrar" icon="pi pi-plus" severity="success" />
                    </div>
                </div>
            </div>
        </div>
    </Dialog>

    <!-- Dialog de Cadastro de Fluxo de Caixa -->
    <Dialog v-model:visible="displaCadastroControleCaixa" maximizable modal header="CADASTRO DE CAIXA" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="grid">
            <div class="card p-fluid">
                <div class="formgrid grid">
                    <div class="field col-6">
                        <label for="dt_lancamento">Data Lançamento <span class="obrigatorio">*</span></label>
                        <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data de lançamento'" v-model="form.dt_lancamento" showIcon iconDisplay="input" />
                    </div>
                    <div class="field col-6">
                        <label for="discriminacao">Discriminação <span class="obrigatorio">*</span></label>
                        <InputNumber v-model="form.discriminacao" id="discriminacao" type="text" />
                    </div>
                    <Divider />
                    <div class="field col">
                        <label for="debito">Débito</label>
                        <InputNumber v-tooltip.top="'Digite o valor do pedido'" v-model="form.debito" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="R$..." />
                    </div>
                    <div class="field col">
                        <label for="credito">Crédito</label>
                        <InputNumber v-tooltip.top="'Digite o valor do pedido'" v-model="form.credito" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="R$..." />
                    </div>
                    <div class="field col-12">
                        <label for="observacao">Observação</label>
                        <Textarea v-model="form.observacao" id="observacao" type="text" />
                    </div>
                    <Divider />
                    <div class="field col">
                        <Button @click.prevent="cadastrarCaixa()" label="Cadastrar" icon="pi pi-plus" severity="success" />
                    </div>
                </div>
            </div>
        </div>
    </Dialog>

    <!-- Dialog de Histórico de entrada e saida de caixa -->
    <Dialog v-model:visible="displayHistoricoCaixa" maximizable modal header="CADASTRO DE CAIXA" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="grid">
            <DataTable
                dataKey="id"
                :value="historico"
                :paginator="true"
                :rows="10"
                :style="{ width: '100%', padding: '10px' }"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                responsiveLayout="scroll"
                filterDisplay="menu"
                stripedRows
            >
                <template #header>
                    <div class="justify-content-center text-right">
                        <Button @click.prevent="displaCadastroControleCaixa = true" label="Cadastrar" icon="pi pi-plus" severity="success" />
                    </div>
                </template>

                <template #empty> Nenhum registro encontrado! </template>
                <template #loading> Carregando informações... Por favor, aguarde! </template>

                <Column field="dt_lancamento" header="Dt. Lançamento" class="w-2">
                    <template #body="slotProps">
                        <span class="p-column-title">funcionario</span>
                        {{ this.formatarData(slotProps.data.dt_lancamento) }}
                    </template>
                </Column>

                <Column field="discriminacao" header="Discriminação" class="w-3">
                    <template #body="slotProps">
                        <span class="p-column-title">discriminacao</span>
                        {{ slotProps.data.discriminacao }}
                    </template>
                </Column>

                <Column field="debito" header="Débito" class="w-1">
                    <template #body="slotProps">
                        <span class="p-column-title">debito</span>
                        {{ slotProps.data?.debito != null ? slotProps.data.debito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/C' }}
                    </template>
                </Column>

                <Column field="credito" header="Crédito" class="w-1">
                    <template #body="slotProps">
                        <span class="p-column-title">credito</span>
                        {{ slotProps.data?.credito != null ? slotProps.data.credito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/C' }}
                    </template>
                </Column>

                <Column field="saldo" header="Saldo" class="w-1">
                    <template #body="slotProps">
                        <span class="p-column-title">saldo</span>
                        {{ slotProps.data?.saldo != null ? slotProps.data.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/C' }}
                    </template>
                </Column>

                <Column field="observacao" header="Obs." class="w-2">
                    <template #body="slotProps">
                        <span class="p-column-title">observacao</span>
                        {{ slotProps.data?.observacao }}
                    </template>
                </Column>

                <Column field="..." header="..." :sortable="true" class="w-2">
                    <template #body="slotProps">
                        <span class="p-column-title"></span>
                        <div class="flex gap-2">
                            <div>
                                <Button @click.prevent="visualizarHistoricoCaixa(slotProps.data.id)" icon="pi pi-eye" class="p-button-info" />
                            </div>
                            <div>
                                <Button @click.prevent="confirmDeletar(slotProps.data.id)" icon="pi pi-trash" class="p-button-danger" />
                            </div>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </Dialog>

    <!-- Controle de Contratos -->
    <div class="grid">
        <div class="col-12">
            <div class="header-padrao">FILTROS</div>
            <br />

            <div class="p-fluid formgrid grid justify-content-center">
                <div class="field col-4 md:col-4">
                    <label for="firstname2">Nome do Funcionário <span class="obrigatorio">*</span></label>
                    <InputText v-tooltip.top="'Informe o nome do colaborador'" v-model="funcionario" placeholder="Digite o nome do funcionário..." />
                </div>
                <div class="field col-2 md:col-2">
                    <label style="color: white" for="firstname2">.</label><br />
                    <Button label="Pesquisar" @click.prevent="listarCaixasComFiltro()" icon="pi pi-search" class="p-button-info" />
                </div>
                <div class="field col-2 md:col-2">
                    <label style="color: white" for="firstname2">.</label><br />
                    <Button label="Limpar Filtros" @click.prevent="listarCaixas()" icon="pi pi-search" class="p-button-danger" />
                </div>
            </div>
            <Divider></Divider>
            <div class="header-padrao">CONTROLES DE CAIXA</div>
            <div class="card">
                <DataTable
                    dataKey="id"
                    :value="caixas"
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
                        <div class="justify-content-center text-right">
                            <Button @click.prevent="displayCadastroCaixa = true" label="Cadastrar" icon="pi pi-plus" severity="success" />
                        </div>
                    </template>

                    <template #empty> Nenhum caixa encontrado! </template>
                    <template #loading> Carregando informações... Por favor, aguarde! </template>

                    <Column field="id" header="ID" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">id</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>

                    <Column field="funcionario" header="Funcionário" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">funcionario</span>
                            {{ slotProps.data.funcionario }}
                        </template>
                    </Column>

                    <Column field="funcao" header="Função" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">funcao</span>
                            {{ slotProps.data.funcao_funcionario }}
                        </template>
                    </Column>

                    <Column field="banco" header="Banco" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">banco</span>
                            {{ slotProps.data?.banco }}
                        </template>
                    </Column>

                    <Column field="agencia" header="Agência" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">agencia</span>
                            {{ slotProps.data?.agencia }}
                        </template>
                    </Column>

                    <Column field="conta" header="Conta" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">conta</span>
                            {{ slotProps.data?.conta }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="flex gap-2">
                                <div>
                                    <Button @click.prevent="visualizarHistoricoCaixa(slotProps.data.id)" icon="pi pi-eye" class="p-button-info" />
                                </div>
                                <div>
                                    <Button @click.prevent="confirmDeletar(slotProps.data.id)" icon="pi pi-trash" class="p-button-danger" />
                                </div>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <Toast />
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
