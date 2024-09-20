<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import CotacaoService from '../../../service/CotacaoService';

export default {
    data() {
        return {
            toast: new useToast(),
            confirm: new useConfirm(),
            cotacaoService: new CotacaoService(),
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
        this.preloading = false;
    },

    methods: {
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

    <div class="grid">
        <Toast />
        <div class="col-12">
            <div class="grid">
                <div class="col-12 xl:col-12">
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
