<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import PedidoService from '../../../service/Pedido';
import NotaService from '../../../service/NotaService';
import { generatePDF } from './aprovacao';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            pedidoService: new PedidoService(),
            notaService: new NotaService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            loading1: ref(null),
            empresas: ref(null),
            pedidos: ref(null),
            status: ref(null),
            form: ref({}),
            idPedido: ref(null),
            idFluxo: ref(null),
            editar: ref(false),
            preloading: ref(true),
            displayFluxo: ref(false),
            display: ref(false),
            displayNota: ref(false),
            // urlBase: 'http://localhost:8000/storage',
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            fluxoPedido: ref(null),
            informacoesPedidos: ref(null)
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

        modalForm(id) {
            this.idPedido = id;
            this.displayNota = true;
        },

        cadastrarNota() {
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

        <!-- Inserir nota -->
        <Dialog header="Nota" v-model:visible="displayNota" :style="{ width: '40%' }" :modal="true">
            <div class="grid">
                <div class="col-12 md:col-12">
                    <FileUpload style="width: 100%" chooseLabel="Selecionar Nota" @change="uploadPdf" mode="basic" type="file" ref="pdf" name="demo[]" accept=".pdf,.docx" :maxFileSize="999999999"></FileUpload>
                </div>
                <div class="col-12 md:col-12">
                    <Button style="width: 100%" @click.prevent="cadastrarNota()" label="Cadastrar Nota" class="p-button-success" />
                </div>
            </div>
        </Dialog>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
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
                    <template #header>
                        <div class="flex justify-content-between">
                            <h5 for="empresa">Pedidos Aprovados:</h5>
                        </div>
                    </template>
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

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-5">
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

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-3 md:col-3 mr-3">
                                    <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                </div>
                                <div class="col-3 md:col-3 mr-3">
                                    <Button @click.prevent="buscaInformacoesPedido(slotProps.data.id)" icon="pi pi-print" class="p-button-secondary" />
                                </div>
                                <div class="col-3 md:col-3 mr-3">
                                    <Button @click.prevent="modalForm(slotProps.data.id)" icon="pi pi-folder-open" class="p-button-warning" />
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

.timeline-container {
    max-height: 300px; /* Defina a altura máxima desejada */
    overflow-y: auto; /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
}
</style>
