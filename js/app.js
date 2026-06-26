// All achievable weights as an ordered array
// Each entry: { w: weight_lb, n5: 5lb_plates_per_side, micro: bool (2.5lb plates per side) }
function buildWeightList() {
  // Confirmed physical model:
  //   Handle (beam + fixed plates) = 10 lb
  //   Two locking screws, 2.5 lb each = 5 lb
  //   Each pair of 5 lb plates → +10 lb
  //   The pair of 2.5 lb micro plates → +5 lb
  //
  //   10 lb = bare handle, screws REMOVED (no plates can be held without screws)
  //   15 lb = handle + screws, no plates  → minimum loaded weight
  //   W = 10 + 5(screws) + n5*10 + (micro ? 5 : 0) = 15 + n5*10 + (micro ? 5 : 0)
  // Sequence: 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80
  // 80 = 10 + 5 + 6*10 + 5  (matches the confirmed full-load breakdown exactly)
  const list = [];
  // Bare handle, screws off — the genuine floor
  list.push({ w: 10, n5: 0, micro: false, screwsOff: true });
  // Everything else has the screws installed (always +5 lb)
  for (let n5 = 0; n5 <= 6; n5++) {
    for (let micro = 0; micro <= 1; micro++) {
      const w = 15 + n5 * 10 + (micro ? 5 : 0);
      if (w <= 80) list.push({ w, n5, micro: !!micro, screwsOff: false });
    }
  }
  list.sort((a, b) => a.w - b.w);
  return list;
}

const WEIGHT_LIST = buildWeightList();
// WEIGHT_LIST: 10,15,20,25,30,35,40,45,50,55,60,65,70,75,80

function buildBreakdown(cfg) {
  const { n5, micro, screwsOff } = cfg;
  const plateLb = n5 * 2 * 5;
  const microLb = micro ? 5 : 0;

  let html = '';

  // Handle — always 10 lb
  html += `<div class="breakdown-row">
    <span class="lbl"><span class="dot dot-handle"></span> Handle + fixed plates</span>
    <span class="val">10 lb <span class="sub">base</span></span>
  </div>`;

  // Locking screws
  if (screwsOff) {
    html += `<div class="breakdown-row">
      <span class="lbl" style="color:var(--muted);"><span class="dot dot-screw" style="width:10px;height:10px;opacity:.3;"></span> Locking screws</span>
      <span class="val" style="color:var(--muted);">removed</span>
    </div>`;
  } else {
    html += `<div class="breakdown-row">
      <span class="lbl"><span class="dot dot-screw" style="width:10px;height:10px;"></span> Locking screws</span>
      <span class="val">2 × 2.5 = <span class="sub">5 lb</span></span>
    </div>`;
  }

  // 5 lb plates
  if (n5 > 0) {
    html += `<div class="breakdown-row">
      <span class="lbl"><span class="dot dot-5lb"></span> 5 lb plates</span>
      <span class="val">${n5*2} plates <span class="sub">× 5 = ${plateLb} lb</span></span>
    </div>`;
  } else {
    html += `<div class="breakdown-row">
      <span class="lbl" style="color:var(--muted);"><span class="dot dot-5lb" style="opacity:.3"></span> 5 lb plates</span>
      <span class="val" style="color:var(--muted);">none</span>
    </div>`;
  }
  // Subrow always shown with consistent text so the layout never flickers.
  html += `<div class="breakdown-row subrow">
    <span class="lbl" style="color:var(--muted);">↳ ${n5} per side</span>
    <span></span>
  </div>`;

  // 2.5 lb micro plates
  if (micro) {
    html += `<div class="breakdown-row">
      <span class="lbl"><span class="dot dot-2_5lb"></span> 2.5 lb plates</span>
      <span class="val">2 plates <span class="sub">× 2.5 = ${microLb} lb</span></span>
    </div>
    <div class="breakdown-row subrow">
      <span class="lbl" style="color:var(--muted);">↳ 1 per side, outermost</span>
      <span></span>
    </div>`;
  } else {
    html += `<div class="breakdown-row">
      <span class="lbl" style="color:var(--muted);"><span class="dot dot-2_5lb" style="opacity:.3"></span> 2.5 lb plates</span>
      <span class="val" style="color:var(--muted);">not used</span>
    </div>
    <div class="breakdown-row subrow">
      <span class="lbl" style="color:var(--muted);">↳ 1 per side, outermost</span>
      <span></span>
    </div>`;
  }

  return html;
}

function buildViz(cfg) {
  const { n5, micro, screwsOff } = cfg;
  const MAX5 = 6;
  let html = '<div class="db-row">';

  // Left side (mirror): screw → 2.5 micro → 5-lb plates → fixed inner
  if (screwsOff) {
    html += `<div class="db-screw-slot"></div>`;
  } else {
    // cap on the outer left, shank pointing right (inward)
    html += `<div class="db-screw"><span class="db-screw-cap"></span><span class="db-screw-shank"></span></div>`;
  }

  // 2.5 micro (outermost after screw)
  if (micro) {
    html += `<div class="db-plate-2_5"></div>`;
  } else {
    html += `<div class="db-ghost-2_5"></div>`;
  }

  // ghost 5-lb slots left
  for (let i = n5; i < MAX5; i++) html += `<div class="db-ghost-5"></div>`;
  // loaded 5-lb plates left
  for (let i = 0; i < n5; i++) html += `<div class="db-plate-5"></div>`;

  // Center
  html += `<div class="db-fixed"></div><div class="db-handle"></div><div class="db-fixed"></div>`;

  // Right side
  for (let i = 0; i < n5; i++) html += `<div class="db-plate-5"></div>`;
  for (let i = n5; i < MAX5; i++) html += `<div class="db-ghost-5"></div>`;

  if (micro) {
    html += `<div class="db-plate-2_5"></div>`;
  } else {
    html += `<div class="db-ghost-2_5"></div>`;
  }
  if (screwsOff) {
    html += `<div class="db-screw-slot"></div>`;
  } else {
    // shank pointing left (inward), cap on the outer right
    html += `<div class="db-screw"><span class="db-screw-shank"></span><span class="db-screw-cap"></span></div>`;
  }

  html += '</div>';
  return html;
}

// Scale the .db-row inside a viz container down to fit if it overflows
function fitViz(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const row = container.querySelector('.db-row');
  if (!row) return;
  row.style.transform = 'scale(1)'; // reset before measuring
  const avail = container.clientWidth;
  const needed = row.scrollWidth;
  if (needed > avail && avail > 0) {
    const scale = avail / needed;
    row.style.transform = `scale(${scale})`;
  }
}

// Slider — index into WEIGHT_LIST
function updateSlider() {
  const idx = parseInt(document.getElementById('weightSlider').value);
  const cfg = WEIGHT_LIST[idx];
  document.getElementById('heroWeight').textContent = cfg.w;
  document.getElementById('sliderViz').innerHTML = buildViz(cfg);
  document.getElementById('sliderBreakdown').innerHTML = buildBreakdown(cfg);
  fitViz('sliderViz');
}

// Re-fit dumbbell when the window resizes (orientation change, etc.)
window.addEventListener('resize', () => fitViz('sliderViz'));

// Touch-drag anywhere: press and slide to change the weight. Whichever axis you
// move along more wins, so a vertical drag or a horizontal swipe both work —
// up or right = heavier, down or left = lighter. Drives the same slider the
// range input does, so the two stay in sync.
//
// Uses pointer events rather than touch events on purpose: every weight step
// rebuilds the viz/breakdown via innerHTML, and touch events stay bound to the
// element the finger first landed on — so a re-render mid-drag would detach
// that node and kill the gesture. pointermove targets whatever is under the
// finger now (always live) and bubbles to document, so DOM churn is harmless.
function enableTouchDrag() {
  const slider = document.getElementById('weightSlider');
  const PX_PER_STEP = 22; // travel needed to move one weight step
  let startX = 0;
  let startY = null;
  let startIdx = 0;
  let activeId = null;

  function setIdx(idx) {
    const clamped = Math.max(0, Math.min(WEIGHT_LIST.length - 1, idx));
    if (clamped === parseInt(slider.value)) return;
    slider.value = clamped;
    updateSlider();
  }

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return; // touch only
    if (e.target === slider) return;       // let the range input handle itself
    startX = e.clientX;
    startY = e.clientY;
    startIdx = parseInt(slider.value);
    activeId = e.pointerId;
  });

  document.addEventListener('pointermove', (e) => {
    if (startY === null || e.pointerId !== activeId) return;
    const dx = e.clientX - startX; // right is positive
    const dy = startY - e.clientY; // up is positive
    // Follow whichever axis has moved further from where the drag began.
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    setIdx(startIdx + Math.round(delta / PX_PER_STEP));
  });

  const endDrag = (e) => {
    if (e.pointerId !== activeId) return;
    startY = null;
    activeId = null;
  };
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
}

// Wire up the slider and run the initial render once the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('weightSlider');
  slider.max = WEIGHT_LIST.length - 1;
  slider.addEventListener('input', updateSlider);
  enableTouchDrag();
  updateSlider();
  // fit once more after layout settles (fonts, etc.)
  window.requestAnimationFrame(() => fitViz('sliderViz'));
  setTimeout(() => fitViz('sliderViz'), 300);
});
