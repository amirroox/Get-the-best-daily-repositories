
![spl](https://github.com/user-attachments/assets/bbaa5be7-c072-4cb9-b304-7dbfbcc2b07d)

**Ryze copy trade** 

- `WSOL Snipe`
- `Copy Trade`
- `Auto-Sell`
- `TP/SL`
- `Min Liq`
- `Burn/Lock Check`
- `Renounce Check`
- `Fast Buy`

> [!NOTE]
> This is provided as is, for learning purposes.

## SETUP
To run the script you need to:
1. Download and extract the repository files: Use the command "git clone https://github.com/RyzenTrade/Solana-copy-trade-" or click the green "Code" button and select "Download ZIP".
2. Install the Node.js environment on your computer : https://nodejs.org/en
3. The runtime environment should be a terminal or VSCode. Detailed steps are provided below, please read carefully.
4. Convert some SOL into WSOL for trading. Note: Even if you only want to run the test for one hour, you still need to retain enough SOL, as gas fees are paid in SOL. For example (10 SOL) : (1 WSOL) : (QUOTE_AMOUNT=0.1) +-

`Jupiter Wrap` : https://jup.ag/

![](readme/jupiterwrap.png)

## START
1. open a cmd in the downloaded folder and run the command `npm i`.
2. run the command `node main.js`

## TAKE PROFIT

> [!NOTE]
> By default, 50 % 

## STOP LOSS

> [!NOTE]
> By default, 30 %

## AUTO SELL
By default, auto sell is enabled. If you want to disable it, you need to:
1. Change variable `AUTO_SELL` to `false`
2. Update `MAX_SELL_RETRIES` to set the maximum number of retries for selling token
3. Update `AUTO_SELL_DELAY` to the number of milliseconds you want to wait before selling the token (this will sell the token after the specified delay. (+- RPC node speed)).

If you set AUTO_SELL_DELAY to 0, token will be sold immediately after it is bought.
There is no guarantee that the token will be sold at a profit or even sold at all. The developer is not responsible for any losses incurred by using this feature.

![](readme/token.png)

## SNIPE LIST
By default, script buys each token which has a new liquidity pool created and open for trading.
There are scenarios when you want to buy one specific token as soon as possible during the launch event.
To achieve this, you'll have to use snipe list.
1. Change variable `USE_SNIPE_LIST` to `true` 
2. Add token mint addresses you wish to buy in `snipe-list.txt` file (add each address as a new line).

This will prevent script from buying everything, and instead it will buy just listed tokens.
You can update the list while script is running. Script will check for new values in specified interval (`SNIPE_LIST_REFRESH_INTERVAL`).

Pool must not exist before the script starts.
It will buy only when new pool is open for trading. If you want to buy token that will be launched in the future, make sure that script is running before the launch.



## COMMON ISSUES

> [!IMPORTANT]
> If you have an error which is not listed here, please create a new issue in this repository.
> To collect more information on an issue, please change `LOG_LEVEL` to `debug`.
> 
> ### EMPTY TRANSACTION
> If you see empty transactions on SolScan most likely fix is to change commitment level to `finalized`.
> 
> ### UNSOPPORTED RPC NODE
> If you see following error in your log file:  
> `Error: 410 Gone:  {"jsonrpc":"2.0","error":{"code": 410, "message":"The RPC call or parameters have been disabled."}, "id": "986f3599-b2b7-47c4-b951-074c19842bad"}`  
> It means your RPC node doesn't support methods needed to execute script.
> FIX: Change your RPC node. You can use Shyft, Helius or Quicknode. 
> 
> ### NO TOKEN ACCOUNT
> If you see following error in your log file:  
> `Error: No SOL token account found in wallet:`  
> it means that wallet you provided doesn't have WSOL token account.
> FIX: Go to dex and swap some SOL to WSOL. When you swap sol to wsol you should see it in wallet.



## DISCLAIMER

> [!IMPORTANT]
> Use this script at your own risk.
