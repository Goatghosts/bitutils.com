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
    const miniPattern = /^S[1-9A-HJ-NP-Za-km-z]{21}$/;
    return miniPattern.test(input);
}

function isHex(privateKey) {
    const hexRegex = /^[0-9a-fA-F]+$/;
    return hexRegex.test(privateKey);
}

function isDecimal(input) {
    const decimalPattern = /^\d+$/;
    return decimalPattern.test(input);
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
    const sha256hash = sha256(miniPrivateKey);
    return BigInt("0x" + sha256hash);
}

function hexToScalar(privateKey) {
    return BigInt("0x" + privateKey);
}

function decimalToScalar(decimalPrivateKey) {
    return BigInt(decimalPrivateKey);
}

function convertPrivateKeyToScalar(privateKey) {
    if (isDecimal(privateKey)) {
        console.log("IS DEC")
        return decimalToScalar(privateKey);
    } else if (isHex(privateKey)) {
        console.log("IS HEX")
        return hexToScalar(privateKey);
    } else if (isWIF(privateKey)) {
        console.log("IS WIF")
        return wifToScalar(privateKey);
    } else if (isCompressedWIF(privateKey)) {
        console.log("IS COMPRESSED WIF")
        return compressedWifToScalar(privateKey);
    } else if (isMini(privateKey)) {
        console.log("IS MINI")
        return miniToScalar(privateKey);
    } else {
        alert('Invalid private key format!');
        throw new Error("Invalid private key format");
    }
}

function publicKeyToUncompressed(x, y) {
    const xHex = x.toString(16).padStart(64, '0');
    const yHex = y.toString(16).padStart(64, '0');
    return '04' + xHex + yHex;
}

function publicKeyToCompressed(x, y) {
    const xHex = x.toString(16).padStart(64, '0');
    const prefix = y % 2n === 0n ? '02' : '03';
    return prefix + xHex;
}

function hash160ToAddress(hash, version = '00') {
    const versionHash = version + hash;
    const checksum = sha256(sha256(versionHash)).slice(0, 8);
    const addressHex = versionHash + checksum;
    return encodeBase58(addressHex);
}

function privateKeyToWIF(privateKey, compressed = true, version = '80') {
    const privateKeyHex = privateKey.toString(16).padStart(64, '0');
    let privateKeyWithVersion = version + privateKeyHex;
    if (compressed) {
        privateKeyWithVersion += '01';
    }
    const checksum = sha256(sha256(privateKeyWithVersion)).slice(0, 8);
    const wif = privateKeyWithVersion + checksum;
    return encodeBase58(wif);
}

// function getWalletDetails() {
//     const privateKey = document.getElementById("inputValue").value;
//     const scalar = convertPrivateKeyToScalar(privateKey);
//     const publicKey = doubleAndAdd(scalar);
//     const uncompressedKey = publicKeyToUncompressed(publicKey[0], publicKey[1]);
//     const compressedKey = publicKeyToCompressed(publicKey[0], publicKey[1]);
//     const uncompressedHash160 = hash160(uncompressedKey);
//     const compressedHash160 = hash160(compressedKey);
//     console.log("Private key (DEC):", scalar.toString());
//     console.log("Private key (HEX):", intToHex(scalar));
//     console.log("Public key (U):", uncompressedKey);
//     console.log("Public key (C):", compressedKey);
//     console.log("Hash160 (U):", uncompressedHash160);
//     console.log("Hash160 (C):", compressedHash160);
//     console.log("Bitcoin address (U):", hash160ToAddress(uncompressedHash160, '00'));
//     console.log("Bitcoin address (C):", hash160ToAddress(compressedHash160, '00'));
//     console.log("Bitcoin WIF (U):", privateKeyToWIF(scalar, false, '80'));
//     console.log("Bitcoin WIF (C):", privateKeyToWIF(scalar, true, '80'));
// }

function getWalletDetails() {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = '';
    try {
        const privateKey = document.getElementById("inputValue").value;
        const scalar = convertPrivateKeyToScalar(privateKey);
        if (scalar >= curve_n) {
            alert('Invalid private key size!');
            throw new Error("Invalid private key size!");
        }
        const publicKey = doubleAndAdd(scalar);
        const uncompressedKey = publicKeyToUncompressed(publicKey[0], publicKey[1]);
        const compressedKey = publicKeyToCompressed(publicKey[0], publicKey[1]);
        const uncompressedHash160 = hash160(uncompressedKey);
        const compressedHash160 = hash160(compressedKey);

        const supportedCryptocurrencies = [
            {
                name: "Bitcoin",
                symbol: "BTC",
                addressPrefix: "00",
                wifPrefix: "80",
            },
            {
                name: "Litecoin",
                symbol: "LTC",
                addressPrefix: "30",
                wifPrefix: "B0",
            },
            {
                name: "Dogecoin",
                symbol: "DOGE",
                addressPrefix: "1E",
                wifPrefix: "9E",
            },
            {
                name: "Dash",
                symbol: "DASH",
                addressPrefix: "4C",
                wifPrefix: "CC",
            },
        ];

        const mainResultItem = document.createElement("div");
        mainResultItem.classList.add("result-item");
        mainResultItem.innerHTML = `
        <h3>Information</h2>
        <span><strong>Private key (DEC):</strong> ${scalar.toString()}</span>
        <span><strong>Private key (HEX):</strong> ${intToHex(scalar)}</span>
        <span><strong>Private key (BIN):</strong> ${intToBin(scalar)}</span>
        <br>
        <span><strong>Point X (DEC):</strong> ${publicKey[0]}</span>
        <span><strong>Point Y (DEC):</strong> ${publicKey[1]}</span>
        <span><strong>Point X (HEX):</strong> ${intToHex(publicKey[0])}</span>
        <span><strong>Point Y (HEX):</strong> ${intToHex(publicKey[1])}</span>
        <br>
        <span><strong>Public key (U):</strong> ${uncompressedKey}</span>
        <span><strong>Public key (C):</strong> ${compressedKey}</span>
        <span><strong>Hash160 (U):</strong> ${uncompressedHash160}</span>
        <span><strong>Hash160 (C):</strong> ${compressedHash160}</span>
    `;
        resultContainer.appendChild(mainResultItem);

        supportedCryptocurrencies.forEach((crypto) => {
            const resultItem = document.createElement("div");
            resultItem.classList.add("result-item");

            const uncompressedCryptoAddress = hash160ToAddress(uncompressedHash160, crypto.addressPrefix);
            const compressedCryptoAddress = hash160ToAddress(compressedHash160, crypto.addressPrefix);
            const uncompressedWIF = privateKeyToWIF(scalar, false, crypto.wifPrefix);
            const compressedWIF = privateKeyToWIF(scalar, true, crypto.wifPrefix);

            resultItem.innerHTML = `
            <h3>${crypto.name} (${crypto.symbol})</h3>
            <span><strong>Uncompressed Address:</strong> <a href="https://blockchair.com/${crypto.symbol.toLowerCase()}/address/${uncompressedCryptoAddress}" target="_blank">${uncompressedCryptoAddress}</a></span>
            <span><strong>Compressed Address:</strong> <a href="https://blockchair.com/${crypto.symbol.toLowerCase()}/address/${compressedCryptoAddress}" target="_blank">${compressedCryptoAddress}</a></span>
            <span><strong>Uncompressed WIF:</strong> ${uncompressedWIF}</span>
            <span><strong>Compressed WIF:</strong> ${compressedWIF}</span>
        `;

            resultContainer.appendChild(resultItem);
        });
    } catch (error) {
        resultContainer.innerHTML = `<div class="result-item"><p>Произошла ошибка: ${error}</p></div>`;
    }
}