const { Client } = require('discord-rpc'); // Discord RPC
const client = new Client({ transport: 'ipc' }); // RPC Client
const config = require('../config.json'); // Configuration File
const RPConfig = config.rich_presence; // Rich Presence Config

const chalk = require('chalk'); // Chalk, adds colours
const SUCCESS = chalk.hex('#4BB543');
const ERR = chalk.hex('#FF3333');
const DATE = chalk.hex('#6a0dad');
const PROCESS = chalk.hex('#e5b551');
const LOG = chalk.hex('#44DDBF');

const { app, BrowserWindow } = require("electron"); // Using the electron app
const path = require("path"); // Path index.html
const url = require("url"); // Load URL
const ElectronConfig = config.ElectronWindow; // Electron Window Config
const moment = require("moment");
const parse = require("parse-duration")
var mainWindow; // Electron window

let start = new Date(); // Record when code starts

let ExitStatus = 0; // Exit Status (0, 1)

async function progbar(fillChar, emptyChar, charNum, speed) {
    for (let i = 0; i <= charNum; i++) {
        const filled = fillChar.repeat(i);
        const left = charNum - i
        const empty = emptyChar.repeat(left);
        var percent = (100*i/charNum).toFixed(0);
        let linebreak = (percent == 100) ? "\n" : ""
        process.stdout.write(`\r[${filled}${empty}] ${percent}%${linebreak}`);
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

// Create window and it's size/look
function createWindow() {
    var widthsize = ElectronConfig.width;
    var heightsize = ElectronConfig.height;
    mainWindow = new BrowserWindow({
    backgroundColor: ElectronConfig.backgroundColor,
    width: widthsize,
    height: heightsize,
    resizable: ElectronConfig.resizeable,
    titleBarStyle: ElectronConfig.titleBar,
    hasShadow: ElectronConfig.shadow,
    frame: ElectronConfig.frame,
    show: ElectronConfig.show
  });
  mainWindow.on("ready-to-show", function() {mainWindow.show()});
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  mainWindow.on("closed", function() {mainWindow = null});
}

app.on("ready", createWindow);
app.on("window-all-closed", function() {app.quit()});
app.on("activate", function() {(mainWindow = null) && createWindow()});

// [LOG] [dd/mm/yyyy | hh:mm:ss UTC]
let oldConsoleLog = console.log;
console.log = function () {
    let date = new Date();
    arr = [];
    arr.push(`${LOG(`[LOG]`)} ${DATE(`[${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} | ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')} UTC]`)}`);
    for (let i = 0; i < arguments.length; i++) arr.push(arguments[i]);
    oldConsoleLog.apply(console, arr);
}
let oldConsoleErr = console.error;
console.error = function () {
    let date = new Date();
    arr = [];
    arr.push(`${ERR(`[ERROR]`)} ${DATE(`[${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} | ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')} UTC]`)}`);
    for (let i = 0; i < arguments.length; i++) arr.push(arguments[i]);
    oldConsoleErr.apply(console, arr);
}

// Ensure the user's config meets all the requirements
function validConfig() {
    console.log(PROCESS(`Validating code and configurations...`));
    let httpRegExp = new RegExp('^(http|https)://');
    const maxCharReq = "provided exceeds the maximum character length of";
    const minCharReq = "provided does not meet the minimum character length of";
    (RPConfig.details && RPConfig.details.length > 128) ? ExitStatus = 1&&console.error(ERR(`Details ${maxCharReq} 128.`)) : (RPConfig.details && RPConfig.details.length < 2) ? ExitStatus = 1&&console.error(ERR(`Details ${minCharReq} 2.`)) : ExitStatus = 0;
    (RPConfig.state && RPConfig.state.length > 128) ? ExitStatus = 1&&console.error(ERR(`State ${maxCharReq} 128.`)) : (RPConfig.state && RPConfig.state.length < 2) ? ExitStatus = 1&&console.error(ERR(`State ${minCharReq} 2.`)) : ExitStatus = 0;
    (RPConfig.assets.largeImageText && RPConfig.assets.largeImageText.length > 32) ? ExitStatus = 1&&console.error(ERR(`LargeImageText ${maxCharReq} 32.`)) : (RPConfig.assets.largeImageText && RPConfig.assets.largeImageText.length < 2) ? ExitStatus = 1&&console.error(ERR(`LargeImageText ${minCharReq} 2.`)) : ExitStatus = 0;
    (RPConfig.assets.smallImageText && RPConfig.assets.smallImageText.length > 32) ? ExitStatus = 1&&console.error(ERR(`SmallImageText ${maxCharReq} 32.`)) : (RPConfig.assets.smallImageText && RPConfig.assets.smallImageText.length < 2) ? ExitStatus = 1&&console.error(ERR(`SmallImageText ${minCharReq} 2.`)) : ExitStatus = 0;
    (!RPConfig.buttons.primary.buttonLabelText || !RPConfig.buttons.secondary.buttonLabelText) ? ExitStatus = 1&&console.error(ERR(`ButtonLabelText(s) ${minCharReq} 1.`)) : (RPConfig.buttons.primary.buttonLabelText.length > 128 || RPConfig.buttons.secondary.buttonLabelText.length > 128) ? ExitStatus = 1&&console.error(ERR(`ButtonLabelText(s) ${maxCharReq} 128.`)) : ExitStatus = 0;
    (!httpRegExp.test(RPConfig.buttons.primary.buttonRedirectUrl.toString())) ? ExitStatus = 1&&console.error(ERR(`ButtonRedirectUrl(s) provided does not contain either "http://" OR "https://".`)) : ExitStatus = 0;
    (!httpRegExp.test(RPConfig.buttons.primary.buttonRedirectUrl.toString())) ? ExitStatus = 1&&console.error(ERR(`ButtonRedirectUrl(s) provided does not contain either "http://" OR "https://".`)) : ExitStatus = 0;
}

function setPresence() {
    if (!client || !mainWindow) {console.error(ERR("Main window or client is missing"));process.kill(process.pid)};
    client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: {
            details: RPConfig.details ? RPConfig.details : undefined,
            state: RPConfig.state ? RPConfig.state : undefined,
            assets: {
                large_text: RPConfig.assets.largeImageText ? RPConfig.assets.largeImageText : undefined,
                large_image: RPConfig.assets.largeImageKey ? RPConfig.assets.largeImageKey : undefined,
                small_text: RPConfig.assets.smallImageText ? RPConfig.assets.smallImageText : undefined,
                small_image: RPConfig.assets.smallImageKey ? RPConfig.assets.smallImageKey : undefined
            },
            buttons:[
                {label: RPConfig.buttons.primary.buttonLabelText,url: RPConfig.buttons.primary.buttonRedirectUrl},
                {label: RPConfig.buttons.secondary.buttonLabelText,url: RPConfig.buttons.secondary.buttonRedirectUrl}
            ],
            timestamps: {
                start: RPConfig.timestamps.useTimer ? Number(moment(new Date()).add(parse('-' + RPConfig.timestamps.startTimestamp), 'ms').toDate()) : undefined
            },
            instance: true
        }
    }).then(() => {
        console.log(SUCCESS(`Successfully updated ${client.user.username}#${client.user.discriminator}'s Rich Presence!`));
        oldConsoleLog(`Details: ${RPConfig.details}\nState: ${RPConfig.state}\nLarge Image Text: ${RPConfig.assets.largeImageText}\nLarge Image Key: ${RPConfig.assets.largeImageKey}\nSmall Image Text: ${RPConfig.assets.smallImageText}\nSmall Image Key: ${RPConfig.assets.smallImageKey}\nPrimary Button: ${RPConfig.buttons.primary.buttonLabelText} (${RPConfig.buttons.primary.buttonRedirectUrl})\nSecondary Button: ${RPConfig.buttons.secondary.buttonLabelText} (${RPConfig.buttons.secondary.buttonRedirectUrl})\nTimestamp: ${RPConfig.timestamps.useTimer} (Starts at ${RPConfig.timestamps.startTimestamp})`)
    }).catch((e) => {return console.error(ERR(e.stack))});
}

client.on('ready', async() => {
    console.log(SUCCESS(`Successfully authorised as ${client.user.username}#${client.user.discriminator}`));
    try {
        validConfig();
        if (ExitStatus === 0) {
            console.log(SUCCESS("Configuration is valid!"));
            console.log(PROCESS(`Attempting to update ${client.user.username}#${client.user.discriminator}'s Rich Presence...`));
            let elapsed = new Date() - start;
            progbar("█", " ", 29, elapsed/29).then(() => {
                if (ExitStatus === 0) setPresence();
                else ExitStatus === 1 && (console.error(`ExitStatus: ${ExitStatus}`),process.kill(process.pid));
                
            });
        } else ExitStatus === 1 && (console.error(`ExitStatus: ${ExitStatus}`),process.kill(process.pid));
    } catch (e) {console.error(ERR(e.stack))}
});

// Log into client
client.login({clientId: config.clientId}).catch((e) => {
    console.error(e.stack); // Important to log errors if we can't log into the client
});
