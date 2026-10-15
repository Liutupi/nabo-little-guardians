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
    // Short filtered noise gives breaking materials some body; skipped where buffers are unavailable.
    noise(duration=.18,volume=.08,freq=900,q=.8){
      if(!this.enabled||this.context?.state!=='running'||this.voices.size>=18)return;
      try{const a=this.context;if(!a.createBuffer||!a.createBiquadFilter)return;if(!this.noiseBuffer){const len=Math.floor(a.sampleRate*.5),buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.noiseBuffer=buf;}
        const src=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain(),at=a.currentTime;src.buffer=this.noiseBuffer;filter.type='bandpass';filter.frequency.setValueAtTime(freq,at);filter.Q.value=q;gain.gain.setValueAtTime(volume,at);gain.gain.exponentialRampToValueAtTime(.001,at+duration);src.connect(filter);filter.connect(gain);gain.connect(a.destination);this.voices.add(src);src.onended=()=>{this.voices.delete(src);src.disconnect();filter.disconnect();gain.disconnect();};src.start(at,Math.random()*.3);src.stop(at+duration);}catch{}
    }
    play(name,power=0){if(name==='launch'){this.tone(700,.2,'triangle',.08);this.tone(170,.14,'sine',.11);}else if(name==='pull')this.tone(180+power*260,.06,'triangle',.025);else if(name==='load')this.tone(420,.07,'sine',.035);else if(name==='armor'){this.tone(120,.2,'sawtooth',.035);this.tone(1200,.16,'triangle',.08);this.tone(900,.12,'triangle',.05,.06);}else if(name==='glass'){this.noise(.22,.07+power*.05,3200,1.2);this.tone(1900+Math.random()*500,.14,'triangle',.03);this.tone(2600+Math.random()*600,.1,'triangle',.022,.04);}
      else if(name==='wood'){this.noise(.2,.09+power*.06,520,.9);this.tone(150+Math.random()*30,.16,'triangle',.07);}
      else if(name==='steel'){this.noise(.16,.05,1500,2);this.tone(330,.32,'square',.025);this.tone(620,.26,'triangle',.035,.02);}
      else if(name==='knock')this.tone(210+power*80,.06,'triangle',.03);
      else if(name==='chain'){const n=Math.min(power,16);this.tone(440*Math.pow(2,n/12),.12,'triangle',.05);if(n>=6)this.tone(660*Math.pow(2,n/12),.1,'sine',.035,.05);}
      else if(name==='enabled'){this.tone(660,.1,'sine',.09);this.tone(880,.15,'sine',.09,.1);}}
    stop(){for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();}
    suspend(){this.stop();if(this.context?.state==='running')Promise.resolve(this.context.suspend()).catch(()=>{});}
  }
  window.NaboSound=NaboSound;
})();
