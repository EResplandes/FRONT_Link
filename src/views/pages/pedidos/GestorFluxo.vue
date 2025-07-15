<script>
import { ref } from 'vue';
import Toast from 'primevue/toast';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Timeline from 'primevue/timeline';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';

import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import PedidoService from '../../../service/Pedido';
import EmpresaService from '../../../service/EmpresaService';
import StatusService from '../../../service/StatusService';
import FluxoService from '../../../service/FluxoService';
import ChatService from '../../../service/ChatService';

export default {
    name: 'PedidosComponent',

    components: {
        Toast,
        ProgressSpinner,
        DataTable,
        Column,
        Button,
        Dialog,
        Timeline,
        Tag,
        InputText
    },

    data() {
        return {
            toast: useToast(),
            confirm: useConfirm(),

            displayConfirmation: false,
            displayConfirmationActivation: false,
            visibleRight: false,
            loading1: null,
            novosPedidos: null,

            pedidoService: new PedidoService(),
            empresaService: new EmpresaService(),
            statusService: new StatusService(),
            chatService: new ChatService(),
            fluxoService: new FluxoService(),

            empresas: null,
            pedidos: null,
            status: null,
            indicadores: null,
            pedidoSelecionado: null,
            pedidosUltimaBusca: [],

            form: {},
            idPedido: null,
            editar: false,
            preloading: true,
            displayFluxo: false,
            displayChat: false,
            display: false,

            pdf: null,
            pdfsrc: null,
            fluxoPedido: null,

            conversa: null,
            userLogado: localStorage.getItem('nome'),
            validaExclusaoButton: localStorage.getItem('grupo'),

            urlBase: 'https://api-link.gruporialma.com.br/storage',
            timeLeft: 300, // 5 minutos em segundos
            timerInterval: null,

            chartData: {
                labels: ['Maio', 'Junho', 'Julho'],
                datasets: [
                    {
                        label: 'Aprovados (R$)',
                        backgroundColor: '#3b82f6',
                        data: [180000, 210000, 195000]
                    }
                ]
            },

            chartOptions: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        };
    },

    mounted() {
        this.carregarDados();
        this.iniciarTimer();
    },

    beforeUnmount() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    },

    methods: {
        temPedidoNovo(novaLista) {
            if (!this.pedidosUltimaBusca.length) return false;

            const idsAntigos = this.pedidosUltimaBusca.map((p) => p.id);
            for (const pedido of novaLista) {
                if (!idsAntigos.includes(pedido.id)) {
                    return true;
                }
            }
            return false;
        },

        carregarDados() {
            this.preloading = true;

            this.pedidoService.buscaAnalisando().then((data) => {
                let pedidosFiltrados = data.pedidos;
                if (!(this.userLogado === 'Soleni' || this.userLogado === 'Eduardo C. Resplandes')) {
                    pedidosFiltrados = data.pedidos.filter((pedido) => pedido.criador !== 'DP');
                }

                // Salva os novos pedidos para comparação
                this.novosPedidos = pedidosFiltrados;

                // Verifica se tem pedido novo comparado à última busca
                if (this.temPedidoNovo(this.novosPedidos)) {
                    this.tocarBip();
                    this.notificarNovoPedido();
                }

                // Atualiza lista e última busca
                this.pedidos = this.novosPedidos;
                this.pedidosUltimaBusca = [...this.novosPedidos];
                this.preloading = false;
            });

            // carregar outras informações (empresas, status, indicadores) pode ficar separado
            this.empresaService.buscaEmpresas().then((data) => {
                if (data.resposta === 'Empresas listados com sucesso!') {
                    this.empresas = data.empresas;
                }
            });

            this.statusService.buscaStatus().then((data) => {
                if (data.resposta === 'Status listados com sucesso!') {
                    this.status = data.itens;
                }
            });

            this.fluxoService.buscaIndicadores().then((data) => {
                this.indicadores = data.indicadores;
            });
        },

        iniciarTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }

            this.timerInterval = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    this.timeLeft = 300;
                    this.carregarDados();
                    this.showInfo('Dados atualizados automaticamente!');
                }
            }, 1000);
        },

        atualizarManualmente() {
            this.timeLeft = 300;
            this.carregarDados();
            this.showInfo('Dados atualizados manualmente!');
        },

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        },

        buscaPedidos() {
            this.preloading = true;
            this.pedidoService.buscaAnalisando().then((data) => {
                this.pedidos = data.pedidos;
                this.preloading = false;
            });
        },

        aprovarFluxo() {
            this.fluxoService.aprovarFluxo(this.idPedido).then((data) => {
                if (data.resposta === 'Fluxo aprovado com sucesso!') {
                    this.showSuccess('Fluxo aprovado com sucesso!');
                    this.preloading = true;
                    this.display = false;
                    this.displayFluxo = false;
                    this.carregarDados();
                } else {
                    this.showError('Ocorreu um erro, entre em contato com o Administrador!');
                }
            });
        },

        aprovarFluxoComRessalva() {
            this.fluxoService.aprovarFluxoComRessalva(this.idPedido, this.novaMensagem).then((data) => {
                if (data.resposta === 'Fluxo aprovado com sucesso!') {
                    this.showSuccess('Fluxo aprovado com sucesso!');
                    this.preloading = true;
                    this.display = false;
                    this.displayFluxo = false;
                    this.buscaPedidos();
                    this.carregarDados();
                } else {
                    this.showError('Ocorreu um erro, entre em contato com o Administrador!');
                }
            });
        },

        enviarMensagem() {
            this.preloading = true;
            this.fluxoService.reprovar(this.novaMensagem, this.idPedido).then((data) => {
                if (data.resposta === 'Pedido reprovado com sucesso!') {
                    this.showSuccess('Pedido reprovado com sucesso!');
                    this.display = false;
                    this.displayChat = false;
                    this.displayFluxo = false;
                    this.form = {};
                }
                this.buscaPedidos();
                this.preloading = false;
            });
        },

        reprovarFluxo() {
            this.chatService.buscaConversa(this.idPedido).then((data) => {
                this.conversa = data.conversa;
                this.displayChat = true;
            });
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
        },

        visualizar(id, anexo, data) {
            this.idPedido = id;
            this.pedidoSelecionado = data;
            this.display = true;
            this.pdf = anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
        },

        fluxo(id, data) {
            this.idPedido = id;

            this.chatService.buscaConversa(this.idPedido).then((data) => {
                this.conversa = data.conversa;
                console.log(this.conversa);
            });

            this.fluxoService.buscaFluxo(id).then((data) => {
                if (data.resposta === 'Fluxo listado com sucesso!') {
                    this.fluxoPedido = data.fluxo;
                    this.displayFluxo = true;
                }
            });
        },

        urgente(idPedido) {
            this.preloading = true;
            this.pedidoService.pedidoUrgente(idPedido).then((data) => {
                if (data.resposta === 'Pedido foi definido como urgente com sucesso!') {
                    this.buscaPedidos();
                    this.showSuccess('Pedido definido como urgente com sucesso!');
                    this.preloading = false;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        normal(idPedido) {
            this.preloading = true;
            this.pedidoService.pedidoNormal(idPedido).then((data) => {
                if (data.resposta === 'Pedido foi definido como normal com sucesso!') {
                    this.buscaPedidos();
                    this.showSuccess('Pedido foi definido como normal com sucesso!');
                    this.preloading = false;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
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

        tocarBip() {
            try {
                const ctx = new AudioContext();

                const oscillator = ctx.createOscillator();
                oscillator.type = 'triangle';

                oscillator.frequency.setValueAtTime(880, ctx.currentTime);

                const gainNode = ctx.createGain();
                gainNode.gain.setValueAtTime(0, ctx.currentTime);

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.start();

                gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
                oscillator.stop(ctx.currentTime + 1.5);
            } catch (e) {
                console.warn('Erro ao tocar bip:', e);
            }
        },

        async notificarNovoPedido() {
            if (!('Notification' in window)) {
                console.log('Este navegador não suporta notificações.');
                return;
            }

            if (Notification.permission === 'granted') {
                new Notification('Novo Pedido', {
                    body: 'Há um novo pedido aguardando aprovação.',
                    icon: '/favicon.ico'
                });
            } else if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification('Novo Pedido', {
                        body: 'Há um novo pedido aguardando aprovação.',
                        icon: '/favicon.ico'
                    });
                }
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

        <div class="timer" @click="atualizarManualmente">
            Atualizando em {{ formatTime(timeLeft) }}
            <i class="pi pi-refresh ml-2"></i>
        </div>

        <!-- Visualizar PDF -->
        <Dialog header="Documento" v-model:visible="display" :style="{ width: '80%' }" :modal="true">
            <div class="grid">
                <!-- Coluna do PDF -->
                <div class="col-12 md:col-8">
                    <Button @click.prevent="fluxo(idPedido)" label="Tomada de Ação" icon="pi pi-check" class="p-button-info w-full mb-2" />
                    <iframe :src="pdfsrc" style="width: 100%; height: 700px; border: none; border-radius: 6px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1)" title="Visualização do documento"> Oops! ocorreu um erro ao carregar o documento. </iframe>
                </div>

                <!-- Coluna das informações do pedido -->
                <div class="col-12 md:col-4">
                    <div class="card p-6" style="height: 100%">
                        <h3 class="mt-0 mb-4">Informações do Pedido</h3>

                        <div class="grid">
                            <!-- Linha 1 -->
                            <div class="col-12 field-label">Data Inclusão:</div>
                            <div class="col-12 field-value mb-3">{{ formatarData(pedidoSelecionado?.dt_inclusao) }}</div>

                            <!-- Linha 2 -->
                            <div class="col-12 field-label">N° Protheus:</div>
                            <div class="col-12 field-value mb-3">{{ pedidoSelecionado?.protheus || 'N/A' }}</div>

                            <!-- Linha 3 -->
                            <div class="col-12 field-label">Empresa:</div>
                            <div class="col-12 field-value mb-3">{{ pedidoSelecionado?.empresa || 'N/A' }}</div>

                            <!-- Linha 4 -->
                            <div class="col-12 field-label">Fornecedor:</div>
                            <div class="col-12 field-value mb-3">{{ pedidoSelecionado?.descricao || 'N/A' }}</div>

                            <!-- Linha 5 -->
                            <div class="col-12 field-label">Valor:</div>
                            <div class="col-12 field-value mb-3">
                                {{
                                    pedidoSelecionado?.valor
                                        ? pedidoSelecionado.valor.toLocaleString('pt-BR', {
                                              style: 'currency',
                                              currency: 'BRL'
                                          })
                                        : 'N/A'
                                }}
                            </div>

                            <!-- Linha 6 -->
                            <div class="col-12 field-label">Local:</div>
                            <div class="col-12 field-value mb-3">{{ pedidoSelecionado?.local || 'N/A' }}</div>

                            <!-- Linha 7 -->
                            <div class="col-12 field-label">Criador:</div>
                            <div class="col-12 field-value mb-3">{{ pedidoSelecionado?.criador || 'N/A' }}</div>

                            <!-- Linha 8 -->
                            <div class="col-12 field-label">Link:</div>
                            <div class="col-12 field-value mb-3">
                                <a v-if="pedidoSelecionado?.link" :href="pedidoSelecionado.link" target="_blank" class="text-primary">
                                    {{ pedidoSelecionado.link }}
                                </a>
                                <span v-else>N/A</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>

        <!-- Fluxo de Aprovação -->
        <Dialog header="" v-model:visible="displayFluxo" :style="{ width: '50%' }" :modal="true">
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

                    <Button @click.prevent="enviarMensagem()" label="Reprovar e enviar mensagem" class="mr-2 mt-3 p-button-danger col-12" />
                    <Button @click.prevent="aprovarFluxoComRessalva()" label="Aprovar com ressalva" class="mr-2 p-button-info col-12 mt-2" />
                    <Button @click.prevent="aprovarFluxo()" label="Aprovar" class="mr-2 p-button-success col-12 mt-2" />
                </div>
            </div>
        </Dialog>

        <!-- Seção de Gráficos e KPI -->
        <div class="col-12 mt-3">
            <div class="grid indicadores-container">
                <div class="card p-3 shadow-2 rounded-xl text-center bg-blue-50 indicador-card">
                    <i class="pi pi-calendar text-blue-500 text-xl mb-2"></i>
                    <h5 class="text-blue-700 mb-2">Saída Prevista (Hoje)</h5>
                    <h2 class="text-blue-900 font-bold m-0">
                        {{
                            (indicadores?.valorSaidaHoje || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })
                        }}
                    </h2>
                </div>

                <div class="card p-3 shadow-2 rounded-xl text-center bg-blue-50 indicador-card">
                    <i class="pi pi-calendar text-blue-500 text-xl mb-2"></i>
                    <h5 class="text-yellow-700 mb-2">Saída Prevista (Mês)</h5>
                    <h2 class="text-blue-900 font-bold m-0">
                        {{
                            (indicadores?.valorSaidaMensal || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })
                        }}
                    </h2>
                </div>

                <div class="card p-3 shadow-2 rounded-xl text-center bg-green-50 indicador-card">
                    <i class="pi pi-check-circle text-green-500 text-xl mb-2"></i>
                    <h5 class="text-green-700 mb-2">Pedidos para aprovação</h5>
                    <h2 class="text-red-900 font-bold m-0">{{ indicadores?.pedidopendente }}</h2>
                </div>

                <div class="card p-3 shadow-2 rounded-xl text-center bg-red-50 indicador-card">
                    <i class="pi pi-clock text-red-500 text-xl mb-2"></i>
                    <h5 class="text-red-700 mb-2">Pedidos para aprovação vencendo hoje</h5>
                    <h2 class="text-red-900 font-bold m-0">{{ indicadores?.vencimento }}</h2>
                </div>
            </div>
        </div>

        <!-- Tabela de Pedidos -->
        <div class="col-12">
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
                    <template #empty>Nenhum pedido encontrado!</template>
                    <template #loading>Carregando informações... Por favor, aguarde!</template>

                    <Column class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Categoria</span>
                            <Tag v-if="slotProps.data.urgente == 1" class="mr-2" severity="danger" value="Urgente" />
                            <Tag v-else class="mr-2" severity="info" value="Normal" />
                        </template>
                    </Column>

                    <Column field="Dt. Inclusão" header="Dt. Inclusão" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Dt. Inclusão</span>
                            {{ formatarData(slotProps.data.dt_inclusao) }}
                        </template>
                    </Column>

                    <Column field="Protheus" header="Protheus" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Protheus</span>
                            {{ slotProps.data.protheus }}
                        </template>
                    </Column>

                    <Column field="Empresa" header="Empresa" :sortable="true" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title">Empresa</span>
                            {{ slotProps.data.empresa }}
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
                            <span class="p-column-title">Valor</span>
                            {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>

                    <Column field="Local" header="Local" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Local</span>
                            {{ slotProps.data.local }}
                        </template>
                    </Column>

                    <Column field="Criador" header="Criador" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Criador</span>
                            {{ slotProps.data.criador }}
                        </template>
                    </Column>

                    <Column field="Link" header="Link" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Link</span>
                            {{ slotProps.data.link }}
                        </template>
                    </Column>

                    <Column field="Tipo Pedido" header="Tipo Pedido" :sortable="true" class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title">Tipo Pedido</span>
                            {{ slotProps.data.tipo_pedido }}
                        </template>
                    </Column>

                    <Column class="w-1">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4">
                                    <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data.anexo, slotProps.data)" icon="pi pi-eye" class="p-button-secondary" />
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column v-if="validaExclusaoButton === 'Administrador'" class="w-2">
                        <template #body="slotProps">
                            <span class="p-column-title"></span>
                            <div class="grid">
                                <div class="col-4 md:col-1 mr-6">
                                    <Button @click.prevent="urgente(slotProps.data.id)" label="Urgente" class="p-button-danger" />
                                </div>
                                <div class="col-4 md:col-1 ml-6">
                                    <Button @click.prevent="normal(slotProps.data.id)" label="Normal" class="p-button-info" />
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
    z-index: 9999;
}

.timer {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: rgba(59, 130, 246, 0.8);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-family: monospace;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    user-select: none;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;

    &:hover {
        background: rgba(59, 130, 246, 1);
        transform: scale(1.05);
    }

    .pi {
        transition: transform 0.5s;
    }

    &:hover .pi {
        transform: rotate(360deg);
    }
}

.indicadores-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.indicador-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    transition: transform 0.3s;

    &:hover {
        transform: translateY(-5px);
    }

    i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    h5 {
        margin-bottom: 0.5rem;
        text-align: center;
        font-size: 1rem;
    }

    h2 {
        font-size: 1.5rem;
        margin: 0;
    }
}

.timeline-container {
    max-height: 500px;
    overflow-y: auto;
    padding: 1rem;

    h3 {
        color: #3b82f6;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }
}

.card {
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 1rem;
    transition: box-shadow 0.3s;

    &:hover {
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
}

@media screen and (max-width: 768px) {
    .indicadores-container {
        grid-template-columns: 1fr;
    }

    .timer {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
    }
}

.field-label {
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
}

.field-value {
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 3px solid #3b82f6;
    word-break: break-word;
}

/* Responsividade */
@media screen and (max-width: 960px) {
    .field-label,
    .field-value {
        font-size: 0.85rem;
    }
}
</style>
