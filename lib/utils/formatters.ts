/**
 * Utility functions for formatting strings, dates, and numbers in SIRSS-GAU.
 */

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-PE', { timeZone: 'America/Lima' });
}

export function formatPlateNumber(plate: string): string {
  // E.g. ABC-123 plate number format for trucks
  const cleaned = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return plate;
}
