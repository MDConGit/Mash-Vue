<script setup lang="ts">
import type { Category, MashRunResult } from '@/types';
import { faceToPips } from '@/utils/dice';

const props = defineProps<{
  categories: Category[];
  step: number;
  result: MashRunResult;
  roll?: { d1: number; d2: number; sum: number };
}>();

const emit = defineEmits<{
  (e: 'reset'): void;
  (e: 'roll-again'): void;
}>();
</script>

<template>
  <div class="results">
    <h2>Your MASH Future ✨</h2>

    <div v-if="roll" class="dice-banner card">
      <div class="dice-mini">
        <div class="die-mini">
          <div
            v-for="(on,i) in faceToPips(roll.d1)"
            :key="'d1'+i"
            class="pip-mini"
            :class="{ on }"
          />
        </div>
        <div class="die-mini">
          <div
            v-for="(on,i) in faceToPips(roll.d2)"
            :key="'d2'+i"
            class="pip-mini"
            :class="{ on }"
          />
        </div>
        <div class="sum-mini">
          Step = <strong>{{ roll.sum }}</strong>
        </div>
      </div>
      <div class="hint">Rolled with double dice</div>
    </div>

    <div class="winners">
      <div v-for="cat in categories" :key="cat.id" class="winner-card card">
        <div class="title">{{ cat.name }}</div>
        <div class="value">
          {{ result.winners[cat.id]?.label || '—' }}
        </div>
      </div>
    </div>

    <details class="log">
      <summary>Show elimination order</summary>
      <ol>
        <li v-for="(item, i) in result.eliminationOrder" :key="i">
          <strong>{{ categories.find(c => c.id === item.categoryId)?.name }}:</strong>
          <span class="crossed">{{ item.option.label }}</span>
        </li>
      </ol>
    </details>

    <div class="actions">
      <button class="secondary" @click="emit('reset')">← Edit options</button>
      <button class="primary" @click="emit('roll-again')">🎲 Roll again</button>
    </div>
  </div>
</template>

<style scoped>
.results { display: grid; gap: 1rem; max-width: 900px; margin: 0 auto; }
.dice-banner { padding: .8rem; display:flex; align-items:center; justify-content:space-between; }
.dice-mini { display:flex; align-items:center; gap:.6rem; }

.die-mini {
  width:36px; height:36px; border-radius:7px;
  background:#f9fafb; border:2px solid #e5e7eb;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  grid-template-rows:repeat(3,1fr);
  place-items:center;
  gap:px; padding:3px;
  box-shadow: inset 0 -2px 0 rgba(0,0,0,.08);
  line-height:0;
}
.pip-mini {
  width:7px; height:7px; border-radius:50%;
  background:transparent; opacity:.25;
  justify-self:center;
  align-self:center;
}

.pip-mini.on { background:#111; opacity:1; }
.sum-mini { margin-left:.4rem; color:var(--text); }
.hint { color:var(--muted); font-size:.85rem; }
.winners { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }
.winner-card { border: 1px solid #555; border-radius: 10px; padding: 0.9rem; background: #0e0e0e; }
.title { color: #aaa; font-size: 0.9rem; margin-bottom: 0.25rem; }
.value { font-size: 1.2rem; font-weight: 600; }
.log { border: 1px dashed #444; border-radius: 8px; padding: 0.6rem 0.8rem; }
.crossed { text-decoration: line-through; color: var(--danger); margin-left: 0.5em; }
.actions { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.rerun { display: flex; gap: 0.5rem; align-items: center; }
button.primary { background: var(--primary); color: var(--primary-text); border: none; padding: 0.5rem 0.5rem; border-radius: 6px; }
button.secondary { background: var(--secondary); color: var(--text); border: none; padding: 0.5rem 0.5rem; border-radius: 6px; }
input { background: #111; color: #eee; border: 1px solid #444; border-radius: 6px; padding: 0.45rem 0.6rem; width: 6rem; }
</style>