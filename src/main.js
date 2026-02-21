import "./style.css";

async function loadJson(relPath) {
  // relPath は "data/exp_table.json" みたいに先頭スラッシュ無しで渡す
  const base = import.meta.env.BASE_URL; // "/" or "/favorite_rank_saori/"
  const url = new URL(relPath, window.location.origin + base).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

function getVariant(saoriData, variantId) {
  const v = saoriData.student.variants.find(x => x.id === variantId);
  if (!v) throw new Error(`variant not found: ${variantId}`);
  return v;
}

function assetUrl(relPath) {
  const base = import.meta.env.BASE_URL;
  return new URL(relPath, window.location.origin + base).toString();
}

const SMALL_60_3STAR = new Set([
  "glittering-bouquet", // きらめきの花束
  "miku-photo-card"     // 初音ミクのカード
]);

function normalizedTier(gift, variant, giftId) {
  if (giftId === "gift-box") return "large"; // 効果大アイコン固定
  const base = effectTier(variant, giftId); // xlarge/large/medium/small

  // ★3でsmallになったものは基本mediumに格上げ（ただし例外はsmallのまま）
  if (gift.rarity === 3 && base === "small" && !SMALL_60_3STAR.has(giftId)) {
    return "medium";
  }
  return base;
}

// 効果4段階（未指定は small）
function effectTier(variant, giftId) {
  const p = variant.preferences ?? {};
  if (p.xlarge?.includes(giftId)) return "xlarge";
  if (p.large?.includes(giftId)) return "large";
  if (p.medium?.includes(giftId)) return "medium";
  return "small";
}

function needExp(expTotal, currentRank, targetRank) {
  if (targetRank <= currentRank) return 0;
  return Number(expTotal[targetRank]) - Number(expTotal[currentRank]);
}

function rankFromTotalExp(expTotal, totalExp) {
  let lo = 1, hi = expTotal.length - 1, ans = 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (Number(expTotal[mid]) <= totalExp) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}

function giftExpPer(gift, tier) {
  if (gift.rarity === 4) return 60; // gift_box は常に60
  // ★3でも常に60にしたい例外
  const ALWAYS_60 = new Set([
    "glittering-bouquet", // きらめきの花束
    "miku-photo-card"     // 初音ミクのカード
  ]);
  if (ALWAYS_60.has(gift.id)) return 60;

  // ★★
  const EXP_2 = { small: 20, medium: 40, large: 60, xlarge: 80 };

  // ★★★（smallは基本120に格上げ）
  const EXP_3 = { medium: 120, large: 180, xlarge: 240 };

  if (gift.rarity === 3) {
    if (tier === "small") return 120; // 例外以外は120
    return EXP_3[tier] ?? 0;
  }

  return EXP_2[tier] ?? 0;
}

function boldValue(line) {
  // "ラベル: 値" の値部分だけ <strong> にする
  const idx = line.indexOf(":");
  if (idx === -1) return line;
  const label = line.slice(0, idx + 1);
  const value = line.slice(idx + 1).trim();
  return `${label} <strong>${value}</strong>`;
}

function renderResultHTML({ icon, items }) {
  const el = document.getElementById("result");
  if (!el) return;

  el.innerHTML = `
    <div class="resultRow">
      <img class="studentIcon" src="${icon}" alt="" />
      <div class="resultList">
        ${items.map(s => `<div>${boldValue(s)}</div>`).join("")}
      </div>
    </div>
  `;
}

function reactionIconPath(tier) {
  return assetUrl(`gift-reaction/gift_reaction_${tier}.png`);
}

function reactionAlt(tier) {
  return ({
    small: "小",
    medium: "中",
    large: "大",
    xlarge: "特大"
  })[tier] ?? "";
}

// --- UI ---
function buildUI(saori) {
  document.querySelector("#app").innerHTML = `
    <div style="max-width: 1100px; margin: 0 auto; padding: 16px;">
      <header class="siteHeader">
        <h1 class="siteTitle">錠前サオリ 絆ランク計算機</h1>
      </header>

      <!-- 上段：検索・表示・リセットだけ -->
      <div class="toolbar">
        <input id="search" type="search" placeholder="贈り物を検索" />

        <label>表示:
          <select id="tierFilter">
            <option value="all">全部</option>
            <option value="xlarge">効果特大</option>
            <option value="large">効果大</option>
            <option value="medium">効果中</option>
            <option value="small">効果小</option>
          </select>
        </label>

        <button id="resetBtn">個数リセット</button>
      </div>

      <!-- 贈り物グリッド -->
      <div class="section">
        <div id="grid" class="grid"></div>
      </div>

      <!-- グリッド下：衣装・現在ランク -->
      <div class="section inputsUnderGrid">
        <label>生徒:
          <select id="variantSelect"></select>
        </label>

        <label>現在の絆ランク:
          <input id="currentRank" type="number" value="1" min="1" max="100" style="width:90px;" />
        </label>
      </div>

      <!-- 結果 -->
      <div class="section resultSection">
        <div id="result" class="result"></div>
      </div>
    </div>
  `;

  const variantSelect = document.getElementById("variantSelect");
  variantSelect.innerHTML = saori.student.variants
    .map(v => `<option value="${v.id}">${v.label}</option>`)
    .join("");

  // デフォルトで通常衣装を表示
  const defaultId =
    saori.student.variants.find(v => v.id === "saori_normal")?.id
    ?? saori.student.variants[0]?.id;

  if (defaultId) variantSelect.value = defaultId;
}

function makeIconHTML(gift) {
  const iconPath = assetUrl(`gift-icons/${gift.id}.png`);
  return `<img src="${iconPath}" alt="" onerror="this.remove();" />`;
}

(async () => {
  const expTotal = await loadJson("data/exp_table.json");
  const gifts = await loadJson("data/gifts.json");
  const saori = await loadJson("data/saori_variants.json");

  const giftById = new Map(gifts.map(g => [g.id, g]));
  const inventory = {}; // giftId -> count（UIが編集する）

  buildUI(saori);

  const variantSelect = document.getElementById("variantSelect");
  const currentRankEl = document.getElementById("currentRank");
  //const targetRankEl = document.getElementById("targetRank");
  const searchEl = document.getElementById("search");
  const tierFilterEl = document.getElementById("tierFilter");
  const resetBtn = document.getElementById("resetBtn");
  const gridEl = document.getElementById("grid");

  function currentVariant() {
    return getVariant(saori, variantSelect.value);
  }

  // 生徒アイコン選択ロジック
  function studentIconPath(variantId) {
    switch (variantId) {
      case "saori_normal": return assetUrl("student-icons/saori_icon.png");
      case "saori_swimsuit": return assetUrl("student-icons/saori_swim_icon.png");
      case "saori_dress": return assetUrl("student-icons/saori_dress_icon.png");
      default: return assetUrl("student-icons/saori_icon.png");
    }
  }

  function calcAndRender({ commit = false } = {}) {
    if (!Array.isArray(expTotal) || expTotal.length < 2) {
      renderResultHTML({ icon: studentIconPath(variantSelect.value), items: ["exp_table.json が不正です"] });
      return;
    }

    const MAX_RANK = expTotal.length - 1;

    const raw = currentRankEl.value.trim();

    // 入力中に空になるのはOK（この時点では計算しない）
    if (raw === "") {
      renderResultHTML({
        icon: studentIconPath(variantSelect.value),
        items: ["現在の絆ランクを入力してください"]
      });
      return;
    }

    // 数字以外は一旦待つ（入力途中扱い）
    if (!/^\d+$/.test(raw)) {
      renderResultHTML({
        icon: studentIconPath(variantSelect.value),
        items: ["現在の絆ランクは数字で入力してください"]
      });
      return;
    }

    let currentRank = Math.floor(Number(raw));
    if (!Number.isFinite(currentRank)) currentRank = 1;

    // commit=true（確定タイミング）だけ入力欄を補正する
    if (commit) {
      currentRank = Math.max(1, Math.min(MAX_RANK, currentRank));
      currentRankEl.value = String(currentRank);
    } else {
      // 入力中は補正しないが、範囲外なら計算は止めてメッセージ
      if (currentRank < 1 || currentRank > MAX_RANK) {
        renderResultHTML({
          icon: studentIconPath(variantSelect.value),
          items: [`現在の絆ランクは 1〜${MAX_RANK} の範囲で入力してください`]
        });
        return;
      }
    }

    const variant = currentVariant();

    // 獲得EXP
    let gainExp = 0;
    for (const [giftId, count] of Object.entries(inventory)) {
      const c = Number(count) || 0;
      if (c <= 0) continue;

      const gift = giftById.get(giftId);
      if (!gift) continue;

      const tier = normalizedTier(gift, variant, giftId);
      const per = giftExpPer(gift, tier);
      gainExp += per * c;
    }

    const currentTotal = Number(expTotal[currentRank]);
    const afterTotal = currentTotal + gainExp;

    const reachedRank = Math.min(rankFromTotalExp(expTotal, afterTotal), MAX_RANK);

    let toNext = 0;
    if (reachedRank < MAX_RANK) {
      const rawNext = Number(expTotal[reachedRank + 1]) - afterTotal;
      toNext = rawNext <= 0 ? 0 : rawNext;
    }

    renderResultHTML({
      icon: studentIconPath(variant.id),
      items: [
        `現在の絆ランク: ${currentRank}`,
        `獲得経験値: ${gainExp}`,
        `到達可能な絆ランク: ${reachedRank}`,
        `次のランクまでに必要な経験値: ${toNext}`
      ]
    });
  }

  function renderGrid() {
    const variant = currentVariant();
    const q = searchEl.value.trim().toLowerCase();
    const tierFilter = tierFilterEl.value; // all/xlarge/large/medium/small

    const cards = [];
    for (const gift of gifts) {
      const tier = normalizedTier(gift, variant, gift.id);
      if (tierFilter !== "all" && tier !== tierFilter) continue;
      if (q && !gift.name.toLowerCase().includes(q) && !gift.id.includes(q)) continue;

      const icon = reactionIconPath(tier);
      const count = inventory[gift.id] ?? 0;
      const rarityClass = gift.rarity === 3 ? "r3" : "r2"; // ★4もr2扱い
      const valueAttr = count === 0 ? "" : String(count);

      cards.push(`
        <div class="card" data-gift-id="${gift.id}">
          <div class="cardHeader">
            <div class="icon ${gift.rarity === 3 ? "r3" : "r2"}">${makeIconHTML(gift)}</div>
            <div>
              <div class="nameRow">
                <div class="name" title="${gift.name}">${gift.name}</div>
                <img src="${icon}" alt="${reactionAlt(tier)}" class="reactionIcon" />
              </div>
              <div class="meta">★${gift.rarity} / ${tier}</div>
            </div>
          </div>
          <div class="stepper">
            <label style="font-size:12px; opacity:.85;">個数</label>
            <input
              class="qty"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value="${valueAttr}"
              style="width:72px; padding:4px 6px;"
            />
          </div>
        </div>
      `);
    }

    gridEl.innerHTML = cards.join("");

    // 個数入力イベント
    gridEl.querySelectorAll(".card").forEach(card => {
      const giftId = card.dataset.giftId;
      const input = card.querySelector(".qty");

      input.addEventListener("input", () => {
        // 数字以外は除去
        const digits = (input.value || "").replace(/[^\d]/g, "");
        input.value = digits; // 表示を正規化

        if (digits === "") {
          delete inventory[giftId];     // 空なら0扱い
        } else {
          const n = Math.max(0, Math.floor(Number(digits)));
          if (n === 0) delete inventory[giftId];
          else inventory[giftId] = n;
        }

        calcAndRender();
      });

      // フォーカス時に全選択（スマホ対策でsetTimeout）
      input.addEventListener("focus", () => {
        setTimeout(() => {
          input.select();
        }, 0);
      });
    });
  }

  // UIイベント
  variantSelect.addEventListener("change", () => {
    renderGrid();     // 効果段階が変わるのでカードの数値も更新
    calcAndRender();  // 同じ個数でも獲得EXPが変わる
  });
  currentRankEl.addEventListener("input", () => calcAndRender({ commit: false }));
  currentRankEl.addEventListener("change", () => calcAndRender({ commit: true }));
  currentRankEl.addEventListener("blur", () => calcAndRender({ commit: true }));
  //targetRankEl.addEventListener("input", calcAndRender);
  searchEl.addEventListener("input", renderGrid);
  tierFilterEl.addEventListener("change", renderGrid);
  resetBtn.addEventListener("click", () => {
    const ok = window.confirm("入力した個数をすべて0に戻します。よろしいですか？");
    if (!ok) return;

    for (const k of Object.keys(inventory)) delete inventory[k];
    renderGrid();
    calcAndRender();
  });

  // 初期描画
  renderGrid();
  calcAndRender();
})().catch(err => {
  console.error(err);
  const app = document.querySelector("#app");
  if (app) app.textContent = `初期化エラー: ${err.message}`;
});