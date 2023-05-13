function isCompressedPublicKey(publicKey) {
    const compressedPubKeyRegex = /^0[2-3][0-9A-Fa-f]{64}$/;
    return compressedPubKeyRegex.test(publicKey);
}

function isUncompressedPublicKey(publicKey) {
    const uncompressedPubKeyRegex = /^04[0-9A-Fa-f]{128}$/;
    return uncompressedPubKeyRegex.test(publicKey);
}

function isPoint(publicKey) {
    const separators = [",", " ", ", ", "\n"];
    for (let separator of separators) {
        if (publicKey.includes(separator)) {
            const [x, y] = publicKey.split(separator);
            if ((isHex(x) && isHex(y)) || (isDecimal(x) && isDecimal(y))) {
                return true;
            }
        }
    }
    return false;
}


function compressedPublicKeyToPoint(publicKey) {
    const x = hexToScalar(publicKey.slice(2));
    const isYEven = publicKey.startsWith("03");
    const y = calculateY(x, isYEven);
    return {
        x: x,
        y: y,
        format: "Compressed Public Key"
    };
}

function uncompressedPublicKeyToPoint(publicKey) {
    const x = publicKey.slice(2, 66);
    const y = publicKey.slice(66);
    return {
        x: BigInt('0x' + x),
        y: BigInt('0x' + y),
        format: "Uncompressed Public Key"
    };
}

function pointToPoint(publicKey) {
    const separators = [",", " ", ", ", "\n"];
    for (let separator of separators) {
        if (publicKey.includes(separator)) {
            const [x, y] = publicKey.split(separator);
            // Конвертируем в зависимости от формата.
            return {
                x: isDecimal(x) ? decimalToScalar(x) : hexToScalar(x),
                y: isDecimal(y) ? decimalToScalar(y) : hexToScalar(y),
                format: "Point"
            };
        }
    }
}

function convertPublicKeyToPoint(publicKey) {
    if (isPoint(publicKey)) {
        return pointToPoint(publicKey);
    } else if (isCompressedPublicKey(publicKey)) {
        return compressedPublicKeyToPoint(publicKey);
    } else if (isUncompressedPublicKey(publicKey)) {
        return uncompressedPublicKeyToPoint(publicKey);
    } else {
        alert('Invalid public key format!');
        throw new Error("Invalid public key format");
    }
}

function getPublicKeyDetails() {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = '';
    try {
        const publicKey = document.getElementById("inputValue").value;
        const publicKeyData = convertPublicKeyToPoint(publicKey);
        const x = publicKeyData.x;
        const y = publicKeyData.y;
        const publicKeyFormat = publicKeyData.format;
        console.log(publicKeyData);
        if (!isOnSecp256k1(x, y)) {
            throw new Error("The point does not lie on the secp256k1 curve.");
        }
        const uncompressedKey = publicKeyToUncompressed(x, y);
        const compressedKey = publicKeyToCompressed(x, y);
        const ethereumAddress = publicKeyToEthereumAddress(x, y);
        const uncompressedHash160 = hash160(uncompressedKey);
        const compressedHash160 = hash160(compressedKey);

        const cryptocurrencies = [
            {
                name: "Bitcoin",
                symbol: "BTC",
                url: "https://www.blockchain.com/explorer/addresses/btc/",
                addresses: [
                    { type: ' (U)', data: hash160ToAddress(uncompressedHash160, "00") },
                    { type: ' (C)', data: hash160ToAddress(compressedHash160, "00") },
                ],
            },
            {
                name: "Ethereum",
                symbol: "ETH",
                url: "https://etherscan.io/address/",
                addresses: [
                    { type: '', data: ethereumAddress },
                ],
            },
            {
                name: "Binance Coin",
                symbol: "BNB",
                url: "https://bscscan.com/address/",
                addresses: [
                    { type: '', data: ethereumAddress },
                ],
            },
            {
                name: "Litecoin",
                symbol: "LTC",
                url: "https://blockchair.com/litecoin/address/",
                addresses: [
                    { type: ' (U)', data: hash160ToAddress(uncompressedHash160, "30") },
                    { type: ' (C)', data: hash160ToAddress(compressedHash160, "30") },
                ],
            },
            {
                name: "Dogecoin",
                symbol: "DOGE",
                url: "https://blockchair.com/dogecoin/address/",
                addresses: [
                    { type: ' (U)', data: hash160ToAddress(uncompressedHash160, "1E") },
                    { type: ' (C)', data: hash160ToAddress(compressedHash160, "1E") },
                ],
            },
        ];

        const mainResultItem = document.createElement("div");
        mainResultItem.classList.add("result-item");
        mainResultItem.innerHTML = `
            <h3>Information</h2>
            <span><strong>Public key format:</strong> ${publicKeyFormat}</span>
            <span><strong>Public key (U):</strong> ${uncompressedKey.toUpperCase()}</span>
            <span><strong>Public key (C):</strong> ${compressedKey.toUpperCase()}</span>
            <br>
            <span><strong>Point X (DEC):</strong> ${x}</span>
            <span><strong>Point Y (DEC):</strong> ${y}</span>
            <span><strong>Point X (HEX):</strong> ${intToHex(x).toUpperCase()}</span>
            <span><strong>Point Y (HEX):</strong> ${intToHex(y).toUpperCase()}</span>
            <br>
            <span><strong>Hash160 (U):</strong> ${uncompressedHash160.toUpperCase()}</span>
            <span><strong>Hash160 (C):</strong> ${compressedHash160.toUpperCase()}</span>
        `;
        resultContainer.appendChild(mainResultItem);

        cryptocurrencies.forEach((crypto) => {
            const resultItem = document.createElement("div");
            resultItem.classList.add("result-item");

            resultItem.innerHTML = `<h3>${crypto.name} (${crypto.symbol})</h3>`;

            crypto.addresses.forEach((address) => {
                const link = crypto.url + address.data;
                resultItem.innerHTML += `<span><strong>Address${address.type}:</strong> <a href="${link}" target="_blank">${address.data}</a></span>`;
            });

            resultContainer.appendChild(resultItem);
        });
    } catch (error) {
        resultContainer.innerHTML = `<div class="result-item"><p>Произошла ошибка: ${error}</p></div>`;
    }
}