<script>
import { ref } from 'vue';
import RelatorioService from '../../../service/RelatorioService';
export default {
    data() {
        return {
            relatorioService: new RelatorioService(),
            informacoes: ref(null),
            preloading: ref(false),
            chartData: ref({}),
            chartOptions: ref({})
        };
    },

    mounted: function () {
        this.relatorioService.buscaInformacoesGrafico().then((data) => {
            this.informacoes = data.informacoes;
            console.log(data);
            this.chartData = this.setChartData(this.informacoes);
            this.chartOptions = this.setChartOptions();
        });
    },

    methods: {
        setChartOptions() {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
            const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

            return {
                plugins: {
                    legend: {
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder
                        }
                    }
                }
            };
        },

        setChartData(data) {
            const colors = [
                'rgba(249, 115, 22, 0.2)',
                'rgba(6, 182, 212, 0.2)',
                'rgba(107, 114, 128, 0.2)',
                'rgba(139, 92, 246, 0.2)',
                'rgba(72, 61, 139, 0.2)',
                'rgba(0, 128, 128, 0.2)',
                'rgba(0, 100, 0, 0.2)',
                'rgba(255, 99, 71, 0.2)',
                'rgba(255, 165, 0, 0.2)',
                'rgba(46, 139, 87, 0.2)',
                'rgba(255, 215, 0, 0.2)',
                'rgba(138, 43, 226, 0.2)',
                'rgba(199, 21, 133, 0.2)',
                'rgba(0, 191, 255, 0.2)',
                'rgba(75, 0, 130, 0.2)',
                'rgba(60, 179, 113, 0.2)',
                'rgba(255, 69, 0, 0.2)',
                'rgba(153, 50, 204, 0.2)',
                'rgba(218, 165, 32, 0.2)',
                'rgba(123, 104, 238, 0.2)'
            ];

            const borderColors = colors.map((color) => color.replace('0.2', '1'));

            return {
                labels: data.map((item) => item.status),
                datasets: [
                    {
                        label: 'Quantidade de Pedidos por Status',
                        data: data.map((item) => item.total),
                        backgroundColor: colors,
                        borderColor: borderColors,
                        borderWidth: 2
                    }
                ]
            };
        }
    }
};
</script>

<template>
    <div style="z-index: 99" v-if="preloading" class="full-screen-spinner">
        <ProgressSpinner />
    </div>
    <Chart type="bar" :data="chartData" :options="chartOptions" />
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
