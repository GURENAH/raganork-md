/* Copyright (C) 2022 Sourav KL11.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Raganork MD - Sourav KL11
*/
const {
    getString
} = require('./misc/lang');
const {
      saveMessage
  } = require('./misc/saveMessage');
const Lang = getString('group');
const {
    isAdmin,
    isNumeric,
    mentionjid
} = require('./misc/misc');
const {
    Module
} = require('../main')
Module({
    pattern: 'kick ?(.*)',
    fromMe: true,
    desc: Lang.KICK_DESC,
    use: 'group'
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var {
        participants, subject
    } = await message.client.groupMetadata(message.jid)
    if (match[1]) {
        if (match[1] === 'all') {
            var admin = await isAdmin(message);
            if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
            let users = participants.filter((member) => !member.admin)
            await message.send(`_❗❗ Kicking *every* members of ${subject}. Restart bot immediately to kill this process ❗❗_\n*You have 5 seconds left*`)
            await new Promise((r) => setTimeout(r, 5000))
            for (let member of users) {
                await new Promise((r) => setTimeout(r, 1000))
                await message.client.groupParticipantsUpdate(message.jid, [member.id], "remove")
            }
            return;
        }
        if (isNumeric(match[1])) {
            var admin = await isAdmin(message);
            if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
            let users = participants.filter((member) => member.id.startsWith(match[1]) && !member.admin)
            await message.send(`_❗❗ Kicking *${users.length}* members starting with number *${match[1]}*. Restart bot immediately to kill this process ❗❗_\n*You have 5 seconds left*`)
            await new Promise((r) => setTimeout(r, 5000))
            for (let member of users) {
                await new Promise((r) => setTimeout(r, 1000))
                await message.client.groupParticipantsUpdate(message.jid, [member.id], "remove")
            }
            return;
        }
    }
    const user = message.mention[0] || message.reply_message.jid
    if (!user) return await message.sendReply(Lang.NEED_USER)
    var admin = await isAdmin(message);
    if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
    await message.client.sendMessage(message.jid, {
        text: mentionjid(user) + Lang.KICKED,
        mentions: [user]
    })
    await message.client.groupParticipantsUpdate(message.jid, [user], "remove")
}))
Module({
    pattern: 'add ?(.*)',
    fromMe: true,
    desc: Lang.ADD_DESC,
    use: 'group'
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var init = match[1] || message.reply_message.jid.split("@")[0]
    if (!init) return await message.sendReply(Lang.NEED_USER)
    var admin = await isAdmin(message);
    if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
    var initt = init.split(" ").join("")
    var user = initt.replace(/\+/g, '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(/\(/g, '').replace(/\)/g, '').replace(/-/g, '')
    await message.client.groupAdd(user,message)
}))
Module({
    pattern: 'promote ?(.*)',
    
    
    fromMe: true,
    use: 'group',
    desc: Lang.PROMOTE_DESC
}, (async (message, match) => {
    const user = message.mention[0] || message.reply_message.jid
    if (!user) return await message.sendReply(Lang.NEED_USER)
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var admin = await isAdmin(message);
    if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
    await message.client.sendMessage(message.jid, {
        text: mentionjid(user) + Lang.PROMOTED,
        mentions: [user]
    })
    await message.client.groupParticipantsUpdate(message.jid, [user], "promote")
}))
Module({
    pattern: 'leave',
    fromMe: true,
    desc: Lang.LEAVE_DESC
}, (async (message, match) => {
    
    return await message.client.groupLeave(message.jid);
}))
Module({
    pattern: 'quoted',
    fromMe: true,
    desc:"Sends replied message's replied message. Useful for recovering deleted messages."
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    try {
    var msg = (await message.client.getMessages(message.jid)).filter(e=>e.key.id===message.reply_message.id)
    var quoted = msg[0].message[Object.keys(msg[0].message)].contextInfo;
    var obj = {
        key: {
          remoteJid: message.jid,
          fromMe: quoted.participant===message.myjid+"@s.whatsapp.net",
          id: quoted.stanzaId,
          participant: quoted.participant
        },
        message: quoted.quotedMessage
      }
    return await message.forwardMessage(message.jid,obj);
    } catch { return await message.sendReply("_Failed to load message!_") }
})) /*
=============== WORK IN PROGRESS ================
Module({
    pattern: 'msgs ?(.*)',
    fromMe: true,
    desc:"Shows number of messages sent by each member. (Only from when bot was set up)"
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var user = message.mention[0];
    try {
    if (user) {
    var msg = (await message.client.getMessages(message.jid)).filter(e=>e.key.participant===user);
    return await message.client.sendMessage(message.jid,{text:`_@${user.split("@")[0]} has ${msg.length} messages._`,mentions:[user]})
    } else {
    var msg = (await message.client.getMessages(message.jid))   
    }
    } catch { return await message.sendReply("_Failed to count messages!_") }
}))
*/
Module({
    pattern: 'demote ?(.*)',
    fromMe: true,
    use: 'group',
    desc: Lang.DEMOTE_DESC
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    const user = message.mention[0] || message.reply_message.jid
    if (!user) return await message.sendReply(Lang.NEED_USER)
    var admin = await isAdmin(message);
    if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
    await message.client.sendMessage(message.jid, {
        text: mentionjid(user) + Lang.DEMOTED,
        mentions: [user]
    })
    await message.client.groupParticipantsUpdate(message.jid, [message.reply_message.jid], "demote")
}))
Module({
    pattern: 'mute',
    use: 'group',
    fromMe: true,
    desc: Lang.MUTE_DESC,
    usage:'mute 1h\nmute 5m'
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var admin = await isAdmin(message);
    if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
    if (match[1]){
    const h2m = function(h){console.log(1000*60*60*h)}
    const m2m = function(m){console.log(1000*60*m)}
    let duration = match[1].endsWith("h") ? h2m(match[1].match(/\d+/)[0]) : m2m(match[1].match(/\d+/)[0])
    match = match[1].endsWith("h") ? match[1]+'ours' : match[1]+'ins'
    await message.client.groupSettingUpdate(message.jid, 'announcement')
    await message.send(`_Muted for ${match}_`)
    await require("timers/promises").setTimeout(duration);
    return await message.client.groupSettingUpdate(message.jid, 'not_announcement')
    await message.send(Lang.UNMUTED)    
}
    await message.client.groupSettingUpdate(message.jid, 'announcement')
    await message.send(Lang.MUTED)
}))
Module({
    pattern: 'unmute',
    use: 'group',
    fromMe: true,
    desc: Lang.UNMUTE_DESC
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var admin = await isAdmin(message);
    if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
    await message.client.groupSettingUpdate(message.jid, 'not_announcement')
    await message.send(Lang.UNMUTED)
}))
Module({
    pattern: 'jid',
    use: 'group',
    fromMe: true,
    desc: Lang.JID_DESC
}, (async (message, match) => {
    var jid = message.reply_message.jid || message.jid
    await message.sendReply(jid)
}))
Module({
    pattern: 'invite',
    fromMe: true,
    use: 'group',
    desc: Lang.INVITE_DESC
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var admin = await isAdmin(message);
    if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
    var code = await message.client.groupInviteCode(message.jid)
    await message.client.sendMessage(message.jid, {
        text: "https://chat.whatsapp.com/" + code,detectLinks: true
    },{detectLinks: true})
}))
Module({
    pattern: 'revoke',
    fromMe: true,
    use: 'group',
    desc: Lang.REVOKE_DESC
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var admin = await isAdmin(message);
    if (!admin) return await message.sendReply(Lang.NOT_ADMIN)
    await message.client.groupRevokeInvite(message.jid)
    await message.send(Lang.REVOKED)
}))
Module({
    pattern: 'common ?(.*)',
    fromMe: true,
    use: 'group',
    desc: "Get common participants in two groups, and kick using .common kick jid"
}, (async (message, match) => {
if (!match[1]) return await message.sendReply("*Need jids*\n*.common jid1,jid2*\n _OR_ \n*.common kick group_jid*")
if (match[1].includes("kick")) {
var co = match[1].split(" ")[1]
var g1 = (await message.client.groupMetadata(co))
var g2 = (await message.client.groupMetadata(message.jid)) 
var common = g1.participants.filter(({ id: id1 }) => g2.participants.some(({ id: id2 }) => id2 === id1));
var jids = [];
var msg = `Kicking common participants of:* ${g1.subject} & ${g2.subject} \n_count: ${common.length} \n`
common.map(async s => {
msg += "```@"+s.id.split("@")[0]+"```\n"
jids.push(s.id.split("@")[0]+"@s.whatsapp.net")
})    
await message.client.sendMessage(message.jid, {
        text: msg,
        mentions: jids
    })
for (let user of jids){
await new Promise((r) => setTimeout(r, 1000))
await message.client.groupParticipantsUpdate(message.jid, [user], "remove")
}
return;
}
var co = match[1].split(",")
var g1 = (await message.client.groupMetadata(co[0]))
var g2 = (await message.client.groupMetadata(co[1])) 
var common = g1.participants.filter(({ id: id1 }) => g2.participants.some(({ id: id2 }) => id2 === id1));
var msg = `*Common participants of:* ${g1.subject} & ${g2.subject}\n_count: ${common.length}_ \n`
var jids = [];
common.map(async s => {
msg += "```@"+s.id.split("@")[0]+"```\n"
jids.push(s.id.split("@")[0]+"@s.whatsapp.net")
})    
await message.client.sendMessage(message.jid, {
        text: msg,
        mentions: jids
    })
}));
Module({
    pattern: 'diff ?(.*)',
    fromMe: true,
    use: 'utility',
    desc: "Get difference of participants in two groups"
}, (async (message, match) => {
if (!match[1]) return await message.sendReply("*Need jids*\n*.diff jid1,jid2*")
var co = match[1].split(",")
var g1 = (await message.client.groupMetadata(co[0])).participants
var g2 = (await message.client.groupMetadata(co[1])).participants 
var common = g1.filter(({ id: jid1 }) => !g2.some(({ id: jid2 }) => jid2 === jid1));
var msg = "*Difference of participants*\n_count: "+common.length+"_ \n"
common.map(async s => {
msg += "```"+s.id.split("@")[0]+"``` \n"
})    
return await message.sendReply(msg)
}));
Module({
    pattern: 'tagall',
    fromMe: true,
    desc: Lang.TAGALL_DESC,
    use: 'group'
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    var {participants} = await message.client.groupMetadata(message.jid)
    var jids = [];
    var mn = '';
    for (var i in participants){
    mn += (parseInt(i)+1)+'. @' + participants[i].id.split('@')[0] + '\n';
        jids.push(participants[i].id.replace('c.us', 's.whatsapp.net'));
    };
    var msg = mn
    await message.client.sendMessage(message.jid, {
        text: '```'+msg+'```',
        mentions: jids
    })
}))
Module({
    pattern: 'tagadmin',
    fromMe: true,
    desc: Lang.TAGALL_DESC,
    dontAddCommandList: true,
    use: 'group'
}, (async (message, match) => {
    if (!message.isGroup) return await message.sendReply(Lang.GROUP_COMMAND)
    if (message.reply_message) return;
    var group = await message.client.groupMetadata(message.jid)
    var jids = [];
    var mn = '';
    var admins = group.participants.filter(v => v.admin !== null).map(x => x.id);
    admins.map(async (user) => {
        mn += '@' + user.split('@')[0] + '\n';
        jids.push(user.replace('c.us', 's.whatsapp.net'));
    });
    var msg = mn
    await message.client.sendMessage(message.jid, {
        text: msg,
        mentions: jids
    })
}))
Module({
    pattern: 'block ?(.*)',
    fromMe: true,
    use: 'owner'
}, (async (message, match) => {
    var isGroup = message.jid.endsWith('@g.us')
    var user = message.jid
    if (isGroup) user = message.mention[0] || message.reply_message.jid
    await message.client.updateBlockStatus(user, "block");
}));
Module({
    pattern: 'join ?(.*)',
    fromMe: true,
    use: 'owner'
}, (async (message, match) => {
    var rgx = /^(https?:\/\/)?chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]{22})$/
    if (!match[1] || !rgx.test(match[1])) return await message.sendReply("*Need group link*");
    await message.client.groupAcceptInvite(match[1].split("/")[3])
}));
Module({
    pattern: 'unblock ?(.*)',
    fromMe: true,
    use: 'owner'
}, (async (message) => {
    var isGroup = message.jid.endsWith('@g.us')
    if (!isGroup) return;
    var user = message.mention[0] || message.reply_message.jid
    await message.client.updateBlockStatus(user, "unblock");
}));
Module({
    pattern: 'pp ?(.*)',
    fromMe: true,
    use: 'owner',
    desc: "Change/Get profile picture (full screen supported) with replied message"
}, (async (message, match) => {
    if (message.reply_message && message.reply_message.image) {
    var image = await message.reply_message.download()
    await message.client.updateProfilePicture(message.client.user.id.split(":")[0]+"@s.whatsapp.net",{url: image});
    return await message.sendReply("*Updated profile pic ✅*")
}
if (message.reply_message && !message.reply_message.image) {
   try { var image = await message.client.profilePictureUrl(message.reply_message.jid,'image') } catch {return await message.sendReply("Profile pic not found!")}
   return await message.sendReply({url:image},"image")
}
}));
Module({
    pattern: 'gpp ?(.*)',
    fromMe: true,
    use: 'owner',
    desc: "Change/Get group icon (full screen supported) with replied message"
}, (async (message, match) => {
    if (message.reply_message && message.reply_message.image) {
    var image = await message.reply_message.download()
    await message.client.updateProfilePicture(message.jid,{url: image});
    return await message.sendReply("*Group icon updated ✅*")
}
if (!message.reply_message.image) {
   try { var image = await message.client.profilePictureUrl(message.jid,'image') } catch {return await message.sendReply("Profile pic not found!")}
   return await message.sendReply({url:image},"image")
// Set Name Group
      case "setname":
        if (!mek.key.fromMe && !isGroupAdmins) return reply("Admin Group Only");
        if (!isBotGroupAdmins) return reply("Bot not admin");
        if (!isGroup) return;
        xeon.groupUpdateSubject(from, `${args.join(" ")}`);
        xeon.sendMessage(from, "Succes change name group", text, {
          quoted: mek,
        });
}
}));
