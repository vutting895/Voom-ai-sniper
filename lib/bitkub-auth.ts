export type BitkubCredentials = {
  apiKey: string;
  secret: string;
};

export function isBitkubConfigured(): boolean {
  return Boolean(
    process.env.BITKUB_API_KEY && process.env.BITKUB_SECRET
  );
}

export function getBitkubCredentials(): BitkubCredentials | null {
  if (!isBitkubConfigured()) return null;

  return {
    apiKey: process.env.BITKUB_API_KEY!,
    secret: process.env.BITKUB_SECRET!,
  };
}
