var dbits;
var canary = 0xdeadbeefcafe;
var j_lm = ((canary & 0xffffff) == 0xefcafe);

function BigInteger(a, b, c) {
  if (a != null) {
    if ("number" == typeof a) this.fromNumber(a, b, c);
    else if (b == null && "string" != typeof a) this.fromString(a, 256);
    else this.fromString(a, b);
  }
}

function nbi() {
  return new BigInteger(null);
}

function am1(i, x, w, j, c, n) {
  while (--n >= 0) {
    var v = x * this[i++] + w[j] + c;
    c = Math.floor(v / 0x4000000);
    w[j++] = v & 0x3ffffff;
  }
  return c;
}

function am2(i, x, w, j, c, n) {
  var xl = x & 0x3fff, xh = x >> 14;
  while (--n >= 0) {
    var l = this[i] & 0x3fff;
    var h = this[i++] >> 14;
    var m = xh * l + h * xl;
    l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
    c = (l >> 28) + (m >> 14) + xh * h;
    w[j++] = l & 0xfffffff;
  }
  return c;
}

function am3(i, x, w, j, c, n) {
  var xl = x & 0x3fff, xh = x >> 14;
  while (--n >= 0) {
    var l = this[i] & 0x3fff;
    var h = this[i++] >> 14;
    var m = xh * l + h * xl;
    l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
    c = (l >> 28) + (m >> 14) + xh * h;
    w[j++] = l & 0xfffffff;
  }
  return c;
}

BigInteger.prototype.am = am3;
dbits = 28;

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1 << dbits) - 1);
BigInteger.prototype.DV = (1 << dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2, BI_FP);
BigInteger.prototype.F1 = BI_FP - dbits;
BigInteger.prototype.F2 = 2 * dbits - BI_FP;

var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
for (var rr = 0; rr < BI_RM.length; ++rr) BI_RC[BI_RM.charCodeAt(rr)] = rr;

function int2char(n) {
  return BI_RM.charAt(n);
}

function op_and(x, y) {
  return x & y;
}

function op_or(x, y) {
  return x | y;
}

function op_xor(x, y) {
  return x ^ y;
}

function op_andnot(x, y) {
  return x & ~y;
}

function lbit(a) {
  if (a == 0) return -1;
  var r = 0;
  if ((a & 0xffff) == 0) { a >>= 16; r += 16; }
  if ((a & 0xff) == 0) { a >>= 8; r += 8; }
  if ((a & 0xf) == 0) { a >>= 4; r += 4; }
  if ((a & 0x3) == 0) { a >>= 2; r += 2; }
  if ((a & 0x1) == 0) ++r;
  return r;
}

function cbit(x) {
  var r = 0;
  while (x != 0) { x &= x - 1; ++r; }
  return r;
}

var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

BigInteger.prototype.clone = function () {
  var r = nbi();
  this.copyTo(r);
  return r;
};

BigInteger.prototype.intValue = function () {
  if (this.s < 0) {
    if (this.t == 1) return this[0] - this.DV;
    if (this.t == 0) return -1;
  } else {
    if (this.t == 1) return this[0];
    if (this.t == 0) return 0;
  }
  return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
};

BigInteger.prototype.byteValue = function () {
  return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
};

BigInteger.prototype.shortValue = function () {
  return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
};

BigInteger.prototype.signum = function () {
  if (this.s < 0) return -1;
  if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
  return 1;
};

BigInteger.prototype.toByteArray = function () {
  var i = this.t, r = new Array();
  r[0] = this.s;
  var p = this.DB - (i * this.DB) % 8, d, k = 0;
  if (i-- > 0) {
    if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
      r[k++] = d | (this.s << (this.DB - p));
    while (i >= 0) {
      if (p < 8) {
        d = (this[i] & ((1 << p) - 1)) << (8 - p);
        d |= this[--i] >> (p += this.DB - 8);
      } else {
        d = (this[i] >> (p -= 8)) & 0xff;
        if (p <= 0) { p += this.DB; --i; }
      }
      if ((d & 0x80) != 0) d |= -256;
      if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k;
      if (k > 0 || d != this.s) r[k++] = d;
    }
  }
  return r;
};

BigInteger.prototype.equals = function (a) {
  return (this.compareTo(a) == 0);
};

BigInteger.prototype.min = function (a) {
  return (this.compareTo(a) < 0) ? this : a;
};

BigInteger.prototype.max = function (a) {
  return (this.compareTo(a) > 0) ? this : a;
};

BigInteger.prototype.and = function (a) {
  var r = nbi();
  this.bitwiseTo(a, op_and, r);
  return r;
};

BigInteger.prototype.or = function (a) {
  var r = nbi();
  this.bitwiseTo(a, op_or, r);
  return r;
};

BigInteger.prototype.xor = function (a) {
  var r = nbi();
  this.bitwiseTo(a, op_xor, r);
  return r;
};

BigInteger.prototype.andNot = function (a) {
  var r = nbi();
  this.bitwiseTo(a, op_andnot, r);
  return r;
};

BigInteger.prototype.not = function () {
  var r = nbi();
  for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
  r.t = this.t;
  r.s = ~this.s;
  return r;
};

BigInteger.prototype.shiftLeft = function (n) {
  var r = nbi();
  if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r);
  return r;
};

BigInteger.prototype.shiftRight = function (n) {
  var r = nbi();
  if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r);
  return r;
};

BigInteger.prototype.getLowestSetBit = function () {
  for (var i = 0; i < this.t; ++i)
    if (this[i] != 0) return i * this.DB + lbit(this[i]);
  if (this.s < 0) return this.t * this.DB;
  return -1;
};

BigInteger.prototype.bitCount = function () {
  var r = 0, x = this.s & this.DM;
  for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
  return r;
};

BigInteger.prototype.testBit = function (n) {
  var j = Math.floor(n / this.DB);
  if (j >= this.t) return (this.s != 0);
  return ((this[j] & (1 << (n % this.DB))) != 0);
};

BigInteger.prototype.setBit = function (n) {
  return this.changeBit(n, op_or);
};

BigInteger.prototype.clearBit = function (n) {
  return this.changeBit(n, op_andnot);
};

BigInteger.prototype.flipBit = function (n) {
  return this.changeBit(n, op_xor);
};

BigInteger.prototype.add = function (a) {
  var r = nbi();
  this.addTo(a, r);
  return r;
};

BigInteger.prototype.subtract = function (a) {
  var r = nbi();
  this.subTo(a, r);
  return r;
};

BigInteger.prototype.multiply = function (a) {
  var r = nbi();
  this.multiplyTo(a, r);
  return r;
};

BigInteger.prototype.divide = function (a) {
  var r = nbi();
  this.divRemTo(a, r, null);
  return r;
};

BigInteger.prototype.remainder = function (a) {
  var r = nbi();
  this.divRemTo(a, null, r);
  return r;
};

BigInteger.prototype.divideAndRemainder = function (a) {
  var q = nbi(), r = nbi();
  this.divRemTo(a, q, r);
  return new Array(q, r);
};

BigInteger.prototype.modPow = function (e, m) {
  var i = e.bitLength(), k, r = nbv(1), z;
  if (i <= 0) return r;
  else if (i < 18) k = 1;
  else if (i < 48) k = 3;
  else if (i < 144) k = 4;
  else if (i < 768) k = 5;
  else k = 6;
  if (i < 8)
    z = new Classic(m);
  else if (m.isEven())
    z = new Barrett(m);
  else
    z = new Montgomery(m);
  var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
  g[1] = z.convert(this);
  if (k > 1) {
    var g2 = nbi();
    z.sqrTo(g[1], g2);
    while (n <= km) {
      g[n] = nbi();
      z.mulTo(g2, g[n - 2], g[n]);
      n += 2;
    }
  }
  var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
  i = nbits(e[j]) - 1;
  while (j >= 0) {
    if (i >= k1) w = (e[j] >> (i - k1)) & km;
    else {
      w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
      if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
    }
    n = k;
    while ((w & 1) == 0) { w >>= 1; --n; }
    if ((i -= n) < 0) { i += this.DB; --j; }
    if (is1) { r = g[w].copyTo(r); is1 = false; }
    else {
      while (n > 1) { z.sqrTo(r, r2); z.sqrTo(r2, r); n -= 2; }
      if (n > 0) z.sqrTo(r, r2); else { t = r; r = r2; r2 = t; }
      z.mulTo(r2, g[w], r);
    }
    while (j >= 0 && (e[j] & (1 << i)) == 0) {
      z.sqrTo(r, r2); t = r; r = r2; r2 = t;
      if (--i < 0) { i = this.DB - 1; --j; }
    }
  }
  return z.revert(r);
};

BigInteger.prototype.modInverse = function (m) {
  var ac = m.isEven();
  if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
  var u = m.clone(), v = this.clone();
  var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
  while (u.signum() != 0) {
    while (u.isEven()) {
      u.rShiftTo(1, u);
      if (ac) {
        if (!a.isEven() || !b.isEven()) { a.addTo(this, a); b.subTo(m, b); }
        a.rShiftTo(1, a);
      } else if (!b.isEven())
        b.subTo(m, b);
      b.rShiftTo(1, b);
    }
    while (v.isEven()) {
      v.rShiftTo(1, v);
      if (ac) {
        if (!c.isEven() || !d.isEven()) { c.addTo(this, c); d.subTo(m, d); }
        c.rShiftTo(1, c);
      } else if (!d.isEven())
        d.subTo(m, d);
      d.rShiftTo(1, d);
    }
    if (u.compareTo(v) >= 0) {
      u.subTo(v, u);
      if (ac) a.subTo(c, a);
      b.subTo(d, b);
    } else {
      v.subTo(u, v);
      if (ac) c.subTo(a, c);
      d.subTo(b, d);
    }
  }
  if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
  if (d.compareTo(m) >= 0) return d.subtract(m);
  if (d.signum() < 0) d.addTo(m, d); else return d;
  if (d.signum() < 0) return d.add(m); else return d;
};

BigInteger.prototype.pow = function (e) {
  return this.exp(e, new NullExp());
};

BigInteger.prototype.gcd = function (a) {
  var x = (this.s < 0) ? this.negate() : this.clone();
  var y = (a.s < 0) ? a.negate() : a.clone();
  if (x.compareTo(y) < 0) { var t = x; x = y; y = t; }
  var i = x.getLowestSetBit(), g = y.getLowestSetBit();
  if (g < 0) return x;
  if (i < g) g = i;
  if (g > 0) {
    x.rShiftTo(g, x);
    y.rShiftTo(g, y);
  }
  while (x.signum() > 0) {
    if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
    if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
    if (x.compareTo(y) >= 0) {
      x.subTo(y, x);
      x.rShiftTo(1, x);
    } else {
      y.subTo(x, y);
      y.rShiftTo(1, y);
    }
  }
  if (g > 0) y.lShiftTo(g, y);
  return y;
};

BigInteger.prototype.isProbablePrime = function (t) {
  var i, x = this.abs();
  if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
    for (i = 0; i < lowprimes.length; ++i)
      if (x[0] == lowprimes[i]) return true;
    return false;
  }
  if (x.isEven()) return false;
  i = 1;
  while (i < lowprimes.length) {
    var m = lowprimes[i], j = i + 1;
    while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
    m = x.modInt(m);
    while (i < j) if (m % lowprimes[i++] == 0) return false;
  }
  return x.millerRabin(t);
};

BigInteger.prototype.copyTo = function (r) {
  for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
};

BigInteger.prototype.fromInt = function (x) {
  this.t = 1;
  this.s = (x < 0) ? -1 : 0;
  if (x > 0) this[0] = x;
  else if (x < -1) this[0] = x + this.DV;
  else this.t = 0;
};

function nbv(i) {
  var r = nbi();
  r.fromInt(i);
  return r;
}

BigInteger.prototype.fromString = function (s, b) {
  var k;
  if (b == 16) k = 4;
  else if (b == 8) k = 3;
  else if (b == 256) k = 8;
  else if (b == 2) k = 1;
  else if (b == 32) k = 5;
  else if (b == 4) k = 2;
  else { this.fromRadix(s, b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while (--i >= 0) {
    var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
    if (x < 0) {
      if (s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if (sh == 0)
      this[this.t++] = x;
    else if (sh + k > this.DB) {
      this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
      this[this.t++] = (x >> (this.DB - sh));
    } else
      this[this.t - 1] |= x << sh;
    sh += k;
    if (sh >= this.DB) sh -= this.DB;
  }
  if (k == 8 && (s[0] & 0x80) != 0) {
    this.s = -1;
    if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
  }
  this.clamp();
  if (mi) BigInteger.ZERO.subTo(this, this);
};

BigInteger.prototype.clamp = function () {
  var c = this.s & this.DM;
  while (this.t > 0 && this[this.t - 1] == c) --this.t;
};

BigInteger.prototype.dlShiftTo = function (n, r) {
  var i;
  for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
  for (i = n - 1; i >= 0; --i) r[i] = 0;
  r.t = this.t + n;
  r.s = this.s;
};

BigInteger.prototype.drShiftTo = function (n, r) {
  for (var i = n; i < this.t; ++i) r[i - n] = this[i];
  r.t = Math.max(this.t - n, 0);
  r.s = this.s;
};

BigInteger.prototype.lShiftTo = function (n, r) {
  var bs = n % this.DB;
  var cbs = this.DB - bs;
  var bm = (1 << cbs) - 1;
  var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
  for (i = this.t - 1; i >= 0; --i) {
    r[i + ds + 1] = (this[i] >> cbs) | c;
    c = (this[i] & bm) << bs;
  }
  for (i = ds - 1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t + ds + 1;
  r.s = this.s;
  r.clamp();
};

BigInteger.prototype.rShiftTo = function (n, r) {
  r.s = this.s;
  var ds = Math.floor(n / this.DB);
  if (ds >= this.t) { r.t = 0; return; }
  var bs = n % this.DB;
  var cbs = this.DB - bs;
  var bm = (1 << bs) - 1;
  r[0] = this[ds] >> bs;
  for (var i = ds + 1; i < this.t; ++i) {
    r[i - ds - 1] |= (this[i] & bm) << cbs;
    r[i - ds] = this[i] >> bs;
  }
  if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
  r.t = this.t - ds;
  r.clamp();
};

BigInteger.prototype.subTo = function (a, r) {
  var i = 0, c = 0, m = Math.min(a.t, this.t);
  while (i < m) {
    c += this[i] - a[i];
    r[i++] = c & this.DM;
    c >>= this.DB;
  }
  if (a.t < this.t) {
    c -= a.s;
    while (i < this.t) {
      c += this[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    c += this.s;
  } else {
    c += this.s;
    while (i < a.t) {
      c -= a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c < 0) ? -1 : 0;
  if (c < -1) r[i++] = this.DV + c;
  else if (c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
};

BigInteger.prototype.multiplyTo = function (a, r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i + y.t;
  while (--i >= 0) r[i] = 0;
  for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
  r.s = 0;
  r.clamp();
  if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
};

BigInteger.prototype.divRemTo = function (m, q, r) {
  var pm = m.abs();
  if (pm.t <= 0) return;
  var pt = this.abs();
  if (pt.t < pm.t) {
    if (q != null) q.fromInt(0);
    if (r != null) this.copyTo(r);
    return;
  }
  if (r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB - nbits(pm[pm.t - 1]);
  if (nsh > 0) { pm.lShiftTo(nsh, y); pt.lShiftTo(nsh, r); } else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys - 1];
  if (y0 == 0) return;
  var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
  var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e2 = 1 << this.F2;
  var i = r.t, j = i - ys, t = (q == null) ? nbi() : q;
  y.dlShiftTo(j, t);
  if (r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t, r);
  }
  BigInteger.ONE.dlShiftTo(ys, t);
  t.subTo(y, y);
  while (y.t < ys) y[y.t++] = 0;
  while (--j >= 0) {
    var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e2) * d2);
    if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
      y.dlShiftTo(j, t);
      r.subTo(t, r);
      while (r[i] < --qd) r.subTo(t, r);
    }
  }
  if (q != null) {
    r.drShiftTo(ys, q);
    if (ts != ms) BigInteger.ZERO.subTo(q, q);
  }
  r.t = ys;
  r.clamp();
  if (nsh > 0) r.rShiftTo(nsh, r);
  if (ts < 0) BigInteger.ZERO.subTo(r, r);
};

BigInteger.prototype.mod = function (a) {
  var r = nbi();
  this.abs().divRemTo(a, null, r);
  if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
  return r;
};

BigInteger.prototype.modPowInt = function (e, m) {
  var z;
  if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e, z);
};

BigInteger.prototype.exp = function (e, z) {
  if (e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
  g.copyTo(r);
  while (--i >= 0) {
    z.sqrTo(r, r2);
    if ((e & (1 << i)) > 0) z.mulTo(r2, g, r); else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
};

BigInteger.prototype.isEven = function () {
  return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
};

BigInteger.prototype.compareTo = function (a) {
  var r = this.s - a.s;
  if (r != 0) return r;
  var i = this.t;
  r = i - a.t;
  if (r != 0) return (this.s < 0) ? -r : r;
  while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
  return 0;
};

BigInteger.prototype.am = am3;

BigInteger.prototype.fromNumber = function (a, b, c) {
  if ("number" == typeof b) {
    if (a < 2) this.fromInt(1);
    else {
      this.fromNumber(a, c);
      if (!this.isProbablePrime(b)) {
        this.fromNumber(a + 1, c);
        this.divide(BigInteger.valueOf(a), this);
      }
    }
  } else {
    var x = new Array(), t = a & 7;
    x.length = (a >> 3) + 1;
    b.nextBytes(x);
    if (t > 0) x[0] &= ((1 << t) - 1); else x[0] = 0;
    this.fromString(x, 256);
  }
};

BigInteger.prototype.fromRadix = function (s, b) {
  this.fromInt(0);
  if (b == null) b = 10;
  var cs = this.chunkSize(b);
  var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
  for (var i = 0; i < s.length; ++i) {
    var x = intAt(s, i);
    if (x < 0) {
      if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
      continue;
    }
    w = b * w + x;
    if (++j >= cs) {
      this.dMultiply(d);
      this.dAddOffset(w, 0);
      j = 0; w = 0;
    }
  }
  if (j > 0) {
    this.dMultiply(Math.pow(b, j));
    this.dAddOffset(w, 0);
  }
  if (mi) BigInteger.ZERO.subTo(this, this);
};

BigInteger.prototype.fromByteArray = function (a) {
  this.fromString(a, 256);
};

BigInteger.prototype.chunkSize = function (r) {
  return Math.floor(Math.LN2 * this.DB / Math.log(r));
};

BigInteger.prototype.dMultiply = function (n) {
  this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
  ++this.t;
  this.clamp();
};

BigInteger.prototype.dAddOffset = function (n, w) {
  if (n == 0) return;
  while (this.t <= w) this[this.t++] = 0;
  this[w] += n;
  while (this[w] >= this.DV) {
    this[w] -= this.DV;
    if (++w >= this.t) this[this.t++] = 0;
    ++this[w];
  }
};

BigInteger.prototype.intValue = function () {
  if (this.s < 0) {
    if (this.t == 1) return this[0] - this.DV;
    if (this.t == 0) return -1;
  } else {
    if (this.t == 1) return this[0];
    if (this.t == 0) return 0;
  }
  return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
};

BigInteger.prototype.byteValue = function () {
  return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
};

BigInteger.prototype.shortValue = function () {
  return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
};

BigInteger.prototype.signum = function () {
  if (this.s < 0) return -1;
  if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
  return 1;
};

BigInteger.prototype.toByteArray = function () {
  var i = this.t, r = new Array();
  r[0] = this.s;
  var p = this.DB - (i * this.DB) % 8, d, k = 0;
  if (i-- > 0) {
    if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
      r[k++] = d | (this.s << (this.DB - p));
    while (i >= 0) {
      if (p < 8) {
        d = (this[i] & ((1 << p) - 1)) << (8 - p);
        d |= this[--i] >> (p += this.DB - 8);
      } else {
        d = (this[i] >> (p -= 8)) & 0xff;
        if (p <= 0) { p += this.DB; --i; }
      }
      if ((d & 0x80) != 0) d |= -256;
      if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k;
      if (k > 0 || d != this.s) r[k++] = d;
    }
  }
  return r;
};

BigInteger.prototype.equals = function (a) { return (this.compareTo(a) == 0); };
BigInteger.prototype.min = function (a) { return (this.compareTo(a) < 0) ? this : a; };
BigInteger.prototype.max = function (a) { return (this.compareTo(a) > 0) ? this : a; };

BigInteger.prototype.negate = function () {
  var r = nbi();
  BigInteger.ZERO.subTo(this, r);
  return r;
};

BigInteger.prototype.abs = function () {
  return (this.s < 0) ? this.negate() : this;
};

BigInteger.prototype.bitwiseTo = function (a, op, r) {
  var i, f, m = Math.min(a.t, this.t);
  for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
  if (a.t < this.t) {
    f = a.s & this.DM;
    for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
    r.t = this.t;
  } else {
    f = this.s & this.DM;
    for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
    r.t = a.t;
  }
  r.s = op(this.s, a.s);
  r.clamp();
};

BigInteger.prototype.changeBit = function (n, op) {
  var r = BigInteger.ONE.shiftLeft(n);
  this.bitwiseTo(r, op, r);
  return r;
};

BigInteger.prototype.addTo = function (a, r) {
  var i = 0, c = 0, m = Math.min(a.t, this.t);
  while (i < m) {
    c += this[i] + a[i];
    r[i++] = c & this.DM;
    c >>= this.DB;
  }
  if (a.t < this.t) {
    c += a.s;
    while (i < this.t) {
      c += this[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    c += this.s;
  } else {
    c += this.s;
    while (i < a.t) {
      c += a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    c += a.s;
  }
  r.s = (c < 0) ? -1 : 0;
  if (c > 0) r[i++] = c;
  else if (c < -1) r[i++] = this.DV + c;
  r.t = i;
  r.clamp();
};

BigInteger.prototype.millerRabin = function (t) {
  var n1 = this.subtract(BigInteger.ONE);
  var k = n1.getLowestSetBit();
  if (k <= 0) return false;
  var r = n1.shiftRight(k);
  t = (t + 1) >> 1;
  if (t > lowprimes.length) t = lowprimes.length;
  var a = nbi();
  for (var i = 0; i < t; ++i) {
    a.fromInt(lowprimes[i]);
    var y = a.modPow(r, this);
    if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
      var j = 1;
      while (j++ < k && y.compareTo(n1) != 0) {
        y = y.modPowInt(2, this);
        if (y.compareTo(BigInteger.ONE) == 0) return false;
      }
      if (y.compareTo(n1) != 0) return false;
    }
  }
  return true;
};

BigInteger.prototype.modInt = function (m) {
  if (m <= 0) return 0;
  var d = this.DV % m, r = (this.s < 0) ? m - 1 : 0;
  if (this.t > 0)
    if (d == 0) r = this[0] % m;
    else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % m;
  return r;
};

BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

function Classic(m) { this.m = m; }
Classic.prototype.convert = function (x) { if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m); else return x; };
Classic.prototype.revert = function (x) { return x; };
Classic.prototype.reduce = function (x) { x.divRemTo(this.m, null, x); };
Classic.prototype.mulTo = function (x, y, r) { x.multiplyTo(y, r); this.reduce(r); };
Classic.prototype.sqrTo = function (x, r) { x.squareTo(r); this.reduce(r); };

function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp & 0x7fff;
  this.mph = this.mp >> 15;
  this.um = (1 << (BigInteger.prototype.DB - 15)) - 1;
  this.mt2 = 2 * m.t;
}
Montgomery.prototype.convert = function (x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t, r);
  r.divRemTo(this.m, null, r);
  if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
  return r;
};
Montgomery.prototype.revert = function (x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
};
Montgomery.prototype.reduce = function (x) {
  while (x.t <= this.mt2) x[x.t++] = 0;
  for (var i = 0; i < this.m.t; ++i) {
    var j = x[i] & 0x7fff;
    var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & BigInteger.prototype.DM;
    j = i + this.m.t;
    x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
    while (x[j] >= BigInteger.prototype.DV) { x[j] -= BigInteger.prototype.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t, x);
  if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
};
Montgomery.prototype.mulTo = function (x, y, r) { x.multiplyTo(y, r); this.reduce(r); };
Montgomery.prototype.sqrTo = function (x, r) { x.squareTo(r); this.reduce(r); };

function Barrett(m) {
  this.r2 = nbi();
  this.q3 = nbi();
  BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
  this.mu = this.r2.divide(m);
  this.m = m;
}
Barrett.prototype.convert = function (x) {
  if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
  else if (x.compareTo(this.m) < 0) return x;
  else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
};
Barrett.prototype.revert = function (x) { return x; };
Barrett.prototype.reduce = function (x) {
  x.drShiftTo(this.m.t - 1, this.r2);
  if (x.t > this.m.t + 1) { x.t = this.m.t + 1; x.clamp(); }
  this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
  this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
  while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
  x.subTo(this.r2, x);
  while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
};
Barrett.prototype.mulTo = function (x, y, r) { x.multiplyTo(y, r); this.reduce(r); };
Barrett.prototype.sqrTo = function (x, r) { x.squareTo(r); this.reduce(r); };

function NullExp() { }
NullExp.prototype.convert = function (x) { return x; };
NullExp.prototype.revert = function (x) { return x; };
NullExp.prototype.mulTo = function (x, y, r) { x.multiplyTo(y, r); };
NullExp.prototype.sqrTo = function (x, r) { x.squareTo(r); };

function nbits(x) {
  var r = 1, t;
  if ((t = x >>> 16) != 0) { x = t; r += 16; }
  if ((t = x >> 8) != 0) { x = t; r += 8; }
  if ((t = x >> 4) != 0) { x = t; r += 4; }
  if ((t = x >> 2) != 0) { x = t; r += 2; }
  if ((t = x >> 1) != 0) { x = t; r += 1; }
  return r;
}

BigInteger.prototype.squareTo = function (r) {
  var x = this.abs();
  var i = r.t = 2 * x.t;
  while (--i >= 0) r[i] = 0;
  for (i = 0; i < x.t - 1; ++i) {
    var c = x.am(i, x[i], r, 2 * i, 0, 1);
    if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
      r[i + x.t] -= x.DV;
      r[i + x.t + 1] = 1;
    }
  }
  if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
  r.t = x.t;
  r.clamp();
};

BigInteger.prototype.multiplyUpperTo = function (a, n, r) {
  --n;
  var i = r.t = this.t + a.t - n;
  r.s = 0;
  while (--i >= 0) r[i] = 0;
  for (i = Math.max(n - this.t, 0); i < a.t; ++i)
    r[this.t + i - n] = this.am(0, a[i], r, Math.max(0, n - i), Math.min(this.t, this.t + i - n), n);
  r.clamp();
  r.drShiftTo(1, r);
};

BigInteger.prototype.multiplyLowerTo = function (a, n, r) {
  var i = Math.min(this.t + a.t, n);
  r.s = 0;
  r.t = i;
  while (i > 0) r[--i] = 0;
  for (var j = Math.max(n - this.t, 0); i < this.t; ++i) {
    if (i >= n) j = 0;
    var k = Math.min(a.t, n - i);
    for (var l = 0; l < k; ++l) r[i + l] += this.am(0, a[l], r, i, 0, k);
  }
  r.clamp();
};

BigInteger.prototype.invDigit = function () {
  if (this.t < 1) return 0;
  var x = this[0];
  if ((x & 1) == 0) return 0;
  var y = x & 3;
  y = (y * (2 - (x & 0xf) * y)) & 0xf;
  y = (y * (2 - (x & 0xff) * y)) & 0xff;
  y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;
  y = (y * (2 - x * y % this.DV)) % this.DV;
  return (y > 0) ? this.DV - y : -y;
};

BigInteger.prototype.valueOf = function () { return this.intValue(); };

function intAt(s, i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c == null) ? -1 : c;
}

BigInteger.prototype.toString = function (b) {
  if (this.s < 0) return "-" + this.negate().toString(b);
  var k;
  if (b == 16) k = 4;
  else if (b == 8) k = 3;
  else if (b == 2) k = 1;
  else if (b == 32) k = 5;
  else if (b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
  var p = this.DB - (i * this.DB) % k;
  if (i-- > 0) {
    if (p < this.DB && (d = this[i] >> p) > 0) { m = true; r = int2char(d); }
    while (i >= 0) {
      if (p < k) {
        d = (this[i] & ((1 << p) - 1)) << (k - p);
        d |= this[--i] >> (p += this.DB - k);
      } else {
        d = (this[i] >> (p -= k)) & km;
        if (p <= 0) { p += this.DB; --i; }
      }
      if (d > 0) m = true;
      if (m) r += int2char(d);
    }
  }
  return m ? r : "0";
};

BigInteger.prototype.toRadix = function (b) {
  if (b == null) b = 10;
  if (this.signum() == 0 || b < 2 || b > 36) return "0";
  var cs = this.chunkSize(b);
  var a = Math.pow(b, cs);
  var d = nbv(a), y = nbi(), z = nbi(), r = "";
  this.divRemTo(d, y, z);
  while (y.signum() > 0) {
    r = (a + z.intValue()).toString(b).substr(1) + r;
    y.divRemTo(d, y, z);
  }
  return z.intValue().toString(b) + r;
};

function parseBigInt(str, r) {
  return new BigInteger(str, r);
}

function pkcs1pad2(s, n) {
  if (n < s.length + 11) {
    throw new Error("Message too long for RSA");
  }
  var ba = new Array();
  var i = s.length - 1;
  while (i >= 0 && n > 0) {
    var c = s.charCodeAt(i--);
    if (c < 128) {
      ba[--n] = c;
    } else if ((c > 127) && (c < 2048)) {
      ba[--n] = (c & 63) | 128;
      ba[--n] = (c >> 6) | 192;
    } else {
      ba[--n] = (c & 63) | 128;
      ba[--n] = ((c >> 6) & 63) | 128;
      ba[--n] = (c >> 12) | 224;
    }
  }
  ba[--n] = 0;
  var rng = new SecureRandom();
  var x = new Array();
  while (n > 2) {
    x[0] = 0;
    while (x[0] == 0) rng.nextBytes(x);
    ba[--n] = x[0];
  }
  ba[--n] = 2;
  ba[--n] = 0;
  return new BigInteger(ba);
}

function SecureRandom() { }
SecureRandom.prototype.nextBytes = function (ba) {
  for (var i = 0; i < ba.length; ++i) {
    ba[i] = Math.floor(Math.random() * 256);
  }
};

function RSAKey() {
  this.n = null;
  this.e = 0;
  this.d = null;
  this.p = null;
  this.q = null;
  this.dmp1 = null;
  this.dmq1 = null;
  this.coeff = null;
}

RSAKey.prototype.setPublic = function (N, E) {
  if (N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N, 16);
    this.e = parseInt(E, 16);
  } else {
    throw new Error("Invalid RSA public key");
  }
};

RSAKey.prototype.encrypt = function (text) {
  var m = pkcs1pad2(text, (this.n.bitLength() + 7) >> 3);
  if (m == null) return null;
  var c = this.doPublic(m);
  if (c == null) return null;
  var h = c.toString(16);
  if ((h.length & 1) == 0) return h;
  else return "0" + h;
};

RSAKey.prototype.doPublic = function (x) {
  return x.modPowInt(this.e, this.n);
};

BigInteger.prototype.bitLength = function () {
  if (this.t <= 0) return 0;
  return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
};

function b64tohex(s) {
  var ret = "";
  var i = 0;
  var k = 0;
  var slop = 0;
  for (i = 0; i < s.length; ++i) {
    if (s.charAt(i) == "=") break;
    var v = base64Chars.indexOf(s.charAt(i));
    if (v < 0) continue;
    if (k == 0) {
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 1;
    } else if (k == 1) {
      ret += int2char((slop << 2) | (v >> 4));
      slop = v & 0xf;
      k = 2;
    } else if (k == 2) {
      ret += int2char(slop);
      ret += int2char(v >> 2);
      slop = v & 3;
      k = 3;
    } else {
      ret += int2char((slop << 2) | (v >> 4));
      ret += int2char(v & 0xf);
      k = 0;
    }
  }
  return ret;
}

var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function hex2b64(h) {
  var i;
  var c;
  var ret = "";
  for (i = 0; i + 3 <= h.length; i += 3) {
    c = parseInt(h.substring(i, i + 3), 16);
    ret += base64Chars.charAt((c >> 6) & 63) + base64Chars.charAt(c & 63);
  }
  if (i + 1 == h.length) {
    c = parseInt(h.substring(i, i + 1), 16);
    ret += base64Chars.charAt(c << 2);
  } else if (i + 2 == h.length) {
    c = parseInt(h.substring(i, i + 2), 16);
    ret += base64Chars.charAt((c >> 2) & 63) + base64Chars.charAt((c << 4) & 63);
  }
  while ((ret.length & 3) > 0) ret += "=";
  return ret;
}

function readASN1PublicKey(b64) {
  var hex = b64tohex(b64);
  var a = parseASN1Hex(hex);
  if (a == null) return null;
  var rsa = new RSAKey();
  rsa.setPublic(a.modulus, a.exponent);
  return rsa;
}

function parseASN1Hex(hex) {
  var pos = 0;
  if (hex.substring(0, 2) != "30") return null;
  pos = 2;
  var len = readASN1Length(hex, pos);
  if (len == null) return null;
  pos = len.nextPos;
  if (hex.substring(pos, pos + 2) != "30") return null;
  pos += 2;
  len = readASN1Length(hex, pos);
  if (len == null) return null;
  pos = len.nextPos;
  if (hex.substring(pos, pos + 2) != "06") return null;
  pos += 2;
  len = readASN1Length(hex, pos);
  if (len == null) return null;
  pos = len.nextPos + len.length;
  if (hex.substring(pos, pos + 2) != "03") return null;
  pos += 2;
  len = readASN1Length(hex, pos);
  if (len == null) return null;
  pos = len.nextPos;
  pos += 2;
  if (hex.substring(pos, pos + 2) != "30") return null;
  pos += 2;
  len = readASN1Length(hex, pos);
  if (len == null) return null;
  pos = len.nextPos;
  if (hex.substring(pos, pos + 2) != "02") return null;
  pos += 2;
  len = readASN1Length(hex, pos);
  if (len == null) return null;
  pos = len.nextPos;
  var modulusHex = hex.substring(pos, pos + len.length);
  if (modulusHex.substring(0, 2) == "00") modulusHex = modulusHex.substring(2);
  pos += len.length;
  if (hex.substring(pos, pos + 2) != "02") return null;
  pos += 2;
  len = readASN1Length(hex, pos);
  if (len == null) return null;
  pos = len.nextPos;
  var exponentHex = hex.substring(pos, pos + len.length);
  return { modulus: modulusHex, exponent: exponentHex };
}

function readASN1Length(hex, pos) {
  var first = parseInt(hex.substring(pos, pos + 2), 16);
  pos += 2;
  if (first < 128) {
    return { length: first, nextPos: pos };
  }
  var numBytes = first & 0x7f;
  var len = 0;
  for (var i = 0; i < numBytes; i++) {
    len = len * 256 + parseInt(hex.substring(pos, pos + 2), 16);
    pos += 2;
  }
  return { length: len, nextPos: pos };
}

function encryptRSA(text, publicKeyB64) {
  var rsa = readASN1PublicKey(publicKeyB64);
  if (rsa == null) {
    throw new Error("无效的RSA公钥");
  }
  var hex = rsa.encrypt(text);
  if (hex == null) {
    throw new Error("RSA加密失败");
  }
  return hex2b64(hex);
}

module.exports = {
  encryptRSA: encryptRSA
};
