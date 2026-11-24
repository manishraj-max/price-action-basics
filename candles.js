// Price Action Basics: drawn candles, interactive widgets and quizzes. Candle = [open, high, low, close].
const colOf=c=>Math.abs(c[3]-c[0])<.6?'var(--muted)':(c[3]>=c[0]?'var(--up)':'var(--down)');
function drawCandles(cs,o={}){
  const w=44,H=o.h||220,pad=14,W=cs.length*w+pad*2;
  const lo=o.lo!=null?o.lo:Math.min(...cs.map(c=>c[2]))-4, top=o.top!=null?o.top:Math.max(...cs.map(c=>c[1]))+4;
  const y=p=>H-pad-(p-lo)/(top-lo)*(H-pad*2);
  const marks=[].concat(o.mark==null?[]:o.mark);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.label||'candles'}">`;
  cs.forEach((c,i)=>{const [op,h,l,cl]=c,x=pad+i*w+w/2,col=colOf(c),pop=(o.pop&&i===cs.length-1)?' class="pop"':'';
    s+=`<g${pop}><line x1="${x}" x2="${x}" y1="${y(h)}" y2="${y(l)}" stroke="${col}" stroke-width="2"/>`;
    s+=`<rect x="${x-10}" y="${Math.min(y(op),y(cl))}" width="20" height="${Math.max(2,Math.abs(y(op)-y(cl)))}" fill="${col}" rx="1"/></g>`;
    if(marks.includes(i))s+=`<rect x="${x-17}" y="4" width="34" height="${H-8}" fill="none" stroke="var(--accent)" stroke-dasharray="4 3" rx="6"/>`;});
  return s+'</svg>';
}
const parse=t=>t.split(';').map(s=>s.split(',').map(Number));
document.querySelectorAll('[data-candles]').forEach(el=>{
  el.innerHTML=drawCandles(parse(el.dataset.candles),{mark:el.dataset.mark!=null?+el.dataset.mark:null,label:el.dataset.label});
});

// ---- Widget 1: candle builder ----
document.querySelectorAll('[data-widget="builder"]').forEach(el=>{
  const names=['Open','High','Low','Close'],v=[40,70,30,60];
  el.innerHTML=`<div class="fig"></div><div class="ctl">${names.map((n,i)=>`<label>${n} <output></output><input type="range" min="5" max="95" value="${v[i]}" data-i="${i}"></label>`).join('')}</div><p class="readout" aria-live="polite"></p>`;
  const fig=el.querySelector('.fig'),ro=el.querySelector('.readout'),ins=[...el.querySelectorAll('input')];
  function upd(){
    let [o,h,l,c]=ins.map(i=>+i.value);
    ins.forEach(i=>i.previousElementSibling.textContent=i.value);
    const H=Math.max(h,o,c),L=Math.min(l,o,c);
    fig.innerHTML=drawCandles([[o,H,L,c]],{lo:0,top:100,h:240,label:'Your candle'});
    const body=Math.abs(c-o),up=H-Math.max(o,c),low=Math.min(o,c)-L;
    let t=body<1?'<strong>Doji:</strong> open and close are almost equal, so neither side won. Indecision.':
      c>o?'<strong>Bullish:</strong> it closed above where it opened, so buyers won this period.':
      '<strong>Bearish:</strong> it closed below where it opened, so sellers won this period.';
    if(body>=1&&low>=2*body&&up<=body)t+=' Long lower wick with a small upper one: a <strong>hammer shape</strong>. What it means depends on the trend before it.';
    else if(body>=1&&up>=2*body&&low<=body)t+=' Long upper wick with a small lower one: an <strong>inverted hammer shape</strong>. Again, the trend before it matters.';
    else if(body>=45)t+=' A big body: one side was clearly in charge.';
    ro.innerHTML=t+`<br><span class="muted">Body ${body} · upper wick ${up} · lower wick ${low}</span>`;
  }
  ins.forEach(i=>i.oninput=upd);upd();
});

// ---- Widget 2: time-lapse of one candle forming ----
document.querySelectorAll('[data-widget="timelapse"]').forEach(el=>{
  const path=[50,54,58,52,46,41,47,55,60,57];
  el.innerHTML=`<div class="fig"></div><p class="readout" aria-live="polite"></p><button class="btn">▶ Play the 5 minutes</button>`;
  const fig=el.querySelector('.fig'),ro=el.querySelector('.readout'),btn=el.querySelector('button');let timer=null;
  function draw(n){
    const p=path.slice(0,n+1),o=path[0],cl=p[n],h=Math.max(...p),l=Math.min(...p),H=240,W=380,pad=16,lo=36,top=64;
    const y=q=>H-pad-(q-lo)/(top-lo)*(H-pad*2),x=i=>30+i*(220/(path.length-1)),cx=320,col=colOf([o,h,l,cl]);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="One candle forming from price moves">`;
    s+=`<line x1="20" x2="360" y1="${y(o)}" y2="${y(o)}" stroke="var(--muted)" stroke-dasharray="3 4"/><text x="22" y="${y(o)-5}" font-size="11" fill="var(--muted)">open ${o}</text>`;
    s+=`<polyline fill="none" stroke="var(--accent)" stroke-width="2" points="${p.map((q,i)=>x(i)+','+y(q)).join(' ')}"/><circle cx="${x(n)}" cy="${y(cl)}" r="4" fill="var(--accent)"/>`;
    s+=`<line x1="${cx}" x2="${cx}" y1="${y(h)}" y2="${y(l)}" stroke="${col}" stroke-width="2"/><rect x="${cx-12}" y="${Math.min(y(o),y(cl))}" width="24" height="${Math.max(2,Math.abs(y(o)-y(cl)))}" fill="${col}" rx="1"/></svg>`;
    fig.innerHTML=s;
    ro.innerHTML=`Open <strong>${o}</strong> · High <strong>${h}</strong> · Low <strong>${l}</strong> · Now <strong>${cl}</strong>`+(n===path.length-1?`<br>The period ends. It closed above the open, so this candle is <strong>bullish</strong>. The low shows sellers pushed down to ${l}, then buyers took it back up.`:'');
  }
  draw(0);
  btn.onclick=()=>{clearInterval(timer);let n=0;draw(0);btn.textContent='↺ Replay';timer=setInterval(()=>{n++;draw(n);if(n>=path.length-1)clearInterval(timer);},550);};
});

// ---- Widget 3: same candle, different trend + confirmation ----
document.querySelectorAll('[data-widget="trend"]').forEach(el=>{
  const S={fall:{base:[[80,82,72,74],[74,76,66,68],[68,70,60,62],[62,64,54,56],[53,55,38,51]],nxt:{green:[52,64,51,62],red:[50,51,34,36]},name:'hammer',lo:28,top:88,
      msg:{none:'After a fall, a small body with a long lower wick shows sellers pushed hard, then buyers pushed back. This is a <strong>hammer</strong>: a hint that buyers are stepping in. Now reveal the next candle.',green:'<strong>Confirmed.</strong> The next candle is green and agrees with the hint: buyers are following through.',red:'<strong>Not confirmed.</strong> The next candle is red and closes below the hammer\'s low. The hint failed, which is why we wait for the next candle.'}},
    rise:{base:[[40,48,38,46],[46,54,44,52],[52,60,50,58],[58,66,56,64],[64,66,48,62]],nxt:{green:[62,74,61,72],red:[61,62,50,52]},name:'hanging man',lo:30,top:80,
      msg:{none:'Same shape, but after a rise. This is a <strong>hanging man</strong>: a hint that sellers may be appearing near a top. Now reveal the next candle.',red:'<strong>Confirmed.</strong> The next candle is red and agrees with the hint: sellers are following through.',green:'<strong>Not confirmed.</strong> The next candle is green and the rise continues. The hint was weaker than it looked.'}}};
  let trend='fall',next=null;
  el.innerHTML=`<div class="ctl row"><button class="btn tr" data-t="fall">After a fall</button><button class="btn tr" data-t="rise">After a rise</button></div><div class="fig"></div><p class="readout" aria-live="polite"></p><div class="ctl row"><span class="muted">Next candle:</span><button class="btn nx" data-n="green">Green</button><button class="btn nx" data-n="red">Red</button></div>`;
  const fig=el.querySelector('.fig'),ro=el.querySelector('.readout');
  function render(pop){const s=S[trend];let cs=s.base.slice();if(next)cs.push(s.nxt[next]);
    fig.innerHTML=drawCandles(cs,{lo:s.lo,top:s.top,mark:4,pop,label:'The same candle after a '+trend});
    ro.innerHTML=s.msg[next||'none'];
    el.querySelectorAll('.tr').forEach(b=>b.classList.toggle('on',b.dataset.t===trend));
    el.querySelectorAll('.nx').forEach(b=>b.classList.toggle('on',b.dataset.n===next));}
  el.querySelectorAll('.tr').forEach(b=>b.onclick=()=>{trend=b.dataset.t;next=null;render(false);});
  el.querySelectorAll('.nx').forEach(b=>b.onclick=()=>{next=b.dataset.n;render(true);});
  render(false);
});

// ---- Widget 4: spot the pattern ----
document.querySelectorAll('[data-widget="spotter"]').forEach(el=>{
  const rise=[[40,48,38,46],[46,54,44,52],[52,60,50,58],[58,66,56,64]],fall=[[70,72,62,64],[64,66,56,58],[58,59,52,54]];
  const R=[
    {a:'Hammer',cs:[[80,82,72,74],[74,76,66,68],[68,70,60,62],[62,64,54,56],[53,55,38,51]],why:'Small body, long lower wick, after a fall: buyers stepping in.'},
    {a:'Hanging man',cs:[...rise,[64,66,48,62]],why:'The hammer shape again, but after a rise: a possible top.'},
    {a:'Bullish engulfing',cs:[...fall,[52,66,50,64]],why:'A big green body covers the red one before it, after a fall.'},
    {a:'Bearish engulfing',cs:[[40,48,38,46],[46,54,44,52],[52,58,51,56],[58,59,49,50]],why:'A big red body covers the green one before it, after a rise.'},
    {a:'Shooting star',cs:[...rise,[65,78,63,64]],why:'Small body, long upper wick, after a rise: buyers pushed up and were rejected.'},
    {a:'Morning star',cs:[[78,80,68,70],[70,72,60,62],[58,59,50,52],[45,47,42,44],[45,60,44,58]],why:'Big red, small indecision candle, then a big green: a possible turn up.'}];
  const names=R.map(r=>r.a);let order,i,score;
  const shuffle=a=>{a=a.slice();for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]];}return a;};
  function start(){order=shuffle(R);i=0;score=0;show();}
  function show(){
    if(i>=order.length){el.innerHTML=`<p class="readout"><strong>You got ${score} of ${order.length}.</strong> ${score>=5?'Strong start.':'Read the table in section 5 once more, then try again.'}</p><button class="btn">Play again</button>`;el.querySelector('button').onclick=start;return;}
    const r=order[i],opts=shuffle([r.a,...shuffle(names.filter(n=>n!==r.a)).slice(0,3)]);
    el.innerHTML=`<p class="muted">Round ${i+1} of ${order.length} · score ${score}</p><div class="fig">${drawCandles(r.cs,{mark:r.cs.length-1,label:'Which pattern is in the dashed box?'})}</div><p><strong>Which pattern is in the dashed box?</strong></p><div class="opts">${opts.map(o=>`<button class="btn">${o}</button>`).join('')}</div><p class="readout" aria-live="polite"></p>`;
    el.querySelectorAll('.opts button').forEach(b=>b.onclick=()=>{
      el.querySelectorAll('.opts button').forEach(x=>{x.disabled=true;if(x.textContent===r.a)x.classList.add('right');});
      const ok=b.textContent===r.a;if(ok)score++;else b.classList.add('wrong');
      el.querySelector('.readout').innerHTML=(ok?'<strong>Correct.</strong> ':'<strong>Not quite.</strong> ')+r.why+'<br><button class="btn nxt">'+(i+1<order.length?'Next round →':'See score')+'</button>';
      el.querySelector('.nxt').onclick=()=>{i++;show();};});
  }
  start();
});

// ---- Quizzes ----
document.querySelectorAll('.q').forEach(q=>{
  const ans=+q.dataset.answer;
  q.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{
    if(q.classList.contains('done'))return;
    q.classList.add('done');b.classList.add(i===ans?'right':'wrong');
    q.querySelectorAll('button')[ans].classList.add('right');});
});
