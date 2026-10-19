(()=>{
'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const W=960,H=540,GROUND=438;
const ui={lives:$('lives'),trash:$('trash'),score:$('score'),target:$('target'),label:$('level-label'),overlay:$('overlay'),title:$('panel-title'),copy:$('panel-copy'),start:$('start')};
let scale=1,ox=0,oy=0,levelIndex=0,level,player,items,obstacles,decor,camera=0,score=0,lives=3,collected=0,invuln=0,running=false,last=0,keys={},touch={left:false,right:false};
const conceptSheet=new Image();conceptSheet.src='assets/sprites/gari-sprite-sheet-conceito.png';
let spriteCanvas=null,spriteReady=false;
conceptSheet.onload=()=>{try{
 // Recorta o primeiro personagem da faixa inferior da prancha conceitual.
 // A imagem original tem fundo claro; ele é removido para preparar o sprite.
 const crop=document.createElement('canvas');crop.width=74;crop.height=112;
 const c=crop.getContext('2d',{willReadFrequently:true});
 c.drawImage(conceptSheet,18,850,74,112,0,0,74,112);
 const pixels=c.getImageData(0,0,74,112),d=pixels.data;
 for(let i=0;i<d.length;i+=4){
   const r=d[i],g=d[i+1],b=d[i+2];
   // Remove o fundo quase branco/cinza sem apagar os tons claros do uniforme.
   if(r>218&&g>218&&b>210&&Math.max(r,g,b)-Math.min(r,g,b)<28)d[i+3]=0;
 }
 c.putImageData(pixels,0,0);spriteCanvas=crop;spriteReady=true;
}catch(e){spriteReady=false}};
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;scale=Math.min(canvas.width/W,canvas.height/H);ox=(canvas.width-W*scale)/2;oy=(canvas.height-H*scale)/2}
addEventListener('resize',resize);resize();
function startLevel(idx,keepScore=false){levelIndex=idx;level=GARI_LEVELS[idx];if(!keepScore)score=0;lives=3;collected=0;camera=0;invuln=0;
 player={x:60,y:GROUND-78,w:48,h:78,vx:0,vy:0,onGround:true,face:1};
 items=[];obstacles=[];decor=[];const spacing=level.length/(level.target+2);
 for(let i=1;i<=level.target+2;i++)items.push({x:Math.round(i*spacing),y:GROUND-25,type:['bottle','paper','can'][i%3],got:false});
 for(let x=380;x<level.length-100;x+=230)if(Math.floor(x/230)%3!==1)obstacles.push({x,w:Math.floor(x/230)%2?42:48,h:Math.floor(x/230)%2?36:29,type:Math.floor(x/230)%2?'cone':'bag'});
 for(let x=0;x<level.length+100;x+=125)decor.push({x,kind:level.theme==='beach'?(Math.random()>.5?'palm':'umbrella'):level.theme==='center'?'building':level.theme==='community'?'house':'crate'});
 ui.lives.textContent=lives;ui.trash.textContent=collected;ui.score.textContent=score;ui.target.textContent=level.target;ui.label.textContent=`FASE ${idx+1} · ${level.short}`;
 running=true;ui.overlay.style.display='none';last=performance.now();requestAnimationFrame(loop)}
function showPanel(title,copy,button,fn){running=false;ui.title.textContent=title;ui.copy.textContent=copy;ui.start.textContent=button;ui.overlay.style.display='flex';ui.start.onclick=fn}
ui.start.onclick=()=>{score=0;startLevel(0)};
function jump(){if(running&&player.onGround){player.vy=-650;player.onGround=false}}
addEventListener('keydown',e=>{let k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup',' ','a','d','w'].includes(k))e.preventDefault();keys[k]=true;if([' ','arrowup','w'].includes(k))jump()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function hold(id,p){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();touch[p]=true});['pointerup','pointercancel','pointerleave'].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();touch[p]=false}))}
hold('left','left');hold('right','right');$('jump').addEventListener('pointerdown',e=>{e.preventDefault();jump()});
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function update(dt){if(!running)return;const l=keys.arrowleft||keys.a||touch.left,r=keys.arrowright||keys.d||touch.right;player.vx=(r?270:0)-(l?270:0);if(player.vx)player.face=Math.sign(player.vx);player.x=Math.max(0,Math.min(level.length-player.w,player.x+player.vx*dt));player.vy+=1500*dt;player.y+=player.vy*dt;if(player.y+player.h>=GROUND){player.y=GROUND-player.h;player.vy=0;player.onGround=true}if(invuln>0)invuln-=dt;
 const p={x:player.x+5,y:player.y+5,w:player.w-10,h:player.h-5};
 for(const o of obstacles)if(hit(p,{x:o.x,y:GROUND-o.h,w:o.w,h:o.h})&&invuln<=0){lives--;invuln=1.2;player.vy=-300;ui.lives.textContent=lives;if(lives<=0){showPanel('TENTE DE NOVO','Os obstáculos venceram desta vez. Volte à fase e tente completar a missão.','RECOMEÇAR',()=>startLevel(levelIndex,true));return}}
 for(const it of items)if(!it.got&&hit(p,{x:it.x-12,y:it.y-15,w:24,h:29})){it.got=true;collected++;score+=100;ui.trash.textContent=collected;ui.score.textContent=score}
 camera=Math.max(0,Math.min(level.length-W,player.x-W*.33));
 if(player.x>level.length-100){score+=collected*25;ui.score.textContent=score;if(levelIndex<GARI_LEVELS.length-1)showPanel('FASE CONCLUÍDA!',`Você terminou ${level.name} e recolheu ${collected} resíduos. Próxima missão: ${GARI_LEVELS[levelIndex+1].name}.`,'PRÓXIMA FASE',()=>startLevel(levelIndex+1,true));else showPanel('CIDADE MAIS LIMPA!',`Você completou as quatro fases do protótipo e recolheu ${collected} resíduos nesta última etapa.`,'JOGAR NOVAMENTE',()=>startLevel(0,false))}
}
function rr(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function background(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,level.sky);g.addColorStop(.58,'#d7f5fa');g.addColorStop(.59,level.ground);g.addColorStop(1,level.ground);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff2b1';ctx.beginPath();ctx.arc(800,80,32,0,7);ctx.fill();ctx.save();ctx.translate(-camera*.18,0);
 if(level.theme==='beach'){ctx.fillStyle=level.far;ctx.beginPath();ctx.moveTo(-80,330);ctx.lineTo(90,235);ctx.lineTo(180,280);ctx.lineTo(280,180);ctx.lineTo(380,300);ctx.lineTo(520,225);ctx.lineTo(650,305);ctx.lineTo(820,225);ctx.lineTo(1050,330);ctx.lineTo(1050,440);ctx.lineTo(-80,440);ctx.fill()}
 else{for(let x=-40;x<1400;x+=55){const h=80+Math.abs(Math.sin(x*.03))*90;ctx.fillStyle=level.theme==='community'?'#e5b59b':level.theme==='port'?'#c7d0c9':['#e5c39b','#d4a9a0','#d8d9c7'][Math.floor(x/55)%3];ctx.fillRect(x,350-h,43,h);ctx.fillStyle='#7eabb6';for(let y=365-h;y<345;y+=18)for(let xx=x+8;xx<x+39;xx+=14)ctx.fillRect(xx,y,6,8)}}ctx.restore();
 if(level.theme==='beach'){ctx.fillStyle='#28b9d5';ctx.fillRect(0,300,W,76);ctx.fillStyle='#d5fff7';for(let x=0;x<W;x+=65){ctx.beginPath();ctx.ellipse(x,315,27,3,0,0,7);ctx.fill()}}
 ctx.fillStyle=level.ground;ctx.fillRect(0,376,W,164);ctx.fillStyle='#ffe2a0';ctx.fillRect(0,378,W,8);ctx.fillStyle='#d9d5c9';ctx.fillRect(0,440,W,100);ctx.strokeStyle='#b6b4aa';ctx.lineWidth=2;for(let x=-(camera%90);x<W;x+=90){ctx.beginPath();ctx.moveTo(x,440);ctx.lineTo(x,540);ctx.stroke()}ctx.beginPath();ctx.moveTo(0,488);ctx.lineTo(W,488);ctx.stroke()}
function drawDecor(){ctx.save();ctx.translate(-camera,0);for(const d of decor){if(d.x<camera-100||d.x>camera+W+100)continue;const x=d.x;if(d.kind==='palm'){ctx.strokeStyle='#89592f';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+4,GROUND-76);ctx.stroke();ctx.strokeStyle='#1a9a62';ctx.lineWidth=6;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x+4,GROUND-76);ctx.lineTo(x+Math.cos(i)*42,GROUND-94+Math.sin(i)*15);ctx.stroke()}}else if(d.kind==='umbrella'){ctx.strokeStyle='#777';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x,GROUND-38);ctx.stroke();ctx.fillStyle='#ff9230';ctx.beginPath();ctx.moveTo(x-30,GROUND-38);ctx.lineTo(x,GROUND-57);ctx.lineTo(x+30,GROUND-38);ctx.fill()}else if(d.kind==='house'){rr(x,GROUND-55,44,55,2,'#e8b49a');ctx.fillStyle='#a95e47';ctx.beginPath();ctx.moveTo(x-4,GROUND-55);ctx.lineTo(x+22,GROUND-75);ctx.lineTo(x+48,GROUND-55);ctx.fill();ctx.fillStyle='#6ca9b2';ctx.fillRect(x+8,GROUND-43,9,12);ctx.fillRect(x+27,GROUND-43,9,12)}else if(d.kind==='crate'){rr(x,GROUND-38,40,38,3,'#a77a4b');ctx.strokeStyle='#725332';ctx.strokeRect(x+5,GROUND-32,30,27)}else{rr(x,GROUND-95,42,95,2,'#d6c6ac');ctx.fillStyle='#79aeb7';for(let y=GROUND-85;y<GROUND-8;y+=18)for(let xx=x+7;xx<x+36;xx+=13)ctx.fillRect(xx,y,6,8)}}ctx.restore()}
function drawItem(it){if(it.got)return;const x=it.x-camera,y=it.y;ctx.save();ctx.translate(x,y);if(it.type==='bottle'){rr(-7,-15,14,27,4,'#61d7ed');ctx.fillStyle='#0879b8';ctx.fillRect(-4,-20,8,6);ctx.fillStyle='#eaffff';ctx.fillRect(-3,-10,3,12)}else if(it.type==='paper'){ctx.fillStyle='#fff7df';ctx.strokeStyle='#c8a96b';ctx.beginPath();ctx.moveTo(-10,-11);ctx.lineTo(7,-14);ctx.lineTo(11,9);ctx.lineTo(-7,12);ctx.closePath();ctx.fill();ctx.stroke()}else{rr(-9,-14,18,27,4,'#e7edf0');ctx.fillStyle='#ff8732';ctx.fillRect(-8,-7,16,7)}ctx.restore()}
function drawObstacle(o){const x=o.x-camera,y=GROUND-o.h;if(o.type==='bag'){ctx.fillStyle='#17242a';ctx.beginPath();ctx.moveTo(x+7,y+8);ctx.quadraticCurveTo(x-4,y+24,x+8,y+o.h);ctx.lineTo(x+o.w-5,y+o.h);ctx.quadraticCurveTo(x+o.w+4,y+12,x+o.w-9,y+5);ctx.closePath();ctx.fill()}else{ctx.fillStyle='#ff7425';ctx.beginPath();ctx.moveTo(x+o.w/2,y);ctx.lineTo(x+o.w,y+o.h);ctx.lineTo(x,y+o.h);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x+11,y+17,o.w-22,7)}}
function drawPlayer(){
 const x=player.x-camera,y=player.y;
 if(invuln>0&&Math.floor(invuln*12)%2===0)return;
 const t=performance.now()/1000, moving=Math.abs(player.vx)>1;
 const phase=t*13, swing=moving&&player.onGround?Math.sin(phase):0;
 const legSwing=player.onGround?(moving?swing*10:Math.sin(t*2)*1.2):0;
 const armSwing=player.onGround?(moving?-swing*9:Math.sin(t*2)*1.5):0;
 const airborne=!player.onGround;
 ctx.save();ctx.translate(x+player.w/2,y);ctx.scale(player.face,1);
 // sombra
 ctx.fillStyle='#0002';ctx.beginPath();ctx.ellipse(0,80,23,5,0,0,Math.PI*2);ctx.fill();
 // pernas animadas: calça azul-marinho, botas e joelhos em movimento
 ctx.lineCap='round';ctx.lineJoin='round';
 const leftLeg=airborne?-5:legSwing,rightLeg=airborne?5:-legSwing;
 ctx.strokeStyle='#263844';ctx.lineWidth=11;
 ctx.beginPath();ctx.moveTo(-8,51);ctx.lineTo(-9+leftLeg*.45,64);ctx.lineTo(-12+leftLeg,70);
 ctx.moveTo(8,51);ctx.lineTo(9+rightLeg*.45,64);ctx.lineTo(12+rightLeg,70);ctx.stroke();
 // botas
 rr(-21+leftLeg,66,19,10,4,'#17262d');rr(3+rightLeg,66,20,10,4,'#17262d');
 ctx.fillStyle='#64717a';ctx.fillRect(-18+leftLeg,68,8,2);ctx.fillRect(6+rightLeg,68,8,2);
 // braços atrás do tronco, com luvas
 ctx.strokeStyle='#bd7951';ctx.lineWidth=9;
 ctx.beginPath();ctx.moveTo(-14,21);ctx.lineTo(-20+armSwing*.55,34);ctx.lineTo(-20+armSwing,43);
 ctx.moveTo(14,21);ctx.lineTo(20-armSwing*.55,34);ctx.lineTo(20-armSwing,43);ctx.stroke();
 rr(-26+armSwing,39,12,11,4,'#24333a');rr(14-armSwing,39,12,11,4,'#24333a');
 // uniforme laranja com contorno
 ctx.fillStyle='#ff791d';ctx.strokeStyle='#a94412';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(-14,13);ctx.quadraticCurveTo(-20,13,-18,24);ctx.lineTo(-14,52);ctx.quadraticCurveTo(0,59,14,52);ctx.lineTo(18,24);ctx.quadraticCurveTo(20,13,14,13);ctx.closePath();ctx.fill();ctx.stroke();
 // faixas refletivas e zíper
 ctx.fillStyle='#fff0c8';ctx.fillRect(-15,32,30,5);ctx.fillRect(-13,47,26,4);
 ctx.strokeStyle='#f8d9a5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(0,29);ctx.stroke();
 // pescoço
 ctx.fillStyle='#9d5b3b';ctx.fillRect(-5,7,10,10);
 // rosto
 ctx.fillStyle='#bd7951';ctx.strokeStyle='#70412f';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.ellipse(0,-4,15,19,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 // cabelo curto
 ctx.fillStyle='#171e22';ctx.beginPath();ctx.moveTo(-15,-7);ctx.quadraticCurveTo(-19,-25,-3,-25);ctx.quadraticCurveTo(12,-27,16,-13);ctx.lineTo(12,-10);ctx.quadraticCurveTo(0,-17,-14,-7);ctx.closePath();ctx.fill();
 // sobrancelhas e olhos
 ctx.strokeStyle='#38251f';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-10,-8);ctx.lineTo(-4,-9);ctx.moveTo(4,-9);ctx.lineTo(10,-8);ctx.stroke();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-7,-4,3.2,2.6,0,0,Math.PI*2);ctx.ellipse(7,-4,3.2,2.6,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#252126';ctx.beginPath();ctx.arc(-6,-4,1.5,0,Math.PI*2);ctx.arc(8,-4,1.5,0,Math.PI*2);ctx.fill();
 // barba e sorriso
 ctx.fillStyle='#25272a';ctx.beginPath();ctx.moveTo(-13,2);ctx.quadraticCurveTo(-12,15,0,15);ctx.quadraticCurveTo(12,14,13,2);ctx.lineTo(9,7);ctx.quadraticCurveTo(0,11,-9,7);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#fff';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-6,4);ctx.quadraticCurveTo(0,8,6,4);ctx.stroke();
 // detalhes de luz no uniforme
 ctx.strokeStyle='#ffbd68';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-11,19);ctx.lineTo(-7,28);ctx.moveTo(11,19);ctx.lineTo(7,28);ctx.stroke();
 ctx.restore();
}
function draw(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(scale,0,0,scale,ox,oy);background();drawDecor();for(const it of items)drawItem(it);for(const o of obstacles)drawObstacle(o);drawPlayer();rr(300,18,360,10,5,'#08344c55');rr(300,18,360*Math.min(1,player.x/(level.length-W*.4)),10,5,'#ff791d');ctx.fillStyle='#08344c';ctx.font='bold 12px system-ui';ctx.fillText('PROGRESSO',430,43)}
function loop(t){if(!running)return;const dt=Math.min((t-last)/1000,.033);last=t;update(dt);draw();if(running)requestAnimationFrame(loop)}
startLevel(0);running=false;draw();ui.overlay.style.display='flex';
})();