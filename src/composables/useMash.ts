import type { Category, MashRunResult, Option } from '@/types';

function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Small helpers to build default data */
export function createOption(label: string): Option {
  return { id: uid('opt'), label };
}

export function createCategory(name: string, labels: string[]): Category {
  return {
    id: uid('cat'),
    name,
    options: labels.map(createOption),
  };
}