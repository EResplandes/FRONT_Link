<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { generatePDF } from '../../pages/relatorios/pdf/pdfReprovados';
import RelatorioService from '../../../service/RelatorioService';
export default {
    data() {
        return {
            toast: new useToast(),
            relatorioService: new RelatorioService(),
            displayConfirmation: ref(false),
            displayConfirmationActivation: ref(false),
            visibleRight: ref(false),
            loading1: ref(null),
            preloading: ref(false),
            form: ref({})
        };
    },

    methods: {
        gerarRelatorio() {
            if (this.form.dt_inicio && this.form.dt_fim) {
                this.preloading = true;
                this.relatorioService.buscaPedidosReprovados(this.form).then((data) => {
                    this.preloading = false;
                    try {
                        generatePDF(data.pedidos);
                        this.showSuccess('Relatório gerado com sucesso!');
                    } catch (error) {
                        console.error('Erro ao gerar PDF:', error);
                    } finally {
                        this.loading = false;
                    }
                });
            } else {
                this.showError('Preencha o intervalo de datas!');
            }
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
        <div class="col-12">
            <div class="col-12 lg:col-6">
                <Toast />
            </div>
            <div class="card">
                <h5>Gerar Relatório de Pedidos Reprovados</h5>
                <hr />
                <br />
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-4">
                        <label for="firstname2">Data Início: <span class="obrigatorio">*</span></label>
                        <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data de início'" v-model="this.form.dt_inicio" showIcon iconDisplay="input" />
                    </div>
                    <div class="field col-12 md:col-4">
                        <label for="firstname2">Data Fim: <span class="obrigatorio">*</span></label>
                        <Calendar dateFormat="dd/mm/yy" v-tooltip.top="'Selecione a data de fim'" v-model="this.form.dt_fim" showIcon iconDisplay="input" />
                    </div>
                    <div class="field col-12 md:col-12">
                        <Button @click.prevent="gerarRelatorio()" label="Gerar relatório" class="mr-2 mt-3 p-button-success col-12 p-3" />
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
