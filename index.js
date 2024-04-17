"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("node:fs/promises"));
const promises_2 = require("node:timers/promises");
const node_util_1 = require("node:util");
const node_child_process_1 = require("node:child_process");
const p = __importStar(require("@clack/prompts"));
const exec = (0, node_util_1.promisify)(node_child_process_1.exec);
async function main() {
    console.clear();
    await (0, promises_2.setTimeout)(1000);
    p.intro(`eas-update-app-util`);
    const project = await p.group({
        environment: () => p.select({
            message: 'Select the environment where the APP will  be released',
            maxItems: 2,
            initialValue: 'preview',
            options: [
                { value: 'preview', label: 'Preview' },
                { value: 'production', label: 'Production' }
            ]
        }),
        version: () => p.select({
            message: 'Select a version number',
            initialValue: 'bugfix',
            options: [
                { value: 'bugfix', label: 'Bugfix (X.X.+1)' },
                { value: 'minor', label: 'Minor (X.+1.0)' },
                { value: 'major', label: 'Major (+1.0.0)' },
                { value: 'buildNumber', label: 'BuildNumber(iOS)' },
                { value: 'manual', label: 'Insirt manually' }
            ]
        }),
        customVersion: ({ results }) => {
            if (results.version == 'manual') {
                return p.text({
                    message: 'Type the version number',
                    placeholder: 'X.X.X',
                    validate: (value) => {
                        const breakValue = value.split('.');
                        const isNumber = breakValue.every(item => !isNaN(Number(item)));
                        if (!isNumber)
                            return 'Please only insert numeric values';
                        const isVersioned = breakValue.length === 3;
                        if (!isVersioned)
                            return 'Please utilize semantic versioning';
                    },
                });
            }
        }
    });
    await updateProjectVersion({
        environment: project.environment,
        version: project.customVersion || project.version,
    });
    const deploy = await p.group({
        deploy: () => p.multiselect({
            required: false,
            message: 'Where do you want to deploy your app',
            options: [
                { value: 'ios', label: 'iOS' },
                { value: 'android', label: 'Android' }
            ]
        }),
    });
    if (deploy.deploy.some(item => !!item)) {
        const platforms = deploy.deploy.reduce((acc, curr) => {
            return acc ? 'all' : curr;
        }, '');
        const { stderr, stdout } = await exec(`npx eas build --profile=${project.environment} --auto-submit --non-interactive --platform=${platforms}`);
        console.log(stdout);
        console.log(stderr);
    }
    p.outro(`Deploy finished`);
}
async function updateProjectVersion(args) {
    try {
        const easFile = await promises_1.default.readFile('./eas.json', 'utf8');
        const easObject = JSON.parse(easFile);
        changeVersion(easObject, args);
        await promises_1.default.writeFile('./eas.json', JSON.stringify(easObject, null, 2), 'utf8');
    }
    catch (err) {
        console.error('Um erro ocorreu', err);
    }
}
function parseArguments(args) {
    const argsF = args.slice(2).map(item => item.split('='));
    const argsObj = Object.fromEntries(argsF);
    return argsObj;
}
function changeVersion(easObject, args) {
    if (!args.version) {
        console.info('Não houvem mudança de versão');
        return;
    }
    let version = easObject.build[args.environment].env.EXPO_PUBLIC_VERSION.split('.').map(Number);
    let env = easObject.build[args.environment].env;
    switch (args.version) {
        case 'major':
            version[0]++;
            version[1] = 0;
            version[2] = 0;
            env.BUILD_NUMBER = "1";
            env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1);
            break;
        case 'minor':
            version[1]++;
            version[2] = 0;
            env.BUILD_NUMBER = "1";
            env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1);
            break;
        case 'bugfix':
            version[2]++;
            env.BUILD_NUMBER = "1";
            env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1);
            break;
        case 'buildNumber':
            env.BUILD_NUMBER = String(Number(env.BUILD_NUMBER) + 1);
            break;
        default:
            env.EXPO_PUBLIC_VERSION = args.version;
            version = null;
            env.BUILD_NUMBER = "1";
            env.VERSION_CODE = String(Number(env.VERSION_CODE) + 1);
            break;
    }
    env.EXPO_PUBLIC_VERSION = version ? version.join('.') : env.EXPO_PUBLIC_VERSION;
    console.info(`Versão do APP atualizada para ${env.EXPO_PUBLIC_VERSION}`);
}
main();
