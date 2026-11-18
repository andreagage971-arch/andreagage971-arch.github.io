import{S as L,O as N,W as q,B as O,e as $,b as A,D as B,f as w,L as T,g as S,h as R,i as I,j as z,H as k,V as D,k as _,N as G,G as j}from"./three.module-Cb1j8Ivz.js";import{i as H,E,S as W}from"./index-DJm5XhBs.js";const x=4,U=1,Z=`
  in vec3 position;
  out vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,p=`
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  out vec4 sortie;
`,C=`
  float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  float bruit(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  // Rotationnel du bruit : un champ de petits tourbillons, sans source ni puits.
  vec2 remous(vec2 q) {
    const float e = 0.35;
    return vec2(bruit(q + vec2(0.0, e)) - bruit(q - vec2(0.0, e)), bruit(q - vec2(e, 0.0)) - bruit(q + vec2(e, 0.0))) / (2.0 * e);
  }
`,K=`${p}
  uniform sampler2D uSource;
  void main() {
    sortie = texture(uSource, vUv);
  }
`,Q=`${p}
  uniform sampler2D uVitesse;
  uniform vec2 uEchelle;
  uniform float uDt;
  uniform float uAmorti;
  uniform float uRefroidi;
  uniform float uTrainee;
  void main() {
    vec2 origine = vUv - uDt * texture(uVitesse, vUv).xy * uEchelle;
    vec4 v = texture(uVitesse, origine);
    // Traînée : freine fort les grandes vitesses, la simulation ne peut pas s'emballer.
    float m = dot(v.xy, v.xy);
    sortie = vec4(v.xy * uAmorti / (1.0 + uDt * uTrainee * m), v.z * uRefroidi, 0.0);
  }
`,X=`${p}
  uniform sampler2D uVitesse;
  uniform vec2 uTexel;
  void main() {
    float g = texture(uVitesse, vUv - vec2(uTexel.x, 0.0)).y;
    float d = texture(uVitesse, vUv + vec2(uTexel.x, 0.0)).y;
    float b = texture(uVitesse, vUv - vec2(0.0, uTexel.y)).x;
    float h = texture(uVitesse, vUv + vec2(0.0, uTexel.y)).x;
    sortie = vec4(0.5 * (d - g - h + b), 0.0, 0.0, 1.0);
  }
`,J=`${p}
  uniform sampler2D uVitesse;
  uniform sampler2D uTourbillon;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform float uDt;
  uniform float uTemps;
  uniform float uConfinement;
  uniform float uFlottaison;
  uniform float uVent;
  uniform float uChaleur;
  uniform float uTurbulence;
  uniform vec4 uBuses[${x}];
  uniform vec4 uBusesVitesse[${x}];
  ${C}

  vec2 vent(vec2 p, float t) {
    float a = sin(p.y * 3.1 + t * 0.23 + 1.7 * sin(p.x * 1.9 - t * 0.113));
    float b = sin(p.x * 4.3 - t * 0.31 + 1.3 * sin(p.y * 2.7 + t * 0.171));
    float c = sin((p.x + p.y) * 7.7 + t * 0.41 + sin(p.y * 5.3 - t * 0.293));
    float d = sin((p.x - p.y) * 9.1 - t * 0.37 + sin(p.x * 6.1 + t * 0.197));
    return vec2(a + 0.55 * c, 0.6 * b + 0.55 * d);
  }

  void main() {
    vec4 v = texture(uVitesse, vUv);
    float w = texture(uTourbillon, vUv).x;
    float wg = abs(texture(uTourbillon, vUv - vec2(uTexel.x, 0.0)).x);
    float wd = abs(texture(uTourbillon, vUv + vec2(uTexel.x, 0.0)).x);
    float wb = abs(texture(uTourbillon, vUv - vec2(0.0, uTexel.y)).x);
    float wh = abs(texture(uTourbillon, vUv + vec2(0.0, uTexel.y)).x);
    vec2 n = vec2(wd - wg, wh - wb);
    n /= length(n) + 1e-5;
    vec2 f = uConfinement * w * vec2(n.y, -n.x);
    f.y += uFlottaison * v.z;
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    f += uVent * vent(p, uTemps);
    // Turbulence dans l'air chaud : c'est elle qui fait rouler les volutes au lieu de monter en colonnes lisses.
    float t = uTemps;
    vec2 tourmente = remous(p * 7.0 + vec2(t * 0.21, -t * 0.47)) + 0.75 * remous(p * 15.0 + vec2(-t * 0.37, -t * 0.83)) + 0.5 * remous(p * 31.0 + vec2(t * 0.59, -t * 1.27));
    f += uTurbulence * tourmente * (smoothstep(0.03, 0.5, v.z) + 0.06);
    v.xy += f * uDt;
    for (int i = 0; i < ${x}; i++) {
      vec2 d = p - uBuses[i].xy;
      float g = exp(-dot(d, d) / (uBuses[i].z * uBuses[i].z)) * uBuses[i].w;
      v.xy += uBusesVitesse[i].xy * g * uDt;
      v.z += uChaleur * g * uDt;
    }
    sortie = v;
  }
`,Y=`${p}
  uniform sampler2D uVitesse;
  uniform vec2 uTexel;
  uniform float uExpansion;
  void main() {
    float g = texture(uVitesse, vUv - vec2(uTexel.x, 0.0)).x;
    float d = texture(uVitesse, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture(uVitesse, vUv - vec2(0.0, uTexel.y)).y;
    float h = texture(uVitesse, vUv + vec2(0.0, uTexel.y)).y;
    sortie = vec4(0.5 * (d - g + h - b) - uExpansion * texture(uVitesse, vUv).z, 0.0, 0.0, 1.0);
  }
`,ee=`${p}
  uniform sampler2D uPression;
  uniform sampler2D uDivergence;
  uniform vec2 uTexel;
  void main() {
    float g = texture(uPression, vUv - vec2(uTexel.x, 0.0)).x;
    float d = texture(uPression, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture(uPression, vUv - vec2(0.0, uTexel.y)).x;
    float h = texture(uPression, vUv + vec2(0.0, uTexel.y)).x;
    vec2 bord = min(vUv, 1.0 - vUv) / uTexel;
    float ouvert = step(1.0, min(bord.x, bord.y));
    sortie = vec4(ouvert * 0.25 * (g + d + b + h - texture(uDivergence, vUv).x), 0.0, 0.0, 1.0);
  }
`,te=`${p}
  uniform sampler2D uVitesse;
  uniform sampler2D uPression;
  uniform vec2 uTexel;
  void main() {
    float g = texture(uPression, vUv - vec2(uTexel.x, 0.0)).x;
    float d = texture(uPression, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture(uPression, vUv - vec2(0.0, uTexel.y)).x;
    float h = texture(uPression, vUv + vec2(0.0, uTexel.y)).x;
    vec4 v = texture(uVitesse, vUv);
    v.xy -= 0.5 * vec2(d - g, h - b);
    sortie = v;
  }
`,se=`${p}
  uniform sampler2D uVitesse;
  uniform float uAspect;
  uniform float uTemps;
  uniform float uDetail;
  uniform float uFinesse;
  ${C}
  void main() {
    vec4 v = texture(uVitesse, vUv);
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    vec2 q = p - vec2(uTemps * 0.013, uTemps * 0.1);
    // uFinesse suit la grille : un remous plus fin qu'elle ne peut le représenter dessinerait des chevrons réguliers.
    vec2 d = remous(q * uFinesse * 0.43 + vec2(0.0, uTemps * 0.53)) + 0.6 * remous(q.yx * uFinesse - vec2(uTemps * 0.71, 0.0));
    // Plus de remous près de la source, là où le jet serait sinon trop régulier.
    float pres = 1.0 + 2.2 * (1.0 - smoothstep(0.0, 0.4, p.y));
    sortie = vec4(v.xy + uDetail * pres * d * (0.2 + min(length(v.xy) * 6.0, 1.0)), 0.0, 1.0);
  }
`,ie=`${p}
  uniform sampler2D uFumee;
  uniform sampler2D uVitesse;
  uniform vec2 uEchelle;
  uniform float uDt;
  void main() {
    sortie = texture(uFumee, vUv - uDt * texture(uVitesse, vUv).xy * uEchelle);
  }
`,ue=`${p}
  uniform sampler2D uFumee;
  uniform sampler2D uTransportee;
  uniform sampler2D uVitesse;
  uniform vec2 uEchelle;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform float uDt;
  uniform float uTemps;
  uniform float uAmortiDense;
  uniform float uAmortiFin;
  uniform float uEffacement;
  uniform float uEmission;
  uniform float uEmissionFine;
  uniform vec4 uBuses[${x}];
  uniform vec4 uBusesVitesse[${x}];
  ${C}

  void main() {
    vec2 v = texture(uVitesse, vUv).xy;
    vec2 pas = uDt * v * uEchelle;
    vec4 transportee = texture(uTransportee, vUv);
    vec4 retour = texture(uTransportee, vUv + pas);
    // Correction forte sur les filaments (ils restent fins), faible sur le corps dense (il reste doux et vaporeux).
    vec4 corrigee = transportee + vec4(0.14, 0.47, 0.3, 0.3) * (texture(uFumee, vUv) - retour);

    // Limiteur : jamais au-delà des quatre valeurs d'origine, sinon le schéma oscille.
    vec2 origine = vUv - pas;
    vec2 m = (floor(origine / uTexel - 0.5) + 0.5) * uTexel;
    vec4 a = texture(uFumee, m);
    vec4 b = texture(uFumee, m + vec2(uTexel.x, 0.0));
    vec4 c = texture(uFumee, m + vec2(0.0, uTexel.y));
    vec4 d = texture(uFumee, m + uTexel);
    vec4 f = clamp(corrigee, min(min(a, b), min(c, d)), max(max(a, b), max(c, d)));

    // Dissipation : plus forte vers le haut ; le retrait constant efface les voiles résiduels au lieu de les laisser traîner.
    float haut = smoothstep(0.55, 1.0, vUv.y);
    float dense = max(f.r * mix(uAmortiDense, uAmortiDense * uAmortiDense, haut) - uEffacement * uDt, 0.0);
    float fin = max(f.g * mix(uAmortiFin, uAmortiFin * uAmortiFin, haut) - uEffacement * 0.6 * uDt, 0.0);
    f.ba *= (dense + fin) / max(f.r + f.g, 1e-4);
    f.r = dense;
    f.g = fin;

    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    for (int i = 0; i < ${x}; i++) {
      vec2 e = p - uBuses[i].xy;
      float r = uBuses[i].z;
      float g = exp(-dot(e, e) / (r * r));
      if (g < 0.004) continue;
      float s = uBuses[i].w * uDt;
      float graine = float(i) * 17.3;
      // Matière irrégulière : les grumeaux et les fibres émis ici deviennent les nuances et les filaments étirés plus haut.
      float grumeaux = bruit(p * vec2(26.0, 16.0) + vec2(graine, uTemps * 0.9)) * 0.65 + bruit(p * vec2(61.0, 37.0) - vec2(uTemps * 1.3, graine)) * 0.35;
      // Fibres ondulées : émises droites, elles formeraient un peigne de fils parallèles en montant.
      vec2 pf = p + vec2(0.012 * sin(p.y * 41.0 + uTemps * 2.3 + graine), 0.0);
      float fibres = bruit(pf * vec2(150.0, 30.0) + vec2(graine - uTemps * 2.3, uTemps * 3.1));
      // Nuance locale : autour de la teinte de la buse, les couleurs voisines du dégradé se croisent dans le jet.
      float nuance = (bruit(p * 11.0 + vec2(graine, -uTemps * 0.8)) - 0.5) * 0.26;
      float angle = 6.28318 * (uBusesVitesse[i].z + nuance);
      float dose = g * s * uEmission * (0.25 + 1.3 * grumeaux);
      f.r += dose;
      f.ba += dose * vec2(cos(angle), sin(angle));
      // Filaments : surtout sur le pourtour du jet, là où le cisaillement les étire.
      float pourtour = smoothstep(0.08, 0.4, g) * smoothstep(0.98, 0.45, g);
      float fil = pourtour * s * uEmissionFine * pow(fibres, 4.0) * 6.0;
      f.g += fil;
      f.ba += fil * vec2(cos(angle + 0.3), sin(angle + 0.3));
    }

    // Rien ne revient par les bords du domaine.
    vec2 bord = smoothstep(vec2(0.0), vec2(0.015), min(vUv, 1.0 - vUv));
    sortie = f * bord.x * bord.y;
  }
`,re=`${p}
  uniform sampler2D uSource;
  uniform vec2 uTexel;
  uniform float uFin;
  void main() {
    vec4 s = texture(uSource, vUv) * 4.0;
    vec2 e = uTexel;
    s += texture(uSource, vUv + vec2(-e.x, -e.y)) + texture(uSource, vUv + vec2(e.x, -e.y));
    s += texture(uSource, vUv + vec2(-e.x, e.y)) + texture(uSource, vUv + vec2(e.x, e.y));
    s += 2.0 * (texture(uSource, vUv + vec2(-2.0 * e.x, 0.0)) + texture(uSource, vUv + vec2(2.0 * e.x, 0.0)));
    s += 2.0 * (texture(uSource, vUv + vec2(0.0, -2.0 * e.y)) + texture(uSource, vUv + vec2(0.0, 2.0 * e.y)));
    s /= 16.0;
    sortie = vec4(s.r + uFin * s.g, s.g, 0.0, 1.0);
  }
`,ae=`${p}
  uniform sampler2D uFlou1;
  uniform sampler2D uFlou2;
  uniform vec2 uTexel1;
  uniform vec2 uTexel2;
  uniform vec3 uDirection;
  uniform vec2 uPasOmbre;
  uniform float uModele;
  uniform float uForceOmbre;

  void main() {
    vec2 e1 = uTexel1 * 1.5;
    vec2 e2 = uTexel2 * 1.5;
    vec2 g1 = vec2(texture(uFlou1, vUv + vec2(e1.x, 0.0)).r - texture(uFlou1, vUv - vec2(e1.x, 0.0)).r, texture(uFlou1, vUv + vec2(0.0, e1.y)).r - texture(uFlou1, vUv - vec2(0.0, e1.y)).r);
    vec2 g2 = vec2(texture(uFlou2, vUv + vec2(e2.x, 0.0)).r - texture(uFlou2, vUv - vec2(e2.x, 0.0)).r, texture(uFlou2, vUv + vec2(0.0, e2.y)).r - texture(uFlou2, vUv - vec2(0.0, e2.y)).r);
    vec3 n = normalize(vec3(-(g1 * 0.8 + g2 * 1.6) * uModele, 1.0));
    float modele = clamp(dot(n, uDirection), 0.0, 1.0);

    // Ombre : la lumière traverse le volume en direction du pixel et s'y atténue.
    float optique = 0.0;
    vec2 q = vUv;
    float poids = 1.0;
    for (int i = 0; i < 7; i++) {
      q += uPasOmbre;
      optique += texture(uFlou2, q).r * poids;
      poids *= 0.86;
    }
    float ombre = exp(-optique * uForceOmbre);

    sortie = vec4(ombre, modele, texture(uFlou2, vUv).r, texture(uFlou1, vUv).g);
  }
`,oe=`${p}
  uniform sampler2D uFumee1;
  uniform sampler2D uLumiere1;
  uniform sampler2D uFumee2;
  uniform sampler2D uLumiere2;
  uniform sampler2D uPalette;
  uniform sampler2D uSpectre;
  uniform vec2 uTexel1;
  uniform vec4 uCadre1;
  uniform vec4 uCadre2;
  uniform float uDeuxNappes;
  uniform float uLigne;
  uniform float uLigneFondu;
  uniform float uOnde;
  uniform float uAccent;
  uniform vec4 uZones[${U}];
  uniform float uAspect;
  uniform float uDensite;
  uniform float uBrillance;
  uniform float uRelief;
  uniform vec3 uSoleil;
  uniform vec3 uDominante;

  /**
   * Couleur d'un point selon le vecteur de teinte transporté : le spectre de toutes les puffs, ou (uAccent) la palette de la puff
   * choisie. Dans la pénombre, elle glisse vers sa version sombre : un jaune peu éclairé tournerait au kaki sur le noir.
   */
  vec3 couleurDe(vec2 v, float matiere, float hauteur, float lumiere) {
    float t = fract(atan(v.y, v.x) / 6.28318 + 1.0);
    float k = smoothstep(0.06, 0.62, lumiere);
    vec3 c = mix(texture(uSpectre, vec2(t, 0.75)).rgb, texture(uSpectre, vec2(t, 0.25)).rgb, k);
    if (uAccent > 0.001) {
      vec3 puff = mix(uDominante, texture(uPalette, vec2(t, hauteur * 0.5 + 0.25)).rgb, k);
      c = mix(c, puff, uAccent);
    }
    c = pow(c, vec3(2.2));
    // Teintes opposées mêlées : le vecteur s'annule, la fumée vire au gris plutôt qu'à une couleur sans rapport.
    float pur = smoothstep(0.1, 0.55, length(v) / max(matiere, 0.003));
    return mix(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), c, pur);
  }

  void main() {
    float hauteur = smoothstep(0.05, 0.9, vUv.y);

    // Nappe du fond : large, douce, moins éclairée.
    vec3 fondCouleur = vec3(0.0);
    float fondAlpha = 0.0;
    if (uDeuxNappes > 0.5) {
      vec2 uv2 = uCadre2.xy + (vUv - 0.5) * uCadre2.zw;
      vec4 d2 = texture(uFumee2, uv2);
      float r2 = max(d2.r, 0.0) + 0.5 * max(d2.g, 0.0);
      vec4 l2 = texture(uLumiere2, uv2);
      fondAlpha = (1.0 - exp(-pow(r2, 1.35) * 1.8 * uDensite)) * 0.5;
      float e2 = mix(0.12, 1.0, l2.r) * (0.45 + 0.85 * l2.g);
      fondCouleur = couleurDe(d2.ba, max(d2.r, 0.0) + max(d2.g, 0.0), hauteur, e2 * fondAlpha * 1.6) * e2;
    }

    // Nappe de devant.
    vec2 uv = uCadre1.xy + (vUv - 0.5) * uCadre1.zw;
    vec4 d = texture(uFumee1, uv);
    float dense = max(d.r, 0.0);
    float fin = max(d.g, 0.0);
    vec4 l = texture(uLumiere1, uv);
    float ombre = l.r;
    float modele = l.g;
    float large = l.b;

    vec2 e = uTexel1 * 2.0;
    float dg = texture(uFumee1, uv - vec2(e.x, 0.0)).r;
    float dd = texture(uFumee1, uv + vec2(e.x, 0.0)).r;
    float db = texture(uFumee1, uv - vec2(0.0, e.y)).r;
    float dh = texture(uFumee1, uv + vec2(0.0, e.y)).r;
    vec2 pente = vec2(dd - dg, dh - db);
    // Petit relief de surface : les grumeaux de la matière accrochent la lumière.
    float relief = clamp(dot(normalize(vec3(-pente * uRelief, 1.0)), uSoleil), 0.0, 1.0);

    // La couleur reste celle du visuel : la lumière la creuse ou l'avive, sans la blanchir.
    float eclairage = mix(0.14, 1.3, ombre) * (0.34 + 0.85 * modele + 0.34 * relief);
    // Le cœur d'une masse épaisse s'assombrit : le volume se lit par ce dégradé.
    eclairage *= mix(1.0, 0.55, smoothstep(0.1, 0.75, large));
    // Puissance : le voile très léger s'efface, le noir reste franc entre les masses.
    float alphaDense = 1.0 - exp(-pow(dense, 1.35) * 1.75 * uDensite);
    vec3 couleur = couleurDe(d.ba, dense + fin, hauteur, eclairage * alphaDense) * eclairage;

    // Filaments : un voile large reste translucide ; seuls les fils plus fins que leur entourage brillent.
    float pli = max(fin - l.a * 1.04, 0.0);
    float alphaFin = (1.0 - exp(-(fin * 0.42 + pli * 3.4) * uDensite)) * 0.86;
    vec3 couleurFin = mix(couleurDe(d.ba, dense + fin, hauteur, alphaFin * 1.5), vec3(1.0), 0.05) * (0.7 + 0.9 * ombre);

    // Composition de l'arrière vers l'avant.
    vec3 p = fondCouleur * fondAlpha;
    float a = fondAlpha;
    p = couleur * alphaDense + p * (1.0 - alphaDense);
    a = alphaDense + a * (1.0 - alphaDense);
    p = couleurFin * alphaFin + p * (1.0 - alphaFin);
    a = alphaFin + a * (1.0 - alphaFin);
    p *= uBrillance;

    // Limite haute : la fumée n'existe qu'en dessous du contenu de l'accueil. Le bord ondule doucement pour ne jamais former une ligne droite.
    float x = vUv.x * uAspect;
    float bord = vUv.y + 0.012 * sin(x * 5.0 + uOnde) + 0.006 * sin(x * 11.0 - uOnde * 1.7);
    float k = 1.0 - smoothstep(uLigne - uLigneFondu - 0.018, uLigne - 0.018, bord);
    // Atténuation locale derrière les textes, sans bord visible.
    for (int i = 0; i < ${U}; i++) {
      if (uZones[i].z <= 0.0) continue;
      vec2 q = max(abs(vUv - uZones[i].xy) - uZones[i].zw, 0.0) * vec2(uAspect, 1.0);
      k *= mix(0.24, 1.0, smoothstep(0.0, 0.1, length(q)));
    }
    p *= k;
    a *= k;

    // Conversion vers l'écran + léger tramage : aucun escalier de couleur dans les noirs.
    vec3 c = p / max(a, 1e-3);
    c = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
    float tramage = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5;
    sortie = vec4(c * a + tramage / 255.0 * step(0.002, a), a);
  }
`;function de(){const l=window.matchMedia("(pointer: coarse)").matches,e=Math.min(window.innerWidth,window.innerHeight)<700,i=navigator,t=(i.hardwareConcurrency??8)<=4||(i.deviceMemory??8)<=4;return l||e?t?{mailles:11e3,points:17e4,iterations:10,nappes:1,maxPixelRatio:1,fpsMax:30}:{mailles:18e3,points:38e4,iterations:12,nappes:2,maxPixelRatio:1.5,fpsMax:30}:t?{mailles:36e3,points:56e4,iterations:14,nappes:2,maxPixelRatio:1,fpsMax:45}:{mailles:64e3,points:11e5,iterations:20,nappes:2,maxPixelRatio:1.5,fpsMax:60}}const m={flottaison:.14,chaleur:1.3,poussee:.09,expansion:.17,vieMouvement:7,vieChaleur:3.5,vieDense:9,vieFin:6,effacement:.03,confinement:1.4,trainee:7,vent:.005,turbulence:.07,detail:.009,emission:7.5,emissionFine:6,modele:16,relief:16,ombre:.3,brillance:1.3};function ne(l,e){const i=l<.9;return e===0?i?[{x:.16,y:-.01,r:.06,s:.39,g:7.9,d:-.33},{x:.52,y:0,r:.062,s:.39,g:1.3,d:0},{x:.86,y:-.01,r:.06,s:.39,g:13.1,d:.33}]:[{x:.22,y:-.01,r:.08,s:.82,g:7.9,d:-.33},{x:.6,y:0,r:.088,s:.88,g:1.3,d:0},{x:.93,y:-.01,r:.072,s:.76,g:13.1,d:.33}]:i?[{x:.32,y:-.02,r:.066,s:.34,g:23.7,d:-.17},{x:.7,y:-.02,r:.066,s:.34,g:31.1,d:.17}]:[{x:.05,y:-.02,r:.085,s:.72,g:37.3,d:-.5},{x:.41,y:-.03,r:.095,s:.72,g:23.7,d:-.17},{x:.78,y:-.02,r:.09,s:.72,g:31.1,d:.17}]}function F(l){return(Math.sin(l)+.6*Math.sin(l*1.618+1.3)+.35*Math.sin(l*2.718+4.1))/1.95}function le(l){const e=/SwiftShader|llvmpipe|softpipe|Software|Basic Render/i;if(e.test(String(l.getParameter(l.RENDERER)??"")))return!0;const i=l.getExtension("WEBGL_debug_renderer_info");return!!i&&e.test(String(l.getParameter(i.UNMASKED_RENDERER_WEBGL)??""))}function V(l){const e=parseInt(l.slice(1),16),i=s=>{const c=s/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4},[t,r,a]=[i(e>>16&255),i(e>>8&255),i(e&255)],o=Math.cbrt(.4122214708*t+.5363325363*r+.0514459929*a),u=Math.cbrt(.2119034982*t+.6806995451*r+.1073969566*a),n=Math.cbrt(.0883024619*t+.2817188376*r+.6299787005*a);return[.2104542553*o+.793617785*u-.0040720468*n,1.9779984951*o-2.428592205*u+.4505937099*n,.0259040371*o+.7827717662*u-.808675766*n]}function y(l,e,i,t,r){const a=(l+.3963377774*e+.2158037573*i)**3,o=(l-.1055613458*e-.0638541728*i)**3,u=(l-.0894841775*e-1.291485548*i)**3,n=s=>{const c=Math.min(1,Math.max(0,s));return Math.round(255*(c<=.0031308?12.92*c:1.055*c**(1/2.4)-.055))};t[r]=n(4.0767416621*a-3.3077115913*o+.2309699292*u),t[r+1]=n(-1.2684380046*a+2.6097574011*o-.3413193965*u),t[r+2]=n(-.0041960863*a-.7034186147*o+1.707614701*u),t[r+3]=255}const ce=.16,v=128,me=1.3,ve=3;function fe(l){const e=l.couleurs.map(V),i=l.poids.map(n=>Math.max(n,.08)),t=i.reduce((n,s)=>n+s,0),r=i.map(n=>n/t),a=[];let o=0;for(let n=0;n<r.length-1;n++)a.push(o+=r[n]);const u=new Float32Array(v*3);for(let n=0;n<v;n++){const s=1-Math.abs(2*n/v-1),c=[...e[0]];a.forEach((h,f)=>{const d=Math.min(r[f],r[f+1])*.75;let g=Math.min(1,Math.max(0,(s-h+d)/(2*d)));g=g*g*(3-2*g);for(let b=0;b<3;b++)c[b]+=(e[f+1][b]-e[f][b])*g}),u.set(c,n*3)}return u}function he(){const l=W.map(V).map(([a,o,u])=>[Math.min(.84,Math.max(.62,a)),o,u]),e=l.length,i=new Uint8Array(v*2*4),t=new Float32Array(v*3);for(let a=0;a<v;a++){const o=a/v*e,u=Math.floor(o);let n=o-u;n=n*n*(3-2*n);const s=l[u],c=l[(u+1)%e],[h,f,d]=[0,1,2].map(M=>s[M]+(c[M]-s[M])*n);t.set([h,f,d],a*3),y(h,f,d,i,a*4);let g=Math.atan2(d,f);const b=Math.hypot(f,d),P=Math.max(0,1-Math.abs(g-1.75)/.55);g-=P*.75,y(h,b*Math.cos(g),b*Math.sin(g),i,(v+a)*4)}const r=new B(i,v,2,w);return r.magFilter=T,r.minFilter=T,r.wrapS=S,r.needsUpdate=!0,{texture:r,oklab:t}}class ge{constructor(e,i){this.scene=new L,this.camera=new N(-1,1,1,-1,0,1),this.m={},this.nappes=[],this.spectre=he(),this.teinte=0,this.teinteCible=0,this.paletteBas=new Float32Array(v*3),this.paletteHaut=new Float32Array(v*3),this.paletteCible=new Float32Array(v*3),this.paletteEnCours=!1,this.dominante=new Float32Array(3),this.dominanteCible=[0,0,0],this.echelleFumee=1,this.largeur=0,this.hauteur=0,this.format=1,this.temps=0,this.progression=0,this.frame=0,this.last=0,this.running=!1,this.lentes=0,this.surImage=null,this.tick=h=>{var d;if(!this.running)return;if(H(h,this.last,this.qualite.fpsMax)){this.frame=requestAnimationFrame(this.tick);return}const f=Math.min(.1,(h-this.last)/1e3);this.last=h,f>1.7/this.qualite.fpsMax?this.lentes++:this.lentes=Math.max(0,this.lentes-1),this.lentes>45&&(this.alleger(),this.lentes=0),(d=this.surImage)==null||d.call(this,f),this.majPalette(f),this.avancer(Math.min(f,1/20)),this.rendre(),this.frame=requestAnimationFrame(this.tick)},this.qualite=i,this.iterations=i.iterations,this.nbNappes=i.nappes,this.renderer=new q({canvas:e,alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"low-power",failIfMajorPerformanceCaveat:!0});const t=this.renderer.getContext();if(le(t))throw this.renderer.dispose(),this.renderer.forceContextLoss(),new Error("WebGL en rendu logiciel, scène désactivée.");this.renderer.autoClear=!1,this.pixelRatio=Math.min(window.devicePixelRatio||1,i.maxPixelRatio),this.renderer.setPixelRatio(this.pixelRatio),this.renderer.setClearColor(0,0);const r=this.cible(4,4);this.renderer.setRenderTarget(r);const a=t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE;if(this.renderer.setRenderTarget(null),r.dispose(),!a)throw this.renderer.dispose(),this.renderer.forceContextLoss(),new Error("Rendu flottant indisponible, scène désactivée.");this.geometrie=new O,this.geometrie.setAttribute("position",new $(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));const o=(h,f)=>new _({glslVersion:j,vertexShader:`precision highp float;
${Z}`,fragmentShader:h,uniforms:f,depthTest:!1,depthWrite:!1,blending:G}),u=h=>({value:h}),n=()=>u(new D),s=()=>u(null),c=()=>({uBuses:u(new Float32Array(x*4)),uBusesVitesse:u(new Float32Array(x*4))});this.m.copie=o(K,{uSource:s()}),this.m.advectionVitesse=o(Q,{uVitesse:s(),uEchelle:n(),uDt:u(0),uAmorti:u(1),uRefroidi:u(1),uTrainee:u(0)}),this.m.tourbillon=o(X,{uVitesse:s(),uTexel:n()}),this.m.forces=o(J,{uVitesse:s(),uTourbillon:s(),uTexel:n(),uAspect:u(1),uDt:u(0),uTemps:u(0),uConfinement:u(0),uFlottaison:u(0),uVent:u(0),uChaleur:u(0),uTurbulence:u(0),...c()}),this.m.divergence=o(Y,{uVitesse:s(),uTexel:n(),uExpansion:u(0)}),this.m.pression=o(ee,{uPression:s(),uDivergence:s(),uTexel:n()}),this.m.gradient=o(te,{uVitesse:s(),uPression:s(),uTexel:n()}),this.m.fine=o(se,{uVitesse:s(),uAspect:u(1),uTemps:u(0),uDetail:u(0),uFinesse:u(50)}),this.m.advectionFumee=o(ie,{uFumee:s(),uVitesse:s(),uEchelle:n(),uDt:u(0)}),this.m.correction=o(ue,{uFumee:s(),uTransportee:s(),uVitesse:s(),uEchelle:n(),uTexel:n(),uAspect:u(1),uDt:u(0),uTemps:u(0),uAmortiDense:u(1),uAmortiFin:u(1),uEffacement:u(0),uEmission:u(0),uEmissionFine:u(0),...c()}),this.m.reduction=o(re,{uSource:s(),uTexel:n(),uFin:u(0)}),this.m.lumiere=o(ae,{uFlou1:s(),uFlou2:s(),uTexel1:n(),uTexel2:n(),uDirection:u(new A(-.42,.62,.66).normalize()),uPasOmbre:n(),uModele:u(1),uForceOmbre:u(1)}),this.paletteTexture=new B(new Uint8Array(v*2*4),v,2,w),this.paletteTexture.magFilter=T,this.paletteTexture.minFilter=T,this.paletteTexture.wrapS=S,this.m.affichage=o(oe,{uFumee1:s(),uLumiere1:s(),uFumee2:s(),uLumiere2:s(),uPalette:u(this.paletteTexture),uSpectre:u(this.spectre.texture),uAccent:u(0),uZones:u(new Float32Array(U*4)),uAspect:u(1),uTexel1:n(),uCadre1:u(new R),uCadre2:u(new R),uDeuxNappes:u(1),uLigne:u(2),uLigneFondu:u(ce),uOnde:u(0),uDensite:u(E.fumee.densite),uBrillance:u(m.brillance),uDominante:u(new A),uRelief:u(m.relief),uSoleil:u(new A(-.42,.62,.66).normalize())}),this.triangle=new I(this.geometrie,this.m.copie),this.triangle.frustumCulled=!1,this.scene.add(this.triangle)}cible(e,i){return new z(e,i,{type:k,format:w,minFilter:T,magFilter:T,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1})}passe(e,i){this.triangle.material=e,e.uniformsNeedUpdate=!0,this.renderer.setRenderTarget(i),this.renderer.render(this.scene,this.camera)}dimensions(e){const i=Math.max(8,Math.round(Math.sqrt(e/this.format)));return[Math.max(8,Math.round(i*this.format)),i]}construireNappe(e,i){const[t,r]=this.dimensions(this.qualite.mailles*(e?.45:1)),[a,o]=this.dimensions(this.qualite.points*this.echelleFumee*(e?.22:1)),[u,n]=this.dimensions(this.qualite.mailles*(e?1.5:6)),c={buses:ne(this.format,e),uniBuses:new Float32Array(x*4),uniBusesVitesse:new Float32Array(x*4),vitesse:[this.cible(t,r),this.cible(t,r)],tourbillon:this.cible(t,r),divergence:this.cible(t,r),pression:[this.cible(t,r),this.cible(t,r)],fumee:[this.cible(a,o),this.cible(a,o)],transportee:this.cible(a,o),flou1:this.cible(Math.ceil(a/4),Math.ceil(o/4)),flou2:this.cible(Math.ceil(a/8),Math.ceil(o/8)),lumiere:this.cible(Math.ceil(a/3),Math.ceil(o/3)),fine:this.cible(u,n),texelMaille:new D(1/t,1/r),texelFumee:new D(1/a,1/o),phase:e*41.7};return i?(this.m.copie.uniforms.uSource.value=i.fumee[0].texture,this.passe(this.m.copie,c.fumee[0]),this.m.copie.uniforms.uSource.value=i.vitesse[0].texture,this.passe(this.m.copie,c.vitesse[0]),this.libererNappe(i)):[c.fumee[0],c.vitesse[0],c.pression[0]].forEach(h=>{this.renderer.setRenderTarget(h),this.renderer.clear()}),c}libererNappe(e){[...e.vitesse,e.tourbillon,e.divergence,...e.pression,...e.fumee,e.transportee,e.flou1,e.flou2,e.lumiere,e.fine].forEach(i=>i.dispose())}construire(){for(let e=0;e<this.nbNappes;e++)this.nappes[e]=this.construireNappe(e,this.nappes[e]);for(;this.nappes.length>this.nbNappes;)this.libererNappe(this.nappes.pop());this.renderer.setRenderTarget(null)}majBuses(e){const i=this.temps+e.phase;e.buses.forEach((t,r)=>{const a=r*4,o=F(i*.47+t.g),u=.3+1.35*Math.max(0,o)**1.4;e.uniBuses[a]=(t.x+.05*F(i*.11+t.g*2.1))*this.format,e.uniBuses[a+1]=t.y,e.uniBuses[a+2]=t.r*(.82+.28*F(i*.23+t.g*.7)),e.uniBuses[a+3]=t.s*u;const n=.5*F(i*.19+t.g*3.1);e.uniBusesVitesse[a]=m.poussee*n,e.uniBusesVitesse[a+1]=m.poussee,e.uniBusesVitesse[a+2]=this.teinte+t.d+.11*F(i*.21+t.g*1.9)});for(let t=e.buses.length;t<x;t++)e.uniBuses[t*4+3]=0}pas(e,i){const{m:t}=this,r=new D(1/this.format,1),a=1/e.texelMaille.y,o=E.fumee.vitesse,u=i*o,n=this.temps+e.phase;this.majBuses(e);let s=t.advectionVitesse.uniforms;s.uVitesse.value=e.vitesse[0].texture,s.uEchelle.value.copy(r),s.uDt.value=u,s.uAmorti.value=Math.exp(-u/m.vieMouvement),s.uRefroidi.value=Math.exp(-u/m.vieChaleur),s.uTrainee.value=m.trainee,this.passe(t.advectionVitesse,e.vitesse[1]),e.vitesse.reverse(),s=t.tourbillon.uniforms,s.uVitesse.value=e.vitesse[0].texture,s.uTexel.value.copy(e.texelMaille),this.passe(t.tourbillon,e.tourbillon),s=t.forces.uniforms,s.uVitesse.value=e.vitesse[0].texture,s.uTourbillon.value=e.tourbillon.texture,s.uTexel.value.copy(e.texelMaille),s.uAspect.value=this.format,s.uDt.value=u,s.uTemps.value=n,s.uConfinement.value=m.confinement*a/200,s.uFlottaison.value=m.flottaison,s.uVent.value=m.vent,s.uChaleur.value=m.chaleur,s.uTurbulence.value=m.turbulence,s.uBuses.value=e.uniBuses,s.uBusesVitesse.value=e.uniBusesVitesse,this.passe(t.forces,e.vitesse[1]),e.vitesse.reverse(),s=t.divergence.uniforms,s.uVitesse.value=e.vitesse[0].texture,s.uTexel.value.copy(e.texelMaille),s.uExpansion.value=m.expansion*e.texelMaille.y,this.passe(t.divergence,e.divergence),s=t.pression.uniforms,s.uDivergence.value=e.divergence.texture,s.uTexel.value.copy(e.texelMaille);for(let c=0;c<this.iterations;c++)s.uPression.value=e.pression[0].texture,this.passe(t.pression,e.pression[1]),e.pression.reverse();s=t.gradient.uniforms,s.uVitesse.value=e.vitesse[0].texture,s.uPression.value=e.pression[0].texture,s.uTexel.value.copy(e.texelMaille),this.passe(t.gradient,e.vitesse[1]),e.vitesse.reverse(),s=t.fine.uniforms,s.uVitesse.value=e.vitesse[0].texture,s.uAspect.value=this.format,s.uTemps.value=n,s.uDetail.value=m.detail,s.uFinesse.value=e.fine.height/8,this.passe(t.fine,e.fine),s=t.advectionFumee.uniforms,s.uFumee.value=e.fumee[0].texture,s.uVitesse.value=e.fine.texture,s.uEchelle.value.copy(r),s.uDt.value=u,this.passe(t.advectionFumee,e.transportee),s=t.correction.uniforms,s.uFumee.value=e.fumee[0].texture,s.uTransportee.value=e.transportee.texture,s.uVitesse.value=e.fine.texture,s.uEchelle.value.copy(r),s.uTexel.value.copy(e.texelFumee),s.uAspect.value=this.format,s.uDt.value=u,s.uTemps.value=n,s.uAmortiDense.value=Math.exp(-u/m.vieDense),s.uAmortiFin.value=Math.exp(-u/m.vieFin),s.uEffacement.value=m.effacement,s.uEmission.value=m.emission,s.uEmissionFine.value=m.emissionFine,s.uBuses.value=e.uniBuses,s.uBusesVitesse.value=e.uniBusesVitesse,this.passe(t.correction,e.fumee[1]),e.fumee.reverse()}eclairer(e){const{m:i}=this;let t=i.reduction.uniforms;t.uSource.value=e.fumee[0].texture,t.uTexel.value.copy(e.texelFumee).multiplyScalar(1.5),t.uFin.value=.35,this.passe(i.reduction,e.flou1),t.uSource.value=e.flou1.texture,t.uTexel.value.set(e.flou1.texture.image.width,e.flou1.texture.image.height),t.uTexel.value.set(1/t.uTexel.value.x,1/t.uTexel.value.y),t.uFin.value=0,this.passe(i.reduction,e.flou2),t=i.lumiere.uniforms,t.uFlou1.value=e.flou1.texture,t.uFlou2.value=e.flou2.texture,t.uTexel1.value.set(1/e.flou1.width,1/e.flou1.height),t.uTexel2.value.set(1/e.flou2.width,1/e.flou2.height);const r=t.uDirection.value;t.uPasOmbre.value.set(r.x/Math.hypot(r.x,r.y)*.022/this.format,r.y/Math.hypot(r.x,r.y)*.022),t.uModele.value=m.modele,t.uForceOmbre.value=m.ombre,this.passe(i.lumiere,e.lumiere)}cadre(e,i,t){const r=.88/i;e.set(.5,.5+t+(1-r)*.12,r,r)}rendre(){if(!this.nappes.length)return;this.nappes.forEach(a=>this.eclairer(a));const e=this.m.affichage.uniforms,i=this.nappes[0],t=this.nappes[1];e.uFumee1.value=i.fumee[0].texture,e.uLumiere1.value=i.lumiere.texture,e.uTexel1.value.copy(i.texelFumee),e.uDeuxNappes.value=t?1:0,e.uFumee2.value=(t??i).fumee[0].texture,e.uLumiere2.value=(t??i).lumiere.texture;const r=this.progression;this.cadre(e.uCadre1.value,1+r*.28,-r*.03),this.cadre(e.uCadre2.value,1+r*.12,-r*.012),this.passe(this.m.affichage,null)}avancer(e){this.temps+=e*E.fumee.vitesse,this.teinteCible+=e*E.fumee.rotationCouleurs;const i=((this.teinteCible-this.teinte+.5)%1+1)%1-.5;this.teinte+=i*(1-Math.exp(-e/1.5)),this.nappes.forEach(t=>this.pas(t,e)),this.m.affichage.uniforms.uOnde.value=this.temps*.23,this.renderer.setRenderTarget(null)}prechauffer(e,i=1/15){for(let t=0;t<e;t++)this.avancer(i)}get tempsSimule(){return this.temps}setPalette(e,i=!1){if(this.paletteCible=fe(e),this.dominanteCible=V(e.couleurs[e.poids.indexOf(Math.max(...e.poids))]),this.teinteCible=this.positionDansSpectre(this.dominanteCible),i){this.teinte=this.teinteCible,this.paletteBas.set(this.paletteCible),this.paletteHaut.set(this.paletteCible),this.dominante.set(this.dominanteCible),this.ecrirePalette(),this.paletteEnCours=!1,this.running||this.rendre();return}this.paletteEnCours=!0}positionDansSpectre([,e,i]){let t=0,r=1/0;for(let a=0;a<v;a++){const o=(this.spectre.oklab[a*3+1]-e)**2+(this.spectre.oklab[a*3+2]-i)**2;o<r&&([r,t]=[o,a])}return t/v}majPalette(e){if(!this.paletteEnCours)return;const i=1-Math.exp(-e/me),t=1-Math.exp(-e/ve);let r=0;for(let a=0;a<this.paletteCible.length;a++){const o=this.paletteCible[a];this.paletteBas[a]+=(o-this.paletteBas[a])*i,this.paletteHaut[a]+=(o-this.paletteHaut[a])*t,r=Math.max(r,Math.abs(o-this.paletteHaut[a]))}for(let a=0;a<3;a++)this.dominante[a]+=(this.dominanteCible[a]-this.dominante[a])*t;this.ecrirePalette(),r<.0015&&(this.paletteEnCours=!1)}ecrirePalette(){const e=this.paletteTexture.image.data;for(let t=0;t<v;t++){const r=t*3;y(this.paletteBas[r],this.paletteBas[r+1],this.paletteBas[r+2],e,t*4),y(this.paletteHaut[r],this.paletteHaut[r+1],this.paletteHaut[r+2],e,(v+t)*4)}this.paletteTexture.needsUpdate=!0;const i=new Uint8Array(4);y(this.dominante[0],this.dominante[1],this.dominante[2],i,0),this.m.affichage.uniforms.uDominante.value.set((i[0]/255)**2.2,(i[1]/255)**2.2,(i[2]/255)**2.2)}resize(e,i){if(!e||!i||e===this.largeur&&this.hauteur&&Math.abs(i-this.hauteur)<160)return;this.largeur=e,this.hauteur=i,this.renderer.setSize(e,i,!1);const t=e/i;(!this.nappes.length||Math.abs(t/this.format-1)>.04)&&(this.format=t,this.m.affichage.uniforms.uAspect.value=t,this.construire()),this.rendre()}setProgression(e){const i=Math.min(1,Math.max(0,e));i!==this.progression&&(this.progression=i,!this.running&&this.nappes.length&&this.rendre())}setLigne(e){const i=this.hauteur||window.innerHeight,t=1-e/i,r=this.m.affichage.uniforms.uLigne;r.value!==t&&(r.value=t,!this.running&&this.nappes.length&&this.rendre())}setAccent(e){this.m.affichage.uniforms.uAccent.value=e}setZones(e){const i=this.m.affichage.uniforms.uZones.value;let t=!1;e.slice(0,U).forEach((r,a)=>{for(let o=0;o<4;o++){const u=r?r[o]:0;i[a*4+o]!==u&&(i[a*4+o]=u,t=!0)}}),t&&!this.running&&this.nappes.length&&this.rendre()}start(){this.running||(this.running=!0,this.last=performance.now(),this.frame=requestAnimationFrame(this.tick))}stop(){this.running=!1,cancelAnimationFrame(this.frame)}alleger(){this.pixelRatio>1?(this.pixelRatio=Math.max(1,this.pixelRatio-.25),this.renderer.setPixelRatio(this.pixelRatio)):this.iterations>8?this.iterations=Math.max(8,this.iterations-4):this.nbNappes>1?(this.nbNappes=1,this.construire()):this.echelleFumee>.4?(this.echelleFumee*=.7,this.construire()):this.pixelRatio>.75&&(this.pixelRatio=.75,this.renderer.setPixelRatio(this.pixelRatio))}dispose(){this.stop(),this.nappes.forEach(e=>this.libererNappe(e)),this.nappes.length=0,Object.values(this.m).forEach(e=>e.dispose()),this.paletteTexture.dispose(),this.spectre.texture.dispose(),this.geometrie.dispose(),this.renderer.dispose()}}export{ge as FumeeFluide,m as REGLAGES,de as choisirQualiteFumee};
