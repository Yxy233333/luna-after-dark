/* ============================================================
   LUNA — Divination & Curiosities
   数据文件：双语文案（EN / 中文）+ 五扇门 + 占卜内容池
   文案按物件分组存放，键名没有任何 tag/act 等技术后缀。
   ============================================================ */
window.I18N = {

  /* ---------- 通用 UI ---------- */
  hint:       { en: 'Which door calls to you?', zh: '哪扇门在呼唤你？' },
  back:       { en: '\u2190 BACK', zh: '\u2190 返回' },
  writeFirst: { en: 'Write something first.', zh: '请先写下一些内容。' },
  pickNeed:   { en: 'Choose what you need tonight first.', zh: '请先选择你今晚需要的。' },

  /* ---------- 五个物件（名称 / 描述 / 按钮…） ---------- */
  objects: {
    crystal: {
      name:  { en: 'THE CRYSTAL BALL',  zh: '水晶球' },
      desc:  { en: 'Think of something you want to ask.', zh: '想一件你想问的事。' },
      act:   { en: 'ASK THE CRYSTAL', zh: '询问水晶球' },
      again: { en: 'ASK AGAIN', zh: '再问一次' }
    },
    dream: {
      name: { en: 'THE DREAMCATCHER', zh: '捕梦网' },
      desc: { en: 'Some dreams should not follow you into morning.\nLeave here what you don\u2019t want to carry with you.', zh: '有些梦，不必跟着你走到天亮。\n把不想带走的梦留在这里吧。' },
      ph:   { en: 'Tell the dreamcatcher...', zh: '告诉捕梦网……' },
      act:  { en: 'LET IT GO', zh: '让它带走这个梦' }
    },
    burn: {
      name:  { en: 'BURN A WORRY', zh: '烧掉烦恼' },
      desc:  { en: 'Write down something you don\u2019t want to carry right now.', zh: '写下此刻不想背负的事。' },
      ph:    { en: 'Write your worry...', zh: '写下你的烦恼……' },
      act:   { en: 'BURN IT', zh: '烧掉它' },
      again: { en: 'BURN ANOTHER', zh: '再烧一件' },
      done:  { en: 'You don\u2019t have to carry everything at once.', zh: '你不必一下子扛起所有事。' }
    },
    potion: {
      name:  { en: 'THE POTION CABINET', zh: '魔药柜' },
      desc:  { en: 'What do you need tonight?', zh: '今晚你需要什么？' },
      act:   { en: 'BREW', zh: '调配' },
      again: { en: 'BREW AGAIN', zh: '再调一瓶' }
    },
    mirror: {
      name:  { en: 'THE MAGIC MIRROR', zh: '魔镜' },
      desc:  { en: 'Ask it anything. It answers only what you need to hear.', zh: '问它任何事。它只回答你需要听见的话。' },
      act:   { en: 'LOOK INTO THE MIRROR', zh: '望向镜中' },
      again: { en: 'LOOK AGAIN', zh: '再看一次' }
    }
  },

  /* ---------- 魔药需求 ---------- */
  needs: {
    courage: { en: 'COURAGE', zh: '勇气' },
    luck:    { en: 'LUCK',    zh: '好运' },
    rest:    { en: 'REST',    zh: '安眠' },
    love:    { en: 'LOVE',    zh: '爱' },
    clarity: { en: 'CLARITY', zh: '明净' }
  }
};

/* 五扇门（顺序即展示顺序：上 3 扇 + 下 2 扇） */
window.DOORS = [
  { key: 'crystal' },
  { key: 'dream' },
  { key: 'burn' },
  { key: 'potion' },
  { key: 'mirror' }
];

/* 各物件的预写内容池（全部双语） */
window.LUNA_POOLS = {

  /* 水晶球：占卜结果 */
  crystal: [
    { en: 'Something you have been waiting for may be closer than it seems.', zh: '你一直等待的事，或许比看起来更近。' },
    { en: 'A silver thread of luck runs through today.', zh: '一缕银色的好运贯穿今日。' },
    { en: 'The answer you seek is already in your pocket.', zh: '你寻找的答案，其实就在你口袋里。' },
    { en: 'A stranger\u2019s kindness will brighten your evening.', zh: '傍晚，一位陌生人的善意会让你心头一暖。' },
    { en: 'Someone is thinking of you under this same moon.', zh: '在这同一轮月下，有人正想着你。' },
    { en: 'A small risk brings a quiet reward.', zh: '一次小小的冒险，会带来安静的回报。' },
    { en: 'The mist clears if you walk forward one more step.', zh: '再向前走一步，雾气就会散去。' },
    { en: 'Do not rush; the tide turns at midnight.', zh: '不必着急，午夜时分潮水会转向。' }
  ],

  /* 魔镜：镜面里的话 */
  mirror: [
    { en: 'Perhaps you already know more than you think.', zh: '也许你早已知道得比你想象的多。' },
    { en: 'The answer is kinder than the fear.', zh: '答案比恐惧更温柔。' },
    { en: 'Wait until the moon rises a little higher.', zh: '等月亮再升高一些。' },
    { en: 'Someone is quietly proud of you tonight.', zh: '今夜，有人正默默为你骄傲。' },
    { en: 'You are not late. You are exactly on time.', zh: '你没有迟到。你恰好准时。' },
    { en: 'Let the question rest until morning.', zh: '让这个问题歇息到天亮吧。' },
    { en: 'A door opens when you stop pushing.', zh: '当你不再推门时，门自会打开。' },
    { en: 'Trust the quiet yes inside you.', zh: '相信你心里那个安静的「是」。' }
  ],

  /* 魔药柜：魔药（名称 + 描述 + 对应需求标签 + 药液颜色） */
  potion: [
    { name: { en: 'MOONWATER', zh: '月光水' }, desc: { en: 'For quieter thoughts and gentler nights.', zh: '献给更安静的心绪与更温柔的夜晚。' }, needs: ['rest', 'clarity'], color: '#8a7ab8' },
    { name: { en: 'AMBER COURAGE', zh: '琥珀勇气' }, desc: { en: 'One drop on the tongue before you speak.', zh: '开口之前，在舌尖滴上一滴。' }, needs: ['courage'], color: '#d9a860' },
    { name: { en: 'ROSE SYRUP', zh: '玫瑰糖浆' }, desc: { en: 'Sweetens the heart it touches.', zh: '甜化它所触碰的心。' }, needs: ['love'], color: '#c89ab0' },
    { name: { en: 'LAVENDER SLEEP', zh: '薰衣草安眠' }, desc: { en: 'A tiny sip before bed; dreams float lighter.', zh: '睡前一小口；梦会飘得更轻。' }, needs: ['rest'], color: '#a898c8' },
    { name: { en: 'STARWATER', zh: '星水' }, desc: { en: 'Drink slowly; the fog in your mind settles.', zh: '慢慢喝下；心里的雾气会沉静下来。' }, needs: ['clarity'], color: '#d8d0e0' },
    { name: { en: 'VELVET COURAGE', zh: '天鹅绒勇气' }, desc: { en: 'Warm as velvet, steady as a heartbeat.', zh: '像天鹅绒一样温暖，像心跳一样坚定。' }, needs: ['courage', 'love'], color: '#a06a7a' },
    { name: { en: 'MOONLUCK', zh: '月亮好运' }, desc: { en: 'For nights when you need the tide to turn.', zh: '献给需要潮水转向的夜晚。' }, needs: ['luck', 'rest'], color: '#c8b0d8' },
    { name: { en: 'CLOVER DEW', zh: '三叶草露' }, desc: { en: 'A quiet blessing for small chances.', zh: '为小小的机遇送上安静的祝福。' }, needs: ['luck'], color: '#c8b878' }
  ],

  /* 黑猫彩蛋：随机小话（正经占卜 × 搞怪反差） */
  cat: [
    { en: 'The cat is watching you.', zh: '猫正在看着你。' },
    { en: 'You look like you need a little luck.', zh: '你好像需要一点好运。' },
    { en: 'Something good may be closer than you think.', zh: '好事或许比你想象中更近。' },
    { en: 'No prophecy today. The cat wants snacks.', zh: '今天没有预言。猫只想吃零食。' },
    { en: 'The cat yawns. It is not impressed.', zh: '猫打了个哈欠。它没被打动。' },
    { en: 'A whisker twitches. Tonight will be gentle.', zh: '胡须动了动。今晚会很温柔。' },
    { en: 'The cat knows something, but it won\u2019t say.', zh: '猫知道些什么，但它不说。' },
    { en: 'Purr. That is all.', zh: '呼噜。就这样。' }
  ],

  /* 黑猫彩蛋：忽略三连（点了三次才理你） */
  catIgnore: [
    { en: 'The cat ignores you.', zh: '猫没有理你。' },
    { en: 'Still ignoring you.', zh: '还是没有理你。' },
    { en: '...Fine. You may pet the cat.', zh: '……好吧。允许你摸一下。' }
  ]
};
