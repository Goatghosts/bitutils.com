const p = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
const a = 0x0000000000000000000000000000000000000000000000000000000000000000n;
const b = 0x0000000000000000000000000000000000000000000000000000000000000007n;
const Gx = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n;
const Gy = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n;
const curve_n = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

function isOnSecp256k1(x, y) {
    return mod((y ** 2n - x ** 3n - a * x - b), p) === 0n;
}

function doubleAndAdd(scalar) {
    let point = [Gx, Gy];
    let bits = scalar.toString(2);
    for (let bit of bits.slice(1)) {
        point = doublePoint(point[0], point[1]);
        if (bit === '1') {
            point = addPoint(point[0], point[1], Gx, Gy);
        }
    }
    return point;
}

function doublePoint(x, y) {
    const s = mod((3n * x * x + a) * modInv(2n * y, p), p);
    const x3 = mod(s * s - 2n * x, p);
    const y3 = mod(s * (x - x3) - y, p);
    return [x3, y3];
}

function addPoint(x1, y1, x2, y2) {
    const s = mod((y2 - y1) * modInv(x2 - x1, p), p);
    const x3 = mod(s * s - x1 - x2, p);
    const y3 = mod(s * (x1 - x3) - y1, p);
    return [x3, y3];
}


function calculateY(x, isOdd) {
    let ySquared = mod(x * x * x + 7n, p);
    let y = powMod(ySquared, (p + 1n) / 4n, p);
    if (mod((y * y), p) !== ySquared) {
        throw new Error("No y value for this x on this curve");
    }
    if ((y % 2n) !== BigInt(isOdd)) {
        return p - y;
    }
    return y;
}

