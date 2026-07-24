export type HealthStatus = {
  status: 'ok';
  service: string;
};

export type Broker = 'mt5' | 'interactive_brokers' | 'binance';

export type MarketConnectionStatus = {
  broker: Broker;
  connected: boolean;
  mode: string;
  detail: string;
};

export type Tick = {
  broker: Broker;
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  timestamp: string;
};

export const APP_NAME = 'Voom AI Sniper';

export const SUPPORTED_BROKERS: Broker[] = ['mt5', 'interactive_brokers', 'binance'];

export function createHealthStatus(service: string): HealthStatus {
  return {
    status: 'ok',
    service
  };
}
