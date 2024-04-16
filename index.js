"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fs_1 = require("node:fs");
var promises_1 = require("node:timers/promises");
var p = require("@clack/prompts");
var fsp = node_fs_1.default.promises;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var project;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.clear();
                    return [4 /*yield*/, (0, promises_1.setTimeout)(1000)];
                case 1:
                    _a.sent();
                    p.intro("eas-update-app-util");
                    return [4 /*yield*/, p.group({
                            environment: function () {
                                return p.select({
                                    message: 'Select the environment where the APP will  be released',
                                    maxItems: 2,
                                    initialValue: 'preview',
                                    options: [
                                        { value: 'preview', label: 'Preview' },
                                        { value: 'production', label: 'Production' }
                                    ]
                                });
                            },
                            version: function () {
                                return p.select({
                                    message: 'Select a version number',
                                    initialValue: 'bugfix',
                                    options: [
                                        { value: 'bugfix', label: 'Bugfix (X.X.+1)' },
                                        { value: 'minor', label: 'Minor (X.+1.0)' },
                                        { value: 'major', label: 'Major (+1.0.0)' },
                                        { value: 'buildNumber', label: 'BuildNumber(iOS)' },
                                        { value: 'manual', label: 'Insirt manually' }
                                    ]
                                });
                            },
                            customVersion: function (_a) {
                                var results = _a.results;
                                if (results.version == 'manual') {
                                    return p.text({
                                        message: 'Type the version number',
                                        placeholder: 'X.X.X',
                                        validate: function (value) {
                                            var breakValue = value.split('.');
                                            var isNumber = breakValue.every(function (item) { return !isNaN(Number(item)); });
                                            if (!isNumber)
                                                return 'Please only insert numeric values';
                                            var isVersioned = breakValue.length === 3;
                                            if (!isVersioned)
                                                return 'Please utilize semantic versioning';
                                        },
                                    });
                                }
                            }
                        })];
                case 2:
                    project = _a.sent();
                    return [4 /*yield*/, updateProjectVersion({
                            environment: project.environment,
                            version: project.customVersion || project.version,
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function updateProjectVersion(args) {
    return __awaiter(this, void 0, void 0, function () {
        var easFile, easObject, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fsp.readFile('./eas.json', 'utf8')];
                case 1:
                    easFile = _a.sent();
                    easObject = JSON.parse(easFile);
                    changeVersion(easObject, args);
                    return [4 /*yield*/, fsp.writeFile('./eas.json', JSON.stringify(easObject, null, 2), 'utf8')
                        //console.log('eas.json atualizado com sucesso!')
                    ];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Um erro ocorreu', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function parseArguments(args) {
    var argsF = args.slice(2).map(function (item) { return item.split('='); });
    var argsObj = Object.fromEntries(argsF);
    return argsObj;
}
function changeVersion(easObject, args) {
    if (!args.version) {
        console.info('Não houvem mudança de versão');
        return;
    }
    var version = easObject.build[args.environment].env.EXPO_PUBLIC_VERSION.split('.').map(Number);
    var env = easObject.build[args.environment].env;
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
    console.info("Vers\u00E3o do APP atualizada para ".concat(env.EXPO_PUBLIC_VERSION));
}
main();