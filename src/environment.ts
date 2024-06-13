import * as dotenv from "dotenv";
import { parse } from 'yaml'
import * as fs from 'fs';
dotenv.config();

let apiUrl = process.env.DOCKER_API_URL;
if (!apiUrl) {
    apiUrl = "http://host.docker.internal:3000/";
}
if (!apiUrl.endsWith("/")) {
    apiUrl += "/";
}

const DockerApiUrl = apiUrl;
const DiscordToken = process.env.DISCORD_BOT_TOKEN
const DiscordPrefix = process.env.DISCORD_PREFIX ?? ""
const DockerProfiles = new Map<string, DiscordDockerCommands>();
const WaitAttempts = (Number(process.env.WAIT_TIME ?? "60") / 5);

class DiscordDockerCommands {
    DiscordCommand: string = ""
    DockerProfile: string = ""
    ServerIds: string[] = []
    UserIds: string[] = []
    IsServerCommand: boolean
    IsUserCommand: boolean
    StartedMessage: string
    StoppedMessage: string
}

let yamlProfilePath = process.env.DISCORD_YAML_PROFILE_PATH ?? "";
if (!yamlProfilePath) {
    yamlProfilePath = "./profiles.yml";
}
let yamlText = fs.readFileSync(yamlProfilePath, 'utf8');
const yamlValue = parse(yamlText);

Object.keys(yamlValue).forEach(profile => {
    let profileDetails = yamlValue[profile];
    DockerProfiles.set(profileDetails.discord_command, {
        DiscordCommand: profileDetails.discord_command,
        DockerProfile: profileDetails.docker_profile,
        ServerIds: profileDetails.server_ids ? profileDetails.server_ids : [],
        UserIds: profileDetails.user_ids ? profileDetails.user_ids : [],
        IsServerCommand: profileDetails.server_ids ? true : false,
        IsUserCommand: profileDetails.user_ids ? true : false,
        StartedMessage: profileDetails.started_message,
        StoppedMessage: profileDetails.stopped_message
    });
});

export {
    DockerApiUrl,
    DiscordToken,
    DiscordPrefix,
    DockerProfiles,
    WaitAttempts
}