import Phaser from "phaser";
type SeedId="carrot"|"wheat"|"corn"|"berry";
type Tool="move"|"plow"|"plant"|"water"|"harvest";
type Plot={tilled:boolean;seed?:SeedId;plantedAt?:number};
const SEEDS:Record<SeedId,{name:string;emoji:string;cost:number;sell:number;grow:number;xp:number}>={carrot:{name:"Cenoura",emoji:"🥕",cost:12,sell:34,grow:30000,xp:8},wheat:{name:"Trigo",emoji:"🌾",cost:18,sell:48,grow:42000,xp:10},corn:{name:"Milho",emoji:"🌽",cost:28,sell:76,grow:60000,xp:14},berry:{name:"Morango",emoji:"🍓",cost:35,sell:96,grow:75000,xp:18}};
const KEY="vale-verde-phaser-save-v1";
export class FarmScene extends Phaser.Scene{
 private tw=70;private th=35;private ox=0;private oy=0;private mw=16;private mh=14;
 private gridX=8;private gridY=8;private player!:Phaser.GameObjects.Container;private world!:Phaser.GameObjects.Container;private plants!:Phaser.GameObjects.Container;
 private tool:Tool="move";private selected:SeedId="carrot";private coins=700;private xp=16;private level=1;private inventory:Record<string,number>={carrot:3,wheat:2,corn:0,berry:0};private plots:Record<string,Plot>={};
 constructor(){super("FarmScene");}
 create(){
  this.world=this.add.container();this.plants=this.add.container();this.cameras.main.setBackgroundColor("#79a943");
  this.layoutWorld();this.makePlayer();this.drawPlayer();
  this.input.on("pointerdown",(p:Phaser.Input.Pointer)=>this.onPointer(p));
  this.input.keyboard?.on("keydown",(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(k==="w"||k==="arrowup")this.move(0,-1);if(k==="s"||k==="arrowdown")this.move(0,1);if(k==="a"||k==="arrowleft")this.move(-1,0);if(k==="d"||k==="arrowright")this.move(1,0);});
  this.scale.on("resize",()=>this.layoutWorld());
  window.addEventListener("farm-command",this.command as EventListener);
  this.events.once("shutdown",()=>window.removeEventListener("farm-command",this.command as EventListener));
  this.loadGame();this.refresh();this.time.addEvent({delay:1000,loop:true,callback:()=>{this.drawPlants();this.refresh();}});this.time.addEvent({delay:5000,loop:true,callback:()=>this.save()});
 }
 private layoutWorld(){const w=this.scale.width,h=this.scale.height;this.tw=Math.max(52,Math.min(78,w/16));this.th=this.tw*.5;this.ox=w/2;this.oy=h*.44-(this.mw+this.mh)*this.th*.25;this.world?.removeAll(true);this.plants?.removeAll(true);
  for(let y=0;y<this.mh;y++)for(let x=0;x<this.mw;x++){const c=[0x79ae43,0x74a83e,0x80b548,0x70a13a][(x*3+y*7)%4];this.tile(this.world,x,y,c,0x699744);}
  for(let i=0;i<12;i++)this.tile(this.world,i+1,3+Math.round(Math.sin(i*.4)),0xc7a36a,0xb58c55);
  for(let y=6;y<=11;y++)for(let x=6;x<=12;x++)if(x===6||x===12||y===6||y===11)this.tile(this.world,x,y,0x8db951,0xa1c964);
  this.tree(3,5,false);this.tree(14,4,true);this.tree(14,12,false);this.tree(2,12,true);this.tree(10,2,false);this.house(5,5);
  this.drawPlants();if(this.player)this.drawPlayer();
 }
 private pos(x:number,y:number){return{x:this.ox+(x-y)*this.tw/2,y:this.oy+(x+y)*this.th/2};}
 private tile(layer:Phaser.GameObjects.Container,x:number,y:number,color:number,edge:number){const p=this.pos(x,y),g=this.add.graphics();g.fillStyle(color);g.lineStyle(1.2,edge,.9);g.beginPath();g.moveTo(p.x,p.y-this.th/2);g.lineTo(p.x+this.tw/2,p.y);g.lineTo(p.x,p.y+this.th/2);g.lineTo(p.x-this.tw/2,p.y);g.closePath();g.fillPath();g.strokePath();layer.add(g);}
 private tree(x:number,y:number,round:boolean){const p=this.pos(x,y),g=this.add.graphics();g.fillStyle(0x263d1c,.25);g.fillEllipse(p.x+4,p.y+7,42,14);g.fillStyle(0x76502c);g.fillRoundedRect(p.x-4,p.y-42,8,45,3);if(round){g.fillStyle(0x247a36);g.fillEllipse(p.x,p.y-57,42,50);g.fillStyle(0x399246);g.fillEllipse(p.x-9,p.y-63,20,23);}else for(let i=0;i<3;i++){g.fillStyle([0x236d31,0x2b8138,0x1e622a][i]);g.fillTriangle(p.x,p.y-105+i*22,p.x-24+i*5,p.y-51+i*18,p.x+24-i*5,p.y-51+i*18);}this.world.add(g);}
 private house(x:number,y:number){const p=this.pos(x,y),g=this.add.graphics();g.fillStyle(0x58371f);g.fillRoundedRect(p.x-27,p.y-40,54,42,4);g.fillStyle(0xe6c38d);g.fillRect(p.x-23,p.y-35,46,36);g.fillStyle(0x984b32);g.fillTriangle(p.x-34,p.y-35,p.x,p.y-68,p.x+34,p.y-35);g.fillStyle(0x633a27);g.fillRect(p.x-7,p.y-20,14,21);this.world.add(g);this.world.add(this.add.text(p.x,p.y-77,"CASA",{fontSize:"10px",fontStyle:"bold",color:"#fff3c7",stroke:"#583719",strokeThickness:3}).setOrigin(.5));}
 private makePlayer(){this.player=this.add.container(0,0);const shadow=this.add.ellipse(0,14,28,10,0x30451d,.35),g=this.add.graphics();g.fillStyle(0x9b4d2d);g.fillRoundedRect(-9,-5,18,23,5);g.fillStyle(0x3e713a);g.fillRect(-9,13,7,12);g.fillRect(3,13,7,12);g.fillStyle(0xf1c99d);g.fillCircle(0,-14,11);g.fillStyle(0x58341e);g.fillEllipse(0,-22,23,11);g.fillStyle(0x2a1d15);g.fillCircle(-4,-14,1.5);g.fillCircle(4,-14,1.5);this.player.add([shadow,g]);}
 private drawPlayer(){const p=this.pos(this.gridX,this.gridY);this.player.setPosition(p.x,p.y-18);this.player.setDepth((this.gridX+this.gridY)*10+10);}
 private move(dx:number,dy:number){this.gridX=Phaser.Math.Clamp(this.gridX+dx,0,this.mw-1);this.gridY=Phaser.Math.Clamp(this.gridY+dy,0,this.mh-1);this.drawPlayer();this.tweens.add({targets:this.player,scaleY:.94,yoyo:true,duration:90});}
 private pick(px:number,py:number){let best:{x:number;y:number;d:number}|null=null;for(let y=0;y<this.mh;y++)for(let x=0;x<this.mw;x++){const p=this.pos(x,y),d=Math.abs(px-p.x)/(this.tw/2)+Math.abs(py-p.y)/(this.th/2);if(d<=1&&(!best||d<best.d))best={x,y,d};}return best;}
 private onPointer(p:Phaser.Input.Pointer){const t=this.pick(p.worldX,p.worldY);if(!t)return;this.gridX=t.x;this.gridY=t.y;this.drawPlayer();if(t.x>=7&&t.x<=11&&t.y>=7&&t.y<=10)this.act(t.x,t.y);}
 private key(x:number,y:number){return x+","+y;}
 private act(x:number,y:number){const k=this.key(x,y),v=this.plots[k];if(this.tool==="move")return;
  if(this.tool==="plow"){if(v?.seed){this.toast("Colha antes de arar.");return;}this.plots[k]={tilled:true};this.toast("Terra arada!");}
  if(this.tool==="plant"){if(!v?.tilled){this.toast("Primeiro use a ferramenta Arar.");return;}if(v.seed){this.toast("Canteiro ocupado.");return;}if(this.inventory[this.selected]<1){this.toast("Sem sementes. Compre na loja.");return;}this.inventory[this.selected]--;this.plots[k]={tilled:true,seed:this.selected,plantedAt:Date.now()};this.toast(SEEDS[this.selected].name+" plantada!");}
  if(this.tool==="water"){if(!v?.seed){this.toast("Não há plantação para regar.");return;}v.plantedAt=(v.plantedAt||Date.now())-8000;this.toast("Regada! Crescimento acelerado.");}
  if(this.tool==="harvest"){if(!v?.seed){this.toast("Nada para colher.");return;}if(Date.now()-(v.plantedAt||Date.now())<SEEDS[v.seed].grow){this.toast("Ainda está crescendo.");return;}this.inventory[v.seed]=(this.inventory[v.seed]||0)+1;this.xp+=SEEDS[v.seed].xp;delete this.plots[k];while(this.xp>=this.level*100){this.xp-=this.level*100;this.level++;this.coins+=120;this.toast("Novo nível! +120 moedas");}this.toast("Colheita guardada!");}
  this.drawPlants();this.refresh();this.save();
 }
 private drawPlants(){this.plants.removeAll(true);for(let y=7;y<=10;y++)for(let x=7;x<=11;x++){const v=this.plots[this.key(x,y)];if(!v)continue;this.tile(this.plants,x,y,0x8d5c36,0x65452b);if(!v.seed)continue;const s=SEEDS[v.seed],age=Date.now()-(v.plantedAt||Date.now()),stage=Math.min(3,Math.floor(age/(s.grow/3))),n=stage>=3?5:stage+2,p=this.pos(x,y);for(let i=0;i<n;i++){const plant=this.add.text(p.x+(i-(n-1)/2)*9,p.y-5-(i%2)*3,stage>=3?s.emoji:stage===0?"🌱":stage===1?"🌿":"🌾",{fontSize:stage>=3?"19px":"16px"}).setOrigin(.5,1);this.plants.add(plant);}}}
 private loadGame(){try{const d=JSON.parse(localStorage.getItem(KEY)||"null");if(d){this.coins=d.coins??700;this.xp=d.xp??16;this.level=d.level??1;this.inventory={...this.inventory,...d.inventory};this.plots=d.plots??{};}}catch{}}
 private save(){localStorage.setItem(KEY,JSON.stringify({coins:this.coins,xp:this.xp,level:this.level,inventory:this.inventory,plots:this.plots}));}
 private refresh(){const n=Object.values(this.plots).filter(p=>p.seed).length;window.dispatchEvent(new CustomEvent("farm-ui",{detail:{type:"stats",data:{coins:this.coins,level:this.level,xp:this.xp,quest:n===0?"Prepare um canteiro e plante sua primeira semente.":n<3?"Continue plantando para ampliar sua produção.":"Sua fazenda está crescendo! Colha e venda."}}}));}
 private toast(s:string){window.dispatchEvent(new CustomEvent("farm-ui",{detail:{type:"toast",data:s}}));}
 private openShop(){const html="<h2>🛒 Loja de sementes</h2>"+Object.entries(SEEDS).map(([id,s])=>'<div class="store-row"><span>'+s.emoji+' <b>'+s.name+'</b><small>Venda: '+s.sell+' moedas · '+Math.round(s.grow/1000)+'s</small></span><button data-buy="'+id+'">3 sementes · '+s.cost+' 🪙</button></div>').join("");window.dispatchEvent(new CustomEvent("farm-ui",{detail:{type:"panel",data:{html}}}));}
 private openBarn(){const html="<h2>📦 Celeiro</h2>"+Object.entries(SEEDS).map(([id,s])=>'<div class="store-row"><span>'+s.emoji+' <b>'+s.name+'</b><small>Estoque: '+(this.inventory[id]||0)+'</small></span><button data-sell="'+id+'">Vender tudo</button></div>').join("");window.dispatchEvent(new CustomEvent("farm-ui",{detail:{type:"panel",data:{html}}}));}
 private command=(event:CustomEvent)=>{const d=event.detail;if(d.type==="tool"){this.tool=d.tool as Tool;if(this.tool==="plant")this.openShop();}if(d.type==="open-panel"){if(d.panel==="shop")this.openShop();if(d.panel==="barn")this.openBarn();}if(d.type==="buy-seed"){const id=d.seed as SeedId,s=SEEDS[id];if(!s)return;if(this.coins<s.cost){this.toast("Moedas insuficientes.");return;}this.coins-=s.cost;this.inventory[id]+=3;this.selected=id;this.tool="plant";this.toast("3 pacotes de "+s.name+" comprados!");this.refresh();this.save();}if(d.type==="sell"){const id=d.seed as SeedId,n=this.inventory[id]||0;if(!n)return;this.inventory[id]=0;this.coins+=n*SEEDS[id].sell;this.openBarn();this.refresh();this.save();this.toast("Venda realizada: +"+n*SEEDS[id].sell+" moedas");}};
}
