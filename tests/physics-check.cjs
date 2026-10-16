const fs=require('fs'),assert=require('assert');
const {game}=require('./game-harness.cjs');
const results=[];
for(const level of (process.env.NABO_LEVEL?[Number(process.env.NABO_LEVEL)-1]:Array.from({length:8},(_,i)=>i))){
 let closest=null;
 let success=null;
 // Search bounded, human-playable sequences; actual production code handles all physics.
 const presets=[[150,420],[148,440],[140,452],[145,462],[155,430],[135,445],[160,455],[142,470],[152,410],[138,432],[150,475]];
 for(let attempt=0;attempt<90&&!success;attempt++){
  const g=game();g.choose(level);g.hero(attempt%3===0?'orange':attempt%3===1?'blue':'nabo');g.step((attempt%4)*20);const history=[];
  for(let n=0;n<g.state().currentAmmo;n++){
   const s=g.state();if(s.phase==='won'){success={attempt,history,state:s};break;}if(s.phase==='lost')break;
   const options=[...s.targets].sort((a,b)=>attempt%4===0?a.x-b.x:attempt%4===1?a.y-b.y:attempt%4===2?b.x-a.x:b.y-a.y);const target=s.shieldActive?s.mechanisms.find(m=>m.type==='switch'):options[attempt%7===0?n%options.length:0];g.setAmmo(target.best||s.ammo);
   let p;if(s.shieldActive||attempt>4){const vx=17.5+(attempt%5)*1.6;const t=(target.x-260)/vx+1/.205;const vy=(target.y-362-.194444*t*t)/(t-1/.205);p=[260-vx/.205,362-vy/.205];}else p=presets[(attempt+n*3)%presets.length];g.shoot(...p);
   // Activate each hero at a reachable point on its flight.
   let delay=attempt%3===1?18:30+(attempt%4)*3;if(attempt>=5&&attempt%3!==1){delay=0;while(delay<100&&g.state().projectile){const p=g.state().projectile;if(Math.hypot(p.x-target.x,p.y-target.y)<(attempt%3===0?145:110))break;g.step();delay++;}}else g.step(delay);g.skill();g.step(450);history.push({aim:p,delay,ammo:g.state().ammo,remaining:g.state().remaining});
  }
  if(g.state().phase==='won')success={attempt,history,state:g.state()};if(!closest||g.state().remaining<closest.state.remaining)closest={attempt,history,state:g.state()};
 }
 if(!success)console.log('Closest attempt:',JSON.stringify(closest));
 results.push({level:level+1,passed:!!success,shots:success?.state.shots,score:success?.state.score,armorBreaks:success?.state.effects.armorBreaks,attempt:success?.attempt,history:success?.history});
}
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/solutions.json',JSON.stringify(results,null,2));
// Pause must freeze a shot; loading a level must reset transient state.
const g=game();g.choose(0);g.shoot(178,403);g.step(10);g.pause();const a=g.state().projectile;g.step(120);assert.deepStrictEqual(g.state().projectile,a);g.pause();g.step(10);assert.notDeepStrictEqual(g.state().projectile,a);g.choose(2);assert.equal(g.state().shots,0);assert.equal(g.state().phase,'ready');assert.equal(g.state().ammo,'immune');
console.log(JSON.stringify({results:results.map(({history,...r})=>r),pauseAndRestart:true},null,2));assert(results.every(r=>r.passed),'At least one level was not solved within its ammunition budget.');
const motion=game();motion.step(8);assert.equal(motion.state().acting,'load');assert(motion.state().pose>=0&&motion.state().pose<8);motion.step(45);assert(motion.state().pose>=4&&motion.state().pose<8);motion.step(65);assert.equal(motion.state().acting,'idle');motion.shoot(170,418);motion.step(4);assert.equal(motion.state().acting,'release');assert(motion.state().pose>=16&&motion.state().pose<24);let sawHit=false;for(let i=0;i<180;i++){motion.step();if(motion.state().acting==='celebrate'){sawHit=true;assert(motion.state().pose>=24&&motion.state().pose<32);break;}}assert(sawHit,'A hit must trigger a celebration pose.');console.log('Animation pickup, loading, release and hit reactions: passed.');

const gravity=game();gravity.choose(2);gravity.dropSupports();gravity.step(150);console.log('Unsupported target positions:',JSON.stringify(gravity.state().targets));assert(gravity.state().targets.every(t=>t.y>435),'Targets must fall after their supporting blocks disappear.');console.log('Support removal gravity regression: passed.');
