const Discord = require("discord.js");
const client = new Discord.Client();
const ayarlar = require("./ayarlar.json");
const moment = require("moment");
require("moment-duration-format")

//════════════ MONGO ════════════\\
const { DatabaseManager } = require("@aloshai/mongosha")
const db = DatabaseManager.getDatabase(ayarlar.veri)                                                     
DatabaseManager.connect("mongodb+srv://twnz:twnpublic123@public.rbyip.mongodb.net/guard1?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true}).then(console.log(`Datebase bağlantısı kuruldu!`))
//════════════ MONGO ════════════\\   

//  //  //  //  //  //  //
//   GUARD 1 SETTINGS   // ❯ Aşağısı
//  //  //  //  //  //  //

client.on("ready", async() => {
client.user.setActivity({ name: `${ayarlar.sunucuadi} ❤️ twn` }, { type: 'WATCHING' })
let seskanali = client.channels.cache.get(ayarlar.seskanali);
if(seskanali) seskanali.join().catch(err => console.error("Bot ses kanalına bağlanamadı!"));

roleBackup()
setInterval(() => {
  roleBackup()
}, 1000*60*10) // 10 dakika
});

client.on("message", async(message) => {
if(message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(ayarlar.prefix) || message.author.id !== ayarlar.sahip) return;
let args = message.content.split(' ').slice(1);
let komut = message.content.split(' ')[0].slice(ayarlar.prefix.length)
let embed = new Discord.MessageEmbed()
    
// ROL KOPYALAMA
if(["rc","rk","rolecopy","rollerikopyala","role-copy","rolleri-kopyala"].some(ww => komut.includes(ww))) {
  message.channel.send(`Rol veritabanı kopyalandı.`)
  roleBackup()
};
    
// ROL DAĞITMA
if(["kurulum","rd","roldağıt","rol-dağıt","rolleridağıt","rolleri-dağıt"].some(ww => komut.includes(ww))) {
let bel = args[0]
if(!bel) return message.channel.send(`Rol veritabanında bir rol ID'si belirtiniz.`)
if(await db.has(`Rname.${bel}`) === false) return message.channel.send(`Belirttiğiniz ID'nin rol verisi bulunamadı.`)

let name = await db.get(`Rname.${bel}`)
let color = await db.get(`Rcolor.${bel}`)
let hoist = await db.get(`Rhoist.${bel}`)
let position = await db.get(`Rposition.${bel}`)
let permissions = await db.get(`Rpermissions.${bel}`)
let mentionable = await db.get(`Rmentionable.${bel}`)
let members = await db.get(`Rmembers.${bel}`)
let overwrites = await db.get(`Rkanalizin.${bel}`)

// AŞAĞISI ROL YOKSA ROLÜN YEDEĞİNİ AÇAR
if(!message.guild.roles.cache.get(bel)) {
await db.delete(`Rname.${bel}`); await db.delete(`Rcolor.${bel}`); await db.delete(`Rhoist.${bel}`); await db.delete(`Rposition.${bel}`); await db.delete(`Rpermissions.${bel}`); await db.delete(`Rmentionable.${bel}`); await db.delete(`Rmembers.${bel}`); await db.delete(`Rkanalizin.${bel}`);
let yenirol = await message.guild.roles.create({ data: { name: name, color: color, hoist: hoist, position: position, permissions: permissions, mentionable: mentionable }, reason: "Yedeği silindiği için tekrar oluşturuldu" })
message.channel.send(embed.setColor(color).setAuthor(`Yedeği Alınıp Silinen Rol Tekrardan Açıldı!`).setDescription(`<@&${yenirol.id}>\nAdı: **${name}**\nRengi: **${color}**\nÇevrimiçiden Ayrı: **${hoist?hoist:false}**\nPozisyonu: **${position}**\nİzinleri: **${permissions}**\nBahsedilebilir: **${mentionable?mentionable:false}**\nÜyeleri dağıtılıyor..`))
await members.forEach((member, index) => {
let uye = message.guild.members.cache.get(member)
if (!uye || uye.roles.cache.has(bel)) return
  setTimeout(() => {
    uye.roles.add(yenirol.id).catch(console.error)
  }, 1000)
setTimeout(() => {
if(overwrites) overwrites.forEach((perm, index) => {
let kanal = message.guild.channels.cache.get(perm.id)
if(!kanal) return;
  setTimeout(() => {
  let yenipermler = {};
    perm.allow.forEach(p => {
      yenipermler[p] = true;
    });
    perm.deny.forEach(p => {
      yenipermler[p] = false;
    });
      kanal.createOverwrite(yenirol.id, yenipermler).catch(console.error)
  }, 1000)
  })
}, 1000)
}); return; };
// YUKARISI ROL YOKSA ROLÜN YEDEĞİNİ AÇAR

// AŞAĞISI VARSA ROLÜ GÜNCELLEYEREK DAĞITIR
message.guild.roles.cache.get(bel).edit({ name: name, color: color, hoist: hoist, position: position, permissions: permissions, mentionable: mentionable })
message.channel.send(embed.setColor(color).setAuthor(`Rol Kopyası İşlendi!`).setDescription(`<@&${bel}> rolünün kopyası işlendi!\nAdı: **${name}**\nRengi: **${color}**\nÇevrimiçiden Ayrı: **${hoist?hoist:false}**\nPozisyonu: **${position}**\nİzinleri: **${permissions}**\nBahsedilebilir: **${mentionable?mentionable:false}**\nÜyeleri dağıtılıyor..`))
members.forEach((member, index) => {
let uye = message.guild.members.cache.get(member)
if(!uye || uye.roles.cache.has(bel)) return
  setTimeout(() => {
    uye.roles.add(bel).catch(console.error)
  }, 1000)
})
setTimeout(() => {
if(overwrites) overwrites.forEach((perm, index) => {
let kanal = message.guild.channels.cache.get(perm.id)
if(!kanal) return;
  setTimeout(() => {
  let yenipermler = {};
    perm.allow.forEach(p => {
    yenipermler[p] = true;
    })
    perm.deny.forEach(p => {
    yenipermler[p] = false;
    })
    kanal.createOverwrite(bel, yenipermler).catch(console.error)
  }, 1000)
  })
}, 1000)
};
// YUKARISI ROL YOKSA ROLÜN YEDEĞİNİ AÇAR

});

// BACKUP GÜNCELLEME FONKSİYONU
function roleBackup() {
let guild = client.guilds.cache.get(ayarlar.sunucuid)
let time = Date.now()
var aylar = { "01": "Ocak","02": "Şubat","03": "Mart","04": "Nisan","05": "Mayıs","06": "Haziran","07": "Temmuz","08": "Ağustos","09": "Eylül","10": "Ekim","11": "Kasım","12": "Aralık" }

guild.roles.cache.filter(r => r.name !== "@everyone" && !r.managed).forEach(async (role) => {
  await db.set(`Rname.${role.id}`, role.name)
  await db.set(`Rcolor.${role.id}`, role.hexColor)
  await db.set(`Rhoist.${role.id}`, role.hoist)
  await db.set(`Rposition.${role.id}`, role.position)
  await db.set(`Rpermissions.${role.id}`, role.permissions)
  await db.set(`Rmentionable.${role.id}`, role.mentionable)
  await db.set(`Rmembers.${role.id}`, role.members.map(m=>m.id))
let rolkanalperm = [];
guild.channels.cache.filter(c => c.permissionOverwrites.has(role.id)).forEach(c => {
let kanalperm = c.permissionOverwrites.get(role.id)
let cekilecek = { id: c.id, allow: kanalperm.allow.toArray(), deny: kanalperm.deny.toArray() }
  rolkanalperm.push(cekilecek)
})
  await db.set(`Rkanalizin.${role.id}`, rolkanalperm)
})
client.channels.cache.get("877831531111010334").send(`Rol veritabanı güncellendi! [${time}] | ${moment(time).format("D")} ${aylar[moment(time).format("MM")]}, ${moment(time).format("HH:mm:ss")}`)
console.log(`Rol veritabanı güncellendi! [${time}] | ${moment(time).format("D")} ${aylar[moment(time).format("MM")]}, ${moment(time).format("HH:mm:ss")}`)
};

//  //  //  //  //  //  //
//   GUARD 1 SETTINGS   // ❯ Yukarısı
//  //  //  //  //  //  //

client.on("roleDelete", (role) => {
console.log(`${role.name} => ${role.id} rolü silindi!`)
})

client.login(ayarlar.token).then(c => console.log(`${client.user.username} başarıyla yüklendi!`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));