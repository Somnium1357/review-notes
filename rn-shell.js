/* 브라우저용 틀 = 위키처럼(10-01 동하 「PWA가 아니라 브라우저라 왼쪽 사이드바가 안 맞음」 → 「헤더가 항상 있는 건 별로 · 위키라고 생각하면」
   → 「피커는 둘 다 별로 · 맨 위 경로는 빼든가」).
   넓은 화면(≥1400) = 머리 막대 없음 · 왼쪽 목차 늘 펼침(맨 위 「‹ 전체 과목」 + 과목 이름 · 맨 아래 피드백·테마) · 지금 읽는 절 강조.
   좁은 화면 = 맨 위에만 막대(‹전체 과목 · 과목 · ☰ · 피드백 · 테마), 스크롤하면 같이 올라감 · 중간에서 위로 올리면 잠깐 내려온다(제목 = 과목 · 동하 「절 이름 말고」).
   오른쪽 아래 = 맨 위로(한 화면 넘게 내려가면 나타남).
   그 밖에(브라우저 환경): 주소 끝이 읽는 절을 따라감(replaceState — 기록은 안 늘림) · 제목에 조용한 # 링크 복사(마우스 올릴 때만) ·
   접은 절도 Ctrl+F로 찾으면 펼쳐짐(hidden=until-found — 크롬·파이어폭스).
   판 원본·kit.js는 그대로 — kit이 만든 .sidebar/.tocbtn을 이 사본에서만 다시 배치한다. rn-theme.js·report-panel.js 다음에 붙는다. */
(function(){
  var sb=document.querySelector('.sidebar'), tb=document.querySelector('.tocbtn'), main=document.querySelector('main.wrap'); if(!sb||!tb||!main) return;
  var h1=main.querySelector('h1'), SUBJ=h1?h1.textContent.trim().replace(/^\d+\./,''):document.title;
  var PEN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  var BACK='<svg viewBox="0 0 10 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 1.5 1.5 8.5l7 7"/></svg>';
  var css=document.createElement('style'); css.textContent=
   ':root{--rn-bar:52px}'+
   '.rn-bar{position:absolute;top:0;left:0;right:0;z-index:30;height:var(--rn-bar);display:flex;align-items:center;gap:4px;padding:0 8px 0 12px;box-shadow:0 .5px 0 var(--sep);background:var(--bg)}'+
   '.rn-bar.peek{position:fixed;background:var(--glass,var(--bg));-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);animation:rnDown .2s ease}'+
   '@keyframes rnDown{from{transform:translateY(-100%)}to{transform:none}}'+
   '.rn-bar a.rn-home{display:flex;align-items:center;gap:2px;color:var(--acc);text-decoration:none;font-size:16px;padding:8px 6px;white-space:nowrap}'+
   '.rn-bar a.rn-home svg{width:10px;height:17px}'+
   '.rn-bar .rn-t{flex:1;min-width:0;text-align:center;font-weight:600;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--label)}'+
   '.rn-bar button,.rn-sf button{width:40px;height:40px;border:0;border-radius:20px;background:transparent;color:var(--label);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex:0 0 auto}'+
   '.rn-bar button:hover,.rn-sf button:hover{background:var(--fill)}.rn-bar button svg,.rn-sf button svg{width:21px;height:21px}'+
   '.rn-fb svg{color:var(--acc)}'+
   '.rn-sf{position:sticky;bottom:0;margin:16px -20px 0;padding:8px 12px calc(12px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:4px;background:var(--bg);box-shadow:0 -.5px 0 var(--sep)}'+
   '.rn-sf .rn-fb{width:auto;padding:0 12px;gap:6px;font:inherit;font-size:15px;font-weight:600;margin-right:auto}.rn-sf .rn-fb svg{width:18px;height:18px}'+
   '.rn-sh{font-size:24px;line-height:30px;font-weight:700;color:var(--label);margin:0 0 10px}'+
   '.rn-back{display:flex;align-items:center;gap:4px;align-self:flex-start;margin:0 0 6px -4px;padding:6px 10px 6px 6px;border-radius:10px;color:var(--acc);text-decoration:none;font-size:15px;font-weight:500}'+
   '.rn-back:hover{background:var(--fill)}.rn-back svg{width:9px;height:15px}'+
   /* 떠 있던 것들은 막대·목차로 들어간다 */
   '.tocbtn,.rn-tg,.rn-fab{display:none!important}'+
   '.sidebar{left:0;bottom:0;border-radius:0;box-shadow:0 0 0 .5px var(--sep);background:var(--bg);width:280px;padding:20px 20px 32px;display:flex;flex-direction:column}'+
   '.sidebar>.toc-view,.sidebar>.list-view{flex:1 0 auto}.sidebar .tochead{display:none}'+
   '.tnav a.rn-on,.tgrp>summary .gh.rn-on{color:var(--acc)!important;font-weight:600}'+
   /* 제목 옆 # — 마우스를 올렸을 때만 보인다(터치 기기엔 없음) */
   '.rn-a{display:none}@media (hover:hover){.rn-a{display:inline;margin-left:.35em;color:var(--ter);text-decoration:none;font-weight:400;opacity:0;transition:opacity .12s}'+
     '.rn-ah:hover .rn-a{opacity:.55}.rn-a:hover{opacity:1!important;color:var(--acc)}}'+
   '.rn-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:70;padding:8px 14px;border-radius:18px;background:var(--label);color:var(--bg);font-size:14px;opacity:0;transition:opacity .2s;pointer-events:none}.rn-toast.on{opacity:.92}'+
   /* 접은 절 = 찾기로는 걸리게(보이지는 않음) */
   'main.wrap .clpsd[hidden=until-found]{display:block!important;height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden}'+
   '@media (min-width:1400px){.rn-bar{display:none}main.wrap{padding-top:40px!important}'+
     '.sidebar{top:0!important;transform:none!important;transition:none;padding-bottom:0}.scrim{display:none!important}'+
     'main.wrap{margin-left:max(280px,calc((100% - 1160px)/2))!important;width:min(calc(100% - 280px),1160px)!important;transition:none}}'+
   '@media (min-width:1000px) and (max-width:1399px){body.tocopen main.wrap{margin-left:auto!important;width:min(100%,1160px)!important}body.tocopen .scrim{display:block}}'+
   '@media (max-width:1399px){body.tocopen .rn-top{display:none}main.wrap{padding-top:calc(var(--rn-bar) + 28px)!important}.rn-sf,.rn-back{display:none}.sidebar{width:min(320px,86vw);max-width:none}}'+
   '.rn-top{position:fixed;right:calc(16px + env(safe-area-inset-right));bottom:calc(16px + env(safe-area-inset-bottom));z-index:29;width:44px;height:44px;border:0;border-radius:22px;padding:0;cursor:pointer;'+
     'display:flex;align-items:center;justify-content:center;color:var(--label);background:var(--glass,var(--card));-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);'+
     'box-shadow:0 0 0 .5px var(--sep),0 4px 14px rgba(0,0,0,.10);opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .2s,transform .2s}'+
   '.rn-top.on{opacity:1;transform:none;pointer-events:auto}.rn-top svg{width:20px;height:20px}'+
   'body.rn-open .rn-bar,body.rn-open .rn-top{display:none}'+
   '@media print{.rn-bar,.rn-a,.rn-top{display:none!important}main.wrap{padding-top:0!important;margin-left:auto!important}}';
  document.head.appendChild(css);
  var bar=document.createElement('div'); bar.className='rn-bar';
  bar.innerHTML='<a class="rn-home" href="index.html">'+BACK+'전체 과목</a><div class="rn-t"></div>'+
    '<button class="rn-menu" type="button" aria-label="이 과목 목차"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>'+
    '<button class="rn-fb" type="button" aria-label="피드백">'+PEN+'</button><button class="rn-th" type="button"></button>';
  var title=bar.querySelector('.rn-t'); title.textContent=SUBJ;
  document.body.insertBefore(bar, document.body.firstChild);
  /* 목차 맨 위 = 「‹ 전체 과목」 + 과목 이름 · 맨 아래 = 피드백 · 테마 */
  var back=document.createElement('a'); back.className='rn-back'; back.href='index.html'; back.innerHTML=BACK+'전체 과목';
  var sh=document.createElement('div'); sh.className='rn-sh'; sh.textContent=SUBJ;
  sb.insertBefore(sh, sb.firstChild); sb.insertBefore(back, sh);
  var sf=document.createElement('div'); sf.className='rn-sf';
  sf.innerHTML='<button class="rn-fb" type="button">'+PEN+'<span>피드백</span></button><button class="rn-th" type="button"></button>';
  sb.appendChild(sf);
  var fab=document.querySelector('.rn-fab'), tg=document.querySelector('.rn-tg');
  var fbs=[].slice.call(document.querySelectorAll('.rn-bar .rn-fb,.rn-sf .rn-fb')), ths=[].slice.call(document.querySelectorAll('.rn-bar .rn-th,.rn-sf .rn-th'));
  fbs.forEach(function(b){ if(fab) b.onclick=function(){ fab.click(); }; else b.remove(); });
  function syncTh(){ ths.forEach(function(b){ b.innerHTML=tg.innerHTML; b.setAttribute('aria-label',tg.getAttribute('aria-label')||'테마'); }); }
  if(tg){ ths.forEach(function(b){ b.onclick=function(){ tg.click(); syncTh(); }; }); syncTh(); new MutationObserver(syncTh).observe(tg,{childList:true}); } else ths.forEach(function(b){ b.remove(); });
  bar.querySelector('.rn-menu').onclick=function(){ tb.click(); };
  /* 목차 늘 펼침은 1400 이상만 — 아이패드 가로·노트북(1000~1399)은 본문 전폭 + ☰ 서랍(10-01 동하 「너무 좁아졌음」 · 위키도 좁으면 목차를 버튼으로) */
  function wide(){ return innerWidth>=1400; }
  sb.addEventListener('click', function(ev){ if(ev.target.closest('a[href^="#"]')&&!wide()&&innerWidth>=1000&&sb.classList.contains('open')) tb.click(); });   // kit은 1000 이상을 넓은 화면으로 보고 안 닫는다
  /* 목차를 손으로 굴리는 중엔 따라 굴리지 않는다(10-01 동하 「스크롤 올라가는 동안 사이드바 스크롤이 잠김」) */
  var sbHover=false, sbTouch=0;
  sb.addEventListener('mouseenter', function(){ sbHover=true; }); sb.addEventListener('mouseleave', function(){ sbHover=false; });
  ['wheel','touchstart','scroll'].forEach(function(e){ sb.addEventListener(e, function(){ if(!sb._rnAuto) sbTouch=Date.now(); }, {passive:true}); });
  /* 좁은 화면 서랍의 위 끝 = 막대가 보이는 만큼 아래 */
  function place(){ if(wide()){ sb.style.top=''; return; } var bh=bar.offsetHeight||52;
    sb.style.top=(bar.classList.contains('peek')?bh:Math.max(0,bh-scrollY))+'px'; }
  var wasWide=null;
  function fix(){ var w=wide();
    if(w&&!sb.classList.contains('open')){ sb.classList.add('open'); document.body.classList.add('tocopen'); dispatchEvent(new Event('resize')); }
    else if(!w&&wasWide!==false&&sb.classList.contains('open')) tb.click();   // 처음 열 때·넓다가 좁아질 때는 서랍을 닫아 둔다
    wasWide=w; place(); }
  fix(); addEventListener('resize', fix);
  /* 맨 위로 — 한 화면 넘게 내려가면 오른쪽 아래에 */
  var top=document.createElement('button'); top.type='button'; top.className='rn-top'; top.setAttribute('aria-label','맨 위로');
  top.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>';
  top.onclick=function(){ scrollTo({top:0,behavior:'smooth'}); }; document.body.appendChild(top);
  var lastY=scrollY; addEventListener('scroll', function(){ var y=scrollY, bh=bar.offsetHeight||52; top.classList.toggle('on', y>innerHeight);
    if(wide()||y<=bh) bar.classList.remove('peek');
    else if(!sb.classList.contains('open')){ if(y<lastY-8) bar.classList.add('peek'); else if(y>lastY+4) bar.classList.remove('peek'); }
    lastY=y; place(); spy(); }, {passive:true});
  /* 지금 읽는 절: 목차 강조 · 폰 막대 제목 · 주소 끝(기록은 안 늘림 — 목차를 눌러 간 것만 기록에 남아 「뒤로」가 그 전 자리로) */
  var links=[].slice.call(sb.querySelectorAll('a[href^="#"]')).map(function(a){ return [a, document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)))]; }).filter(function(x){ return x[1]; });
  var on=null, hashT=0;
  function spy(){ var best=null, bt=-1e9, lim=innerHeight*.3; links.forEach(function(x){ if(!x[1].getClientRects().length) return; var t=x[1].getBoundingClientRect().top; if(t<=lim&&t>bt){ bt=t; best=x; } });
    var a=best&&best[0];
    clearTimeout(hashT); hashT=setTimeout(function(){ var h=a&&scrollY>200?a.getAttribute('href'):''; if(location.hash!==h&&decodeURIComponent(location.hash)!==decodeURIComponent(h))
      history.replaceState(history.state,'',h||(location.pathname+location.search)); }, 250);
    if(a===on) return; if(on) on.classList.remove('rn-on'); on=a; if(on){ on.classList.add('rn-on');
      if(wide()&&!sbHover&&Date.now()-sbTouch>1500){ var r=on.getBoundingClientRect(), s=sb.getBoundingClientRect();
        if(r.top<s.top+40||r.bottom>s.bottom-80){ sb._rnAuto=true; sb.scrollTop+=r.top-s.top-s.height/3; setTimeout(function(){ sb._rnAuto=false; },50); } } } }
  spy();
  /* 제목 옆 # = 그 절 주소 복사 */
  var toast=document.createElement('div'); toast.className='rn-toast'; document.body.appendChild(toast); var toT=0;
  function say(t){ toast.textContent=t; toast.classList.add('on'); clearTimeout(toT); toT=setTimeout(function(){ toast.classList.remove('on'); },1400); }
  links.forEach(function(x){ var id=x[1].id, el=x[1];   // 판의 표지는 제목 앞 빈 <a id> · 과목 묶음 <div id> — 붙일 자리는 그 제목
    if(el.tagName==='A') el=el.parentElement; else if(!/^H\d$/.test(el.tagName)) el=el.querySelector('h2,h3');
    if(!el||el.querySelector('.rn-a')) return;
    var a=document.createElement('a'); a.className='rn-a'; a.href='#'+id; a.textContent='#'; a.setAttribute('aria-label','이 절 링크 복사');
    a.onclick=function(ev){ ev.preventDefault(); ev.stopPropagation(); var u=location.origin+location.pathname+'#'+encodeURIComponent(id);
      (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){ say('링크를 복사했어요'); }, function(){ history.replaceState(history.state,'','#'+id); say('주소창에 링크를 넣었어요'); }); };
    el.classList.add('rn-ah'); el.appendChild(a); });
  /* 접은 절도 찾기(Ctrl+F)에 걸리게 — 찾으면 kit의 접기 머리를 눌러 펼친다 */
  function mark(e){ if(e.classList.contains('clpsd')){ if(!e.hasAttribute('hidden')) e.setAttribute('hidden','until-found'); } else if(e.getAttribute('hidden')==='until-found') e.removeAttribute('hidden'); }
  if('onbeforematch' in document.body){
    new MutationObserver(function(ms){ ms.forEach(function(m){ mark(m.target); }); }).observe(main,{subtree:true,attributes:true,attributeFilter:['class']});
    [].forEach.call(main.querySelectorAll('.clpsd'), mark);
    main.addEventListener('beforematch', function(ev){ var el=ev.target;
      for(var n=0; n<4 && el.classList.contains('clpsd'); n++){ var hs=[].slice.call(main.querySelectorAll('.tg.closed')).filter(function(h){ return h.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING; });
        if(!hs.length) break; hs[hs.length-1].click(); } });
  }
})();
