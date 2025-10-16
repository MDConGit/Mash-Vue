<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { faceToPips } from '@/utils/dice';

const emit = defineEmits<{
  (e: 'rolled', payload: { d1: number; d2: number; sum: number }): void;
  (e: 'confirm', payload: { d1: number; d2: number; sum: number }): void;
}>();

const rolling = ref(false);
const settled = ref(false);
const d1 = ref(1);
const d2 = ref(1);

function randFace() {
  return Math.floor(Math.random() * 6) + 1;
}

async function roll() {
  if (rolling.value) return;
  settled.value = false;
  rolling.value = true;

  const duration = 2000;  // slower spin (ms)
  const interval = 90;    // slower tick
  const t0 = performance.now();
  let nextTick = t0;

  while (performance.now() - t0 < duration) {
    if (performance.now() >= nextTick) {
      d1.value = randFace();
      d2.value = randFace();
      nextTick += interval;
    }
    await new Promise(r => requestAnimationFrame(r));
  }

  // Final faces with a tiny “land” cadence so users can see them stop
  await new Promise(r => setTimeout(r, 120));
  d1.value = randFace();
  await new Promise(r => setTimeout(r, 160));
  d2.value = randFace();

  rolling.value = false;
  settled.value = true;

  emit('rolled', { d1: d1.value, d2: d2.value, sum: d1.value + d2.value });
}

function confirmUse() {
  emit('confirm', { d1: d1.value, d2: d2.value, sum: d1.value + d2.value });
}

onMounted(() => {
  // Auto-roll on entry; remove if you prefer manual
  roll();
});
</script>

<template>
  <div class="dice-wrap">
    <div class="tray" :class="{ rolling, settled }" aria-live="polite">
      <div class="die" :class="{ rolling }" :data-val="d1">
        <div class="pip" v-for="(on,i) in faceToPips(d1)" :key="i" :class="{ on }"/>
      </div>
      <div class="die" :class="{ rolling }" :data-val="d2">
        <div class="pip" v-for="(on,i) in faceToPips(d2)" :key="i" :class="{ on }"/>
      </div>
      <div class="sum-badge">
        {{ d1 + d2 }}
        <span class="label">step</span>
      </div>
    </div>

    <div class="actions">
      <button class="secondary" :disabled="rolling" @click="roll">Roll again</button>
      <button class="primary" :disabled="rolling" @click="confirmUse">Use {{ d1 + d2 }}</button>
    </div>
  </div>
</template>

<style scoped>
.dice-wrap { display:grid; gap:0.9rem; justify-items:center; }
.tray {
  display:flex; align-items:center; justify-content:center; gap:1rem;
  padding:1rem 1.25rem; border:1px solid var(--border); border-radius:14px;
  background: linear-gradient(180deg, color-mix(in oklab, var(--card) 90%, black 10%), var(--card));
  position:relative;
}
.tray.rolling { filter:saturate(1.1); }
.tray.settled { box-shadow: 0 10px 28px rgba(0,0,0,0.35); }

.die {
  width:64px; height:64px; border-radius:10px;
  background:#f9fafb; color:#111;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  grid-template-rows:repeat(3,1fr);
  place-items:center;
  gap:6px; padding:6px;
  border:2px solid #e5e7eb;
  box-shadow: inset 0 -3px 0 rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.25);
  transform-style: preserve-3d;
  transition: transform .25s ease, box-shadow .25s ease;
  line-height:0;
}

.die.rolling { animation: wobble .35s linear infinite; }
@keyframes wobble {
  0% { transform: rotateZ(0deg) translateY(0); }
  50% { transform: rotateZ(2deg) translateY(-2px); }
  100% { transform: rotateZ(0deg) translateY(0); }
}

.pip {
  width:12px; height:12px; border-radius:50%;
  background: transparent;
  opacity:.25;
  justify-self:center;
  align-self:center;
}

.pip.on {
  background:#111; opacity:1;
  box-shadow: 0 1px 0 rgba(0,0,0,.5), inset 0 -1px 0 rgba(255,255,255,.25);
}

.sum-badge {
  position:absolute; right:-8px; top:-10px;
  background: var(--primary); color: var(--primary-text);
  font-weight:800; font-size:1.2rem; border-radius:999px;
  padding:.4rem .7rem; border:2px solid rgba(255,255,255,.12);
  transform: scale(.95);
  transition: transform .25s ease;
}
.tray.settled .sum-badge { transform: scale(1); }
.sum-badge .label { font-weight:600; font-size:.7rem; margin-left:.3rem; opacity:.85; }

.actions { display:flex; gap:0.6rem; }
</style>
