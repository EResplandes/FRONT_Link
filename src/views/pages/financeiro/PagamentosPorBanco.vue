<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import PedidoService from '../../../service/Pedido';
import ParcelaService from '../../../service/ParcelaService';
import BancoService from '../../../service/BancoService';

export default {
    data() {
        return {
            toast: new useToast(),
            pedidoService: new PedidoService(),
            bancoService: new BancoService(),
            parcelaService: new ParcelaService(),
            pedidos: ref(null),
            parcelas: ref(null),
            parcelasPedido: ref(null),
            form: ref({}),
            preloading: ref(true),
            displayChat: ref(false),
            novaMensagem: ref(null),
            displayDiretorio: ref(false),
            display: ref(false),
            displayParcelas: ref(false),
            urlBase: 'https://api-link.gruporialma.com.br/storage',
            pdf: ref(null),
            bancos: ref(null),
            pdfsrc: ref(null),
            pdfsrcboleto: ref(null),
            pdfsrcnota: ref(null),
            idParcela: ref(false),
            validaListaBancos: ref(false)
        };
    },

    mounted: function () {
        // Metódo responsável por buscar todos os bancos
        this.bancoService.listarBancos().then((data) => {
            this.bancos = data.bancos;
            this.preloading = false;
        });
    },

    methods: {
        // Metódo responsável por buscar parcelas de certo banco
        visualizarParcelas(idBanco) {
            this.preloading = true;
            this.parcelaService.buscarParcelasPorBanco(idBanco).then((data) => {
                this.parcelas = data.parcelas;
                this.validaListaBancos = true;
                this.preloading = false;
            });
        },

        // Metódo responsável por buscar parcelas relacionadas a 1
        parcelasPorPedido(idPedido) {
            this.displayParcelas = true;
            this.preloading = true;
            this.parcelaService.buscarParcelasPorPedido(idPedido).then((data) => {
                if (data.resposta == 'Parcelas listadas com sucesso!') {
                    this.parcelasPedido = data.parcelas;
                    this.showSuccess('Parcelas listadas com sucesso!');
                } else {
                    this.showError('Ocorreu algum problema, entre em contato com o Administrador!');
                }

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
                timeZone: 'UTC'
            };

            return new Intl.DateTimeFormat('pt-BR', options).format(dataFormatada);
        },

        // Metódo responsável por visualizar pdf
        visualizar(id, data) {
            this.display = true;
            this.idPedido = id;
            this.idParcela = data.id_parcela;
            this.pdf = data.pedido.anexo;
            this.pdfsrc = `${this.urlBase}/${this.pdf}`;
            this.pdfsrcnota = `${this.urlBase}/${data.pedido.nota[0]?.nota}`;
            this.pdfsrcboleto = `${this.urlBase}/${data.pedido.boleto[0]?.boleto}`;
        },

        showSuccess(mensagem) {
            this.toast.add({
                severity: 'success',
                summary: 'Sucesso!',
                detail: mensagem,
                life: 3000
            });
        },

        showError(mensagem) {
            this.toast.add({
                severity: 'error',
                summary: 'Ocorreu um erro!',
                detail: mensagem,
                life: 3000
            });
        },

        // Metódo por pintar linha da tabela de vermelho caso data seja a atual
        rowClass(data) {
            const dtAtual = this.dataAtual();
            const dtVencimento = this.formatarData(data.dt_vencimento);
            if (dtAtual === dtVencimento) {
                return 'bg-red-500';
            } else {
                return 'bg-white';
            }
        },

        formatarDataPadraoBR(data) {
            const partes = data.split('-');
            const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            return dataFormatada;
        },

        verificaPrioridade(status) {
            return status == 'Pago' ? 'success' : 'danger';
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>

    <!-- Modal visualizar PDFs -->
    <Dialog v-model:visible="display" header="INFORMAÇÕES" :style="{ width: '90%' }" maximizable>
        <Splitter>
            <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                <iframe :src="pdfsrc" style="width: 100%; height: 900px; border: none"> Oops! ocorreu um erro. </iframe>
            </SplitterPanel>
            <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                <iframe :src="pdfsrcnota" style="width: 100%; height: 900px; border: none"> Oops! ocorreu um erro. </iframe>
            </SplitterPanel>
            <SplitterPanel class="flex align-items-center justify-content-center splitter-panel">
                <iframe :src="pdfsrcboleto" style="width: 100%; height: 900px; border: none"> Oops! ocorreu um erro. </iframe>
            </SplitterPanel>
        </Splitter>
    </Dialog>

    <!-- Visualização de Parcelas -->
    <Dialog v-model:visible="displayParcelas" header="PARCELAS" :style="{ width: '60%' }" maximizable modal :contentStyle="{ height: '80%' }">
        <div class="grid">
            <DataTable :value="parcelasPedido" stripedRows class="w-full">
                <Column field="id" header="Id" style="width: 10%"></Column>
                <Column field="valor" header="Valor" style="width: 20%">
                    <template v-slot:body="slotProps">
                        {{ slotProps.data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                    </template>
                </Column>
                <Column field="dt_vencimento" header="Dt. Vencimento" style="width: 20%">
                    <template v-slot:body="slotProps">
                        {{ slotProps.data.dt_vencimento ? this.formatarDataPadraoBR(slotProps.data.dt_vencimento) : 'N/C' }}
                    </template>
                </Column>
                <Column field="dt_pagamento" header="Dt. Pagamentos" style="width: 20%">
                    <template v-slot:body="slotProps">
                        {{ slotProps.data.dt_pagamento ? this.formatarDataPadraoBR(slotProps.data.dt_pagamento) : 'N/C' }}
                    </template>
                </Column>
                <Column field="status" header="Status" style="width: 20%">
                    <template v-slot:body="slotProps">
                        <Badge :value="slotProps.data.status" :severity="verificaPrioridade(slotProps.data.status)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </Dialog>

    <div class="grid">
        <div class="col-12">
            <Button v-if="this.validaListaBancos == true" @click.prevent="this.validaListaBancos = false" label="Voltar" class="p-button-info mb-2" />

            <div v-if="this.validaListaBancos == false" class="card">
                <h5>BANCOS</h5>
                <DataView :value="bancos" :layout="layout" :rows="10" :sortOrder="sortOrder" :sortField="sortField" class="w-full">
                    <template #list="slotProps">
                        <div class="col-12">
                            <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                <img :src="slotProps.data.url_img_banco" :alt="slotProps.data.name" class="my-4 md:my-0 shadow-2 mr-5" style="width: 100px; height: 100px; object-fit: cover" />
                                <div class="flex-1 text-center md:text-left">
                                    <div class="font-bold text-2xl">{{ slotProps.data.banco }}</div>
                                    <div class="mb-3">{{ slotProps.data.description }}</div>
                                </div>
                                <div class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                    <Button @click.prevent="visualizarParcelas(slotProps.data.id)" icon="pi pi-eye" label="Visualizar" class="mb-2"></Button>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
            </div>
            <div v-if="this.validaListaBancos == true" class="card">
                <h5>PAGAMENTOS</h5>
                <br />
                <DataTable :value="parcelas" stripedRows>
                    <Column header="Dt. Venc">
                        <template #body="slotProps">
                            {{ this.formatarData(slotProps.data.dt_vencimento) }}
                        </template>
                    </Column>
                    <Column field="pedido.descricao" header="Fornecedor"></Column>
                    <Column field="pedido.protheus" header="Nº Protheus" class="w-2"></Column>
                    <Column field="pedido.empresa" header="Empresa" class="w-2"></Column>
                    <Column header="Valor Parcela">
                        <template #body="slotProps">
                            {{ slotProps.data.valor_parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </template>
                    </Column>
                    <Column field="pedido.criador" header="Comprador" class="w-2"></Column>
                    <Column field="status" header="Status" class="w-1"></Column>
                    <Column header="...">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button @click.prevent="visualizar(slotProps.data.id, slotProps.data)" icon="pi pi-eye" class="p-button-info" />
                                <Button @click.prevent="parcelasPorPedido(slotProps.data.pedido.id_pedido)" icon="pi pi-file" class="p-button-secondary" />
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
</style>
