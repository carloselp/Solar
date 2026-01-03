export interface MedicaoItem {
    name: string;
    value: number;
}

export interface TimeSeriesPoint {
    createdAt: string;
    name: string;
    value: number;
}

export interface DashboardMetrics {
    current: number;       // Corrente atual
    irradiance: number;    // Irradiação atual
    plateTemp: number;     // Temperatura da Placa atual
    ambientTemp: number;   // Temperatura do Ambiente atual
    voltage: number;       // Tensão atual
    humidity: number;      // Umidade atual
    windSpeed: number;     // Velocidade do Vento atual
}

export interface GeneracaoMedicaoItem {
    createdAt: string;
    name: string;
    geracao: number;
    value: number;
}

export interface HistoricoMedicaoItem{
    createdAt: string;
    value: number;
    name: string;
}