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
  flags: {
    powerRestored: false,
    bookshelfSolved: false,
    containerOpened: false,
    containerTrapped: false,
    allNpcsTalked: false,
    mapAcquired: false,
  },
  timeLeft: 1800,
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
};

// ─── Rooms ──────────────────────────────────────────────────────────────────
const ROOMS = {
  room1: {
    id: 'room1',
    name: '醒來的房間',
    desc: '你猛地從黑暗中驚醒，發現自己躺在一張冰冷的金屬床上。房間四壁是灰色的混凝土，一盞昏黃的燈在天花板上微弱地閃爍。空氣中瀰漫著消毒水和銹鐵的混合氣味，令人窒息。床邊有一張小桌子，桌上散落著幾件物品。牆角有一個生鏽的保險箱，表面漆跡斑斑。你不記得自己是怎麼來到這裡的——唯一確定的是，你必須逃出去。',
    items: ['note', 'flashlight'],
    exits: { north: 'hallway' },
    puzzles: ['safePuzzle'],
    hints: ['仔細檢查桌上的紙條，上面可能有重要數字。', '保險箱需要四位數密碼，試試看你找到的數字。', '打開保險箱後，裡面的東西對你很有用。'],
  },
  hallway: {
    id: 'hallway',
    name: '走廊',
    desc: '一條長長的走廊，燈光忽明忽暗，投下詭異的陰影。走廊兩側的牆壁上有剝落的油漆，地板上有深深的刮痕，彷彿有什麼重物曾經被拖過這裡。走廊的一端有一個穿著制服的守衛，他用懷疑的眼神看著你。幾個通道從這裡延伸出去，每一個都通往未知的地方。',
    items: ['blueprint'],
    exits: { south: 'room1', north: 'lab', east: 'library', west: 'archive', up: 'storage' },
    npc: 'guard',
    puzzles: [],
    hints: ['走廊裡的守衛可能知道一些有用的訊息，試著和他交談。', '注意走廊四周——藍圖上可能有重要的數字。'],
  },
  lab: {
    id: 'lab',
    name: '實驗室',
    desc: '這間實驗室明顯被倉促廢棄——培養皿仍在架子上，顯微鏡的目鏡還沒有蓋上，白板上寫滿了複雜的分子式，部分被胡亂塗抹掉。一個滿臉焦慮的科學家在角落裡踱步，喃喃自語。架子上整齊排列著各種試管，其中兩支的顏色特別引人注意。實驗桌上有一本皮面日誌，邊角已經磨損。',
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
    desc: '隱藏在書架後面的秘密房間，牆壁上貼滿了照片和文件，用紅線連接著，像是某人長時間調查的成果。房間很小，卻充滿了線索。一個神秘的女子站在房間中央，她的目光銳利而充滿警惕，顯然沒料到有人能找到這裡。這裡藏著關於設施最深層的秘密。',
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
    desc: '員工休息室裡有幾把磨損的沙發和一張咖啡桌。桌上有一個口紅染色的咖啡杯，杯底留著些什麼。牆上掛著一個月曆，日期停在幾年前的某一天。一個封好的信封被壓在一本雜誌下面，上面沒有任何標記。一把通往走廊的梯子靠在牆邊。',
    items: ['envelope', 'lipstickCup'],
    exits: { down: 'hallway' },
    npc: 'oldMan',
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
    desc: '這條走廊顯然已經廢棄多年，牆壁上的油漆大片剝落，露出生鏽的鋼筋。地板上積了厚厚的灰塵，清晰地印著一些奇怪的腳印——有些像是人類，有些……不太像。走廊盡頭有一面磚牆，但仔細看，它似乎不是原本建築的一部分。一個幽靈般的存在在走廊的陰影中若隱若現。',
    items: ['spraypaint'],
    exits: { west: 'underground' },
    npc: 'ghost',
    puzzles: ['brickWallPuzzle', 'ghostTalkPuzzle'],
    hints: ['那面磚牆看起來很可疑，也許背後藏著什麼？', '和走廊裡的存在交談，即使感到害怕。'],
  },
  deepUnderground: {
    id: 'deepUnderground',
    name: '深層地下室',
    desc: '比地下走廊更深的地方，空氣幾乎凝固，呼吸都變得困難。牆壁上刻著一些奇怪的符號，不像是任何已知的語言。中央有一個重型金屬容器，上面有複雜的鎖定機制。一個隱藏的通道入口在昏暗中若隱若現。這個地方充滿了一種讓人想要逃離的不祥感。',
    items: ['metalContainer'],
    exits: { west: 'underground' },
    puzzles: ['containerPuzzle'],
    hints: ['那個金屬容器引人注意，但打開它可能有風險。', '三思而後行——一旦做了選擇，就無法回頭。'],
    locked: true,
  },
  secretArchive: {
    id: 'secretArchive',
    name: '秘密檔案室',
    desc: '這個隱藏的檔案室存放著設施最機密的資料。牆壁上整齊排列著密封的文件箱，每個都貼著「最高機密」的紅色標籤。空氣中有一股陳腐的氣息，彷彿這些秘密已經在這裡腐爛了多年。一份標記著「幽靈計劃」的檔案特別顯眼，放在中央的桌子上。',
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
    desc: '終於到了出口大廳——一個寬敞的空間，有著高聳的天花板和大理石地板，與其他地方截然不同。正對面是一扇巨大的金屬門，陽光從門縫中透進來，帶著外面世界的溫暖氣息。這一刻你感到既興奮又沉重——你即將離開這裡，但帶著無法說出口的秘密。門上的鎖等待著最終鑰匙。',
    items: [],
    exits: {},
    puzzles: ['exitPuzzle'],
    hints: ['使用最終鑰匙打開出口大門。', '你的選擇和行動將決定你的命運。'],
  },
  vaultRoom: {
    id: 'vaultRoom',
    name: '保險庫',
    desc: '深藏在設施最底層的保險庫，四壁是厚重的鋼板，連核彈都難以穿透。裡面存放著最絕密的物品——一個藍色光芒裝置，幾個密封的容器，以及一個明顯被精心保護的金色鑰匙。這個地方的存在本身就是一個秘密，知道它的人寥寥無幾。',
    items: ['keyD', 'secretDisk'],
    exits: {},
    puzzles: ['vaultPuzzle'],
    locked: true,
    hints: ['藍色光芒裝置似乎很重要，仔細檢查它。', '保險庫裡的秘密磁碟是最重要的證據之一。'],
  },
};

// ─── NPCs ───────────────────────────────────────────────────────────────────
const NPCS = {
  guard: {
    name: '守衛',
    stages: [
      '守衛用懷疑的眼神上下打量你，手按在腰間的對講機上。「你是誰？你不應該在這裡。說清楚，你是哪個部門的？」他的語氣充滿戒備。',
      '守衛稍微放鬆了一點，但仍保持警惕。「……好吧，也許我可以給你一點提示。實驗室的方向是北邊，科學家可能知道更多。不過你最好別惹麻煩。密碼嘛……」他壓低聲音，「第一個數字是' + CODES.cipher[0] + '，第二個是' + CODES.cipher[1] + '，就這樣。」',
      '守衛嘆了口氣，看起來疲憊不堪。「算了，其實我也不知道自己在守護什麼。這個地方……有很多見不得光的事。你快走吧，趁還來得及。」他轉過身，不再理你。',
    ],
  },
  scientist: {
    name: '科學家',
    stages: [
      '科學家看到你，驚得後退了一步，試管差點掉落。「天啊！你是誰？你怎麼進來的？這裡……這裡很危險，你不知道他們在做什麼！」他的聲音因為恐懼而顫抖。',
      '科學家深吸一口氣，強迫自己冷靜下來。「對不起，我很緊張。我是這裡的研究員，負責生化實驗。他們……他們的實驗違反了所有倫理規範。密碼的第三個數字是' + CODES.cipher[2] + '，第四個是' + CODES.cipher[3] + '。這是我知道的。快找出口吧！」',
      '科學家靠近你，壓低聲音。「我一直在等待機會說出這一切。這個設施進行的是人體實驗——失蹤人員的真正下場就在那些密封容器裡。如果你能逃出去，請把這些告訴世界。」他把一份文件塞入你的口袋。',
    ],
  },
  mysteriousWoman: {
    name: '神秘女子',
    stages: [
      '神秘女子轉過身，眼神銳利地凝視著你。「你不應該在這裡。這個地方的秘密……知道太多的人都消失了。」她的聲音低沉而充滿警告意味。',
      '女子的表情軟化了一些，走近幾步。「我在這裡調查這個設施已經三個月了。他們以為我是研究助理，但實際上我是來揭露真相的。這裡進行的實驗……」她遞給你一張藍色磁卡，「拿著這個，它能開啟一些被封鎖的通道。」',
      '女子最後望了一眼牆上的資料，轉向你。「一切的真相都在秘密檔案室裡。找到幽靈檔案，你就會明白為什麼這裡必須曝光。我會想辦法從另一條路出去——你保重。」她的眼神中有一絲無法言說的悲傷。',
    ],
    givesItem: { stage: 1, item: 'blueCard' },
  },
  oldMan: {
    name: '老人',
    stages: [
      '老人抬起頭，渾濁的眼睛看著你，像是在看一個遙遠的影像。「孩子……你來了。我在這裡等了很久了。這個地方藏著太多的秘密，連牆壁都在哭泣。」他的聲音像落葉在風中飄蕩。',
      '老人緩緩點頭。「我曾是這裡的第一批研究員。那時候，我們相信我們在造福人類……」他搖搖頭，「聽著，密碼第五個數字是' + CODES.cipher[4] + '，第六個是' + CODES.cipher[5] + '。不要讓他們繼續下去，孩子。」',
      '老人閉上眼睛。「我已經太老了，走不動了。但你還年輕。帶著真相離開這裡，讓世界知道發生了什麼。這就是我唯一的請求了……」他微微一笑，仿佛終於卸下了某個重擔。',
    ],
  },
  ghost: {
    name: '幽靈',
    stages: [
      '走廊的陰影突然凝聚成一個模糊的人形，發出低沉的嗚咽聲。「……離開……這裡……」那聲音像是從很遠很遠的地方傳來，充滿了無法言說的悲傷和痛苦。你感到一陣寒意沿脊背蔓延。',
      '幽靈的輪廓逐漸清晰，是一個穿著舊式實驗服的年輕人。「我……是這裡的受害者之一。他們對我們做了可怕的事……」聲音帶著哽咽，「磚牆後面……有通往保險庫的路……那裡有最終的真相……請……讓我們安息……」幽靈緩緩消散，但那份悲傷仍然縈繞不去。',
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
      print('你小心翼翼地操作金屬容器的鎖定機制。容器緩緩打開，裡面是空的——但底部有一個暗格，裡面有一個手柄。你拉動它，深層地下室的東側牆壁滑開，露出通往保險庫的秘密通道！', 'success');
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

  const invList = document.getElementById('inventory-list');
  invList.innerHTML = '';
  if (gameState.inventory.length === 0) {
    const li = document.createElement('li'); li.textContent = '（空）'; invList.appendChild(li);
  } else {
    gameState.inventory.forEach(id => {
      const li = document.createElement('li');
      li.textContent = ITEMS[id] ? ITEMS[id].name : id;
      invList.appendChild(li);
    });
  }

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
}

function updateTimer() {
  const t = gameState.timeLeft;
  const m = Math.floor(t / 60).toString().padStart(2, '0');
  const s = (t % 60).toString().padStart(2, '0');
  const timerEl = document.getElementById('timer');
  timerEl.textContent = `${m}:${s}`;
  if (t <= 300) timerEl.style.color = '#ff4444';
  else timerEl.style.color = '';
}

function showEnding(title, text) {
  gameState.gameOver = true;
  clearInterval(timerInterval);
  document.getElementById('ending-title').textContent = title;
  document.getElementById('ending-text').textContent = text;
  document.getElementById('ending-overlay').classList.add('show');
}

// ─── Timer ──────────────────────────────────────────────────────────────────
let timerInterval = null;

function startTimer() {
  timerInterval = setInterval(() => {
    if (gameState.gameOver) { clearInterval(timerInterval); return; }
    gameState.timeLeft--;
    updateTimer();
    if (gameState.timeLeft <= 0) {
      showEnding('時間耗盡', '計時器歸零，設施的自動封鎖系統啟動，所有出口被焊死。你被困在這裡，成為了又一個消失的人……時間是最無情的看守者。');
    }
  }, 1000);
}

// ─── Endings ────────────────────────────────────────────────────────────────
function triggerEnding() {
  const s = gameState.secretsFound;
  const p = gameState.solvedPuzzles.length;
  const allNpcs = checkAllNpcsTalked();

  if (allNpcs && s >= 5 && p >= 30) {
    showEnding('完美結局：真相的見證者',
      '你推開沉重的大門，陽光傾瀉而來，溫暖了你已經麻木的皮膚。你不僅逃了出去，更帶走了這個設施所有骯髒秘密的證據。記者、調查員、受害者家屬……所有人終於得到了他們一直在等待的答案。設施被徹底調查，幕後黑手被繩之以法。那些消失的人雖然無法復生，但他們的故事被世界知曉。你成為了歷史的見證者。');
  } else if (s >= 5) {
    showEnding('隱藏真相結局：沉默的揭露者',
      '你衝出大門，帶著滿腔的秘密奔向自由。你知道的太多了——多到令人窒息。在陽光下，你打開了神秘女子給你的藍色磁卡，上面存著完整的設施檔案。你把這些資料傳給了一個可信賴的記者，然後消失在人群中。真相開始緩慢地擴散……');
  } else {
    showEnding('成功逃脫',
      '你終於推開了那扇門！外面是自由的天空，空氣是如此清新，陽光是如此溫暖。你不知道自己在那個設施裡度過了多少時間，也不完全明白那裡發生了什麼。但你活著出來了，這已經是最重要的事情。也許有一天，你會找到勇氣回來揭開那些謎底……');
  }
}

function checkAllNpcsTalked() {
  return Object.values(gameState.npcStages).every(s => s >= 2);
}

// ─── Room Description ────────────────────────────────────────────────────────
function describeRoom(verbose) {
  const room = currentRoom();
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

  // Special room transitions
  if (dest === 'restRoom' && gameState.npcStages.oldMan >= 1) {
    ROOMS.restRoom.npc = 'oldMan';
  }

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

function showMap() {
  printSeparator();
  print('【設施地圖】', 'map-title');
  print('  ┌─────────────┬─────────────┐', 'map');
  print('  │  儲藏室(上)  │   觀察室    │', 'map');
  print('  └──────┬──────┘  醫療室──┘  │', 'map');
  print('  ┌──────┴──────┐             │', 'map');
  print('  │   走廊(中樞) │──實驗室─────┘', 'map');
  print('  └──┬───┬───┬──┘  └─實驗室B─主機房', 'map');
  print('  檔案室 圖書室 地下走廊     ', 'map');
  print('  └─秘密 └─隱藏 └──廢棄走廊─深層', 'map');
  print('     檔案室 房間 │  └─保險庫 地下室', 'map');
  print('              發電機房', 'map');
  print('  控制室─通訊室─密碼室', 'map');
  print('  └─逃生通道─最終密碼室─出口大廳', 'map');
  printSeparator();
}

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
  print('          ◆ 密室逃脫：黑暗設施 ◆', 'title');
  print('', '');
  print('  你在黑暗中醒來，記憶一片空白。', 'intro');
  print('  這個神秘設施藏著你不知道的秘密。', 'intro');
  print('  你有30分鐘的時間找到出口。', 'intro');
  print('  但逃出去只是開始——真正的問題是：你會帶走什麼真相？', 'intro');
  print('', '');
  print('  輸入 help 查看所有指令', 'info');
  print('  輸入 hint 獲取當前房間的提示', 'info');
  print('', '');
  printSeparator();
  print(`  [本局密碼已隨機生成，祝你好運]`, 'info');
  printSeparator();
  print('', '');
}

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

  // Input handler
  const input = document.getElementById('command-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        handleCommand(val);
      }
    });
    input.focus();
  }

  showSplash();

  if (savedData) {
    print('發現存檔資料。輸入 load 讀取，或直接開始新遊戲。', 'info');
  }

  describeRoom();
  updateTimer();
  startTimer();
});

})(); // end IIFE
