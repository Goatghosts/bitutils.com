function isWIF(privateKey) {
    try {
        const decoded = decodeBase58(privateKey);
        const hex = decoded.toString(CryptoJS.enc.Hex);
        console.log(hex)

        // Проверьте длину и префикс
        if (hex.length === 74 && (hex.startsWith("80") || hex.startsWith("ef"))) {
            const checksum = hex.slice(-8);
            const payload = hex.slice(0, -8);
            const hash = sha256(sha256(payload)).slice(0, 8);

            // Проверьте сжатый формат
            if (hex.slice(-10, -8) === "01") {
                return false;
            }

            return checksum === hash;
        }
    } catch (error) {
        return false;
    }

    return false;
}

function isCompressedWIF(input) {
    try {
        const decoded = decodeBase58(input);
        const hex = decoded.toString(CryptoJS.enc.Hex);
        const payload = hex.slice(0, -10);

        if (payload.length === 66 && payload.slice(0, 2) === "80" && hex.slice(-10, -8) === "01") {
            const checksum = hex.slice(-8);
            const hash = sha256(sha256(payload + "01")).slice(0, 8);

            return checksum === hash;
        }
    } catch (error) {
        return false;
    }

    return false;
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
    if (isWIF(privateKey)) {
        console.log("IS WIF")
        scalar = wifToScalar(privateKey);
    } else if (isCompressedWIF(privateKey)) {
        console.log("IS COMPRESSED WIF")
        scalar = compressedWifToScalar(privateKey);
    } else if (isMini(privateKey)) {
        console.log("IS MINI")
        scalar = miniToScalar(privateKey);
    } else if (isDecimal(privateKey)) {
        console.log("IS DEC")
        scalar = decimalToScalar(privateKey);
    } else if (isHex(privateKey)) {
        console.log("IS HEX")
        scalar = hexToScalar(privateKey);
    } else {
        throw new Error("Invalid private key format");
    }
    console.log(scalar)
}