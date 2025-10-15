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
        "【えななん<:image07:1427209421683167333>】　なんなん？えななん♡"
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
      "【えななん<:image07:1427209421683167333>】　なんなん？えななん♡",
    ];

    const weight = [30, 30, 30, 30, 30, 30, 30, 2];

    lotteryByWeight(message.channel.id, arr, weight);
    return;
  }

});

