<script setup lang="ts">
import { ref } from 'vue';
import type { Category, MashRunResult } from '@/types';
import MashForm from '@/components/MashForm.vue';
import MashResults from '@/components/MashResults.vue';
import DiceRoll from '@/components/DiceRoll.vue';
import MashRunner from '@/components/MashRunner.vue';

type Stage = 'form' | 'dice' | 'run' | 'done';

const stage = ref<Stage>('form');
const step = ref<number>(5);
const categories = ref<Category[] | null>(null);
const result = ref<MashRunResult | null>(null);
const lastRoll = ref<{ d1: number; d2: number; sum: number } | null>(null);

function onStart(payload: { categories: Category[] }) {
  categories.value = payload.categories;
  stage.value = 'dice';
}

function onRollCompleted(payload: { d1: number; d2: number; sum: number }) {
  lastRoll.value = payload;
}

function onRollConfirmed(payload: { d1: number; d2: number; sum: number }) {
  lastRoll.value = payload;
  step.value = payload.sum;
  stage.value = 'run';
  result.value = null;
}

function onRunFinished(payload: MashRunResult) {
  result.value = payload;
  stage.value = 'done';
}

function resetToForm() {
  categories.value = null;
  result.value = null;
  lastRoll.value = null;
  stage.value = 'form';
}

function rerunWithDice() {
  stage.value = 'dice';
}
</script>

<template>
  <main class="container">
    <h1>MASH (Mansion • Apartment • Shack • House)</h1>

    <MashForm v-if="stage==='form'" @start="onStart" />

    <div v-else-if="stage==='dice'" class="card" style="padding:1rem;">
      <h2>Roll the step size 🎲</h2>
      <p class="muted">We’ll count this many each round before crossing one out.</p>
      <DiceRoll @rolled="onRollCompleted" @confirm="onRollConfirmed" />
      <div class="actions" style="margin-top:0.75rem; display:flex; justify-content:flex-end; gap:0.5rem;">
        <button class="secondary" @click="resetToForm">← Edit options</button>
      </div>
    </div>

    <MashRunner
      v-else-if="stage==='run' && categories"
      :categories="categories"
      :step="step"
      @finished="onRunFinished"
      @cancel="rerunWithDice"
    />

    <MashResults
      v-else-if="stage==='done' && categories && result"
      :categories="categories"
      :step="step"
      :result="result"
      :roll="lastRoll"
      @reset="resetToForm"
	  @roll-again="rerunWithDice"
    />
  </main>
</template>

<style scoped>
.muted { color: var(--muted); }
</style>