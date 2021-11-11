function apply(event) {
    event.preventDefault();

    const name = document.getElementById("candidate-name").value;
    const number = document.getElementById("candidate-number").value;

    axios.post("/candidate", { name, number }).then(function (data, error) {
        if (error || data.status !== 200 || !data.data.success) {
            console.error(error);
            alert("Ocorreu um erro ao se candidatar.");
            return;
        }

        document.getElementById("candidate-name").value = "";
        document.getElementById("candidate-number").value = "";

        alert("Candidatado com sucesso.");
        update();
    });
}

function vote(event) {
    event.preventDefault();

    const name = document.getElementById("voter-name").value;
    const voterDocument = document.getElementById("voter-document").value;
    const candidateNumber = document.getElementById("voter-candidate-number").value;

    axios.post("/vote", { name, document: voterDocument, candidateNumber }).then(function (data, error) {
        if (error || data.status !== 200 || !data.data.success) {
            console.error(error || data.data.error);
            alert(error || data.data.error);
            return;
        }

        document.getElementById("voter-name").value = "";
        document.getElementById("voter-document").value = "";
        document.getElementById("voter-candidate-number").value = "";

        console.log(`Voto realizado com sucesso. ID: ${data.data.id}`)
        alert(`Voto realizado com sucesso. ID: ${data.data.id}`);
    });
}

function update() {
    axios.get("/candidate").then(function (data, error) {
        if (error || data.status !== 200) {
            console.error(error);
            alert("Ocorreu um erro ao buscar a lista de candidatos.");
            return;
        }

        const response = data.data;

        document.getElementById("total-candidates").dataset.total = response.total;
        
        document
            .querySelector("#candidates-list tbody")
            .replaceChildren(...response.list.map(function (candidate) {
                const tr = document.createElement("tr");

                const tdNumber = document.createElement("td");
                const tdName = document.createElement("td");

                tdNumber.innerText = candidate.number;
                tdName.innerText = candidate.name;

                tr.appendChild(tdNumber);
                tr.appendChild(tdName);

                return tr;
            }));
     
        document
            .querySelector("#voter-candidate-number")
            .replaceChildren(...response.list.map(function (candidate) {
                const option = document.createElement("option");

                option.value = candidate.number;
                option.innerText = candidate.name;

                return option;
            }));

        if (response.list.length === 0) {
            const option = document.createElement("option");

            option.disabled = true;
            option.selected = true;
            option.innerText = "Selecione o candidato";
            
            document
                .querySelector("#voter-candidate-number")
                .replaceChildren(option);
        }
    })
}