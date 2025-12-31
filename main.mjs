// main.mjs - Discord Botのメインプログラム

// 必要なライブラリを読み込み
import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';

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

// Botが起動完了したときの処理
client.once('ready', () => {
    console.log(`🎉 ${client.user.tag} が正常に起動しました！`);
    console.log(`📊 ${client.guilds.cache.size} つのサーバーに参加中`);
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

  if (avg >= 4.4) return "えななん<:image07:1427209421683167333>(超最高)";
  if (avg >= 4.0) return "大吉";
  if (avg >= 3.6) return "中吉";
  if (avg >= 3.2) return "小吉";
  if (avg >= 2.8) return "吉";
  if (avg >= 2.4) return "末吉";
  if (avg >= 2.0) return "凶";
  return "大凶";
}

// メッセージが送信されたときの処理
client.on("messageCreate", async (message) => {
  // Bot自身のメッセージは無視  
  if (message.author.bot) return;

  // --- 簡単な例 ---
  if (message.content.match(/おはよ/)) {
    sendReply(message, "おはよー♪");
    return;
  }

  if (message.content.match(/こんにちは/)) {
    sendReply(message, "あら、こんにちは♪");
    return;
  }

  if (message.content.match(/こんばんは/)) {
    sendReply(message, "あら、こんばんは♪");
    return;
  }

  if (message.content.match(/えななん/)) {
    await message.react("🎨");
    sendReply(message, "パシャ(自撮り)");
    return;
  }

  if (message.content.match(/BND/)) {
    const text =
      "A Brand New Day 🌈❕駆け抜けた🏃‍♂️その先の先➡️ 瞬く✨未来😆はいつだって🤞遠くの空☀️☁️に描く🎨希望🙈💭💗で輝いて🌟いるんだ😉🍀";
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
    "温かい飲み物",
    "お気に入りのペン",
    "小銭入れ",
    "スマホの壁紙",
    "白い靴下"
  ];
  const luckyItem =
    luckyItems[Math.floor(Math.random() * luckyItems.length)];

  // 総括
  const summaryByRank = {
    "えななん<:image07:1427209421683167333>(超最高)": "aa",
    大吉: "思い切って行動してよし。",
    中吉: "良い流れ。焦らず進め。",
    小吉: "小さな幸せを大切に。",
    吉: "平穏無事。現状維持が吉。",
    末吉: "慎重に。足元を固めよ。",
    凶: "無理は禁物。守りに入れ。",
    大凶: "今日は静かに過ごすべし。"
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
        `健康　${stars(detail.健康)}`,
      inline: false
    },
    {
      name: "\u200B",   // ゼロ幅スペースで空行
      value: "\u200B",
      inline: false
    },
    {
      name: "🎁 ラッキーアイテム",
      value: `${luckyItem}`,
      inline: false
    },
    {
      name: "\u200B",   // ゼロ幅スペースで空行
      value: "\u200B",
      inline: false
    },
    {
      name: "📜 総括",
      value: `${summaryByRank[rank]}`,
      inline: false
    }
  ],
  footer: { text: `${displayName} の運勢` },
  color: 0xccaa88
};

  message.channel.send({ embeds: [embed] });
  return;
}

});

