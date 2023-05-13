function isWIF(input) {
    // Формат WIF: 5 или 6 в начале, затем 50 символов из набора Base58
    const wifPattern = /^[56][123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{50}$/;
    return wifPattern.test(input);
}

function isCompressedWIF(input) {
    // Формат сжатого WIF: начинается с символа K, L, Q или T, затем 51 символ из набора Base58
    const compressedWifPattern = /^[KLQT][123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51}$/;
    return compressedWifPattern.test(input);
}

function isMini(input) {
    const miniPattern = /^S[1-9A-HJ-NP-Za-km-z]{21,29}$/;
    return miniPattern.test(input);
}

function wifToScalar(privateKey) {
    const decoded = decodeBase58(privateKey);
    const hex = decoded.toString(CryptoJS.enc.Hex);
    const payload = hex.slice(0, -8);

    return BigInt("0x" + payload.slice(2, 66)); // Удалите префикс и суффикс
}

function compressedWifToScalar(privateKey) {
    const decoded = decodeBase58(privateKey);
    const hex = decoded.toString(CryptoJS.enc.Hex);
    const payload = hex.slice(0, -10);

    return BigInt("0x" + payload.slice(2, 66)); // Удалите префикс и суффикс
}

function miniToScalar(miniPrivateKey) {
    const sha256hash = sha256FromString(miniPrivateKey);
    return BigInt("0x" + sha256hash);
}

function convertPrivateKeyToScalar(privateKey) {
    let privateKeyFormat;
    if (isDecimal(privateKey)) {
        privateKeyFormat = "Decimal";
        return { scalar: decimalToScalar(privateKey), format: privateKeyFormat };
    } else if (isHex(privateKey)) {
        privateKeyFormat = "Hexadecimal";
        return { scalar: hexToScalar(privateKey), format: privateKeyFormat };
    } else if (isWIF(privateKey)) {
        privateKeyFormat = "WIF";
        return { scalar: wifToScalar(privateKey), format: privateKeyFormat };
    } else if (isCompressedWIF(privateKey)) {
        privateKeyFormat = "Compressed WIF";
        return { scalar: compressedWifToScalar(privateKey), format: privateKeyFormat };
    } else if (isMini(privateKey)) {
        privateKeyFormat = "Mini";
        return { scalar: miniToScalar(privateKey), format: privateKeyFormat };
    } else {
        alert('Invalid private key format!');
        throw new Error("Invalid private key format");
    }
}

function DebugPrivateKeyDetails() {
    const privateKey = document.getElementById("inputValue").value;
    const scalar = convertPrivateKeyToScalar(privateKey);
    const publicKey = doubleAndAdd(scalar);
    const uncompressedKey = publicKeyToUncompressed(publicKey[0], publicKey[1]);
    const compressedKey = publicKeyToCompressed(publicKey[0], publicKey[1]);
    const uncompressedHash160 = hash160(uncompressedKey);
    const compressedHash160 = hash160(compressedKey);
    console.log("Private key (DEC):", scalar.toString());
    console.log("Private key (HEX):", intToHex(scalar));
    console.log("Public key (U):", uncompressedKey);
    console.log("Public key (C):", compressedKey);
    console.log("Hash160 (U):", uncompressedHash160);
    console.log("Hash160 (C):", compressedHash160);
    console.log("Bitcoin address (U):", hash160ToAddress(uncompressedHash160, '00'));
    console.log("Bitcoin address (C):", hash160ToAddress(compressedHash160, '00'));
    console.log("Bitcoin WIF (U):", privateKeyToWIF(scalar, false, '80'));
    console.log("Bitcoin WIF (C):", privateKeyToWIF(scalar, true, '80'));
}

function generateRandomPrivateKey() {
    if (!window.crypto || !window.crypto.getRandomValues) {
        alert('Your browser does not support secure random number generation. Please update your browser or use another one.');
        throw new Error("window.crypto is not available.");
    }
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const hexPrivateKey = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    document.getElementById('inputValue').value = hexPrivateKey;
}

function getPrivateKeyDetails() {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = '';
    try {
        const privateKey = document.getElementById("inputValue").value;
        const privateKeyData = convertPrivateKeyToScalar(privateKey);
        const scalar = privateKeyData.scalar;
        const privateKeyFormat = privateKeyData.format;
        console.log(scalar);
        if (scalar <= 0n || scalar >= curve_n) {
            alert('Invalid private key size!');
            throw new Error("Invalid private key size!");
        }
        const binaryRepresentation = intToBin(scalar);
        const bits = binaryRepresentation.length;
        const publicKey = doubleAndAdd(scalar);
        const uncompressedKey = publicKeyToUncompressed(publicKey[0], publicKey[1]);
        const compressedKey = publicKeyToCompressed(publicKey[0], publicKey[1]);
        const ethereumAddress = publicKeyToEthereumAddress(publicKey[0], publicKey[1]);
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
                keys: [
                    { type: ' (U)', data: privateKeyToWIF(scalar, false, "80") },
                    { type: ' (C)', data: privateKeyToWIF(scalar, true, "80") },
                ],
            },
            {
                name: "Ethereum",
                symbol: "ETH",
                url: "https://etherscan.io/address/",
                addresses: [
                    { type: '', data: ethereumAddress },
                ],
                keys: [
                    { type: '', data: intToHex(scalar).toUpperCase() }
                ],
            },
            {
                name: "Binance Coin",
                symbol: "BNB",
                url: "https://bscscan.com/address/",
                addresses: [
                    { type: '', data: ethereumAddress },
                ],
                keys: [
                    { type: '', data: intToHex(scalar).toUpperCase() }
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
                keys: [
                    { type: ' (U)', data: privateKeyToWIF(scalar, false, "B0") },
                    { type: ' (C)', data: privateKeyToWIF(scalar, true, "B0") },
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
                keys: [
                    { type: ' (U)', data: privateKeyToWIF(scalar, false, "9E") },
                    { type: ' (C)', data: privateKeyToWIF(scalar, true, "9E") },
                ],
            },
        ];

        const mainResultItem = document.createElement("div");
        mainResultItem.classList.add("result-item");
        mainResultItem.innerHTML = `
            <h3>Information</h2>
            <span><strong>Private key format:</strong> ${privateKeyFormat}</span>
            <span><strong>Private key (DEC):</strong> ${scalar.toString()}</span>
            <span><strong>Private key (HEX):</strong> ${intToHex(scalar).toUpperCase()}</span>
            <span><strong>Private key (BIN):</strong> ${binaryRepresentation.padStart(256, '0')}</span>
            <span><strong>Private key (Bits):</strong> ${bits}</span>
            <br>
            <span><strong>Point X (DEC):</strong> ${publicKey[0]}</span>
            <span><strong>Point Y (DEC):</strong> ${publicKey[1]}</span>
            <span><strong>Point X (HEX):</strong> ${intToHex(publicKey[0]).toUpperCase()}</span>
            <span><strong>Point Y (HEX):</strong> ${intToHex(publicKey[1]).toUpperCase()}</span>
            <br>
            <span><strong>Public key (U):</strong> ${uncompressedKey.toUpperCase()}</span>
            <span><strong>Public key (C):</strong> ${compressedKey.toUpperCase()}</span>
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

            crypto.keys.forEach((key) => {
                resultItem.innerHTML += `<span><strong>Private key${key.type}:</strong> ${key.data}</span>`;
            });

            resultContainer.appendChild(resultItem);
        });
    } catch (error) {
        resultContainer.innerHTML = `<div class="result-item"><p>Произошла ошибка: ${error}</p></div>`;
    }
}