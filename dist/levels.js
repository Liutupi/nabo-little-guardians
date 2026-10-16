/* Each chapter introduces a different structural or timing problem.
   The world is drawn at 60% (see game.js), so the field spans x≈0–2130 and
   y≈-320–480; the slingshot stays at x=260 and the forts start far away. Buildings are floors of "bays" (shared columns + one slab per
   bay); pathogens live inside bays, so the right hit brings floors down on them. */
(function(root){
  const FLOOR=480;
  const B=(x,y,w,h,material='wood')=>({x,y,w,h,material});
  // One floor of n bays standing on `base`. bays: array of booleans (pathogen inside?).
  function floor(x,base,o={}){const bays=o.bays||[!!o.enemy],n=bays.length,col=o.col||16,bw=o.bw||((o.w||124)-col),h=o.h||70,m=o.m||'wood',slab=o.slab||m,t=o.t||14;
    const xs=Array.from({length:n+1},(_,i)=>x-n*bw/2+i*bw),blocks=[],enemies=[];
    // Shared inner columns are wider so each bay's slab has a real ledge to rest on.
    xs.forEach((cx,i)=>blocks.push(B(cx,base-h/2,i===0||i===n?col:(o.icol||26),h,m)));
    for(let i=0;i<n;i++){const l=i===0?xs[0]-col/2-5:xs[i],r=i===n-1?xs[n]+col/2+5:xs[i+1];blocks.push(B((l+r)/2,base-h-t/2,r-l,t,slab));if(bays[i])enemies.push({x:(xs[i]+xs[i+1])/2,y:base-26});}
    return{blocks,enemies,top:base-h-t,left:xs[0]-col/2-5,right:xs[n]+col/2+5};}
  // Small stacked crates make roofs topple and rain down.
  function crates(x,base,n=3,s=24,m='wood'){const out=[];for(let row=0;row<n;row++)for(let i=0;i<n-row;i++)out.push(B(x+(i-(n-row-1)/2)*(s+1),base-s/2-row*s,s,s,m));return out;}
  // A staggered brick wall: crumbles into many pieces.
  // Running bond: odd rows sit across the joints and end in half bricks, so nothing overhangs.
  function bricks(x,base,cols=3,rows=4,s=24,m='wood'){const out=[],step=s*2+1,c0=x-(cols-1)/2*step;for(let r=0;r<rows;r++){const y=base-s/2-r*(s+.5);if(r%2===0){for(let i=0;i<cols;i++)out.push(B(c0+i*step,y,s*2,s,m));}else{out.push(B(c0-s/2,y,s-1,s,m));for(let i=0;i<cols-1;i++)out.push(B(c0+(i+.5)*step,y,s*2,s,m));out.push(B(c0+(cols-1)*step+s/2,y,s-1,s,m));}}return out;}
  // floors: bottom → top. roof: 'enemy' | 'crates' | 'glass-crates' | 'charge' | 'bricks' | undefined
  function building(x,floors,roof,base=FLOOR){const blocks=[],enemies=[],mechanisms=[];let y=base,w=124;
    for(const f of floors){const r=floor(x,y,f);blocks.push(...r.blocks);enemies.push(...r.enemies);y=r.top;w=r.right-r.left;}
    const roofs=[].concat(roof||[]);
    for(const kind of roofs){
      if(kind==='enemy'){const off=Math.min(35,w/2-12);enemies.push({x,y:y-26});blocks.push(B(x-off,y-14,12,28,'glass'),B(x+off,y-14,12,28,'glass'));}
      else if(kind==='crates')blocks.push(...crates(x,y,3));
      else if(kind==='glass-crates')blocks.push(...crates(x,y,3,24,'glass'));
      else if(kind==='charge')mechanisms.push({type:'charge',x,y:y-18,w:35,h:35});
      else if(kind==='bricks')blocks.push(...bricks(x,y,Math.max(2,Math.floor(w/50)),2));
      else if(kind==='posts')blocks.push(B(x-w/2+14,y-22,12,44),B(x+w/2-14,y-22,12,44),B(x,y-50,w-12,12,'glass'));
    }
    return{blocks,enemies,mechanisms,top:y};}
  // A static shelf with a little hut on top.
  function shelf(x,y,w=96,m='glass'){const r=floor(x,y-8.5,{w:w-12,h:60,m,enemy:true});return{platforms:[{x,y,w,h:17}],blocks:r.blocks,enemies:r.enemies};}
  const dominoes=(x0,n,gap=44,h=92,m='wood')=>({blocks:Array.from({length:n},(_,i)=>B(x0+i*gap,FLOOR-h/2,14,h,m))});
  const charge=(x,y=FLOOR-18)=>({mechanisms:[{type:'charge',x,y,w:35,h:35}]});
  const wall=(x,cols,rows,m='wood')=>({blocks:bricks(x,FLOOR,cols,rows,24,m)});
  const merge=(...parts)=>({blocks:parts.flatMap(p=>p.blocks||[]),enemies:parts.flatMap(p=>p.enemies||[]),platforms:parts.flatMap(p=>p.platforms||[]),mechanisms:parts.flatMap(p=>p.mechanisms||[])});
  const bridge=(x,y,w,m='glass')=>({blocks:[B(x,y-7,w,14,m)],enemies:[{x,y:y-14-26}]});

  const G='glass',S='steel';
  const L2A=building(1300,[{w:124,m:S},{w:124,h:66,m:G,enemy:true},{w:118,h:62,enemy:true},{w:112,h:58,m:G},{w:106,h:56}]);
  const L4A=building(1320,[{m:S,enemy:true},{w:118,h:66,m:G,enemy:true},{w:112,h:60},{w:106,h:56,m:G},{w:100,h:52}]);

  root.NABO_LEVELS=[
    {title:'诊所花园',subtitle:'观察支点 · 学会第一发连锁',place:'薄荷小镇 · 入门任务',theme:'garden',icon:'❋',ammo:4,type:'antibiotic',difficulty:1,objective:'推倒多米诺，清除 3 个目标',tip:'拉满弓等金光亮起再松手，打中第一块木牌，让整排一路推进三开间小楼。',note:'抗生素只针对细菌，对病毒不起作用。',lesson:'找准支点，比用力更重要。',
      ...merge(dominoes(1100,8),building(1560,[{bays:[true,false,false],bw:84},{bays:[false,false,false],bw:84,h:62,m:G},{bays:[false,false],bw:110,h:58}],'bricks'),wall(1752,2,6),building(1880,[{w:124},{w:118,h:64,m:G,enemy:true},{w:112,h:58},{w:106,h:54,m:G}],['enemy']),building(2035,[{w:96,h:60,m:G},{w:90,h:52}],'crates'))},
    {title:'洗手台行动',subtitle:'连锁谜题 · 击穿两段玻璃桥',place:'泡泡清洁站 · 玻璃与泡泡补给箱',theme:'water',icon:'◌',ammo:6,type:'antibiotic',difficulty:2,objective:'引爆泡泡箱，连锁清除 5 个目标',tip:'先找承重的那一层。长玻璃桥一碎，桥上的目标会砸下去。',note:'认真洗手能帮助减少病原体传播。',lesson:'看清连锁，才是小小策略家。',
      ...merge(wall(1150,2,4,G),L2A,building(1720,[{bays:[true,false],bw:80,m:S},{w:124,h:66,m:G},{w:118,h:62,enemy:true},{w:112,h:58,m:G},{w:106,h:56}]),bridge(1510,L2A.top,432),charge(1720,396-18),building(1950,[{bays:[false,false],bw:80,m:G},{w:150,h:60},{bays:[false,false],bw:64,h:56,m:G},{w:130,h:52}],'glass-crates'))},
    {title:'呼吸道巡逻',subtitle:'高低两路 · 反弹板上的病毒',place:'呼吸云岛 · 弧线与反弹',theme:'cloud',icon:'◇',ammo:6,type:'immune',difficulty:2,objective:'利用反弹板，清除高低 4 个病毒',tip:'蓝色斜板能把弹药弹向高处。六层塔有三层玻璃，打碎它，上面会整段塌下来。',note:'抗生素不能治疗病毒感染；本关免疫护盾为幻想机制。',lesson:'一条路走不通，就试试另一条。',
      ...merge(shelf(1250,280,120),building(1480,[{w:124,m:G},{w:120,h:66,m:G,enemy:true},{w:116,h:62},{w:112,h:60,m:G,enemy:true},{w:106,h:56},{w:100,h:52,m:G}],'glass-crates'),wall(1650,2,7),building(1820,[{w:124,h:66,enemy:true},{w:118,h:60,m:G},{w:112,h:56},{w:106,h:52,m:G}],'crates'),building(1995,[{bays:[false,false],bw:76,m:G},{w:140,h:56}],'bricks'),{mechanisms:[{type:'spring',x:1000,y:450,w:112,h:16,angle:-.32}]})},
    {title:'培养皿迷宫',subtitle:'结构挑战 · 双塔与承重桥',place:'微观实验室 · 多层承重结构',theme:'lab',icon:'⌘',ammo:7,type:'antibiotic',difficulty:3,objective:'拆解双塔，清除 6 个目标',tip:'钢柱不容易打碎。打碎中间的玻璃层，上面整层就会塌下来。',note:'医生会结合感染部位与病原检查等信息判断治疗方案。',lesson:'复杂的问题，也藏着一个小小的突破口。',
      ...merge(wall(1150,2,5,G),L4A,building(1640,[{m:S,enemy:true},{w:118,h:66,m:G,enemy:true},{w:112,h:60},{w:106,h:56,m:G},{w:100,h:52}]),bridge(1480,L4A.top,322),building(1905,[{bays:[false,true],bw:82,m:S},{bays:[false,false],bw:82,h:60,m:G},{w:150,h:56},{w:120,h:52,m:G}],['charge']),wall(2060,1,6))},
    {title:'耐药堡垒',subtitle:'机关顺序 · 先关护盾，再破堡垒',place:'琥珀峡谷 · 护盾发生器在线',theme:'sunset',icon:'⬡',ammo:6,type:'antibiotic',difficulty:3,objective:'击中橙色机关，再清除 5 个装甲目标',tip:'先瞄准中间的橙色按钮关闭护盾。三开间大厅的钢架很硬，从上面的木层和玻璃层下手。',note:'耐药性属于病原体。按医嘱使用抗生素，避免不必要的使用。',lesson:'顺序对了，困难就有了答案。',
      ...merge(wall(1180,2,4),building(1440,[{bays:[true,false,true],bw:84,m:S},{bays:[false,true,false],bw:84,h:64},{bays:[false,false],bw:100,h:60,m:G},{w:150,h:56},{w:124,h:52,m:G}],'crates'),building(1790,[{w:124,enemy:true},{w:118,h:62,m:G},{w:112,h:58},{w:106,h:54,m:G},{w:100,h:50}],['enemy']),building(1990,[{w:110,h:60,m:G},{w:104,h:54},{w:98,h:50,m:G}],'charge'),wall(1675,1,5),{mechanisms:[{type:'switch',x:980,y:437}]}),shielded:true},
    {title:'ICU 静夜',subtitle:'时机挑战 · 穿过升降闸门',place:'星光守护站 · 等一个合适的窗口',theme:'night',icon:'☾',ammo:7,type:'immune',difficulty:4,objective:'穿过移动障碍，清除 6 个病毒',tip:'观察升降门的节奏。左塔楼顶的泡泡箱掉下来会爆炸。',note:'团队协作、细致观察与耐心，在医院里都很重要。',lesson:'有时最好的行动，是等准那个时机。',
      ...merge(wall(1150,2,4,G),building(1300,[{w:120,m:G,enemy:true},{w:114,h:64,m:G,enemy:true},{w:108,h:60},{w:104,h:54,m:G},{w:98,h:50}],'charge'),building(1560,[{bays:[true,true],bw:84},{w:150,h:64,m:G},{w:140,h:58},{w:130,h:54,m:G}],['enemy']),wall(1720,2,6,G),shelf(1840,300,100),building(2000,[{w:100,h:58},{w:94,h:52,m:G}],'crates'),{mechanisms:[{type:'gate',x:1000,y:357,w:22,h:160,amplitude:83,period:4.2}]})},
    {title:'CRRT 净化站',subtitle:'路线规划 · 反弹、机关与高台',place:'蓝色净化站 · 精准配合',theme:'water',icon:'≈',ammo:7,type:'antibiotic',difficulty:4,objective:'解除护盾，再规划高低两条攻击线',tip:'用低弧线先开机关，再用反弹板或高抛突破高台；冲刺适合穿透玻璃。',note:'CRRT 只提供本关的视觉灵感，弹射机制不代表其临床作用。',lesson:'把观察、顺序和时机，一起装进计划。',
      ...merge(building(1300,[{m:S,enemy:true},{w:116,h:64,m:G,enemy:true},{w:110,h:58},{w:104,h:54,m:G}],'charge'),shelf(1460,280,100,'wood'),building(1650,[{w:124,m:G,enemy:true},{w:118,h:64},{w:112,h:58,m:G},{w:106,h:54},{w:100,h:50,m:G}],'glass-crates'),building(1885,[{bays:[true,false],bw:82},{w:150,h:56,m:G},{bays:[false,false],bw:64,h:52},{w:120,h:48,m:G}],'bricks'),wall(2050,1,5,G),{mechanisms:[{type:'switch',x:960,y:429},{type:'spring',x:1080,y:452,w:105,h:16,angle:-.38}]}),shielded:true},
    {title:'全家总动员',subtitle:'终章挑战 · 闯进联合堡垒',place:'家庭守护日 · 联合堡垒与病毒大王',theme:'sunset',icon:'♡',ammo:9,type:'antibiotic',difficulty:5,objective:'关闭护盾、穿过闸门，击败联合堡垒',tip:'先开机关，再切换补给。六层主塔最难拆，先用泡泡箱和大厅的倒塌削弱它。',note:'把陪伴变成冒险。最强的超能力，叫做我们。',lesson:'有计划、有耐心，还有彼此。今天全家都是英雄。',
      ...merge(building(1260,[{m:S,enemy:true},{w:116,h:64,m:G,enemy:true},{w:108,h:60},{w:104,h:54,m:G},{w:98,h:50}],'charge'),building(1520,[{bays:[false,true,false],bw:80},{bays:[false,false,false],bw:80,h:60,m:G},{bays:[false,false],bw:100,h:56},{w:150,h:52,m:G}],'bricks'),charge(1440),building(1800,[{w:124,enemy:true},{w:118,h:64,m:G},{w:112,h:62,enemy:true},{w:106,h:58,m:G},{w:100,h:54},{w:96,h:50,m:G}],['enemy']),wall(1935,2,6),building(2050,[{w:96,h:56,m:G},{w:90,h:50}],'crates'),{mechanisms:[{type:'switch',x:940,y:438},{type:'gate',x:1040,y:357,w:22,h:155,amplitude:80,period:4.8}]}),shielded:true}
  ];
  if(typeof module!=='undefined')module.exports=root.NABO_LEVELS;
})(typeof window!=='undefined'?window:globalThis);
