
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