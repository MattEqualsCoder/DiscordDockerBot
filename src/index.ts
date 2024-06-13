import { DiscordToken, DiscordPrefix, DockerProfiles } from './environment';
import { Client, GatewayIntentBits, Partials, Events, MessageMentions, Message } from 'discord.js';
import { DockerApi } from './docker-api';
import { logger } from './logger';

const docker = new DockerApi();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Message,
        Partials.Channel
    ]
});
  
client.once(Events.ClientReady, readyClient => {
    logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, message => {
    if (!message.content.startsWith(DiscordPrefix)) {
        return;
    }

    var messageParts = message.content.substring(1).split(" ");
    if (messageParts.length < 2) {
        return;
    }

    let command = DockerProfiles.get(messageParts[0]);
    if (!command) {
        return;
    }

    if ((message.guildId && command.ServerIds.includes(message.guildId)) || command.UserIds.includes(message.author.id)) {
        let commandString = messageParts[1].trim().toLowerCase();
        if (commandString === "start") {
            docker.StartProfile(command.DockerProfile, (isSuccessful) => {

                if (isSuccessful) {
                    let response = command.StartedMessage ? command.StartedMessage : "Docker image started successfully"; 
                    Reply(message, response);
                } else {
                    ReplyError(message);
                }
                
            });
        } else if (commandString === "stop") {
            
            docker.StopProfile(command.DockerProfile, (isSuccessful) => {

                if (isSuccessful) {
                    let response = command.StoppedMessage ? command.StoppedMessage : "Docker image stopped successfully";
                    Reply(message, response);
                } else {
                    ReplyError(message);
                }
                
            });
        } else if (commandString === "restart") {
            docker.StopProfile(command.DockerProfile, (isSuccessful) => {
                docker.StartProfile(command.DockerProfile, (isSuccessful) => {
                    message.reply({
                        content: "Restarted",
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                });
            });
        }
    } else {
        logger.warn(`User ${message.author.displayName} attempted to execute command ${message.content} without proper authorization`);
        ReplyError(message);
    }
});

function Reply(originalMessage : Message<boolean>, response : string) {
    originalMessage.reply({
        content: response,
        allowedMentions: {
            repliedUser: false
        }
    });
}

function ReplyError(originalMessage : Message<boolean>) {
    originalMessage.reply({
        content: "Sorry, I wasn't able to do that for you.",
        allowedMentions: {
            repliedUser: false
        }
    });
}

client.login(DiscordToken);