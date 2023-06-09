function get_rs(sig) {
    const rlen = parseInt(sig.slice(2, 4), 16);
    const r = sig.slice(4, 4 + rlen * 2);
    const s = sig.slice(8 + rlen * 2);
    return { r, s };
}

function split_sig_pieces(script) {
    const sigLen = parseInt(script.slice(2, 4), 16);
    const sig = script.slice(4, 2 + sigLen * 2);
    const { r, s } = get_rs(sig.slice(4));
    const pubLen = parseInt(script.slice(4 + sigLen * 2, 4 + sigLen * 2 + 2), 16);
    const pub = script.slice(4 + sigLen * 2 + 2);
    if (pub.length !== pubLen * 2) throw new Error('Assertion failed');
    return { r, s, pub };
}

function parseTx(txn) {
    if (txn.length < 130) {
        alert('[WARNING] rawtx most likely incorrect. Please check..');
        throw new Error('Invalid rawtx');
    }

    const inp_list = [];
    if (txn.slice(8, 12) === '0001') {
        alert('UnSupported Tx Input. Presence of Witness Data');
        throw new Error('Unsupported Tx Input');
    }
    const inp_nu = parseInt(txn.slice(8, 10), 16);

    let first = txn.slice(0, 10);
    let cur = 10;
    for (let m = 0; m < inp_nu; m++) {
        const prv_out = txn.slice(cur, cur + 64);
        const var0 = txn.slice(cur + 64, cur + 64 + 8);
        cur = cur + 64 + 8;
        const scriptLen = parseInt(txn.slice(cur, cur + 2), 16);
        const script = txn.slice(cur, 2 + cur + 2 * scriptLen);
        const { r, s, pub } = split_sig_pieces(script);
        const seq = txn.slice(2 + cur + 2 * scriptLen, 10 + cur + 2 * scriptLen);
        inp_list.push({ prv_out, var0, r, s, pub, seq });
        cur = 10 + cur + 2 * scriptLen;
    }
    const rest = txn.slice(cur);
    return { first, inp_list, rest };
}

function getSignableTxn(parsed) {
    const res = [];
    const { first, inp_list, rest } = parsed;
    const tot = inp_list.length;

    for (let one = 0; one < tot; one++) {
        let e = first;

        for (let i = 0; i < tot; i++) {
            e += inp_list[i].prv_out;
            e += inp_list[i].var0;

            if (one === i) {
                e += '1976a914' + hash160(inp_list[one].pub) + '88ac';
            } else {
                e += '00';
            }

            e += inp_list[i].seq;
        }

        e += rest + "01000000";
        const z = sha256(sha256(e));
        res.push({ r: inp_list[one].r, s: inp_list[one].s, z, pub: inp_list[one].pub, message: e });
    }

    return res;
}

function updateDisplayFormat() {
    const displayInt = document.getElementById("intCheckbox").checked;
    const resultItems = document.getElementsByClassName("result-item");

    for (let i = 0; i < resultItems.length; i++) {
        const item = resultItems[i];

        const r = item.querySelector(".r-value");
        const s = item.querySelector(".s-value");
        const z = item.querySelector(".z-value");

        r.textContent = displayInt ? BigInt("0x" + r.dataset.hexValue) : r.dataset.hexValue.toUpperCase();
        s.textContent = displayInt ? BigInt("0x" + s.dataset.hexValue) : s.dataset.hexValue.toUpperCase();
        z.textContent = displayInt ? BigInt("0x" + z.dataset.hexValue) : z.dataset.hexValue.toUpperCase();
    }
}

document.getElementById("intCheckbox").addEventListener("change", updateDisplayFormat);

function from_txid(txid) {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = '';

    const url = `https://blockchain.info/rawtx/${txid}?format=hex`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            const parsed = parseTx(data);
            const signableTxn = getSignableTxn(parsed);

            // Добавьте данные в контейнер
            signableTxn.forEach((item, index) => {
                const resultItem = document.createElement("div");
                resultItem.classList.add("result-item");

                resultItem.innerHTML = `
                    <h3>Input #${index}</h3>
                    <span><strong>R:</strong> <div class="r-value" data-hex-value="${item.r}">${item.r}</div></span>
                    <span><strong>S:</strong> <div class="s-value" data-hex-value="${item.s}">${item.s}</div></span>
                    <span><strong>Z:</strong> <div class="z-value" data-hex-value="${item.z}">${item.z}</div></span>
                    <span><strong>Public Key:</strong> ${item.pub.toUpperCase()}</span>
                `;

                resultContainer.appendChild(resultItem);
            });
            updateDisplayFormat();
        })
        .catch(error => {
            resultContainer.innerHTML = `<div class="result-item"><p>Произошла ошибка: ${error}</p></div>`;
        });
}

function from_raw_tx(rawData) {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = '';

    try {
        const parsed = parseTx(rawData);
        const signableTxn = getSignableTxn(parsed);

        // Добавьте данные в контейнер
        signableTxn.forEach((item, index) => {
            const resultItem = document.createElement("div");
            resultItem.classList.add("result-item");

            resultItem.innerHTML = `
                <h3>Input #${index}</h3>
                <span><strong>R:</strong> <div class="r-value" data-hex-value="${item.r}">${item.r}</div></span>
                <span><strong>S:</strong> <div class="s-value" data-hex-value="${item.s}">${item.s}</div></span>
                <span><strong>Z:</strong> <div class="z-value" data-hex-value="${item.z}">${item.z}</div></span>
                <span><strong>Public Key:</strong> ${item.pub.toUpperCase()}</span>
            `;

            resultContainer.appendChild(resultItem);
        });
        updateDisplayFormat();
    } catch (error) {
        resultContainer.innerHTML = `<div class="result-item"><p>Произошла ошибка: ${error}</p></div>`;
    }
}

function processTransactionData() {
    const inputValue = document.getElementById("inputValue").value;

    // Регулярное выражение для проверки формата TXID (64-значный шестнадцатеричный номер)
    const txidPattern = /^[a-fA-F0-9]{64}$/;

    if (txidPattern.test(inputValue)) {
        from_txid(inputValue);
    } else {
        from_raw_tx(inputValue);
    }
}