(function(){
  "use strict";
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- lightbox ---------- */
  var lb=document.getElementById("lb");
  if(lb){
    var li=document.getElementById("lbimg"),lc=document.getElementById("lbcap"),zb=document.getElementById("lbz"),last=null;
    document.querySelectorAll("[data-zoom]").forEach(function(b){b.addEventListener("click",function(){
      last=b;li.src=b.getAttribute("data-zoom");li.alt=b.getAttribute("data-cap")||"";lc.textContent=b.getAttribute("data-cap")||"";
      lb.classList.remove("z");zb.textContent="Zoom 2×";lb.hidden=false;document.getElementById("lbx").focus();});});
    var close=function(){lb.hidden=true;if(last)last.focus();};
    document.getElementById("lbx").addEventListener("click",close);
    zb.addEventListener("click",function(){lb.classList.toggle("z");zb.textContent=lb.classList.contains("z")?"Fit width":"Zoom 2×";});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!lb.hidden)close();});
  }

  /* ---------- copy email ---------- */
  var cp=document.getElementById("copy");
  if(cp)cp.addEventListener("click",function(){
    var el=document.getElementById("email"),t=el.textContent;
    var sel=function(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);cp.textContent="Selected";};
    try{navigator.clipboard.writeText(t).then(function(){cp.textContent="Copied";},sel);}catch(e){sel();}
  });

  /* ---------- filters ---------- */
  document.querySelectorAll("[data-filter-for]").forEach(function(group){
    var target=document.getElementById(group.getAttribute("data-filter-for"));
    var bs=group.querySelectorAll("button");
    bs.forEach(function(b){b.addEventListener("click",function(){
      bs.forEach(function(o){o.setAttribute("aria-pressed",o===b?"true":"false");});
      var k=b.getAttribute("data-k");
      target.querySelectorAll("[data-k]").forEach(function(it){it.hidden=!(k==="all"||(" "+it.getAttribute("data-k")+" ").indexOf(" "+k+" ")>-1);});
    });});
  });

  /* ---------- hero engine canvas ---------- */
  var cv=document.getElementById("engine");
  if(cv){
    var ctx=cv.getContext("2d"),W=1120,H=420,C={},frame=0;
    function readColors(){var s=getComputedStyle(document.documentElement);["ink","muted","rule","soft","surface","navy","brick","teal","olive","ochre","violet"].forEach(function(k){C[k]=s.getPropertyValue("--"+k).trim()||"#888";});}
    function size(){var r=cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*d);cv.height=Math.round(r.width*H/W*d);ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);}
    readColors();size();
    window.addEventListener("resize",function(){size();if(reduce)draw(0);});
    if(window.matchMedia){matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){readColors();if(reduce)draw(0);});}
    new MutationObserver(function(){readColors();if(reduce)draw(0);}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});

    var lanes=[["speech","navy",1.9,.9],["gaze","teal",.8,.6],["gesture","brick",1.3,1.2],["pose","olive",.6,.8],["objects","violet",2.4,.5],["proximity","ochre",.45,1]];
    function rnd(s){var x=Math.sin(s*9301+49297)*233280;return x-Math.floor(x);}
    var clusters=[{x:690,y:150,c:"teal",n:"approach"},{x:760,y:285,c:"muted",n:"stable"},{x:640,y:300,c:"brick",n:"independent"}];
    var pts=[];for(var i=0;i<84;i++){var k=i%3,cl=clusters[k],a=rnd(i)*6.283,r=rnd(i+99)*44+4;pts.push({x:cl.x+Math.cos(a)*r*1.2,y:cl.y+Math.sin(a)*r*.8,k:k});}
    var nodes=[{id:"C",x:960,y:210,r:22,c:"brick",t:"child"},{id:"T",x:1060,y:120,r:18,c:"navy",t:"teacher"},{id:"P",x:1060,y:310,r:15,c:"teal",t:"peer"},{id:"P2",x:880,y:330,r:12,c:"teal",t:"peer"},{id:"B",x:870,y:105,r:11,c:"olive",t:"book",sq:1},{id:"K",x:1080,y:220,r:10,c:"olive",t:"blocks",sq:1}];
    var N={};nodes.forEach(function(n){N[n.id]=n;});
    var edges=[["C","T",1],["T","C",.7],["C","B",.9],["T","B",.5],["P","C",.6],["C","P",.4],["C","K",.8],["P","K",.5],["P2","C",.3],["C","P2",.3]];
    var flows=[];

    function lbl(t,x,y,al,col,sz){ctx.fillStyle=col||C.muted;ctx.font=(sz||11)+"px 'IBM Plex Mono', monospace";ctx.textAlign=al||"left";ctx.fillText(t,x,y);}
    function arrow(x1,y,x2){ctx.strokeStyle=C.muted;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y);ctx.lineTo(x2-6,y-4);ctx.lineTo(x2-6,y+4);ctx.closePath();ctx.fillStyle=C.muted;ctx.fill();}

    function draw(t){
      ctx.clearRect(0,0,W,H);
      // stage headers
      [["01  SENSE",30],["02  ENCODE",388],["03  REPRESENT",585],["04  RELATE",850]].forEach(function(h){lbl(h[0],h[1],30,"left",C.ink,11.5);});
      ctx.strokeStyle=C.rule;ctx.lineWidth=1;
      [360,568,830].forEach(function(x){ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(x,46);ctx.lineTo(x,H-20);ctx.stroke();ctx.setLineDash([]);});

      // 01 signals
      lanes.forEach(function(L,i){
        var y=78+i*55,col=C[L[1]];
        lbl(L[0],30,y-18,"left",C.muted,10.5);
        ctx.strokeStyle=col;ctx.lineWidth=1.6;ctx.beginPath();
        for(var x=0;x<=280;x+=2){
          var u=x/280*12+t*L[2]*.04, v;
          if(L[0]==="speech"){v=Math.sin(u*3.1)*Math.sin(u*.7)*(.4+.6*Math.abs(Math.sin(u*.33)));}
          else if(L[0]==="objects"){v=(Math.sin(u*.9)>.35?.8:-.2)+Math.sin(u*7)*.05;}
          else{v=Math.sin(u*L[3])*.6+Math.sin(u*L[3]*2.7+i)*.25+Math.sin(u*L[3]*5.3)*.1;}
          var px=30+x,py=y+4-v*13; if(x===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
        }
        ctx.stroke();
      });
      arrow(318,215,372);

      // 02 encoder: stacked layers with attention heatmap
      for(var s=2;s>=0;s--){
        var ox=392+s*10,oy=70-s*10;
        ctx.fillStyle=C.surface;ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.fillRect(ox,oy,150,290);ctx.strokeRect(ox,oy,150,290);
      }
      var gx=402,gy=86,cs=16;
      for(var r=0;r<8;r++)for(var c=0;c<8;c++){
        var a=.08+.75*Math.pow((Math.sin(r*1.7+c*.9+t*.03)*.5+.5)*(Math.sin((r-c)*.8+t*.021)*.5+.5),1.4);
        if(r===c)a=Math.max(a,.55);
        ctx.globalAlpha=a;ctx.fillStyle=C.navy;ctx.fillRect(gx+c*cs,gy+r*cs,cs-2,cs-2);
      }
      ctx.globalAlpha=1;
      lbl("cross-modal attention",402,232,"left",C.ink,10.5);
      lbl("speech · gaze · pose",402,250,"left",C.muted,10.5);
      ["fusion","pool","norm"].forEach(function(n,i){ctx.strokeStyle=C.rule;ctx.strokeRect(402,268+i*26,130,20);lbl(n,467,282+i*26,"center",C.muted,10);});
      arrow(552,215,580);

      // 03 latent space
      ctx.strokeStyle=C.rule;ctx.strokeRect(588,62,230,300);
      lbl("latent space",596,354,"left",C.muted,10.5);
      clusters.forEach(function(cl){ctx.setLineDash([2,3]);ctx.strokeStyle=C[cl.c];ctx.beginPath();ctx.ellipse(cl.x,cl.y,60,40,0,0,6.283);ctx.stroke();ctx.setLineDash([]);});
      pts.forEach(function(p,i){var j=Math.sin(t*.02+i)*1.2;ctx.fillStyle=C[clusters[p.k].c];ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(p.x+j,p.y-j,2.6,0,6.283);ctx.fill();});
      ctx.globalAlpha=1;
      lbl("approach",clusters[0].x,clusters[0].y-48,"center",C.teal,10);
      lbl("stable",clusters[1].x,clusters[1].y+54,"center",C.muted,10);
      lbl("independent",clusters[2].x-6,clusters[2].y-48,"center",C.brick,10);
      // particles from encoder to latent
      if(!reduce&&frame%14===0){var k=Math.floor(Math.random()*3);flows.push({k:k,p:0,tx:clusters[k].x+(Math.random()-.5)*60,ty:clusters[k].y+(Math.random()-.5)*36});}
      flows=flows.filter(function(f){f.p+=.018;return f.p<1;});
      flows.forEach(function(f){var x=552+(f.tx-552)*f.p,y=215+(f.ty-215)*f.p;ctx.fillStyle=C[clusters[f.k].c];ctx.globalAlpha=1-f.p*.4;ctx.beginPath();ctx.arc(x,y,2.4,0,6.283);ctx.fill();});
      ctx.globalAlpha=1;
      arrow(820,215,844);

      // 04 relational graph
      edges.forEach(function(e,i){
        var a=N[e[0]],b=N[e[1]],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,nx=-uy*6,ny=ux*6;
        var x1=a.x+ux*a.r+nx,y1=a.y+uy*a.r+ny,x2=b.x-ux*(b.r+4)+nx,y2=b.y-uy*(b.r+4)+ny;
        ctx.strokeStyle=C[a.c];ctx.globalAlpha=.25+e[2]*.5;ctx.lineWidth=.8+e[2]*2.2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
        ctx.globalAlpha=1;ctx.fillStyle=C[a.c];ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*7-uy*4,y2-uy*7+ux*4);ctx.lineTo(x2-ux*7+uy*4,y2-uy*7-ux*4);ctx.closePath();ctx.fill();
        var p=((t*.006*(0.6+e[2]))+i*.37)%1;ctx.beginPath();ctx.arc(x1+(x2-x1)*p,y1+(y2-y1)*p,2.6,0,6.283);ctx.fill();
      });
      nodes.forEach(function(n){
        ctx.fillStyle=C.surface;ctx.strokeStyle=C[n.c];ctx.lineWidth=2.2;
        if(n.sq){ctx.fillRect(n.x-n.r,n.y-n.r,n.r*2,n.r*2);ctx.strokeRect(n.x-n.r,n.y-n.r,n.r*2,n.r*2);}
        else{ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,6.283);ctx.fill();ctx.stroke();}
        lbl(n.t,n.x,n.y+n.r+14,"center",C.ink,10.5);
      });
      lbl("edge = contingent response",850,394,"left",C.muted,10);
    }
    function loop(){frame++;draw(frame);requestAnimationFrame(loop);}
    if(reduce)draw(120);else requestAnimationFrame(loop);
  }

  /* ---------- MOSAIC score ---------- */
  var svg=document.getElementById("score");
  if(svg){
    var LANES=[["lang","Language","--navy"],["gaze","Gaze","--teal"],["gest","Gesture","--brick"],["move","Movement","--olive"],["obj","Object","--violet"],["soc","Response","--ochre"]];
    var EP={
      read:[{l:"gaze",s:1,e:5,a:"Child",t:"Looks from the page to the storm cloud illustration",r:"contribution"},{l:"gest",s:3.5,e:6,a:"Child",t:"Points at the cloud",r:"contribution"},{l:"lang",s:5,e:8,a:"Child",t:"“It’s gonna rain?”",r:"contribution"},{l:"gaze",s:7,e:11,a:"Teacher",t:"Turns toward the child and follows the point",r:"response"},{l:"lang",s:9,e:13.5,a:"Teacher",t:"Revoices: “You think it will rain. What makes you think so?”",r:"response"},{l:"soc",s:9,e:13.5,a:"Teacher",t:"Uptake plus an open question (transfer of control)",r:"response"},{l:"move",s:14,e:17,a:"Child",t:"Leans toward the book",r:"next"},{l:"lang",s:15,e:20,a:"Child",t:"“Because it’s dark and big”",r:"next"},{l:"gaze",s:23,e:27,a:"Peer",t:"Looks at the same cloud",r:"other"}],
      play:[{l:"obj",s:1,e:6,a:"Child",t:"Stacks blocks into a tall ramp",r:"contribution"},{l:"move",s:4,e:8,a:"Child",t:"Steps back to look at the ramp",r:"contribution"},{l:"gest",s:7,e:9.5,a:"Child",t:"Tilts a hand to show the slope",r:"contribution"},{l:"gaze",s:9,e:12,a:"Peer",t:"Watches the hand gesture",r:"response"},{l:"obj",s:11,e:15,a:"Peer",t:"Hands over a car",r:"response"},{l:"soc",s:11,e:15,a:"Peer",t:"Peer extension through materials",r:"response"},{l:"obj",s:16,e:19,a:"Child",t:"Releases the car down the ramp",r:"next"},{l:"lang",s:18,e:22,a:"Child",t:"“Faster! Make it taller!”",r:"next"},{l:"lang",s:24,e:27,a:"Teacher",t:"Narrates from across the room",r:"other"}],
      inq:[{l:"lang",s:1,e:4,a:"Adult",t:"“What will happen to the water on the red dirt?”",r:"other"},{l:"gaze",s:4,e:7,a:"Child",t:"Looks between the cup and the soil tray",r:"contribution"},{l:"lang",s:6,e:9,a:"Child",t:"“It will go away” (prediction)",r:"contribution"},{l:"gest",s:7,e:9,a:"Child",t:"Sweeping hand for ‘away’",r:"contribution"},{l:"obj",s:10,e:13,a:"Adult",t:"Slides the cup to the child",r:"response"},{l:"soc",s:10,e:13,a:"Adult",t:"Transfers control of the test",r:"response"},{l:"obj",s:14,e:18,a:"Child",t:"Pours water onto the soil",r:"next"},{l:"gaze",s:16,e:21,a:"Child",t:"Sustained fixation on the puddle",r:"next"},{l:"lang",s:20,e:24,a:"Child",t:"“It stayed on top!” (revision)",r:"next"}]
    };
    var NS="http://www.w3.org/2000/svg",out=document.getElementById("readout"),SW=900,L0=104,R0=16,T0=34,lh=38;
    var x=function(t){return L0+t/30*(SW-L0-R0);};
    var el=function(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;};
    var lane=function(l){return LANES.filter(function(z){return z[0]===l;})[0];};
    var roleTxt={contribution:"Child contribution",response:"Social or material response",next:"Child’s next action",other:"Outside the opportunity"};
    var show=function(ev){out.innerHTML="";[["Actor",ev.a],["Channel",lane(ev.l)[1]],["Time",ev.s.toFixed(1)+"–"+ev.e.toFixed(1)+" s"],["Role",roleTxt[ev.r]],["Event",ev.t]].forEach(function(p){var dt=document.createElement("dt");dt.textContent=p[0];var dd=document.createElement("dd");dd.textContent=p[1];out.appendChild(dt);out.appendChild(dd);});};
    var draw2=function(key){
      while(svg.firstChild)svg.removeChild(svg.firstChild);
      var evs=EP[key];
      [["contribution","Contribution"],["response","Response"],["next","Next action"]].forEach(function(p){
        var es=evs.filter(function(e){return e.r===p[0];}),s=Math.min.apply(null,es.map(function(e){return e.s;})),e=Math.max.apply(null,es.map(function(e){return e.e;}));
        el("rect",{x:x(s),y:T0-4,width:x(e)-x(s),height:LANES.length*lh+4,fill:"var(--soft)",rx:6});
        el("path",{d:"M"+(x(s)+2)+" 20 V12 H"+(x(e)-2)+" V20",fill:"none",stroke:"var(--ink)","stroke-width":1.5});
        el("text",{x:(x(s)+x(e))/2,y:8,"text-anchor":"middle","font-family":"IBM Plex Mono, monospace","font-size":10.5,fill:"var(--muted)"}).textContent=p[1];});
      LANES.forEach(function(ln,i){var y=T0+i*lh;el("line",{x1:L0,x2:SW-R0,y1:y+lh-6,y2:y+lh-6,stroke:"var(--rule)"});
        el("text",{x:L0-12,y:y+lh/2+1,"text-anchor":"end","font-family":"IBM Plex Mono, monospace","font-size":11.5,fill:"var(--ink)"}).textContent=ln[1];});
      var ay=T0+LANES.length*lh+14;
      for(var s=0;s<=30;s+=5){el("line",{x1:x(s),x2:x(s),y1:ay-8,y2:ay-4,stroke:"var(--muted)"});el("text",{x:x(s),y:ay+8,"text-anchor":"middle","font-family":"IBM Plex Mono, monospace","font-size":10.5,fill:"var(--muted)"}).textContent=s+" s";}
      var first=null;
      evs.forEach(function(ev){
        var i=LANES.indexOf(lane(ev.l)),y=T0+i*lh+6,child=ev.a==="Child",col="var("+lane(ev.l)[2]+")";
        var g=el("g",{"class":"ev",tabindex:0,role:"button","aria-label":ev.a+": "+ev.t});
        el("rect",{"class":"b",x:x(ev.s),y:y,width:Math.max(6,x(ev.e)-x(ev.s)),height:lh-16,rx:3,fill:child?col:"var(--surface)",stroke:col,"stroke-width":child?0:2,opacity:ev.r==="other"?0.45:1},g);
        el("text",{x:x(ev.s)+5,y:y+(lh-16)/2+4,"font-family":"IBM Plex Mono, monospace","font-size":10,fill:child?"var(--surface)":"var(--ink)","pointer-events":"none"},g).textContent=ev.a[0];
        var pick=function(){svg.querySelectorAll(".ev").forEach(function(n){n.classList.remove("sel");});g.classList.add("sel");show(ev);};
        g.addEventListener("click",pick);g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();pick();}});
        if(!first&&ev.r==="contribution")first=pick;});
      if(first)first();
    };
    var sb=document.querySelectorAll("[data-f]");
    sb.forEach(function(b){b.addEventListener("click",function(){sb.forEach(function(o){o.setAttribute("aria-pressed",o===b?"true":"false");});draw2(b.getAttribute("data-f"));});});
    draw2("read");
  }
})();
(function(){
  var svg=document.getElementById("netmap");if(!svg)return;
  var edges=[].slice.call(svg.querySelectorAll(".e")),nodes={};
  svg.querySelectorAll(".n").forEach(function(n){nodes[n.getAttribute("data-id")]=n;});
  function on(id){
    svg.classList.add("hl");nodes[id].classList.add("on");
    var nb={};nb[id]=1;
    edges.forEach(function(e){var a=e.getAttribute("data-a"),b=e.getAttribute("data-b");if(a===id||b===id){e.classList.add("on");nb[a]=1;nb[b]=1;}});
    // for a method/data node, also light the other side of its areas lightly
    Object.keys(nb).forEach(function(k){if(nodes[k])nodes[k].classList.add("on");});
  }
  function off(){svg.classList.remove("hl");svg.querySelectorAll(".on").forEach(function(x){x.classList.remove("on");});}
  Object.keys(nodes).forEach(function(id){var n=nodes[id];
    n.addEventListener("mouseenter",function(){off();on(id);});n.addEventListener("focus",function(){off();on(id);});
    n.addEventListener("mouseleave",off);n.addEventListener("blur",off);});
})();
(function(){var s=document.getElementById("aihero");if(s&&window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches&&s.pauseAnimations)s.pauseAnimations();})();
(function(){
  var g=document.querySelector(".mvg"),ph=document.getElementById("ph");if(!g||!ph)return;
  var t=document.getElementById("mvt"),st=document.getElementById("mvs");
  var S=[["shared focus",0,14,"#16323A","#7DD3C4"],["responsiveness",14,30,"#232E37","#B4C2CD"],["shared focus",30,44,"#16323A","#7DD3C4"],["independent activity",44,52,"#3A1C1A","#F2918A"],["responsiveness",52,70,"#232E37","#B4C2CD"],["shared focus",70,88,"#16323A","#7DD3C4"],["responsiveness",88,100,"#232E37","#B4C2CD"]];
  var D=16000,reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function set(f){
    var track=g.querySelector(".mr");var x=track.offsetLeft+f*track.offsetWidth;ph.style.left=x+"px";
    var pct=f*100,sec=f*42;t.textContent="t = 00:"+(sec<10?"0":"")+sec.toFixed(1);
    for(var i=0;i<S.length;i++)if(pct>=S[i][1]&&pct<S[i][2]){st.textContent=S[i][0];st.style.background=S[i][3];st.style.color=S[i][4];break;}
  }
  if(reduce){set(.36);return;}
  var t0=performance.now();(function loop(n){set(((n-t0)%D)/D);requestAnimationFrame(loop);})(t0);
})();
(function(){
  document.querySelectorAll(".mod .relw").forEach(function(d){
    d.addEventListener("click",function(e){
      e.preventDefault();e.stopPropagation();
      if(e.target.closest("summary")) d.open=!d.open;
    });
  });
})();
