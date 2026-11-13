import type { Answer } from './app.contract.d.ts';

export const grants = '';
export const answer: Answer = (source) => {
  if (source === 'greeting') return { label: 'Hello from TypeScript' };
  throw new Error(`Unknown source: ${source}`);
};
