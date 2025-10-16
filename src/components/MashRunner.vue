<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Category, Option, MashRunResult } from '@/types';
import { mashSequence, cloneCategories, type MashEvent } from '@/composables/mashEngine';

const props = defineProps<{
  categories: Category[];
  step: number;
}>();
const emit = defineEmits<{
  (e: 'finished', payload: MashRunResult): void;
  (e: 'cancel'): void;
}>();

const speed = ref(50);          // 0..100, where 100 = fastest
const minDelay = 10;            // ms at fastest end
const maxDelay = 400;           // ms at slowest end
const delayMs = computed(() =>
  Math.round(maxDelay - (speed.value / 100) * (maxDelay - minDelay))
);

const elimPauseMs = ref(420);  // pause after elimination

// Local working copy to animate on
const cats = ref(cloneCategories(props.categories));
const active = ref<{ catIdx: number; optIdx: number } | null>(null);
const eliminationOrder: Array<{ categoryId: string; option: Option }> = [];

async function run() {
  // reset visuals
  cats.value = cloneCategories(props.categories);
  active.value = null;

  const seq = mashSequence(props.categories, props.step);
  for (const ev of seq) {
    if (ev.type === 'cursor') {
      active.value = { catIdx: ev.catIdx, optIdx: ev.optIdx };
      await wait(delayMs.value);
    } else if (ev.type === 'eliminate') {
      // mark eliminated in our local copy with a tiny delay for strike animation
      const o = cats.value[ev.catIdx].options[ev.optIdx];
      o.eliminated = true;
      active.value = { catIdx: ev.catIdx, optIdx: ev.optIdx };
      const categoryId = props.categories[ev.catIdx].id;
      eliminationOrder.push({ categoryId, option: { ...o, eliminated: true } });
      await wait(elimPauseMs.value);
    } else if (ev.type === 'lock') {
	  const winner = cats.value[ev.catIdx].options.find(o => !o.eliminated);
      if (winner) (winner as any).locked = true;
      // subtle pause when a category locks
      await wait(220);
    } else if (ev.type === 'done') {
      emit('finished', {
        winners: ev.winners,
        eliminationOrder: eliminationOrder.slice(),
      });
    }
  }
}

function wait(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms));
}

onMounted(() => run());
</script>

<template>
  <div class="runner grid-gap container">
    <div class="topbar">
      <div class="sliders">
        <label>Speed
			<input type="range" min="0" max="100" step="1" v-model.number="speed" />
        </label>
        <label>Elimination pause
          <input type="range" min="200" max="900" step="20" v-model.number="elimPauseMs" />
        </label>
      </div>
      <div class="actions">
        <button class="secondary" @click="$emit('cancel')">← Back</button>
      </div>
    </div>

    <div class="board">
      <div v-for="(cat, ci) in cats" :key="cat.id" class="column card">
        <div class="col-title">
          {{ cat.name }}
          <span v-if="cat.options.filter(o => !o.eliminated).length === 1" class="locked">locked</span>
        </div>

        <ul class="options">
          <li
            v-for="(opt, oi) in cat.options"
            :key="opt.id"
            class="opt"
            :class="{
              active: active && active.catIdx===ci && active.optIdx===oi && !opt.eliminated,
              eliminated: opt.eliminated,
			  selected: opt.locked
            }"
          >
            <span class="bullet">•</span>
            <span class="label">{{ opt.label }}</span>
            <span class="strike" aria-hidden="true"></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;
}
.sliders { display:flex; gap:1rem; align-items:center; }
.sliders label { display:flex; gap:0.5rem; align-items:center; color:var(--muted); }
.board {
  display:grid; gap:0.8rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.column { padding:0.75rem; }
.col-title { font-weight:600; color:var(--text); margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center; }
.locked {
  background: color-mix(in oklab, var(--primary) 30%, black 70%);
  color: var(--primary-text);
  font-size:0.75rem; padding:0.15rem 0.4rem; border-radius:6px; border:1px solid var(--border);
}

.options { list-style:none; padding:0; margin:0; display:grid; gap:0.35rem; }
.opt {
  position:relative; display:flex; gap:0.5rem; align-items:center;
  padding:0.4rem 0.5rem; border:1px solid var(--border); border-radius:8px;
  background: var(--secondary);
  transition: transform 0.12s ease, filter 0.15s ease, background 0.2s ease;
  overflow:hidden;
}
.opt .bullet { color: var(--muted); }
.opt.active {
  transform: translateY(-1px);
  outline: 2px solid color-mix(in oklab, var(--primary) 80%, white 0%);
  outline-offset: 2px;
}
.opt.eliminated { filter: grayscale(0.6) opacity(0.5); }
.opt .strike {
  position:absolute; left:0.5rem; right:0.5rem; height:2px; top:50%;
  background: var(--danger); transform: scaleX(0); transform-origin:left;
  transition: transform 0.25s ease;
}
.opt.eliminated .strike { transform: scaleX(1); }

.opt.selected {
  border-color: #2ecc71;
  box-shadow: 0 0 6px 1px rgba(46, 204, 113, 0.4);
  background-color: color-mix(in oklab, var(--card) 85%, #2ecc71 15%);
  animation: winnerPulse 0.9s ease-out 1;
}

@keyframes winnerPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.6);
  }
  40% {
    transform: scale(1.05);
    box-shadow: 0 0 12px 3px rgba(46, 204, 113, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 6px 1px rgba(46, 204, 113, 0.4);
  }
}
</style>