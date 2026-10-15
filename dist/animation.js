/* 32 actual drawings per child. Frames, feet and props share a world coordinate system. */
(() => {
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
  const mix=(a,b,t)=>a+(b-a)*t;
  class Spring{constructor(v){this.value=v;this.velocity=0;}reset(v){this.value=v;this.velocity=0;}update(target,dt,k=180,d=24){this.velocity+=(target-this.value)*k*dt;this.velocity*=Math.exp(-d*dt);this.value+=this.velocity*dt;return this.value;}}
  const sequenceIndex={load:0,pull:1,release:2,celebrate:3};
  class NaboAnimator{
    constructor(){this.images={};this.meta=window.NABO_ATLAS_META||{};for(const name of ['blue','orange','nabo'])for(const action of ['load','pull','release','celebrate']){const im=new Image();im.src=`assets/${name}-${action}.webp`;this.images[`${name}-${action}`]=im;}
      this.hero='blue';this.root=new Spring(174);this.pull=new Spring(0);this.bandX=new Spring(260);this.bandY=new Spring(362);this.reset();}
    reset(type='antibiotic'){this.ballType=type;this.clock=0;this.action='load';this.actionTime=0;this.prevPhase='ready';this.sequence='load';this.frame=0;this.pose=0;this.previous=null;this.transition=1;this.root.reset(174);this.pull.reset(0);this.bandX.reset(260);this.bandY.reset(362);this.band=null;this.reaction=0;this.skillFlash=0;this.ball=null;}
    begin(action){if(this.action===action)return;this.action=action;this.actionTime=0;}
    setHero(hero){this.hero=hero;this.begin('load');this.actionTime=0;}
    setAmmo(type){this.ballType=type;}
    aim(){this.begin('aim');}
    release(origin={x:260,y:362}){this.begin('release');this.bandX.reset(origin.x);this.bandY.reset(origin.y);this.ball=null;}
    hit(){this.reaction=1;this.begin('celebrate');this.actionTime=0;}
    skill(){this.skillFlash=1;}
    update(milliseconds,state){const dt=milliseconds/1000;this.clock+=dt;this.actionTime+=dt;this.transition+=dt;this.reaction=Math.max(0,this.reaction-dt*.9);this.skillFlash=Math.max(0,this.skillFlash-dt*2);this.band={x:this.bandX.update(260,dt,450,13),y:this.bandY.update(362,dt,450,13)};
      if(this.prevPhase==='flying'&&state.phase==='ready'){this.begin('load');this.actionTime=0;}this.prevPhase=state.phase;if(state.drag)this.aim();
      let seq='release',f=7,x=174;const t=this.actionTime;this.ball=null;
      if(this.action==='load'){seq='load';f=clamp(t/.98)*7;x=mix(174,198,ease(t/.85));if(t>1.05)this.begin('settle');}
      else if(this.action==='settle'){seq='release';f=mix(4,7,ease(t/.26));x=mix(198,174,ease(t/.26));if(t>.26)this.begin('idle');}
      else if(this.action==='aim'){const power=state.drag?clamp(Math.hypot(260-state.drag.x,362-state.drag.y)/110):0;this.pull.update(power,dt,260,26);seq='pull';f=this.pull.value*7;x=mix(198,168,this.pull.value);if(!state.drag&&state.phase==='ready')this.begin('idle');}
      else if(this.action==='release'){seq='release';f=clamp(t/.42)*7;x=174;if(t>1.1)this.begin('watch');}
      else if(this.action==='celebrate'){seq='celebrate';f=clamp(t/.7)*7;if(t>1.25&&state.phase!=='won')this.begin(state.phase==='flying'?'watch':'idle');}
      if(state.phase==='won'){seq='celebrate';f=7;this.action='celebrate';}
      if(this.sequence!==seq){this.previous={sequence:this.sequence,frame:this.frame};this.transition=0;}this.sequence=seq;this.frame=clamp(f,0,7);this.pose=sequenceIndex[seq]*8+Math.round(this.frame);this.root.update(x,dt);
      if(this.action==='load'&&t<.98){const primary=this.hero,size=primary==='nabo'?184:primary==='blue'?180:168;const points=[[.76,.79],[.65,.69],[.65,.61],[.68,.51],[.70,.44],[.77,.40],[.86,.34],[.88,.32]];const low=Math.floor(this.frame),high=Math.min(7,low+1),blend=this.frame-low;const a=this.meta[`${primary}-load`]?.anchors||Array(8).fill({x:.5,y:.97});const cell=this.meta[`${primary}-load`];const ratio=cell?cell.width/4/(cell.height/2):1;const hx=mix(points[low][0]-a[low].x,points[high][0]-a[high].x,blend),hy=mix(points[low][1]-a[low].y,points[high][1]-a[high].y,blend);const hand={x:this.root.value+hx*size*ratio,y:480+hy*size};const drop=ease(clamp((this.frame-5.8)/1.2));this.ball={x:mix(hand.x,260,drop),y:mix(hand.y,362,drop)};}
    }
    frameImage(ctx,name,sequence,frame,cx,foot,height,alpha=1){const key=`${name}-${sequence}`,im=this.images[key],m=this.meta[key];if(!im?.complete||!im.naturalWidth||!m)return false;const w=im.naturalWidth/4,h=im.naturalHeight/2,a=m.anchors[frame],width=height*w/h;ctx.save();ctx.globalAlpha*=alpha;ctx.translate(cx,foot);const breath=1+Math.sin(this.clock*2.6)*.003;ctx.scale(1,breath);ctx.drawImage(im,(frame%4)*w,Math.floor(frame/4)*h,w,h,-a.x*width,-a.y*height,width,height);ctx.restore();return true;}
    sequenceImage(ctx,name,sequence,frame,cx,foot,height,alpha=1){const lo=Math.floor(frame),hi=Math.min(7,lo+1),blend=frame-lo;let good=this.frameImage(ctx,name,sequence,lo,cx,foot,height,alpha);if(blend>.001)good=this.frameImage(ctx,name,sequence,hi,cx,foot,height,alpha*blend)||good;return good;}
    draw(ctx,options){const {floor=480,hero=this.hero,images,ellipse,label,names}=options;const primary=hero,secondary=primary==='blue'?'orange':'blue',size=primary==='nabo'?184:primary==='blue'?180:168;const t=this.actionTime;const jump=this.action==='celebrate'&&t>.20&&t<.58?-Math.sin((t-.20)/.38*Math.PI)*21:0;
      ellipse(this.root.value,floor+2,31+jump*.25,5,'#476e4826');ellipse(56,floor+2,23,4,'#476e4819');const cheering=this.reaction>.05;const secondaryFrame=cheering?clamp((1-this.reaction)/.72)*7:7;const secondaryJump=cheering?-Math.sin(clamp((1-this.reaction-.12)/.42)*Math.PI)*12:0;
      const supporters=hero==='nabo'?[{name:'orange',x:35,height:127},{name:'blue',x:103,height:139}]:[{name:secondary,x:54,height:secondary==='blue'?145:135},{name:'nabo',x:405,height:153}];for(const actor of supporters)this.sequenceImage(ctx,actor.name,cheering?'celebrate':'release',secondaryFrame,actor.x,floor+secondaryJump,actor.height,.95);
      const fade=ease(this.transition/.065);if(this.previous&&fade<1)this.sequenceImage(ctx,primary,this.previous.sequence,this.previous.frame,this.root.value,floor+jump,size,1);this.sequenceImage(ctx,primary,this.sequence,this.frame,this.root.value,floor+jump,size,fade);
      const speech=this.action==='load'?'我来装弹！':this.action==='aim'?'蓄力中…':this.action==='release'&&t<.5?'出发！':this.action==='celebrate'?'中了，太棒啦！':this.skillFlash>.3?'接招！':null;
      if(speech){const cx=this.root.value,cy=floor-size-13,text=`${names[primary]||'NABO'} · ${speech}`;ctx.save();ctx.font='600 11px Nunito,"Noto Sans SC",sans-serif';const tw=ctx.measureText(text).width+23;ctx.fillStyle='#fffdf0ed';ctx.beginPath();ctx.roundRect(cx-tw/2,cy-18,tw,27,10);ctx.fill();ctx.beginPath();ctx.moveTo(cx+6,cy+9);ctx.lineTo(cx+12,cy+16);ctx.lineTo(cx+17,cy+8);ctx.fill();label(text,cx,cy,11,'#78875b','center',600);ctx.restore();}
    }
  }
  window.NaboAnimator=NaboAnimator;
})();
