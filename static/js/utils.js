
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ALPHABET_MAP = {};
for (let i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
}
const BASE = 58;

function decodeBase58(string) {
    if (string.length === 0) return '';

    let bytes = [0];
    for (let i = 0; i < string.length; i++) {
        const char = string[i];
        if (!(char in ALPHABET_MAP)) {
            throw new Error('Non-base58 character');
        }

        for (let j = 0; j < bytes.length; j++) {
            bytes[j] *= BASE;
        }
        bytes[0] += ALPHABET_MAP[char];

        let carry = 0;
        for (let j = 0; j < bytes.length; ++j) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
        }

        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }

    // deal with leading zeroes
    for (let i = 0; i < string.length && string[i] === '1'; i++) {
        bytes.push(0);
    }

    return bytes.reverse().map(byte => byte.toString(16).padStart(2, '0')).join('');
}


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