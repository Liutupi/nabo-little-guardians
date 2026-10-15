/* Each chapter introduces a different structural or timing problem.
   Buildings are stacked "rooms" (two columns + a slab) so a single good
   hit can bring several floors down onto the pathogens living inside. */
(function(root){
  const FLOOR=480;
  const B=(x,y,w,h,material='wood')=>({x,y,w,h,material});
  // One room standing on `base`; the pathogen (radius 25) rests on the room floor.
  function room(x,base,o={}){const w=o.w||124,h=o.h||70,m=o.m||'wood',slab=o.slab||m,col=o.col||16,t=o.t||14;
    return{blocks:[B(x-w/2+col/2,base-h/2,col,h,m),B(x+w/2-col/2,base-h/2,col,h,m),B(x,base-h-t/2,w+10,t,slab)],top:base-h-t,enemy:{x,y:base-26}};}
  // Small stacked crates make roofs topple and rain down.
  function crates(x,base,n=3,s=24,m='wood'){const out=[];for(let row=0;row<n;row++)for(let i=0;i<n-row;i++)out.push(B(x+(i-(n-row-1)/2)*(s+1),base-s/2-row*s,s,s,m));return out;}
  // floors: bottom → top. roof: 'enemy' | 'crates' | 'glass-crates' | 'charge' | undefined
  function building(x,floors,roof,base=FLOOR){const blocks=[],enemies=[],mechanisms=[];let y=base;
    for(const f of floors){const r=room(x,y,f);blocks.push(...r.blocks);if(f.enemy)enemies.push(r.enemy);y=r.top;}
    if(roof==='enemy'){enemies.push({x,y:y-26});blocks.push(B(x-44,y-14,12,28,'glass'),B(x+44,y-14,12,28,'glass'));}
    else if(roof==='crates')blocks.push(...crates(x,y,3));
    else if(roof==='glass-crates')blocks.push(...crates(x,y,3,24,'glass'));
    else if(roof==='charge')mechanisms.push({type:'charge',x,y:y-18,w:35,h:35});
    return{blocks,enemies,mechanisms,top:y};}
  // A static shelf with a little glass hut on top.
  function shelf(x,y,w=96,m='glass'){const r=room(x,y-8.5,{w:w-12,h:60,m});return{platforms:[{x,y,w,h:17}],blocks:r.blocks,enemies:[r.enemy]};}
  const hut=(x,m='wood',w=96)=>{const r=room(x,FLOOR,{w,h:62,m});return{blocks:r.blocks,enemies:[r.enemy]};};
  const dominoes=(x0,n,gap=44,h=92,m='wood')=>({blocks:Array.from({length:n},(_,i)=>B(x0+i*gap,FLOOR-h/2,14,h,m))});
  const charge=(x,y=FLOOR-18)=>({mechanisms:[{type:'charge',x,y,w:35,h:35}]});
  const merge=(...parts)=>({blocks:parts.flatMap(p=>p.blocks||[]),enemies:parts.flatMap(p=>p.enemies||[]),platforms:parts.flatMap(p=>p.platforms||[]),mechanisms:parts.flatMap(p=>p.mechanisms||[])});
  const bridge=(x,y,w,m='glass')=>({blocks:[B(x,y-7,w,14,m)],enemies:[{x,y:y-14-26}]});

  const L2A=building(860,[{w:120,enemy:true},{w:120,h:66,m:'glass',enemy:true}]);
  const L4A=building(870,[{m:'steel',enemy:true},{w:118,h:66,m:'glass',enemy:true},{w:110,h:60}]);

  root.NABO_LEVELS=[
    {title:'诊所花园',subtitle:'观察支点 · 学会第一发连锁',place:'薄荷小镇 · 入门任务',theme:'garden',icon:'❋',ammo:4,type:'antibiotic',difficulty:1,objective:'推倒多米诺，清除 3 个目标',tip:'打中第一块木牌，看它一路推倒整排，砸进小楼。',note:'抗生素只针对细菌，对病毒不起作用。',lesson:'找准支点，比用力更重要。',
      ...merge(dominoes(790,4),building(1045,[{w:130,enemy:true},{w:120,h:66}],'enemy'),hut(1200,'glass'),{blocks:crates(1200,FLOOR-76,2)})},
    {title:'洗手台行动',subtitle:'连锁谜题 · 击穿两段玻璃桥',place:'泡泡清洁站 · 玻璃与泡泡补给箱',theme:'water',icon:'◌',ammo:5,type:'antibiotic',difficulty:2,objective:'引爆泡泡箱，连锁清除 5 个目标',tip:'玻璃桥一碎，桥上的目标就会砸进下面的泡泡箱。',note:'认真洗手能帮助减少病原体传播。',lesson:'看清连锁，才是小小策略家。',
      ...merge(L2A,building(1090,[{w:120,enemy:true},{w:120,h:66,m:'glass',enemy:true}]),bridge(975,L2A.top,250),charge(975),{blocks:crates(1210,FLOOR,3,24,'glass')})},
    {title:'呼吸道巡逻',subtitle:'高低两路 · 反弹板上的病毒',place:'呼吸云岛 · 弧线与反弹',theme:'cloud',icon:'◇',ammo:5,type:'immune',difficulty:2,objective:'利用反弹板，清除高低 4 个病毒',tip:'蓝色斜板能把弹药弹向高处。打塌玻璃塔，碎片会继续砸下去。',note:'抗生素不能治疗病毒感染；本关免疫护盾为幻想机制。',lesson:'一条路走不通，就试试另一条。',
      ...merge(shelf(960,333,130),building(1095,[{w:120,h:68,m:'glass',enemy:true},{w:110,h:62,m:'glass'}],'glass-crates'),hut(856,'glass'),hut(1225,'wood'),{mechanisms:[{type:'spring',x:710,y:450,w:112,h:16,angle:-.32}]})},
    {title:'培养皿迷宫',subtitle:'结构挑战 · 双塔与承重桥',place:'微观实验室 · 多层承重结构',theme:'lab',icon:'⌘',ammo:6,type:'antibiotic',difficulty:3,objective:'拆解双塔，清除 6 个目标',tip:'钢柱不容易打碎。打碎中间的玻璃层，上面整层就会塌下来。',note:'医生会结合感染部位与病原检查等信息判断治疗方案。',lesson:'复杂的问题，也藏着一个小小的突破口。',
      ...merge(L4A,building(1100,[{m:'steel',enemy:true},{w:118,h:66,m:'glass',enemy:true},{w:110,h:60}]),bridge(985,L4A.top,240),charge(1137,L4A.top-18),hut(1225,'glass'))},
    {title:'耐药堡垒',subtitle:'机关顺序 · 先关护盾，再破堡垒',place:'琥珀峡谷 · 护盾发生器在线',theme:'sunset',icon:'⬡',ammo:6,type:'antibiotic',difficulty:3,objective:'击中橙色机关，再清除 5 个装甲目标',tip:'先瞄准左侧橙色按钮关闭护盾。屋顶的箱子塌下来，也能砸裂重甲。',note:'耐药性属于病原体。按医嘱使用抗生素，避免不必要的使用。',lesson:'顺序对了，困难就有了答案。',
      ...merge(building(880,[{m:'steel',enemy:true},{w:116,h:64,enemy:true}],'crates'),building(1130,[{w:120,enemy:true},{w:110,h:62,m:'glass'}],'enemy'),shelf(1005,286,92),charge(970),{mechanisms:[{type:'switch',x:715,y:437}]}),shielded:true},
    {title:'ICU 静夜',subtitle:'时机挑战 · 穿过升降闸门',place:'星光守护站 · 等一个合适的窗口',theme:'night',icon:'☾',ammo:7,type:'immune',difficulty:4,objective:'穿过移动障碍，清除 6 个病毒',tip:'观察升降门的节奏。左塔楼顶的泡泡箱掉下来会爆炸。',note:'团队协作、细致观察与耐心，在医院里都很重要。',lesson:'有时最好的行动，是等准那个时机。',
      ...merge(building(900,[{w:120,m:'glass',enemy:true},{w:112,h:64,m:'glass',enemy:true}],'charge'),building(1140,[{w:120,enemy:true},{w:112,h:64,m:'glass',enemy:true}],'enemy'),shelf(1020,281,96),{mechanisms:[{type:'gate',x:767,y:357,w:22,h:160,amplitude:83,period:4.2}]})},
    {title:'CRRT 净化站',subtitle:'路线规划 · 反弹、机关与高台',place:'蓝色净化站 · 精准配合',theme:'water',icon:'≈',ammo:7,type:'antibiotic',difficulty:4,objective:'解除护盾，再规划高低两条攻击线',tip:'用低弧线先开机关，再用反弹板或高抛突破高台；冲刺适合穿透玻璃。',note:'CRRT 只提供本关的视觉灵感，弹射机制不代表其临床作用。',lesson:'把观察、顺序和时机，一起装进计划。',
      ...merge(building(920,[{m:'steel',enemy:true},{w:116,h:64,m:'glass',enemy:true}],'charge'),shelf(1045,300,96,'wood'),building(1170,[{w:116,m:'glass',enemy:true},{w:110,h:62,enemy:true}],'glass-crates'),{mechanisms:[{type:'switch',x:680,y:429},{type:'spring',x:772,y:452,w:105,h:16,angle:-.38}]}),shielded:true},
    {title:'全家总动员',subtitle:'终章挑战 · 闯进联合堡垒',place:'家庭守护日 · 联合堡垒与病毒大王',theme:'sunset',icon:'♡',ammo:9,type:'antibiotic',difficulty:5,objective:'关闭护盾、穿过闸门，击败联合堡垒',tip:'先开左侧机关，再切换补给。楼顶泡泡箱和中间泡泡箱都能引发大崩塌。',note:'把陪伴变成冒险。最强的超能力，叫做我们。',lesson:'有计划、有耐心，还有彼此。今天全家都是英雄。',
      ...merge(building(880,[{m:'steel',enemy:true},{w:116,h:64,m:'glass',enemy:true},{w:108,h:60}],'charge'),building(1130,[{enemy:true},{w:116,h:64,m:'glass',enemy:true},{w:108,h:60,m:'glass'}],'enemy'),shelf(1005,283,92),charge(970),{mechanisms:[{type:'switch',x:660,y:438},{type:'gate',x:752,y:357,w:22,h:155,amplitude:80,period:4.8}]}),shielded:true}
  ];
  if(typeof module!=='undefined')module.exports=root.NABO_LEVELS;
})(typeof window!=='undefined'?window:globalThis);
