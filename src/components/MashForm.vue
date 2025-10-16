<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { Category } from '@/types';
import { createCategory, createOption } from '@/composables/useMash';
import { PRESETS, sample } from '@/presets/mashPresets';

const emit = defineEmits<{
  (e: 'start', payload: { categories: Category[] }): void;
}>();

function makeFromPreset(presetId: keyof typeof PRESETS, maxPerCat = 5): Category {
  const p = PRESETS[presetId];
  const cap = p.max ?? maxPerCat;
  const labels = sample(p.pool, cap);
  return createCategory(p.name, labels);
}

function makeLockedMASH(): Category {
  const c = createCategory('Home (MASH)', ['Mansion', 'Apartment', 'Shack', 'House']);
  c.locked = true;
  return c;
}

const state = reactive({
  categories: [
    makeLockedMASH(),
    makeFromPreset('partner'),
	makeFromPreset('kids'),
    makeFromPreset('job'),
    makeFromPreset('salary'),
    makeFromPreset('vehicle'),
    makeFromPreset('city'),
  ] as Category[],
});

const canStart = computed(() =>
  state.categories.length > 0 &&
  state.categories.every(c => c.options.filter(o => o.label.trim().length > 0).length >= 2)
);

function addCategory() {
  state.categories.push(createCategory('New Category', ['Option 1', 'Option 2', 'Option 3']));
}

function addFromPreset(presetId: keyof typeof PRESETS) {
  state.categories.push(makeFromPreset(presetId));
}

function removeCategory(index: number) {
  if (state.categories[index].locked) return;
  state.categories.splice(index, 1);
}

function addOption(catIdx: number) {
  const cat = state.categories[catIdx];
  if (cat.locked) return;
  if (cat.options.length >= 5) return;
  state.categories[catIdx].options.push(createOption('New Option'));
}

function removeOption(catIdx: number, optIdx: number) {
  const cat = state.categories[catIdx];
  if (cat.locked) return;
  if (cat.options.length <= 2) return; // keep at least 2 so the game makes sense
  cat.options.splice(optIdx, 1);
}

function rerollCategory(ci: number) {
  const cat = state.categories[ci];
  if (cat.locked) return;

  // Try to map by known presets using the name
  let preset: keyof typeof PRESETS | null = null;
  if (cat.name.startsWith('Partner')) preset = 'partner';
  else if (cat.name.startsWith('Kids')) preset = 'kids';
  else if (cat.name.startsWith('Job')) preset = 'job';
  else if (cat.name.startsWith('Salary')) preset = 'salary';
  else if (cat.name.startsWith('Vehicle')) preset = 'vehicle';
  else if (cat.name.startsWith('City')) preset = 'city';

  if (!preset) return;

  const p = PRESETS[preset];
  const cap = p.max ?? 5;
  const labels = sample(p.pool, cap);
  cat.options = labels.map(createOption);
}

function rerollAll() {
  state.categories.forEach((_, i) => rerollCategory(i));
}

function start() {
  // Normalize labels
  state.categories.forEach(c => {
    c.options = c.options
      .map(o => ({ ...o, label: o.label.trim() }))
      .filter(o => o.label.length > 0);
  });
  emit('start', { categories: JSON.parse(JSON.stringify(state.categories)) });
}
</script>

<template>
  <div class="form">
    <h2>MASH Setup</h2>

    <div class="top-actions">
      <button class="secondary btn-reroll" @click="rerollAll">Randomize all presets</button>
    </div>

    <div class="categories">
      <div v-for="(cat, ci) in state.categories" :key="cat.id" class="category card">
        <div class="category-header">
          <input class="cat-name" v-model="cat.name" :readonly="cat.locked" />
          <div class="right">
            <button class="secondary btn-reroll" v-if="!cat.locked && /^(Partner|Kids|Job|Salary|Vehicle|City)/.test(cat.name)" @click="rerollCategory(ci)">Reroll</button>
            <button class="danger" v-if="!cat.locked && state.categories.length > 1" @click="removeCategory(ci)">Remove</button>
          </div>
        </div>

        <div class="options">
          <div v-for="(opt, oi) in cat.options" :key="opt.id" class="option-row">
            <input v-model="opt.label" :readonly="cat.locked" />
            <button class="danger" v-if="!cat.locked" @click="removeOption(ci, oi)" :disabled="cat.options.length <= 2">✕</button>
          </div>
        </div>

        <button
          class="secondary"
          v-if="!cat.locked"
          @click="addOption(ci)"
          :disabled="(cat.name.startsWith('Home') && cat.options.length >= 4) || (!cat.name.startsWith('Home') && cat.options.length >= 5)"
        >
          + Add option
        </button>
      </div>
    </div>

	<div class="bottom-left-actions">
      <!-- Quick add from preset -->
      <div class="preset-add">
        <span class="muted">Add:</span>
        <button class="secondary" @click="addFromPreset('partner')">Partner</button>
        <button class="secondary" @click="addFromPreset('job')">Job</button>
        <button class="secondary" @click="addFromPreset('city')">City</button>
        <button class="secondary" @click="addFromPreset('vehicle')">Vehicle</button>
        <button class="secondary" @click="addFromPreset('salary')">Salary</button>
        <button class="secondary" @click="addCategory">Custom</button>
      </div>
	</div>

    <div class="actions">
      <button class="primary" :disabled="!canStart" @click="start">Start MASH ➜</button>
    </div>
  </div>
</template>

<style scoped>
.form { display: grid; gap: 1rem; max-width: 900px; margin: 0 auto; }
.field { display: grid; gap: 0.25rem; }
.categories { display: grid; gap: 1rem; }
.category { border: 1px solid #555; border-radius: 8px; padding: 0.75rem; }
.category-header { display: flex; gap: 0.5rem; align-items: center; justify-content: space-between; }
.cat-name { font-weight: 600; }
.options { display: grid; gap: 0.5rem; margin: 0.5rem 0; }
.option-row { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; }
.actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
.bottom-left-actions { display: block; }
.bottom-left-actions .preset-add {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.5rem;
}

.bottom-left-actions button.secondary {
  min-width: 75px;
  text-align: center;
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  line-height: 1;
  vertical-align: middle;
}

button.btn-reroll {
	margin-right: 0.5em;
}

button.btn-reroll::before {
  content: "🎲";
  display: inline-block;
  transform: translateY(0.5px);
}

button.primary { background: var(--primary); color: var(--primary-text); border: none; padding: 0.5rem 0.5rem; border-radius: 6px; }
button.secondary { background: var(--secondary); color: var(--text); border: none; padding: 0.5rem 0.5rem; border-radius: 6px; }
button.danger { background: var(--danger); color: var(--danger-text); border: none; padding: 0.5rem 0.5rem; border-radius: 6px; }
input { background: #111; color: #eee; border: 1px solid #444; border-radius: 6px; padding: 0.45rem 0.6rem; }
small { color: #aaa; }
</style>