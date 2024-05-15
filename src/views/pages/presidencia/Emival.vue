<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import PedidoService from '../../../service/Pedido';
import ChatService from '../../../service/ChatService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            pedidoService: new PedidoService(),
            chatService: new ChatService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            displayChat: ref(false),
            confirm: new useConfirm(),
            currentIndex: 0,
            loading1: ref(null),
            sleep: ref(null),
            mensagemEmival: ref(null),
            pedidos: ref(null),
            pedidosAprovados: [],
            proximoPedido: ref(null),
            preloading: ref(true),
            ocultaFiltros: ref(false),
            display: ref(false),
            urlBase: 'https://www.gruporialma.com.br/wp-content/uploads',
            pdf: ref(null),
            pdfsrc: ref(null)
        };
    },

    mounted: function () {
        this.preloading = false;
    },

    methods: {
        // Metódo responsável por listagem de pedidos
        listarEmivalMenorQuinhentos() {
            this.preloading = true;
            this.pedidoService.listarEmivalMenorQuinhentos().then((data) => {
                this.pedidos = data.pedidos;
                this.ocultaFiltros = true;
                this.preloading = false;
            });
        },

        // Metódo responsável por aprovar
        aprovar() {
            this.pedidoService.aprovarEmival(this.pedidosAprovados).then((data) => {
                console.log(data);
            });
        },

        // Metódo responsável por listagem de pedidos
        listarEmivalMenorMil() {
            this.preloading = true;
            this.pedidoService.listarEmivalMenorMil().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
                this.ocultaFiltros = true;
            });
        },

        // Metódo responsável por listagem de pedidos
        listarEmivalMaiorMil() {
            this.preloading = true;
            this.pedidoService.listarEmivalMaiorMil().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
                this.ocultaFiltros = true;
            });
        },

        proximoItem() {
            // Verifica se currentIndex é igual ao comprimento dos pedidos
            if (this.currentIndex === this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
                return;
            }

            // Incrementa currentIndex e verifica se está dentro dos limites do array
            this.currentIndex++;
            if (this.currentIndex < this.pedidos.length) {
                console.log(this.pedidosAprovados);
                let proximoPedido = this.pedidos[this.currentIndex];
                this.pedidosAprovados.push({ id: proximoPedido.id, status: 4 });
                this.visualizar(proximoPedido.id, proximoPedido);
                localStorage.setItem('ultimoPedidoAprovado', this.currentIndex);
            } else {
                // Se currentIndex for igual ao comprimento dos pedidos, não há próximo pedido
                this.showInfo('Você chegou ao último para aprovação!');
                let pedidoAtual = this.pedidos[this.currentIndex - 1];
                this.pedidosAprovados.push({ id: pedidoAtual.id, status: 4 });
            }
        },

        async reprovarItem() {
            this.currentIndex++;
            this.proximoPedido = this.pedidos[this.currentIndex];
            this.displayChat = true;
            localStorage.setItem('ultimoPedidoAprovado', this.currentIndex); // Alterado para 'ultimoPedidoAprovado'
            if (this.currentIndex == this.pedidos.length) {
                this.showInfo('Você chegou ao último para aprovação!');
            }
        },

        voltar() {
            if (this.currentIndex == 0) {
                return;
            }

            // Remover o último item do array pedidosAprovados
            this.pedidosAprovados.pop();

            // Recuperar o pedido anterior
            const pedidoAnterior = this.pedidos[--this.currentIndex];

            // Realizar as operações necessárias com o pedido anterior, como visualização, etc.
            this.visualizar(pedidoAnterior.id, this.pedidos[this.currentIndex]);

            // Atualizar o localStorage com o novo índice
            localStorage.setItem('currentIndex', this.currentIndex);
        },

        salvaMensagem() {
            this.chat(this.proximoPedido);

            // Após a conversa ser carregada
            this.pedidosAprovados.push({ id: this.proximoPedido.id, status: 3, mensagem: this.mensagemEmival });

            // Agora você pode chamar a função visualizar para exibir o próximo PDF
            this.visualizar(1, this.proximoPedido);
            this.displayChat = false;
            this.mensagemEmival = null;
        },

        async chat(id) {
            return new Promise((resolve, reject) => {
                this.chatService.buscaConversa(id).then((data) => {
                    if (data.resposta == 'Chat listado com sucesso!') {
                        this.conversa = data.conversa;
                        resolve();
                    } else {
                        this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                        reject(new Error('Erro ao buscar conversa'));
                    }
                });
            });
        },

        // Metódo responsável por visualizar pdf
        visualizar(id, data) {
            this.display = true;
            const dataAgora = new Date();
            this.pdfsrc = `${this.urlBase}/${data.anexo}?t=${dataAgora.getSeconds()}`;
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

        filtrar() {
            this.visibleRight = true;
            this.editar = false;
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

        // Metódo responsável por limpagem de filtros
        limparFiltro() {
            this.buscaPedidos();
            this.showInfo('Filtro removidos com sucesso!');
            this.form = {};
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>

    <Button v-if="this.pedidos != null" label="Voltar" class="p-button-secondary" style="width: 20%" @click="(this.ocultaFiltros = false), (this.pedidos = null)" />

    <div v-if="this.ocultaFiltros == false" class="grid text-center">
        <div class="col-12">
            <Splitter style="height: 300px">
                <SplitterPanel @click.prevent="listarEmivalMenorQuinhentos()" class="flex align-items-center justify-content-center splitter-panel">
                    <h4>até R$ 500,00</h4>
                </SplitterPanel>
                <SplitterPanel @click.prevent="listarEmivalMenorMil()" class="flex align-items-center justify-content-center splitter-panel">
                    <h4>R$ 500,01 à R$ 1000,00</h4>
                </SplitterPanel>
                <SplitterPanel @click.prevent="listarEmivalMaiorMil()" class="flex align-items-center justify-content-center splitter-panel">
                    <h4>Acima de R$ 1000,00</h4>
                </SplitterPanel>
            </Splitter>
        </div>
    </div>

    <!-- Chat -->
    <Dialog header="Chat" v-model:visible="displayChat" :style="{ width: '60%' }" :modal="true">
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
                            <Card v-if="conversa.length == 0">
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
                                    <h6>Sem mensagens anteriores</h6>
                                </template>
                            </Card>
                        </template>
                    </Timeline>
                </div>
                <hr />
                <InputText class="col-12" type="text" v-model="mensagemEmival" placeholder="Digite a mensagem..." />
                <Button @click="salvaMensagem()" label="Enviar" class="mr-2 mt-3 p-button-success col-12" />
            </div>
        </div>
    </Dialog>

    <!-- Visualizar -->
    <Dialog header="Documento" v-model:visible="display" :style="{ width: '95%' }" :modal="true">
        <div class="grid">
            <div class="col-12 md:col-12">
                <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
            </div>
            <div class="col-4 md:col-4">
                <Button icon="pi pi-times" label="Voltar" class="p-button-secondary" style="width: 100%" @click.prevent="voltar()" :disabled="this.currentIndex == 0" />
            </div>
            <div class="col-4 md:col-4">
                <Button icon="pi pi-times" label="Reprovar" class="p-button-danger" style="width: 100%" @click.prevent="reprovarItem()" />
            </div>
            <div class="col-4 md:col-4">
                <Button icon="pi pi-check" label="Próximo" class="p-button-info" style="width: 100%" @click.prevent="proximoItem()" :disabled="this.currentIndex == this.pedidos.length" />
            </div>

            <div class="col-12 md:col-12 text-center">
                <span>Mostrando {{ this.currentIndex }} de {{ this.pedidos.length }} registros!</span>
            </div>
            <div v-if="this.currentIndex == this.pedidos.length" class="col-12 md:col-12">
                <Button icon="pi pi-check" label="Finalizar Aprovações" class="p-button-success" style="width: 100%" @click.prevent="aprovar()" />
            </div>
        </div>
    </Dialog>

    <div class="grid">
        <Toast />
        <ConfirmDialog></ConfirmDialog>
        <!-- Modal Filtros -->
        <Sidebar style="width: 500px" v-model:visible="visibleRight" :baseZIndex="1000" position="right">
            <h3 v-if="this.editar == false" class="titleForm">Filtros</h3>

            <div class="card p-fluid">
                <div class="field">
                    <label for="empresa">Empresa:</label>
                    <Dropdown v-model="form.empresa" :options="empresas" showClear optionLabel="nome_empresa" placeholder="Selecione..." class="w-full" />
                </div>
                <div class="field">
                    <label for="cpf">Descrição: </label>
                    <InputText v-tooltip.left="'Digite a descrição do pedido'" v-model="form.descricao" id="cnpj" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="cpf">Valor: </label>
                    <InputNumber v-tooltip.left="'Digite o valor do pedido'" v-model="form.valor" inputId="minmaxfraction" :minFractionDigits="2" :maxFractionDigits="2" placeholder="Digite..." />
                </div>
                <div class="field">
                    <label for="cpf">Dt. Inclusão:</label>
                    <Calendar v-tooltip.left="'Selecione a data de inclusão'" v-model="form.dt_inclusao" showIcon :showOnFocus="false" class="" />
                </div>
                <hr />
                <div class="field">
                    <Button @click.prevent="buscaFiltros()" label="Filtrar" class="mr-2 mb-2 p-button-secondary" />
                    <Button @click.prevent="limparFiltro()" label="Limpar Filtros" class="mr-2 mb-2 p-button-danger" />
                </div>
            </div>
        </Sidebar>

        <!-- Tabela com todos pedidos com Dr Emival -->
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div v-if="this.pedidos" class="card">
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
                        <div class="flex justify-content-between"></div>
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

                    <Column field="Valor" header="Valor" :sortable="true" class="w-3">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            R$ {{ slotProps.data.valor }}
                        </template>
                    </Column>
                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-5">
                        <template #body="slotProps">
                            <span class="p-column-title">Descrição</span>
                            {{ slotProps.data.descricao }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-3">
                                    <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-secondary" />
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

.splitter-panel {
    transition: background-color 0.3s ease;
    cursor: pointer;
}

.splitter-panel:hover {
    background-color: rgb(231, 231, 231);
}
</style>
