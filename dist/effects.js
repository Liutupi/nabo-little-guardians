/* Bounded, fixed-time toy VFX. All reactions are cosmetic; physics keeps its 120 Hz step. */
(() => {
  class NaboEffects {
    constructor(){this.reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;this.reset();}
    reset(){this.bits=[];this.waves=[];this.streaks=[];this.flashes=[];this.clock=0;this.armorEvents=0;}
    cap(){this.bits=this.bits.slice(-360);this.waves=this.waves.slice(-28);this.streaks=this.streaks.slice(-12);this.flashes=this.flashes.slice(-12);}
    burst(x,y,color,mode='hit'){
      const n=this.reduced?4:mode==='boss'?38:mode==='resist'?14:mode==='muzzle'?12:20;
      for(let i=0;i<n;i++){const a=Math.PI*2*i/n+Math.random()*.2,s=(mode==='boss'?155:mode==='muzzle'?35:75)+Math.random()*155;this.bits.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-45,age:0,life:.45+Math.random()*.5,size:2+Math.random()*4,color,shape:mode==='resist'?'shard':i%3===0?'star':'spark',rotation:a,spin:(Math.random()-.5)*8});}
      this.waves.push({x,y,color,age:0,life:mode==='boss'?.8:.5,max:mode==='boss'?125:mode==='resist'?45:mode==='muzzle'?28:65,mode});this.cap();
    }
    impact(x,y,color,kill=false){this.flashes.push({x,y,color,age:0,life:this.reduced?.16:.25,max:kill?96:75,mode:'hit'});this.waves.push({x,y,color,age:0,life:.55,max:kill?105:77,mode:'impact'});this.cap();}
    armorBreak(x,y,color,boss=false){
      this.armorEvents++;this.flashes.push({x,y,color,age:0,life:this.reduced?.18:.34,max:boss?156:132,mode:'armor'});
      this.waves.push({x,y,color:'#ffe6a2',age:0,life:.85,max:boss?170:140,mode:'armor'});this.waves.push({x,y,color,age:-.1,life:.7,max:boss?145:120,mode:'armor'});
      const n=this.reduced?5:boss?16:12;
      for(let i=0;i<n;i++){const a=i*Math.PI*2/n+.3,s=145+Math.random()*210;this.bits.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-100,age:0,life:.7+Math.random()*.45,size:6+Math.random()*9,color,shape:'plate',rotation:a,spin:(Math.random()-.5)*12});}
      for(let i=0;i<(this.reduced?4:14);i++)this.bits.push({x:x+(Math.random()-.5)*55,y:y+(Math.random()-.5)*40,vx:(Math.random()-.5)*110,vy:-25-Math.random()*70,age:0,life:.5+Math.random()*.4,size:8+Math.random()*10,color:'#fff0c8',shape:'puff',rotation:0,spin:0});
      this.burst(x,y,'#ffe6a2','boss');this.cap();
    }
    pulse(x,y,r,color){this.waves.push({x,y,color,age:0,life:.7,max:r,mode:'pulse'});this.cap();}
    dash(x,y,color){this.streaks.push({x,y,color,age:0,life:.38});this.burst(x,y,color,'hit');}
    trail(x,y,vx,vy,color){if(this.reduced)return;this.bits.push({x,y,vx:-vx*2+(Math.random()-.5)*12,vy:-vy*2,age:0,life:.24+Math.random()*.15,size:1.5+Math.random()*2.5,color,shape:'spark',rotation:0,spin:0});if(this.bits.length>360)this.bits.shift();}
    update(dt){const s=dt/1000;this.clock+=s;for(const p of this.bits){p.age+=s;p.x+=p.vx*s;p.y+=p.vy*s;p.vx*=Math.exp(-s*(p.shape==='plate'?1.5:3));p.vy+=s*(p.shape==='plate'?420:100);p.rotation+=p.spin*s;}this.bits=this.bits.filter(p=>p.age<p.life);for(const e of [...this.waves,...this.streaks,...this.flashes])e.age+=s;this.waves=this.waves.filter(e=>e.age<e.life);this.streaks=this.streaks.filter(e=>e.age<e.life);this.flashes=this.flashes.filter(e=>e.age<e.life);}
    draw(ctx,trail,color='#99b778'){
      ctx.save();
      if(trail.length>2){ctx.lineCap='round';ctx.lineJoin='round';for(let i=1;i<trail.length;i++){const t=i/trail.length;ctx.globalAlpha=t*.45;ctx.strokeStyle=color;ctx.lineWidth=1+t*10;ctx.beginPath();ctx.moveTo(trail[i-1].x,trail[i-1].y);ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();}ctx.globalAlpha=.8;ctx.strokeStyle='#fffbea';ctx.lineWidth=2;ctx.beginPath();trail.slice(-8).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
      for(const e of this.waves){if(e.age<0)continue;const t=e.age/e.life,r=8+e.max*(1-(1-t)**3);ctx.globalAlpha=(1-t)*.8;ctx.strokeStyle=e.color;ctx.lineWidth=(1-t)*(e.mode==='armor'?8:4)+1;ctx.beginPath();ctx.ellipse(e.x,e.y,r,r*(e.mode==='pulse'?.55:1),0,0,Math.PI*2);ctx.stroke();if(e.mode!=='resist'){ctx.globalAlpha=(1-t)*.13;ctx.fillStyle=e.color;ctx.fill();}if(e.mode==='boss'||e.mode==='armor'||e.mode==='impact'){for(let i=0;i<10;i++){const a=i*Math.PI/5+this.clock*.2;ctx.beginPath();ctx.moveTo(e.x+Math.cos(a)*r*.8,e.y+Math.sin(a)*r*.8);ctx.lineTo(e.x+Math.cos(a)*r*1.16,e.y+Math.sin(a)*r*1.16);ctx.stroke();}}}
      for(const e of this.flashes){const t=e.age/e.life,alpha=(1-t)**2*(this.reduced?.3:.85),r=(.55+t*.5)*e.max;ctx.globalAlpha=alpha;const glow=ctx.createRadialGradient(e.x,e.y,1,e.x,e.y,r);glow.addColorStop(0,'#fffef1');glow.addColorStop(.22,'#fff5cc');glow.addColorStop(.5,e.color+'99');glow.addColorStop(1,e.color+'00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff9df';ctx.beginPath();const n=e.mode==='armor'?12:8;for(let i=0;i<n*2;i++){const a=i*Math.PI/n,rr=i%2?r*.19:r*(i%4===0?.8:.5);ctx.lineTo(e.x+Math.cos(a)*rr,e.y+Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
      for(const p of this.bits){const t=p.age/p.life;ctx.globalAlpha=(1-t)**.65;ctx.fillStyle=p.color;ctx.strokeStyle='#fff8df';ctx.lineWidth=.8;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);const r=p.size*(1-t*.35);ctx.beginPath();
        if(p.shape==='plate'){ctx.moveTo(-r,-r*.5);ctx.lineTo(r*.35,-r);ctx.lineTo(r,r*.15);ctx.lineTo(r*.3,r);ctx.lineTo(-r*.75,r*.65);ctx.closePath();const g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#fff6d9');g.addColorStop(.4,p.color);g.addColorStop(1,'#5a5569');ctx.fillStyle=g;ctx.shadowColor='#3e42463d';ctx.shadowBlur=3;ctx.shadowOffsetY=2;ctx.fill();ctx.shadowBlur=0;ctx.stroke();ctx.beginPath();ctx.moveTo(-r*.8,-r*.35);ctx.lineTo(r*.2,-r*.75);ctx.lineTo(r*.7,r*.1);ctx.strokeStyle='#fff5dfbb';ctx.lineWidth=2;ctx.stroke();}
        else if(p.shape==='puff'){ctx.globalAlpha*=.28;ctx.arc(0,0,r*(.5+t*1.7),0,Math.PI*2);ctx.fill();}
        else{if(p.shape==='star'){for(let i=0;i<8;i++){const a=i*Math.PI/4,v=i%2?r*.3:r*1.6;ctx.lineTo(Math.cos(a)*v,Math.sin(a)*v);}}else if(p.shape==='shard'){ctx.moveTo(-r,r);ctx.lineTo(r,-r);ctx.lineTo(r*.7,r*.4);}else ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();if(p.shape!=='spark')ctx.stroke();}ctx.restore();
      }
      for(const e of this.streaks){const t=e.age/e.life;ctx.globalAlpha=(1-t)*.7;ctx.strokeStyle=e.color;ctx.lineWidth=3;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(e.x-110-i*7-t*90,e.y-32+i*16);ctx.lineTo(e.x-20+t*70,e.y-32+i*16);ctx.stroke();}}
      ctx.restore();
    }
  }
  window.NaboEffects=NaboEffects;
})();
