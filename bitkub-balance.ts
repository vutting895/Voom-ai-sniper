export type Balance = {
  currency: string;
  available: number;
  reserved: number;
};

export async function getBitkubBalance(): Promise<Balance[]> {
  return [
    {
      currency: "THB",
      available: 0,
      reserved: 0,
    },
  ];
}
