<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import LmService from '../../../../service/LmService';

export default {
    data() {
        return {
            toast: new useToast(),
            confirm: new useConfirm(),
            lmService: new LmService(),
            displayConfirmation: ref(false),
            lms: ref(null),
            informacoes: ref(null),
            lancamentos: ref(null),
            compradores: ref(null),
            chat: ref(null),
            novoMaterial: ref({}),
            novaMensagem: ref(null),
            novoAnexo: ref({}),
            quantidadeAutorizada: ref([]),
            materialSelecionado: ref(null),
            menuLateralChat: ref(null),
            menuLateralChatLms: ref(null),
            modalAnexos: ref(null),
            materiais: ref(null),
            cadastroAtivoAnexos: ref(null),
            anexos: ref(null),
            preloading: ref(true),
            lmSelecionada: ref(null),
            statusLm: ref(null),
            ocultarTabelaListasMateriais: ref(false),
            compradorSelecionado: ref(null),
            modalHistoricoLancamentos: ref(null),
            modalAdicionarAnexo: ref(null),
            modalAdicionarMaterial: ref(null),
            modalAssociarComprador: ref(null),
            modalVisualizarLm: ref(null),
            validaGerenteResponsavel: localStorage.getItem('nome'),
            funcaoValidada: null,
            urlAnexo: 'http://localhost:8000/public/'
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos os compradores
        this.lmService.listarCompradores().then((data) => {
            this.compradores = data.compradores;
        });

        this.preloading = false;

        // Metódo responsável por validar funcao
        this.lmService.validaFuncao().then((data) => {
            if (data.status === 200) {
                this.funcaoValidada = data.funcao;

                switch (this.funcaoValidada) {
                    case 'Comprador':
                        // Metódo responsável por buscar todas LM
                        this.lmService.buscaLmsAssociadas().then((data) => {
                            this.lms = data.lm;
                            this.informacoes = data.informacoes;
                        });
                        break;
                    default:
                        // Metódo responsável por buscar todas LM
                        this.lmService.buscaLms().then((data) => {
                            this.lms = data.lm;
                            this.informacoes = data.informacoes;
                        });
                        break;
                }
            }
        });
    },

    methods: {
        confirmarQuantitativo() {
            this.confirm.require({
                message: 'Deseja confirmar a autorização para a quantidade especificada?',
                header: 'Confirmação',
                icon: 'pi pi-exclamation-triangle',
                rejectLabel: 'Cancelar',
                acceptLabel: 'Autorizar',
                accept: () => {
                    this.lmService.autorizarQuantitativo(this.quantidadeAutorizada).then((data) => {
                        this.toast.add({ severity: 'info', summary: 'Confirmar', detail: 'Você validou o quantitivo da LM!', life: 3000 });
                        this.lmSelecionada.status = 'Solicitado';
                    });
                },
                reject: () => {
                    this.toast.add({ severity: 'error', summary: 'Aviso!', detail: 'Operação cancelada!', life: 3000 });
                }
            });
        },

        // Metódo responsável por buscar lms
        async buscarLms() {
            this.lmService.buscaLms().then((data) => {
                this.lms = data.lm;
                this.informacoes = data.informacoes;
            });
        },

        // Metódo responsável por buscar lms de comprador
        async buscarLmsAssociadas() {
            this.lmService.buscaLmsAssociadas().then((data) => {
                this.lms = data.lm;
                this.informacoes = data.informacoes;
            });
        },

        abrirModalVisualizarLm(lm) {
            this.ocultarTabelaListasMateriais = true;
            this.lmSelecionada = lm;
            this.statusLm = lm.status;
            this.materiais = lm.materiais;
            this.idLmSelecioanda = lm.id;
        },

        abrirModalDesignarComprador() {
            this.modalAssociarComprador = true;
        },

        contarLMsPorStatus(status) {
            if (!this.lms) return 0;
            return this.lms.filter((lm) => lm.status === status).length;
        },

        contarLMsCanceladas() {
            if (!this.lms) return 0;
            return this.lms.filter((lm) => lm.status === 'Cancelada').length;
        },

        contarLMsUrgentes() {
            if (!this.lms) return 0;
            return this.lms.filter((lm) => lm.urgente === 1).length;
        },

        contarLMsAtrasadas() {
            if (!this.lms) return 0;
            const hoje = new Date();
            return this.lms.filter((lm) => {
                const prazo = new Date(lm.prazo);
                return prazo < hoje && !['Finalizada', 'Cancelada'].includes(lm.status);
            }).length;
        },

        buscaChat(idMaterial) {
            this.lmService.buscaChat(idMaterial).then((data) => {
                this.chat = data.chat;
            });
        },

        buscaChatLm(idLm) {
            this.lmService.buscaChatLm(idLm).then((data) => {
                this.chat = data.chat;
            });
        },

        abrirNotaFiscal(data) {
            window.open('http://localhost:8000/storage/' + data.nota, '_blank');
        },

        async listarLancamentos() {
            this.lmService.listarLancamentos(this.materialSelecionado).then((data) => {
                this.lancamentos = data.lancamentos;
            });
        },

        async enviarMensagem() {
            this.lmService.enviarMensagem(this.novaMensagem, this.materialSelecionado).then((data) => {
                if (data.status === 200) {
                    this.menuLateralChat = false;
                    this.showSuccess(data.resposta);
                    this.novaMensagem = '';
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        async enviarMensagemLm() {
            this.lmService.enviarMensagemLm(this.novaMensagem, this.lmSelecionada).then((data) => {
                if (data.status === 200) {
                    this.menuLateralChatLms = false;
                    this.showSuccess(data.resposta);
                    this.novaMensagem = '';
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        associarComprador() {
            this.lmService.associarComprador(this.lmSelecionada.id, this.compradorSelecionado.id).then((data) => {
                if (data.status === 200) {
                    this.buscarLms();
                    this.lmSelecionada.comprador = this.compradorSelecionado.name;
                    this.showSuccess(data.resposta);
                    this.modalAssociarComprador = false;
                }
            });
        },

        salvarAnexo() {
            this.novoAnexo.id_lm = this.idLmSelecioanda;
            this.novoAnexo.usuario = localStorage.getItem('nome');
            this.novoAnexo.id_usuario = localStorage.getItem('usuario_id');
            this.lmService.salvarAnexo(this.novoAnexo).then((data) => {
                if (data.status === 200) {
                    this.showSuccess(data.resposta);
                    this.buscarLms();
                    this.cadastroAtivoAnexos = false;
                    this.novoAnexo = {};
                    this.lmService.listarAnexos(this.idLmSelecioanda).then((data) => {
                        this.anexos = data.anexos;
                    });
                }
            });
        },

        salvarNovoMaterial() {
            const camposObrigatorios = [
                { campo: 'indicador', nome: 'Indicador' },
                { campo: 'descricao', nome: 'Descrição' },
                { campo: 'descritiva', nome: 'Descritiva' },
                { campo: 'quantidade', nome: 'Quantidade' },
                { campo: 'unidade', nome: 'Unidade' }
            ];

            for (let item of camposObrigatorios) {
                if (!this.novoMaterial[item.campo]) {
                    this.showError(`Por favor, preencha o campo ${item.nome}.`);
                    return; // Interrompe o processo de salvar até que todos os campos estejam preenchidos
                }
            }

            this.novoMaterial.id_lm = this.idLmSelecioanda;

            this.lmService.cadastrarNovoMaterial(this.novoMaterial).then((data) => {
                this.abrirModalAdicionarMaterial = false;
                if (data.status === 200) {
                    this.showSuccess('Material cadastrado com sucesso!');
                    this.modalAdicionarMaterial = false;
                    this.materiais = data.materiais;
                } else {
                    this.showError('Ocorreu algum erro, entre em contato com o Administrador!');
                }
            });
        },

        iniciarProcessoCompraLm(data) {
            this.lmService.iniciarLm(data.id).then((data) => {
                if (data.status === 200) {
                    this.buscarLmsAssociadas();
                    this.showSuccess(data.resposta);
                } else {
                    this.showError('Ocorreu um erro, entre em contato com o Administrador!');
                }
            });
        },

        abrirChatMaterial(dados) {
            this.materialSelecionado = dados.id;
            this.buscaChat(dados.id);
            this.menuLateralChat = true;
        },

        abrirChatLm() {
            this.buscaChatLm(this.lmSelecionada.id);
            this.menuLateralChatLms = true;
        },

        abrirModalHistoricoLancamentos(material) {
            this.materialSelecionado = material.id;
            this.modalHistoricoLancamentos = true;
            this.listarLancamentos();
        },

        abrirModalAdicionarMaterial() {
            this.modalAdicionarMaterial = true;
        },

        abrirModalAnexos() {
            this.lmService.listarAnexos(this.idLmSelecioanda).then((data) => {
                this.anexos = data.anexos;
                this.modalAnexos = true;
            });
        },

        abrirModalAdicionarAnexo() {
            this.modalAdicionarAnexo = true;
            this.cadastroAtivoAnexos = true;
        },

        atualizarQuantidade(id, quantidadeAutorizada) {
            const index = this.quantidadeAutorizada.findIndex((item) => item.id === id);

            if (index !== -1) {
                this.quantidadeAutorizada[index].quantidade_autorizada = quantidadeAutorizada;
            } else {
                this.quantidadeAutorizada.push({ id, quantidade_autorizada: quantidadeAutorizada });
            }
        },

        visualizarAnexo(anexo) {
            window.open('http://localhost:8000/storage/' + anexo, '_blank');
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

        // Metódo responsável por formatar data padrão br
        formatarData(data) {
            const dataFormatada = new Date(data);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'UTC'
            };

            return new Intl.DateTimeFormat('pt-BR', options).format(dataFormatada);
        },

        formatarDataChat(data) {
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

        verificaStatus(status) {
            switch (status) {
                case 'Novo':
                    return 'success'; // Verde
                case 'Cotação':
                    return 'info'; // Vermelho
                case 'Finalizado':
                    return 'secondary'; // Amarelo
                case 'Alteração Pendete':
                    return 'warning';
                default:
                    return 'secondary'; // Cinza (para status desconhecidos)
            }
        },

        getBadgeClass(id) {
            switch (id) {
                case 1:
                    return 'p-badge p-badge-info'; // Badge azul para "Solicitado"
                case 2:
                    return 'p-badge p-badge-warning'; // Badge amarelo para "Aguardando"
                case 3:
                    return 'p-badge p-badge-success'; // Badge verde para "Processo de Compra"
                case 4:
                    return 'p-badge p-badge-danger'; // Badge vermelho para "Finalizada"
                default:
                    return 'p-badge p-badge-secondary'; // Badge cinza para outros casos
            }
        },

        getIconAnexo(ext) {
            switch (ext) {
                case 'pdf':
                    return 'pi pi-file-pdf text-red-600'; // Badge azul para "Solicitado"
                case 'jpg':
                    return 'pi pi-file-image text-yellow-600';
                case 'jpeg':
                    return 'pi pi-file-image text-yellow-600';
                case 'png':
                    return 'pi pi-file-image text-yellow-600';
                case 'doc':
                    return 'pi pi-file-word text-blue-600';
                case 'docx':
                    return 'pi pi-file-word text-blue-600';
                case 'xlsx':
                    return 'pi pi-file-excel text-green-600';
                default:
                    return 'pi pi-file text-gray-600'; // Badge cinza para outros casos
            }
        },

        getStatusName(id) {
            switch (id) {
                case 1:
                    return 'Aguardando';
                case 2:
                    return 'Cotação';
                case 3:
                    return 'Analisando';
                case 4:
                    return 'Link';
                case 5:
                    return 'Autorizado';
                case 6:
                    return 'Pedido Enviado';
                case 7:
                    return 'Entrega Parcial';
                case 8:
                    return 'Entrega Finalizada';
                default:
                    return 'Status Desconhecido'; // Caso não exista o id
            }
        },

        getStatusStyle(status) {
            const baseClass = 'font-bold ';

            switch (status) {
                case 'Solicitado':
                    return baseClass + 'text-green-600'; // Verde escuro
                case 'Cotação':
                    return baseClass + 'text-blue-600'; // Azul escuro
                case 'Processo de Compra':
                    return baseClass + 'text-gray-600'; // Cinza escuro
                case 'Finalizada':
                    return baseClass + 'text-blue-600'; // Laranja escuro
                case 'Cancelado':
                    return baseClass + 'text-red-600 line-through'; // Vermelho com risco
                case 'Alteração Pendente':
                    return baseClass + 'text-red-600'; // Vermelho com risco
                default:
                    return baseClass + 'text-gray-500'; // Cinza para status desconhecidos
            }
        },

        handleFileUpload() {
            this.novoAnexo.anexo = this.$refs.anexo.files[0];
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
        <ConfirmDialog></ConfirmDialog>

        <!-- Modal para associar comprador a LM -->
        <Dialog v-model:visible="modalAssociarComprador" maximizable modal header="Associar Comprador" :style="{ width: '25rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex flex-column justify-content-center align-items-center gap-3">
                <Dropdown id="Comprador" v-model="compradorSelecionado" :options="compradores" optionLabel="name" placeholder="Selecione..."></Dropdown>
                <Button @click.prevent="associarComprador()" type="submit" severity="secondary" label="ASSOCIAR" />
            </div>
        </Dialog>

        <!-- Modal Chat de Materias -->
        <Sidebar style="width: 600px" v-model:visible="menuLateralChat" :baseZIndex="1000" position="right">
            <div>
                <div class="grid">
                    <div class="col-12">
                        <div class="card timeline-container">
                            <Timeline :value="chat" align="alternate" class="customized-timeline">
                                <template #marker="slotProps">
                                    <span class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" :style="{ backgroundColor: slotProps.item.color }">
                                        <i :class="slotProps.item.icon"></i>
                                    </span>
                                </template>
                                <template #content="slotProps">
                                    <Card>
                                        <template #title>
                                            {{ slotProps.item.usuario }}
                                        </template>
                                        <template #subtitle>
                                            {{ this.formatarDataChat(slotProps.item.data_mensagem) }}
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
                        <Button @click.prevent="enviarMensagem()" label="Enviar" class="mr-2 mt-3 p-button-primary col-12" />
                    </div>
                </div>
            </div>
        </Sidebar>

        <!-- Modal listagem de Anexo-->
        <Sidebar style="width: 650px" v-model:visible="modalAnexos" :baseZIndex="1000" position="right">
            <div class="sidebar-header">
                <h2 class="text-center m-0">Documentos Anexados</h2>
                <Button icon="pi pi-times" @click="modalAnexos = false" class="p-button-rounded p-button-text p-button-danger close-button" />
            </div>

            <div v-if="cadastroAtivoAnexos" class="sidebar-content">
                <div class="form-container">
                    <!-- Seção de Informações do Anexo -->
                    <div class="form-section">
                        <h5 class="section-title"><i class="pi pi-file mr-2"></i>Informações do Documento</h5>

                        <div class="grid form-grid">
                            <!-- Campo de Observação -->
                            <div class="col-12 mt-5">
                                <div class="field">
                                    <label for="observacao" class="required">Descrição do Anexo</label>
                                    <InputText id="observacao" v-model="novoAnexo.observacao" placeholder="Ex: Cotação de preços, Documento de identificação" class="w-full" />
                                </div>
                            </div>

                            <!-- Campo de Upload -->
                            <div class="col-12">
                                <div class="field">
                                    <label for="anexo" class="required">Selecione o Arquivo</label>
                                    <FileUpload class="w-full upload-file" chooseLabel="Selecionar Arquivo" @change="handleFileUpload" mode="basic" type="file" ref="anexo" name="demo[]" :maxFileSize="999999999"></FileUpload>
                                    <small class="field-hint">Formatos aceitos: PDF, DOC, XLS, JPG, PNG (Max. 10MB)</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Seção de Ações -->
                    <div class="form-actions mt-5">
                        <Button label="Cancelar" icon="pi pi-times" @click="cadastroAtivoAnexos = false" class="p-button-outlined p-button-secondary action-button" />
                        <Button label="Salvar Anexo" icon="pi pi-check" @click.prevent="salvarAnexo()" :disabled="!novoAnexo.anexo || !novoAnexo.observacao" class="p-button-success action-button" />
                    </div>
                </div>
            </div>

            <div v-else class="sidebar-content">
                <!-- Botão de adicionar novo anexo -->
                <div class="flex justify-content-end mb-4">
                    <Button @click="abrirModalAdicionarAnexo()" label="Adicionar Anexo" icon="pi pi-plus" class="p-button-success" />
                </div>

                <!-- Lista de anexos - Dados Fakes -->
                <div v-if="anexos.length > 0" class="anexos-list">
                    <!-- Anexo 1 -->
                    <div v-for="anexo in anexos" :key="anexo.id" class="anexo-item">
                        <div class="anexo-icon">
                            <i :class="getIconAnexo(anexo.extensao)" style="color: #e74c3c; font-size: 1.5rem"></i>
                        </div>
                        <div class="anexo-info">
                            <div class="anexo-descricao">{{ anexo.observacao }}</div>
                            <div class="anexo-metadata">
                                <span class="anexo-usuario">{{ anexo.usuario }}</span>
                                <span class="anexo-data"> {{ formatarData(anexo.dt_criacao) }}</span>
                            </div>
                        </div>
                        <div class="anexo-actions">
                            <Button @click.prevent="visualizarAnexo(anexo.anexo)" icon="pi pi-eye" class="p-button-rounded p-button-info p-button-sm" v-tooltip.top="'Visualizar Documento'" />
                        </div>
                    </div>
                </div>

                <div v-else>
                    <div class="no-attachments-card">
                        <div class="no-attachments-content">
                            <i class="pi pi-paperclip" style="font-size: 2rem; color: #a0a0a0"></i>
                            <h3>Nenhum anexo disponível</h3>
                            <p>Esta solicitação não possui documentos anexados.</p>
                        </div>
                    </div>
                </div>

                <!-- Mensagem quando não houver anexos -->
                <div v-if="false" class="empty-state">
                    <i class="pi pi-folder-open" style="font-size: 3rem; color: #ced4da"></i>
                    <h3>Nenhum documento anexado</h3>
                    <p>Adicione o primeiro documento clicando no botão acima</p>
                </div>
            </div>
        </Sidebar>

        <!-- Modal Form Adicionar Material -->
        <Sidebar style="width: 600px" v-model:visible="modalAdicionarMaterial" :baseZIndex="1000" position="right">
            <h2 class="text-center">Adicionar Material</h2>
            <div>
                <div class="grid">
                    <Sidebar style="width: 650px" v-model:visible="modalAdicionarMaterial" :baseZIndex="1000" position="right">
                        <div class="sidebar-header">
                            <h2 class="text-center m-0">Adicionar Material</h2>
                            <Button icon="pi pi-times" @click="modalAdicionarMaterial = false" class="p-button-rounded p-button-text p-button-danger close-button" />
                        </div>

                        <div class="sidebar-content">
                            <div class="form-container">
                                <!-- Seção de Informações Básicas -->
                                <div class="form-section">
                                    <h5 class="section-title"><i class="pi pi-info-circle mr-2"></i>Informações Básicas</h5>

                                    <div class="grid form-grid">
                                        <!-- Linha 1: Descrição + Indicador -->
                                        <div class="col-12 md:col-8">
                                            <div class="field">
                                                <label for="descricao" class="required">Descrição</label>
                                                <InputText id="descricao" v-model="novoMaterial.descricao" placeholder="Descrição resumida do material" class="w-full" />
                                            </div>
                                        </div>

                                        <div class="col-12 md:col-4">
                                            <div class="field">
                                                <label for="indicador" class="required">Indicador</label>
                                                <InputText id="descricao" v-model="novoMaterial.indicador" placeholder="Indicador" class="w-full" />
                                            </div>
                                        </div>

                                        <!-- Linha 2: Quantidade + Unidade -->
                                        <div class="col-12 md:col-6">
                                            <div class="field">
                                                <label for="quantidade" class="required">Quantidade</label>
                                                <InputNumber id="quantidade" v-model="novoMaterial.quantidade" mode="decimal" :min="0" :max="10000" class="w-full" />
                                            </div>
                                        </div>

                                        <div class="col-12 md:col-6">
                                            <div class="field">
                                                <label for="unidade" class="required">Unidade</label>
                                                <InputText id="unidade" v-model="novoMaterial.unidade" placeholder="Exemplo: Unidade, Caixa" class="w-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Seção de Descrição Detalhada -->
                                <div class="form-section mt-4">
                                    <h5 class="section-title"><i class="pi pi-align-left mr-2"></i>Descrição Detalhada</h5>

                                    <div class="field">
                                        <label for="descritiva">Descrição Completa</label>
                                        <Textarea
                                            id="descritiva"
                                            v-model="novoMaterial.descritiva"
                                            :autoResize="true"
                                            rows="3"
                                            placeholder="Informe todos os detalhes técnicos, especificações, referências ou observações importantes sobre o material"
                                            class="w-full"
                                        />
                                        <small class="field-hint">Máximo de 500 caracteres</small>
                                    </div>
                                </div>

                                <!-- Seção de Ações -->
                                <div class="form-actions mt-5">
                                    <Button label="Cancelar" @click="modalAdicionarMaterial = false" class="p-button-outlined p-button-secondary action-button" />
                                    <Button label="Salvar Material" @click="salvarNovoMaterial()" icon="pi pi-check" class="p-button-success action-button" />
                                </div>
                            </div>
                        </div>
                    </Sidebar>
                </div>
            </div>
        </Sidebar>

        <!-- Modal Chat de Lms -->
        <Sidebar style="width: 600px" v-model:visible="menuLateralChatLms" :baseZIndex="1000" position="right">
            <!-- <h2 class="text-center">CHAT</h2> -->
            <div>
                <div class="grid">
                    <div class="col-12">
                        <div class="card timeline-container">
                            <Timeline :value="chat" align="alternate" class="customized-timeline">
                                <template #marker="slotProps">
                                    <span class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2" :style="{ backgroundColor: slotProps.item.color }">
                                        <i :class="slotProps.item.icon"></i>
                                    </span>
                                </template>
                                <template #content="slotProps">
                                    <Card>
                                        <template #title>
                                            {{ slotProps.item.usuario }}
                                        </template>
                                        <template #subtitle>
                                            {{ this.formatarDataChat(slotProps.item.data_mensagem) }}
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
                        <Button @click.prevent="enviarMensagemLm()" label="Enviar" class="mr-2 mt-3 p-button-primary col-12" />
                    </div>
                </div>
            </div>
        </Sidebar>

        <!-- Modal para listar todos itens da LM -->
        <Dialog v-model:visible="modalVisualizarLm" maximizable modal header="ITENS" :style="{ width: '100rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex flex-column justify-content-center align-items-center gap-3">
                <div class="w-full flex justify-content-end mb-3">
                    <Button :disabled="this.statusLm == 'Finalizada'" icon="pi pi-plus" label="Adicionar" @click="abrirModalAdicionarMaterial()" class="p-button-success" />
                </div>

                <DataTable :value="materiais" showGridlines tableStyle="min-width: 50rem">
                    <Column field="id" header="ID"></Column>
                    <Column field="descricao" header="Descrição"></Column>
                    <Column field="unidade" header="Unidade"></Column>
                    <Column field="quantidade" header="Quantidade"></Column>
                    <Column field="quantidade_entregue" header="Quantidade Entregue"></Column>
                    <Column header="Quantidade Pendente">
                        <template #body="slotProps">
                            {{ slotProps.data.quantidade - slotProps.data.quantidade_entregue }}
                        </template>
                    </Column>
                    <Column header="Status">
                        <template #body="slotProps">
                            <span :class="getBadgeClass(slotProps.data.id_status)">
                                {{ getStatusName(slotProps.data.id_status) }}
                            </span>
                        </template>
                    </Column>
                    <Column field="id_pedido" header="Pedido"></Column>
                    <Column header="...">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" @click.prevent="abrirChatMaterial(slotProps.data)" class="p-button-rounded p-button-success" />
                                <Button icon="pi pi-comments" @click.prevent="abrirChatMaterial(slotProps.data)" class="p-button-rounded p-button-primary" />
                                <Button icon="pi pi-book" @click.prevent="abrirModalHistoricoLancamentos(slotProps.data)" class="p-button-rounded p-button-warning" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </Dialog>

        <Dialog v-model:visible="modalHistoricoLancamentos" maximizable modal header="LANÇAMENTOS" :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <DataTable :value="lancamentos" showGridlines tableStyle="min-width: 50rem">
                <Column field="id" header="ID"></Column>
                <Column field="quantidade_entregue" header="Qtd. Entregue"></Column>
                <Column field="numero_nota" header="Nº da Nota"></Column>
                <Column field="created_at" header="Dt. Lançamento">
                    <template #body="slotProps">
                        <span>{{ formatarData(slotProps.data.dt_entrega) }}</span>
                    </template>
                </Column>
                <Column field="created_at" header="Nota">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" @click.prevent="abrirNotaFiscal(slotProps.data)" class="p-button-rounded p-button-info" />
                    </template>
                </Column>
            </DataTable>
        </Dialog>

        <!-- Tabela com todos lms -->
        <div v-if="this.ocultarTabelaListasMateriais == false" class="col-12">
            <!-- Indicadores -->
            <!-- Adicione este código antes da DataTable na seção "Tabela com todos lms" -->
            <div class="col-12 mb-4">
                <div class="grid">
                    <!-- Total de LMs -->
                    <div class="col-12 md:col-2">
                        <div class="card shadow-1 hover:shadow-3 transition-all h-full">
                            <div class="flex justify-content-between align-items-center">
                                <div>
                                    <span class="block text-500 font-medium mb-2">Total de LMs</span>
                                    <div class="text-900 font-medium text-xl">{{ lms ? lms.length : 0 }}</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-list text-blue-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LMs Solicitadas -->
                    <div class="col-12 md:col-2">
                        <div class="card shadow-1 hover:shadow-3 transition-all h-full">
                            <div class="flex justify-content-between align-items-center">
                                <div>
                                    <span class="block text-500 font-medium mb-2">Solicitadas</span>
                                    <div class="text-900 font-medium text-xl">{{ contarLMsPorStatus('Solicitado') }}</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-plus-circle text-green-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LMs Aguardando -->
                    <div class="col-12 md:col-2">
                        <div class="card shadow-1 hover:shadow-3 transition-all h-full">
                            <div class="flex justify-content-between align-items-center">
                                <div>
                                    <span class="block text-500 font-medium mb-2">Aguardando</span>
                                    <div class="text-900 font-medium text-xl">{{ contarLMsPorStatus('Aguardando') }}</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-yellow-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-hourglass text-yellow-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LMs em Processo de Compra -->
                    <div class="col-12 md:col-2">
                        <div class="card shadow-1 hover:shadow-3 transition-all h-full">
                            <div class="flex justify-content-between align-items-center">
                                <div>
                                    <span class="block text-500 font-medium mb-2">Processo de Compra</span>
                                    <div class="text-900 font-medium text-xl">{{ contarLMsPorStatus('Processo de Compra') }}</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-shopping-cart text-orange-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LMs Finalizadas -->
                    <div class="col-12 md:col-2">
                        <div class="card shadow-1 hover:shadow-3 transition-all h-full">
                            <div class="flex justify-content-between align-items-center">
                                <div>
                                    <span class="block text-500 font-medium mb-2">Finalizadas</span>
                                    <div class="text-900 font-medium text-xl">{{ contarLMsPorStatus('Finalizada') }}</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-check-circle text-purple-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LMs com Alteração Pendente -->
                    <div class="col-12 md:col-2">
                        <div class="card shadow-1 hover:shadow-3 transition-all h-full">
                            <div class="flex justify-content-between align-items-center">
                                <div>
                                    <span class="block text-500 font-medium mb-2">Alteração Pendente</span>
                                    <div class="text-900 font-medium text-xl">{{ contarLMsPorStatus('Alteração Pendente') }}</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-exclamation-circle text-red-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DataTable :value="lms" showGridlines tableStyle="min-width: 50rem">
                <Column field="id" header="ID"></Column>
                <Column field="lm" header="LM"></Column>
                <Column field="aplicacao" header="Aplicação"></Column>
                <Column field="local" header="Local"></Column>
                <Column field="empresa" header="Empresa"></Column>
                <Column field="solicitante" header="Solicitante"></Column>
                <Column field="dt_solicitacao" header="Dt. Solicitação">
                    <template #body="slotProps">
                        <span>{{ formatarData(slotProps.data.dt_solicitacao) }}</span>
                    </template>
                </Column>
                <Column field="prazo" header="Prazo Estipulado">
                    <template #body="slotProps">
                        <span>{{ formatarData(slotProps.data.prazo) }}</span>
                    </template>
                </Column>
                <Column field="status" header="Status">
                    <template #body="slotProps">
                        <span :class="getStatusStyle(slotProps.data.status)">
                            {{ slotProps.data.status }}
                        </span>
                    </template>
                </Column>
                <Column field="comprador" header="Comprador">
                    <template #body="slotProps">
                        <span>
                            {{ slotProps.data.comprador ? slotProps.data.comprador : 'N/A' }}
                        </span>
                    </template>
                </Column>
                <Column header="...">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button v-if="slotProps.data.status != 'Aguardando'" label="Visualizar" icon="pi pi-eye" @click.prevent="abrirModalVisualizarLm(slotProps.data)" class="p-button-rounded p-button-info" />
                            <Button
                                v-if="slotProps.data.status == 'Aguardando'"
                                @click="iniciarProcessoCompraLm(slotProps.data)"
                                :disabled="this.funcaoValidada != 'Comprador'"
                                label="Iniciar"
                                icon="pi pi-check"
                                class="p-button-rounded p-button-success"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <div v-else>
            <Button icon="pi pi-arrow-left" label="Voltar" class="p-button-outlined mb-3" @click.prevent="this.ocultarTabelaListasMateriais = false" />
            <div class="grid">
                <!-- Card de Informações Principais (col-4) -->
                <div class="col-12 md:col-4">
                    <div class="card p-4 h-full">
                        <div class="flex justify-content-between align-items-center mb-3">
                            <h2 class="text-xl m-0">Detalhes da LM</h2>
                            <Tag v-if="this.lmSelecionada.urgente == 1" value="URGENTE" severity="danger" />
                        </div>

                        <div class="grid">
                            <!-- Linha 1 -->
                            <div class="col-12 flex align-items-center mb-2">
                                <i class="pi pi-tag mr-2 text-500"></i>
                                <span><strong>LM:</strong> {{ this.lmSelecionada?.lm }}</span>
                            </div>

                            <!-- Linha 2 -->
                            <div class="col-12 flex align-items-center mb-2">
                                <i class="pi pi-building mr-2 text-500"></i>
                                <span><strong>Empresa:</strong> {{ this.lmSelecionada?.empresa }}</span>
                            </div>

                            <!-- Linha 3 -->
                            <div class="col-12 flex align-items-center mb-2">
                                <i class="pi pi-map-marker mr-2 text-500"></i>
                                <span><strong>Local:</strong> {{ this.lmSelecionada?.local }}</span>
                            </div>

                            <!-- Linha 4 -->
                            <div class="col-12 flex align-items-center mb-2">
                                <i class="pi pi-calendar mr-2 text-500"></i>
                                <span><strong>Criação:</strong> {{ formatarDataChat(this.lmSelecionada?.dt_solicitacao) }}</span>
                            </div>

                            <!-- Linha 5 -->
                            <div class="col-12 flex align-items-center mb-2">
                                <i class="pi pi-clock mr-2 text-500"></i>
                                <span><strong>Prazo:</strong> {{ formatarData(this.lmSelecionada?.prazo) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Seção de Detalhes Complementares (col-8) -->
                <div class="col-12 md:col-8">
                    <div class="card p-4 h-full">
                        <div class="grid">
                            <!-- Primeira Linha -->
                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label class="block text-600 text-sm mb-2">Aplicação</label>
                                    <div class="p-3 border-round bg-gray-100">{{ this.lmSelecionada?.aplicacao }}</div>
                                    <!-- Dado temporário -->
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label class="block text-600 text-sm mb-2">Status</label>
                                    <Tag :value="this.lmSelecionada?.status" severity="info" class="w-full justify-content-center" />
                                    <!-- Dado temporário -->
                                </div>
                            </div>

                            <!-- Segunda Linha -->
                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label class="block text-600 text-sm mb-2">Solicitante</label>
                                    <div class="p-3 border-round bg-gray-100 flex align-items-center">
                                        <i class="pi pi-user mr-2"></i>
                                        {{ this.lmSelecionada?.solicitante }}
                                    </div>
                                    <!-- Dado temporário -->
                                </div>
                            </div>

                            <div class="col-12 md:col-6">
                                <div class="field">
                                    <label class="block text-600 text-sm mb-2">Comprador</label>
                                    <div class="p-3 border-round bg-gray-100 flex align-items-center">
                                        <i class="pi pi-users mr-2"></i>
                                        {{ this.lmSelecionada?.comprador }}
                                    </div>
                                    <!-- Dado temporário -->
                                </div>
                            </div>

                            <!-- Terceira Linha - Ações -->
                            <div class="col-12">
                                <div class="flex justify-content-end gap-2 mt-3">
                                    <Button @click.prevent="abrirChatLm()" icon="pi pi-comments" label="Log" class="p-button-outlined" />

                                    <Button @click.prevent="abrirModalAnexos()" icon="pi pi-download" label="Anexos" class="p-button-outlined p-button-help" />

                                    <Button v-if="['Administrador', 'Engenheiro'].includes(this.funcaoValidada)" @click.prevent="abrirModalAdicionarMaterial()" icon="pi pi-plus" label="Adicionar Material" class="p-button-outlined p-button-success" />

                                    <Button v-if="['Administrador', 'Gerente'].includes(this.funcaoValidada)" @click.prevent="abrirModalDesignarComprador()" icon="pi pi-users" label="Designar Comprador" class="p-button-outlined p-button-secondary" />

                                    <Button
                                        v-if="['Administrador', 'Gerente'].includes(this.funcaoValidada) && this.lmSelecionada.status == 'Validação de Quantitativo'"
                                        icon="pi pi-check"
                                        label="Autorizar Quantitativo"
                                        @click.prevent="confirmarQuantitativo()"
                                        class="p-button-outlined p-button-success"
                                    />

                                    <Button icon="pi pi-print" label="Imprimir" class="p-button-outlined p-button-secondary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Seção Inferior (col-12) -->
                <div class="col-12">
                    <div class="card p-4">
                        <h3 class="mt-0 mb-3">Materiais Solicitados</h3>
                        <!-- Exemplo de tabela com dados temporários -->
                        <DataTable :value="materiais" showGridlines tableStyle="min-width: 50rem">
                            <Column field="id" header="ID"></Column>
                            <Column field="indicador" header="Indicador"></Column>
                            <Column field="descricao" header="Descrição"></Column>
                            <Column field="descritiva" header="Descritiva"></Column>
                            <Column field="unidade" header="Unidade"></Column>
                            <Column field="quantidade" header="Quantidade Solicitada"></Column>
                            <Column field="quantidade_autorizada" header="Quantidade Autorizada"></Column>
                            <Column v-if="this.lmSelecionada.status === 'Validação de Quantitativo'" field="quantidade" header="Quantidade Validada">
                                <template #body="slotProps">
                                    <InputNumber v-model.number="slotProps.data.quantidade" @update:modelValue="(val) => atualizarQuantidade(slotProps.data.id, val)" />
                                </template>
                            </Column>
                            <Column field="quantidade_entregue" header="Entregue"></Column>
                            <Column header="Pendente">
                                <template #body="slotProps">
                                    {{ slotProps.data.quantidade - slotProps.data.quantidade_entregue }}
                                </template>
                            </Column>
                            <Column field="id_status" header="Status"></Column>
                        </DataTable>
                    </div>
                </div>

                <!-- Seção de Documentos (col-12) -->
                <div class="col-12"></div>
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
    max-height: 700px;
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

.card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease;

    &:hover {
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
}

.field {
    label {
        font-weight: 600;
        color: #4b5563;
    }

    .p-tag {
        width: 100%;
        padding: 0.75rem;
        justify-content: center;
        font-size: 1rem;
    }
}

.bg-gray-100 {
    background-color: #f9fafb;
    border-radius: 6px;
}

.h-full {
    height: 100%;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
}

.sidebar-content {
    padding: 1.5rem;
    height: calc(100% - 60px);
    overflow-y: auto;
}

.form-container {
    max-width: 100%;
}

.form-section {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e5e7eb;
}

.section-title {
    color: #3b82f6;
    margin-top: 0;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
}

.form-grid {
    margin-bottom: -1rem;
}

.field {
    margin-bottom: 1.5rem;
}

.field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #4b5563;
}

.field label.required:after {
    content: ' *';
    color: #ef4444;
}

.field-hint {
    color: #6b7280;
    font-size: 0.875rem;
    display: block;
    margin-top: 0.25rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.action-button {
    min-width: 150px;
}

.close-button {
    position: absolute;
    right: 1rem;
    top: 1rem;
}

/* Melhorias para os inputs */
::v-deep(.p-inputtext),
::v-deep(.p-dropdown),
::v-deep(.p-inputnumber),
::v-deep(.p-inputtextarea) {
    width: 100%;
}

::v-deep(.p-inputtextarea) {
    font-family: inherit;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
}

.sidebar-content {
    padding: 1.5rem;
    height: calc(100% - 60px);
    overflow-y: auto;
}

.anexos-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.anexo-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s;
}

.anexo-item:hover {
    background-color: #f8f9fa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.anexo-icon {
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
}

.anexo-info {
    flex: 1;
    min-width: 0;
}

.anexo-descricao {
    font-weight: 600;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.anexo-metadata {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.anexo-actions {
    display: flex;
    gap: 0.5rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    text-align: center;
    color: #6b7280;
}

.empty-state h3 {
    margin: 1rem 0 0.5rem;
    color: #4b5563;
}

.close-button {
    position: absolute;
    right: 1rem;
    top: 1rem;
}

.no-attachments-card {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px dashed #dee2e6;
    margin: 1rem 0;
    text-align: center;
}

.no-attachments-content {
    max-width: 300px;
}

.no-attachments-content h3 {
    margin: 1rem 0 0.5rem;
    color: #495057;
    font-size: 1.2rem;
}

.no-attachments-content p {
    color: #6c757d;
    margin: 0;
    font-size: 0.9rem;
}

.sidebar-content {
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 6px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.form-title {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-size: 1.25rem;
}

.upload-field {
    margin-top: 0.5rem;
}

.upload-field .p-button {
    width: 100%;
}
</style>
