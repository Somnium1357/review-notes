/* 오류 제보 사이드 패널 — 판을 보면서 쓴다(10-01 동하 「리포트는 사이드바로 빼야 보면서 쓸 수 있지 않으려나」)
   publish_dist.py가 과목 페이지마다 붙인다(판 원본은 안 고침). 지금 읽는 단원·절을 자동으로 골라 두고, 보내기 = 구글 폼(저장용)에 조용히 제출.
   넓은 화면 = 오른쪽에 떠 있는 패널(본문 폭을 안 바꾼다 — 10-01 동하 「열면 조판이 바뀌면서 스크롤이 돌아가 버림」) · 좁은 화면 = 아래 시트. */
(function(){
  var TOC=window.RN_TOC||{}, FORM='https://docs.google.com/forms/d/e/1FAIpQLSfz6jnwKa5X7m2UGdgl0CS1w878pH9G4IJCBow2QKHcaJN0Yg/formResponse', E_SUBJ='entry.1832714038', E_TEXT='entry.524873215';
  var h1=document.querySelector('main.wrap h1'); var SUBJ=(h1?h1.textContent:document.title).replace(/^.*?(\d+\.)?/, function(m){return '';});
  var file=decodeURIComponent(location.pathname.split('/').pop()||''); var m=file.match(/^\d+\.(.+)\.html$/); if(m) SUBJ=m[1];
  var G=TOC[SUBJ]; if(!G) return;
  var css=document.createElement('style'); css.textContent=
   '.rn-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:60;display:flex;align-items:center;gap:6px;height:44px;padding:0 16px;border:0;border-radius:22px;background:var(--card);color:var(--label);font:inherit;font-size:15px;font-weight:600;box-shadow:0 0 0 .5px var(--sep),0 8px 24px rgba(0,0,0,.16);cursor:pointer}'+
   '.rn-fab svg{width:18px;height:18px;color:var(--acc)}'+
   '.rn-pan{position:fixed;z-index:61;background:var(--bg);box-shadow:0 0 0 .5px var(--sep),0 12px 40px rgba(0,0,0,.22);display:flex;flex-direction:column;transition:transform .26s cubic-bezier(.2,.8,.2,1);font-size:17px;line-height:1.5;color:var(--label)}'+
   '@media (min-width:760px){.rn-pan{top:12px;right:12px;bottom:12px;width:340px;border-radius:22px;transform:translateX(calc(100% + 24px))} body.rn-open .rn-fab{display:none}}'+
   '@media (max-width:759px){.rn-pan{left:0;right:0;bottom:0;height:62vh;border-radius:22px 22px 0 0;transform:translateY(105%)} body.rn-open .rn-fab{display:none}}'+
   'body.rn-open .rn-pan{transform:none}'+
   '.rn-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 8px 20px}.rn-hd b{font-size:22px;font-weight:700}'+
   '.rn-x{width:32px;height:32px;border:0;border-radius:16px;background:var(--fill);color:var(--sec);font-size:17px;cursor:pointer}'+
   '.rn-bd{flex:1;overflow:auto;padding:4px 16px calc(16px + env(safe-area-inset-bottom))}'+
   '.rn-grp{background:var(--card);border-radius:18px;overflow:hidden}.rn-row{display:flex;align-items:center;gap:10px;min-height:46px;padding:0 12px 0 16px;position:relative}'+
   '.rn-row+.rn-row:before{content:"";position:absolute;top:0;left:16px;right:0;height:.5px;background:var(--sep)}.rn-row span{flex:0 0 40px;color:var(--sec);font-size:15px}'+
   '.rn-row select{flex:1;min-width:0;font:inherit;font-size:15px;color:var(--label);background:transparent;border:0;padding:10px 0;text-align:right;text-align-last:right;-webkit-appearance:none;appearance:none}'+
   '.rn-row .v{flex:1;text-align:right;font-size:15px}'+
   '.rn-ta{display:block;box-sizing:border-box;width:100%;min-height:130px;margin:12px 0 0;padding:12px 16px;border:0;border-radius:18px;background:var(--card);font:inherit;font-size:16px;line-height:1.5;color:var(--label);resize:vertical}'+
   '.rn-ta::placeholder{color:var(--ter)}.rn-send{display:block;width:100%;min-height:48px;margin-top:12px;border:0;border-radius:24px;background:var(--acc);color:#fff;font:inherit;font-size:17px;font-weight:600;cursor:pointer}.rn-send:disabled{opacity:.45}'+
   '.rn-ok{display:none;text-align:center;color:var(--sec);padding:10px 0}';
  document.head.appendChild(css);
  var fab=document.createElement('button'); fab.className='rn-fab'; fab.type='button';
  fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>제보';
  var pan=document.createElement('div'); pan.className='rn-pan'; pan.setAttribute('role','dialog'); pan.setAttribute('aria-label','오류 제보');
  pan.innerHTML='<div class="rn-hd"><b>오류 제보</b><button class="rn-x" type="button" aria-label="닫기">✕</button></div>'+
    '<div class="rn-bd"><div class="rn-grp"><div class="rn-row"><span>과목</span><div class="v"></div></div>'+
    '<div class="rn-row"><span>단원</span><select class="rn-g"><option value="">선택 안 함</option></select></div>'+
    '<div class="rn-row"><span>절</span><select class="rn-p"><option value="">선택 안 함</option></select></div></div>'+
    '<textarea class="rn-ta" placeholder="무엇이 틀렸는지 알려 주세요 (로그인 필요 없어요)"></textarea>'+
    '<button class="rn-send" type="button" disabled>보내기</button><div class="rn-ok">보냈어요 · 고마워요</div></div>';
  document.body.appendChild(fab); document.body.appendChild(pan);
  var q=function(s){return pan.querySelector(s)}, selG=q('.rn-g'), selP=q('.rn-p'), ta=q('.rn-ta'), send=q('.rn-send'), ok=q('.rn-ok');
  q('.v').textContent=SUBJ;
  G.forEach(function(g,i){ var o=document.createElement('option'); o.value=i; o.textContent=g[0]; selG.appendChild(o); });
  function fillP(){ selP.length=1; var g=G[selG.value]; if(g) g[2].forEach(function(k){ var o=document.createElement('option'); o.value=k[0]; o.textContent=k[0]; selP.appendChild(o); }); }
  selG.onchange=fillP;
  /* 지금 읽는 곳 = 목차가 가리키는 자리 중 화면 위쪽(100px)을 지난 마지막 것 */
  function here(){ var best=-1e9, gi=-1, kn=''; G.forEach(function(g,i){ [[g[1],'']].concat(g[2].map(function(k){return [k[1],k[0]]})).forEach(function(x){
      var el=x[0]&&document.getElementById(x[0]); if(!el||!el.getClientRects().length) return; var t=el.getBoundingClientRect().top;
      if(t<=100 && t>best){ best=t; gi=i; kn=x[1]; } }); });
    if(gi>=0){ selG.value=gi; fillP(); selP.value=kn; } }
  function check(){ send.disabled=!ta.value.trim(); }
  ta.oninput=check;
  function open(){ here(); document.body.classList.add('rn-open'); ok.style.display='none'; setTimeout(function(){ ta.focus(); }, 280); }
  function close(){ document.body.classList.remove('rn-open'); }
  fab.onclick=open; q('.rn-x').onclick=close;
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
  send.onclick=function(){ if(send.disabled) return; send.disabled=true; send.textContent='보내는 중…';
    var g=G[selG.value], where=[g&&g[0], selP.value].filter(Boolean).join(' > ');
    var body=new URLSearchParams(); body.append(E_SUBJ, SUBJ); body.append(E_TEXT, (where?'[위치] '+where+'\n':'')+'[내용] '+ta.value.trim());
    fetch(FORM,{method:'POST',mode:'no-cors',body:body}).then(function(){ ta.value=''; send.textContent='보내기'; check(); ok.style.display='block'; })
      .catch(function(){ send.disabled=false; send.textContent='다시 보내기'; alert('보내지 못했어요 — 인터넷 연결을 확인해 주세요'); }); };
})();
