(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();async function x(e){const t="/favorite_rank_saori/",n=new URL(e,window.location.origin+t).toString(),i=await fetch(n);if(!i.ok)throw new Error(`Failed to load ${n}: ${i.status}`);return i.json()}function P(e,t){const n=e.student.variants.find(i=>i.id===t);if(!n)throw new Error(`variant not found: ${t}`);return n}function h(e){const t="/favorite_rank_saori/";return new URL(e,window.location.origin+t).toString()}const j=new Set(["glittering-bouquet","miku-photo-card"]);function T(e,t,n){if(n==="gift-box")return"large";const i=q(t,n);return e.rarity===3&&i==="small"&&!j.has(n)?"medium":i}function q(e,t){const n=e.preferences??{};return n.xlarge?.includes(t)?"xlarge":n.large?.includes(t)?"large":n.medium?.includes(t)?"medium":"small"}function O(e,t){let n=1,i=e.length-1,r=1;for(;n<=i;){const o=n+i>>1;Number(e[o])<=t?(r=o,n=o+1):i=o-1}return r}function F(e,t){if(e.rarity===4||new Set(["glittering-bouquet","miku-photo-card"]).has(e.id))return 60;const i={small:20,medium:40,large:60,xlarge:80},r={medium:120,large:180,xlarge:240};return e.rarity===3?t==="small"?120:r[t]??0:i[t]??0}function H(e){const t=e.indexOf(":");if(t===-1)return e;const n=e.slice(0,t+1),i=e.slice(t+1).trim();return`${n} <strong>${i}</strong>`}function E({icon:e,items:t}){const n=document.getElementById("result");n&&(n.innerHTML=`
    <div class="resultRow">
      <img class="studentIcon" src="${e}" alt="" />
      <div class="resultList">
        ${t.map(i=>`<div>${H(i)}</div>`).join("")}
      </div>
    </div>
  `)}function U(e){return h(`gift-reaction/gift_reaction_${e}.png`)}function C(e){return{small:"小",medium:"中",large:"大",xlarge:"特大"}[e]??""}function V(e){document.querySelector("#app").innerHTML=`
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
  `;const t=document.getElementById("variantSelect");t.innerHTML=e.student.variants.map(i=>`<option value="${i.id}">${i.label}</option>`).join("");const n=e.student.variants.find(i=>i.id==="saori_normal")?.id??e.student.variants[0]?.id;n&&(t.value=n)}function X(e){return`<img src="${h(`gift-icons/${e.id}.png`)}" alt="" onerror="this.remove();" />`}(async()=>{const e=await x("data/exp_table.json"),t=await x("data/gifts.json"),n=await x("data/saori_variants.json"),i=new Map(t.map(u=>[u.id,u])),r={};V(n);const o=document.getElementById("variantSelect"),d=document.getElementById("currentRank"),L=document.getElementById("search"),_=document.getElementById("tierFilter"),N=document.getElementById("resetBtn"),S=document.getElementById("grid");function M(){return P(n,o.value)}function y(u){switch(u){case"saori_normal":return h("student-icons/saori_icon.png");case"saori_swimsuit":return h("student-icons/saori_swim_icon.png");case"saori_dress":return h("student-icons/saori_dress_icon.png");default:return h("student-icons/saori_icon.png")}}function p({commit:u=!1}={}){if(!Array.isArray(e)||e.length<2){E({icon:y(o.value),items:["exp_table.json が不正です"]});return}const l=e.length-1,g=d.value.trim();if(g===""){E({icon:y(o.value),items:["現在の絆ランクを入力してください"]});return}if(!/^\d+$/.test(g)){E({icon:y(o.value),items:["現在の絆ランクは数字で入力してください"]});return}let a=Math.floor(Number(g));if(Number.isFinite(a)||(a=1),u)a=Math.max(1,Math.min(l,a)),d.value=String(a);else if(a<1||a>l){E({icon:y(o.value),items:[`現在の絆ランクは 1〜${l} の範囲で入力してください`]});return}const s=M();let c=0;for(const[w,R]of Object.entries(r)){const I=Number(R)||0;if(I<=0)continue;const $=i.get(w);if(!$)continue;const k=T($,s,w),B=F($,k);c+=B*I}const m=Number(e[a])+c,v=Math.min(O(e,m),l);let A=0;if(v<l){const w=Number(e[v+1])-m;A=w<=0?0:w}E({icon:y(s.id),items:[`現在の絆ランク: ${a}`,`獲得経験値: ${c}`,`到達可能な絆ランク: ${v}`,`次のランクまでに必要な経験値: ${A}`]})}function b(){const u=M(),l=L.value.trim().toLowerCase(),g=_.value,a=[];for(const s of t){const c=T(s,u,s.id);if(g!=="all"&&c!==g||l&&!s.name.toLowerCase().includes(l)&&!s.id.includes(l))continue;const f=U(c),m=r[s.id]??0;s.rarity;const v=m===0?"":String(m);a.push(`
        <div class="card" data-gift-id="${s.id}">
          <div class="cardHeader">
            <div class="icon ${s.rarity===3?"r3":"r2"}">${X(s)}</div>
            <div>
              <div class="nameRow">
                <div class="name" title="${s.name}">${s.name}</div>
                <img src="${f}" alt="${C(c)}" class="reactionIcon" />
              </div>
              <div class="meta">★${s.rarity} / ${c}</div>
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
      `)}S.innerHTML=a.join(""),S.querySelectorAll(".card").forEach(s=>{const c=s.dataset.giftId,f=s.querySelector(".qty");f.addEventListener("input",()=>{const m=(f.value||"").replace(/[^\d]/g,"");if(f.value=m,m==="")delete r[c];else{const v=Math.max(0,Math.floor(Number(m)));v===0?delete r[c]:r[c]=v}p()}),f.addEventListener("focus",()=>{setTimeout(()=>{f.select()},0)})})}o.addEventListener("change",()=>{b(),p()}),d.addEventListener("input",()=>p({commit:!1})),d.addEventListener("change",()=>p({commit:!0})),d.addEventListener("blur",()=>p({commit:!0})),L.addEventListener("input",b),_.addEventListener("change",b),N.addEventListener("click",()=>{if(window.confirm("入力した個数をすべて0に戻します。よろしいですか？")){for(const l of Object.keys(r))delete r[l];b(),p()}}),b(),p()})().catch(e=>{console.error(e);const t=document.querySelector("#app");t&&(t.textContent=`初期化エラー: ${e.message}`)});
