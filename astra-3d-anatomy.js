/* ASTRA-VITAL procedural 3D anatomy viewer
   Self-contained WebGL 1 renderer. No external libraries or network access.
   Educational geometric model only; not an anatomical scan or diagnostic tool. */
(() => {
  'use strict';
  const REGIONS = {
    brain:[0,2.38,.30], respiratory:[-.18,1.18,.31], cardio:[.16,.86,.38],
    immune:[0,.27,.30], musculoskeletal:[-.24,-.93,.24], wellbeing:[0,-1.92,.22]
  };
  const C = {
    suit:[.14,.42,.68,1], suitHi:[.28,.66,.88,1], skin:[.58,.76,.88,1],
    bone:[.94,.96,1,1], boneShade:[.66,.79,.91,1], muscle:[.78,.17,.29,1], muscleHi:[1,.39,.48,1],
    red:[.92,.16,.24,1], blue:[.12,.48,.94,1], nerve:[.96,.72,.24,1], nerveHi:[.32,.87,1,1],
    lung:[.89,.42,.56,1], heart:[.92,.19,.31,1], organ:[.60,.34,.24,1], dark:[.018,.055,.10,1],
    cyan:[.20,.80,1,1], purple:[.52,.40,.98,1]
  };
  const $ = (s,r=document)=>r.querySelector(s);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};

  class MeshBuilder {
    constructor(){this.p=[];this.n=[];this.c=[];}
    tri(a,b,c,na,nb,nc,color){
      const face=norm(cross(sub(b,a),sub(c,a)));
      [a,b,c].forEach((p,i)=>{this.p.push(...p);this.n.push(...(i===0?na:i===1?nb:nc || face));this.c.push(...color);});
    }
    sphere(center,scale,color,lat=18,lon=24){
      const v=(phi,theta)=>[Math.cos(phi)*Math.cos(theta),Math.sin(phi),Math.cos(phi)*Math.sin(theta)];
      for(let i=0;i<lat;i++){
        const p0=-Math.PI/2+i*Math.PI/lat,p1=-Math.PI/2+(i+1)*Math.PI/lat;
        for(let j=0;j<lon;j++){
          const t0=j*2*Math.PI/lon,t1=(j+1)*2*Math.PI/lon;
          const make=(ph,th)=>{const u=v(ph,th);return {p:[center[0]+u[0]*scale[0],center[1]+u[1]*scale[1],center[2]+u[2]*scale[2]],n:norm([u[0]/scale[0],u[1]/scale[1],u[2]/scale[2]])};};
          const a=make(p0,t0),b=make(p1,t0),c=make(p1,t1),d=make(p0,t1);
          this.tri(a.p,b.p,c.p,a.n,b.n,c.n,color);this.tri(a.p,c.p,d.p,a.n,c.n,d.n,color);
        }
      }
    }
    rod(a,b,r1,r2,color,segments=12){
      const axis=norm(sub(b,a));let helper=Math.abs(axis[2])<.86?[0,0,1]:[0,1,0];
      const u=norm(cross(axis,helper)),v=norm(cross(axis,u));
      const rings=[];
      for(let end=0;end<2;end++){
        const center=end?b:a,rad=end?r2:r1,ring=[];
        for(let i=0;i<segments;i++){
          const t=i*2*Math.PI/segments,nn=norm(add(mul(u,Math.cos(t)),mul(v,Math.sin(t))));
          ring.push({p:add(center,mul(nn,rad)),n:nn});
        }
        rings.push(ring);
      }
      const A=rings[0],B=rings[1];
      for(let i=0;i<segments;i++){
        const k=(i+1)%segments;this.tri(A[i].p,B[i].p,B[k].p,A[i].n,B[i].n,B[k].n,color);
        this.tri(A[i].p,B[k].p,A[k].p,A[i].n,B[k].n,A[k].n,color);
      }
      // End caps, with normals facing outwards.
      for(let i=0;i<segments;i++){
        const k=(i+1)%segments;
        this.tri(a,A[k].p,A[i].p,mul(axis,-1),mul(axis,-1),mul(axis,-1),color);
        this.tri(b,B[i].p,B[k].p,axis,axis,axis,color);
      }
    }
    tube(points,radius,color){
      for(let i=0;i<points.length-1;i++)this.rod(points[i],points[i+1],radius,radius*.98,color,8);
      if(points.length)this.sphere(points[0],[radius,radius,radius],color,7,10);
      if(points.length)this.sphere(points[points.length-1],[radius,radius,radius],color,7,10);
    }
    ellipsoidBetween(a,b,rx,rz,color){
      const center=mul(add(a,b),.5),axis=norm(sub(b,a)),length=Math.hypot(...sub(b,a));
      const q=this._basis(axis);for(let i=0;i<14;i++){
        const t0=i*2*Math.PI/14,t1=(i+1)*2*Math.PI/14;
        // Build a tapered, rounded muscle using an oriented capsule approximation.
        const p0=add(center,add(mul(q.u,Math.cos(t0)*rx),mul(q.v,Math.sin(t0)*rz)));
        const p1=add(center,add(mul(q.u,Math.cos(t1)*rx),mul(q.v,Math.sin(t1)*rz)));
        const top0=add(p0,mul(axis,length*.48)),top1=add(p1,mul(axis,length*.48));
        const bot0=sub(p0,mul(axis,length*.48)),bot1=sub(p1,mul(axis,length*.48));
        this.tri(bot0,top0,top1, norm(sub(bot0,center)),norm(sub(top0,center)),norm(sub(top1,center)),color);
        this.tri(bot0,top1,bot1,norm(sub(bot0,center)),norm(sub(top1,center)),norm(sub(bot1,center)),color);
      }
      this.sphere(a,[rx,rz,rx],color,9,12);this.sphere(b,[rx,rz,rx],color,9,12);
    }
    limb(path,radii,color,segments=18){
      const rings=[];
      for(let k=0;k<path.length;k++){
        const tangent=norm(sub(path[Math.min(path.length-1,k+1)],path[Math.max(0,k-1)]));
        const helper=Math.abs(tangent[2])<.86?[0,0,1]:[0,1,0];
        const u=norm(cross(tangent,helper)),v=norm(cross(tangent,u)),ring=[];
        for(let j=0;j<segments;j++){
          const t=j*2*Math.PI/segments,rx=radii[k][0],rz=radii[k][1],co=Math.cos(t),si=Math.sin(t);
          const radial=norm(add(mul(u,co/Math.max(.001,rx)),mul(v,si/Math.max(.001,rz))));
          ring.push({p:add(path[k],add(mul(u,co*rx),mul(v,si*rz))),n:radial});
        }
        rings.push(ring);
      }
      for(let k=0;k<rings.length-1;k++)for(let j=0;j<segments;j++){
        const n=(j+1)%segments,a=rings[k][j],b=rings[k+1][j],c=rings[k+1][n],d=rings[k][n];
        this.tri(a.p,b.p,c.p,a.n,b.n,c.n,color);this.tri(a.p,c.p,d.p,a.n,c.n,d.n,color);
      }
      this.sphere(path[0],[radii[0][0],radii[0][0],radii[0][1]],color,12,16);
      this.sphere(path[path.length-1],[radii[radii.length-1][0],radii[radii.length-1][0],radii[radii.length-1][1]],color,12,16);
    }
    torso(rings,color,segments=32){
      const built=rings.map(([y,rx,rz])=>{const ring=[];for(let j=0;j<segments;j++){const t=j*2*Math.PI/segments,co=Math.cos(t),si=Math.sin(t);ring.push({p:[co*rx,y,si*rz],n:norm([co,.08,si])});}return ring;});
      for(let k=0;k<built.length-1;k++)for(let j=0;j<segments;j++){
        const n=(j+1)%segments,a=built[k][j],b=built[k+1][j],c=built[k+1][n],d=built[k][n];
        this.tri(a.p,b.p,c.p,a.n,b.n,c.n,color);this.tri(a.p,c.p,d.p,a.n,c.n,d.n,color);
      }
    }
    _basis(axis){const helper=Math.abs(axis[2])<.86?[0,0,1]:[0,1,0],u=norm(cross(axis,helper));return {u,v:norm(cross(axis,u))};}
    build(){return {positions:new Float32Array(this.p),normals:new Float32Array(this.n),colors:new Float32Array(this.c),count:this.p.length/3};}
  }

  function makeFigure(profile,view){
    const m=new MeshBuilder();
    const female=profile==='female';
    const shoulder=female?.57:.65, hip=female?.43:.36;
    const left=x=>-x;
    const pt=(x,y,z=.0)=>[x,y,z];
    const addBase=(tone=C.suit)=>{
      const isNormalTone=tone===C.suit;
      // Continuous shoulder-to-pelvis torso with a narrower waist and profile-specific proportions.
      m.torso([
        [-.47,hip*.92,.20],[-.34,hip*1.03,.25],[-.17,hip*1.05,.27],
        [.04,.40,.25],[.30,.385,.235],[.56,.43,.25],[.86,shoulder*.88,.285],
        [1.14,shoulder,.30],[1.37,shoulder*.93,.285],[1.53,shoulder*.72,.235],[1.67,.19,.16]
      ],tone,36);
      m.sphere(pt(0,2.34,.005),female?[.285,.385,.26]:[.30,.40,.27],isNormalTone?C.skin:tone,22,28);
      m.limb([pt(0,1.62,-.005),pt(0,1.83,-.005),pt(0,1.98,-.005)],[[.12,.12],[.13,.13],[.15,.14]],tone,16);
      if(isNormalTone){
        // Simple face details on the educational mannequin.
        for(const s of [-1,1]){
          m.sphere(pt(s*.105,2.39,.238),[.046,.033,.018],C.dark,10,14);
          m.sphere(pt(s*.105,2.39,.254),[.018,.018,.010],C.cyan,8,10);
          m.sphere(pt(s*.30,2.31,.01),[.045,.085,.055],C.skin,10,14);
        }
        m.rod(pt(0,2.36,.26),pt(0,2.25,.278),.024,.016,C.suitHi,8);
        m.tube([pt(-.075,2.19,.23),pt(0,2.175,.25),pt(.075,2.19,.23)],.010,C.suitHi);
      }
      // Arms follow a gently curved shoulder–elbow–wrist profile.
      for(const s of [-1,1]){
        const sh=pt(s*shoulder*.91,1.43,.025),mid=pt(s*(shoulder+.04),1.08,.025),el=pt(s*(shoulder+.14),.70,.015),fore=pt(s*(shoulder+.20),.30,.015),wr=pt(s*(shoulder+.23),-.055,.025);
        m.sphere(sh,[.17,.18,.17],tone,14,18);
        m.limb([sh,mid,el],[[.155,.145],[.135,.125],[.105,.10]],tone,18);
        m.sphere(el,[.105,.11,.10],tone,13,16);
        m.limb([el,fore,wr],[[.105,.10],[.092,.09],[.068,.07]],tone,18);
        const hand=pt(wr[0]+s*.018,-.30,.045);
        m.limb([pt(wr[0],-.06,.02),pt(hand[0],-.20,.045),hand],[[.07,.065],[.075,.05],[.060,.045]],isNormalTone?C.skin:tone,14);
        for(let f=0;f<4;f++){const fx=hand[0]+s*(f-1.5)*.031;m.rod(pt(fx,-.34,.06),pt(fx+s*.008,-.46,.06),.014,.009,isNormalTone?C.skin:tone,7);}
        m.rod(pt(hand[0]-s*.06,-.27,.055),pt(hand[0]-s*.10,-.36,.05),.018,.012,isNormalTone?C.skin:tone,7);
        // Legs use tapered, curved lofts instead of straight pipe-like cylinders.
        const hx=s*hip*.58,kx=s*hip*.78,ax=s*hip*.84;
        const hipP=pt(hx,-.30,.015),upper=pt(s*hip*.73,-.62,.035),knee=pt(kx,-1.18,.025),calf=pt(s*hip*.83,-1.70,.015),ankle=pt(ax,-2.23,.005),foot=pt(ax,-2.40,.105);
        m.sphere(hipP,[.16,.19,.16],tone,13,16);
        m.limb([hipP,upper,knee],[[.19,.17],[.19,.17],[.115,.11]],tone,20);
        m.sphere(knee,[.12,.13,.12],tone,13,16);
        m.limb([knee,calf,ankle],[[.12,.115],[.125,.12],[.075,.075]],tone,18);
        m.sphere(ankle,[.075,.095,.08],tone,12,15);
        m.limb([ankle,pt(ax,-2.34,.09),foot],[[.075,.075],[.13,.15],[.10,.22]],tone,16);
      }
      // Subtle suit contour lines make the normal reference read as a finished 3D model.
      if(isNormalTone){
        m.tube([pt(-shoulder*.78,1.42,.22),pt(-.32,1.52,.285),pt(0,1.56,.30),pt(.32,1.52,.285),pt(shoulder*.78,1.42,.22)],.012,C.suitHi);
        m.tube([pt(0,1.18,.30),pt(0,.75,.255),pt(0,.30,.25)],.010,C.suitHi);
        for(const s of [-1,1])m.tube([pt(s*.35,.33,.19),pt(s*.31,-.02,.20),pt(s*.28,-.30,.18)],.009,C.suitHi);
      }
    };
    const addSkeleton=()=>{
      const ivory=C.bone,shade=C.boneShade;
      // Skull and jaw.
      m.sphere(pt(0,2.37,.03),[.275,.34,.235],ivory,18,22);m.sphere(pt(0,2.13,.095),[.22,.14,.19],shade,14,18);
      m.sphere(pt(-.105,2.42,.235),[.07,.085,.025],C.dark,10,12);m.sphere(pt(.105,2.42,.235),[.07,.085,.025],C.dark,10,12);
      m.rod(pt(0,2.31,.25),pt(0,2.20,.25),.025,.016,shade,8);
      m.rod(pt(0,1.95),pt(0,1.70),.075,.065,ivory,10);
      // Vertebrae / spine.
      for(let i=0;i<19;i++){const y=1.63-i*.105;m.sphere(pt(0,y,.025),[.078-i*.0012,.052,.072],i%2?ivory:shade,10,13);}
      // Rib cage with curved arcs.
      for(let r=0;r<7;r++){
        const y=1.43-r*.115, w=.28+r*.035, z=.14;
        for(const s of [-1,1]){
          const pts=[];for(let i=0;i<=12;i++){const t=i/12*Math.PI/2;pts.push(pt(s*w*Math.sin(t),y-.11*Math.sin(t),z+.12*Math.cos(t)));}
          m.tube(pts,.028,ivory);
        }
      }
      m.rod(pt(0,1.48,.20),pt(0,.78,.25),.045,.035,ivory,10);
      // Clavicles, scapulae, arms, hands.
      for(const s of [-1,1]){
        m.rod(pt(0,1.58,.04),pt(s*shoulder,1.53,.02),.048,.04,ivory,10);
        m.rod(pt(s*.48,1.43,-.07),pt(s*.62,.93,-.05),.035,.032,shade,8);
        const sh=pt(s*shoulder,1.48),el=pt(s*(shoulder+.14),.72),wr=pt(s*(shoulder+.23),-.07);
        m.sphere(sh,[.095,.095,.095],ivory,10,12);m.rod(sh,el,.065,.052,ivory);m.sphere(el,[.07,.07,.07],shade,9,12);
        m.rod(el,wr,.047,.035,ivory);m.rod(pt(wr[0]-.05,-.08,.01),pt(wr[0]+.05,-.08,.01),.018,.018,shade,7);
        for(let f=0;f<4;f++){const x=wr[0]+s*(f-1.5)*.027;m.rod(pt(x,-.13,.03),pt(x+s*.012,-.32,.03),.014,.010,ivory,7);}
        const hx=s*hip*.62,kx=s*hip*.78,ax=s*hip*.84;
        const hipP=pt(hx,-.22),knee=pt(kx,-1.18),ankle=pt(ax,-2.25);
        m.sphere(hipP,[.11,.11,.11],shade,10,12);m.rod(hipP,knee,.085,.068,ivory);m.sphere(knee,[.095,.10,.09],ivory,10,12);
        m.rod(knee,ankle,.06,.042,ivory);m.rod(pt(ax-.04,-2.20,.02),pt(ax+.04,-2.20,.02),.035,.035,shade,8);
        for(let toe=0;toe<4;toe++){const tx=ax+s*(toe-1.5)*.035;m.rod(pt(tx,-2.30,.08),pt(tx,-2.47,.12),.018,.012,ivory,7);}
      }
      // Pelvic girdle: iliac crests, sacrum and acetabular joints.
      m.sphere(pt(0,-.28,.035),[.105,.22,.09],shade,13,16);
      for(const s of [-1,1]){
        const pelvisPath=[pt(s*.34,-.10,.02),pt(s*.39,-.24,.055),pt(s*.32,-.40,.07),pt(s*.20,-.49,.055),pt(s*.09,-.42,.04)];
        m.tube(pelvisPath,.047,ivory);m.sphere(pt(s*hip*.58,-.30,.04),[.105,.105,.10],shade,11,14);
        // Femur with a visible neck and head; tibia and fibula are separate.
        const h=pt(s*hip*.58,-.30,.04),k=pt(s*hip*.78,-1.18,.045),a=pt(s*hip*.84,-2.22,.015);
        m.rod(pt(s*.12,-.38,.06),h,.052,.048,ivory,10);m.rod(h,k,.073,.060,ivory,12);m.sphere(k,[.092,.10,.09],shade,11,14);
        m.rod(k,a,.050,.037,ivory,11);m.rod(pt(s*hip*.89,-1.23,-.02),pt(s*hip*.90,-2.18,-.025),.026,.022,shade,9);
        m.sphere(a,[.06,.075,.07],ivory,10,13);
        for(let toe=0;toe<4;toe++){const tx=a[0]+s*(toe-1.5)*.032;m.rod(pt(tx,-2.28,.06),pt(tx,-2.45,.15),.019,.013,ivory,7);}
      }
    };
    const addMuscles=()=>{
      const muscle=C.muscle,hi=C.muscleHi;
      // Pectoral muscle groups: paired, tapered meshes rather than round markers.
      for(const s of [-1,1]){
        m.limb([pt(0,1.35,.32),pt(s*.22,1.34,.32),pt(s*.47,1.20,.27)],[[.16,.075],[.19,.095],[.12,.07]],hi,20);
        m.sphere(pt(s*shoulder*.92,1.45,.08),[.16,.18,.15],muscle,16,20);
        const armA=pt(s*shoulder*.92,1.43,.08),armB=pt(s*(shoulder+.14),.72,.05),armC=pt(s*(shoulder+.23),-.04,.05);
        m.limb([armA,pt(s*(shoulder+.06),1.10,.09),armB],[[.125,.105],[.13,.11],[.09,.08]],hi,18);
        m.limb([armB,pt(s*(shoulder+.19),.32,.05),armC],[[.09,.08],[.078,.07],[.06,.055]],muscle,18);
        // Abdominal wall and external obliques.
        m.limb([pt(s*.12,.94,.265),pt(s*.13,.66,.265),pt(s*.12,.39,.245)],[[.075,.065],[.07,.06],[.055,.05]],hi,14);
        m.limb([pt(s*.34,.76,.20),pt(s*.30,.42,.20),pt(s*.25,.14,.18)],[[.07,.05],[.065,.05],[.045,.04]],muscle,12);
        const hipP=pt(s*hip*.58,-.29,.04),upper=pt(s*hip*.72,-.64,.07),knee=pt(s*hip*.78,-1.18,.04),calf=pt(s*hip*.83,-1.72,.045),ankle=pt(s*hip*.84,-2.18,.02);
        // Quadriceps and hamstring muscle groups.
        m.limb([hipP,upper,knee],[[.17,.13],[.17,.145],[.10,.095]],hi,20);
        m.limb([pt(s*hip*.60,-.34,-.15),pt(s*hip*.70,-.73,-.14),pt(s*hip*.78,-1.14,-.12)],[[.13,.10],[.14,.10],[.085,.075]],muscle,16);
        // Calf groups follow the lower-leg contour.
        m.limb([knee,calf,ankle],[[.105,.09],[.11,.10],[.06,.055]],muscle,18);
        m.limb([pt(s*hip*.80,-1.28,-.09),pt(s*hip*.83,-1.67,-.08),pt(s*hip*.84,-2.12,-.04)],[[.07,.065],[.08,.07],[.045,.04]],hi,14);
      }
      m.sphere(pt(-.22,1.37,.27),[.11,.13,.08],hi,14,18);m.sphere(pt(.22,1.37,.27),[.11,.13,.08],hi,14,18);
      // Deltoid, neck and upper-back contour groups.
      m.limb([pt(-.28,1.62,.12),pt(0,1.70,.12),pt(.28,1.62,.12)],[[.08,.07],[.09,.07],[.08,.07]],muscle,14);
    };
    const addCirculation=()=>{
      m.sphere(pt(-.22,1.13,.12),[.22,.35,.15],C.lung,15,18);m.sphere(pt(.22,1.13,.12),[.22,.35,.15],C.lung,15,18);
      m.sphere(pt(.13,.87,.38),[.16,.22,.14],C.heart,16,18);
      m.sphere(pt(-.03,.25,.18),[.34,.20,.17],C.organ,14,18);
      // Arterial red and venous blue pathways.
      m.tube([pt(0,.72,.36),pt(0,1.28,.34),pt(0,1.55,.27),pt(-.18,1.66,.22)],.035,C.red);
      m.tube([pt(.02,.78,.40),pt(.22,.97,.34),pt(.37,1.05,.22),pt(.48,1.43,.10)],.024,C.red);
      m.tube([pt(.02,.75,.38),pt(-.22,.98,.34),pt(-.38,1.05,.22),pt(-.50,1.42,.10)],.024,C.blue);
      m.tube([pt(0,.70,.35),pt(.06,.25,.28),pt(.06,-.28,.18),pt(.28,-1.10,.12),pt(.30,-2.15,.06)],.027,C.red);
      m.tube([pt(-.05,.70,.35),pt(-.08,.24,.28),pt(-.08,-.28,.18),pt(-.28,-1.10,.12),pt(-.30,-2.15,.06)],.027,C.blue);
      m.tube([pt(.02,1.0,.33),pt(.33,1.18,.20),pt(.55,1.12,.10)],.018,C.red);
      m.tube([pt(-.02,1.0,.33),pt(-.33,1.18,.20),pt(-.55,1.12,.10)],.018,C.blue);
    };
    const addNerves=()=>{
      // Brain lobes and spinal cord.
      m.sphere(pt(-.10,2.42,.08),[.17,.20,.17],C.purple,15,18);m.sphere(pt(.10,2.42,.08),[.17,.20,.17],C.cyan,15,18);
      m.tube([pt(0,2.20,.10),pt(0,1.76,.13),pt(0,1.34,.18),pt(0,.92,.20),pt(0,.48,.18),pt(0,.02,.14),pt(0,-.52,.10),pt(0,-1.10,.08),pt(0,-1.78,.06),pt(0,-2.18,.05)],.045,C.nerve);
      for(const s of [-1,1]){
        m.tube([pt(0,1.55,.16),pt(s*.30,1.42,.16),pt(s*.52,1.23,.12),pt(s*.65,.85,.10),pt(s*.75,.38,.08)],.022,C.nerveHi);
        m.tube([pt(0,.05,.14),pt(s*.22,-.12,.14),pt(s*.33,-.48,.12),pt(s*.34,-.92,.10),pt(s*.38,-1.35,.08),pt(s*.40,-2.12,.06)],.025,C.nerveHi);
        m.tube([pt(s*.22,1.43,.16),pt(s*.40,1.15,.12),pt(s*.56,.95,.08)],.013,C.nerve);
        m.tube([pt(s*.30,-.5,.12),pt(s*.48,-.72,.10),pt(s*.52,-1.1,.08)],.013,C.nerve);
      }
    };

    if(view==='normal'){addBase();}
    else if(view==='skeleton'){addSkeleton();}
    else if(view==='muscular'){addBase([.16,.31,.46,1]);addMuscles();}
    else if(view==='circulation'){addBase([.16,.30,.45,1]);addCirculation();}
    else if(view==='nervous'){addBase([.15,.29,.44,1]);addNerves();}
    else {addBase([.13,.27,.42,1]);addSkeleton();addMuscles();addCirculation();addNerves();}
    return m.build();
  }

  let canvas,gl,ctx,program,buffer,locations,stage,wrap,pointerLayer;
  let profile='male',view='normal',mesh=null,auto=true,micro=false,rotY=-.08,rotX=.02,distance=8.2,drag=null,lastTime=0,frame=0;
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
  function initGL(){
    gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:false});
    if(!gl)return false;
    const vs=`attribute vec4 aClip; attribute vec4 aColor; varying vec4 vColor; void main(){gl_Position=aClip;vColor=aColor;}`;
    const fs=`precision mediump float; varying vec4 vColor; void main(){gl_FragColor=vColor;}`;
    program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);buffer=gl.createBuffer();locations={clip:gl.getAttribLocation(program,'aClip'),color:gl.getAttribLocation(program,'aColor')};
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
    return true;
  }
  function resize(){
    if(!canvas||!stage)return;
    const rect=stage.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.8),w=Math.max(2,Math.round(rect.width*dpr)),h=Math.max(2,Math.round(rect.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;}
    if(gl)gl.viewport(0,0,canvas.width,canvas.height);
    if(ctx)ctx.imageSmoothingEnabled=true;
    positionPointers();
  }
  const rotate=(p,ry,rx)=>{
    const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
    const x=p[0]*cy+p[2]*sy,z0=-p[0]*sy+p[2]*cy;
    return [x,p[1]*cx-z0*sx,p[1]*sx+z0*cx];
  };
  function project(p){
    if(!canvas)return null;
    const r=stage.getBoundingClientRect(),aspect=Math.max(.1,r.width/r.height),v=rotate(p,rotY,rotX),cam=distance-v[2],f=2.75;
    if(cam<=.2)return null;
    const nx=(v[0]*f/cam)/aspect,ny=v[1]*f/cam;
    return {x:(nx*.5+.5)*r.width,y:(.5-ny*.5)*r.height,visible:nx>-.98&&nx<.98&&ny>-.98&&ny<.98};
  }
  function positionPointers(){
    if(!pointerLayer||!stage)return;
    pointerLayer.querySelectorAll('.body-hotspot-v3').forEach(btn=>{
      const p=project(REGIONS[btn.dataset.region]||[0,0,0]);if(!p)return;
      btn.style.left=`${p.x}px`;btn.style.top=`${p.y}px`;btn.style.display=p.visible?'grid':'none';
      const preferredSide=btn.dataset.labelSide||'right';
      btn.dataset.side=p.x>stage.clientWidth*.72?'left':p.x<stage.clientWidth*.28?'right':preferredSide;
    });
  }
  function makeFrameData(time){
    if(!mesh)return null;
    const d=distance,aspect=canvas.width/canvas.height,near=.1,far=40,f=2.75;
    const cy=Math.cos(rotY),sy=Math.sin(rotY),cx=Math.cos(rotX),sx=Math.sin(rotX);
    const out=new Float32Array(mesh.count*8),p=mesh.positions,n=mesh.normals,c=mesh.colors;
    const lx=-.35,ly=.72,lz=.60,ll=Math.hypot(lx,ly,lz),L=[lx/ll,ly/ll,lz/ll];
    for(let i=0,j=0;i<p.length;i+=3,j+=8){
      const x=p[i],y=p[i+1],z=p[i+2];
      const x1=x*cy+z*sy,z0=-x*sy+z*cy,y1=y*cx-z0*sx,z1=y*sx+z0*cx;
      const cam=d-z1,inv=1/Math.max(.2,cam),nx=(x1*f*inv)/aspect,ny=y1*f*inv;
      const A=-(far+near)/(far-near),B=-(2*far*near)/(far-near),zclip=A*(-cam)+B;
      out[j]=x1*f/aspect;out[j+1]=y1*f;out[j+2]=zclip;out[j+3]=cam;
      const nx0=n[i]*cy+n[i+2]*sy,nz0=-n[i]*sy+n[i+2]*cy,ny0=n[i+1]*cx-nz0*sx,nz1=n[i+1]*sx+nz0*cx;
      const nl=Math.hypot(nx0,ny0,nz1)||1,ndl=Math.max(0,(nx0*L[0]+ny0*L[1]+nz1*L[2])/nl);
      const shade=.70+.46*ndl;
      const ci=(i/3)*4;
      out[j+4]=Math.min(1,c[ci]*shade+.018);out[j+5]=Math.min(1,c[ci+1]*shade+.018);out[j+6]=Math.min(1,c[ci+2]*shade+.025);out[j+7]=c[ci+3];
    }
    return out;
  }
  let lastCanvasDraw=0;
  function renderCanvas(data){
    if(!ctx||!data)return;
    // Software 3D fallback: project the same real triangle mesh into a Canvas2D
    // viewport and painter-sort its faces. Drag/zoom/rotation still operate in 3D.
    const w=canvas.width,h=canvas.height,triangles=[];
    for(let i=0;i<data.length;i+=24){
      const v0=i,v1=i+8,v2=i+16,cam0=data[v0+3],cam1=data[v1+3],cam2=data[v2+3];
      if(cam0<=.2||cam1<=.2||cam2<=.2)continue;
      const pts=[v0,v1,v2].map(k=>[(data[k]/data[k+3]*.5+.5)*w,(.5-data[k+1]/data[k+3]*.5)*h]);
      const depth=(cam0+cam1+cam2)/3;
      const r=Math.round((data[v0+4]+data[v1+4]+data[v2+4])*85),g=Math.round((data[v0+5]+data[v1+5]+data[v2+5])*85),b=Math.round((data[v0+6]+data[v1+6]+data[v2+6])*85);
      triangles.push({pts,depth,color:`rgb(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)})`});
    }
    triangles.sort((a,b)=>b.depth-a.depth);
    ctx.clearRect(0,0,w,h);
    for(const tri of triangles){ctx.beginPath();ctx.moveTo(tri.pts[0][0],tri.pts[0][1]);ctx.lineTo(tri.pts[1][0],tri.pts[1][1]);ctx.lineTo(tri.pts[2][0],tri.pts[2][1]);ctx.closePath();ctx.fillStyle=tri.color;ctx.fill();}
  }
  function render(t){
    if(!canvas)return;
    const dt=Math.min(.05,(t-lastTime)/1000||0);lastTime=t;
    if(auto&&!drag&&!reduced())rotY+=dt*.22;
    const bob=micro&&!reduced()?Math.sin(t*.0015)*.055:0;
    if(mesh){
      const data=makeFrameData(t);
      if(data){if(bob){for(let i=0;i<data.length;i+=8)data[i+1]+=bob*2.75;}
        if(gl){gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(locations.clip);gl.vertexAttribPointer(locations.clip,4,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(locations.color);gl.vertexAttribPointer(locations.color,4,gl.FLOAT,false,32,16);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
        else if(ctx && (t-lastCanvasDraw>32 || !lastCanvasDraw)){renderCanvas(data);lastCanvasDraw=t;}
      }
    } else if(gl)gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    positionPointers();frame=requestAnimationFrame(render);
  }
  function setView(v){view=v;mesh=makeFigure(profile,view);positionPointers();}
  function setProfile(p){profile=p;mesh=makeFigure(profile,view);positionPointers();}
  function setMotion(a,m){auto=!!a;micro=!!m;}
  function reset(){rotY=-.08;rotX=.02;distance=8.2;auto=true;micro=false;}
  function onDown(e){if(e.button!==undefined&&e.button!==0)return;drag={x:e.clientX,y:e.clientY,ry:rotY,rx:rotX};canvas.setPointerCapture?.(e.pointerId);}
  function onMove(e){if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;rotY=drag.ry+dx*.008;rotX=clamp(drag.rx+dy*.006,-.72,.72);positionPointers();}
  function onUp(){drag=null;}
  function onWheel(e){e.preventDefault();distance=clamp(distance+Math.sign(e.deltaY)*.35,6.4,11.5);positionPointers();}
  function init(){
    stage=$('#bodyVisualStage');wrap=$('#bodyImageWrap');pointerLayer=$('#anatomyPointerLayer');canvas=$('#astraAnatomy3DCanvas');
    if(!stage||!wrap||!pointerLayer||!canvas)return false;
    try{
      if(!initGL()){
        // Reliable offline fallback for browsers or school laptops without WebGL.
        ctx=canvas.getContext('2d',{alpha:true});
        if(!ctx){showFallback('This browser cannot create a graphics canvas. Please use an updated Chrome or Edge browser.');return false;}
      }
    }catch(err){
      console.warn('WebGL unavailable; using the built-in software 3D renderer.',err);
      ctx=canvas.getContext('2d',{alpha:true});
      if(!ctx){showFallback('The 3D renderer could not start. Try an updated Chrome or Edge browser.');return false;}
    }
    canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);canvas.addEventListener('wheel',onWheel,{passive:false});
    let ro;if('ResizeObserver'in window){ro=new ResizeObserver(resize);ro.observe(stage);}window.addEventListener('resize',resize,{passive:true});
    resize();mesh=makeFigure(profile,view);frame=requestAnimationFrame(render);return true;
  }
  function showFallback(message){const box=document.createElement('div');box.className='astra-3d-fallback';box.textContent=message;wrap?.appendChild(box);}
  window.Astra3D={init,resize,setView,setProfile,setMotion,reset,positionPointers,getState:()=>({profile,view,auto,micro,rotation:[rotX,rotY],distance})};
})();
