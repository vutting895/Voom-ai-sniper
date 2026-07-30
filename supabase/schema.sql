create table if not exists trading_signals (
  id bigint generated always as identity primary key,
  symbol text not null,
  action text not null,
  score integer,
  confidence integer,
  created_at timestamp with time zone default now()
);

create index if not exists trading_signals_symbol_idx
on trading_signals(symbol);
