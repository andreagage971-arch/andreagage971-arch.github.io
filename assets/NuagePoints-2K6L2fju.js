import{S as A,P as L,V as l,R as z,a as F,b as n,W as T,c as q,d as B,B as S,e as _,M as V}from"./three.module-Cb1j8Ivz.js";import{E as u,f as j,i as G}from"./index-2Onf6UjF.js";function O(){const r=window.matchMedia("(pointer: coarse)").matches,e=Math.min(window.innerWidth,window.innerHeight)<700,i=navigator,t=(i.hardwareConcurrency??8)<=4||(i.deviceMemory??8)<=4;return r||e?{pasEcran:t?6.5:5.5,pointsMax:t?9e3:16e3,maxPixelRatio:t?1.5:2,fpsMax:30}:{pasEcran:t?8.5:7.5,pointsMax:t?3e4:6e4,maxPixelRatio:t?1.25:1.5,fpsMax:60}}function W(r){const e=/SwiftShader|llvmpipe|softpipe|Software|Basic Render/i;if(e.test(String(r.getParameter(r.RENDERER)??"")))return!0;const i=r.getExtension("WEBGL_debug_renderer_info");return!!i&&e.test(String(r.getParameter(i.UNMASKED_RENDERER_WEBGL)??""))}const N="#030303",C=34,c=new n(0,0,-2),k=new n(0,11,7.2),I=`
  uniform float uTemps;
  uniform float uAmplitude;
  uniform float uVitesse;
  uniform float uLumiere;
  uniform vec2 uSouris;
  uniform float uSourisForce;
  uniform float uTaille;
  uniform vec2 uProfondeur;
  varying float vLum;
  varying float vBord;
  varying float vAlpha;

  // Crête arrondie mais étroite : forme les replis nets de la matière.
  float crete(float phase) {
    return exp(2.4 * (sin(phase) - 1.0));
  }

  // La nappe : plusieurs ondes lentes combinées. Les décalages horizontaux resserrent les points
  // sur les crêtes, comme une étoffe qui se plisse. Fonctions du temps sans raccord : aucun saut.
  vec3 nappe(vec2 p) {
    float t = uTemps * uVitesse;
    vec2 q = p + vec2(sin(p.y * 0.23 + t * 0.07), cos(p.x * 0.19 - t * 0.06)) * 1.25;

    float a = dot(q, vec2(0.78, 0.62)) * 0.66 - t * 0.17;
    float b = dot(q, vec2(-0.45, 0.89)) * 0.98 - t * 0.13;
    float c = dot(q, vec2(0.96, -0.28)) * 1.46 + t * 0.21;
    float d = dot(q, vec2(0.25, 0.97)) * 2.35 - t * 0.27;
    float e = dot(q, vec2(-0.82, -0.57)) * 0.84 + t * 0.11;

    float h = sin(a) * 0.72 + sin(b) * 0.42 + sin(c) * 0.16 + sin(d) * 0.045;
    h += crete(e) * 1.05 + crete(b + 1.7) * 0.42;

    vec2 g = vec2(0.78, 0.62) * cos(a) * 0.52
           + vec2(-0.45, 0.89) * cos(b) * 0.3
           + vec2(0.96, -0.28) * cos(c) * 0.12
           + vec2(-0.82, -0.57) * crete(e) * cos(e) * 0.4;

    float m = length(p - uSouris);
    h += uSourisForce * exp(-m * m * 0.2) * 0.7;

    return vec3(p.x + g.x * uAmplitude, h * uAmplitude, p.y + g.y * uAmplitude);
  }

  void main() {
    const float E = 0.1;
    vec3 s = nappe(position.xz);
    vec3 n = normalize(cross(nappe(position.xz + vec2(0.0, E)) - s, nappe(position.xz + vec2(E, 0.0)) - s));

    vec4 vue = modelViewMatrix * vec4(s, 1.0);
    float distance = -vue.z;
    vec3 versCamera = normalize(cameraPosition - s);

    // Lumière rasante, reflet sur les reliefs et lisière claire là où la nappe se dérobe.
    vec3 L = normalize(vec3(-0.66, 0.46, -0.38));
    float face = dot(n, versCamera);
    float diffus = max(dot(n, L), 0.0);
    float reflet = pow(max(dot(n, normalize(L + versCamera)), 0.0), 26.0);
    float lisiere = pow(1.0 - abs(face), 2.6);
    float creux = mix(0.4, 1.0, smoothstep(-1.15, 1.0, s.y / max(uAmplitude, 0.01)));
    // 0 au fond de la scène, 1 au premier plan.
    float pres = 1.0 - smoothstep(uProfondeur.x, uProfondeur.y, distance);

    float lum = (0.075 + (0.17 * diffus + 0.13 * lisiere + 0.24 * reflet) * uLumiere) * creux;
    lum *= mix(0.5, 1.0, pres);
    if (face < 0.0) lum *= 0.55; // envers d'un repli
    vLum = min(lum, 0.42);

    gl_Position = projectionMatrix * vue;
    float taille = uTaille * mix(0.82, 1.08, pres) * (0.86 + 0.5 * reflet + 0.3 * diffus) / distance;
    // Sous 1,6 pixel, le point ne rétrécit plus : il s'estompe (pas de scintillement).
    gl_PointSize = max(taille, 1.6);
    vAlpha = mix(0.72, 1.0, pres) * clamp(taille / 1.6, 0.25, 1.0);
    vBord = min(0.9, 2.0 / gl_PointSize);
  }
`,D=`
  precision mediump float;
  varying float vLum;
  varying float vBord;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(1.0 - vBord, 1.0, d);
    if (a <= 0.0) discard;
    // Modelé de petite sphère : le centre plus clair que le bord.
    gl_FragColor = vec4(vec3(vLum * (1.08 - 0.34 * d * d)), a * vAlpha);
  }
`;class K{constructor(e,i){if(this.scene=new A,this.camera=new L(C,1,.1,90),this.uniforms={uTemps:{value:0},uAmplitude:{value:u.fond.intensite},uVitesse:{value:u.fond.vitesse},uLumiere:{value:u.fond.lumiere},uSouris:{value:new l(0,-40)},uSourisForce:{value:0},uTaille:{value:1},uProfondeur:{value:new l(10,22)}},this.rayon=new z,this.plan=new F(new n(0,1,0),0),this.sourisCible=new l(0,-40),this.ndc=new l,this.impact=new n,this.sourisForceCible=0,this.densite=1,this.frame=0,this.last=0,this.running=!1,this.lentes=0,this.largeur=0,this.hauteur=0,this.pas=.1,this.surfaceConstruite=0,this.formatConstruit=0,this.tick=t=>{if(!this.running)return;const s=j()?Math.min(30,this.qualite.fpsMax):this.qualite.fpsMax;if(G(t,this.last,s)){this.frame=requestAnimationFrame(this.tick);return}const a=Math.min(.1,(t-this.last)/1e3);this.last=t,this.uniforms.uTemps.value+=a;const o=1-Math.exp(-a*2.5);this.uniforms.uSouris.value.lerp(this.sourisCible,o),this.uniforms.uSourisForce.value+=(this.sourisForceCible-this.uniforms.uSourisForce.value)*o,a>1.7/s?this.lentes++:this.lentes=Math.max(0,this.lentes-1),this.lentes>45&&(this.alleger(),this.lentes=0),this.render(),this.frame=requestAnimationFrame(this.tick)},this.qualite=i,this.renderer=new T({canvas:e,antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"low-power",failIfMajorPerformanceCaveat:!0}),W(this.renderer.getContext()))throw this.renderer.dispose(),this.renderer.forceContextLoss(),new Error("WebGL en rendu logiciel, scène désactivée.");this.pixelRatio=Math.min(window.devicePixelRatio||1,i.maxPixelRatio),this.renderer.setPixelRatio(this.pixelRatio),this.renderer.setClearColor(N,1),this.materiau=new q({uniforms:this.uniforms,vertexShader:I,fragmentShader:D,transparent:!0,depthTest:!1,depthWrite:!1}),this.points=new B(new S,this.materiau),this.points.frustumCulled=!1,this.scene.add(this.points)}cadrer(e){const i=e<1?1.55:1,t=k.clone().sub(c).multiplyScalar(i).add(c);this.camera.position.copy(t),this.camera.lookAt(c),this.camera.aspect=e,this.camera.updateProjectionMatrix(),this.camera.updateMatrixWorld()}auSol(e,i){const t=new n(e,i,.5).unproject(this.camera).sub(this.camera.position);return this.camera.position.clone().addScaledVector(t,-this.camera.position.y/t.y)}construire(e,i){const t=this.auSol(-1.12,1.12),s=this.auSol(-1.12,-1.12),a=2.2,o=t.z-a,f=s.z+a,p=Math.abs(t.x)+a,P=Math.abs(s.x)+a,d=e*i,R=Math.min(this.qualite.pointsMax,d/this.qualite.pasEcran**2)*this.densite,b=(Math.abs(t.x)+Math.abs(s.x))*(s.z-t.z);this.pas=Math.sqrt(b/Math.max(2e3,R));const y=Math.floor((f-o)/this.pas),v=[];for(let h=0;h<=y;h++){const M=o+h*this.pas,E=p+(P-p)*((M-o)/(f-o)),w=Math.floor(E/this.pas);for(let m=-w;m<=w;m++)v.push(m*this.pas,0,M)}const x=new S;x.setAttribute("position",new _(new Float32Array(v),3)),this.points.geometry.dispose(),this.points.geometry=x;const g=this.camera.position.distanceTo(c);this.uniforms.uProfondeur.value.set(g*.8,g*1.5),this.surfaceConstruite=d,this.formatConstruit=e/i,this.majTaille()}majTaille(){const e=this.hauteur*this.pixelRatio/(2*Math.tan(V.degToRad(C/2)));this.uniforms.uTaille.value=this.pas*.38*e}resize(e,i){if(!e||!i||e===this.largeur&&Math.abs(i-this.hauteur)<160&&this.hauteur)return;this.largeur=e,this.hauteur=i;const t=e/i;this.cadrer(t),this.renderer.setSize(e,i,!1);const s=e*i/(this.surfaceConstruite||1);!this.surfaceConstruite||t<1!=this.formatConstruit<1||Math.abs(t/this.formatConstruit-1)>.12||s>1.35||s<.65?this.construire(e,i):this.majTaille(),this.render()}setPointer(e){if(!e){this.sourisForceCible=0;return}this.rayon.setFromCamera(this.ndc.set(e.x,e.y),this.camera),this.rayon.ray.intersectPlane(this.plan,this.impact)&&(this.sourisCible.set(this.impact.x,this.impact.z),this.sourisForceCible=u.fond.reactionSouris)}start(){this.running||(this.running=!0,this.last=performance.now(),this.frame=requestAnimationFrame(this.tick))}stop(){this.running=!1,cancelAnimationFrame(this.frame)}render(){this.renderer.render(this.scene,this.camera)}alleger(){this.pixelRatio>1?(this.pixelRatio=Math.max(1,this.pixelRatio-.25),this.renderer.setPixelRatio(this.pixelRatio),this.majTaille()):this.densite>.45?(this.densite*=.75,this.construire(this.largeur,this.hauteur)):this.pixelRatio>.75&&(this.pixelRatio=.75,this.renderer.setPixelRatio(this.pixelRatio),this.majTaille())}dispose(){this.stop(),this.points.geometry.dispose(),this.materiau.dispose(),this.renderer.dispose()}}export{K as NuagePoints,O as choisirQualiteFond};
