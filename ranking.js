const config = require("./config.json");
const canvacord = require("canvacord");
const Discord = require("discord.js");
const prefix = config.PREFIX;
const embedcolor = config.embedcolor;
const maximum_leaderboard = config.maximum_leaderboard; 

module.exports = function (client) {
    const description = {
        name: "RANKING",
        filename: "ranking.js",
        version: "2.0"
    }

    client.on("message", async (message) => {

        if (message.author.bot || !message.guild) return;
        const key = `${message.guild.id}-${message.author.id}`;

        function databasing(rankuser) {
            client.points.ensure(rankuser ? `${message.guild.id}-${rankuser.id}` : `${message.guild.id}-${message.author.id}`, {
                user: rankuser ? rankuser.id : message.author.id,
                usertag: rankuser ? rankuser.tag : message.author.tag,
                xpcounter: 1,
                guild: message.guild.id,
                points: 0,
                neededpoints: 400,
                level: 1,
                oldmessage: "",
            });
            client.points.set(rankuser ? `${message.guild.id}-${rankuser.id}` : `${message.guild.id}-${message.author.id}`, rankuser ? rankuser.tag : message.author.tag, `usertag`); 
            client.points.set(message.guild.id, 1, `setglobalxpcounter`); 
    }
        databasing();

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (message.content.startsWith(prefix)) {

            switch (command) {
                case `level`:
                    rank(message.mentions.users.first()||message.author);
                    break;
                    /////////////////////////////////
                case `leaderboard`:
                case `lb`:
                    leaderboard();
                    break;
                    /////////////////////////////////
       
                case `setpoints`:
                    if (!message.member.hasPermission("ADMINISTRATOR") || !message.member.hasPermission("MANAGE_GUILD")) return message.reply("You are not allowed to run this cmd!")

                    setpoints();
                    break;

                case `levelhelp`:
                case `rankinghelp`:
                case `levelinghelp`:
                case `rankhelp`:
                    break;
            }
            return;
        }


        function anti_double_messages() {
            const oldmessage = client.points.get(key, `oldmessage`);
            if (oldmessage.toLowerCase() === message.content.toLowerCase().replace(/\s+/g, '')) {
                return console.log("DOUPLICATED MESSAGE, no ranking points sorry!");
            }
            client.points.set(key, message.content.toLowerCase().replace(/\s+/g, ''), `oldmessage`); 
        }
        anti_double_messages();

        function Giving_Ranking_Points(thekey, maxnumber) {
            let setglobalxpcounter = client.points.get(message.guild.id, "setglobalxpcounter")
            if (!maxnumber) maxnumber = 5;
            var randomnum = ( Math.floor(Math.random() * Number(maxnumber)) + 1 ) * setglobalxpcounter;
            randomnum *= Number(client.points.get(key, `xpcounter`));
            randomnum = Number(Math.floor(randomnum));

            const curPoints = client.points.get(thekey ? thekey : key, `points`);
            const neededPoints = client.points.get(thekey ? thekey : key, `neededpoints`);
            let leftpoints = neededPoints - curPoints;

            let toaddpoints = randomnum;
            addingpoints(toaddpoints, leftpoints);

            function addingpoints(toaddpoints, leftpoints) {
                if (toaddpoints >= leftpoints) {
                    client.points.set(thekey ? thekey : key, 0, `points`); 
                    client.points.inc(thekey ? thekey : key, `level`); 
                    const newLevel = client.points.get(thekey ? thekey : key, `level`);
  
                    if (newLevel % 4 === 0) client.points.math(thekey ? thekey : key, `+`, 100, `neededpoints`)

                    const newneededPoints = client.points.get(thekey ? thekey : key, `neededpoints`); 
                    const newPoints = client.points.get(thekey ? thekey : key, `points`); 

                    addingpoints(toaddpoints - leftpoints, newneededPoints); 
                    LEVELUP() 
                } else {
                    client.points.math(thekey ? thekey : key, `+`, Number(toaddpoints), `points`)
                }
            }
        }
        Giving_Ranking_Points();

        const curLevel = client.points.get(key, `level`);
        const curPoints = client.points.get(key, `points`);
        const neededPoints = client.points.get(key, `neededpoints`);


 
function rank(the_rankuser) {
                      
            try {
                let rankuser = the_rankuser ? the_rankuser : message.mentions.users.first() ? message.mentions.users.first() : args[0] ? args[0].length == 18 ? message.guild.members.cache.get(args[0]).user : message.guild.members.cache.find(u => u.user.username.toLowerCase().includes(String(args[0]).toLowerCase())).user : message.author
                if (!rankuser) return message.reply("PLEASE ADD A RANKUSER!");

                const key = `${message.guild.id}-${rankuser.id}`;
                databasing(rankuser);
                const filtered = client.points.filter(p => p.guild === message.guild.id).array();
                const sorted = filtered.sort((a, b) => b.level - a.level || b.points - a.points);
                const top10 = sorted.splice(0, message.guild.memberCount);
                let i = 0;
                for (const data of top10) {
                    try {
                        i++;
                        if (data.user === rankuser.id) break; 
                    } catch {
                        i = `Error counting Rank`;
                        break;
                    }
                }
                let curpoints = Number(client.points.get(key, `points`).toFixed(2));
                let curnextlevel = Number(client.points.get(key, `neededpoints`).toFixed(2));
                if (client.points.get(key, `level`) === undefined) i = `No Rank`;
                const rank = new canvacord.Rank()
                    .setAvatar(rankuser.displayAvatarURL({
                        dynamic: false,
                        format: 'png'
                    }))
                    .setBackground("IMAGE", "https://cdn.discordapp.com/attachments/868321773060509706/868740729105690624/RankCard_2_1.png")
                    .setCurrentXP(Number(curpoints.toFixed(2)), embedcolor)
                    .setRequiredXP(Number(curnextlevel.toFixed(2)), embedcolor)
                    .setStatus("online", true, 5)
                    .renderEmojis(true)
                    .setProgressBar("#118fff")
                    .setRankColor(embedcolor, "COLOR")
                    .setLevelColor(embedcolor, "COLOR")
                    .setUsername(rankuser.username, "WHITE")
                    .setLevel(Number(client.points.get(key, `level`)), "Level", true)
                    .setDiscriminator(rankuser.discriminator, embedcolor);
                rank.build()
                    .then(data => {
                        const attachment = new Discord.MessageAttachment(data, "attachment://RankCard.png");
                        const embed = new Discord.MessageEmbed()
                        .setTitle(`Ranking of:  ${rankuser.username}`)
                        .setColor(embedcolor)
                        .setImage("attachment://RankCard.png")
                        .attachFiles(attachment)
                        message.channel.send(embed);
                        return;
                    })
            } catch (error) {
                console.log(error)
                message.reply("PLEASE ADD A RANKUSER!");
            }
        }

                function leaderboardembed() {
            const filtered = client.points.filter(p => p.guild === message.guild.id).array();
            let orilent;
            const sorted = filtered.sort((a, b) => b.level - a.level || b.points - a.points);
            let embeds = [];
            let j = 0;
            let maxnum = 50;
            orilent = sorted.length;
            if(isNaN(maxnum)) {
                console.log("maximum_leaderboard NOT A NUMBER")
                maxnum = 50;}
            if (maxnum > sorted.length)
                maxnum = sorted.length + (10 - Number(String(sorted.length/10).slice(2)));
            if(maxnum < 10) maxnum = 10;
            for (let i = 10; i <= maxnum; i += 10) {
                const top = sorted.splice(0, 5);
                const embed = new Discord.MessageEmbed()
                    .setTitle(`${message.guild.name}\ | Leaderboard`)
                    .setColor(embedcolor);
                for (const data of top) {
                    j++;
                    try {
                        embed.addField(`**${j}**. ${data.usertag}`, `**Points:** \`${data.points.toFixed()}\` / \`${data.neededpoints}\` | **Level:** \`${data.level}\``);
                    } catch {
                        embed.addField(`**${j}**. \`${data.usertag}\``, `**Points:** \`${data.points.toFixed()}\` / \`${data.neededpoints}\` | **Level:** \`${data.level}\``);
                    }
                }
                embeds.push(embed);
            }
            return embeds;
        }
        async function leaderboard() {
          let currentPage = 0;
            const embeds = leaderboardembed();
            if(embeds.length == 1){
                return message.channel.send(embeds[0])
            }
            const lbembed = await message.channel.send(
                ``,
                embeds[currentPage]
            );

            try {
                await lbembed.react("<a:785628232372191274:864764660162232360>");
                await lbembed.react("<a:670029560015880252:864764653573898251>");
                await lbembed.react("<a:680564941794574372:864764658397610034>");
            } catch (error) {
                console.error(error);
            }

            const filter = (reaction, user) => ["", "", ""].includes(reaction.emoji.name) && message.author.id === user.id;
            const collector = lbembed.createReactionCollector(filter, {
                time: 60000
            });

            collector.on("collect", async (reaction, user) => {
                try {
                    if (reaction.emoji.name === "") {
                        if (currentPage < embeds.length - 1) {
                            currentPage++;
                            lbembed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                    } else if (reaction.emoji.name === "") {
                        if (currentPage !== 0) {
                            --currentPage;
                            lbembed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                    } else {
                        collector.stop();
                        reaction.message.reactions.removeAll();
                    }
                    await reaction.users.remove(message.author.id);
                } catch (error) {
                    console.error(error);
                }
            });
        }
       

        function setpoints() {
            try {

                if (!args[0]) return message.reply("Usage: `<user> <amount of points>`");
                let rankuser = message.mentions.users.first();
                if (!rankuser) return message.reply("**Usage: `<user> <amount of points>`");

                const key = `${message.guild.id}-${rankuser.id}`;
                databasing(rankuser);

                let toaddpoints = Number(args[1]);
                if (!args[1]) return message.reply("**Usage: `<user> <amount of points>`");
                if (Number(args[1]) < 0) args[1] = 0;
                const neededPoints = client.points.get(key, `neededpoints`);
                addingpoints(toaddpoints, neededPoints);

                function addingpoints(toaddpoints, neededPoints) {
                    if (toaddpoints >= neededPoints) {
                        client.points.set(key, 0, `points`); 
                        client.points.inc(key, `level`); 
                        const newLevel = client.points.get(key, `level`); //get current NEW level
                        if (newLevel % 4 === 0) client.points.math(key, `+`, 100, `neededpoints`)

                        const newneededPoints = client.points.get(key, `neededpoints`); //get NEW needed Points
                        const newPoints = client.points.get(key, `points`); 
                        const embed = new Discord.MessageEmbed()
                            .setAuthor(`Ranking of:  ${rankuser.tag}`, rankuser.displayAvatarURL({
                                dynamic: true
                            }))
                            .setDescription(`You've leveled up to Level: **\`${newLevel}\`**! (Points: \`${newPoints}\` / \`${newneededPoints}\`) `)
                            .setColor(embedcolor);
                        message.channel.send(rankuser, embed);

                        addingpoints(toaddpoints - neededPoints, newneededPoints); 
                    } else {
                        client.points.set(key, Number(toaddpoints), `points`)
                    }
                }

                const embed = new Discord.MessageEmbed()
                    .setColor(embedcolor)
                    .setDescription(`Successfully set \`${toaddpoints} Points\` to: \`${rankuser.tag}\``)
                message.channel.send(embed);
                rank(rankuser); 
            } catch (error) {
                console.log(error.stack)
                message.reply("**Usage: `<user> <amount of points>`");
            }
        }


    })
}
