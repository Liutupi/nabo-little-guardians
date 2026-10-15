/* Bigger buildings must start clean: no overlapping bodies, unchanged enemy
   counts (objectives and simulated-isolate order depend on them), and every
   block must stand still for 10 seconds before the first shot. */
const assert=require('assert');
const {game}=require('./game-harness.cjs');
const levels=require('../dist/levels.js');
const counts=[3,5,4,6,5,6,5,6];
const FLOOR=480;
const box=(x,y,w,h,label)=>({l:x-w/2,r:x+w/2,t:y-h/2,b:y+h/2,label});
const overlap=(a,b)=>Math.min(a.r,b.r)-Math.max(a.l,b.l)>1&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>1;
levels.forEach((level,i)=>{
  assert.equal(level.enemies.length,counts[i],`Level ${i+1} must keep ${counts[i]} targets`);
  assert(level.blocks.length>=30,`Level ${i+1} should have a real structure to demolish`);
  const bodies=[...level.blocks.map((b,k)=>box(b.x,b.y,b.w,b.h,'block'+k)),...level.enemies.map((e,k)=>box(e.x,e.y,48,48,'enemy'+k)),...(level.mechanisms||[]).filter(m=>m.type==='charge').map((m,k)=>box(m.x,m.y,m.w,m.h,'charge'+k))];
  const statics=(level.platforms||[]).flatMap(p=>[box(p.x,p.y,p.w,p.h,'shelf'),box(p.x,(FLOOR+p.y)/2,23,FLOOR-p.y,'column')]);
  for(const b of bodies){assert(b.b<=FLOOR+.5,`Level ${i+1} ${b.label} sinks into the floor`);assert(b.r<1700&&b.t>-150,`Level ${i+1} ${b.label} is off screen`);for(const s of statics)assert(!overlap(b,s),`Level ${i+1} ${b.label} overlaps ${s.label}`);}
  for(let a=0;a<bodies.length;a++)for(let c=a+1;c<bodies.length;c++)assert(!overlap(bodies[a],bodies[c]),`Level ${i+1}: ${bodies[a].label} overlaps ${bodies[c].label}`);
});
const settle=[];
for(let i=0;i<levels.length;i++){
  const g=game();g.choose(i);const before=g.state(),blocks0=g.blocks();g.step(600);const after=g.state(),blocks1=new Map(g.blocks().map(b=>[b.id,b]));
  for(const b of blocks0){const n=blocks1.get(b.id);assert(n,`Level ${i+1}: a ${b.m} block broke while idle`);const d=Math.hypot(n.x-b.x,n.y-b.y)+Math.abs(n.a-b.a)*40;assert(d<8,`Level ${i+1}: ${b.m} ${b.w}x${b.h} at (${Math.round(b.x)},${Math.round(b.y)}) moved ${d.toFixed(1)} while idle`);}
  assert.equal(after.remaining,before.remaining,`Level ${i+1} lost a target before any shot`);
  const drift=Math.max(...after.targets.map((t,k)=>Math.hypot(t.x-before.targets[k].x,t.y-before.targets[k].y)));
  settle.push({level:i+1,blocks:levels[i].blocks.length,drift:+drift.toFixed(2)});
  assert(drift<6,`Level ${i+1} structure is unstable (target drifted ${drift.toFixed(1)}px)`);
}
console.log('Structures (blocks / idle target drift):',JSON.stringify(settle));
console.log('Clean layout, unchanged targets and self-standing buildings: passed.');
