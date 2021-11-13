const bigchainDB = require('bigchaindb-driver');
const bip39 = require('bip39');

export const returnBigchainDBConnection = (apiUrl) => (new bigchainDB.Connection(apiUrl));

export const returnNewUser = async (baseSeedWord) => {
    const seed = (await bip39.mnemonicToSeed(baseSeedWord)).slice(0, 32);
    return new bigchainDB.Ed25519Keypair(seed);
}

export const registerNewVote = (voterInfo, user, candidate, connection) => {
    const transactionRegisterCandidate = bigchainDB.Transaction.makeCreateTransaction(
        { candidate },
        {
            datetime: new Date().toString(),
            voter: voterInfo
        },
        [bigchainDB.Transaction.makeOutput(bigchainDB.Transaction.makeEd25519Condition(user.publicKey))],
        user.publicKey
    );

    const signedTransaction = bigchainDB.Transaction.signTransaction(transactionRegisterCandidate, user.privateKey);

    return connection
        .postTransactionCommit(signedTransaction)
        .then((response)=> {
            console.log("New vote created: ", signedTransaction.id);
            return {
                success: true,
                id: signedTransaction.id,
                response
            };
        })
        .catch(err => console.error("Error: ", err));
}

export const getCandidateVotes = (candidateNumber, connection) => {
    return connection.searchAssets(candidateNumber);
}
