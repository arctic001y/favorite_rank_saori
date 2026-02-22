(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();async function $(e){const t="/favorite_rank_saori/",n=new URL(e,window.location.origin+t).toString(),i=await fetch(n);if(!i.ok)throw new Error(`Failed to load ${n}: ${i.status}`);return i.json()}function k(e,t){const n=e.student.variants.find(i=>i.id===t);if(!n)throw new Error(`variant not found: ${t}`);return n}function h(e){const t="/favorite_rank_saori/";return new URL(e,window.location.origin+t).toString()}const q=new Set(["glittering-bouquet","miku-photo-card"]);function N(e,t,n){if(n==="gift-box")return"large";const i=O(t,n);return e.rarity===3&&i==="small"&&!q.has(n)?"medium":i}function O(e,t){const n=e.preferences??{};return n.xlarge?.includes(t)?"xlarge":n.large?.includes(t)?"large":n.medium?.includes(t)?"medium":"small"}function F(e,t){let n=1,i=e.length-1,r=1;for(;n<=i;){const o=n+i>>1;Number(e[o])<=t?(r=o,n=o+1):i=o-1}return r}function H(e,t){if(e.rarity===4||new Set(["glittering-bouquet","miku-photo-card"]).has(e.id))return 60;const i={small:20,medium:40,large:60,xlarge:80},r={medium:120,large:180,xlarge:240};return e.rarity===3?t==="small"?120:r[t]??0:i[t]??0}function U(e){const t=e.indexOf(":");if(t===-1)return e;const n=e.slice(0,t+1),i=e.slice(t+1).trim();return`${n} <strong>${i}</strong>`}function E({icon:e,items:t}){const n=document.getElementById("result");n&&(n.innerHTML=`
    <div class="resultRow">
      <img class="studentIcon" src="${e}" alt="" />
      <div class="resultList">
        ${t.map(i=>`<div>${U(i)}</div>`).join("")}
      </div>
    </div>
  `)}function C(e){return h(`gift-reaction/gift_reaction_${e}.png`)}function V(e){return{small:"小",medium:"中",large:"大",xlarge:"特大"}[e]??""}function X(e){document.querySelector("#app").innerHTML=`
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

        <button id="resetBtn" type="button">個数リセット</button>
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
  `;const t=document.getElementById("variantSelect");t.innerHTML=e.student.variants.map(i=>`<option value="${i.id}">${i.label}</option>`).join("");const n=e.student.variants.find(i=>i.id==="saori_normal")?.id??e.student.variants[0]?.id;n&&(t.value=n)}function z(e){return`<img src="${h(`gift-icons/${e.id}.png`)}" alt="" onerror="this.remove();" />`}(async()=>{const e=await $("data/exp_table.json"),t=await $("data/gifts.json"),n=await $("data/saori_variants.json"),i=new Map(t.map(a=>[a.id,a])),r={};X(n);const o=document.getElementById("variantSelect"),d=document.getElementById("currentRank"),x=document.getElementById("search"),_=document.getElementById("tierFilter"),S=document.getElementById("resetBtn"),M=document.getElementById("grid");function A(){return k(n,o.value)}function y(a){switch(a){case"saori_normal":return h("student-icons/saori_icon.png");case"saori_swimsuit":return h("student-icons/saori_swim_icon.png");case"saori_dress":return h("student-icons/saori_dress_icon.png");default:return h("student-icons/saori_icon.png")}}function p({commit:a=!1}={}){if(!Array.isArray(e)||e.length<2){E({icon:y(o.value),items:["exp_table.json が不正です"]});return}const u=e.length-1,g=d.value.trim();if(g===""){E({icon:y(o.value),items:["現在の絆ランクを入力してください"]});return}if(!/^\d+$/.test(g)){E({icon:y(o.value),items:["現在の絆ランクは数字で入力してください"]});return}let c=Math.floor(Number(g));if(Number.isFinite(c)||(c=1),a)c=Math.max(1,Math.min(u,c)),d.value=String(c);else if(c<1||c>u){E({icon:y(o.value),items:[`現在の絆ランクは 1〜${u} の範囲で入力してください`]});return}const s=A();let l=0;for(const[w,B]of Object.entries(r)){const R=Number(B)||0;if(R<=0)continue;const L=i.get(w);if(!L)continue;const P=N(L,s,w),j=H(L,P);l+=j*R}const f=Number(e[c])+l,v=Math.min(F(e,f),u);let T=0;if(v<u){const w=Number(e[v+1])-f;T=w<=0?0:w}E({icon:y(s.id),items:[`現在の絆ランク: ${c}`,`獲得経験値: ${l}`,`到達可能な絆ランク: ${v}`,`次のランクまでに必要な経験値: ${T}`]})}function b(){const a=A(),u=x.value.trim().toLowerCase(),g=_.value,c=[];for(const s of t){const l=N(s,a,s.id);if(g!=="all"&&l!==g||u&&!s.name.toLowerCase().includes(u)&&!s.id.includes(u))continue;const m=C(l),f=r[s.id]??0;s.rarity;const v=f===0?"":String(f);c.push(`
        <div class="card" data-gift-id="${s.id}">
          <div class="cardHeader">
            <div class="icon ${s.rarity===3?"r3":"r2"}">${z(s)}</div>
            <div>
              <div class="nameRow">
                <div class="name" title="${s.name}">${s.name}</div>
                <img src="${m}" alt="${V(l)}" class="reactionIcon" />
              </div>
              <div class="meta">★${s.rarity} / ${l}</div>
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
              value="${v}"
              style="width:72px; padding:4px 6px;"
            />
          </div>
        </div>
      `)}M.innerHTML=c.join(""),M.querySelectorAll(".card").forEach(s=>{const l=s.dataset.giftId,m=s.querySelector(".qty");m.addEventListener("input",()=>{const f=(m.value||"").replace(/[^\d]/g,"");if(m.value=f,f==="")delete r[l];else{const v=Math.max(0,Math.floor(Number(f)));v===0?delete r[l]:r[l]=v}p()}),m.addEventListener("focus",()=>{setTimeout(()=>{m.select()},0)})})}o.addEventListener("change",()=>{b(),p()}),d.addEventListener("input",()=>p({commit:!1})),d.addEventListener("change",()=>p({commit:!0})),d.addEventListener("blur",()=>p({commit:!0})),x.addEventListener("input",b),_.addEventListener("change",b);function I(){if(confirm("本当にリセットしますか？")){for(const a of Object.keys(r))delete r[a];b(),p()}}S.addEventListener("click",I),S.addEventListener("touchend",a=>{a.preventDefault(),I()},{passive:!1}),b(),p()})().catch(e=>{console.error(e);const t=document.querySelector("#app");t&&(t.textContent=`初期化エラー: ${e.message}`)});
