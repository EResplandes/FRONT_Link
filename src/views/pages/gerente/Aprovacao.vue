<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import FluxoService from '../../../service/FluxoService';
import GerenteService from '../../../service/GerenteService';
import { FilterMatchMode } from 'primevue/api';
import { PDFDocument, rgb } from 'pdf-lib';

export default {
    data() {
        return {
            toast: new useToast(),
            gerenteService: new GerenteService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            fluxoService: new FluxoService(),
            confirm: new useConfirm(),
            empresas: ref(null),
            pedidos: ref(null),
            status: ref(null),
            pdfData: null,
            form: ref({
                id_usuario: localStorage.getItem('usuario_id')
            }),
            urgente: ref(0),
            displayChat: ref(false),
            idFluxo: ref(null),
            pedidoSelecionado: ref(null),
            preloading: ref(true),
            display: ref(false),
            novaMensagem: ref(null),
            urlBase: 'https://api-link.gruporialma.com.br/storage',
            pdf: ref(null),
            pdfsrc: ref(null),
            fluxoPedido: ref(null),
            localGerente: localStorage.getItem('local_id'),
            filters: {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                protheus: { value: null, matchMode: FilterMatchMode.CONTAINS },
                descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
                diretor: { value: null, matchMode: FilterMatchMode.CONTAINS },
                dt_inclusao_formatada: { value: null, matchMode: FilterMatchMode.CONTAINS },
                'empresa.nome_empresa': { value: null, matchMode: FilterMatchMode.CONTAINS },
                status: { value: null, matchMode: FilterMatchMode.CONTAINS },
                valor_formatado: { value: null, matchMode: FilterMatchMode.CONTAINS },
                criador: { value: null, matchMode: FilterMatchMode.CONTAINS }
            }
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos pedidos relacionas a esse usuário que não foram aprovados por ele mesmo
        this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
            console.log(data);
            this.pedidos = data.pedidos.map((pedido) => ({
                ...pedido,
                criador: pedido.pedido.criador,
                descricao: pedido.pedido.descricao,
                diretor: pedido.pedido.link.link,
                protheus: pedido.pedido.protheus,
                dt_inclusao_formatada: this.formatarData(pedido.pedido.dt_inclusao),
                valor_formatado: pedido.pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            }));
            this.preloading = false;
        });

        // Metódo responsável por buscar todas empresas
        this.empresaService.buscaEmpresas().then((data) => {
            if (data.resposta == 'Empresas listados com sucesso!') {
                this.empresas = data.empresas.map((empresa) => empresa.nome_empresa);
            }
        });
    },

    methods: {
        // Metódo responsável por buscar todos pedidos do usuário logado
        buscaPedidos() {
            this.preloading = true;
            this.gerenteService.buscaPedidos(localStorage.getItem('usuario_id')).then((data) => {
                this.pedidos = data.pedidos.map((pedido) => ({
                    ...pedido,
                    criador: pedido.pedido.criador,
                    descricao: pedido.pedido.descricao,
                    diretor: pedido.pedido.link.link,
                    protheus: pedido.pedido.protheus,
                    dt_inclusao_formatada: this.formatarData(pedido.pedido.dt_inclusao),
                    valor_formatado: pedido.pedido.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                }));

                this.preloading = false;
            });
        },

        // Metódo responsável por aprovar fluxo
        aprovarPedido() {
            this.gerenteService.aprovar(this.idFluxo, this.urgente).then((data) => {
                if (data.resposta == 'Pedido aprovado com sucesso!') {
                    this.showSuccess('Pedido aprovado com suceso!');
                    this.buscaPedidos();
                    this.urgente = 0;
                    this.display = false;
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o Administrador!');
                    this.display = false;
                    this.buscaPedidos();
                }
            });
        },

        // Metódo responsável por diretor aprovar pedido
        async aprovarPedidoDiretor(idLink) {
            // const pdfUrl = `http://127.0.0.1:8000/api/pdf/${this.pedidoSelecionado.id}`;
            const pdfUrl = `https://link.gruporialma.com.br/api/pdf/${this.pedidoSelecionado.id}`;

            try {
                const response = await fetch(pdfUrl, { method: 'GET' });

                if (!response.ok) {
                    throw new Error('Erro ao carregar o PDF');
                }

                const arrayBuffer = await response.arrayBuffer();
                this.pdfData = new Uint8Array(arrayBuffer); // Armazena os dados do PDF
                this.editPdf(idLink);
            } catch (error) {
                console.error('Erro ao carregar o PDF:', error);
                alert('Erro ao carregar o PDF. Verifique a URL e tente novamente.');
            }
        },

        async editPdf(idLink) {
            try {
                // Carregar o PDF
                const pdfDoc = await PDFDocument.load(this.pdfData);
                const pages = pdfDoc.getPages();

                // Obter a primeira página
                const firstPage = pages[0];

                // Calcular a altura da página
                const { width, height } = firstPage.getSize();

                // Adicionar texto na altura desejada
                const nome = localStorage.getItem('nome') || 'Nome não encontrado';
                firstPage.drawText(`@${nome}`, {
                    x: 155, // Posição horizontal
                    y: height - 670, // Posição vertical a 50 unidades do topo
                    size: 10,
                    color: rgb(0, 0, 0)
                });

                // Salvar o PDF editado
                const pdfBytes = await pdfDoc.save();

                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                this.gerenteService.aprovarPedidoGerente(this.idFluxo, idLink, this.urgente, blob).then((data) => {
                    if (data.resposta.mensagem == 'Pedido aprovado com sucesso!') {
                        this.showSuccess(data.resposta.mensagem);
                        this.buscaPedidos();
                        this.display = false;
                    }
                });
            } catch (error) {
                console.error('Erro ao editar o PDF:', error);
                alert('Erro ao editar o PDF. Confira o console para mais detalhes.');
            }
        },

        // Metódo responsável por reprovar fluxo
        reprovarPedido() {
            this.displayChat = true;
        },

        // Metódo responsável por gerar link
        geraLink(data) {
            let idPedido = data.pedido.id;
            let link = `https://link.gruporialma.com.br/site/#/aprovacao-externa/${idPedido}`;

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
            this.idPedido = id;
            this.idfluxo = data.id_fluxo;
            this.display = true;
            this.pedidoSelecionado = data.pedido;
            if (data.pedido.status.status == 'Fluxo Reprovado') {
                this.erroPedidoRepwrovado = true;
            }
            this.idFluxo = id;
            this.pdf = data.pedido.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
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
        <Dialog v-model:visible="display" maximizable modal header="Documento" :style="{ width: '80%' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div style="text-align: center; align-items: center; justify-content: center" class="flex items-center m">
                <InputSwitch :trueValue="1" :falseValue="0" :modelValue="urgente" v-model="urgente" />
                <label class="p-3" for="firstname2"><b>URGENTE?</b></label>
            </div>
            <br />
            <div class="flex justify-content-center">
                <div class="flex-1 m-1">
                    <Button @click.prevent="aprovarPedido()" icon="pi pi-check" label="Aprovar" class="p-button-success" style="width: 100%" />
                </div>
                <div class="flex-1 m-1">
                    <Button @click.prevent="reprovarPedido()" icon="pi pi-times" label="Reprovar" class="p-button-danger" style="width: 100%" />
                </div>
            </div>
            <br />
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
            <div class="header-padrao">PEDIDOS PARA APROVAÇÃO</div>

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
                    <template #empty> Nenhum pedido encontrado. </template>
                    <template #loading> Loading customers data. Please wait. </template>
                    <Column field="dt_inclusao_formatada" header="Dt. Inclusão" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ this.formatarData(data.pedido.dt_inclusao) }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Filtrar pela Dt. de Inclusão" />
                        </template>
                    </Column>
                    <Column field="protheus" header="Nº Protheus" :showFilterMenu="false">
                        <template #body="{ data }">
                            {{ data.pedido.protheus }}
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
                    <Column field="diretor" header="Link" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.diretor }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Filtrar por diretor" />
                        </template>
                    </Column>
                    <Column field="descricao" header="Fornecedor" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.pedido.descricao }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Filtrar pela descrição" />
                        </template>
                    </Column>
                    <Column field="empresa.nome_empresa" header="Empresa" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 8rem">
                        <template #body="{ data }">
                            {{ data.pedido.empresa.nome_empresa }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="empresas" placeholder="Selecione" class="p-column-filter" style="min-width: 10rem" :showClear="true">
                                <template #option="slotProps">
                                    {{ slotProps.option }}
                                </template>
                            </Dropdown>
                        </template>
                    </Column>
                    <Column field="criador" header="Comprador" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.pedido.criador }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Filtrar por comprador" />
                        </template>
                    </Column>

                    <Column field="..." header="..." :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="flex gap-2">
                                <Button @click.prevent="visualizar(slotProps.data.id_fluxo, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
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
