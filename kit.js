
 
(function(){
  document.querySelectorAll('main.wrap .hname').forEach(function(d){
    var h=d.previousElementSibling;
    if(h && /^H[1-6]$/.test(h.tagName)){ var s=document.createElement('span'); s.className='hname'; s.textContent=' – '+d.textContent.trim(); h.appendChild(s); }
    d.remove();
  });
})();

(function(){
  var main=document.querySelector('main.wrap'); if(!main) return;
  var pgs=[].slice.call(main.querySelectorAll(':scope > section.pg')); if(!pgs.length) return;
  var foot=main.querySelector(':scope > .foot');
  var card=null, inRun=false, afterHead=false;
  pgs.forEach(function(pg){
    var nodes=[].slice.call(pg.childNodes);
    while(pg.firstChild) pg.removeChild(pg.firstChild);
    pg.parentNode.removeChild(pg);
    var host=null, used=false;
    nodes.forEach(function(n){
      if(n.nodeType===3 && !n.textContent.trim()) return;
       
      var RL=window.PAN_ROLE, r2=(RL && n.nodeType===1 && n.tagName==='H2') ? RL[n.id] : '';
       
      var headRow = r2==='머리줄' && window.PAN_HOIST!==false;
      var head=n.nodeType===1 && ((n.tagName==='H2' && !(r2==='칸' || r2==='글칸' || r2==='안' || headRow)) || n.classList.contains('part'));
      if(head){
        if(!used){ main.insertBefore(pg, foot); used=true; }    
        main.insertBefore(n, foot); card=null; host=null; inRun=false; return;
      }
       
      var isCellH2 = n.nodeType===1 && n.tagName==='H2' && (r2==='칸' || r2==='글칸');
       
      if(isCellH2 && !inRun && !(afterHead && window.PAN_HOIST!==false)){ card=null; host=null; }
      var isHeadRole=n.nodeType===1 && /^H[234]$/.test(n.tagName) && RL && (RL[n.id]==='절' || RL[n.id]==='머리줄');
      if(isCellH2) inRun=true; else if(isHeadRole && n.tagName!=='H2') inRun=false;
      if(n.nodeType===1) afterHead=isHeadRole;
      if(!card){ card=document.createElement('div'); card.className='sect'; main.insertBefore(card, foot); host=null; }
      if(!host){ if(used){ host=pg.cloneNode(false); host.removeAttribute('id'); } else { host=pg; used=true; } card.appendChild(host); }
      host.appendChild(n);
    });
    if(!used) main.insertBefore(pg, foot);
  });
})();

(function(){
  if(!document.documentElement.classList.contains('v2')) return;

  var STD=/\[\d+[가-힣]+\s?\d{2}-\d{2}\]/;
   
  function wrapGrps(cell, body){
     
    var sig=function(e){ if(!e || e.nodeType!==1) return ''; var s=e.className; if(e.children.length===1 && e.firstElementChild.classList.contains('stack')) s+='>stack'; return s; };
    [].slice.call(body.children).forEach(function(e){
      var p=e.previousElementSibling;
      if(!p || !/^(ind2|stack)(>stack)?$/.test(sig(e)) || sig(p)!==sig(e)) return;
      var from=/>stack$/.test(sig(e)) ? e.firstElementChild : e, to=/>stack$/.test(sig(p)) ? p.firstElementChild : p;
      while(from.firstChild) to.appendChild(from.firstChild);
      e.remove();
    });
     
    var ins=body.querySelectorAll(':scope > .r-in');
    if(ins.length>=2){
       
      var box=document.createElement('div'); box.className='grps'; body.insertBefore(box, ins[0]);
      var cur=null;
      [].slice.call(body.childNodes).forEach(function(n){
        if(!cur && n!==ins[0]) return;
        if(n===box) return;
        if(n.nodeType!==1){ if(cur) cur.appendChild(n); return; }
        if(n.classList.contains('r-in')){ cur=document.createElement('div'); cur.className='grp k ingrp'; box.appendChild(cur); }
        cur.appendChild(n);
      });
      cell.classList.add('cansplit');
      return;
    }
     
    var st=null;
    [':scope > .ind2 > .stack', ':scope > .stack', ':scope > .ind2', ':scope > .ind > .stack', ':scope > .ind'].some(function(q){
      var x=body.querySelector(q); if(x && x.children.length>=2){ st=x; return true; } return false; });
    if(!st) return;
    var g=null, k=0, n0=0;
    [].slice.call(st.children).forEach(function(n){
      if(n.classList.contains('ind') && g){ if(!g.classList.contains('k')){ g.classList.add('k'); k++; } g.appendChild(n); return; }
      g=document.createElement('div'); g.className='grp'; st.insertBefore(g,n); g.appendChild(n); n0++;
    });
    st.classList.add('grps');
    if(k>=2) cell.classList.add('cansplit');
     
    (function nest(parent, d){
      if(d>2) return;
      parent.querySelectorAll(':scope > .grp.k').forEach(function(gp){
        var inner=gp.querySelector(':scope > .ind > .stack') || gp.querySelector(':scope > .ind'); if(!inner || inner.children.length<2) return;
        var g2=null, has=false;
        [].slice.call(inner.children).forEach(function(x){
          if(x.classList.contains('ind') && g2){ g2.classList.add('k'); has=true; g2.appendChild(x); return; }
          g2=document.createElement('div'); g2.className='grp'; inner.insertBefore(g2,x); g2.appendChild(x);
        });
        inner.classList.add('grps2'); gp._inner=inner;
        nest(inner, d+1);
      });
    })(st, 1);
  }
   
  var ROLE=window.PAN_ROLE;
   
  document.querySelectorAll('main.wrap .line').forEach(function(line){
    var cols=[].slice.call(line.children);
    var arrow=cols.some(function(c){ var m=c.querySelector('.mid.mk'); return m && /[→⇒⟶]/.test(m.textContent); });
    var ann=[].some.call(line.querySelectorAll('.up,.down'), function(x){ return x.textContent.trim(); });
    if(!arrow || !ann) return;
    var v=document.createElement('div'); v.className='vchain conv'; var first=true;
    cols.forEach(function(c){
      var mid=c.querySelector('.mid'); if(!mid || mid.classList.contains('mk')) return;
      if(!first){ var a=document.createElement('div'); a.className='arw'; a.textContent='↓'; a.setAttribute('aria-hidden','true'); v.appendChild(a); }
      first=false;
      var s=document.createElement('div'); s.className='stp'; s.appendChild(mid); v.appendChild(s);
      var an=[].filter.call(c.querySelectorAll('.up,.down'), function(x){ return x.textContent.trim(); });
      if(an.length){ var d=document.createElement('div'); d.className='ann'; an.forEach(function(x){ d.appendChild(x); }); v.appendChild(d); }
    });
    line.parentNode.insertBefore(v, line); line.style.display='none';    
  });
   
  (function(){
    var main=document.querySelector('main.wrap'); if(!main) return;
    var wrapRange=function(n, a, b, cls){ var mid=n.splitText(a); mid.splitText(b-a); var sp=document.createElement('span'); sp.className=cls; mid.parentNode.insertBefore(sp, mid); sp.appendChild(mid); return sp; };
    main.querySelectorAll('div, li').forEach(function(el){
      if(el.children.length>6) return;
      var t=el.textContent.trim();
      if(t.charAt(0)==='※' && !el.querySelector('div, li')) el.classList.add('memo');
       
      else if(!el.querySelector('div, li') && (/^(\[[^\]]+\]\s*)?(\uB3D9\uD558 (\uC190\uAE00\uC528|마킹)|여백 라벨|구조 메모|학습 지침)/.test(t) || /^「[^」]+」\s*(절|구역)은 \uB3D9\uD558/.test(t) || /^.{0,22}(\uB3D9\uD558 메모|\uC190\uAE00\uC528 「)/.test(t))) el.classList.add('memo');
    });
    var tw=document.createTreeWalker(main, NodeFilter.SHOW_TEXT), list=[], x;
    while((x=tw.nextNode())) list.push(x);
    list.forEach(function(n){
      if(!n.parentNode || (n.parentElement && n.parentElement.closest('.memo, h1, script, style, svg'))) return;    
      var s=n.textContent, m, inH=n.parentElement && n.parentElement.closest('h2, h3, h4');    
       
      if((m=/\((?:\uAD6C\uBA4D\s*\d\d-\d\d|(?:[^()]*[^가-힣()])?\uB3D9\uD558(?![가-힣])[^()]*)\)/.exec(s))){ wrapRange(n, m.index, m.index+m[0].length, 'memo'); return; }
       
      if((m=/\(\uC190\uAE00\uC528 라벨\)|\s*—\s*\uC190\uAE00\uC528 라벨|\uC190\uAE00\uC528 라벨\s*—\s*/.exec(s))){ wrapRange(n, m.index, m.index+m[0].length, 'memo'); return; }
       
      if((m=/\s*\(※[^()]*(?:암기|지정)[^()]*\)/.exec(s))){ wrapRange(n, m.index, m.index+m[0].length, 'memo'); return; }
      if(inH) return;
      var i=s.indexOf('※'); if(i>0){ wrapRange(n, i, s.length, 'memo'); return; }
      m=/[^\s→,;()·]+(?:\s[^\s→,;()·]+)?\s*→\s*[^\s→,;()·]+(?:\s*→\s*[^\s→,;()·]+){1,2}/.exec(s);
      if(m && (m[0].match(/→/g)||[]).length<=3) wrapRange(n, m.index, m.index+m[0].length, 'nw');
    });
     
    document.querySelectorAll('nav a, .list-view a, .tochead a').forEach(function(a){ var s=a.textContent, r=s.replace(/\s*\(※[^()]*(?:암기|지정)[^()]*\)/, ''); if(r!==s && a.children.length===0) a.textContent=r; });
    main.querySelectorAll('table').forEach(function(t){ var f=t.querySelector('tr > *'); if(f && !f.textContent.trim()) t.classList.add('rh'); });    
     
    main.querySelectorAll('.quiet').forEach(function(q){ var s=q.textContent.trim(); if(s.length<=12 && /^\(.*\)$/.test(s)) q.classList.add('nw'); });
     
    main.querySelectorAll('.line, .vchain.hz, ol.steps.hz, .chain').forEach(function(c){
      var steps=c.classList.contains('line') ? [].filter.call(c.children, function(k){ var m=k.querySelector('.mid'); return m && !m.classList.contains('mk'); }).length
              : c.classList.contains('chain') ? c.querySelectorAll(':scope > .arrow').length+1
              : c.querySelectorAll(':scope > .stp, :scope > li').length;
      if(steps && steps<=3) c.classList.add('nw');
    });
  })();
  document.querySelectorAll('main.wrap .vchain:not(.conv)').forEach(function(v){
    if(![].some.call(v.querySelectorAll('.ann'), function(x){ return x.textContent.trim(); })) v.classList.add('hz');
  });
   
  if(window.PAN_CTREE!==false){    
    var isTree=function(x){ return x.classList && (x.classList.contains('bracket') || x.classList.contains('kids')); };
    var kidsOf=function(b){ return [].find.call(b.children, isTree); };
    document.querySelectorAll('main.wrap .bracket, main.wrap .kids').forEach(function(tr){
      if(tr.parentElement.closest('.bracket, .kids')) return;
      if(!tr.querySelector('.branch .branch')) return;    
      tr.classList.add('ctree');
      tr.querySelectorAll('.branch').forEach(function(b){
        var k=kidsOf(b); if(!k || !k.children.length) return;
         
        var leaves=[].every.call(k.children, function(c){ return !c.querySelector('.branch, .bracket, .kids, .mk, .sub') && c.querySelectorAll('.term, .desc').length<=1 && c.textContent.trim().length<=24; });
        if(leaves && k.children.length<=4 && k.textContent.replace(/\s+/g,' ').trim().length<=70) b.classList.add('cline');    
      });
      [].forEach.call(tr.children, function(c){ if(c.classList.contains('branch')) c.classList.add('ccell'); });
    });
  }
   
  document.querySelectorAll('main.wrap .converge > svg, main.wrap .branch > svg').forEach(function(sv){
    if(sv.getAttribute('viewBox')!=='0 0 11 70') return;
    sv.setAttribute('preserveAspectRatio','none'); sv.classList.add('brace');
    sv.querySelectorAll('path').forEach(function(pt){ pt.setAttribute('vector-effect','non-scaling-stroke'); });
    var st=sv.previousElementSibling; if(st && st.classList.contains('stack')) [].forEach.call(st.children, function(k){ if(k.textContent.trim().length<=14) k.classList.add('nw'); });    
    var w=document.createElement('span'); w.className='bracew'; sv.parentNode.insertBefore(w, sv); w.appendChild(sv);    
  });
   
  document.querySelectorAll('main.wrap .cols').forEach(function(cl){
    var bare=[].filter.call(cl.querySelectorAll(':scope > .stack > .row'), function(r){
      if([].some.call(r.childNodes, function(n){ return n.nodeType===3 ? n.textContent.trim() : !(n.classList.contains('num') || n.classList.contains('term')); })) return false;
      var nx=r.nextElementSibling; return !(nx && (nx.classList.contains('ind') || nx.classList.contains('bracket') || nx.classList.contains('kids')));
    });
    if(bare.length<2 || bare.length===cl.querySelectorAll(':scope > .stack > .row').length) return;    
    var g=document.createElement('div'); g.className='gath'; cl.parentNode.insertBefore(g, cl.nextSibling);
    bare.forEach(function(r){ g.appendChild(r); });
  });
   
  document.querySelectorAll('main.wrap .kids > div, main.wrap .kids > .branch > div:first-child, main.wrap .bracket > div').forEach(function(r){
    var m=r.firstElementChild; if(!m || !m.classList.contains('mk') || !/^[XOxo○×]$/.test(m.textContent.trim())) return;
    var pre=m.previousSibling; if(pre && pre.nodeType===3 && pre.textContent.trim()) return;
    var b=document.createElement('span'); b.className='decb';
    while(m.nextSibling) b.appendChild(m.nextSibling);
    r.appendChild(b); r.classList.add('dec');
    var hide=function(t){ var s=document.createElement('span'); s.className='mk'; s.style.display='none'; t.parentNode.insertBefore(s,t); s.appendChild(t); };
    var f=b.firstChild; if(f && f.nodeType===3 && /^\s*:\s*$/.test(f.textContent)) hide(f);
    var tm=b.querySelector(':scope > .term');
    if(tm){ var c=tm.nextSibling; if(c && c.nodeType===3 && /^\s*:\s*$/.test(c.textContent)){ hide(c); var d=tm.nextElementSibling; while(d && d.classList.contains('mk')) d=d.nextElementSibling; if(d && d.classList.contains('desc')) d.classList.add('decd'); } }
    else b.classList.add('decq');
    var root=r.closest('.kids'); root=root && root.parentElement; while(root && root.parentElement && root.parentElement.closest('.kids')) root=root.parentElement.closest('.kids').parentElement;
    var q=root && root.classList.contains('branch') ? root.firstElementChild : null;    
    if(q && /\?\s*$/.test(q.textContent)) q.classList.add('decq');
  });
  document.querySelectorAll('main.wrap ol.steps').forEach(function(o){
    if(![].some.call(o.querySelectorAll('.an'), function(x){ return x.textContent.trim(); })) o.classList.add('hz');
  });
  if(ROLE){
    var RC={'대단':'r-dae','절':'r-jeol','머리줄':'r-head','칸':'r-cell','글칸':'r-cell','안':'r-in','숨김':'r-hide','글':'r-line','끝':'r-end'};            
     
    if(window.PAN_HOIST!==false) document.querySelectorAll('main.wrap h2[id], main.wrap h3[id], main.wrap h4[id]').forEach(function(h){
      var r=ROLE[h.id]; if(!r || r==='안' || r==='글') return;
      var pg=h.closest('.pg'); if(!pg) return;
      while(h.parentElement && h.parentElement!==pg){
        var P=h.parentElement, after=P.cloneNode(false); after.removeAttribute('id');
        while(h.nextSibling) after.appendChild(h.nextSibling);
        P.parentNode.insertBefore(h, P.nextSibling);
        if(after.textContent.trim() || after.querySelector('img,svg,table')) h.parentNode.insertBefore(after, h.nextSibling);
        if(!P.textContent.trim() && !P.querySelector('img,svg,table')) P.remove();
      }
    });
    document.querySelectorAll('main.wrap h2[id], main.wrap h3[id], main.wrap h4[id]').forEach(function(h){ var r=ROLE[h.id]; if(RC[r]) h.classList.add(RC[r]); });
    if(window.PAN_HOIST!==false) document.documentElement.classList.add('dae-big');
     
    if(window.PAN_HOIST!==false) document.querySelectorAll('main.wrap .mk').forEach(function(m){ if(/^\s*(↔|⇔|\+|≠)\s*$/.test(m.textContent)) m.classList.add('rel'); });    
    var mk=function(cls, pg, before){ var d=document.createElement('div'); d.className=cls; pg.insertBefore(d, before); return d; };
    document.querySelectorAll('main.wrap .sect').forEach(function(sect){
      var cur=null, body=null;
      sect.querySelectorAll(':scope > .pg').forEach(function(pg){
        [].slice.call(pg.childNodes).forEach(function(n){
          if(n.nodeType===3 && !n.textContent.trim()){ pg.removeChild(n); return; }
          if(n.nodeType===8 && !cur && window.PAN_HOIST!==false) return;    
          var r=(n.nodeType===1 && /^H[234]$/.test(n.tagName)) ? (ROLE[n.id]||'') : '';
          if(r==='대단' || r==='절' || r==='머리줄' || r==='끝'){ cur=mk('blk full hrow'+(r==='끝'?' endb':''), pg, n); cur.appendChild(n); body=cur; return; }
           
          if(r==='칸' || r==='글칸'){ cur=mk('blk cell ttl'+(r==='글칸'?' full prosecell':''), pg, n); cur.appendChild(n); body=document.createElement('div'); body.className='blb'; cur.appendChild(body); return; }
          if(!cur){ cur=mk('blk nolab', pg, n); body=cur; }
          body.appendChild(n);
        });
      });
       
      var heads=[].map.call(sect.querySelectorAll('.blk.cell'), function(c){ return c.firstElementChild; });
      var cnt={}; heads.forEach(function(h){ var t=h.textContent.trim(), i=t.indexOf(' - '); if(i>0){ var p=t.slice(0,i+3); cnt[p]=(cnt[p]||0)+1; h._pfx=p; } });
      heads.forEach(function(h){
        if(!h._pfx || cnt[h._pfx]<2) return;
        var w=document.createTreeWalker(h, NodeFilter.SHOW_TEXT), n;
        while((n=w.nextNode())){ if(!n.textContent.trim() || (n.parentElement && n.parentElement.classList.contains('num'))) continue;
          var s=n.textContent, j=s.indexOf(h._pfx.trim().split(' - ')[0]); if(j<0) break;
          var k=s.indexOf(' - ', j); if(k<0) break;
          var rest=n.splitText(k+3); var pre=n; if(j>0) pre=n.splitText(j);
          var sp=document.createElement('span'); sp.className='pfx'; pre.parentNode.insertBefore(sp, pre); sp.appendChild(pre); break; }
      });
       
      var EM=window.PAN_EMPTY!=null ? window.PAN_EMPTY : 'gather';    
      if(EM){
        var isEmpty=function(c){ var b=c.querySelector(':scope > .blb'); return b && !b.textContent.trim() && !b.querySelector('img,svg,table'); };
        var units=[], u=[];
        [].forEach.call(sect.querySelectorAll(':scope > .pg > .blk'), function(b){ if(b.classList.contains('cell') && !b.classList.contains('full')) u.push(b); else { if(u.length) units.push(u); u=[]; } });
        if(u.length) units.push(u);
        units.forEach(function(un){
          var em=un.filter(isEmpty); if(!em.length) return;
          if(EM==='label'){ em.forEach(function(c){ c.classList.add('emptyc'); }); return; }
          if(EM==='attach'){
            em.forEach(function(c){
              var i=un.indexOf(c), host=null;
              for(var j=i-1;j>=0;j--) if(!isEmpty(un[j])){ host=un[j]; break; }
              if(!host) for(j=i+1;j<un.length;j++) if(!isEmpty(un[j])){ host=un[j]; break; }
              if(!host) return;
              var h=c.firstElementChild; h.classList.add('att'); var hb=host.querySelector(':scope > .blb');
              if(un.indexOf(host)<i) hb.appendChild(h); else hb.insertBefore(h, hb.firstChild);
              c.remove();
            });
            return;
          }
           
          if(EM==='gather' && em.length===1 && window.PAN_HOIST!==false){
            var c1=em[0], i1=un.indexOf(c1), host1=null;
            for(var j1=i1-1;j1>=0;j1--) if(!isEmpty(un[j1])){ host1=un[j1]; break; }
            if(host1){ var h1=c1.firstElementChild; h1.classList.add('att'); h1.classList.add('glab');   host1.querySelector(':scope > .blb').appendChild(h1); c1.remove(); }
            return;
          }
          if(EM==='gather' && em.length>=2){
            var last=un[un.length-1], g=document.createElement('div'); g.className='blk cell ttl gathered';
            var hd=document.createElement('div'); hd.className='ghead'; g.appendChild(hd);
            var gb=document.createElement('div'); gb.className='blb'; g.appendChild(gb);
            em[0].parentNode.insertBefore(g, em[0]);    
             
            if(window.PAN_HOIST!==false){
              g.classList.add('glabs'); g.removeChild(hd);
              em.forEach(function(c,i){ var h=c.firstElementChild; h.classList.add('glab'); if(i===0) g.insertBefore(h, gb); else gb.appendChild(h); c.remove(); });
            }
            else em.forEach(function(c){ var h=c.firstElementChild; h.classList.add('att'); gb.appendChild(h); c.remove(); });
          }
        });
      }

      var prevP=null;
      [].slice.call(sect.querySelectorAll(':scope > .pg > .blk')).forEach(function(fb){
        var fh=fb.classList.contains('cell') ? fb.firstElementChild : null;
        if(!fb.classList.contains('cell')){ prevP=null; return; }
        if(!fh || fh.tagName!=='H2' || !fh.querySelector('.pfx')) return;
        var p=fh.querySelector('.pfx').textContent.replace(/\s*-\s*$/,'').trim();
        if(p===prevP) return; prevP=p;
        var prev=fb.previousElementSibling; if(prev && prev.classList.contains('hrow') && !prev.classList.contains('runhead')) return;
        var rh=document.createElement('div'); rh.className='blk full hrow runhead';
        var t=document.createElement('div'); t.className='rh'; t.textContent=p; rh.appendChild(t);
        fb.parentNode.insertBefore(rh, fb);
      });
      sect.querySelectorAll('.blk.cell').forEach(function(c){
        var b=c.querySelector(':scope > .blb');
         
        var pl=[].reduce.call(b.querySelectorAll('.prose'), function(a,p){ return a+p.textContent.trim().length; }, 0);
        var tb=[].some.call(b.querySelectorAll('table'), function(t){ var r=t.querySelector('tr'); return t.classList.contains('rh') || (r && r.children.length>=3); });
         
        if(pl>200 || tb || b.querySelector('[data-full]')) c.classList.add('full');
         
        if(window.PAN_HOIST!==false){
          if(b.querySelector('ol.steps:not(.hz), .vchain:not(.hz)')) c.classList.add('stepc');
          var tx=b.textContent.replace(/\s+/g,' ');
          if(tx.length>=150 && (tx.match(/다\.(?=\s|$|['’”)])/g)||[]).length>=2) c.classList.add('prosey');
          if([].some.call(b.querySelectorAll('.chain, .line, .vchain.hz, ol.steps.hz'), function(k){
            var st=k.classList.contains('line') ? [].filter.call(k.children, function(x){ var m=x.querySelector('.mid'); return m && !m.classList.contains('mk'); }).length
                  : k.classList.contains('chain') ? k.querySelectorAll(':scope > .arrow').length+1 : k.querySelectorAll(':scope > .stp, :scope > li').length;
            return st>=5; })) c.classList.add('longchain');
        }
         
        else if(b.querySelector('[data-half]') && b.querySelector('ol.steps:not(.hz), .vchain:not(.hz)')) c.classList.add('stepc');
        wrapGrps(c, b);
      });
    });

    if(window.PAN_HOIST===false) document.querySelectorAll('main.wrap .converge').forEach(function(cv){ cv.classList.add('m6'); });
    if(window.PAN_HOIST!==false){
      document.querySelectorAll('main.wrap .prose > p[style]').forEach(function(p){
        var t=p.textContent.trim();
        if(/font-weight:\s*700/.test(p.getAttribute('style')) && t.length<30 && /해설|고려\s?사항/.test(t)) p.classList.add('endlab');
      });
      document.querySelectorAll('main.wrap .r-end').forEach(function(h){
        var pr=null; for(var s=h.nextElementSibling; s && !pr; s=s.nextElementSibling) pr=s.classList.contains('prose') ? s : s.querySelector('.prose');
        var f=pr && [].find.call(pr.children, function(p){ return p.style.display!=='none'; });
        if(f && f.classList.contains('endlab')) h.classList.add('r-enddup');
      });
      document.querySelectorAll('main.wrap div.quiet').forEach(function(q){ if(/^\(\d\)\s*\d학년\s*\d학기/.test(q.textContent.trim())) q.classList.add('memo'); });

      document.querySelectorAll('main.wrap div > .mk:first-child').forEach(function(m){
        if(m.textContent.trim()!==':') return;
        for(var p=m.previousSibling; p; p=p.previousSibling) if(p.nodeType!==8 && p.textContent.trim()) return;
        m.classList.add('lhc');
      });
      document.querySelectorAll('main.wrap .blk table').forEach(function(t){
        var rows=[].filter.call(t.rows, function(r){ return r.cells.length>=2; }); if(!rows.length) return;
         
        if([].some.call(t.querySelectorAll('td,th'), function(c){ return c.rowSpan>1 || c.colSpan>1; })) return;
        t.classList.add('tauto');
        var firsts=rows.map(function(r){ return r.cells[0]; }).filter(function(c){ return c.colSpan===1; });
        if(firsts.length && firsts.every(function(c){ return c.textContent.trim().length<=12; })) firsts.forEach(function(c){ c.classList.add('nw1'); });
      });
    }
  }
  if(!ROLE) document.querySelectorAll('main.wrap .sect').forEach(function(sect){
    var last=null;
    sect.querySelectorAll(':scope > .pg').forEach(function(pg){
      var kids=[].slice.call(pg.childNodes), blk=null, first=true;
      kids.forEach(function(n){
        if(n.nodeType===3 && !n.textContent.trim()){ pg.removeChild(n); return; }
        var h3=n.nodeType===1 && n.tagName==='H3';
        if(h3) blk=null;
        if(!blk){
          if(first && last && !h3) blk=last;
          else { blk=document.createElement('div'); blk.className='blk'; pg.insertBefore(blk,n); }
        }
        first=false;
        blk.appendChild(n);
      });
      var bs=pg.querySelectorAll(':scope > .blk'); if(bs.length) last=bs[bs.length-1];
    });
  });
  if(!ROLE) document.querySelectorAll('main.wrap .sect > .pg').forEach(function(pg){
    pg.querySelectorAll(':scope > .blk').forEach(function(b){
      if(!b.querySelector(':scope > h3')) b.classList.add('nolab');
      if(b.querySelector(':scope > .prose, :scope > * > .prose')) b.classList.add('full');
      var h4s=b.querySelectorAll(':scope > h4:not(.lab)');
      var hd=b.firstElementChild;
      if(hd && hd.tagName==='H3' && !(h4s.length>=2 || [].some.call(h4s, function(h){ return STD.test(h.textContent); }))){
         
        var bb=document.createElement('div'); bb.className='blb';
        while(hd.nextSibling) bb.appendChild(hd.nextSibling);
        b.appendChild(bb); b.classList.add('ttl');
      }
      var std=[].some.call(h4s, function(h){ return STD.test(h.textContent); });
      if(h4s.length>=2 || std){
        b.classList.add('subs'); if(std) b.classList.add('std'); var sg=null;
        [].slice.call(b.childNodes).forEach(function(n){
          if(n.nodeType!==1) return;
          if(n.tagName==='H3') return;
          if(n.tagName==='H4' && !n.classList.contains('lab')) sg=null;
          if(!sg){ sg=document.createElement('div'); sg.className='sg'+(n.tagName==='H4'?'':' lead'); b.insertBefore(sg,n); }
          sg.appendChild(n);
        });
         
        b.querySelectorAll(':scope > .sg:not(.lead)').forEach(function(sg){
          var h=sg.firstElementChild; if(!h || h.tagName!=='H4') return;
          var body=document.createElement('div'); body.className='sgb';
          while(h.nextSibling) body.appendChild(h.nextSibling);
          sg.appendChild(body);
          wrapGrps(sg, body);
        });
      }
    });
  });
   
  if(!ROLE) document.querySelectorAll('main.wrap .sect').forEach(function(s){
    if(s.querySelector('.blk.std')) s.querySelectorAll('.blk.subs:not(.std)').forEach(function(b){ if(b.querySelector(':scope > h3')) b.classList.add('std'); });
  });
   
  function layoutRole(){
    var main=document.querySelector('main.wrap');
    main.querySelectorAll('.colset').forEach(function(cs){ (cs._items||[]).forEach(function(it){ it.style.gridColumn=''; cs.parentNode.insertBefore(it, cs); }); cs.remove(); });
    main.querySelectorAll('.rowg').forEach(function(g){ g.classList.remove('rowg'); });
    main.querySelectorAll('.flowing').forEach(unflow);
    main.querySelectorAll('.flat').forEach(function(g){ g.classList.remove('flat'); });
    main.querySelectorAll('.tcells').forEach(function(g){ g.classList.remove('tcells'); });
    main.querySelectorAll('.kids.kgrid').forEach(function(k){ k.classList.remove('kgrid'); });
    main.querySelectorAll('.treewide').forEach(function(k){ k.classList.remove('treewide'); });
    main.querySelectorAll('.gfull').forEach(function(k){ k.classList.remove('gfull'); });
    var sects=[].filter.call(main.querySelectorAll('.sect'), function(s){ return s.querySelector(':scope > .pg > .blk.cell, :scope > .pg > .blk.hrow, :scope > .pg > .blk.nolab'); });
    sects.forEach(function(s){
      var fs=parseFloat(getComputedStyle(s).fontSize)||16, gap=2.2*fs, minc=16.5*fs;
      var n=Math.max(1, Math.min(3, Math.floor((s.clientWidth+gap)/(minc+gap))));
      s._n=n; s.style.gridTemplateColumns='repeat('+(2*n)+',minmax(0,1fr))';
      s.querySelectorAll(':scope > .pg > .blk').forEach(function(b){ b._half=false; });
      s.querySelectorAll(':scope > .pg > .blk.cell:not(.full)').forEach(function(c){ c.style.gridColumn='span 2'; });
    });
     
    main.querySelectorAll('.grps .grp').forEach(function(g){ g._h=g.getBoundingClientRect().height; });
     
    main.querySelectorAll('.blk.cell .bracket, .blk.cell .kids, .blk.hrow .bracket, .blk.hrow .kids, .blk.nolab .bracket, .blk.nolab .kids').forEach(function(x){
      x._th=x.getBoundingClientRect().height;
      [].forEach.call(x.children, function(k){ k._h=k.getBoundingClientRect().height; if(!k._inner) k._inner=k.querySelector(':scope > .kids, :scope > .bracket'); });
    });
     
    var M6=[].slice.call(main.querySelectorAll('.converge.m6'));
    sects.forEach(function(s){
      M6.forEach(function(x){ x.classList.remove('m6'); });
      var n=s._n, blks=[].slice.call(s.querySelectorAll(':scope > .pg > .blk')), unit=[];
      var bodyH=function(c){ var b=c.querySelector(':scope > .blb'); return b ? b.getBoundingClientRect().height : 0; };
      var cells=blks.filter(function(b){ return b.classList.contains('cell') && !b.classList.contains('full'); });
      cells.forEach(function(c){ c._bh=bodyH(c); c._wide=false; });    
      var hs=cells.map(bodyH).sort(function(a,b){ return a-b; }), med=hs.length ? hs[window.PAN_HOIST===false ? Math.floor(hs.length/2) : Math.floor((hs.length-1)/2)] : 0;    
      var spanOf=function(c){ var g=c.style.gridColumn; if(g==='1 / -1' || g==='1/-1' || (c.classList.contains('full') && !c._half)) return 2*n; var mm=g.match(/span (\d+)/); return mm ? +mm[1] : 2; };
      var setSpan=function(c,t){ c.style.gridColumn = t>=2*n ? '1/-1' : 'span '+t; };
       
      var flush=function(){ var k=unit.length; if(k===4 && n===3) unit.forEach(function(c){ setSpan(c,3); }); unit=[]; };
      blks.forEach(function(b){ if(b.classList.contains('cell') && !b.classList.contains('full')) unit.push(b); else flush(); });
      flush();
      cells.forEach(function(c){ var h=bodyH(c); if(cells.length>1 && h>2.2*med && h>540) setSpan(c,2*n); });
       
      cells.forEach(function(c){
        var fs=parseFloat(getComputedStyle(c).fontSize)||16;
        var need=c.scrollWidth-c.clientWidth;
        c.querySelectorAll('.cols,.wide,.line,table,.lanes,.vchain,ol.steps,.fork,.branch,.nw').forEach(function(e){ need=Math.max(need, e.scrollWidth-e.clientWidth); });
        var cw=c.getBoundingClientRect().width;
        var squeezed=[].some.call(c.querySelectorAll('.converge > :last-child'), function(x){ var r=x.getBoundingClientRect(); return r.width<0.62*cw && r.height>4.5*fs*1.5; })
           
          || [].some.call(c.querySelectorAll('.cols > *'), function(x){ var r=x.getBoundingClientRect(); return r.width<11*fs && r.height>4.5*fs*1.5; });
        if(squeezed){ setSpan(c, 2*n); return; }    
        if(need>12){ var one=s.clientWidth/(2*n), cur=c.getBoundingClientRect().width;
          c._wide=true;    
          setSpan(c, Math.max(spanOf(c)+2, Math.min(2*n, 2*Math.ceil((cur+need)/(2*one))))); }
      });
      M6.forEach(function(x){ x.classList.add('m6'); });
       
      var fillRows=function(){
        var row=[], used=0;
        var close=function(){
           
          var prop=row.some(function(c){ return c._wide; });
          if(row.length && (used<2*n || !prop)){ var left=2*n, tot=used;
            row.forEach(function(c,i){ var t= i===row.length-1 ? left : Math.max(2, prop ? Math.round(spanOf(c)*2*n/tot) : Math.floor(2*n/row.length)); left-=t; setSpan(c,t); }); }
          row=[]; used=0; };
        blks.forEach(function(b){
          var isCell=b.classList.contains('cell') && (!b.classList.contains('full') || b._half);
          var t=isCell ? spanOf(b) : 2*n;
          if(used+t>2*n) close();
          if(!isCell){ close(); return; }
          row.push(b); used+=t; if(used>=2*n) close();
        });
        close();
      };
      fillRows();
       
      if(window.PAN_HOIST!==false){
        var rowsBy={}; cells.forEach(function(c){ if(spanOf(c)>=2*n) return; var t=Math.round(c.getBoundingClientRect().top); (rowsBy[t]=rowsBy[t]||[]).push(c); });
        var chg=false;
        Object.keys(rowsBy).forEach(function(t){ var r=rowsBy[t]; if(r.length<2) return;
          var hh=r.map(bodyH), mx=Math.max.apply(null,hh), i=hh.indexOf(mx), rest=hh.filter(function(_,j){ return j!==i; }), m2=Math.max.apply(null,rest);
          if((mx>540 && mx>2*m2) || (mx>300 && mx>3*m2)){     setSpan(r[i], 2*n); r[i]._wide=false; chg=true; } });
        if(chg) fillRows();
      }
       
      if(n>=2 && (window.PAN_HOIST!==false || s.querySelector('[data-half]'))){    
        var gp=2.2*(parseFloat(getComputedStyle(s).fontSize)||16), W=s.clientWidth, halfW=n*(W-(2*n-1)*gp)/(2*n)+(n-1)*gp, ch2=false;
        var natW=function(c){ var cl=c.getBoundingClientRect().left, mx=0;
          c.querySelectorAll('ol.steps:not(.hz), .vchain:not(.hz)').forEach(function(L){ var o=L.style.width; L.style.width='max-content'; var r=L.getBoundingClientRect(); mx=Math.max(mx, r.right-cl); L.style.width=o; });
          return mx; };
        blks.forEach(function(c){
          if(!c.classList.contains('cell')) return;
          if(window.PAN_HOIST===false && !c.querySelector('[data-half]')) return;
          var sp=spanOf(c);
          if((c.classList.contains('prosey') || c.classList.contains('longchain')) && !c.classList.contains('full') && sp<n){ setSpan(c,n); c._wide=false; ch2=true; }
          if(c.classList.contains('stepc') && sp>=2*n && !c.querySelector('table, .colset, .prose') && natW(c)<=halfW*1.35){
            c._half=true; setSpan(c,n); c._wide=false; ch2=true; if(cells.indexOf(c)<0) cells.push(c); }
        });
         
        blks.forEach(function(c,i){
          if(!c.classList.contains('stepc') || spanOf(c)!==n) return;
           
          var lh=[].reduce.call(c.querySelectorAll('ol.steps:not(.hz), .vchain:not(.hz)'), function(a,L){ return a+L.getBoundingClientRect().height; }, 0);
          if(lh < 0.7*bodyH(c)) return;
          if(c._half) [blks[i+1], blks[i-1]].some(function(o){
            if(!o || !o.classList.contains('cell') || o.classList.contains('full') || o._half || o._wide || spanOf(o)<2*n) return false;
            if(window.PAN_HOIST===false && !o.querySelector('[data-half]')) return false;
            if((o._bh||bodyH(o)) > bodyH(c)) return false;
            setSpan(o, n); ch2=true; return true;
          });
        });
        if(ch2) fillRows();
         
        var tw=function(t){ return t*(W-(2*n-1)*gp)/(2*n)+(t-1)*gp; }, ch3=false;
        if(n===3) blks.forEach(function(c,i){
          if(!c.classList.contains('stepc') || spanOf(c)!==n) return;
          var lh=[].reduce.call(c.querySelectorAll('ol.steps:not(.hz), .vchain:not(.hz)'), function(a,L){ return a+L.getBoundingClientRect().height; }, 0);
          if(lh < 0.7*bodyH(c)) return;
          var nw=natW(c); if(!(nw>tw(n)+8 && nw<=tw(2*n-2)+8)) return;
          [blks[i+1], blks[i-1]].some(function(o){
            if(!o || !o.classList.contains('cell') || o._half || o.classList.contains('stepc') || spanOf(o)!==n) return false;
            if(Math.abs(o.getBoundingClientRect().top-c.getBoundingClientRect().top)>2) return false;    
            if(window.PAN_HOIST===false && !o.querySelector('[data-half]')) return false;
            if((o._bh||bodyH(o)) > 0.5*bodyH(c) || overflows(o)) return false;
            setSpan(c, 2*n-2); setSpan(o, 2); c._wide=true; o._wide=true; ch3=true; return true;
          });
        });
        if(ch3) fillRows();
      }

      var noSplit=function(c){
        if((c._bh||0) < Math.min(innerHeight,820)/3) return true;
        if(c.querySelector('.grp.ingrp')) return false;    
        return hasChain(c);
      };

      var fulls=blks.filter(function(b){ return b.classList.contains('cell') && b.classList.contains('full') && !b.classList.contains('prosecell') && (!b.querySelector('table') || b.querySelector('[data-cols]')); });
      fulls.forEach(function(c){ c._bh=bodyH(c); });
      cells.concat(fulls).forEach(function(c){
        var st=c.querySelector('.grps'); if(!st) return;
        if(noSplit(c)) return;
        var w=c.getBoundingClientRect().width, colw=19*(parseFloat(getComputedStyle(c).fontSize)||16), g2=2.2*(parseFloat(getComputedStyle(c).fontSize)||16);
        var m=Math.floor((w+g2)/(colw+g2)); if(m<2) return;
        balance(st, [].slice.call(st.children), m, 0);
      });

      var hrows=blks.filter(function(b){ return (b.classList.contains('hrow') || b.classList.contains('nolab')) && !b.classList.contains('runhead'); });
      hrows.forEach(function(c){ c._bh=c.getBoundingClientRect().height; });
      cells.concat(fulls, hrows).forEach(function(c){
        if(c.querySelector('.colset') || noSplit(c)) return;
        var fs=parseFloat(getComputedStyle(c).fontSize)||16, m=Math.floor((c.getBoundingClientRect().width+2.2*fs)/(21.2*fs)); if(m<2) return;
        var tr=[].find.call(c.querySelectorAll('.bracket, .kids'), function(x){ return x.children.length>=2 && (x._th||0)>360; });
        if(tr && !c.classList.contains('cell')){ var top=tr; while(top.parentElement!==c) top=top.parentElement; top.classList.add('treewide'); }
         
        var TM0=window.PAN_TREE||((tr && (tr._th||0)>Math.min(innerHeight,820)*2/3) ? 'flow' : 'one');    
        if(tr && TM0==='none') return;
        if(tr && TM0==='cells'){ tr.classList.add('tcells','flat'); tr.style.setProperty('--m', m); return; }    
         
        if(tr && TM0==='flow'){ var thr=Math.min(innerHeight,820)*2/3; flowTree(tr, Math.min(m, Math.max(2, Math.ceil((tr._th||0)/thr)))); return; }
        if(tr){
          var TM=TM0;    
          if(TM==='one') balance(tr, [].slice.call(tr.children), m, 99);
          else if(TM==='rows') [].slice.call(tr.children).forEach(function(x){
            x.classList.add('rowg'); var inn=x._inner; if(inn && inn.children.length>=2) balance(inn, [].slice.call(inn.children), m, 99);
          });
          else balance(tr, [].slice.call(tr.children), m, 0);
          if(tr.querySelector('.colset') || TM==='rows') tr.classList.add('flat');
        }    
      });
       
      for(var pass=0; pass<2; pass++) cells.forEach(function(c){
        if(!overflows(c) && c.scrollWidth-c.clientWidth<=2) return;
        var cur=(c.style.gridColumn.match(/span (\d+)/)||[0,2])[1]*1; if(c.style.gridColumn==='1 / -1' || cur>=2*n) return;
        var nx=Math.min(2*n, cur+2); c.style.gridColumn= nx>=2*n ? '1/-1' : 'span '+nx;
      });
      fillRows();
       
      if(window.PAN_HOIST!==false){
        var gch=false;
        blks.forEach(function(g){
          if(!g.classList.contains('glabs')) return;
          var full=spanOf(g)>=2*n;
          if(!full){
            var gt=g.getBoundingClientRect().top, fsg=parseFloat(getComputedStyle(g).fontSize)||16;
            var mates=cells.filter(function(c){ return c!==g && Math.abs(c.getBoundingClientRect().top-gt)<=2; });
            var mx=mates.length ? Math.max.apply(null, mates.map(bodyH)) : 0;
            if(!mates.length || bodyH(g)>mx+1.5*fsg){ setSpan(g, 2*n); g._wide=false; gch=true; full=true; }
          }
          if(full) g.classList.add('gfull');
        });
        if(gch) fillRows();
      }
    });
    eqAlign();
  }
   
  function eqAlign(){
    var main=document.querySelector('main.wrap'); if(!main || !main.clientWidth) return;
    var eqX=function(root){ var tw=document.createTreeWalker(root, NodeFilter.SHOW_TEXT), t; while((t=tw.nextNode())){ var i=t.textContent.indexOf('='); if(i>=0){ var r=document.createRange(); r.setStart(t,i); r.setEnd(t,i+1); return r.getBoundingClientRect().left; } } return null; };
    main.querySelectorAll('.eqal').forEach(function(e){ e.style.paddingLeft=''; e.classList.remove('eqal'); });
     
    if(document.documentElement.classList.contains('dae-big')){
      main.querySelectorAll('.vchain.l1al').forEach(function(v){ v.style.gridTemplateColumns=''; v.classList.remove('l1al'); });
      main.querySelectorAll('.sect').forEach(function(s){
        var L=[].filter.call(s.querySelectorAll('.vchain:not(.hz)'), function(v){ return v.offsetParent!==null && v.querySelector(':scope > .ann'); });
        if(L.length<2) return;
        var cw=L.map(function(v){ var st=v.querySelector(':scope > .stp'); return st ? st.getBoundingClientRect().width : 0; });
        var mx=Math.max.apply(null, cw);
        L.forEach(function(v,i){
          if(mx-cw[i]<2) return;
          var fs=parseFloat(getComputedStyle(v).fontSize)||16;
          if(v.clientWidth-mx-fs < 12*fs) return;
          v.style.gridTemplateColumns=Math.ceil(mx)+'px minmax(0,1fr)'; v.classList.add('l1al');
        });
      });
    }
    main.querySelectorAll('.blk .ind').forEach(function(ind){
      var d=ind.firstElementChild; if(!d || d.textContent.trim().charAt(0)!=='=') return;
      var prev=ind.previousElementSibling; if(!prev) return;
      var a=eqX(prev), b=eqX(ind); if(a==null || b==null) return;
      var pl=parseFloat(getComputedStyle(ind).paddingLeft)||0; ind.style.paddingLeft=Math.max(0, pl+(a-b))+'px'; ind.classList.add('eqal');
    });
  }
   
  function flowTree(tr, m){
    var target=(tr._th||tr.getBoundingClientRect().height)/m, units=[];
    var lab=function(el){ var t=el.querySelector('.term'); return (t ? t.textContent : el.textContent).trim(); };
    (function walk(list, depth, anc){
      list.forEach(function(el){
        var h=el._h||el.getBoundingClientRect().height;
        var inner=el.classList.contains('branch') ? el.querySelector(':scope > .kids, :scope > .bracket') : null;
         
        var leafy=inner && [].every.call(inner.children, function(k){ return !(k.classList.contains('branch') && k.querySelector(':scope > .kids, :scope > .bracket')); });
        if(!inner || !inner.children.length || leafy || h<=target*0.45 || depth>=3){ units.push({el:el, d:depth, anc:anc, h:h}); return; }
        var head=el.firstElementChild; units.push({el:head, d:depth, anc:anc, h:head.getBoundingClientRect().height+4, head:true});
        walk([].slice.call(inner.children), depth+1, anc.concat([lab(head)]));
      });
    })([].slice.call(tr.children), 0, []);
    if(units.length<2) return;
    var fl=document.createElement('div'); fl.className='flow'; fl.style.setProperty('--m', m);
    var rs=part(units.map(function(u){ return u.h; }), Math.min(m, units.length));
     
    for(var ri=0; ri<rs.length-1; ri++) while(rs[ri][1]-1>rs[ri][0] && units[rs[ri][1]-1].head){ rs[ri][1]--; rs[ri+1][0]--; }
    rs.forEach(function(r){
      var col=document.createElement('div'); col.className='col'; fl.appendChild(col);
      var first=units[r[0]];
      if(first && first.d>0 && first.anc.length){ var cr=document.createElement('div'); cr.className='crumb'; cr.setAttribute('aria-hidden','true'); cr.textContent=first.anc.join(' › '); col.appendChild(cr); }
      units.slice(r[0], r[1]).forEach(function(u){
        var ph=document.createComment('flow'); u.el.parentNode.insertBefore(ph, u.el); u.el._ph=ph;
        u.el.style.paddingLeft=(u.d*1.1)+'em'; if(u.head) u.el.classList.add('fhead');
        col.appendChild(u.el);
      });
    });
    tr.insertBefore(fl, tr.firstChild); tr.classList.add('flowing','flat'); tr._flow=units;
  }
  function unflow(tr){
    (tr._flow||[]).slice().reverse().forEach(function(u){ var ph=u.el._ph; if(ph && ph.parentNode){ ph.parentNode.replaceChild(u.el, ph); } u.el.style.paddingLeft=''; u.el.classList.remove('fhead'); u.el._ph=null; });
    var fl=tr.querySelector(':scope > .flow'); if(fl) fl.remove(); tr.classList.remove('flowing'); tr._flow=null;
  }
  function part(hs, k){    
    var n=hs.length, pre=[0]; hs.forEach(function(h,i){ pre.push(pre[i]+h); });
    var INF=1e18, dp=[], cut=[];
    for(var j=0;j<=k;j++){ dp.push([]); cut.push([]); for(var i=0;i<=n;i++){ dp[j].push(INF); cut[j].push(0); } }
    dp[0][0]=0;
    for(j=1;j<=k;j++) for(i=1;i<=n;i++) for(var p=j-1;p<i;p++){ var v=Math.max(dp[j-1][p], pre[i]-pre[p]); if(v<dp[j][i]){ dp[j][i]=v; cut[j][i]=p; } }
    var out=[], e=n; for(j=k;j>=1;j--){ var b=cut[j][e]; out.unshift([b,e]); e=b; } return out;
  }
  var WIDE='.cols,.wide,.line,table,.lanes,.vchain,ol.steps,.fork,.branch,.converge';

  function hasChain(c){
    if(c.querySelector('.vchain:not(.hz)')) return true;
    return [].some.call(c.querySelectorAll('.blb div'), function(x){ return !x.children.length && /^[↓⇓]$/.test(x.textContent.trim()); });
  }
  function overflows(root, tol){ tol = tol==null ? 12 : tol; return [].some.call(root.querySelectorAll(WIDE), function(e){ return e.scrollWidth-e.clientWidth>tol; }); }
  function balance(parent, items, m, depth){
    var tot=items.reduce(function(a,x){ return a+(x._h||0); },0), target=tot/m, batch=[];
    var flushB=function(){

      var bh=batch.map(function(x){ return x._h||0; }), sb=bh.slice().sort(function(a,b){ return a-b; }), md=sb[Math.floor(sb.length/2)]||1;
      var even=batch.length>m && sb[sb.length-1]<=2.5*md;
       
      if(even){ var kk=Math.min(m, batch.length), gH=0; for(var r0=0; r0<bh.length; r0+=kk) gH+=Math.max.apply(null, bh.slice(r0, r0+kk));
        var fH=Math.max.apply(null, part(bh, kk).map(function(r){ return bh.slice(r[0], r[1]).reduce(function(a,b){ return a+b; },0); }));
        if(batch.length%kk && gH>1.15*fH && batch.every(function(x){ return x.classList.contains('ingrp'); })) even=false; }    
      for(var k=Math.min(m, batch.length); batch.length>=2 && k>=2; k--){
        var cs=document.createElement('div'); cs.className='colset'+(even?' gridset':''); cs.style.setProperty('--m', k);
        parent.insertBefore(cs, batch[0]); cs._items=batch.slice();
        if(even){ batch.forEach(function(x){ cs.appendChild(x); });
           
          batch.forEach(function(x){ x.classList.remove('lead1'); });
          var fl=function(x){ return ((x.firstElementChild||x).textContent||'').trim(); };
          var rest=batch.slice(1), colon=function(x){ return /\s:\s|:\s/.test(fl(x)); };
          var r1=!colon(batch[0]) && rest.filter(colon).length>=rest.length-1 && rest.filter(colon).length>=2;
          var r2=!batch[0].classList.contains('k') && rest.every(function(x){ return x.classList.contains('k'); });
          if(batch.length>2 && (r1 || r2)) batch[0].classList.add('lead1'); }
        else part(bh, k).forEach(function(r){
          var col=document.createElement('div'); col.className='col'; cs.appendChild(col);
          batch.slice(r[0], r[1]).forEach(function(x){ col.appendChild(x); });
        });
         
        if(even && batch.some(function(x){ return overflows(x); })){ cs._items.forEach(function(it){ parent.insertBefore(it, cs); }); cs.remove(); even=false; k++; continue; }
        if(!overflows(cs)) break;
        cs._items.forEach(function(it){ it.style.gridColumn=''; parent.insertBefore(it, cs); }); cs.remove();
      }
      batch=[];
    };
    items.forEach(function(x){
       
      if(x.querySelector && x.querySelector('table')){ flushB(); return; }
      var inner=(x.classList.contains('grp') || x.classList.contains('branch')) ? (x._inner || null) : null;
       
      var kids=inner ? [].slice.call(inner.children) : [];
      var rich=kids.length>=2 && kids.some(function(z){ return (z._h||0)>=60; });
      if(depth<2 && rich && (x._h||0)>Math.max(1.15*target, 360) && !hasChain(x)){
        flushB(); x.classList.add('rowg'); balance(inner, [].slice.call(inner.children), m, depth+1);
      } else batch.push(x);
    });
    flushB();
  }
  function cols(g){ return getComputedStyle(g).gridTemplateColumns.split(' ').length; }
  function splitTall(){
    document.querySelectorAll('main.wrap .split').forEach(function(s){ s.classList.remove('split'); });
    fitSpans();
     
    [].slice.call(document.querySelectorAll('main.wrap .subs')).concat([].slice.call(document.querySelectorAll('main.wrap .sect'))).forEach(function(b){
      if(cols(b)<2) return;
      var sgs=[].slice.call(b.querySelectorAll(':scope > .sg:not(.lead), :scope > .pg > .blk.cell')); if(sgs.length<2) return;
      var hs=sgs.map(function(s){ var x=s.querySelector(':scope > .sgb, :scope > .blb'); return x ? x.getBoundingClientRect().height : 0; });
      var med=hs.slice().sort(function(a,c){ return a-c; })[Math.floor(hs.length/2)];
      sgs.forEach(function(s,i){
        if(s.classList.contains('cansplit') && hs[i]>2.2*med && hs[i]>Math.min(innerHeight,900)*.6)     s.classList.add('split');
      });
    });
     
    document.querySelectorAll('main.wrap .grp.wide').forEach(function(g){ g.classList.remove('wide'); });
    document.querySelectorAll('main.wrap .bgrid').forEach(function(x){ x.classList.remove('bgrid'); });
    document.querySelectorAll('main.wrap .split .grps').forEach(function(st){
      var gs=[].slice.call(st.querySelectorAll(':scope > .grp')); if(gs.length<2) return;
      var hs=gs.map(function(g){ return g.getBoundingClientRect().height; });
      gs.forEach(function(g,i){
        var rest=hs.filter(function(_,j){ return j!==i; }).sort(function(a,c){ return a-c; });
        if(hs[i] <= 2*rest[Math.floor(rest.length/2)]) return;
        var best=null;
        g.querySelectorAll('.stack').forEach(function(x){
          if(best) return;
          if([].filter.call(x.children, function(c){ return c.classList.contains('branch'); }).length>=2) best=x;
        });
        if(best){ g.classList.add('wide'); best.classList.add('bgrid'); }
      });
    });
    fitSpans();
  }
  function fitSpans(){
    document.querySelectorAll('main.wrap .blk:not(.subs):not(.full):not(.nolab), main.wrap .sg:not(.lead)').forEach(function(c){ c.style.gridColumn=''; });
    document.querySelectorAll('main.wrap .blk:not(.subs):not(.full):not(.nolab):not(.split), main.wrap .sg:not(.lead):not(.split)').forEach(function(c){
      var g=c.parentElement.closest('.sect, .subs'); if(!g) return;
      var n=cols(g); if(n<2) return;
      var need=c.scrollWidth-c.clientWidth;
      c.querySelectorAll('.cols,.wide,.line,table,.lanes,.vchain,ol.steps,.fork,.branch').forEach(function(e){
        need=Math.max(need, e.scrollWidth-e.clientWidth);
      });
      if(need>2){
        var w=c.getBoundingClientRect().width, gap=parseFloat(getComputedStyle(g).columnGap)||0, one=(g.clientWidth-gap*(n-1))/n;
        var span=Math.min(n, Math.ceil((w+need+gap)/(one+gap)));
        c.style.gridColumn = span>=n ? '1/-1' : 'span '+span;
      }
    });
  }
  var relayout = ROLE ? layoutRole : splitTall;
   
  var MAIN=document.querySelector('main.wrap'), ALL=[], IX=new Map();
  if(MAIN){ ALL=[].slice.call(MAIN.getElementsByTagName('*')); ALL.forEach(function(e,i){ IX.set(e,i); }); }

  var bpOf=function(){ var w, mwb=document.querySelector('main.wrap');
    w = mwb ? mwb.clientWidth : (document.documentElement.clientWidth||window.innerWidth||0);
    return w>=950 ? 3 : w>=700 ? 2 : w>0 ? 1 : 0; };
  var BAKE=/[?&]bake=1/.test(location.search), LAYOUT=(!BAKE && window.PAN_LAYOUT) || null, applied=null;
  function snapshot(){
    var sn={sect:[], span:[], cls:{}, sets:[], flows:[]};
    MAIN.querySelectorAll('.sect').forEach(function(s){ if(s.style.gridTemplateColumns && IX.has(s)) sn.sect.push([IX.get(s), s.style.gridTemplateColumns]); });
    ALL.forEach(function(e,i){ if(e.style && e.style.gridColumn) sn.span.push([i, e.style.gridColumn]); });
    ['rowg','flat','flowing','tcells','lead1','treewide','gfull'].forEach(function(c){ sn.cls[c]=ALL.filter(function(e){ return e.classList.contains(c); }).map(function(e){ return IX.get(e); }); });
    MAIN.querySelectorAll('.colset').forEach(function(cs){
      sn.sets.push({p:IX.get(cs.parentNode), c:cs.className, m:cs.style.getPropertyValue('--m'), items:(cs._items||[]).map(function(x){ return IX.get(x); }),
        cols: cs.classList.contains('gridset') ? null : [].map.call(cs.children, function(col){ return [].map.call(col.children, function(x){ return IX.get(x); }); })});
    });
    MAIN.querySelectorAll('.flow').forEach(function(fl){
      sn.flows.push({tr:IX.get(fl.parentNode), m:fl.style.getPropertyValue('--m'), cols:[].map.call(fl.children, function(col){
        var cr=col.querySelector(':scope > .crumb');
        return {crumb: cr ? cr.textContent : '', items:[].filter.call(col.children, function(x){ return !x.classList.contains('crumb'); }).map(function(x){ return [IX.get(x), x.style.paddingLeft, x.classList.contains('fhead')?1:0]; })};
      })});
    });
    return sn;
  }
  var mv=function(el, into){ if(!el._ph){ var ph=document.createComment('p'); el.parentNode.insertBefore(ph, el); el._ph=ph; } into.appendChild(el); };
  function unapply(){
    if(!applied) return;
    ALL.forEach(function(el){ if(el._ph){ if(el._ph.parentNode) el._ph.parentNode.replaceChild(el, el._ph); el._ph=null; } });
    MAIN.querySelectorAll('.colset, .flow').forEach(function(x){ x.remove(); });
    applied.sect.forEach(function(r){ ALL[r[0]].style.gridTemplateColumns=''; });
    applied.span.forEach(function(r){ ALL[r[0]].style.gridColumn=''; });
    Object.keys(applied.cls).forEach(function(c){ applied.cls[c].forEach(function(i){ ALL[i].classList.remove(c); }); });
    applied.flows.forEach(function(f){ f.cols.forEach(function(col){ col.items.forEach(function(it){ ALL[it[0]].style.paddingLeft=''; ALL[it[0]].classList.remove('fhead'); }); }); });
    applied=null;
  }
  function applySnap(sn){
    unapply();
    sn.sect.forEach(function(r){ ALL[r[0]].style.gridTemplateColumns=r[1]; });
    sn.span.forEach(function(r){ ALL[r[0]].style.gridColumn=r[1]; });
    Object.keys(sn.cls).forEach(function(c){ sn.cls[c].forEach(function(i){ ALL[i].classList.add(c); }); });
    sn.sets.forEach(function(s){
      var p=ALL[s.p], first=ALL[s.items[0]]; if(!p || !first) return;
      var cs=document.createElement('div'); cs.className=s.c; cs.style.setProperty('--m', s.m); p.insertBefore(cs, first);
      cs._items=s.items.map(function(i){ return ALL[i]; });
      if(s.cols) s.cols.forEach(function(ids){ var col=document.createElement('div'); col.className='col'; cs.appendChild(col); ids.forEach(function(i){ mv(ALL[i], col); }); });
      else cs._items.forEach(function(x){ mv(x, cs); });
    });
    sn.flows.forEach(function(f){
      var tr=ALL[f.tr]; if(!tr) return;
      var fl=document.createElement('div'); fl.className='flow'; fl.style.setProperty('--m', f.m); tr.insertBefore(fl, tr.firstChild);
      f.cols.forEach(function(c){ var col=document.createElement('div'); col.className='col'; fl.appendChild(col);
        if(c.crumb){ var cr=document.createElement('div'); cr.className='crumb'; cr.setAttribute('aria-hidden','true'); cr.textContent=c.crumb; col.appendChild(cr); }
        c.items.forEach(function(it){ var el=ALL[it[0]]; if(!el) return; mv(el, col); el.style.paddingLeft=it[1]; if(it[2]) el.classList.add('fhead'); });
      });
    });
    applied=sn;
  }
  var eqAlignFn=eqAlign;    
  var place=function(){
    if(LAYOUT){ var b=bpOf(); if(!b) return false; var sn=LAYOUT[b]; if(sn){ if(!applied || applied!==sn) applySnap(sn); if(eqAlignFn) eqAlignFn(); return true; } }
    relayout(); return true;
  };
  place();
  if(BAKE){
     
    document.documentElement.classList.add('baking');
    var dump=function(){ relayout(); var pre=document.getElementById('pan-bake') || document.body.appendChild(Object.assign(document.createElement('pre'), {id:'pan-bake'})); pre.style.display='none'; pre.textContent=JSON.stringify({bp:bpOf(), w:document.documentElement.clientWidth, layout:snapshot()}); };
    window.addEventListener('load', function(){ if(document.fonts && document.fonts.ready) document.fonts.ready.then(dump); else dump(); });
  }

  var layKey=function(){ if(LAYOUT) return 'bp'+bpOf(); var mw3=document.querySelector('main.wrap'); return String(mw3 ? mw3.clientWidth : 0); };
  var lastKey=layKey();    
  var t=null, busy=false; function again(force){ var k=layKey(); if(force!==true && k===lastKey) return; lastKey=k; place(); busy=true; window.dispatchEvent(new Event('resize')); busy=false; }
  window.addEventListener('load', function(){ again(true); });    
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ again(true); });
  window.addEventListener('resize', function(){ if(busy) return; clearTimeout(t); t=setTimeout(again,120); });
   
  if(window.ResizeObserver){
    var mw=document.querySelector('main.wrap'), lastW=mw ? mw.clientWidth : 0;
    if(mw) new ResizeObserver(function(){ var w=mw.clientWidth; if(Math.abs(w-lastW)<2) return; lastW=w; if(busy) return; clearTimeout(t); t=setTimeout(again,60); }).observe(mw);
  }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden){ clearTimeout(t); t=setTimeout(again,60); } });
   
  (function waitW(){ var mw2=document.querySelector('main.wrap'); if(!mw2 || mw2.clientWidth>0) return;
    var iv=setInterval(function(){ if(mw2.clientWidth>0){ clearInterval(iv); again(); } }, 250); })();
})();

(function(){
  function fit(){
    document.querySelectorAll('.fork').forEach(function(f){
      var mk = f.querySelector(':scope > .mkf');
      var box = f.querySelector(':scope > .mkf ~ *');
      if(!mk || !box) return;
      var kids = box.children;
      if(!kids.length) return;
      var fb = f.getBoundingClientRect();
      var a = kids[0].getBoundingClientRect();
      var b = kids[kids.length-1].getBoundingClientRect();
      var top = (a.top + a.height/2) - fb.top;
      var bot = fb.bottom - (b.top + b.height/2);
      mk.style.setProperty('--t', top.toFixed(1) + 'px');
      mk.style.setProperty('--b', bot.toFixed(1) + 'px');
      var s1 = mk.querySelector('.a1'), s2 = mk.querySelector('.a2');
      var mid = (fb.height - top - bot) / 2 + top;
      if(s1){ s1.style.top = top + 'px'; s1.style.height = (mid - top) + 'px'; }
      if(s2){ s2.style.top = mid + 'px'; s2.style.height = (fb.height - bot - mid) + 'px'; }
    });
  }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  fit();
})();

(function(){
  function fitBrace(){
     
    document.querySelectorAll('.converge').forEach(function(c){
      var kids = c.children, svg = null, left = null;
      for (var i=0;i<kids.length;i++){
        if (kids[i].tagName.toLowerCase()==='svg'){ svg = kids[i]; break; }
        left = kids[i];
      }
      if(!svg || !left || !left.children.length) return;
      var lb = left.getBoundingClientRect();
       
      var cb = c.getBoundingClientRect();
      var a, b;
       
      var ms = left.querySelector('[data-b="s"],[data-b="se"]');
      var me = left.querySelector('[data-b="e"],[data-b="se"]');
      if (ms && me){
        a = ms.getBoundingClientRect();
        b = me.getBoundingClientRect();
        var top0 = (a.top + a.height/2) - lb.top;
        var bot0 = lb.bottom - (b.top + b.height/2);
        var h0 = Math.max(8, lb.height - top0 - bot0);
        svg.setAttribute('preserveAspectRatio','none');
        svg.style.height = h0.toFixed(1)+'px';
        svg.style.alignSelf = 'flex-start';
        svg.style.marginTop = ((a.top + a.height/2) - cb.top).toFixed(1)+'px';
        if(!svg.style.width) svg.style.width = '11px';
        svg.querySelectorAll('path,line').forEach(function(e){
          e.setAttribute('vector-effect','non-scaling-stroke'); });
        return;
      }
       
      var marks = left.querySelectorAll('.term,.mid');
      if(marks.length >= 2){
        a = marks[0].getBoundingClientRect();
        b = marks[marks.length-1].getBoundingClientRect();
         
        if (Math.abs((b.top + b.height/2) - (a.top + a.height/2)) < 8) marks = [];
      }
      if(marks.length < 2){
         
        var list = null;
        var cands = left.querySelectorAll('.bracket,.stack,.kids');
        for (var ci = 0; ci < cands.length; ci++){
          if (cands[ci].children.length >= 2){ list = cands[ci]; break; }
        }
        if (!list){
          list = left;
          while (list.children.length === 1 && list.firstElementChild &&
                 list.firstElementChild.children.length) list = list.firstElementChild;
        }
        var ks = list.children;
        a = ks[0].getBoundingClientRect();
        b = ks[ks.length-1].getBoundingClientRect();
      }
      if (Math.abs((b.top + b.height/2) - (a.top + a.height/2)) < 8){
         
        a = { top: lb.top, height: 24 };
        b = { top: lb.bottom - 24, height: 24 };
      }
      var top = (a.top + a.height/2) - lb.top;
      var bot = lb.bottom - (b.top + b.height/2);
      var h = Math.max(8, lb.height - top - bot);
      svg.setAttribute('preserveAspectRatio','none');
      svg.style.height = h.toFixed(1)+'px';
      svg.style.alignSelf = 'flex-start';
      svg.style.marginTop = ((a.top + a.height/2) - cb.top).toFixed(1)+'px';
      if(!svg.style.width) svg.style.width = '11px';
      svg.querySelectorAll('path,line').forEach(function(e){
        e.setAttribute('vector-effect','non-scaling-stroke'); });
    });
  }
   
  function fitDown(){
    document.querySelectorAll('.forkdown').forEach(function(f){
      var mk = f.querySelector(':scope > .mkd');
      var box = f.querySelector(':scope > .mkd ~ *');
      if(!mk || !box || !box.children.length) return;
      var fb = mk.getBoundingClientRect();
       
      function headRect(el){ var h = el.firstElementChild; return (h || el).getBoundingClientRect(); }
      var a = headRect(box.children[0]);
      var b = headRect(box.children[box.children.length-1]);
      var l = (a.left + a.width/2) - fb.left, r = (b.left + b.width/2) - fb.left;
      var mid = (l + r) / 2;
      var d1 = mk.querySelector('.d1'), d2 = mk.querySelector('.d2');
       
      var L = Math.max(l, mid-70), R = Math.min(r, mid+70);
      if(d1){ d1.style.left = L+'px'; d1.style.width = Math.max(1, mid-L)+'px'; }
      if(d2){ d2.style.left = mid+'px'; d2.style.width = Math.max(1, R-mid)+'px'; }
      var root = f.querySelector(':scope > .root');
      if(root){ root.style.marginLeft = Math.max(0, mid - root.offsetWidth/2)+'px'; }
    });
  }
  function all(){ fitBrace(); fitDown(); }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  window.addEventListener('load', all);
  window.addEventListener('resize', all);
  all();
})();

(function(){
  var root=document.documentElement;
  function apply(){
    var v=null, l=null;
    try{ v=null; l=null; }catch(e){}
    if(v==='b') v='dark'; else if(v==='c') v='paper';
    if(v==='white'||v==='paper'||v==='dark') root.dataset.theme=v; else root.removeAttribute('data-theme');
    if(l==='white'||l==='paper') root.dataset.light=l; else root.removeAttribute('data-light');
  }
  apply();
  window.addEventListener('storage',function(e){ if(!e.key||/^cards_(theme|light)_v1$/.test(e.key)) apply(); });
})();

document.querySelectorAll('.mkf svg,.mkd svg,.converge>svg,.fork svg,.fig svg').forEach(function(e){
  e.setAttribute('aria-hidden','true');});

(function(){
  var main=document.querySelector('main.wrap'); if(!main) return;
   
  var flow=[].slice.call(document.querySelectorAll('main.wrap > h2, main.wrap > .part, main.wrap .pg > *'));
  function rangeOf(h){
    var i=flow.indexOf(h), out=[];
    for(var j=i+1;j<flow.length;j++){var e=flow[j];
      if(e.classList&&e.classList.contains('part'))break;
      if(e.tagName==='H2')break;
      if(h.tagName==='H3'&&e.tagName==='H3')break;
      out.push(e);}
    return out;}
  function setClosed(h,closed){
    h.classList.toggle('closed',closed);
    if(h.tagName==='H2'){ for(var s=h.nextElementSibling; s&&s.tagName!=='H2'&&!s.classList.contains('part')&&!s.classList.contains('foot'); s=s.nextElementSibling){ if(s.classList.contains('sect')) s.classList.toggle('clpsd',closed); } }
    rangeOf(h).forEach(function(e){
      if(closed){e.classList.add('clpsd');}
      else{e.classList.remove('clpsd');
        if(e.tagName==='H3'&&e.classList.contains('closed'))
          rangeOf(e).forEach(function(x){x.classList.add('clpsd');});}
    });}
   
  var DB=document.documentElement.classList.contains('dae-big');
  [].slice.call(document.querySelectorAll('main.wrap > h2, main.wrap .pg > h2, main.wrap .pg > h3'))
    .forEach(function(h){ if(DB && h.classList.contains('r-dae')) return; h.classList.add('tg');
      h.addEventListener('click',function(ev){
        if(ev.target.closest('a'))return;
        setClosed(h,!h.classList.contains('closed'));});});
   
  function blkList(b){ var s=b && b.closest('.sect'); return s ? [].slice.call(s.querySelectorAll(':scope > .pg > .blk')) : []; }
  function isBound(e){ return e.classList.contains('runhead') || !!e.querySelector(':scope > .r-jeol, :scope > .r-dae'); }
  function rangeB(h){
    var b=h.parentElement, out=[], s, L=blkList(b);
    for(s=h.nextElementSibling; s; s=s.nextElementSibling) out.push(s);
    for(var j=L.indexOf(b)+1; j<L.length && !isBound(L[j]); j++) out.push(L[j]);
    return out; }
  function setClosedB(h,c){ h.classList.toggle('closed',c); rangeB(h).forEach(function(e){ e.classList.toggle('clpsd',c); }); }
   
  var JB=DB || window.PAN_HOIST===false;
  if(JB) [].forEach.call(main.querySelectorAll('.sect .blk.hrow > .r-jeol'), function(h){
    h.classList.add('tg');
    h.addEventListener('click',function(ev){ if(ev.target.closest('a')) return; setClosedB(h,!h.classList.contains('closed')); });
  });
  function openB(el){
    var b=el.closest && el.closest('.sect .blk'); if(!b) return; var L=blkList(b);
    for(var j=L.indexOf(b); j>=0; j--){ var hj=L[j].querySelector(':scope > .r-jeol'); if(hj){ if(hj.classList.contains('closed')) setClosedB(hj,false); break; } if(isBound(L[j])) break; } }
  function expandTo(id){
    if(!id)return; var el=document.getElementById(id); if(!el)return;
    var node=el, i=flow.indexOf(node);
    while(i<0&&node&&node!==main){node=node.parentElement; i=flow.indexOf(node);}
    for(var j=i;j>=0;j--){var e=flow[j];
      if(e.tagName==='H3'||e.tagName==='H2'){
        if(e.classList.contains('closed'))setClosed(e,false);
        if(e.tagName==='H2')break;}}
    if(JB) openB(el);
    el.classList&&el.classList.remove('clpsd');}
  window.addEventListener('hashchange',function(){
    expandTo(decodeURIComponent(location.hash.slice(1)));});
  if(location.hash)expandTo(decodeURIComponent(location.hash.slice(1)));
   
  var sb=document.querySelector('.sidebar');
  if(sb){
    var h1=document.querySelector('main.wrap h1'), KEY='pan_side_'+(h1?h1.textContent.trim():'');
    var btn=document.createElement('button'); btn.className='tocbtn'; btn.title='목차'; btn.setAttribute('aria-label','목차');
    btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M9 4.5v15"/></svg>';
    var scrim=document.createElement('div'); scrim.className='scrim';
    function wide(){ return window.innerWidth>=1000; }
    function setOpen(o,save){sb.classList.toggle('open',o); document.body.classList.toggle('tocopen',o); btn.setAttribute('aria-expanded',o?'true':'false');
      if(save){ try{ localStorage.setItem(KEY,o?'1':'0'); }catch(e){} }
       
      setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, 30); }
    btn.addEventListener('click',function(){setOpen(!sb.classList.contains('open'),true);});
    scrim.addEventListener('click',function(){setOpen(false,true);});
    var tv=sb.querySelector('.toc-view'), lv=sb.querySelector('.list-view');
    sb.addEventListener('click',function(ev){
      var sw=ev.target.closest('.toc-switch');
      if(sw&&tv&&lv){ev.preventDefault(); tv.hidden=true; lv.hidden=false; return;}
      var bk=ev.target.closest('.toc-back');
      if(bk){ev.preventDefault(); if(tv&&lv){lv.hidden=true; tv.hidden=false;} return;}
      if(ev.target.closest('a')&&!wide())setOpen(false,false);});
    document.body.appendChild(btn); document.body.appendChild(scrim);
    var saved=null; try{ saved=localStorage.getItem(KEY); }catch(e){}
    setOpen(saved==='1'&&wide(),false);
  }
})();

(function(){
  function firstLineCenter(el){
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n;
    while((n=w.nextNode())){
      if(n.textContent.trim()){
        var r=document.createRange(); r.selectNodeContents(n);
        var rects=r.getClientRects();
        if(rects.length) return rects[0].top+rects[0].height/2;
      }
    }
    var b=el.getBoundingClientRect(); return b.top+b.height/2;
  }
  function fitTicks(){
    var kids=document.querySelectorAll('.bracket > *, .kids > *');
    for(var i=0;i<kids.length;i++){
      var ch=kids[i];
      if(ch.tagName==='svg'||ch.tagName==='SVG')continue;
      var src=ch;
      if(ch.classList.contains('branch')&&ch.firstElementChild) src=ch.firstElementChild;
      else if(ch.classList.contains('bsub')){ch.style.removeProperty('--tick');continue;}
      var y=firstLineCenter(src)-ch.getBoundingClientRect().top;
      if(isFinite(y)&&y>0) ch.style.setProperty('--tick', y.toFixed(1)+'px');
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fitTicks);
  else fitTicks();
  window.addEventListener('load',fitTicks);
  var t; window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(fitTicks,150);});
})();
