/* Fictional isolates for a physics game. S/R applies only to the displayed isolate. */
(function(root){
  'use strict';
  const drugs={
    penicillin:{name:'青霉素',short:'PEN',family:'青霉素类',rank:1,color:'#66a888',mechanism:'细胞壁靶点',description:'从敏感链球菌开始，学会看清目标。'},
    cefazolin:{name:'头孢唑林',short:'CFZ',family:'第一代头孢',rank:2,color:'#d4ac4e',mechanism:'细胞壁靶点',description:'本次分离株中，MSSA 的匹配补给。'},
    ceftriaxone:{name:'头孢曲松',short:'CRO',family:'第三代头孢',rank:2,color:'#da8c82',mechanism:'细胞壁靶点',description:'留意阴性菌的模拟药敏，不覆盖铜绿假单胞菌。'},
    immune:{name:'免疫护盾',short:'IMM',family:'幻想守护装置',rank:1,color:'#a28ad0',mechanism:'病毒专属游戏机制',description:'专门应对本游戏的病毒，属于幻想装备。'},
    azithro:{name:'阿奇霉素',short:'AZM',family:'大环内酯类',rank:3,color:'#d989b4',mechanism:'蛋白质合成靶点',description:'观察支原体与肺炎衣原体的模拟药敏。'},
    doxy:{name:'多西环素',short:'DOX',family:'四环素类',rank:3,color:'#c7a25d',mechanism:'蛋白质合成靶点',description:'本关非典型病原体的另一种匹配补给。'},
    vancomycin:{name:'万古霉素',short:'VAN',family:'糖肽类',rank:4,color:'#9874bd',mechanism:'细胞壁靶点',description:'观察 MRSA 的报告；无法穿透阴性菌的外膜。'},
    cefepime:{name:'头孢吡肟',short:'FEP',family:'第四代头孢',rank:4,color:'#56b2be',mechanism:'细胞壁靶点',description:'本次铜绿假单胞菌分离株的匹配补给。'},
    meropenem:{name:'美罗培南',short:'MEM',family:'碳青霉烯类',rank:5,color:'#668fc8',mechanism:'细胞壁靶点',description:'应对本次 ESBL 分离株；不能通吃所有耐药菌。'},
    cza:{name:'头孢他啶／阿维巴坦',short:'CZA',family:'β-内酰胺＋酶抑制剂',rank:6,color:'#d08c58',mechanism:'细胞壁＋部分酶抑制',description:'终章 KPC 型 CRE 的模拟匹配，不能套用于 NDM 型。'}
  };
  const pathogens={
    strepto:{name:'敏感链球菌',short:'链球菌',latin:'Streptococcus · 模拟敏感株',group:'革兰阳性菌',gram:'G+',tier:1,hp:1,color:'#90b766',light:'#e0efbb',shape:'chain',trait:'链状小球，低防御，适合练习支点连锁。',s:['penicillin','cefazolin','ceftriaxone','vancomycin','meropenem'],r:[],best:'penicillin'},
    ecoli:{name:'大肠埃希菌',short:'大肠杆菌',latin:'Escherichia coli · 模拟敏感株',group:'革兰阴性菌',gram:'G−',tier:2,hp:2,color:'#d98f8f',light:'#ffe2d0',shape:'rod',trait:'粉色杆状身体；外膜让部分补给难以进入。',s:['ceftriaxone','cefepime','meropenem','cza'],r:['penicillin','vancomycin'],best:'ceftriaxone'},
    staph:{name:'金黄色葡萄球菌',short:'金葡菌 MSSA',latin:'Staphylococcus aureus · MSSA',group:'革兰阳性菌',gram:'G+',tier:2,hp:2,color:'#d9ac45',light:'#fff0ab',shape:'cluster',trait:'金色葡萄簇；本次为甲氧西林敏感的 MSSA。',s:['cefazolin','vancomycin'],r:['penicillin'],best:'cefazolin'},
    virus:{name:'呼吸道小病毒',short:'小病毒',latin:'Fictional respiratory virus',group:'病毒 · 独立类别',gram:'病毒',tier:2,hp:2,color:'#a588c7',light:'#edddff',shape:'virus',trait:'刺突小球。抗生素无效，使用幻想免疫护盾。',s:['immune'],r:[],best:'immune'},
    myco:{name:'肺炎支原体',short:'肺炎支原体',latin:'Mycoplasma pneumoniae · 模拟敏感株',group:'非典型细菌',gram:'无细胞壁',tier:3,hp:2,color:'#df92bd',light:'#ffe3ee',shape:'amoeba',trait:'没有细胞壁，细胞壁靶向补给没有着力点。',s:['azithro','doxy'],r:[],best:'azithro'},
    chlamydia:{name:'肺炎衣原体',short:'肺炎衣原体',latin:'Chlamydia pneumoniae · 模拟敏感株',group:'非典型细菌',gram:'细胞内寄生',tier:3,hp:2,color:'#b3a05d',light:'#f9efb4',shape:'cell',trait:'躲在细胞样泡泡里；本关可用大环内酯或四环素补给。',s:['azithro','doxy'],r:[],best:'doxy'},
    pseudomonas:{name:'铜绿假单胞菌',short:'铜绿假单胞菌',latin:'Pseudomonas aeruginosa · 模拟敏感株',group:'革兰阴性菌',gram:'G−',tier:3,hp:2,color:'#55acac',light:'#c8f2e9',shape:'flagella',trait:'青绿色长鞭毛；头孢曲松不在它的有效范围。',s:['cefepime','meropenem','cza'],r:['penicillin','cefazolin','ceftriaxone','vancomycin'],best:'cefepime'},
    mrsa:{name:'耐甲氧西林金葡菌',short:'MRSA',latin:'Methicillin-resistant S. aureus',group:'耐药革兰阳性菌',gram:'G+',tier:4,hp:3,color:'#9c79b9',light:'#e9c9f3',shape:'cluster',trait:'紫色重甲金葡菌。本次报告对常见 β-内酰胺补给耐受。',s:['vancomycin'],r:['penicillin','cefazolin','ceftriaxone','cefepime','meropenem','cza'],best:'vancomycin'},
    esbl:{name:'产 ESBL 肺炎克雷伯菌',short:'ESBL 克雷伯菌',latin:'Klebsiella pneumoniae · ESBL isolate',group:'耐药革兰阴性菌',gram:'G−',tier:4,hp:3,color:'#698ec6',light:'#d8e6ff',shape:'capsule',trait:'蓝色荚膜重甲；本次模拟报告对头孢曲松耐药。',s:['meropenem','cza'],r:['penicillin','cefazolin','ceftriaxone','cefepime','vancomycin'],best:'meropenem'},
    kpc:{name:'KPC 型超级耐药菌',short:'KPC 型 CRE',latin:'K. pneumoniae · KPC-producing CRE',group:'耐药革兰阴性菌',gram:'KPC · CRE',tier:5,hp:4,color:'#bf7950',light:'#ffe0ae',shape:'boss',trait:'终章双层机械甲。先查明 KPC 机制，再选择模拟匹配补给。',s:['cza'],r:['penicillin','cefazolin','ceftriaxone','cefepime','vancomycin','meropenem'],best:'cza'}
  };
  const stages=[
    {rank:1,ids:['strepto'],default:'penicillin',title:'诊所花园',subtitle:'初识阳性菌 · 小支点，大连锁',objective:'用青霉素补给，清除 3 个敏感链球菌',note:'革兰阳性／阴性是分类，不是强弱等级。Lv 仅表示本游戏威胁。'},
    {rank:2,ids:['ecoli','staph','ecoli','staph','ecoli'],default:'ceftriaxone',title:'洗手台行动',subtitle:'双菌种谜题 · 粉色杆菌与金色葡萄簇',objective:'切换头孢曲松／头孢唑林，拆解玻璃双塔',note:'金葡菌既有 MSSA，也有 MRSA。本关金色 MSSA 与第五关耐药株不同。'},
    {rank:2,ids:['virus'],default:'immune',title:'呼吸道巡逻',subtitle:'病毒独立战线 · 高空反弹挑战',objective:'切换幻想免疫护盾，清除高低 4 个病毒',note:'病毒不是“升级版细菌”；抗生素对病毒无效，免疫护盾为幻想装备。'},
    {rank:3,ids:['myco','chlamydia','myco','chlamydia','myco','chlamydia'],default:'azithro',title:'非典型迷宫',subtitle:'无壁与细胞内 · 支原体／衣原体双塔',objective:'匹配阿奇霉素或多西环素，拆解六目标迷宫',note:'本关是肺炎支原体与肺炎衣原体的模拟敏感株。现实中仍需考虑耐药与感染部位。'},
    {rank:4,ids:['mrsa','staph','mrsa','staph','mrsa'],default:'vancomycin',title:'MRSA 耐药堡垒',subtitle:'重甲觉醒 · 先关护盾，再读药敏',objective:'关闭护盾，用匹配补给突破 MRSA 重甲',note:'耐药性属于病原体。万古霉素也不是对所有菌都有效的“更强一级”。'},
    {rank:4,ids:['pseudomonas','virus','virus','pseudomonas','virus','pseudomonas'],default:'cefepime',title:'ICU 双线守护',subtitle:'铜绿与病毒 · 闸门间的精准切换',objective:'穿越升降门，分别匹配阴性菌和病毒',note:'铜绿假单胞菌与病毒需要不同游戏补给。看颜色、看分类，也要看报告。'},
    {rank:5,ids:['esbl','esbl','ecoli','esbl','ecoli'],default:'meropenem',title:'ESBL 净化站',subtitle:'荚膜重甲 · 碳青霉烯补给解锁',objective:'解除护盾，突破 ESBL 重甲和高台',note:'ESBL 与 CRE 是不同耐药情形。CRRT 是场景灵感，不是抗菌治疗。'},
    {rank:6,ids:['kpc','virus','mrsa','kpc','myco','esbl'],default:'cza',title:'全家 · 超级菌终章',subtitle:'KPC 联合堡垒 · 全补给策略挑战',objective:'查模拟药敏，切换补给击破联合堡垒',note:'终章为 KPC 型 CRE 模拟株；不能将它的匹配规则套用于 NDM 等其他耐药机制。'}
  ];
  function result(id,drug){const p=pathogens[id],d=drugs[drug];if(!p||!d)return'?';if(p.s.includes(drug))return'S';if(id==='virus'||drug==='immune')return'—';if(id==='myco'&&d.mechanism.startsWith('细胞壁'))return'—';if(p.r.includes(drug))return'R';return'?';}
  function applyLevels(levels){levels.forEach((l,i)=>{const s=stages[i];Object.assign(l,s,{type:s.default});l.place=['薄荷小镇 · 敏感链球菌','泡泡清洁站 · 阴性菌与金葡菌','呼吸云岛 · 病毒独立战线','微观实验室 · 非典型细菌','琥珀峡谷 · MRSA 重甲','星光守护站 · 铜绿与病毒','蓝色净化站 · ESBL 模拟株','家庭守护日 · KPC 联合堡垒'][i];l.enemies=l.enemies.map((e,j)=>{const id=s.ids[j%s.ids.length],p=pathogens[id];return{...e,pathogen:id,kind:id==='virus'?'virus':'bacteria',hp:p.hp,armor:p.tier>=4?1:0};});l.ammo=[4,6,5,7,8,8,8,11][i];});return levels;}
  const api={drugs,pathogens,stages,result,matches:(id,drug)=>result(id,drug)==='S',applyLevels,rankNames:['','见习补给','分类补给','非典型专科','重甲专科','耐药专科','终章联合'],boundary:'本报告为虚构分离株的游戏设定；S 为本关匹配，R 为本关耐药，— 为不适用，? 为未建模。不是实际检验报告或用药建议。'};
  root.NABO_MICRO=api;if(root.NABO_LEVELS)applyLevels(root.NABO_LEVELS);if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
