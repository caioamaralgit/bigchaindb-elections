const bigchainDB = require('bigchaindb-driver');
const bip39 = require('bip39');

export const returnBigchainDBConnection = (apiUrl) => (new bigchainDB.Connection(apiUrl));

export const returnNewUser = async (baseSeedWord) => {
    const seed = (await bip39.mnemonicToSeed(baseSeedWord)).slice(0, 32);
    return new bigchainDB.Ed25519Keypair(seed);
}

export const registerNewVote = (voterInfo, user, connection) => {
    const transactionRegisterCandidate = bigchainDB.Transaction.makeCreateTransaction(
        { voterInfo },
        {
            datetime: new Date().toString()
        },
        [bigchainDB.Transaction.makeOutput(bigchainDB.Transaction.makeEd25519Condition(user.publicKey))],
        user.publicKey
    );

    const signedTransaction = bigchainDB.Transaction.signTransaction(transactionRegisterCandidate, user.privateKey);

    return connection
        .postTransactionCommit(signedTransaction)
        .then(response => {
            console.log("New vote created: ", signedTransaction.id);
            return {
                success: true,
                id: signedTransaction.id,
                response
            };
        });
}

export const transferVote = (createdVoteTransactionId, voterKeys, candidateKeys, connection) => (
    connection
        .getTransaction(createdVoteTransactionId)
        .then(voterInfo => {
            const createVotation = bigchainDB.Transaction.makeTransferTransaction(
                [{
                    tx: voterInfo,
                    output_index: 0
                }],
                [bigchainDB.Transaction.makeOutput(bigchainDB.Transaction.makeEd25519Condition(candidateKeys.publicKey))],
                { datetime: new Date().toString() }
            );

            const signedVotation = bigchainDB.Transaction.signTransaction(createVotation, voterKeys.privateKey);
            return connection.postTransactionCommit(signedVotation);
        })
        .then(response => {
            console.log("Vote complete: ", response.id)
            return {
                success: true,
                id: response.id,
                response
            };
        })
);
