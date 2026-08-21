/* ============================================================
   LUNA — Divination & Curiosities
   交互逻辑 / 语言切换 / WebAudio 音效 / 三页流程
   背景分层：全局星空（所有页面共用）+ 首页前景（魔法入口）
   纯 Vanilla JavaScript，数据只存 localStorage（语言），无 API。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  function $(id) { return document.getElementById(id); }
  var LS = {
    get: function (k, f) {
      try { var v = localStorage.getItem(k); return v === null ? f : JSON.parse(v); }
      catch (e) { return f; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    }
  };

  /* ---------- 语言（文案按物件分组，键名无 tag/act 等技术后缀） ---------- */
  var lang = LS.get('luna_lang', 'en') === 'zh' ? 'zh' : 'en';
  function t(key) {
    var d = window.I18N[lang] || {};
    if (d[key] !== undefined) return d[key];
    var en = window.I18N.en || {};
    return en[key] !== undefined ? en[key] : '';
  }
  function pick(o) { return o ? (o[lang] || o.en || '') : ''; }
  /* 物件文案：obj(key, 'name' | 'desc' | 'act' | 'again' | 'ph' | 'done') */
  var FALLBACK_NAMES = {
    crystal: 'THE CRYSTAL BALL',
    dream: 'THE DREAMCATCHER',
    burn: 'BURN A WORRY',
    potion: 'THE POTION CABINET',
    mirror: 'THE MAGIC MIRROR'
  };
  function obj(key, field) {
    var o = (window.I18N && window.I18N.objects) ? window.I18N.objects[key] : null;
    if (o && o[field]) return pick(o[field]);
    if (field === 'name' && FALLBACK_NAMES[key]) return FALLBACK_NAMES[key];
    return '';
  }
  /* 魔药需求文案 */
  function need(key) {
    var o = (window.I18N && window.I18N.needs) ? window.I18N.needs[key] : null;
    return o ? pick(o) : '';
  }

  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var v = t(els[i].getAttribute('data-i18n'));
      if (v) els[i].textContent = v;   /* 有值才覆盖，保留 HTML 默认文字 */
    }
    $('lang-en').classList.toggle('active', lang === 'en');
    $('lang-zh').classList.toggle('active', lang === 'zh');
    try { buildDoors(); } catch (e) {}   /* 五扇门名称随语言重建 */
    repaintShop();                       /* 首页画布文字随语言重绘 */
    if (objState) renderObject();        /* 物件页开着时用新语言重建 */
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    LS.set('luna_lang', l);
    applyLang();
  }

  /* ---------- 音效（WebAudio，全部本地合成） ---------- */
  var Sound = {
    ctx: null,
    ensure: function () {
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) { try { this.ctx = new AC(); } catch (e) {} }
      }
      if (this.ctx && this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) {} }
    },
    tone: function (freq, dur, type, vol, when, slide) {
      this.ensure();
      if (!this.ctx) return;
      var t0 = this.ctx.currentTime + (when || 0);
      var o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (slide) { try { o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur); } catch (e) {} }
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t0); o.stop(t0 + dur + 0.03);
    },
    doorbell: function () { this.tone(987, 0.28, 'sine', 0.10); this.tone(1319, 0.42, 'sine', 0.07, 0.13); },
    tick: function () { this.tone(340, 0.05, 'square', 0.04); },
    chime: function () { this.tone(660, 0.4, 'sine', 0.08); this.tone(990, 0.5, 'sine', 0.06, 0.10); },
    shimmer: function () {
      this.tone(880, 0.12, 'sine', 0.06);
      this.tone(1175, 0.12, 'sine', 0.05, 0.07);
      this.tone(1568, 0.22, 'sine', 0.04, 0.15);
    },
    low: function () { this.tone(180, 0.5, 'sine', 0.07, 0, -70); this.tone(120, 0.6, 'sine', 0.05, 0.16, -35); },
    bubble: function () {
      this.tone(300, 0.07, 'sine', 0.06, 0, 120);
      this.tone(420, 0.07, 'sine', 0.06, 0.09, 140);
      this.tone(560, 0.14, 'sine', 0.05, 0.18, 160);
    },
    whoosh: function () {
      this.tone(220, 0.28, 'sawtooth', 0.045, 0, -140);
      this.tone(120, 0.42, 'sawtooth', 0.045, 0.09, -60);
      for (var i = 0; i < 5; i++) this.tone(900 + Math.random() * 500, 0.03, 'square', 0.02, 0.1 + i * 0.09);
    },
    meow: function () {
      /* 软软的喵：三角波，轻声，先轻微上扬再慢慢滑落 */
      this.tone(620, 0.12, 'triangle', 0.045, 0, 120);
      this.tone(520, 0.26, 'triangle', 0.05, 0.10, -160);
    }
  };

  /* ============================================================
     背景分层：
     bg（全局星空，所有页面共用，向下滚动）
     front（首页前景：弯月 / 招牌 / 魔法入口，仅首页显示）
     ============================================================ */
  var bg = $('bg');
  var front = $('front');
  var SKY = SPR.mk(640, 360);
  var FRONT = SPR.mk(640, 360);
  var fxT = 0;
  var hoverEnter = false;
  var SKY_SPEED = 2;   /* 星空每 100ms 向下滚动像素数（约 20px/s，缓慢） */

  function repaintShop() {
    try {
      SPR.paintSky(SKY.getContext('2d'));
      SPR.paintFront(FRONT.getContext('2d'), lang);
    } catch (e) {}
  }

  /* 天空星闪烁（画在全局背景上，所有页面都可见） */
  function drawSkyStars(g) {
    var tstars = [
      [286, 24, 3, 0.20, 0.0],   /* x, y, 大小, 速度, 相位 */
      [354, 20, 2, 0.26, 1.7],
      [120, 66, 2, 0.16, 3.1],
      [522, 58, 2, 0.28, 0.8],
      [330, 14, 2, 0.21, 2.4]
    ];
    for (var i = 0; i < tstars.length; i++) {
      var ts = tstars[i];
      var tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(fxT * ts[3] + ts[4]));
      g.globalAlpha = tw;
      g.fillStyle = '#F2DFBD';
      g.fillRect(ts[0] - ts[2], ts[1], ts[2] * 2 + 1, 1);
      g.fillRect(ts[0], ts[1] - ts[2], 1, ts[2] * 2 + 1);
      g.globalAlpha = 1;
    }
  }

  /* 首页专用 FX（画在 front 上）：ENTER 文字 / 魔法星 / 门槛微光 / hover */
  function drawEntranceFx(g) {
    /* ✦ ENTER ✦ 文字：每帧按当前语言重绘（切换语言绝不残留旧文字） */
    g.font = 'bold 9px monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#E8DFC8';
    g.fillText((lang === 'zh') ? '\u2726 进入 \u2726' : '\u2726 ENTER \u2726', 320, 290);
    /* 门后魔法星 ✦：轻微脉动（硬边分层，非渐变） */
    var mp = 0.5 + 0.5 * Math.sin(fxT * 0.18);
    g.fillStyle = '#F2DFBD';
    g.globalAlpha = 0.14 + 0.10 * mp;
    g.fillRect(314, 190, 13, 1); g.fillRect(320, 184, 1, 13);    /* 外晕 */
    g.fillRect(316, 190, 9, 1); g.fillRect(320, 186, 1, 9);      /* 中晕 */
    g.globalAlpha = 0.8 + 0.2 * mp;
    g.fillRect(317, 190, 7, 1); g.fillRect(320, 187, 1, 7);      /* 主星 */
    g.fillRect(318, 190, 5, 1); g.fillRect(320, 188, 1, 5);
    g.globalAlpha = 1;
    /* 门槛处极淡微光轻闪（门后世界的余光） */
    var a = 0.05 + 0.04 * Math.sin(fxT * 0.14);
    if (Math.random() < 0.02) a = 0.02;
    g.fillStyle = 'rgba(232,223,200,' + a.toFixed(3) + ')';
    g.fillRect(288, 272, 64, 2);
    /* ENTER 文字：常驻一点点微光；hover 时变亮 */
    var pr = SPR.PLAQUE_RECT;
    if (hoverEnter) g.fillStyle = 'rgba(242,223,189,0.30)';
    else g.fillStyle = 'rgba(242,223,189,0.05)';
    g.fillRect(pr.x, pr.y, pr.w, pr.h);
    /* 入口 hover：整体极轻微变亮 */
    if (hoverEnter) {
      var er = SPR.ENTER_RECT;
      g.fillStyle = 'rgba(242,223,189,0.05)';
      g.fillRect(er.x, er.y, er.w, er.h);
    }
  }

  setInterval(function () {
    fxT++;
    /* 1) 全局星空（首页 / 门廊 / 物件页共用）：向下滚动循环 */
    var g = bg.getContext('2d');
    g.clearRect(0, 0, 640, 360);
    var off = Math.floor((fxT * SKY_SPEED) % 360);
    g.drawImage(SKY, 0, off - 360);
    g.drawImage(SKY, 0, off);
    drawSkyStars(g);
    /* 2) 首页前景 + 首页 FX（仅首页显示） */
    if (!$('screen-entrance').classList.contains('hidden')) {
      var fg = front.getContext('2d');
      fg.clearRect(0, 0, 640, 360);
      fg.drawImage(FRONT, 0, 0);
      drawEntranceFx(fg);
    }
  }, 100);

  /* ---------- ENTER / 魔法入口：点击与 hover（挂在首页层上，object-fit:cover 裁切换算） ---------- */
  function canvasPoint(e, el) {
    var r = (el || bg).getBoundingClientRect();
    var scale = Math.max(r.width / 640, r.height / 360);
    var dw = 640 * scale, dh = 360 * scale;
    var ox = (r.width - dw) / 2, oy = (r.height - dh) / 2;
    return {
      x: (e.clientX - r.left - ox) / scale,
      y: (e.clientY - r.top - oy) / scale
    };
  }
  function inEnterRect(p) {
    var r = SPR.ENTER_RECT;
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }
  var entrance = $('screen-entrance');
  entrance.addEventListener('click', function (e) {
    if (inEnterRect(canvasPoint(e, entrance))) triggerEnter();
  });
  entrance.addEventListener('mousemove', function (e) {
    var h = inEnterRect(canvasPoint(e, entrance));
    if (h !== hoverEnter) {
      hoverEnter = h;
      entrance.style.cursor = h ? 'pointer' : 'default';
    }
  });
  entrance.addEventListener('mouseleave', function () {
    hoverEnter = false;
    entrance.style.cursor = 'default';
  });

  /* ---------- 屏幕切换 / 转场 ---------- */
  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.add('hidden');
    $(id).classList.remove('hidden');
    window.scrollTo(0, 0);
  }
  var fadeBusy = false;
  function transition(toId, fn) {
    if (fadeBusy) return;
    fadeBusy = true;
    var f = $('fade');
    f.classList.remove('hidden');
    requestAnimationFrame(function () { f.classList.add('show'); });
    setTimeout(function () { if (fn) fn(); showScreen(toId); }, 480);
    setTimeout(function () {
      f.classList.remove('show');
      setTimeout(function () { f.classList.add('hidden'); fadeBusy = false; }, 340);
    }, 1150);
  }

  /* ---------- 入口：ENTER / 点击魔法入口（或回车） → 门铃 → 黑幕 → 五扇门 ---------- */
  function triggerEnter() {
    Sound.doorbell();
    transition('screen-doors');
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !$('screen-entrance').classList.contains('hidden') && !fadeBusy) triggerEnter();
  });

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.add('hidden'); }, 2600);
  }

  /* ---------- 五扇门 ---------- */
  var GLOW = {
    crystal: '#b9a7c9',
    dream: '#c89ab0',
    burn: '#e8a860',
    potion: '#a898c8',
    mirror: '#e8dcc0'
  };
  function doorScale() { return window.innerWidth < 560 ? 2 : 3; }
  function buildDoors() {
    var top = $('door-row-top'), bot = $('door-row-bottom');
    top.innerHTML = '';
    bot.innerHTML = '';
    if (!window.DOORS || !window.DOORS.length) return;
    var sc = doorScale();
    window.DOORS.forEach(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'door';
      b.setAttribute('data-key', d.key);
      b.style.setProperty('--glow', GLOW[d.key] || '#b9a7c9');
      var art = document.createElement('span');
      art.className = 'door-art';
      art.appendChild(SPR.up(SPR.makeDoor(d.key), sc));
      var nm = document.createElement('span');
      nm.className = 'door-name';
      nm.textContent = obj(d.key, 'name');
      b.appendChild(art);
      b.appendChild(nm);
      b.addEventListener('click', function () {
        Sound.tick();
        openObject(this.getAttribute('data-key'));
      });
      (i < 3 ? top : bot).appendChild(b);
    });
  }
  var resizeT = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(buildDoors, 200);
  });

  /* ---------- 魔法物件页 ---------- */
  var objState = null;
  var lastPick = {};
  function randPick(arr) {
    var i = Math.floor(Math.random() * arr.length);
    if (arr.length > 1 && lastPick[arr] === i) i = (i + 1) % arr.length;
    lastPick[arr] = i;
    return arr[i];
  }
  function brewPotion(need) {
    var pool = window.LUNA_POOLS.potion;
    var match = pool.filter(function (p) { return p.needs.indexOf(need) >= 0; });
    var arr = match.length ? match : pool;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function openObject(key) {
    objState = {
      key: key, phase: 0, result: null, input: '',
      need: null, stars: 0, lit: false, bubbles: false, shown: false, timer: null
    };
    transition('screen-object', renderObject);
  }
  function closeObject() {
    if (objState && objState.timer) clearInterval(objState.timer);
    objState = null;
    transition('screen-doors');
  }

  function drawObjectCanvas() {
    var s = objState, key = s.key;
    var cv = $('obj-canvas');
    var img = SPR.makeObject(key, s);
    cv.width = img.width;
    cv.height = img.height;
    cv.style.width = (img.width * 2) + 'px';
    cv.style.height = (img.height * 2) + 'px';
    var g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(img, 0, 0);
  }

  function renderObject() {
    var s = objState;
    if (!s) return;
    var key = s.key;
    $('obj-title').textContent = obj(key, 'name');
    $('obj-desc').innerHTML = obj(key, 'desc').split('\n').map(function (x) {
      return x ? '<span>' + x + '</span>' : '';
    }).join('');
    drawObjectCanvas();
    var mt = $('obj-mirror-txt');
    if (key === 'mirror') {
      mt.classList.toggle('hidden', !s.result);
      mt.textContent = s.result ? pick(s.result) : '';
    } else {
      mt.classList.add('hidden');
    }
    var box = $('obj-interact'), res = $('obj-result');
    if (key === 'crystal') renderCrystal(box, res, s);
    else if (key === 'dream') renderDream(box, res, s);
    else if (key === 'burn') renderBurn(box, res, s);
    else if (key === 'potion') renderPotion(box, res, s);
    else renderMirror(box, res, s);
  }

  /* 水晶球：询问 → 亮起 → 随机占卜 */
  function renderCrystal(box, res, s) {
    var key = s.key;
    res.innerHTML = s.result ? '<p class="read">' + pick(s.result) + '</p>' : '';
    box.innerHTML = '<button class="pbtn" id="act">' + obj(key, s.result ? 'again' : 'act') + '</button>';
    $('act').addEventListener('click', function () {
      var b = this; b.disabled = true;
      Sound.shimmer();
      setTimeout(function () {
        s.result = randPick(window.LUNA_POOLS.crystal);
        s.lit = true;
        renderObject();
      }, 560);
    });
  }

  /* 捕梦网：写下梦境 → 文字消失 → 网上亮起一颗星 */
  function renderDream(box, res, s) {
    var key = s.key;
    res.innerHTML = s.result ? '<p class="read">✦ ' + pick(s.result) + '</p>' : '';
    box.innerHTML =
      '<textarea class="field" id="inp" rows="2" maxlength="80" placeholder="' + obj(key, 'ph') + '"></textarea>' +
      '<button class="pbtn" id="act">' + obj(key, 'act') + '</button>';
    var ta = $('inp');
    ta.value = s.input || '';
    $('act').addEventListener('click', function () {
      var v = ta.value.trim();
      if (!v) { toast(t('writeFirst')); ta.focus(); return; }
      s.input = '';
      s.stars = Math.min(3, s.stars + 1);
      s.result = { en: 'It can stay here tonight.', zh: '今晚，它可以留在这里。' };
      Sound.low();
      setTimeout(function () { Sound.chime(); renderObject(); }, 520);
    });
  }

  /* 烧掉烦恼：纸张 1→0 + 火焰火星 → 灰烬与一句释然 */
  function renderBurn(box, res, s) {
    var key = s.key;
    if (s.phase === 0) {
      res.innerHTML = '';
      box.innerHTML =
        '<textarea class="field" id="inp" rows="3" maxlength="60" placeholder="' + obj(key, 'ph') + '"></textarea>' +
        '<button class="pbtn" id="act">' + obj(key, 'act') + '</button>';
      var ta = $('inp');
      ta.value = s.input || '';
      $('act').addEventListener('click', function () {
        var v = ta.value.trim();
        if (!v) { toast(t('writeFirst')); ta.focus(); return; }
        s.input = v;
        s.phase = 1;
        renderObject();
        var cv = $('obj-canvas');
        var frame = 0;
        Sound.whoosh();
        s.timer = setInterval(function () {
          frame++;
          var g = cv.getContext('2d');
          g.clearRect(0, 0, cv.width, cv.height);
          SPR.drawBurnFrame(g, frame / 12, frame);
          if (frame >= 12) {
            clearInterval(s.timer);
            s.timer = null;
            s.phase = 2;
            s.result = { en: 'You don\u2019t have to carry everything at once.', zh: '你不必一下子扛起所有事。' };
            Sound.chime();
            renderObject();
          }
        }, 110);
      });
    } else if (s.phase === 1) {
      res.innerHTML = '';
      box.innerHTML = '<p class="burn-note">…</p>';
    } else {
      res.innerHTML = '<p class="read">' + obj(key, 'done') + '</p>';
      box.innerHTML = '<button class="pbtn" id="act">' + obj(key, 'again') + '</button>';
      $('act').addEventListener('click', function () {
        s.phase = 0; s.input = ''; s.result = null;
        renderObject();
      });
    }
  }

  /* 魔药柜：选需求 → BREW → 药瓶变色 + 随机魔药 */
  function renderPotion(box, res, s) {
    var key = s.key;
    var needs = ['courage', 'luck', 'rest', 'love', 'clarity'];
    res.innerHTML = s.result
      ? '<p class="read"><b>' + pick(s.result.name) + '</b>' + pick(s.result.desc) + '</p>' +
        '<p class="potion-tags">' + s.result.needs.map(function (n) { return '✦ ' + need(n); }).join(' ') + '</p>'
      : '';
    box.innerHTML =
      '<div class="need-row">' + needs.map(function (n) {
        return '<button type="button" class="need-chip' + (s.need === n ? ' sel' : '') + '" data-need="' + n + '">' +
          need(n) + '</button>';
      }).join('') + '</div>' +
      '<button class="pbtn" id="act">' + obj(key, s.result ? 'again' : 'act') + '</button>';
    var chips = box.querySelectorAll('.need-chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function () {
        s.need = this.getAttribute('data-need');
        Sound.tick();
        renderObject();
      });
    }
    $('act').addEventListener('click', function () {
      if (!s.need) { toast(t('pickNeed')); return; }
      var b = this; b.disabled = true;
      Sound.bubble();
      setTimeout(function () {
        var p = brewPotion(s.need);
        s.result = p;
        s.color = p.color;
        s.bubbles = true;
        renderObject();
      }, 560);
    });
  }

  /* 魔镜：望向镜中 → 镜面亮起 + 一句随机的话 */
  function renderMirror(box, res, s) {
    var key = s.key;
    res.innerHTML = '';
    box.innerHTML = '<button class="pbtn" id="act">' + obj(key, s.result ? 'again' : 'act') + '</button>';
    $('act').addEventListener('click', function () {
      var b = this; b.disabled = true;
      Sound.low();
      setTimeout(function () {
        s.result = randPick(window.LUNA_POOLS.mirror);
        s.shown = true;
        renderObject();
      }, 640);
    });
  }

  /* 返回五扇门 */
  $('obj-back').addEventListener('click', function () {
    Sound.tick();
    closeObject();
  });

  /* ---------- 黑猫彩蛋（PAGE 2 右下角） ---------- */
  var CAT_OPEN = SPR.makeCat(false);
  var CAT_CLOSED = SPR.makeCat(true);
  var CAT_MSGS = (window.LUNA_POOLS && window.LUNA_POOLS.cat) || [];
  var CAT_IGNORE = (window.LUNA_POOLS && window.LUNA_POOLS.catIgnore) || [];
  var catState = 0;          /* 0 = 随机模式；1..3 = 忽略三连进行中 */
  var catBubbleTimer = null;
  var catLastPick = null;

  function catBlink() {
    var cv = $('cat-canvas');
    if (!cv) return;
    var g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(CAT_CLOSED, 0, 0);
    setTimeout(function () {
      var g2 = cv.getContext('2d');
      g2.clearRect(0, 0, cv.width, cv.height);
      g2.drawImage(CAT_OPEN, 0, 0);
    }, 140);
  }
  function catSay(text) {
    var b = $('cat-bubble');
    if (!b) return;
    b.textContent = text;
    b.classList.remove('hidden');
    if (catBubbleTimer) clearTimeout(catBubbleTimer);
    catBubbleTimer = setTimeout(function () { b.classList.add('hidden'); }, 3800);
  }
  function catMsg() {
    if (catState > 0) {
      /* 忽略三连：逐句推进，三句之后恢复随机 */
      var m = CAT_IGNORE[catState - 1];
      catState++;
      if (catState > 3) catState = 0;
      return m ? pick(m) : '';
    }
    /* 随机模式：偶尔不理你（进入忽略三连），其余随机小话 */
    if (Math.random() < 0.3 && CAT_IGNORE.length) {
      catState = 2;   /* 先显示第 1 句，之后推进 */
      return pick(CAT_IGNORE[0]);
    }
    if (!CAT_MSGS.length) return '';
    var i = Math.floor(Math.random() * CAT_MSGS.length);
    if (CAT_MSGS.length > 1 && catLastPick === i) i = (i + 1) % CAT_MSGS.length;
    catLastPick = i;
    return pick(CAT_MSGS[i]);
  }
  function initCat() {
    var egg = $('cat-egg');
    var cv = $('cat-canvas');
    if (!egg || !cv) return;
    cv.width = CAT_OPEN.width;
    cv.height = CAT_OPEN.height;
    cv.getContext('2d').drawImage(CAT_OPEN, 0, 0);
    egg.addEventListener('click', function (e) {
      e.stopPropagation();
      Sound.meow();
      catBlink();
      catSay(catMsg());
    });
    egg.addEventListener('mouseenter', function () {
      catBlink();
    });
    /* 偶尔发呆眨一下眼——猫真的住在这里 */
    setInterval(function () {
      if (!$('screen-doors').classList.contains('hidden')) catBlink();
    }, 7000);
  }

  /* ---------- 语言按钮 ---------- */
  $('lang-en').addEventListener('click', function () { setLang('en'); });
  $('lang-zh').addEventListener('click', function () { setLang('zh'); });

  /* ---------- 启动 ---------- */
  window.addEventListener('load', function () {
    try { repaintShop(); } catch (e) {}
    try { buildDoors(); } catch (e) {}
    try { initCat(); } catch (e) {}
    applyLang();
    showScreen('screen-entrance');
  });
})();
