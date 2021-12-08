const { LCDClient, MsgStoreCode, MnemonicKey, isTxError, MsgInstantiateContract } = require('@terra-money/terra.js');
const fs = require('fs')

// test1 key from localterra accounts
const mk = new MnemonicKey({
    mnemonic: 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius'
})

// connect to localterra
const terra = new LCDClient({
    URL: 'http://localhost:1317',
    chainID: 'localterra'
});
const wallet = terra.wallet(mk);

async function main() {


    const storeCode = new MsgStoreCode(
        wallet.key.accAddress,
        fs.readFileSync('./artifacts/astro_hero.wasm').toString('base64')
    );
    console.log("1"+wallet.key.accAddress)
    const storeCodeTx = await wallet.createAndSignTx({
        msgs: [storeCode],
    });
    const storeCodeTxResult = await terra.tx.broadcast(storeCodeTx);

    console.log(storeCodeTxResult);

    if (isTxError(storeCodeTxResult)) {
        throw new Error(
            `store code failed. code: ${storeCodeTxResult.code}, codespace: ${storeCodeTxResult.codespace}, raw_log: ${storeCodeTxResult.raw_log}`
        );
    }

    const {
        store_code: { code_id },
    } = storeCodeTxResult.logs[0].eventsByType;


    //init 
    const instantiate = new MsgInstantiateContract(
        wallet.key.accAddress,
        code_id[0], // code ID
        {
            "name": "Galactic Punks",
            "symbol": "GP",
            "minter": "terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v",
            "token_supply": 10000
        }, // InitMsg
        { uluna: 10000000, ukrw: 1000000 }
    );
    console.log("2"+wallet.key.accAddress)


    const instantiateTx = await wallet.createAndSignTx({
        msgs: [instantiate],
    });

    const instantiateTxResult = await terra.tx.broadcast(instantiateTx);

    console.log(instantiateTxResult);

    if (isTxError(instantiateTxResult)) {
        throw new Error(
            `instantiate failed. code: ${instantiateTxResult.code}, codespace: ${instantiateTxResult.codespace}, raw_log: ${instantiateTxResult.raw_log}`
        );
    }

    const {
        instantiate_contract: { contract_address },
    } = instantiateTxResult.logs[0].eventsByType;
}

main()