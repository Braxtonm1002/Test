(() => {
  'use strict';

  // ===================================================================
  // Constants & game data
  // ===================================================================

  const SAVE_KEY = 'slayerClicker.save.v1';
  const KILLS_PER_ZONE = 10;
  const BOSS_TIME = 30;
  const CRIT_MULT = 10;
  const COST_GROWTH = 1.07;
  const UPG_LEVELS = [10, 25, 50, 75, 100];
  const UPG_COST_MULT = [10, 25, 100, 800, 8000];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
  const MILESTONE_START = 200;
  const MILESTONE_STEP = 25;
  const MILESTONE_END = 1000;

  function describeUpgrade(u, heroName) {
    switch (u.type) {
      case 'hero': return `${heroName}'s DPS x${u.val}`;
      case 'click': return `Click damage x${u.val}`;
      case 'global': return `All heroes' DPS +${Math.round(u.val * 100)}%`;
      case 'crit': return `+${Math.round(u.val * 100)}% critical strike chance`;
      case 'clickdps': return `Clicks also deal +${Math.round(u.val * 100)}% of your DPS`;
      case 'gold': return `+${Math.round(u.val * 100)}% gold from demons`;
      default: return '';
    }
  }

  function dpsHero(id, name, title, icon, color, baseCost, baseDps, forms, fifth) {
    const short = name.split(/[ ,&]/)[0];
    const upgrades = forms.map((form, i) => {
      const fx = i < 4 ? { type: 'hero', val: 2 } : (fifth || { type: 'global', val: 0.1 });
      return { lvl: UPG_LEVELS[i], name: form, type: fx.type, val: fx.val, desc: describeUpgrade(fx, short) };
    });
    return { id, name, title, icon, color, baseCost, baseDps, upgrades, click: false };
  }

  const HEROES = [
    {
      id: 'tanjiro', name: 'Tanjiro Kamado', title: 'Water Breathing · Click Hero', icon: '🗡️', color: '#2e8b57',
      baseCost: 5, baseDps: 0, click: true,
      upgrades: [
        { lvl: 10, name: 'Water Surface Slash', type: 'click', val: 2 },
        { lvl: 25, name: 'Whirlpool', type: 'click', val: 2 },
        { lvl: 50, name: 'Scent of the Opening Thread', type: 'crit', val: 0.05 },
        { lvl: 75, name: 'Total Concentration Breathing', type: 'clickdps', val: 0.01 },
        { lvl: 100, name: 'Hinokami Kagura: Dance', type: 'click', val: 2 },
      ].map(u => ({ ...u, desc: describeUpgrade(u, 'Tanjiro') })),
    },
    dpsHero('zenitsu', 'Zenitsu Agatsuma', 'Thunder Breathing', '⚡', '#e6b422', 50, 5,
      ['Thunderclap and Flash', 'Sixfold', 'Eightfold', 'Sleeping Swordsman', 'Godspeed'], { type: 'crit', val: 0.03 }),
    dpsHero('inosuke', 'Inosuke Hashibira', 'Beast Breathing', '🐗', '#4a7fb5', 250, 22,
      ['Fang One: Pierce', 'Fang Two: Slice', 'Crazy Cutting', 'Spatial Awareness', 'Spiral Fang']),
    dpsHero('nezuko', 'Nezuko Kamado', 'Blood Demon Art', '🎋', '#e46a9c', 1000, 74,
      ['Bamboo Muzzle', 'Demon Kick', 'Size Shift', 'Sunlight Conquered', 'Exploding Blood'], { type: 'clickdps', val: 0.01 }),
    dpsHero('kanao', 'Kanao Tsuyuri', 'Flower Breathing', '🌸', '#d98fb8', 4000, 245,
      ['Coin Toss', 'Peonies of Futility', 'Whirling Peach', 'Crimson Hanagoromo', 'Equinoctial Vermilion Eye']),
    dpsHero('genya', 'Genya Shinazugawa', 'Demon Eater', '🔫', '#7b5e9e', 2e4, 976,
      ['Nichirin Shotgun', 'Demon Consumption', 'Tree Absorption', 'Upper Moon Flesh', 'Borrowed Blade']),
    dpsHero('giyu', 'Giyu Tomioka', 'Water Hashira', '🌊', '#2f6fb3', 1e5, 3725,
      ['Water Wheel', 'Striking Tide', 'Constant Flux', 'Drop Ripple Thrust', 'Eleventh Form: Dead Calm'], { type: 'global', val: 0.15 }),
    dpsHero('shinobu', 'Shinobu Kocho', 'Insect Hashira', '🦋', '#8e6fd8', 4e5, 10859,
      ['Butterfly Dance: Caprice', 'Dance of the Bee Sting', 'Dragonfly Hexagon', 'Centipede Zigzag', 'Wisteria Poison'], { type: 'global', val: 0.15 }),
    dpsHero('rengoku', 'Kyojuro Rengoku', 'Flame Hashira', '🔥', '#e8562a', 2.5e6, 47143,
      ['Unknowing Fire', 'Rising Scorching Sun', 'Blazing Universe', 'Flame Tiger', 'Ninth Form: Rengoku'], { type: 'gold', val: 0.25 }),
    dpsHero('tengen', 'Tengen Uzui', 'Sound Hashira', '💎', '#c9a227', 1.5e7, 186000,
      ['Roar', 'Constant Resounding Slashes', 'Musical Score', 'Flamboyant Explosives', 'Flashy Finale'], { type: 'gold', val: 0.25 }),
    dpsHero('mitsuri', 'Mitsuri Kanroji', 'Love Hashira', '💗', '#ff7eb6', 1e8, 782000,
      ['Shivers of First Love', 'Love Pangs', 'Catlove Shower', 'Swaying Love: Wildclaw', 'Cat-Legged Winds of Love'], { type: 'global', val: 0.2 }),
    dpsHero('muichiro', 'Muichiro Tokito', 'Mist Hashira', '🌫️', '#8fb5c9', 8e8, 3.721e6,
      ['Low Clouds, Distant Haze', 'Eightfold Mist', 'Scattering Mist Splash', 'Sea of Clouds and Haze', 'Obscuring Clouds'], { type: 'global', val: 0.2 }),
    dpsHero('obanai', 'Obanai Iguro', 'Serpent Hashira', '🐍', '#5b9e6f', 6.5e9, 1.6e7,
      ['Winding Serpent Slash', 'Venom Fangs', 'Coil Choke', 'Slithering Serpent', 'Twin-Headed Reptile'], { type: 'global', val: 0.2 }),
    dpsHero('sanemi', 'Sanemi Shinazugawa', 'Wind Hashira', '🌪️', '#7fae8a', 5e10, 7.2e7,
      ['Dust Whirlwind Cutter', 'Claws-Purifying Wind', 'Clean Storm Wind Tree', 'Rising Dust Storm', 'Idaten Typhoon'], { type: 'crit', val: 0.03 }),
    dpsHero('gyomei', 'Gyomei Himejima', 'Stone Hashira', '🪨', '#8a7a6a', 4.5e11, 4.1e8,
      ['Serpentinite Bipolar', 'Upper Smash', 'Stone Skin', 'Volcanic Rock', 'Arcs of Justice'], { type: 'global', val: 0.25 }),
    dpsHero('urokodaki', 'Sakonji Urokodaki', 'Former Water Hashira', '👺', '#b84a4a', 4e12, 1.9e9,
      ['Boulder Training', 'Thin Mountain Air', 'Mask of Warding', 'Final Selection Prep', "Teacher's Pride"], { type: 'global', val: 0.25 }),
    dpsHero('tamayo', 'Tamayo & Yushiro', 'Demon Physicians', '🩸', '#a34a6b', 3.6e13, 9.6e9,
      ['Visual Deception', 'Blood Art: Scent', 'Paper Talismans', 'Humanizing Medicine', 'Aging Drug'], { type: 'global', val: 0.25 }),
    dpsHero('kagaya', 'Kagaya Ubuyashiki', 'Master of the Corps', '🏯', '#6b5b95', 3.2e14, 4.1e10,
      ['Voice of Command', 'Kasugai Network', 'Wisteria Estates', 'Hashira Meeting', 'Final Gambit'], { type: 'global', val: 0.3 }),
    dpsHero('yoriichi', 'Yoriichi Tsugikuni', 'Origin of Sun Breathing', '☀️', '#ff9f1c', 2.7e15, 2.4e11,
      ['Dance', 'Clear Blue Sky', 'Raging Sun', 'Solar Heat Haze', 'Thirteenth Form'], { type: 'global', val: 0.3 }),
    dpsHero('suntanjiro', 'Tanjiro, Sun Successor', 'Hinokami Kagura', '🌅', '#ff6b35', 2.4e16, 1.5e12,
      ['Fire Wheel', 'Sunflower Thrust', 'Beneficent Radiance', 'Burning Bones, Summer Sun', 'Dragon Sun Halo Head Dance'], { type: 'global', val: 0.5 }),
  ];
  const HERO_BY_ID = Object.fromEntries(HEROES.map(h => [h.id, h]));

  // Each region spans 5 zones and ends with its boss on every 5th zone.
  const REGIONS = [
    { name: 'Fujikasane Mountain', bg: ['#2d1f3d', '#7d5aa6'], boss: ['Hand Demon', '🖐️'],
      demons: [['Lesser Demon', '👹'], ['Starving Demon', '🧟'], ['Wisteria-Shy Demon', '😈']] },
    { name: 'Northwest Town', bg: ['#1c2633', '#4f6a7d'], boss: ['Swamp Demon', '🐊'],
      demons: [['Swamp Spawn', '🫧'], ['Night Kidnapper', '🌑'], ['Bride Snatcher', '👺']] },
    { name: 'Asakusa', bg: ['#1f2340', '#c77b3a'], boss: ['Susamaru & Yahaba', '⚽'],
      demons: [['Temari Thrower', '🏐'], ['Arrow Demon', '🏹'], ['Alley Demon', '🧛']] },
    { name: 'Tsuzumi Mansion', bg: ['#2e2016', '#8a5a3a'], boss: ['Kyogai the Drum Demon', '🥁'],
      demons: [['Tongue Demon', '👅'], ['Horned Demon', '😈'], ['Mansion Lurker', '👻']] },
    { name: 'Mt. Natagumo', bg: ['#141a26', '#3d4f6b'], boss: ['Rui, Lower Moon Five', '🕸️'],
      demons: [['Spider Demon', '🕷️'], ['Spider Mother', '🦂'], ['Thread Puppet', '🪆']] },
    { name: 'Mugen Train', bg: ['#2a1a2a', '#7a4a6a'], boss: ['Enmu, Lower Moon One', '🚂'],
      demons: [['Flesh Tendril', '🪱'], ['Dream Puppet', '🎎'], ['Sleep Hand', '✋']] },
    { name: 'Entertainment District', bg: ['#3a0f2a', '#d0406f'], boss: ['Gyutaro & Daki, Upper Moon Six', '🎀'],
      demons: [['Obi Sash', '🧣'], ['Blood Sickle', '🩸'], ['Oiran Shade', '🎭']] },
    { name: 'Swordsmith Village', bg: ['#0f2a2a', '#3a9a9a'], boss: ['Gyokko, Upper Moon Five', '🏺'],
      demons: [['Pot Fish', '🐟'], ['Needle Fish', '🐡'], ['Vase Spawn', '🐙']] },
    { name: 'Village Hot Springs', bg: ['#2a1410', '#a0503a'], boss: ['Hantengu, Upper Moon Four', '👺'],
      demons: [['Clone of Fear', '😱'], ['Clone of Joy', '😆'], ['Clone of Anger', '😡']] },
    { name: 'Infinity Castle', bg: ['#120a1f', '#5a2a7a'], boss: ['Akaza, Upper Moon Three', '👊'],
      demons: [['Castle Guardian', '🏯'], ['Shifting Room', '🚪'], ['Lower Rank Demon', '👹']] },
    { name: 'Castle Depths', bg: ['#0c1a2a', '#5a8ab0'], boss: ['Doma, Upper Moon Two', '🧊'],
      demons: [['Ice Lotus', '🪷'], ['Frost Doll', '❄️'], ['Cultist Demon', '🕯️']] },
    { name: 'Castle Summit', bg: ['#1a0a10', '#7a2a3a'], boss: ['Kokushibo, Upper Moon One', '👁️'],
      demons: [['Moon-Eyed Demon', '🌙'], ['Blade Flesh', '⚔️'], ['Six-Eyed Shade', '🌘']] },
    { name: "Nakime's Fortress", bg: ['#1a1410', '#806040'], boss: ['Nakime, the Biwa Demon', '🪕'],
      demons: [['Biwa Echo', '🎵'], ['Eye Spawn', '👀'], ['Collapsing Hall', '🏚️']] },
    { name: 'Tokyo Before Dawn', bg: ['#10101a', '#a03030'], boss: ['Muzan Kibutsuji', '🌹'],
      demons: [["Muzan's Spawn", '🥀'], ['Blood Tendril', '🦑'], ['Last Demon', '💀']] },
  ];
  const TIER_NAMES = ['', 'Awakened', 'Crimson', 'Moonlit', 'Abyssal', 'Primordial', 'Eternal'];

  const SKILLS = [
    { id: 'flux', key: '1', name: 'Constant Flux', icon: '🌊', desc: 'Auto-attack 10 times per second for 30 seconds.', dur: 30, cd: 300, rank: 2 },
    { id: 'thunder', key: '2', name: 'Thunderclap and Flash', icon: '⚡', desc: 'Double your DPS for 30 seconds.', dur: 30, cd: 420, rank: 4 },
    { id: 'focus', key: '3', name: 'Total Concentration', icon: '🎯', desc: '+50% critical strike chance for 30 seconds.', dur: 30, cd: 600, rank: 7 },
    { id: 'blaze', key: '4', name: 'Set Your Heart Ablaze', icon: '🔥', desc: 'Double gold from demons for 30 seconds.', dur: 30, cd: 600, rank: 10 },
    { id: 'hinokami', key: '5', name: 'Hinokami Kagura', icon: '☀️', desc: 'Triple click damage for 30 seconds.', dur: 30, cd: 900, rank: 14 },
    { id: 'haul', key: '6', name: "Kasugai Crow's Haul", icon: '🐦', desc: 'Instantly gain gold worth 25 demons on this zone.', dur: 0, cd: 1200, rank: 18 },
    { id: 'mark', key: '7', name: 'Demon Slayer Mark', icon: '🌺', desc: 'Instantly reset the cooldowns of all other skills.', dur: 0, cd: 3600, rank: 25 },
  ];

  // Permanent upgrades bought with Wisteria Souls (like Clicker Heroes' Ancients).
  const ANCIENTS = [
    { id: 'butterfly', name: 'Butterfly Mansion Training', icon: '🦋', per: '+15% DPS per level', eff: l => `+${15 * l}% DPS` },
    { id: 'thunderGod', name: "Thunder God's Blessing", icon: '⚡', per: '+20% click damage per level', eff: l => `+${20 * l}% click damage` },
    { id: 'wisteria', name: 'Wisteria Fortune', icon: '💜', per: '+10% gold per level', eff: l => `+${10 * l}% gold` },
    { id: 'grit', name: 'Final Selection Grit', icon: '⏳', per: '+2s boss timer per level', eff: l => `+${2 * l}s boss timer` },
    { id: 'swordsmith', name: 'Swordsmith Village Discount', icon: '⚒️', per: '-2% hero costs per level', max: 25, eff: l => `-${2 * l}% hero costs` },
    { id: 'crowNet', name: 'Kasugai Crow Network', icon: '🐦', per: '-5% skill cooldowns per level', max: 10, eff: l => `-${5 * l}% cooldowns` },
    { id: 'maps', name: 'Hidden Treasure Maps', icon: '🗺️', per: '+0.5% treasure chest chance per level', max: 20, eff: l => `+${(0.5 * l).toFixed(1)}% chest chance` },
  ];

  const CORPS_RANKS = ['Mizunoto', 'Mizunoe', 'Kanoto', 'Kanoe', 'Tsuchinoto', 'Tsuchinoe', 'Hinoto', 'Hinoe', 'Kinoto', 'Kinoe'];

  // ===================================================================
  // State
  // ===================================================================

  function defaultState() {
    return {
      gold: 0,
      zone: 1,
      highestZone: 1,
      progressKills: 0,
      heroes: {},
      souls: 0,
      bossSoulsRun: 0,
      rank: 1,
      xp: 0,
      ancients: {},
      skills: {},
      autoProgress: true,
      buyAmt: 1,
      stats: {
        clicks: 0, kills: 0, bossKills: 0, chests: 0, ascensions: 0,
        highestZoneEver: 1, totalGold: 0, playTime: 0, totalSouls: 0,
      },
      lastSave: Date.now(),
    };
  }

  let state = defaultState();
  let monster = null;
  let bossTime = 0;
  let fluxAcc = 0;
  let stats = null; // cached derived stats, recomputed every tick

  function heroState(id) {
    if (!state.heroes[id]) state.heroes[id] = { level: 0, upg: [false, false, false, false, false] };
    return state.heroes[id];
  }
  const ancientLvl = id => state.ancients[id] || 0;
  const skillActive = id => { const s = state.skills[id]; return !!s && s.activeEnd > Date.now(); };

  // ===================================================================
  // Formulas
  // ===================================================================

  function monsterHp(z) {
    const hp = z <= 140
      ? 10 * (z - 1 + Math.pow(1.55, z - 1))
      : 10 * (139 + Math.pow(1.55, 139) * Math.pow(1.145, z - 140));
    return Math.ceil(hp);
  }
  const isBossZone = z => z % 5 === 0;
  const goldDrop = z => Math.max(1, Math.ceil(monsterHp(z) / 15));
  const bossSoulsFor = z => (z >= 40 ? Math.max(1, Math.floor(Math.pow((z - 30) / 10, 1.3))) : 0);
  const regionIndex = z => Math.floor((z - 1) / 5) % REGIONS.length;
  const tierOf = z => Math.floor((z - 1) / (5 * REGIONS.length));
  const xpNeeded = l => Math.floor(25 * Math.pow(l, 2.2));
  const rankMult = () => 1 + 0.02 * (state.rank - 1);
  const costMult = () => 1 - Math.min(0.5, 0.02 * ancientLvl('swordsmith'));
  const cooldownMult = () => 1 - Math.min(0.5, 0.05 * ancientLvl('crowNet'));
  const chestChance = () => 0.01 + Math.min(0.1, 0.005 * ancientLvl('maps'));
  const bossDuration = () => BOSS_TIME + 2 * ancientLvl('grit');

  function rankTitle(l) {
    if (l >= 100) return 'Sun Breathing Successor';
    if (l >= 51) return 'Hashira';
    return CORPS_RANKS[Math.floor((l - 1) / 5)];
  }

  function tierName(z) {
    const t = tierOf(z);
    if (t === 0) return '';
    return t < TIER_NAMES.length ? TIER_NAMES[t] : `Tier ${t + 1}`;
  }

  function milestoneCount(level) {
    if (level < MILESTONE_START) return 0;
    return Math.floor((Math.min(level, MILESTONE_END) - MILESTONE_START) / MILESTONE_STEP) + 1;
  }
  function nextMilestone(level) {
    if (level >= MILESTONE_END) return null;
    if (level < MILESTONE_START) return MILESTONE_START;
    return MILESTONE_START + (Math.floor((level - MILESTONE_START) / MILESTONE_STEP) + 1) * MILESTONE_STEP;
  }

  function heroBaseDps(h) {
    const s = heroState(h.id);
    if (h.click || s.level === 0) return 0;
    let m = Math.pow(4, milestoneCount(s.level));
    h.upgrades.forEach((u, i) => { if (s.upg[i] && u.type === 'hero') m *= u.val; });
    return h.baseDps * s.level * m;
  }

  function levelCost(h, level, n) {
    const r = COST_GROWTH;
    return Math.ceil(h.baseCost * costMult() * Math.pow(r, level) * (Math.pow(r, n) - 1) / (r - 1));
  }
  function maxAffordable(h, level) {
    const c0 = h.baseCost * costMult() * Math.pow(COST_GROWTH, level);
    if (state.gold < c0) return 0;
    let n = Math.floor(Math.log(1 + state.gold * (COST_GROWTH - 1) / c0) / Math.log(COST_GROWTH));
    while (n > 1 && levelCost(h, level, n) > state.gold) n--;
    return Math.max(1, n);
  }
  function buyCount(h) {
    if (state.buyAmt === 'max') return Math.max(1, maxAffordable(h, heroState(h.id).level));
    return state.buyAmt;
  }
  const upgradeCost = (h, i) => Math.ceil(h.baseCost * UPG_COST_MULT[i]);

  function computeStats() {
    let global = 0, crit = 0.02, clickDps = 0, clickMult = 1, gold = 0, baseDps = 0;
    for (const h of HEROES) {
      const s = heroState(h.id);
      h.upgrades.forEach((u, i) => {
        if (!s.upg[i]) return;
        if (u.type === 'global') global += u.val;
        else if (u.type === 'crit') crit += u.val;
        else if (u.type === 'clickdps') clickDps += u.val;
        else if (u.type === 'click') clickMult *= u.val;
        else if (u.type === 'gold') gold += u.val;
      });
      baseDps += heroBaseDps(h);
    }
    const heroMult = (1 + global) * (1 + 0.1 * state.souls) * (1 + 0.15 * ancientLvl('butterfly')) * rankMult();
    const dpsNoSkill = baseDps * heroMult;
    const dps = dpsNoSkill * (skillActive('thunder') ? 2 : 1);
    let click = ((1 + heroState('tanjiro').level) * clickMult + dps * clickDps) * (1 + 0.2 * ancientLvl('thunderGod')) * rankMult();
    if (skillActive('hinokami')) click *= 3;
    const critChance = Math.min(1, crit + (skillActive('focus') ? 0.5 : 0));
    const goldBase = (1 + gold) * (1 + 0.1 * ancientLvl('wisteria'));
    const goldMult = goldBase * (skillActive('blaze') ? 2 : 1);
    return { dps, dpsNoSkill, click, critChance, goldMult, goldBase, heroMult, clickDps };
  }

  function pendingSouls() {
    let levels = 0;
    for (const h of HEROES) levels += heroState(h.id).level;
    return state.bossSoulsRun + Math.floor(levels / 2000);
  }

  // ===================================================================
  // Number formatting
  // ===================================================================

  const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'];
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 0) return '-' + fmt(-n);
    if (n < 1000) return n < 10 && n % 1 !== 0 ? n.toFixed(1) : Math.floor(n).toString();
    let e = Math.floor(Math.log10(n) / 3);
    if (e >= SUFFIXES.length) return n.toExponential(2).replace('+', '');
    let v = n / Math.pow(1000, e);
    if (v >= 999.995) { e++; v /= 1000; if (e >= SUFFIXES.length) return n.toExponential(2).replace('+', ''); }
    const s = v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.floor(v).toString();
    return s + SUFFIXES[e];
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
  }

  // ===================================================================
  // DOM helpers
  // ===================================================================

  const $ = id => document.getElementById(id);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function log(msg, cls = '') {
    const box = $('log');
    const line = el('div', 'log-line ' + cls, msg);
    box.prepend(line);
    while (box.children.length > 6) box.lastChild.remove();
    setTimeout(() => line.classList.add('fade'), 6000);
  }

  function showModal(title, bodyHtml, buttons) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = bodyHtml;
    const actions = $('modalActions');
    actions.innerHTML = '';
    for (const b of buttons) {
      const btn = el('button', b.cls || '', esc(b.label));
      btn.addEventListener('click', () => { hideModal(); if (b.fn) b.fn(); });
      actions.appendChild(btn);
    }
    $('modal').hidden = false;
  }
  function hideModal() { $('modal').hidden = true; }

  // ===================================================================
  // Combat
  // ===================================================================

  function spawnMonster() {
    const z = state.zone;
    const boss = isBossZone(z);
    const region = REGIONS[regionIndex(z)];
    const tier = tierName(z);
    let name, icon, chest = false;
    if (boss) {
      [name, icon] = region.boss;
    } else if (Math.random() < chestChance()) {
      name = 'Wisteria Treasure Chest'; icon = '🎁'; chest = true;
    } else {
      [name, icon] = region.demons[Math.floor(Math.random() * region.demons.length)];
    }
    if (tier && !chest) name = `${tier} ${name}`;
    const hp = monsterHp(z) * (boss ? 10 : 1);
    monster = { name, icon, hp, maxHp: hp, boss, chest };
    bossTime = boss ? bossDuration() : 0;

    const m = $('monster');
    $('monsterIcon').textContent = icon;
    $('monsterName').textContent = (boss ? '👑 ' : '') + name;
    m.classList.toggle('boss', boss);
    m.classList.toggle('chest', chest);
    m.classList.remove('spawn');
    void m.offsetWidth; // restart the spawn animation
    m.classList.add('spawn');
    $('bossTimer').hidden = !boss;
    const arena = $('arena');
    arena.style.setProperty('--bg1', region.bg[0]);
    arena.style.setProperty('--bg2', region.bg[1]);
  }

  function damageMonster(amount) {
    if (!monster || monster.hp <= 0) return;
    monster.hp -= amount;
    if (monster.hp <= 0) killMonster();
  }

  function killMonster() {
    const z = state.zone;
    const m = monster;
    const g = goldDrop(z) * (m.boss ? 10 : 1) * (m.chest ? 10 : 1) * stats.goldMult;
    addGold(g);
    floatText(`+${fmt(g)}`, 'gold', 50 + (Math.random() * 20 - 10), 40);
    gainXp(Math.ceil(z * (m.boss ? 5 : 1)));
    state.stats.kills++;
    if (m.chest) {
      state.stats.chests++;
      log(`🎁 You opened a Wisteria Treasure Chest for <b>${fmt(g)}</b> gold!`, 'good');
    }
    if (m.boss) {
      state.stats.bossKills++;
      log(`👑 You defeated <b>${esc(m.name)}</b>!`, 'good');
    }

    if (z === state.highestZone) {
      if (m.boss) {
        const s = bossSoulsFor(z);
        if (s > 0) {
          state.bossSoulsRun += s;
          log(`💜 +${s} Wisteria Soul${s > 1 ? 's' : ''} (collected when you ascend)`, 'soul');
        }
        unlockNextZone();
      } else if (++state.progressKills >= KILLS_PER_ZONE) {
        unlockNextZone();
      }
    } else if (state.autoProgress && state.zone < state.highestZone) {
      state.zone++;
    }
    spawnMonster();
  }

  function unlockNextZone() {
    state.highestZone++;
    state.progressKills = 0;
    if (state.highestZone > state.stats.highestZoneEver) state.stats.highestZoneEver = state.highestZone;
    if (state.autoProgress) state.zone = state.highestZone;
  }

  function bossFailed() {
    log(`⏳ <b>${esc(monster.name)}</b> escaped into the night! Train harder and try again.`, 'bad');
    state.autoProgress = false;
    setZone(Math.max(1, state.zone - 1));
  }

  function addGold(g) {
    state.gold += g;
    state.stats.totalGold += g;
  }

  function gainXp(x) {
    state.xp += x;
    while (state.xp >= xpNeeded(state.rank)) {
      state.xp -= xpNeeded(state.rank);
      const oldTitle = rankTitle(state.rank);
      state.rank++;
      const newTitle = rankTitle(state.rank);
      log(`⭐ Slayer Rank up! You are now Rank <b>${state.rank}</b>.`, 'good');
      if (newTitle !== oldTitle) log(`🎖️ Promoted to <b>${newTitle}</b>!`, 'good');
      for (const sk of SKILLS) {
        if (sk.rank === state.rank) log(`✨ New skill unlocked: <b>${sk.icon} ${sk.name}</b> (press ${sk.key})`, 'good');
      }
      skillBarDirty = true;
    }
  }

  function attack(x, y, manual) {
    if (!monster) return;
    const crit = Math.random() < stats.critChance;
    const dmg = stats.click * (crit ? CRIT_MULT : 1);
    if (manual) state.stats.clicks++;
    floatText((crit ? 'CRIT! ' : '') + fmt(dmg), crit ? 'crit' : 'dmg', x, y);
    slashFx(x, y, crit);
    const m = $('monster');
    m.classList.remove('hit');
    void m.offsetWidth;
    m.classList.add('hit');
    damageMonster(dmg);
  }

  function setZone(z) {
    z = Math.max(1, Math.min(state.highestZone, z));
    if (z < state.zone) state.autoProgress = false;
    state.zone = z;
    spawnMonster();
  }

  // ===================================================================
  // Effects
  // ===================================================================

  function floatText(text, cls, xPct, yPct) {
    const fx = $('fx');
    if (fx.childElementCount > 40) fx.firstChild.remove();
    const t = el('div', 'float ' + cls);
    t.textContent = text;
    t.style.left = xPct + '%';
    t.style.top = yPct + '%';
    t.addEventListener('animationend', () => t.remove());
    fx.appendChild(t);
  }

  function slashFx(xPct, yPct, crit) {
    const fx = $('fx');
    if (fx.childElementCount > 40) fx.firstChild.remove();
    const s = el('div', 'slash' + (crit ? ' crit' : ''));
    s.style.left = xPct + '%';
    s.style.top = yPct + '%';
    s.style.setProperty('--rot', (Math.random() * 360) + 'deg');
    s.addEventListener('animationend', () => s.remove());
    fx.appendChild(s);
  }

  // ===================================================================
  // Heroes, upgrades, skills, ancients, ascension
  // ===================================================================

  function buyHero(h) {
    const s = heroState(h.id);
    const n = buyCount(h);
    const cost = levelCost(h, s.level, n);
    if (state.gold < cost) return;
    state.gold -= cost;
    const wasZero = s.level === 0;
    const before = milestoneCount(s.level);
    s.level += n;
    if (wasZero) {
      log(`${h.icon} <b>${esc(h.name)}</b> has joined your party!`, 'good');
      heroListDirty = true;
    }
    if (milestoneCount(s.level) > before) log(`📈 ${esc(h.name)} hit a milestone: DPS x4!`, 'good');
  }

  function buyUpgrade(h, i) {
    const s = heroState(h.id);
    const u = h.upgrades[i];
    const cost = upgradeCost(h, i);
    if (s.upg[i] || s.level < u.lvl || state.gold < cost) return;
    state.gold -= cost;
    s.upg[i] = true;
    log(`📜 Learned <b>${esc(u.name)}</b>: ${esc(u.desc)}`, 'good');
  }

  function useSkill(sk) {
    if (state.rank < sk.rank) return;
    const now = Date.now();
    const s = state.skills[sk.id] || (state.skills[sk.id] = { cdEnd: 0, activeEnd: 0 });
    if (s.cdEnd > now) return;
    s.cdEnd = now + sk.cd * 1000 * cooldownMult();
    s.activeEnd = now + sk.dur * 1000;
    if (sk.id === 'haul') {
      const g = goldDrop(state.zone) * 25 * stats.goldMult;
      addGold(g);
      floatText(`+${fmt(g)}`, 'gold', 50, 30);
    } else if (sk.id === 'mark') {
      for (const other of SKILLS) {
        if (other.id !== 'mark' && state.skills[other.id]) state.skills[other.id].cdEnd = 0;
      }
    }
    log(`${sk.icon} <b>${sk.name}</b>!`, 'skill-log');
  }

  function buyAncient(a) {
    const lvl = ancientLvl(a.id);
    if (a.max && lvl >= a.max) return;
    const cost = lvl + 1;
    if (state.souls < cost) return;
    state.souls -= cost;
    state.ancients[a.id] = lvl + 1;
    log(`${a.icon} <b>${esc(a.name)}</b> is now level ${lvl + 1}.`, 'soul');
  }

  function ascend() {
    const gain = pendingSouls();
    if (gain <= 0) return;
    showModal('Return to Final Selection?',
      `<p>Your party will disband and you'll start again from Zone 1 with no gold.</p>
       <p>You will gain <strong>${fmt(gain)} Wisteria Souls</strong> (+${fmt(gain * 10)}% DPS while unspent).</p>
       <p>You keep your Slayer Rank, souls and Breathing techniques.</p>`,
      [
        { label: 'Not yet', cls: 'secondary' },
        {
          label: 'Ascend', cls: 'btn-ascend', fn: () => {
            state.souls += gain;
            state.stats.totalSouls += gain;
            state.stats.ascensions++;
            Object.assign(state, {
              gold: 0, zone: 1, highestZone: 1, progressKills: 0, heroes: {}, bossSoulsRun: 0, skills: {}, autoProgress: true,
            });
            heroListDirty = true;
            spawnMonster();
            log(`🌸 You returned to Final Selection with <b>${fmt(gain)}</b> new souls.`, 'soul');
            save();
          },
        },
      ]);
  }

  // ===================================================================
  // Rendering
  // ===================================================================

  let heroListDirty = true;
  let skillBarDirty = true;
  let zoneStripKey = '';
  const heroRefs = {};
  const ancientRefs = {};
  const skillRefs = {};

  function visibleHeroCount() {
    let last = -1;
    HEROES.forEach((h, i) => { if (heroState(h.id).level > 0) last = i; });
    return Math.min(HEROES.length, last + 3);
  }

  function buildHeroList() {
    const list = $('heroList');
    list.innerHTML = '';
    const count = visibleHeroCount();
    for (let i = 0; i < count; i++) {
      const h = HEROES[i];
      const card = el('div', 'hero');
      card.style.setProperty('--c', h.color);
      card.innerHTML = `
        <div class="portrait">${h.icon}</div>
        <div class="hero-main">
          <div class="hero-head"><span class="hero-name">${esc(h.name)}</span><span class="hero-lvl"></span></div>
          <div class="hero-sub">${esc(h.title)}</div>
          <div class="hero-dps"></div>
          <div class="upgrades"></div>
          <div class="hero-next"></div>
        </div>
        <button class="buy"><span class="buy-label"></span><span class="cost"></span></button>`;
      const upgBox = card.querySelector('.upgrades');
      const upgBtns = h.upgrades.map((u, ui) => {
        const b = el('button', 'upg', ROMAN[ui]);
        b.addEventListener('click', () => buyUpgrade(h, ui));
        upgBox.appendChild(b);
        return b;
      });
      card.querySelector('.buy').addEventListener('click', () => buyHero(h));
      heroRefs[h.id] = {
        card, upgBtns,
        lvl: card.querySelector('.hero-lvl'),
        dps: card.querySelector('.hero-dps'),
        next: card.querySelector('.hero-next'),
        buy: card.querySelector('.buy'),
        buyLabel: card.querySelector('.buy-label'),
        cost: card.querySelector('.cost'),
      };
      list.appendChild(card);
    }
    if (count < HEROES.length) {
      const t = el('div', 'hero teaser', `<div class="portrait">❔</div><div class="hero-main"><div class="hero-name">???</div><div class="hero-sub">Hire more heroes to reveal the next slayer.</div></div>`);
      list.appendChild(t);
    }
    heroListDirty = false;
  }

  function updateHeroList() {
    if (heroListDirty) buildHeroList();
    const count = visibleHeroCount();
    for (let i = 0; i < count; i++) {
      const h = HEROES[i];
      const r = heroRefs[h.id];
      const s = heroState(h.id);
      const n = buyCount(h);
      const cost = levelCost(h, s.level, n);
      r.lvl.textContent = s.level > 0 ? `Lv ${s.level}` : 'Not hired';
      if (h.click) {
        r.dps.innerHTML = `Click damage: <b>${fmt(stats.click)}</b>`;
      } else {
        const eff = heroBaseDps(h) * stats.heroMult;
        r.dps.innerHTML = s.level > 0 ? `DPS: <b>${fmt(eff)}</b>` : `Base DPS: ${fmt(h.baseDps * stats.heroMult)} per level`;
      }
      const nm = h.click ? null : nextMilestone(s.level);
      r.next.textContent = nm && s.level >= 100 ? `Next x4 DPS at Lv ${nm}` : '';
      r.buyLabel.textContent = s.level === 0 ? 'Hire' : `Lv Up x${n}`;
      r.cost.textContent = `🪙 ${fmt(cost)}`;
      r.buy.disabled = state.gold < cost;
      h.upgrades.forEach((u, ui) => {
        const b = r.upgBtns[ui];
        const owned = s.upg[ui];
        const locked = s.level < u.lvl;
        const uc = upgradeCost(h, ui);
        b.classList.toggle('owned', owned);
        b.classList.toggle('locked', locked);
        b.classList.toggle('affordable', !owned && !locked && state.gold >= uc);
        b.title = `${u.name}\n${u.desc}\n${owned ? '✔ Learned' : `Requires Lv ${u.lvl} · Cost ${fmt(uc)} gold`}`;
      });
    }
  }

  function buildAncients() {
    const list = $('ancientList');
    list.innerHTML = '';
    for (const a of ANCIENTS) {
      const card = el('div', 'ancient');
      card.innerHTML = `
        <div class="portrait">${a.icon}</div>
        <div class="hero-main">
          <div class="hero-head"><span class="hero-name">${esc(a.name)}</span><span class="hero-lvl"></span></div>
          <div class="hero-sub">${esc(a.per)}${a.max ? ` (max ${a.max})` : ''}</div>
          <div class="hero-dps"></div>
        </div>
        <button class="buy"><span class="buy-label">Train</span><span class="cost"></span></button>`;
      card.querySelector('.buy').addEventListener('click', () => buyAncient(a));
      ancientRefs[a.id] = {
        lvl: card.querySelector('.hero-lvl'), eff: card.querySelector('.hero-dps'),
        buy: card.querySelector('.buy'), cost: card.querySelector('.cost'),
      };
      list.appendChild(card);
    }
  }

  function updateAncients() {
    for (const a of ANCIENTS) {
      const r = ancientRefs[a.id];
      const l = ancientLvl(a.id);
      const maxed = a.max && l >= a.max;
      r.lvl.textContent = `Lv ${l}`;
      r.eff.textContent = l > 0 ? `Current: ${a.eff(l)}` : 'Not trained yet';
      r.cost.textContent = maxed ? 'MAX' : `💜 ${l + 1}`;
      r.buy.disabled = maxed || state.souls < l + 1;
    }
    const pending = pendingSouls();
    $('pendingSouls').textContent = fmt(pending);
    $('ascendBtn').disabled = pending <= 0;
    $('soulsAvail').textContent = fmt(state.souls);
    const badge = $('soulBadge');
    badge.hidden = pending <= 0;
    badge.textContent = '+' + fmt(pending);
  }

  function buildSkillBar() {
    const bar = $('skillBar');
    bar.innerHTML = '';
    for (const sk of SKILLS) {
      const b = el('button', 'skill');
      b.innerHTML = `<span class="skill-icon">${sk.icon}</span><span class="skill-key">${sk.key}</span><span class="skill-cd"></span><span class="skill-text"></span>`;
      b.addEventListener('click', () => useSkill(sk));
      skillRefs[sk.id] = { b, cd: b.querySelector('.skill-cd'), text: b.querySelector('.skill-text'), icon: b.querySelector('.skill-icon') };
      bar.appendChild(b);
    }
    skillBarDirty = false;
  }

  function updateSkillBar() {
    if (skillBarDirty) buildSkillBar();
    const now = Date.now();
    for (const sk of SKILLS) {
      const r = skillRefs[sk.id];
      const s = state.skills[sk.id] || { cdEnd: 0, activeEnd: 0 };
      const locked = state.rank < sk.rank;
      const active = s.activeEnd > now;
      const cooling = s.cdEnd > now;
      r.b.classList.toggle('locked', locked);
      r.b.classList.toggle('active', active);
      r.b.classList.toggle('ready', !locked && !cooling);
      r.b.disabled = locked;
      r.icon.textContent = locked ? '🔒' : sk.icon;
      const total = sk.cd * 1000 * cooldownMult();
      r.cd.style.height = cooling && !active ? `${Math.min(100, ((s.cdEnd - now) / total) * 100)}%` : '0%';
      r.text.textContent = locked ? `Rank ${sk.rank}` : active ? fmtTime((s.activeEnd - now) / 1000) : cooling ? fmtTime((s.cdEnd - now) / 1000) : 'Ready';
      r.b.title = `${sk.name} [${sk.key}]\n${sk.desc}\nCooldown: ${fmtTime(sk.cd * cooldownMult())}${locked ? `\nUnlocks at Slayer Rank ${sk.rank}` : ''}`;
    }
  }

  function updateZoneStrip() {
    const key = `${state.zone}|${state.highestZone}`;
    if (key === zoneStripKey) return;
    zoneStripKey = key;
    const strip = $('zoneStrip');
    strip.innerHTML = '';
    const start = Math.max(1, state.zone - 2);
    for (let z = start; z < start + 5; z++) {
      const b = el('button', 'zone');
      b.innerHTML = `<span class="zn">${z}</span>${isBossZone(z) ? '<span class="zb">👑</span>' : ''}`;
      b.classList.toggle('current', z === state.zone);
      b.classList.toggle('locked', z > state.highestZone);
      b.classList.toggle('done', z < state.highestZone);
      b.classList.toggle('bosszone', isBossZone(z));
      b.title = `${REGIONS[regionIndex(z)].name}, Zone ${z}${z > state.highestZone ? ' (locked)' : ''}`;
      b.disabled = z > state.highestZone;
      b.addEventListener('click', () => setZone(z));
      strip.appendChild(b);
    }
    $('zonePrev').disabled = state.zone <= 1;
    $('zoneNext').disabled = state.zone >= state.highestZone;
  }

  function updateBattle() {
    const z = state.zone;
    const tier = tierName(z);
    $('regionName').textContent = (tier ? tier + ' ' : '') + REGIONS[regionIndex(z)].name;
    $('zoneNum').textContent = z;
    $('autoProgress').checked = state.autoProgress;
    updateZoneStrip();

    const pct = Math.max(0, monster.hp / monster.maxHp) * 100;
    $('hpFill').style.width = pct + '%';
    $('hpText').textContent = `${fmt(Math.max(0, monster.hp))} / ${fmt(monster.maxHp)}`;

    const kp = $('killProgress');
    if (monster.boss) {
      kp.textContent = z === state.highestZone ? 'BOSS FIGHT · defeat it to advance' : 'Boss rematch';
      const total = bossDuration();
      $('bossTimerFill').style.width = (bossTime / total) * 100 + '%';
      $('bossTimerText').textContent = bossTime.toFixed(1) + 's';
    } else if (z === state.highestZone) {
      kp.textContent = `Demons slain: ${state.progressKills} / ${KILLS_PER_ZONE}`;
    } else {
      kp.textContent = 'Zone cleared · farming gold';
    }
  }

  function updateHeader() {
    $('gold').textContent = fmt(state.gold);
    $('clickDmg').textContent = fmt(stats.click);
    $('dps').textContent = fmt(stats.dps);
    $('souls').textContent = fmt(state.souls);
    $('rankTitle').textContent = rankTitle(state.rank);
    $('rankLevel').textContent = state.rank;
    const need = xpNeeded(state.rank);
    $('xpFill').style.width = Math.min(100, (state.xp / need) * 100) + '%';
    $('xpText').textContent = `${fmt(state.xp)} / ${fmt(need)} XP`;
  }

  function updateRankTab() {
    const next = SKILLS.find(s => s.rank > state.rank);
    $('rankInfo').innerHTML = `
      <div class="rank-card">
        <div class="rank-big">${rankTitle(state.rank)}</div>
        <div>Slayer Rank <b>${state.rank}</b> · ${fmt(state.xp)} / ${fmt(xpNeeded(state.rank))} XP</div>
        <div>Rank bonus: <b>+${Math.round((rankMult() - 1) * 100)}%</b> click damage &amp; DPS</div>
        <div>${next ? `Next skill: ${next.icon} <b>${next.name}</b> at Rank ${next.rank}` : 'All skills unlocked!'}</div>
        <div class="rank-ladder">${CORPS_RANKS.map((r, i) => `<span class="${state.rank >= i * 5 + 1 ? 'got' : ''}">${r}</span>`).join('')}<span class="${state.rank >= 51 ? 'got' : ''}">Hashira</span></div>
      </div>`;
    const st = state.stats;
    const rows = [
      ['Critical chance', `${Math.round(stats.critChance * 100)}% (x${CRIT_MULT} damage)`],
      ['Gold multiplier', `x${stats.goldMult.toFixed(2)}`],
      ['Soul DPS bonus', `+${fmt(state.souls * 10)}%`],
      ['Highest zone (this run)', state.highestZone],
      ['Highest zone (ever)', st.highestZoneEver],
      ['Demons slain', fmt(st.kills)],
      ['Bosses defeated', fmt(st.bossKills)],
      ['Treasure chests opened', fmt(st.chests)],
      ['Total clicks', fmt(st.clicks)],
      ['Total gold earned', fmt(st.totalGold)],
      ['Ascensions', st.ascensions],
      ['Souls earned (all time)', fmt(st.totalSouls)],
      ['Time played', fmtTime(st.playTime)],
    ];
    $('statsList').innerHTML = rows.map(([k, v]) => `<div class="srow"><span>${k}</span><b>${v}</b></div>`).join('');
  }

  let activeTab = 'heroes';
  function render() {
    updateHeader();
    updateBattle();
    updateSkillBar();
    if (activeTab === 'heroes') updateHeroList();
    updateAncients();
    if (activeTab === 'rank') updateRankTab();
  }

  // ===================================================================
  // Save / load
  // ===================================================================

  function save() {
    state.lastSave = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  function normalize(raw) {
    const d = defaultState();
    const s = Object.assign(d, raw);
    s.stats = Object.assign(defaultState().stats, raw.stats || {});
    s.heroes = s.heroes || {};
    for (const id of Object.keys(s.heroes)) {
      if (!HERO_BY_ID[id]) { delete s.heroes[id]; continue; }
      const h = s.heroes[id];
      h.level = Math.max(0, Math.floor(Number(h.level) || 0));
      h.upg = Array.from({ length: 5 }, (_, i) => !!(h.upg && h.upg[i]));
    }
    for (const k of ['gold', 'souls', 'xp', 'bossSoulsRun']) s[k] = Math.max(0, Number(s[k]) || 0);
    s.rank = Math.max(1, Math.floor(Number(s.rank) || 1));
    s.highestZone = Math.max(1, Math.floor(Number(s.highestZone) || 1));
    s.zone = Math.min(s.highestZone, Math.max(1, Math.floor(Number(s.zone) || 1)));
    if (![1, 10, 25, 100, 'max'].includes(s.buyAmt)) s.buyAmt = 1;
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) state = normalize(JSON.parse(raw));
    } catch (e) {
      state = defaultState();
    }
  }

  // Gold and XP earned while away (or while the tab was throttled), farming the current zone.
  function idleEarnings(seconds) {
    const st = computeStats();
    if (st.dpsNoSkill <= 0 || seconds <= 0) return null;
    let z = state.zone;
    if (isBossZone(z)) z = Math.max(1, z - 1);
    const kills = Math.min(seconds * st.dpsNoSkill / monsterHp(z), seconds * 10);
    if (kills < 1) return null;
    const gold = kills * goldDrop(z) * st.goldBase;
    const xp = Math.floor(kills * z);
    addGold(gold);
    gainXp(xp);
    state.stats.kills += Math.floor(kills);
    return { gold, xp, kills };
  }

  // ===================================================================
  // Main loop
  // ===================================================================

  let lastTick = performance.now();
  let uiAcc = 0;

  function tick() {
    const now = performance.now();
    let dt = (now - lastTick) / 1000;
    lastTick = now;
    if (dt <= 0) return;
    stats = computeStats();

    if (dt > 3) {
      // Tab was in the background: credit idle gold instead of simulating every frame.
      const res = idleEarnings(Math.min(dt, 86400));
      if (res) log(`🌙 While you were away your slayers earned <b>${fmt(res.gold)}</b> gold.`, 'good');
      dt = 0.05;
    }

    state.stats.playTime += dt;

    if (skillActive('flux')) {
      fluxAcc += dt * 10;
      while (fluxAcc >= 1) {
        fluxAcc -= 1;
        attack(35 + Math.random() * 30, 30 + Math.random() * 30, false);
      }
    } else {
      fluxAcc = 0;
    }

    if (stats.dps > 0) damageMonster(stats.dps * dt);

    if (monster.boss && monster.hp > 0) {
      bossTime -= dt;
      if (bossTime <= 0) bossFailed();
    }

    uiAcc += dt;
    if (uiAcc >= 0.1) {
      uiAcc = 0;
      render();
    }
  }

  // ===================================================================
  // Input
  // ===================================================================

  function bindInput() {
    const arena = $('arena');
    arena.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      const rect = arena.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      attack(x, y, true);
      $('tapHint').classList.add('gone');
    });

    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      activeTab = t.dataset.tab;
      document.querySelectorAll('.tab').forEach(o => o.classList.toggle('active', o === t));
      document.querySelectorAll('.tab-page').forEach(p => { p.hidden = p.id !== 'tab-' + activeTab; });
      render();
    }));

    document.querySelectorAll('.buybar button').forEach(b => b.addEventListener('click', () => {
      state.buyAmt = b.dataset.amt === 'max' ? 'max' : Number(b.dataset.amt);
      syncBuyBar();
      render();
    }));

    $('zonePrev').addEventListener('click', () => setZone(state.zone - 1));
    $('zoneNext').addEventListener('click', () => setZone(state.zone + 1));
    $('autoProgress').addEventListener('change', e => { state.autoProgress = e.target.checked; });
    $('ascendBtn').addEventListener('click', ascend);

    $('saveBtn').addEventListener('click', () => { save(); log('💾 Game saved.'); });
    $('exportBtn').addEventListener('click', () => {
      save();
      $('saveText').value = btoa(JSON.stringify(state));
      $('saveText').select();
      log('📤 Save exported below. Copy it somewhere safe!');
    });
    $('importBtn').addEventListener('click', () => {
      const txt = $('saveText').value.trim();
      if (!txt) { log('Paste a save into the box first.', 'bad'); return; }
      try {
        state = normalize(JSON.parse(atob(txt)));
        heroListDirty = true; skillBarDirty = true; zoneStripKey = '';
        syncBuyBar();
        spawnMonster();
        save();
        log('📥 Save imported. Welcome back, slayer!', 'good');
      } catch (e) {
        log('That save data could not be read.', 'bad');
      }
    });
    $('resetBtn').addEventListener('click', () => showModal('Hard reset?',
      '<p>This permanently erases <strong>everything</strong>, including souls, rank and Breathing techniques.</p>',
      [
        { label: 'Cancel', cls: 'secondary' },
        {
          label: 'Erase everything', cls: 'danger', fn: () => {
            state = defaultState();
            heroListDirty = true; skillBarDirty = true; zoneStripKey = '';
            syncBuyBar();
            spawnMonster();
            save();
            log('A new journey begins...');
          },
        },
      ]));

    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!$('modal').hidden) return;
      const sk = SKILLS.find(s => s.key === e.key);
      if (sk) { useSkill(sk); return; }
      if (e.key === 'a' || e.key === 'A') { state.autoProgress = !state.autoProgress; log(`Auto-progress ${state.autoProgress ? 'on' : 'off'}.`); }
      else if (e.key === 'ArrowLeft') setZone(state.zone - 1);
      else if (e.key === 'ArrowRight') setZone(state.zone + 1);
    });

    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  }

  function syncBuyBar() {
    document.querySelectorAll('.buybar button').forEach(b => {
      b.classList.toggle('active', String(state.buyAmt) === b.dataset.amt);
    });
  }

  // ===================================================================
  // Boot
  // ===================================================================

  function init() {
    load();
    stats = computeStats();
    buildAncients();
    syncBuyBar();
    bindInput();
    spawnMonster();

    const away = (Date.now() - state.lastSave) / 1000;
    if (away > 60) {
      const res = idleEarnings(Math.min(away, 86400));
      if (res) {
        showModal('Welcome back, slayer!',
          `<p>You were away for <strong>${fmtTime(away)}</strong>.</p>
           <p>Your party slew about <strong>${fmt(Math.floor(res.kills))}</strong> demons and earned
           <strong>🪙 ${fmt(res.gold)}</strong> gold and <strong>${fmt(res.xp)}</strong> XP.</p>`,
          [{ label: 'Onward!' }]);
      }
    }
    if (state.stats.clicks > 0) $('tapHint').classList.add('gone');
    else log('🗡️ Your journey as a Demon Slayer begins. Click the demon to attack!');

    stats = computeStats();
    render();
    setInterval(tick, 33);
    setInterval(save, 15000);
  }

  init();
})();
