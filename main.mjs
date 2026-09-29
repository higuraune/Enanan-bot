// main.mjs - Discord Botのメインプログラム

// 必要なライブラリを読み込み
import {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import dotenv from "dotenv";
import express from "express";


// .envファイルから環境変数を読み込み
dotenv.config();

// Discord Botクライアントを作成
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // サーバー情報取得
        GatewayIntentBits.GuildMessages,    // メッセージ取得
        GatewayIntentBits.MessageContent,   // メッセージ内容取得
        GatewayIntentBits.GuildMembers,     // メンバー情報取得
    ],
});


// エラーハンドリング
client.on('error', (error) => {
    console.error('❌ Discord クライアントエラー:', error);
});

// プロセス終了時の処理
process.on('SIGINT', () => {
    console.log('🛑 Botを終了しています...');
    client.destroy();
    process.exit(0);
});

// Discord にログイン
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN が .env ファイルに設定されていません！');
    process.exit(1);
}

console.log('🔄 Discord に接続中...');
client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('❌ ログインに失敗しました:', error);
        process.exit(1);
    });

// Express Webサーバーの設定（Render用）
const app = express();
const port = process.env.PORT || 3000;

// ヘルスチェック用エンドポイント
app.get('/', (req, res) => {
    res.json({
        status: 'Bot is running! 🤖',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// サーバー起動
app.listen(port, () => {
    console.log(`🌐 Web サーバーがポート ${port} で起動しました`);
});

// 次鯖の回答記録
let nextServerVotes = {
  yes: [],
  no: [],
  keep: []
};

// 次鯖通知メッセージを保存
let nextServerMessage = null;

// メッセージ送信用関数（旧 sendMsg 相当）
function sendMsg(channelId, text) {
  const channel = client.channels.cache.get(channelId);
  if (channel) channel.send({ content: text });
}

// リプライ送信用関数（旧 sendReply 相当）
function sendReply(message, text) {
  message.reply({ content: text });
}

// --- おみくじ抽選用関数 ---
function lotteryByWeight(channelId, arr, weight) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;

  // 合計ウェイトを計算
  const total = weight.reduce((a, b) => a + b, 0);
  let random = Math.floor(Math.random() * total);

  // 重みに応じて結果を選ぶ
  for (let i = 0; i < weight.length; i++) {
    if (random < weight[i]) {
      channel.send(arr[i]);

      // 特別演出
      if (
        arr[i] ===
        "【えななん(超最高)】　なんなん？えななん♡"
      ) {
        channel.send(
          "<:image07:1427209421683167333><:image07:1427209421683167333><:image07:1427209421683167333><:image07:1427209421683167333><:image07:1427209421683167333><:image07:1427209421683167333>"
        );
      }
      return;
    }
    random -= weight[i];
  }

  console.error("❌ lotteryByWeight: 抽選中にエラーが発生しました");
}

// ===== おみくじ用 共通関数 =====
function drawStar() {
  const table = [
    { star: 5, weight: 14 },
    { star: 4, weight: 8 },
    { star: 3, weight: 6 },
    { star: 2, weight: 4 },
    { star: 1, weight: 2 }
  ];

  const total = table.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;

  for (const t of table) {
    if (r < t.weight) return t.star;
    r -= t.weight;
  }
}

function stars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function calcRank(detail) {
  const avg =
    Object.values(detail).reduce((a, b) => a + b, 0) /
    Object.values(detail).length;

  if (avg >= 4.5) return "えななん<:image07:1427209421683167333>(超最高)";
  if (avg >= 4.0) return "大吉";
  if (avg >= 3.6) return "吉";
  if (avg >= 3.2) return "中吉";
  if (avg >= 2.8) return "小吉";
  if (avg >= 2.3) return "末吉";
  if (avg >= 1.9) return "凶";
  return "大凶";
}

// メッセージが送信されたときの処理
client.on("messageCreate", async (message) => {
  // Bot自身のメッセージは無視  
  if (message.author.bot) return;

  // --- 簡単な例 ---
  if (message.content.match(/えななん/)) {
    await message.react("🎨");
    return;
  }

  if (message.content.match(/お疲れ|おつかれ/)) {
    await message.react("🍵");
    return;
  }

    // --- ネタ構文 ---
  if (message.content === "BND") {
    const text =
      ";A Brand New Day 🌈❕駆け抜けた🏃‍♂️その先の先➡️ 瞬く✨未来😆はいつだって🤞遠くの空☀️☁️に描く🎨希望🙈💭💗で輝いて🌟いるんだ😉🍀";
    sendMsg(message.channel.id, text);
    return;
  }

  // --- ローカル画像送信例 ---
  if (message.content === "!カラーコード") {
    const file = new AttachmentBuilder("./image/cachedImage.png");
    await message.channel.send({ files: [file] });
  }

  // --- おみくじ ---
  if (
    message.content.match(/!おみくじ/) ||
    (message.mentions.has(client.user) && message.content.match(/おみくじ/))
  ) {
    const displayName = message.member?.displayName || message.author.username;
    const text = `${displayName}さんの今日の運勢を占うよ♪`;
    sendMsg(message.channel.id, text);

    const arr = [
      "【大吉】　ふふ、ふふふふふ…… ♪",
      "【吉】　ふふ♪",
      "【大凶】　……馬鹿に……しやがって……！",
      "【凶】　えっと……",
      "【中吉】　ふーん？ いいんじゃない？",
      "【小吉】　んーー？",
      "【末吉】　あ……",
      "【えななん(超最高)】　なんなん？えななん♡",
    ];

    const weight = [10, 10, 5, 8, 10, 10, 10, 3];

    lotteryByWeight(message.channel.id, arr, weight);
    return;
  }

// ===== 本格おみくじ =====
if (
  message.content.match(/!えなみくじ/) ||
  (message.mentions.has(client.user) && message.content.match(/えなみくじ/))
) {
  const displayName =
    message.member?.displayName || message.author.username;

  // ★をそれぞれ抽選
  const detail = {
    願望: drawStar(),
    恋愛: drawStar(),
    学問: drawStar(),
    金運: drawStar(),
    仕事: drawStar(),
    健康: drawStar()
  };

  // 全体運勢
  const rank = calcRank(detail);

  // ラッキーアイテム
  const luckyItems = [
  "赤いハンカチ",
  "白い靴下",
  "マグカップ",
  "小銭入れ",
  "風鈴",
  "USBメモリ",
  "ミニ観葉植物",
  "猫耳カチューシャ",
  "跳ねるボール",
  "手のひらサイズのノート",
  "動くミニ人形",
  "変顔付箋",
  "ボールペン",
  "消しゴム",
  "ビー玉",
  "キャンドル",
  "猫の肉球マスコット",
  "サボテン",
  "光るペン",
  "ミニ扇子",
  "変形チャーム",
  "手の形のクリップ",
  "個性的バッジ",
  "ミニフィギュア",
  "ユニーク柄ノート",
  "小型ライト",
  "にんじん",
  "カレンダー",
  "鉛筆",
  "変わった形の小箱",
  "レトロ小物入れ",
  "奇抜アクセサリー",
  "小型オルゴール",
  "マスキングテープ",
  "キーホルダー",
  "ポストカード",
  "植物栽培セット",
  "指人形",
  "ペンケース",
  "カードケース",
  "ぬいぐるみ",
  "ハンドクリーム",
  "帽子",
  "折り紙",
  "パンケーキ🥞",
  "手鏡",
  "チーズケーキ🧀",
  "牛タン",
  "ランチボックス",
  "ランタン",
  "カレンダー",
  "写真立て",
  "しおりセット",
  "ストラップ",
  "タオルハンカチ",
  "文庫本",
  "アクセサリーケース",
  "折りたたみ傘",
  "ポーチ",
  "靴ひも",
  "ヘアゴム",
  "ネックレス",
  "イヤリング",
  "スマホケース",
  "リストバンド",
  "カラフルペン",
  "ハンドタオル",
  "マグネット",
  "小さな花瓶",
  "クリアファイル",
  "折り紙セット",
  "ねこ",
  "アロマオイル",
  "コーヒー",
  "ハンカチセット",
  "ラッキー石",
  "変形スプーン",
  "たぬき",
  "チョコミント",
  "ハンコ",
  "マグカップ",
  "踊るミニ人形",
  "ボール",
  "面白柄靴下",
  "変顔シール",
  "ガム",
  "動くストラップ",
  "エビ🦐",
  "ミニ観葉鉢",
  "マスコット",
  "ちいかわ",
  "から揚げ",
  "カレー🍛",
  "ポテト🍟",
  "一眼レフカメラ",
  "小型ライトスタンド",
  "凱旋門",
  "羊羹",
  "変なおじさん",
  "キラキラシール",
  "まな板",
  "眠そうなハト",
  "野菜ジュース",
  "その辺の草",
  "その辺の石"
  ];
  const luckyItem =
    luckyItems[Math.floor(Math.random() * luckyItems.length)];

  // 総括
  const summaryByRank = {
    "えななん<:image07:1427209421683167333>(超最高)": "やるじゃん。ちょっと見直しちゃった🎶",
    大吉: "ふふ、今の結構映えたんじゃない？✨",
    吉: "いい感じだったんじゃない？",
    中吉: "これくらいはできないとでしょ",
    小吉: "それなりには満足できたかな",
    末吉: "はぁ…がんばると疲れるなぁ",
    凶: "もう！なんでこうなるわけ？",
    大凶: "今のなし！もう一回やろ！"
  };

  // 表示
  const embed = {
  title: `⛩️ えなみくじ - ${rank} -`,
  fields: [
    {
      name: "📊 運勢",
      value:
        `願望　${stars(detail.願望)}\n` +
        `恋愛　${stars(detail.恋愛)}\n` +
        `学問　${stars(detail.学問)}\n` +
        `金運　${stars(detail.金運)}\n` +
        `仕事　${stars(detail.仕事)}\n` +
        `健康　${stars(detail.健康)}\n` +
        "\u200B",　// ゼロ幅スペースで空行
      inline: false
    },
    {
      name: "🎁 ラッキーアイテム",
      value:
        `${luckyItem}\n` +
        "\u200B",　// ゼロ幅スペースで空行
      inline: false
    },
    {
      name: "📜 えななんからの一言",
        value: `${summaryByRank[rank]}\n` +
        "\u200B",　// ゼロ幅スペースで空行
      inline: false
    }
  ],
  footer: { text: `${displayName} さんに、\n今年もよい一年を♪` },
  color: 0xccaa88
};
  message.channel.send({ embeds: [embed] });
  return;
}
});

// 次鯖確認機能
function buildNextServerEmbed() {
  return new EmbedBuilder()
    .setColor(0x00bfff)
    .setTitle("⏰ 次鯖確認の時間です📝")
    .setDescription("お手すきの際にボタンを押してください")
    .addFields(
      {
        name: "🔴 次鯖あり",
        value: nextServerVotes.yes.join("\n") || " ",
      },
      {
        name: "\u200B", // 空行
        value: "\u200B"
      },
      {
        name: "🟢 次鯖なし",
        value: nextServerVotes.no.join("\n") || " ",
      },
      {
        name: "\u200B", // 空行
        value: "\u200B"
      },
      {
        name: "🔵 継続",
        value: nextServerVotes.keep.join("\n") || " ",
      }
    )
    .setTimestamp();
}


// 次鯖通知を送るチャンネルID
const nextServerChannelId = "960074010920620085";

// 次鯖通知の ON/OFF 状態
let nextServerEnabled = false;

// ===== メッセージで ON/OFF を切り替え =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!次鯖") {
    nextServerEnabled = true;
    message.channel.send("⏱ 次鯖通知を **開始**しました");
    return;
  }

  if (message.content === "!次鯖e") {
    nextServerEnabled = false;
    message.channel.send("⏱ 次鯖通知を **停止**しました");
    return;
  }
});

client.once("ready", () => {

  if (global.botStarted) return;
  global.botStarted = true;

  console.log(`🎉 ${client.user.tag} が正常に起動しました！`);
  console.log(`📊 ${client.guilds.cache.size} つのサーバーに参加中`);
  console.log("⏱ 次鯖確認の時刻指定通知を開始します");

  setInterval(async () => {
    if (!nextServerEnabled) return;

    const now = new Date();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // ★ 毎時間 31分くらいに通知
    if (minute === 10 && second <= 3) {
      try {
        const channel = await client.channels.fetch(nextServerChannelId);

        // ★ 前回の記録をリセット
        nextServerVotes = { yes: [], no: [], keep: [] };

        // ボタン作成
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("next_yes")
            .setLabel("次鯖あり")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("next_no")
            .setLabel("次鯖なし")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("next_keep")
            .setLabel("継続")
            .setStyle(ButtonStyle.Primary)
        );

        // 埋め込み生成
        const embed = buildNextServerEmbed();

        // メッセージ送信 & 保存
        nextServerMessage = await channel.send({
          embeds: [embed],
          components: [row]
        });

      } catch (err) {
        console.log("次鯖通知エラー:", err);
      }
    }
  }, 1000);
});

// ===== ボタン押下時の処理 =====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const userName = interaction.member?.displayName || interaction.user.username;

  // ★ まず全ての項目から名前を削除（押し直し対応）
  nextServerVotes.yes = nextServerVotes.yes.filter(n => n !== userName);
  nextServerVotes.no = nextServerVotes.no.filter(n => n !== userName);
  nextServerVotes.keep = nextServerVotes.keep.filter(n => n !== userName);

  // ★ 押したボタンの項目に追加
  if (interaction.customId === "next_yes") {
    nextServerVotes.yes.push(userName);
  }

  if (interaction.customId === "next_no") {
    nextServerVotes.no.push(userName);
  }

  if (interaction.customId === "next_keep") {
    nextServerVotes.keep.push(userName);
  }

  // ★ 返信なし
  await interaction.deferUpdate();

  // ★ 埋め込み更新
  if (nextServerMessage) {
    const updatedEmbed = buildNextServerEmbed();
    await nextServerMessage.edit({ embeds: [updatedEmbed] });
  }
});



// ===== 部屋番号変更通知 =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // 5桁の数字のみ
  const match = message.content.match(/^\d{5}$/);
  if (!match) return;

  const code = match[0];

  // 更新した人の名前（ニックネーム優先）
  const userName = message.member?.displayName || message.author.username;

  // 更新者のアイコンURL
  const iconURL = message.author.displayAvatarURL();

  // ① 色付き埋め込み（アイコン＋名前入り）
  const embed = new EmbedBuilder()
    .setColor(0xccaa88)
    .setTitle(`🔑 部屋番号が ${code} に変わったよ！`)
    .setAuthor({
      name: `${userName} さんが更新しました`,
      iconURL: iconURL
    })
    .setTimestamp();

  await message.channel.send({ embeds: [embed] });

  // ② 別チャンネルへ書き込み & チャンネル名変更
  const targetChannelId = "962288448679608370"; // ← ここに別チャンネルのIDを指定する

  try {
    const targetChannel = await client.channels.fetch(targetChannelId);

    // チャンネル名変更
    await targetChannel.setName(`部屋番号【${code}】`);

    // 別チャンネルにも色付き巨大埋め込み（アイコン＋名前入り）
    const embed2 = new EmbedBuilder()
      .setColor(0xffaacc)
      .setTitle(`📨 新しい部屋番号: ${code}`)
      .setAuthor({
        name: `${userName} さんが更新しました`,
        iconURL: iconURL
      })
      .setTimestamp();

    await targetChannel.send({ embeds: [embed2] });

  } catch (err) {
    console.log("別チャンネル処理でエラー:", err);
  }
});