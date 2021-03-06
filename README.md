# Discord-RPC
A discord rich presence, fully customisable.<br>Includes detail, state, assets, buttons and timestamps. Uses electron as a rich presence manager.

### Table of Contents
**[Requirements](#requirements)**<br>
**[Usage Instructions](#usage-instructions)**<br>
**[Configuration Example](#discord-rich-presence-example)**<br>
**[Errors](#common-errors)**

## Requirements
 - [NodeJS](https://nodejs.org/en/download/)
 - [Discord Developer Application](https://discord.com/developers/applications)

## Usage Instructions
1. Download and install [NodeJS](https://nodejs.org/en/download/).

2. Download the [zip](https://github.com/Elo-Man/Discord-RPC/archive/refs/heads/main.zip).

3. Run `npm i` from inside of the directory to install all of the node_module required packages for the project.

4. Open the `config.json.example` file, modify the contents, and then save it as `config.json`

5. Run the shell file `./DiscordRPC` or run `npm run rpc`

## Discord Rich Presence Example

### `config.json`
```json
{
    "clientId": "765494652698099713",
    "rich_presence": {
        "details": "Among us is the best game",
        "state": "When the imposter is sus",
        "assets": {
            "largeImageText": "This may be an AMOGUS reference",
            "largeImageKey": "amogus",
            "smallImageText": "Sussy",
            "smallImageKey": "sus-face"
        },
        "buttons": {
            "primary": {
                "buttonLabelText": "Rick roll",
                "buttonRedirectUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            },
            "secondary": {
                "buttonLabelText": "Get this on GitHub",
                "buttonRedirectUrl": "https://github.com/Elo-Man/Discord-RPC"
            }
        },
        "timestamps": {
            "startTimestamp": "0hr",
            "useTimer": true
        }
    }
}
```
## Common Errors
If you receive the `RPC_CONNECTION_TIMEOUT` error, please refresh Discord with `CTRL` + `R`, then try again.<br>
All errors covered in `index.js` include character lengths and proper formatting.
