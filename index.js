const express = require("express")
const app = express()

app.get("/", (req, res) => {
 res.send("hello hell!")
})

app.listen(3000, () => {
 console.log("Whatever you want to put here")
})

const Discord = require("discord.js");
const colors = require("colors")
const client = new Discord.Client({
  presence: {
    status: "dnd",
    activity: {
      name: "!help",
      type: "STREAMING",
      url: "https://www.twitch.tv/POLAR_CEO"
    }
  }
});
client.login(process.env.TOKEN);
const config = require("./config.json");   
const Enmap = require("enmap")                
const canvacord = require("canvacord")     
client.points = new Enmap({ name: "points" }); 
client.on("ready", ()=>console.log("MADE BY POLAR-CEO"));
const ranking = require("./ranking");     
ranking(client);             

client.login(process.env.TOKEN);
