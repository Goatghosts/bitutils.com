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

function convertPrivateKeyToScalar() {
    const privateKey = document.getElementById("inputValue").value;
    let scalar;
    if (isDecimal(privateKey)) {
        console.log("IS DEC")
        scalar = decimalToScalar(privateKey);
    } else if (isHex(privateKey)) {
        console.log("IS HEX")
        scalar = hexToScalar(privateKey);
    } else if (isWIF(privateKey)) {
        console.log("IS WIF")
        scalar = wifToScalar(privateKey);
    } else if (isCompressedWIF(privateKey)) {
        console.log("IS COMPRESSED WIF")
        scalar = compressedWifToScalar(privateKey);
    } else if (isMini(privateKey)) {
        console.log("IS MINI")
        scalar = miniToScalar(privateKey);
    } else {
        throw new Error("Invalid private key format");
    }
    const publicKey = doubleAndAdd(scalar);
    const uncompressedKey = "04" + publicKey[0].toString(16).padStart(64, '0').toUpperCase() + publicKey[1].toString(16).padStart(64, '0').toUpperCase();
    console.log("Private key (DEC):", scalar.toString());
    console.log("Private key (HEX):", intToHex(scalar));
    console.log("Uncompressed public key:", uncompressedKey);
}