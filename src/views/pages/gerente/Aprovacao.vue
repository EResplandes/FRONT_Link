<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import FluxoService from '../../../service/FluxoService';
import GerenteService from '../../../service/GerenteService';

export default {
    data() {
        return {
            toast: new useToast(),
            displayConfirmation: ref(false),
            gerenteService: new GerenteService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            fluxoService: new FluxoService(),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            confirm: new useConfirm(),
            loading1: ref(null),
            empresas: ref(null),
            pedidos: ref(null),
            status: ref(null),
            form: ref({
                id_usuario: localStorage.getItem('usuario_id')
            }),
            displayChat: ref(false),
            idFluxo: ref(null),
            preloading: ref(true),
            display: ref(false),
            novaMensagem: ref(null),
            // urlBase: 'http://localhost:8000/storage',
            urlBase: 'https://link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            fluxoPedido: ref(null),
            localGerente: localStorage.getItem('local_id')
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos pedidos relacionas a esse usuário que não foram aprovados por ele mesmo
        this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
            console.log(data);
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
            this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        // Metódo responsável por aprovar fluxo
        aprovarPedido() {
            this.gerenteService.aprovar(this.idFluxo).then((data) => {
                if (data.resposta == 'Pedido aprovado com sucesso!') {
                    this.showSuccess('Pedido aprovado com suceso!');
                    this.buscaPedidos();
                    this.display = false;
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o Administrador!');
                    this.display = false;
                    this.buscaPedidos();
                }
            });
        },

        // Metódo responsável por diretor aprovar pedido
        aprovarPedidoDiretor(idLink) {
            this.gerenteService.aprovarPedidoDiretor(this.idFluxo, idLink).then((data) => {
                this.display = false;
                this.showSuccess('Pedido aprovado com sucesso!');
                this.buscaPedidos();
            });
        },

        // Metódo responsável por reprovar fluxo
        reprovarPedido() {
            this.displayChat = true;
        },

        // Metódo responsável por gerar link
        geraLink(data) {
            let idPedido = data.pedido.id;
            let link = `https://link.gruporialma.com.br/site/#/aprovacao-externa/${idPedido}`;
            // http://localhost:5173/site/#/aprovacao-externa/47 -> Exemplo

            // Cria um elemento de texto temporário
            const tempInput = document.createElement('input');
            tempInput.style.position = 'absolute';
            tempInput.style.left = '-9999px';
            tempInput.value = link;
            document.body.appendChild(tempInput);

            // Seleciona e copia o valor do input temporário
            tempInput.select();
            document.execCommand('copy');

            // Remove o input temporário
            document.body.removeChild(tempInput);

            // Opcional: informar o usuário que o link foi copiado
            alert('Link copiado para a área de transferência: ' + link);
        },

        // Metódo responsável por enviar mensagem para Dr Emival ou Dr. Monica
        enviarMensagem() {
            this.preloading = true;
            this.gerenteService.reprovar(this.idFluxo, this.novaMensagem).then((data) => {
                if (data.resposta == 'Pedido reprovado com sucesso!') {
                    this.display = false;
                    this.displayChat = false;
                    this.showSuccess('Pedido reprovado com sucesso!');
                }
                this.buscaPedidos();
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
            if (data.pedido.status.status == 'Fluxo Reprovado') {
                this.erroPedidoRepwrovado = true;
            }
            this.idFluxo = id;
            this.pdf = data.pedido.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            // this.pdfsrc = 'https://www.gruporialma.com.br/wp-content/uploads/2024/05/pdf-teste.pdf';
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
    <div class="grid">
        <Toast />

        <!-- Visualizar -->
        <Dialog header="Documento" v-model:visible="display" :style="{ width: '80%' }" :modal="true">
            <div class="flex justify-content-center">
                <div v-if="this.localGerente != '1'" class="flex-1 m-1">
                    <Button @click.prevent="aprovarPedido()" icon="pi pi-check" label="Aprovar" class="p-button-success" style="width: 100%" />
                </div>
                <div v-if="this.localGerente == '1'" class="flex-1 m-1">
                    <Button @click.prevent="aprovarPedidoDiretor(2)" icon="pi pi-check" label="Aprovar e Enviar Dr. Emival" class="p-button-success" style="width: 100%" />
                </div>
                <div v-if="this.localGerente == '1'" class="flex-1 m-1">
                    <Button @click.prevent="aprovarPedidoDiretor(1)" icon="pi pi-check" label="Aprovar e Enviar Dr. Mônica" class="p-button-warning" style="width: 100%" />
                </div>
                <div class="flex-1 m-1">
                    <Button @click.prevent="reprovarPedido()" icon="pi pi-times" label="Reprovar" class="p-button-danger" style="width: 100%" />
                </div>
            </div>
            <div class="col-12 md:col-12">
                <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none"> Oops! ocorreu um erro. </iframe>
            </div>
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
                    <InputText class="col-12" type="text" v-model="this.novaMensagem" placeholder="Digite a mensagem..." />
                    <Button @click.prevent="enviarMensagem()" label="Reprovar e enviar mensagem" class="mr-2 mt-3 p-button-success col-12" />
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
                            <h5 for="empresa">Pedidos para Aprovações:</h5>
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
                            {{ formatarData(slotProps.data.data_criacao) }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.pedido.empresa?.nome_empresa }}
                        </template>
                    </Column>

                    <Column field="Descrição" header="Descrição" :sortable="true" class="w-4">
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

                    <Column field="Status" header="Status" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">CNPJ</span>
                            {{ slotProps.data.pedido.status.status }}
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-4 mr-3">
                                    <Button @click.prevent="visualizar(slotProps.data.id_fluxo, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                </div>
                                <div class="col-4 md:col-4 mr-3">
                                    <Button @click.prevent="geraLink(slotProps.data)" icon="pi pi-link" class="p-button-secondary" />
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
