// Chinese Escape Room Game Engine
// All story/NPC/item text in Traditional Chinese

(function() {
'use strict';

// ─── Utility ───────────────────────────────────────────────────────────────
function rand4() { return String(Math.floor(Math.random() * 9000) + 1000); }
function rand6() { return String(Math.floor(Math.random() * 900000) + 100000); }
function rand8() { return String(Math.floor(Math.random() * 90000000) + 10000000); }

const CODES = {
  safe:    rand4(),
  hallway: rand4(),
  labBox:  rand4(),
  cipher:  rand6(),
  final:   rand8(),
};

// ─── Game State ────────────────────────────────────────────────────────────
let gameState = {
  currentRoom: 'room1',
  inventory: ['note', 'flashlight'],
  solvedPuzzles: [],
  secretsFound: 0,
  npcStages: { guard: 0, scientist: 0, mysteriousWoman: 0, oldMan: 0, ghost: 0 },
  unlockedRooms: [],
  visitedRooms: ['room1'],
  flags: {
    powerRestored: false,
    bookshelfSolved: false,
    containerOpened: false,
    containerTrapped: false,
    allNpcsTalked: false,
    mapAcquired: false,
  },
  timeLeft: 3600,
  gameOver: false,
};

// ─── Items ──────────────────────────────────────────────────────────────────
const ITEMS = {
  note: {
    name: '紙條',
    desc: `一張皺巴巴的紙條，邊緣已經泛黃。上面的字跡模糊，但你仔細辨認出數字：${CODES.safe}，其餘文字幾乎無法辨識。`,
  },
  flashlight: {
    name: '手電筒',
    desc: '一支老舊的手電筒，按下開關卻沒有反應——看來電池沒電了。',
  },
  battery: {
    name: '電池',
    desc: '一組新的電池，還在原裝包裝裡，看起來完全充電。',
  },
  keyA: {
    name: '鑰匙A',
    desc: '一把沉重的金屬鑰匙，上面刻著字母「A」，用途不明。',
  },
  keyB: {
    name: '鑰匙B',
    desc: '一把略顯生鏽的鑰匙，刻有字母「B」，似乎開啟某個重要的鎖。',
  },
  keyC: {
    name: '鑰匙C',
    desc: '做工精細的鑰匙，刻有字母「C」，握在手中感覺沉甸甸的。',
  },
  keyD: {
    name: '鑰匙D',
    desc: '一把閃閃發光的金色鑰匙，刻有字母「D」，散發著神秘的光芒。',
  },
  finalKey: {
    name: '最終鑰匙',
    desc: '一把設計複雜的鑰匙，上面有精細的雕紋，這應該就是通往自由的關鍵。',
  },
  blueprint: {
    name: '藍圖',
    desc: `這是一份設施的建築平面圖，許多區域被塗黑了。你在角落發現一組數字被圓圈標記：${CODES.hallway}。`,
  },
  journal: {
    name: '實驗日誌',
    desc: `日誌的封面已經破損，翻開後你看到最後一頁寫著：「密碼箱密碼—${CODES.labBox}—勿忘」，字跡顫抖，顯然是倉促寫下的。`,
  },
  cipherPaper: {
    name: '密碼紙',
    desc: '一張印著複雜符號的紙，這些符號似乎是某種替換密碼。解讀後你得到線索：密碼第一、二位數字的總和是某個特定值。',
  },
  oldPhoto: {
    name: '舊照片',
    desc: '一張黑白照片，拍攝的是一群穿著白色實驗服的人站在設施前。照片背面寫著：「第一個數字藏在陰影之中」。',
  },
  oldPhoto2: {
    name: '舊照片2',
    desc: '照片顯示一個破舊的儲藏室，角落有一個音樂盒。背面寫著：「音樂聲中藏著真相」。',
  },
  oldPhoto3: {
    name: '舊照片3',
    desc: '這張照片似乎是偷拍的，畫面模糊，但你能辨認出這就是這棟建築。背面寫著：「三張照片合一，真相自現」。',
  },
  redCard: {
    name: '紅色卡片',
    desc: '一張紅色的磁卡，上面有設施的標誌。可以用來開啟某些特定的門。',
  },
  blueCard: {
    name: '藍色卡片',
    desc: '神秘女子給你的藍色磁卡，上面有一個眼睛的圖案，散發著奇異的冷光。',
  },
  magnetCard: {
    name: '磁力卡',
    desc: '一張強力磁卡，從密碼室的鎖箱中取出。它可以開啟設施深處的某些裝置。',
  },
  idCard: {
    name: '識別證',
    desc: '一張員工識別證，照片已經模糊，名字被塗抹掉了。門禁權限似乎還有效。',
  },
  testTubeA: {
    name: '試管A',
    desc: '裝著藍色液體的試管，標籤上寫著「化合物A—不穩定」，液體在燈光下微微發光。',
  },
  testTubeC: {
    name: '試管C',
    desc: '裝著紅色液體的試管，標籤上寫著「化合物C—催化劑」，與化合物A接觸時會產生反應。',
  },
  mixedChemical: {
    name: '混合化學物',
    desc: '將兩種化合物混合後產生的紫色液體，有輕微的腐蝕性，可以溶解某些鎖具。',
  },
  book1: {
    name: '書籍一',
    desc: '一本關於量子力學的厚重教科書，某頁被折角，那頁的頁碼是一個重要的線索。',
  },
  book2: {
    name: '書籍二',
    desc: '一本破舊的詩集，扉頁寫著「在黑暗中尋找光明」。某些字母被用鉛筆輕輕標記。',
  },
  notebook: {
    name: '筆記本',
    desc: '神秘女子藏在隱藏房間的筆記本，裡面記錄著設施的秘密研究，以及一個令人不安的真相。',
  },
  hardDrive: {
    name: '硬碟',
    desc: '一個外接硬碟，裡面應該存有重要的資料。需要連接到電腦才能讀取。',
  },
  usb: {
    name: 'USB隨身碟',
    desc: '一個小小的USB隨身碟，上面貼著紅色膠帶，寫著「最終程序」。',
  },
  decoder: {
    name: '解碼器',
    desc: '一個手持式電子解碼裝置，用於解讀加密文件。配合密碼紙使用效果更佳。',
  },
  wire: {
    name: '電線',
    desc: '一段粗壯的電線，長度剛好適合連接發電機的電路板。',
  },
  fuse: {
    name: '保險絲',
    desc: '一個完整的保險絲，看起來規格與發電機相符。換上它也許能讓電力恢復。',
  },
  repairedWire: {
    name: '修復電線',
    desc: '已經裝上保險絲的電線，可以用來修復發電機的電路。',
  },
  screwdriver: {
    name: '螺絲起子',
    desc: '一把十字型螺絲起子，用途廣泛，可以拆開許多面板。',
  },
  wrench: {
    name: '扳手',
    desc: '一把調節型扳手，重量適中，對機械修理很有幫助。',
  },
  tape: {
    name: '錄音帶',
    desc: '一卷舊式磁帶，標籤已剝落。在觀察室的錄音機上播放，裡面傳來模糊的聲音，你隱約聽到密碼的一部分。',
  },
  antenna: {
    name: '天線',
    desc: '一根可折疊的無線電天線，連接到無線電設備可以增強訊號強度。',
  },
  radio: {
    name: '無線電',
    desc: '一台老式無線電機器，需要天線才能接收到外部訊號。',
  },
  activeRadio: {
    name: '啟動的無線電',
    desc: '裝上天線後的無線電，發出嘈雜的靜電聲，但偶爾能接收到微弱的訊號。',
  },
  fixedFlashlight: {
    name: '修好的手電筒',
    desc: '裝上電池後的手電筒，發出強烈的光束，可以照亮黑暗的角落。',
  },
  scalpel: {
    name: '手術刀',
    desc: '一把銳利的手術刀，刀刃在燈光下閃爍。某些情況下可能派上用場。',
  },
  bandage: {
    name: '繃帶',
    desc: '一卷無菌繃帶，包裝完好，緊急情況可以使用。',
  },
  medicineBottle: {
    name: '藥瓶',
    desc: '一瓶標籤模糊的藥，裡面的液體呈淡黃色。最好不要輕易服用不明藥物。',
  },
  envelope: {
    name: '信封',
    desc: '一個封緘的信封，上面沒有收件人的名字。打開後發現裡面是一張寫著數字的便條。',
  },
  musicBox: {
    name: '音樂盒',
    desc: '一個精緻的木製音樂盒，打開後播放出一段旋律。旋律的音符順序是：3-1-4，這似乎是某個密碼的一部分。',
  },
  spraypaint: {
    name: '噴漆罐',
    desc: '一罐橘色噴漆，還剩下不少。可以在牆上做標記，或者有其他用途。',
  },
  secretDisk: {
    name: '秘密磁碟',
    desc: '一張刻錄著設施最高機密的光碟，上面的資料足以顛覆一切。這是逃出後最重要的證據。',
  },
  map: {
    name: '地圖',
    desc: '一張設施的簡略地圖，雖然不完整，但標示了主要的通道和房間位置。',
  },
  ghostFile: {
    name: '幽靈檔案',
    desc: '一份標記著「絕對機密」的檔案，記錄著這個設施進行的非法實驗，以及失蹤人員的名單。閱讀後你感到一陣寒意。',
  },
  caseReport: {
    name: '案例報告',
    desc: '一份厚重的案例報告，部分頁面已被刻意撕去。剩餘的頁面以冰冷的數字記錄著受試者的反應數據——「樣本B-07：第三週意識消退，第五週無反應」。你無法繼續讀下去。',
  },
  lipstickCup: {
    name: '口紅杯',
    desc: '一個陶瓷咖啡杯，杯沿有一道清晰的口紅印。你翻過杯底，發現有人用口紅寫著兩個工整的數字。這個人想讓某個後來者看到這些數字，用她能用的唯一方式。',
  },
  metalContainer: {
    name: '金屬容器',
    desc: '一個厚重的密封金屬容器，表面標記著「BX-17 / 永久保存」。容器做工精密，封閉嚴實。吳明遠說過的話浮上心頭：失蹤的人，他們的身體還在這裡。你的手放在容器蓋上，遲遲無法用力。',
  },
};

// ─── Rooms ──────────────────────────────────────────────────────────────────
const ROOMS = {
  room1: {
    id: 'room1',
    name: '醒來的房間',
    desc: '你猛地從黑暗中驚醒，發現自己躺在一張冰冷的金屬床上。後腦勺還隱隱作痛——被人擊昏之前的記憶殘留著：走廊的陰影、腳步聲、然後什麼都沒了。房間四壁是灰色的混凝土，一盞昏黃的燈在天花板上微弱地閃爍。空氣中瀰漫著消毒水和銹鐵的混合氣味。你的手機不見了，記者證不見了，你甚至不確定自己在哪裡——只知道，你是林哲宇，一個記者，而這個設施不歡迎記者。床邊有一張小桌子，桌上散落著幾件物品。牆角有一個生鏽的保險箱，表面漆跡斑斑。你必須逃出去，但首先，你需要工具。',
    items: ['note', 'flashlight'],
    exits: { north: 'hallway' },
    puzzles: ['safePuzzle'],
    hints: ['仔細檢查桌上的紙條，上面可能有重要數字。', '保險箱需要四位數密碼，試試看你找到的數字。', '打開保險箱後，裡面的東西對你很有用。'],
  },
  hallway: {
    id: 'hallway',
    name: '走廊',
    desc: '一條長長的走廊，燈光忽明忽暗，投下詭異的陰影。走廊兩側的牆壁上有剝落的油漆，地板上有深深的刮痕——那些痕跡太規律了，彷彿有什麼沉重的東西被反覆拖過這裡，拖進某個你還不知道在哪裡的地方。走廊的一端站著一個守衛，制服整齊卻神情憔悴，他用複雜的眼神看著你——那不只是戒備，更像是某種說不清楚的東西。幾個通道從這裡延伸出去，每一個都通往未知。一份折疊的藍圖夾在牆壁的縫隙中。',
    items: ['blueprint'],
    exits: { south: 'room1', north: 'lab', east: 'library', west: 'archive', up: 'storage' },
    npc: 'guard',
    puzzles: [],
    hints: ['走廊裡的守衛可能知道一些有用的訊息，試著和他交談。', '注意走廊四周——藍圖上可能有重要的數字。'],
  },
  lab: {
    id: 'lab',
    name: '實驗室',
    desc: '這間實驗室明顯被倉促廢棄——培養皿仍在架子上，顯微鏡的目鏡還沒有蓋上，白板上寫滿了複雜的分子式，某些部分被胡亂塗抹掉，像是有人在最後一刻試圖抹去什麼。牆上貼著一張進度圖表，標題寫著「第二階段受試者狀況追蹤」，所有名字都被塗黑了，但日期清晰可見——最近的記錄是三週前。一個滿臉焦慮的科學家在角落裡踱步，喃喃自語，眼睛不時望向門口，像是在等待什麼，或者，在提防什麼。架子上整齊排列著各種試管，其中兩支的顏色特別引人注意。實驗桌上有一本皮面日誌，邊角已經磨損，像是被翻閱了無數次。',
    items: ['testTubeA', 'testTubeC', 'journal'],
    exits: { south: 'hallway', east: 'labB', north: 'medRoom' },
    npc: 'scientist',
    puzzles: ['chemicalPuzzle', 'labBoxPuzzle'],
    hints: ['那兩支試管顏色不同，也許混合後會有效果？', '日誌裡可能記載著密碼箱的密碼。', '實驗室密碼箱需要正確的四位數才能打開。'],
  },
  library: {
    id: 'library',
    name: '圖書室',
    desc: '書架從地板延伸到天花板，塞滿了各式各樣的書籍，有些書的書脊已經褪色到無法辨認。空氣中飄著舊書的氣息，混合著一絲霉味。一個白髮蒼蒼的老人坐在窗邊的椅子上，似乎在沉思。書架的最右側有一個特別寬厚的書架，它與其他書架的間距似乎有些不尋常。昏暗的燈光讓整個房間顯得更加神秘。',
    items: ['book1', 'book2'],
    exits: { west: 'hallway', north: 'controlRoom' },
    npc: 'oldMan',
    puzzles: ['bookshelfPuzzle', 'hiddenRoomEntry'],
    hints: ['用修好的手電筒仔細檢查書架，黑暗中可能藏著什麼。', '那個書架的位置有些奇怪，也許它可以移動？'],
  },
  archive: {
    id: 'archive',
    name: '檔案室',
    desc: '金屬文件櫃排列得密密麻麻，抽屜上都貼著分類標籤，但許多已經被撕掉或塗黑。地板上散落著各種文件，顯然有人曾經匆忙翻找過這裡。靠近南牆有一扇沉重的金屬門，上面有一個密碼鍵盤，紅色的燈在黑暗中閃爍。一些重要文件仍然夾在散落的紙堆之中。',
    items: ['cipherPaper', 'oldPhoto'],
    exits: { east: 'hallway', south: 'underground' },
    puzzles: ['archivePuzzle'],
    hints: ['密碼紙上的符號需要解讀，找找看是否有工具可以幫助你。', '舊照片的背面可能藏有線索。'],
    lockedExits: { north: { room: 'secretArchive', requires: 'redCard', altItem: 'idCard' } },
  },
  underground: {
    id: 'underground',
    name: '地下走廊',
    desc: '潮濕陰暗的地下走廊，管道沿著天花板蜿蜒而行，偶爾發出嘎嘎的聲響。牆壁上滲著水漬，地面積著淺淺的水坑，每一步都發出令人不安的回響。空氣沉重而悶熱，帶著一股腐敗的氣息。走廊兩端都有通道，但東側的廢棄走廊似乎很久沒有人走過了。',
    items: ['wire'],
    exits: { north: 'archive', south: 'generatorRoom', east: 'abandonedHallway' },
    puzzles: [],
    hints: ['電線可以用來修復某些東西，找找看保險絲在哪裡。'],
  },
  generatorRoom: {
    id: 'generatorRoom',
    name: '發電機房',
    desc: '這是設施的心臟——一台巨大的柴油發電機佔據了房間中央，但它已經熄火，在黑暗中沉默地矗立著。牆上的電路板暴露在外，一根斷裂的保險絲插座清晰可見。房間裡散落著各種工具，空氣中殘留著柴油的氣味。如果能讓發電機重新運轉，整個設施的電力系統就會恢復。',
    items: ['fuse', 'wrench'],
    exits: { north: 'underground' },
    puzzles: ['generatorPuzzle'],
    hints: ['發電機需要保險絲才能啟動。', '找到電線和保險絲，先組合它們，再用在發電機上。'],
  },
  cipherRoom: {
    id: 'cipherRoom',
    name: '密碼室',
    desc: '這個房間幾乎是空的，只有一盞昏暗的燈和中央的一個密碼鎖箱。鎖箱是黑色的金屬製成，上面有六個數字轉盤，每個轉盤都能獨立旋轉。鎖箱表面有許多細小的刮痕，顯示有人曾經多次嘗試打開它。成功打開鎖箱是離開這裡的關鍵步驟之一。',
    items: [],
    exits: { west: 'controlRoom' },
    puzzles: ['cipherPuzzle'],
    hints: ['密碼鎖需要六位數密碼，線索分散在設施各處。', '和每個NPC都交談，他們各自掌握密碼的一部分。'],
  },
  hiddenRoom: {
    id: 'hiddenRoom',
    name: '隱藏房間',
    desc: '隱藏在書架後面的秘密房間，牆壁上貼滿了照片、文件和手寫紀錄，用紅線和圖釘連接成一張巨大的關係網，像是某人花了數個月一點一滴拼湊出來的真相地圖。照片裡有設施的走廊、實驗室、人員名單，以及一個反覆出現的詞：「幽靈計劃」。房間很小，空氣沉悶，但每一面牆都充滿了密度驚人的訊息。一個女子站在房間中央，她轉過身的瞬間，你在她眼睛裡看到的不是驚慌，而是一種複雜的計算——她在判斷你，判斷你是否值得信任。',
    items: ['notebook', 'hardDrive'],
    exits: { west: 'library' },
    npc: 'mysteriousWoman',
    puzzles: ['womanTalkPuzzle'],
    hints: ['和神秘女子交談，她知道關於這個設施的一切。', '筆記本和硬碟裡有重要的訊息。'],
    locked: true,
  },
  controlRoom: {
    id: 'controlRoom',
    name: '控制室',
    desc: '一排排的監控螢幕，大多數已經黑屏，幾個仍然顯示著模糊的畫面——空曠的走廊，廢棄的實驗室，黑暗的地下室。控制面板上有許多按鈕和開關，大部分都已關閉。一個電子面板的螺絲看起來鬆動了，也許可以拆開它。只有在電力恢復後，這些系統才能完全啟動。',
    items: ['screwdriver'],
    exits: { south: 'library', east: 'commRoom', west: 'cipherRoom' },
    puzzles: ['controlPuzzle'],
    hints: ['螺絲起子可以拆開控制面板。', '必須先讓發電機恢復運作，控制室的系統才能啟動。'],
  },
  storage: {
    id: 'storage',
    name: '儲藏室',
    desc: '雜亂的儲藏室裡堆滿了各種物品——破損的設備、舊式的文件盒、沾滿灰塵的布幔。天花板的燈泡忘了關，在昏暗的光線下投射出長長的陰影。角落裡有一個精緻的木製音樂盒，顯得格格不入，彷彿有人特意把它藏在這裡。',
    items: ['musicBox', 'oldPhoto2'],
    exits: { down: 'hallway' },
    puzzles: ['musicBoxPuzzle'],
    hints: ['音樂盒播放的旋律是一個重要線索。', '仔細聆聽音符的順序。'],
  },
  medRoom: {
    id: 'medRoom',
    name: '醫療室',
    desc: '白色的醫療室裡有幾張病床，上面的白色床單已經泛黃。牆上的醫療器具架上整齊排列著各種工具。一面大型鏡子佔據了整面牆，但鏡子表面有些奇怪——如果你仔細看，會發現它的背面似乎有文字透過來。藥品櫃的玻璃門半開著，裡面還剩下一些物資。',
    items: ['scalpel', 'bandage', 'medicineBottle'],
    exits: { south: 'lab', east: 'observeRoom' },
    puzzles: ['mirrorPuzzle'],
    hints: ['醫療室的鏡子有些不尋常，仔細檢查它。', '也許需要特殊光線才能看清楚鏡子背面的文字。'],
  },
  observeRoom: {
    id: 'observeRoom',
    name: '觀察室',
    desc: '這個房間的一整面牆是單向玻璃，可以俯瞰下方的某個實驗區域，但下面已經漆黑一片。房間裡有一台舊式錄音機，旁邊放著幾卷磁帶。一份厚重的案例報告散落在桌上，有些頁面被撕去了。這個房間見證了許多秘密，牆壁如果會說話，不知道會說些什麼。',
    items: ['tape', 'caseReport'],
    exits: { west: 'medRoom' },
    puzzles: ['tapePuzzle'],
    hints: ['把錄音帶放到錄音機上，看看裡面錄了什麼。', '案例報告也許包含重要的訊息。'],
  },
  commRoom: {
    id: 'commRoom',
    name: '通訊室',
    desc: '通訊室裡的設備大多已經損壞，電線雜亂地垂落著，幾個螢幕碎裂了。但牆角有一台相對完好的無線電設備，雖然老舊，但也許還能使用。一根天線架子空著，如果找到天線的話也許能接收到訊號。外面的世界就在無線電頻率的另一端，只要能連上線……',
    items: ['antenna', 'radio'],
    exits: { west: 'controlRoom' },
    puzzles: ['radioPuzzle'],
    hints: ['天線和無線電需要組合在一起才能使用。', '成功連線後，外面的訊號可能帶來重要情報。'],
  },
  restRoom: {
    id: 'restRoom',
    name: '休息室',
    desc: '員工休息室裡有幾把磨損的沙發和一張咖啡桌。桌上有一個口紅染色的咖啡杯，杯底留著些什麼。牆上掛著一個月曆，日期停在幾年前的某一天——某人最後一次在這裡喝咖啡的那天。一個封好的信封被壓在一本雜誌下面，上面沒有任何標記。',
    items: ['envelope', 'lipstickCup'],
    exits: { down: 'hallway' },
    puzzles: ['cupPuzzle'],
    hints: ['那個口紅杯底有東西——仔細檢查它。', '信封裡可能藏有線索。'],
  },
  securityRoom: {
    id: 'securityRoom',
    name: '保全室',
    desc: '保全室的監控設備大部分已經損壞，但仍能看出這裡曾經是整個設施的眼睛。牆上掛著一個員工識別證，照片已經模糊到幾乎看不清楚。桌上有一把備用鑰匙，用鐵圈掛著。這個房間明顯有人匆忙離開——椅子翻倒，幾個抽屜敞開著。',
    items: ['idCard', 'keyB'],
    exits: { east: 'hallway' },
    puzzles: ['keypadPuzzle'],
    hints: ['識別證可以用來通過某些門禁系統。', '找到秘密檔案室的入口並使用識別證。'],
  },
  labB: {
    id: 'labB',
    name: '實驗室B區',
    desc: '實驗室的延伸區域，專門用來進行更高等級的研究。大型離心機和基因測序儀排列在兩側，這些設備價值不菲。一台電腦工作站的螢幕仍然亮著，顯示著一個需要驗證的基因序列界面。桌子上有一個USB隨身碟和一個奇怪的電子解碼裝置。',
    items: ['usb', 'decoder'],
    exits: { west: 'lab', north: 'mainframeRoom' },
    puzzles: ['sequencePuzzle', 'decoderPuzzle'],
    hints: ['解碼器可以配合密碼紙使用。', '基因序列的讀取需要特殊設備。'],
  },
  abandonedHallway: {
    id: 'abandonedHallway',
    name: '廢棄走廊',
    desc: '這條走廊顯然已經廢棄多年，牆壁上的油漆大片剝落，露出生鏽的鋼筋。地板上積了厚厚的灰塵，清晰地印著一些腳印——新的、老的，有幾組很凌亂，像是掙扎時留下的。走廊盡頭有一面磚牆，但它的顏色比周圍的牆壁新，邊緣的縫隙也不像原始建築的工法——有人後來砌上去的，把什麼東西封在後面。空氣在這裡有一種沉默的重量，不是安靜，而是某種被壓抑住的東西。走廊的陰影裡，有一個形狀在若隱若現，忽聚忽散。',
    items: ['spraypaint'],
    exits: { west: 'underground' },
    npc: 'ghost',
    puzzles: ['brickWallPuzzle', 'ghostTalkPuzzle'],
    hints: ['那面磚牆看起來很可疑，也許背後藏著什麼？', '和走廊裡的存在交談，即使感到害怕。'],
  },
  deepUnderground: {
    id: 'deepUnderground',
    name: '深層地下室',
    desc: '比地下走廊更深的地方，空氣幾乎凝固，呼吸都變得困難。這裡沒有任何標示，沒有任何說明牌——這個地方的存在本身就不該被知道。牆壁上的符號不是任何已知的語言，更像是某種記號，像是有人在絕望中刻下的東西。中央有一個重型金屬容器，表面光滑，封閉得嚴密，上面標著「BX-17 / 永久保存」。你想起了吳明遠說過的話——失蹤的人，他們的身體還在這裡。你站在容器前，感到一種說不清楚的沉重。這個地方充滿了一種讓人想逃離，卻又讓人無法移開眼睛的不祥。',
    items: ['metalContainer'],
    exits: { west: 'underground' },
    puzzles: ['containerPuzzle'],
    hints: ['那個金屬容器引人注意，但打開它可能有風險。', '三思而後行——一旦做了選擇，就無法回頭。'],
    locked: true,
  },
  secretArchive: {
    id: 'secretArchive',
    name: '秘密檔案室',
    desc: '這個隱藏的檔案室存放著設施最機密的資料。牆壁上整齊排列著密封的文件箱，每個都貼著「最高機密」的紅色標籤，有些標籤上還有日期——最早的是二十年前，最近的是幾週前，時間跨度之長讓你不寒而慄。空氣中有一股陳腐的氣息，彷彿這些秘密已經在這裡慢慢腐爛了很多年，等待著有一天被人打開、見光、讓它們所代表的重量終於落地。中央桌子上，一份標記著「幽靈計劃——完整紀錄」的厚重檔案格外顯眼，封面的角落有一行小字：「許福田 監製」。',
    items: ['ghostFile', 'keyC'],
    exits: { south: 'archive' },
    puzzles: ['filePuzzle'],
    locked: true,
    hints: ['閱讀幽靈檔案，它揭示了這個設施的真正目的。', '找到鑰匙C，它可能在後面的旅途中有用。'],
  },
  mainframeRoom: {
    id: 'mainframeRoom',
    name: '主機房',
    desc: '巨大的伺服器機架佔據了整個房間，風扇的嗡嗡聲震耳欲聾。指示燈閃爍著紅紅綠綠的光，在黑暗中創造出一種詭異的氛圍。中央有一台主控台，需要特殊的儲存設備才能存取其中的資料。這裡儲存著整個設施的核心秘密，包括最終的逃脫密碼。',
    items: [],
    exits: { south: 'labB' },
    puzzles: ['mainframePuzzle'],
    hints: ['主機需要USB或硬碟才能讀取資料。', 'USB和硬碟各自揭示最終密碼的一半。'],
  },
  escapeRoute: {
    id: 'escapeRoute',
    name: '逃生通道',
    desc: '狹窄的逃生通道，牆壁近到幾乎可以同時觸碰兩側。地面是金屬格柵，腳步聲在下方的空洞中迴響。前方有一扇厚重的防火門，上面有一個密碼鍵盤，要求輸入走廊密碼才能通過。這條路是你通往自由的希望所在。',
    items: [],
    exits: { north: 'finalCipherRoom' },
    puzzles: ['fireDoorPuzzle'],
    hints: ['防火門需要走廊密碼，那個密碼藏在設施的藍圖上。'],
    locked: true,
  },
  finalCipherRoom: {
    id: 'finalCipherRoom',
    name: '最終密碼室',
    desc: '幾乎與世隔絕的密室，只有一束光從天花板的縫隙中透進來。房間中央有一個巨大的密碼鎖，需要八位數的最終密碼。這是整個設施最後的防線，也是你通往自由的最後障礙。鎖的表面冰冷而沉重，上面刻著這個設施的標誌。',
    items: [],
    exits: { north: 'exitHall', south: 'escapeRoute' },
    puzzles: ['finalPuzzle'],
    hints: ['最終密碼需要從主機房獲得的資料拼湊而成。', '分別使用USB和硬碟讀取主機，得到密碼的前後四位。'],
  },
  exitHall: {
    id: 'exitHall',
    name: '出口大廳',
    desc: '終於到了出口大廳——一個寬敞的空間，有著高聳的天花板和大理石地板，與這棟建築其他地方的陰暗截然不同，像是精心設計來讓人放鬆戒心的門面。正對面是一扇巨大的金屬門，陽光從門縫中透進來，帶著外面世界的溫暖氣息，那氣息讓你幾乎要忘記剛才走過的一切。但你忘不了。守衛的眼神、科學家顫抖的聲音、老人最後的微笑、幽靈說的那個名字——鄭立偉。你站在門前，手握著最終鑰匙，感到一種沉甸甸的重量。這一刻，你有選擇。',
    items: [],
    exits: {},
    puzzles: ['exitPuzzle'],
    hints: ['使用最終鑰匙打開出口大門。', '你的選擇和行動將決定你的命運。'],
  },
  vaultRoom: {
    id: 'vaultRoom',
    name: '保險庫',
    desc: '深藏在設施最底層的保險庫，四壁是厚重的鋼板，入口的密封機制顯示這裡被設計成能夠抵抗任何形式的強行進入。裡面出奇地整潔，彷彿有人定期來清理——也彷彿有人一直在等某個人終於找到這裡。中央放著一個散發藍色光芒的裝置，設計複雜而精緻，和這個設施其他地方粗糙的器具形成鮮明對比。旁邊是一張秘密磁碟，以及一個金色鑰匙。這個地方知道的人寥寥無幾，但你現在站在這裡，你是其中之一了。',
    items: ['keyD', 'secretDisk'],
    exits: { west: 'deepUnderground' },
    puzzles: ['vaultPuzzle'],
    locked: true,
    hints: ['藍色光芒裝置似乎很重要，仔細檢查它。', '保險庫裡的秘密磁碟是最重要的證據之一。'],
  },
};

// ─── NPCs ───────────────────────────────────────────────────────────────────
const NPCS = {
  guard: {
    name: '守衛陳建志',
    stages: [
      '守衛用懷疑的眼神上下打量你，手緊按在腰間的對講機上。他的眼底有一種奇怪的疲憊——不像是睡眠不足，更像是長期的道德疲勞。「你是誰？你不應該在這裡。說清楚你是哪個部門的，否則我現在就通報上去。」',
      '守衛的手從對講機上移開了。他沉默片刻，像是在做某個掙扎許久的決定。「……我叫陳建志。退役士兵，兩年前來這裡工作，因為我需要養一個七歲的女兒。」他壓低聲音，「我見過太多不該見的東西。那些被蒙眼帶進來的人——他們再也沒有走出去。」他把密碼的線索告訴你：「第一個數字是' + CODES.cipher[0] + '，第二個是' + CODES.cipher[1] + '。快走。」',
      '守衛轉過身，不再看你。「如果有一天，這件事被世界知道了……」他停頓了很長時間，聲音低得幾乎只是氣音，「告訴我的女兒，她爸爸最後做了一件對的事。」他再也沒有回頭。',
    ],
  },
  scientist: {
    name: '科學家吳明遠',
    stages: [
      '科學家看到你，驚得後退了一步，試管差點掉落在地。「天啊——你是誰？你怎麼進來的？！」他的眼神快速掃向門口，壓低聲音，「這裡不安全。你不知道他們在做什麼——我是說，你根本無法想象。」他的手在微微顫抖。',
      '科學家深吸一口氣，強迫自己冷靜。「我叫吳明遠，神經科學博士。我加入這裡，是因為相信意識研究能治癒阿茲海默症。」他苦笑，「三年前，我親眼看到一個二十歲的孩子在實驗台上喊媽媽。我試著阻止，他們說——我的家人會出事。」他把線索塞給你，「密碼第三個數字是' + CODES.cipher[2] + '，第四個是' + CODES.cipher[3] + '。我一直在等一個能帶這些東西出去的人。」',
      '吳明遠靠近你，聲音幾近耳語。「深層地下室的密封容器——那些失蹤的人，他們的身體還在那裡。我一直在保存證據，就是為了等這一刻。」他把一份文件塞入你的口袋，「如果你逃出去了，請讓世界知道他們的名字。」',
    ],
  },
  mysteriousWoman: {
    name: '神秘女子蘇靜雨',
    stages: [
      '隱藏房間裡的女子猛地轉身，眼神銳利如刀，像是早已預備好攻擊的姿態。但她沒有動作，只是冷冷地說：「你不應該能找到這裡。這個地方——知道太多的人，都消失了。你明白我在說什麼嗎？」',
      '她的表情逐漸鬆動，走近幾步。「我叫蘇靜雨。人權調查員，三個月前以研究助理身份臥底進入這裡，目標是取得幽靈計劃的核心證據。」她遞給你一張藍色磁卡，「拿著這個——我出不去，設施所有出口都需要生物識別，我的身份恐怕已經暴露了。」她的語氣很平靜，但眼神裡有一絲隱藏不住的恐懼。',
      '蘇靜雨最後望了一眼牆上那張密密麻麻的真相地圖，轉向你。「秘密檔案室裡有幽靈檔案——那裡記錄了一切。帶出去，交給我的聯絡人。」她從外套口袋掏出一張便條，上面有一個加密信箱的地址，「記住，不是為了我。是為了那些已經回不來的人。你保重。」',
    ],
    givesItem: { stage: 1, item: 'blueCard' },
  },
  oldMan: {
    name: '老研究員許福田',
    stages: [
      '老人抬起頭，渾濁的眼睛看著你，像是穿透了你，在看一個遙遠的過去。「孩子……你來了。」他的聲音像落葉在風中飄蕩，「我在這裡等了很久了。這個設施啊——連牆壁都在哭泣，只有人還裝作聽不見。」',
      '老人緩緩點頭，像是做出了某個早已預備好的決定。「我叫許福田。我是這個設施的創辦研究員之一。二十年前，我們相信我們在造福人類。」他搖搖頭，眼眶泛紅，「後來我試著舉報，他們說我精神不穩定，把我軟禁在這裡，掛著『名譽顧問』的名義。」他把密碼告訴你：「第五個數字是' + CODES.cipher[4] + '，第六個是' + CODES.cipher[5] + '。這個密碼機制是我當年設計的——確保只有能與所有倖存者建立信任的人，才能打開那個鎖。你就是那個人。」',
      '許福田閉上眼睛，嘴角浮現一絲解脫的微笑。「我已經太老了，走不動了。但我種下了這棵樹——長成了我無法面對的怪物。」他輕聲說，「帶著真相離開吧，孩子。讓世界知道這裡發生了什麼。這是我二十年來唯一能做的懺悔了。」',
    ],
  },
  ghost: {
    name: '幽靈',
    stages: [
      '走廊的陰影突然凝聚成一個模糊的人形，發出低沉的嗚咽聲。那聲音像是從很遠很遠的地方傳來，帶著令人心碎的疲憊：「……離開……這裡……快……離開……」你感到一陣極度的寒意蔓延全身，那不只是溫度——是一種沉甸甸的悲傷。',
      '幽靈的輪廓逐漸清晰——是一個穿著舊式實驗服的年輕男子，看上去只有二十出頭。「我……叫鄭立偉……資工系大三……」他的聲音帶著哽咽，「我應徵了一個打工網站的志願者實驗……說是記憶力測試……再也沒有走出去……」他的手指虛弱地指向走廊盡頭，「磚牆後面……有通往最深處的路……那裡有最終的真相……求求你……讓我們安息……讓我們的名字被記住……」幽靈緩緩消散，但那份悲傷卻久久縈繞不去。',
    ],
    onComplete: () => { gameState.secretsFound++; },
  },
};

// ─── Puzzles ─────────────────────────────────────────────────────────────────
const PUZZLES = {
  safePuzzle: {
    id: 'safePuzzle',
    hint: `保險箱需要四位數密碼。紙條上有線索——密碼是 ${CODES.safe}。`,
    solve(args) {
      if (gameState.solvedPuzzles.includes('safePuzzle')) { print('保險箱已經打開了。', 'info'); return; }
      const code = args[0];
      if (code === CODES.safe) {
        markSolved('safePuzzle');
        addItem('battery'); addItem('keyA');
        print('鎖扣彈開了！保險箱內有一組電池和一把鑰匙A。', 'success');
      } else {
        print('密碼錯誤，保險箱紋絲不動。', 'error');
      }
    },
  },
  flashlightPuzzle: {
    id: 'flashlightPuzzle',
    hint: '手電筒沒有電池，找到電池後組合它們。',
    solve(args) { print('使用 combine flashlight battery 來修好手電筒。', 'info'); },
  },
  hallwayDoorPuzzle: {
    id: 'hallwayDoorPuzzle',
    hint: `通往地下走廊的通道在檔案室南邊，密碼是 ${CODES.hallway}。`,
    solve(args) { print('這個謎題通過找到走廊密碼來解決。', 'info'); },
  },
  chemicalPuzzle: {
    id: 'chemicalPuzzle',
    hint: '試管A和試管C可以組合在一起，產生新的化合物。',
    solve(args) { print('使用 combine testTubeA testTubeC 來混合化學物。', 'info'); },
  },
  labBoxPuzzle: {
    id: 'labBoxPuzzle',
    hint: `實驗室密碼箱需要四位數密碼。日誌裡有線索——密碼是 ${CODES.labBox}。`,
    solve(args) {
      if (gameState.solvedPuzzles.includes('labBoxPuzzle')) { print('密碼箱已經打開了。', 'info'); return; }
      const code = args[0];
      if (code === CODES.labBox) {
        markSolved('labBoxPuzzle');
        addItem('redCard');
        print('密碼箱啪地彈開！裡面有一張紅色磁卡。', 'success');
      } else {
        print('密碼錯誤，密碼箱沒有反應。', 'error');
      }
    },
  },
  bookshelfPuzzle: {
    id: 'bookshelfPuzzle',
    hint: '用修好的手電筒照射書架，黑暗中可能有隱藏的按鈕。',
    solve(args) {
      if (!gameState.inventory.includes('fixedFlashlight')) {
        print('光線太暗了，你需要一個更亮的光源。', 'error'); return;
      }
      if (gameState.solvedPuzzles.includes('bookshelfPuzzle')) { print('書架已經移開了。', 'info'); return; }
      markSolved('bookshelfPuzzle');
      gameState.flags.bookshelfSolved = true;
      ROOMS.library.exits.east = 'hiddenRoom';
      print('手電筒的光照亮了書架底部的一個隱藏按鈕！你按下它，書架緩緩移開，露出一條秘密通道。', 'success');
    },
  },
  hiddenRoomEntry: {
    id: 'hiddenRoomEntry',
    hint: '先解開書架謎題，才能進入隱藏房間。',
    solve(args) {
      if (gameState.flags.bookshelfSolved) {
        markSolved('hiddenRoomEntry');
        print('通道已經開啟，向東可以進入隱藏房間。', 'info');
      } else {
        print('書架擋住了通道，需要找到移動它的方法。', 'error');
      }
    },
  },
  generatorPuzzle: {
    id: 'generatorPuzzle',
    hint: '用修復電線連接發電機。先用 combine wire fuse 組合電線和保險絲。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('generatorPuzzle')) { print('發電機已經在運轉了。', 'info'); return; }
      if (!gameState.inventory.includes('repairedWire')) {
        print('你需要先修復電線——用電線和保險絲組合。', 'error'); return;
      }
      markSolved('generatorPuzzle');
      gameState.flags.powerRestored = true;
      gameState.inventory = gameState.inventory.filter(i => i !== 'repairedWire');
      print('你將修復電線接入發電機電路板，按下啟動按鈕——巨大的機器轟鳴著醒來！燈光亮了，整個設施的電力系統恢復了！', 'success');
      ROOMS.escapeRoute.locked = false;
      print('你聽到遠處某扇門被電磁鎖解鎖的聲音。', 'info');
    },
  },
  cipherPuzzle: {
    id: 'cipherPuzzle',
    hint: `密碼鎖需要六位數密碼，與五個NPC交談以獲得各個數字。密碼是 ${CODES.cipher}。`,
    solve(args) {
      if (gameState.solvedPuzzles.includes('cipherPuzzle')) { print('密碼鎖已經打開了。', 'info'); return; }
      const code = args[0];
      if (code === CODES.cipher) {
        markSolved('cipherPuzzle');
        addItem('magnetCard');
        print('六個轉盤一一對齊，鎖箱發出清脆的聲響打開了！裡面躺著一張磁力卡。', 'success');
      } else {
        print('密碼錯誤，轉盤彈回原位。', 'error');
      }
    },
  },
  controlPuzzle: {
    id: 'controlPuzzle',
    hint: '用螺絲起子拆開控制面板，但需要電力恢復後才能啟動系統。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('controlPuzzle')) { print('控制面板已經啟動了。', 'info'); return; }
      if (!gameState.inventory.includes('screwdriver')) {
        print('你需要螺絲起子來拆開面板。', 'error'); return;
      }
      if (!gameState.flags.powerRestored) {
        print('電力還沒有恢復，控制面板沒有反應。先去修復發電機。', 'error'); return;
      }
      markSolved('controlPuzzle');
      gameState.secretsFound++;
      print('你用螺絲起子拆開控制面板，重新接好內部線路。螢幕亮了起來，顯示設施的地圖和一條通往逃生通道的路線！', 'success');
      ROOMS.escapeRoute.locked = false;
      print('逃生通道的入口從控制室延伸出去，隱藏在一個秘密面板後面。你現在可以前往逃生通道了。', 'info');
    },
  },
  musicBoxPuzzle: {
    id: 'musicBoxPuzzle',
    hint: '打開音樂盒，仔細聆聽旋律的音符順序。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('musicBoxPuzzle')) { print('你已經分析過音樂盒的旋律了。', 'info'); return; }
      markSolved('musicBoxPuzzle');
      print('音樂盒播放出悠揚的旋律：Do-La-Mi（1-3-4）。你把這個數字序列記了下來，感覺它和某個密碼有關。', 'success');
    },
  },
  mirrorPuzzle: {
    id: 'mirrorPuzzle',
    hint: '用手電筒照射鏡子，也許能看到背面的文字。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('mirrorPuzzle')) { print('鏡子裡的訊息你已經看過了。', 'info'); return; }
      if (!gameState.inventory.includes('fixedFlashlight')) {
        print('光線不足，你無法看清楚鏡子背面的文字。', 'error'); return;
      }
      markSolved('mirrorPuzzle');
      gameState.secretsFound++;
      print('手電筒的強光照射在鏡子上，你看到背面透出的反字：「真相比你想象的更黑暗。實驗並未終止——只是轉移地點了。」', 'success');
    },
  },
  tapePuzzle: {
    id: 'tapePuzzle',
    hint: '把錄音帶放到觀察室的錄音機上播放。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('tapePuzzle')) { print('錄音帶已經播放過了。', 'info'); return; }
      if (!gameState.inventory.includes('tape') && !ROOMS.observeRoom.items.includes('tape')) {
        print('這裡沒有錄音帶可以播放。', 'error'); return;
      }
      if (gameState.currentRoom !== 'observeRoom') {
        print('這裡沒有錄音設備，去觀察室試試。', 'error'); return;
      }
      markSolved('tapePuzzle');
      print('錄音機播出沙沙的靜電聲，然後是一個顫抖的聲音：「……如果有人找到這個……密碼最後兩位是……」錄音突然中斷，但你已經隱約聽到了數字。', 'success');
    },
  },
  radioPuzzle: {
    id: 'radioPuzzle',
    hint: '先用 combine antenna radio 組合天線和無線電，然後使用啟動的無線電。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('radioPuzzle')) { print('無線電已經使用過了。', 'info'); return; }
      if (!gameState.inventory.includes('activeRadio')) {
        print('你需要先組合天線和無線電。', 'error'); return;
      }
      markSolved('radioPuzzle');
      gameState.secretsFound++;
      print('無線電發出嘈雜的靜電聲，然後你聽到外面的聲音：「……有人在嗎？……這個設施已經被封鎖……密碼……」訊號中斷，但你記下了重要的資訊。', 'success');
    },
  },
  cupPuzzle: {
    id: 'cupPuzzle',
    hint: '仔細檢查那個有口紅印的咖啡杯，杯底也許有文字。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('cupPuzzle')) { print('你已經仔細檢查過杯子了。', 'info'); return; }
      markSolved('cupPuzzle');
      print('你翻過杯子，發現杯底用口紅寫著兩個數字。這應該是密碼的一部分。', 'success');
    },
  },
  keypadPuzzle: {
    id: 'keypadPuzzle',
    hint: '用識別證刷過門禁讀卡機，應該能通過保全室的門禁。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('keypadPuzzle')) { print('門禁已經通過了。', 'info'); return; }
      if (!gameState.inventory.includes('idCard')) {
        print('你需要識別證才能通過門禁。', 'error'); return;
      }
      markSolved('keypadPuzzle');
      ROOMS.archive.lockedExits = null;
      ROOMS.archive.exits.north = 'secretArchive';
      print('識別證的磁條被讀卡機掃描，紅燈變成綠燈，一聲「嗶」之後，你聽到某處的電磁鎖解除了。秘密檔案室的入口應該已經可以進入了。', 'success');
    },
  },
  sequencePuzzle: {
    id: 'sequencePuzzle',
    hint: '用解碼器解讀基因序列的顯示，找到隱藏的數字訊息。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('sequencePuzzle')) { print('基因序列已經解讀完畢。', 'info'); return; }
      if (!gameState.inventory.includes('decoder')) {
        print('你需要解碼器來解讀這個序列。', 'error'); return;
      }
      markSolved('sequencePuzzle');
      print('解碼器掃描過基因序列顯示畫面，發出一聲提示音，輸出結果：「隱藏訊息解碼完成——序列中包含兩個特定數字，這是密碼的一部分。」', 'success');
    },
  },
  brickWallPuzzle: {
    id: 'brickWallPuzzle',
    hint: '仔細檢查廢棄走廊盡頭的磚牆，看看它是否有什麼異常。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('brickWallPuzzle')) { print('磚牆已經被移除了。', 'info'); return; }
      markSolved('brickWallPuzzle');
      addItem('oldPhoto3');
      ROOMS.abandonedHallway.exits.south = 'deepUnderground';
      ROOMS.deepUnderground.locked = false;
      print('你仔細檢查磚牆，發現這些磚塊並沒有用水泥固定，而是可以移動的！你逐一搬開磚塊，露出後面的通道，以及一張被夾在牆縫中的舊照片。', 'success');
    },
  },
  containerPuzzle: {
    id: 'containerPuzzle',
    hint: '金屬容器上的鎖定機制需要仔細研究。打開它有風險，但也可能通往更深的秘密。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('containerPuzzle')) { print('容器已經被處理過了。', 'info'); return; }
      if (gameState.flags.containerTrapped) { print('這個選擇已經造成了後果。', 'error'); return; }
      markSolved('containerPuzzle');
      gameState.flags.containerOpened = true;
      ROOMS.deepUnderground.exits.east = 'vaultRoom';
      ROOMS.vaultRoom.locked = false;
      print('你小心翼翼地操作金屬容器的鎖定機制。容器緩緩打開，裡面是空的——但你不得不承認，你鬆了一口氣，因為你不確定自己準備好面對裡面可能有什麼。底部有一個暗格，裡面有一個手柄。你拉動它，深層地下室的東側牆壁發出低沉的機械聲，緩緩滑開，露出通往保險庫的秘密通道。', 'success');
    },
  },
  filePuzzle: {
    id: 'filePuzzle',
    hint: '閱讀幽靈檔案，了解這個設施的真正目的。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('filePuzzle')) { print('你已經閱讀過幽靈檔案了。', 'info'); return; }
      if (!gameState.inventory.includes('ghostFile') && !ROOMS.secretArchive.items.includes('ghostFile')) {
        print('這裡沒有幽靈檔案。', 'error'); return;
      }
      markSolved('filePuzzle');
      gameState.secretsFound++;
      print('你翻開幽靈檔案，裡面記錄著這個設施進行的人體實驗，失蹤人員的名單和他們的遭遇，以及那些下令進行實驗的人的名字。讀完之後，你的手在顫抖。', 'success');
    },
  },
  mainframePuzzle: {
    id: 'mainframePuzzle',
    hint: '使用USB隨身碟和硬碟，分別插入主機讀取最終密碼的前後四位。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('mainframePuzzle')) { print('主機資料已經讀取完畢。', 'info'); return; }
      const hasUsb = gameState.inventory.includes('usb');
      const hasHdd = gameState.inventory.includes('hardDrive');
      if (!hasUsb && !hasHdd) {
        print('你需要USB隨身碟或硬碟來讀取主機資料。', 'error'); return;
      }
      let msg = '';
      if (hasUsb) msg += `USB隨身碟讀取完成——最終密碼前四位：${CODES.final.substring(0,4)}。`;
      if (hasHdd) msg += `\n硬碟讀取完成——最終密碼後四位：${CODES.final.substring(4,8)}。`;
      markSolved('mainframePuzzle');
      gameState.secretsFound++;
      print(msg, 'success');
      print(`完整的最終密碼是：${CODES.final}`, 'clue');
    },
  },
  fireDoorPuzzle: {
    id: 'fireDoorPuzzle',
    hint: `防火門需要走廊密碼：${CODES.hallway}。在設施的藍圖上找到這個數字。`,
    solve(args) {
      if (gameState.solvedPuzzles.includes('fireDoorPuzzle')) { print('防火門已經打開了。', 'info'); return; }
      const code = args[0];
      if (code === CODES.hallway) {
        markSolved('fireDoorPuzzle');
        print('密碼正確！防火門緩緩打開，前方是通往最終密碼室的通道。', 'success');
      } else {
        print('密碼錯誤，防火門保持關閉。', 'error');
      }
    },
  },
  finalPuzzle: {
    id: 'finalPuzzle',
    hint: `最終密碼需要八位數，從主機房獲得。密碼是 ${CODES.final}。`,
    solve(args) {
      if (gameState.solvedPuzzles.includes('finalPuzzle')) { print('最終密碼鎖已經打開了。', 'info'); return; }
      const code = args[0];
      if (code === CODES.final) {
        markSolved('finalPuzzle');
        addItem('finalKey');
        print('八個轉盤逐一對齊，巨大的密碼鎖發出機械轉動的聲音緩緩打開！裡面是一把精緻的最終鑰匙。自由近在眼前！', 'success');
      } else {
        print('密碼錯誤，密碼鎖紋絲不動。', 'error');
      }
    },
  },
  exitPuzzle: {
    id: 'exitPuzzle',
    hint: '使用最終鑰匙打開出口大門。',
    solve(args) {
      if (!gameState.inventory.includes('finalKey')) {
        print('你沒有最終鑰匙，無法打開出口。', 'error'); return;
      }
      markSolved('exitPuzzle');
      triggerEnding();
    },
  },
  archivePuzzle: {
    id: 'archivePuzzle',
    hint: '仔細閱讀密碼紙上的符號，嘗試解讀其中的訊息。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('archivePuzzle')) { print('密碼紙已經解讀過了。', 'info'); return; }
      if (!gameState.inventory.includes('cipherPaper') && !ROOMS.archive.items.includes('cipherPaper')) {
        print('你沒有密碼紙。', 'error'); return;
      }
      markSolved('archivePuzzle');
      print('你努力解讀密碼紙上的符號，得出一個線索：密碼中某些數字的排列方式與設施的建造年份有關。這個線索需要配合其他資訊才能完整解讀。', 'success');
    },
  },
  vaultPuzzle: {
    id: 'vaultPuzzle',
    hint: '仔細檢查保險庫裡的藍色光芒裝置。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('vaultPuzzle')) { print('藍色裝置已經檢查過了。', 'info'); return; }
      markSolved('vaultPuzzle');
      gameState.secretsFound++;
      print('藍色光芒裝置在你觸碰時發出嗡嗡聲，投影出一個全息畫面——顯示這個設施的完整秘密網絡，以及背後的組織結構。這比你想象的要大得多，觸目驚心。', 'success');
    },
  },
  guardTalkPuzzle: {
    id: 'guardTalkPuzzle',
    hint: '和走廊的守衛交談，他掌握密碼的前兩位數字。',
    solve(args) { print('使用 talk guard 指令和守衛交談。', 'info'); },
  },
  scientistTalkPuzzle: {
    id: 'scientistTalkPuzzle',
    hint: '和實驗室的科學家交談，他掌握密碼的第三、四位數字。',
    solve(args) { print('使用 talk scientist 指令和科學家交談。', 'info'); },
  },
  womanTalkPuzzle: {
    id: 'womanTalkPuzzle',
    hint: '和隱藏房間的神秘女子交談，她會給你重要的道具和線索。',
    solve(args) { print('使用 talk mysteriousWoman 指令和神秘女子交談。', 'info'); },
  },
  oldManTalkPuzzle: {
    id: 'oldManTalkPuzzle',
    hint: '和圖書室的老人交談，他掌握密碼的第五、六位數字。',
    solve(args) { print('使用 talk oldMan 指令和老人交談。', 'info'); },
  },
  ghostTalkPuzzle: {
    id: 'ghostTalkPuzzle',
    hint: '和廢棄走廊的幽靈交談，他知道保險庫的秘密。',
    solve(args) { print('使用 talk ghost 指令和幽靈交談。', 'info'); },
  },
  photoSequencePuzzle: {
    id: 'photoSequencePuzzle',
    hint: '收集所有三張舊照片，然後一起檢查它們。',
    solve(args) {
      const has1 = gameState.inventory.includes('oldPhoto');
      const has2 = gameState.inventory.includes('oldPhoto2');
      const has3 = gameState.inventory.includes('oldPhoto3');
      if (!has1 || !has2 || !has3) {
        print(`你還需要更多照片。目前有：${has1?'照片1 ':''}${has2?'照片2 ':''}${has3?'照片3':''}`, 'error'); return;
      }
      if (gameState.solvedPuzzles.includes('photoSequencePuzzle')) { print('三張照片的謎題已經解開了。', 'info'); return; }
      markSolved('photoSequencePuzzle');
      gameState.secretsFound++;
      print('你把三張照片並排放在一起，發現它們的背面合在一起是一幅完整的地圖，標示著設施最隱秘的區域。這個發現讓你更接近真相。', 'success');
    },
  },
  decoderPuzzle: {
    id: 'decoderPuzzle',
    hint: '使用解碼器解讀密碼紙，得到更完整的密碼線索。',
    solve(args) {
      if (gameState.solvedPuzzles.includes('decoderPuzzle')) { print('解碼工作已經完成了。', 'info'); return; }
      if (!gameState.inventory.includes('decoder') || !gameState.inventory.includes('cipherPaper')) {
        print('你需要解碼器和密碼紙才能進行解碼。', 'error'); return;
      }
      markSolved('decoderPuzzle');
      print('解碼器成功解讀了密碼紙上的符號，輸出了一段明文訊息，提供了關於六位密碼組成方式的重要線索。', 'success');
    },
  },
  mapPuzzle: {
    id: 'mapPuzzle',
    hint: '找到地圖，然後使用它查看設施的整體佈局。',
    solve(args) {
      if (gameState.inventory.includes('map')) {
        showMap(); markSolved('mapPuzzle');
      } else {
        print('你沒有地圖。不過，你也可以直接輸入 map 指令查看簡略的設施佈局。', 'info');
        showMap();
      }
    },
  },
};

// ─── Helper functions ────────────────────────────────────────────────────────
function markSolved(puzzleId) {
  if (!gameState.solvedPuzzles.includes(puzzleId)) {
    gameState.solvedPuzzles.push(puzzleId);
  }
}

function addItem(itemId) {
  if (!gameState.inventory.includes(itemId)) {
    gameState.inventory.push(itemId);
  }
}

function currentRoom() {
  return ROOMS[gameState.currentRoom];
}

// ─── UI Functions ────────────────────────────────────────────────────────────
function print(text, cssClass) {
  const div = document.createElement('div');
  div.className = 'output-line' + (cssClass ? ' ' + cssClass : '');
  div.textContent = text;
  const area = document.getElementById('story-area');
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

function printSeparator() {
  print('─────────────────────────────────────────', 'separator');
}

function updateSidebar() {
  const room = currentRoom();
  document.getElementById('room-name').textContent = room.name;

  const exitsList = document.getElementById('exits-list');
  exitsList.innerHTML = '';
  const exitMap = { north: '北', south: '南', east: '東', west: '西', up: '上', down: '下' };
  const exits = room.exits;
  if (Object.keys(exits).length === 0) {
    const li = document.createElement('li'); li.textContent = '（無出口）'; exitsList.appendChild(li);
  } else {
    Object.entries(exits).forEach(([dir, dest]) => {
      const li = document.createElement('li');
      const destRoom = ROOMS[dest];
      li.textContent = `${exitMap[dir] || dir}：${destRoom ? destRoom.name : dest}`;
      exitsList.appendChild(li);
    });
  }

  updateProgress();
  updateButtons();
}

function updateTimer() {
  const t = gameState.timeLeft;
  const m = Math.floor(t / 60).toString().padStart(2, '0');
  const s = (t % 60).toString().padStart(2, '0');
  const timerEl = document.getElementById('timer');
  timerEl.textContent = `${m}:${s}`;
  if (t <= 600) {
    timerEl.classList.add('urgent');
  } else {
    timerEl.classList.remove('urgent');
  }
}

function showEnding(title, text) {
  gameState.gameOver = true;
  clearInterval(timerInterval);
  document.getElementById('ending-title').textContent = title;
  document.getElementById('ending-text').textContent = text;
  document.getElementById('ending-overlay').classList.add('show');
}

function showTimedOutEnding() {
  gameState.gameOver = true;
  clearInterval(timerInterval);
  const solved = gameState.solvedPuzzles.length;
  const total = Object.keys(PUZZLES).length;
  const titleEl = document.getElementById('ending-title');
  const textEl = document.getElementById('ending-text');
  const walkthroughEl = document.getElementById('ending-walkthrough');
  const overlay = document.getElementById('ending-overlay');
  const box = document.getElementById('ending-box');

  if (titleEl) {
    titleEl.textContent = '⏰ 時間耗盡';
    titleEl.classList.add('timeout');
  }
  if (box) box.style.borderColor = 'var(--red)';
  if (textEl) {
    textEl.textContent = `計時器歸零，設施的自動封鎖系統啟動，所有出口被焊死。\n你被困在這裡，成為了又一個消失的人……\n\n本局進度：已解開 ${solved} / ${total} 個謎題\n\n▼ 下方為完整解謎攻略，供下次遊玩參考：`;
  }
  if (walkthroughEl) {
    walkthroughEl.textContent = generateWalkthrough();
    walkthroughEl.classList.add('show');
  }
  if (overlay) overlay.classList.add('show');
}

function generateWalkthrough() {
  return [
    '═══════════════════════════════════',
    '          完整解謎攻略              ',
    '═══════════════════════════════════',
    '',
    '【第一步】醒來的房間',
    '  • 拿起「紙條」（記下保險箱密碼）',
    '  • 拿起「手電筒」',
    `  • 點擊「打開保險箱」，輸入密碼：${CODES.safe}`,
    '  • 得到「電池」和「鑰匙A」',
    '  • 點擊「組合：手電筒＋電池」→ 修好的手電筒',
    '',
    '【第二步】走廊',
    '  • 點擊「↑ 走廊」按鈕，向北前往走廊',
    `  • 拿起「藍圖」（記下走廊密碼：${CODES.hallway}）`,
    '  • 點擊「對話：守衛」兩次 → 得到密碼第1、2位',
    '',
    '【第三步】圖書室',
    '  • 點擊「→ 圖書室」按鈕，向東前往圖書室',
    '  • 點擊「對話：老人」兩次 → 得到密碼第5、6位',
    '  • 確認已有修好的手電筒，點擊「用手電筒照射書架」',
    '    → 書架移開，隱藏房間解鎖！',
    '',
    '【第四步】隱藏房間',
    '  • 點擊「→ 隱藏房間」按鈕進入',
    '  • 點擊「對話：神秘女子」兩次 → 得到「藍色卡片」',
    '  • 拿起「筆記本」和「硬碟」',
    '',
    '【第五步】實驗室',
    '  • 返回走廊（西→走廊），再向北→實驗室',
    '  • 點擊「對話：科學家」兩次 → 得到密碼第3、4位',
    '  • 拿起「試管A」「試管C」「實驗日誌」',
    `    （日誌中記下密碼箱密碼：${CODES.labBox}）`,
    '  • 點擊「組合：試管A＋試管C」→ 混合化學物',
    `  • 點擊「打開密碼箱」，輸入：${CODES.labBox} → 紅色卡片`,
    '',
    '【第六步】實驗室B區',
    '  • 向東→實驗室B區',
    '  • 拿起「USB隨身碟」和「解碼器」',
    '',
    '【第七步】保全室 & 檔案室',
    '  • 返回走廊，前往保全室（在走廊西側）',
    '  • 拿起「識別證」和「鑰匙B」',
    '  • 走廊→西→檔案室',
    '  • 拿起「密碼紙」和「舊照片」',
    '  • 點擊「刷識別證開門」→ 秘密檔案室解鎖',
    '',
    '【第八步】地下走廊 & 發電機房',
    '  • 在檔案室，點擊「↓ 地下走廊」',
    '  • 拿起「電線」',
    '  • 繼續向南→發電機房',
    '  • 拿起「保險絲」和「扳手」',
    '  • 點擊「組合：電線＋保險絲」→ 修復電線',
    '  • 點擊「啟動發電機」→ ⚡ 電力恢復！逃生通道解鎖！',
    '',
    '【第九步】控制室',
    '  • 返回走廊→東→圖書室→北→控制室',
    '  • 拿起「螺絲起子」',
    '  • 點擊「拆開控制面板」→ 控制室系統啟動',
    '',
    '【第十步】密碼室',
    '  • 在控制室，向西→密碼室',
    `  • 點擊「打開密碼鎖」，輸入六位密碼：${CODES.cipher}`,
    '    （密碼來自五位NPC：守衛+科學家+老人，各2位）',
    '  • 得到「磁力卡」',
    '',
    '【第十一步】主機房',
    '  • 回走廊→北→實驗室→東→B區→北→主機房',
    `  • 點擊「插入USB」→ 密碼前4位：${CODES.final.substring(0,4)}`,
    `  • 點擊「連接硬碟」→ 密碼後4位：${CODES.final.substring(4,8)}`,
    `  • 完整最終密碼：${CODES.final}`,
    '',
    '【第十二步】逃生通道 & 最終密碼室',
    '  • 控制室→逃生通道',
    `  • 點擊「輸入防火門密碼」，輸入走廊密碼：${CODES.hallway}`,
    '  • 向北→最終密碼室',
    `  • 點擊「輸入最終密碼」，輸入：${CODES.final}`,
    '  • 得到「最終鑰匙」！',
    '',
    '【第十三步】出口大廳 — 逃脫！',
    '  • 向北→出口大廳',
    '  • 點擊「使用最終鑰匙逃脫」',
    '  • 🎉 恭喜！成功逃脫！',
    '',
    '═══════════════════════════════════',
    '  隱藏秘密（加分項目）：',
    '  • 與幽靈對話（廢棄走廊）',
    '  • 查看磚牆 → 進入深層地下室',
    '  • 打開金屬容器 → 進入保險庫（向西可返回）',
    '  • 查看保險庫藍色裝置 + 拿取秘密磁碟',
    '  ★ 帶著秘密磁碟逃脫 → 觸發「保險庫真相結局」',
    '  • 讀取幽靈檔案（秘密檔案室）',
    '  • 使用無線電（通訊室，需天線+無線電組合）',
    '  • 用手電筒照射鏡子（醫療室）',
    '  • 蒐集三張舊照片並一同查看',
    '═══════════════════════════════════',
  ].join('\n');
}

// ─── Progress Panel ──────────────────────────────────────────────────────────
function updateProgress() {
  const el = document.getElementById('progress-info');
  if (!el) return;
  const solved = gameState.solvedPuzzles.length;
  const total = Object.keys(PUZZLES).length;
  const npcsMax = Object.keys(NPCS).length;
  const npcsDone = Object.values(gameState.npcStages).filter(s => s >= 2).length;
  el.innerHTML = `謎題：${solved} / ${total}<br>NPC：${npcsDone} / ${npcsMax}<br>秘密：${gameState.secretsFound} / 5`;
}

// ─── Timer ──────────────────────────────────────────────────────────────────
let timerInterval = null;

function startTimer() {
  timerInterval = setInterval(() => {
    if (gameState.gameOver) { clearInterval(timerInterval); return; }
    gameState.timeLeft--;
    updateTimer();
    if (gameState.timeLeft <= 0) {
      showTimedOutEnding();
    }
  }, 1000);
}

// ─── Endings ────────────────────────────────────────────────────────────────
function triggerEnding() {
  const s = gameState.secretsFound;
  const p = gameState.solvedPuzzles.length;
  const allNpcs = checkAllNpcsTalked();
  const hasVaultSecret = gameState.solvedPuzzles.includes('vaultPuzzle') && gameState.inventory.includes('secretDisk');

  if (allNpcs && s >= 5 && p >= 30) {
    showEnding('★★ 完美結局：真相的見證者',
      '你推開沉重的大門，陽光傾瀉而來，溫暖了你已經麻木的皮膚。\n\n你不僅逃了出去，更帶走了每一個人交託給你的東西——吳明遠保存多年的完整研究紀錄、蘇靜雨三個月調查的真相地圖、許福田二十年愧疚的親筆告白、秘密磁碟裡的組織架構圖，以及鄭立偉和所有受害者的名字。\n\n你在出口處停了下來，回頭最後看了一眼這棟灰色的建築。\n\n「我記住你們了。」\n\n七十二小時後，幽靈計劃的完整資料在全球同步曝光。設施被迫關閉，幕後黑手被繩之以法。陳建志的女兒在電視上看到父親的名字，是在「協助揭露真相的勇敢者」名單裡。鄭立偉的母親終於知道了孩子的下落，哭著說：「謝謝你讓我有機會哭出來。」\n\n在廢墟上，有人立了一塊沒有署名的牌子：\n\n「他們曾在這裡，他們不該被遺忘。」');
  } else if (hasVaultSecret) {
    showEnding('★ 保險庫真相結局：深淵的帶信人',
      '你緊握著那張秘密磁碟，推開出口大門，走入刺眼的陽光中。\n\n保險庫裡藍色裝置投影出的全息畫面，依然在你腦中迴盪——那張組織架構圖、那串失蹤者名單、那些背後的名字。真相如此龐大，大到讓你的手不停顫抖。\n\n你知道，握著這張磁碟，就意味著有人會想讓你消失。\n\n但你也知道，如果你不站出來——鄭立偉的悲鳴、牆壁裡封存的秘密、那些再也沒有回家的人，將永遠無人知曉。\n\n你深吸一口氣，撥通了一個號碼。\n\n「我是林哲宇。我有一些東西，你一定想看到。」\n\n真相，比任何密碼都難以解開。而你，選擇成為那把鑰匙。');
  } else if (s >= 5) {
    showEnding('★ 隱藏真相結局：沉默的揭露者',
      '你衝出大門，帶著滿腔的秘密奔向自由。你知道得太多了——多到令人窒息。\n\n在陽光下，你想起蘇靜雨塞給你的那張便條，那個加密信箱的地址。你找到一台公用電腦，把所有你記得的東西——藍色磁卡裡的資料、吳明遠的告白、幽靈檔案的內容——全部整理成文字，傳了出去。\n\n然後你消失在人群中。\n\n幾天後，一篇署名「林哲宇」的報道開始在網路上悄悄流傳。沒有人知道他在哪裡，但每一個讀到這篇文章的人，都記住了那些名字。\n\n真相，開始緩慢而不可阻擋地擴散。');
  } else {
    showEnding('成功逃脫：帶著疑問的自由',
      '你終於推開了那扇門。外面是自由的天空，空氣清新，陽光溫暖。\n\n你站在門口，呆了很久。\n\n你不完全明白那裡發生了什麼，那個守衛疲憊的眼神、科學家顫抖的聲音、老人臨別時微弱的微笑——這些碎片拼不成完整的圖像，但你知道，那個設施裡藏著一個很大的秘密。\n\n你活著出來了。你是林哲宇，一個記者。\n\n也許有一天，你會回來，把那個圖像拼完整。');
  }
}

function checkAllNpcsTalked() {
  return Object.values(gameState.npcStages).every(s => s >= 2);
}

// ─── Room Description ────────────────────────────────────────────────────────
function describeRoom(verbose) {
  // On mobile, switch to move tab when entering a new room
  if (isMobile() && _activeMobileTab !== 'move') mobileTab('move');
  const room = currentRoom();
  if (!gameState.visitedRooms) gameState.visitedRooms = [];
  if (!gameState.visitedRooms.includes(gameState.currentRoom)) {
    gameState.visitedRooms.push(gameState.currentRoom);
  }
  printSeparator();
  print(`【${room.name}】`, 'room-title');
  print(room.desc, 'room-desc');

  // Items
  const visItems = room.items.filter(id => ITEMS[id]);
  if (visItems.length > 0) {
    print('你看到：' + visItems.map(id => ITEMS[id].name).join('、'), 'items');
  }

  // NPC
  if (room.npc && NPCS[room.npc]) {
    print(`這裡有：${NPCS[room.npc].name}`, 'npc');
  }

  // Exits
  const exitMap = { north: '北', south: '南', east: '東', west: '西', up: '上', down: '下' };
  const exits = room.exits;
  if (Object.keys(exits).length > 0) {
    const exitStr = Object.entries(exits).map(([d, r]) => `${exitMap[d] || d}(${ROOMS[r] ? ROOMS[r].name : r})`).join('、');
    print('出口：' + exitStr, 'exits');
  } else {
    print('沒有明顯的出口。', 'exits');
  }

  updateSidebar();
}

// ─── Commands ────────────────────────────────────────────────────────────────
function cmdLook(args) { describeRoom(true); }

function cmdExamine(args) {
  if (!args.length) { print('你想檢查什麼？', 'error'); return; }
  const target = args.join(' ').toLowerCase();
  const room = currentRoom();

  // check inventory first, then room items
  const allAvailable = [...gameState.inventory, ...room.items];
  const found = allAvailable.find(id => {
    const item = ITEMS[id];
    return id.toLowerCase() === target || (item && item.name === target);
  });

  // Special examine triggers
  if (target === 'bookshelf' || target === '書架') {
    PUZZLES.bookshelfPuzzle.solve([]);
    return;
  }
  if (target === 'mirror' || target === '鏡子') {
    PUZZLES.mirrorPuzzle.solve([]);
    return;
  }
  if (target === 'brickwall' || target === 'brick wall' || target === '磚牆') {
    PUZZLES.brickWallPuzzle.solve([]);
    return;
  }
  if (target === 'musicbox' || target === '音樂盒') {
    PUZZLES.musicBoxPuzzle.solve([]);
    return;
  }
  if ((target === 'lipstick cup' || target === 'lipstick' || target === 'cup' || target === '杯子' || target === '口紅杯') && room.id === 'restRoom') {
    PUZZLES.cupPuzzle.solve([]);
    return;
  }
  if (target === 'generator' || target === '發電機') {
    print('巨大的發電機在黑暗中沉默矗立，電路板的保險絲插座空著，需要修復電線才能啟動它。', 'desc');
    return;
  }
  if (target === 'panel' || target === '面板' || target === 'control panel' || target === '控制面板') {
    PUZZLES.controlPuzzle.solve([]);
    return;
  }
  if (target === 'tape' || target === '錄音帶') {
    PUZZLES.tapePuzzle.solve([]);
    return;
  }
  if ((target === 'blue light' || target === 'bluelightdevice' || target === '藍色裝置' || target === '藍色光芒裝置') && room.id === 'vaultRoom') {
    PUZZLES.vaultPuzzle.solve([]);
    return;
  }
  if ((target === 'oldphoto' || target === 'old photos' || target === 'photos' || target === '照片') &&
      gameState.inventory.includes('oldPhoto') && gameState.inventory.includes('oldPhoto2') && gameState.inventory.includes('oldPhoto3')) {
    PUZZLES.photoSequencePuzzle.solve([]);
    return;
  }

  if (found) {
    const item = ITEMS[found];
    if (item) { print(item.desc, 'item-desc'); return; }
  }

  // Room features
  const roomFeatures = {
    note: () => print(ITEMS.note.desc, 'item-desc'),
    flashlight: () => print(ITEMS.flashlight.desc, 'item-desc'),
  };

  print(`你仔細查看了一番，但沒有發現「${target}」有什麼特別之處。`, 'error');
}

function cmdTake(args) {
  if (!args.length) { print('你想拿什麼？', 'error'); return; }
  const target = args.join(' ').toLowerCase();
  const room = currentRoom();
  const idx = room.items.findIndex(id => id.toLowerCase() === target || (ITEMS[id] && ITEMS[id].name === target));
  if (idx === -1) { print(`這裡沒有「${target}」可以拿。`, 'error'); return; }
  const itemId = room.items.splice(idx, 1)[0];
  addItem(itemId);
  print(`你拿起了${ITEMS[itemId] ? ITEMS[itemId].name : itemId}。`, 'success');
  updateSidebar();
  autoSave();
}

function cmdOpen(args) {
  if (!args.length) { print('你想打開什麼？', 'error'); return; }
  const target = args[0].toLowerCase();
  const code = args[1] || '';

  if (target === 'safe' || target === '保險箱') {
    PUZZLES.safePuzzle.solve([code]);
  } else if (target === 'labbox' || target === '密碼箱' || target === 'lab box') {
    PUZZLES.labBoxPuzzle.solve([code]);
  } else if (target === 'cipherlock' || target === '密碼鎖' || target === 'cipher') {
    PUZZLES.cipherPuzzle.solve([code]);
  } else if (target === 'firedoor' || target === '防火門' || target === 'fire door') {
    PUZZLES.fireDoorPuzzle.solve([code]);
  } else if (target === 'finallock' || target === '最終密碼鎖' || target === 'final lock') {
    PUZZLES.finalPuzzle.solve([code]);
  } else if (target === 'exitdoor' || target === '出口門' || target === 'exit door' || target === 'exit') {
    PUZZLES.exitPuzzle.solve([code]);
  } else if (target === 'metalcontainer' || target === '金屬容器' || target === 'container') {
    PUZZLES.containerPuzzle.solve([code]);
  } else if (target === 'envelope' || target === '信封') {
    if (gameState.inventory.includes('envelope') || ROOMS[gameState.currentRoom].items.includes('envelope')) {
      print('你打開信封，裡面是一張便條：「如果你找到了這裡，說明你比我想象的更聰明。密碼中有一位是7。繼續找下去。」', 'item-desc');
    } else {
      print('這裡沒有信封。', 'error');
    }
  } else {
    print(`你試圖打開「${target}」，但不知道怎麼做。`, 'error');
  }
  autoSave();
}

function cmdUse(args) {
  if (args.length < 1) { print('用法：use [物品] [目標]', 'error'); return; }
  const item = args[0].toLowerCase();
  const target = args.slice(1).join(' ').toLowerCase();

  if (!gameState.inventory.find(id => id.toLowerCase() === item || (ITEMS[id] && ITEMS[id].name === item))) {
    print(`你的背包裡沒有「${item}」。`, 'error'); return;
  }

  const itemId = gameState.inventory.find(id => id.toLowerCase() === item || (ITEMS[id] && ITEMS[id].name === item));

  // Use cases
  if ((itemId === 'repairedWire') && (target === 'generator' || target === '發電機' || target === '')) {
    PUZZLES.generatorPuzzle.solve([]);
  } else if (itemId === 'activeRadio' && (target === '' || target === 'radio' || target === '無線電')) {
    PUZZLES.radioPuzzle.solve([]);
  } else if (itemId === 'screwdriver' && (target === 'panel' || target === '面板' || target === 'control panel' || target === '')) {
    PUZZLES.controlPuzzle.solve([]);
  } else if (itemId === 'idCard' && (target === 'keypad' || target === '門禁' || target === '讀卡機' || target === '')) {
    PUZZLES.keypadPuzzle.solve([]);
  } else if (itemId === 'usb' && (target === 'mainframe' || target === '主機' || target === '')) {
    if (gameState.currentRoom !== 'mainframeRoom') { print('這裡沒有主機可以連接。去主機房試試。', 'error'); return; }
    PUZZLES.mainframePuzzle.solve(['usb']);
  } else if (itemId === 'hardDrive' && (target === 'mainframe' || target === '主機' || target === '')) {
    if (gameState.currentRoom !== 'mainframeRoom') { print('這裡沒有主機可以連接。去主機房試試。', 'error'); return; }
    PUZZLES.mainframePuzzle.solve(['hardDrive']);
  } else if (itemId === 'decoder' && (target === 'cipherpaper' || target === '密碼紙' || target === '')) {
    PUZZLES.decoderPuzzle.solve([]);
  } else if (itemId === 'fixedFlashlight' && (target === 'bookshelf' || target === '書架')) {
    PUZZLES.bookshelfPuzzle.solve([]);
  } else if (itemId === 'fixedFlashlight' && (target === 'mirror' || target === '鏡子')) {
    PUZZLES.mirrorPuzzle.solve([]);
  } else if (itemId === 'tape' && (target === 'recorder' || target === '錄音機' || target === '')) {
    PUZZLES.tapePuzzle.solve([]);
  } else if (itemId === 'finalKey' && (target === 'exit' || target === '出口' || target === 'door' || target === '門' || target === '')) {
    PUZZLES.exitPuzzle.solve([]);
  } else if (itemId === 'map') {
    showMap();
  } else {
    print(`你試著使用${ITEMS[itemId] ? ITEMS[itemId].name : itemId}，但不知道該如何使用在「${target || '任何東西'}」上。`, 'error');
  }
  autoSave();
}

function cmdCombine(args) {
  if (args.length < 2) { print('用法：combine [物品1] [物品2]', 'error'); return; }
  const a = args[0].toLowerCase();
  const b = args[1].toLowerCase();

  const findId = name => gameState.inventory.find(id => id.toLowerCase() === name || (ITEMS[id] && ITEMS[id].name === name));
  const idA = findId(a);
  const idB = findId(b);

  if (!idA) { print(`你的背包裡沒有「${a}」。`, 'error'); return; }
  if (!idB) { print(`你的背包裡沒有「${b}」。`, 'error'); return; }

  const pair = [idA, idB].sort().join('+');
  const combineMap = {
    'battery+flashlight': { result: 'fixedFlashlight', remove: ['flashlight', 'battery'], msg: '你把電池裝進手電筒，按下開關，強烈的光束射出！手電筒修好了！' },
    'testTubeA+testTubeC': { result: 'mixedChemical', remove: ['testTubeA', 'testTubeC'], msg: '你小心地將兩支試管的液體混合，產生了一種神秘的紫色化合物！' },
    'fuse+wire': { result: 'repairedWire', remove: ['wire', 'fuse'], msg: '你把保險絲裝入電線的插座，修復電線完成，可以用來修復發電機了。' },
    'antenna+radio': { result: 'activeRadio', remove: ['antenna', 'radio'], msg: '你把天線接上無線電，機器發出嗶聲，啟動了！現在可以嘗試接收訊號了。' },
  };

  if (combineMap[pair]) {
    const recipe = combineMap[pair];
    recipe.remove.forEach(id => {
      gameState.inventory = gameState.inventory.filter(i => i !== id);
    });
    addItem(recipe.result);
    print(recipe.msg, 'success');
    if (pair === 'testTubeA+testTubeC') markSolved('chemicalPuzzle');
    updateSidebar();
  } else {
    print(`${ITEMS[idA] ? ITEMS[idA].name : idA}和${ITEMS[idB] ? ITEMS[idB].name : idB}無法組合在一起。`, 'error');
  }
  autoSave();
}

function cmdRead(args) {
  if (!args.length) { print('你想閱讀什麼？', 'error'); return; }
  const target = args.join(' ').toLowerCase();
  const allAvail = [...gameState.inventory, ...currentRoom().items];
  const found = allAvail.find(id => id.toLowerCase() === target || (ITEMS[id] && ITEMS[id].name === target));
  if (!found) { print(`你沒有找到「${target}」可以閱讀。`, 'error'); return; }
  // Reading is same as examining for most items
  cmdExamine(args);
}

function cmdGo(args) {
  if (!args.length) { print('你想往哪個方向走？', 'error'); return; }
  const dirMap = { 'north': 'north', 'n': 'north', 'south': 'south', 's': 'south', 'east': 'east', 'e': 'east', 'west': 'west', 'w': 'west', 'up': 'up', 'u': 'up', 'down': 'down', 'd': 'down', '北': 'north', '南': 'south', '東': 'east', '西': 'west', '上': 'up', '下': 'down' };
  const dir = dirMap[args[0].toLowerCase()];
  if (!dir) { print(`「${args[0]}」不是一個有效的方向。`, 'error'); return; }

  const room = currentRoom();
  const dest = room.exits[dir];

  if (!dest) {
    // Check locked exits
    if (room.lockedExits && room.lockedExits[dir]) {
      const lock = room.lockedExits[dir];
      const hasItem = gameState.inventory.includes(lock.requires) || (lock.altItem && gameState.inventory.includes(lock.altItem));
      if (hasItem) {
        gameState.currentRoom = lock.room;
        describeRoom();
      } else {
        print(`那個方向的通道被鎖住了。你可能需要特殊的卡片或鑰匙才能通過。`, 'error');
      }
    } else {
      print(`那個方向沒有出口。`, 'error');
    }
    return;
  }

  const destRoom = ROOMS[dest];
  if (!destRoom) { print(`無法前往那個地方。`, 'error'); return; }
  if (destRoom.locked && !gameState.unlockedRooms.includes(dest)) {
    print(`那個方向的通道被封鎖了。`, 'error'); return;
  }
  if (dest === 'escapeRoute' && ROOMS.escapeRoute.locked) {
    print('逃生通道被封鎖了，需要先恢復電力並啟動控制室系統。', 'error'); return;
  }

  gameState.currentRoom = dest;

  // Room transition flash
  const _tr = document.getElementById('room-transition');
  if (_tr) { _tr.classList.add('active'); setTimeout(() => _tr.classList.remove('active'), 220); }

  describeRoom();
  autoSave();
}

function cmdInventory() {
  if (gameState.inventory.length === 0) { print('你的背包是空的。', 'info'); return; }
  print('你的背包裡有：', 'info');
  gameState.inventory.forEach(id => {
    print(`  • ${ITEMS[id] ? ITEMS[id].name : id}`, 'item');
  });
}

function cmdTalk(args) {
  if (!args.length) { print('你想和誰說話？', 'error'); return; }
  const npcName = args[0].toLowerCase();
  const room = currentRoom();

  if (!room.npc) { print('這裡沒有人可以交談。', 'error'); return; }
  const npcKey = room.npc;
  if (npcKey.toLowerCase() !== npcName && NPCS[npcKey] && NPCS[npcKey].name !== npcName) {
    // Try to find npc by key
    const found = Object.keys(NPCS).find(k => k.toLowerCase() === npcName);
    if (!found || found !== npcKey) {
      print(`這裡沒有叫「${npcName}」的人。`, 'error'); return;
    }
  }

  const npc = NPCS[npcKey];
  const stage = gameState.npcStages[npcKey];

  if (stage >= npc.stages.length) {
    print(`${npc.name}已經沒有更多話要說了，只是默默地看著你。`, 'info');
    return;
  }

  print(`${npc.name}：「${npc.stages[stage]}」`, 'npc-dialog');

  // Give item if applicable
  if (npc.givesItem && npc.givesItem.stage === stage) {
    addItem(npc.givesItem.item);
    print(`${npc.name}給了你${ITEMS[npc.givesItem.item].name}。`, 'success');
  }

  gameState.npcStages[npcKey]++;

  // Mark puzzle solved
  const puzzleMap = { guard: 'guardTalkPuzzle', scientist: 'scientistTalkPuzzle', mysteriousWoman: 'womanTalkPuzzle', oldMan: 'oldManTalkPuzzle', ghost: 'ghostTalkPuzzle' };
  if (gameState.npcStages[npcKey] >= npc.stages.length) {
    if (puzzleMap[npcKey]) markSolved(puzzleMap[npcKey]);
    if (npc.onComplete) npc.onComplete();
  }

  // Check all NPCs talked
  if (checkAllNpcsTalked()) gameState.flags.allNpcsTalked = true;

  autoSave();
}

function cmdHint() {
  const room = currentRoom();
  const unsolvedPuzzles = (room.puzzles || []).filter(p => !gameState.solvedPuzzles.includes(p));
  if (unsolvedPuzzles.length === 0) {
    if (room.hints && room.hints.length > 0) {
      print('提示：' + room.hints[0], 'hint');
    } else {
      print('這個房間沒有更多謎題了。繼續探索其他地方吧。', 'hint');
    }
    return;
  }
  const puzzle = PUZZLES[unsolvedPuzzles[0]];
  if (puzzle && puzzle.hint) {
    print('提示：' + puzzle.hint, 'hint');
  } else if (room.hints && room.hints.length > 0) {
    print('提示：' + room.hints[Math.floor(Math.random() * room.hints.length)], 'hint');
  } else {
    print('沒有可用的提示。繼續探索吧！', 'hint');
  }
}

function cmdHelp() {
  printSeparator();
  print('【可用指令】', 'help-title');
  const cmds = [
    ['look / l', '查看當前房間'],
    ['examine [物品]', '仔細檢查物品或環境'],
    ['take [物品]', '拾取物品'],
    ['open [物品] [密碼]', '嘗試打開某個物品（可選密碼）'],
    ['use [物品] [目標]', '使用背包中的物品'],
    ['combine [物品1] [物品2]', '組合兩個物品'],
    ['read [物品]', '閱讀物品上的文字'],
    ['go [方向] / n/s/e/w/u/d', '移動到相鄰房間'],
    ['inventory / i', '查看背包'],
    ['talk [NPC]', '和NPC交談'],
    ['hint', '獲取當前房間的提示'],
    ['map', '查看設施地圖'],
    ['save', '儲存遊戲'],
    ['load', '讀取遊戲'],
    ['help', '顯示此幫助'],
  ];
  cmds.forEach(([cmd, desc]) => print(`  ${cmd.padEnd(25)} — ${desc}`, 'help-item'));
  printSeparator();
}

const MAP_ZONES = [
  { label: '■ 入口區', rooms: ['room1'] },
  { label: '■ 主走廊', rooms: ['hallway', 'storage', 'observeRoom', 'medRoom'] },
  { label: '■ 實驗區', rooms: ['lab', 'labB', 'mainframeRoom'] },
  { label: '■ 地下層', rooms: ['underground', 'generatorRoom', 'abandonedHallway', 'deepUnderground', 'vaultRoom'] },
  { label: '■ 秘密區', rooms: ['archive', 'secretArchive', 'library', 'hiddenRoom'] },
  { label: '■ 管制區', rooms: ['controlRoom', 'commRoom', 'cipherRoom', 'securityRoom', 'restRoom'] },
  { label: '■ 逃生路線', rooms: ['escapeRoute', 'finalCipherRoom', 'exitHall'] },
];

function showMap() {
  const modal = document.getElementById('map-modal');
  const grid  = document.getElementById('map-grid');
  if (!modal || !grid) return;

  if (!gameState.visitedRooms) gameState.visitedRooms = [];
  grid.innerHTML = '';

  MAP_ZONES.forEach(zone => {
    const zoneEl = document.createElement('div');
    zoneEl.className = 'map-zone';

    const labelEl = document.createElement('div');
    labelEl.className = 'map-zone-label';
    labelEl.textContent = zone.label;
    zoneEl.appendChild(labelEl);

    const rowEl = document.createElement('div');
    rowEl.className = 'map-rooms-row';

    zone.rooms.forEach(roomId => {
      const room = ROOMS[roomId];
      if (!room) return;
      const isCurrent = gameState.currentRoom === roomId;
      const isVisited = gameState.visitedRooms.includes(roomId);
      const isLocked  = room.locked && !gameState.unlockedRooms.includes(roomId);

      const el = document.createElement('div');
      let cls = 'map-room';
      if (isCurrent)     cls += ' map-current';
      else if (isLocked) cls += ' map-locked';
      else if (isVisited)cls += ' map-visited';
      el.className = cls;

      const icon = isCurrent ? '▶ ' : isLocked ? '🔒 ' : isVisited ? '✓ ' : '○ ';
      el.textContent = icon + room.name;

      // Fast travel: click visited (non-current, non-locked) rooms
      if (isVisited && !isCurrent && !isLocked) {
        el.classList.add('map-clickable');
        el.title = '點擊快速傳送';
        el.addEventListener('click', () => {
          closeMapModal();
          gameState.currentRoom = roomId;
          const _tr = document.getElementById('room-transition');
          if (_tr) { _tr.classList.add('active'); setTimeout(() => _tr.classList.remove('active'), 220); }
          describeRoom();
          autoSave();
        });
      }

      rowEl.appendChild(el);
    });

    zoneEl.appendChild(rowEl);
    grid.appendChild(zoneEl);
  });

  modal.classList.add('show');
}

function closeMapModal() {
  const modal = document.getElementById('map-modal');
  if (modal) modal.classList.remove('show');
}
window.closeMapModal = closeMapModal;

function cmdSave() {
  try {
    localStorage.setItem('escapeRoomSave', JSON.stringify(gameState));
    print('遊戲已儲存。', 'success');
  } catch(e) {
    print('儲存失敗：' + e.message, 'error');
  }
}

function cmdLoad() {
  try {
    const saved = localStorage.getItem('escapeRoomSave');
    if (!saved) { print('沒有找到存檔。', 'error'); return; }
    gameState = JSON.parse(saved);
    print('遊戲讀取成功！', 'success');
    describeRoom();
  } catch(e) {
    print('讀取失敗：' + e.message, 'error');
  }
}

function autoSave() {
  try { localStorage.setItem('escapeRoomSave', JSON.stringify(gameState)); } catch(e) {}
}

// ─── Button helpers ──────────────────────────────────────────────────────────

function clickCmd(cmd) { handleCommand(cmd); }
window.clickCmd = clickCmd;

// ─── Code Modal ──────────────────────────────────────────────────────────────
let _codeTarget = '';

function openCodeModal(target, title, desc) {
  _codeTarget = target;
  const modal = document.getElementById('code-modal');
  const titleEl = document.getElementById('code-modal-title');
  const descEl = document.getElementById('code-desc');
  const inp = document.getElementById('code-input');
  if (!modal) return;
  if (titleEl) titleEl.textContent = `🔐 ${title}`;
  if (descEl) descEl.textContent = desc;
  if (inp) inp.value = '';
  modal.classList.add('show');
  if (inp) inp.focus();
}

function closeCodeModal() {
  const modal = document.getElementById('code-modal');
  if (modal) modal.classList.remove('show');
  _codeTarget = '';
}

function confirmCode() {
  const inp = document.getElementById('code-input');
  if (!inp) return;
  const code = inp.value.trim();
  if (!code) return;
  const target = _codeTarget;
  closeCodeModal();
  clickCmd(`open ${target} ${code}`);
}

window.openCodeModal = openCodeModal;
window.closeCodeModal = closeCodeModal;
window.confirmCode = confirmCode;

// ─── Drag-and-Drop System ────────────────────────────────────────────────────
let _draggingItemId = null;

// Valid combine pairs (sorted keys)
const COMBINE_PAIRS = new Set([
  'battery+flashlight',
  'testTubeA+testTubeC',
  'fuse+wire',
  'antenna+radio',
]);

// Per-room interactive objects (drag targets)
const ROOM_OBJ_MAP = {
  room1:            [{ id: 'safe',            icon: '🔐', label: '保險箱'     }],
  lab:              [{ id: 'labbox',           icon: '📦', label: '密碼箱'     }],
  library:          [{ id: 'bookshelf',        icon: '📚', label: '書架'       }],
  medRoom:          [{ id: 'mirror',           icon: '🪞', label: '鏡子'       }],
  generatorRoom:    [{ id: 'generator',        icon: '⚡', label: '發電機'     }],
  controlRoom:      [{ id: 'panel',            icon: '🖥️',  label: '控制面板'   }],
  cipherRoom:       [{ id: 'cipherlock',       icon: '🔒', label: '密碼鎖'     }],
  escapeRoute:      [{ id: 'firedoor',         icon: '🚪', label: '防火門'     }],
  finalCipherRoom:  [{ id: 'finallock',        icon: '🔏', label: '最終密碼鎖' }],
  exitHall:         [{ id: 'exitdoor',         icon: '🚪', label: '出口大門'   }],
  observeRoom:      [{ id: 'recorder',         icon: '📼', label: '錄音機'     }],
  commRoom:         [{ id: 'radio_device',     icon: '📻', label: '無線電設備' }],
  mainframeRoom:    [{ id: 'mainframe',        icon: '💻', label: '主機'       }],
  storage:          [{ id: 'musicbox',         icon: '🎵', label: '音樂盒'     }],
  abandonedHallway: [{ id: 'brickwall',        icon: '🧱', label: '磚牆'       }],
  deepUnderground:  [{ id: 'container',        icon: '📦', label: '金屬容器'   }],
  archive:          [{ id: 'keypad',           icon: '🔑', label: '門禁讀卡機' }],
  labB:             [{ id: 'computer',         icon: '💻', label: '電腦工作站' }],
  vaultRoom:        [{ id: 'bluelightdevice',  icon: '💙', label: '藍色裝置'   }],
  restRoom:         [{ id: 'lipstick_cup',     icon: '☕', label: '口紅杯'     }],
  securityRoom:     [],
  hiddenRoom:       [],
};

// Puzzles that are "solved" by a given room object id
const OBJ_SOLVED_MAP = {
  safe: 'safePuzzle', labbox: 'labBoxPuzzle', bookshelf: 'bookshelfPuzzle',
  mirror: 'mirrorPuzzle', generator: 'generatorPuzzle', panel: 'controlPuzzle',
  cipherlock: 'cipherPuzzle', firedoor: 'fireDoorPuzzle', finallock: 'finalPuzzle',
  exitdoor: 'exitPuzzle', recorder: 'tapePuzzle', radio_device: 'radioPuzzle',
  mainframe: 'mainframePuzzle', musicbox: 'musicBoxPuzzle', brickwall: 'brickWallPuzzle',
  container: 'containerPuzzle', keypad: 'keypadPuzzle', computer: 'sequencePuzzle',
  bluelightdevice: 'vaultPuzzle', lipstick_cup: 'cupPuzzle',
};

// Code-entry objects (drag or click → open code modal)
const CODE_OBJECTS = {
  safe:       { target: 'safe',       title: '保險箱',    desc: '提示：查看紙條上的數字（四位數）' },
  labbox:     { target: 'labbox',     title: '實驗室密碼箱', desc: '提示：查看實驗日誌（四位數）' },
  cipherlock: { target: 'cipherlock', title: '六位密碼鎖', desc: '提示：與五位NPC對話，各獲得1-2位數字' },
  firedoor:   { target: 'firedoor',   title: '防火門',    desc: '提示：查看走廊的藍圖（四位數）' },
  finallock:  { target: 'finallock',  title: '最終密碼鎖', desc: '提示：在主機房用USB和硬碟讀取（八位數）' },
};

function handleItemDropOnObject(itemId, objectId) {
  if (!gameState.inventory.includes(itemId)) return;

  // Code-entry puzzles: open modal regardless of item
  if (CODE_OBJECTS[objectId]) {
    const ct = CODE_OBJECTS[objectId];
    openCodeModal(ct.target, ct.title, ct.desc);
    return;
  }

  if (objectId === 'exitdoor') { clickCmd(`use ${itemId} exit`); return; }
  if (objectId === 'mainframe') { clickCmd(`use ${itemId} mainframe`); return; }
  if (objectId === 'recorder')  { clickCmd(`use ${itemId} recorder`); return; }
  if (objectId === 'radio_device') { clickCmd(`use ${itemId} radio`); return; }
  if (objectId === 'computer')  { clickCmd(`use ${itemId} computer`); return; }
  if (objectId === 'brickwall') { clickCmd('examine brickwall'); return; }
  if (objectId === 'musicbox')  { clickCmd('examine musicbox'); return; }
  if (objectId === 'container') { clickCmd('open container'); return; }
  if (objectId === 'lipstick_cup') { clickCmd('examine lipstick'); return; }
  if (objectId === 'bluelightdevice') { clickCmd('examine bluelightdevice'); return; }

  // Generic fallback
  clickCmd(`use ${itemId} ${objectId}`);
}

function handleRoomObjClick(objectId) {
  if (CODE_OBJECTS[objectId]) {
    const ct = CODE_OBJECTS[objectId];
    openCodeModal(ct.target, ct.title, ct.desc);
    return;
  }
  if (objectId === 'exitdoor')     { clickCmd('use finalKey exit'); return; }
  if (objectId === 'brickwall')    { clickCmd('examine brickwall'); return; }
  if (objectId === 'musicbox')     { clickCmd('examine musicbox'); return; }
  if (objectId === 'container')    { clickCmd('open container'); return; }
  if (objectId === 'bluelightdevice') { clickCmd('examine bluelightdevice'); return; }
  if (objectId === 'lipstick_cup') { clickCmd('examine lipstick'); return; }
}

// Highlight inventory cards that can combine with the dragged item
function highlightCombinables(draggedId) {
  document.querySelectorAll('.inv-card').forEach(card => {
    const id = card.dataset.id;
    if (id && id !== draggedId) {
      const pair = [draggedId, id].sort().join('+');
      if (COMBINE_PAIRS.has(pair)) card.classList.add('can-combine');
    }
  });
}

function clearDragHighlights() {
  document.querySelectorAll('.inv-card, .room-obj, .npc-tile').forEach(el => {
    el.classList.remove('can-combine', 'drag-over', 'dragging');
  });
}

// ─── Rebuild inventory cards with drag events ─────────────────────────────────
function updateInventoryCards() {
  const grid = document.getElementById('inventory-cards');
  if (!grid) return;
  grid.innerHTML = '';

  if (gameState.inventory.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'inv-empty';
    empty.textContent = '（空）';
    grid.appendChild(empty);
    return;
  }

  gameState.inventory.forEach(id => {
    const item = ITEMS[id];
    if (!item) return;

    const card = document.createElement('div');
    card.className = 'inv-card';
    card.draggable = true;
    card.dataset.id = id;
    card.textContent = item.name;
    card.title = `拖移至其他物品合成，或拖移至下方物件互動\n${item.desc.substring(0, 80)}`;

    // ── Drag start ──
    card.addEventListener('dragstart', e => {
      _draggingItemId = id;
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'all';
      setTimeout(() => card.classList.add('dragging'), 0);
      highlightCombinables(id);
    });

    card.addEventListener('dragend', () => {
      _draggingItemId = null;
      clearDragHighlights();
    });

    // ── Drop target: combine when another inv-card is dropped here ──
    card.addEventListener('dragover', e => {
      if (_draggingItemId && _draggingItemId !== id) {
        const pair = [_draggingItemId, id].sort().join('+');
        if (COMBINE_PAIRS.has(pair)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }
    });

    card.addEventListener('drop', e => {
      e.preventDefault();
      if (_draggingItemId && _draggingItemId !== id) {
        const draggedId = _draggingItemId;
        clickCmd(`combine ${draggedId} ${id}`);
      }
    });

    // Click = examine item
    card.addEventListener('click', () => clickCmd(`examine ${id}`));

    grid.appendChild(card);
  });
}

// ─── Rebuild all button panels ────────────────────────────────────────────────
function updateButtons() {
  const room = currentRoom();
  updateInventoryCards();
  updateDestinations(room);
  updateRoomActions(room);
  updateMobilePanel();
}

// ─── Mobile panel system ──────────────────────────────────────────────────────
let _activeMobileTab = 'move';
let _mobileSelectedItem = null;

function isMobile() { return window.innerWidth <= 680; }

function mobileTab(tab) {
  _activeMobileTab = tab;
  document.querySelectorAll('.mnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.mp-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === 'mp-' + tab);
  });
  if (tab !== 'items') clearMobileSelection();
}
window.mobileTab = mobileTab;

function clearMobileSelection() {
  _mobileSelectedItem = null;
  document.querySelectorAll('.m-selected, .m-highlight').forEach(el => {
    el.classList.remove('m-selected', 'm-highlight');
  });
}

function updateMobilePanel() {
  if (!isMobile()) return;
  const room = currentRoom();
  _buildMobileMove(room);
  _buildMobileItems(room);
  _buildMobileAction(room);
  _updateMobileBadge(room);
}

function _updateMobileBadge(room) {
  const badge = document.getElementById('badge-items');
  if (!badge) return;
  const hasItems = (room.items || []).some(id => ITEMS[id]);
  badge.classList.toggle('show', hasItems);
}

function _buildMobileMove(room) {
  const panel = document.getElementById('mp-move');
  if (!panel) return;
  panel.innerHTML = '';

  const arrows   = { north:'▲', south:'▼', east:'▶', west:'◀', up:'⬆', down:'⬇' };
  const dirNames = { north:'北', south:'南', east:'東', west:'西', up:'上', down:'下' };

  const makeDestBtn = (dir, destRoomId, locked, hasKey) => {
    const destRoom = ROOMS[destRoomId];
    if (!destRoom) return;
    const btn = document.createElement('button');
    btn.className = 'mdest-btn' + (locked ? ' mdest-locked' : '');
    btn.disabled = locked;
    btn.innerHTML =
      `<span class="mdest-arrow">${arrows[dir] || dir}</span>` +
      `<span class="mdest-dir">${dirNames[dir] || dir}</span>` +
      `<span class="mdest-name">${locked ? '🔒 ' : ''}${destRoom.name}</span>`;
    if (!locked) btn.onclick = () => clickCmd('go ' + dir);
    panel.appendChild(btn);
  };

  Object.entries(room.exits || {}).forEach(([dir, dest]) => {
    const destRoom = ROOMS[dest];
    if (!destRoom) return;
    const locked = (dest === 'escapeRoute' && ROOMS.escapeRoute.locked) ||
                   (destRoom.locked && !gameState.unlockedRooms.includes(dest));
    makeDestBtn(dir, dest, locked);
  });

  Object.entries(room.lockedExits || {}).forEach(([dir, lock]) => {
    const hasKey = gameState.inventory.includes(lock.requires) ||
                   (lock.altItem && gameState.inventory.includes(lock.altItem));
    makeDestBtn(dir, lock.room, !hasKey, hasKey);
  });

  if (panel.children.length === 0) {
    panel.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:16px 0;width:100%;text-align:center;">沒有可前往的地點</div>';
  }
}

function _buildMobileItems(room) {
  const panel = document.getElementById('mp-items');
  if (!panel) return;
  panel.innerHTML = '';

  const invItems = gameState.inventory.filter(id => ITEMS[id]);
  const roomItems = (room.items || []).filter(id => ITEMS[id]);

  if (invItems.length > 0) {
    const lbl = document.createElement('div');
    lbl.className = 'mp-label';
    lbl.textContent = '🎒 背包 — 點擊選取，再點行動頁合成/使用';
    panel.appendChild(lbl);

    const grid = document.createElement('div');
    grid.className = 'mp-inv-grid';
    invItems.forEach(id => {
      const card = document.createElement('div');
      card.className = 'inv-card mobile-inv-card';
      card.dataset.id = id;
      card.textContent = ITEMS[id].name;
      // restore selection highlight if item was previously selected
      if (_mobileSelectedItem === id) card.classList.add('m-selected');
      card.addEventListener('click', () => _mobileTapItem(id));
      grid.appendChild(card);
    });
    panel.appendChild(grid);
  }

  if (roomItems.length > 0) {
    const lbl = document.createElement('div');
    lbl.className = 'mp-label';
    lbl.textContent = '📦 房間物品';
    panel.appendChild(lbl);
    roomItems.forEach(id => {
      const btn = document.createElement('button');
      btn.className = 'act-btn take-btn';
      btn.style.width = '100%';
      btn.textContent = `📦 拿取 ${ITEMS[id].name}`;
      btn.onclick = () => { clickCmd('take ' + id); };
      panel.appendChild(btn);
    });
  }

  if (invItems.length === 0 && roomItems.length === 0) {
    panel.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:16px 0;width:100%;text-align:center;">背包是空的，且房間沒有可拾取的物品</div>';
  }
}

function _buildMobileAction(room) {
  const panel = document.getElementById('mp-action');
  if (!panel) return;
  panel.innerHTML = '';

  if (room.npc && NPCS[room.npc]) {
    const npcKey = room.npc;
    const npc = NPCS[npcKey];
    const exhausted = (gameState.npcStages[npcKey] || 0) >= npc.stages.length;
    const tile = document.createElement('div');
    tile.className = 'npc-tile' + (exhausted ? ' exhausted' : '');
    tile.id = 'mob-npc-' + npcKey;
    tile.innerHTML = `<span class="npc-icon">🧑</span><span class="npc-label">${npc.name}</span><span class="npc-sub">${exhausted ? '已結束' : '點擊對話'}</span>`;
    if (!exhausted) tile.addEventListener('click', () => { clickCmd('talk ' + npcKey); clearMobileSelection(); });
    panel.appendChild(tile);
  }

  const objs = ROOM_OBJ_MAP[room.id] || [];
  objs.forEach(obj => {
    const isSolved = OBJ_SOLVED_MAP[obj.id] && gameState.solvedPuzzles.includes(OBJ_SOLVED_MAP[obj.id]);
    const tile = document.createElement('div');
    tile.className = 'room-obj' + (isSolved ? ' solved' : '');
    tile.id = 'mob-obj-' + obj.id;
    tile.innerHTML = `<span class="obj-icon">${obj.icon}</span><span class="obj-label">${obj.label}</span>`;
    if (!isSolved) tile.addEventListener('click', () => _mobileUseOnObject(obj.id));
    panel.appendChild(tile);
  });

  if (!room.npc && objs.length === 0) {
    panel.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:16px 0;width:100%;text-align:center;">這裡沒有可互動的人或物件</div>';
  }

  // Re-apply m-highlight if an item is selected
  if (_mobileSelectedItem) _applyMobileHighlights(_mobileSelectedItem);
}

function _mobileTapItem(id) {
  // If tapping a highlighted (combinable) item while another is selected → combine
  if (_mobileSelectedItem && _mobileSelectedItem !== id) {
    const pair = [_mobileSelectedItem, id].sort().join('+');
    if (COMBINE_PAIRS.has(pair)) {
      clickCmd('combine ' + _mobileSelectedItem + ' ' + id);
      clearMobileSelection();
      return;
    }
  }
  // Toggle selection
  if (_mobileSelectedItem === id) {
    clearMobileSelection();
    return;
  }
  clearMobileSelection();
  _mobileSelectedItem = id;
  // Highlight selected card
  document.querySelectorAll('.mobile-inv-card').forEach(card => {
    if (card.dataset.id === id) card.classList.add('m-selected');
  });
  _applyMobileHighlights(id);
  print(`已選取「${ITEMS[id] ? ITEMS[id].name : id}」— 切換至【行動】頁可使用，或點擊另一個發光物品來合成。`, 'hint');
}

function _applyMobileHighlights(id) {
  // Highlight combinable inventory cards
  gameState.inventory.forEach(otherId => {
    if (otherId !== id) {
      const pair = [id, otherId].sort().join('+');
      if (COMBINE_PAIRS.has(pair)) {
        document.querySelectorAll('.mobile-inv-card').forEach(card => {
          if (card.dataset.id === otherId) card.classList.add('m-highlight');
        });
      }
    }
  });
  // Highlight all room objects in action panel
  document.querySelectorAll('#mp-action .room-obj:not(.solved)').forEach(el => {
    el.classList.add('m-highlight');
  });
}

function _mobileUseOnObject(objectId) {
  if (_mobileSelectedItem) {
    handleItemDropOnObject(_mobileSelectedItem, objectId);
    clearMobileSelection();
  } else {
    handleRoomObjClick(objectId);
  }
}
window._mobileUseOnObject = _mobileUseOnObject;

function updateDestinations(room) {
  const panel = document.getElementById('destinations');
  if (!panel) return;
  panel.innerHTML = '';

  const arrows = { north: '▲', south: '▼', east: '▶', west: '◀', up: '⬆', down: '⬇' };
  const dirNames = { north: '北', south: '南', east: '東', west: '西', up: '上', down: '下' };

  // Normal exits
  Object.entries(room.exits || {}).forEach(([dir, dest]) => {
    const destRoom = ROOMS[dest];
    if (!destRoom) return;
    let isLocked = false;
    if (dest === 'escapeRoute' && ROOMS.escapeRoute.locked) isLocked = true;
    if (destRoom.locked && !gameState.unlockedRooms.includes(dest)) isLocked = true;

    const btn = document.createElement('button');
    btn.className = `dest-btn${isLocked ? ' dest-locked' : ''}`;
    btn.innerHTML = `<span class="dest-arrow">${arrows[dir] || dir} ${dirNames[dir] || dir}</span><span class="dest-name">${isLocked ? '🔒 ' : ''}${destRoom.name}</span>`;
    btn.disabled = isLocked;
    if (!isLocked) btn.onclick = () => clickCmd(`go ${dir}`);
    panel.appendChild(btn);
  });

  // Locked exits (card/key required)
  Object.entries(room.lockedExits || {}).forEach(([dir, lock]) => {
    const destRoom = ROOMS[lock.room];
    if (!destRoom) return;
    const hasKey = gameState.inventory.includes(lock.requires) || (lock.altItem && gameState.inventory.includes(lock.altItem));
    const btn = document.createElement('button');
    btn.className = `dest-btn${hasKey ? '' : ' dest-locked'}`;
    btn.innerHTML = `<span class="dest-arrow">${arrows[dir] || dir} ${dirNames[dir] || dir}</span><span class="dest-name">${hasKey ? '' : '🔒 '}${destRoom.name}</span>`;
    btn.disabled = !hasKey;
    if (hasKey) btn.onclick = () => clickCmd(`go ${dir}`);
    panel.appendChild(btn);
  });
}

function updateRoomActions(room) {
  const panel = document.getElementById('room-actions');
  if (!panel) return;
  panel.innerHTML = '';

  // ── Floor items: take buttons ──
  (room.items || []).forEach(id => {
    const item = ITEMS[id];
    if (!item) return;
    const btn = document.createElement('button');
    btn.className = 'act-btn take-btn';
    btn.textContent = `📦 拿取 ${item.name}`;
    btn.onclick = () => clickCmd(`take ${id}`);
    panel.appendChild(btn);
  });

  // ── NPC tile (click to talk, drag to interact) ──
  if (room.npc && NPCS[room.npc]) {
    const npcKey = room.npc;
    const npc = NPCS[npcKey];
    const stage = gameState.npcStages[npcKey] || 0;
    const exhausted = stage >= (npc.stages || []).length;

    const tile = document.createElement('div');
    tile.className = 'npc-tile' + (exhausted ? ' exhausted' : '');
    tile.innerHTML = `<span class="npc-icon">🧑</span><span class="npc-label">${npc.name}</span><span class="npc-sub">${exhausted ? '已結束' : '點擊對話'}</span>`;
    if (!exhausted) tile.addEventListener('click', () => clickCmd(`talk ${npcKey}`));

    tile.addEventListener('dragover', e => {
      if (_draggingItemId && !exhausted) { e.preventDefault(); tile.classList.add('drag-over'); }
    });
    tile.addEventListener('dragleave', () => tile.classList.remove('drag-over'));
    tile.addEventListener('drop', e => {
      e.preventDefault();
      tile.classList.remove('drag-over');
      if (!exhausted) clickCmd(`talk ${npcKey}`);
    });
    panel.appendChild(tile);
  }

  // ── Room interactive objects (drag targets + click) ──
  const objs = ROOM_OBJ_MAP[room.id] || [];
  objs.forEach(obj => {
    const solvedPuzzle = OBJ_SOLVED_MAP[obj.id];
    const isSolved = solvedPuzzle && gameState.solvedPuzzles.includes(solvedPuzzle);

    const tile = document.createElement('div');
    tile.className = 'room-obj' + (isSolved ? ' solved' : '');
    tile.innerHTML = `<span class="obj-icon">${obj.icon}</span><span class="obj-label">${obj.label}</span>`;
    tile.title = isSolved ? '（已完成）' : '點擊互動，或將物品拖移至此';

    if (!isSolved) {
      tile.addEventListener('click', () => handleRoomObjClick(obj.id));
      tile.addEventListener('dragover', e => {
        if (_draggingItemId) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; tile.classList.add('drag-over'); }
      });
      tile.addEventListener('dragleave', () => tile.classList.remove('drag-over'));
      tile.addEventListener('drop', e => {
        e.preventDefault();
        tile.classList.remove('drag-over');
        if (_draggingItemId) handleItemDropOnObject(_draggingItemId, obj.id);
      });
    }
    panel.appendChild(tile);
  });
}

// ─── Command Parser ──────────────────────────────────────────────────────────
function handleCommand(input) {
  if (gameState.gameOver) return;
  input = input.trim();
  if (!input) return;

  print('> ' + input, 'command');

  const tokens = input.toLowerCase().split(/\s+/);
  const cmd = tokens[0];
  const args = tokens.slice(1);

  const dirAliases = { n: 'north', s: 'south', e: 'east', w: 'west', u: 'up', d: 'down' };

  switch(cmd) {
    case 'look': case 'l': cmdLook(args); break;
    case 'examine': case 'ex': case 'x': cmdExamine(args); break;
    case 'take': case 'get': case 'pick': cmdTake(args); break;
    case 'open': cmdOpen(args); break;
    case 'use': cmdUse(args); break;
    case 'combine': case 'comb': cmdCombine(args); break;
    case 'read': cmdRead(args); break;
    case 'go': case 'move': case 'walk': cmdGo(args); break;
    case 'north': case 'south': case 'east': case 'west': case 'up': case 'down':
      cmdGo([cmd]); break;
    case 'n': case 's': case 'e': case 'w': case 'u': case 'd':
      cmdGo([dirAliases[cmd]]); break;
    case 'inventory': case 'inv': case 'i': cmdInventory(); break;
    case 'talk': case 'speak': cmdTalk(args); break;
    case 'hint': cmdHint(); break;
    case 'help': case '?': cmdHelp(); break;
    case 'map': showMap(); break;
    case 'save': cmdSave(); break;
    case 'load': cmdLoad(); break;
    case 'export': cmdExport(); break;
    case 'import': cmdImport(); break;
    case 'solve': case 'puzzle': {
      // Direct puzzle solving shortcut: solve [puzzleId] [args...]
      const pId = args[0];
      if (pId && PUZZLES[pId]) { PUZZLES[pId].solve(args.slice(1)); }
      else { print(`未知的謎題「${pId}」。`, 'error'); }
      break;
    }
    default:
      print(`不認識的指令「${cmd}」。輸入 help 查看可用指令。`, 'error');
  }

  updateSidebar();
  autoSave();
}

// ─── Opening Screen ──────────────────────────────────────────────────────────
function showSplash() {
  printSeparator();
  print('', '');
  print('██████╗ ███████╗ ██████╗ █████╗ ██████╗ ███████╗', 'ascii-art');
  print('██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝', 'ascii-art');
  print('█████╗  ███████╗██║     ███████║██████╔╝█████╗  ', 'ascii-art');
  print('██╔══╝  ╚════██║██║     ██╔══██║██╔═══╝ ██╔══╝  ', 'ascii-art');
  print('███████╗███████║╚██████╗██║  ██║██║     ███████╗', 'ascii-art');
  print('╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚══════╝', 'ascii-art');
  print('', '');
  print('          ◆ 密室逃脫：X-17黑暗設施 ◆', 'title');
  print('', '');
  printSeparator();
  print('  ── 背景故事 ──', 'room-title');
  print('', '');
  print('  你是林哲宇，一名自由記者。', 'intro');
  print('  三個月前，你開始追蹤一系列全國失蹤案。', 'intro');
  print('  失蹤者毫無共同點——大學生、工程師、退休老人。', 'intro');
  print('  警方結案「失聯」，但你的直覺告訴你，真相遠不止於此。', 'intro');
  print('', '');
  print('  線索指向偏遠山區的「盤古生技股份有限公司」。', 'intro');
  print('  你偽裝成清潔人員潛入設施，在深夜被人從背後擊昏。', 'intro');
  print('', '');
  print('  當你再次清醒，已身陷一間混凝土牢房。', 'intro');
  print('  手機不見了，記者證不見了。', 'intro');
  print('  你不知道自己在哪裡，也不知道他們對你有什麼計劃。', 'intro');
  print('', '');
  print('  你只知道一件事——', 'intro');
  print('  你必須在60分鐘內找到出口。', 'intro');
  print('  但逃出去只是開始。真正的問題是：你會帶走什麼真相？', 'intro');
  print('', '');
  printSeparator();
  print('  點擊底部按鈕移動與行動，無需輸入指令', 'info');
  print('  黃色提示欄隨時顯示當前謎題線索', 'info');
  printSeparator();
  print(`  [本局密碼已隨機生成，祝你好運]`, 'info');
  printSeparator();
  print('', '');
}

// ─── Tutorial ────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    icon: '◈',
    title: '歡迎來到密室逃脫',
    content: '你在一個神秘設施中醒來，記憶一片空白。\n你有 60 分鐘找到出口，並揭開這裡隱藏的秘密。\n\n本教學將帶你快速了解遊戲的操作方式。\n（全程只需滑鼠點擊與拖移，無需打字）',
    demo: '',
  },
  {
    icon: '🚪',
    title: '移動：點擊目的地按鈕',
    content: '畫面底部左側會顯示「可前往的地點」按鈕。\n直接點擊，即可前往該房間。\n\n🔒 灰暗的按鈕表示該出口被封鎖，\n需要特定道具才能通過。',
    demo: `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;">
      <div class="demo-dest"><span class="da">▲</span><span class="dn">走廊</span></div>
      <div class="demo-dest"><span class="da">▶</span><span class="dn">圖書室</span></div>
      <div class="demo-dest" style="opacity:0.3;border-color:var(--red);color:var(--red);"><span class="da">◀</span><span class="dn">🔒 檔案室</span></div>
    </div>
    <div style="color:var(--text-muted);font-size:11px;margin-top:10px;">↑ 點擊按鈕即可移動（灰色＝封鎖）</div>`,
  },
  {
    icon: '📦',
    title: '拿取物品 & 查看物品',
    content: '房間地板上的物品以「📦 拿取」按鈕顯示，\n點擊即可拾起，放入左側的物品欄。\n\n物品欄中的卡片可以點擊，查看詳細描述和線索。',
    demo: `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;">
      <div class="demo-take">📦 拿取 電池</div>
      <div class="demo-arrow">→</div>
      <div class="demo-inv">電池</div>
    </div>
    <div style="color:var(--text-muted);font-size:11px;margin-top:10px;">↑ 點擊拿取按鈕 → 物品進入物品欄卡片</div>`,
  },
  {
    icon: '⚗️',
    get title()   { return window.innerWidth <= 680 ? '合成物品：點擊選取' : '合成物品：拖移卡片'; },
    get content() {
      return window.innerWidth <= 680
        ? '切換到【物品】頁籤，點擊一張物品卡片選取它（黃色發光）。\n\n可合成的其他物品會顯示紫色光暈。\n點擊發光的物品 → 自動完成合成！\n\n範例：點擊「手電筒」→ 再點「電池」\n→ 合成「修好的手電筒」。'
        : '物品欄的卡片可以互相拖移來合成新道具。\n\n① 按住一張卡片不放\n② 拖移到另一張卡片上面\n③ 看到紫色光暈 → 鬆開滑鼠即完成合成\n\n範例：把「電池」拖移到「手電筒」上，\n可以合成「修好的手電筒」。';
    },
    get demo() {
      return window.innerWidth <= 680
        ? `<div style="display:flex;gap:10px;align-items:center;justify-content:center;">
            <div class="demo-inv" style="border-color:var(--yellow);box-shadow:0 0 8px rgba(210,153,34,0.5);">手電筒</div>
            <div class="demo-arrow active">→</div>
            <div class="demo-inv glow">電池</div>
           </div>
           <div style="color:var(--purple);font-size:11px;margin-top:10px;">↑ 黃色=已選取，紫色=可合成，再點一下完成</div>`
        : `<div style="display:flex;gap:10px;align-items:center;justify-content:center;">
            <div class="demo-inv dragging" style="cursor:grabbing;">手電筒</div>
            <div class="demo-arrow active">→</div>
            <div class="demo-inv glow">電池</div>
           </div>
           <div style="color:var(--purple);font-size:11px;margin-top:10px;">↑ 紫色光暈 = 可合成！拖移過去後放開</div>`;
    },
  },
  {
    icon: '🔐',
    get title()   { return window.innerWidth <= 680 ? '與物件互動：選取後點擊' : '與物件互動：拖移或點擊'; },
    get content() {
      return window.innerWidth <= 680
        ? '切換到【行動】頁籤，會顯示房間裡所有可互動的物件。\n\n① 直接點擊物件 → 預設操作（輸入密碼等）\n② 先在【物品】選取物品，再切換到【行動】\n   點擊發光的物件 → 使用該物品於物件\n\n範例：選取「修復電線」後，點擊「⚡ 發電機」'
        : '房間裡的互動物件（保險箱、書架、發電機⋯）\n會以圖示方塊顯示在底部中央區域。\n\n① 直接點擊圖示 → 預設操作（開鎖輸入密碼等）\n② 將物品卡片拖移到物件上 → 使用該物品\n\n範例：把「修復電線」拖移到「⚡ 發電機」上，\n即可啟動電力系統！';
    },
    get demo() {
      return window.innerWidth <= 680
        ? `<div style="display:flex;gap:12px;align-items:center;justify-content:center;">
            <div class="demo-inv" style="border-color:var(--yellow);box-shadow:0 0 8px rgba(210,153,34,0.4);">修復電線</div>
            <div class="demo-arrow" style="color:var(--yellow);">→</div>
            <div class="demo-obj" style="border-color:var(--purple);box-shadow:0 0 8px rgba(210,168,255,0.5);"><span class="di">⚡</span><span>發電機</span></div>
           </div>
           <div style="color:var(--yellow);font-size:11px;margin-top:10px;">↑ 先選物品（黃），行動頁物件發光（紫），點下去</div>`
        : `<div style="display:flex;gap:12px;align-items:center;justify-content:center;">
            <div class="demo-inv dragging" style="cursor:grabbing;">修復電線</div>
            <div class="demo-arrow" style="color:var(--yellow);">→</div>
            <div class="demo-obj"><span class="di">⚡</span><span>發電機</span></div>
           </div>
           <div style="color:var(--yellow);font-size:11px;margin-top:10px;">↑ 琥珀光暈 = 物品正在拖移到此物件</div>`;
    },
  },
  {
    icon: '🧑',
    title: 'NPC 對話 & 提示',
    content: '設施裡有 5 個 NPC（守衛、科學家⋯），\n點擊 NPC 圖示即可對話。\n每次對話推進劇情，關鍵 NPC 會給你密碼片段！\n\n卡關了？點擊底部的「💡 提示」按鈕，\n即可獲得當前房間的解謎線索。',
    demo: `<div style="display:flex;gap:16px;align-items:center;justify-content:center;">
      <div class="demo-npc"><span class="di">🧑</span><span style="font-size:12px;font-weight:bold;">守衛</span><span style="font-size:10px;color:var(--text-muted);">點擊對話</span></div>
      <div style="width:1px;height:48px;background:var(--border-light);"></div>
      <div class="demo-hint">💡 提示</div>
    </div>
    <div style="color:var(--text-muted);font-size:11px;margin-top:10px;">↑ 左：點擊 NPC 對話 ／ 右：點擊獲取提示</div>`,
  },
  {
    icon: '🎯',
    title: '準備好了！',
    content: '你已掌握所有基本操作！\n\n祝你成功逃脫，揭開幽靈計畫的秘密。\n\n小提示：\n• 多和 NPC 對話，蒐集密碼片段\n• 仔細查看物品描述，裡面有線索\n• 時間到後可查看完整攻略\n• 隨時點擊「💾 儲存」防止進度遺失',
    demo: '',
  },
];

let _tutorialStep = 0;

function showTutorial() {
  _tutorialStep = 0;
  renderTutorialStep();
  document.getElementById('tutorial-overlay').classList.add('show');
}

function renderTutorialStep() {
  const total = TUTORIAL_STEPS.length;
  const step = TUTORIAL_STEPS[_tutorialStep];

  document.getElementById('tutorial-indicator').textContent =
    `步驟 ${_tutorialStep + 1} ／ ${total}`;

  // Dots
  const dotsEl = document.getElementById('tutorial-step-dots');
  dotsEl.innerHTML = '';
  TUTORIAL_STEPS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'tutorial-dot' + (i === _tutorialStep ? ' active' : '');
    dotsEl.appendChild(dot);
  });

  document.getElementById('tutorial-icon').textContent = step.icon;
  document.getElementById('tutorial-title').textContent = step.title;
  document.getElementById('tutorial-content').textContent = step.content;
  document.getElementById('tutorial-demo').innerHTML = step.demo || '';

  const nextBtn = document.getElementById('tutorial-next');
  const skipBtn = document.getElementById('tutorial-skip');
  if (_tutorialStep === total - 1) {
    nextBtn.textContent = '開始遊戲 →';
    skipBtn.style.display = 'none';
  } else {
    nextBtn.textContent = '下一步 →';
    skipBtn.style.display = 'inline-block';
  }
}

function nextTutorialStep() {
  _tutorialStep++;
  if (_tutorialStep >= TUTORIAL_STEPS.length) {
    closeTutorial();
  } else {
    renderTutorialStep();
  }
}

function skipTutorial() {
  closeTutorial();
}

function closeTutorial() {
  document.getElementById('tutorial-overlay').classList.remove('show');
  localStorage.setItem('tutorialDone', '1');
}

window.nextTutorialStep = nextTutorialStep;
window.skipTutorial = skipTutorial;

// ─── Code Modal Numpad ───────────────────────────────────────────────────────
function codeNumpad(digit) {
  const inp = document.getElementById('code-input');
  if (inp) inp.value += digit;
}
function codeNumpadDel() {
  const inp = document.getElementById('code-input');
  if (inp) inp.value = inp.value.slice(0, -1);
}
function codeNumpadClear() {
  const inp = document.getElementById('code-input');
  if (inp) inp.value = '';
}
window.codeNumpad    = codeNumpad;
window.codeNumpadDel = codeNumpadDel;
window.codeNumpadClear = codeNumpadClear;

// ─── Export / Import Save ────────────────────────────────────────────────────
function cmdExport() {
  const modal = document.getElementById('saveio-modal');
  if (!modal) return;
  document.getElementById('saveio-title').textContent = '📤 匯出存檔';
  const ta = document.getElementById('saveio-text');
  ta.value = JSON.stringify(gameState);
  ta.readOnly = true;
  document.getElementById('saveio-copy-btn').style.display   = 'inline-block';
  document.getElementById('saveio-import-btn').style.display = 'none';
  modal.classList.add('show');
}

function cmdImport() {
  const modal = document.getElementById('saveio-modal');
  if (!modal) return;
  document.getElementById('saveio-title').textContent = '📥 匯入存檔';
  const ta = document.getElementById('saveio-text');
  ta.value = '';
  ta.readOnly = false;
  ta.placeholder = '請將存檔文字貼入此處…';
  document.getElementById('saveio-copy-btn').style.display   = 'none';
  document.getElementById('saveio-import-btn').style.display = 'inline-block';
  modal.classList.add('show');
  setTimeout(() => ta.focus(), 100);
}

function closeSaveIO() {
  const modal = document.getElementById('saveio-modal');
  if (modal) modal.classList.remove('show');
}

function copySaveText() {
  const ta = document.getElementById('saveio-text');
  if (!ta) return;
  const btn = document.getElementById('saveio-copy-btn');
  navigator.clipboard.writeText(ta.value).then(() => {
    if (btn) { btn.textContent = '✔ 已複製！'; setTimeout(() => btn.textContent = '📋 複製', 2000); }
  }).catch(() => { ta.select(); document.execCommand('copy'); });
}

function importSaveText() {
  const ta = document.getElementById('saveio-text');
  if (!ta || !ta.value.trim()) { print('請先貼入存檔文字。', 'error'); return; }
  try {
    gameState = JSON.parse(ta.value.trim());
    closeSaveIO();
    print('✔ 存檔匯入成功！', 'success');
    describeRoom();
    autoSave();
  } catch(e) {
    print('匯入失敗：文字格式不正確，請確認是否為完整的存檔資料。', 'error');
  }
}

window.cmdExport      = cmdExport;
window.cmdImport      = cmdImport;
window.closeSaveIO    = closeSaveIO;
window.copySaveText   = copySaveText;
window.importSaveText = importSaveText;

// ─── Initialize ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Check for existing save
  const savedData = localStorage.getItem('escapeRoomSave');

  // Setup restart button
  const restartBtn = document.getElementById('ending-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      localStorage.removeItem('escapeRoomSave');
      location.reload();
    });
  }

  // Code modal Enter/Escape handler
  const codeInput = document.getElementById('code-input');
  if (codeInput) {
    codeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmCode();
      if (e.key === 'Escape') closeCodeModal();
    });
  }

  showSplash();

  if (savedData) {
    print('發現存檔資料。點擊「📂 讀取」按鈕可讀取上次進度，或直接開始新遊戲。', 'info');
  }

  describeRoom();
  updateTimer();
  startTimer();

  // Show tutorial for first-time players
  if (!localStorage.getItem('tutorialDone')) {
    showTutorial();
  }
});

})(); // end IIFE
