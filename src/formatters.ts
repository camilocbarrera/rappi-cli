export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("es-CO")}`;
}
