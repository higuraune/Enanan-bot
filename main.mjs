import { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log(`🎉 ${client.user.tag} が正常に起動しました！`);
});

// ====== ここから messageCreate を 1 本に統合 ======

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // --- 反応系 ---
  if (message.content.match(/えななん/)) {
    await message.react("🎨");
    return;
  }

  if (message.content.match(/お疲れ|おつかれ/)) {
    await message.react("🍵");
    return;
  }

  if (message.content.match(/BND/)) {
    const text = ";A Brand New Day 🌈❕駆け抜けた🏃‍♂️その先の先➡️ 瞬く✨未来😆はいつだって🤞遠くの空☀️☁️に描く🎨希望🙈💭💗で輝いて🌟いるんだ😉🍀";
    message.channel.send(text);
    return;
  }

  // --- ローカル画像送信 ---
  if (message.content === "!カラーコード") {
    const file = new AttachmentBuilder("./image/cachedImage.png");
    await message.channel.send({ files: [file] });
    return;
  }

  // --- おみくじ（簡易版） ---
  if (message.content.match(/!おみくじ/)) {
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

    const total = weight.reduce((a, b) => a + b, 0);
    let random = Math.floor(Math.random() * total);

    for (let i = 0; i < weight.length; i++) {
      if (random < weight[i]) {
        message.channel.send(arr[i]);
        return;
      }
      random -= weight[i];
    }
  }

  // --- 本格えなみくじ（埋め込み） ---
  if (message.content.match(/!えなみくじ/)) {
    const displayName = message.member?.displayName || message.author.username;

    const drawStar = () => {
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
    };

    const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

    const detail = {
      願望: drawStar(),
      恋愛: drawStar(),
      学問: drawStar(),
      金運: drawStar(),
      仕事: drawStar(),
      健康: drawStar()
    };

    const avg = Object.values(detail).reduce((a, b) => a + b, 0) / 6;
    const rank =
      avg >= 4.5 ? "えななん(超最高)" :
      avg >= 4.0 ? "大吉" :
      avg >= 3.6 ? "吉" :
      avg >= 3.2 ? "中吉" :
      avg >= 2.8 ? "小吉" :
      avg >= 2.3 ? "末吉" :
      avg >= 1.9 ? "凶" : "大凶";

    const embed = new EmbedBuilder()
      .setColor(0xccaa88)
      .setTitle(`⛩️ えなみくじ - ${rank} -`)
      .addFields(
        {
          name: "📊 運勢",
          value:
            `願望　${stars(detail.願望)}\n` +
            `恋愛　${stars(detail.恋愛)}\n` +
            `学問　${stars(detail.学問)}\n` +
            `金運　${stars(detail.金運)}\n` +
            `仕事　${stars(detail.仕事)}\n` +
            `健康　${stars(detail.健康)}\n`,
        }
      )
      .setFooter({ text: `${displayName} さんに、今年もよい一年を♪` });

    await message.channel.send({ embeds: [embed] });
    return;
  }

  // ======== 部屋番号変更機能（埋め込み + 別チャンネル名変更） ========

  if (message.content.match(/^\d{5}$/)) {
    const code = message.content;

    // 埋め込み通知
    const embed = new EmbedBuilder()
      .setColor(0x00bfff)
      .setTitle("🔧 部屋番号が変更されました")
      .setDescription(`この部屋の番号は **${code}** に更新されたよ！`)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });

    // 別チャンネルへ通知 & 名前変更
    const targetChannelId = "962288448679608370";

    try {
      const targetChannel = await client.channels.fetch(targetChannelId);
      await targetChannel.setName(code);
      await targetChannel.send(`📨 新しい部屋番号: **${code}**`);
    } catch (err) {
      console.log("別チャンネル処理でエラー:", err);
    }

    return;
  }
});

// ====== Express（Render用） ======

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ status: "Bot is running!" });
});

app.listen(port, () => {
  console.log(`🌐 Web サーバーがポート ${port} で起動しました`);
});
