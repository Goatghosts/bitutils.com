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
    for (let i = 0; i < string.length && string[i] === '1'; i++) {
        bytes.push(0);
    }
    return bytes.reverse().map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function encodeBase58(hexString) {
    let bytes = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    let base58 = '';
    let carry;
    while (bytes.length > 0) {
        carry = 0;
        let result = [];
        bytes.forEach((byte) => {
            let value = (carry << 8) + byte;
            carry = value % BASE;
            value = (value - carry) / BASE;
            if (value > 0 || result.length > 0) {
                result.push(value);
            }
        });
        base58 = ALPHABET[carry] + base58;
        bytes = result;
    }
    let zeroBytes = 0;
    while (hexString[zeroBytes * 2] === '0' && hexString[zeroBytes * 2 + 1] === '0') {
        base58 = ALPHABET[0] + base58;
        zeroBytes++;
    }
    return base58;
}

function mod(a, b) {
    return ((a % b) + b) % b;
}

// Function from
// https://github.com/juanelas/bigint-mod-arith/blob/master/src/ts/egcd.ts
// God grant you health, Juan Hernández Serrano
function eGcd(a, b) {
    if (typeof a === 'number') a = BigInt(a)
    if (typeof b === 'number') b = BigInt(b)

    if (a <= 0n || b <= 0n) throw new RangeError('a and b MUST be > 0') // a and b MUST be positive

    let x = 0n
    let y = 1n
    let u = 1n
    let v = 0n

    while (a !== 0n) {
        const q = b / a
        const r = b % a
        const m = x - (u * q)
        const n = y - (v * q)
        b = a
        a = r
        x = u
        y = v
        u = m
        v = n
    }
    return {
        g: b,
        x,
        y
    }
}

// Function from
// https://github.com/juanelas/bigint-mod-arith/blob/master/src/ts/modInv.ts
// God grant you health, Juan Hernández Serrano
function modInv(a, n) {
    const egcd = eGcd(mod(a, n), n)
    if (egcd.g !== 1n) {
        throw new RangeError(`${a.toString()} does not have inverse modulo ${n.toString()}`) // modular inverse does not exist
    } else {
        return mod(egcd.x, n)
    }
}

function intToHex(a) {
    return a.toString(16).padStart(64, '0');
}

function intToBin256(a) {
    return a.toString(2).padStart(256, '0');
}

function intToBin(a) {
    return a.toString(2);
}

function hexToBytes(hex) {
    const byteArray = []
    for (let c = 0; c < hex.length; c += 2)
        byteArray.push(parseInt(hex.substr(c, 2), 16));
    return byteArray;
}

function intToBytes(integer, byteSize) {
    const hexString = integer.toString(16).padStart(byteSize * 2, '0');
    const byteArray = hexToBytes(hexString);
    return byteArray;
}

function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

function sha256(hexData) {
    const byteArray = CryptoJS.enc.Hex.parse(hexData);
    const hash = CryptoJS.SHA256(byteArray);
    return hash.toString(CryptoJS.enc.Hex);
}

function sha256FromString(data) {
    const hash = CryptoJS.SHA256(data);
    return hash.toString(CryptoJS.enc.Hex);
}

function hash160(pubk_hex) {
    const sha256hash = sha256(pubk_hex);
    const ripemd160hash = CryptoJS.RIPEMD160(CryptoJS.enc.Hex.parse(sha256hash));
    return ripemd160hash.toString(CryptoJS.enc.Hex);
}

function publicKeyToUncompressed(x, y) {
    const xHex = intToHex(x);
    const yHex = intToHex(y);
    return '04' + xHex + yHex;
}

function publicKeyToCompressed(x, y) {
    const xHex = intToHex(x);
    const prefix = y % 2n === 0n ? '02' : '03';
    return prefix + xHex;
}

function hash160ToAddress(hash, version = '00') {
    const versionHash = version + hash;
    const checksum = sha256(sha256(versionHash)).slice(0, 8);
    const addressHex = versionHash + checksum;
    return encodeBase58(addressHex);
}

function publicKeyToEthereumAddress(x, y) {
    const publicKeyBytes = hexToBytes(intToHex(x) + intToHex(y));
    const addressBytes = keccak256.array(publicKeyBytes).slice(-20);
    const address = bytesToHex(addressBytes);
    return "0x" + address
}

function privateKeyToWIF(privateKey, compressed = true, version = '80') {
    const privateKeyHex = intToHex(privateKey.toString(16));
    let privateKeyWithVersion = version + privateKeyHex;
    if (compressed) {
        privateKeyWithVersion += '01';
    }
    const checksum = sha256(sha256(privateKeyWithVersion)).slice(0, 8);
    const wif = privateKeyWithVersion + checksum;
    return encodeBase58(wif);
}