function sha256(hexData) {
    const byteArray = CryptoJS.enc.Hex.parse(hexData);
    const hash = CryptoJS.SHA256(byteArray);
    return hash.toString(CryptoJS.enc.Hex);
}

function hash160(pubk_hex) {
    const sha256hash = sha256(pubk_hex);
    const ripemd160hash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(sha256hash));
    return ripemd160hash.toString(CryptoJS.enc.Hex);
}