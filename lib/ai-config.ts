export const aiConfig = {
  provider: "vercel-ai-gateway",
  model: "openai/gpt-5.4",
  temperature: 0.2,
};

export function isAIConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}
