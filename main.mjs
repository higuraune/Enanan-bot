// main.mjs - Discord Botのメインプログラム

// 必要なライブラリを読み込み
import { Client, GatewayIntentBits } from 'discord.js';
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

// メッセージが送信されたときの処理
client.on('messageCreate', (message) => {
    // Bot自身のメッセージは無視
    if (message.author.bot) return;
    
    // 「ping」メッセージに反応
    if (message.content.toLowerCase() === 'ping') {
        message.reply('🏓 pong!');
        console.log(`📝 ${message.author.tag} が ping コマンドを使用`);
    }
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


client.on("message", (message) => {
  if (message.author.id == client.user.id || message.author.bot) {
    return;
  }
  if (message.content === "!自己紹介") {
    let text =
      "えななんbotについて紹介するね♪\n下記コマンドを送信すると反応するよ😌\n\n・!おみくじ\n▶︎おみくじが引けるよ♪\n【大吉、吉、中吉、小吉、末吉、凶、大凶】\n超低確率でプレミア運勢があるかも…？🎨\n\n・!課題曲\n▶︎今日の課題曲(楽曲、難易度、達成条件)が与えられるよ♪\nクリア目指して頑張ろうね！\n\n・!修行曲\n▶︎課題曲の上位互換だよ♪\nこのくらいできて当然よね？ふふっ♪\n\n・!地獄曲\n▶︎修行曲の上位互換だよ♪\n覚悟しといてね♪\n\n・!なぞなぞ\n▶︎なぞなぞを出すよ♪\n全部で100問用意しているよ♪\n\n・!部屋番号\n▶︎チャンネル名の自動更新について紹介するよ♪\n長くなるのでここでは割愛するね♪\n\n他にも色々なワードに反応するよ✨\nみんな、よろしくね♪";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content === "!部屋番号") {
    let text =
      "部屋番号を聞き専チャットで送信すると、ボイスのチャンネル名などが自動更新されるよ♪\n\n※以下のことに注意してね🥺\n\n・__部屋番号だけ__を送信してね！(半角全角どちらでもOK！)\n良い例：00430  ００３１９\n悪い例：00827です！ お部屋０１００５\n\n・discordの仕様上、部屋番号は__10分に2回__までしか変更できないよ！\n部屋番号の打ち間違いや、チアフルでの連続立て直しには気をつけてね…！";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content === "!コマンド") {
    let text =
      "自己紹介以外のコマンド一覧だよ♪\n-----------------------------------\n【お役立ち情報】\n!リーダー回数\n!キズナ\n!ポイント調整\n!内部\n!カラーコード\n!sekai (Sekai Viewer)\n!譜面\n\n【飯テロ系】\n!飯テロ\n!超飯テロ\n!ラーメン\n!焼肉\n\n【その他・ネタ系】\n!キャラ名 (実装されてないのもあります・・・)\n!超キャラ名 (上記同様)\n!えなチャレ\n!チャレライ\n!松岡\n!修造\n!かす\n!アパホテル\n!超アパホテル\n!るーと\n!エンヴィー\n辛麵\n超辛麺\nスーモ\nBND\n!レモン\n!ココア\n!デカすぎんだろ\n-----------------------------------";
    sendMsg(message.channel.id, text);
    return;
  }
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
  if (message.content.match(/おやすみ/)) {
    sendReply(message, "今日もお疲れ様！おやすみなさい♪");
    return;
  }
  if (message.content.match(/えななん/)) {
    let react = "🎨";
    message
      .react(react)
      .then((message) => console.log("リアクション: 🎨"))
      .catch(console.error);
  }
  if (message.content.match(/えななん/)) {
    sendReply(message, "パシャ(自撮り)");
    return;
  }
  if (message.content.match(/こらー！/)) {
    let text = "あこあこにしてあげる♡";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/BND/)) {
    let text =
      "A Brand New Day 🌈❕駆け抜けた🏃‍♂️その先の先➡️ 瞬く✨未来😆はいつだって🤞遠くの空☀️☁️に描く🎨希望🙈💭💗で輝いて🌟いるんだ😉🍀";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/スーモ/)) {
    let text =
      "あ❗スーモ❗🌚ダン💥ダン💥ダン💥シャーン🎶スモ🌝スモ🌚スモ🌝スモ🌚スモ🌝スモ🌚ス〜〜〜モ⤴🌝スモ🌚スモ🌝スモ🌚スモ🌝スモ🌚スモ🌝ス〜〜〜モ⤵🌞";
    sendMsg(message.channel.id, text);
    return;
  }

  // ファイル送信
  if (message.content === "!リーダー回数") {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/930062265259020328/963064869995819058/IMG_1250.jpg",
      },
    });
    return;
  }
  if (message.content === "!ポイント調整") {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/962336971794026526/IMG_0337.jpg?ex=65fed325&is=65ec5e25&hm=c6a81d8ee2c92cf9f1537da3a8e55e4776dee463c19022d4d04bced761b43c96&.jpg",
      },
    });
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/962336972150571088/IMG_0338.jpg?ex=65fed325&is=65ec5e25&hm=5a5477400dceed0844f5754c39c894e9c134c2a3f5b87440e15bdb7b2ee46f6e&.jpg",
      },
    });
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/962336972532248576/IMG_0339.jpg?ex=65fed325&is=65ec5e25&hm=37825e4beba69af5b5274e330d2d53e2ebe220d486903bf3e92dbe2983d72a22&.jpg",
      },
    });
    return;
  }
  if (
    message.content.match(/!ノマドポイント/)
  ) {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/1189936388494344252/IMG_1355.jpg",
      },
    });
　　message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/1189936388930543636/IMG_1356.jpg",
      },
    });
　　message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/1189936389299646534/IMG_1357.jpg",
      },
    });
　　message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/1189936389664546948/IMG_1358.jpg",
      },
    });
    return;
  }
  if (message.content === "!カラーコード") {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/960088868068147261/cachedImage.png?ex=661254ef&is=65ffdfef&hm=e1197a695ec97165c6afbcd45a6025acfae81552627a0c04c698a4a9a6678669&.png",
      },
    });
    return;
  }
  if (
    message.content.match(
      /!デカすぎんだろ|!デカ過ぎんだろ|!でか過ぎんだろ|!でかすぎんだろ/
    )
  ) {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/964689229672230943/977807766590717982/IMG_2891.jpg?ex=65ffbc72&is=65ed4772&hm=d514218e77ad5638d09ba2df06fe807b177d1d336791fe796002a06b7bb4ac04&.jpg",
      },
    });
    return;
  }
  if (message.content.match(/!キズナ/)) {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/982274690108248154/unknown.png?ex=65fd8797&is=65eb1297&hm=f31c1c161b703884f20e2041396a62f1800465b0d445f92a37f52aa8e6d2c024&.png",
      },
    });
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/982280090429829181/85_20220603224623.png?ex=65fd8c9f&is=65eb179f&hm=f92810dd83e8d7f85ec40937ac9c5042f6f1cc3092970dfde3e10030a9caebb6&.png",
      },
    });
  }
  if (message.content.match(/!内部/)) {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/960051286559055892/982222314944995338/IMG_6363.png",
      },
    });
    return;
  }
  if (message.content.match(/!ココア/)) {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/964689229672230943/983387688767983706/unknown.png?ex=66019427&is=65ef1f27&hm=9d9437828e2c3ec2826a647300d6106bfb21d3af4e26137cf785536cd79184ea&.png",
      },
    });
    return;
  }
  if (message.content.match(/!レモン/)) {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/964689229672230943/983386681317163098/IMG_2344.jpg?ex=66019337&is=65ef1e37&hm=3e0103ef3e7c41a6f34ae075700f8b4dd6045c9908e0fac477e0f2770c4f7f1c&.jpg",
      },
    });
    return;
  }
  if (message.content.match(/!チャレライ/)) {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/964689229672230943/997147338353156136/2A8FEE83-2D57-429B-9FD3-878FB151C6DD.gif?ex=65fc43d3&is=65e9ced3&hm=076aaca9a795f5deed8cdae9a64f2f071e8cdd8ff1d985313a5d9817dc1b918c&.gif",
      },
    });
    return;
  }
  if (message.content.match(/!かに|!カニ/)) {
    message.channel.send({
      file: {
        attachment:
          "https://cdn.discordapp.com/attachments/964689229672230943/1051139043011862619/82B1BF94-FC53-4E4E-A93B-7303707E6150.jpg?ex=663b8805&is=663a3685&hm=04f21ca5bec3061d8cc8314c0877bb80c6b56c495af640ecfcbede23f850e414&.jpg",
      },
    });
    return;
  }

  //リンク
  if (message.content.match(/!sekai/)) {
    let text = "https://sekai.best/eventtracker";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/!譜面/)) {
    let text = "https://sdvx.in/prsk.html";
    sendMsg(message.channel.id, text);
    return;
  }
    if (message.content.match(/!ユメステ譜面/)) {
    let text = "https://sdvx.in/ymst.html";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/!キズナ/)) {
    let text = "https://1drv.ms/x/s!Aokujo_zf1nagR4rNSt1biq6k6vf?e=61FkQW";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/いいね/)) {
    let react = "👍";
    message
      .react(react)
      .then((message) => console.log("リアクション: 👍"))
      .catch(console.error);
  }
  if (message.content.match(/いいね/)) {
    let text = "<:stamp0030:954031171837263953>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/パンケーキ/)) {
    let react = "🥞";
    message
      .react(react)
      .then((message) => console.log("リアクション: 🥞"))
      .catch(console.error);
  }
  if (message.content.match(/パンケーキ/)) {
    let text = "パンケーキおいしそう♪";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/チーズケーキ/)) {
    let react = "🧀";
    message
      .react(react)
      .then((message) => console.log("リアクション: 🧀"))
      .catch(console.error);
  }
  if (message.content.match(/チーズケーキ/)) {
    let text = "チーズケーキおいしそう♪";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/えらい/)) {
    let text = "<:stamp0070:954019121807392828><:stamp0163:954020799495438367>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content === "海ガメ") {
    let text = "海ガメ「SF繋いだので目覚まし止めてきます。」";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content === "🐢") {
    let text = "海ガメ「もうすぐ2位と2億ポイント差ですね。」";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/てんさい/)) {
    let react = "☄️";
    message
      .react(react)
      .then((message) => console.log("リアクション: ☄️"))
      .catch(console.error);
  }
  if (message.content.match(/えーん/)) {
    let text = "<:stamp0091:853543370102407188>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/はにゃ/)) {
    let text = "<:image06:894813917451255818>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/よろしく/)) {
    let text = "<:stamp0210:960102662664249385>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (
    message.content.match(
      /たすかる|助かる|たすかります|助かります|たすかりました|助かりました/
    )
  ) {
    let text = "<:stamp0122:960103160947572756>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/わかっちゃった/)) {
    let text = "<:stamp0452:886214547923406850>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/ふぁいと|ファイト/)) {
    let text = "<:stamp0108:960104627280420944>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/いくね|行くね/)) {
    let text = "<:stamp0014:960104597182091324>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/むむむ/)) {
    let text = "<:stamp0111:960104653540950036>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/かわいい|可愛い/)) {
    let text = "<:stamp0386:960104703021178910>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/わーい/)) {
    let text = "<:stamp0167:960104872794013756>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/がたがた|ガタガタ|ｶﾞﾀｶﾞﾀ/)) {
    let text = "<:stamp0401:960104740560203796>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/ありがとう/)) {
    let text = "<:stamp0113:853540018546016277>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/おつかれ|お疲れ/)) {
    let text = "<:stamp0421:853543501416235018>";
    message.react("853543501416235018");
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/がんばって|頑張って/)) {
    let text = "<:stamp0392:954020846081568818>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/上達してる/)) {
    let text = "<:stamp0015:954020698295238706>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/まかせろ/)) {
    let text = "<:stamp0261:954019320596402246>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/じゃじゃーん|ジャジャーン/)) {
    let text = "<:stamp0527:954019468814725221>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/もっとできるだろ/)) {
    let text = "<:stamp0150:954020762208047144>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/おかしい/)) {
    let text = "<:stamp0492:957816965324496916>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/いいんですか/)) {
    let text = "<:stamp0528:954019513303715860>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/はやくきて|はやく来て/)) {
    let text = "<:stamp0489:954019589455495178>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/んんんん/)) {
    let text = "<:stamp0467:954019692710883348>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/ごめん/)) {
    let text = "<:stamp0408:954032956534554664>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/さすが/)) {
    let text = "<:stamp0092:957818615841845329>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/もう少し/)) {
    let text = "<:stamp0200:957818708888281109>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/えへへ/)) {
    let text = "<:stamp0234:957818836160241664>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/馬鹿にしやがって|ばかにしやがって/)) {
    let text = "<:stamp0519:957819387589578802>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/ここで止まっていいの|ここでとまっていいの/)) {
    let text = "<:stamp0487:957819484649951292><:stamp0143:957824774531342396>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/ずっと一緒にいようね|ずっといっしょにいようね/)) {
    let text = "<:stamp0012:957824596772548668>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/あいつらがいたからだ/)) {
    let text = "<:stamp0024:957824621623795802>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/なんか文句あんの|なんかもんくあんの/)) {
    let text = "<:stamp0026:957824639302787102>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/サンキュー|さんきゅー/)) {
    let text = "<:stamp0133:957824705576988712>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/フフフ|ふふふ|ﾌﾌﾌ/)) {
    let text = "<:stamp0182:957824738602913822>";
    message.react("957824738602913822");
    message.react("1051157625947041902");
    message.react("1051157654686408795");
    message.react("1051157689692070031");
    message.react("1055853262156333087");
    message.react("1055853303793205298");
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/いいと思う|いいとおもう/)) {
    let text = "<:stamp0143:957824774531342396>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/よくわからない/)) {
    let text = "<:stamp0422:957824827484434493>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/ビームの的にするから/)) {
    let text = "<:stamp0515:957824872770338837>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/いただきます/)) {
    let text = "<:stamp0448:957824930626547732>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/うわぁ/)) {
    let text = "<:stamp0109:957825133148516362>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (
    message.content.match(/早く歌いたーい|はやく歌いたーい|はやくうたいたーい/)
  ) {
    let text = "<:stamp0038:957827037077332059>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (
    message.content.match(/早く歌いたいな|はやく歌いたいな|はやくうたいたいな/)
  ) {
    let text = "<:stamp0040:957827054596915231>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/たのしかった|楽しかった/)) {
    let text = "<:stamp0227:957828359998550036>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/うわっ/)) {
    let text = "<:stamp0255:957828396665176155>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/えぇ/)) {
    let text = "<:stamp0257:957828443591016518>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/わあっ/)) {
    let text = "<:stamp0277:957828481499148318>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/感謝|かんしゃ/)) {
    let text = "<:stamp0269:957828512876744775>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/いくわよ/)) {
    let text = "<:stamp0525:957828567041990716>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/お願い|おねがい/)) {
    let text = "<:stamp0542:977497189209210880>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/あー！/)) {
    let text = "<:stamp0544:989140243418611765>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/まだできる/)) {
    let text = "<:stamp0549:1021319165295992882>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/実力を見せてもらうわ/)) {
    let text = "<:stamp0551:1021318866862886953>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/うっ…/)) {
    let text = "<:stamp0554:1021319132689469450>";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/超辛麺|ちょうからめん/)) {
    let text =
      "<:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078><:karamen:982877292772610078>";
    sendMsg(message.channel.id, text);
    sendMsg(message.channel.id, text);
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/辛麺|からめん/)) {
    let text = "🔥<:karamen:982877292772610078>🔥";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/!定期処理/)) {
    let text = "Periodic processing";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/!夏の大三角/)) {
    let text =
      "〃∩ ＿,,　「あれがデネブ\n⊂⌒(｀Д)\n＼ヽつ⊂ﾉ／)\n　＼　ミ( ⌒ヽつ　アルタイル\n　　＼⊂(,∀､)つ\n　　　＼　〃∩ ＿,,　　　　ベガァッ！」\n　　　　＼⊂⌒(｀Д)\n　　　　 ｜ヽつ⊂ノ\n　　　　 ｜\n　　　　 ｜　ｻﾞﾊﾞｰﾝ\n　　　　 ｜〃∩ ｡o\n　　　　 ｜⊂⌒从从ﾟ\n　　　　 ｜~~~~~";
    sendMsg(message.channel.id, text);
    return;
  }
});