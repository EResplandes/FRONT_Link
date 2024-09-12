<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import ChatService from '../../../service/ChatService';
import { generatePDF } from '../comprador/aprovacao';
import { FilterMatchMode } from 'primevue/api';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            pedidoService: new PedidoService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            chatService: new ChatService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            loading1: ref(null),
            idPedido: ref(null),
            empresas: ref([]),
            empresa: ref([]),
            pedidos: ref(null),
            dadosPedidos: ref(null),
            novaMensagem: ref(null),
            status: ref(null),
            displayAlteracao: ref(false),
            form: ref({}),
            editar: ref(false),
            preloading: ref(true),
            displayChat: ref(false),
            display: ref(false),
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            conversa: ref(null),
            customers: null,
            filters: {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                protheus: { value: null, matchMode: FilterMatchMode.CONTAINS },
                descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
                dt_inclusao_formatada: { value: null, matchMode: FilterMatchMode.CONTAINS },
                'empresa.nome_empresa': { value: null, matchMode: FilterMatchMode.CONTAINS },
                status: { value: null, matchMode: FilterMatchMode.CONTAINS },
                valor_formatado: { value: null, matchMode: FilterMatchMode.CONTAINS }
            },
            loading: true
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todas os pedidos
        this.pedidoService.buscaPedidosPorComprador(localStorage.getItem('usuario_id')).then((data) => {
            this.pedidos = data.pedidos.map((pedido) => ({
                ...pedido,
                dt_inclusao_formatada: this.formatarData(pedido.dt_inclusao),
                valor_formatado: pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            }));
            this.preloading = false;
            this.loading = false;
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresa = data.empresas;
            }
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas.map((empresa) => empresa.nome_empresa);
            }
        });

        // Metódo responsável por buscar todos status
        this.statusService.buscaStatus().then((data) => {
            if (data.resposta == 'Status listados com sucesso!') {
                this.status = data.itens.map((status) => status.status);
            }
        });
    },

    methods: {
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

        // Metódo responsável por abrir confiramção de excluir pedido
        confirmExcluir(id_pedido) {
            this.confirm.require({
                message: 'Tem certeza que deseja excluir esse pedido?',
                header: 'Excluir pedido?',
                icon: 'pi pi-info-circle',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Excluir',
                rejectClass: 'p-button-secondary p-button-outlined',
                acceptClass: 'p-button-danger',
                accept: () => {
                    this.excluir(id_pedido);
                },
                reject: () => {}
            });
        },

        // Metóido responsável por buscar dados do pedido para inserir no formulário
        alterar(id) {
            // 1º Passo - Buscar informações do pedido
            this.idPedido = id;
            this.pedidoService.buscaInformacoesPedidoAlterar(id).then((data) => {
                // 2º Passo -> Abrir Modal
                this.displayAlteracao = true;

                // 3º Passo -> Montar Valores no form
                this.form = {
                    descricao: data.pedido[0].descricao,
                    valor: data.pedido[0].valor,
                    empresa: data.pedido[0].empresa,
                    protheus: data.pedido[0]?.protheus,
                    dt_vencimento: data.pedido[0]?.dt_vencimento,
                    urgente: data.pedido[0].urgente
                };
            });
        },

        // Metódo responsável por excluir pedido - Colocar com status 8
        excluir(id) {
            this.preloading = true;
            this.pedidoService.excluirPedido(id).then((data) => {
                if (data.resposta == 'Pedido excluído com sucesso!') {
                    this.showSuccess('Pedido excluído com sucesso!');
                    this.buscaPedidos();
                    this.preloading = false;
                } else {
                    this.showError('Ocorreu um erro, entre em contato com o Administrador!');
                    this.preloading = false;
                }
            });
        },

        // Metódo responsável por buscar informações do pedido
        buscaInformacoesPedido(id) {
            this.preloading = true;
            this.pedidoService.buscaInformacoesPedido(id).then((data) => {
                this.imprimirAutorizacao(data);
            });
        },

        // Metódo responsável por atualizar informaçóes do pedido
        salvarAlteracoes() {
            this.preloading = true;
            this.pedidoService.atualizarInformacoesPedido(this.form, this.idPedido).then((data) => {
                if (data.resposta == 'Pedido atualizado com sucesso!') {
                    this.showSuccess('Pedido atualizado com sucesso!');
                    this.displayAlteracao = false;
                    this.buscaPedidos();
                }
            });
        },

        // Metódo responsável por buscar todos pedidos
        buscaPedidos() {
            this.pedidoService.buscaPedidosPorComprador(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos.map((pedido) => ({
                    ...pedido,
                    dt_inclusao_formatada: this.formatarData(pedido.dt_inclusao),
                    valor_formatado: pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                }));
                this.preloading = false;
                this.loading = false;
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

        chat(id, data) {
            this.dadosPedidos = data;
            this.idPedido = id;
            this.displayChat = true;
            this.chatService.buscaConversa(id).then((data) => {
                if (data.resposta == 'Chat listado com sucesso!') {
                    this.conversa = data.conversa;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }

                this.$nextTick(function () {
                    var container = this.$refs.msgContainer;
                    container.scrollTop = container.scrollHeight + 120;
                });
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

        // Metódo responsável por buscar pedidos com filtros
        buscaFiltros() {
            this.preloading = true;
            this.pedidoService.filtroPedidos(this.form).then((data) => {
                if (data.resposta == 'Pedidos para o Dr. Emival Caiado!') {
                    this.pedidos = data.pedidos;
                    this.form = {};
                    this.showInfo('Filtros aplicados com sucesso!');
                    this.preloading = false;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        getStatus(dados) {
            function getnomes(dados) {
                let nomes = '';
                let qt = 0;
                dados.forEach((element) => {
                    if (qt > 0) {
                        nomes += `-` + ' ';
                    }

                    nomes += `${element.nome_usuario} ${element.funcao}` + ' ';

                    qt++;
                });
                return nomes.trim();
            }

            switch (dados.status.status) {
                case 'Analisando':
                    return `${dados.status.status} - SOLENI `;

                case 'Em Fluxo':
                    return `${dados.status.status} - ${getnomes(dados.pendentes)} `;

                default:
                    return dados.status.status;
            }
        },

        getSeverity(status) {
            switch (status) {
                case 'Reprovado':
                    return 'danger';

                case 'Excluído':
                    return 'danger';

                case 'Enviado para Emival':
                    return 'info';

                case 'Aprovado':
                    return 'success';

                case 'Aprovado com Ressalva':
                    return 'success';

                case 'Enviado para Emival':
                    return 'info';

                case 'Enviado para Fiscal':
                    return 'warning';

                case 'renewal':
                    return null;
            }
        },

        uploadPdf() {
            this.form.pdf = this.$refs.pdf.files[0];
        },

        enviarMensagem() {
            // Caso pedido tenha sido reprovado por Emival e esteja com status Reprovado
            if (this.dadosPedidos.status.status == 'Reprovado') {
                this.preloading = true;
                this.pedidoService.respondePedidoReprovado(this.pdf, this.novaMensagem, this.idPedido).then((data) => {
                    if (data.resposta == 'Mensagem enviada com sucesso!') {
                        this.showSuccess('Mensagem enviada com sucesso!');
                        this.displayChat = false;
                        this.buscaPedidos();
                        this.novaMensagem = '';
                    } else {
                        this.showError('Ocorreu algum problema, entre em contato com o Administrador');
                    }
                });
            } else if (this.dadosPedidos.status.status == 'Aprovado com Ressalva') {
                this.preloading = true;
                this.pedidoService.respondePedidoRessalva(this.novaMensagem, this.idPedido).then((data) => {
                    if (data.resposta == 'Pedido respondido com sucesso!') {
                        this.showSuccess('Mensagem enviada com sucesso!');
                        this.displayChat = false;
                        this.buscaPedidos();
                        this.novaMensagem = '';
                    } else {
                        this.showError('Ocorreu algum problema, entre em contato com o Administrador');
                    }
                });
            } else if (this.dadosPedidos.status.status == 'Reprovado por Soleni') {
                this.preloading = true;
                this.pedidoService.respondePedidoReprovadoSoleni(this.pdf, this.novaMensagem, this.idPedido).then((data) => {
                    if (data.resposta == 'Mensagem enviada com sucesso!') {
                        this.showSuccess('Mensagem enviada com sucesso!');
                        this.displayChat = false;
                        this.buscaPedidos();
                        this.novaMensagem = '';
                    } else {
                        this.showError('Ocorreu algum problema, entre em contato com o Administrador');
                    }
                });
            } else if (this.dadosPedidos.status.status == 'Fluxo Reprovado') {
                this.preloading = true;
                this.pedidoService.respondePedidoReprovadoFluxo(this.pdf, this.novaMensagem, this.idPedido).then((data) => {
                    if (data.resposta == 'Mensagem enviada com sucesso!') {
                        this.showSuccess('Mensagem enviada com sucesso!');
                        this.displayChat = false;
                        this.buscaPedidos();
                        this.novaMensagem = '';
                    } else {
                        this.showError('Ocorreu algum problema, entre em contato com o Administrador');
                    }
                });
            }
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
            <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>

        <!-- Chat -->
        <Dialog header="Chat" v-model:visible="displayChat" :style="{ width: '40%' }" :modal="true">
            <div class="grid">
                <div class="col-12">
                    <div class="card timeline-container" ref="msgContainer">
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

        <!-- Alterar informações pedido -->
        <Sidebar style="width: 500px" v-model:visible="displayAlteracao" :baseZIndex="1000" position="right">
            <div class="card p-fluid">
                <h6 class="titleForm">Formulário de Edição</h6>
                <!-- <div class="field">
                    <label for="descricao">Urgente: </label><br />
                    <InputSwitch :trueValue="1" :falseValue="0" :modelValue="form.urgente" v-model="form.urgente" />
                </div> -->
                <div class="field">
                    <label for="empresa">Empresa:</label>
                    <Dropdown v-model="form.empresa" :options="empresa" showClear optionLabel="nome_empresa" placeholder="Selecione..." class="w-full" />
                </div>
                <div class="field">
                    <label for="valor">Nº Protheus: </label>
                    <InputNumber v-tooltip.left="'Digite o número do pedido no Protheus'" v-model="form.protheus" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="valor">Valor: </label>
                    <InputNumber v-tooltip.left="'Digite o valor do pedido'" v-model="form.valor" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="dt_vencimento">Dt. Vencimento:</label>
                    <Calendar dateFormat="yy-mm-dd" v-tooltip.left="'Selecione a data vencimento do pedido'" v-model="form.dt_vencimento" showIcon :showOnFocus="false" class="" />
                </div>
                <div class="field">
                    <label for="descricao">Fornecedor: </label>
                    <Textarea rows="3" cols="30" v-tooltip.left="'Digite o fornecedor do pedido'" v-model="form.descricao" id="descricao" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="firstname2">Somente se existir alguma alteração no PDF</label>
                    <FileUpload chooseLabel="Selecionar Arquivo" @change="uploadPdf" mode="basic" type="file" ref="pdf" name="demo[]" accept=".pdf,.docx" :maxFileSize="999999999"></FileUpload>
                </div>
                <hr />
                <div class="field">
                    <Button @click.prevent="salvarAlteracoes()" label="Alterar Pedido" class="mr-2 mb-2 p-button-secondary" />
                    <Button @click.prevent="this.displayAlteracao = false" label="Fechar" class="mr-2 mb-2 p-button-danger" />
                </div>
            </div>
        </Sidebar>

        <!-- Tabela com todos pedidos -->
        <div class="col-12">
            <div style="margin-top: 10px" class="header-padrao">TODOS MEUS PEDIDOS <br /><span style="font-size: 10px">( Limitado a os últimos 500 pedidos )</span></div>

            <div class="card">
                <DataTable
                    v-model:filters="filters"
                    :value="pedidos"
                    paginator
                    :rows="10"
                    dataKey="id"
                    :rowsPerPageOptions="[5, 10, 25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} de {last} de {totalRecords} registros!"
                    filterDisplay="row"
                    :loading="loading"
                    :globalFilterFields="['descricao', 'empresa.nome_empresa', 'country.name', 'representative.name', 'status.status']"
                >
                    <template #empty> Nenhum Pedido Encontrado. </template>
                    <template #loading> Loading customers data. Please wait. </template>
                    <Column field="dt_inclusao_formatada" header="Dt. Inclusão" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.dt_inclusao_formatada }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Filtrar pela Dt. de Inclusão" />
                        </template>
                    </Column>
                    <Column field="protheus" header="Nº Protheus" :showFilterMenu="false">
                        <template #body="{ data }">
                            {{ data.protheus }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Filtrar pelo Nº Pedido Protheus" />
                        </template>
                    </Column>
                    <Column field="valor_formatado" header="Valor" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.valor_formatado }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Procurar pelo Valor" />
                        </template>
                    </Column>
                    <Column field="descricao" header="Fornecedor" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.descricao }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Filtrar pela descrição" />
                        </template>
                    </Column>
                    <Column field="empresa.nome_empresa" header="Empresa" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 8rem">
                        <template #body="{ data }">
                            {{ data.empresa.nome_empresa }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="empresas" placeholder="Selecione" class="p-column-filter" style="min-width: 10rem" :showClear="true">
                                <template #option="slotProps">
                                    {{ slotProps.option }}
                                </template>
                            </Dropdown>
                        </template>
                    </Column>

                    <Column header="Status" filterField="status" :showFilterMenu="false" :filterMenuStyle="{ width: '10rem' }" style="min-width: 10rem">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <Tag :value="getStatus(data)" :severity="getSeverity(data.status.status)" />
                            </div>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="status" placeholder="Selecione" class="p-column-filter" style="min-width: 10rem" :showClear="true">
                                <template #option="slotProps">
                                    {{ slotProps.option }}
                                </template>
                            </Dropdown>
                        </template>
                    </Column>
                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="flex gap-2">
                                <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />

                                <!-- Botão de Editar -->
                                <Button
                                    v-if="
                                        ![
                                            'Aprovado',
                                            'Aprovado com Ressalva',
                                            'Excluído',
                                            'Enviado para Fiscal',
                                            'Sem Nota',
                                            'Enviado para Financeiro',
                                            'Nota Reprovada',
                                            'Pago',
                                            'Reprovado por Financeiro - Fiscal',
                                            'Resposta do Pedido de Compra Aprovado com Ressalva',
                                            'Enviado para Pagamento'
                                        ].includes(slotProps.data.status.status)
                                    "
                                    @click.prevent="alterar(slotProps.data.id)"
                                    icon="pi pi-pencil"
                                    class="p-button-warning"
                                />

                                <!-- Botão de Chat -->
                                <Button
                                    v-if="['Aprovado com Ressalva', 'Reprovado por Soleni', 'Fluxo Reprovado'].includes(slotProps.data.status.status)"
                                    @click.prevent="chat(slotProps.data.id, slotProps.data)"
                                    icon="pi pi-comments"
                                    class="p-button-secondary"
                                />

                                <!-- Botão de Imprimir -->
                                <Button
                                    v-if="
                                        ['Aprovado', 'Aprovado com Ressalva', 'Resposta do Pedido de Compra Aprovado com Ressalva', 'Retorno do Pedido de Compra Aprovado com Ressalva', 'Enviado para Fiscal', 'Enviado para Financeiro'].includes(
                                            slotProps.data.status.status
                                        )
                                    "
                                    @click.prevent="buscaInformacoesPedido(slotProps.data.id)"
                                    icon="pi pi-print"
                                    class="p-button-secondary"
                                />

                                <!-- Botão de Excluir -->
                                <Button
                                    v-if="
                                        ![
                                            'Aprovado',
                                            'Aprovado com Ressalva',
                                            'Excluído',
                                            'Enviado para Fiscal',
                                            'Sem Nota',
                                            'Enviado para Financeiro',
                                            'Nota Reprovada',
                                            'Pago',
                                            'Reprovado por Financeiro - Fiscal',
                                            'Resposta do Pedido de Compra Aprovado com Ressalva',
                                            'Enviado para Pagamento'
                                        ].includes(slotProps.data.status.status)
                                    "
                                    @click.prevent="confirmExcluir(slotProps.data.id)"
                                    icon="pi pi-trash"
                                    class="p-button-danger"
                                />
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
    max-height: 300px;
    /* Defina a altura máxima desejada */
    overflow-y: auto;
    /* Adiciona uma barra de rolagem vertical quando o conteúdo excede a altura máxima */
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
