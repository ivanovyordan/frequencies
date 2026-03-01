import type { Repeater } from '../types/repeater';

const API_URL = 'https://api.varna.radio/v1/';

export async function fetchRepeaters(): Promise<Repeater[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Грешка от API: ${response.status} ${response.statusText}`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Неочакван формат от API: очаква се масив');
  }
  return data as Repeater[];
}
