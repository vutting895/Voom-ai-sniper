export type AgentAction = "BUY" | "SELL" | "HOLD";

export function predictAction(state: number[]): AgentAction {
  if (state.length < 2) return "HOLD";

  return state.at(-1)! > state[0] ? "BUY" : "SELL";
}
