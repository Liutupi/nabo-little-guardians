/* Generated vinyl toys. Physical centers, sprite extents and UI thumbnails share these assets. */
(() => {
  const meta=window.NABO_TOY_META;
  class NaboToyArt {
    constructor(){this.images={};this.total=0;for(const [group,items] of Object.entries(meta))for(const [id,variants]of Object.entries(items))for(const [state,m]of Object.entries(variants)){const im=new Image();im.src=m.src;this.images[group+'/'+id+'/'+state]=im;this.total++;}}
    get loaded(){return Object.values(this.images).filter(im=>im.complete&&im.naturalWidth).length;}
    state(hp,maxHp){if(maxHp<3)return'normal';return hp/maxHp<=.34?'bare':hp/maxHp<=.67?'damaged':'normal';}
    draw(ctx,group,id,x,y,size,options={}){const variants=meta[group]?.[id];if(!variants)return false;const state=options.state&&variants[options.state]?options.state:'normal',m=variants[state],im=this.images[group+'/'+id+'/'+state];if(!im?.complete||!im.naturalWidth)return false;if(group==='pathogens'&&state==='bare')size*=.84;let w,h;if(group==='pathogens'){h=size;w=h*m.w/m.h;if(w>size*1.35){w=size*1.35;h=w*m.h/m.w;}}else{const scale=size/Math.max(m.w,m.h);w=m.w*scale;h=m.h*scale;}
      ctx.save();ctx.translate(x,y);if(options.angle)ctx.rotate(options.angle);if(options.alpha!==undefined)ctx.globalAlpha*=options.alpha;const squash=options.squash||0;ctx.scale(1+squash,1-squash*.7);if(options.flash>0){ctx.filter=`brightness(${1+options.flash*1.6}) saturate(${1-options.flash*.45})`;ctx.shadowColor='#fff4cf';ctx.shadowBlur=options.flash*25;}if(options.glow){ctx.shadowColor=options.color||'#f9d484';ctx.shadowBlur=18;}const anchorY=group==='pathogens'?1-(options.radius||25)/h:m.anchor[1];ctx.drawImage(im,-w*.5,-h*anchorY,w,h);ctx.restore();return true;
    }
    static html(group,id,cls='',alt='',state='normal'){const m=meta[group]?.[id]?.[state];return m?`<img class="toy-thumbnail ${cls}" src="${m.src}" alt="${alt}" width="96" height="96" draggable="false" decoding="async">`:'';}
  }
  window.NaboToyArt=NaboToyArt;
})();
