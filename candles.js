// Draws candle figures from data-candles="open,high,low,close;..." (prices 0-100). Also runs the quizzes.
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
document.querySelectorAll('[data-candles]').forEach(el=>{
  const cs=el.dataset.candles.split(';').map(s=>s.split(',').map(Number));
  const hi=el.dataset.hi?+el.dataset.hi:null, w=44, H=220, pad=14, W=cs.length*w+pad*2;
  const lo=Math.min(...cs.map(c=>c[2]))-4, top=Math.max(...cs.map(c=>c[1]))+4;
  const y=p=>H-pad-(p-lo)/(top-lo)*(H-pad*2);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${el.dataset.label||'candles'}">`;
  cs.forEach((c,i)=>{const [o,h,l,cl]=c,x=pad+i*w+w/2,up=cl>=o,col=(Math.abs(cl-o)<.6)?'var(--muted)':(up?'var(--up)':'var(--down)');
    s+=`<line x1="${x}" x2="${x}" y1="${y(h)}" y2="${y(l)}" stroke="${col}" stroke-width="2"/>`;
    s+=`<rect x="${x-10}" y="${Math.min(y(o),y(cl))}" width="20" height="${Math.max(2,Math.abs(y(o)-y(cl)))}" fill="${col}" rx="1"/>`;
    if(+el.dataset.mark===i)s+=`<rect x="${x-17}" y="4" width="34" height="${H-8}" fill="none" stroke="var(--accent)" stroke-dasharray="4 3" rx="6"/>`;});
  el.innerHTML=s+'</svg>';
});
document.querySelectorAll('.q').forEach(q=>{
  const ans=+q.dataset.answer;
  q.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{
    if(q.classList.contains('done'))return;
    q.classList.add('done');b.classList.add(i===ans?'right':'wrong');
    q.querySelectorAll('button')[ans].classList.add('right');});
});
