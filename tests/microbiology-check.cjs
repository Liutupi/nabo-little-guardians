const assert=require('assert'),M=require('../dist/microbiology.js'),levels=require('../dist/levels.js');
M.applyLevels(levels);
assert.equal(Object.keys(M.pathogens).length,10);assert.equal(Object.keys(M.drugs).length,10);
for(const [id,p]of Object.entries(M.pathogens)){
 assert(M.matches(id,p.best),`${id}: best match missing`);
 for(const d of Object.keys(M.drugs))if(id==='virus')assert.equal(M.matches(id,d),d==='immune');
 assert(p.hp>=1&&p.hp<=4);assert(p.tier>=1&&p.tier<=5);
}
for(const d of ['penicillin','cefazolin','ceftriaxone','cefepime','vancomycin','meropenem'])assert(!M.matches('myco',d),'No cell wall target in Mycoplasma');
assert(M.matches('myco','azithro'));assert(M.matches('chlamydia','doxy'));
assert(!M.matches('pseudomonas','ceftriaxone'));assert(M.matches('pseudomonas','cefepime'));
assert.equal(M.result('mrsa','cefazolin'),'R');assert(M.matches('staph','cefazolin'));assert(M.matches('mrsa','vancomycin'));
assert.equal(M.result('esbl','ceftriaxone'),'R');assert(M.matches('esbl','meropenem'));
assert.equal(M.result('kpc','meropenem'),'R');assert(M.matches('kpc','cza'));
assert.equal(M.result('chlamydia','ceftriaxone'),'?','Unmodeled combinations must not be fabricated resistance');
const encountered=new Set();for(const l of levels){for(const e of l.enemies){encountered.add(e.pathogen);assert(M.pathogens[e.pathogen]);assert(M.drugs[M.pathogens[e.pathogen].best].rank<=l.rank,'A level must unlock its matching equipment');}assert(l.ammo>=4);}
assert.equal(encountered.size,10,'All ten species must appear in playable levels');
console.log('Ten pathogen profiles, ten supplies, spectrum boundaries, stage unlocks and full encounter coverage: passed.');
