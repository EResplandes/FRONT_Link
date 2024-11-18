<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import ChatService from '../../../service/ChatService';
import NotaService from '../../../service/NotaService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            pedidoService: new PedidoService(),
            notaService: new NotaService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            chatService: new ChatService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            idNota: ref(null),
            loading1: ref(null),
            empresas: ref(null),
            pedidos: ref(null),
            funcionarios: ref(null),
            idPedido: ref(null),
            id_usuario: ref(null),
            status: ref(null),
            conversa: ref(null),
            novaMensagem: ref(null),
            novoAnexo: ref(null),
            form: ref({}),
            editar: ref(false),
            preloading: ref(true),
            display: ref(false),
            displayChat: ref(false),
            displayAnexo: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos reprovados por gerente com status 10
        this.notaService.pedidosReprovadosFiscalPorComprador(localStorage.getItem('usuario_id')).then((data) => {
            this.preloading = false;
            this.pedidos = data.pedidos;
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
        // Metódo responsável por buscar todas os pedidos reprovados por Soleni com status 11
        buscaPedidos() {
            this.preloading = true;
            this.notaService.pedidosReprovadosFiscalPorComprador(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por buscar chat
        chat(id) {
            this.chatService.buscaConversa(id).then((data) => {
                this.conversa = data.conversa;
                this.displayChat = true;
            });
        },

        // Metódo responsável por enviar mensagem para Fiscal
        enviarMensagem() {
            this.preloading = true;
            this.pedidoService.respondePedidoReprovadoFiscal(this.novoAnexo, this.novaMensagem, this.idNota).then((data) => {
                if (data.resposta == 'Mensagem enviada com sucesso!') {
                    this.showSuccess('Mensagem enviada com sucesso!');
                    this.displayChat = false;
                    this.buscaPedidos();
                    this.display = false;
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o Administrador');
                }
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
            this.idNota = data.id_nota;
            this.idPedido = id;
            this.display = true;
            this.pdf = data.pedido.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.pdfsrcnota = `${this.urlBase}/${data.nota}`;
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
            this.novoAnexo = this.$refs.pdf.files[0];
        },

        abrirChat() {
            this.chat(this.idPedido);
            this.displayChat = true;
        }
    }
};
</script>

<template>
    <div style="z-index: 9999" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>
    <div class="grid">
        <!-- Visualizar Pedido de Compra -->
        <Dialog header="Pedido de Compra" v-model:visible="display" :modal="true" :style="{ width: '90%' }">
            <div class="grid">
                <div class="col-6">
                    <Button @click.prevent="this.displayAnexo = true" style="width: 100%" label="Alterar Nota" icon="pi pi-times" class="p-button-info" />
                </div>
                <div class="col-6">
                    <Button @click.prevent="abrirChat()" style="width: 100%" label="Responder" icon="pi pi-check" class="p-button-success" />
                </div>
            </div>

            <Splitter>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrc" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
                <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                    <iframe :src="pdfsrcnota" style="width: 100%; height: 650px; border: none"> Oops! ocorreu um erro. </iframe>
                </SplitterPanel>
            </Splitter>
        </Dialog>

        <!-- Chat -->
        <Dialog header="Chat" v-model:visible="displayChat" :style="{ width: '40%' }" :modal="true">
            <div class="grid">
                <div class="col-12">
                    <div class="card timeline-container">
                        <Timeline :value="conversa" align="alternate" class="customized-timeline">
                            <template #marker="slotProps">
                                <span class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" :style="{ backgroundColor: slotProps.item.color }">
                                    <i :class="slotProps.item.icon"></i>
                                </span>
                            </template>
                            <template #content="slotProps">
                                <Card>
                                    <template #title>
                                        {{ slotProps.item.id_usuario.name }}
                                    </template>
                                    <template #subtitle>
                                        {{ this.formatarData(slotProps.item.data_mensagem) }}
                                    </template>
                                    <template #content>
                                        <h6>
                                            {{ slotProps.item.mensagem }}
                                        </h6>
                                    </template>
                                </Card>
                            </template>
                        </Timeline>
                    </div>
                    <hr />
                    <InputText class="col-12" type="text" v-model="novaMensagem" placeholder="Digite a mensagem..." />
                    <Button @click.prevent="enviarMensagem()" label="Enviar" class="mr-2 mt-3 p-button-success col-12" />
                    <Button @click.prevent="this.displayAnexo = true" label="Alterar Pedido" class="mr-2 mt-3 p-button-secondary col-12" />
                </div>
            </div>
        </Dialog>

        <!-- Anexo -->
        <Dialog header="Insira novo Anexo" v-model:visible="displayAnexo" :style="{ width: '30%' }" :modal="true">
            <div class="grid mt-5 text-center flex justify-content-center align-items-center">
                <FileUpload uploadLabel="Salvar" cancelLabel="Limpar PDF" chooseLabel="Selecione" @change="uploadPdf" type="file" ref="pdf" name="demo[]" accept=".pdf,.docx" :maxFileSize="1000000"></FileUpload>
            </div>
            <div>
                <Button @click.prevent="this.displayAnexo = false" label="Salvar" class="mr-2 mt-3 p-button-success col-12" />
            </div>
        </Dialog>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div class="header-padrao">PEDIDOS REPROVADOS POR FISCAL</div>

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

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.pedido.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Nº Protheus" header="Nº Protheus" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Nº Protheus</span>
                            {{ slotProps.data.pedido.protheus }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Fornecedor" :sortable="true" class="w-4">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.pedido.descricao }}
                        </template>
                    </Column>

                    <Column field="Valor" header="Valor" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.pedido.empresa }}
                        </template>
                    </Column>

                    <Column field="Local" header="Local" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Local</span>
                            {{ slotProps.data.pedido.local }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-4">
                                    <Button @click.prevent="visualizar(slotProps.data.pedido.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
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
