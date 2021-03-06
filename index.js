const express = require('express');
const { returnBigchainDBConnection, returnNewUser, registerNewVote, transferVote, getCandidateVotes } = require('./bigchaindb');

require('dotenv').config();

const port = process.env.PORT;
const apiUrl = process.env.API_URL;
const baseSeedWord = process.env.SEED_WORD;

const candidatesList = {};

const bigchainDbConnection = returnBigchainDBConnection(apiUrl);

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/candidate", (request, response) => 
    response.send({
        total: Object.keys(candidatesList).length,
        list: Object.entries(candidatesList)
            .map(([number, data]) => ({
                name: data.name,
                number
            }))
    })
);

app.post("/candidate", async (request, response) => {
    const candidateNumber = request.body.number;

    const seed = candidateNumber + request.body.name.replace(/ /g, "") + (new Date()).getTime();

    const candidateKeys = await returnNewUser(seed);

    candidatesList[candidateNumber] = {
        name: request.body.name,
        keys: candidateKeys
    };

    response.send({ success: true });
});

app.post("/vote", async (request, response) => {
    const voter = {
        document: request.body.document,
        name: request.body.name
    };

    const candidateNumber = request.body.candidateNumber;

    if (!candidateNumber) {
        response.send({ success: false, error: "Número do candidato não informado." });
        return;
    }

    const candidate = candidatesList[candidateNumber];

    if (!candidate) {
        response.send({ success: false, error: "Candidato não encontrado." });
        return;
    }

    const seed = request.body.document + request.body.name.replace(/ /g, "") + (new Date()).getTime();

    const voterKeys = await returnNewUser(seed);

    const vote = await registerNewVote(voter, voterKeys, { name: candidate.name, number: candidateNumber}, bigchainDbConnection);

    if (!vote.success) {
        response.send({ success: false, error: "Falha ao criar voto." });
        return;
    }

    const transferVoteTransaction = await transferVote(vote.id, voterKeys, candidate.keys, bigchainDbConnection);

    if (!transferVoteTransaction.success) {
        response.send({ success: false, error: "Falha ao transferir voto." });
        return;
    }

    response.send({
        success: true,
        id: transferVoteTransaction.id
    });
});

app.get("/result", async (request, response) => {
    const results = [];

    for (const candidateNumber of Object.keys(candidatesList)) {
        results.push({
            name: candidatesList[candidateNumber].name,
            number: candidateNumber,
            votes: (await getCandidateVotes(candidateNumber, bigchainDbConnection)).length
        });
    }

    response.send(results);
})

app.listen(port, () => console.log(`Ouvindo porta ${port}`));
