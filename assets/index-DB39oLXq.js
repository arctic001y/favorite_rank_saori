(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const u of r.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&i(u)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();async function S(e){const t="/favorite_rank_saori/",n=new URL(e,window.location.origin+t).toString(),i=await fetch(n);if(!i.ok)throw new Error(`Failed to load ${n}: ${i.status}`);return i.json()}function z(e,t){const n=e.student.variants.find(i=>i.id===t);if(!n)throw new Error(`variant not found: ${t}`);return n}function h(e){const t="/favorite_rank_saori/";return new URL(e,window.location.origin+t).toString()}const G=new Set(["glittering-bouquet","miku-photo-card"]);function P(e,t,n){if(n==="gift-box")return"large";const i=K(t,n);return e.rarity===3&&i==="small"&&!G.has(n)?"medium":i}function K(e,t){const n=e.preferences??{};return n.xlarge?.includes(t)?"xlarge":n.large?.includes(t)?"large":n.medium?.includes(t)?"medium":"small"}function W(e,t){let n=1,i=e.length-1,o=1;for(;n<=i;){const r=n+i>>1;Number(e[r])<=t?(o=r,n=r+1):i=r-1}return o}function J(e,t){if(e.rarity===4||new Set(["glittering-bouquet","miku-photo-card"]).has(e.id))return 60;const i={small:20,medium:40,large:60,xlarge:80},o={medium:120,large:180,xlarge:240};return e.rarity===3?t==="small"?120:o[t]??0:i[t]??0}function D(e){const t=e.indexOf(":");if(t===-1)return e;const n=e.slice(0,t+1),i=e.slice(t+1).trim();return`${n} <strong>${i}</strong>`}function x({icon:e,items:t}){const n=document.getElementById("result");n&&(n.innerHTML=`
    <div class="resultRow">
      <img class="studentIcon" src="${e}" alt="" />
      <div class="resultList">
        ${t.map(i=>`<div>${D(i)}</div>`).join("")}
      </div>
    </div>
  `)}function Q(e){return h(`gift-reaction/gift_reaction_${e}.png`)}function Z(e){return{small:"小",medium:"中",large:"大",xlarge:"特大"}[e]??""}function ee(e){document.querySelector("#app").innerHTML=`
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
        <div class="inputsRow">
          <label>生徒:
            <select id="variantSelect"></select>
          </label>

          <label>現在の絆ランク:
            <input id="currentRank" type="number" value="1" min="1" max="100" style="width:90px;" />
          </label>
        </div>

        <div class="inputsRow" style="margin-top:8px;">
          <label>ふれあい回数:
            <input id="touchCount" type="number" value="0" min="0" step="1" style="width:90px;" />
          </label>

          <label>スケジュール訪問回数:
            <input id="scheduleCount" type="number" value="0" min="0" step="1" style="width:90px;" />
          </label>

          <label>スケジュール訪問回数（ボーナス）:
            <input id="scheduleBonusCount" type="number" value="0" min="0" step="1" style="width:90px;" />
          </label>
        </div>
      </div>

      <!-- 結果 -->
      <div class="section resultSection">
        <div id="result" class="result"></div>
      </div>
    </div>

    <!-- 確認モーダル（#app直下に置く） -->
    <div id="confirmOverlay" class="overlay" hidden>
      <div class="modal">
        <div class="modalTitle">確認</div>
        <div class="modalText">本当にリセットしますか？</div>
        <div class="modalBtns">
          <button id="confirmNo" type="button">キャンセル</button>
          <button id="confirmYes" type="button">リセット</button>
        </div>
      </div>
    </div>
  `;const t=document.getElementById("variantSelect");t.innerHTML=e.student.variants.map(i=>`<option value="${i.id}">${i.label}</option>`).join("");const n=e.student.variants.find(i=>i.id==="saori_normal")?.id??e.student.variants[0]?.id;n&&(t.value=n)}function te(e){return`<img src="${h(`gift-icons/${e.id}.png`)}" alt="" onerror="this.remove();" />`}(async()=>{const e=await S("data/exp_table.json"),t=await S("data/gifts.json"),n=await S("data/saori_variants.json"),i=new Map(t.map(c=>[c.id,c])),o={};ee(n);const r=document.getElementById("variantSelect"),u=document.getElementById("currentRank"),L=document.getElementById("touchCount"),$=document.getElementById("scheduleCount"),_=document.getElementById("scheduleBonusCount"),N=document.getElementById("search"),C=document.getElementById("tierFilter"),j=document.getElementById("resetBtn"),T=document.getElementById("grid");function A(){return z(n,r.value)}function y(c){switch(c){case"saori_normal":return h("student-icons/saori_icon.png");case"saori_swimsuit":return h("student-icons/saori_swim_icon.png");case"saori_dress":return h("student-icons/saori_dress_icon.png");default:return h("student-icons/saori_icon.png")}}function d({commit:c=!1}={}){if(!Array.isArray(e)||e.length<2){x({icon:y(r.value),items:["exp_table.json が不正です"]});return}const m=e.length-1,p=u.value.trim();if(p===""){x({icon:y(r.value),items:["現在の絆ランクを入力してください"]});return}if(!/^\d+$/.test(p)){x({icon:y(r.value),items:["現在の絆ランクは数字で入力してください"]});return}let l=Math.floor(Number(p));if(Number.isFinite(l)||(l=1),c)l=Math.max(1,Math.min(m,l)),u.value=String(l);else if(l<1||l>m){x({icon:y(r.value),items:[`現在の絆ランクは 1〜${m} の範囲で入力してください`]});return}const s=A();let a=0;for(const[E,Y]of Object.entries(o)){const O=Number(Y)||0;if(O<=0)continue;const I=i.get(E);if(!I)continue;const V=P(I,s,E),X=J(I,V);a+=X*O}const f=Math.max(0,Math.floor(Number(L.value)||0)),v=Math.max(0,Math.floor(Number($.value)||0)),g=Math.max(0,Math.floor(Number(_.value)||0)),U=f*15+v*25+g*50;a+=U;const R=Number(e[l])+a,M=Math.min(W(e,R),m);let k=0;if(M<m){const E=Number(e[M+1])-R;k=E<=0?0:E}x({icon:y(s.id),items:[`現在の絆ランク: ${l}`,`獲得経験値: ${a}`,`到達可能な絆ランク: ${M}`,`次のランクまでに必要な経験値: ${k}`]})}function b(){const c=A(),m=N.value.trim().toLowerCase(),p=C.value,l=[];for(const s of t){const a=P(s,c,s.id);if(p!=="all"&&a!==p||m&&!s.name.toLowerCase().includes(m)&&!s.id.includes(m))continue;const f=Q(a),v=o[s.id]??0;s.rarity;const g=v===0?"":String(v);l.push(`
        <div class="card" data-gift-id="${s.id}">
          <div class="cardHeader">
            <div class="icon ${s.rarity===3?"r3":"r2"}">${te(s)}</div>
            <div>
              <div class="nameRow">
                <div class="name" title="${s.name}">${s.name}</div>
                <img src="${f}" alt="${Z(a)}" class="reactionIcon" />
              </div>
              <div class="meta">★${s.rarity} / ${a}</div>
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
              value="${g}"
              style="width:72px; padding:4px 6px;"
            />
          </div>
        </div>
      `)}T.innerHTML=l.join(""),T.querySelectorAll(".card").forEach(s=>{const a=s.dataset.giftId,f=s.querySelector(".qty");f.addEventListener("input",()=>{const v=(f.value||"").replace(/[^\d]/g,"");if(f.value=v,v==="")delete o[a];else{const g=Math.max(0,Math.floor(Number(v)));g===0?delete o[a]:o[a]=g}d()}),f.addEventListener("focus",()=>{setTimeout(()=>{f.select()},0)})})}r.addEventListener("change",()=>{b(),d()}),u.addEventListener("input",()=>d({commit:!1})),u.addEventListener("change",()=>d({commit:!0})),u.addEventListener("blur",()=>d({commit:!0})),N.addEventListener("input",b),C.addEventListener("change",b),L.addEventListener("input",d),$.addEventListener("input",d),_.addEventListener("input",d);const w=document.getElementById("confirmOverlay"),q=document.getElementById("confirmNo"),F=document.getElementById("confirmYes");function H(){w.hidden=!1}function B(){w.hidden=!0}j.addEventListener("click",H),q.addEventListener("click",B),w.addEventListener("click",c=>{c.target===w&&B()}),F.addEventListener("click",()=>{for(const c of Object.keys(o))delete o[c];L.value="0",$.value="0",_.value="0",b(),d(),B()}),b(),d()})().catch(e=>{console.error(e);const t=document.querySelector("#app");t&&(t.textContent=`初期化エラー: ${e.message}`)});
