<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import CotacaoService from '../../../service/CotacaoService';
import EmpresaService from '../../../service/EmpresaService';
import LocalService from '../../../service/LocalService';

export default {
    data() {
        return {
            toast: new useToast(),
            confirm: new useConfirm(),
            cotacaoService: new CotacaoService(),
            empresaService: new EmpresaService(),
            localService: new LocalService(),
            form: {},
            resultados: ref(null),
            cotacoes: ref(null),
            informacaoCotacaoSelecionada: ref(null),
            produtos: [],
            empresas: ref(null),
            locais: ref(null),
            preloading: true,
            modalCadastroCotacao: ref(false),
            retiraDataTableCotacoes: ref(false)
        };
    },
    mounted: function () {
        // Metódo responsável por buscar cotações
        this.cotacaoService.buscarCotacoes(localStorage.getItem('usuario_id')).then((data) => {
            this.cotacoes = data.cotacoes;
            this.preloading = false;
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas;
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
        // Metódo responsável por buscar todas cotações
        buscarCotacoes() {
            this.preloading = true;
            this.cotacaoService.buscarCotacoes(localStorage.getItem('usuario_id')).then((data) => {
                this.cotacoes = data.cotacoes;
                this.preloading = false;
            });
        },

        // Metódo responsável por buscar preço de item
        buscarItem() {
            this.preloading = true;
            this.cotacaoService.buscarPrecos(this.form).then((data) => {
                if (data.resposta == 'Itens listados com sucesso!') {
                    this.showInfo('Itens buscados com sucesso!');
                    let inlineResults = data.resultados.inline_shopping_results || [];
                    let shoppingResults = data.resultados.shopping_results || [];
                    let allResults = [...inlineResults, ...shoppingResults];

                    this.resultados = allResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                } else {
                    this.showError('Ocorreu um erro ao buscar os itens!');
                }
                this.preloading = false;
            });
        },

        // Metódo responsável por limpar produto pesquisado atualmente
        limparPesquisa() {
            this.resultados = null;
            this.form = {};
        },

        // Metódo responsável por cadastrar cotação
        cadastrarCotacao() {
            // Array com os nomes dos campos obrigatórios
            const camposObrigatorios = ['empresa', 'local', 'finalidade'];

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

            if (todosCamposPreenchidos) {
                this.cotacaoService.cadastrarCotacao(this.form).then((data) => {
                    this.showSuccess(data.resposta);
                    this.buscarCotacoes();
                    this.form = {};
                    this.modalCadastroCotacao = false;
                });
            }
        },

        // Metódo responsável por cadastrar produto
        adicionarProduto(produto) {
            this.produtos.push(produto); // Adiciona o produto ao array
        },

        // Metódo responsável por retirar datatable de cotações e buscar produtos da cotação
        retiraCotacoes(cotacao) {
            this.retiraDataTableCotacoes = true;
            this.informacaoCotacaoSelecionada = cotacao;
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

    <!-- Modal para cadastrar nova cotação -->
    <Dialog v-model:visible="modalCadastroCotacao" maximizable modal header="NOVA COTAÇÃO" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="p-fluid formgrid grid p-5">
            <div v-if="this.validaInputUrgente == 'Administrador' || this.validaInputUrgente == 'Gestor de Fluxo'" class="field col-1 md:col-1">
                <label for="firstname2">Urgente</label><br />
                <InputSwitch :trueValue="1" :falseValue="0" :modelValue="form.urgente" v-model="form.urgente" />
            </div>

            <div class="field col-12 md:col-2">
                <label for="firstname2">Nº RM</label>
                <InputText type="number" v-tooltip.top="'Digite o número da RM'" v-model="form.rm" />
            </div>

            <div class="field col-12 md:col-5">
                <label for="empresa">Empresa <span class="obrigatorio">*</span></label>
                <Dropdown id="empresa" v-model="form.empresa" :options="empresas" optionLabel="nome_empresa" placeholder="Selecione..."></Dropdown>
            </div>
            <div class="field col-12 md:col-5">
                <label for="local">Local <span class="obrigatorio">*</span></label>
                <Dropdown id="local" v-model="form.local" :options="locais" optionLabel="local" placeholder="Selecione..."></Dropdown>
            </div>
            <div class="field col-12">
                <label for="finalidade">Finalidade: <span class="obrigatorio">*</span></label>
                <Textarea v-tooltip.top="'Digite o forncedor'" id="descricao" rows="4" v-model="form.finalidade" placeholder="Digite o fornecedor..." />
            </div>
            <div class="field col-12 md:col-12 mt-5">
                <Button @click.prevent="cadastrarCotacao()" icon="pi pi-plus" label="CADASTRAR COTAÇÃO" class="mr-2 mb-2 p-button-success" />
            </div>
        </div>
    </Dialog>

    <div class="grid">
        <Toast />
        <div class="col-12">
            <div v-if="!this.retiraDataTableCotacoes" class="card">
                <DataTable
                    :value="cotacoes"
                    paginator
                    :rows="5"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    tableStyle="min-width: 50rem"
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                >
                    <template #header>
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <Button @click="this.modalCadastroCotacao = true" icomodalCadastroCotacaon label="CADASTRAR COTAÇÃO" icon="pi pi-plus" severity="success" raised />
                        </div>
                    </template>
                    <Column field="id" header="ID" style="width: 5%"></Column>
                    <Column field="RM" header="Nº RM" style="width: 5%"></Column>
                    <Column field="empresa.nome_empresa" header="Empresa" style="width: 5%"></Column>
                    <Column field="local.local" header="Local" style="width: 5%"></Column>
                    <Column field="finalidade" header="Finalidade" style="width: 50%"></Column>
                    <Column field="dt_criacao" header="Dt. Criação" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ formatarData(data.dt_criacao) }}
                        </template>
                    </Column>
                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="flex gap-2">
                                <Button @click.prevent="retiraCotacoes(slotProps.data)" icon="pi pi-eye" class="p-button-secondary" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <div v-if="this.retiraDataTableCotacoes" class="grid">
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">FINALIDADE</span>
                                <div class="text-900 font-medium text-xl">{{ this.informacaoCotacaoSelecionada?.finalidade }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-shopping-cart text-green-500 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">EMPRESA</span>
                                <div class="text-900 font-medium text-xl">{{ this.informacaoCotacaoSelecionada?.empresa.nome_empresa }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-briefcase text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <!-- <span @click="rota(2)" class="text-blue-500 font-medium cursor-ver-pedidos">Ver pedidos... </span> -->
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">LOCAL</span>
                                <div class="text-900 font-medium text-xl">{{ this.informacaoCotacaoSelecionada?.local.local }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-map text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <!-- <span @click="rota(3)" class="text-blue-500 font-medium cursor-ver-pedidos">Ver pedidos... </span> -->
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">VALOR</span>
                                <div class="text-900 font-medium text-xl">Valor fake</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-money-bill text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <!-- <span @click="rota(4)" class="text-blue-500 font-medium cursor-ver-pedidos">Ver pedidos... </span> -->
                    </div>
                </div>
                <div class="col-12 xl:col-8">
                    <div class="card">
                        <DataTable :value="produtos" showGridlines scrollable tableStyle="min-width: 50rem" scrollHeight="800px">
                            <ColumnGroup type="header">
                                <Row>
                                    <Column header="PRODUTOS" :rowspan="3" />
                                    <Column header="QUADRO COMPARATIVO DE PREÇOS" :colspan="5" />
                                </Row>

                                <Row>
                                    <Column header="Descrição" />
                                    <Column header="FORNECEDOR" />
                                    <Column header="QUANTIDADE" />
                                    <Column header="VALOR UNIT." />
                                    <Column header="VALOR TOTAL" />
                                </Row>
                            </ColumnGroup>
                            <Column field="pesquisado" header="Produto Pesquisado" style="min-width: 12rem">
                                <template #body="{ data }">
                                    {{ this.form.item }}
                                </template>
                            </Column>
                            <!-- Colunas dinâmicas -->
                            <Column field="title" header="DESCRIÇÃO"></Column>
                            <Column field="source" header="FORNECEDOR"></Column>
                            <Column field="quantity" header="QUANTIDADE"></Column>
                            <Column field="price" header="VALOR"></Column>
                            <Column field="price" header="VALOR TOTAL"></Column>
                        </DataTable>
                    </div>
                </div>

                <div class="col-12 xl:col-4">
                    <div class="card">
                        <h5>BUSCA DE ITENS</h5>
                        <div class="formgroup-inline">
                            <div class="field">
                                <label for="firstname1" class="p-sr-only">Material</label>
                                <InputText v-model="form.item" id="firstname1" type="text" placeholder="Digite o material" />
                            </div>
                            <Button @click.prevent="buscarItem()" label="Pesquisar"></Button>
                            <Button @click.prevent="this.resultados = []" class="ml-2" severity="danger" label="Limpar"></Button>
                        </div>
                        <div style="max-height: 600px; overflow-y: auto">
                            <!-- Definindo a altura máxima e rolagem vertical -->
                            <DataView :value="resultados" :layout="layout" :paginator="true" :rows="9" :sortOrder="sortOrder" :sortField="sortField">
                                <template #list="slotProps">
                                    <div class="col-12">
                                        <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                            <img :src="slotProps.data.thumbnail" :alt="slotProps.data.title" class="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
                                            <div class="flex-1 text-center md:text-left">
                                                <div class="text-1xl"><span class="font-semibold">Descrição:</span> {{ slotProps.data.title }}</div>
                                                <Divider></Divider>
                                                <div class="mt-1 text-1x1"><span class="font-semibold">Fornecedor:</span> {{ slotProps.data.source }}</div>
                                                <Divider></Divider>
                                                <div class="flex align-items-center">
                                                    <span class="text-1x1"><span class="font-semibold">Frete:</span> {{ slotProps.data.shipping }}</span>
                                                </div>
                                                <Divider></Divider>
                                                <div class="mt-1 text-1x1"><span class="font-semibold">Valor:</span> {{ slotProps.data.price }}</div>
                                                <Divider></Divider>
                                                <a :href="slotProps.data.link" target="_blank">
                                                    <Button label="VISUALIZAR" class="mr-2 mb-2 p-button-info buttonFull" />
                                                </a>
                                                <Button @click.prevent="adicionarProduto(slotProps.data)" label="ADICIONAR" class="mr-2 mb-2 p-button-secondary buttonFull" />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </DataView>
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

.buttonFull {
    width: 100%;
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
