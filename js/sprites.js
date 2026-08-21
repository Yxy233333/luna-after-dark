/* ============================================================
   LUNA — Divination & Curiosities
   像素绘制引擎：LUNA 魔法书封面首页 / 五扇门 / 五个魔法物件
   主题：Charcoal × Dusty Pink × Muted Rose × Faded Lavender
        × Mauve × Cream × Antique Gold（无霓虹、无赛博朋克）
   首页：粉紫黑旧魔法书封面，中央一扇通往 LUNA 的门，
   周围漂浮着弯月与不同形状的星星（旧占星书星空）。
   全部由代码逐像素绘制（Canvas 2D），无任何外部图片。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 基础工具 ---------- */
  function mk(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function gx(c) { return c.getContext('2d'); }
  function px(g, x, y, w, h, col) {
    if (!col) return;
    g.fillStyle = col;
    g.fillRect(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)));
  }
  function circle(g, cx, cy, r, col) {
    var cxx = Math.round(cx), cyy = Math.round(cy), rr = Math.round(r);
    for (var y = -rr; y <= rr; y++) {
      for (var x = -rr; x <= rr; x++) {
        if (x * x + y * y <= rr * rr + 0.001) px(g, cxx + x, cyy + y, 1, 1, col);
      }
    }
  }
  function ellipse(g, cx, cy, rx, ry, col) {
    for (var y = cy - ry; y <= cy + ry; y++) {
      var dy = y - cy;
      var hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      px(g, cx - hw, y, hw * 2 + 1, 1, col);
    }
  }
  function up(c, s) {
    var o = mk(c.width * s, c.height * s);
    var og = gx(o);
    og.imageSmoothingEnabled = false;
    og.drawImage(c, 0, 0, o.width, o.height);
    return o;
  }
  function seeded(seed) {
    var s = seed;
    return function () {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
  }
  /* 圆拱（顶部窄、底部全宽的拱形） */
  function archShape(g, cx, yTop, yBase, halfW, col) {
    var rows = yBase - yTop + 1;
    for (var r = 0; r < rows; r++) {
      var t = r / (rows - 1);
      var hw = Math.max(1, Math.round(halfW * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)))));
      px(g, cx - hw, yTop + r, hw * 2 + 1, 1, col);
    }
  }
  /* 圆底烧瓶（脖颈 + 圆形瓶身，瓶内液体以下半部分填充） */
  function flask(g, cx, cy, r, neckTop, neckW, glassCol, liqCol, liqTop) {
    px(g, cx - neckW, neckTop, neckW * 2, cy - r - neckTop, glassCol);
    px(g, cx - neckW, neckTop, 2, cy - r - neckTop, 'rgba(255,255,255,0.25)');
    for (var y = cy - r; y <= cy + r; y++) {
      var dy = y - cy;
      var hw = Math.round(Math.sqrt(r * r - dy * dy));
      px(g, cx - hw, y, hw * 2 + 1, 1, glassCol);
      px(g, cx - hw + 1, y, hw * 2 - 1, 1, (y >= liqTop) ? liqCol : glassCol);
    }
  }
  function smallStar(g, x, y, col) {
    px(g, x, y, 1, 1, col);
    px(g, x, y - 1, 1, 1, col); px(g, x, y + 1, 1, 1, col);
    px(g, x - 1, y, 1, 1, col); px(g, x + 1, y, 1, 1, col);
  }
  function flower(g, x, y) {
    px(g, x, y - 2, 1, 1, '#c89ab0');
    px(g, x - 1, y - 1, 1, 1, '#c89ab0'); px(g, x + 1, y - 1, 1, 1, '#c89ab0');
    px(g, x, y, 1, 1, '#f0e6d4');
  }

  /* ============================================================
     首页星空装饰：各种星形 / 小月牙 / 四角散星
     ============================================================ */
  /* ✦ 四点星（s=1 小 / s=2 中 / s=3 大，饱满） */
  function star4(g, x, y, col, s) {
    px(g, x, y, 1, 1, col);
    px(g, x, y - s, 1, 1, col);
    px(g, x, y + s, 1, 1, col);
    px(g, x - s, y, 1, 1, col);
    px(g, x + s, y, 1, 1, col);
    if (s >= 3) {
      px(g, x - 1, y - 2, 1, 1, col);
      px(g, x + 1, y - 2, 1, 1, col);
      px(g, x - 1, y + 2, 1, 1, col);
      px(g, x + 1, y + 2, 1, 1, col);
      px(g, x - 2, y - 1, 1, 1, col);
      px(g, x - 2, y + 1, 1, 1, col);
      px(g, x + 2, y - 1, 1, 1, col);
      px(g, x + 2, y + 1, 1, 1, col);
    }
  }
  /* ✧ 斜闪（菱形 sparkle，5×5） */
  function spark(g, x, y, col) {
    px(g, x, y, 1, 1, col);
    px(g, x - 1, y - 1, 1, 1, col);
    px(g, x + 1, y - 1, 1, 1, col);
    px(g, x - 1, y + 1, 1, 1, col);
    px(g, x + 1, y + 1, 1, 1, col);
    px(g, x - 2, y - 2, 1, 1, col);
    px(g, x + 2, y - 2, 1, 1, col);
    px(g, x - 2, y + 2, 1, 1, col);
    px(g, x + 2, y + 2, 1, 1, col);
  }
  /* ☾ 小月牙（旧占星书符号） */
  function moonlet(g, cx, cy, col) {
    circle(g, cx, cy, 3, col);
    circle(g, cx + 1, cy - 1, 3, '#191725');
  }
  /* 四角散星（向角内偏置，形成天然装饰边框；x/y 独立随机，不会排成斜线） */
  function scatter(g, cx, cy, dx, dy, n, cols, rnd) {
    for (var i = 0; i < n; i++) {
      var d1 = rnd(), d2 = rnd();
      var sx = cx + dx * Math.floor(Math.pow(d1, 1.6) * 150);
      var sy = cy + dy * Math.floor(Math.pow(d2, 1.6) * 130);
      var col = cols[Math.floor(rnd() * cols.length)];
      if (rnd() < 0.3) px(g, sx, sy, 2, 2, col);   /* 部分星稍大（2×2） */
      else px(g, sx, sy, 1, 1, col);
    }
  }

  /* ============================================================
     像素美术手法：棋盘抖动 / 阶梯拱顶 / 断续木纹
     ============================================================ */
  /* 棋盘抖动：在区域内每隔一格填 1px（制造像素过渡，不渐变） */
  function dither(g, x, y, w, h, col) {
    for (var yy = y; yy < y + h; yy++) {
      for (var xx = x + ((yy - y) % 2); xx < x + w; xx += 2) {
        px(g, xx, yy, 1, 1, col);
      }
    }
  }
  /* 阶梯拱顶：一行一行台阶式收窄（像素阶梯，不是平滑曲线） */
  function stepArch(g, cx, yBase, yTop, halfW, col) {
    var total = yBase - yTop;
    var rows = Math.max(3, Math.ceil(total / 2));
    var y = yBase;
    for (var i = 0; i < rows; i++) {
      var t = (rows - i) / rows;
      var nw = Math.max(1, Math.round(halfW * t * t));
      var h = Math.min(2, y - yTop);
      px(g, cx - nw, y - h, nw * 2 + 1, h, col);
      y -= h;
    }
  }
  /* 断续木纹横线（一段一段，天然不规则） */
  function grain(g, x, y, w, col, rnd) {
    var xx = x;
    while (xx < x + w) {
      var len = 2 + Math.floor(rnd() * 5);
      if (xx + len > x + w) len = x + w - xx;
      px(g, xx, y, len, 1, col);
      xx += len + 1 + Math.floor(rnd() * 4);
    }
  }
  /* 一片小叶（灰绿 / 灰薰衣草，dir 方向） */
  function leaf(g, x, y, dir, col) {
    px(g, x, y, 1, 1, col);
    px(g, x + dir, y - 1, 1, 1, col);
    px(g, x + dir, y, 2, 1, col);
    px(g, x + dir, y + 1, 1, 1, col);
    px(g, x + dir * 2, y, 2, 1, col);
    px(g, x + dir * 3, y, 1, 1, col);
  }
  /* 像素玫瑰（花瓣结构：外圈花瓣 + 花瓣中圈 + 花心 + 高光 + 缝隙） */
  function rose(g, cx, cy, r) {
    var out = '#6E4658', body = '#A96F83', mid = '#C0899E', core = '#7A5064', hi = '#D6A4B4';
    var n = r * 2 + 1, s = n + 2;
    px(g, cx - r - 1, cy - r - 1, s, 1, out);
    px(g, cx - r - 1, cy + r + 1, s, 1, out);
    px(g, cx - r - 1, cy - r - 1, 1, s, out);
    px(g, cx + r + 1, cy - r - 1, 1, s, out);
    px(g, cx - r, cy - r, n, n, body);
    px(g, cx - r + 1, cy - r + 1, n - 2, n - 2, mid);
    px(g, cx - r + 2, cy - r + 2, n - 4, n - 4, core);
    px(g, cx - r + 1, cy - r + 1, r, 1, hi);
    px(g, cx - r + 1, cy - r + 1, 1, r, hi);
    px(g, cx, cy - r + 1, 1, 1, out);
    px(g, cx, cy + r - 1, 1, 1, out);
    px(g, cx - r + 1, cy, 1, 1, out);
    px(g, cx + r - 1, cy, 1, 1, out);
  }
  /* 一个小花苞 */
  function bud(g, cx, cy) {
    px(g, cx - 1, cy - 1, 3, 1, '#A96F83');
    px(g, cx - 1, cy, 3, 1, '#C0899E');
    px(g, cx, cy + 1, 1, 1, '#8A5A6E');
    px(g, cx, cy - 1, 1, 1, '#D6A4B4');
  }
  /* 一小段花枝（短、局部，不跨页） */
  function sprig(g, x, y, dir) {
    px(g, x, y, 1, 4, '#5A665A');
    px(g, x + dir, y - 2, 1, 2, '#5A665A');
    leaf(g, x + dir, y - 1, dir, '#7A8568');
    leaf(g, x - dir, y - 3, -dir, '#6E7A66');
  }
  /* 门后魔法星 ✦（分层硬边光，无渐变无 blur） */
  function magicStar(g, x, y) {
    star4(g, x, y, 'rgba(242,223,189,0.18)', 6);
    star4(g, x, y, 'rgba(242,223,189,0.35)', 4);
    star4(g, x, y, '#F2DFBD', 3);
    star4(g, x, y, '#FBEBCF', 2);
    px(g, x - 1, y - 1, 2, 2, '#FFF6E0');
  }

  /* ============================================================
     PAGE 1 · LUNA 魔法书封面首页（640×360，平面正视角）
     粉紫黑旧魔法书封面：中央一扇粉灰小门，周围漂浮弯月与星星。
     ============================================================ */
  /* 天空层（向下滚动）：底色 + 全部星星（主弯月及其伴星除外） */
  function paintSky(g) {
    var W = 640, H = 360, i;
    var rnd = seeded(17);
    var cream = '#F2DFBD', gold = '#BFA87E', pink = '#D6A4B4', lav = '#AAA0C8';
    var dotCols = [cream, lav, pink, gold, '#E8D8B8'];

    /* 底色：深灰蓝紫夜色（保持简单） */
    px(g, 0, 0, W, H, '#191725');

    /* 四角少量散星（自然装饰边框，很少） */
    scatter(g, 6, 6, 1, 1, 8, dotCols, rnd);
    scatter(g, 634, 6, -1, 1, 6, dotCols, rnd);
    scatter(g, 6, 354, 1, -1, 7, dotCols, rnd);
    scatter(g, 634, 354, -1, -1, 8, dotCols, rnd);
    for (i = 0; i < 12; i++) {
      var sx = Math.floor(rnd() * W), sy = Math.floor(rnd() * 210);
      if (sx > 230 && sx < 410 && sy > 88 && sy < 170) continue;
      px(g, sx, sy, 1, 1, dotCols[Math.floor(rnd() * dotCols.length)]);
    }
    for (i = 0; i < 7; i++) {
      var bx = Math.floor(rnd() * W), by = 214 + Math.floor(rnd() * 140);
      if (bx > 230 && bx < 410 && by > 96) continue;
      px(g, bx, by, 1, 1, dotCols[Math.floor(rnd() * dotCols.length)]);
    }

    /* 极少量四点星 / 斜闪 / 星芒 */
    star4(g, 120, 66, '#F2DFBD', 1);
    star4(g, 522, 58, '#F2DFBD', 1);
    star4(g, 40, 120, '#D6A4B4', 1);
    star4(g, 596, 122, '#BFA87E', 1);
    star4(g, 160, 200, '#AAA0C8', 1);
    star4(g, 480, 210, '#D6A4B4', 1);
    spark(g, 70, 180, '#F2DFBD');
    spark(g, 560, 170, '#D6A4B4');
    spark(g, 620, 260, '#F2DFBD');
    spark(g, 30, 280, '#BFA87E');

    /* 小月牙（右上 + 左下） */
    moonlet(g, 566, 64, '#E8D8B8');
    moonlet(g, 64, 288, '#D6A4B4');
  }

  /* 前景层（固定不滚）：主弯月 + 招牌 + 中央魔法入口 */
  function paintFront(g, lang) {
    var enterText = (lang === 'zh') ? '\u8fdb\u5165' : 'ENTER';
    var rnd = seeded(29);
    var fcx = 320;

    /* 主弯月 ☾（中央偏上，固定；旧占星书符号） */
    circle(g, 320, 30, 8, 'rgba(242,223,189,0.14)');
    circle(g, 320, 30, 7, '#F2DFBD');
    circle(g, 322, 28, 7, '#191725');
    px(g, 315, 27, 1, 1, '#FBEBCF');
    px(g, 316, 30, 1, 1, '#FBEBCF');
    /* 月旁 4 颗稍大的星（固定） */
    star4(g, 286, 24, '#F2DFBD', 3);
    star4(g, 354, 20, '#BFA87E', 2);
    star4(g, 330, 14, '#F2DFBD', 2);
    star4(g, 300, 16, '#D6A4B4', 2);

    /* ============ 小型招牌：LUNA / Divination & Curiosities ============ */
    px(g, 278, 56, 2, 7, '#5A4430');
    px(g, 362, 56, 2, 7, '#5A4430');
    px(g, 258, 63, 124, 32, '#241E26');
    archShape(g, 320, 60, 68, 62, '#241E26');
    archShape(g, 320, 59, 67, 63, '#A98A58');
    px(g, 258, 68, 124, 1, '#A98A58');
    px(g, 258, 68, 2, 27, '#A98A58');
    px(g, 380, 68, 2, 27, '#A98A58');
    px(g, 258, 93, 124, 2, '#A98A58');
    px(g, 262, 72, 116, 1, 'rgba(0,0,0,0.3)');
    /* 招牌旧感：边缘小磨损 + 极淡污点 */
    px(g, 258, 70, 1, 1, '#17121D');
    px(g, 379, 88, 1, 1, '#17121D');
    px(g, 262, 92, 2, 1, 'rgba(0,0,0,0.3)');
    px(g, 300, 65, 1, 1, 'rgba(242,223,189,0.12)');
    g.font = 'bold 15px Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#F2DFBD';
    g.fillText('LUNA', 320, 79);
    g.font = '6px monospace';
    g.fillStyle = '#BFA87E';
    g.fillText('Divination & Curiosities', 320, 90);
    /* 招牌两侧的小新月与小星（旧金） */
    circle(g, 282, 79, 3, '#A98A58');
    circle(g, 283, 78, 3, '#241E26');
    px(g, 360, 78, 1, 1, '#A98A58');
    px(g, 360, 80, 1, 1, '#A98A58');

    /* =========================================================
       中央：童话魔法入口（装饰拱框 + 粉色双开门微开 + 门后星空）
       —— 扁宽比例：更宽、更矮
       ========================================================= */

    /* —— 装饰拱形门框（muted lavender / 奶油 / 灰粉，厚像素块） —— */
    stepArch(g, fcx, 102, 94, 102, '#241F34');           /* 外轮廓拱 */
    px(g, 218, 102, 204, 168, '#241F34');                /* 外轮廓 x218..422, y102..270 */
    stepArch(g, fcx, 100, 96, 100, '#8E84A8');           /* 框面（muted lavender） */
    px(g, 222, 100, 196, 168, '#8E84A8');                /* 框面 x222..418 */
    /* 框面明暗（硬边 + 抖动） */
    px(g, 222, 100, 196, 4, '#A79CC0');
    dither(g, 222, 104, 196, 4, '#A79CC0');
    px(g, 222, 100, 6, 168, '#A79CC0');
    dither(g, 228, 100, 6, 168, '#A79CC0');
    px(g, 412, 100, 6, 168, '#6E6490');
    dither(g, 406, 100, 6, 168, '#6E6490');
    px(g, 222, 264, 196, 4, '#6E6490');
    dither(g, 222, 260, 196, 4, '#6E6490');
    /* 内侧奶油饰条（粗块拱） */
    stepArch(g, fcx, 100, 95, 76, '#E8DFC8');
    px(g, 238, 100, 2, 168, '#E8DFC8');
    px(g, 400, 100, 2, 168, '#E8DFC8');
    /* 内缘灰粉细边 */
    px(g, 240, 100, 2, 168, '#C89AB0');
    px(g, 398, 100, 2, 168, '#C89AB0');

    /* —— 门后世界：深蓝灰夜空 + 星点 + 魔法星 ✦ —— */
    px(g, 242, 110, 156, 152, '#242236');                /* 门后夜空 y110..262 */
    var inStars = [
      [254, 116, '#E8DFC8'], [272, 120, '#C8CFD8'], [288, 118, '#F2DFBD'],
      [356, 118, '#E8DFC8'], [374, 122, '#C8CFD8'], [388, 116, '#F2DFBD'],
      [308, 140, '#E8DFC8'], [332, 160, '#C8CFD8'], [300, 190, '#E8DFC8'],
      [340, 210, '#F2DFBD'], [306, 240, '#C8CFD8'], [334, 244, '#E8DFC8'],
      [256, 256, '#E8DFC8'], [280, 258, '#C8CFD8'], [340, 256, '#E8DFC8'], [380, 258, '#F2DFBD']
    ];
    for (var si = 0; si < inStars.length; si++) px(g, inStars[si][0], inStars[si][1], 1, 1, inStars[si][2]);
    magicStar(g, 320, 190);                              /* 门后发光的魔法星 */

    /* —— 粉色双开门（微微向两侧打开，门缝更宽） —— */
    var i;
    /* 左门扇（铰链 x242，自由边 x296，宽 54） */
    for (i = 0; i < 14; i++) px(g, 242, 112 + i, 1 + Math.round(54 * (i + 1) / 14), 1, '#B98A9E');
    px(g, 242, 126, 54, 112, '#B98A9E');                 /* 主体 y126..238 */
    for (i = 0; i < 14; i++) px(g, 242, 238 + i, 1 + Math.round(54 * (14 - i) / 14), 1, '#B98A9E');
    px(g, 242, 112, 3, 140, '#D6A4B4');                  /* 铰链侧高光 */
    px(g, 254, 126, 1, 112, '#A06A7A');                  /* 板缝 */
    px(g, 266, 126, 1, 112, '#A06A7A');
    px(g, 278, 126, 1, 112, '#A06A7A');
    px(g, 290, 126, 1, 112, '#A06A7A');
    px(g, 296, 126, 2, 112, '#8A5A6E');                  /* 自由边暗 */
    px(g, 298, 126, 2, 112, '#2A2440');                  /* 厚度（朝门内） */
    px(g, 255, 139, 11, 15, '#3A2C44');                  /* 左门扇小窗格 */
    px(g, 256, 140, 9, 13, '#F2DFBD');
    px(g, 257, 141, 3, 1, '#FFF6E0');
    /* 右门扇（铰链 x398，自由边 x344，宽 54） */
    for (i = 0; i < 14; i++) { var lw = Math.round(54 * (i + 1) / 14); px(g, 398 - lw, 112 + i, lw, 1, '#B98A9E'); }
    px(g, 344, 126, 54, 112, '#B98A9E');
    for (i = 0; i < 14; i++) { var lw2 = Math.round(54 * (14 - i) / 14); px(g, 398 - lw2, 238 + i, lw2, 1, '#B98A9E'); }
    px(g, 395, 112, 3, 140, '#D6A4B4');                  /* 铰链侧高光 */
    px(g, 384, 126, 1, 112, '#A06A7A');
    px(g, 372, 126, 1, 112, '#A06A7A');
    px(g, 360, 126, 1, 112, '#A06A7A');
    px(g, 348, 126, 1, 112, '#A06A7A');
    px(g, 344, 126, 2, 112, '#8A5A6E');                  /* 自由边暗 */
    px(g, 342, 126, 2, 112, '#2A2440');                  /* 厚度（朝门内） */
    px(g, 373, 139, 11, 15, '#3A2C44');                  /* 右门扇小窗格 */
    px(g, 374, 140, 9, 13, '#F2DFBD');
    px(g, 375, 141, 3, 1, '#FFF6E0');

    /* —— 门槛 + 小台阶 + ✦ ENTER ✦ —— */
    px(g, 236, 262, 168, 3, '#E8DFC8');                  /* 门槛顶（奶油） */
    px(g, 236, 265, 168, 3, '#8E84A8');
    px(g, 236, 268, 168, 2, '#6E6490');
    px(g, 220, 272, 200, 2, '#A79CC0');                  /* 台阶顶亮 */
    px(g, 220, 274, 200, 4, '#6E6490');                  /* 台阶体 */
    px(g, 220, 278, 200, 2, '#2A2438');                  /* 台阶底 */
    /* 注意：✦ ENTER ✦ 文字由 app.js 每帧按当前语言绘制（避免切换残留重叠） */

    /* —— 门框周围的小植物（局部、紧贴门框，不用大藤蔓） —— */
    sprig(g, 222, 264, 1);                               /* 左下 */
    rose(g, 230, 252, 2);
    leaf(g, 236, 242, 1, '#7A8568');
    bud(g, 218, 252);
    rose(g, 410, 252, 2);                                /* 右下 */
    leaf(g, 417, 244, -1, '#6E7A66');
    leaf(g, 404, 240, 1, '#7A8568');
    bud(g, 228, 108);                                    /* 左上 */
    leaf(g, 234, 102, 1, '#7A8568');
    rose(g, 410, 106, 2);                                /* 右上 */
    leaf(g, 404, 100, -1, '#6E7A66');
  }

  /* 组合（开发预览 / 一次性渲染用）：天空 + 前景 */
  function paintShopFront(g, lang) {
    paintSky(g);
    paintFront(g, lang);
  }

  /* ============================================================
     黑猫彩蛋：坐姿小黑猫（26×24，几乎全黑 + 碎月光高光）
     ============================================================ */
  function makeCat(closed) {
    var c = mk(26, 24), g = gx(c);
    var fur = '#17151D', shadow = '#0E0D12', rim = '#766C91', hi = '#A79ABB', eye = '#D5B76D';
    /* 身体（下部几乎全黑） */
    px(g, 9, 13, 8, 1, fur);
    px(g, 9, 14, 8, 1, fur);
    px(g, 10, 15, 6, 1, fur);
    px(g, 10, 16, 6, 1, fur);
    px(g, 10, 17, 6, 1, fur);
    px(g, 10, 18, 6, 1, fur);
    px(g, 9, 19, 8, 1, fur);
    px(g, 9, 20, 8, 1, fur);
    px(g, 10, 21, 6, 1, shadow);           /* 底部深阴影 */
    /* 头 + 耳朵（耳朵长在头顶，与头连成一体） */
    px(g, 5, 2, 1, 1, fur);                 /* 左耳尖 */
    px(g, 20, 2, 1, 1, fur);                /* 右耳尖 */
    px(g, 5, 3, 2, 1, fur);                 /* 左耳 */
    px(g, 19, 3, 2, 1, fur);                /* 右耳 */
    px(g, 6, 4, 2, 1, fur);                 /* 左耳根 */
    px(g, 18, 4, 2, 1, fur);                /* 右耳根 */
    px(g, 7, 5, 12, 1, fur);                /* 头顶（耳根与头衔接） */
    px(g, 7, 6, 12, 1, fur);                /* 头 */
    px(g, 7, 7, 12, 1, fur);
    px(g, 8, 8, 10, 1, fur);
    px(g, 8, 9, 10, 1, fur);
    px(g, 8, 10, 10, 1, fur);
    px(g, 9, 11, 8, 1, fur);
    px(g, 10, 12, 6, 1, fur);
    /* 尾巴（向右卷一小圈） */
    px(g, 17, 14, 2, 1, fur);
    px(g, 18, 15, 2, 1, fur);
    px(g, 19, 16, 2, 1, fur);
    px(g, 20, 17, 2, 1, fur);
    px(g, 21, 18, 1, 1, fur);
    px(g, 19, 18, 2, 1, shadow);
    /* 眼睛（暖金色，睁眼时） */
    if (!closed) {
      px(g, 10, 8, 1, 1, eye);
      px(g, 15, 8, 1, 1, eye);
    }
    /* 碎月光高光：只在耳尖 / 头顶 / 上背 / 尾巴上缘，不描轮廓 */
    px(g, 5, 2, 1, 1, rim);                 /* 左耳尖 */
    px(g, 20, 2, 1, 1, rim);                /* 右耳尖 */
    px(g, 10, 5, 1, 1, rim);                /* 头顶 */
    px(g, 14, 5, 1, 1, rim);
    px(g, 10, 13, 1, 1, rim);               /* 上背 */
    px(g, 13, 13, 1, 1, rim);
    px(g, 18, 15, 1, 1, rim);               /* 尾巴上缘 */
    px(g, 12, 7, 1, 1, hi);                 /* 额头一小点 */
    return c;
  }

  /* ============================================================
     五扇门的门徽（24×24）
     ============================================================ */
  var EMBLEMS = {};
  function emblem(key, fn) {
    var c = mk(24, 24);
    fn(gx(c));
    EMBLEMS[key] = c;
  }

  /* 1. 水晶球 */
  emblem('crystal', function (g) {
    px(g, 8, 18, 8, 2, '#8a6a44');
    px(g, 7, 20, 10, 2, '#c8a878');
    px(g, 8, 22, 8, 2, '#8a6a44');
    circle(g, 12, 10, 6, '#4a3a58');
    circle(g, 12, 10, 5, '#b9a7c9');
    circle(g, 10, 8, 2, '#e8dcf0');
    px(g, 13, 11, 3, 2, '#7d6a94');
  });

  /* 2. 捕梦网 */
  emblem('dream', function (g) {
    px(g, 10, 0, 4, 1, '#c8a878');
    px(g, 11, 1, 2, 3, '#c8a878');
    circle(g, 12, 9, 7, '#7a4a5a');
    circle(g, 12, 9, 6, '#c89ab0');
    var wc = '#f0e6d4';
    px(g, 12, 3, 1, 12, wc);
    px(g, 6, 9, 12, 1, wc);
    px(g, 8, 5, 8, 1, wc);
    px(g, 16, 5, 1, 8, wc);
    px(g, 8, 13, 1, 8, wc);
    px(g, 8, 5, 1, 8, wc);
    circle(g, 12, 9, 4, '#e8dcc0');
    circle(g, 12, 9, 2, '#c8a878');
    px(g, 10, 15, 1, 3, '#8a6a44');
    px(g, 14, 15, 1, 3, '#8a6a44');
    px(g, 9, 18, 3, 3, '#a06a7a');
    px(g, 13, 18, 3, 3, '#c89ab0');
    px(g, 10, 21, 2, 2, '#e8dcc0');
    px(g, 12, 21, 1, 1, '#8a6a44');
  });

  /* 3. 烧掉烦恼 */
  emblem('burn', function (g) {
    px(g, 9, 10, 13, 10, '#f0e6d4');
    px(g, 9, 10, 13, 1, '#d8c8a8');
    px(g, 9, 19, 13, 1, '#d8c8a8');
    px(g, 11, 13, 8, 1, '#c8b8a0');
    px(g, 11, 15, 8, 1, '#c8b8a0');
    px(g, 10, 5, 3, 4, '#e8a860');
    px(g, 9, 6, 5, 4, '#ffd9a0');
    px(g, 10, 3, 1, 2, '#ffd9a0');
    px(g, 12, 4, 1, 1, '#ffd9a0');
    px(g, 15, 7, 1, 1, '#e8a860');
    px(g, 19, 9, 1, 1, '#c87840');
  });

  /* 4. 魔药 */
  emblem('potion', function (g) {
    px(g, 10, 2, 4, 3, '#8a6a44');
    px(g, 10, 2, 4, 1, '#a8824a');
    px(g, 10, 5, 4, 4, '#7d6a94');
    circle(g, 12, 13, 7, '#5a4a70');
    circle(g, 12, 13, 6, '#b9a7c9');
    circle(g, 12, 14, 5, '#8a7ab8');
    px(g, 10, 14, 4, 1, '#e8dcf0');
    px(g, 17, 5, 1, 1, '#e8dcc0');
  });

  /* 5. 魔镜 */
  emblem('mirror', function (g) {
    circle(g, 12, 11, 8, '#8a6a44');
    circle(g, 12, 11, 7, '#c8a878');
    circle(g, 12, 11, 6, '#1c1026');
    circle(g, 10, 9, 2, '#e8dcc0');
    circle(g, 11, 8, 2, '#1c1026');
    px(g, 15, 8, 1, 1, '#e8dcc0');
    px(g, 5, 5, 3, 1, '#c89ab0');
    px(g, 6, 4, 1, 3, '#c89ab0');
    px(g, 6, 5, 1, 1, '#e8dcc0');
  });

  /* 一扇门（48×64：方形顶木门 + 门徽 + 黄铜把手） */
  function makeDoor(key) {
    var c = mk(48, 64), g = gx(c);
    var frame = '#120c1c', wood = '#2a1a36', dark = '#1c1026', light = '#3a2648';
    /* 方形门框（顶部是平的，不是拱顶） */
    px(g, 2, 2, 44, 60, frame);                 /* 外框 */
    px(g, 4, 4, 40, 56, wood);                  /* 框面 */
    px(g, 4, 4, 40, 2, light);                  /* 顶高光 */
    px(g, 4, 4, 2, 56, light);                  /* 左高光 */
    px(g, 42, 4, 2, 56, dark);                  /* 右暗 */
    px(g, 4, 58, 40, 2, dark);                  /* 底暗 */
    /* 门板 */
    px(g, 6, 6, 36, 52, wood);
    px(g, 6, 6, 36, 1, light);
    px(g, 6, 6, 1, 52, light);
    px(g, 41, 6, 1, 52, dark);
    px(g, 6, 57, 36, 1, dark);
    /* 板缝（竖线） */
    px(g, 13, 6, 1, 52, dark); px(g, 14, 6, 1, 52, light);
    px(g, 26, 6, 1, 52, dark); px(g, 27, 6, 1, 52, light);
    px(g, 39, 6, 1, 52, dark);
    /* 门徽 */
    g.drawImage(EMBLEMS[key], 12, 12);
    /* 黄铜把手 */
    px(g, 37, 43, 3, 3, '#c8a878');
    px(g, 37, 43, 3, 1, '#e8d8b8');
    /* 门槛 */
    px(g, 2, 60, 44, 4, '#120c1c');
    px(g, 2, 60, 44, 1, '#2a1a36');
    return c;
  }

  /* ============================================================
     PAGE 3 · 五个魔法物件（每页只有一个视觉主角）
     ============================================================ */

  /* 水晶球 72×72：lavender 球体 + 黄铜座；lit 时亮起 */
  function objCrystal(g, s) {
    var lit = !!s.lit;
    circle(g, 36, 34, lit ? 26 : 22, lit ? 'rgba(185,167,201,0.28)' : 'rgba(185,167,201,0.12)');
    circle(g, 36, 34, lit ? 20 : 18, lit ? 'rgba(232,220,240,0.20)' : 'rgba(232,220,240,0.08)');
    px(g, 22, 54, 28, 2, '#c8a878');
    px(g, 24, 56, 24, 4, '#8a6a44');
    px(g, 26, 60, 20, 3, '#6a4a30');
    px(g, 26, 52, 20, 2, '#8a6a44');
    circle(g, 36, 34, 18, '#3a2a48');
    circle(g, 36, 34, 17, '#9a88b4');
    circle(g, 36, 34, 16, '#b9a7c9');
    px(g, 28, 36, 10, 2, '#8a78a4');
    px(g, 30, 39, 8, 2, '#8a78a4');
    px(g, 44, 30, 2, 8, '#a898c0');
    circle(g, 30, 26, 5, '#e8dcf0');
    px(g, 28, 24, 3, 1, '#f4ecfa');
    px(g, 30, 22, 2, 2, '#f4ecfa');
    if (lit) {
      circle(g, 36, 36, 8, 'rgba(240,230,255,0.35)');
      circle(g, 36, 38, 4, 'rgba(255,250,255,0.5)');
    }
  }

  /* 捕梦网 84×84：粉紫圆环 + 米白蛛网 + 羽毛；stars 为留下的星数 */
  function objDream(g, s) {
    var stars = s.stars || 0;
    px(g, 40, 4, 4, 4, '#c8a878');
    px(g, 38, 2, 8, 2, '#c8a878');
    circle(g, 42, 34, 24, '#7a4a5a');
    circle(g, 42, 34, 23, '#c89ab0');
    circle(g, 42, 34, 22, '#d8a8bc');
    var wc = '#f0e6d4';
    px(g, 42, 12, 1, 44, wc);
    px(g, 20, 34, 44, 1, wc);
    px(g, 26, 18, 32, 1, wc);
    px(g, 58, 18, 1, 32, wc);
    px(g, 26, 50, 1, 32, wc);
    px(g, 26, 18, 1, 32, wc);
    for (var i = 0; i <= 32; i++) {
      px(g, 26 + i, 18 + i, 1, 1, wc);
      px(g, 58 - i, 18 + i, 1, 1, wc);
    }
    circle(g, 42, 34, 16, '#e8dcc0');
    circle(g, 42, 34, 9, '#e8dcc0');
    circle(g, 42, 34, 3, '#c8a878');
    if (stars >= 1) smallStar(g, 36, 26, '#f0e6d4');
    if (stars >= 2) smallStar(g, 50, 28, '#f0e6d4');
    if (stars >= 3) smallStar(g, 42, 20, '#f0e6d4');
    /* 挂绳与羽毛 */
    px(g, 34, 58, 2, 8, '#c8a878');
    px(g, 50, 58, 2, 8, '#c8a878');
    px(g, 30, 66, 8, 12, '#a06a7a');
    px(g, 34, 66, 5, 12, '#c89ab0');
    px(g, 46, 66, 8, 12, '#c89ab0');
    px(g, 50, 66, 4, 12, '#e8dcc0');
    px(g, 39, 60, 6, 4, '#8a6a44');
    px(g, 28, 70, 2, 2, '#e8dcc0');
    px(g, 54, 70, 2, 2, '#e8dcc0');
  }

  /* 烧掉烦恼 88×64：纸张透明度 1→0 + 火焰生长 + 火星 */
  function drawBurnFrame(g, p, frame) {
    var W = 88, H = 64;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = Math.max(0, 1 - p);
    px(g, 18, 20, 50, 28, '#f0e6d4');
    px(g, 18, 20, 50, 2, '#d8c8a8');
    px(g, 18, 46, 50, 2, '#d8c8a8');
    px(g, 22, 26, 30, 1, '#c8b8a0');
    px(g, 22, 30, 34, 1, '#c8b8a0');
    px(g, 22, 34, 26, 1, '#c8b8a0');
    g.globalAlpha = 1;
    var fh = 6 + Math.round(p * 14), fw = 6 + Math.round(p * 6);
    var fx = 18, ft = 20 - fh;
    px(g, fx, ft, fw, fh, '#c87840');
    px(g, fx + 1, ft + 1, fw - 2, fh - 1, '#e8a860');
    px(g, fx + 2, ft + 2, fw - 4, fh - 2, '#ffd9a0');
    if (frame % 2 === 0) px(g, fx + 1, ft - 2, 2, 2, '#ffd9a0');
    else px(g, fx + 3, ft - 1, 2, 2, '#ffd9a0');
    for (var i = 0; i < 4; i++) {
      var sy = ft - 3 - (i * 5 + ((frame * 2) % 5));
      px(g, fx + (i % 3) * 4 + i, sy, 1, 1, i % 2 ? '#e8a860' : '#f0e0c0');
    }
  }
  /* 烧完：一小撮灰烬 + 余烬 */
  function drawBurnAsh(g) {
    g.clearRect(0, 0, 88, 64);
    px(g, 30, 46, 26, 3, '#4a3a52');
    px(g, 32, 49, 20, 2, '#3a2c42');
    px(g, 34, 45, 10, 2, '#6a5a72');
    px(g, 40, 44, 8, 2, '#7a6a82');
    px(g, 42, 44, 2, 2, '#e8a860');
    px(g, 40, 42, 6, 1, 'rgba(232,168,96,0.5)');
    px(g, 38, 38, 1, 1, 'rgba(232,168,96,0.7)');
    px(g, 46, 34, 1, 1, 'rgba(240,224,192,0.6)');
    px(g, 44, 28, 1, 1, 'rgba(232,168,96,0.5)');
  }

  /* 魔药瓶 64×100：软木塞 + 玻璃烧瓶 + 药液（颜色随魔药变化）+ 标签 */
  function objPotion(g, s) {
    var color = s.color || '#8a7ab8';
    var bubbles = !!s.bubbles;
    circle(g, 32, 54, 28, 'rgba(185,167,201,0.10)');
    px(g, 25, 6, 14, 7, '#8a6a44');
    px(g, 25, 6, 14, 2, '#a8824a');
    px(g, 27, 13, 10, 2, '#6a4a30');
    flask(g, 32, 54, 20, 15, 7, '#b9a7c9', color, 50);
    px(g, 14, 50, 36, 1, 'rgba(255,255,255,0.35)');
    px(g, 14, 40, 3, 26, 'rgba(255,255,255,0.20)');
    px(g, 15, 37, 2, 3, 'rgba(255,255,255,0.30)');
    px(g, 49, 42, 2, 2, 'rgba(255,255,255,0.12)');
    if (bubbles) {
      px(g, 28, 52, 2, 2, 'rgba(255,255,255,0.6)');
      px(g, 36, 46, 2, 2, 'rgba(255,255,255,0.5)');
      px(g, 30, 40, 2, 2, 'rgba(255,255,255,0.4)');
    }
    px(g, 22, 76, 20, 14, '#f0e6d4');
    px(g, 22, 76, 20, 1, '#c8b8a0');
    px(g, 22, 89, 20, 1, '#c8b8a0');
    px(g, 27, 82, 10, 2, '#8a6a44');
    px(g, 46, 24, 2, 2, '#e8dcc0');
  }

  /* 魔镜 84×116：复古哥特椭圆镜框（月亮/星星/小花/蕾丝点），shown 时镜面泛光 */
  function objMirror(g, s) {
    var shown = !!s.shown;
    ellipse(g, 42, 54, 30, 40, '#6a4a30');
    ellipse(g, 42, 54, 27, 37, '#c8a878');
    ellipse(g, 42, 54, 25, 35, '#e8dcc0');
    ellipse(g, 42, 54, 22, 32, shown ? '#3a2c48' : '#1c1026');
    px(g, 28, 38, 20, 1, shown ? 'rgba(232,220,240,0.28)' : 'rgba(232,220,240,0.14)');
    px(g, 30, 42, 16, 1, shown ? 'rgba(232,220,240,0.22)' : 'rgba(232,220,240,0.10)');
    if (shown) px(g, 34, 46, 10, 1, 'rgba(232,220,240,0.18)');
    /* 手柄 */
    px(g, 38, 94, 8, 16, '#8a6a44');
    px(g, 40, 94, 4, 16, '#c8a878');
    /* 框上装饰：顶部月牙 + 两侧星点 + 底部小花 + 蕾丝点 */
    circle(g, 42, 16, 3, '#c8a878');
    circle(g, 43, 15, 3, '#e8dcc0');
    px(g, 18, 32, 1, 1, '#f0e6d4');
    px(g, 66, 32, 1, 1, '#f0e6d4');
    px(g, 20, 40, 1, 1, '#f0e6d4');
    px(g, 64, 40, 1, 1, '#f0e6d4');
    flower(g, 24, 78);
    flower(g, 60, 78);
    px(g, 42, 18, 1, 1, '#f0e6d4');
    px(g, 22, 54, 1, 1, '#f0e6d4');
    px(g, 62, 54, 1, 1, '#f0e6d4');
    px(g, 42, 90, 1, 1, '#f0e6d4');
  }

  /* 按物件键生成大物件画布（state 控制各物件状态） */
  function makeObject(key, s) {
    s = s || {};
    var c;
    if (key === 'crystal') { c = mk(72, 72); objCrystal(gx(c), s); }
    else if (key === 'dream') { c = mk(84, 84); objDream(gx(c), s); }
    else if (key === 'burn') {
      c = mk(88, 64);
      if (s.phase === 2) drawBurnAsh(gx(c));
      else drawBurnFrame(gx(c), 0, 0);
    }
    else if (key === 'potion') { c = mk(64, 100); objPotion(gx(c), s); }
    else if (key === 'mirror') { c = mk(84, 116); objMirror(gx(c), s); }
    else c = mk(64, 64);
    return c;
  }

  /* ============================================================
     导出
     ============================================================ */
  window.SPR = {
    mk: mk,
    px: px,
    up: up,
    paintSky: paintSky,
    paintFront: paintFront,
    paintShopFront: paintShopFront,
    makeCat: makeCat,
    makeDoor: makeDoor,
    makeObject: makeObject,
    drawBurnFrame: drawBurnFrame,
    drawBurnAsh: drawBurnAsh,
    /* 可点击 / 高亮的区域（画布内部坐标） */
    ENTER_RECT: { x: 218, y: 94, w: 204, h: 202 },
    PLAQUE_RECT: { x: 272, y: 284, w: 96, h: 18 }
  };
})();
