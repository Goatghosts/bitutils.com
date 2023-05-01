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

function getWalletDetails() {
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