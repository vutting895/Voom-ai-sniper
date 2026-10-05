-- ????????????????????? Multi-Broker Authentication, MT5 & Locking
CREATE TABLE IF NOT EXISTS user_brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    broker_id VARCHAR(50) NOT NULL, -- 'bitkub', 'binance', 'okx', 'bybit', 'mt5'
    broker_name VARCHAR(100) NOT NULL,
    api_key TEXT,                     -- ??????? API Key ???? Identifier (???? MT5 Login)
    api_secret_encrypted TEXT NOT NULL, -- ???? API Secret ???? Password ??? MT5 ???????????????
    passphrase_encrypted TEXT,
    mt5_server TEXT,                  -- ???? Broker Server ?????? MT5
    mt5_login BIGINT,                 -- Account Login ID ?????? MT5
    is_locked BOOLEAN DEFAULT false,
    is_paper_trading BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'DISCONNECTED',
    last_connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, broker_id)
);

CREATE INDEX IF NOT EXISTS idx_user_broker_status ON user_brokers(user_id, broker_id, is_locked);
