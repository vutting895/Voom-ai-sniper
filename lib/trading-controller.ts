import { predictAction } from "./drl-agent";

export function executeDecision(state: number[]) {
  const action = predictAction(state);

  return {
    action,
    executed: false,
    reason: "Risk approval required before live execution",
  };
}
