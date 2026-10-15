/* Gesture-unlocked Web Audio. No remote audio files or autoplay dependency. */
(() => {
  class NaboSound {
    constructor(button){
      this.button=button;this.enabled=true;this.context=null;this.pending=null;this.voices=new Set();
      try{this.enabled=localStorage.getItem('nabo-sound')!=='off';}catch{}
      button.onclick=()=>{if(!this.enabled){this.enabled=true;this.store();this.unlock().then(ok=>{if(ok)this.play('enabled');});}else if(this.context?.state==='running'){this.enabled=false;this.stop();this.store();}else this.unlock().then(ok=>{if(ok)this.play('enabled');});this.render();};this.render();
    }
    store(){try{localStorage.setItem('nabo-sound',this.enabled?'on':'off');}catch{}this.render();}
    render(){const running=this.context?.state==='running';this.button.setAttribute('aria-pressed',String(this.enabled));this.button.setAttribute('aria-label',!this.enabled?'开启音效':running?'关闭音效':'点按开启音效');this.button.dataset.audio=!this.enabled?'muted':running?'running':'locked';this.button.innerHTML=`<svg viewBox="0 0 24 24"><path d="M11 4 6 8H3v8h3l5 4V4ZM${this.enabled?'15 8q5 4 0 8m3-11q8 7 0 14':'16 9l6 6m0-6-6 6'}"/></svg><span>${!this.enabled?'音效已关':running?'音效已开':'点按开启音效'}</span>`;}
    unlock(){
      if(!this.enabled)return Promise.resolve(false);
      try{
        if(!this.context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){this.button.dataset.audio='unavailable';return Promise.resolve(false);}this.context=new Audio();this.context.onstatechange=()=>this.render();}
        if(this.context.state==='running'){this.render();return Promise.resolve(true);}
        if(!this.pending)this.pending=Promise.resolve(this.context.resume()).then(()=>{this.render();return this.context.state==='running';}).catch(()=>{this.render();return false;}).finally(()=>{this.pending=null;});
        return this.pending;
      }catch{this.render();return Promise.resolve(false);}
    }
    tone(freq=500,duration=.12,type='sine',volume=.07,delay=0){
      if(!this.enabled)return;
      if(this.context?.state!=='running'){this.unlock().then(ok=>{if(ok&&this.enabled)this.tone(freq,duration,type,volume,delay);});return;}
      if(this.voices.size>=18)return;
      try{const a=this.context,osc=a.createOscillator(),gain=a.createGain(),at=a.currentTime+delay;osc.type=type;osc.frequency.setValueAtTime(freq,at);osc.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.65),at+duration);gain.gain.setValueAtTime(volume,at);gain.gain.exponentialRampToValueAtTime(.001,at+duration);osc.connect(gain);gain.connect(a.destination);this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+duration);}catch{}
    }
    play(name,power=0){if(name==='launch'){this.tone(700,.2,'triangle',.08);this.tone(170,.14,'sine',.11);}else if(name==='pull')this.tone(180+power*260,.06,'triangle',.025);else if(name==='load')this.tone(420,.07,'sine',.035);else if(name==='armor'){this.tone(120,.2,'sawtooth',.035);this.tone(1200,.16,'triangle',.08);this.tone(900,.12,'triangle',.05,.06);}else if(name==='enabled'){this.tone(660,.1,'sine',.09);this.tone(880,.15,'sine',.09,.1);}}
    stop(){for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();}
    suspend(){this.stop();if(this.context?.state==='running')Promise.resolve(this.context.suspend()).catch(()=>{});}
  }
  window.NaboSound=NaboSound;
})();
