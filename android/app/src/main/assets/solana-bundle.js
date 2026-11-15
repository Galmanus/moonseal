(() => {
  var __create = Object.create;
  var __getProtoOf = Object.getPrototypeOf;
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  function __accessProp(key) {
    return this[key];
  }
  var __toESMCache_node;
  var __toESMCache_esm;
  var __toESM = (mod, isNodeMode, target) => {
    var canCache = mod != null && typeof mod === "object";
    if (canCache) {
      var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
      var cached = cache.get(mod);
      if (cached)
        return cached;
    }
    target = mod != null ? __create(__getProtoOf(mod)) : {};
    const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
    if (canCache)
      cache.set(mod, to);
    return to;
  };
  var __toCommonJS = (from) => {
    var entry = (__moduleCache ??= new WeakMap).get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function") {
      for (var key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(entry, key))
          __defProp(entry, key, {
            get: __accessProp.bind(from, key),
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
          });
    }
    __moduleCache.set(from, entry);
    return entry;
  };
  var __moduleCache;
  var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
  var __returnValue = (v) => v;
  function __exportSetter(name, newValue) {
    this[name] = __returnValue.bind(null, newValue);
  }
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: __exportSetter.bind(all, name)
      });
  };
  var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

  // node:buffer
  var exports_buffer = {};
  __export(exports_buffer, {
    transcode: () => transcode,
    resolveObjectURL: () => resolveObjectURL,
    kStringMaxLength: () => kStringMaxLength,
    kMaxLength: () => kMaxLength,
    isUtf8: () => isUtf8,
    isAscii: () => isAscii,
    default: () => buffer_default,
    constants: () => constants,
    btoa: () => btoa,
    atob: () => atob,
    INSPECT_MAX_BYTES: () => INSPECT_MAX_BYTES,
    File: () => File,
    Buffer: () => Buffer2,
    Blob: () => Blob
  });
  function getLens(b64) {
    var len2 = b64.length;
    if (len2 % 4 > 0)
      throw Error("Invalid string. Length must be a multiple of 4");
    var validLen = b64.indexOf("=");
    if (validLen === -1)
      validLen = len2;
    var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
    return [validLen, placeHoldersLen];
  }
  function _byteLength(validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function toByteArray(b64) {
    var tmp, lens = getLens(b64), validLen = lens[0], placeHoldersLen = lens[1], arr = new Uint8Array(_byteLength(validLen, placeHoldersLen)), curByte = 0, len2 = placeHoldersLen > 0 ? validLen - 4 : validLen, i2;
    for (i2 = 0;i2 < len2; i2 += 4)
      tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)], arr[curByte++] = tmp >> 16 & 255, arr[curByte++] = tmp >> 8 & 255, arr[curByte++] = tmp & 255;
    if (placeHoldersLen === 2)
      tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4, arr[curByte++] = tmp & 255;
    if (placeHoldersLen === 1)
      tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2, arr[curByte++] = tmp >> 8 & 255, arr[curByte++] = tmp & 255;
    return arr;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
  }
  function encodeChunk(uint8, start, end) {
    var tmp, output = [];
    for (var i2 = start;i2 < end; i2 += 3)
      tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255), output.push(tripletToBase64(tmp));
    return output.join("");
  }
  function fromByteArray(uint8) {
    var tmp, len2 = uint8.length, extraBytes = len2 % 3, parts = [], maxChunkLength = 16383;
    for (var i2 = 0, len22 = len2 - extraBytes;i2 < len22; i2 += maxChunkLength)
      parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
    if (extraBytes === 1)
      tmp = uint8[len2 - 1], parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
    else if (extraBytes === 2)
      tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1], parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
    return parts.join("");
  }
  function read(buffer, offset, isLE, mLen, nBytes) {
    var e, m, eLen = nBytes * 8 - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, nBits = -7, i2 = isLE ? nBytes - 1 : 0, d = isLE ? -1 : 1, s = buffer[offset + i2];
    i2 += d, e = s & (1 << -nBits) - 1, s >>= -nBits, nBits += eLen;
    for (;nBits > 0; e = e * 256 + buffer[offset + i2], i2 += d, nBits -= 8)
      ;
    m = e & (1 << -nBits) - 1, e >>= -nBits, nBits += mLen;
    for (;nBits > 0; m = m * 256 + buffer[offset + i2], i2 += d, nBits -= 8)
      ;
    if (e === 0)
      e = 1 - eBias;
    else if (e === eMax)
      return m ? NaN : (s ? -1 : 1) * (1 / 0);
    else
      m = m + Math.pow(2, mLen), e = e - eBias;
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  }
  function write(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c, eLen = nBytes * 8 - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, i2 = isLE ? 0 : nBytes - 1, d = isLE ? 1 : -1, s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    if (value = Math.abs(value), isNaN(value) || value === 1 / 0)
      m = isNaN(value) ? 1 : 0, e = eMax;
    else {
      if (e = Math.floor(Math.log(value) / Math.LN2), value * (c = Math.pow(2, -e)) < 1)
        e--, c *= 2;
      if (e + eBias >= 1)
        value += rt / c;
      else
        value += rt * Math.pow(2, 1 - eBias);
      if (value * c >= 2)
        e++, c /= 2;
      if (e + eBias >= eMax)
        m = 0, e = eMax;
      else if (e + eBias >= 1)
        m = (value * c - 1) * Math.pow(2, mLen), e = e + eBias;
      else
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen), e = 0;
    }
    for (;mLen >= 8; buffer[offset + i2] = m & 255, i2 += d, m /= 256, mLen -= 8)
      ;
    e = e << mLen | m, eLen += mLen;
    for (;eLen > 0; buffer[offset + i2] = e & 255, i2 += d, e /= 256, eLen -= 8)
      ;
    buffer[offset + i2 - d] |= s * 128;
  }
  function createBuffer(length) {
    if (length > kMaxLength)
      throw RangeError('The value "' + length + '" is invalid for option "size"');
    let buf = new Uint8Array(length);
    return Object.setPrototypeOf(buf, Buffer2.prototype), buf;
  }
  function E(sym, getMessage, Base) {
    return class extends Base {
      constructor() {
        super();
        Object.defineProperty(this, "message", { value: getMessage.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${sym}]`, this.stack, delete this.name;
      }
      get code() {
        return sym;
      }
      set code(value) {
        Object.defineProperty(this, "code", { configurable: true, enumerable: true, value, writable: true });
      }
      toString() {
        return `${this.name} [${sym}]: ${this.message}`;
      }
    };
  }
  function Buffer2(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      if (typeof encodingOrOffset === "string")
        throw TypeError('The "string" argument must be of type string. Received type number');
      return allocUnsafe(arg);
    }
    return from(arg, encodingOrOffset, length);
  }
  function from(value, encodingOrOffset, length) {
    if (typeof value === "string")
      return fromString(value, encodingOrOffset);
    if (ArrayBuffer.isView(value))
      return fromArrayView(value);
    if (value == null)
      throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer))
      return fromArrayBuffer(value, encodingOrOffset, length);
    if (typeof SharedArrayBuffer < "u" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer)))
      return fromArrayBuffer(value, encodingOrOffset, length);
    if (typeof value === "number")
      throw TypeError('The "value" argument must not be of type number. Received type number');
    let valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value)
      return Buffer2.from(valueOf, encodingOrOffset, length);
    let b = fromObject(value);
    if (b)
      return b;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function")
      return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
    throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
  }
  function assertSize(size) {
    if (typeof size !== "number")
      throw TypeError('"size" argument must be of type number');
    else if (size < 0)
      throw RangeError('The value "' + size + '" is invalid for option "size"');
  }
  function alloc(size, fill, encoding) {
    if (assertSize(size), size <= 0)
      return createBuffer(size);
    if (fill !== undefined)
      return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
    return createBuffer(size);
  }
  function allocUnsafe(size) {
    return assertSize(size), createBuffer(size < 0 ? 0 : checked(size) | 0);
  }
  function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "")
      encoding = "utf8";
    if (!Buffer2.isEncoding(encoding))
      throw TypeError("Unknown encoding: " + encoding);
    let length = byteLength(string, encoding) | 0, buf = createBuffer(length), actual = buf.write(string, encoding);
    if (actual !== length)
      buf = buf.slice(0, actual);
    return buf;
  }
  function fromArrayLike(array) {
    let length = array.length < 0 ? 0 : checked(array.length) | 0, buf = createBuffer(length);
    for (let i2 = 0;i2 < length; i2 += 1)
      buf[i2] = array[i2] & 255;
    return buf;
  }
  function fromArrayView(arrayView) {
    if (isInstance(arrayView, Uint8Array)) {
      let copy = new Uint8Array(arrayView);
      return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
    }
    return fromArrayLike(arrayView);
  }
  function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset)
      throw RangeError('"offset" is outside of buffer bounds');
    if (array.byteLength < byteOffset + (length || 0))
      throw RangeError('"length" is outside of buffer bounds');
    let buf;
    if (byteOffset === undefined && length === undefined)
      buf = new Uint8Array(array);
    else if (length === undefined)
      buf = new Uint8Array(array, byteOffset);
    else
      buf = new Uint8Array(array, byteOffset, length);
    return Object.setPrototypeOf(buf, Buffer2.prototype), buf;
  }
  function fromObject(obj) {
    if (Buffer2.isBuffer(obj)) {
      let len2 = checked(obj.length) | 0, buf = createBuffer(len2);
      if (buf.length === 0)
        return buf;
      return obj.copy(buf, 0, 0, len2), buf;
    }
    if (obj.length !== undefined) {
      if (typeof obj.length !== "number" || Number.isNaN(obj.length))
        return createBuffer(0);
      return fromArrayLike(obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data))
      return fromArrayLike(obj.data);
  }
  function checked(length) {
    if (length >= kMaxLength)
      throw RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength.toString(16) + " bytes");
    return length | 0;
  }
  function byteLength(string, encoding) {
    if (Buffer2.isBuffer(string))
      return string.length;
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer))
      return string.byteLength;
    if (typeof string !== "string")
      throw TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
    let len2 = string.length, mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len2 === 0)
      return 0;
    let loweredCase = false;
    for (;; )
      switch (encoding) {
        case "ascii":
        case "latin1":
        case "binary":
          return len2;
        case "utf8":
        case "utf-8":
          return utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return len2 * 2;
        case "hex":
          return len2 >>> 1;
        case "base64":
          return base64ToBytes(string).length;
        default:
          if (loweredCase)
            return mustMatch ? -1 : utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase(), loweredCase = true;
      }
  }
  function slowToString(encoding, start, end) {
    let loweredCase = false;
    if (start === undefined || start < 0)
      start = 0;
    if (start > this.length)
      return "";
    if (end === undefined || end > this.length)
      end = this.length;
    if (end <= 0)
      return "";
    if (end >>>= 0, start >>>= 0, end <= start)
      return "";
    if (!encoding)
      encoding = "utf8";
    while (true)
      switch (encoding) {
        case "hex":
          return hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
          return utf8Slice(this, start, end);
        case "ascii":
          return asciiSlice(this, start, end);
        case "latin1":
        case "binary":
          return latin1Slice(this, start, end);
        case "base64":
          return base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase)
            throw TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase(), loweredCase = true;
      }
  }
  function swap(b, n, m) {
    let i2 = b[n];
    b[n] = b[m], b[m] = i2;
  }
  function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0)
      return -1;
    if (typeof byteOffset === "string")
      encoding = byteOffset, byteOffset = 0;
    else if (byteOffset > 2147483647)
      byteOffset = 2147483647;
    else if (byteOffset < -2147483648)
      byteOffset = -2147483648;
    if (byteOffset = +byteOffset, Number.isNaN(byteOffset))
      byteOffset = dir ? 0 : buffer.length - 1;
    if (byteOffset < 0)
      byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length)
      if (dir)
        return -1;
      else
        byteOffset = buffer.length - 1;
    else if (byteOffset < 0)
      if (dir)
        byteOffset = 0;
      else
        return -1;
    if (typeof val === "string")
      val = Buffer2.from(val, encoding);
    if (Buffer2.isBuffer(val)) {
      if (val.length === 0)
        return -1;
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
      if (val = val & 255, typeof Uint8Array.prototype.indexOf === "function")
        if (dir)
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
        else
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
    }
    throw TypeError("val must be string, number or Buffer");
  }
  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    let indexSize = 1, arrLength = arr.length, valLength = val.length;
    if (encoding !== undefined) {
      if (encoding = String(encoding).toLowerCase(), encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
        if (arr.length < 2 || val.length < 2)
          return -1;
        indexSize = 2, arrLength /= 2, valLength /= 2, byteOffset /= 2;
      }
    }
    function read2(buf, i3) {
      if (indexSize === 1)
        return buf[i3];
      else
        return buf.readUInt16BE(i3 * indexSize);
    }
    let i2;
    if (dir) {
      let foundIndex = -1;
      for (i2 = byteOffset;i2 < arrLength; i2++)
        if (read2(arr, i2) === read2(val, foundIndex === -1 ? 0 : i2 - foundIndex)) {
          if (foundIndex === -1)
            foundIndex = i2;
          if (i2 - foundIndex + 1 === valLength)
            return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1)
            i2 -= i2 - foundIndex;
          foundIndex = -1;
        }
    } else {
      if (byteOffset + valLength > arrLength)
        byteOffset = arrLength - valLength;
      for (i2 = byteOffset;i2 >= 0; i2--) {
        let found = true;
        for (let j = 0;j < valLength; j++)
          if (read2(arr, i2 + j) !== read2(val, j)) {
            found = false;
            break;
          }
        if (found)
          return i2;
      }
    }
    return -1;
  }
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    let remaining = buf.length - offset;
    if (!length)
      length = remaining;
    else if (length = Number(length), length > remaining)
      length = remaining;
    let strLen = string.length;
    if (length > strLen / 2)
      length = strLen / 2;
    let i2;
    for (i2 = 0;i2 < length; ++i2) {
      let parsed = parseInt(string.substr(i2 * 2, 2), 16);
      if (Number.isNaN(parsed))
        return i2;
      buf[offset + i2] = parsed;
    }
    return i2;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length)
      return fromByteArray(buf);
    else
      return fromByteArray(buf.slice(start, end));
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    let res = [], i2 = start;
    while (i2 < end) {
      let firstByte = buf[i2], codePoint = null, bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (i2 + bytesPerSequence <= end) {
        let secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128)
              codePoint = firstByte;
            break;
          case 2:
            if (secondByte = buf[i2 + 1], (secondByte & 192) === 128) {
              if (tempCodePoint = (firstByte & 31) << 6 | secondByte & 63, tempCodePoint > 127)
                codePoint = tempCodePoint;
            }
            break;
          case 3:
            if (secondByte = buf[i2 + 1], thirdByte = buf[i2 + 2], (secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              if (tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63, tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343))
                codePoint = tempCodePoint;
            }
            break;
          case 4:
            if (secondByte = buf[i2 + 1], thirdByte = buf[i2 + 2], fourthByte = buf[i2 + 3], (secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              if (tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63, tempCodePoint > 65535 && tempCodePoint < 1114112)
                codePoint = tempCodePoint;
            }
        }
      }
      if (codePoint === null)
        codePoint = 65533, bytesPerSequence = 1;
      else if (codePoint > 65535)
        codePoint -= 65536, res.push(codePoint >>> 10 & 1023 | 55296), codePoint = 56320 | codePoint & 1023;
      res.push(codePoint), i2 += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  function decodeCodePointsArray(codePoints) {
    let len2 = codePoints.length;
    if (len2 <= MAX_ARGUMENTS_LENGTH)
      return String.fromCharCode.apply(String, codePoints);
    let res = "", i2 = 0;
    while (i2 < len2)
      res += String.fromCharCode.apply(String, codePoints.slice(i2, i2 += MAX_ARGUMENTS_LENGTH));
    return res;
  }
  function asciiSlice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i2 = start;i2 < end; ++i2)
      ret += String.fromCharCode(buf[i2] & 127);
    return ret;
  }
  function latin1Slice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i2 = start;i2 < end; ++i2)
      ret += String.fromCharCode(buf[i2]);
    return ret;
  }
  function hexSlice(buf, start, end) {
    let len2 = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len2)
      end = len2;
    let out = "";
    for (let i2 = start;i2 < end; ++i2)
      out += hexSliceLookupTable[buf[i2]];
    return out;
  }
  function utf16leSlice(buf, start, end) {
    let bytes = buf.slice(start, end), res = "";
    for (let i2 = 0;i2 < bytes.length - 1; i2 += 2)
      res += String.fromCharCode(bytes[i2] + bytes[i2 + 1] * 256);
    return res;
  }
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0)
      throw RangeError("offset is not uint");
    if (offset + ext > length)
      throw RangeError("Trying to access beyond buffer length");
  }
  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer2.isBuffer(buf))
      throw TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min)
      throw RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
      throw RangeError("Index out of range");
  }
  function wrtBigUInt64LE(buf, value, offset, min, max) {
    checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset++] = lo, lo = lo >> 8, buf[offset++] = lo, lo = lo >> 8, buf[offset++] = lo, lo = lo >> 8, buf[offset++] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    return buf[offset++] = hi, hi = hi >> 8, buf[offset++] = hi, hi = hi >> 8, buf[offset++] = hi, hi = hi >> 8, buf[offset++] = hi, offset;
  }
  function wrtBigUInt64BE(buf, value, offset, min, max) {
    checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset + 7] = lo, lo = lo >> 8, buf[offset + 6] = lo, lo = lo >> 8, buf[offset + 5] = lo, lo = lo >> 8, buf[offset + 4] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    return buf[offset + 3] = hi, hi = hi >> 8, buf[offset + 2] = hi, hi = hi >> 8, buf[offset + 1] = hi, hi = hi >> 8, buf[offset] = hi, offset + 8;
  }
  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length)
      throw RangeError("Index out of range");
    if (offset < 0)
      throw RangeError("Index out of range");
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkIEEE754(buf, value, offset, 4, 340282346638528860000000000000000000000, -340282346638528860000000000000000000000);
    return write(buf, value, offset, littleEndian, 23, 4), offset + 4;
  }
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkIEEE754(buf, value, offset, 8, 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000);
    return write(buf, value, offset, littleEndian, 52, 8), offset + 8;
  }
  function addNumericalSeparator(val) {
    let res = "", i2 = val.length, start = val[0] === "-" ? 1 : 0;
    for (;i2 >= start + 4; i2 -= 3)
      res = `_${val.slice(i2 - 3, i2)}${res}`;
    return `${val.slice(0, i2)}${res}`;
  }
  function checkBounds(buf, offset, byteLength2) {
    if (validateNumber(offset, "offset"), buf[offset] === undefined || buf[offset + byteLength2] === undefined)
      boundsError(offset, buf.length - (byteLength2 + 1));
  }
  function checkIntBI(value, min, max, buf, offset, byteLength2) {
    if (value > max || value < min) {
      let n = typeof min === "bigint" ? "n" : "", range;
      if (byteLength2 > 3)
        if (min === 0 || min === BigInt(0))
          range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
        else
          range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
      else
        range = `>= ${min}${n} and <= ${max}${n}`;
      throw new ERR_OUT_OF_RANGE("value", range, value);
    }
    checkBounds(buf, offset, byteLength2);
  }
  function validateNumber(value, name) {
    if (typeof value !== "number")
      throw new ERR_INVALID_ARG_TYPE(name, "number", value);
  }
  function boundsError(value, length, type) {
    if (Math.floor(value) !== value)
      throw validateNumber(value, type), new ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
    if (length < 0)
      throw new ERR_BUFFER_OUT_OF_BOUNDS;
    throw new ERR_OUT_OF_RANGE(type || "offset", `>= ${type ? 1 : 0} and <= ${length}`, value);
  }
  function base64clean(str) {
    if (str = str.split("=")[0], str = str.trim().replace(INVALID_BASE64_RE, ""), str.length < 2)
      return "";
    while (str.length % 4 !== 0)
      str = str + "=";
    return str;
  }
  function utf8ToBytes(string, units) {
    units = units || 1 / 0;
    let codePoint, length = string.length, leadSurrogate = null, bytes = [];
    for (let i2 = 0;i2 < length; ++i2) {
      if (codePoint = string.charCodeAt(i2), codePoint > 55295 && codePoint < 57344) {
        if (!leadSurrogate) {
          if (codePoint > 56319) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          } else if (i2 + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
      }
      if (leadSurrogate = null, codePoint < 128) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0)
          break;
        bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0)
          break;
        bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0)
          break;
        bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
      } else
        throw Error("Invalid code point");
    }
    return bytes;
  }
  function asciiToBytes(str) {
    let byteArray = [];
    for (let i2 = 0;i2 < str.length; ++i2)
      byteArray.push(str.charCodeAt(i2) & 255);
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    let c, hi, lo, byteArray = [];
    for (let i2 = 0;i2 < str.length; ++i2) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i2), hi = c >> 8, lo = c % 256, byteArray.push(lo), byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    let i2;
    for (i2 = 0;i2 < length; ++i2) {
      if (i2 + offset >= dst.length || i2 >= src.length)
        break;
      dst[i2 + offset] = src[i2];
    }
    return i2;
  }
  function isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
  }
  function defineBigIntMethod(fn) {
    return typeof BigInt > "u" ? BufferBigIntNotDefined : fn;
  }
  function BufferBigIntNotDefined() {
    throw Error("BigInt not supported");
  }
  function notimpl(name) {
    return () => {
      throw Error(name + " is not implemented for node:buffer browser polyfill");
    };
  }
  var lookup, revLookup, code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i, len, customInspectSymbol, INSPECT_MAX_BYTES = 50, kMaxLength = 2147483647, kStringMaxLength = 536870888, btoa, atob, File, Blob, constants, ERR_BUFFER_OUT_OF_BOUNDS, ERR_INVALID_ARG_TYPE, ERR_OUT_OF_RANGE, MAX_ARGUMENTS_LENGTH = 4096, INVALID_BASE64_RE, hexSliceLookupTable, resolveObjectURL, isUtf8, isAscii = (str) => {
    for (let char of str)
      if (char.charCodeAt(0) > 127)
        return false;
    return true;
  }, transcode, buffer_default;
  var init_buffer = __esm(() => {
    lookup = [];
    revLookup = [];
    for (i = 0, len = code.length;i < len; ++i)
      lookup[i] = code[i], revLookup[code.charCodeAt(i)] = i;
    revLookup[45] = 62;
    revLookup[95] = 63;
    customInspectSymbol = typeof Symbol === "function" && typeof Symbol.for === "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    btoa = globalThis.btoa;
    atob = globalThis.atob;
    File = globalThis.File;
    Blob = globalThis.Blob;
    constants = { MAX_LENGTH: kMaxLength, MAX_STRING_LENGTH: kStringMaxLength };
    ERR_BUFFER_OUT_OF_BOUNDS = E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
      if (name)
        return `${name} is outside of buffer bounds`;
      return "Attempt to access memory outside buffer bounds";
    }, RangeError);
    ERR_INVALID_ARG_TYPE = E("ERR_INVALID_ARG_TYPE", function(name, actual) {
      return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
    }, TypeError);
    ERR_OUT_OF_RANGE = E("ERR_OUT_OF_RANGE", function(str, range, input) {
      let msg = `The value of "${str}" is out of range.`, received = input;
      if (Number.isInteger(input) && Math.abs(input) > 4294967296)
        received = addNumericalSeparator(String(input));
      else if (typeof input === "bigint") {
        if (received = String(input), input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32)))
          received = addNumericalSeparator(received);
        received += "n";
      }
      return msg += ` It must be ${range}. Received ${received}`, msg;
    }, RangeError);
    Object.defineProperty(Buffer2.prototype, "parent", { enumerable: true, get: function() {
      if (!Buffer2.isBuffer(this))
        return;
      return this.buffer;
    } });
    Object.defineProperty(Buffer2.prototype, "offset", { enumerable: true, get: function() {
      if (!Buffer2.isBuffer(this))
        return;
      return this.byteOffset;
    } });
    Buffer2.poolSize = 8192;
    Buffer2.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer2, Uint8Array);
    Buffer2.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    Buffer2.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer2.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    Buffer2.isBuffer = function(b) {
      return b != null && b._isBuffer === true && b !== Buffer2.prototype;
    };
    Buffer2.compare = function(a, b) {
      if (isInstance(a, Uint8Array))
        a = Buffer2.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array))
        b = Buffer2.from(b, b.offset, b.byteLength);
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b))
        throw TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
      if (a === b)
        return 0;
      let x = a.length, y = b.length;
      for (let i2 = 0, len2 = Math.min(x, y);i2 < len2; ++i2)
        if (a[i2] !== b[i2]) {
          x = a[i2], y = b[i2];
          break;
        }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    };
    Buffer2.isEncoding = function(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer2.concat = function(list, length) {
      if (!Array.isArray(list))
        throw TypeError('"list" argument must be an Array of Buffers');
      if (list.length === 0)
        return Buffer2.alloc(0);
      let i2;
      if (length === undefined) {
        length = 0;
        for (i2 = 0;i2 < list.length; ++i2)
          length += list[i2].length;
      }
      let buffer = Buffer2.allocUnsafe(length), pos = 0;
      for (i2 = 0;i2 < list.length; ++i2) {
        let buf = list[i2];
        if (isInstance(buf, Uint8Array))
          if (pos + buf.length > buffer.length) {
            if (!Buffer2.isBuffer(buf))
              buf = Buffer2.from(buf);
            buf.copy(buffer, pos);
          } else
            Uint8Array.prototype.set.call(buffer, buf, pos);
        else if (!Buffer2.isBuffer(buf))
          throw TypeError('"list" argument must be an Array of Buffers');
        else
          buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer;
    };
    Buffer2.byteLength = byteLength;
    Buffer2.prototype._isBuffer = true;
    Buffer2.prototype.swap16 = function() {
      let len2 = this.length;
      if (len2 % 2 !== 0)
        throw RangeError("Buffer size must be a multiple of 16-bits");
      for (let i2 = 0;i2 < len2; i2 += 2)
        swap(this, i2, i2 + 1);
      return this;
    };
    Buffer2.prototype.swap32 = function() {
      let len2 = this.length;
      if (len2 % 4 !== 0)
        throw RangeError("Buffer size must be a multiple of 32-bits");
      for (let i2 = 0;i2 < len2; i2 += 4)
        swap(this, i2, i2 + 3), swap(this, i2 + 1, i2 + 2);
      return this;
    };
    Buffer2.prototype.swap64 = function() {
      let len2 = this.length;
      if (len2 % 8 !== 0)
        throw RangeError("Buffer size must be a multiple of 64-bits");
      for (let i2 = 0;i2 < len2; i2 += 8)
        swap(this, i2, i2 + 7), swap(this, i2 + 1, i2 + 6), swap(this, i2 + 2, i2 + 5), swap(this, i2 + 3, i2 + 4);
      return this;
    };
    Buffer2.prototype.toString = function() {
      let length = this.length;
      if (length === 0)
        return "";
      if (arguments.length === 0)
        return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
    Buffer2.prototype.equals = function(b) {
      if (!Buffer2.isBuffer(b))
        throw TypeError("Argument must be a Buffer");
      if (this === b)
        return true;
      return Buffer2.compare(this, b) === 0;
    };
    Buffer2.prototype.inspect = function() {
      let str = "", max = INSPECT_MAX_BYTES;
      if (str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim(), this.length > max)
        str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol)
      Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
    Buffer2.prototype.compare = function(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array))
        target = Buffer2.from(target, target.offset, target.byteLength);
      if (!Buffer2.isBuffer(target))
        throw TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
      if (start === undefined)
        start = 0;
      if (end === undefined)
        end = target ? target.length : 0;
      if (thisStart === undefined)
        thisStart = 0;
      if (thisEnd === undefined)
        thisEnd = this.length;
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length)
        throw RangeError("out of range index");
      if (thisStart >= thisEnd && start >= end)
        return 0;
      if (thisStart >= thisEnd)
        return -1;
      if (start >= end)
        return 1;
      if (start >>>= 0, end >>>= 0, thisStart >>>= 0, thisEnd >>>= 0, this === target)
        return 0;
      let x = thisEnd - thisStart, y = end - start, len2 = Math.min(x, y), thisCopy = this.slice(thisStart, thisEnd), targetCopy = target.slice(start, end);
      for (let i2 = 0;i2 < len2; ++i2)
        if (thisCopy[i2] !== targetCopy[i2]) {
          x = thisCopy[i2], y = targetCopy[i2];
          break;
        }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    };
    Buffer2.prototype.includes = function(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer2.prototype.indexOf = function(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer2.prototype.lastIndexOf = function(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    Buffer2.prototype.write = function(string, offset, length, encoding) {
      if (offset === undefined)
        encoding = "utf8", length = this.length, offset = 0;
      else if (length === undefined && typeof offset === "string")
        encoding = offset, length = this.length, offset = 0;
      else if (isFinite(offset))
        if (offset = offset >>> 0, isFinite(length)) {
          if (length = length >>> 0, encoding === undefined)
            encoding = "utf8";
        } else
          encoding = length, length = undefined;
      else
        throw Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
      let remaining = this.length - offset;
      if (length === undefined || length > remaining)
        length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length)
        throw RangeError("Attempt to write outside buffer bounds");
      if (!encoding)
        encoding = "utf8";
      let loweredCase = false;
      for (;; )
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase)
              throw TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase(), loweredCase = true;
        }
    };
    Buffer2.prototype.toJSON = function() {
      return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
    };
    Buffer2.prototype.slice = function(start, end) {
      let len2 = this.length;
      if (start = ~~start, end = end === undefined ? len2 : ~~end, start < 0) {
        if (start += len2, start < 0)
          start = 0;
      } else if (start > len2)
        start = len2;
      if (end < 0) {
        if (end += len2, end < 0)
          end = 0;
      } else if (end > len2)
        end = len2;
      if (end < start)
        end = start;
      let newBuf = this.subarray(start, end);
      return Object.setPrototypeOf(newBuf, Buffer2.prototype), newBuf;
    };
    Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function(offset, byteLength2, noAssert) {
      if (offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert)
        checkOffset(offset, byteLength2, this.length);
      let val = this[offset], mul = 1, i2 = 0;
      while (++i2 < byteLength2 && (mul *= 256))
        val += this[offset + i2] * mul;
      return val;
    };
    Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function(offset, byteLength2, noAssert) {
      if (offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert)
        checkOffset(offset, byteLength2, this.length);
      let val = this[offset + --byteLength2], mul = 1;
      while (byteLength2 > 0 && (mul *= 256))
        val += this[offset + --byteLength2] * mul;
      return val;
    };
    Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function(offset) {
      offset = offset >>> 0, validateNumber(offset, "offset");
      let first = this[offset], last = this[offset + 7];
      if (first === undefined || last === undefined)
        boundsError(offset, this.length - 8);
      let lo = first + this[++offset] * 256 + this[++offset] * 65536 + this[++offset] * 16777216, hi = this[++offset] + this[++offset] * 256 + this[++offset] * 65536 + last * 16777216;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function(offset) {
      offset = offset >>> 0, validateNumber(offset, "offset");
      let first = this[offset], last = this[offset + 7];
      if (first === undefined || last === undefined)
        boundsError(offset, this.length - 8);
      let hi = first * 16777216 + this[++offset] * 65536 + this[++offset] * 256 + this[++offset], lo = this[++offset] * 16777216 + this[++offset] * 65536 + this[++offset] * 256 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer2.prototype.readIntLE = function(offset, byteLength2, noAssert) {
      if (offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert)
        checkOffset(offset, byteLength2, this.length);
      let val = this[offset], mul = 1, i2 = 0;
      while (++i2 < byteLength2 && (mul *= 256))
        val += this[offset + i2] * mul;
      if (mul *= 128, val >= mul)
        val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readIntBE = function(offset, byteLength2, noAssert) {
      if (offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert)
        checkOffset(offset, byteLength2, this.length);
      let i2 = byteLength2, mul = 1, val = this[offset + --i2];
      while (i2 > 0 && (mul *= 256))
        val += this[offset + --i2] * mul;
      if (mul *= 128, val >= mul)
        val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readInt8 = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128))
        return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer2.prototype.readInt16LE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 2, this.length);
      let val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt16BE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 2, this.length);
      let val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt32LE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer2.prototype.readInt32BE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function(offset) {
      offset = offset >>> 0, validateNumber(offset, "offset");
      let first = this[offset], last = this[offset + 7];
      if (first === undefined || last === undefined)
        boundsError(offset, this.length - 8);
      let val = this[offset + 4] + this[offset + 5] * 256 + this[offset + 6] * 65536 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 256 + this[++offset] * 65536 + this[++offset] * 16777216);
    });
    Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function(offset) {
      offset = offset >>> 0, validateNumber(offset, "offset");
      let first = this[offset], last = this[offset + 7];
      if (first === undefined || last === undefined)
        boundsError(offset, this.length - 8);
      let val = (first << 24) + this[++offset] * 65536 + this[++offset] * 256 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 16777216 + this[++offset] * 65536 + this[++offset] * 256 + last);
    });
    Buffer2.prototype.readFloatLE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4);
    };
    Buffer2.prototype.readFloatBE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4);
    };
    Buffer2.prototype.readDoubleLE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8);
    };
    Buffer2.prototype.readDoubleBE = function(offset, noAssert) {
      if (offset = offset >>> 0, !noAssert)
        checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8);
    };
    Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function(value, offset, byteLength2, noAssert) {
      if (value = +value, offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert) {
        let maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1, i2 = 0;
      this[offset] = value & 255;
      while (++i2 < byteLength2 && (mul *= 256))
        this[offset + i2] = value / mul & 255;
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function(value, offset, byteLength2, noAssert) {
      if (value = +value, offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert) {
        let maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let i2 = byteLength2 - 1, mul = 1;
      this[offset + i2] = value & 255;
      while (--i2 >= 0 && (mul *= 256))
        this[offset + i2] = value / mul & 255;
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 1, 255, 0);
      return this[offset] = value & 255, offset + 1;
    };
    Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      return this[offset] = value & 255, this[offset + 1] = value >>> 8, offset + 2;
    };
    Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      return this[offset] = value >>> 8, this[offset + 1] = value & 255, offset + 2;
    };
    Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      return this[offset + 3] = value >>> 24, this[offset + 2] = value >>> 16, this[offset + 1] = value >>> 8, this[offset] = value & 255, offset + 4;
    };
    Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      return this[offset] = value >>> 24, this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = value & 255, offset + 4;
    };
    Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer2.prototype.writeIntLE = function(value, offset, byteLength2, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert) {
        let limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i2 = 0, mul = 1, sub = 0;
      this[offset] = value & 255;
      while (++i2 < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i2 - 1] !== 0)
          sub = 1;
        this[offset + i2] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeIntBE = function(value, offset, byteLength2, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert) {
        let limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i2 = byteLength2 - 1, mul = 1, sub = 0;
      this[offset + i2] = value & 255;
      while (--i2 >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i2 + 1] !== 0)
          sub = 1;
        this[offset + i2] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeInt8 = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 1, 127, -128);
      if (value < 0)
        value = 255 + value + 1;
      return this[offset] = value & 255, offset + 1;
    };
    Buffer2.prototype.writeInt16LE = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      return this[offset] = value & 255, this[offset + 1] = value >>> 8, offset + 2;
    };
    Buffer2.prototype.writeInt16BE = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      return this[offset] = value >>> 8, this[offset + 1] = value & 255, offset + 2;
    };
    Buffer2.prototype.writeInt32LE = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      return this[offset] = value & 255, this[offset + 1] = value >>> 8, this[offset + 2] = value >>> 16, this[offset + 3] = value >>> 24, offset + 4;
    };
    Buffer2.prototype.writeInt32BE = function(value, offset, noAssert) {
      if (value = +value, offset = offset >>> 0, !noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0)
        value = 4294967295 + value + 1;
      return this[offset] = value >>> 24, this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = value & 255, offset + 4;
    };
    Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer2.prototype.writeFloatLE = function(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeFloatBE = function(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    Buffer2.prototype.writeDoubleLE = function(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeDoubleBE = function(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer2.prototype.copy = function(target, targetStart, start, end) {
      if (!Buffer2.isBuffer(target))
        throw TypeError("argument should be a Buffer");
      if (!start)
        start = 0;
      if (!end && end !== 0)
        end = this.length;
      if (targetStart >= target.length)
        targetStart = target.length;
      if (!targetStart)
        targetStart = 0;
      if (end > 0 && end < start)
        end = start;
      if (end === start)
        return 0;
      if (target.length === 0 || this.length === 0)
        return 0;
      if (targetStart < 0)
        throw RangeError("targetStart out of bounds");
      if (start < 0 || start >= this.length)
        throw RangeError("Index out of range");
      if (end < 0)
        throw RangeError("sourceEnd out of bounds");
      if (end > this.length)
        end = this.length;
      if (target.length - targetStart < end - start)
        end = target.length - targetStart + start;
      let len2 = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function")
        this.copyWithin(targetStart, start, end);
      else
        Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
      return len2;
    };
    Buffer2.prototype.fill = function(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string")
          encoding = start, start = 0, end = this.length;
        else if (typeof end === "string")
          encoding = end, end = this.length;
        if (encoding !== undefined && typeof encoding !== "string")
          throw TypeError("encoding must be a string");
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding))
          throw TypeError("Unknown encoding: " + encoding);
        if (val.length === 1) {
          let code2 = val.charCodeAt(0);
          if (encoding === "utf8" && code2 < 128 || encoding === "latin1")
            val = code2;
        }
      } else if (typeof val === "number")
        val = val & 255;
      else if (typeof val === "boolean")
        val = Number(val);
      if (start < 0 || this.length < start || this.length < end)
        throw RangeError("Out of range index");
      if (end <= start)
        return this;
      if (start = start >>> 0, end = end === undefined ? this.length : end >>> 0, !val)
        val = 0;
      let i2;
      if (typeof val === "number")
        for (i2 = start;i2 < end; ++i2)
          this[i2] = val;
      else {
        let bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding), len2 = bytes.length;
        if (len2 === 0)
          throw TypeError('The value "' + val + '" is invalid for argument "value"');
        for (i2 = 0;i2 < end - start; ++i2)
          this[i2 + start] = bytes[i2 % len2];
      }
      return this;
    };
    INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    hexSliceLookupTable = function() {
      let table = Array(256);
      for (let i2 = 0;i2 < 16; ++i2) {
        let i16 = i2 * 16;
        for (let j = 0;j < 16; ++j)
          table[i16 + j] = "0123456789abcdef"[i2] + "0123456789abcdef"[j];
      }
      return table;
    }();
    resolveObjectURL = notimpl("resolveObjectURL");
    isUtf8 = notimpl("isUtf8");
    transcode = notimpl("transcode");
    buffer_default = Buffer2;
  });

  // node_modules/bn.js/lib/bn.js
  var require_bn = __commonJS((exports, module) => {
    (function(module2, exports2) {
      function assert(val, msg) {
        if (!val)
          throw new Error(msg || "Assertion failed");
      }
      function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor;
        ctor.prototype.constructor = ctor;
      }
      function BN(number, base, endian) {
        if (BN.isBN(number)) {
          return number;
        }
        this.negative = 0;
        this.words = null;
        this.length = 0;
        this.red = null;
        if (number !== null) {
          if (base === "le" || base === "be") {
            endian = base;
            base = 10;
          }
          this._init(number || 0, base || 10, endian || "be");
        }
      }
      if (typeof module2 === "object") {
        module2.exports = BN;
      } else {
        exports2.BN = BN;
      }
      BN.BN = BN;
      BN.wordSize = 26;
      var Buffer3;
      try {
        if (typeof window !== "undefined" && typeof window.Buffer !== "undefined") {
          Buffer3 = window.Buffer;
        } else {
          Buffer3 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
        }
      } catch (e) {}
      BN.isBN = function isBN(num) {
        if (num instanceof BN) {
          return true;
        }
        return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      };
      BN.max = function max(left, right) {
        if (left.cmp(right) > 0)
          return left;
        return right;
      };
      BN.min = function min(left, right) {
        if (left.cmp(right) < 0)
          return left;
        return right;
      };
      BN.prototype._init = function init(number, base, endian) {
        if (typeof number === "number") {
          return this._initNumber(number, base, endian);
        }
        if (typeof number === "object") {
          return this._initArray(number, base, endian);
        }
        if (base === "hex") {
          base = 16;
        }
        assert(base === (base | 0) && base >= 2 && base <= 36);
        number = number.toString().replace(/\s+/g, "");
        var start = 0;
        if (number[0] === "-") {
          start++;
          this.negative = 1;
        }
        if (start < number.length) {
          if (base === 16) {
            this._parseHex(number, start, endian);
          } else {
            this._parseBase(number, base, start);
            if (endian === "le") {
              this._initArray(this.toArray(), base, endian);
            }
          }
        }
      };
      BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0) {
          this.negative = 1;
          number = -number;
        }
        if (number < 67108864) {
          this.words = [number & 67108863];
          this.length = 1;
        } else if (number < 4503599627370496) {
          this.words = [
            number & 67108863,
            number / 67108864 & 67108863
          ];
          this.length = 2;
        } else {
          assert(number < 9007199254740992);
          this.words = [
            number & 67108863,
            number / 67108864 & 67108863,
            1
          ];
          this.length = 3;
        }
        if (endian !== "le")
          return;
        this._initArray(this.toArray(), base, endian);
      };
      BN.prototype._initArray = function _initArray(number, base, endian) {
        assert(typeof number.length === "number");
        if (number.length <= 0) {
          this.words = [0];
          this.length = 1;
          return this;
        }
        this.length = Math.ceil(number.length / 3);
        this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++) {
          this.words[i2] = 0;
        }
        var j, w;
        var off = 0;
        if (endian === "be") {
          for (i2 = number.length - 1, j = 0;i2 >= 0; i2 -= 3) {
            w = number[i2] | number[i2 - 1] << 8 | number[i2 - 2] << 16;
            this.words[j] |= w << off & 67108863;
            this.words[j + 1] = w >>> 26 - off & 67108863;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        } else if (endian === "le") {
          for (i2 = 0, j = 0;i2 < number.length; i2 += 3) {
            w = number[i2] | number[i2 + 1] << 8 | number[i2 + 2] << 16;
            this.words[j] |= w << off & 67108863;
            this.words[j + 1] = w >>> 26 - off & 67108863;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        }
        return this._strip();
      };
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        if (c >= 48 && c <= 57) {
          return c - 48;
        } else if (c >= 65 && c <= 70) {
          return c - 55;
        } else if (c >= 97 && c <= 102) {
          return c - 87;
        } else {
          assert(false, "Invalid character in " + string);
        }
      }
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound) {
          r |= parseHex4Bits(string, index - 1) << 4;
        }
        return r;
      }
      BN.prototype._parseHex = function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6);
        this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++) {
          this.words[i2] = 0;
        }
        var off = 0;
        var j = 0;
        var w;
        if (endian === "be") {
          for (i2 = number.length - 1;i2 >= start; i2 -= 2) {
            w = parseHexByte(number, start, i2) << off;
            this.words[j] |= w & 67108863;
            if (off >= 18) {
              off -= 18;
              j += 1;
              this.words[j] |= w >>> 26;
            } else {
              off += 8;
            }
          }
        } else {
          var parseLength = number.length - start;
          for (i2 = parseLength % 2 === 0 ? start + 1 : start;i2 < number.length; i2 += 2) {
            w = parseHexByte(number, start, i2) << off;
            this.words[j] |= w & 67108863;
            if (off >= 18) {
              off -= 18;
              j += 1;
              this.words[j] |= w >>> 26;
            } else {
              off += 8;
            }
          }
        }
        this._strip();
      };
      function parseBase(str, start, end, mul) {
        var r = 0;
        var b = 0;
        var len2 = Math.min(str.length, end);
        for (var i2 = start;i2 < len2; i2++) {
          var c = str.charCodeAt(i2) - 48;
          r *= mul;
          if (c >= 49) {
            b = c - 49 + 10;
          } else if (c >= 17) {
            b = c - 17 + 10;
          } else {
            b = c;
          }
          assert(c >= 0 && b < mul, "Invalid character");
          r += b;
        }
        return r;
      }
      BN.prototype._parseBase = function _parseBase(number, base, start) {
        this.words = [0];
        this.length = 1;
        for (var limbLen = 0, limbPow = 1;limbPow <= 67108863; limbPow *= base) {
          limbLen++;
        }
        limbLen--;
        limbPow = limbPow / base | 0;
        var total = number.length - start;
        var mod2 = total % limbLen;
        var end = Math.min(total, total - mod2) + start;
        var word = 0;
        for (var i2 = start;i2 < end; i2 += limbLen) {
          word = parseBase(number, i2, i2 + limbLen, base);
          this.imuln(limbPow);
          if (this.words[0] + word < 67108864) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }
        if (mod2 !== 0) {
          var pow = 1;
          word = parseBase(number, i2, number.length, base);
          for (i2 = 0;i2 < mod2; i2++) {
            pow *= base;
          }
          this.imuln(pow);
          if (this.words[0] + word < 67108864) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }
        this._strip();
      };
      BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++) {
          dest.words[i2] = this.words[i2];
        }
        dest.length = this.length;
        dest.negative = this.negative;
        dest.red = this.red;
      };
      function move(dest, src) {
        dest.words = src.words;
        dest.length = src.length;
        dest.negative = src.negative;
        dest.red = src.red;
      }
      BN.prototype._move = function _move(dest) {
        move(dest, this);
      };
      BN.prototype.clone = function clone() {
        var r = new BN(null);
        this.copy(r);
        return r;
      };
      BN.prototype._expand = function _expand(size) {
        while (this.length < size) {
          this.words[this.length++] = 0;
        }
        return this;
      };
      BN.prototype._strip = function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0) {
          this.length--;
        }
        return this._normSign();
      };
      BN.prototype._normSign = function _normSign() {
        if (this.length === 1 && this.words[0] === 0) {
          this.negative = 0;
        }
        return this;
      };
      if (typeof Symbol !== "undefined" && typeof Symbol.for === "function") {
        try {
          BN.prototype[Symbol.for("nodejs.util.inspect.custom")] = inspect;
        } catch (e) {
          BN.prototype.inspect = inspect;
        }
      } else {
        BN.prototype.inspect = inspect;
      }
      function inspect() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      }
      var zeros = [
        "",
        "0",
        "00",
        "000",
        "0000",
        "00000",
        "000000",
        "0000000",
        "00000000",
        "000000000",
        "0000000000",
        "00000000000",
        "000000000000",
        "0000000000000",
        "00000000000000",
        "000000000000000",
        "0000000000000000",
        "00000000000000000",
        "000000000000000000",
        "0000000000000000000",
        "00000000000000000000",
        "000000000000000000000",
        "0000000000000000000000",
        "00000000000000000000000",
        "000000000000000000000000",
        "0000000000000000000000000"
      ];
      var groupSizes = [
        0,
        0,
        25,
        16,
        12,
        11,
        10,
        9,
        8,
        8,
        7,
        7,
        7,
        7,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5
      ];
      var groupBases = [
        0,
        0,
        33554432,
        43046721,
        16777216,
        48828125,
        60466176,
        40353607,
        16777216,
        43046721,
        1e7,
        19487171,
        35831808,
        62748517,
        7529536,
        11390625,
        16777216,
        24137569,
        34012224,
        47045881,
        64000000,
        4084101,
        5153632,
        6436343,
        7962624,
        9765625,
        11881376,
        14348907,
        17210368,
        20511149,
        24300000,
        28629151,
        33554432,
        39135393,
        45435424,
        52521875,
        60466176
      ];
      BN.prototype.toString = function toString(base, padding) {
        base = base || 10;
        padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === "hex") {
          out = "";
          var off = 0;
          var carry = 0;
          for (var i2 = 0;i2 < this.length; i2++) {
            var w = this.words[i2];
            var word = ((w << off | carry) & 16777215).toString(16);
            carry = w >>> 24 - off & 16777215;
            off += 2;
            if (off >= 26) {
              off -= 26;
              i2--;
            }
            if (carry !== 0 || i2 !== this.length - 1) {
              out = zeros[6 - word.length] + word + out;
            } else {
              out = word + out;
            }
          }
          if (carry !== 0) {
            out = carry.toString(16) + out;
          }
          while (out.length % padding !== 0) {
            out = "0" + out;
          }
          if (this.negative !== 0) {
            out = "-" + out;
          }
          return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base];
          var groupBase = groupBases[base];
          out = "";
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modrn(groupBase).toString(base);
            c = c.idivn(groupBase);
            if (!c.isZero()) {
              out = zeros[groupSize - r.length] + r + out;
            } else {
              out = r + out;
            }
          }
          if (this.isZero()) {
            out = "0" + out;
          }
          while (out.length % padding !== 0) {
            out = "0" + out;
          }
          if (this.negative !== 0) {
            out = "-" + out;
          }
          return out;
        }
        assert(false, "Base should be between 2 and 36");
      };
      BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0];
        if (this.length === 2) {
          ret += this.words[1] * 67108864;
        } else if (this.length === 3 && this.words[2] === 1) {
          ret += 4503599627370496 + this.words[1] * 67108864;
        } else if (this.length > 2) {
          assert(false, "Number can only safely store up to 53 bits");
        }
        return this.negative !== 0 ? -ret : ret;
      };
      BN.prototype.toJSON = function toJSON() {
        return this.toString(16, 2);
      };
      if (Buffer3) {
        BN.prototype.toBuffer = function toBuffer(endian, length) {
          return this.toArrayLike(Buffer3, endian, length);
        };
      }
      BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length);
      };
      var allocate = function allocate2(ArrayType, size) {
        if (ArrayType.allocUnsafe) {
          return ArrayType.allocUnsafe(size);
        }
        return new ArrayType(size);
      };
      BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
        this._strip();
        var byteLength2 = this.byteLength();
        var reqLength = length || Math.max(1, byteLength2);
        assert(byteLength2 <= reqLength, "byte array longer than desired length");
        assert(reqLength > 0, "Requested array length <= 0");
        var res = allocate(ArrayType, reqLength);
        var postfix = endian === "le" ? "LE" : "BE";
        this["_toArrayLike" + postfix](res, byteLength2);
        return res;
      };
      BN.prototype._toArrayLikeLE = function _toArrayLikeLE(res, byteLength2) {
        var position = 0;
        var carry = 0;
        for (var i2 = 0, shift = 0;i2 < this.length; i2++) {
          var word = this.words[i2] << shift | carry;
          res[position++] = word & 255;
          if (position < res.length) {
            res[position++] = word >> 8 & 255;
          }
          if (position < res.length) {
            res[position++] = word >> 16 & 255;
          }
          if (shift === 6) {
            if (position < res.length) {
              res[position++] = word >> 24 & 255;
            }
            carry = 0;
            shift = 0;
          } else {
            carry = word >>> 24;
            shift += 2;
          }
        }
        if (position < res.length) {
          res[position++] = carry;
          while (position < res.length) {
            res[position++] = 0;
          }
        }
      };
      BN.prototype._toArrayLikeBE = function _toArrayLikeBE(res, byteLength2) {
        var position = res.length - 1;
        var carry = 0;
        for (var i2 = 0, shift = 0;i2 < this.length; i2++) {
          var word = this.words[i2] << shift | carry;
          res[position--] = word & 255;
          if (position >= 0) {
            res[position--] = word >> 8 & 255;
          }
          if (position >= 0) {
            res[position--] = word >> 16 & 255;
          }
          if (shift === 6) {
            if (position >= 0) {
              res[position--] = word >> 24 & 255;
            }
            carry = 0;
            shift = 0;
          } else {
            carry = word >>> 24;
            shift += 2;
          }
        }
        if (position >= 0) {
          res[position--] = carry;
          while (position >= 0) {
            res[position--] = 0;
          }
        }
      };
      if (Math.clz32) {
        BN.prototype._countBits = function _countBits(w) {
          return 32 - Math.clz32(w);
        };
      } else {
        BN.prototype._countBits = function _countBits(w) {
          var t = w;
          var r = 0;
          if (t >= 4096) {
            r += 13;
            t >>>= 13;
          }
          if (t >= 64) {
            r += 7;
            t >>>= 7;
          }
          if (t >= 8) {
            r += 4;
            t >>>= 4;
          }
          if (t >= 2) {
            r += 2;
            t >>>= 2;
          }
          return r + t;
        };
      }
      BN.prototype._zeroBits = function _zeroBits(w) {
        if (w === 0)
          return 26;
        var t = w;
        var r = 0;
        if ((t & 8191) === 0) {
          r += 13;
          t >>>= 13;
        }
        if ((t & 127) === 0) {
          r += 7;
          t >>>= 7;
        }
        if ((t & 15) === 0) {
          r += 4;
          t >>>= 4;
        }
        if ((t & 3) === 0) {
          r += 2;
          t >>>= 2;
        }
        if ((t & 1) === 0) {
          r++;
        }
        return r;
      };
      BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1];
        var hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };
      function toBitArray(num) {
        var w = new Array(num.bitLength());
        for (var bit = 0;bit < w.length; bit++) {
          var off = bit / 26 | 0;
          var wbit = bit % 26;
          w[bit] = num.words[off] >>> wbit & 1;
        }
        return w;
      }
      BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero())
          return 0;
        var r = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var b = this._zeroBits(this.words[i2]);
          r += b;
          if (b !== 26)
            break;
        }
        return r;
      };
      BN.prototype.byteLength = function byteLength2() {
        return Math.ceil(this.bitLength() / 8);
      };
      BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0) {
          return this.abs().inotn(width).iaddn(1);
        }
        return this.clone();
      };
      BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1)) {
          return this.notn(width).iaddn(1).ineg();
        }
        return this.clone();
      };
      BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0;
      };
      BN.prototype.neg = function neg() {
        return this.clone().ineg();
      };
      BN.prototype.ineg = function ineg() {
        if (!this.isZero()) {
          this.negative ^= 1;
        }
        return this;
      };
      BN.prototype.iuor = function iuor(num) {
        while (this.length < num.length) {
          this.words[this.length++] = 0;
        }
        for (var i2 = 0;i2 < num.length; i2++) {
          this.words[i2] = this.words[i2] | num.words[i2];
        }
        return this._strip();
      };
      BN.prototype.ior = function ior(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuor(num);
      };
      BN.prototype.or = function or(num) {
        if (this.length > num.length)
          return this.clone().ior(num);
        return num.clone().ior(this);
      };
      BN.prototype.uor = function uor(num) {
        if (this.length > num.length)
          return this.clone().iuor(num);
        return num.clone().iuor(this);
      };
      BN.prototype.iuand = function iuand(num) {
        var b;
        if (this.length > num.length) {
          b = num;
        } else {
          b = this;
        }
        for (var i2 = 0;i2 < b.length; i2++) {
          this.words[i2] = this.words[i2] & num.words[i2];
        }
        this.length = b.length;
        return this._strip();
      };
      BN.prototype.iand = function iand(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuand(num);
      };
      BN.prototype.and = function and(num) {
        if (this.length > num.length)
          return this.clone().iand(num);
        return num.clone().iand(this);
      };
      BN.prototype.uand = function uand(num) {
        if (this.length > num.length)
          return this.clone().iuand(num);
        return num.clone().iuand(this);
      };
      BN.prototype.iuxor = function iuxor(num) {
        var a;
        var b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        for (var i2 = 0;i2 < b.length; i2++) {
          this.words[i2] = a.words[i2] ^ b.words[i2];
        }
        if (this !== a) {
          for (;i2 < a.length; i2++) {
            this.words[i2] = a.words[i2];
          }
        }
        this.length = a.length;
        return this._strip();
      };
      BN.prototype.ixor = function ixor(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuxor(num);
      };
      BN.prototype.xor = function xor(num) {
        if (this.length > num.length)
          return this.clone().ixor(num);
        return num.clone().ixor(this);
      };
      BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length)
          return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      };
      BN.prototype.inotn = function inotn(width) {
        assert(typeof width === "number" && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0;
        var bitsLeft = width % 26;
        this._expand(bytesNeeded);
        if (bitsLeft > 0) {
          bytesNeeded--;
        }
        for (var i2 = 0;i2 < bytesNeeded; i2++) {
          this.words[i2] = ~this.words[i2] & 67108863;
        }
        if (bitsLeft > 0) {
          this.words[i2] = ~this.words[i2] & 67108863 >> 26 - bitsLeft;
          i2++;
        }
        for (;i2 < this.length; i2++) {
          this.words[i2] = 0;
        }
        return this._strip();
      };
      BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width);
      };
      BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0);
        var off = bit / 26 | 0;
        var wbit = bit % 26;
        this._expand(off + 1);
        if (val) {
          this.words[off] = this.words[off] | 1 << wbit;
        } else {
          this.words[off] = this.words[off] & ~(1 << wbit);
        }
        return this._strip();
      };
      BN.prototype.iadd = function iadd(num) {
        var r;
        if (this.negative !== 0 && num.negative === 0) {
          this.negative = 0;
          r = this.isub(num);
          this.negative ^= 1;
          return this._normSign();
        } else if (this.negative === 0 && num.negative !== 0) {
          num.negative = 0;
          r = this.isub(num);
          num.negative = 1;
          return r._normSign();
        }
        var a, b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++) {
          r = (a.words[i2] | 0) + (b.words[i2] | 0) + carry;
          this.words[i2] = r & 67108863;
          carry = r >>> 26;
        }
        for (;carry !== 0 && i2 < a.length; i2++) {
          r = (a.words[i2] | 0) + carry;
          this.words[i2] = r & 67108863;
          carry = r >>> 26;
        }
        this.length = a.length;
        if (carry !== 0) {
          this.words[this.length] = carry;
          this.length++;
        } else if (a !== this) {
          for (;i2 < a.length; i2++) {
            this.words[i2] = a.words[i2];
          }
        }
        return this;
      };
      BN.prototype.add = function add2(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0) {
          num.negative = 0;
          res = this.sub(num);
          num.negative ^= 1;
          return res;
        } else if (num.negative === 0 && this.negative !== 0) {
          this.negative = 0;
          res = num.sub(this);
          this.negative = 1;
          return res;
        }
        if (this.length > num.length)
          return this.clone().iadd(num);
        return num.clone().iadd(this);
      };
      BN.prototype.isub = function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          num.negative = 1;
          return r._normSign();
        } else if (this.negative !== 0) {
          this.negative = 0;
          this.iadd(num);
          this.negative = 1;
          return this._normSign();
        }
        var cmp = this.cmp(num);
        if (cmp === 0) {
          this.negative = 0;
          this.length = 1;
          this.words[0] = 0;
          return this;
        }
        var a, b;
        if (cmp > 0) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++) {
          r = (a.words[i2] | 0) - (b.words[i2] | 0) + carry;
          carry = r >> 26;
          this.words[i2] = r & 67108863;
        }
        for (;carry !== 0 && i2 < a.length; i2++) {
          r = (a.words[i2] | 0) + carry;
          carry = r >> 26;
          this.words[i2] = r & 67108863;
        }
        if (carry === 0 && i2 < a.length && a !== this) {
          for (;i2 < a.length; i2++) {
            this.words[i2] = a.words[i2];
          }
        }
        this.length = Math.max(this.length, i2);
        if (a !== this) {
          this.negative = 1;
        }
        return this._strip();
      };
      BN.prototype.sub = function sub(num) {
        return this.clone().isub(num);
      };
      function smallMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative;
        var len2 = self.length + num.length | 0;
        out.length = len2;
        len2 = len2 - 1 | 0;
        var a = self.words[0] | 0;
        var b = num.words[0] | 0;
        var r = a * b;
        var lo = r & 67108863;
        var carry = r / 67108864 | 0;
        out.words[0] = lo;
        for (var k = 1;k < len2; k++) {
          var ncarry = carry >>> 26;
          var rword = carry & 67108863;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1);j <= maxJ; j++) {
            var i2 = k - j | 0;
            a = self.words[i2] | 0;
            b = num.words[j] | 0;
            r = a * b + rword;
            ncarry += r / 67108864 | 0;
            rword = r & 67108863;
          }
          out.words[k] = rword | 0;
          carry = ncarry | 0;
        }
        if (carry !== 0) {
          out.words[k] = carry | 0;
        } else {
          out.length--;
        }
        return out._strip();
      }
      var comb10MulTo = function comb10MulTo2(self, num, out) {
        var a = self.words;
        var b = num.words;
        var o = out.words;
        var c = 0;
        var lo;
        var mid;
        var hi;
        var a0 = a[0] | 0;
        var al0 = a0 & 8191;
        var ah0 = a0 >>> 13;
        var a1 = a[1] | 0;
        var al1 = a1 & 8191;
        var ah1 = a1 >>> 13;
        var a2 = a[2] | 0;
        var al2 = a2 & 8191;
        var ah2 = a2 >>> 13;
        var a3 = a[3] | 0;
        var al3 = a3 & 8191;
        var ah3 = a3 >>> 13;
        var a4 = a[4] | 0;
        var al4 = a4 & 8191;
        var ah4 = a4 >>> 13;
        var a5 = a[5] | 0;
        var al5 = a5 & 8191;
        var ah5 = a5 >>> 13;
        var a6 = a[6] | 0;
        var al6 = a6 & 8191;
        var ah6 = a6 >>> 13;
        var a7 = a[7] | 0;
        var al7 = a7 & 8191;
        var ah7 = a7 >>> 13;
        var a8 = a[8] | 0;
        var al8 = a8 & 8191;
        var ah8 = a8 >>> 13;
        var a9 = a[9] | 0;
        var al9 = a9 & 8191;
        var ah9 = a9 >>> 13;
        var b0 = b[0] | 0;
        var bl0 = b0 & 8191;
        var bh0 = b0 >>> 13;
        var b1 = b[1] | 0;
        var bl1 = b1 & 8191;
        var bh1 = b1 >>> 13;
        var b2 = b[2] | 0;
        var bl2 = b2 & 8191;
        var bh2 = b2 >>> 13;
        var b3 = b[3] | 0;
        var bl3 = b3 & 8191;
        var bh3 = b3 >>> 13;
        var b4 = b[4] | 0;
        var bl4 = b4 & 8191;
        var bh4 = b4 >>> 13;
        var b5 = b[5] | 0;
        var bl5 = b5 & 8191;
        var bh5 = b5 >>> 13;
        var b6 = b[6] | 0;
        var bl6 = b6 & 8191;
        var bh6 = b6 >>> 13;
        var b7 = b[7] | 0;
        var bl7 = b7 & 8191;
        var bh7 = b7 >>> 13;
        var b8 = b[8] | 0;
        var bl8 = b8 & 8191;
        var bh8 = b8 >>> 13;
        var b9 = b[9] | 0;
        var bl9 = b9 & 8191;
        var bh9 = b9 >>> 13;
        out.negative = self.negative ^ num.negative;
        out.length = 19;
        lo = Math.imul(al0, bl0);
        mid = Math.imul(al0, bh0);
        mid = mid + Math.imul(ah0, bl0) | 0;
        hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
        w0 &= 67108863;
        lo = Math.imul(al1, bl0);
        mid = Math.imul(al1, bh0);
        mid = mid + Math.imul(ah1, bl0) | 0;
        hi = Math.imul(ah1, bh0);
        lo = lo + Math.imul(al0, bl1) | 0;
        mid = mid + Math.imul(al0, bh1) | 0;
        mid = mid + Math.imul(ah0, bl1) | 0;
        hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
        w1 &= 67108863;
        lo = Math.imul(al2, bl0);
        mid = Math.imul(al2, bh0);
        mid = mid + Math.imul(ah2, bl0) | 0;
        hi = Math.imul(ah2, bh0);
        lo = lo + Math.imul(al1, bl1) | 0;
        mid = mid + Math.imul(al1, bh1) | 0;
        mid = mid + Math.imul(ah1, bl1) | 0;
        hi = hi + Math.imul(ah1, bh1) | 0;
        lo = lo + Math.imul(al0, bl2) | 0;
        mid = mid + Math.imul(al0, bh2) | 0;
        mid = mid + Math.imul(ah0, bl2) | 0;
        hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
        w2 &= 67108863;
        lo = Math.imul(al3, bl0);
        mid = Math.imul(al3, bh0);
        mid = mid + Math.imul(ah3, bl0) | 0;
        hi = Math.imul(ah3, bh0);
        lo = lo + Math.imul(al2, bl1) | 0;
        mid = mid + Math.imul(al2, bh1) | 0;
        mid = mid + Math.imul(ah2, bl1) | 0;
        hi = hi + Math.imul(ah2, bh1) | 0;
        lo = lo + Math.imul(al1, bl2) | 0;
        mid = mid + Math.imul(al1, bh2) | 0;
        mid = mid + Math.imul(ah1, bl2) | 0;
        hi = hi + Math.imul(ah1, bh2) | 0;
        lo = lo + Math.imul(al0, bl3) | 0;
        mid = mid + Math.imul(al0, bh3) | 0;
        mid = mid + Math.imul(ah0, bl3) | 0;
        hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
        w3 &= 67108863;
        lo = Math.imul(al4, bl0);
        mid = Math.imul(al4, bh0);
        mid = mid + Math.imul(ah4, bl0) | 0;
        hi = Math.imul(ah4, bh0);
        lo = lo + Math.imul(al3, bl1) | 0;
        mid = mid + Math.imul(al3, bh1) | 0;
        mid = mid + Math.imul(ah3, bl1) | 0;
        hi = hi + Math.imul(ah3, bh1) | 0;
        lo = lo + Math.imul(al2, bl2) | 0;
        mid = mid + Math.imul(al2, bh2) | 0;
        mid = mid + Math.imul(ah2, bl2) | 0;
        hi = hi + Math.imul(ah2, bh2) | 0;
        lo = lo + Math.imul(al1, bl3) | 0;
        mid = mid + Math.imul(al1, bh3) | 0;
        mid = mid + Math.imul(ah1, bl3) | 0;
        hi = hi + Math.imul(ah1, bh3) | 0;
        lo = lo + Math.imul(al0, bl4) | 0;
        mid = mid + Math.imul(al0, bh4) | 0;
        mid = mid + Math.imul(ah0, bl4) | 0;
        hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
        w4 &= 67108863;
        lo = Math.imul(al5, bl0);
        mid = Math.imul(al5, bh0);
        mid = mid + Math.imul(ah5, bl0) | 0;
        hi = Math.imul(ah5, bh0);
        lo = lo + Math.imul(al4, bl1) | 0;
        mid = mid + Math.imul(al4, bh1) | 0;
        mid = mid + Math.imul(ah4, bl1) | 0;
        hi = hi + Math.imul(ah4, bh1) | 0;
        lo = lo + Math.imul(al3, bl2) | 0;
        mid = mid + Math.imul(al3, bh2) | 0;
        mid = mid + Math.imul(ah3, bl2) | 0;
        hi = hi + Math.imul(ah3, bh2) | 0;
        lo = lo + Math.imul(al2, bl3) | 0;
        mid = mid + Math.imul(al2, bh3) | 0;
        mid = mid + Math.imul(ah2, bl3) | 0;
        hi = hi + Math.imul(ah2, bh3) | 0;
        lo = lo + Math.imul(al1, bl4) | 0;
        mid = mid + Math.imul(al1, bh4) | 0;
        mid = mid + Math.imul(ah1, bl4) | 0;
        hi = hi + Math.imul(ah1, bh4) | 0;
        lo = lo + Math.imul(al0, bl5) | 0;
        mid = mid + Math.imul(al0, bh5) | 0;
        mid = mid + Math.imul(ah0, bl5) | 0;
        hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
        w5 &= 67108863;
        lo = Math.imul(al6, bl0);
        mid = Math.imul(al6, bh0);
        mid = mid + Math.imul(ah6, bl0) | 0;
        hi = Math.imul(ah6, bh0);
        lo = lo + Math.imul(al5, bl1) | 0;
        mid = mid + Math.imul(al5, bh1) | 0;
        mid = mid + Math.imul(ah5, bl1) | 0;
        hi = hi + Math.imul(ah5, bh1) | 0;
        lo = lo + Math.imul(al4, bl2) | 0;
        mid = mid + Math.imul(al4, bh2) | 0;
        mid = mid + Math.imul(ah4, bl2) | 0;
        hi = hi + Math.imul(ah4, bh2) | 0;
        lo = lo + Math.imul(al3, bl3) | 0;
        mid = mid + Math.imul(al3, bh3) | 0;
        mid = mid + Math.imul(ah3, bl3) | 0;
        hi = hi + Math.imul(ah3, bh3) | 0;
        lo = lo + Math.imul(al2, bl4) | 0;
        mid = mid + Math.imul(al2, bh4) | 0;
        mid = mid + Math.imul(ah2, bl4) | 0;
        hi = hi + Math.imul(ah2, bh4) | 0;
        lo = lo + Math.imul(al1, bl5) | 0;
        mid = mid + Math.imul(al1, bh5) | 0;
        mid = mid + Math.imul(ah1, bl5) | 0;
        hi = hi + Math.imul(ah1, bh5) | 0;
        lo = lo + Math.imul(al0, bl6) | 0;
        mid = mid + Math.imul(al0, bh6) | 0;
        mid = mid + Math.imul(ah0, bl6) | 0;
        hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
        w6 &= 67108863;
        lo = Math.imul(al7, bl0);
        mid = Math.imul(al7, bh0);
        mid = mid + Math.imul(ah7, bl0) | 0;
        hi = Math.imul(ah7, bh0);
        lo = lo + Math.imul(al6, bl1) | 0;
        mid = mid + Math.imul(al6, bh1) | 0;
        mid = mid + Math.imul(ah6, bl1) | 0;
        hi = hi + Math.imul(ah6, bh1) | 0;
        lo = lo + Math.imul(al5, bl2) | 0;
        mid = mid + Math.imul(al5, bh2) | 0;
        mid = mid + Math.imul(ah5, bl2) | 0;
        hi = hi + Math.imul(ah5, bh2) | 0;
        lo = lo + Math.imul(al4, bl3) | 0;
        mid = mid + Math.imul(al4, bh3) | 0;
        mid = mid + Math.imul(ah4, bl3) | 0;
        hi = hi + Math.imul(ah4, bh3) | 0;
        lo = lo + Math.imul(al3, bl4) | 0;
        mid = mid + Math.imul(al3, bh4) | 0;
        mid = mid + Math.imul(ah3, bl4) | 0;
        hi = hi + Math.imul(ah3, bh4) | 0;
        lo = lo + Math.imul(al2, bl5) | 0;
        mid = mid + Math.imul(al2, bh5) | 0;
        mid = mid + Math.imul(ah2, bl5) | 0;
        hi = hi + Math.imul(ah2, bh5) | 0;
        lo = lo + Math.imul(al1, bl6) | 0;
        mid = mid + Math.imul(al1, bh6) | 0;
        mid = mid + Math.imul(ah1, bl6) | 0;
        hi = hi + Math.imul(ah1, bh6) | 0;
        lo = lo + Math.imul(al0, bl7) | 0;
        mid = mid + Math.imul(al0, bh7) | 0;
        mid = mid + Math.imul(ah0, bl7) | 0;
        hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
        w7 &= 67108863;
        lo = Math.imul(al8, bl0);
        mid = Math.imul(al8, bh0);
        mid = mid + Math.imul(ah8, bl0) | 0;
        hi = Math.imul(ah8, bh0);
        lo = lo + Math.imul(al7, bl1) | 0;
        mid = mid + Math.imul(al7, bh1) | 0;
        mid = mid + Math.imul(ah7, bl1) | 0;
        hi = hi + Math.imul(ah7, bh1) | 0;
        lo = lo + Math.imul(al6, bl2) | 0;
        mid = mid + Math.imul(al6, bh2) | 0;
        mid = mid + Math.imul(ah6, bl2) | 0;
        hi = hi + Math.imul(ah6, bh2) | 0;
        lo = lo + Math.imul(al5, bl3) | 0;
        mid = mid + Math.imul(al5, bh3) | 0;
        mid = mid + Math.imul(ah5, bl3) | 0;
        hi = hi + Math.imul(ah5, bh3) | 0;
        lo = lo + Math.imul(al4, bl4) | 0;
        mid = mid + Math.imul(al4, bh4) | 0;
        mid = mid + Math.imul(ah4, bl4) | 0;
        hi = hi + Math.imul(ah4, bh4) | 0;
        lo = lo + Math.imul(al3, bl5) | 0;
        mid = mid + Math.imul(al3, bh5) | 0;
        mid = mid + Math.imul(ah3, bl5) | 0;
        hi = hi + Math.imul(ah3, bh5) | 0;
        lo = lo + Math.imul(al2, bl6) | 0;
        mid = mid + Math.imul(al2, bh6) | 0;
        mid = mid + Math.imul(ah2, bl6) | 0;
        hi = hi + Math.imul(ah2, bh6) | 0;
        lo = lo + Math.imul(al1, bl7) | 0;
        mid = mid + Math.imul(al1, bh7) | 0;
        mid = mid + Math.imul(ah1, bl7) | 0;
        hi = hi + Math.imul(ah1, bh7) | 0;
        lo = lo + Math.imul(al0, bl8) | 0;
        mid = mid + Math.imul(al0, bh8) | 0;
        mid = mid + Math.imul(ah0, bl8) | 0;
        hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
        w8 &= 67108863;
        lo = Math.imul(al9, bl0);
        mid = Math.imul(al9, bh0);
        mid = mid + Math.imul(ah9, bl0) | 0;
        hi = Math.imul(ah9, bh0);
        lo = lo + Math.imul(al8, bl1) | 0;
        mid = mid + Math.imul(al8, bh1) | 0;
        mid = mid + Math.imul(ah8, bl1) | 0;
        hi = hi + Math.imul(ah8, bh1) | 0;
        lo = lo + Math.imul(al7, bl2) | 0;
        mid = mid + Math.imul(al7, bh2) | 0;
        mid = mid + Math.imul(ah7, bl2) | 0;
        hi = hi + Math.imul(ah7, bh2) | 0;
        lo = lo + Math.imul(al6, bl3) | 0;
        mid = mid + Math.imul(al6, bh3) | 0;
        mid = mid + Math.imul(ah6, bl3) | 0;
        hi = hi + Math.imul(ah6, bh3) | 0;
        lo = lo + Math.imul(al5, bl4) | 0;
        mid = mid + Math.imul(al5, bh4) | 0;
        mid = mid + Math.imul(ah5, bl4) | 0;
        hi = hi + Math.imul(ah5, bh4) | 0;
        lo = lo + Math.imul(al4, bl5) | 0;
        mid = mid + Math.imul(al4, bh5) | 0;
        mid = mid + Math.imul(ah4, bl5) | 0;
        hi = hi + Math.imul(ah4, bh5) | 0;
        lo = lo + Math.imul(al3, bl6) | 0;
        mid = mid + Math.imul(al3, bh6) | 0;
        mid = mid + Math.imul(ah3, bl6) | 0;
        hi = hi + Math.imul(ah3, bh6) | 0;
        lo = lo + Math.imul(al2, bl7) | 0;
        mid = mid + Math.imul(al2, bh7) | 0;
        mid = mid + Math.imul(ah2, bl7) | 0;
        hi = hi + Math.imul(ah2, bh7) | 0;
        lo = lo + Math.imul(al1, bl8) | 0;
        mid = mid + Math.imul(al1, bh8) | 0;
        mid = mid + Math.imul(ah1, bl8) | 0;
        hi = hi + Math.imul(ah1, bh8) | 0;
        lo = lo + Math.imul(al0, bl9) | 0;
        mid = mid + Math.imul(al0, bh9) | 0;
        mid = mid + Math.imul(ah0, bl9) | 0;
        hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
        w9 &= 67108863;
        lo = Math.imul(al9, bl1);
        mid = Math.imul(al9, bh1);
        mid = mid + Math.imul(ah9, bl1) | 0;
        hi = Math.imul(ah9, bh1);
        lo = lo + Math.imul(al8, bl2) | 0;
        mid = mid + Math.imul(al8, bh2) | 0;
        mid = mid + Math.imul(ah8, bl2) | 0;
        hi = hi + Math.imul(ah8, bh2) | 0;
        lo = lo + Math.imul(al7, bl3) | 0;
        mid = mid + Math.imul(al7, bh3) | 0;
        mid = mid + Math.imul(ah7, bl3) | 0;
        hi = hi + Math.imul(ah7, bh3) | 0;
        lo = lo + Math.imul(al6, bl4) | 0;
        mid = mid + Math.imul(al6, bh4) | 0;
        mid = mid + Math.imul(ah6, bl4) | 0;
        hi = hi + Math.imul(ah6, bh4) | 0;
        lo = lo + Math.imul(al5, bl5) | 0;
        mid = mid + Math.imul(al5, bh5) | 0;
        mid = mid + Math.imul(ah5, bl5) | 0;
        hi = hi + Math.imul(ah5, bh5) | 0;
        lo = lo + Math.imul(al4, bl6) | 0;
        mid = mid + Math.imul(al4, bh6) | 0;
        mid = mid + Math.imul(ah4, bl6) | 0;
        hi = hi + Math.imul(ah4, bh6) | 0;
        lo = lo + Math.imul(al3, bl7) | 0;
        mid = mid + Math.imul(al3, bh7) | 0;
        mid = mid + Math.imul(ah3, bl7) | 0;
        hi = hi + Math.imul(ah3, bh7) | 0;
        lo = lo + Math.imul(al2, bl8) | 0;
        mid = mid + Math.imul(al2, bh8) | 0;
        mid = mid + Math.imul(ah2, bl8) | 0;
        hi = hi + Math.imul(ah2, bh8) | 0;
        lo = lo + Math.imul(al1, bl9) | 0;
        mid = mid + Math.imul(al1, bh9) | 0;
        mid = mid + Math.imul(ah1, bl9) | 0;
        hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
        w10 &= 67108863;
        lo = Math.imul(al9, bl2);
        mid = Math.imul(al9, bh2);
        mid = mid + Math.imul(ah9, bl2) | 0;
        hi = Math.imul(ah9, bh2);
        lo = lo + Math.imul(al8, bl3) | 0;
        mid = mid + Math.imul(al8, bh3) | 0;
        mid = mid + Math.imul(ah8, bl3) | 0;
        hi = hi + Math.imul(ah8, bh3) | 0;
        lo = lo + Math.imul(al7, bl4) | 0;
        mid = mid + Math.imul(al7, bh4) | 0;
        mid = mid + Math.imul(ah7, bl4) | 0;
        hi = hi + Math.imul(ah7, bh4) | 0;
        lo = lo + Math.imul(al6, bl5) | 0;
        mid = mid + Math.imul(al6, bh5) | 0;
        mid = mid + Math.imul(ah6, bl5) | 0;
        hi = hi + Math.imul(ah6, bh5) | 0;
        lo = lo + Math.imul(al5, bl6) | 0;
        mid = mid + Math.imul(al5, bh6) | 0;
        mid = mid + Math.imul(ah5, bl6) | 0;
        hi = hi + Math.imul(ah5, bh6) | 0;
        lo = lo + Math.imul(al4, bl7) | 0;
        mid = mid + Math.imul(al4, bh7) | 0;
        mid = mid + Math.imul(ah4, bl7) | 0;
        hi = hi + Math.imul(ah4, bh7) | 0;
        lo = lo + Math.imul(al3, bl8) | 0;
        mid = mid + Math.imul(al3, bh8) | 0;
        mid = mid + Math.imul(ah3, bl8) | 0;
        hi = hi + Math.imul(ah3, bh8) | 0;
        lo = lo + Math.imul(al2, bl9) | 0;
        mid = mid + Math.imul(al2, bh9) | 0;
        mid = mid + Math.imul(ah2, bl9) | 0;
        hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
        w11 &= 67108863;
        lo = Math.imul(al9, bl3);
        mid = Math.imul(al9, bh3);
        mid = mid + Math.imul(ah9, bl3) | 0;
        hi = Math.imul(ah9, bh3);
        lo = lo + Math.imul(al8, bl4) | 0;
        mid = mid + Math.imul(al8, bh4) | 0;
        mid = mid + Math.imul(ah8, bl4) | 0;
        hi = hi + Math.imul(ah8, bh4) | 0;
        lo = lo + Math.imul(al7, bl5) | 0;
        mid = mid + Math.imul(al7, bh5) | 0;
        mid = mid + Math.imul(ah7, bl5) | 0;
        hi = hi + Math.imul(ah7, bh5) | 0;
        lo = lo + Math.imul(al6, bl6) | 0;
        mid = mid + Math.imul(al6, bh6) | 0;
        mid = mid + Math.imul(ah6, bl6) | 0;
        hi = hi + Math.imul(ah6, bh6) | 0;
        lo = lo + Math.imul(al5, bl7) | 0;
        mid = mid + Math.imul(al5, bh7) | 0;
        mid = mid + Math.imul(ah5, bl7) | 0;
        hi = hi + Math.imul(ah5, bh7) | 0;
        lo = lo + Math.imul(al4, bl8) | 0;
        mid = mid + Math.imul(al4, bh8) | 0;
        mid = mid + Math.imul(ah4, bl8) | 0;
        hi = hi + Math.imul(ah4, bh8) | 0;
        lo = lo + Math.imul(al3, bl9) | 0;
        mid = mid + Math.imul(al3, bh9) | 0;
        mid = mid + Math.imul(ah3, bl9) | 0;
        hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
        w12 &= 67108863;
        lo = Math.imul(al9, bl4);
        mid = Math.imul(al9, bh4);
        mid = mid + Math.imul(ah9, bl4) | 0;
        hi = Math.imul(ah9, bh4);
        lo = lo + Math.imul(al8, bl5) | 0;
        mid = mid + Math.imul(al8, bh5) | 0;
        mid = mid + Math.imul(ah8, bl5) | 0;
        hi = hi + Math.imul(ah8, bh5) | 0;
        lo = lo + Math.imul(al7, bl6) | 0;
        mid = mid + Math.imul(al7, bh6) | 0;
        mid = mid + Math.imul(ah7, bl6) | 0;
        hi = hi + Math.imul(ah7, bh6) | 0;
        lo = lo + Math.imul(al6, bl7) | 0;
        mid = mid + Math.imul(al6, bh7) | 0;
        mid = mid + Math.imul(ah6, bl7) | 0;
        hi = hi + Math.imul(ah6, bh7) | 0;
        lo = lo + Math.imul(al5, bl8) | 0;
        mid = mid + Math.imul(al5, bh8) | 0;
        mid = mid + Math.imul(ah5, bl8) | 0;
        hi = hi + Math.imul(ah5, bh8) | 0;
        lo = lo + Math.imul(al4, bl9) | 0;
        mid = mid + Math.imul(al4, bh9) | 0;
        mid = mid + Math.imul(ah4, bl9) | 0;
        hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
        w13 &= 67108863;
        lo = Math.imul(al9, bl5);
        mid = Math.imul(al9, bh5);
        mid = mid + Math.imul(ah9, bl5) | 0;
        hi = Math.imul(ah9, bh5);
        lo = lo + Math.imul(al8, bl6) | 0;
        mid = mid + Math.imul(al8, bh6) | 0;
        mid = mid + Math.imul(ah8, bl6) | 0;
        hi = hi + Math.imul(ah8, bh6) | 0;
        lo = lo + Math.imul(al7, bl7) | 0;
        mid = mid + Math.imul(al7, bh7) | 0;
        mid = mid + Math.imul(ah7, bl7) | 0;
        hi = hi + Math.imul(ah7, bh7) | 0;
        lo = lo + Math.imul(al6, bl8) | 0;
        mid = mid + Math.imul(al6, bh8) | 0;
        mid = mid + Math.imul(ah6, bl8) | 0;
        hi = hi + Math.imul(ah6, bh8) | 0;
        lo = lo + Math.imul(al5, bl9) | 0;
        mid = mid + Math.imul(al5, bh9) | 0;
        mid = mid + Math.imul(ah5, bl9) | 0;
        hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
        w14 &= 67108863;
        lo = Math.imul(al9, bl6);
        mid = Math.imul(al9, bh6);
        mid = mid + Math.imul(ah9, bl6) | 0;
        hi = Math.imul(ah9, bh6);
        lo = lo + Math.imul(al8, bl7) | 0;
        mid = mid + Math.imul(al8, bh7) | 0;
        mid = mid + Math.imul(ah8, bl7) | 0;
        hi = hi + Math.imul(ah8, bh7) | 0;
        lo = lo + Math.imul(al7, bl8) | 0;
        mid = mid + Math.imul(al7, bh8) | 0;
        mid = mid + Math.imul(ah7, bl8) | 0;
        hi = hi + Math.imul(ah7, bh8) | 0;
        lo = lo + Math.imul(al6, bl9) | 0;
        mid = mid + Math.imul(al6, bh9) | 0;
        mid = mid + Math.imul(ah6, bl9) | 0;
        hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
        w15 &= 67108863;
        lo = Math.imul(al9, bl7);
        mid = Math.imul(al9, bh7);
        mid = mid + Math.imul(ah9, bl7) | 0;
        hi = Math.imul(ah9, bh7);
        lo = lo + Math.imul(al8, bl8) | 0;
        mid = mid + Math.imul(al8, bh8) | 0;
        mid = mid + Math.imul(ah8, bl8) | 0;
        hi = hi + Math.imul(ah8, bh8) | 0;
        lo = lo + Math.imul(al7, bl9) | 0;
        mid = mid + Math.imul(al7, bh9) | 0;
        mid = mid + Math.imul(ah7, bl9) | 0;
        hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
        w16 &= 67108863;
        lo = Math.imul(al9, bl8);
        mid = Math.imul(al9, bh8);
        mid = mid + Math.imul(ah9, bl8) | 0;
        hi = Math.imul(ah9, bh8);
        lo = lo + Math.imul(al8, bl9) | 0;
        mid = mid + Math.imul(al8, bh9) | 0;
        mid = mid + Math.imul(ah8, bl9) | 0;
        hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
        w17 &= 67108863;
        lo = Math.imul(al9, bl9);
        mid = Math.imul(al9, bh9);
        mid = mid + Math.imul(ah9, bl9) | 0;
        hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
        w18 &= 67108863;
        o[0] = w0;
        o[1] = w1;
        o[2] = w2;
        o[3] = w3;
        o[4] = w4;
        o[5] = w5;
        o[6] = w6;
        o[7] = w7;
        o[8] = w8;
        o[9] = w9;
        o[10] = w10;
        o[11] = w11;
        o[12] = w12;
        o[13] = w13;
        o[14] = w14;
        o[15] = w15;
        o[16] = w16;
        o[17] = w17;
        o[18] = w18;
        if (c !== 0) {
          o[19] = c;
          out.length++;
        }
        return out;
      };
      if (!Math.imul) {
        comb10MulTo = smallMulTo;
      }
      function bigMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative;
        out.length = self.length + num.length;
        var carry = 0;
        var hncarry = 0;
        for (var k = 0;k < out.length - 1; k++) {
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 67108863;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1);j <= maxJ; j++) {
            var i2 = k - j;
            var a = self.words[i2] | 0;
            var b = num.words[j] | 0;
            var r = a * b;
            var lo = r & 67108863;
            ncarry = ncarry + (r / 67108864 | 0) | 0;
            lo = lo + rword | 0;
            rword = lo & 67108863;
            ncarry = ncarry + (lo >>> 26) | 0;
            hncarry += ncarry >>> 26;
            ncarry &= 67108863;
          }
          out.words[k] = rword;
          carry = ncarry;
          ncarry = hncarry;
        }
        if (carry !== 0) {
          out.words[k] = carry;
        } else {
          out.length--;
        }
        return out._strip();
      }
      function jumboMulTo(self, num, out) {
        return bigMulTo(self, num, out);
      }
      BN.prototype.mulTo = function mulTo(num, out) {
        var res;
        var len2 = this.length + num.length;
        if (this.length === 10 && num.length === 10) {
          res = comb10MulTo(this, num, out);
        } else if (len2 < 63) {
          res = smallMulTo(this, num, out);
        } else if (len2 < 1024) {
          res = bigMulTo(this, num, out);
        } else {
          res = jumboMulTo(this, num, out);
        }
        return res;
      };
      function FFTM(x, y) {
        this.x = x;
        this.y = y;
      }
      FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N);
        var l = BN.prototype._countBits(N) - 1;
        for (var i2 = 0;i2 < N; i2++) {
          t[i2] = this.revBin(i2, l, N);
        }
        return t;
      };
      FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1)
          return x;
        var rb = 0;
        for (var i2 = 0;i2 < l; i2++) {
          rb |= (x & 1) << l - i2 - 1;
          x >>= 1;
        }
        return rb;
      };
      FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i2 = 0;i2 < N; i2++) {
          rtws[i2] = rws[rbt[i2]];
          itws[i2] = iws[rbt[i2]];
        }
      };
      FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for (var s = 1;s < N; s <<= 1) {
          var l = s << 1;
          var rtwdf = Math.cos(2 * Math.PI / l);
          var itwdf = Math.sin(2 * Math.PI / l);
          for (var p = 0;p < N; p += l) {
            var rtwdf_ = rtwdf;
            var itwdf_ = itwdf;
            for (var j = 0;j < s; j++) {
              var re = rtws[p + j];
              var ie = itws[p + j];
              var ro = rtws[p + j + s];
              var io = itws[p + j + s];
              var rx = rtwdf_ * ro - itwdf_ * io;
              io = rtwdf_ * io + itwdf_ * ro;
              ro = rx;
              rtws[p + j] = re + ro;
              itws[p + j] = ie + io;
              rtws[p + j + s] = re - ro;
              itws[p + j + s] = ie - io;
              if (j !== l) {
                rx = rtwdf * rtwdf_ - itwdf * itwdf_;
                itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                rtwdf_ = rx;
              }
            }
          }
        }
      };
      FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1;
        var odd = N & 1;
        var i2 = 0;
        for (N = N / 2 | 0;N; N = N >>> 1) {
          i2++;
        }
        return 1 << i2 + 1 + odd;
      };
      FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1)
          return;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var t = rws[i2];
          rws[i2] = rws[N - i2 - 1];
          rws[N - i2 - 1] = t;
          t = iws[i2];
          iws[i2] = -iws[N - i2 - 1];
          iws[N - i2 - 1] = -t;
        }
      };
      FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var w = Math.round(ws[2 * i2 + 1] / N) * 8192 + Math.round(ws[2 * i2] / N) + carry;
          ws[i2] = w & 67108863;
          if (w < 67108864) {
            carry = 0;
          } else {
            carry = w / 67108864 | 0;
          }
        }
        return ws;
      };
      FFTM.prototype.convert13b = function convert13b(ws, len2, rws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < len2; i2++) {
          carry = carry + (ws[i2] | 0);
          rws[2 * i2] = carry & 8191;
          carry = carry >>> 13;
          rws[2 * i2 + 1] = carry & 8191;
          carry = carry >>> 13;
        }
        for (i2 = 2 * len2;i2 < N; ++i2) {
          rws[i2] = 0;
        }
        assert(carry === 0);
        assert((carry & ~8191) === 0);
      };
      FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N);
        for (var i2 = 0;i2 < N; i2++) {
          ph[i2] = 0;
        }
        return ph;
      };
      FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length);
        var rbt = this.makeRBT(N);
        var _ = this.stub(N);
        var rws = new Array(N);
        var rwst = new Array(N);
        var iwst = new Array(N);
        var nrws = new Array(N);
        var nrwst = new Array(N);
        var niwst = new Array(N);
        var rmws = out.words;
        rmws.length = N;
        this.convert13b(x.words, x.length, rws, N);
        this.convert13b(y.words, y.length, nrws, N);
        this.transform(rws, _, rwst, iwst, N, rbt);
        this.transform(nrws, _, nrwst, niwst, N, rbt);
        for (var i2 = 0;i2 < N; i2++) {
          var rx = rwst[i2] * nrwst[i2] - iwst[i2] * niwst[i2];
          iwst[i2] = rwst[i2] * niwst[i2] + iwst[i2] * nrwst[i2];
          rwst[i2] = rx;
        }
        this.conjugate(rwst, iwst, N);
        this.transform(rwst, iwst, rmws, _, N, rbt);
        this.conjugate(rmws, _, N);
        this.normalize13b(rmws, N);
        out.negative = x.negative ^ y.negative;
        out.length = x.length + y.length;
        return out._strip();
      };
      BN.prototype.mul = function mul(num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return this.mulTo(num, out);
      };
      BN.prototype.mulf = function mulf(num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return jumboMulTo(this, num, out);
      };
      BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this);
      };
      BN.prototype.imuln = function imuln(num) {
        var isNegNum = num < 0;
        if (isNegNum)
          num = -num;
        assert(typeof num === "number");
        assert(num < 67108864);
        var carry = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var w = (this.words[i2] | 0) * num;
          var lo = (w & 67108863) + (carry & 67108863);
          carry >>= 26;
          carry += w / 67108864 | 0;
          carry += lo >>> 26;
          this.words[i2] = lo & 67108863;
        }
        if (carry !== 0) {
          this.words[i2] = carry;
          this.length++;
        }
        if (num === 0) {
          this.length = 1;
          this._normSign();
        }
        return isNegNum ? this.ineg() : this;
      };
      BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num);
      };
      BN.prototype.sqr = function sqr() {
        return this.mul(this);
      };
      BN.prototype.isqr = function isqr() {
        return this.imul(this.clone());
      };
      BN.prototype.pow = function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0)
          return new BN(1);
        var res = this;
        for (var i2 = 0;i2 < w.length; i2++, res = res.sqr()) {
          if (w[i2] !== 0)
            break;
        }
        if (++i2 < w.length) {
          for (var q = res.sqr();i2 < w.length; i2++, q = q.sqr()) {
            if (w[i2] === 0)
              continue;
            res = res.mul(q);
          }
        }
        return res;
      };
      BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        var carryMask = 67108863 >>> 26 - r << 26 - r;
        var i2;
        if (r !== 0) {
          var carry = 0;
          for (i2 = 0;i2 < this.length; i2++) {
            var newCarry = this.words[i2] & carryMask;
            var c = (this.words[i2] | 0) - newCarry << r;
            this.words[i2] = c | carry;
            carry = newCarry >>> 26 - r;
          }
          if (carry) {
            this.words[i2] = carry;
            this.length++;
          }
        }
        if (s !== 0) {
          for (i2 = this.length - 1;i2 >= 0; i2--) {
            this.words[i2 + s] = this.words[i2];
          }
          for (i2 = 0;i2 < s; i2++) {
            this.words[i2] = 0;
          }
          this.length += s;
        }
        return this._strip();
      };
      BN.prototype.ishln = function ishln(bits) {
        assert(this.negative === 0);
        return this.iushln(bits);
      };
      BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0);
        var h;
        if (hint) {
          h = (hint - hint % 26) / 26;
        } else {
          h = 0;
        }
        var r = bits % 26;
        var s = Math.min((bits - r) / 26, this.length);
        var mask = 67108863 ^ 67108863 >>> r << r;
        var maskedWords = extended;
        h -= s;
        h = Math.max(0, h);
        if (maskedWords) {
          for (var i2 = 0;i2 < s; i2++) {
            maskedWords.words[i2] = this.words[i2];
          }
          maskedWords.length = s;
        }
        if (s === 0) {} else if (this.length > s) {
          this.length -= s;
          for (i2 = 0;i2 < this.length; i2++) {
            this.words[i2] = this.words[i2 + s];
          }
        } else {
          this.words[0] = 0;
          this.length = 1;
        }
        var carry = 0;
        for (i2 = this.length - 1;i2 >= 0 && (carry !== 0 || i2 >= h); i2--) {
          var word = this.words[i2] | 0;
          this.words[i2] = carry << 26 - r | word >>> r;
          carry = word & mask;
        }
        if (maskedWords && carry !== 0) {
          maskedWords.words[maskedWords.length++] = carry;
        }
        if (this.length === 0) {
          this.words[0] = 0;
          this.length = 1;
        }
        return this._strip();
      };
      BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        assert(this.negative === 0);
        return this.iushrn(bits, hint, extended);
      };
      BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits);
      };
      BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits);
      };
      BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits);
      };
      BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits);
      };
      BN.prototype.testn = function testn(bit) {
        assert(typeof bit === "number" && bit >= 0);
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;
        if (this.length <= s)
          return false;
        var w = this.words[s];
        return !!(w & q);
      };
      BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        assert(this.negative === 0, "imaskn works only with positive numbers");
        if (this.length <= s) {
          return this;
        }
        if (r !== 0) {
          s++;
        }
        this.length = Math.min(s, this.length);
        if (r !== 0) {
          var mask = 67108863 ^ 67108863 >>> r << r;
          this.words[this.length - 1] &= mask;
        }
        if (this.length === 0) {
          this.words[0] = 0;
          this.length = 1;
        }
        return this._strip();
      };
      BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits);
      };
      BN.prototype.iaddn = function iaddn(num) {
        assert(typeof num === "number");
        assert(num < 67108864);
        if (num < 0)
          return this.isubn(-num);
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) <= num) {
            this.words[0] = num - (this.words[0] | 0);
            this.negative = 0;
            return this;
          }
          this.negative = 0;
          this.isubn(num);
          this.negative = 1;
          return this;
        }
        return this._iaddn(num);
      };
      BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num;
        for (var i2 = 0;i2 < this.length && this.words[i2] >= 67108864; i2++) {
          this.words[i2] -= 67108864;
          if (i2 === this.length - 1) {
            this.words[i2 + 1] = 1;
          } else {
            this.words[i2 + 1]++;
          }
        }
        this.length = Math.max(this.length, i2 + 1);
        return this;
      };
      BN.prototype.isubn = function isubn(num) {
        assert(typeof num === "number");
        assert(num < 67108864);
        if (num < 0)
          return this.iaddn(-num);
        if (this.negative !== 0) {
          this.negative = 0;
          this.iaddn(num);
          this.negative = 1;
          return this;
        }
        this.words[0] -= num;
        if (this.length === 1 && this.words[0] < 0) {
          this.words[0] = -this.words[0];
          this.negative = 1;
        } else {
          for (var i2 = 0;i2 < this.length && this.words[i2] < 0; i2++) {
            this.words[i2] += 67108864;
            this.words[i2 + 1] -= 1;
          }
        }
        return this._strip();
      };
      BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num);
      };
      BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num);
      };
      BN.prototype.iabs = function iabs() {
        this.negative = 0;
        return this;
      };
      BN.prototype.abs = function abs() {
        return this.clone().iabs();
      };
      BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len2 = num.length + shift;
        var i2;
        this._expand(len2);
        var w;
        var carry = 0;
        for (i2 = 0;i2 < num.length; i2++) {
          w = (this.words[i2 + shift] | 0) + carry;
          var right = (num.words[i2] | 0) * mul;
          w -= right & 67108863;
          carry = (w >> 26) - (right / 67108864 | 0);
          this.words[i2 + shift] = w & 67108863;
        }
        for (;i2 < this.length - shift; i2++) {
          w = (this.words[i2 + shift] | 0) + carry;
          carry = w >> 26;
          this.words[i2 + shift] = w & 67108863;
        }
        if (carry === 0)
          return this._strip();
        assert(carry === -1);
        carry = 0;
        for (i2 = 0;i2 < this.length; i2++) {
          w = -(this.words[i2] | 0) + carry;
          carry = w >> 26;
          this.words[i2] = w & 67108863;
        }
        this.negative = 1;
        return this._strip();
      };
      BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length;
        var a = this.clone();
        var b = num;
        var bhi = b.words[b.length - 1] | 0;
        var bhiBits = this._countBits(bhi);
        shift = 26 - bhiBits;
        if (shift !== 0) {
          b = b.ushln(shift);
          a.iushln(shift);
          bhi = b.words[b.length - 1] | 0;
        }
        var m = a.length - b.length;
        var q;
        if (mode !== "mod") {
          q = new BN(null);
          q.length = m + 1;
          q.words = new Array(q.length);
          for (var i2 = 0;i2 < q.length; i2++) {
            q.words[i2] = 0;
          }
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          a = diff;
          if (q) {
            q.words[m] = 1;
          }
        }
        for (var j = m - 1;j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
          qj = Math.min(qj / bhi | 0, 67108863);
          a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0) {
            qj--;
            a.negative = 0;
            a._ishlnsubmul(b, 1, j);
            if (!a.isZero()) {
              a.negative ^= 1;
            }
          }
          if (q) {
            q.words[j] = qj;
          }
        }
        if (q) {
          q._strip();
        }
        a._strip();
        if (mode !== "div" && shift !== 0) {
          a.iushrn(shift);
        }
        return {
          div: q || null,
          mod: a
        };
      };
      BN.prototype.divmod = function divmod(num, mode, positive) {
        assert(!num.isZero());
        if (this.isZero()) {
          return {
            div: new BN(0),
            mod: new BN(0)
          };
        }
        var div, mod2, res;
        if (this.negative !== 0 && num.negative === 0) {
          res = this.neg().divmod(num, mode);
          if (mode !== "mod") {
            div = res.div.neg();
          }
          if (mode !== "div") {
            mod2 = res.mod.neg();
            if (positive && mod2.negative !== 0) {
              mod2.iadd(num);
            }
          }
          return {
            div,
            mod: mod2
          };
        }
        if (this.negative === 0 && num.negative !== 0) {
          res = this.divmod(num.neg(), mode);
          if (mode !== "mod") {
            div = res.div.neg();
          }
          return {
            div,
            mod: res.mod
          };
        }
        if ((this.negative & num.negative) !== 0) {
          res = this.neg().divmod(num.neg(), mode);
          if (mode !== "div") {
            mod2 = res.mod.neg();
            if (positive && mod2.negative !== 0) {
              mod2.isub(num);
            }
          }
          return {
            div: res.div,
            mod: mod2
          };
        }
        if (num.length > this.length || this.cmp(num) < 0) {
          return {
            div: new BN(0),
            mod: this
          };
        }
        if (num.length === 1) {
          if (mode === "div") {
            return {
              div: this.divn(num.words[0]),
              mod: null
            };
          }
          if (mode === "mod") {
            return {
              div: null,
              mod: new BN(this.modrn(num.words[0]))
            };
          }
          return {
            div: this.divn(num.words[0]),
            mod: new BN(this.modrn(num.words[0]))
          };
        }
        return this._wordDiv(num, mode);
      };
      BN.prototype.div = function div(num) {
        return this.divmod(num, "div", false).div;
      };
      BN.prototype.mod = function mod2(num) {
        return this.divmod(num, "mod", false).mod;
      };
      BN.prototype.umod = function umod(num) {
        return this.divmod(num, "mod", true).mod;
      };
      BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num);
        if (dm.mod.isZero())
          return dm.div;
        var mod2 = dm.mod.abs();
        var half = num.abs().iushrn(1);
        var r2 = num.words[0] & 1;
        var cmp = mod2.cmp(half);
        if (cmp < 0 || r2 === 1 && cmp === 0)
          return dm.div;
        var up = new BN(1);
        up.negative = this.negative ^ num.negative;
        return dm.div.iadd(up);
      };
      BN.prototype.modrn = function modrn(num) {
        var isNegNum = num < 0;
        if (isNegNum)
          num = -num;
        assert(num <= 67108863);
        var p = (1 << 26) % num;
        var acc = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          acc = (p * acc + (this.words[i2] | 0)) % num;
        }
        return isNegNum ? -acc : acc;
      };
      BN.prototype.modn = function modn(num) {
        return this.modrn(num);
      };
      BN.prototype.idivn = function idivn(num) {
        var isNegNum = num < 0;
        if (isNegNum)
          num = -num;
        assert(num <= 67108863);
        var carry = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var w = (this.words[i2] | 0) + carry * 67108864;
          this.words[i2] = w / num | 0;
          carry = w % num;
        }
        this._strip();
        return isNegNum ? this.ineg() : this;
      };
      BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num);
      };
      BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0);
        assert(!p.isZero());
        var x = this;
        var y = p.clone();
        if (x.negative !== 0) {
          x = x.umod(p);
        } else {
          x = x.clone();
        }
        var A = new BN(1);
        var B = new BN(0);
        var C = new BN(0);
        var D = new BN(1);
        var g = 0;
        while (x.isEven() && y.isEven()) {
          x.iushrn(1);
          y.iushrn(1);
          ++g;
        }
        var yp = y.clone();
        var xp = x.clone();
        while (!x.isZero()) {
          for (var i2 = 0, im = 1;(x.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            x.iushrn(i2);
            while (i2-- > 0) {
              if (A.isOdd() || B.isOdd()) {
                A.iadd(yp);
                B.isub(xp);
              }
              A.iushrn(1);
              B.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd()) {
                C.iadd(yp);
                D.isub(xp);
              }
              C.iushrn(1);
              D.iushrn(1);
            }
          }
          if (x.cmp(y) >= 0) {
            x.isub(y);
            A.isub(C);
            B.isub(D);
          } else {
            y.isub(x);
            C.isub(A);
            D.isub(B);
          }
        }
        return {
          a: C,
          b: D,
          gcd: y.iushln(g)
        };
      };
      BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0);
        assert(!p.isZero());
        var a = this;
        var b = p.clone();
        if (a.negative !== 0) {
          a = a.umod(p);
        } else {
          a = a.clone();
        }
        var x1 = new BN(1);
        var x2 = new BN(0);
        var delta = b.clone();
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i2 = 0, im = 1;(a.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            a.iushrn(i2);
            while (i2-- > 0) {
              if (x1.isOdd()) {
                x1.iadd(delta);
              }
              x1.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd()) {
                x2.iadd(delta);
              }
              x2.iushrn(1);
            }
          }
          if (a.cmp(b) >= 0) {
            a.isub(b);
            x1.isub(x2);
          } else {
            b.isub(a);
            x2.isub(x1);
          }
        }
        var res;
        if (a.cmpn(1) === 0) {
          res = x1;
        } else {
          res = x2;
        }
        if (res.cmpn(0) < 0) {
          res.iadd(p);
        }
        return res;
      };
      BN.prototype.gcd = function gcd(num) {
        if (this.isZero())
          return num.abs();
        if (num.isZero())
          return this.abs();
        var a = this.clone();
        var b = num.clone();
        a.negative = 0;
        b.negative = 0;
        for (var shift = 0;a.isEven() && b.isEven(); shift++) {
          a.iushrn(1);
          b.iushrn(1);
        }
        do {
          while (a.isEven()) {
            a.iushrn(1);
          }
          while (b.isEven()) {
            b.iushrn(1);
          }
          var r = a.cmp(b);
          if (r < 0) {
            var t = a;
            a = b;
            b = t;
          } else if (r === 0 || b.cmpn(1) === 0) {
            break;
          }
          a.isub(b);
        } while (true);
        return b.iushln(shift);
      };
      BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num);
      };
      BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0;
      };
      BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1;
      };
      BN.prototype.andln = function andln(num) {
        return this.words[0] & num;
      };
      BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === "number");
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;
        if (this.length <= s) {
          this._expand(s + 1);
          this.words[s] |= q;
          return this;
        }
        var carry = q;
        for (var i2 = s;carry !== 0 && i2 < this.length; i2++) {
          var w = this.words[i2] | 0;
          w += carry;
          carry = w >>> 26;
          w &= 67108863;
          this.words[i2] = w;
        }
        if (carry !== 0) {
          this.words[i2] = carry;
          this.length++;
        }
        return this;
      };
      BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0;
      };
      BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative)
          return -1;
        if (this.negative === 0 && negative)
          return 1;
        this._strip();
        var res;
        if (this.length > 1) {
          res = 1;
        } else {
          if (negative) {
            num = -num;
          }
          assert(num <= 67108863, "Number is too big");
          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0)
          return -res | 0;
        return res;
      };
      BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0)
          return -1;
        if (this.negative === 0 && num.negative !== 0)
          return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0)
          return -res | 0;
        return res;
      };
      BN.prototype.ucmp = function ucmp(num) {
        if (this.length > num.length)
          return 1;
        if (this.length < num.length)
          return -1;
        var res = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var a = this.words[i2] | 0;
          var b = num.words[i2] | 0;
          if (a === b)
            continue;
          if (a < b) {
            res = -1;
          } else if (a > b) {
            res = 1;
          }
          break;
        }
        return res;
      };
      BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1;
      };
      BN.prototype.gt = function gt(num) {
        return this.cmp(num) === 1;
      };
      BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0;
      };
      BN.prototype.gte = function gte(num) {
        return this.cmp(num) >= 0;
      };
      BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1;
      };
      BN.prototype.lt = function lt(num) {
        return this.cmp(num) === -1;
      };
      BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0;
      };
      BN.prototype.lte = function lte(num) {
        return this.cmp(num) <= 0;
      };
      BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0;
      };
      BN.prototype.eq = function eq(num) {
        return this.cmp(num) === 0;
      };
      BN.red = function red(num) {
        return new Red(num);
      };
      BN.prototype.toRed = function toRed(ctx) {
        assert(!this.red, "Already a number in reduction context");
        assert(this.negative === 0, "red works only with positives");
        return ctx.convertTo(this)._forceRed(ctx);
      };
      BN.prototype.fromRed = function fromRed() {
        assert(this.red, "fromRed works only with numbers in reduction context");
        return this.red.convertFrom(this);
      };
      BN.prototype._forceRed = function _forceRed(ctx) {
        this.red = ctx;
        return this;
      };
      BN.prototype.forceRed = function forceRed(ctx) {
        assert(!this.red, "Already a number in reduction context");
        return this._forceRed(ctx);
      };
      BN.prototype.redAdd = function redAdd(num) {
        assert(this.red, "redAdd works only with red numbers");
        return this.red.add(this, num);
      };
      BN.prototype.redIAdd = function redIAdd(num) {
        assert(this.red, "redIAdd works only with red numbers");
        return this.red.iadd(this, num);
      };
      BN.prototype.redSub = function redSub(num) {
        assert(this.red, "redSub works only with red numbers");
        return this.red.sub(this, num);
      };
      BN.prototype.redISub = function redISub(num) {
        assert(this.red, "redISub works only with red numbers");
        return this.red.isub(this, num);
      };
      BN.prototype.redShl = function redShl(num) {
        assert(this.red, "redShl works only with red numbers");
        return this.red.shl(this, num);
      };
      BN.prototype.redMul = function redMul(num) {
        assert(this.red, "redMul works only with red numbers");
        this.red._verify2(this, num);
        return this.red.mul(this, num);
      };
      BN.prototype.redIMul = function redIMul(num) {
        assert(this.red, "redMul works only with red numbers");
        this.red._verify2(this, num);
        return this.red.imul(this, num);
      };
      BN.prototype.redSqr = function redSqr() {
        assert(this.red, "redSqr works only with red numbers");
        this.red._verify1(this);
        return this.red.sqr(this);
      };
      BN.prototype.redISqr = function redISqr() {
        assert(this.red, "redISqr works only with red numbers");
        this.red._verify1(this);
        return this.red.isqr(this);
      };
      BN.prototype.redSqrt = function redSqrt() {
        assert(this.red, "redSqrt works only with red numbers");
        this.red._verify1(this);
        return this.red.sqrt(this);
      };
      BN.prototype.redInvm = function redInvm() {
        assert(this.red, "redInvm works only with red numbers");
        this.red._verify1(this);
        return this.red.invm(this);
      };
      BN.prototype.redNeg = function redNeg() {
        assert(this.red, "redNeg works only with red numbers");
        this.red._verify1(this);
        return this.red.neg(this);
      };
      BN.prototype.redPow = function redPow(num) {
        assert(this.red && !num.red, "redPow(normalNum)");
        this.red._verify1(this);
        return this.red.pow(this, num);
      };
      var primes = {
        k256: null,
        p224: null,
        p192: null,
        p25519: null
      };
      function MPrime(name, p) {
        this.name = name;
        this.p = new BN(p, 16);
        this.n = this.p.bitLength();
        this.k = new BN(1).iushln(this.n).isub(this.p);
        this.tmp = this._tmp();
      }
      MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null);
        tmp.words = new Array(Math.ceil(this.n / 13));
        return tmp;
      };
      MPrime.prototype.ireduce = function ireduce(num) {
        var r = num;
        var rlen;
        do {
          this.split(r, this.tmp);
          r = this.imulK(r);
          r = r.iadd(this.tmp);
          rlen = r.bitLength();
        } while (rlen > this.n);
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0) {
          r.words[0] = 0;
          r.length = 1;
        } else if (cmp > 0) {
          r.isub(this.p);
        } else {
          if (r.strip !== undefined) {
            r.strip();
          } else {
            r._strip();
          }
        }
        return r;
      };
      MPrime.prototype.split = function split2(input, out) {
        input.iushrn(this.n, 0, out);
      };
      MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k);
      };
      function K256() {
        MPrime.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
      }
      inherits(K256, MPrime);
      K256.prototype.split = function split2(input, output) {
        var mask = 4194303;
        var outLen = Math.min(input.length, 9);
        for (var i2 = 0;i2 < outLen; i2++) {
          output.words[i2] = input.words[i2];
        }
        output.length = outLen;
        if (input.length <= 9) {
          input.words[0] = 0;
          input.length = 1;
          return;
        }
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for (i2 = 10;i2 < input.length; i2++) {
          var next = input.words[i2] | 0;
          input.words[i2 - 10] = (next & mask) << 4 | prev >>> 22;
          prev = next;
        }
        prev >>>= 22;
        input.words[i2 - 10] = prev;
        if (prev === 0 && input.length > 10) {
          input.length -= 10;
        } else {
          input.length -= 9;
        }
      };
      K256.prototype.imulK = function imulK(num) {
        num.words[num.length] = 0;
        num.words[num.length + 1] = 0;
        num.length += 2;
        var lo = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var w = num.words[i2] | 0;
          lo += w * 977;
          num.words[i2] = lo & 67108863;
          lo = w * 64 + (lo / 67108864 | 0);
        }
        if (num.words[num.length - 1] === 0) {
          num.length--;
          if (num.words[num.length - 1] === 0) {
            num.length--;
          }
        }
        return num;
      };
      function P224() {
        MPrime.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
      }
      inherits(P224, MPrime);
      function P192() {
        MPrime.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
      }
      inherits(P192, MPrime);
      function P25519() {
        MPrime.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
      }
      inherits(P25519, MPrime);
      P25519.prototype.imulK = function imulK(num) {
        var carry = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var hi = (num.words[i2] | 0) * 19 + carry;
          var lo = hi & 67108863;
          hi >>>= 26;
          num.words[i2] = lo;
          carry = hi;
        }
        if (carry !== 0) {
          num.words[num.length++] = carry;
        }
        return num;
      };
      BN._prime = function prime(name) {
        if (primes[name])
          return primes[name];
        var prime2;
        if (name === "k256") {
          prime2 = new K256;
        } else if (name === "p224") {
          prime2 = new P224;
        } else if (name === "p192") {
          prime2 = new P192;
        } else if (name === "p25519") {
          prime2 = new P25519;
        } else {
          throw new Error("Unknown prime " + name);
        }
        primes[name] = prime2;
        return prime2;
      };
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m);
          this.m = prime.p;
          this.prime = prime;
        } else {
          assert(m.gtn(1), "modulus must be greater than 1");
          this.m = m;
          this.prime = null;
        }
      }
      Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, "red works only with positives");
        assert(a.red, "red works only with red numbers");
      };
      Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives");
        assert(a.red && a.red === b.red, "red works only with red numbers");
      };
      Red.prototype.imod = function imod(a) {
        if (this.prime)
          return this.prime.ireduce(a)._forceRed(this);
        move(a, a.umod(this.m)._forceRed(this));
        return a;
      };
      Red.prototype.neg = function neg(a) {
        if (a.isZero()) {
          return a.clone();
        }
        return this.m.sub(a)._forceRed(this);
      };
      Red.prototype.add = function add2(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res._forceRed(this);
      };
      Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res;
      };
      Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res._forceRed(this);
      };
      Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res;
      };
      Red.prototype.shl = function shl(a, num) {
        this._verify1(a);
        return this.imod(a.ushln(num));
      };
      Red.prototype.imul = function imul(a, b) {
        this._verify2(a, b);
        return this.imod(a.imul(b));
      };
      Red.prototype.mul = function mul(a, b) {
        this._verify2(a, b);
        return this.imod(a.mul(b));
      };
      Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone());
      };
      Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a);
      };
      Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero())
          return a.clone();
        var mod3 = this.m.andln(3);
        assert(mod3 % 2 === 1);
        if (mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }
        var q = this.m.subn(1);
        var s = 0;
        while (!q.isZero() && q.andln(1) === 0) {
          s++;
          q.iushrn(1);
        }
        assert(!q.isZero());
        var one = new BN(1).toRed(this);
        var nOne = one.redNeg();
        var lpow = this.m.subn(1).iushrn(1);
        var z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while (this.pow(z, lpow).cmp(nOne) !== 0) {
          z.redIAdd(nOne);
        }
        var c = this.pow(z, q);
        var r = this.pow(a, q.addn(1).iushrn(1));
        var t = this.pow(a, q);
        var m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i2 = 0;tmp.cmp(one) !== 0; i2++) {
            tmp = tmp.redSqr();
          }
          assert(i2 < m);
          var b = this.pow(c, new BN(1).iushln(m - i2 - 1));
          r = r.redMul(b);
          c = b.redSqr();
          t = t.redMul(c);
          m = i2;
        }
        return r;
      };
      Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0) {
          inv.negative = 0;
          return this.imod(inv).redNeg();
        } else {
          return this.imod(inv);
        }
      };
      Red.prototype.pow = function pow(a, num) {
        if (num.isZero())
          return new BN(1).toRed(this);
        if (num.cmpn(1) === 0)
          return a.clone();
        var windowSize = 4;
        var wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this);
        wnd[1] = a;
        for (var i2 = 2;i2 < wnd.length; i2++) {
          wnd[i2] = this.mul(wnd[i2 - 1], a);
        }
        var res = wnd[0];
        var current = 0;
        var currentLen = 0;
        var start = num.bitLength() % 26;
        if (start === 0) {
          start = 26;
        }
        for (i2 = num.length - 1;i2 >= 0; i2--) {
          var word = num.words[i2];
          for (var j = start - 1;j >= 0; j--) {
            var bit = word >> j & 1;
            if (res !== wnd[0]) {
              res = this.sqr(res);
            }
            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }
            current <<= 1;
            current |= bit;
            currentLen++;
            if (currentLen !== windowSize && (i2 !== 0 || j !== 0))
              continue;
            res = this.mul(res, wnd[current]);
            currentLen = 0;
            current = 0;
          }
          start = 26;
        }
        return res;
      };
      Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
      };
      Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone();
        res.red = null;
        return res;
      };
      BN.mont = function mont(num) {
        return new Mont(num);
      };
      function Mont(m) {
        Red.call(this, m);
        this.shift = this.m.bitLength();
        if (this.shift % 26 !== 0) {
          this.shift += 26 - this.shift % 26;
        }
        this.r = new BN(1).iushln(this.shift);
        this.r2 = this.imod(this.r.sqr());
        this.rinv = this.r._invmp(this.m);
        this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
        this.minv = this.minv.umod(this.r);
        this.minv = this.r.sub(this.minv);
      }
      inherits(Mont, Red);
      Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift));
      };
      Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        r.red = null;
        return r;
      };
      Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero()) {
          a.words[0] = 0;
          a.length = 1;
          return a;
        }
        var t = a.imul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }
        return res._forceRed(this);
      };
      Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero())
          return new BN(0)._forceRed(this);
        var t = a.mul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }
        return res._forceRed(this);
      };
      Mont.prototype.invm = function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })(typeof module === "undefined" || module, exports);
  });

  // node_modules/safe-buffer/index.js
  var require_safe_buffer = __commonJS((exports, module) => {
    /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
    var buffer = (init_buffer(), __toCommonJS(exports_buffer));
    var Buffer3 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer3.from && Buffer3.alloc && Buffer3.allocUnsafe && Buffer3.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer3(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer3.prototype);
    copyProps(Buffer3, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer3(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer3(size);
      if (fill !== undefined) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer3(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  });

  // node_modules/base-x/src/index.js
  var require_src = __commonJS((exports, module) => {
    var _Buffer = require_safe_buffer().Buffer;
    function base(ALPHABET) {
      if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
      }
      var BASE_MAP = new Uint8Array(256);
      for (var j = 0;j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
      }
      for (var i2 = 0;i2 < ALPHABET.length; i2++) {
        var x = ALPHABET.charAt(i2);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
          throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i2;
      }
      var BASE = ALPHABET.length;
      var LEADER = ALPHABET.charAt(0);
      var FACTOR = Math.log(BASE) / Math.log(256);
      var iFACTOR = Math.log(256) / Math.log(BASE);
      function encode(source) {
        if (Array.isArray(source) || source instanceof Uint8Array) {
          source = _Buffer.from(source);
        }
        if (!_Buffer.isBuffer(source)) {
          throw new TypeError("Expected Buffer");
        }
        if (source.length === 0) {
          return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
          pbegin++;
          zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while (pbegin !== pend) {
          var carry = source[pbegin];
          var i3 = 0;
          for (var it1 = size - 1;(carry !== 0 || i3 < length) && it1 !== -1; it1--, i3++) {
            carry += 256 * b58[it1] >>> 0;
            b58[it1] = carry % BASE >>> 0;
            carry = carry / BASE >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i3;
          pbegin++;
        }
        var it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
          it2++;
        }
        var str = LEADER.repeat(zeroes);
        for (;it2 < size; ++it2) {
          str += ALPHABET.charAt(b58[it2]);
        }
        return str;
      }
      function decodeUnsafe(source) {
        if (typeof source !== "string") {
          throw new TypeError("Expected String");
        }
        if (source.length === 0) {
          return _Buffer.alloc(0);
        }
        var psz = 0;
        var zeroes = 0;
        var length = 0;
        while (source[psz] === LEADER) {
          zeroes++;
          psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while (psz < source.length) {
          var charCode = source.charCodeAt(psz);
          if (charCode > 255) {
            return;
          }
          var carry = BASE_MAP[charCode];
          if (carry === 255) {
            return;
          }
          var i3 = 0;
          for (var it3 = size - 1;(carry !== 0 || i3 < length) && it3 !== -1; it3--, i3++) {
            carry += BASE * b256[it3] >>> 0;
            b256[it3] = carry % 256 >>> 0;
            carry = carry / 256 >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i3;
          psz++;
        }
        var it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
          it4++;
        }
        var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
        vch.fill(0, 0, zeroes);
        var j2 = zeroes;
        while (it4 !== size) {
          vch[j2++] = b256[it4++];
        }
        return vch;
      }
      function decode(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
          return buffer;
        }
        throw new Error("Non-base" + BASE + " character");
      }
      return {
        encode,
        decodeUnsafe,
        decode
      };
    }
    module.exports = base;
  });

  // node_modules/bs58/index.js
  var require_bs58 = __commonJS((exports, module) => {
    var basex = require_src();
    var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    module.exports = basex(ALPHABET);
  });

  // node_modules/text-encoding-utf-8/src/encoding.js
  var exports_encoding = {};
  __export(exports_encoding, {
    TextEncoder: () => TextEncoder2,
    TextDecoder: () => TextDecoder2
  });
  function inRange2(a, min, max) {
    return min <= a && a <= max;
  }
  function ToDictionary(o) {
    if (o === undefined)
      return {};
    if (o === Object(o))
      return o;
    throw TypeError("Could not convert argument to dictionary");
  }
  function stringToCodePoints(string) {
    var s = String(string);
    var n = s.length;
    var i2 = 0;
    var u = [];
    while (i2 < n) {
      var c = s.charCodeAt(i2);
      if (c < 55296 || c > 57343) {
        u.push(c);
      } else if (56320 <= c && c <= 57343) {
        u.push(65533);
      } else if (55296 <= c && c <= 56319) {
        if (i2 === n - 1) {
          u.push(65533);
        } else {
          var d = string.charCodeAt(i2 + 1);
          if (56320 <= d && d <= 57343) {
            var a = c & 1023;
            var b = d & 1023;
            u.push(65536 + (a << 10) + b);
            i2 += 1;
          } else {
            u.push(65533);
          }
        }
      }
      i2 += 1;
    }
    return u;
  }
  function codePointsToString(code_points) {
    var s = "";
    for (var i2 = 0;i2 < code_points.length; ++i2) {
      var cp = code_points[i2];
      if (cp <= 65535) {
        s += String.fromCharCode(cp);
      } else {
        cp -= 65536;
        s += String.fromCharCode((cp >> 10) + 55296, (cp & 1023) + 56320);
      }
    }
    return s;
  }
  function Stream(tokens) {
    this.tokens = [].slice.call(tokens);
  }
  function decoderError(fatal, opt_code_point) {
    if (fatal)
      throw TypeError("Decoder error");
    return opt_code_point || 65533;
  }
  function Decoder() {}
  function Encoder() {}
  function TextDecoder2(encoding, options) {
    if (!(this instanceof TextDecoder2)) {
      return new TextDecoder2(encoding, options);
    }
    encoding = encoding !== undefined ? String(encoding).toLowerCase() : DEFAULT_ENCODING;
    if (encoding !== DEFAULT_ENCODING) {
      throw new Error("Encoding not supported. Only utf-8 is supported");
    }
    options = ToDictionary(options);
    this._streaming = false;
    this._BOMseen = false;
    this._decoder = null;
    this._fatal = Boolean(options["fatal"]);
    this._ignoreBOM = Boolean(options["ignoreBOM"]);
    Object.defineProperty(this, "encoding", { value: "utf-8" });
    Object.defineProperty(this, "fatal", { value: this._fatal });
    Object.defineProperty(this, "ignoreBOM", { value: this._ignoreBOM });
  }
  function TextEncoder2(encoding, options) {
    if (!(this instanceof TextEncoder2))
      return new TextEncoder2(encoding, options);
    encoding = encoding !== undefined ? String(encoding).toLowerCase() : DEFAULT_ENCODING;
    if (encoding !== DEFAULT_ENCODING) {
      throw new Error("Encoding not supported. Only utf-8 is supported");
    }
    options = ToDictionary(options);
    this._streaming = false;
    this._encoder = null;
    this._options = { fatal: Boolean(options["fatal"]) };
    Object.defineProperty(this, "encoding", { value: "utf-8" });
  }
  function UTF8Decoder(options) {
    var fatal = options.fatal;
    var utf8_code_point = 0, utf8_bytes_seen = 0, utf8_bytes_needed = 0, utf8_lower_boundary = 128, utf8_upper_boundary = 191;
    this.handler = function(stream, bite) {
      if (bite === end_of_stream && utf8_bytes_needed !== 0) {
        utf8_bytes_needed = 0;
        return decoderError(fatal);
      }
      if (bite === end_of_stream)
        return finished;
      if (utf8_bytes_needed === 0) {
        if (inRange2(bite, 0, 127)) {
          return bite;
        }
        if (inRange2(bite, 194, 223)) {
          utf8_bytes_needed = 1;
          utf8_code_point = bite - 192;
        } else if (inRange2(bite, 224, 239)) {
          if (bite === 224)
            utf8_lower_boundary = 160;
          if (bite === 237)
            utf8_upper_boundary = 159;
          utf8_bytes_needed = 2;
          utf8_code_point = bite - 224;
        } else if (inRange2(bite, 240, 244)) {
          if (bite === 240)
            utf8_lower_boundary = 144;
          if (bite === 244)
            utf8_upper_boundary = 143;
          utf8_bytes_needed = 3;
          utf8_code_point = bite - 240;
        } else {
          return decoderError(fatal);
        }
        utf8_code_point = utf8_code_point << 6 * utf8_bytes_needed;
        return null;
      }
      if (!inRange2(bite, utf8_lower_boundary, utf8_upper_boundary)) {
        utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;
        utf8_lower_boundary = 128;
        utf8_upper_boundary = 191;
        stream.prepend(bite);
        return decoderError(fatal);
      }
      utf8_lower_boundary = 128;
      utf8_upper_boundary = 191;
      utf8_bytes_seen += 1;
      utf8_code_point += bite - 128 << 6 * (utf8_bytes_needed - utf8_bytes_seen);
      if (utf8_bytes_seen !== utf8_bytes_needed)
        return null;
      var code_point = utf8_code_point;
      utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;
      return code_point;
    };
  }
  function UTF8Encoder(options) {
    var fatal = options.fatal;
    this.handler = function(stream, code_point) {
      if (code_point === end_of_stream)
        return finished;
      if (inRange2(code_point, 0, 127))
        return code_point;
      var count, offset;
      if (inRange2(code_point, 128, 2047)) {
        count = 1;
        offset = 192;
      } else if (inRange2(code_point, 2048, 65535)) {
        count = 2;
        offset = 224;
      } else if (inRange2(code_point, 65536, 1114111)) {
        count = 3;
        offset = 240;
      }
      var bytes = [(code_point >> 6 * count) + offset];
      while (count > 0) {
        var temp = code_point >> 6 * (count - 1);
        bytes.push(128 | temp & 63);
        count -= 1;
      }
      return bytes;
    };
  }
  var end_of_stream = -1, finished = -1, DEFAULT_ENCODING = "utf-8";
  var init_encoding = __esm(() => {
    Stream.prototype = {
      endOfStream: function() {
        return !this.tokens.length;
      },
      read: function() {
        if (!this.tokens.length)
          return end_of_stream;
        return this.tokens.shift();
      },
      prepend: function(token) {
        if (Array.isArray(token)) {
          var tokens = token;
          while (tokens.length)
            this.tokens.unshift(tokens.pop());
        } else {
          this.tokens.unshift(token);
        }
      },
      push: function(token) {
        if (Array.isArray(token)) {
          var tokens = token;
          while (tokens.length)
            this.tokens.push(tokens.shift());
        } else {
          this.tokens.push(token);
        }
      }
    };
    Decoder.prototype = {
      handler: function(stream, bite) {}
    };
    Encoder.prototype = {
      handler: function(stream, code_point) {}
    };
    TextDecoder2.prototype = {
      decode: function decode(input, options) {
        var bytes;
        if (typeof input === "object" && input instanceof ArrayBuffer) {
          bytes = new Uint8Array(input);
        } else if (typeof input === "object" && "buffer" in input && input.buffer instanceof ArrayBuffer) {
          bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
        } else {
          bytes = new Uint8Array(0);
        }
        options = ToDictionary(options);
        if (!this._streaming) {
          this._decoder = new UTF8Decoder({ fatal: this._fatal });
          this._BOMseen = false;
        }
        this._streaming = Boolean(options["stream"]);
        var input_stream = new Stream(bytes);
        var code_points = [];
        var result;
        while (!input_stream.endOfStream()) {
          result = this._decoder.handler(input_stream, input_stream.read());
          if (result === finished)
            break;
          if (result === null)
            continue;
          if (Array.isArray(result))
            code_points.push.apply(code_points, result);
          else
            code_points.push(result);
        }
        if (!this._streaming) {
          do {
            result = this._decoder.handler(input_stream, input_stream.read());
            if (result === finished)
              break;
            if (result === null)
              continue;
            if (Array.isArray(result))
              code_points.push.apply(code_points, result);
            else
              code_points.push(result);
          } while (!input_stream.endOfStream());
          this._decoder = null;
        }
        if (code_points.length) {
          if (["utf-8"].indexOf(this.encoding) !== -1 && !this._ignoreBOM && !this._BOMseen) {
            if (code_points[0] === 65279) {
              this._BOMseen = true;
              code_points.shift();
            } else {
              this._BOMseen = true;
            }
          }
        }
        return codePointsToString(code_points);
      }
    };
    TextEncoder2.prototype = {
      encode: function encode(opt_string, options) {
        opt_string = opt_string ? String(opt_string) : "";
        options = ToDictionary(options);
        if (!this._streaming)
          this._encoder = new UTF8Encoder(this._options);
        this._streaming = Boolean(options["stream"]);
        var bytes = [];
        var input_stream = new Stream(stringToCodePoints(opt_string));
        var result;
        while (!input_stream.endOfStream()) {
          result = this._encoder.handler(input_stream, input_stream.read());
          if (result === finished)
            break;
          if (Array.isArray(result))
            bytes.push.apply(bytes, result);
          else
            bytes.push(result);
        }
        if (!this._streaming) {
          while (true) {
            result = this._encoder.handler(input_stream, input_stream.read());
            if (result === finished)
              break;
            if (Array.isArray(result))
              bytes.push.apply(bytes, result);
            else
              bytes.push(result);
          }
          this._encoder = null;
        }
        return new Uint8Array(bytes);
      }
    };
  });

  // node_modules/borsh/lib/index.js
  var require_lib = __commonJS((exports) => {
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === undefined)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === undefined)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __decorate = exports && exports.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
      else
        for (var i2 = decorators.length - 1;i2 >= 0; i2--)
          if (d = decorators[i2])
            r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __importStar = exports && exports.__importStar || function(mod2) {
      if (mod2 && mod2.__esModule)
        return mod2;
      var result = {};
      if (mod2 != null) {
        for (var k in mod2)
          if (k !== "default" && Object.hasOwnProperty.call(mod2, k))
            __createBinding(result, mod2, k);
      }
      __setModuleDefault(result, mod2);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod2) {
      return mod2 && mod2.__esModule ? mod2 : { default: mod2 };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeUnchecked = exports.deserialize = exports.serialize = exports.BinaryReader = exports.BinaryWriter = exports.BorshError = exports.baseDecode = exports.baseEncode = undefined;
    var bn_js_1 = __importDefault(require_bn());
    var bs58_1 = __importDefault(require_bs58());
    var encoding = __importStar((init_encoding(), __toCommonJS(exports_encoding)));
    var ResolvedTextDecoder = typeof TextDecoder !== "function" ? encoding.TextDecoder : TextDecoder;
    var textDecoder = new ResolvedTextDecoder("utf-8", { fatal: true });
    function baseEncode(value) {
      if (typeof value === "string") {
        value = Buffer.from(value, "utf8");
      }
      return bs58_1.default.encode(Buffer.from(value));
    }
    exports.baseEncode = baseEncode;
    function baseDecode(value) {
      return Buffer.from(bs58_1.default.decode(value));
    }
    exports.baseDecode = baseDecode;
    var INITIAL_LENGTH = 1024;

    class BorshError extends Error {
      constructor(message) {
        super(message);
        this.fieldPath = [];
        this.originalMessage = message;
      }
      addToFieldPath(fieldName) {
        this.fieldPath.splice(0, 0, fieldName);
        this.message = this.originalMessage + ": " + this.fieldPath.join(".");
      }
    }
    exports.BorshError = BorshError;

    class BinaryWriter {
      constructor() {
        this.buf = Buffer.alloc(INITIAL_LENGTH);
        this.length = 0;
      }
      maybeResize() {
        if (this.buf.length < 16 + this.length) {
          this.buf = Buffer.concat([this.buf, Buffer.alloc(INITIAL_LENGTH)]);
        }
      }
      writeU8(value) {
        this.maybeResize();
        this.buf.writeUInt8(value, this.length);
        this.length += 1;
      }
      writeU16(value) {
        this.maybeResize();
        this.buf.writeUInt16LE(value, this.length);
        this.length += 2;
      }
      writeU32(value) {
        this.maybeResize();
        this.buf.writeUInt32LE(value, this.length);
        this.length += 4;
      }
      writeU64(value) {
        this.maybeResize();
        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 8)));
      }
      writeU128(value) {
        this.maybeResize();
        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 16)));
      }
      writeU256(value) {
        this.maybeResize();
        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 32)));
      }
      writeU512(value) {
        this.maybeResize();
        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 64)));
      }
      writeBuffer(buffer) {
        this.buf = Buffer.concat([
          Buffer.from(this.buf.subarray(0, this.length)),
          buffer,
          Buffer.alloc(INITIAL_LENGTH)
        ]);
        this.length += buffer.length;
      }
      writeString(str) {
        this.maybeResize();
        const b = Buffer.from(str, "utf8");
        this.writeU32(b.length);
        this.writeBuffer(b);
      }
      writeFixedArray(array) {
        this.writeBuffer(Buffer.from(array));
      }
      writeArray(array, fn) {
        this.maybeResize();
        this.writeU32(array.length);
        for (const elem of array) {
          this.maybeResize();
          fn(elem);
        }
      }
      toArray() {
        return this.buf.subarray(0, this.length);
      }
    }
    exports.BinaryWriter = BinaryWriter;
    function handlingRangeError(target, propertyKey, propertyDescriptor) {
      const originalMethod = propertyDescriptor.value;
      propertyDescriptor.value = function(...args) {
        try {
          return originalMethod.apply(this, args);
        } catch (e) {
          if (e instanceof RangeError) {
            const code2 = e.code;
            if (["ERR_BUFFER_OUT_OF_BOUNDS", "ERR_OUT_OF_RANGE"].indexOf(code2) >= 0) {
              throw new BorshError("Reached the end of buffer when deserializing");
            }
          }
          throw e;
        }
      };
    }

    class BinaryReader {
      constructor(buf) {
        this.buf = buf;
        this.offset = 0;
      }
      readU8() {
        const value = this.buf.readUInt8(this.offset);
        this.offset += 1;
        return value;
      }
      readU16() {
        const value = this.buf.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
      }
      readU32() {
        const value = this.buf.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
      }
      readU64() {
        const buf = this.readBuffer(8);
        return new bn_js_1.default(buf, "le");
      }
      readU128() {
        const buf = this.readBuffer(16);
        return new bn_js_1.default(buf, "le");
      }
      readU256() {
        const buf = this.readBuffer(32);
        return new bn_js_1.default(buf, "le");
      }
      readU512() {
        const buf = this.readBuffer(64);
        return new bn_js_1.default(buf, "le");
      }
      readBuffer(len2) {
        if (this.offset + len2 > this.buf.length) {
          throw new BorshError(`Expected buffer length ${len2} isn't within bounds`);
        }
        const result = this.buf.slice(this.offset, this.offset + len2);
        this.offset += len2;
        return result;
      }
      readString() {
        const len2 = this.readU32();
        const buf = this.readBuffer(len2);
        try {
          return textDecoder.decode(buf);
        } catch (e) {
          throw new BorshError(`Error decoding UTF-8 string: ${e}`);
        }
      }
      readFixedArray(len2) {
        return new Uint8Array(this.readBuffer(len2));
      }
      readArray(fn) {
        const len2 = this.readU32();
        const result = Array();
        for (let i2 = 0;i2 < len2; ++i2) {
          result.push(fn());
        }
        return result;
      }
    }
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readU8", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readU16", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readU32", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readU64", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readU128", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readU256", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readU512", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readString", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readFixedArray", null);
    __decorate([
      handlingRangeError
    ], BinaryReader.prototype, "readArray", null);
    exports.BinaryReader = BinaryReader;
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function serializeField(schema, fieldName, value, fieldType, writer) {
      try {
        if (typeof fieldType === "string") {
          writer[`write${capitalizeFirstLetter(fieldType)}`](value);
        } else if (fieldType instanceof Array) {
          if (typeof fieldType[0] === "number") {
            if (value.length !== fieldType[0]) {
              throw new BorshError(`Expecting byte array of length ${fieldType[0]}, but got ${value.length} bytes`);
            }
            writer.writeFixedArray(value);
          } else if (fieldType.length === 2 && typeof fieldType[1] === "number") {
            if (value.length !== fieldType[1]) {
              throw new BorshError(`Expecting byte array of length ${fieldType[1]}, but got ${value.length} bytes`);
            }
            for (let i2 = 0;i2 < fieldType[1]; i2++) {
              serializeField(schema, null, value[i2], fieldType[0], writer);
            }
          } else {
            writer.writeArray(value, (item) => {
              serializeField(schema, fieldName, item, fieldType[0], writer);
            });
          }
        } else if (fieldType.kind !== undefined) {
          switch (fieldType.kind) {
            case "option": {
              if (value === null || value === undefined) {
                writer.writeU8(0);
              } else {
                writer.writeU8(1);
                serializeField(schema, fieldName, value, fieldType.type, writer);
              }
              break;
            }
            case "map": {
              writer.writeU32(value.size);
              value.forEach((val, key) => {
                serializeField(schema, fieldName, key, fieldType.key, writer);
                serializeField(schema, fieldName, val, fieldType.value, writer);
              });
              break;
            }
            default:
              throw new BorshError(`FieldType ${fieldType} unrecognized`);
          }
        } else {
          serializeStruct(schema, value, writer);
        }
      } catch (error) {
        if (error instanceof BorshError) {
          error.addToFieldPath(fieldName);
        }
        throw error;
      }
    }
    function serializeStruct(schema, obj, writer) {
      if (typeof obj.borshSerialize === "function") {
        obj.borshSerialize(writer);
        return;
      }
      const structSchema = schema.get(obj.constructor);
      if (!structSchema) {
        throw new BorshError(`Class ${obj.constructor.name} is missing in schema`);
      }
      if (structSchema.kind === "struct") {
        structSchema.fields.map(([fieldName, fieldType]) => {
          serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
        });
      } else if (structSchema.kind === "enum") {
        const name = obj[structSchema.field];
        for (let idx = 0;idx < structSchema.values.length; ++idx) {
          const [fieldName, fieldType] = structSchema.values[idx];
          if (fieldName === name) {
            writer.writeU8(idx);
            serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
            break;
          }
        }
      } else {
        throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${obj.constructor.name}`);
      }
    }
    function serialize(schema, obj, Writer = BinaryWriter) {
      const writer = new Writer;
      serializeStruct(schema, obj, writer);
      return writer.toArray();
    }
    exports.serialize = serialize;
    function deserializeField(schema, fieldName, fieldType, reader) {
      try {
        if (typeof fieldType === "string") {
          return reader[`read${capitalizeFirstLetter(fieldType)}`]();
        }
        if (fieldType instanceof Array) {
          if (typeof fieldType[0] === "number") {
            return reader.readFixedArray(fieldType[0]);
          } else if (typeof fieldType[1] === "number") {
            const arr = [];
            for (let i2 = 0;i2 < fieldType[1]; i2++) {
              arr.push(deserializeField(schema, null, fieldType[0], reader));
            }
            return arr;
          } else {
            return reader.readArray(() => deserializeField(schema, fieldName, fieldType[0], reader));
          }
        }
        if (fieldType.kind === "option") {
          const option = reader.readU8();
          if (option) {
            return deserializeField(schema, fieldName, fieldType.type, reader);
          }
          return;
        }
        if (fieldType.kind === "map") {
          let map = new Map;
          const length = reader.readU32();
          for (let i2 = 0;i2 < length; i2++) {
            const key = deserializeField(schema, fieldName, fieldType.key, reader);
            const val = deserializeField(schema, fieldName, fieldType.value, reader);
            map.set(key, val);
          }
          return map;
        }
        return deserializeStruct(schema, fieldType, reader);
      } catch (error) {
        if (error instanceof BorshError) {
          error.addToFieldPath(fieldName);
        }
        throw error;
      }
    }
    function deserializeStruct(schema, classType, reader) {
      if (typeof classType.borshDeserialize === "function") {
        return classType.borshDeserialize(reader);
      }
      const structSchema = schema.get(classType);
      if (!structSchema) {
        throw new BorshError(`Class ${classType.name} is missing in schema`);
      }
      if (structSchema.kind === "struct") {
        const result = {};
        for (const [fieldName, fieldType] of schema.get(classType).fields) {
          result[fieldName] = deserializeField(schema, fieldName, fieldType, reader);
        }
        return new classType(result);
      }
      if (structSchema.kind === "enum") {
        const idx = reader.readU8();
        if (idx >= structSchema.values.length) {
          throw new BorshError(`Enum index: ${idx} is out of range`);
        }
        const [fieldName, fieldType] = structSchema.values[idx];
        const fieldValue = deserializeField(schema, fieldName, fieldType, reader);
        return new classType({ [fieldName]: fieldValue });
      }
      throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${classType.constructor.name}`);
    }
    function deserialize(schema, classType, buffer, Reader = BinaryReader) {
      const reader = new Reader(buffer);
      const result = deserializeStruct(schema, classType, reader);
      if (reader.offset < buffer.length) {
        throw new BorshError(`Unexpected ${buffer.length - reader.offset} bytes after deserialized data`);
      }
      return result;
    }
    exports.deserialize = deserialize;
    function deserializeUnchecked(schema, classType, buffer, Reader = BinaryReader) {
      const reader = new Reader(buffer);
      return deserializeStruct(schema, classType, reader);
    }
    exports.deserializeUnchecked = deserializeUnchecked;
  });

  // node_modules/@solana/buffer-layout/lib/Layout.js
  var require_Layout = __commonJS((exports) => {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.s16 = exports.s8 = exports.nu64be = exports.u48be = exports.u40be = exports.u32be = exports.u24be = exports.u16be = exports.nu64 = exports.u48 = exports.u40 = exports.u32 = exports.u24 = exports.u16 = exports.u8 = exports.offset = exports.greedy = exports.Constant = exports.UTF8 = exports.CString = exports.Blob = exports.Boolean = exports.BitField = exports.BitStructure = exports.VariantLayout = exports.Union = exports.UnionLayoutDiscriminator = exports.UnionDiscriminator = exports.Structure = exports.Sequence = exports.DoubleBE = exports.Double = exports.FloatBE = exports.Float = exports.NearInt64BE = exports.NearInt64 = exports.NearUInt64BE = exports.NearUInt64 = exports.IntBE = exports.Int = exports.UIntBE = exports.UInt = exports.OffsetLayout = exports.GreedyCount = exports.ExternalLayout = exports.bindConstructorLayout = exports.nameWithProperty = exports.Layout = exports.uint8ArrayToBuffer = exports.checkUint8Array = undefined;
    exports.constant = exports.utf8 = exports.cstr = exports.blob = exports.unionLayoutDiscriminator = exports.union = exports.seq = exports.bits = exports.struct = exports.f64be = exports.f64 = exports.f32be = exports.f32 = exports.ns64be = exports.s48be = exports.s40be = exports.s32be = exports.s24be = exports.s16be = exports.ns64 = exports.s48 = exports.s40 = exports.s32 = exports.s24 = undefined;
    var buffer_1 = (init_buffer(), __toCommonJS(exports_buffer));
    function checkUint8Array(b) {
      if (!(b instanceof Uint8Array)) {
        throw new TypeError("b must be a Uint8Array");
      }
    }
    exports.checkUint8Array = checkUint8Array;
    function uint8ArrayToBuffer(b) {
      checkUint8Array(b);
      return buffer_1.Buffer.from(b.buffer, b.byteOffset, b.length);
    }
    exports.uint8ArrayToBuffer = uint8ArrayToBuffer;

    class Layout {
      constructor(span, property) {
        if (!Number.isInteger(span)) {
          throw new TypeError("span must be an integer");
        }
        this.span = span;
        this.property = property;
      }
      makeDestinationObject() {
        return {};
      }
      getSpan(b, offset) {
        if (0 > this.span) {
          throw new RangeError("indeterminate span");
        }
        return this.span;
      }
      replicate(property) {
        const rv = Object.create(this.constructor.prototype);
        Object.assign(rv, this);
        rv.property = property;
        return rv;
      }
      fromArray(values) {
        return;
      }
    }
    exports.Layout = Layout;
    function nameWithProperty(name, lo) {
      if (lo.property) {
        return name + "[" + lo.property + "]";
      }
      return name;
    }
    exports.nameWithProperty = nameWithProperty;
    function bindConstructorLayout(Class, layout) {
      if (typeof Class !== "function") {
        throw new TypeError("Class must be constructor");
      }
      if (Object.prototype.hasOwnProperty.call(Class, "layout_")) {
        throw new Error("Class is already bound to a layout");
      }
      if (!(layout && layout instanceof Layout)) {
        throw new TypeError("layout must be a Layout");
      }
      if (Object.prototype.hasOwnProperty.call(layout, "boundConstructor_")) {
        throw new Error("layout is already bound to a constructor");
      }
      Class.layout_ = layout;
      layout.boundConstructor_ = Class;
      layout.makeDestinationObject = () => new Class;
      Object.defineProperty(Class.prototype, "encode", {
        value(b, offset) {
          return layout.encode(this, b, offset);
        },
        writable: true
      });
      Object.defineProperty(Class, "decode", {
        value(b, offset) {
          return layout.decode(b, offset);
        },
        writable: true
      });
    }
    exports.bindConstructorLayout = bindConstructorLayout;

    class ExternalLayout extends Layout {
      isCount() {
        throw new Error("ExternalLayout is abstract");
      }
    }
    exports.ExternalLayout = ExternalLayout;

    class GreedyCount extends ExternalLayout {
      constructor(elementSpan = 1, property) {
        if (!Number.isInteger(elementSpan) || 0 >= elementSpan) {
          throw new TypeError("elementSpan must be a (positive) integer");
        }
        super(-1, property);
        this.elementSpan = elementSpan;
      }
      isCount() {
        return true;
      }
      decode(b, offset = 0) {
        checkUint8Array(b);
        const rem = b.length - offset;
        return Math.floor(rem / this.elementSpan);
      }
      encode(src, b, offset) {
        return 0;
      }
    }
    exports.GreedyCount = GreedyCount;

    class OffsetLayout extends ExternalLayout {
      constructor(layout, offset = 0, property) {
        if (!(layout instanceof Layout)) {
          throw new TypeError("layout must be a Layout");
        }
        if (!Number.isInteger(offset)) {
          throw new TypeError("offset must be integer or undefined");
        }
        super(layout.span, property || layout.property);
        this.layout = layout;
        this.offset = offset;
      }
      isCount() {
        return this.layout instanceof UInt || this.layout instanceof UIntBE;
      }
      decode(b, offset = 0) {
        return this.layout.decode(b, offset + this.offset);
      }
      encode(src, b, offset = 0) {
        return this.layout.encode(src, b, offset + this.offset);
      }
    }
    exports.OffsetLayout = OffsetLayout;

    class UInt extends Layout {
      constructor(span, property) {
        super(span, property);
        if (6 < this.span) {
          throw new RangeError("span must not exceed 6 bytes");
        }
      }
      decode(b, offset = 0) {
        return uint8ArrayToBuffer(b).readUIntLE(offset, this.span);
      }
      encode(src, b, offset = 0) {
        uint8ArrayToBuffer(b).writeUIntLE(src, offset, this.span);
        return this.span;
      }
    }
    exports.UInt = UInt;

    class UIntBE extends Layout {
      constructor(span, property) {
        super(span, property);
        if (6 < this.span) {
          throw new RangeError("span must not exceed 6 bytes");
        }
      }
      decode(b, offset = 0) {
        return uint8ArrayToBuffer(b).readUIntBE(offset, this.span);
      }
      encode(src, b, offset = 0) {
        uint8ArrayToBuffer(b).writeUIntBE(src, offset, this.span);
        return this.span;
      }
    }
    exports.UIntBE = UIntBE;

    class Int extends Layout {
      constructor(span, property) {
        super(span, property);
        if (6 < this.span) {
          throw new RangeError("span must not exceed 6 bytes");
        }
      }
      decode(b, offset = 0) {
        return uint8ArrayToBuffer(b).readIntLE(offset, this.span);
      }
      encode(src, b, offset = 0) {
        uint8ArrayToBuffer(b).writeIntLE(src, offset, this.span);
        return this.span;
      }
    }
    exports.Int = Int;

    class IntBE extends Layout {
      constructor(span, property) {
        super(span, property);
        if (6 < this.span) {
          throw new RangeError("span must not exceed 6 bytes");
        }
      }
      decode(b, offset = 0) {
        return uint8ArrayToBuffer(b).readIntBE(offset, this.span);
      }
      encode(src, b, offset = 0) {
        uint8ArrayToBuffer(b).writeIntBE(src, offset, this.span);
        return this.span;
      }
    }
    exports.IntBE = IntBE;
    var V2E32 = Math.pow(2, 32);
    function divmodInt64(src) {
      const hi32 = Math.floor(src / V2E32);
      const lo32 = src - hi32 * V2E32;
      return { hi32, lo32 };
    }
    function roundedInt64(hi32, lo32) {
      return hi32 * V2E32 + lo32;
    }

    class NearUInt64 extends Layout {
      constructor(property) {
        super(8, property);
      }
      decode(b, offset = 0) {
        const buffer = uint8ArrayToBuffer(b);
        const lo32 = buffer.readUInt32LE(offset);
        const hi32 = buffer.readUInt32LE(offset + 4);
        return roundedInt64(hi32, lo32);
      }
      encode(src, b, offset = 0) {
        const split2 = divmodInt64(src);
        const buffer = uint8ArrayToBuffer(b);
        buffer.writeUInt32LE(split2.lo32, offset);
        buffer.writeUInt32LE(split2.hi32, offset + 4);
        return 8;
      }
    }
    exports.NearUInt64 = NearUInt64;

    class NearUInt64BE extends Layout {
      constructor(property) {
        super(8, property);
      }
      decode(b, offset = 0) {
        const buffer = uint8ArrayToBuffer(b);
        const hi32 = buffer.readUInt32BE(offset);
        const lo32 = buffer.readUInt32BE(offset + 4);
        return roundedInt64(hi32, lo32);
      }
      encode(src, b, offset = 0) {
        const split2 = divmodInt64(src);
        const buffer = uint8ArrayToBuffer(b);
        buffer.writeUInt32BE(split2.hi32, offset);
        buffer.writeUInt32BE(split2.lo32, offset + 4);
        return 8;
      }
    }
    exports.NearUInt64BE = NearUInt64BE;

    class NearInt64 extends Layout {
      constructor(property) {
        super(8, property);
      }
      decode(b, offset = 0) {
        const buffer = uint8ArrayToBuffer(b);
        const lo32 = buffer.readUInt32LE(offset);
        const hi32 = buffer.readInt32LE(offset + 4);
        return roundedInt64(hi32, lo32);
      }
      encode(src, b, offset = 0) {
        const split2 = divmodInt64(src);
        const buffer = uint8ArrayToBuffer(b);
        buffer.writeUInt32LE(split2.lo32, offset);
        buffer.writeInt32LE(split2.hi32, offset + 4);
        return 8;
      }
    }
    exports.NearInt64 = NearInt64;

    class NearInt64BE extends Layout {
      constructor(property) {
        super(8, property);
      }
      decode(b, offset = 0) {
        const buffer = uint8ArrayToBuffer(b);
        const hi32 = buffer.readInt32BE(offset);
        const lo32 = buffer.readUInt32BE(offset + 4);
        return roundedInt64(hi32, lo32);
      }
      encode(src, b, offset = 0) {
        const split2 = divmodInt64(src);
        const buffer = uint8ArrayToBuffer(b);
        buffer.writeInt32BE(split2.hi32, offset);
        buffer.writeUInt32BE(split2.lo32, offset + 4);
        return 8;
      }
    }
    exports.NearInt64BE = NearInt64BE;

    class Float extends Layout {
      constructor(property) {
        super(4, property);
      }
      decode(b, offset = 0) {
        return uint8ArrayToBuffer(b).readFloatLE(offset);
      }
      encode(src, b, offset = 0) {
        uint8ArrayToBuffer(b).writeFloatLE(src, offset);
        return 4;
      }
    }
    exports.Float = Float;

    class FloatBE extends Layout {
      constructor(property) {
        super(4, property);
      }
      decode(b, offset = 0) {
        return uint8ArrayToBuffer(b).readFloatBE(offset);
      }
      encode(src, b, offset = 0) {
        uint8ArrayToBuffer(b).writeFloatBE(src, offset);
        return 4;
      }
    }
    exports.FloatBE = FloatBE;

    class Double extends Layout {
      constructor(property) {
        super(8, property);
      }
      decode(b, offset = 0) {
        return uint8ArrayToBuffer(b).readDoubleLE(offset);
      }
      encode(src, b, offset = 0) {
        uint8ArrayToBuffer(b).writeDoubleLE(src, offset);
        return 8;
      }
    }
    exports.Double = Double;

    class DoubleBE extends Layout {
      constructor(property) {
        super(8, property);
      }
      decode(b, offset = 0) {
        return uint8ArrayToBuffer(b).readDoubleBE(offset);
      }
      encode(src, b, offset = 0) {
        uint8ArrayToBuffer(b).writeDoubleBE(src, offset);
        return 8;
      }
    }
    exports.DoubleBE = DoubleBE;

    class Sequence extends Layout {
      constructor(elementLayout, count, property) {
        if (!(elementLayout instanceof Layout)) {
          throw new TypeError("elementLayout must be a Layout");
        }
        if (!(count instanceof ExternalLayout && count.isCount() || Number.isInteger(count) && 0 <= count)) {
          throw new TypeError("count must be non-negative integer " + "or an unsigned integer ExternalLayout");
        }
        let span = -1;
        if (!(count instanceof ExternalLayout) && 0 < elementLayout.span) {
          span = count * elementLayout.span;
        }
        super(span, property);
        this.elementLayout = elementLayout;
        this.count = count;
      }
      getSpan(b, offset = 0) {
        if (0 <= this.span) {
          return this.span;
        }
        let span = 0;
        let count = this.count;
        if (count instanceof ExternalLayout) {
          count = count.decode(b, offset);
        }
        if (0 < this.elementLayout.span) {
          span = count * this.elementLayout.span;
        } else {
          let idx = 0;
          while (idx < count) {
            span += this.elementLayout.getSpan(b, offset + span);
            ++idx;
          }
        }
        return span;
      }
      decode(b, offset = 0) {
        const rv = [];
        let i2 = 0;
        let count = this.count;
        if (count instanceof ExternalLayout) {
          count = count.decode(b, offset);
        }
        while (i2 < count) {
          rv.push(this.elementLayout.decode(b, offset));
          offset += this.elementLayout.getSpan(b, offset);
          i2 += 1;
        }
        return rv;
      }
      encode(src, b, offset = 0) {
        const elo = this.elementLayout;
        const span = src.reduce((span2, v) => {
          return span2 + elo.encode(v, b, offset + span2);
        }, 0);
        if (this.count instanceof ExternalLayout) {
          this.count.encode(src.length, b, offset);
        }
        return span;
      }
    }
    exports.Sequence = Sequence;

    class Structure extends Layout {
      constructor(fields, property, decodePrefixes) {
        if (!(Array.isArray(fields) && fields.reduce((acc, v) => acc && v instanceof Layout, true))) {
          throw new TypeError("fields must be array of Layout instances");
        }
        if (typeof property === "boolean" && decodePrefixes === undefined) {
          decodePrefixes = property;
          property = undefined;
        }
        for (const fd of fields) {
          if (0 > fd.span && fd.property === undefined) {
            throw new Error("fields cannot contain unnamed variable-length layout");
          }
        }
        let span = -1;
        try {
          span = fields.reduce((span2, fd) => span2 + fd.getSpan(), 0);
        } catch (e) {}
        super(span, property);
        this.fields = fields;
        this.decodePrefixes = !!decodePrefixes;
      }
      getSpan(b, offset = 0) {
        if (0 <= this.span) {
          return this.span;
        }
        let span = 0;
        try {
          span = this.fields.reduce((span2, fd) => {
            const fsp = fd.getSpan(b, offset);
            offset += fsp;
            return span2 + fsp;
          }, 0);
        } catch (e) {
          throw new RangeError("indeterminate span");
        }
        return span;
      }
      decode(b, offset = 0) {
        checkUint8Array(b);
        const dest = this.makeDestinationObject();
        for (const fd of this.fields) {
          if (fd.property !== undefined) {
            dest[fd.property] = fd.decode(b, offset);
          }
          offset += fd.getSpan(b, offset);
          if (this.decodePrefixes && b.length === offset) {
            break;
          }
        }
        return dest;
      }
      encode(src, b, offset = 0) {
        const firstOffset = offset;
        let lastOffset = 0;
        let lastWrote = 0;
        for (const fd of this.fields) {
          let span = fd.span;
          lastWrote = 0 < span ? span : 0;
          if (fd.property !== undefined) {
            const fv = src[fd.property];
            if (fv !== undefined) {
              lastWrote = fd.encode(fv, b, offset);
              if (0 > span) {
                span = fd.getSpan(b, offset);
              }
            }
          }
          lastOffset = offset;
          offset += span;
        }
        return lastOffset + lastWrote - firstOffset;
      }
      fromArray(values) {
        const dest = this.makeDestinationObject();
        for (const fd of this.fields) {
          if (fd.property !== undefined && 0 < values.length) {
            dest[fd.property] = values.shift();
          }
        }
        return dest;
      }
      layoutFor(property) {
        if (typeof property !== "string") {
          throw new TypeError("property must be string");
        }
        for (const fd of this.fields) {
          if (fd.property === property) {
            return fd;
          }
        }
        return;
      }
      offsetOf(property) {
        if (typeof property !== "string") {
          throw new TypeError("property must be string");
        }
        let offset = 0;
        for (const fd of this.fields) {
          if (fd.property === property) {
            return offset;
          }
          if (0 > fd.span) {
            offset = -1;
          } else if (0 <= offset) {
            offset += fd.span;
          }
        }
        return;
      }
    }
    exports.Structure = Structure;

    class UnionDiscriminator {
      constructor(property) {
        this.property = property;
      }
      decode(b, offset) {
        throw new Error("UnionDiscriminator is abstract");
      }
      encode(src, b, offset) {
        throw new Error("UnionDiscriminator is abstract");
      }
    }
    exports.UnionDiscriminator = UnionDiscriminator;

    class UnionLayoutDiscriminator extends UnionDiscriminator {
      constructor(layout, property) {
        if (!(layout instanceof ExternalLayout && layout.isCount())) {
          throw new TypeError("layout must be an unsigned integer ExternalLayout");
        }
        super(property || layout.property || "variant");
        this.layout = layout;
      }
      decode(b, offset) {
        return this.layout.decode(b, offset);
      }
      encode(src, b, offset) {
        return this.layout.encode(src, b, offset);
      }
    }
    exports.UnionLayoutDiscriminator = UnionLayoutDiscriminator;

    class Union extends Layout {
      constructor(discr, defaultLayout, property) {
        let discriminator;
        if (discr instanceof UInt || discr instanceof UIntBE) {
          discriminator = new UnionLayoutDiscriminator(new OffsetLayout(discr));
        } else if (discr instanceof ExternalLayout && discr.isCount()) {
          discriminator = new UnionLayoutDiscriminator(discr);
        } else if (!(discr instanceof UnionDiscriminator)) {
          throw new TypeError("discr must be a UnionDiscriminator " + "or an unsigned integer layout");
        } else {
          discriminator = discr;
        }
        if (defaultLayout === undefined) {
          defaultLayout = null;
        }
        if (!(defaultLayout === null || defaultLayout instanceof Layout)) {
          throw new TypeError("defaultLayout must be null or a Layout");
        }
        if (defaultLayout !== null) {
          if (0 > defaultLayout.span) {
            throw new Error("defaultLayout must have constant span");
          }
          if (defaultLayout.property === undefined) {
            defaultLayout = defaultLayout.replicate("content");
          }
        }
        let span = -1;
        if (defaultLayout) {
          span = defaultLayout.span;
          if (0 <= span && (discr instanceof UInt || discr instanceof UIntBE)) {
            span += discriminator.layout.span;
          }
        }
        super(span, property);
        this.discriminator = discriminator;
        this.usesPrefixDiscriminator = discr instanceof UInt || discr instanceof UIntBE;
        this.defaultLayout = defaultLayout;
        this.registry = {};
        let boundGetSourceVariant = this.defaultGetSourceVariant.bind(this);
        this.getSourceVariant = function(src) {
          return boundGetSourceVariant(src);
        };
        this.configGetSourceVariant = function(gsv) {
          boundGetSourceVariant = gsv.bind(this);
        };
      }
      getSpan(b, offset = 0) {
        if (0 <= this.span) {
          return this.span;
        }
        const vlo = this.getVariant(b, offset);
        if (!vlo) {
          throw new Error("unable to determine span for unrecognized variant");
        }
        return vlo.getSpan(b, offset);
      }
      defaultGetSourceVariant(src) {
        if (Object.prototype.hasOwnProperty.call(src, this.discriminator.property)) {
          if (this.defaultLayout && this.defaultLayout.property && Object.prototype.hasOwnProperty.call(src, this.defaultLayout.property)) {
            return;
          }
          const vlo = this.registry[src[this.discriminator.property]];
          if (vlo && (!vlo.layout || vlo.property && Object.prototype.hasOwnProperty.call(src, vlo.property))) {
            return vlo;
          }
        } else {
          for (const tag in this.registry) {
            const vlo = this.registry[tag];
            if (vlo.property && Object.prototype.hasOwnProperty.call(src, vlo.property)) {
              return vlo;
            }
          }
        }
        throw new Error("unable to infer src variant");
      }
      decode(b, offset = 0) {
        let dest;
        const dlo = this.discriminator;
        const discr = dlo.decode(b, offset);
        const clo = this.registry[discr];
        if (clo === undefined) {
          const defaultLayout = this.defaultLayout;
          let contentOffset = 0;
          if (this.usesPrefixDiscriminator) {
            contentOffset = dlo.layout.span;
          }
          dest = this.makeDestinationObject();
          dest[dlo.property] = discr;
          dest[defaultLayout.property] = defaultLayout.decode(b, offset + contentOffset);
        } else {
          dest = clo.decode(b, offset);
        }
        return dest;
      }
      encode(src, b, offset = 0) {
        const vlo = this.getSourceVariant(src);
        if (vlo === undefined) {
          const dlo = this.discriminator;
          const clo = this.defaultLayout;
          let contentOffset = 0;
          if (this.usesPrefixDiscriminator) {
            contentOffset = dlo.layout.span;
          }
          dlo.encode(src[dlo.property], b, offset);
          return contentOffset + clo.encode(src[clo.property], b, offset + contentOffset);
        }
        return vlo.encode(src, b, offset);
      }
      addVariant(variant, layout, property) {
        const rv = new VariantLayout(this, variant, layout, property);
        this.registry[variant] = rv;
        return rv;
      }
      getVariant(vb, offset = 0) {
        let variant;
        if (vb instanceof Uint8Array) {
          variant = this.discriminator.decode(vb, offset);
        } else {
          variant = vb;
        }
        return this.registry[variant];
      }
    }
    exports.Union = Union;

    class VariantLayout extends Layout {
      constructor(union, variant, layout, property) {
        if (!(union instanceof Union)) {
          throw new TypeError("union must be a Union");
        }
        if (!Number.isInteger(variant) || 0 > variant) {
          throw new TypeError("variant must be a (non-negative) integer");
        }
        if (typeof layout === "string" && property === undefined) {
          property = layout;
          layout = null;
        }
        if (layout) {
          if (!(layout instanceof Layout)) {
            throw new TypeError("layout must be a Layout");
          }
          if (union.defaultLayout !== null && 0 <= layout.span && layout.span > union.defaultLayout.span) {
            throw new Error("variant span exceeds span of containing union");
          }
          if (typeof property !== "string") {
            throw new TypeError("variant must have a String property");
          }
        }
        let span = union.span;
        if (0 > union.span) {
          span = layout ? layout.span : 0;
          if (0 <= span && union.usesPrefixDiscriminator) {
            span += union.discriminator.layout.span;
          }
        }
        super(span, property);
        this.union = union;
        this.variant = variant;
        this.layout = layout || null;
      }
      getSpan(b, offset = 0) {
        if (0 <= this.span) {
          return this.span;
        }
        let contentOffset = 0;
        if (this.union.usesPrefixDiscriminator) {
          contentOffset = this.union.discriminator.layout.span;
        }
        let span = 0;
        if (this.layout) {
          span = this.layout.getSpan(b, offset + contentOffset);
        }
        return contentOffset + span;
      }
      decode(b, offset = 0) {
        const dest = this.makeDestinationObject();
        if (this !== this.union.getVariant(b, offset)) {
          throw new Error("variant mismatch");
        }
        let contentOffset = 0;
        if (this.union.usesPrefixDiscriminator) {
          contentOffset = this.union.discriminator.layout.span;
        }
        if (this.layout) {
          dest[this.property] = this.layout.decode(b, offset + contentOffset);
        } else if (this.property) {
          dest[this.property] = true;
        } else if (this.union.usesPrefixDiscriminator) {
          dest[this.union.discriminator.property] = this.variant;
        }
        return dest;
      }
      encode(src, b, offset = 0) {
        let contentOffset = 0;
        if (this.union.usesPrefixDiscriminator) {
          contentOffset = this.union.discriminator.layout.span;
        }
        if (this.layout && !Object.prototype.hasOwnProperty.call(src, this.property)) {
          throw new TypeError("variant lacks property " + this.property);
        }
        this.union.discriminator.encode(this.variant, b, offset);
        let span = contentOffset;
        if (this.layout) {
          this.layout.encode(src[this.property], b, offset + contentOffset);
          span += this.layout.getSpan(b, offset + contentOffset);
          if (0 <= this.union.span && span > this.union.span) {
            throw new Error("encoded variant overruns containing union");
          }
        }
        return span;
      }
      fromArray(values) {
        if (this.layout) {
          return this.layout.fromArray(values);
        }
        return;
      }
    }
    exports.VariantLayout = VariantLayout;
    function fixBitwiseResult(v) {
      if (0 > v) {
        v += 4294967296;
      }
      return v;
    }

    class BitStructure extends Layout {
      constructor(word, msb, property) {
        if (!(word instanceof UInt || word instanceof UIntBE)) {
          throw new TypeError("word must be a UInt or UIntBE layout");
        }
        if (typeof msb === "string" && property === undefined) {
          property = msb;
          msb = false;
        }
        if (4 < word.span) {
          throw new RangeError("word cannot exceed 32 bits");
        }
        super(word.span, property);
        this.word = word;
        this.msb = !!msb;
        this.fields = [];
        let value = 0;
        this._packedSetValue = function(v) {
          value = fixBitwiseResult(v);
          return this;
        };
        this._packedGetValue = function() {
          return value;
        };
      }
      decode(b, offset = 0) {
        const dest = this.makeDestinationObject();
        const value = this.word.decode(b, offset);
        this._packedSetValue(value);
        for (const fd of this.fields) {
          if (fd.property !== undefined) {
            dest[fd.property] = fd.decode(b);
          }
        }
        return dest;
      }
      encode(src, b, offset = 0) {
        const value = this.word.decode(b, offset);
        this._packedSetValue(value);
        for (const fd of this.fields) {
          if (fd.property !== undefined) {
            const fv = src[fd.property];
            if (fv !== undefined) {
              fd.encode(fv);
            }
          }
        }
        return this.word.encode(this._packedGetValue(), b, offset);
      }
      addField(bits, property) {
        const bf = new BitField(this, bits, property);
        this.fields.push(bf);
        return bf;
      }
      addBoolean(property) {
        const bf = new Boolean2(this, property);
        this.fields.push(bf);
        return bf;
      }
      fieldFor(property) {
        if (typeof property !== "string") {
          throw new TypeError("property must be string");
        }
        for (const fd of this.fields) {
          if (fd.property === property) {
            return fd;
          }
        }
        return;
      }
    }
    exports.BitStructure = BitStructure;

    class BitField {
      constructor(container, bits, property) {
        if (!(container instanceof BitStructure)) {
          throw new TypeError("container must be a BitStructure");
        }
        if (!Number.isInteger(bits) || 0 >= bits) {
          throw new TypeError("bits must be positive integer");
        }
        const totalBits = 8 * container.span;
        const usedBits = container.fields.reduce((sum, fd) => sum + fd.bits, 0);
        if (bits + usedBits > totalBits) {
          throw new Error("bits too long for span remainder (" + (totalBits - usedBits) + " of " + totalBits + " remain)");
        }
        this.container = container;
        this.bits = bits;
        this.valueMask = (1 << bits) - 1;
        if (bits === 32) {
          this.valueMask = 4294967295;
        }
        this.start = usedBits;
        if (this.container.msb) {
          this.start = totalBits - usedBits - bits;
        }
        this.wordMask = fixBitwiseResult(this.valueMask << this.start);
        this.property = property;
      }
      decode(b, offset) {
        const word = this.container._packedGetValue();
        const wordValue = fixBitwiseResult(word & this.wordMask);
        const value = wordValue >>> this.start;
        return value;
      }
      encode(value) {
        if (typeof value !== "number" || !Number.isInteger(value) || value !== fixBitwiseResult(value & this.valueMask)) {
          throw new TypeError(nameWithProperty("BitField.encode", this) + " value must be integer not exceeding " + this.valueMask);
        }
        const word = this.container._packedGetValue();
        const wordValue = fixBitwiseResult(value << this.start);
        this.container._packedSetValue(fixBitwiseResult(word & ~this.wordMask) | wordValue);
      }
    }
    exports.BitField = BitField;

    class Boolean2 extends BitField {
      constructor(container, property) {
        super(container, 1, property);
      }
      decode(b, offset) {
        return !!super.decode(b, offset);
      }
      encode(value) {
        if (typeof value === "boolean") {
          value = +value;
        }
        super.encode(value);
      }
    }
    exports.Boolean = Boolean2;

    class Blob2 extends Layout {
      constructor(length, property) {
        if (!(length instanceof ExternalLayout && length.isCount() || Number.isInteger(length) && 0 <= length)) {
          throw new TypeError("length must be positive integer " + "or an unsigned integer ExternalLayout");
        }
        let span = -1;
        if (!(length instanceof ExternalLayout)) {
          span = length;
        }
        super(span, property);
        this.length = length;
      }
      getSpan(b, offset) {
        let span = this.span;
        if (0 > span) {
          span = this.length.decode(b, offset);
        }
        return span;
      }
      decode(b, offset = 0) {
        let span = this.span;
        if (0 > span) {
          span = this.length.decode(b, offset);
        }
        return uint8ArrayToBuffer(b).slice(offset, offset + span);
      }
      encode(src, b, offset) {
        let span = this.length;
        if (this.length instanceof ExternalLayout) {
          span = src.length;
        }
        if (!(src instanceof Uint8Array && span === src.length)) {
          throw new TypeError(nameWithProperty("Blob.encode", this) + " requires (length " + span + ") Uint8Array as src");
        }
        if (offset + span > b.length) {
          throw new RangeError("encoding overruns Uint8Array");
        }
        const srcBuffer = uint8ArrayToBuffer(src);
        uint8ArrayToBuffer(b).write(srcBuffer.toString("hex"), offset, span, "hex");
        if (this.length instanceof ExternalLayout) {
          this.length.encode(span, b, offset);
        }
        return span;
      }
    }
    exports.Blob = Blob2;

    class CString extends Layout {
      constructor(property) {
        super(-1, property);
      }
      getSpan(b, offset = 0) {
        checkUint8Array(b);
        let idx = offset;
        while (idx < b.length && b[idx] !== 0) {
          idx += 1;
        }
        return 1 + idx - offset;
      }
      decode(b, offset = 0) {
        const span = this.getSpan(b, offset);
        return uint8ArrayToBuffer(b).slice(offset, offset + span - 1).toString("utf-8");
      }
      encode(src, b, offset = 0) {
        if (typeof src !== "string") {
          src = String(src);
        }
        const srcb = buffer_1.Buffer.from(src, "utf8");
        const span = srcb.length;
        if (offset + span > b.length) {
          throw new RangeError("encoding overruns Buffer");
        }
        const buffer = uint8ArrayToBuffer(b);
        srcb.copy(buffer, offset);
        buffer[offset + span] = 0;
        return span + 1;
      }
    }
    exports.CString = CString;

    class UTF8 extends Layout {
      constructor(maxSpan, property) {
        if (typeof maxSpan === "string" && property === undefined) {
          property = maxSpan;
          maxSpan = undefined;
        }
        if (maxSpan === undefined) {
          maxSpan = -1;
        } else if (!Number.isInteger(maxSpan)) {
          throw new TypeError("maxSpan must be an integer");
        }
        super(-1, property);
        this.maxSpan = maxSpan;
      }
      getSpan(b, offset = 0) {
        checkUint8Array(b);
        return b.length - offset;
      }
      decode(b, offset = 0) {
        const span = this.getSpan(b, offset);
        if (0 <= this.maxSpan && this.maxSpan < span) {
          throw new RangeError("text length exceeds maxSpan");
        }
        return uint8ArrayToBuffer(b).slice(offset, offset + span).toString("utf-8");
      }
      encode(src, b, offset = 0) {
        if (typeof src !== "string") {
          src = String(src);
        }
        const srcb = buffer_1.Buffer.from(src, "utf8");
        const span = srcb.length;
        if (0 <= this.maxSpan && this.maxSpan < span) {
          throw new RangeError("text length exceeds maxSpan");
        }
        if (offset + span > b.length) {
          throw new RangeError("encoding overruns Buffer");
        }
        srcb.copy(uint8ArrayToBuffer(b), offset);
        return span;
      }
    }
    exports.UTF8 = UTF8;

    class Constant extends Layout {
      constructor(value, property) {
        super(0, property);
        this.value = value;
      }
      decode(b, offset) {
        return this.value;
      }
      encode(src, b, offset) {
        return 0;
      }
    }
    exports.Constant = Constant;
    exports.greedy = (elementSpan, property) => new GreedyCount(elementSpan, property);
    exports.offset = (layout, offset, property) => new OffsetLayout(layout, offset, property);
    exports.u8 = (property) => new UInt(1, property);
    exports.u16 = (property) => new UInt(2, property);
    exports.u24 = (property) => new UInt(3, property);
    exports.u32 = (property) => new UInt(4, property);
    exports.u40 = (property) => new UInt(5, property);
    exports.u48 = (property) => new UInt(6, property);
    exports.nu64 = (property) => new NearUInt64(property);
    exports.u16be = (property) => new UIntBE(2, property);
    exports.u24be = (property) => new UIntBE(3, property);
    exports.u32be = (property) => new UIntBE(4, property);
    exports.u40be = (property) => new UIntBE(5, property);
    exports.u48be = (property) => new UIntBE(6, property);
    exports.nu64be = (property) => new NearUInt64BE(property);
    exports.s8 = (property) => new Int(1, property);
    exports.s16 = (property) => new Int(2, property);
    exports.s24 = (property) => new Int(3, property);
    exports.s32 = (property) => new Int(4, property);
    exports.s40 = (property) => new Int(5, property);
    exports.s48 = (property) => new Int(6, property);
    exports.ns64 = (property) => new NearInt64(property);
    exports.s16be = (property) => new IntBE(2, property);
    exports.s24be = (property) => new IntBE(3, property);
    exports.s32be = (property) => new IntBE(4, property);
    exports.s40be = (property) => new IntBE(5, property);
    exports.s48be = (property) => new IntBE(6, property);
    exports.ns64be = (property) => new NearInt64BE(property);
    exports.f32 = (property) => new Float(property);
    exports.f32be = (property) => new FloatBE(property);
    exports.f64 = (property) => new Double(property);
    exports.f64be = (property) => new DoubleBE(property);
    exports.struct = (fields, property, decodePrefixes) => new Structure(fields, property, decodePrefixes);
    exports.bits = (word, msb, property) => new BitStructure(word, msb, property);
    exports.seq = (elementLayout, count, property) => new Sequence(elementLayout, count, property);
    exports.union = (discr, defaultLayout, property) => new Union(discr, defaultLayout, property);
    exports.unionLayoutDiscriminator = (layout, property) => new UnionLayoutDiscriminator(layout, property);
    exports.blob = (length, property) => new Blob2(length, property);
    exports.cstr = (property) => new CString(property);
    exports.utf8 = (maxSpan, property) => new UTF8(maxSpan, property);
    exports.constant = (value, property) => new Constant(value, property);
  });

  // node_modules/bigint-buffer/dist/browser.js
  var require_browser = __commonJS((exports) => {
    Object.defineProperty(exports, "__esModule", { value: true });
    var converter;
    function toBigIntLE(buf) {
      {
        const reversed = Buffer.from(buf);
        reversed.reverse();
        const hex = reversed.toString("hex");
        if (hex.length === 0) {
          return BigInt(0);
        }
        return BigInt(`0x${hex}`);
      }
      return converter.toBigInt(buf, false);
    }
    exports.toBigIntLE = toBigIntLE;
    function toBigIntBE(buf) {
      {
        const hex = buf.toString("hex");
        if (hex.length === 0) {
          return BigInt(0);
        }
        return BigInt(`0x${hex}`);
      }
      return converter.toBigInt(buf, true);
    }
    exports.toBigIntBE = toBigIntBE;
    function toBufferLE(num, width) {
      {
        const hex = num.toString(16);
        const buffer = Buffer.from(hex.padStart(width * 2, "0").slice(0, width * 2), "hex");
        buffer.reverse();
        return buffer;
      }
      return converter.fromBigInt(num, Buffer.allocUnsafe(width), false);
    }
    exports.toBufferLE = toBufferLE;
    function toBufferBE(num, width) {
      {
        const hex = num.toString(16);
        return Buffer.from(hex.padStart(width * 2, "0").slice(0, width * 2), "hex");
      }
      return converter.fromBigInt(num, Buffer.allocUnsafe(width), true);
    }
    exports.toBufferBE = toBufferBE;
  });

  // node_modules/uuid/dist/esm-browser/rng.js
  function rng() {
    if (!getRandomValues) {
      getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
      if (!getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
    }
    return getRandomValues(rnds8);
  }
  var getRandomValues, rnds8;
  var init_rng = __esm(() => {
    rnds8 = new Uint8Array(16);
  });

  // node_modules/uuid/dist/esm-browser/regex.js
  var regex_default;
  var init_regex = __esm(() => {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  });

  // node_modules/uuid/dist/esm-browser/validate.js
  function validate2(uuid) {
    return typeof uuid === "string" && regex_default.test(uuid);
  }
  var validate_default;
  var init_validate = __esm(() => {
    init_regex();
    validate_default = validate2;
  });

  // node_modules/uuid/dist/esm-browser/stringify.js
  function stringify(arr) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
    if (!validate_default(uuid)) {
      throw TypeError("Stringified UUID is invalid");
    }
    return uuid;
  }
  var byteToHex, i2, stringify_default;
  var init_stringify = __esm(() => {
    init_validate();
    byteToHex = [];
    for (i2 = 0;i2 < 256; ++i2) {
      byteToHex.push((i2 + 256).toString(16).substr(1));
    }
    stringify_default = stringify;
  });

  // node_modules/uuid/dist/esm-browser/v1.js
  function v1(options, buf, offset) {
    var i3 = buf && offset || 0;
    var b = buf || new Array(16);
    options = options || {};
    var node = options.node || _nodeId;
    var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;
    if (node == null || clockseq == null) {
      var seedBytes = options.random || (options.rng || rng)();
      if (node == null) {
        node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
      }
      if (clockseq == null) {
        clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
      }
    }
    var msecs = options.msecs !== undefined ? options.msecs : Date.now();
    var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
    var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
    if (dt < 0 && options.clockseq === undefined) {
      clockseq = clockseq + 1 & 16383;
    }
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
      nsecs = 0;
    }
    if (nsecs >= 1e4) {
      throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    msecs += 12219292800000;
    var tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
    b[i3++] = tl >>> 24 & 255;
    b[i3++] = tl >>> 16 & 255;
    b[i3++] = tl >>> 8 & 255;
    b[i3++] = tl & 255;
    var tmh = msecs / 4294967296 * 1e4 & 268435455;
    b[i3++] = tmh >>> 8 & 255;
    b[i3++] = tmh & 255;
    b[i3++] = tmh >>> 24 & 15 | 16;
    b[i3++] = tmh >>> 16 & 255;
    b[i3++] = clockseq >>> 8 | 128;
    b[i3++] = clockseq & 255;
    for (var n = 0;n < 6; ++n) {
      b[i3 + n] = node[n];
    }
    return buf || stringify_default(b);
  }
  var _nodeId, _clockseq, _lastMSecs = 0, _lastNSecs = 0, v1_default;
  var init_v1 = __esm(() => {
    init_rng();
    init_stringify();
    v1_default = v1;
  });

  // node_modules/uuid/dist/esm-browser/parse.js
  function parse(uuid) {
    if (!validate_default(uuid)) {
      throw TypeError("Invalid UUID");
    }
    var v;
    var arr = new Uint8Array(16);
    arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
    arr[1] = v >>> 16 & 255;
    arr[2] = v >>> 8 & 255;
    arr[3] = v & 255;
    arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
    arr[5] = v & 255;
    arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
    arr[7] = v & 255;
    arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
    arr[9] = v & 255;
    arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
    arr[11] = v / 4294967296 & 255;
    arr[12] = v >>> 24 & 255;
    arr[13] = v >>> 16 & 255;
    arr[14] = v >>> 8 & 255;
    arr[15] = v & 255;
    return arr;
  }
  var parse_default;
  var init_parse = __esm(() => {
    init_validate();
    parse_default = parse;
  });

  // node_modules/uuid/dist/esm-browser/v35.js
  function stringToBytes(str) {
    str = unescape(encodeURIComponent(str));
    var bytes = [];
    for (var i3 = 0;i3 < str.length; ++i3) {
      bytes.push(str.charCodeAt(i3));
    }
    return bytes;
  }
  function v35_default(name, version, hashfunc) {
    function generateUUID(value, namespace, buf, offset) {
      if (typeof value === "string") {
        value = stringToBytes(value);
      }
      if (typeof namespace === "string") {
        namespace = parse_default(namespace);
      }
      if (namespace.length !== 16) {
        throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
      }
      var bytes = new Uint8Array(16 + value.length);
      bytes.set(namespace);
      bytes.set(value, namespace.length);
      bytes = hashfunc(bytes);
      bytes[6] = bytes[6] & 15 | version;
      bytes[8] = bytes[8] & 63 | 128;
      if (buf) {
        offset = offset || 0;
        for (var i3 = 0;i3 < 16; ++i3) {
          buf[offset + i3] = bytes[i3];
        }
        return buf;
      }
      return stringify_default(bytes);
    }
    try {
      generateUUID.name = name;
    } catch (err) {}
    generateUUID.DNS = DNS;
    generateUUID.URL = URL;
    return generateUUID;
  }
  var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8", URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  var init_v35 = __esm(() => {
    init_stringify();
    init_parse();
  });

  // node_modules/uuid/dist/esm-browser/md5.js
  function md5(bytes) {
    if (typeof bytes === "string") {
      var msg = unescape(encodeURIComponent(bytes));
      bytes = new Uint8Array(msg.length);
      for (var i3 = 0;i3 < msg.length; ++i3) {
        bytes[i3] = msg.charCodeAt(i3);
      }
    }
    return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
  }
  function md5ToHexEncodedArray(input) {
    var output = [];
    var length32 = input.length * 32;
    var hexTab = "0123456789abcdef";
    for (var i3 = 0;i3 < length32; i3 += 8) {
      var x = input[i3 >> 5] >>> i3 % 32 & 255;
      var hex = parseInt(hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15), 16);
      output.push(hex);
    }
    return output;
  }
  function getOutputLength(inputLength8) {
    return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
  }
  function wordsToMd5(x, len2) {
    x[len2 >> 5] |= 128 << len2 % 32;
    x[getOutputLength(len2) - 1] = len2;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    for (var i3 = 0;i3 < x.length; i3 += 16) {
      var olda = a;
      var oldb = b;
      var oldc = c;
      var oldd = d;
      a = md5ff(a, b, c, d, x[i3], 7, -680876936);
      d = md5ff(d, a, b, c, x[i3 + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i3 + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i3 + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i3 + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i3 + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i3 + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i3 + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i3 + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i3 + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i3 + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i3 + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i3 + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i3 + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i3 + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i3 + 15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[i3 + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i3 + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i3 + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i3], 20, -373897302);
      a = md5gg(a, b, c, d, x[i3 + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i3 + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i3 + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i3 + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i3 + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i3 + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i3 + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i3 + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i3 + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i3 + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i3 + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i3 + 12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[i3 + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i3 + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i3 + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i3 + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i3 + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i3 + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i3 + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i3 + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i3 + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i3], 11, -358537222);
      c = md5hh(c, d, a, b, x[i3 + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i3 + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i3 + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i3 + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i3 + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i3 + 2], 23, -995338651);
      a = md5ii(a, b, c, d, x[i3], 6, -198630844);
      d = md5ii(d, a, b, c, x[i3 + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i3 + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i3 + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i3 + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i3 + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i3 + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i3 + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i3 + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i3 + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i3 + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i3 + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i3 + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i3 + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i3 + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i3 + 9], 21, -343485551);
      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }
  function bytesToWords(input) {
    if (input.length === 0) {
      return [];
    }
    var length8 = input.length * 8;
    var output = new Uint32Array(getOutputLength(length8));
    for (var i3 = 0;i3 < length8; i3 += 8) {
      output[i3 >> 5] |= (input[i3 / 8] & 255) << i3 % 32;
    }
    return output;
  }
  function safeAdd(x, y) {
    var lsw = (x & 65535) + (y & 65535);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 65535;
  }
  function bitRotateLeft(num, cnt) {
    return num << cnt | num >>> 32 - cnt;
  }
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a, b, c, d, x, s, t) {
    return md5cmn(b & c | ~b & d, a, b, x, s, t);
  }
  function md5gg(a, b, c, d, x, s, t) {
    return md5cmn(b & d | c & ~d, a, b, x, s, t);
  }
  function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  var md5_default;
  var init_md5 = __esm(() => {
    md5_default = md5;
  });

  // node_modules/uuid/dist/esm-browser/v3.js
  var v3, v3_default;
  var init_v3 = __esm(() => {
    init_v35();
    init_md5();
    v3 = v35_default("v3", 48, md5_default);
    v3_default = v3;
  });

  // node_modules/uuid/dist/esm-browser/v4.js
  function v4(options, buf, offset) {
    options = options || {};
    var rnds = options.random || (options.rng || rng)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (var i3 = 0;i3 < 16; ++i3) {
        buf[offset + i3] = rnds[i3];
      }
      return buf;
    }
    return stringify_default(rnds);
  }
  var v4_default;
  var init_v4 = __esm(() => {
    init_rng();
    init_stringify();
    v4_default = v4;
  });

  // node_modules/uuid/dist/esm-browser/sha1.js
  function f(s, x, y, z) {
    switch (s) {
      case 0:
        return x & y ^ ~x & z;
      case 1:
        return x ^ y ^ z;
      case 2:
        return x & y ^ x & z ^ y & z;
      case 3:
        return x ^ y ^ z;
    }
  }
  function ROTL(x, n) {
    return x << n | x >>> 32 - n;
  }
  function sha1(bytes) {
    var K = [1518500249, 1859775393, 2400959708, 3395469782];
    var H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
    if (typeof bytes === "string") {
      var msg = unescape(encodeURIComponent(bytes));
      bytes = [];
      for (var i3 = 0;i3 < msg.length; ++i3) {
        bytes.push(msg.charCodeAt(i3));
      }
    } else if (!Array.isArray(bytes)) {
      bytes = Array.prototype.slice.call(bytes);
    }
    bytes.push(128);
    var l = bytes.length / 4 + 2;
    var N = Math.ceil(l / 16);
    var M = new Array(N);
    for (var _i = 0;_i < N; ++_i) {
      var arr = new Uint32Array(16);
      for (var j = 0;j < 16; ++j) {
        arr[j] = bytes[_i * 64 + j * 4] << 24 | bytes[_i * 64 + j * 4 + 1] << 16 | bytes[_i * 64 + j * 4 + 2] << 8 | bytes[_i * 64 + j * 4 + 3];
      }
      M[_i] = arr;
    }
    M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
    M[N - 1][14] = Math.floor(M[N - 1][14]);
    M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
    for (var _i2 = 0;_i2 < N; ++_i2) {
      var W = new Uint32Array(80);
      for (var t = 0;t < 16; ++t) {
        W[t] = M[_i2][t];
      }
      for (var _t = 16;_t < 80; ++_t) {
        W[_t] = ROTL(W[_t - 3] ^ W[_t - 8] ^ W[_t - 14] ^ W[_t - 16], 1);
      }
      var a = H[0];
      var b = H[1];
      var c = H[2];
      var d = H[3];
      var e = H[4];
      for (var _t2 = 0;_t2 < 80; ++_t2) {
        var s = Math.floor(_t2 / 20);
        var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[_t2] >>> 0;
        e = d;
        d = c;
        c = ROTL(b, 30) >>> 0;
        b = a;
        a = T;
      }
      H[0] = H[0] + a >>> 0;
      H[1] = H[1] + b >>> 0;
      H[2] = H[2] + c >>> 0;
      H[3] = H[3] + d >>> 0;
      H[4] = H[4] + e >>> 0;
    }
    return [H[0] >> 24 & 255, H[0] >> 16 & 255, H[0] >> 8 & 255, H[0] & 255, H[1] >> 24 & 255, H[1] >> 16 & 255, H[1] >> 8 & 255, H[1] & 255, H[2] >> 24 & 255, H[2] >> 16 & 255, H[2] >> 8 & 255, H[2] & 255, H[3] >> 24 & 255, H[3] >> 16 & 255, H[3] >> 8 & 255, H[3] & 255, H[4] >> 24 & 255, H[4] >> 16 & 255, H[4] >> 8 & 255, H[4] & 255];
  }
  var sha1_default;
  var init_sha1 = __esm(() => {
    sha1_default = sha1;
  });

  // node_modules/uuid/dist/esm-browser/v5.js
  var v5, v5_default;
  var init_v5 = __esm(() => {
    init_v35();
    init_sha1();
    v5 = v35_default("v5", 80, sha1_default);
    v5_default = v5;
  });

  // node_modules/uuid/dist/esm-browser/nil.js
  var nil_default = "00000000-0000-0000-0000-000000000000";

  // node_modules/uuid/dist/esm-browser/version.js
  function version(uuid) {
    if (!validate_default(uuid)) {
      throw TypeError("Invalid UUID");
    }
    return parseInt(uuid.substr(14, 1), 16);
  }
  var version_default;
  var init_version = __esm(() => {
    init_validate();
    version_default = version;
  });

  // node_modules/uuid/dist/esm-browser/index.js
  var exports_esm_browser = {};
  __export(exports_esm_browser, {
    version: () => version_default,
    validate: () => validate_default,
    v5: () => v5_default,
    v4: () => v4_default,
    v3: () => v3_default,
    v1: () => v1_default,
    stringify: () => stringify_default,
    parse: () => parse_default,
    NIL: () => nil_default
  });
  var init_esm_browser = __esm(() => {
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  });

  // node_modules/jayson/lib/generateRequest.js
  var require_generateRequest = __commonJS((exports, module) => {
    var uuid = (init_esm_browser(), __toCommonJS(exports_esm_browser)).v4;
    var generateRequest = function(method, params, id, options) {
      if (typeof method !== "string") {
        throw new TypeError(method + " must be a string");
      }
      options = options || {};
      const version2 = typeof options.version === "number" ? options.version : 2;
      if (version2 !== 1 && version2 !== 2) {
        throw new TypeError(version2 + " must be 1 or 2");
      }
      const request = {
        method
      };
      if (version2 === 2) {
        request.jsonrpc = "2.0";
      }
      if (params) {
        if (typeof params !== "object" && !Array.isArray(params)) {
          throw new TypeError(params + " must be an object, array or omitted");
        }
        request.params = params;
      }
      if (typeof id === "undefined") {
        const generator = typeof options.generator === "function" ? options.generator : function() {
          return uuid();
        };
        request.id = generator(request, options);
      } else if (version2 === 2 && id === null) {
        if (options.notificationIdNull) {
          request.id = null;
        }
      } else {
        request.id = id;
      }
      return request;
    };
    module.exports = generateRequest;
  });

  // node_modules/jayson/lib/client/browser/index.js
  var require_browser2 = __commonJS((exports, module) => {
    var uuid = (init_esm_browser(), __toCommonJS(exports_esm_browser)).v4;
    var generateRequest = require_generateRequest();
    var ClientBrowser = function(callServer, options) {
      if (!(this instanceof ClientBrowser)) {
        return new ClientBrowser(callServer, options);
      }
      if (!options) {
        options = {};
      }
      this.options = {
        reviver: typeof options.reviver !== "undefined" ? options.reviver : null,
        replacer: typeof options.replacer !== "undefined" ? options.replacer : null,
        generator: typeof options.generator !== "undefined" ? options.generator : function() {
          return uuid();
        },
        version: typeof options.version !== "undefined" ? options.version : 2,
        notificationIdNull: typeof options.notificationIdNull === "boolean" ? options.notificationIdNull : false
      };
      this.callServer = callServer;
    };
    module.exports = ClientBrowser;
    ClientBrowser.prototype.request = function(method, params, id, callback) {
      const self = this;
      let request = null;
      const isBatch = Array.isArray(method) && typeof params === "function";
      if (this.options.version === 1 && isBatch) {
        throw new TypeError("JSON-RPC 1.0 does not support batching");
      }
      const isRaw = !isBatch && method && typeof method === "object" && typeof params === "function";
      if (isBatch || isRaw) {
        callback = params;
        request = method;
      } else {
        if (typeof id === "function") {
          callback = id;
          id = undefined;
        }
        const hasCallback = typeof callback === "function";
        try {
          request = generateRequest(method, params, id, {
            generator: this.options.generator,
            version: this.options.version,
            notificationIdNull: this.options.notificationIdNull
          });
        } catch (err) {
          if (hasCallback) {
            callback(err);
            return;
          }
          throw err;
        }
        if (!hasCallback) {
          return request;
        }
      }
      let message;
      try {
        message = JSON.stringify(request, this.options.replacer);
      } catch (err) {
        callback(err);
        return;
      }
      this.callServer(message, function(err, response) {
        self._parseResponse(err, response, callback);
      });
      return request;
    };
    ClientBrowser.prototype._parseResponse = function(err, responseText, callback) {
      if (err) {
        callback(err);
        return;
      }
      if (!responseText) {
        callback();
        return;
      }
      let response;
      try {
        response = JSON.parse(responseText, this.options.reviver);
      } catch (err2) {
        callback(err2);
        return;
      }
      if (callback.length === 3) {
        if (Array.isArray(response)) {
          const isError = function(res) {
            return typeof res.error !== "undefined";
          };
          const isNotError = function(res) {
            return !isError(res);
          };
          callback(null, response.filter(isError), response.filter(isNotError));
          return;
        } else {
          callback(null, response.error, response.result);
          return;
        }
      }
      callback(null, response);
    };
  });

  // node_modules/eventemitter3/index.js
  var require_eventemitter3 = __commonJS((exports, module) => {
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {}
    if (Object.create) {
      Events.prototype = Object.create(null);
      if (!new Events().__proto__)
        prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt])
        emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn)
        emitter._events[evt].push(listener);
      else
        emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0)
        emitter._events = new Events;
      else
        delete emitter._events[evt];
    }
    function EventEmitter() {
      this._events = new Events;
      this._eventsCount = 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0)
        return names;
      for (name in events = this._events) {
        if (has.call(events, name))
          names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers)
        return [];
      if (handlers.fn)
        return [handlers.fn];
      for (var i3 = 0, l = handlers.length, ee = new Array(l);i3 < l; i3++) {
        ee[i3] = handlers[i3].fn;
      }
      return ee;
    };
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners)
        return 0;
      if (listeners.fn)
        return 1;
      return listeners.length;
    };
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return false;
      var listeners = this._events[evt], len2 = arguments.length, args, i3;
      if (listeners.fn) {
        if (listeners.once)
          this.removeListener(event, listeners.fn, undefined, true);
        switch (len2) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i3 = 1, args = new Array(len2 - 1);i3 < len2; i3++) {
          args[i3 - 1] = arguments[i3];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i3 = 0;i3 < length; i3++) {
          if (listeners[i3].once)
            this.removeListener(event, listeners[i3].fn, undefined, true);
          switch (len2) {
            case 1:
              listeners[i3].fn.call(listeners[i3].context);
              break;
            case 2:
              listeners[i3].fn.call(listeners[i3].context, a1);
              break;
            case 3:
              listeners[i3].fn.call(listeners[i3].context, a1, a2);
              break;
            case 4:
              listeners[i3].fn.call(listeners[i3].context, a1, a2, a3);
              break;
            default:
              if (!args)
                for (j = 1, args = new Array(len2 - 1);j < len2; j++) {
                  args[j - 1] = arguments[j];
                }
              listeners[i3].fn.apply(listeners[i3].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i3 = 0, events = [], length = listeners.length;i3 < length; i3++) {
          if (listeners[i3].fn !== fn || once && !listeners[i3].once || context && listeners[i3].context !== context) {
            events.push(listeners[i3]);
          }
        }
        if (events.length)
          this._events[evt] = events.length === 1 ? events[0] : events;
        else
          clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt])
          clearEvent(this, evt);
      } else {
        this._events = new Events;
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prefixed = prefix;
    EventEmitter.EventEmitter = EventEmitter;
    if (typeof module !== "undefined") {
      module.exports = EventEmitter;
    }
  });

  // polyfill.mjs
  init_buffer();
  globalThis.Buffer = globalThis.Buffer || Buffer2;
  globalThis.global = globalThis;
  globalThis.process = globalThis.process || { env: {}, version: "", nextTick: (cb) => setTimeout(cb, 0) };

  // node_modules/@solana/web3.js/lib/index.browser.esm.js
  init_buffer();

  // node_modules/@noble/hashes/esm/crypto.js
  var crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : undefined;

  // node_modules/@noble/hashes/esm/utils.js
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("positive integer expected, got " + n);
  }
  function abytes(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function")
      throw new Error("Hash should be wrapped by utils.createHasher");
    anumber(h.outputLen);
    anumber(h.blockLen);
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error("digestInto() expects output buffer of length at least " + min);
    }
  }
  function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  }
  function clean(...arrays) {
    for (let i2 = 0;i2 < arrays.length; i2++) {
      arrays[i2].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
  function byteSwap(word) {
    return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
  }
  function byteSwap32(arr) {
    for (let i2 = 0;i2 < arr.length; i2++) {
      arr[i2] = byteSwap(arr[i2]);
    }
    return arr;
  }
  var swap32IfBE = isLE ? (u) => u : byteSwap32;
  var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
  var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i2) => i2.toString(16).padStart(2, "0"));
  function bytesToHex(bytes) {
    abytes(bytes);
    if (hasHexBuiltin)
      return bytes.toHex();
    let hex = "";
    for (let i2 = 0;i2 < bytes.length; i2++) {
      hex += hexes[bytes[i2]];
    }
    return hex;
  }
  var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
      return ch - asciis._0;
    if (ch >= asciis.A && ch <= asciis.F)
      return ch - (asciis.A - 10);
    if (ch >= asciis.a && ch <= asciis.f)
      return ch - (asciis.a - 10);
    return;
  }
  function hexToBytes(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    if (hasHexBuiltin)
      return Uint8Array.fromHex(hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex.charCodeAt(hi));
      const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
      if (n1 === undefined || n2 === undefined) {
        const char = hex[hi] + hex[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  function utf8ToBytes2(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes2(data);
    abytes(data);
    return data;
  }
  function concatBytes(...arrays) {
    let sum = 0;
    for (let i2 = 0;i2 < arrays.length; i2++) {
      const a = arrays[i2];
      abytes(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i2 = 0, pad = 0;i2 < arrays.length; i2++) {
      const a = arrays[i2];
      res.set(a, pad);
      pad += a.length;
    }
    return res;
  }
  class Hash {
  }
  function createHasher(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  function randomBytes(bytesLength = 32) {
    if (crypto2 && typeof crypto2.getRandomValues === "function") {
      return crypto2.getRandomValues(new Uint8Array(bytesLength));
    }
    if (crypto2 && typeof crypto2.randomBytes === "function") {
      return Uint8Array.from(crypto2.randomBytes(bytesLength));
    }
    throw new Error("crypto.getRandomValues must be defined");
  }

  // node_modules/@noble/hashes/esm/_md.js
  function setBigUint64(view, byteOffset, value, isLE2) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE2);
    const _32n = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE2 ? 4 : 0;
    const l = isLE2 ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE2);
    view.setUint32(byteOffset + l, wl, isLE2);
  }
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }

  class HashMD extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE2) {
      super();
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE2;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      data = toBytes(data);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len2 = data.length;
      for (let pos = 0;pos < len2; ) {
        const take = Math.min(blockLen - this.pos, len2 - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (;blockLen <= len2 - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE: isLE2 } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i2 = pos;i2 < blockLen; i2++)
        buffer[i2] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
      this.process(view, 0);
      const oview = createView(out);
      const len2 = this.outputLen;
      if (len2 % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len2 / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i2 = 0;i2 < outLen; i2++)
        oview.setUint32(4 * i2, state[i2], isLE2);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor);
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  }
  var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    4089235720,
    3144134277,
    2227873595,
    1013904242,
    4271175723,
    2773480762,
    1595750129,
    1359893119,
    2917565137,
    2600822924,
    725511199,
    528734635,
    4215389547,
    1541459225,
    327033209
  ]);

  // node_modules/@noble/hashes/esm/_u64.js
  var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
  var _32n = /* @__PURE__ */ BigInt(32);
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
    const len2 = lst.length;
    let Ah = new Uint32Array(len2);
    let Al = new Uint32Array(len2);
    for (let i2 = 0;i2 < len2; i2++) {
      const { h, l } = fromBig(lst[i2], le);
      [Ah[i2], Al[i2]] = [h, l];
    }
    return [Ah, Al];
  }
  var shrSH = (h, _l, s) => h >>> s;
  var shrSL = (h, l, s) => h << 32 - s | l >>> s;
  var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
  var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
  var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
  var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
  var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
  var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
  var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
  var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
  function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  }
  var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
  var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
  var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
  var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
  var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
  var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

  // node_modules/@noble/hashes/esm/sha2.js
  var SHA256_K = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);

  class SHA256 extends HashMD {
    constructor(outputLen = 32) {
      super(64, outputLen, 8, false);
      this.A = SHA256_IV[0] | 0;
      this.B = SHA256_IV[1] | 0;
      this.C = SHA256_IV[2] | 0;
      this.D = SHA256_IV[3] | 0;
      this.E = SHA256_IV[4] | 0;
      this.F = SHA256_IV[5] | 0;
      this.G = SHA256_IV[6] | 0;
      this.H = SHA256_IV[7] | 0;
    }
    get() {
      const { A, B, C, D, E: E2, F, G, H } = this;
      return [A, B, C, D, E2, F, G, H];
    }
    set(A, B, C, D, E2, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E2 | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i2 = 0;i2 < 16; i2++, offset += 4)
        SHA256_W[i2] = view.getUint32(offset, false);
      for (let i2 = 16;i2 < 64; i2++) {
        const W15 = SHA256_W[i2 - 15];
        const W2 = SHA256_W[i2 - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i2] = s1 + SHA256_W[i2 - 7] + s0 + SHA256_W[i2 - 16] | 0;
      }
      let { A, B, C, D, E: E2, F, G, H } = this;
      for (let i2 = 0;i2 < 64; i2++) {
        const sigma1 = rotr(E2, 6) ^ rotr(E2, 11) ^ rotr(E2, 25);
        const T1 = H + sigma1 + Chi(E2, F, G) + SHA256_K[i2] + SHA256_W[i2] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E2;
        E2 = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E2 = E2 + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E2, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  }
  var K512 = /* @__PURE__ */ (() => split([
    "0x428a2f98d728ae22",
    "0x7137449123ef65cd",
    "0xb5c0fbcfec4d3b2f",
    "0xe9b5dba58189dbbc",
    "0x3956c25bf348b538",
    "0x59f111f1b605d019",
    "0x923f82a4af194f9b",
    "0xab1c5ed5da6d8118",
    "0xd807aa98a3030242",
    "0x12835b0145706fbe",
    "0x243185be4ee4b28c",
    "0x550c7dc3d5ffb4e2",
    "0x72be5d74f27b896f",
    "0x80deb1fe3b1696b1",
    "0x9bdc06a725c71235",
    "0xc19bf174cf692694",
    "0xe49b69c19ef14ad2",
    "0xefbe4786384f25e3",
    "0x0fc19dc68b8cd5b5",
    "0x240ca1cc77ac9c65",
    "0x2de92c6f592b0275",
    "0x4a7484aa6ea6e483",
    "0x5cb0a9dcbd41fbd4",
    "0x76f988da831153b5",
    "0x983e5152ee66dfab",
    "0xa831c66d2db43210",
    "0xb00327c898fb213f",
    "0xbf597fc7beef0ee4",
    "0xc6e00bf33da88fc2",
    "0xd5a79147930aa725",
    "0x06ca6351e003826f",
    "0x142929670a0e6e70",
    "0x27b70a8546d22ffc",
    "0x2e1b21385c26c926",
    "0x4d2c6dfc5ac42aed",
    "0x53380d139d95b3df",
    "0x650a73548baf63de",
    "0x766a0abb3c77b2a8",
    "0x81c2c92e47edaee6",
    "0x92722c851482353b",
    "0xa2bfe8a14cf10364",
    "0xa81a664bbc423001",
    "0xc24b8b70d0f89791",
    "0xc76c51a30654be30",
    "0xd192e819d6ef5218",
    "0xd69906245565a910",
    "0xf40e35855771202a",
    "0x106aa07032bbd1b8",
    "0x19a4c116b8d2d0c8",
    "0x1e376c085141ab53",
    "0x2748774cdf8eeb99",
    "0x34b0bcb5e19b48a8",
    "0x391c0cb3c5c95a63",
    "0x4ed8aa4ae3418acb",
    "0x5b9cca4f7763e373",
    "0x682e6ff3d6b2b8a3",
    "0x748f82ee5defb2fc",
    "0x78a5636f43172f60",
    "0x84c87814a1f0ab72",
    "0x8cc702081a6439ec",
    "0x90befffa23631e28",
    "0xa4506cebde82bde9",
    "0xbef9a3f7b2c67915",
    "0xc67178f2e372532b",
    "0xca273eceea26619c",
    "0xd186b8c721c0c207",
    "0xeada7dd6cde0eb1e",
    "0xf57d4f7fee6ed178",
    "0x06f067aa72176fba",
    "0x0a637dc5a2c898a6",
    "0x113f9804bef90dae",
    "0x1b710b35131c471b",
    "0x28db77f523047d84",
    "0x32caab7b40c72493",
    "0x3c9ebe0a15c9bebc",
    "0x431d67c49c100d4c",
    "0x4cc5d4becb3e42b6",
    "0x597f299cfc657e2a",
    "0x5fcb6fab3ad6faec",
    "0x6c44198c4a475817"
  ].map((n) => BigInt(n))))();
  var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
  var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
  var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
  var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);

  class SHA512 extends HashMD {
    constructor(outputLen = 64) {
      super(128, outputLen, 16, false);
      this.Ah = SHA512_IV[0] | 0;
      this.Al = SHA512_IV[1] | 0;
      this.Bh = SHA512_IV[2] | 0;
      this.Bl = SHA512_IV[3] | 0;
      this.Ch = SHA512_IV[4] | 0;
      this.Cl = SHA512_IV[5] | 0;
      this.Dh = SHA512_IV[6] | 0;
      this.Dl = SHA512_IV[7] | 0;
      this.Eh = SHA512_IV[8] | 0;
      this.El = SHA512_IV[9] | 0;
      this.Fh = SHA512_IV[10] | 0;
      this.Fl = SHA512_IV[11] | 0;
      this.Gh = SHA512_IV[12] | 0;
      this.Gl = SHA512_IV[13] | 0;
      this.Hh = SHA512_IV[14] | 0;
      this.Hl = SHA512_IV[15] | 0;
    }
    get() {
      const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
      return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
    }
    set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
      this.Ah = Ah | 0;
      this.Al = Al | 0;
      this.Bh = Bh | 0;
      this.Bl = Bl | 0;
      this.Ch = Ch | 0;
      this.Cl = Cl | 0;
      this.Dh = Dh | 0;
      this.Dl = Dl | 0;
      this.Eh = Eh | 0;
      this.El = El | 0;
      this.Fh = Fh | 0;
      this.Fl = Fl | 0;
      this.Gh = Gh | 0;
      this.Gl = Gl | 0;
      this.Hh = Hh | 0;
      this.Hl = Hl | 0;
    }
    process(view, offset) {
      for (let i2 = 0;i2 < 16; i2++, offset += 4) {
        SHA512_W_H[i2] = view.getUint32(offset);
        SHA512_W_L[i2] = view.getUint32(offset += 4);
      }
      for (let i2 = 16;i2 < 80; i2++) {
        const W15h = SHA512_W_H[i2 - 15] | 0;
        const W15l = SHA512_W_L[i2 - 15] | 0;
        const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
        const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
        const W2h = SHA512_W_H[i2 - 2] | 0;
        const W2l = SHA512_W_L[i2 - 2] | 0;
        const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
        const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
        const SUMl = add4L(s0l, s1l, SHA512_W_L[i2 - 7], SHA512_W_L[i2 - 16]);
        const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i2 - 7], SHA512_W_H[i2 - 16]);
        SHA512_W_H[i2] = SUMh | 0;
        SHA512_W_L[i2] = SUMl | 0;
      }
      let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
      for (let i2 = 0;i2 < 80; i2++) {
        const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
        const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
        const CHIh = Eh & Fh ^ ~Eh & Gh;
        const CHIl = El & Fl ^ ~El & Gl;
        const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i2], SHA512_W_L[i2]);
        const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i2], SHA512_W_H[i2]);
        const T1l = T1ll | 0;
        const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
        const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
        const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
        const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
        Hh = Gh | 0;
        Hl = Gl | 0;
        Gh = Fh | 0;
        Gl = Fl | 0;
        Fh = Eh | 0;
        Fl = El | 0;
        ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
        Dh = Ch | 0;
        Dl = Cl | 0;
        Ch = Bh | 0;
        Cl = Bl | 0;
        Bh = Ah | 0;
        Bl = Al | 0;
        const All = add3L(T1l, sigma0l, MAJl);
        Ah = add3H(All, T1h, sigma0h, MAJh);
        Al = All | 0;
      }
      ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
      ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
      ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
      ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
      ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
      ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
      ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
      ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
      this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
    }
    roundClean() {
      clean(SHA512_W_H, SHA512_W_L);
    }
    destroy() {
      clean(this.buffer);
      this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  }
  var sha256 = /* @__PURE__ */ createHasher(() => new SHA256);
  var sha512 = /* @__PURE__ */ createHasher(() => new SHA512);

  // node_modules/@noble/curves/esm/utils.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var _0n = /* @__PURE__ */ BigInt(0);
  var _1n = /* @__PURE__ */ BigInt(1);
  function _abool2(value, title = "") {
    if (typeof value !== "boolean") {
      const prefix = title && `"${title}"`;
      throw new Error(prefix + "expected boolean, got type=" + typeof value);
    }
    return value;
  }
  function _abytes2(value, length, title = "") {
    const bytes = isBytes(value);
    const len2 = value?.length;
    const needsLen = length !== undefined;
    if (!bytes || needsLen && len2 !== length) {
      const prefix = title && `"${title}" `;
      const ofLen = needsLen ? ` of length ${length}` : "";
      const got = bytes ? `length=${len2}` : `type=${typeof value}`;
      throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
    }
    return value;
  }
  function numberToHexUnpadded(num) {
    const hex = num.toString(16);
    return hex.length & 1 ? "0" + hex : hex;
  }
  function hexToNumber(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    return hex === "" ? _0n : BigInt("0x" + hex);
  }
  function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
  }
  function bytesToNumberLE(bytes) {
    abytes(bytes);
    return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
  }
  function numberToBytesBE(n, len2) {
    return hexToBytes(n.toString(16).padStart(len2 * 2, "0"));
  }
  function numberToBytesLE(n, len2) {
    return numberToBytesBE(n, len2).reverse();
  }
  function ensureBytes(title, hex, expectedLength) {
    let res;
    if (typeof hex === "string") {
      try {
        res = hexToBytes(hex);
      } catch (e) {
        throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
      }
    } else if (isBytes(hex)) {
      res = Uint8Array.from(hex);
    } else {
      throw new Error(title + " must be hex string or Uint8Array");
    }
    const len2 = res.length;
    if (typeof expectedLength === "number" && len2 !== expectedLength)
      throw new Error(title + " of length " + expectedLength + " expected, got " + len2);
    return res;
  }
  function equalBytes(a, b) {
    if (a.length !== b.length)
      return false;
    let diff = 0;
    for (let i2 = 0;i2 < a.length; i2++)
      diff |= a[i2] ^ b[i2];
    return diff === 0;
  }
  function copyBytes(bytes) {
    return Uint8Array.from(bytes);
  }
  var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
  function inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
  }
  function aInRange(title, n, min, max) {
    if (!inRange(n, min, max))
      throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
  }
  function bitLen(n) {
    let len2;
    for (len2 = 0;n > _0n; n >>= _1n, len2 += 1)
      ;
    return len2;
  }
  var bitMask = (n) => (_1n << BigInt(n)) - _1n;
  function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== "number" || hashLen < 2)
      throw new Error("hashLen must be a number");
    if (typeof qByteLen !== "number" || qByteLen < 2)
      throw new Error("qByteLen must be a number");
    if (typeof hmacFn !== "function")
      throw new Error("hmacFn must be a function");
    const u8n = (len2) => new Uint8Array(len2);
    const u8of = (byte) => Uint8Array.of(byte);
    let v = u8n(hashLen);
    let k = u8n(hashLen);
    let i2 = 0;
    const reset = () => {
      v.fill(1);
      k.fill(0);
      i2 = 0;
    };
    const h = (...b) => hmacFn(k, v, ...b);
    const reseed = (seed = u8n(0)) => {
      k = h(u8of(0), seed);
      v = h();
      if (seed.length === 0)
        return;
      k = h(u8of(1), seed);
      v = h();
    };
    const gen = () => {
      if (i2++ >= 1000)
        throw new Error("drbg: tried 1000 values");
      let len2 = 0;
      const out = [];
      while (len2 < qByteLen) {
        v = h();
        const sl = v.slice();
        out.push(sl);
        len2 += v.length;
      }
      return concatBytes(...out);
    };
    const genUntil = (seed, pred) => {
      reset();
      reseed(seed);
      let res = undefined;
      while (!(res = pred(gen())))
        reseed();
      reset();
      return res;
    };
    return genUntil;
  }
  function _validateObject(object, fields, optFields = {}) {
    if (!object || typeof object !== "object")
      throw new Error("expected valid options object");
    function checkField(fieldName, expectedType, isOpt) {
      const val = object[fieldName];
      if (isOpt && val === undefined)
        return;
      const current = typeof val;
      if (current !== expectedType || val === null)
        throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
    }
    Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
    Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
  }
  var notImplemented = () => {
    throw new Error("not implemented");
  };
  function memoized(fn) {
    const map = new WeakMap;
    return (arg, ...args) => {
      const val = map.get(arg);
      if (val !== undefined)
        return val;
      const computed = fn(arg, ...args);
      map.set(arg, computed);
      return computed;
    };
  }

  // node_modules/@noble/curves/esm/abstract/modular.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var _0n2 = BigInt(0);
  var _1n2 = BigInt(1);
  var _2n = /* @__PURE__ */ BigInt(2);
  var _3n = /* @__PURE__ */ BigInt(3);
  var _4n = /* @__PURE__ */ BigInt(4);
  var _5n = /* @__PURE__ */ BigInt(5);
  var _7n = /* @__PURE__ */ BigInt(7);
  var _8n = /* @__PURE__ */ BigInt(8);
  var _9n = /* @__PURE__ */ BigInt(9);
  var _16n = /* @__PURE__ */ BigInt(16);
  function mod(a, b) {
    const result = a % b;
    return result >= _0n2 ? result : b + result;
  }
  function pow2(x, power, modulo) {
    let res = x;
    while (power-- > _0n2) {
      res *= res;
      res %= modulo;
    }
    return res;
  }
  function invert(number, modulo) {
    if (number === _0n2)
      throw new Error("invert: expected non-zero number");
    if (modulo <= _0n2)
      throw new Error("invert: expected positive modulus, got " + modulo);
    let a = mod(number, modulo);
    let b = modulo;
    let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
    while (a !== _0n2) {
      const q = b / a;
      const r = b % a;
      const m = x - u * q;
      const n = y - v * q;
      b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n2)
      throw new Error("invert: does not exist");
    return mod(x, modulo);
  }
  function assertIsSquare(Fp, root, n) {
    if (!Fp.eql(Fp.sqr(root), n))
      throw new Error("Cannot find square root");
  }
  function sqrt3mod4(Fp, n) {
    const p1div4 = (Fp.ORDER + _1n2) / _4n;
    const root = Fp.pow(n, p1div4);
    assertIsSquare(Fp, root, n);
    return root;
  }
  function sqrt5mod8(Fp, n) {
    const p5div8 = (Fp.ORDER - _5n) / _8n;
    const n2 = Fp.mul(n, _2n);
    const v = Fp.pow(n2, p5div8);
    const nv = Fp.mul(n, v);
    const i2 = Fp.mul(Fp.mul(nv, _2n), v);
    const root = Fp.mul(nv, Fp.sub(i2, Fp.ONE));
    assertIsSquare(Fp, root, n);
    return root;
  }
  function sqrt9mod16(P) {
    const Fp_ = Field(P);
    const tn = tonelliShanks(P);
    const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
    const c2 = tn(Fp_, c1);
    const c3 = tn(Fp_, Fp_.neg(c1));
    const c4 = (P + _7n) / _16n;
    return (Fp, n) => {
      let tv1 = Fp.pow(n, c4);
      let tv2 = Fp.mul(tv1, c1);
      const tv3 = Fp.mul(tv1, c2);
      const tv4 = Fp.mul(tv1, c3);
      const e1 = Fp.eql(Fp.sqr(tv2), n);
      const e2 = Fp.eql(Fp.sqr(tv3), n);
      tv1 = Fp.cmov(tv1, tv2, e1);
      tv2 = Fp.cmov(tv4, tv3, e2);
      const e3 = Fp.eql(Fp.sqr(tv2), n);
      const root = Fp.cmov(tv1, tv2, e3);
      assertIsSquare(Fp, root, n);
      return root;
    };
  }
  function tonelliShanks(P) {
    if (P < _3n)
      throw new Error("sqrt is not defined for small field");
    let Q = P - _1n2;
    let S = 0;
    while (Q % _2n === _0n2) {
      Q /= _2n;
      S++;
    }
    let Z = _2n;
    const _Fp = Field(P);
    while (FpLegendre(_Fp, Z) === 1) {
      if (Z++ > 1000)
        throw new Error("Cannot find square root: probably non-prime P");
    }
    if (S === 1)
      return sqrt3mod4;
    let cc = _Fp.pow(Z, Q);
    const Q1div2 = (Q + _1n2) / _2n;
    return function tonelliSlow(Fp, n) {
      if (Fp.is0(n))
        return n;
      if (FpLegendre(Fp, n) !== 1)
        throw new Error("Cannot find square root");
      let M = S;
      let c = Fp.mul(Fp.ONE, cc);
      let t = Fp.pow(n, Q);
      let R = Fp.pow(n, Q1div2);
      while (!Fp.eql(t, Fp.ONE)) {
        if (Fp.is0(t))
          return Fp.ZERO;
        let i2 = 1;
        let t_tmp = Fp.sqr(t);
        while (!Fp.eql(t_tmp, Fp.ONE)) {
          i2++;
          t_tmp = Fp.sqr(t_tmp);
          if (i2 === M)
            throw new Error("Cannot find square root");
        }
        const exponent = _1n2 << BigInt(M - i2 - 1);
        const b = Fp.pow(c, exponent);
        M = i2;
        c = Fp.sqr(b);
        t = Fp.mul(t, c);
        R = Fp.mul(R, b);
      }
      return R;
    };
  }
  function FpSqrt(P) {
    if (P % _4n === _3n)
      return sqrt3mod4;
    if (P % _8n === _5n)
      return sqrt5mod8;
    if (P % _16n === _9n)
      return sqrt9mod16(P);
    return tonelliShanks(P);
  }
  var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n2) === _1n2;
  var FIELD_FIELDS = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
  function validateField(field) {
    const initial = {
      ORDER: "bigint",
      MASK: "bigint",
      BYTES: "number",
      BITS: "number"
    };
    const opts = FIELD_FIELDS.reduce((map, val) => {
      map[val] = "function";
      return map;
    }, initial);
    _validateObject(field, opts);
    return field;
  }
  function FpPow(Fp, num, power) {
    if (power < _0n2)
      throw new Error("invalid exponent, negatives unsupported");
    if (power === _0n2)
      return Fp.ONE;
    if (power === _1n2)
      return num;
    let p = Fp.ONE;
    let d = num;
    while (power > _0n2) {
      if (power & _1n2)
        p = Fp.mul(p, d);
      d = Fp.sqr(d);
      power >>= _1n2;
    }
    return p;
  }
  function FpInvertBatch(Fp, nums, passZero = false) {
    const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : undefined);
    const multipliedAcc = nums.reduce((acc, num, i2) => {
      if (Fp.is0(num))
        return acc;
      inverted[i2] = acc;
      return Fp.mul(acc, num);
    }, Fp.ONE);
    const invertedAcc = Fp.inv(multipliedAcc);
    nums.reduceRight((acc, num, i2) => {
      if (Fp.is0(num))
        return acc;
      inverted[i2] = Fp.mul(acc, inverted[i2]);
      return Fp.mul(acc, num);
    }, invertedAcc);
    return inverted;
  }
  function FpLegendre(Fp, n) {
    const p1mod2 = (Fp.ORDER - _1n2) / _2n;
    const powered = Fp.pow(n, p1mod2);
    const yes = Fp.eql(powered, Fp.ONE);
    const zero = Fp.eql(powered, Fp.ZERO);
    const no = Fp.eql(powered, Fp.neg(Fp.ONE));
    if (!yes && !zero && !no)
      throw new Error("invalid Legendre symbol result");
    return yes ? 1 : zero ? 0 : -1;
  }
  function nLength(n, nBitLength) {
    if (nBitLength !== undefined)
      anumber(nBitLength);
    const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
  }
  function Field(ORDER, bitLenOrOpts, isLE2 = false, opts = {}) {
    if (ORDER <= _0n2)
      throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
    let _nbitLength = undefined;
    let _sqrt = undefined;
    let modFromBytes = false;
    let allowedLengths = undefined;
    if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
      if (opts.sqrt || isLE2)
        throw new Error("cannot specify opts in two arguments");
      const _opts = bitLenOrOpts;
      if (_opts.BITS)
        _nbitLength = _opts.BITS;
      if (_opts.sqrt)
        _sqrt = _opts.sqrt;
      if (typeof _opts.isLE === "boolean")
        isLE2 = _opts.isLE;
      if (typeof _opts.modFromBytes === "boolean")
        modFromBytes = _opts.modFromBytes;
      allowedLengths = _opts.allowedLengths;
    } else {
      if (typeof bitLenOrOpts === "number")
        _nbitLength = bitLenOrOpts;
      if (opts.sqrt)
        _sqrt = opts.sqrt;
    }
    const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
    if (BYTES > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    let sqrtP;
    const f = Object.freeze({
      ORDER,
      isLE: isLE2,
      BITS,
      BYTES,
      MASK: bitMask(BITS),
      ZERO: _0n2,
      ONE: _1n2,
      allowedLengths,
      create: (num) => mod(num, ORDER),
      isValid: (num) => {
        if (typeof num !== "bigint")
          throw new Error("invalid field element: expected bigint, got " + typeof num);
        return _0n2 <= num && num < ORDER;
      },
      is0: (num) => num === _0n2,
      isValidNot0: (num) => !f.is0(num) && f.isValid(num),
      isOdd: (num) => (num & _1n2) === _1n2,
      neg: (num) => mod(-num, ORDER),
      eql: (lhs, rhs) => lhs === rhs,
      sqr: (num) => mod(num * num, ORDER),
      add: (lhs, rhs) => mod(lhs + rhs, ORDER),
      sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
      mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
      pow: (num, power) => FpPow(f, num, power),
      div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
      sqrN: (num) => num * num,
      addN: (lhs, rhs) => lhs + rhs,
      subN: (lhs, rhs) => lhs - rhs,
      mulN: (lhs, rhs) => lhs * rhs,
      inv: (num) => invert(num, ORDER),
      sqrt: _sqrt || ((n) => {
        if (!sqrtP)
          sqrtP = FpSqrt(ORDER);
        return sqrtP(f, n);
      }),
      toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
      fromBytes: (bytes, skipValidation = true) => {
        if (allowedLengths) {
          if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
            throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
          }
          const padded = new Uint8Array(BYTES);
          padded.set(bytes, isLE2 ? 0 : padded.length - bytes.length);
          bytes = padded;
        }
        if (bytes.length !== BYTES)
          throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
        let scalar = isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
        if (modFromBytes)
          scalar = mod(scalar, ORDER);
        if (!skipValidation) {
          if (!f.isValid(scalar))
            throw new Error("invalid field element: outside of range 0..ORDER");
        }
        return scalar;
      },
      invertBatch: (lst) => FpInvertBatch(f, lst),
      cmov: (a, b, c) => c ? b : a
    });
    return Object.freeze(f);
  }
  function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== "bigint")
      throw new Error("field order must be bigint");
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
  }
  function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
  }
  function mapHashToField(key, fieldOrder, isLE2 = false) {
    const len2 = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = getMinHashLength(fieldOrder);
    if (len2 < 16 || len2 < minLen || len2 > 1024)
      throw new Error("expected " + minLen + "-1024 bytes of input, got " + len2);
    const num = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
    const reduced = mod(num, fieldOrder - _1n2) + _1n2;
    return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
  }

  // node_modules/@noble/curves/esm/abstract/curve.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var _0n3 = BigInt(0);
  var _1n3 = BigInt(1);
  function negateCt(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
  }
  function normalizeZ(c, points) {
    const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
    return points.map((p, i2) => c.fromAffine(p.toAffine(invertedZs[i2])));
  }
  function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
      throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
  }
  function calcWOpts(W, scalarBits) {
    validateW(W, scalarBits);
    const windows = Math.ceil(scalarBits / W) + 1;
    const windowSize = 2 ** (W - 1);
    const maxNumber = 2 ** W;
    const mask = bitMask(W);
    const shiftBy = BigInt(W);
    return { windows, windowSize, mask, maxNumber, shiftBy };
  }
  function calcOffsets(n, window2, wOpts) {
    const { windowSize, mask, maxNumber, shiftBy } = wOpts;
    let wbits = Number(n & mask);
    let nextN = n >> shiftBy;
    if (wbits > windowSize) {
      wbits -= maxNumber;
      nextN += _1n3;
    }
    const offsetStart = window2 * windowSize;
    const offset = offsetStart + Math.abs(wbits) - 1;
    const isZero = wbits === 0;
    const isNeg = wbits < 0;
    const isNegF = window2 % 2 !== 0;
    const offsetF = offsetStart;
    return { nextN, offset, isZero, isNeg, isNegF, offsetF };
  }
  function validateMSMPoints(points, c) {
    if (!Array.isArray(points))
      throw new Error("array expected");
    points.forEach((p, i2) => {
      if (!(p instanceof c))
        throw new Error("invalid point at index " + i2);
    });
  }
  function validateMSMScalars(scalars, field) {
    if (!Array.isArray(scalars))
      throw new Error("array of scalars expected");
    scalars.forEach((s, i2) => {
      if (!field.isValid(s))
        throw new Error("invalid scalar at index " + i2);
    });
  }
  var pointPrecomputes = new WeakMap;
  var pointWindowSizes = new WeakMap;
  function getW(P) {
    return pointWindowSizes.get(P) || 1;
  }
  function assert0(n) {
    if (n !== _0n3)
      throw new Error("invalid wNAF");
  }

  class wNAF {
    constructor(Point, bits) {
      this.BASE = Point.BASE;
      this.ZERO = Point.ZERO;
      this.Fn = Point.Fn;
      this.bits = bits;
    }
    _unsafeLadder(elm, n, p = this.ZERO) {
      let d = elm;
      while (n > _0n3) {
        if (n & _1n3)
          p = p.add(d);
        d = d.double();
        n >>= _1n3;
      }
      return p;
    }
    precomputeWindow(point, W) {
      const { windows, windowSize } = calcWOpts(W, this.bits);
      const points = [];
      let p = point;
      let base = p;
      for (let window2 = 0;window2 < windows; window2++) {
        base = p;
        points.push(base);
        for (let i2 = 1;i2 < windowSize; i2++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    }
    wNAF(W, precomputes, n) {
      if (!this.Fn.isValid(n))
        throw new Error("invalid scalar");
      let p = this.ZERO;
      let f = this.BASE;
      const wo = calcWOpts(W, this.bits);
      for (let window2 = 0;window2 < wo.windows; window2++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          f = f.add(negateCt(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(negateCt(isNeg, precomputes[offset]));
        }
      }
      assert0(n);
      return { p, f };
    }
    wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
      const wo = calcWOpts(W, this.bits);
      for (let window2 = 0;window2 < wo.windows; window2++) {
        if (n === _0n3)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      assert0(n);
      return acc;
    }
    getPrecomputes(W, point, transform) {
      let comp = pointPrecomputes.get(point);
      if (!comp) {
        comp = this.precomputeWindow(point, W);
        if (W !== 1) {
          if (typeof transform === "function")
            comp = transform(comp);
          pointPrecomputes.set(point, comp);
        }
      }
      return comp;
    }
    cached(point, scalar, transform) {
      const W = getW(point);
      return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
    }
    unsafe(point, scalar, transform, prev) {
      const W = getW(point);
      if (W === 1)
        return this._unsafeLadder(point, scalar, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
    }
    createCache(P, W) {
      validateW(W, this.bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
    hasCache(elm) {
      return getW(elm) !== 1;
    }
  }
  function mulEndoUnsafe(Point, point, k1, k2) {
    let acc = point;
    let p1 = Point.ZERO;
    let p2 = Point.ZERO;
    while (k1 > _0n3 || k2 > _0n3) {
      if (k1 & _1n3)
        p1 = p1.add(acc);
      if (k2 & _1n3)
        p2 = p2.add(acc);
      acc = acc.double();
      k1 >>= _1n3;
      k2 >>= _1n3;
    }
    return { p1, p2 };
  }
  function pippenger(c, fieldN, points, scalars) {
    validateMSMPoints(points, c);
    validateMSMScalars(scalars, fieldN);
    const plength = points.length;
    const slength = scalars.length;
    if (plength !== slength)
      throw new Error("arrays of points and scalars must have equal length");
    const zero = c.ZERO;
    const wbits = bitLen(BigInt(plength));
    let windowSize = 1;
    if (wbits > 12)
      windowSize = wbits - 3;
    else if (wbits > 4)
      windowSize = wbits - 2;
    else if (wbits > 0)
      windowSize = 2;
    const MASK = bitMask(windowSize);
    const buckets = new Array(Number(MASK) + 1).fill(zero);
    const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
    let sum = zero;
    for (let i2 = lastBits;i2 >= 0; i2 -= windowSize) {
      buckets.fill(zero);
      for (let j = 0;j < slength; j++) {
        const scalar = scalars[j];
        const wbits2 = Number(scalar >> BigInt(i2) & MASK);
        buckets[wbits2] = buckets[wbits2].add(points[j]);
      }
      let resI = zero;
      for (let j = buckets.length - 1, sumI = zero;j > 0; j--) {
        sumI = sumI.add(buckets[j]);
        resI = resI.add(sumI);
      }
      sum = sum.add(resI);
      if (i2 !== 0)
        for (let j = 0;j < windowSize; j++)
          sum = sum.double();
    }
    return sum;
  }
  function createField(order, field, isLE2) {
    if (field) {
      if (field.ORDER !== order)
        throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
      validateField(field);
      return field;
    } else {
      return Field(order, { isLE: isLE2 });
    }
  }
  function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
    if (FpFnLE === undefined)
      FpFnLE = type === "edwards";
    if (!CURVE || typeof CURVE !== "object")
      throw new Error(`expected valid ${type} CURVE object`);
    for (const p of ["p", "n", "h"]) {
      const val = CURVE[p];
      if (!(typeof val === "bigint" && val > _0n3))
        throw new Error(`CURVE.${p} must be positive bigint`);
    }
    const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
    const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
    const _b = type === "weierstrass" ? "b" : "d";
    const params = ["Gx", "Gy", "a", _b];
    for (const p of params) {
      if (!Fp.isValid(CURVE[p]))
        throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
    }
    CURVE = Object.freeze(Object.assign({}, CURVE));
    return { CURVE, Fp, Fn };
  }

  // node_modules/@noble/curves/esm/abstract/edwards.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var _0n4 = BigInt(0);
  var _1n4 = BigInt(1);
  var _2n2 = BigInt(2);
  var _8n2 = BigInt(8);
  function isEdValidXY(Fp, CURVE, x, y) {
    const x2 = Fp.sqr(x);
    const y2 = Fp.sqr(y);
    const left = Fp.add(Fp.mul(CURVE.a, x2), y2);
    const right = Fp.add(Fp.ONE, Fp.mul(CURVE.d, Fp.mul(x2, y2)));
    return Fp.eql(left, right);
  }
  function edwards(params, extraOpts = {}) {
    const validated = _createCurveFields("edwards", params, extraOpts, extraOpts.FpFnLE);
    const { Fp, Fn } = validated;
    let CURVE = validated.CURVE;
    const { h: cofactor } = CURVE;
    _validateObject(extraOpts, {}, { uvRatio: "function" });
    const MASK = _2n2 << BigInt(Fn.BYTES * 8) - _1n4;
    const modP = (n) => Fp.create(n);
    const uvRatio = extraOpts.uvRatio || ((u, v) => {
      try {
        return { isValid: true, value: Fp.sqrt(Fp.div(u, v)) };
      } catch (e) {
        return { isValid: false, value: _0n4 };
      }
    });
    if (!isEdValidXY(Fp, CURVE, CURVE.Gx, CURVE.Gy))
      throw new Error("bad curve params: generator point");
    function acoord(title, n, banZero = false) {
      const min = banZero ? _1n4 : _0n4;
      aInRange("coordinate " + title, n, min, MASK);
      return n;
    }
    function aextpoint(other) {
      if (!(other instanceof Point))
        throw new Error("ExtendedPoint expected");
    }
    const toAffineMemo = memoized((p, iz) => {
      const { X, Y, Z } = p;
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? _8n2 : Fp.inv(Z);
      const x = modP(X * iz);
      const y = modP(Y * iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: _0n4, y: _1n4 };
      if (zz !== _1n4)
        throw new Error("invZ was invalid");
      return { x, y };
    });
    const assertValidMemo = memoized((p) => {
      const { a, d } = CURVE;
      if (p.is0())
        throw new Error("bad point: ZERO");
      const { X, Y, Z, T } = p;
      const X2 = modP(X * X);
      const Y2 = modP(Y * Y);
      const Z2 = modP(Z * Z);
      const Z4 = modP(Z2 * Z2);
      const aX2 = modP(X2 * a);
      const left = modP(Z2 * modP(aX2 + Y2));
      const right = modP(Z4 + modP(d * modP(X2 * Y2)));
      if (left !== right)
        throw new Error("bad point: equation left != right (1)");
      const XY = modP(X * Y);
      const ZT = modP(Z * T);
      if (XY !== ZT)
        throw new Error("bad point: equation left != right (2)");
      return true;
    });

    class Point {
      constructor(X, Y, Z, T) {
        this.X = acoord("x", X);
        this.Y = acoord("y", Y);
        this.Z = acoord("z", Z, true);
        this.T = acoord("t", T);
        Object.freeze(this);
      }
      static CURVE() {
        return CURVE;
      }
      static fromAffine(p) {
        if (p instanceof Point)
          throw new Error("extended point not allowed");
        const { x, y } = p || {};
        acoord("x", x);
        acoord("y", y);
        return new Point(x, y, _1n4, modP(x * y));
      }
      static fromBytes(bytes, zip215 = false) {
        const len2 = Fp.BYTES;
        const { a, d } = CURVE;
        bytes = copyBytes(_abytes2(bytes, len2, "point"));
        _abool2(zip215, "zip215");
        const normed = copyBytes(bytes);
        const lastByte = bytes[len2 - 1];
        normed[len2 - 1] = lastByte & ~128;
        const y = bytesToNumberLE(normed);
        const max = zip215 ? MASK : Fp.ORDER;
        aInRange("point.y", y, _0n4, max);
        const y2 = modP(y * y);
        const u = modP(y2 - _1n4);
        const v = modP(d * y2 - a);
        let { isValid, value: x } = uvRatio(u, v);
        if (!isValid)
          throw new Error("bad point: invalid y coordinate");
        const isXOdd = (x & _1n4) === _1n4;
        const isLastByteOdd = (lastByte & 128) !== 0;
        if (!zip215 && x === _0n4 && isLastByteOdd)
          throw new Error("bad point: x=0 and x_0=1");
        if (isLastByteOdd !== isXOdd)
          x = modP(-x);
        return Point.fromAffine({ x, y });
      }
      static fromHex(bytes, zip215 = false) {
        return Point.fromBytes(ensureBytes("point", bytes), zip215);
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      precompute(windowSize = 8, isLazy = true) {
        wnaf.createCache(this, windowSize);
        if (!isLazy)
          this.multiply(_2n2);
        return this;
      }
      assertValidity() {
        assertValidMemo(this);
      }
      equals(other) {
        aextpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        const X1Z2 = modP(X1 * Z2);
        const X2Z1 = modP(X2 * Z1);
        const Y1Z2 = modP(Y1 * Z2);
        const Y2Z1 = modP(Y2 * Z1);
        return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
      }
      is0() {
        return this.equals(Point.ZERO);
      }
      negate() {
        return new Point(modP(-this.X), this.Y, this.Z, modP(-this.T));
      }
      double() {
        const { a } = CURVE;
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const A = modP(X1 * X1);
        const B = modP(Y1 * Y1);
        const C = modP(_2n2 * modP(Z1 * Z1));
        const D = modP(a * A);
        const x1y1 = X1 + Y1;
        const E2 = modP(modP(x1y1 * x1y1) - A - B);
        const G = D + B;
        const F = G - C;
        const H = D - B;
        const X3 = modP(E2 * F);
        const Y3 = modP(G * H);
        const T3 = modP(E2 * H);
        const Z3 = modP(F * G);
        return new Point(X3, Y3, Z3, T3);
      }
      add(other) {
        aextpoint(other);
        const { a, d } = CURVE;
        const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
        const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
        const A = modP(X1 * X2);
        const B = modP(Y1 * Y2);
        const C = modP(T1 * d * T2);
        const D = modP(Z1 * Z2);
        const E2 = modP((X1 + Y1) * (X2 + Y2) - A - B);
        const F = D - C;
        const G = D + C;
        const H = modP(B - a * A);
        const X3 = modP(E2 * F);
        const Y3 = modP(G * H);
        const T3 = modP(E2 * H);
        const Z3 = modP(F * G);
        return new Point(X3, Y3, Z3, T3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      multiply(scalar) {
        if (!Fn.isValidNot0(scalar))
          throw new Error("invalid scalar: expected 1 <= sc < curve.n");
        const { p, f } = wnaf.cached(this, scalar, (p2) => normalizeZ(Point, p2));
        return normalizeZ(Point, [p, f])[0];
      }
      multiplyUnsafe(scalar, acc = Point.ZERO) {
        if (!Fn.isValid(scalar))
          throw new Error("invalid scalar: expected 0 <= sc < curve.n");
        if (scalar === _0n4)
          return Point.ZERO;
        if (this.is0() || scalar === _1n4)
          return this;
        return wnaf.unsafe(this, scalar, (p) => normalizeZ(Point, p), acc);
      }
      isSmallOrder() {
        return this.multiplyUnsafe(cofactor).is0();
      }
      isTorsionFree() {
        return wnaf.unsafe(this, CURVE.n).is0();
      }
      toAffine(invertedZ) {
        return toAffineMemo(this, invertedZ);
      }
      clearCofactor() {
        if (cofactor === _1n4)
          return this;
        return this.multiplyUnsafe(cofactor);
      }
      toBytes() {
        const { x, y } = this.toAffine();
        const bytes = Fp.toBytes(y);
        bytes[bytes.length - 1] |= x & _1n4 ? 128 : 0;
        return bytes;
      }
      toHex() {
        return bytesToHex(this.toBytes());
      }
      toString() {
        return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
      }
      get ex() {
        return this.X;
      }
      get ey() {
        return this.Y;
      }
      get ez() {
        return this.Z;
      }
      get et() {
        return this.T;
      }
      static normalizeZ(points) {
        return normalizeZ(Point, points);
      }
      static msm(points, scalars) {
        return pippenger(Point, Fn, points, scalars);
      }
      _setWindowSize(windowSize) {
        this.precompute(windowSize);
      }
      toRawBytes() {
        return this.toBytes();
      }
    }
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy, _1n4, modP(CURVE.Gx * CURVE.Gy));
    Point.ZERO = new Point(_0n4, _1n4, _1n4, _0n4);
    Point.Fp = Fp;
    Point.Fn = Fn;
    const wnaf = new wNAF(Point, Fn.BITS);
    Point.BASE.precompute(8);
    return Point;
  }

  class PrimeEdwardsPoint {
    constructor(ep) {
      this.ep = ep;
    }
    static fromBytes(_bytes) {
      notImplemented();
    }
    static fromHex(_hex) {
      notImplemented();
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    clearCofactor() {
      return this;
    }
    assertValidity() {
      this.ep.assertValidity();
    }
    toAffine(invertedZ) {
      return this.ep.toAffine(invertedZ);
    }
    toHex() {
      return bytesToHex(this.toBytes());
    }
    toString() {
      return this.toHex();
    }
    isTorsionFree() {
      return true;
    }
    isSmallOrder() {
      return false;
    }
    add(other) {
      this.assertSame(other);
      return this.init(this.ep.add(other.ep));
    }
    subtract(other) {
      this.assertSame(other);
      return this.init(this.ep.subtract(other.ep));
    }
    multiply(scalar) {
      return this.init(this.ep.multiply(scalar));
    }
    multiplyUnsafe(scalar) {
      return this.init(this.ep.multiplyUnsafe(scalar));
    }
    double() {
      return this.init(this.ep.double());
    }
    negate() {
      return this.init(this.ep.negate());
    }
    precompute(windowSize, isLazy) {
      return this.init(this.ep.precompute(windowSize, isLazy));
    }
    toRawBytes() {
      return this.toBytes();
    }
  }
  function eddsa(Point, cHash, eddsaOpts = {}) {
    if (typeof cHash !== "function")
      throw new Error('"hash" function param is required');
    _validateObject(eddsaOpts, {}, {
      adjustScalarBytes: "function",
      randomBytes: "function",
      domain: "function",
      prehash: "function",
      mapToCurve: "function"
    });
    const { prehash } = eddsaOpts;
    const { BASE, Fp, Fn } = Point;
    const randomBytes2 = eddsaOpts.randomBytes || randomBytes;
    const adjustScalarBytes = eddsaOpts.adjustScalarBytes || ((bytes) => bytes);
    const domain = eddsaOpts.domain || ((data, ctx, phflag) => {
      _abool2(phflag, "phflag");
      if (ctx.length || phflag)
        throw new Error("Contexts/pre-hash are not supported");
      return data;
    });
    function modN_LE(hash) {
      return Fn.create(bytesToNumberLE(hash));
    }
    function getPrivateScalar(key) {
      const len2 = lengths.secretKey;
      key = ensureBytes("private key", key, len2);
      const hashed = ensureBytes("hashed private key", cHash(key), 2 * len2);
      const head = adjustScalarBytes(hashed.slice(0, len2));
      const prefix = hashed.slice(len2, 2 * len2);
      const scalar = modN_LE(head);
      return { head, prefix, scalar };
    }
    function getExtendedPublicKey(secretKey) {
      const { head, prefix, scalar } = getPrivateScalar(secretKey);
      const point = BASE.multiply(scalar);
      const pointBytes = point.toBytes();
      return { head, prefix, scalar, point, pointBytes };
    }
    function getPublicKey(secretKey) {
      return getExtendedPublicKey(secretKey).pointBytes;
    }
    function hashDomainToScalar(context = Uint8Array.of(), ...msgs) {
      const msg = concatBytes(...msgs);
      return modN_LE(cHash(domain(msg, ensureBytes("context", context), !!prehash)));
    }
    function sign(msg, secretKey, options = {}) {
      msg = ensureBytes("message", msg);
      if (prehash)
        msg = prehash(msg);
      const { prefix, scalar, pointBytes } = getExtendedPublicKey(secretKey);
      const r = hashDomainToScalar(options.context, prefix, msg);
      const R = BASE.multiply(r).toBytes();
      const k = hashDomainToScalar(options.context, R, pointBytes, msg);
      const s = Fn.create(r + k * scalar);
      if (!Fn.isValid(s))
        throw new Error("sign failed: invalid s");
      const rs = concatBytes(R, Fn.toBytes(s));
      return _abytes2(rs, lengths.signature, "result");
    }
    const verifyOpts = { zip215: true };
    function verify(sig, msg, publicKey, options = verifyOpts) {
      const { context, zip215 } = options;
      const len2 = lengths.signature;
      sig = ensureBytes("signature", sig, len2);
      msg = ensureBytes("message", msg);
      publicKey = ensureBytes("publicKey", publicKey, lengths.publicKey);
      if (zip215 !== undefined)
        _abool2(zip215, "zip215");
      if (prehash)
        msg = prehash(msg);
      const mid = len2 / 2;
      const r = sig.subarray(0, mid);
      const s = bytesToNumberLE(sig.subarray(mid, len2));
      let A, R, SB;
      try {
        A = Point.fromBytes(publicKey, zip215);
        R = Point.fromBytes(r, zip215);
        SB = BASE.multiplyUnsafe(s);
      } catch (error) {
        return false;
      }
      if (!zip215 && A.isSmallOrder())
        return false;
      const k = hashDomainToScalar(context, R.toBytes(), A.toBytes(), msg);
      const RkA = R.add(A.multiplyUnsafe(k));
      return RkA.subtract(SB).clearCofactor().is0();
    }
    const _size = Fp.BYTES;
    const lengths = {
      secretKey: _size,
      publicKey: _size,
      signature: 2 * _size,
      seed: _size
    };
    function randomSecretKey(seed = randomBytes2(lengths.seed)) {
      return _abytes2(seed, lengths.seed, "seed");
    }
    function keygen(seed) {
      const secretKey = utils.randomSecretKey(seed);
      return { secretKey, publicKey: getPublicKey(secretKey) };
    }
    function isValidSecretKey(key) {
      return isBytes(key) && key.length === Fn.BYTES;
    }
    function isValidPublicKey(key, zip215) {
      try {
        return !!Point.fromBytes(key, zip215);
      } catch (error) {
        return false;
      }
    }
    const utils = {
      getExtendedPublicKey,
      randomSecretKey,
      isValidSecretKey,
      isValidPublicKey,
      toMontgomery(publicKey) {
        const { y } = Point.fromBytes(publicKey);
        const size = lengths.publicKey;
        const is25519 = size === 32;
        if (!is25519 && size !== 57)
          throw new Error("only defined for 25519 and 448");
        const u = is25519 ? Fp.div(_1n4 + y, _1n4 - y) : Fp.div(y - _1n4, y + _1n4);
        return Fp.toBytes(u);
      },
      toMontgomerySecret(secretKey) {
        const size = lengths.secretKey;
        _abytes2(secretKey, size);
        const hashed = cHash(secretKey.subarray(0, size));
        return adjustScalarBytes(hashed).subarray(0, size);
      },
      randomPrivateKey: randomSecretKey,
      precompute(windowSize = 8, point = Point.BASE) {
        return point.precompute(windowSize, false);
      }
    };
    return Object.freeze({
      keygen,
      getPublicKey,
      sign,
      verify,
      utils,
      Point,
      lengths
    });
  }
  function _eddsa_legacy_opts_to_new(c) {
    const CURVE = {
      a: c.a,
      d: c.d,
      p: c.Fp.ORDER,
      n: c.n,
      h: c.h,
      Gx: c.Gx,
      Gy: c.Gy
    };
    const Fp = c.Fp;
    const Fn = Field(CURVE.n, c.nBitLength, true);
    const curveOpts = { Fp, Fn, uvRatio: c.uvRatio };
    const eddsaOpts = {
      randomBytes: c.randomBytes,
      adjustScalarBytes: c.adjustScalarBytes,
      domain: c.domain,
      prehash: c.prehash,
      mapToCurve: c.mapToCurve
    };
    return { CURVE, curveOpts, hash: c.hash, eddsaOpts };
  }
  function _eddsa_new_output_to_legacy(c, eddsa2) {
    const Point = eddsa2.Point;
    const legacy = Object.assign({}, eddsa2, {
      ExtendedPoint: Point,
      CURVE: c,
      nBitLength: Point.Fn.BITS,
      nByteLength: Point.Fn.BYTES
    });
    return legacy;
  }
  function twistedEdwards(c) {
    const { CURVE, curveOpts, hash, eddsaOpts } = _eddsa_legacy_opts_to_new(c);
    const Point = edwards(CURVE, curveOpts);
    const EDDSA = eddsa(Point, hash, eddsaOpts);
    return _eddsa_new_output_to_legacy(c, EDDSA);
  }

  // node_modules/@noble/curves/esm/ed25519.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var _0n5 = /* @__PURE__ */ BigInt(0);
  var _1n5 = BigInt(1);
  var _2n3 = BigInt(2);
  var _3n2 = BigInt(3);
  var _5n2 = BigInt(5);
  var _8n3 = BigInt(8);
  var ed25519_CURVE_p = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
  var ed25519_CURVE = /* @__PURE__ */ (() => ({
    p: ed25519_CURVE_p,
    n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
    h: _8n3,
    a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
    d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
    Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
    Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
  }))();
  function ed25519_pow_2_252_3(x) {
    const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
    const P = ed25519_CURVE_p;
    const x2 = x * x % P;
    const b2 = x2 * x % P;
    const b4 = pow2(b2, _2n3, P) * b2 % P;
    const b5 = pow2(b4, _1n5, P) * x % P;
    const b10 = pow2(b5, _5n2, P) * b5 % P;
    const b20 = pow2(b10, _10n, P) * b10 % P;
    const b40 = pow2(b20, _20n, P) * b20 % P;
    const b80 = pow2(b40, _40n, P) * b40 % P;
    const b160 = pow2(b80, _80n, P) * b80 % P;
    const b240 = pow2(b160, _80n, P) * b80 % P;
    const b250 = pow2(b240, _10n, P) * b10 % P;
    const pow_p_5_8 = pow2(b250, _2n3, P) * x % P;
    return { pow_p_5_8, b2 };
  }
  function adjustScalarBytes(bytes) {
    bytes[0] &= 248;
    bytes[31] &= 127;
    bytes[31] |= 64;
    return bytes;
  }
  var ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
  function uvRatio(u, v) {
    const P = ed25519_CURVE_p;
    const v3 = mod(v * v * v, P);
    const v7 = mod(v3 * v3 * v, P);
    const pow = ed25519_pow_2_252_3(u * v7).pow_p_5_8;
    let x = mod(u * v3 * pow, P);
    const vx2 = mod(v * x * x, P);
    const root1 = x;
    const root2 = mod(x * ED25519_SQRT_M1, P);
    const useRoot1 = vx2 === u;
    const useRoot2 = vx2 === mod(-u, P);
    const noRoot = vx2 === mod(-u * ED25519_SQRT_M1, P);
    if (useRoot1)
      x = root1;
    if (useRoot2 || noRoot)
      x = root2;
    if (isNegativeLE(x, P))
      x = mod(-x, P);
    return { isValid: useRoot1 || useRoot2, value: x };
  }
  var Fp = /* @__PURE__ */ (() => Field(ed25519_CURVE.p, { isLE: true }))();
  var Fn = /* @__PURE__ */ (() => Field(ed25519_CURVE.n, { isLE: true }))();
  var ed25519Defaults = /* @__PURE__ */ (() => ({
    ...ed25519_CURVE,
    Fp,
    hash: sha512,
    adjustScalarBytes,
    uvRatio
  }))();
  var ed25519 = /* @__PURE__ */ (() => twistedEdwards(ed25519Defaults))();
  var SQRT_M1 = ED25519_SQRT_M1;
  var SQRT_AD_MINUS_ONE = /* @__PURE__ */ BigInt("25063068953384623474111414158702152701244531502492656460079210482610430750235");
  var INVSQRT_A_MINUS_D = /* @__PURE__ */ BigInt("54469307008909316920995813868745141605393597292927456921205312896311721017578");
  var ONE_MINUS_D_SQ = /* @__PURE__ */ BigInt("1159843021668779879193775521855586647937357759715417654439879720876111806838");
  var D_MINUS_ONE_SQ = /* @__PURE__ */ BigInt("40440834346308536858101042469323190826248399146238708352240133220865137265952");
  var invertSqrt = (number) => uvRatio(_1n5, number);
  var MAX_255B = /* @__PURE__ */ BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  var bytes255ToNumberLE = (bytes) => ed25519.Point.Fp.create(bytesToNumberLE(bytes) & MAX_255B);
  function calcElligatorRistrettoMap(r0) {
    const { d } = ed25519_CURVE;
    const P = ed25519_CURVE_p;
    const mod2 = (n) => Fp.create(n);
    const r = mod2(SQRT_M1 * r0 * r0);
    const Ns = mod2((r + _1n5) * ONE_MINUS_D_SQ);
    let c = BigInt(-1);
    const D = mod2((c - d * r) * mod2(r + d));
    let { isValid: Ns_D_is_sq, value: s } = uvRatio(Ns, D);
    let s_ = mod2(s * r0);
    if (!isNegativeLE(s_, P))
      s_ = mod2(-s_);
    if (!Ns_D_is_sq)
      s = s_;
    if (!Ns_D_is_sq)
      c = r;
    const Nt = mod2(c * (r - _1n5) * D_MINUS_ONE_SQ - D);
    const s2 = s * s;
    const W0 = mod2((s + s) * D);
    const W1 = mod2(Nt * SQRT_AD_MINUS_ONE);
    const W2 = mod2(_1n5 - s2);
    const W3 = mod2(_1n5 + s2);
    return new ed25519.Point(mod2(W0 * W3), mod2(W2 * W1), mod2(W1 * W3), mod2(W0 * W2));
  }
  function ristretto255_map(bytes) {
    abytes(bytes, 64);
    const r1 = bytes255ToNumberLE(bytes.subarray(0, 32));
    const R1 = calcElligatorRistrettoMap(r1);
    const r2 = bytes255ToNumberLE(bytes.subarray(32, 64));
    const R2 = calcElligatorRistrettoMap(r2);
    return new _RistrettoPoint(R1.add(R2));
  }

  class _RistrettoPoint extends PrimeEdwardsPoint {
    constructor(ep) {
      super(ep);
    }
    static fromAffine(ap) {
      return new _RistrettoPoint(ed25519.Point.fromAffine(ap));
    }
    assertSame(other) {
      if (!(other instanceof _RistrettoPoint))
        throw new Error("RistrettoPoint expected");
    }
    init(ep) {
      return new _RistrettoPoint(ep);
    }
    static hashToCurve(hex) {
      return ristretto255_map(ensureBytes("ristrettoHash", hex, 64));
    }
    static fromBytes(bytes) {
      abytes(bytes, 32);
      const { a, d } = ed25519_CURVE;
      const P = ed25519_CURVE_p;
      const mod2 = (n) => Fp.create(n);
      const s = bytes255ToNumberLE(bytes);
      if (!equalBytes(Fp.toBytes(s), bytes) || isNegativeLE(s, P))
        throw new Error("invalid ristretto255 encoding 1");
      const s2 = mod2(s * s);
      const u1 = mod2(_1n5 + a * s2);
      const u2 = mod2(_1n5 - a * s2);
      const u1_2 = mod2(u1 * u1);
      const u2_2 = mod2(u2 * u2);
      const v = mod2(a * d * u1_2 - u2_2);
      const { isValid, value: I } = invertSqrt(mod2(v * u2_2));
      const Dx = mod2(I * u2);
      const Dy = mod2(I * Dx * v);
      let x = mod2((s + s) * Dx);
      if (isNegativeLE(x, P))
        x = mod2(-x);
      const y = mod2(u1 * Dy);
      const t = mod2(x * y);
      if (!isValid || isNegativeLE(t, P) || y === _0n5)
        throw new Error("invalid ristretto255 encoding 2");
      return new _RistrettoPoint(new ed25519.Point(x, y, _1n5, t));
    }
    static fromHex(hex) {
      return _RistrettoPoint.fromBytes(ensureBytes("ristrettoHex", hex, 32));
    }
    static msm(points, scalars) {
      return pippenger(_RistrettoPoint, ed25519.Point.Fn, points, scalars);
    }
    toBytes() {
      let { X, Y, Z, T } = this.ep;
      const P = ed25519_CURVE_p;
      const mod2 = (n) => Fp.create(n);
      const u1 = mod2(mod2(Z + Y) * mod2(Z - Y));
      const u2 = mod2(X * Y);
      const u2sq = mod2(u2 * u2);
      const { value: invsqrt } = invertSqrt(mod2(u1 * u2sq));
      const D1 = mod2(invsqrt * u1);
      const D2 = mod2(invsqrt * u2);
      const zInv = mod2(D1 * D2 * T);
      let D;
      if (isNegativeLE(T * zInv, P)) {
        let _x = mod2(Y * SQRT_M1);
        let _y = mod2(X * SQRT_M1);
        X = _x;
        Y = _y;
        D = mod2(D1 * INVSQRT_A_MINUS_D);
      } else {
        D = D2;
      }
      if (isNegativeLE(X * zInv, P))
        Y = mod2(-Y);
      let s = mod2((Z - Y) * D);
      if (isNegativeLE(s, P))
        s = mod2(-s);
      return Fp.toBytes(s);
    }
    equals(other) {
      this.assertSame(other);
      const { X: X1, Y: Y1 } = this.ep;
      const { X: X2, Y: Y2 } = other.ep;
      const mod2 = (n) => Fp.create(n);
      const one = mod2(X1 * Y2) === mod2(Y1 * X2);
      const two = mod2(Y1 * Y2) === mod2(X1 * X2);
      return one || two;
    }
    is0() {
      return this.equals(_RistrettoPoint.ZERO);
    }
  }
  _RistrettoPoint.BASE = /* @__PURE__ */ (() => new _RistrettoPoint(ed25519.Point.BASE))();
  _RistrettoPoint.ZERO = /* @__PURE__ */ (() => new _RistrettoPoint(ed25519.Point.ZERO))();
  _RistrettoPoint.Fp = /* @__PURE__ */ (() => Fp)();
  _RistrettoPoint.Fn = /* @__PURE__ */ (() => Fn)();

  // node_modules/@solana/web3.js/lib/index.browser.esm.js
  var import_bn = __toESM(require_bn(), 1);
  var import_bs58 = __toESM(require_bs58(), 1);

  // node_modules/@noble/hashes/esm/sha256.js
  var sha2562 = sha256;

  // node_modules/@solana/web3.js/lib/index.browser.esm.js
  var import_borsh = __toESM(require_lib(), 1);
  var BufferLayout = __toESM(require_Layout(), 1);
  var import_buffer_layout = __toESM(require_Layout(), 1);
  var import_bigint_buffer = __toESM(require_browser(), 1);

  // node_modules/superstruct/dist/index.mjs
  class StructError extends TypeError {
    constructor(failure, failures) {
      let cached;
      const { message, explanation, ...rest } = failure;
      const { path } = failure;
      const msg = path.length === 0 ? message : `At path: ${path.join(".")} -- ${message}`;
      super(explanation ?? msg);
      if (explanation != null)
        this.cause = msg;
      Object.assign(this, rest);
      this.name = this.constructor.name;
      this.failures = () => {
        return cached ?? (cached = [failure, ...failures()]);
      };
    }
  }
  function isIterable(x) {
    return isObject(x) && typeof x[Symbol.iterator] === "function";
  }
  function isObject(x) {
    return typeof x === "object" && x != null;
  }
  function isNonArrayObject(x) {
    return isObject(x) && !Array.isArray(x);
  }
  function print(value) {
    if (typeof value === "symbol") {
      return value.toString();
    }
    return typeof value === "string" ? JSON.stringify(value) : `${value}`;
  }
  function shiftIterator(input) {
    const { done, value } = input.next();
    return done ? undefined : value;
  }
  function toFailure(result, context, struct, value) {
    if (result === true) {
      return;
    } else if (result === false) {
      result = {};
    } else if (typeof result === "string") {
      result = { message: result };
    }
    const { path, branch } = context;
    const { type } = struct;
    const { refinement, message = `Expected a value of type \`${type}\`${refinement ? ` with refinement \`${refinement}\`` : ""}, but received: \`${print(value)}\`` } = result;
    return {
      value,
      type,
      refinement,
      key: path[path.length - 1],
      path,
      branch,
      ...result,
      message
    };
  }
  function* toFailures(result, context, struct, value) {
    if (!isIterable(result)) {
      result = [result];
    }
    for (const r of result) {
      const failure = toFailure(r, context, struct, value);
      if (failure) {
        yield failure;
      }
    }
  }
  function* run(value, struct, options = {}) {
    const { path = [], branch = [value], coerce = false, mask = false } = options;
    const ctx = { path, branch, mask };
    if (coerce) {
      value = struct.coercer(value, ctx);
    }
    let status = "valid";
    for (const failure of struct.validator(value, ctx)) {
      failure.explanation = options.message;
      status = "not_valid";
      yield [failure, undefined];
    }
    for (let [k, v, s] of struct.entries(value, ctx)) {
      const ts = run(v, s, {
        path: k === undefined ? path : [...path, k],
        branch: k === undefined ? branch : [...branch, v],
        coerce,
        mask,
        message: options.message
      });
      for (const t of ts) {
        if (t[0]) {
          status = t[0].refinement != null ? "not_refined" : "not_valid";
          yield [t[0], undefined];
        } else if (coerce) {
          v = t[1];
          if (k === undefined) {
            value = v;
          } else if (value instanceof Map) {
            value.set(k, v);
          } else if (value instanceof Set) {
            value.add(v);
          } else if (isObject(value)) {
            if (v !== undefined || k in value)
              value[k] = v;
          }
        }
      }
    }
    if (status !== "not_valid") {
      for (const failure of struct.refiner(value, ctx)) {
        failure.explanation = options.message;
        status = "not_refined";
        yield [failure, undefined];
      }
    }
    if (status === "valid") {
      yield [undefined, value];
    }
  }

  class Struct {
    constructor(props) {
      const { type, schema, validator, refiner, coercer = (value) => value, entries = function* () {} } = props;
      this.type = type;
      this.schema = schema;
      this.entries = entries;
      this.coercer = coercer;
      if (validator) {
        this.validator = (value, context) => {
          const result = validator(value, context);
          return toFailures(result, context, this, value);
        };
      } else {
        this.validator = () => [];
      }
      if (refiner) {
        this.refiner = (value, context) => {
          const result = refiner(value, context);
          return toFailures(result, context, this, value);
        };
      } else {
        this.refiner = () => [];
      }
    }
    assert(value, message) {
      return assert(value, this, message);
    }
    create(value, message) {
      return create(value, this, message);
    }
    is(value) {
      return is(value, this);
    }
    mask(value, message) {
      return mask(value, this, message);
    }
    validate(value, options = {}) {
      return validate(value, this, options);
    }
  }
  function assert(value, struct, message) {
    const result = validate(value, struct, { message });
    if (result[0]) {
      throw result[0];
    }
  }
  function create(value, struct, message) {
    const result = validate(value, struct, { coerce: true, message });
    if (result[0]) {
      throw result[0];
    } else {
      return result[1];
    }
  }
  function mask(value, struct, message) {
    const result = validate(value, struct, { coerce: true, mask: true, message });
    if (result[0]) {
      throw result[0];
    } else {
      return result[1];
    }
  }
  function is(value, struct) {
    const result = validate(value, struct);
    return !result[0];
  }
  function validate(value, struct, options = {}) {
    const tuples = run(value, struct, options);
    const tuple = shiftIterator(tuples);
    if (tuple[0]) {
      const error = new StructError(tuple[0], function* () {
        for (const t of tuples) {
          if (t[0]) {
            yield t[0];
          }
        }
      });
      return [error, undefined];
    } else {
      const v = tuple[1];
      return [undefined, v];
    }
  }
  function define(name, validator) {
    return new Struct({ type: name, schema: null, validator });
  }
  function any() {
    return define("any", () => true);
  }
  function array(Element) {
    return new Struct({
      type: "array",
      schema: Element,
      *entries(value) {
        if (Element && Array.isArray(value)) {
          for (const [i2, v] of value.entries()) {
            yield [i2, v, Element];
          }
        }
      },
      coercer(value) {
        return Array.isArray(value) ? value.slice() : value;
      },
      validator(value) {
        return Array.isArray(value) || `Expected an array value, but received: ${print(value)}`;
      }
    });
  }
  function boolean() {
    return define("boolean", (value) => {
      return typeof value === "boolean";
    });
  }
  function instance(Class) {
    return define("instance", (value) => {
      return value instanceof Class || `Expected a \`${Class.name}\` instance, but received: ${print(value)}`;
    });
  }
  function literal(constant) {
    const description = print(constant);
    const t = typeof constant;
    return new Struct({
      type: "literal",
      schema: t === "string" || t === "number" || t === "boolean" ? constant : null,
      validator(value) {
        return value === constant || `Expected the literal \`${description}\`, but received: ${print(value)}`;
      }
    });
  }
  function never() {
    return define("never", () => false);
  }
  function nullable(struct) {
    return new Struct({
      ...struct,
      validator: (value, ctx) => value === null || struct.validator(value, ctx),
      refiner: (value, ctx) => value === null || struct.refiner(value, ctx)
    });
  }
  function number() {
    return define("number", (value) => {
      return typeof value === "number" && !isNaN(value) || `Expected a number, but received: ${print(value)}`;
    });
  }
  function optional(struct) {
    return new Struct({
      ...struct,
      validator: (value, ctx) => value === undefined || struct.validator(value, ctx),
      refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx)
    });
  }
  function record(Key, Value) {
    return new Struct({
      type: "record",
      schema: null,
      *entries(value) {
        if (isObject(value)) {
          for (const k in value) {
            const v = value[k];
            yield [k, k, Key];
            yield [k, v, Value];
          }
        }
      },
      validator(value) {
        return isNonArrayObject(value) || `Expected an object, but received: ${print(value)}`;
      },
      coercer(value) {
        return isNonArrayObject(value) ? { ...value } : value;
      }
    });
  }
  function string() {
    return define("string", (value) => {
      return typeof value === "string" || `Expected a string, but received: ${print(value)}`;
    });
  }
  function tuple(Structs) {
    const Never = never();
    return new Struct({
      type: "tuple",
      schema: null,
      *entries(value) {
        if (Array.isArray(value)) {
          const length = Math.max(Structs.length, value.length);
          for (let i2 = 0;i2 < length; i2++) {
            yield [i2, value[i2], Structs[i2] || Never];
          }
        }
      },
      validator(value) {
        return Array.isArray(value) || `Expected an array, but received: ${print(value)}`;
      },
      coercer(value) {
        return Array.isArray(value) ? value.slice() : value;
      }
    });
  }
  function type(schema) {
    const keys = Object.keys(schema);
    return new Struct({
      type: "type",
      schema,
      *entries(value) {
        if (isObject(value)) {
          for (const k of keys) {
            yield [k, value[k], schema[k]];
          }
        }
      },
      validator(value) {
        return isNonArrayObject(value) || `Expected an object, but received: ${print(value)}`;
      },
      coercer(value) {
        return isNonArrayObject(value) ? { ...value } : value;
      }
    });
  }
  function union(Structs) {
    const description = Structs.map((s) => s.type).join(" | ");
    return new Struct({
      type: "union",
      schema: null,
      coercer(value, ctx) {
        for (const S of Structs) {
          const [error, coerced] = S.validate(value, {
            coerce: true,
            mask: ctx.mask
          });
          if (!error) {
            return coerced;
          }
        }
        return value;
      },
      validator(value, ctx) {
        const failures = [];
        for (const S of Structs) {
          const [...tuples] = run(value, S, ctx);
          const [first] = tuples;
          if (!first[0]) {
            return [];
          } else {
            for (const [failure] of tuples) {
              if (failure) {
                failures.push(failure);
              }
            }
          }
        }
        return [
          `Expected the value to satisfy a union of \`${description}\`, but received: ${print(value)}`,
          ...failures
        ];
      }
    });
  }
  function unknown() {
    return define("unknown", () => true);
  }
  function coerce(struct, condition, coercer) {
    return new Struct({
      ...struct,
      coercer: (value, ctx) => {
        return is(value, condition) ? struct.coercer(coercer(value, ctx), ctx) : struct.coercer(value, ctx);
      }
    });
  }

  // node_modules/@solana/web3.js/lib/index.browser.esm.js
  var import_browser = __toESM(require_browser2(), 1);

  // node_modules/rpc-websockets/dist/index.browser.mjs
  init_buffer();

  // node_modules/eventemitter3/index.mjs
  var import__ = __toESM(require_eventemitter3(), 1);

  // node_modules/rpc-websockets/dist/index.browser.mjs
  var WebSocketBrowserImpl = class extends import__.default {
    socket;
    constructor(address, options) {
      super();
      this.socket = new window.WebSocket(address, options.protocols);
      this.socket.onopen = () => this.emit("open");
      this.socket.onmessage = (event) => this.emit("message", event.data);
      this.socket.onerror = (error) => this.emit("error", error);
      this.socket.onclose = (event) => {
        this.emit("close", event.code, event.reason);
      };
    }
    send(data, optionsOrCallback, callback) {
      const cb = callback || optionsOrCallback;
      try {
        this.socket.send(data);
        cb();
      } catch (error) {
        cb(error);
      }
    }
    close(code2, reason) {
      this.socket.close(code2, reason);
    }
    addEventListener(type2, listener, options) {
      this.socket.addEventListener(type2, listener, options);
    }
  };
  function WebSocket(address, options) {
    return new WebSocketBrowserImpl(address, options);
  }
  var DefaultDataPack = class {
    encode(value) {
      return JSON.stringify(value);
    }
    decode(value) {
      return JSON.parse(value);
    }
  };
  var CommonClient = class extends import__.default {
    address;
    rpc_id;
    queue;
    options;
    autoconnect;
    ready;
    reconnect;
    reconnect_timer_id;
    reconnect_interval;
    max_reconnects;
    rest_options;
    current_reconnects;
    generate_request_id;
    socket;
    webSocketFactory;
    dataPack;
    constructor(webSocketFactory, address = "ws://localhost:8080", {
      autoconnect = true,
      reconnect = true,
      reconnect_interval = 1000,
      max_reconnects = 5,
      ...rest_options
    } = {}, generate_request_id, dataPack) {
      super();
      this.webSocketFactory = webSocketFactory;
      this.queue = {};
      this.rpc_id = 0;
      this.address = address;
      this.autoconnect = autoconnect;
      this.ready = false;
      this.reconnect = reconnect;
      this.reconnect_timer_id = undefined;
      this.reconnect_interval = reconnect_interval;
      this.max_reconnects = max_reconnects;
      this.rest_options = rest_options;
      this.current_reconnects = 0;
      this.generate_request_id = generate_request_id || (() => typeof this.rpc_id === "number" ? ++this.rpc_id : Number(this.rpc_id) + 1);
      if (!dataPack)
        this.dataPack = new DefaultDataPack;
      else
        this.dataPack = dataPack;
      if (this.autoconnect)
        this._connect(this.address, {
          autoconnect: this.autoconnect,
          reconnect: this.reconnect,
          reconnect_interval: this.reconnect_interval,
          max_reconnects: this.max_reconnects,
          ...this.rest_options
        });
    }
    connect() {
      if (this.socket)
        return;
      this._connect(this.address, {
        autoconnect: this.autoconnect,
        reconnect: this.reconnect,
        reconnect_interval: this.reconnect_interval,
        max_reconnects: this.max_reconnects,
        ...this.rest_options
      });
    }
    call(method, params, timeout, ws_opts) {
      if (!ws_opts && typeof timeout === "object") {
        ws_opts = timeout;
        timeout = null;
      }
      return new Promise((resolve, reject) => {
        if (!this.ready)
          return reject(new Error("socket not ready"));
        const rpc_id = this.generate_request_id(method, params);
        const message = {
          jsonrpc: "2.0",
          method,
          params: params || undefined,
          id: rpc_id
        };
        this.socket.send(this.dataPack.encode(message), ws_opts, (error) => {
          if (error)
            return reject(error);
          this.queue[rpc_id] = { promise: [resolve, reject] };
          if (timeout) {
            this.queue[rpc_id].timeout = setTimeout(() => {
              delete this.queue[rpc_id];
              reject(new Error("reply timeout"));
            }, timeout);
          }
        });
      });
    }
    async login(params) {
      const resp = await this.call("rpc.login", params);
      if (!resp)
        throw new Error("authentication failed");
      return resp;
    }
    async listMethods() {
      return await this.call("__listMethods");
    }
    notify(method, params) {
      return new Promise((resolve, reject) => {
        if (!this.ready)
          return reject(new Error("socket not ready"));
        const message = {
          jsonrpc: "2.0",
          method,
          params
        };
        this.socket.send(this.dataPack.encode(message), (error) => {
          if (error)
            return reject(error);
          resolve();
        });
      });
    }
    async subscribe(event) {
      if (typeof event === "string")
        event = [event];
      const result = await this.call("rpc.on", event);
      if (typeof event === "string" && result[event] !== "ok")
        throw new Error("Failed subscribing to an event '" + event + "' with: " + result[event]);
      return result;
    }
    async unsubscribe(event) {
      if (typeof event === "string")
        event = [event];
      const result = await this.call("rpc.off", event);
      if (typeof event === "string" && result[event] !== "ok")
        throw new Error("Failed unsubscribing from an event with: " + result);
      return result;
    }
    close(code2, data) {
      if (this.socket)
        this.socket.close(code2 || 1000, data);
    }
    setAutoReconnect(reconnect) {
      this.reconnect = reconnect;
    }
    setReconnectInterval(interval) {
      this.reconnect_interval = interval;
    }
    setMaxReconnects(max_reconnects) {
      this.max_reconnects = max_reconnects;
    }
    getCurrentReconnects() {
      return this.current_reconnects;
    }
    getMaxReconnects() {
      return this.max_reconnects;
    }
    isReconnecting() {
      return this.reconnect_timer_id !== undefined;
    }
    willReconnect() {
      return this.reconnect && (this.max_reconnects === 0 || this.current_reconnects < this.max_reconnects);
    }
    _connect(address, options) {
      clearTimeout(this.reconnect_timer_id);
      this.socket = this.webSocketFactory(address, options);
      this.socket.addEventListener("open", () => {
        this.ready = true;
        this.emit("open");
        this.current_reconnects = 0;
      });
      this.socket.addEventListener("message", ({ data: message }) => {
        if (message instanceof ArrayBuffer)
          message = Buffer2.from(message).toString();
        try {
          message = this.dataPack.decode(message);
        } catch (_error) {
          return;
        }
        if (message.notification && this.listeners(message.notification).length) {
          if (!Object.keys(message.params).length)
            return this.emit(message.notification);
          const args = [message.notification];
          if (message.params.constructor === Object)
            args.push(message.params);
          else
            for (let i3 = 0;i3 < message.params.length; i3++)
              args.push(message.params[i3]);
          return Promise.resolve().then(() => {
            this.emit.apply(this, args);
          });
        }
        if (!this.queue[message.id]) {
          if (message.method) {
            return Promise.resolve().then(() => {
              this.emit(message.method, message?.params);
            });
          }
          return;
        }
        if ("error" in message === "result" in message)
          this.queue[message.id].promise[1](new Error('Server response malformed. Response must include either "result" or "error", but not both.'));
        if (this.queue[message.id].timeout)
          clearTimeout(this.queue[message.id].timeout);
        if (message.error)
          this.queue[message.id].promise[1](message.error);
        else
          this.queue[message.id].promise[0](message.result);
        delete this.queue[message.id];
      });
      this.socket.addEventListener("error", (error) => this.emit("error", error));
      this.socket.addEventListener("close", ({ code: code2, reason }) => {
        if (this.ready)
          setTimeout(() => this.emit("close", code2, reason), 0);
        this.ready = false;
        this.socket = undefined;
        if (code2 === 1000)
          return;
        this.current_reconnects++;
        if (this.reconnect && (this.max_reconnects > this.current_reconnects || this.max_reconnects === 0))
          this.reconnect_timer_id = setTimeout(() => this._connect(address, options), this.reconnect_interval);
        else if (this.reconnect && this.max_reconnects > 0 && this.current_reconnects >= this.max_reconnects) {
          setTimeout(() => this.emit("max_reconnects_reached", code2, reason), 1);
        }
      });
    }
  };

  // node_modules/@noble/hashes/esm/sha3.js
  var _0n6 = BigInt(0);
  var _1n6 = BigInt(1);
  var _2n4 = BigInt(2);
  var _7n2 = BigInt(7);
  var _256n = BigInt(256);
  var _0x71n = BigInt(113);
  var SHA3_PI = [];
  var SHA3_ROTL = [];
  var _SHA3_IOTA = [];
  for (let round = 0, R = _1n6, x = 1, y = 0;round < 24; round++) {
    [x, y] = [y, (2 * x + 3 * y) % 5];
    SHA3_PI.push(2 * (5 * y + x));
    SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
    let t = _0n6;
    for (let j = 0;j < 7; j++) {
      R = (R << _1n6 ^ (R >> _7n2) * _0x71n) % _256n;
      if (R & _2n4)
        t ^= _1n6 << (_1n6 << /* @__PURE__ */ BigInt(j)) - _1n6;
    }
    _SHA3_IOTA.push(t);
  }
  var IOTAS = split(_SHA3_IOTA, true);
  var SHA3_IOTA_H = IOTAS[0];
  var SHA3_IOTA_L = IOTAS[1];
  var rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
  var rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
  function keccakP(s, rounds = 24) {
    const B = new Uint32Array(5 * 2);
    for (let round = 24 - rounds;round < 24; round++) {
      for (let x = 0;x < 10; x++)
        B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
      for (let x = 0;x < 10; x += 2) {
        const idx1 = (x + 8) % 10;
        const idx0 = (x + 2) % 10;
        const B0 = B[idx0];
        const B1 = B[idx0 + 1];
        const Th = rotlH(B0, B1, 1) ^ B[idx1];
        const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
        for (let y = 0;y < 50; y += 10) {
          s[x + y] ^= Th;
          s[x + y + 1] ^= Tl;
        }
      }
      let curH = s[2];
      let curL = s[3];
      for (let t = 0;t < 24; t++) {
        const shift = SHA3_ROTL[t];
        const Th = rotlH(curH, curL, shift);
        const Tl = rotlL(curH, curL, shift);
        const PI = SHA3_PI[t];
        curH = s[PI];
        curL = s[PI + 1];
        s[PI] = Th;
        s[PI + 1] = Tl;
      }
      for (let y = 0;y < 50; y += 10) {
        for (let x = 0;x < 10; x++)
          B[x] = s[y + x];
        for (let x = 0;x < 10; x++)
          s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
      }
      s[0] ^= SHA3_IOTA_H[round];
      s[1] ^= SHA3_IOTA_L[round];
    }
    clean(B);
  }

  class Keccak extends Hash {
    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
      super();
      this.pos = 0;
      this.posOut = 0;
      this.finished = false;
      this.destroyed = false;
      this.enableXOF = false;
      this.blockLen = blockLen;
      this.suffix = suffix;
      this.outputLen = outputLen;
      this.enableXOF = enableXOF;
      this.rounds = rounds;
      anumber(outputLen);
      if (!(0 < blockLen && blockLen < 200))
        throw new Error("only keccak-f1600 function is supported");
      this.state = new Uint8Array(200);
      this.state32 = u32(this.state);
    }
    clone() {
      return this._cloneInto();
    }
    keccak() {
      swap32IfBE(this.state32);
      keccakP(this.state32, this.rounds);
      swap32IfBE(this.state32);
      this.posOut = 0;
      this.pos = 0;
    }
    update(data) {
      aexists(this);
      data = toBytes(data);
      abytes(data);
      const { blockLen, state } = this;
      const len2 = data.length;
      for (let pos = 0;pos < len2; ) {
        const take = Math.min(blockLen - this.pos, len2 - pos);
        for (let i3 = 0;i3 < take; i3++)
          state[this.pos++] ^= data[pos++];
        if (this.pos === blockLen)
          this.keccak();
      }
      return this;
    }
    finish() {
      if (this.finished)
        return;
      this.finished = true;
      const { state, suffix, pos, blockLen } = this;
      state[pos] ^= suffix;
      if ((suffix & 128) !== 0 && pos === blockLen - 1)
        this.keccak();
      state[blockLen - 1] ^= 128;
      this.keccak();
    }
    writeInto(out) {
      aexists(this, false);
      abytes(out);
      this.finish();
      const bufferOut = this.state;
      const { blockLen } = this;
      for (let pos = 0, len2 = out.length;pos < len2; ) {
        if (this.posOut >= blockLen)
          this.keccak();
        const take = Math.min(blockLen - this.posOut, len2 - pos);
        out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
        this.posOut += take;
        pos += take;
      }
      return out;
    }
    xofInto(out) {
      if (!this.enableXOF)
        throw new Error("XOF is not possible for this instance");
      return this.writeInto(out);
    }
    xof(bytes) {
      anumber(bytes);
      return this.xofInto(new Uint8Array(bytes));
    }
    digestInto(out) {
      aoutput(out, this);
      if (this.finished)
        throw new Error("digest() was already called");
      this.writeInto(out);
      this.destroy();
      return out;
    }
    digest() {
      return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
      this.destroyed = true;
      clean(this.state);
    }
    _cloneInto(to) {
      const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
      to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
      to.state32.set(this.state32);
      to.pos = this.pos;
      to.posOut = this.posOut;
      to.finished = this.finished;
      to.rounds = rounds;
      to.suffix = suffix;
      to.outputLen = outputLen;
      to.enableXOF = enableXOF;
      to.destroyed = this.destroyed;
      return to;
    }
  }
  var gen = (suffix, blockLen, outputLen) => createHasher(() => new Keccak(blockLen, suffix, outputLen));
  var keccak_256 = /* @__PURE__ */ (() => gen(1, 136, 256 / 8))();

  // node_modules/@noble/hashes/esm/hmac.js
  class HMAC extends Hash {
    constructor(hash, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      ahash(hash);
      const key = toBytes(_key);
      this.iHash = hash.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
      for (let i3 = 0;i3 < pad.length; i3++)
        pad[i3] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash.create();
      for (let i3 = 0;i3 < pad.length; i3++)
        pad[i3] ^= 54 ^ 92;
      this.oHash.update(pad);
      clean(pad);
    }
    update(buf) {
      aexists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists(this);
      abytes(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished: finished2, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished2;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  }
  var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
  hmac.create = (hash, key) => new HMAC(hash, key);

  // node_modules/@noble/curves/esm/abstract/weierstrass.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n5) / den;
  function _splitEndoScalar(k, basis, n) {
    const [[a1, b1], [a2, b2]] = basis;
    const c1 = divNearest(b2 * k, n);
    const c2 = divNearest(-b1 * k, n);
    let k1 = k - c1 * a1 - c2 * a2;
    let k2 = -c1 * b1 - c2 * b2;
    const k1neg = k1 < _0n7;
    const k2neg = k2 < _0n7;
    if (k1neg)
      k1 = -k1;
    if (k2neg)
      k2 = -k2;
    const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n7;
    if (k1 < _0n7 || k1 >= MAX_NUM || k2 < _0n7 || k2 >= MAX_NUM) {
      throw new Error("splitScalar (endomorphism): failed, k=" + k);
    }
    return { k1neg, k1, k2neg, k2 };
  }
  function validateSigFormat(format) {
    if (!["compact", "recovered", "der"].includes(format))
      throw new Error('Signature format must be "compact", "recovered", or "der"');
    return format;
  }
  function validateSigOpts(opts, def) {
    const optsn = {};
    for (let optName of Object.keys(def)) {
      optsn[optName] = opts[optName] === undefined ? def[optName] : opts[optName];
    }
    _abool2(optsn.lowS, "lowS");
    _abool2(optsn.prehash, "prehash");
    if (optsn.format !== undefined)
      validateSigFormat(optsn.format);
    return optsn;
  }

  class DERErr extends Error {
    constructor(m = "") {
      super(m);
    }
  }
  var DER = {
    Err: DERErr,
    _tlv: {
      encode: (tag, data) => {
        const { Err: E2 } = DER;
        if (tag < 0 || tag > 256)
          throw new E2("tlv.encode: wrong tag");
        if (data.length & 1)
          throw new E2("tlv.encode: unpadded data");
        const dataLen = data.length / 2;
        const len2 = numberToHexUnpadded(dataLen);
        if (len2.length / 2 & 128)
          throw new E2("tlv.encode: long form length too big");
        const lenLen = dataLen > 127 ? numberToHexUnpadded(len2.length / 2 | 128) : "";
        const t = numberToHexUnpadded(tag);
        return t + lenLen + len2 + data;
      },
      decode(tag, data) {
        const { Err: E2 } = DER;
        let pos = 0;
        if (tag < 0 || tag > 256)
          throw new E2("tlv.encode: wrong tag");
        if (data.length < 2 || data[pos++] !== tag)
          throw new E2("tlv.decode: wrong tlv");
        const first = data[pos++];
        const isLong = !!(first & 128);
        let length = 0;
        if (!isLong)
          length = first;
        else {
          const lenLen = first & 127;
          if (!lenLen)
            throw new E2("tlv.decode(long): indefinite length not supported");
          if (lenLen > 4)
            throw new E2("tlv.decode(long): byte length is too big");
          const lengthBytes = data.subarray(pos, pos + lenLen);
          if (lengthBytes.length !== lenLen)
            throw new E2("tlv.decode: length bytes not complete");
          if (lengthBytes[0] === 0)
            throw new E2("tlv.decode(long): zero leftmost byte");
          for (const b of lengthBytes)
            length = length << 8 | b;
          pos += lenLen;
          if (length < 128)
            throw new E2("tlv.decode(long): not minimal encoding");
        }
        const v = data.subarray(pos, pos + length);
        if (v.length !== length)
          throw new E2("tlv.decode: wrong value length");
        return { v, l: data.subarray(pos + length) };
      }
    },
    _int: {
      encode(num) {
        const { Err: E2 } = DER;
        if (num < _0n7)
          throw new E2("integer: negative integers are not allowed");
        let hex = numberToHexUnpadded(num);
        if (Number.parseInt(hex[0], 16) & 8)
          hex = "00" + hex;
        if (hex.length & 1)
          throw new E2("unexpected DER parsing assertion: unpadded hex");
        return hex;
      },
      decode(data) {
        const { Err: E2 } = DER;
        if (data[0] & 128)
          throw new E2("invalid signature integer: negative");
        if (data[0] === 0 && !(data[1] & 128))
          throw new E2("invalid signature integer: unnecessary leading zero");
        return bytesToNumberBE(data);
      }
    },
    toSig(hex) {
      const { Err: E2, _int: int, _tlv: tlv } = DER;
      const data = ensureBytes("signature", hex);
      const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
      if (seqLeftBytes.length)
        throw new E2("invalid signature: left bytes after parsing");
      const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
      const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
      if (sLeftBytes.length)
        throw new E2("invalid signature: left bytes after parsing");
      return { r: int.decode(rBytes), s: int.decode(sBytes) };
    },
    hexFromSig(sig) {
      const { _tlv: tlv, _int: int } = DER;
      const rs = tlv.encode(2, int.encode(sig.r));
      const ss = tlv.encode(2, int.encode(sig.s));
      const seq = rs + ss;
      return tlv.encode(48, seq);
    }
  };
  var _0n7 = BigInt(0);
  var _1n7 = BigInt(1);
  var _2n5 = BigInt(2);
  var _3n3 = BigInt(3);
  var _4n2 = BigInt(4);
  function _normFnElement(Fn2, key) {
    const { BYTES: expected } = Fn2;
    let num;
    if (typeof key === "bigint") {
      num = key;
    } else {
      let bytes = ensureBytes("private key", key);
      try {
        num = Fn2.fromBytes(bytes);
      } catch (error) {
        throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
      }
    }
    if (!Fn2.isValidNot0(num))
      throw new Error("invalid private key: out of range [1..N-1]");
    return num;
  }
  function weierstrassN(params, extraOpts = {}) {
    const validated = _createCurveFields("weierstrass", params, extraOpts);
    const { Fp: Fp2, Fn: Fn2 } = validated;
    let CURVE = validated.CURVE;
    const { h: cofactor, n: CURVE_ORDER } = CURVE;
    _validateObject(extraOpts, {}, {
      allowInfinityPoint: "boolean",
      clearCofactor: "function",
      isTorsionFree: "function",
      fromBytes: "function",
      toBytes: "function",
      endo: "object",
      wrapPrivateKey: "boolean"
    });
    const { endo } = extraOpts;
    if (endo) {
      if (!Fp2.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
        throw new Error('invalid endo: expected "beta": bigint and "basises": array');
      }
    }
    const lengths = getWLengths(Fp2, Fn2);
    function assertCompressionIsSupported() {
      if (!Fp2.isOdd)
        throw new Error("compression is not supported: Field does not have .isOdd()");
    }
    function pointToBytes(_c, point, isCompressed) {
      const { x, y } = point.toAffine();
      const bx = Fp2.toBytes(x);
      _abool2(isCompressed, "isCompressed");
      if (isCompressed) {
        assertCompressionIsSupported();
        const hasEvenY = !Fp2.isOdd(y);
        return concatBytes(pprefix(hasEvenY), bx);
      } else {
        return concatBytes(Uint8Array.of(4), bx, Fp2.toBytes(y));
      }
    }
    function pointFromBytes(bytes) {
      _abytes2(bytes, undefined, "Point");
      const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
      const length = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (length === comp && (head === 2 || head === 3)) {
        const x = Fp2.fromBytes(tail);
        if (!Fp2.isValid(x))
          throw new Error("bad point: is not on curve, wrong x");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp2.sqrt(y2);
        } catch (sqrtError) {
          const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("bad point: is not on curve, sqrt error" + err);
        }
        assertCompressionIsSupported();
        const isYOdd = Fp2.isOdd(y);
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp2.neg(y);
        return { x, y };
      } else if (length === uncomp && head === 4) {
        const L = Fp2.BYTES;
        const x = Fp2.fromBytes(tail.subarray(0, L));
        const y = Fp2.fromBytes(tail.subarray(L, L * 2));
        if (!isValidXY(x, y))
          throw new Error("bad point: is not on curve");
        return { x, y };
      } else {
        throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
      }
    }
    const encodePoint = extraOpts.toBytes || pointToBytes;
    const decodePoint = extraOpts.fromBytes || pointFromBytes;
    function weierstrassEquation(x) {
      const x2 = Fp2.sqr(x);
      const x3 = Fp2.mul(x2, x);
      return Fp2.add(Fp2.add(x3, Fp2.mul(x, CURVE.a)), CURVE.b);
    }
    function isValidXY(x, y) {
      const left = Fp2.sqr(y);
      const right = weierstrassEquation(x);
      return Fp2.eql(left, right);
    }
    if (!isValidXY(CURVE.Gx, CURVE.Gy))
      throw new Error("bad curve params: generator point");
    const _4a3 = Fp2.mul(Fp2.pow(CURVE.a, _3n3), _4n2);
    const _27b2 = Fp2.mul(Fp2.sqr(CURVE.b), BigInt(27));
    if (Fp2.is0(Fp2.add(_4a3, _27b2)))
      throw new Error("bad curve params: a or b");
    function acoord(title, n, banZero = false) {
      if (!Fp2.isValid(n) || banZero && Fp2.is0(n))
        throw new Error(`bad point coordinate ${title}`);
      return n;
    }
    function aprjpoint(other) {
      if (!(other instanceof Point))
        throw new Error("ProjectivePoint expected");
    }
    function splitEndoScalarN(k) {
      if (!endo || !endo.basises)
        throw new Error("no endo");
      return _splitEndoScalar(k, endo.basises, Fn2.ORDER);
    }
    const toAffineMemo = memoized((p, iz) => {
      const { X, Y, Z } = p;
      if (Fp2.eql(Z, Fp2.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp2.ONE : Fp2.inv(Z);
      const x = Fp2.mul(X, iz);
      const y = Fp2.mul(Y, iz);
      const zz = Fp2.mul(Z, iz);
      if (is0)
        return { x: Fp2.ZERO, y: Fp2.ZERO };
      if (!Fp2.eql(zz, Fp2.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    });
    const assertValidMemo = memoized((p) => {
      if (p.is0()) {
        if (extraOpts.allowInfinityPoint && !Fp2.is0(p.Y))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = p.toAffine();
      if (!Fp2.isValid(x) || !Fp2.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      return true;
    });
    function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
      k2p = new Point(Fp2.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
      k1p = negateCt(k1neg, k1p);
      k2p = negateCt(k2neg, k2p);
      return k1p.add(k2p);
    }

    class Point {
      constructor(X, Y, Z) {
        this.X = acoord("x", X);
        this.Y = acoord("y", Y, true);
        this.Z = acoord("z", Z);
        Object.freeze(this);
      }
      static CURVE() {
        return CURVE;
      }
      static fromAffine(p) {
        const { x, y } = p || {};
        if (!p || !Fp2.isValid(x) || !Fp2.isValid(y))
          throw new Error("invalid affine point");
        if (p instanceof Point)
          throw new Error("projective point not allowed");
        if (Fp2.is0(x) && Fp2.is0(y))
          return Point.ZERO;
        return new Point(x, y, Fp2.ONE);
      }
      static fromBytes(bytes) {
        const P = Point.fromAffine(decodePoint(_abytes2(bytes, undefined, "point")));
        P.assertValidity();
        return P;
      }
      static fromHex(hex) {
        return Point.fromBytes(ensureBytes("pointHex", hex));
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      precompute(windowSize = 8, isLazy = true) {
        wnaf.createCache(this, windowSize);
        if (!isLazy)
          this.multiply(_3n3);
        return this;
      }
      assertValidity() {
        assertValidMemo(this);
      }
      hasEvenY() {
        const { y } = this.toAffine();
        if (!Fp2.isOdd)
          throw new Error("Field doesn't support isOdd");
        return !Fp2.isOdd(y);
      }
      equals(other) {
        aprjpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        const U1 = Fp2.eql(Fp2.mul(X1, Z2), Fp2.mul(X2, Z1));
        const U2 = Fp2.eql(Fp2.mul(Y1, Z2), Fp2.mul(Y2, Z1));
        return U1 && U2;
      }
      negate() {
        return new Point(this.X, Fp2.neg(this.Y), this.Z);
      }
      double() {
        const { a, b } = CURVE;
        const b3 = Fp2.mul(b, _3n3);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp2;
        let t0 = Fp2.mul(X1, X1);
        let t1 = Fp2.mul(Y1, Y1);
        let t2 = Fp2.mul(Z1, Z1);
        let t3 = Fp2.mul(X1, Y1);
        t3 = Fp2.add(t3, t3);
        Z3 = Fp2.mul(X1, Z1);
        Z3 = Fp2.add(Z3, Z3);
        X3 = Fp2.mul(a, Z3);
        Y3 = Fp2.mul(b3, t2);
        Y3 = Fp2.add(X3, Y3);
        X3 = Fp2.sub(t1, Y3);
        Y3 = Fp2.add(t1, Y3);
        Y3 = Fp2.mul(X3, Y3);
        X3 = Fp2.mul(t3, X3);
        Z3 = Fp2.mul(b3, Z3);
        t2 = Fp2.mul(a, t2);
        t3 = Fp2.sub(t0, t2);
        t3 = Fp2.mul(a, t3);
        t3 = Fp2.add(t3, Z3);
        Z3 = Fp2.add(t0, t0);
        t0 = Fp2.add(Z3, t0);
        t0 = Fp2.add(t0, t2);
        t0 = Fp2.mul(t0, t3);
        Y3 = Fp2.add(Y3, t0);
        t2 = Fp2.mul(Y1, Z1);
        t2 = Fp2.add(t2, t2);
        t0 = Fp2.mul(t2, t3);
        X3 = Fp2.sub(X3, t0);
        Z3 = Fp2.mul(t2, t1);
        Z3 = Fp2.add(Z3, Z3);
        Z3 = Fp2.add(Z3, Z3);
        return new Point(X3, Y3, Z3);
      }
      add(other) {
        aprjpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp2;
        const a = CURVE.a;
        const b3 = Fp2.mul(CURVE.b, _3n3);
        let t0 = Fp2.mul(X1, X2);
        let t1 = Fp2.mul(Y1, Y2);
        let t2 = Fp2.mul(Z1, Z2);
        let t3 = Fp2.add(X1, Y1);
        let t4 = Fp2.add(X2, Y2);
        t3 = Fp2.mul(t3, t4);
        t4 = Fp2.add(t0, t1);
        t3 = Fp2.sub(t3, t4);
        t4 = Fp2.add(X1, Z1);
        let t5 = Fp2.add(X2, Z2);
        t4 = Fp2.mul(t4, t5);
        t5 = Fp2.add(t0, t2);
        t4 = Fp2.sub(t4, t5);
        t5 = Fp2.add(Y1, Z1);
        X3 = Fp2.add(Y2, Z2);
        t5 = Fp2.mul(t5, X3);
        X3 = Fp2.add(t1, t2);
        t5 = Fp2.sub(t5, X3);
        Z3 = Fp2.mul(a, t4);
        X3 = Fp2.mul(b3, t2);
        Z3 = Fp2.add(X3, Z3);
        X3 = Fp2.sub(t1, Z3);
        Z3 = Fp2.add(t1, Z3);
        Y3 = Fp2.mul(X3, Z3);
        t1 = Fp2.add(t0, t0);
        t1 = Fp2.add(t1, t0);
        t2 = Fp2.mul(a, t2);
        t4 = Fp2.mul(b3, t4);
        t1 = Fp2.add(t1, t2);
        t2 = Fp2.sub(t0, t2);
        t2 = Fp2.mul(a, t2);
        t4 = Fp2.add(t4, t2);
        t0 = Fp2.mul(t1, t4);
        Y3 = Fp2.add(Y3, t0);
        t0 = Fp2.mul(t5, t4);
        X3 = Fp2.mul(t3, X3);
        X3 = Fp2.sub(X3, t0);
        t0 = Fp2.mul(t3, t1);
        Z3 = Fp2.mul(t5, Z3);
        Z3 = Fp2.add(Z3, t0);
        return new Point(X3, Y3, Z3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      is0() {
        return this.equals(Point.ZERO);
      }
      multiply(scalar) {
        const { endo: endo2 } = extraOpts;
        if (!Fn2.isValidNot0(scalar))
          throw new Error("invalid scalar: out of range");
        let point, fake;
        const mul = (n) => wnaf.cached(this, n, (p) => normalizeZ(Point, p));
        if (endo2) {
          const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
          const { p: k1p, f: k1f } = mul(k1);
          const { p: k2p, f: k2f } = mul(k2);
          fake = k1f.add(k2f);
          point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
        } else {
          const { p, f: f2 } = mul(scalar);
          point = p;
          fake = f2;
        }
        return normalizeZ(Point, [point, fake])[0];
      }
      multiplyUnsafe(sc) {
        const { endo: endo2 } = extraOpts;
        const p = this;
        if (!Fn2.isValid(sc))
          throw new Error("invalid scalar: out of range");
        if (sc === _0n7 || p.is0())
          return Point.ZERO;
        if (sc === _1n7)
          return p;
        if (wnaf.hasCache(this))
          return this.multiply(sc);
        if (endo2) {
          const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
          const { p1, p2 } = mulEndoUnsafe(Point, p, k1, k2);
          return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
        } else {
          return wnaf.unsafe(p, sc);
        }
      }
      multiplyAndAddUnsafe(Q, a, b) {
        const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
        return sum.is0() ? undefined : sum;
      }
      toAffine(invertedZ) {
        return toAffineMemo(this, invertedZ);
      }
      isTorsionFree() {
        const { isTorsionFree } = extraOpts;
        if (cofactor === _1n7)
          return true;
        if (isTorsionFree)
          return isTorsionFree(Point, this);
        return wnaf.unsafe(this, CURVE_ORDER).is0();
      }
      clearCofactor() {
        const { clearCofactor } = extraOpts;
        if (cofactor === _1n7)
          return this;
        if (clearCofactor)
          return clearCofactor(Point, this);
        return this.multiplyUnsafe(cofactor);
      }
      isSmallOrder() {
        return this.multiplyUnsafe(cofactor).is0();
      }
      toBytes(isCompressed = true) {
        _abool2(isCompressed, "isCompressed");
        this.assertValidity();
        return encodePoint(Point, this, isCompressed);
      }
      toHex(isCompressed = true) {
        return bytesToHex(this.toBytes(isCompressed));
      }
      toString() {
        return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
      }
      get px() {
        return this.X;
      }
      get py() {
        return this.X;
      }
      get pz() {
        return this.Z;
      }
      toRawBytes(isCompressed = true) {
        return this.toBytes(isCompressed);
      }
      _setWindowSize(windowSize) {
        this.precompute(windowSize);
      }
      static normalizeZ(points) {
        return normalizeZ(Point, points);
      }
      static msm(points, scalars) {
        return pippenger(Point, Fn2, points, scalars);
      }
      static fromPrivateKey(privateKey) {
        return Point.BASE.multiply(_normFnElement(Fn2, privateKey));
      }
    }
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp2.ONE);
    Point.ZERO = new Point(Fp2.ZERO, Fp2.ONE, Fp2.ZERO);
    Point.Fp = Fp2;
    Point.Fn = Fn2;
    const bits = Fn2.BITS;
    const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
    Point.BASE.precompute(8);
    return Point;
  }
  function pprefix(hasEvenY) {
    return Uint8Array.of(hasEvenY ? 2 : 3);
  }
  function getWLengths(Fp2, Fn2) {
    return {
      secretKey: Fn2.BYTES,
      publicKey: 1 + Fp2.BYTES,
      publicKeyUncompressed: 1 + 2 * Fp2.BYTES,
      publicKeyHasPrefix: true,
      signature: 2 * Fn2.BYTES
    };
  }
  function ecdh(Point, ecdhOpts = {}) {
    const { Fn: Fn2 } = Point;
    const randomBytes_ = ecdhOpts.randomBytes || randomBytes;
    const lengths = Object.assign(getWLengths(Point.Fp, Fn2), { seed: getMinHashLength(Fn2.ORDER) });
    function isValidSecretKey(secretKey) {
      try {
        return !!_normFnElement(Fn2, secretKey);
      } catch (error) {
        return false;
      }
    }
    function isValidPublicKey(publicKey, isCompressed) {
      const { publicKey: comp, publicKeyUncompressed } = lengths;
      try {
        const l = publicKey.length;
        if (isCompressed === true && l !== comp)
          return false;
        if (isCompressed === false && l !== publicKeyUncompressed)
          return false;
        return !!Point.fromBytes(publicKey);
      } catch (error) {
        return false;
      }
    }
    function randomSecretKey(seed = randomBytes_(lengths.seed)) {
      return mapHashToField(_abytes2(seed, lengths.seed, "seed"), Fn2.ORDER);
    }
    function getPublicKey(secretKey, isCompressed = true) {
      return Point.BASE.multiply(_normFnElement(Fn2, secretKey)).toBytes(isCompressed);
    }
    function keygen(seed) {
      const secretKey = randomSecretKey(seed);
      return { secretKey, publicKey: getPublicKey(secretKey) };
    }
    function isProbPub(item) {
      if (typeof item === "bigint")
        return false;
      if (item instanceof Point)
        return true;
      const { secretKey, publicKey, publicKeyUncompressed } = lengths;
      if (Fn2.allowedLengths || secretKey === publicKey)
        return;
      const l = ensureBytes("key", item).length;
      return l === publicKey || l === publicKeyUncompressed;
    }
    function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
      if (isProbPub(secretKeyA) === true)
        throw new Error("first arg must be private key");
      if (isProbPub(publicKeyB) === false)
        throw new Error("second arg must be public key");
      const s = _normFnElement(Fn2, secretKeyA);
      const b = Point.fromHex(publicKeyB);
      return b.multiply(s).toBytes(isCompressed);
    }
    const utils = {
      isValidSecretKey,
      isValidPublicKey,
      randomSecretKey,
      isValidPrivateKey: isValidSecretKey,
      randomPrivateKey: randomSecretKey,
      normPrivateKeyToScalar: (key) => _normFnElement(Fn2, key),
      precompute(windowSize = 8, point = Point.BASE) {
        return point.precompute(windowSize, false);
      }
    };
    return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point, utils, lengths });
  }
  function ecdsa(Point, hash, ecdsaOpts = {}) {
    ahash(hash);
    _validateObject(ecdsaOpts, {}, {
      hmac: "function",
      lowS: "boolean",
      randomBytes: "function",
      bits2int: "function",
      bits2int_modN: "function"
    });
    const randomBytes2 = ecdsaOpts.randomBytes || randomBytes;
    const hmac2 = ecdsaOpts.hmac || ((key, ...msgs) => hmac(hash, key, concatBytes(...msgs)));
    const { Fp: Fp2, Fn: Fn2 } = Point;
    const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn2;
    const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
    const defaultSigOpts = {
      prehash: false,
      lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : false,
      format: undefined,
      extraEntropy: false
    };
    const defaultSigOpts_format = "compact";
    function isBiggerThanHalfOrder(number2) {
      const HALF = CURVE_ORDER >> _1n7;
      return number2 > HALF;
    }
    function validateRS(title, num) {
      if (!Fn2.isValidNot0(num))
        throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
      return num;
    }
    function validateSigLength(bytes, format) {
      validateSigFormat(format);
      const size = lengths.signature;
      const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : undefined;
      return _abytes2(bytes, sizer, `${format} signature`);
    }

    class Signature {
      constructor(r, s, recovery) {
        this.r = validateRS("r", r);
        this.s = validateRS("s", s);
        if (recovery != null)
          this.recovery = recovery;
        Object.freeze(this);
      }
      static fromBytes(bytes, format = defaultSigOpts_format) {
        validateSigLength(bytes, format);
        let recid;
        if (format === "der") {
          const { r: r2, s: s2 } = DER.toSig(_abytes2(bytes));
          return new Signature(r2, s2);
        }
        if (format === "recovered") {
          recid = bytes[0];
          format = "compact";
          bytes = bytes.subarray(1);
        }
        const L = Fn2.BYTES;
        const r = bytes.subarray(0, L);
        const s = bytes.subarray(L, L * 2);
        return new Signature(Fn2.fromBytes(r), Fn2.fromBytes(s), recid);
      }
      static fromHex(hex, format) {
        return this.fromBytes(hexToBytes(hex), format);
      }
      addRecoveryBit(recovery) {
        return new Signature(this.r, this.s, recovery);
      }
      recoverPublicKey(messageHash) {
        const FIELD_ORDER = Fp2.ORDER;
        const { r, s, recovery: rec } = this;
        if (rec == null || ![0, 1, 2, 3].includes(rec))
          throw new Error("recovery id invalid");
        const hasCofactor = CURVE_ORDER * _2n5 < FIELD_ORDER;
        if (hasCofactor && rec > 1)
          throw new Error("recovery id is ambiguous for h>1 curve");
        const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
        if (!Fp2.isValid(radj))
          throw new Error("recovery id 2 or 3 invalid");
        const x = Fp2.toBytes(radj);
        const R = Point.fromBytes(concatBytes(pprefix((rec & 1) === 0), x));
        const ir = Fn2.inv(radj);
        const h = bits2int_modN(ensureBytes("msgHash", messageHash));
        const u1 = Fn2.create(-h * ir);
        const u2 = Fn2.create(s * ir);
        const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
        if (Q.is0())
          throw new Error("point at infinify");
        Q.assertValidity();
        return Q;
      }
      hasHighS() {
        return isBiggerThanHalfOrder(this.s);
      }
      toBytes(format = defaultSigOpts_format) {
        validateSigFormat(format);
        if (format === "der")
          return hexToBytes(DER.hexFromSig(this));
        const r = Fn2.toBytes(this.r);
        const s = Fn2.toBytes(this.s);
        if (format === "recovered") {
          if (this.recovery == null)
            throw new Error("recovery bit must be present");
          return concatBytes(Uint8Array.of(this.recovery), r, s);
        }
        return concatBytes(r, s);
      }
      toHex(format) {
        return bytesToHex(this.toBytes(format));
      }
      assertValidity() {}
      static fromCompact(hex) {
        return Signature.fromBytes(ensureBytes("sig", hex), "compact");
      }
      static fromDER(hex) {
        return Signature.fromBytes(ensureBytes("sig", hex), "der");
      }
      normalizeS() {
        return this.hasHighS() ? new Signature(this.r, Fn2.neg(this.s), this.recovery) : this;
      }
      toDERRawBytes() {
        return this.toBytes("der");
      }
      toDERHex() {
        return bytesToHex(this.toBytes("der"));
      }
      toCompactRawBytes() {
        return this.toBytes("compact");
      }
      toCompactHex() {
        return bytesToHex(this.toBytes("compact"));
      }
    }
    const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
      if (bytes.length > 8192)
        throw new Error("input is too large");
      const num = bytesToNumberBE(bytes);
      const delta = bytes.length * 8 - fnBits;
      return delta > 0 ? num >> BigInt(delta) : num;
    };
    const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
      return Fn2.create(bits2int(bytes));
    };
    const ORDER_MASK = bitMask(fnBits);
    function int2octets(num) {
      aInRange("num < 2^" + fnBits, num, _0n7, ORDER_MASK);
      return Fn2.toBytes(num);
    }
    function validateMsgAndHash(message, prehash) {
      _abytes2(message, undefined, "message");
      return prehash ? _abytes2(hash(message), undefined, "prehashed message") : message;
    }
    function prepSig(message, privateKey, opts) {
      if (["recovered", "canonical"].some((k) => (k in opts)))
        throw new Error("sign() legacy options not supported");
      const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
      message = validateMsgAndHash(message, prehash);
      const h1int = bits2int_modN(message);
      const d = _normFnElement(Fn2, privateKey);
      const seedArgs = [int2octets(d), int2octets(h1int)];
      if (extraEntropy != null && extraEntropy !== false) {
        const e = extraEntropy === true ? randomBytes2(lengths.secretKey) : extraEntropy;
        seedArgs.push(ensureBytes("extraEntropy", e));
      }
      const seed = concatBytes(...seedArgs);
      const m = h1int;
      function k2sig(kBytes) {
        const k = bits2int(kBytes);
        if (!Fn2.isValidNot0(k))
          return;
        const ik = Fn2.inv(k);
        const q = Point.BASE.multiply(k).toAffine();
        const r = Fn2.create(q.x);
        if (r === _0n7)
          return;
        const s = Fn2.create(ik * Fn2.create(m + r * d));
        if (s === _0n7)
          return;
        let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n7);
        let normS = s;
        if (lowS && isBiggerThanHalfOrder(s)) {
          normS = Fn2.neg(s);
          recovery ^= 1;
        }
        return new Signature(r, normS, recovery);
      }
      return { seed, k2sig };
    }
    function sign(message, secretKey, opts = {}) {
      message = ensureBytes("message", message);
      const { seed, k2sig } = prepSig(message, secretKey, opts);
      const drbg = createHmacDrbg(hash.outputLen, Fn2.BYTES, hmac2);
      const sig = drbg(seed, k2sig);
      return sig;
    }
    function tryParsingSig(sg) {
      let sig = undefined;
      const isHex = typeof sg === "string" || isBytes(sg);
      const isObj = !isHex && sg !== null && typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint";
      if (!isHex && !isObj)
        throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
      if (isObj) {
        sig = new Signature(sg.r, sg.s);
      } else if (isHex) {
        try {
          sig = Signature.fromBytes(ensureBytes("sig", sg), "der");
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
        }
        if (!sig) {
          try {
            sig = Signature.fromBytes(ensureBytes("sig", sg), "compact");
          } catch (error) {
            return false;
          }
        }
      }
      if (!sig)
        return false;
      return sig;
    }
    function verify(signature, message, publicKey, opts = {}) {
      const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
      publicKey = ensureBytes("publicKey", publicKey);
      message = validateMsgAndHash(ensureBytes("message", message), prehash);
      if ("strict" in opts)
        throw new Error("options.strict was renamed to lowS");
      const sig = format === undefined ? tryParsingSig(signature) : Signature.fromBytes(ensureBytes("sig", signature), format);
      if (sig === false)
        return false;
      try {
        const P = Point.fromBytes(publicKey);
        if (lowS && sig.hasHighS())
          return false;
        const { r, s } = sig;
        const h = bits2int_modN(message);
        const is2 = Fn2.inv(s);
        const u1 = Fn2.create(h * is2);
        const u2 = Fn2.create(r * is2);
        const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
        if (R.is0())
          return false;
        const v = Fn2.create(R.x);
        return v === r;
      } catch (e) {
        return false;
      }
    }
    function recoverPublicKey(signature, message, opts = {}) {
      const { prehash } = validateSigOpts(opts, defaultSigOpts);
      message = validateMsgAndHash(message, prehash);
      return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
    }
    return Object.freeze({
      keygen,
      getPublicKey,
      getSharedSecret,
      utils,
      lengths,
      Point,
      sign,
      verify,
      recoverPublicKey,
      Signature,
      hash
    });
  }
  function _weierstrass_legacy_opts_to_new(c) {
    const CURVE = {
      a: c.a,
      b: c.b,
      p: c.Fp.ORDER,
      n: c.n,
      h: c.h,
      Gx: c.Gx,
      Gy: c.Gy
    };
    const Fp2 = c.Fp;
    let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : undefined;
    const Fn2 = Field(CURVE.n, {
      BITS: c.nBitLength,
      allowedLengths,
      modFromBytes: c.wrapPrivateKey
    });
    const curveOpts = {
      Fp: Fp2,
      Fn: Fn2,
      allowInfinityPoint: c.allowInfinityPoint,
      endo: c.endo,
      isTorsionFree: c.isTorsionFree,
      clearCofactor: c.clearCofactor,
      fromBytes: c.fromBytes,
      toBytes: c.toBytes
    };
    return { CURVE, curveOpts };
  }
  function _ecdsa_legacy_opts_to_new(c) {
    const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
    const ecdsaOpts = {
      hmac: c.hmac,
      randomBytes: c.randomBytes,
      lowS: c.lowS,
      bits2int: c.bits2int,
      bits2int_modN: c.bits2int_modN
    };
    return { CURVE, curveOpts, hash: c.hash, ecdsaOpts };
  }
  function _ecdsa_new_output_to_legacy(c, _ecdsa) {
    const Point = _ecdsa.Point;
    return Object.assign({}, _ecdsa, {
      ProjectivePoint: Point,
      CURVE: Object.assign({}, c, nLength(Point.Fn.ORDER, Point.Fn.BITS))
    });
  }
  function weierstrass(c) {
    const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
    const Point = weierstrassN(CURVE, curveOpts);
    const signs = ecdsa(Point, hash, ecdsaOpts);
    return _ecdsa_new_output_to_legacy(c, signs);
  }

  // node_modules/@noble/curves/esm/_shortw_utils.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  function createCurve(curveDef, defHash) {
    const create2 = (hash) => weierstrass({ ...curveDef, hash });
    return { ...create2(defHash), create: create2 };
  }

  // node_modules/@noble/curves/esm/secp256k1.js
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  var secp256k1_CURVE = {
    p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    h: BigInt(1),
    a: BigInt(0),
    b: BigInt(7),
    Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
  };
  var secp256k1_ENDO = {
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    basises: [
      [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
      [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
    ]
  };
  var _2n6 = /* @__PURE__ */ BigInt(2);
  function sqrtMod(y) {
    const P = secp256k1_CURVE.p;
    const _3n4 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = y * y * y % P;
    const b3 = b2 * b2 * y % P;
    const b6 = pow2(b3, _3n4, P) * b3 % P;
    const b9 = pow2(b6, _3n4, P) * b3 % P;
    const b11 = pow2(b9, _2n6, P) * b2 % P;
    const b22 = pow2(b11, _11n, P) * b11 % P;
    const b44 = pow2(b22, _22n, P) * b22 % P;
    const b88 = pow2(b44, _44n, P) * b44 % P;
    const b176 = pow2(b88, _88n, P) * b88 % P;
    const b220 = pow2(b176, _44n, P) * b44 % P;
    const b223 = pow2(b220, _3n4, P) * b3 % P;
    const t1 = pow2(b223, _23n, P) * b22 % P;
    const t2 = pow2(t1, _6n, P) * b2 % P;
    const root = pow2(t2, _2n6, P);
    if (!Fpk1.eql(Fpk1.sqr(root), y))
      throw new Error("Cannot find square root");
    return root;
  }
  var Fpk1 = Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
  var secp256k1 = createCurve({ ...secp256k1_CURVE, Fp: Fpk1, lowS: true, endo: secp256k1_ENDO }, sha256);

  // node_modules/@solana/web3.js/lib/index.browser.esm.js
  var generatePrivateKey = ed25519.utils.randomPrivateKey;
  var generateKeypair = () => {
    const privateScalar = ed25519.utils.randomPrivateKey();
    const publicKey = getPublicKey(privateScalar);
    const secretKey = new Uint8Array(64);
    secretKey.set(privateScalar);
    secretKey.set(publicKey, 32);
    return {
      publicKey,
      secretKey
    };
  };
  var getPublicKey = ed25519.getPublicKey;
  function isOnCurve(publicKey) {
    try {
      ed25519.ExtendedPoint.fromHex(publicKey);
      return true;
    } catch {
      return false;
    }
  }
  var sign = (message, secretKey) => ed25519.sign(message, secretKey.slice(0, 32));
  var verify = ed25519.verify;
  var toBuffer = (arr) => {
    if (Buffer2.isBuffer(arr)) {
      return arr;
    } else if (arr instanceof Uint8Array) {
      return Buffer2.from(arr.buffer, arr.byteOffset, arr.byteLength);
    } else {
      return Buffer2.from(arr);
    }
  };

  class Struct2 {
    constructor(properties) {
      Object.assign(this, properties);
    }
    encode() {
      return Buffer2.from(import_borsh.serialize(SOLANA_SCHEMA, this));
    }
    static decode(data) {
      return import_borsh.deserialize(SOLANA_SCHEMA, this, data);
    }
    static decodeUnchecked(data) {
      return import_borsh.deserializeUnchecked(SOLANA_SCHEMA, this, data);
    }
  }
  var SOLANA_SCHEMA = new Map;
  var _PublicKey;
  var MAX_SEED_LENGTH = 32;
  var PUBLIC_KEY_LENGTH = 32;
  function isPublicKeyData(value) {
    return value._bn !== undefined;
  }
  var uniquePublicKeyCounter = 1;

  class PublicKey extends Struct2 {
    constructor(value) {
      super({});
      this._bn = undefined;
      if (isPublicKeyData(value)) {
        this._bn = value._bn;
      } else {
        if (typeof value === "string") {
          const decoded = import_bs58.default.decode(value);
          if (decoded.length != PUBLIC_KEY_LENGTH) {
            throw new Error(`Invalid public key input`);
          }
          this._bn = new import_bn.default(decoded);
        } else {
          this._bn = new import_bn.default(value);
        }
        if (this._bn.byteLength() > PUBLIC_KEY_LENGTH) {
          throw new Error(`Invalid public key input`);
        }
      }
    }
    static unique() {
      const key = new PublicKey(uniquePublicKeyCounter);
      uniquePublicKeyCounter += 1;
      return new PublicKey(key.toBuffer());
    }
    equals(publicKey) {
      return this._bn.eq(publicKey._bn);
    }
    toBase58() {
      return import_bs58.default.encode(this.toBytes());
    }
    toJSON() {
      return this.toBase58();
    }
    toBytes() {
      const buf = this.toBuffer();
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    toBuffer() {
      const b = this._bn.toArrayLike(Buffer2);
      if (b.length === PUBLIC_KEY_LENGTH) {
        return b;
      }
      const zeroPad = Buffer2.alloc(32);
      b.copy(zeroPad, 32 - b.length);
      return zeroPad;
    }
    get [Symbol.toStringTag]() {
      return `PublicKey(${this.toString()})`;
    }
    toString() {
      return this.toBase58();
    }
    static async createWithSeed(fromPublicKey, seed, programId) {
      const buffer = Buffer2.concat([fromPublicKey.toBuffer(), Buffer2.from(seed), programId.toBuffer()]);
      const publicKeyBytes = sha2562(buffer);
      return new PublicKey(publicKeyBytes);
    }
    static createProgramAddressSync(seeds, programId) {
      let buffer = Buffer2.alloc(0);
      seeds.forEach(function(seed) {
        if (seed.length > MAX_SEED_LENGTH) {
          throw new TypeError(`Max seed length exceeded`);
        }
        buffer = Buffer2.concat([buffer, toBuffer(seed)]);
      });
      buffer = Buffer2.concat([buffer, programId.toBuffer(), Buffer2.from("ProgramDerivedAddress")]);
      const publicKeyBytes = sha2562(buffer);
      if (isOnCurve(publicKeyBytes)) {
        throw new Error(`Invalid seeds, address must fall off the curve`);
      }
      return new PublicKey(publicKeyBytes);
    }
    static async createProgramAddress(seeds, programId) {
      return this.createProgramAddressSync(seeds, programId);
    }
    static findProgramAddressSync(seeds, programId) {
      let nonce = 255;
      let address;
      while (nonce != 0) {
        try {
          const seedsWithNonce = seeds.concat(Buffer2.from([nonce]));
          address = this.createProgramAddressSync(seedsWithNonce, programId);
        } catch (err) {
          if (err instanceof TypeError) {
            throw err;
          }
          nonce--;
          continue;
        }
        return [address, nonce];
      }
      throw new Error(`Unable to find a viable program address nonce`);
    }
    static async findProgramAddress(seeds, programId) {
      return this.findProgramAddressSync(seeds, programId);
    }
    static isOnCurve(pubkeyData) {
      const pubkey = new PublicKey(pubkeyData);
      return isOnCurve(pubkey.toBytes());
    }
  }
  _PublicKey = PublicKey;
  PublicKey.default = new _PublicKey("11111111111111111111111111111111");
  SOLANA_SCHEMA.set(PublicKey, {
    kind: "struct",
    fields: [["_bn", "u256"]]
  });
  var BPF_LOADER_DEPRECATED_PROGRAM_ID = new PublicKey("BPFLoader1111111111111111111111111111111111");
  var PACKET_DATA_SIZE = 1280 - 40 - 8;
  var VERSION_PREFIX_MASK = 127;
  var SIGNATURE_LENGTH_IN_BYTES = 64;

  class TransactionExpiredBlockheightExceededError extends Error {
    constructor(signature) {
      super(`Signature ${signature} has expired: block height exceeded.`);
      this.signature = undefined;
      this.signature = signature;
    }
  }
  Object.defineProperty(TransactionExpiredBlockheightExceededError.prototype, "name", {
    value: "TransactionExpiredBlockheightExceededError"
  });

  class TransactionExpiredTimeoutError extends Error {
    constructor(signature, timeoutSeconds) {
      super(`Transaction was not confirmed in ${timeoutSeconds.toFixed(2)} seconds. It is ` + "unknown if it succeeded or failed. Check signature " + `${signature} using the Solana Explorer or CLI tools.`);
      this.signature = undefined;
      this.signature = signature;
    }
  }
  Object.defineProperty(TransactionExpiredTimeoutError.prototype, "name", {
    value: "TransactionExpiredTimeoutError"
  });

  class TransactionExpiredNonceInvalidError extends Error {
    constructor(signature) {
      super(`Signature ${signature} has expired: the nonce is no longer valid.`);
      this.signature = undefined;
      this.signature = signature;
    }
  }
  Object.defineProperty(TransactionExpiredNonceInvalidError.prototype, "name", {
    value: "TransactionExpiredNonceInvalidError"
  });

  class MessageAccountKeys {
    constructor(staticAccountKeys, accountKeysFromLookups) {
      this.staticAccountKeys = undefined;
      this.accountKeysFromLookups = undefined;
      this.staticAccountKeys = staticAccountKeys;
      this.accountKeysFromLookups = accountKeysFromLookups;
    }
    keySegments() {
      const keySegments = [this.staticAccountKeys];
      if (this.accountKeysFromLookups) {
        keySegments.push(this.accountKeysFromLookups.writable);
        keySegments.push(this.accountKeysFromLookups.readonly);
      }
      return keySegments;
    }
    get(index) {
      for (const keySegment of this.keySegments()) {
        if (index < keySegment.length) {
          return keySegment[index];
        } else {
          index -= keySegment.length;
        }
      }
      return;
    }
    get length() {
      return this.keySegments().flat().length;
    }
    compileInstructions(instructions) {
      const U8_MAX = 255;
      if (this.length > U8_MAX + 1) {
        throw new Error("Account index overflow encountered during compilation");
      }
      const keyIndexMap = new Map;
      this.keySegments().flat().forEach((key, index) => {
        keyIndexMap.set(key.toBase58(), index);
      });
      const findKeyIndex = (key) => {
        const keyIndex = keyIndexMap.get(key.toBase58());
        if (keyIndex === undefined)
          throw new Error("Encountered an unknown instruction account key during compilation");
        return keyIndex;
      };
      return instructions.map((instruction) => {
        return {
          programIdIndex: findKeyIndex(instruction.programId),
          accountKeyIndexes: instruction.keys.map((meta) => findKeyIndex(meta.pubkey)),
          data: instruction.data
        };
      });
    }
  }
  var publicKey = (property = "publicKey") => {
    return BufferLayout.blob(32, property);
  };
  var rustString = (property = "string") => {
    const rsl = BufferLayout.struct([BufferLayout.u32("length"), BufferLayout.u32("lengthPadding"), BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), "chars")], property);
    const _decode = rsl.decode.bind(rsl);
    const _encode = rsl.encode.bind(rsl);
    const rslShim = rsl;
    rslShim.decode = (b, offset2) => {
      const data = _decode(b, offset2);
      return data["chars"].toString();
    };
    rslShim.encode = (str, b, offset2) => {
      const data = {
        chars: Buffer2.from(str, "utf8")
      };
      return _encode(data, b, offset2);
    };
    rslShim.alloc = (str) => {
      return BufferLayout.u32().span + BufferLayout.u32().span + Buffer2.from(str, "utf8").length;
    };
    return rslShim;
  };
  var authorized = (property = "authorized") => {
    return BufferLayout.struct([publicKey("staker"), publicKey("withdrawer")], property);
  };
  var lockup = (property = "lockup") => {
    return BufferLayout.struct([BufferLayout.ns64("unixTimestamp"), BufferLayout.ns64("epoch"), publicKey("custodian")], property);
  };
  var voteInit = (property = "voteInit") => {
    return BufferLayout.struct([publicKey("nodePubkey"), publicKey("authorizedVoter"), publicKey("authorizedWithdrawer"), BufferLayout.u8("commission")], property);
  };
  var voteAuthorizeWithSeedArgs = (property = "voteAuthorizeWithSeedArgs") => {
    return BufferLayout.struct([BufferLayout.u32("voteAuthorizationType"), publicKey("currentAuthorityDerivedKeyOwnerPubkey"), rustString("currentAuthorityDerivedKeySeed"), publicKey("newAuthorized")], property);
  };
  function getAlloc(type2, fields) {
    const getItemAlloc = (item) => {
      if (item.span >= 0) {
        return item.span;
      } else if (typeof item.alloc === "function") {
        return item.alloc(fields[item.property]);
      } else if ("count" in item && "elementLayout" in item) {
        const field = fields[item.property];
        if (Array.isArray(field)) {
          return field.length * getItemAlloc(item.elementLayout);
        }
      } else if ("fields" in item) {
        return getAlloc({
          layout: item
        }, fields[item.property]);
      }
      return 0;
    };
    let alloc2 = 0;
    type2.layout.fields.forEach((item) => {
      alloc2 += getItemAlloc(item);
    });
    return alloc2;
  }
  function decodeLength(bytes) {
    let len2 = 0;
    let size = 0;
    for (;; ) {
      let elem = bytes.shift();
      len2 |= (elem & 127) << size * 7;
      size += 1;
      if ((elem & 128) === 0) {
        break;
      }
    }
    return len2;
  }
  function encodeLength(bytes, len2) {
    let rem_len = len2;
    for (;; ) {
      let elem = rem_len & 127;
      rem_len >>= 7;
      if (rem_len == 0) {
        bytes.push(elem);
        break;
      } else {
        elem |= 128;
        bytes.push(elem);
      }
    }
  }
  function assert2(condition, message) {
    if (!condition) {
      throw new Error(message || "Assertion failed");
    }
  }

  class CompiledKeys {
    constructor(payer, keyMetaMap) {
      this.payer = undefined;
      this.keyMetaMap = undefined;
      this.payer = payer;
      this.keyMetaMap = keyMetaMap;
    }
    static compile(instructions, payer) {
      const keyMetaMap = new Map;
      const getOrInsertDefault = (pubkey) => {
        const address = pubkey.toBase58();
        let keyMeta = keyMetaMap.get(address);
        if (keyMeta === undefined) {
          keyMeta = {
            isSigner: false,
            isWritable: false,
            isInvoked: false
          };
          keyMetaMap.set(address, keyMeta);
        }
        return keyMeta;
      };
      const payerKeyMeta = getOrInsertDefault(payer);
      payerKeyMeta.isSigner = true;
      payerKeyMeta.isWritable = true;
      for (const ix of instructions) {
        getOrInsertDefault(ix.programId).isInvoked = true;
        for (const accountMeta of ix.keys) {
          const keyMeta = getOrInsertDefault(accountMeta.pubkey);
          keyMeta.isSigner ||= accountMeta.isSigner;
          keyMeta.isWritable ||= accountMeta.isWritable;
        }
      }
      return new CompiledKeys(payer, keyMetaMap);
    }
    getMessageComponents() {
      const mapEntries = [...this.keyMetaMap.entries()];
      assert2(mapEntries.length <= 256, "Max static account keys length exceeded");
      const writableSigners = mapEntries.filter(([, meta]) => meta.isSigner && meta.isWritable);
      const readonlySigners = mapEntries.filter(([, meta]) => meta.isSigner && !meta.isWritable);
      const writableNonSigners = mapEntries.filter(([, meta]) => !meta.isSigner && meta.isWritable);
      const readonlyNonSigners = mapEntries.filter(([, meta]) => !meta.isSigner && !meta.isWritable);
      const header = {
        numRequiredSignatures: writableSigners.length + readonlySigners.length,
        numReadonlySignedAccounts: readonlySigners.length,
        numReadonlyUnsignedAccounts: readonlyNonSigners.length
      };
      {
        assert2(writableSigners.length > 0, "Expected at least one writable signer key");
        const [payerAddress] = writableSigners[0];
        assert2(payerAddress === this.payer.toBase58(), "Expected first writable signer key to be the fee payer");
      }
      const staticAccountKeys = [...writableSigners.map(([address]) => new PublicKey(address)), ...readonlySigners.map(([address]) => new PublicKey(address)), ...writableNonSigners.map(([address]) => new PublicKey(address)), ...readonlyNonSigners.map(([address]) => new PublicKey(address))];
      return [header, staticAccountKeys];
    }
    extractTableLookup(lookupTable) {
      const [writableIndexes, drainedWritableKeys] = this.drainKeysFoundInLookupTable(lookupTable.state.addresses, (keyMeta) => !keyMeta.isSigner && !keyMeta.isInvoked && keyMeta.isWritable);
      const [readonlyIndexes, drainedReadonlyKeys] = this.drainKeysFoundInLookupTable(lookupTable.state.addresses, (keyMeta) => !keyMeta.isSigner && !keyMeta.isInvoked && !keyMeta.isWritable);
      if (writableIndexes.length === 0 && readonlyIndexes.length === 0) {
        return;
      }
      return [{
        accountKey: lookupTable.key,
        writableIndexes,
        readonlyIndexes
      }, {
        writable: drainedWritableKeys,
        readonly: drainedReadonlyKeys
      }];
    }
    drainKeysFoundInLookupTable(lookupTableEntries, keyMetaFilter) {
      const lookupTableIndexes = new Array;
      const drainedKeys = new Array;
      for (const [address, keyMeta] of this.keyMetaMap.entries()) {
        if (keyMetaFilter(keyMeta)) {
          const key = new PublicKey(address);
          const lookupTableIndex = lookupTableEntries.findIndex((entry) => entry.equals(key));
          if (lookupTableIndex >= 0) {
            assert2(lookupTableIndex < 256, "Max lookup table index exceeded");
            lookupTableIndexes.push(lookupTableIndex);
            drainedKeys.push(key);
            this.keyMetaMap.delete(address);
          }
        }
      }
      return [lookupTableIndexes, drainedKeys];
    }
  }
  var END_OF_BUFFER_ERROR_MESSAGE = "Reached end of buffer unexpectedly";
  function guardedShift(byteArray) {
    if (byteArray.length === 0) {
      throw new Error(END_OF_BUFFER_ERROR_MESSAGE);
    }
    return byteArray.shift();
  }
  function guardedSplice(byteArray, ...args) {
    const [start] = args;
    if (args.length === 2 ? start + (args[1] ?? 0) > byteArray.length : start >= byteArray.length) {
      throw new Error(END_OF_BUFFER_ERROR_MESSAGE);
    }
    return byteArray.splice(...args);
  }

  class Message {
    constructor(args) {
      this.header = undefined;
      this.accountKeys = undefined;
      this.recentBlockhash = undefined;
      this.instructions = undefined;
      this.indexToProgramIds = new Map;
      this.header = args.header;
      this.accountKeys = args.accountKeys.map((account) => new PublicKey(account));
      this.recentBlockhash = args.recentBlockhash;
      this.instructions = args.instructions;
      this.instructions.forEach((ix) => this.indexToProgramIds.set(ix.programIdIndex, this.accountKeys[ix.programIdIndex]));
    }
    get version() {
      return "legacy";
    }
    get staticAccountKeys() {
      return this.accountKeys;
    }
    get compiledInstructions() {
      return this.instructions.map((ix) => ({
        programIdIndex: ix.programIdIndex,
        accountKeyIndexes: ix.accounts,
        data: import_bs58.default.decode(ix.data)
      }));
    }
    get addressTableLookups() {
      return [];
    }
    getAccountKeys() {
      return new MessageAccountKeys(this.staticAccountKeys);
    }
    static compile(args) {
      const compiledKeys = CompiledKeys.compile(args.instructions, args.payerKey);
      const [header, staticAccountKeys] = compiledKeys.getMessageComponents();
      const accountKeys = new MessageAccountKeys(staticAccountKeys);
      const instructions = accountKeys.compileInstructions(args.instructions).map((ix) => ({
        programIdIndex: ix.programIdIndex,
        accounts: ix.accountKeyIndexes,
        data: import_bs58.default.encode(ix.data)
      }));
      return new Message({
        header,
        accountKeys: staticAccountKeys,
        recentBlockhash: args.recentBlockhash,
        instructions
      });
    }
    isAccountSigner(index) {
      return index < this.header.numRequiredSignatures;
    }
    isAccountWritable(index) {
      const numSignedAccounts = this.header.numRequiredSignatures;
      if (index >= this.header.numRequiredSignatures) {
        const unsignedAccountIndex = index - numSignedAccounts;
        const numUnsignedAccounts = this.accountKeys.length - numSignedAccounts;
        const numWritableUnsignedAccounts = numUnsignedAccounts - this.header.numReadonlyUnsignedAccounts;
        return unsignedAccountIndex < numWritableUnsignedAccounts;
      } else {
        const numWritableSignedAccounts = numSignedAccounts - this.header.numReadonlySignedAccounts;
        return index < numWritableSignedAccounts;
      }
    }
    isProgramId(index) {
      return this.indexToProgramIds.has(index);
    }
    programIds() {
      return [...this.indexToProgramIds.values()];
    }
    nonProgramIds() {
      return this.accountKeys.filter((_, index) => !this.isProgramId(index));
    }
    serialize() {
      const numKeys = this.accountKeys.length;
      let keyCount = [];
      encodeLength(keyCount, numKeys);
      const instructions = this.instructions.map((instruction) => {
        const {
          accounts,
          programIdIndex
        } = instruction;
        const data = Array.from(import_bs58.default.decode(instruction.data));
        let keyIndicesCount = [];
        encodeLength(keyIndicesCount, accounts.length);
        let dataCount = [];
        encodeLength(dataCount, data.length);
        return {
          programIdIndex,
          keyIndicesCount: Buffer2.from(keyIndicesCount),
          keyIndices: accounts,
          dataLength: Buffer2.from(dataCount),
          data
        };
      });
      let instructionCount = [];
      encodeLength(instructionCount, instructions.length);
      let instructionBuffer = Buffer2.alloc(PACKET_DATA_SIZE);
      Buffer2.from(instructionCount).copy(instructionBuffer);
      let instructionBufferLength = instructionCount.length;
      instructions.forEach((instruction) => {
        const instructionLayout = BufferLayout.struct([BufferLayout.u8("programIdIndex"), BufferLayout.blob(instruction.keyIndicesCount.length, "keyIndicesCount"), BufferLayout.seq(BufferLayout.u8("keyIndex"), instruction.keyIndices.length, "keyIndices"), BufferLayout.blob(instruction.dataLength.length, "dataLength"), BufferLayout.seq(BufferLayout.u8("userdatum"), instruction.data.length, "data")]);
        const length2 = instructionLayout.encode(instruction, instructionBuffer, instructionBufferLength);
        instructionBufferLength += length2;
      });
      instructionBuffer = instructionBuffer.slice(0, instructionBufferLength);
      const signDataLayout = BufferLayout.struct([BufferLayout.blob(1, "numRequiredSignatures"), BufferLayout.blob(1, "numReadonlySignedAccounts"), BufferLayout.blob(1, "numReadonlyUnsignedAccounts"), BufferLayout.blob(keyCount.length, "keyCount"), BufferLayout.seq(publicKey("key"), numKeys, "keys"), publicKey("recentBlockhash")]);
      const transaction = {
        numRequiredSignatures: Buffer2.from([this.header.numRequiredSignatures]),
        numReadonlySignedAccounts: Buffer2.from([this.header.numReadonlySignedAccounts]),
        numReadonlyUnsignedAccounts: Buffer2.from([this.header.numReadonlyUnsignedAccounts]),
        keyCount: Buffer2.from(keyCount),
        keys: this.accountKeys.map((key) => toBuffer(key.toBytes())),
        recentBlockhash: import_bs58.default.decode(this.recentBlockhash)
      };
      let signData = Buffer2.alloc(2048);
      const length = signDataLayout.encode(transaction, signData);
      instructionBuffer.copy(signData, length);
      return signData.slice(0, length + instructionBuffer.length);
    }
    static from(buffer) {
      let byteArray = [...buffer];
      const numRequiredSignatures = guardedShift(byteArray);
      if (numRequiredSignatures !== (numRequiredSignatures & VERSION_PREFIX_MASK)) {
        throw new Error("Versioned messages must be deserialized with VersionedMessage.deserialize()");
      }
      const numReadonlySignedAccounts = guardedShift(byteArray);
      const numReadonlyUnsignedAccounts = guardedShift(byteArray);
      const accountCount = decodeLength(byteArray);
      let accountKeys = [];
      for (let i3 = 0;i3 < accountCount; i3++) {
        const account = guardedSplice(byteArray, 0, PUBLIC_KEY_LENGTH);
        accountKeys.push(new PublicKey(Buffer2.from(account)));
      }
      const recentBlockhash = guardedSplice(byteArray, 0, PUBLIC_KEY_LENGTH);
      const instructionCount = decodeLength(byteArray);
      let instructions = [];
      for (let i3 = 0;i3 < instructionCount; i3++) {
        const programIdIndex = guardedShift(byteArray);
        const accountCount2 = decodeLength(byteArray);
        const accounts = guardedSplice(byteArray, 0, accountCount2);
        const dataLength = decodeLength(byteArray);
        const dataSlice = guardedSplice(byteArray, 0, dataLength);
        const data = import_bs58.default.encode(Buffer2.from(dataSlice));
        instructions.push({
          programIdIndex,
          accounts,
          data
        });
      }
      const messageArgs = {
        header: {
          numRequiredSignatures,
          numReadonlySignedAccounts,
          numReadonlyUnsignedAccounts
        },
        recentBlockhash: import_bs58.default.encode(Buffer2.from(recentBlockhash)),
        accountKeys,
        instructions
      };
      return new Message(messageArgs);
    }
  }

  class MessageV0 {
    constructor(args) {
      this.header = undefined;
      this.staticAccountKeys = undefined;
      this.recentBlockhash = undefined;
      this.compiledInstructions = undefined;
      this.addressTableLookups = undefined;
      this.header = args.header;
      this.staticAccountKeys = args.staticAccountKeys;
      this.recentBlockhash = args.recentBlockhash;
      this.compiledInstructions = args.compiledInstructions;
      this.addressTableLookups = args.addressTableLookups;
    }
    get version() {
      return 0;
    }
    get numAccountKeysFromLookups() {
      let count = 0;
      for (const lookup2 of this.addressTableLookups) {
        count += lookup2.readonlyIndexes.length + lookup2.writableIndexes.length;
      }
      return count;
    }
    getAccountKeys(args) {
      let accountKeysFromLookups;
      if (args && "accountKeysFromLookups" in args && args.accountKeysFromLookups) {
        if (this.numAccountKeysFromLookups != args.accountKeysFromLookups.writable.length + args.accountKeysFromLookups.readonly.length) {
          throw new Error("Failed to get account keys because of a mismatch in the number of account keys from lookups");
        }
        accountKeysFromLookups = args.accountKeysFromLookups;
      } else if (args && "addressLookupTableAccounts" in args && args.addressLookupTableAccounts) {
        accountKeysFromLookups = this.resolveAddressTableLookups(args.addressLookupTableAccounts);
      } else if (this.addressTableLookups.length > 0) {
        throw new Error("Failed to get account keys because address table lookups were not resolved");
      }
      return new MessageAccountKeys(this.staticAccountKeys, accountKeysFromLookups);
    }
    isAccountSigner(index) {
      return index < this.header.numRequiredSignatures;
    }
    isAccountWritable(index) {
      const numSignedAccounts = this.header.numRequiredSignatures;
      const numStaticAccountKeys = this.staticAccountKeys.length;
      if (index >= numStaticAccountKeys) {
        const lookupAccountKeysIndex = index - numStaticAccountKeys;
        const numWritableLookupAccountKeys = this.addressTableLookups.reduce((count, lookup2) => count + lookup2.writableIndexes.length, 0);
        return lookupAccountKeysIndex < numWritableLookupAccountKeys;
      } else if (index >= this.header.numRequiredSignatures) {
        const unsignedAccountIndex = index - numSignedAccounts;
        const numUnsignedAccounts = numStaticAccountKeys - numSignedAccounts;
        const numWritableUnsignedAccounts = numUnsignedAccounts - this.header.numReadonlyUnsignedAccounts;
        return unsignedAccountIndex < numWritableUnsignedAccounts;
      } else {
        const numWritableSignedAccounts = numSignedAccounts - this.header.numReadonlySignedAccounts;
        return index < numWritableSignedAccounts;
      }
    }
    resolveAddressTableLookups(addressLookupTableAccounts) {
      const accountKeysFromLookups = {
        writable: [],
        readonly: []
      };
      for (const tableLookup of this.addressTableLookups) {
        const tableAccount = addressLookupTableAccounts.find((account) => account.key.equals(tableLookup.accountKey));
        if (!tableAccount) {
          throw new Error(`Failed to find address lookup table account for table key ${tableLookup.accountKey.toBase58()}`);
        }
        for (const index of tableLookup.writableIndexes) {
          if (index < tableAccount.state.addresses.length) {
            accountKeysFromLookups.writable.push(tableAccount.state.addresses[index]);
          } else {
            throw new Error(`Failed to find address for index ${index} in address lookup table ${tableLookup.accountKey.toBase58()}`);
          }
        }
        for (const index of tableLookup.readonlyIndexes) {
          if (index < tableAccount.state.addresses.length) {
            accountKeysFromLookups.readonly.push(tableAccount.state.addresses[index]);
          } else {
            throw new Error(`Failed to find address for index ${index} in address lookup table ${tableLookup.accountKey.toBase58()}`);
          }
        }
      }
      return accountKeysFromLookups;
    }
    static compile(args) {
      const compiledKeys = CompiledKeys.compile(args.instructions, args.payerKey);
      const addressTableLookups = new Array;
      const accountKeysFromLookups = {
        writable: new Array,
        readonly: new Array
      };
      const lookupTableAccounts = args.addressLookupTableAccounts || [];
      for (const lookupTable of lookupTableAccounts) {
        const extractResult = compiledKeys.extractTableLookup(lookupTable);
        if (extractResult !== undefined) {
          const [addressTableLookup, {
            writable,
            readonly
          }] = extractResult;
          addressTableLookups.push(addressTableLookup);
          accountKeysFromLookups.writable.push(...writable);
          accountKeysFromLookups.readonly.push(...readonly);
        }
      }
      const [header, staticAccountKeys] = compiledKeys.getMessageComponents();
      const accountKeys = new MessageAccountKeys(staticAccountKeys, accountKeysFromLookups);
      const compiledInstructions = accountKeys.compileInstructions(args.instructions);
      return new MessageV0({
        header,
        staticAccountKeys,
        recentBlockhash: args.recentBlockhash,
        compiledInstructions,
        addressTableLookups
      });
    }
    serialize() {
      const encodedStaticAccountKeysLength = Array();
      encodeLength(encodedStaticAccountKeysLength, this.staticAccountKeys.length);
      const serializedInstructions = this.serializeInstructions();
      const encodedInstructionsLength = Array();
      encodeLength(encodedInstructionsLength, this.compiledInstructions.length);
      const serializedAddressTableLookups = this.serializeAddressTableLookups();
      const encodedAddressTableLookupsLength = Array();
      encodeLength(encodedAddressTableLookupsLength, this.addressTableLookups.length);
      const messageLayout = BufferLayout.struct([BufferLayout.u8("prefix"), BufferLayout.struct([BufferLayout.u8("numRequiredSignatures"), BufferLayout.u8("numReadonlySignedAccounts"), BufferLayout.u8("numReadonlyUnsignedAccounts")], "header"), BufferLayout.blob(encodedStaticAccountKeysLength.length, "staticAccountKeysLength"), BufferLayout.seq(publicKey(), this.staticAccountKeys.length, "staticAccountKeys"), publicKey("recentBlockhash"), BufferLayout.blob(encodedInstructionsLength.length, "instructionsLength"), BufferLayout.blob(serializedInstructions.length, "serializedInstructions"), BufferLayout.blob(encodedAddressTableLookupsLength.length, "addressTableLookupsLength"), BufferLayout.blob(serializedAddressTableLookups.length, "serializedAddressTableLookups")]);
      const serializedMessage = new Uint8Array(PACKET_DATA_SIZE);
      const MESSAGE_VERSION_0_PREFIX = 1 << 7;
      const serializedMessageLength = messageLayout.encode({
        prefix: MESSAGE_VERSION_0_PREFIX,
        header: this.header,
        staticAccountKeysLength: new Uint8Array(encodedStaticAccountKeysLength),
        staticAccountKeys: this.staticAccountKeys.map((key) => key.toBytes()),
        recentBlockhash: import_bs58.default.decode(this.recentBlockhash),
        instructionsLength: new Uint8Array(encodedInstructionsLength),
        serializedInstructions,
        addressTableLookupsLength: new Uint8Array(encodedAddressTableLookupsLength),
        serializedAddressTableLookups
      }, serializedMessage);
      return serializedMessage.slice(0, serializedMessageLength);
    }
    serializeInstructions() {
      let serializedLength = 0;
      const serializedInstructions = new Uint8Array(PACKET_DATA_SIZE);
      for (const instruction of this.compiledInstructions) {
        const encodedAccountKeyIndexesLength = Array();
        encodeLength(encodedAccountKeyIndexesLength, instruction.accountKeyIndexes.length);
        const encodedDataLength = Array();
        encodeLength(encodedDataLength, instruction.data.length);
        const instructionLayout = BufferLayout.struct([BufferLayout.u8("programIdIndex"), BufferLayout.blob(encodedAccountKeyIndexesLength.length, "encodedAccountKeyIndexesLength"), BufferLayout.seq(BufferLayout.u8(), instruction.accountKeyIndexes.length, "accountKeyIndexes"), BufferLayout.blob(encodedDataLength.length, "encodedDataLength"), BufferLayout.blob(instruction.data.length, "data")]);
        serializedLength += instructionLayout.encode({
          programIdIndex: instruction.programIdIndex,
          encodedAccountKeyIndexesLength: new Uint8Array(encodedAccountKeyIndexesLength),
          accountKeyIndexes: instruction.accountKeyIndexes,
          encodedDataLength: new Uint8Array(encodedDataLength),
          data: instruction.data
        }, serializedInstructions, serializedLength);
      }
      return serializedInstructions.slice(0, serializedLength);
    }
    serializeAddressTableLookups() {
      let serializedLength = 0;
      const serializedAddressTableLookups = new Uint8Array(PACKET_DATA_SIZE);
      for (const lookup2 of this.addressTableLookups) {
        const encodedWritableIndexesLength = Array();
        encodeLength(encodedWritableIndexesLength, lookup2.writableIndexes.length);
        const encodedReadonlyIndexesLength = Array();
        encodeLength(encodedReadonlyIndexesLength, lookup2.readonlyIndexes.length);
        const addressTableLookupLayout = BufferLayout.struct([publicKey("accountKey"), BufferLayout.blob(encodedWritableIndexesLength.length, "encodedWritableIndexesLength"), BufferLayout.seq(BufferLayout.u8(), lookup2.writableIndexes.length, "writableIndexes"), BufferLayout.blob(encodedReadonlyIndexesLength.length, "encodedReadonlyIndexesLength"), BufferLayout.seq(BufferLayout.u8(), lookup2.readonlyIndexes.length, "readonlyIndexes")]);
        serializedLength += addressTableLookupLayout.encode({
          accountKey: lookup2.accountKey.toBytes(),
          encodedWritableIndexesLength: new Uint8Array(encodedWritableIndexesLength),
          writableIndexes: lookup2.writableIndexes,
          encodedReadonlyIndexesLength: new Uint8Array(encodedReadonlyIndexesLength),
          readonlyIndexes: lookup2.readonlyIndexes
        }, serializedAddressTableLookups, serializedLength);
      }
      return serializedAddressTableLookups.slice(0, serializedLength);
    }
    static deserialize(serializedMessage) {
      let byteArray = [...serializedMessage];
      const prefix = guardedShift(byteArray);
      const maskedPrefix = prefix & VERSION_PREFIX_MASK;
      assert2(prefix !== maskedPrefix, `Expected versioned message but received legacy message`);
      const version2 = maskedPrefix;
      assert2(version2 === 0, `Expected versioned message with version 0 but found version ${version2}`);
      const header = {
        numRequiredSignatures: guardedShift(byteArray),
        numReadonlySignedAccounts: guardedShift(byteArray),
        numReadonlyUnsignedAccounts: guardedShift(byteArray)
      };
      const staticAccountKeys = [];
      const staticAccountKeysLength = decodeLength(byteArray);
      for (let i3 = 0;i3 < staticAccountKeysLength; i3++) {
        staticAccountKeys.push(new PublicKey(guardedSplice(byteArray, 0, PUBLIC_KEY_LENGTH)));
      }
      const recentBlockhash = import_bs58.default.encode(guardedSplice(byteArray, 0, PUBLIC_KEY_LENGTH));
      const instructionCount = decodeLength(byteArray);
      const compiledInstructions = [];
      for (let i3 = 0;i3 < instructionCount; i3++) {
        const programIdIndex = guardedShift(byteArray);
        const accountKeyIndexesLength = decodeLength(byteArray);
        const accountKeyIndexes = guardedSplice(byteArray, 0, accountKeyIndexesLength);
        const dataLength = decodeLength(byteArray);
        const data = new Uint8Array(guardedSplice(byteArray, 0, dataLength));
        compiledInstructions.push({
          programIdIndex,
          accountKeyIndexes,
          data
        });
      }
      const addressTableLookupsCount = decodeLength(byteArray);
      const addressTableLookups = [];
      for (let i3 = 0;i3 < addressTableLookupsCount; i3++) {
        const accountKey = new PublicKey(guardedSplice(byteArray, 0, PUBLIC_KEY_LENGTH));
        const writableIndexesLength = decodeLength(byteArray);
        const writableIndexes = guardedSplice(byteArray, 0, writableIndexesLength);
        const readonlyIndexesLength = decodeLength(byteArray);
        const readonlyIndexes = guardedSplice(byteArray, 0, readonlyIndexesLength);
        addressTableLookups.push({
          accountKey,
          writableIndexes,
          readonlyIndexes
        });
      }
      return new MessageV0({
        header,
        staticAccountKeys,
        recentBlockhash,
        compiledInstructions,
        addressTableLookups
      });
    }
  }
  var TransactionStatus = /* @__PURE__ */ function(TransactionStatus2) {
    TransactionStatus2[TransactionStatus2["BLOCKHEIGHT_EXCEEDED"] = 0] = "BLOCKHEIGHT_EXCEEDED";
    TransactionStatus2[TransactionStatus2["PROCESSED"] = 1] = "PROCESSED";
    TransactionStatus2[TransactionStatus2["TIMED_OUT"] = 2] = "TIMED_OUT";
    TransactionStatus2[TransactionStatus2["NONCE_INVALID"] = 3] = "NONCE_INVALID";
    return TransactionStatus2;
  }({});
  var DEFAULT_SIGNATURE = Buffer2.alloc(SIGNATURE_LENGTH_IN_BYTES).fill(0);

  class TransactionInstruction {
    constructor(opts) {
      this.keys = undefined;
      this.programId = undefined;
      this.data = Buffer2.alloc(0);
      this.programId = opts.programId;
      this.keys = opts.keys;
      if (opts.data) {
        this.data = opts.data;
      }
    }
    toJSON() {
      return {
        keys: this.keys.map(({
          pubkey,
          isSigner,
          isWritable
        }) => ({
          pubkey: pubkey.toJSON(),
          isSigner,
          isWritable
        })),
        programId: this.programId.toJSON(),
        data: [...this.data]
      };
    }
  }

  class Transaction {
    get signature() {
      if (this.signatures.length > 0) {
        return this.signatures[0].signature;
      }
      return null;
    }
    constructor(opts) {
      this.signatures = [];
      this.feePayer = undefined;
      this.instructions = [];
      this.recentBlockhash = undefined;
      this.lastValidBlockHeight = undefined;
      this.nonceInfo = undefined;
      this.minNonceContextSlot = undefined;
      this._message = undefined;
      this._json = undefined;
      if (!opts) {
        return;
      }
      if (opts.feePayer) {
        this.feePayer = opts.feePayer;
      }
      if (opts.signatures) {
        this.signatures = opts.signatures;
      }
      if (Object.prototype.hasOwnProperty.call(opts, "nonceInfo")) {
        const {
          minContextSlot,
          nonceInfo
        } = opts;
        this.minNonceContextSlot = minContextSlot;
        this.nonceInfo = nonceInfo;
      } else if (Object.prototype.hasOwnProperty.call(opts, "lastValidBlockHeight")) {
        const {
          blockhash,
          lastValidBlockHeight
        } = opts;
        this.recentBlockhash = blockhash;
        this.lastValidBlockHeight = lastValidBlockHeight;
      } else {
        const {
          recentBlockhash,
          nonceInfo
        } = opts;
        if (nonceInfo) {
          this.nonceInfo = nonceInfo;
        }
        this.recentBlockhash = recentBlockhash;
      }
    }
    toJSON() {
      return {
        recentBlockhash: this.recentBlockhash || null,
        feePayer: this.feePayer ? this.feePayer.toJSON() : null,
        nonceInfo: this.nonceInfo ? {
          nonce: this.nonceInfo.nonce,
          nonceInstruction: this.nonceInfo.nonceInstruction.toJSON()
        } : null,
        instructions: this.instructions.map((instruction) => instruction.toJSON()),
        signers: this.signatures.map(({
          publicKey: publicKey2
        }) => {
          return publicKey2.toJSON();
        })
      };
    }
    add(...items) {
      if (items.length === 0) {
        throw new Error("No instructions");
      }
      items.forEach((item) => {
        if ("instructions" in item) {
          this.instructions = this.instructions.concat(item.instructions);
        } else if ("data" in item && "programId" in item && "keys" in item) {
          this.instructions.push(item);
        } else {
          this.instructions.push(new TransactionInstruction(item));
        }
      });
      return this;
    }
    compileMessage() {
      if (this._message && JSON.stringify(this.toJSON()) === JSON.stringify(this._json)) {
        return this._message;
      }
      let recentBlockhash;
      let instructions;
      if (this.nonceInfo) {
        recentBlockhash = this.nonceInfo.nonce;
        if (this.instructions[0] != this.nonceInfo.nonceInstruction) {
          instructions = [this.nonceInfo.nonceInstruction, ...this.instructions];
        } else {
          instructions = this.instructions;
        }
      } else {
        recentBlockhash = this.recentBlockhash;
        instructions = this.instructions;
      }
      if (!recentBlockhash) {
        throw new Error("Transaction recentBlockhash required");
      }
      if (instructions.length < 1) {
        console.warn("No instructions provided");
      }
      let feePayer;
      if (this.feePayer) {
        feePayer = this.feePayer;
      } else if (this.signatures.length > 0 && this.signatures[0].publicKey) {
        feePayer = this.signatures[0].publicKey;
      } else {
        throw new Error("Transaction fee payer required");
      }
      for (let i3 = 0;i3 < instructions.length; i3++) {
        if (instructions[i3].programId === undefined) {
          throw new Error(`Transaction instruction index ${i3} has undefined program id`);
        }
      }
      const programIds = [];
      const accountMetas = [];
      instructions.forEach((instruction) => {
        instruction.keys.forEach((accountMeta) => {
          accountMetas.push({
            ...accountMeta
          });
        });
        const programId = instruction.programId.toString();
        if (!programIds.includes(programId)) {
          programIds.push(programId);
        }
      });
      programIds.forEach((programId) => {
        accountMetas.push({
          pubkey: new PublicKey(programId),
          isSigner: false,
          isWritable: false
        });
      });
      const uniqueMetas = [];
      accountMetas.forEach((accountMeta) => {
        const pubkeyString = accountMeta.pubkey.toString();
        const uniqueIndex = uniqueMetas.findIndex((x) => {
          return x.pubkey.toString() === pubkeyString;
        });
        if (uniqueIndex > -1) {
          uniqueMetas[uniqueIndex].isWritable = uniqueMetas[uniqueIndex].isWritable || accountMeta.isWritable;
          uniqueMetas[uniqueIndex].isSigner = uniqueMetas[uniqueIndex].isSigner || accountMeta.isSigner;
        } else {
          uniqueMetas.push(accountMeta);
        }
      });
      uniqueMetas.sort(function(x, y) {
        if (x.isSigner !== y.isSigner) {
          return x.isSigner ? -1 : 1;
        }
        if (x.isWritable !== y.isWritable) {
          return x.isWritable ? -1 : 1;
        }
        const options = {
          localeMatcher: "best fit",
          usage: "sort",
          sensitivity: "variant",
          ignorePunctuation: false,
          numeric: false,
          caseFirst: "lower"
        };
        return x.pubkey.toBase58().localeCompare(y.pubkey.toBase58(), "en", options);
      });
      const feePayerIndex = uniqueMetas.findIndex((x) => {
        return x.pubkey.equals(feePayer);
      });
      if (feePayerIndex > -1) {
        const [payerMeta] = uniqueMetas.splice(feePayerIndex, 1);
        payerMeta.isSigner = true;
        payerMeta.isWritable = true;
        uniqueMetas.unshift(payerMeta);
      } else {
        uniqueMetas.unshift({
          pubkey: feePayer,
          isSigner: true,
          isWritable: true
        });
      }
      for (const signature of this.signatures) {
        const uniqueIndex = uniqueMetas.findIndex((x) => {
          return x.pubkey.equals(signature.publicKey);
        });
        if (uniqueIndex > -1) {
          if (!uniqueMetas[uniqueIndex].isSigner) {
            uniqueMetas[uniqueIndex].isSigner = true;
            console.warn("Transaction references a signature that is unnecessary, " + "only the fee payer and instruction signer accounts should sign a transaction. " + "This behavior is deprecated and will throw an error in the next major version release.");
          }
        } else {
          throw new Error(`unknown signer: ${signature.publicKey.toString()}`);
        }
      }
      let numRequiredSignatures = 0;
      let numReadonlySignedAccounts = 0;
      let numReadonlyUnsignedAccounts = 0;
      const signedKeys = [];
      const unsignedKeys = [];
      uniqueMetas.forEach(({
        pubkey,
        isSigner,
        isWritable
      }) => {
        if (isSigner) {
          signedKeys.push(pubkey.toString());
          numRequiredSignatures += 1;
          if (!isWritable) {
            numReadonlySignedAccounts += 1;
          }
        } else {
          unsignedKeys.push(pubkey.toString());
          if (!isWritable) {
            numReadonlyUnsignedAccounts += 1;
          }
        }
      });
      const accountKeys = signedKeys.concat(unsignedKeys);
      const compiledInstructions = instructions.map((instruction) => {
        const {
          data,
          programId
        } = instruction;
        return {
          programIdIndex: accountKeys.indexOf(programId.toString()),
          accounts: instruction.keys.map((meta) => accountKeys.indexOf(meta.pubkey.toString())),
          data: import_bs58.default.encode(data)
        };
      });
      compiledInstructions.forEach((instruction) => {
        assert2(instruction.programIdIndex >= 0);
        instruction.accounts.forEach((keyIndex) => assert2(keyIndex >= 0));
      });
      return new Message({
        header: {
          numRequiredSignatures,
          numReadonlySignedAccounts,
          numReadonlyUnsignedAccounts
        },
        accountKeys,
        recentBlockhash,
        instructions: compiledInstructions
      });
    }
    _compile() {
      const message = this.compileMessage();
      const signedKeys = message.accountKeys.slice(0, message.header.numRequiredSignatures);
      if (this.signatures.length === signedKeys.length) {
        const valid = this.signatures.every((pair, index) => {
          return signedKeys[index].equals(pair.publicKey);
        });
        if (valid)
          return message;
      }
      this.signatures = signedKeys.map((publicKey2) => ({
        signature: null,
        publicKey: publicKey2
      }));
      return message;
    }
    serializeMessage() {
      return this._compile().serialize();
    }
    async getEstimatedFee(connection) {
      return (await connection.getFeeForMessage(this.compileMessage())).value;
    }
    setSigners(...signers) {
      if (signers.length === 0) {
        throw new Error("No signers");
      }
      const seen = new Set;
      this.signatures = signers.filter((publicKey2) => {
        const key = publicKey2.toString();
        if (seen.has(key)) {
          return false;
        } else {
          seen.add(key);
          return true;
        }
      }).map((publicKey2) => ({
        signature: null,
        publicKey: publicKey2
      }));
    }
    sign(...signers) {
      if (signers.length === 0) {
        throw new Error("No signers");
      }
      const seen = new Set;
      const uniqueSigners = [];
      for (const signer of signers) {
        const key = signer.publicKey.toString();
        if (seen.has(key)) {
          continue;
        } else {
          seen.add(key);
          uniqueSigners.push(signer);
        }
      }
      this.signatures = uniqueSigners.map((signer) => ({
        signature: null,
        publicKey: signer.publicKey
      }));
      const message = this._compile();
      this._partialSign(message, ...uniqueSigners);
    }
    partialSign(...signers) {
      if (signers.length === 0) {
        throw new Error("No signers");
      }
      const seen = new Set;
      const uniqueSigners = [];
      for (const signer of signers) {
        const key = signer.publicKey.toString();
        if (seen.has(key)) {
          continue;
        } else {
          seen.add(key);
          uniqueSigners.push(signer);
        }
      }
      const message = this._compile();
      this._partialSign(message, ...uniqueSigners);
    }
    _partialSign(message, ...signers) {
      const signData = message.serialize();
      signers.forEach((signer) => {
        const signature = sign(signData, signer.secretKey);
        this._addSignature(signer.publicKey, toBuffer(signature));
      });
    }
    addSignature(pubkey, signature) {
      this._compile();
      this._addSignature(pubkey, signature);
    }
    _addSignature(pubkey, signature) {
      assert2(signature.length === 64);
      const index = this.signatures.findIndex((sigpair) => pubkey.equals(sigpair.publicKey));
      if (index < 0) {
        throw new Error(`unknown signer: ${pubkey.toString()}`);
      }
      this.signatures[index].signature = Buffer2.from(signature);
    }
    verifySignatures(requireAllSignatures = true) {
      const signatureErrors = this._getMessageSignednessErrors(this.serializeMessage(), requireAllSignatures);
      return !signatureErrors;
    }
    _getMessageSignednessErrors(message, requireAllSignatures) {
      const errors = {};
      for (const {
        signature,
        publicKey: publicKey2
      } of this.signatures) {
        if (signature === null) {
          if (requireAllSignatures) {
            (errors.missing ||= []).push(publicKey2);
          }
        } else {
          if (!verify(signature, message, publicKey2.toBytes())) {
            (errors.invalid ||= []).push(publicKey2);
          }
        }
      }
      return errors.invalid || errors.missing ? errors : undefined;
    }
    serialize(config) {
      const {
        requireAllSignatures,
        verifySignatures
      } = Object.assign({
        requireAllSignatures: true,
        verifySignatures: true
      }, config);
      const signData = this.serializeMessage();
      if (verifySignatures) {
        const sigErrors = this._getMessageSignednessErrors(signData, requireAllSignatures);
        if (sigErrors) {
          let errorMessage = "Signature verification failed.";
          if (sigErrors.invalid) {
            errorMessage += `
Invalid signature for public key${sigErrors.invalid.length === 1 ? "" : "(s)"} [\`${sigErrors.invalid.map((p) => p.toBase58()).join("`, `")}\`].`;
          }
          if (sigErrors.missing) {
            errorMessage += `
Missing signature for public key${sigErrors.missing.length === 1 ? "" : "(s)"} [\`${sigErrors.missing.map((p) => p.toBase58()).join("`, `")}\`].`;
          }
          throw new Error(errorMessage);
        }
      }
      return this._serialize(signData);
    }
    _serialize(signData) {
      const {
        signatures
      } = this;
      const signatureCount = [];
      encodeLength(signatureCount, signatures.length);
      const transactionLength = signatureCount.length + signatures.length * 64 + signData.length;
      const wireTransaction = Buffer2.alloc(transactionLength);
      assert2(signatures.length < 256);
      Buffer2.from(signatureCount).copy(wireTransaction, 0);
      signatures.forEach(({
        signature
      }, index) => {
        if (signature !== null) {
          assert2(signature.length === 64, `signature has invalid length`);
          Buffer2.from(signature).copy(wireTransaction, signatureCount.length + index * 64);
        }
      });
      signData.copy(wireTransaction, signatureCount.length + signatures.length * 64);
      assert2(wireTransaction.length <= PACKET_DATA_SIZE, `Transaction too large: ${wireTransaction.length} > ${PACKET_DATA_SIZE}`);
      return wireTransaction;
    }
    get keys() {
      assert2(this.instructions.length === 1);
      return this.instructions[0].keys.map((keyObj) => keyObj.pubkey);
    }
    get programId() {
      assert2(this.instructions.length === 1);
      return this.instructions[0].programId;
    }
    get data() {
      assert2(this.instructions.length === 1);
      return this.instructions[0].data;
    }
    static from(buffer) {
      let byteArray = [...buffer];
      const signatureCount = decodeLength(byteArray);
      let signatures = [];
      for (let i3 = 0;i3 < signatureCount; i3++) {
        const signature = guardedSplice(byteArray, 0, SIGNATURE_LENGTH_IN_BYTES);
        signatures.push(import_bs58.default.encode(Buffer2.from(signature)));
      }
      return Transaction.populate(Message.from(byteArray), signatures);
    }
    static populate(message, signatures = []) {
      const transaction = new Transaction;
      transaction.recentBlockhash = message.recentBlockhash;
      if (message.header.numRequiredSignatures > 0) {
        transaction.feePayer = message.accountKeys[0];
      }
      signatures.forEach((signature, index) => {
        const sigPubkeyPair = {
          signature: signature == import_bs58.default.encode(DEFAULT_SIGNATURE) ? null : import_bs58.default.decode(signature),
          publicKey: message.accountKeys[index]
        };
        transaction.signatures.push(sigPubkeyPair);
      });
      message.instructions.forEach((instruction) => {
        const keys = instruction.accounts.map((account) => {
          const pubkey = message.accountKeys[account];
          return {
            pubkey,
            isSigner: transaction.signatures.some((keyObj) => keyObj.publicKey.toString() === pubkey.toString()) || message.isAccountSigner(account),
            isWritable: message.isAccountWritable(account)
          };
        });
        transaction.instructions.push(new TransactionInstruction({
          keys,
          programId: message.accountKeys[instruction.programIdIndex],
          data: import_bs58.default.decode(instruction.data)
        }));
      });
      transaction._message = message;
      transaction._json = transaction.toJSON();
      return transaction;
    }
  }
  var NUM_TICKS_PER_SECOND = 160;
  var DEFAULT_TICKS_PER_SLOT = 64;
  var NUM_SLOTS_PER_SECOND = NUM_TICKS_PER_SECOND / DEFAULT_TICKS_PER_SLOT;
  var MS_PER_SLOT = 1000 / NUM_SLOTS_PER_SECOND;
  var SYSVAR_CLOCK_PUBKEY = new PublicKey("SysvarC1ock11111111111111111111111111111111");
  var SYSVAR_EPOCH_SCHEDULE_PUBKEY = new PublicKey("SysvarEpochSchedu1e111111111111111111111111");
  var SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey("Sysvar1nstructions1111111111111111111111111");
  var SYSVAR_RECENT_BLOCKHASHES_PUBKEY = new PublicKey("SysvarRecentB1ockHashes11111111111111111111");
  var SYSVAR_RENT_PUBKEY = new PublicKey("SysvarRent111111111111111111111111111111111");
  var SYSVAR_REWARDS_PUBKEY = new PublicKey("SysvarRewards111111111111111111111111111111");
  var SYSVAR_SLOT_HASHES_PUBKEY = new PublicKey("SysvarS1otHashes111111111111111111111111111");
  var SYSVAR_SLOT_HISTORY_PUBKEY = new PublicKey("SysvarS1otHistory11111111111111111111111111");
  var SYSVAR_STAKE_HISTORY_PUBKEY = new PublicKey("SysvarStakeHistory1111111111111111111111111");

  class SendTransactionError extends Error {
    constructor({
      action,
      signature,
      transactionMessage,
      logs
    }) {
      const maybeLogsOutput = logs ? `Logs: 
${JSON.stringify(logs.slice(-10), null, 2)}. ` : "";
      const guideText = "\nCatch the `SendTransactionError` and call `getLogs()` on it for full details.";
      let message;
      switch (action) {
        case "send":
          message = `Transaction ${signature} resulted in an error. 
` + `${transactionMessage}. ` + maybeLogsOutput + guideText;
          break;
        case "simulate":
          message = `Simulation failed. 
Message: ${transactionMessage}. 
` + maybeLogsOutput + guideText;
          break;
        default: {
          message = `Unknown action '${((a) => a)(action)}'`;
        }
      }
      super(message);
      this.signature = undefined;
      this.transactionMessage = undefined;
      this.transactionLogs = undefined;
      this.signature = signature;
      this.transactionMessage = transactionMessage;
      this.transactionLogs = logs ? logs : undefined;
    }
    get transactionError() {
      return {
        message: this.transactionMessage,
        logs: Array.isArray(this.transactionLogs) ? this.transactionLogs : undefined
      };
    }
    get logs() {
      const cachedLogs = this.transactionLogs;
      if (cachedLogs != null && typeof cachedLogs === "object" && "then" in cachedLogs) {
        return;
      }
      return cachedLogs;
    }
    async getLogs(connection) {
      if (!Array.isArray(this.transactionLogs)) {
        this.transactionLogs = new Promise((resolve, reject) => {
          connection.getTransaction(this.signature).then((tx) => {
            if (tx && tx.meta && tx.meta.logMessages) {
              const logs = tx.meta.logMessages;
              this.transactionLogs = logs;
              resolve(logs);
            } else {
              reject(new Error("Log messages not found"));
            }
          }).catch(reject);
        });
      }
      return await this.transactionLogs;
    }
  }
  class SolanaJSONRPCError extends Error {
    constructor({
      code: code2,
      message,
      data
    }, customMessage) {
      super(customMessage != null ? `${customMessage}: ${message}` : message);
      this.code = undefined;
      this.data = undefined;
      this.code = code2;
      this.data = data;
      this.name = "SolanaJSONRPCError";
    }
  }
  async function sendAndConfirmTransaction(connection, transaction, signers, options) {
    const sendOptions = options && {
      skipPreflight: options.skipPreflight,
      preflightCommitment: options.preflightCommitment || options.commitment,
      maxRetries: options.maxRetries,
      minContextSlot: options.minContextSlot
    };
    const signature = await connection.sendTransaction(transaction, signers, sendOptions);
    let status;
    if (transaction.recentBlockhash != null && transaction.lastValidBlockHeight != null) {
      status = (await connection.confirmTransaction({
        abortSignal: options?.abortSignal,
        signature,
        blockhash: transaction.recentBlockhash,
        lastValidBlockHeight: transaction.lastValidBlockHeight
      }, options && options.commitment)).value;
    } else if (transaction.minNonceContextSlot != null && transaction.nonceInfo != null) {
      const {
        nonceInstruction
      } = transaction.nonceInfo;
      const nonceAccountPubkey = nonceInstruction.keys[0].pubkey;
      status = (await connection.confirmTransaction({
        abortSignal: options?.abortSignal,
        minContextSlot: transaction.minNonceContextSlot,
        nonceAccountPubkey,
        nonceValue: transaction.nonceInfo.nonce,
        signature
      }, options && options.commitment)).value;
    } else {
      if (options?.abortSignal != null) {
        console.warn("sendAndConfirmTransaction(): A transaction with a deprecated confirmation strategy was " + "supplied along with an `abortSignal`. Only transactions having `lastValidBlockHeight` " + "or a combination of `nonceInfo` and `minNonceContextSlot` are abortable.");
      }
      status = (await connection.confirmTransaction(signature, options && options.commitment)).value;
    }
    if (status.err) {
      if (signature != null) {
        throw new SendTransactionError({
          action: "send",
          signature,
          transactionMessage: `Status: (${JSON.stringify(status)})`
        });
      }
      throw new Error(`Transaction ${signature} failed (${JSON.stringify(status)})`);
    }
    return signature;
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function encodeData(type2, fields) {
    const allocLength = type2.layout.span >= 0 ? type2.layout.span : getAlloc(type2, fields);
    const data = Buffer2.alloc(allocLength);
    const layoutFields = Object.assign({
      instruction: type2.index
    }, fields);
    type2.layout.encode(layoutFields, data);
    return data;
  }
  var FeeCalculatorLayout = BufferLayout.nu64("lamportsPerSignature");
  var NonceAccountLayout = BufferLayout.struct([BufferLayout.u32("version"), BufferLayout.u32("state"), publicKey("authorizedPubkey"), publicKey("nonce"), BufferLayout.struct([FeeCalculatorLayout], "feeCalculator")]);
  var NONCE_ACCOUNT_LENGTH = NonceAccountLayout.span;

  class NonceAccount {
    constructor(args) {
      this.authorizedPubkey = undefined;
      this.nonce = undefined;
      this.feeCalculator = undefined;
      this.authorizedPubkey = args.authorizedPubkey;
      this.nonce = args.nonce;
      this.feeCalculator = args.feeCalculator;
    }
    static fromAccountData(buffer) {
      const nonceAccount = NonceAccountLayout.decode(toBuffer(buffer), 0);
      return new NonceAccount({
        authorizedPubkey: new PublicKey(nonceAccount.authorizedPubkey),
        nonce: new PublicKey(nonceAccount.nonce).toString(),
        feeCalculator: nonceAccount.feeCalculator
      });
    }
  }
  var encodeDecode = (layout) => {
    const decode2 = layout.decode.bind(layout);
    const encode2 = layout.encode.bind(layout);
    return {
      decode: decode2,
      encode: encode2
    };
  };
  var bigInt = (length) => (property) => {
    const layout = import_buffer_layout.blob(length, property);
    const {
      encode: encode2,
      decode: decode2
    } = encodeDecode(layout);
    const bigIntLayout = layout;
    bigIntLayout.decode = (buffer, offset2) => {
      const src = decode2(buffer, offset2);
      return import_bigint_buffer.toBigIntLE(Buffer2.from(src));
    };
    bigIntLayout.encode = (bigInt2, buffer, offset2) => {
      const src = import_bigint_buffer.toBufferLE(bigInt2, length);
      return encode2(src, buffer, offset2);
    };
    return bigIntLayout;
  };
  var u64 = bigInt(8);
  var SYSTEM_INSTRUCTION_LAYOUTS = Object.freeze({
    Create: {
      index: 0,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), BufferLayout.ns64("lamports"), BufferLayout.ns64("space"), publicKey("programId")])
    },
    Assign: {
      index: 1,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("programId")])
    },
    Transfer: {
      index: 2,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), u64("lamports")])
    },
    CreateWithSeed: {
      index: 3,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("base"), rustString("seed"), BufferLayout.ns64("lamports"), BufferLayout.ns64("space"), publicKey("programId")])
    },
    AdvanceNonceAccount: {
      index: 4,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    },
    WithdrawNonceAccount: {
      index: 5,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), BufferLayout.ns64("lamports")])
    },
    InitializeNonceAccount: {
      index: 6,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("authorized")])
    },
    AuthorizeNonceAccount: {
      index: 7,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("authorized")])
    },
    Allocate: {
      index: 8,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), BufferLayout.ns64("space")])
    },
    AllocateWithSeed: {
      index: 9,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("base"), rustString("seed"), BufferLayout.ns64("space"), publicKey("programId")])
    },
    AssignWithSeed: {
      index: 10,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("base"), rustString("seed"), publicKey("programId")])
    },
    TransferWithSeed: {
      index: 11,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), u64("lamports"), rustString("seed"), publicKey("programId")])
    },
    UpgradeNonceAccount: {
      index: 12,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    }
  });

  class SystemProgram {
    constructor() {}
    static createAccount(params) {
      const type2 = SYSTEM_INSTRUCTION_LAYOUTS.Create;
      const data = encodeData(type2, {
        lamports: params.lamports,
        space: params.space,
        programId: toBuffer(params.programId.toBuffer())
      });
      return new TransactionInstruction({
        keys: [{
          pubkey: params.fromPubkey,
          isSigner: true,
          isWritable: true
        }, {
          pubkey: params.newAccountPubkey,
          isSigner: true,
          isWritable: true
        }],
        programId: this.programId,
        data
      });
    }
    static transfer(params) {
      let data;
      let keys;
      if ("basePubkey" in params) {
        const type2 = SYSTEM_INSTRUCTION_LAYOUTS.TransferWithSeed;
        data = encodeData(type2, {
          lamports: BigInt(params.lamports),
          seed: params.seed,
          programId: toBuffer(params.programId.toBuffer())
        });
        keys = [{
          pubkey: params.fromPubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: params.basePubkey,
          isSigner: true,
          isWritable: false
        }, {
          pubkey: params.toPubkey,
          isSigner: false,
          isWritable: true
        }];
      } else {
        const type2 = SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
        data = encodeData(type2, {
          lamports: BigInt(params.lamports)
        });
        keys = [{
          pubkey: params.fromPubkey,
          isSigner: true,
          isWritable: true
        }, {
          pubkey: params.toPubkey,
          isSigner: false,
          isWritable: true
        }];
      }
      return new TransactionInstruction({
        keys,
        programId: this.programId,
        data
      });
    }
    static assign(params) {
      let data;
      let keys;
      if ("basePubkey" in params) {
        const type2 = SYSTEM_INSTRUCTION_LAYOUTS.AssignWithSeed;
        data = encodeData(type2, {
          base: toBuffer(params.basePubkey.toBuffer()),
          seed: params.seed,
          programId: toBuffer(params.programId.toBuffer())
        });
        keys = [{
          pubkey: params.accountPubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: params.basePubkey,
          isSigner: true,
          isWritable: false
        }];
      } else {
        const type2 = SYSTEM_INSTRUCTION_LAYOUTS.Assign;
        data = encodeData(type2, {
          programId: toBuffer(params.programId.toBuffer())
        });
        keys = [{
          pubkey: params.accountPubkey,
          isSigner: true,
          isWritable: true
        }];
      }
      return new TransactionInstruction({
        keys,
        programId: this.programId,
        data
      });
    }
    static createAccountWithSeed(params) {
      const type2 = SYSTEM_INSTRUCTION_LAYOUTS.CreateWithSeed;
      const data = encodeData(type2, {
        base: toBuffer(params.basePubkey.toBuffer()),
        seed: params.seed,
        lamports: params.lamports,
        space: params.space,
        programId: toBuffer(params.programId.toBuffer())
      });
      let keys = [{
        pubkey: params.fromPubkey,
        isSigner: true,
        isWritable: true
      }, {
        pubkey: params.newAccountPubkey,
        isSigner: false,
        isWritable: true
      }];
      if (!params.basePubkey.equals(params.fromPubkey)) {
        keys.push({
          pubkey: params.basePubkey,
          isSigner: true,
          isWritable: false
        });
      }
      return new TransactionInstruction({
        keys,
        programId: this.programId,
        data
      });
    }
    static createNonceAccount(params) {
      const transaction = new Transaction;
      if ("basePubkey" in params && "seed" in params) {
        transaction.add(SystemProgram.createAccountWithSeed({
          fromPubkey: params.fromPubkey,
          newAccountPubkey: params.noncePubkey,
          basePubkey: params.basePubkey,
          seed: params.seed,
          lamports: params.lamports,
          space: NONCE_ACCOUNT_LENGTH,
          programId: this.programId
        }));
      } else {
        transaction.add(SystemProgram.createAccount({
          fromPubkey: params.fromPubkey,
          newAccountPubkey: params.noncePubkey,
          lamports: params.lamports,
          space: NONCE_ACCOUNT_LENGTH,
          programId: this.programId
        }));
      }
      const initParams = {
        noncePubkey: params.noncePubkey,
        authorizedPubkey: params.authorizedPubkey
      };
      transaction.add(this.nonceInitialize(initParams));
      return transaction;
    }
    static nonceInitialize(params) {
      const type2 = SYSTEM_INSTRUCTION_LAYOUTS.InitializeNonceAccount;
      const data = encodeData(type2, {
        authorized: toBuffer(params.authorizedPubkey.toBuffer())
      });
      const instructionData = {
        keys: [{
          pubkey: params.noncePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false
        }],
        programId: this.programId,
        data
      };
      return new TransactionInstruction(instructionData);
    }
    static nonceAdvance(params) {
      const type2 = SYSTEM_INSTRUCTION_LAYOUTS.AdvanceNonceAccount;
      const data = encodeData(type2);
      const instructionData = {
        keys: [{
          pubkey: params.noncePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: params.authorizedPubkey,
          isSigner: true,
          isWritable: false
        }],
        programId: this.programId,
        data
      };
      return new TransactionInstruction(instructionData);
    }
    static nonceWithdraw(params) {
      const type2 = SYSTEM_INSTRUCTION_LAYOUTS.WithdrawNonceAccount;
      const data = encodeData(type2, {
        lamports: params.lamports
      });
      return new TransactionInstruction({
        keys: [{
          pubkey: params.noncePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: params.toPubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: params.authorizedPubkey,
          isSigner: true,
          isWritable: false
        }],
        programId: this.programId,
        data
      });
    }
    static nonceAuthorize(params) {
      const type2 = SYSTEM_INSTRUCTION_LAYOUTS.AuthorizeNonceAccount;
      const data = encodeData(type2, {
        authorized: toBuffer(params.newAuthorizedPubkey.toBuffer())
      });
      return new TransactionInstruction({
        keys: [{
          pubkey: params.noncePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: params.authorizedPubkey,
          isSigner: true,
          isWritable: false
        }],
        programId: this.programId,
        data
      });
    }
    static allocate(params) {
      let data;
      let keys;
      if ("basePubkey" in params) {
        const type2 = SYSTEM_INSTRUCTION_LAYOUTS.AllocateWithSeed;
        data = encodeData(type2, {
          base: toBuffer(params.basePubkey.toBuffer()),
          seed: params.seed,
          space: params.space,
          programId: toBuffer(params.programId.toBuffer())
        });
        keys = [{
          pubkey: params.accountPubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: params.basePubkey,
          isSigner: true,
          isWritable: false
        }];
      } else {
        const type2 = SYSTEM_INSTRUCTION_LAYOUTS.Allocate;
        data = encodeData(type2, {
          space: params.space
        });
        keys = [{
          pubkey: params.accountPubkey,
          isSigner: true,
          isWritable: true
        }];
      }
      return new TransactionInstruction({
        keys,
        programId: this.programId,
        data
      });
    }
  }
  SystemProgram.programId = new PublicKey("11111111111111111111111111111111");
  var CHUNK_SIZE = PACKET_DATA_SIZE - 300;

  class Loader {
    constructor() {}
    static getMinNumSignatures(dataLength) {
      return 2 * (Math.ceil(dataLength / Loader.chunkSize) + 1 + 1);
    }
    static async load(connection, payer, program, programId, data) {
      {
        const balanceNeeded = await connection.getMinimumBalanceForRentExemption(data.length);
        const programInfo = await connection.getAccountInfo(program.publicKey, "confirmed");
        let transaction = null;
        if (programInfo !== null) {
          if (programInfo.executable) {
            console.error("Program load failed, account is already executable");
            return false;
          }
          if (programInfo.data.length !== data.length) {
            transaction = transaction || new Transaction;
            transaction.add(SystemProgram.allocate({
              accountPubkey: program.publicKey,
              space: data.length
            }));
          }
          if (!programInfo.owner.equals(programId)) {
            transaction = transaction || new Transaction;
            transaction.add(SystemProgram.assign({
              accountPubkey: program.publicKey,
              programId
            }));
          }
          if (programInfo.lamports < balanceNeeded) {
            transaction = transaction || new Transaction;
            transaction.add(SystemProgram.transfer({
              fromPubkey: payer.publicKey,
              toPubkey: program.publicKey,
              lamports: balanceNeeded - programInfo.lamports
            }));
          }
        } else {
          transaction = new Transaction().add(SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: program.publicKey,
            lamports: balanceNeeded > 0 ? balanceNeeded : 1,
            space: data.length,
            programId
          }));
        }
        if (transaction !== null) {
          await sendAndConfirmTransaction(connection, transaction, [payer, program], {
            commitment: "confirmed"
          });
        }
      }
      const dataLayout = BufferLayout.struct([BufferLayout.u32("instruction"), BufferLayout.u32("offset"), BufferLayout.u32("bytesLength"), BufferLayout.u32("bytesLengthPadding"), BufferLayout.seq(BufferLayout.u8("byte"), BufferLayout.offset(BufferLayout.u32(), -8), "bytes")]);
      const chunkSize = Loader.chunkSize;
      let offset2 = 0;
      let array2 = data;
      let transactions = [];
      while (array2.length > 0) {
        const bytes = array2.slice(0, chunkSize);
        const data2 = Buffer2.alloc(chunkSize + 16);
        dataLayout.encode({
          instruction: 0,
          offset: offset2,
          bytes,
          bytesLength: 0,
          bytesLengthPadding: 0
        }, data2);
        const transaction = new Transaction().add({
          keys: [{
            pubkey: program.publicKey,
            isSigner: true,
            isWritable: true
          }],
          programId,
          data: data2
        });
        transactions.push(sendAndConfirmTransaction(connection, transaction, [payer, program], {
          commitment: "confirmed"
        }));
        if (connection._rpcEndpoint.includes("solana.com")) {
          const REQUESTS_PER_SECOND = 4;
          await sleep(1000 / REQUESTS_PER_SECOND);
        }
        offset2 += chunkSize;
        array2 = array2.slice(chunkSize);
      }
      await Promise.all(transactions);
      {
        const dataLayout2 = BufferLayout.struct([BufferLayout.u32("instruction")]);
        const data2 = Buffer2.alloc(dataLayout2.span);
        dataLayout2.encode({
          instruction: 1
        }, data2);
        const transaction = new Transaction().add({
          keys: [{
            pubkey: program.publicKey,
            isSigner: true,
            isWritable: true
          }, {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false
          }],
          programId,
          data: data2
        });
        const deployCommitment = "processed";
        const finalizeSignature = await connection.sendTransaction(transaction, [payer, program], {
          preflightCommitment: deployCommitment
        });
        const {
          context,
          value
        } = await connection.confirmTransaction({
          signature: finalizeSignature,
          lastValidBlockHeight: transaction.lastValidBlockHeight,
          blockhash: transaction.recentBlockhash
        }, deployCommitment);
        if (value.err) {
          throw new Error(`Transaction ${finalizeSignature} failed (${JSON.stringify(value)})`);
        }
        while (true) {
          try {
            const currentSlot = await connection.getSlot({
              commitment: deployCommitment
            });
            if (currentSlot > context.slot) {
              break;
            }
          } catch {}
          await new Promise((resolve) => setTimeout(resolve, Math.round(MS_PER_SLOT / 2)));
        }
      }
      return true;
    }
  }
  Loader.chunkSize = CHUNK_SIZE;
  var BPF_LOADER_PROGRAM_ID = new PublicKey("BPFLoader2111111111111111111111111111111111");
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var fastStableStringify$1;
  var hasRequiredFastStableStringify;
  function requireFastStableStringify() {
    if (hasRequiredFastStableStringify)
      return fastStableStringify$1;
    hasRequiredFastStableStringify = 1;
    var objToString = Object.prototype.toString;
    var objKeys = Object.keys || function(obj) {
      var keys = [];
      for (var name in obj) {
        keys.push(name);
      }
      return keys;
    };
    function stringify2(val, isArrayProp) {
      var i3, max, str, keys, key, propVal, toStr;
      if (val === true) {
        return "true";
      }
      if (val === false) {
        return "false";
      }
      switch (typeof val) {
        case "object":
          if (val === null) {
            return null;
          } else if (val.toJSON && typeof val.toJSON === "function") {
            return stringify2(val.toJSON(), isArrayProp);
          } else {
            toStr = objToString.call(val);
            if (toStr === "[object Array]") {
              str = "[";
              max = val.length - 1;
              for (i3 = 0;i3 < max; i3++) {
                str += stringify2(val[i3], true) + ",";
              }
              if (max > -1) {
                str += stringify2(val[i3], true);
              }
              return str + "]";
            } else if (toStr === "[object Object]") {
              keys = objKeys(val).sort();
              max = keys.length;
              str = "";
              i3 = 0;
              while (i3 < max) {
                key = keys[i3];
                propVal = stringify2(val[key], false);
                if (propVal !== undefined) {
                  if (str) {
                    str += ",";
                  }
                  str += JSON.stringify(key) + ":" + propVal;
                }
                i3++;
              }
              return "{" + str + "}";
            } else {
              return JSON.stringify(val);
            }
          }
        case "function":
        case "undefined":
          return isArrayProp ? null : undefined;
        case "string":
          return JSON.stringify(val);
        default:
          return isFinite(val) ? val : null;
      }
    }
    fastStableStringify$1 = function(val) {
      var returnVal = stringify2(val, false);
      if (returnVal !== undefined) {
        return "" + returnVal;
      }
    };
    return fastStableStringify$1;
  }
  var fastStableStringifyExports = /* @__PURE__ */ requireFastStableStringify();
  var fastStableStringify = /* @__PURE__ */ getDefaultExportFromCjs(fastStableStringifyExports);
  var MINIMUM_SLOT_PER_EPOCH = 32;
  function trailingZeros(n) {
    let trailingZeros2 = 0;
    while (n > 1) {
      n /= 2;
      trailingZeros2++;
    }
    return trailingZeros2;
  }
  function nextPowerOfTwo(n) {
    if (n === 0)
      return 1;
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    n |= n >> 32;
    return n + 1;
  }

  class EpochSchedule {
    constructor(slotsPerEpoch, leaderScheduleSlotOffset, warmup, firstNormalEpoch, firstNormalSlot) {
      this.slotsPerEpoch = undefined;
      this.leaderScheduleSlotOffset = undefined;
      this.warmup = undefined;
      this.firstNormalEpoch = undefined;
      this.firstNormalSlot = undefined;
      this.slotsPerEpoch = slotsPerEpoch;
      this.leaderScheduleSlotOffset = leaderScheduleSlotOffset;
      this.warmup = warmup;
      this.firstNormalEpoch = firstNormalEpoch;
      this.firstNormalSlot = firstNormalSlot;
    }
    getEpoch(slot) {
      return this.getEpochAndSlotIndex(slot)[0];
    }
    getEpochAndSlotIndex(slot) {
      if (slot < this.firstNormalSlot) {
        const epoch = trailingZeros(nextPowerOfTwo(slot + MINIMUM_SLOT_PER_EPOCH + 1)) - trailingZeros(MINIMUM_SLOT_PER_EPOCH) - 1;
        const epochLen = this.getSlotsInEpoch(epoch);
        const slotIndex = slot - (epochLen - MINIMUM_SLOT_PER_EPOCH);
        return [epoch, slotIndex];
      } else {
        const normalSlotIndex = slot - this.firstNormalSlot;
        const normalEpochIndex = Math.floor(normalSlotIndex / this.slotsPerEpoch);
        const epoch = this.firstNormalEpoch + normalEpochIndex;
        const slotIndex = normalSlotIndex % this.slotsPerEpoch;
        return [epoch, slotIndex];
      }
    }
    getFirstSlotInEpoch(epoch) {
      if (epoch <= this.firstNormalEpoch) {
        return (Math.pow(2, epoch) - 1) * MINIMUM_SLOT_PER_EPOCH;
      } else {
        return (epoch - this.firstNormalEpoch) * this.slotsPerEpoch + this.firstNormalSlot;
      }
    }
    getLastSlotInEpoch(epoch) {
      return this.getFirstSlotInEpoch(epoch) + this.getSlotsInEpoch(epoch) - 1;
    }
    getSlotsInEpoch(epoch) {
      if (epoch < this.firstNormalEpoch) {
        return Math.pow(2, epoch + trailingZeros(MINIMUM_SLOT_PER_EPOCH));
      } else {
        return this.slotsPerEpoch;
      }
    }
  }
  var fetchImpl = globalThis.fetch;

  class RpcWebSocketClient extends CommonClient {
    constructor(address, options, generate_request_id) {
      const webSocketFactory = (url) => {
        const rpc = WebSocket(url, {
          autoconnect: true,
          max_reconnects: 5,
          reconnect: true,
          reconnect_interval: 1000,
          ...options
        });
        if ("socket" in rpc) {
          this.underlyingSocket = rpc.socket;
        } else {
          this.underlyingSocket = rpc;
        }
        return rpc;
      };
      super(webSocketFactory, address, options, generate_request_id);
      this.underlyingSocket = undefined;
    }
    call(...args) {
      const readyState = this.underlyingSocket?.readyState;
      if (readyState === 1) {
        return super.call(...args);
      }
      return Promise.reject(new Error("Tried to call a JSON-RPC method `" + args[0] + "` but the socket was not `CONNECTING` or `OPEN` (`readyState` was " + readyState + ")"));
    }
    notify(...args) {
      const readyState = this.underlyingSocket?.readyState;
      if (readyState === 1) {
        return super.notify(...args);
      }
      return Promise.reject(new Error("Tried to send a JSON-RPC notification `" + args[0] + "` but the socket was not `CONNECTING` or `OPEN` (`readyState` was " + readyState + ")"));
    }
  }
  function decodeData(type2, data) {
    let decoded;
    try {
      decoded = type2.layout.decode(data);
    } catch (err) {
      throw new Error("invalid instruction; " + err);
    }
    if (decoded.typeIndex !== type2.index) {
      throw new Error(`invalid account data; account type mismatch ${decoded.typeIndex} != ${type2.index}`);
    }
    return decoded;
  }
  var LOOKUP_TABLE_META_SIZE = 56;

  class AddressLookupTableAccount {
    constructor(args) {
      this.key = undefined;
      this.state = undefined;
      this.key = args.key;
      this.state = args.state;
    }
    isActive() {
      const U64_MAX = BigInt("0xffffffffffffffff");
      return this.state.deactivationSlot === U64_MAX;
    }
    static deserialize(accountData) {
      const meta = decodeData(LookupTableMetaLayout, accountData);
      const serializedAddressesLen = accountData.length - LOOKUP_TABLE_META_SIZE;
      assert2(serializedAddressesLen >= 0, "lookup table is invalid");
      assert2(serializedAddressesLen % 32 === 0, "lookup table is invalid");
      const numSerializedAddresses = serializedAddressesLen / 32;
      const {
        addresses
      } = BufferLayout.struct([BufferLayout.seq(publicKey(), numSerializedAddresses, "addresses")]).decode(accountData.slice(LOOKUP_TABLE_META_SIZE));
      return {
        deactivationSlot: meta.deactivationSlot,
        lastExtendedSlot: meta.lastExtendedSlot,
        lastExtendedSlotStartIndex: meta.lastExtendedStartIndex,
        authority: meta.authority.length !== 0 ? new PublicKey(meta.authority[0]) : undefined,
        addresses: addresses.map((address) => new PublicKey(address))
      };
    }
  }
  var LookupTableMetaLayout = {
    index: 1,
    layout: BufferLayout.struct([
      BufferLayout.u32("typeIndex"),
      u64("deactivationSlot"),
      BufferLayout.nu64("lastExtendedSlot"),
      BufferLayout.u8("lastExtendedStartIndex"),
      BufferLayout.u8(),
      BufferLayout.seq(publicKey(), BufferLayout.offset(BufferLayout.u8(), -1), "authority")
    ])
  };
  var URL_RE = /^[^:]+:\/\/([^:[]+|\[[^\]]+\])(:\d+)?(.*)/i;
  function makeWebsocketUrl(endpoint) {
    const matches = endpoint.match(URL_RE);
    if (matches == null) {
      throw TypeError(`Failed to validate endpoint URL \`${endpoint}\``);
    }
    const [
      _,
      hostish,
      portWithColon,
      rest
    ] = matches;
    const protocol = endpoint.startsWith("https:") ? "wss:" : "ws:";
    const startPort = portWithColon == null ? null : parseInt(portWithColon.slice(1), 10);
    const websocketPort = startPort == null ? "" : `:${startPort + 1}`;
    return `${protocol}//${hostish}${websocketPort}${rest}`;
  }
  var PublicKeyFromString = coerce(instance(PublicKey), string(), (value) => new PublicKey(value));
  var RawAccountDataResult = tuple([string(), literal("base64")]);
  var BufferFromRawAccountData = coerce(instance(Buffer2), RawAccountDataResult, (value) => Buffer2.from(value[0], "base64"));
  var BLOCKHASH_CACHE_TIMEOUT_MS = 30 * 1000;
  function assertEndpointUrl(putativeUrl) {
    if (/^https?:/.test(putativeUrl) === false) {
      throw new TypeError("Endpoint URL must start with `http:` or `https:`.");
    }
    return putativeUrl;
  }
  function extractCommitmentFromConfig(commitmentOrConfig) {
    let commitment;
    let config;
    if (typeof commitmentOrConfig === "string") {
      commitment = commitmentOrConfig;
    } else if (commitmentOrConfig) {
      const {
        commitment: specifiedCommitment,
        ...specifiedConfig
      } = commitmentOrConfig;
      commitment = specifiedCommitment;
      config = specifiedConfig;
    }
    return {
      commitment,
      config
    };
  }
  function applyDefaultMemcmpEncodingToFilters(filters) {
    return filters.map((filter) => ("memcmp" in filter) ? {
      ...filter,
      memcmp: {
        ...filter.memcmp,
        encoding: filter.memcmp.encoding ?? "base58"
      }
    } : filter);
  }
  function createRpcResult(result) {
    return union([type({
      jsonrpc: literal("2.0"),
      id: string(),
      result
    }), type({
      jsonrpc: literal("2.0"),
      id: string(),
      error: type({
        code: unknown(),
        message: string(),
        data: optional(any())
      })
    })]);
  }
  var UnknownRpcResult = createRpcResult(unknown());
  function jsonRpcResult(schema) {
    return coerce(createRpcResult(schema), UnknownRpcResult, (value) => {
      if ("error" in value) {
        return value;
      } else {
        return {
          ...value,
          result: create(value.result, schema)
        };
      }
    });
  }
  function jsonRpcResultAndContext(value) {
    return jsonRpcResult(type({
      context: type({
        slot: number()
      }),
      value
    }));
  }
  function notificationResultAndContext(value) {
    return type({
      context: type({
        slot: number()
      }),
      value
    });
  }
  function versionedMessageFromResponse(version2, response) {
    if (version2 === 0) {
      return new MessageV0({
        header: response.header,
        staticAccountKeys: response.accountKeys.map((accountKey) => new PublicKey(accountKey)),
        recentBlockhash: response.recentBlockhash,
        compiledInstructions: response.instructions.map((ix) => ({
          programIdIndex: ix.programIdIndex,
          accountKeyIndexes: ix.accounts,
          data: import_bs58.default.decode(ix.data)
        })),
        addressTableLookups: response.addressTableLookups
      });
    } else {
      return new Message(response);
    }
  }
  var GetInflationGovernorResult = type({
    foundation: number(),
    foundationTerm: number(),
    initial: number(),
    taper: number(),
    terminal: number()
  });
  var GetInflationRewardResult = jsonRpcResult(array(nullable(type({
    epoch: number(),
    effectiveSlot: number(),
    amount: number(),
    postBalance: number(),
    commission: optional(nullable(number()))
  }))));
  var GetRecentPrioritizationFeesResult = array(type({
    slot: number(),
    prioritizationFee: number()
  }));
  var GetInflationRateResult = type({
    total: number(),
    validator: number(),
    foundation: number(),
    epoch: number()
  });
  var GetEpochInfoResult = type({
    epoch: number(),
    slotIndex: number(),
    slotsInEpoch: number(),
    absoluteSlot: number(),
    blockHeight: optional(number()),
    transactionCount: optional(number())
  });
  var GetEpochScheduleResult = type({
    slotsPerEpoch: number(),
    leaderScheduleSlotOffset: number(),
    warmup: boolean(),
    firstNormalEpoch: number(),
    firstNormalSlot: number()
  });
  var GetLeaderScheduleResult = record(string(), array(number()));
  var TransactionErrorResult = nullable(union([type({}), string()]));
  var SignatureStatusResult = type({
    err: TransactionErrorResult
  });
  var SignatureReceivedResult = literal("receivedSignature");
  var VersionResult = type({
    "solana-core": string(),
    "feature-set": optional(number())
  });
  var ParsedInstructionStruct = type({
    program: string(),
    programId: PublicKeyFromString,
    parsed: unknown()
  });
  var PartiallyDecodedInstructionStruct = type({
    programId: PublicKeyFromString,
    accounts: array(PublicKeyFromString),
    data: string()
  });
  var SimulatedTransactionResponseStruct = jsonRpcResultAndContext(type({
    err: nullable(union([type({}), string()])),
    logs: nullable(array(string())),
    accounts: optional(nullable(array(nullable(type({
      executable: boolean(),
      owner: string(),
      lamports: number(),
      data: array(string()),
      rentEpoch: optional(number())
    }))))),
    unitsConsumed: optional(number()),
    returnData: optional(nullable(type({
      programId: string(),
      data: tuple([string(), literal("base64")])
    }))),
    innerInstructions: optional(nullable(array(type({
      index: number(),
      instructions: array(union([ParsedInstructionStruct, PartiallyDecodedInstructionStruct]))
    }))))
  }));
  var BlockProductionResponseStruct = jsonRpcResultAndContext(type({
    byIdentity: record(string(), array(number())),
    range: type({
      firstSlot: number(),
      lastSlot: number()
    })
  }));
  function createRpcClient(url, httpHeaders, customFetch, fetchMiddleware, disableRetryOnRateLimit, httpAgent) {
    const fetch = customFetch ? customFetch : fetchImpl;
    let agent;
    {
      if (httpAgent != null) {
        console.warn("You have supplied an `httpAgent` when creating a `Connection` in a browser environment." + "It has been ignored; `httpAgent` is only used in Node environments.");
      }
    }
    let fetchWithMiddleware;
    if (fetchMiddleware) {
      fetchWithMiddleware = async (info, init) => {
        const modifiedFetchArgs = await new Promise((resolve, reject) => {
          try {
            fetchMiddleware(info, init, (modifiedInfo, modifiedInit) => resolve([modifiedInfo, modifiedInit]));
          } catch (error) {
            reject(error);
          }
        });
        return await fetch(...modifiedFetchArgs);
      };
    }
    const clientBrowser = new import_browser.default(async (request, callback) => {
      const options = {
        method: "POST",
        body: request,
        agent,
        headers: Object.assign({
          "Content-Type": "application/json"
        }, httpHeaders || {}, COMMON_HTTP_HEADERS)
      };
      try {
        let too_many_requests_retries = 5;
        let res;
        let waitTime = 500;
        for (;; ) {
          if (fetchWithMiddleware) {
            res = await fetchWithMiddleware(url, options);
          } else {
            res = await fetch(url, options);
          }
          if (res.status !== 429) {
            break;
          }
          if (disableRetryOnRateLimit === true) {
            break;
          }
          too_many_requests_retries -= 1;
          if (too_many_requests_retries === 0) {
            break;
          }
          console.error(`Server responded with ${res.status} ${res.statusText}.  Retrying after ${waitTime}ms delay...`);
          await sleep(waitTime);
          waitTime *= 2;
        }
        const text = await res.text();
        if (res.ok) {
          callback(null, text);
        } else {
          callback(new Error(`${res.status} ${res.statusText}: ${text}`));
        }
      } catch (err) {
        if (err instanceof Error)
          callback(err);
      }
    }, {});
    return clientBrowser;
  }
  function createRpcRequest(client) {
    return (method, args) => {
      return new Promise((resolve, reject) => {
        client.request(method, args, (err, response) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(response);
        });
      });
    };
  }
  function createRpcBatchRequest(client) {
    return (requests) => {
      return new Promise((resolve, reject) => {
        if (requests.length === 0)
          resolve([]);
        const batch = requests.map((params) => {
          return client.request(params.methodName, params.args);
        });
        client.request(batch, (err, response) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(response);
        });
      });
    };
  }
  var GetInflationGovernorRpcResult = jsonRpcResult(GetInflationGovernorResult);
  var GetInflationRateRpcResult = jsonRpcResult(GetInflationRateResult);
  var GetRecentPrioritizationFeesRpcResult = jsonRpcResult(GetRecentPrioritizationFeesResult);
  var GetEpochInfoRpcResult = jsonRpcResult(GetEpochInfoResult);
  var GetEpochScheduleRpcResult = jsonRpcResult(GetEpochScheduleResult);
  var GetLeaderScheduleRpcResult = jsonRpcResult(GetLeaderScheduleResult);
  var SlotRpcResult = jsonRpcResult(number());
  var GetSupplyRpcResult = jsonRpcResultAndContext(type({
    total: number(),
    circulating: number(),
    nonCirculating: number(),
    nonCirculatingAccounts: array(PublicKeyFromString)
  }));
  var TokenAmountResult = type({
    amount: string(),
    uiAmount: nullable(number()),
    decimals: number(),
    uiAmountString: optional(string())
  });
  var GetTokenLargestAccountsResult = jsonRpcResultAndContext(array(type({
    address: PublicKeyFromString,
    amount: string(),
    uiAmount: nullable(number()),
    decimals: number(),
    uiAmountString: optional(string())
  })));
  var GetTokenAccountsByOwner = jsonRpcResultAndContext(array(type({
    pubkey: PublicKeyFromString,
    account: type({
      executable: boolean(),
      owner: PublicKeyFromString,
      lamports: number(),
      data: BufferFromRawAccountData,
      rentEpoch: number()
    })
  })));
  var ParsedAccountDataResult = type({
    program: string(),
    parsed: unknown(),
    space: number()
  });
  var GetParsedTokenAccountsByOwner = jsonRpcResultAndContext(array(type({
    pubkey: PublicKeyFromString,
    account: type({
      executable: boolean(),
      owner: PublicKeyFromString,
      lamports: number(),
      data: ParsedAccountDataResult,
      rentEpoch: number()
    })
  })));
  var GetLargestAccountsRpcResult = jsonRpcResultAndContext(array(type({
    lamports: number(),
    address: PublicKeyFromString
  })));
  var AccountInfoResult = type({
    executable: boolean(),
    owner: PublicKeyFromString,
    lamports: number(),
    data: BufferFromRawAccountData,
    rentEpoch: number()
  });
  var KeyedAccountInfoResult = type({
    pubkey: PublicKeyFromString,
    account: AccountInfoResult
  });
  var ParsedOrRawAccountData = coerce(union([instance(Buffer2), ParsedAccountDataResult]), union([RawAccountDataResult, ParsedAccountDataResult]), (value) => {
    if (Array.isArray(value)) {
      return create(value, BufferFromRawAccountData);
    } else {
      return value;
    }
  });
  var ParsedAccountInfoResult = type({
    executable: boolean(),
    owner: PublicKeyFromString,
    lamports: number(),
    data: ParsedOrRawAccountData,
    rentEpoch: number()
  });
  var KeyedParsedAccountInfoResult = type({
    pubkey: PublicKeyFromString,
    account: ParsedAccountInfoResult
  });
  var StakeActivationResult = type({
    state: union([literal("active"), literal("inactive"), literal("activating"), literal("deactivating")]),
    active: number(),
    inactive: number()
  });
  var GetConfirmedSignaturesForAddress2RpcResult = jsonRpcResult(array(type({
    signature: string(),
    slot: number(),
    err: TransactionErrorResult,
    memo: nullable(string()),
    blockTime: optional(nullable(number()))
  })));
  var GetSignaturesForAddressRpcResult = jsonRpcResult(array(type({
    signature: string(),
    slot: number(),
    err: TransactionErrorResult,
    memo: nullable(string()),
    blockTime: optional(nullable(number()))
  })));
  var AccountNotificationResult = type({
    subscription: number(),
    result: notificationResultAndContext(AccountInfoResult)
  });
  var ProgramAccountInfoResult = type({
    pubkey: PublicKeyFromString,
    account: AccountInfoResult
  });
  var ProgramAccountNotificationResult = type({
    subscription: number(),
    result: notificationResultAndContext(ProgramAccountInfoResult)
  });
  var SlotInfoResult = type({
    parent: number(),
    slot: number(),
    root: number()
  });
  var SlotNotificationResult = type({
    subscription: number(),
    result: SlotInfoResult
  });
  var SlotUpdateResult = union([type({
    type: union([literal("firstShredReceived"), literal("completed"), literal("optimisticConfirmation"), literal("root")]),
    slot: number(),
    timestamp: number()
  }), type({
    type: literal("createdBank"),
    parent: number(),
    slot: number(),
    timestamp: number()
  }), type({
    type: literal("frozen"),
    slot: number(),
    timestamp: number(),
    stats: type({
      numTransactionEntries: number(),
      numSuccessfulTransactions: number(),
      numFailedTransactions: number(),
      maxTransactionsPerEntry: number()
    })
  }), type({
    type: literal("dead"),
    slot: number(),
    timestamp: number(),
    err: string()
  })]);
  var SlotUpdateNotificationResult = type({
    subscription: number(),
    result: SlotUpdateResult
  });
  var SignatureNotificationResult = type({
    subscription: number(),
    result: notificationResultAndContext(union([SignatureStatusResult, SignatureReceivedResult]))
  });
  var RootNotificationResult = type({
    subscription: number(),
    result: number()
  });
  var ContactInfoResult = type({
    pubkey: string(),
    gossip: nullable(string()),
    tpu: nullable(string()),
    rpc: nullable(string()),
    version: nullable(string())
  });
  var VoteAccountInfoResult = type({
    votePubkey: string(),
    nodePubkey: string(),
    activatedStake: number(),
    epochVoteAccount: boolean(),
    epochCredits: array(tuple([number(), number(), number()])),
    commission: number(),
    lastVote: number(),
    rootSlot: nullable(number())
  });
  var GetVoteAccounts = jsonRpcResult(type({
    current: array(VoteAccountInfoResult),
    delinquent: array(VoteAccountInfoResult)
  }));
  var ConfirmationStatus = union([literal("processed"), literal("confirmed"), literal("finalized")]);
  var SignatureStatusResponse = type({
    slot: number(),
    confirmations: nullable(number()),
    err: TransactionErrorResult,
    confirmationStatus: optional(ConfirmationStatus)
  });
  var GetSignatureStatusesRpcResult = jsonRpcResultAndContext(array(nullable(SignatureStatusResponse)));
  var GetMinimumBalanceForRentExemptionRpcResult = jsonRpcResult(number());
  var AddressTableLookupStruct = type({
    accountKey: PublicKeyFromString,
    writableIndexes: array(number()),
    readonlyIndexes: array(number())
  });
  var ConfirmedTransactionResult = type({
    signatures: array(string()),
    message: type({
      accountKeys: array(string()),
      header: type({
        numRequiredSignatures: number(),
        numReadonlySignedAccounts: number(),
        numReadonlyUnsignedAccounts: number()
      }),
      instructions: array(type({
        accounts: array(number()),
        data: string(),
        programIdIndex: number()
      })),
      recentBlockhash: string(),
      addressTableLookups: optional(array(AddressTableLookupStruct))
    })
  });
  var AnnotatedAccountKey = type({
    pubkey: PublicKeyFromString,
    signer: boolean(),
    writable: boolean(),
    source: optional(union([literal("transaction"), literal("lookupTable")]))
  });
  var ConfirmedTransactionAccountsModeResult = type({
    accountKeys: array(AnnotatedAccountKey),
    signatures: array(string())
  });
  var ParsedInstructionResult = type({
    parsed: unknown(),
    program: string(),
    programId: PublicKeyFromString
  });
  var RawInstructionResult = type({
    accounts: array(PublicKeyFromString),
    data: string(),
    programId: PublicKeyFromString
  });
  var InstructionResult = union([RawInstructionResult, ParsedInstructionResult]);
  var UnknownInstructionResult = union([type({
    parsed: unknown(),
    program: string(),
    programId: string()
  }), type({
    accounts: array(string()),
    data: string(),
    programId: string()
  })]);
  var ParsedOrRawInstruction = coerce(InstructionResult, UnknownInstructionResult, (value) => {
    if ("accounts" in value) {
      return create(value, RawInstructionResult);
    } else {
      return create(value, ParsedInstructionResult);
    }
  });
  var ParsedConfirmedTransactionResult = type({
    signatures: array(string()),
    message: type({
      accountKeys: array(AnnotatedAccountKey),
      instructions: array(ParsedOrRawInstruction),
      recentBlockhash: string(),
      addressTableLookups: optional(nullable(array(AddressTableLookupStruct)))
    })
  });
  var TokenBalanceResult = type({
    accountIndex: number(),
    mint: string(),
    owner: optional(string()),
    programId: optional(string()),
    uiTokenAmount: TokenAmountResult
  });
  var LoadedAddressesResult = type({
    writable: array(PublicKeyFromString),
    readonly: array(PublicKeyFromString)
  });
  var ConfirmedTransactionMetaResult = type({
    err: TransactionErrorResult,
    fee: number(),
    innerInstructions: optional(nullable(array(type({
      index: number(),
      instructions: array(type({
        accounts: array(number()),
        data: string(),
        programIdIndex: number()
      }))
    })))),
    preBalances: array(number()),
    postBalances: array(number()),
    logMessages: optional(nullable(array(string()))),
    preTokenBalances: optional(nullable(array(TokenBalanceResult))),
    postTokenBalances: optional(nullable(array(TokenBalanceResult))),
    loadedAddresses: optional(LoadedAddressesResult),
    computeUnitsConsumed: optional(number())
  });
  var ParsedConfirmedTransactionMetaResult = type({
    err: TransactionErrorResult,
    fee: number(),
    innerInstructions: optional(nullable(array(type({
      index: number(),
      instructions: array(ParsedOrRawInstruction)
    })))),
    preBalances: array(number()),
    postBalances: array(number()),
    logMessages: optional(nullable(array(string()))),
    preTokenBalances: optional(nullable(array(TokenBalanceResult))),
    postTokenBalances: optional(nullable(array(TokenBalanceResult))),
    loadedAddresses: optional(LoadedAddressesResult),
    computeUnitsConsumed: optional(number())
  });
  var TransactionVersionStruct = union([literal(0), literal("legacy")]);
  var RewardsResult = type({
    pubkey: string(),
    lamports: number(),
    postBalance: nullable(number()),
    rewardType: nullable(string()),
    commission: optional(nullable(number()))
  });
  var GetBlockRpcResult = jsonRpcResult(nullable(type({
    blockhash: string(),
    previousBlockhash: string(),
    parentSlot: number(),
    transactions: array(type({
      transaction: ConfirmedTransactionResult,
      meta: nullable(ConfirmedTransactionMetaResult),
      version: optional(TransactionVersionStruct)
    })),
    rewards: optional(array(RewardsResult)),
    blockTime: nullable(number()),
    blockHeight: nullable(number())
  })));
  var GetNoneModeBlockRpcResult = jsonRpcResult(nullable(type({
    blockhash: string(),
    previousBlockhash: string(),
    parentSlot: number(),
    rewards: optional(array(RewardsResult)),
    blockTime: nullable(number()),
    blockHeight: nullable(number())
  })));
  var GetAccountsModeBlockRpcResult = jsonRpcResult(nullable(type({
    blockhash: string(),
    previousBlockhash: string(),
    parentSlot: number(),
    transactions: array(type({
      transaction: ConfirmedTransactionAccountsModeResult,
      meta: nullable(ConfirmedTransactionMetaResult),
      version: optional(TransactionVersionStruct)
    })),
    rewards: optional(array(RewardsResult)),
    blockTime: nullable(number()),
    blockHeight: nullable(number())
  })));
  var GetParsedBlockRpcResult = jsonRpcResult(nullable(type({
    blockhash: string(),
    previousBlockhash: string(),
    parentSlot: number(),
    transactions: array(type({
      transaction: ParsedConfirmedTransactionResult,
      meta: nullable(ParsedConfirmedTransactionMetaResult),
      version: optional(TransactionVersionStruct)
    })),
    rewards: optional(array(RewardsResult)),
    blockTime: nullable(number()),
    blockHeight: nullable(number())
  })));
  var GetParsedAccountsModeBlockRpcResult = jsonRpcResult(nullable(type({
    blockhash: string(),
    previousBlockhash: string(),
    parentSlot: number(),
    transactions: array(type({
      transaction: ConfirmedTransactionAccountsModeResult,
      meta: nullable(ParsedConfirmedTransactionMetaResult),
      version: optional(TransactionVersionStruct)
    })),
    rewards: optional(array(RewardsResult)),
    blockTime: nullable(number()),
    blockHeight: nullable(number())
  })));
  var GetParsedNoneModeBlockRpcResult = jsonRpcResult(nullable(type({
    blockhash: string(),
    previousBlockhash: string(),
    parentSlot: number(),
    rewards: optional(array(RewardsResult)),
    blockTime: nullable(number()),
    blockHeight: nullable(number())
  })));
  var GetConfirmedBlockRpcResult = jsonRpcResult(nullable(type({
    blockhash: string(),
    previousBlockhash: string(),
    parentSlot: number(),
    transactions: array(type({
      transaction: ConfirmedTransactionResult,
      meta: nullable(ConfirmedTransactionMetaResult)
    })),
    rewards: optional(array(RewardsResult)),
    blockTime: nullable(number())
  })));
  var GetBlockSignaturesRpcResult = jsonRpcResult(nullable(type({
    blockhash: string(),
    previousBlockhash: string(),
    parentSlot: number(),
    signatures: array(string()),
    blockTime: nullable(number())
  })));
  var GetTransactionRpcResult = jsonRpcResult(nullable(type({
    slot: number(),
    meta: nullable(ConfirmedTransactionMetaResult),
    blockTime: optional(nullable(number())),
    transaction: ConfirmedTransactionResult,
    version: optional(TransactionVersionStruct)
  })));
  var GetParsedTransactionRpcResult = jsonRpcResult(nullable(type({
    slot: number(),
    transaction: ParsedConfirmedTransactionResult,
    meta: nullable(ParsedConfirmedTransactionMetaResult),
    blockTime: optional(nullable(number())),
    version: optional(TransactionVersionStruct)
  })));
  var GetLatestBlockhashRpcResult = jsonRpcResultAndContext(type({
    blockhash: string(),
    lastValidBlockHeight: number()
  }));
  var IsBlockhashValidRpcResult = jsonRpcResultAndContext(boolean());
  var PerfSampleResult = type({
    slot: number(),
    numTransactions: number(),
    numSlots: number(),
    samplePeriodSecs: number()
  });
  var GetRecentPerformanceSamplesRpcResult = jsonRpcResult(array(PerfSampleResult));
  var GetFeeCalculatorRpcResult = jsonRpcResultAndContext(nullable(type({
    feeCalculator: type({
      lamportsPerSignature: number()
    })
  })));
  var RequestAirdropRpcResult = jsonRpcResult(string());
  var SendTransactionRpcResult = jsonRpcResult(string());
  var LogsResult = type({
    err: TransactionErrorResult,
    logs: array(string()),
    signature: string()
  });
  var LogsNotificationResult = type({
    result: notificationResultAndContext(LogsResult),
    subscription: number()
  });
  var COMMON_HTTP_HEADERS = {
    "solana-client": `js/${"1.0.0-maintenance"}`
  };

  class Connection {
    constructor(endpoint, _commitmentOrConfig) {
      this._commitment = undefined;
      this._confirmTransactionInitialTimeout = undefined;
      this._rpcEndpoint = undefined;
      this._rpcWsEndpoint = undefined;
      this._rpcClient = undefined;
      this._rpcRequest = undefined;
      this._rpcBatchRequest = undefined;
      this._rpcWebSocket = undefined;
      this._rpcWebSocketConnected = false;
      this._rpcWebSocketHeartbeat = null;
      this._rpcWebSocketIdleTimeout = null;
      this._rpcWebSocketGeneration = 0;
      this._disableBlockhashCaching = false;
      this._pollingBlockhash = false;
      this._blockhashInfo = {
        latestBlockhash: null,
        lastFetch: 0,
        transactionSignatures: [],
        simulatedSignatures: []
      };
      this._nextClientSubscriptionId = 0;
      this._subscriptionDisposeFunctionsByClientSubscriptionId = {};
      this._subscriptionHashByClientSubscriptionId = {};
      this._subscriptionStateChangeCallbacksByHash = {};
      this._subscriptionCallbacksByServerSubscriptionId = {};
      this._subscriptionsByHash = {};
      this._subscriptionsAutoDisposedByRpc = new Set;
      this.getBlockHeight = (() => {
        const requestPromises = {};
        return async (commitmentOrConfig) => {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([], commitment, undefined, config);
          const requestHash = fastStableStringify(args);
          requestPromises[requestHash] = requestPromises[requestHash] ?? (async () => {
            try {
              const unsafeRes = await this._rpcRequest("getBlockHeight", args);
              const res = create(unsafeRes, jsonRpcResult(number()));
              if ("error" in res) {
                throw new SolanaJSONRPCError(res.error, "failed to get block height information");
              }
              return res.result;
            } finally {
              delete requestPromises[requestHash];
            }
          })();
          return await requestPromises[requestHash];
        };
      })();
      let wsEndpoint;
      let httpHeaders;
      let fetch;
      let fetchMiddleware;
      let disableRetryOnRateLimit;
      let httpAgent;
      if (_commitmentOrConfig && typeof _commitmentOrConfig === "string") {
        this._commitment = _commitmentOrConfig;
      } else if (_commitmentOrConfig) {
        this._commitment = _commitmentOrConfig.commitment;
        this._confirmTransactionInitialTimeout = _commitmentOrConfig.confirmTransactionInitialTimeout;
        wsEndpoint = _commitmentOrConfig.wsEndpoint;
        httpHeaders = _commitmentOrConfig.httpHeaders;
        fetch = _commitmentOrConfig.fetch;
        fetchMiddleware = _commitmentOrConfig.fetchMiddleware;
        disableRetryOnRateLimit = _commitmentOrConfig.disableRetryOnRateLimit;
        httpAgent = _commitmentOrConfig.httpAgent;
      }
      this._rpcEndpoint = assertEndpointUrl(endpoint);
      this._rpcWsEndpoint = wsEndpoint || makeWebsocketUrl(endpoint);
      this._rpcClient = createRpcClient(endpoint, httpHeaders, fetch, fetchMiddleware, disableRetryOnRateLimit, httpAgent);
      this._rpcRequest = createRpcRequest(this._rpcClient);
      this._rpcBatchRequest = createRpcBatchRequest(this._rpcClient);
      this._rpcWebSocket = new RpcWebSocketClient(this._rpcWsEndpoint, {
        autoconnect: false,
        max_reconnects: Infinity
      });
      this._rpcWebSocket.on("open", this._wsOnOpen.bind(this));
      this._rpcWebSocket.on("error", this._wsOnError.bind(this));
      this._rpcWebSocket.on("close", this._wsOnClose.bind(this));
      this._rpcWebSocket.on("accountNotification", this._wsOnAccountNotification.bind(this));
      this._rpcWebSocket.on("programNotification", this._wsOnProgramAccountNotification.bind(this));
      this._rpcWebSocket.on("slotNotification", this._wsOnSlotNotification.bind(this));
      this._rpcWebSocket.on("slotsUpdatesNotification", this._wsOnSlotUpdatesNotification.bind(this));
      this._rpcWebSocket.on("signatureNotification", this._wsOnSignatureNotification.bind(this));
      this._rpcWebSocket.on("rootNotification", this._wsOnRootNotification.bind(this));
      this._rpcWebSocket.on("logsNotification", this._wsOnLogsNotification.bind(this));
    }
    get commitment() {
      return this._commitment;
    }
    get rpcEndpoint() {
      return this._rpcEndpoint;
    }
    async getBalanceAndContext(publicKey2, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([publicKey2.toBase58()], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("getBalance", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(number()));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get balance for ${publicKey2.toBase58()}`);
      }
      return res.result;
    }
    async getBalance(publicKey2, commitmentOrConfig) {
      return await this.getBalanceAndContext(publicKey2, commitmentOrConfig).then((x) => x.value).catch((e) => {
        throw new Error("failed to get balance of account " + publicKey2.toBase58() + ": " + e);
      });
    }
    async getBlockTime(slot) {
      const unsafeRes = await this._rpcRequest("getBlockTime", [slot]);
      const res = create(unsafeRes, jsonRpcResult(nullable(number())));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get block time for slot ${slot}`);
      }
      return res.result;
    }
    async getMinimumLedgerSlot() {
      const unsafeRes = await this._rpcRequest("minimumLedgerSlot", []);
      const res = create(unsafeRes, jsonRpcResult(number()));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get minimum ledger slot");
      }
      return res.result;
    }
    async getFirstAvailableBlock() {
      const unsafeRes = await this._rpcRequest("getFirstAvailableBlock", []);
      const res = create(unsafeRes, SlotRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get first available block");
      }
      return res.result;
    }
    async getSupply(config) {
      let configArg = {};
      if (typeof config === "string") {
        configArg = {
          commitment: config
        };
      } else if (config) {
        configArg = {
          ...config,
          commitment: config && config.commitment || this.commitment
        };
      } else {
        configArg = {
          commitment: this.commitment
        };
      }
      const unsafeRes = await this._rpcRequest("getSupply", [configArg]);
      const res = create(unsafeRes, GetSupplyRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get supply");
      }
      return res.result;
    }
    async getTokenSupply(tokenMintAddress, commitment) {
      const args = this._buildArgs([tokenMintAddress.toBase58()], commitment);
      const unsafeRes = await this._rpcRequest("getTokenSupply", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(TokenAmountResult));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get token supply");
      }
      return res.result;
    }
    async getTokenAccountBalance(tokenAddress, commitment) {
      const args = this._buildArgs([tokenAddress.toBase58()], commitment);
      const unsafeRes = await this._rpcRequest("getTokenAccountBalance", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(TokenAmountResult));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get token account balance");
      }
      return res.result;
    }
    async getTokenAccountsByOwner(ownerAddress, filter, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      let _args = [ownerAddress.toBase58()];
      if ("mint" in filter) {
        _args.push({
          mint: filter.mint.toBase58()
        });
      } else {
        _args.push({
          programId: filter.programId.toBase58()
        });
      }
      const args = this._buildArgs(_args, commitment, "base64", config);
      const unsafeRes = await this._rpcRequest("getTokenAccountsByOwner", args);
      const res = create(unsafeRes, GetTokenAccountsByOwner);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get token accounts owned by account ${ownerAddress.toBase58()}`);
      }
      return res.result;
    }
    async getParsedTokenAccountsByOwner(ownerAddress, filter, commitment) {
      let _args = [ownerAddress.toBase58()];
      if ("mint" in filter) {
        _args.push({
          mint: filter.mint.toBase58()
        });
      } else {
        _args.push({
          programId: filter.programId.toBase58()
        });
      }
      const args = this._buildArgs(_args, commitment, "jsonParsed");
      const unsafeRes = await this._rpcRequest("getTokenAccountsByOwner", args);
      const res = create(unsafeRes, GetParsedTokenAccountsByOwner);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get token accounts owned by account ${ownerAddress.toBase58()}`);
      }
      return res.result;
    }
    async getLargestAccounts(config) {
      const arg = {
        ...config,
        commitment: config && config.commitment || this.commitment
      };
      const args = arg.filter || arg.commitment ? [arg] : [];
      const unsafeRes = await this._rpcRequest("getLargestAccounts", args);
      const res = create(unsafeRes, GetLargestAccountsRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get largest accounts");
      }
      return res.result;
    }
    async getTokenLargestAccounts(mintAddress, commitment) {
      const args = this._buildArgs([mintAddress.toBase58()], commitment);
      const unsafeRes = await this._rpcRequest("getTokenLargestAccounts", args);
      const res = create(unsafeRes, GetTokenLargestAccountsResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get token largest accounts");
      }
      return res.result;
    }
    async getAccountInfoAndContext(publicKey2, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([publicKey2.toBase58()], commitment, "base64", config);
      const unsafeRes = await this._rpcRequest("getAccountInfo", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(nullable(AccountInfoResult)));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get info about account ${publicKey2.toBase58()}`);
      }
      return res.result;
    }
    async getParsedAccountInfo(publicKey2, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([publicKey2.toBase58()], commitment, "jsonParsed", config);
      const unsafeRes = await this._rpcRequest("getAccountInfo", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(nullable(ParsedAccountInfoResult)));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get info about account ${publicKey2.toBase58()}`);
      }
      return res.result;
    }
    async getAccountInfo(publicKey2, commitmentOrConfig) {
      try {
        const res = await this.getAccountInfoAndContext(publicKey2, commitmentOrConfig);
        return res.value;
      } catch (e) {
        throw new Error("failed to get info about account " + publicKey2.toBase58() + ": " + e);
      }
    }
    async getMultipleParsedAccounts(publicKeys, rawConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(rawConfig);
      const keys = publicKeys.map((key) => key.toBase58());
      const args = this._buildArgs([keys], commitment, "jsonParsed", config);
      const unsafeRes = await this._rpcRequest("getMultipleAccounts", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(array(nullable(ParsedAccountInfoResult))));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get info for accounts ${keys}`);
      }
      return res.result;
    }
    async getMultipleAccountsInfoAndContext(publicKeys, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const keys = publicKeys.map((key) => key.toBase58());
      const args = this._buildArgs([keys], commitment, "base64", config);
      const unsafeRes = await this._rpcRequest("getMultipleAccounts", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(array(nullable(AccountInfoResult))));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get info for accounts ${keys}`);
      }
      return res.result;
    }
    async getMultipleAccountsInfo(publicKeys, commitmentOrConfig) {
      const res = await this.getMultipleAccountsInfoAndContext(publicKeys, commitmentOrConfig);
      return res.value;
    }
    async getStakeActivation(publicKey2, commitmentOrConfig, epoch) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([publicKey2.toBase58()], commitment, undefined, {
        ...config,
        epoch: epoch != null ? epoch : config?.epoch
      });
      const unsafeRes = await this._rpcRequest("getStakeActivation", args);
      const res = create(unsafeRes, jsonRpcResult(StakeActivationResult));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get Stake Activation ${publicKey2.toBase58()}`);
      }
      return res.result;
    }
    async getProgramAccounts(programId, configOrCommitment) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(configOrCommitment);
      const {
        encoding,
        ...configWithoutEncoding
      } = config || {};
      const args = this._buildArgs([programId.toBase58()], commitment, encoding || "base64", {
        ...configWithoutEncoding,
        ...configWithoutEncoding.filters ? {
          filters: applyDefaultMemcmpEncodingToFilters(configWithoutEncoding.filters)
        } : null
      });
      const unsafeRes = await this._rpcRequest("getProgramAccounts", args);
      const baseSchema = array(KeyedAccountInfoResult);
      const res = configWithoutEncoding.withContext === true ? create(unsafeRes, jsonRpcResultAndContext(baseSchema)) : create(unsafeRes, jsonRpcResult(baseSchema));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get accounts owned by program ${programId.toBase58()}`);
      }
      return res.result;
    }
    async getParsedProgramAccounts(programId, configOrCommitment) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(configOrCommitment);
      const args = this._buildArgs([programId.toBase58()], commitment, "jsonParsed", config);
      const unsafeRes = await this._rpcRequest("getProgramAccounts", args);
      const res = create(unsafeRes, jsonRpcResult(array(KeyedParsedAccountInfoResult)));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get accounts owned by program ${programId.toBase58()}`);
      }
      return res.result;
    }
    async confirmTransaction(strategy, commitment) {
      let rawSignature;
      if (typeof strategy == "string") {
        rawSignature = strategy;
      } else {
        const config = strategy;
        if (config.abortSignal?.aborted) {
          return Promise.reject(config.abortSignal.reason);
        }
        rawSignature = config.signature;
      }
      let decodedSignature;
      try {
        decodedSignature = import_bs58.default.decode(rawSignature);
      } catch (err) {
        throw new Error("signature must be base58 encoded: " + rawSignature);
      }
      assert2(decodedSignature.length === 64, "signature has invalid length");
      if (typeof strategy === "string") {
        return await this.confirmTransactionUsingLegacyTimeoutStrategy({
          commitment: commitment || this.commitment,
          signature: rawSignature
        });
      } else if ("lastValidBlockHeight" in strategy) {
        return await this.confirmTransactionUsingBlockHeightExceedanceStrategy({
          commitment: commitment || this.commitment,
          strategy
        });
      } else {
        return await this.confirmTransactionUsingDurableNonceStrategy({
          commitment: commitment || this.commitment,
          strategy
        });
      }
    }
    getCancellationPromise(signal) {
      return new Promise((_, reject) => {
        if (signal == null) {
          return;
        }
        if (signal.aborted) {
          reject(signal.reason);
        } else {
          signal.addEventListener("abort", () => {
            reject(signal.reason);
          });
        }
      });
    }
    getTransactionConfirmationPromise({
      commitment,
      signature
    }) {
      let signatureSubscriptionId;
      let disposeSignatureSubscriptionStateChangeObserver;
      let done = false;
      const confirmationPromise = new Promise((resolve, reject) => {
        try {
          signatureSubscriptionId = this.onSignature(signature, (result, context) => {
            signatureSubscriptionId = undefined;
            const response = {
              context,
              value: result
            };
            resolve({
              __type: TransactionStatus.PROCESSED,
              response
            });
          }, commitment);
          const subscriptionSetupPromise = new Promise((resolveSubscriptionSetup) => {
            if (signatureSubscriptionId == null) {
              resolveSubscriptionSetup();
            } else {
              disposeSignatureSubscriptionStateChangeObserver = this._onSubscriptionStateChange(signatureSubscriptionId, (nextState) => {
                if (nextState === "subscribed") {
                  resolveSubscriptionSetup();
                }
              });
            }
          });
          (async () => {
            await subscriptionSetupPromise;
            if (done)
              return;
            const response = await this.getSignatureStatus(signature);
            if (done)
              return;
            if (response == null) {
              return;
            }
            const {
              context,
              value
            } = response;
            if (value == null) {
              return;
            }
            if (value?.err) {
              reject(value.err);
            } else {
              switch (commitment) {
                case "confirmed":
                case "single":
                case "singleGossip": {
                  if (value.confirmationStatus === "processed") {
                    return;
                  }
                  break;
                }
                case "finalized":
                case "max":
                case "root": {
                  if (value.confirmationStatus === "processed" || value.confirmationStatus === "confirmed") {
                    return;
                  }
                  break;
                }
                case "processed":
                case "recent":
              }
              done = true;
              resolve({
                __type: TransactionStatus.PROCESSED,
                response: {
                  context,
                  value
                }
              });
            }
          })();
        } catch (err) {
          reject(err);
        }
      });
      const abortConfirmation = () => {
        if (disposeSignatureSubscriptionStateChangeObserver) {
          disposeSignatureSubscriptionStateChangeObserver();
          disposeSignatureSubscriptionStateChangeObserver = undefined;
        }
        if (signatureSubscriptionId != null) {
          this.removeSignatureListener(signatureSubscriptionId);
          signatureSubscriptionId = undefined;
        }
      };
      return {
        abortConfirmation,
        confirmationPromise
      };
    }
    async confirmTransactionUsingBlockHeightExceedanceStrategy({
      commitment,
      strategy: {
        abortSignal,
        lastValidBlockHeight,
        signature
      }
    }) {
      let done = false;
      const expiryPromise = new Promise((resolve) => {
        const checkBlockHeight = async () => {
          try {
            const blockHeight = await this.getBlockHeight(commitment);
            return blockHeight;
          } catch (_e) {
            return -1;
          }
        };
        (async () => {
          let currentBlockHeight = await checkBlockHeight();
          if (done)
            return;
          while (currentBlockHeight <= lastValidBlockHeight) {
            await sleep(1000);
            if (done)
              return;
            currentBlockHeight = await checkBlockHeight();
            if (done)
              return;
          }
          resolve({
            __type: TransactionStatus.BLOCKHEIGHT_EXCEEDED
          });
        })();
      });
      const {
        abortConfirmation,
        confirmationPromise
      } = this.getTransactionConfirmationPromise({
        commitment,
        signature
      });
      const cancellationPromise = this.getCancellationPromise(abortSignal);
      let result;
      try {
        const outcome = await Promise.race([cancellationPromise, confirmationPromise, expiryPromise]);
        if (outcome.__type === TransactionStatus.PROCESSED) {
          result = outcome.response;
        } else {
          throw new TransactionExpiredBlockheightExceededError(signature);
        }
      } finally {
        done = true;
        abortConfirmation();
      }
      return result;
    }
    async confirmTransactionUsingDurableNonceStrategy({
      commitment,
      strategy: {
        abortSignal,
        minContextSlot,
        nonceAccountPubkey,
        nonceValue,
        signature
      }
    }) {
      let done = false;
      const expiryPromise = new Promise((resolve) => {
        let currentNonceValue = nonceValue;
        let lastCheckedSlot = null;
        const getCurrentNonceValue = async () => {
          try {
            const {
              context,
              value: nonceAccount
            } = await this.getNonceAndContext(nonceAccountPubkey, {
              commitment,
              minContextSlot
            });
            lastCheckedSlot = context.slot;
            return nonceAccount?.nonce;
          } catch (e) {
            return currentNonceValue;
          }
        };
        (async () => {
          currentNonceValue = await getCurrentNonceValue();
          if (done)
            return;
          while (true) {
            if (nonceValue !== currentNonceValue) {
              resolve({
                __type: TransactionStatus.NONCE_INVALID,
                slotInWhichNonceDidAdvance: lastCheckedSlot
              });
              return;
            }
            await sleep(2000);
            if (done)
              return;
            currentNonceValue = await getCurrentNonceValue();
            if (done)
              return;
          }
        })();
      });
      const {
        abortConfirmation,
        confirmationPromise
      } = this.getTransactionConfirmationPromise({
        commitment,
        signature
      });
      const cancellationPromise = this.getCancellationPromise(abortSignal);
      let result;
      try {
        const outcome = await Promise.race([cancellationPromise, confirmationPromise, expiryPromise]);
        if (outcome.__type === TransactionStatus.PROCESSED) {
          result = outcome.response;
        } else {
          let signatureStatus;
          while (true) {
            const status = await this.getSignatureStatus(signature);
            if (status == null) {
              break;
            }
            if (status.context.slot < (outcome.slotInWhichNonceDidAdvance ?? minContextSlot)) {
              await sleep(400);
              continue;
            }
            signatureStatus = status;
            break;
          }
          if (signatureStatus?.value) {
            const commitmentForStatus = commitment || "finalized";
            const {
              confirmationStatus
            } = signatureStatus.value;
            switch (commitmentForStatus) {
              case "processed":
              case "recent":
                if (confirmationStatus !== "processed" && confirmationStatus !== "confirmed" && confirmationStatus !== "finalized") {
                  throw new TransactionExpiredNonceInvalidError(signature);
                }
                break;
              case "confirmed":
              case "single":
              case "singleGossip":
                if (confirmationStatus !== "confirmed" && confirmationStatus !== "finalized") {
                  throw new TransactionExpiredNonceInvalidError(signature);
                }
                break;
              case "finalized":
              case "max":
              case "root":
                if (confirmationStatus !== "finalized") {
                  throw new TransactionExpiredNonceInvalidError(signature);
                }
                break;
              default:
                ((_) => {})(commitmentForStatus);
            }
            result = {
              context: signatureStatus.context,
              value: {
                err: signatureStatus.value.err
              }
            };
          } else {
            throw new TransactionExpiredNonceInvalidError(signature);
          }
        }
      } finally {
        done = true;
        abortConfirmation();
      }
      return result;
    }
    async confirmTransactionUsingLegacyTimeoutStrategy({
      commitment,
      signature
    }) {
      let timeoutId;
      const expiryPromise = new Promise((resolve) => {
        let timeoutMs = this._confirmTransactionInitialTimeout || 60 * 1000;
        switch (commitment) {
          case "processed":
          case "recent":
          case "single":
          case "confirmed":
          case "singleGossip": {
            timeoutMs = this._confirmTransactionInitialTimeout || 30 * 1000;
            break;
          }
        }
        timeoutId = setTimeout(() => resolve({
          __type: TransactionStatus.TIMED_OUT,
          timeoutMs
        }), timeoutMs);
      });
      const {
        abortConfirmation,
        confirmationPromise
      } = this.getTransactionConfirmationPromise({
        commitment,
        signature
      });
      let result;
      try {
        const outcome = await Promise.race([confirmationPromise, expiryPromise]);
        if (outcome.__type === TransactionStatus.PROCESSED) {
          result = outcome.response;
        } else {
          throw new TransactionExpiredTimeoutError(signature, outcome.timeoutMs / 1000);
        }
      } finally {
        clearTimeout(timeoutId);
        abortConfirmation();
      }
      return result;
    }
    async getClusterNodes() {
      const unsafeRes = await this._rpcRequest("getClusterNodes", []);
      const res = create(unsafeRes, jsonRpcResult(array(ContactInfoResult)));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get cluster nodes");
      }
      return res.result;
    }
    async getVoteAccounts(commitment) {
      const args = this._buildArgs([], commitment);
      const unsafeRes = await this._rpcRequest("getVoteAccounts", args);
      const res = create(unsafeRes, GetVoteAccounts);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get vote accounts");
      }
      return res.result;
    }
    async getSlot(commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("getSlot", args);
      const res = create(unsafeRes, jsonRpcResult(number()));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get slot");
      }
      return res.result;
    }
    async getSlotLeader(commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("getSlotLeader", args);
      const res = create(unsafeRes, jsonRpcResult(string()));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get slot leader");
      }
      return res.result;
    }
    async getSlotLeaders(startSlot, limit) {
      const args = [startSlot, limit];
      const unsafeRes = await this._rpcRequest("getSlotLeaders", args);
      const res = create(unsafeRes, jsonRpcResult(array(PublicKeyFromString)));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get slot leaders");
      }
      return res.result;
    }
    async getSignatureStatus(signature, config) {
      const {
        context,
        value: values
      } = await this.getSignatureStatuses([signature], config);
      assert2(values.length === 1);
      const value = values[0];
      return {
        context,
        value
      };
    }
    async getSignatureStatuses(signatures, config) {
      const params = [signatures];
      if (config) {
        params.push(config);
      }
      const unsafeRes = await this._rpcRequest("getSignatureStatuses", params);
      const res = create(unsafeRes, GetSignatureStatusesRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get signature status");
      }
      return res.result;
    }
    async getTransactionCount(commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("getTransactionCount", args);
      const res = create(unsafeRes, jsonRpcResult(number()));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get transaction count");
      }
      return res.result;
    }
    async getTotalSupply(commitment) {
      const result = await this.getSupply({
        commitment,
        excludeNonCirculatingAccountsList: true
      });
      return result.value.total;
    }
    async getInflationGovernor(commitment) {
      const args = this._buildArgs([], commitment);
      const unsafeRes = await this._rpcRequest("getInflationGovernor", args);
      const res = create(unsafeRes, GetInflationGovernorRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get inflation");
      }
      return res.result;
    }
    async getInflationReward(addresses, epoch, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([addresses.map((pubkey) => pubkey.toBase58())], commitment, undefined, {
        ...config,
        epoch: epoch != null ? epoch : config?.epoch
      });
      const unsafeRes = await this._rpcRequest("getInflationReward", args);
      const res = create(unsafeRes, GetInflationRewardResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get inflation reward");
      }
      return res.result;
    }
    async getInflationRate() {
      const unsafeRes = await this._rpcRequest("getInflationRate", []);
      const res = create(unsafeRes, GetInflationRateRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get inflation rate");
      }
      return res.result;
    }
    async getEpochInfo(commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("getEpochInfo", args);
      const res = create(unsafeRes, GetEpochInfoRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get epoch info");
      }
      return res.result;
    }
    async getEpochSchedule() {
      const unsafeRes = await this._rpcRequest("getEpochSchedule", []);
      const res = create(unsafeRes, GetEpochScheduleRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get epoch schedule");
      }
      const epochSchedule = res.result;
      return new EpochSchedule(epochSchedule.slotsPerEpoch, epochSchedule.leaderScheduleSlotOffset, epochSchedule.warmup, epochSchedule.firstNormalEpoch, epochSchedule.firstNormalSlot);
    }
    async getLeaderSchedule() {
      const unsafeRes = await this._rpcRequest("getLeaderSchedule", []);
      const res = create(unsafeRes, GetLeaderScheduleRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get leader schedule");
      }
      return res.result;
    }
    async getMinimumBalanceForRentExemption(dataLength, commitment) {
      const args = this._buildArgs([dataLength], commitment);
      const unsafeRes = await this._rpcRequest("getMinimumBalanceForRentExemption", args);
      const res = create(unsafeRes, GetMinimumBalanceForRentExemptionRpcResult);
      if ("error" in res) {
        console.warn("Unable to fetch minimum balance for rent exemption");
        return 0;
      }
      return res.result;
    }
    async getRecentBlockhashAndContext(commitment) {
      const {
        context,
        value: {
          blockhash
        }
      } = await this.getLatestBlockhashAndContext(commitment);
      const feeCalculator = {
        get lamportsPerSignature() {
          throw new Error("The capability to fetch `lamportsPerSignature` using the `getRecentBlockhash` API is " + "no longer offered by the network. Use the `getFeeForMessage` API to obtain the fee " + "for a given message.");
        },
        toJSON() {
          return {};
        }
      };
      return {
        context,
        value: {
          blockhash,
          feeCalculator
        }
      };
    }
    async getRecentPerformanceSamples(limit) {
      const unsafeRes = await this._rpcRequest("getRecentPerformanceSamples", limit ? [limit] : []);
      const res = create(unsafeRes, GetRecentPerformanceSamplesRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get recent performance samples");
      }
      return res.result;
    }
    async getFeeCalculatorForBlockhash(blockhash, commitment) {
      const args = this._buildArgs([blockhash], commitment);
      const unsafeRes = await this._rpcRequest("getFeeCalculatorForBlockhash", args);
      const res = create(unsafeRes, GetFeeCalculatorRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get fee calculator");
      }
      const {
        context,
        value
      } = res.result;
      return {
        context,
        value: value !== null ? value.feeCalculator : null
      };
    }
    async getFeeForMessage(message, commitment) {
      const wireMessage = toBuffer(message.serialize()).toString("base64");
      const args = this._buildArgs([wireMessage], commitment);
      const unsafeRes = await this._rpcRequest("getFeeForMessage", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(nullable(number())));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get fee for message");
      }
      if (res.result === null) {
        throw new Error("invalid blockhash");
      }
      return res.result;
    }
    async getRecentPrioritizationFees(config) {
      const accounts = config?.lockedWritableAccounts?.map((key) => key.toBase58());
      const args = accounts?.length ? [accounts] : [];
      const unsafeRes = await this._rpcRequest("getRecentPrioritizationFees", args);
      const res = create(unsafeRes, GetRecentPrioritizationFeesRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get recent prioritization fees");
      }
      return res.result;
    }
    async getRecentBlockhash(commitment) {
      try {
        const res = await this.getRecentBlockhashAndContext(commitment);
        return res.value;
      } catch (e) {
        throw new Error("failed to get recent blockhash: " + e);
      }
    }
    async getLatestBlockhash(commitmentOrConfig) {
      try {
        const res = await this.getLatestBlockhashAndContext(commitmentOrConfig);
        return res.value;
      } catch (e) {
        throw new Error("failed to get recent blockhash: " + e);
      }
    }
    async getLatestBlockhashAndContext(commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("getLatestBlockhash", args);
      const res = create(unsafeRes, GetLatestBlockhashRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get latest blockhash");
      }
      return res.result;
    }
    async isBlockhashValid(blockhash, rawConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(rawConfig);
      const args = this._buildArgs([blockhash], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("isBlockhashValid", args);
      const res = create(unsafeRes, IsBlockhashValidRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to determine if the blockhash `" + blockhash + "`is valid");
      }
      return res.result;
    }
    async getVersion() {
      const unsafeRes = await this._rpcRequest("getVersion", []);
      const res = create(unsafeRes, jsonRpcResult(VersionResult));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get version");
      }
      return res.result;
    }
    async getGenesisHash() {
      const unsafeRes = await this._rpcRequest("getGenesisHash", []);
      const res = create(unsafeRes, jsonRpcResult(string()));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get genesis hash");
      }
      return res.result;
    }
    async getBlock(slot, rawConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(rawConfig);
      const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("getBlock", args);
      try {
        switch (config?.transactionDetails) {
          case "accounts": {
            const res = create(unsafeRes, GetAccountsModeBlockRpcResult);
            if ("error" in res) {
              throw res.error;
            }
            return res.result;
          }
          case "none": {
            const res = create(unsafeRes, GetNoneModeBlockRpcResult);
            if ("error" in res) {
              throw res.error;
            }
            return res.result;
          }
          default: {
            const res = create(unsafeRes, GetBlockRpcResult);
            if ("error" in res) {
              throw res.error;
            }
            const {
              result
            } = res;
            return result ? {
              ...result,
              transactions: result.transactions.map(({
                transaction,
                meta,
                version: version2
              }) => ({
                meta,
                transaction: {
                  ...transaction,
                  message: versionedMessageFromResponse(version2, transaction.message)
                },
                version: version2
              }))
            } : null;
          }
        }
      } catch (e) {
        throw new SolanaJSONRPCError(e, "failed to get confirmed block");
      }
    }
    async getParsedBlock(slot, rawConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(rawConfig);
      const args = this._buildArgsAtLeastConfirmed([slot], commitment, "jsonParsed", config);
      const unsafeRes = await this._rpcRequest("getBlock", args);
      try {
        switch (config?.transactionDetails) {
          case "accounts": {
            const res = create(unsafeRes, GetParsedAccountsModeBlockRpcResult);
            if ("error" in res) {
              throw res.error;
            }
            return res.result;
          }
          case "none": {
            const res = create(unsafeRes, GetParsedNoneModeBlockRpcResult);
            if ("error" in res) {
              throw res.error;
            }
            return res.result;
          }
          default: {
            const res = create(unsafeRes, GetParsedBlockRpcResult);
            if ("error" in res) {
              throw res.error;
            }
            return res.result;
          }
        }
      } catch (e) {
        throw new SolanaJSONRPCError(e, "failed to get block");
      }
    }
    async getBlockProduction(configOrCommitment) {
      let extra;
      let commitment;
      if (typeof configOrCommitment === "string") {
        commitment = configOrCommitment;
      } else if (configOrCommitment) {
        const {
          commitment: c,
          ...rest
        } = configOrCommitment;
        commitment = c;
        extra = rest;
      }
      const args = this._buildArgs([], commitment, "base64", extra);
      const unsafeRes = await this._rpcRequest("getBlockProduction", args);
      const res = create(unsafeRes, BlockProductionResponseStruct);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get block production information");
      }
      return res.result;
    }
    async getTransaction(signature, rawConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(rawConfig);
      const args = this._buildArgsAtLeastConfirmed([signature], commitment, undefined, config);
      const unsafeRes = await this._rpcRequest("getTransaction", args);
      const res = create(unsafeRes, GetTransactionRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get transaction");
      }
      const result = res.result;
      if (!result)
        return result;
      return {
        ...result,
        transaction: {
          ...result.transaction,
          message: versionedMessageFromResponse(result.version, result.transaction.message)
        }
      };
    }
    async getParsedTransaction(signature, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgsAtLeastConfirmed([signature], commitment, "jsonParsed", config);
      const unsafeRes = await this._rpcRequest("getTransaction", args);
      const res = create(unsafeRes, GetParsedTransactionRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get transaction");
      }
      return res.result;
    }
    async getParsedTransactions(signatures, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const batch = signatures.map((signature) => {
        const args = this._buildArgsAtLeastConfirmed([signature], commitment, "jsonParsed", config);
        return {
          methodName: "getTransaction",
          args
        };
      });
      const unsafeRes = await this._rpcBatchRequest(batch);
      const res = unsafeRes.map((unsafeRes2) => {
        const res2 = create(unsafeRes2, GetParsedTransactionRpcResult);
        if ("error" in res2) {
          throw new SolanaJSONRPCError(res2.error, "failed to get transactions");
        }
        return res2.result;
      });
      return res;
    }
    async getTransactions(signatures, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const batch = signatures.map((signature) => {
        const args = this._buildArgsAtLeastConfirmed([signature], commitment, undefined, config);
        return {
          methodName: "getTransaction",
          args
        };
      });
      const unsafeRes = await this._rpcBatchRequest(batch);
      const res = unsafeRes.map((unsafeRes2) => {
        const res2 = create(unsafeRes2, GetTransactionRpcResult);
        if ("error" in res2) {
          throw new SolanaJSONRPCError(res2.error, "failed to get transactions");
        }
        const result = res2.result;
        if (!result)
          return result;
        return {
          ...result,
          transaction: {
            ...result.transaction,
            message: versionedMessageFromResponse(result.version, result.transaction.message)
          }
        };
      });
      return res;
    }
    async getConfirmedBlock(slot, commitment) {
      const args = this._buildArgsAtLeastConfirmed([slot], commitment);
      const unsafeRes = await this._rpcRequest("getBlock", args);
      const res = create(unsafeRes, GetConfirmedBlockRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get confirmed block");
      }
      const result = res.result;
      if (!result) {
        throw new Error("Confirmed block " + slot + " not found");
      }
      const block = {
        ...result,
        transactions: result.transactions.map(({
          transaction,
          meta
        }) => {
          const message = new Message(transaction.message);
          return {
            meta,
            transaction: {
              ...transaction,
              message
            }
          };
        })
      };
      return {
        ...block,
        transactions: block.transactions.map(({
          transaction,
          meta
        }) => {
          return {
            meta,
            transaction: Transaction.populate(transaction.message, transaction.signatures)
          };
        })
      };
    }
    async getBlocks(startSlot, endSlot, commitment) {
      const args = this._buildArgsAtLeastConfirmed(endSlot !== undefined ? [startSlot, endSlot] : [startSlot], commitment);
      const unsafeRes = await this._rpcRequest("getBlocks", args);
      const res = create(unsafeRes, jsonRpcResult(array(number())));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get blocks");
      }
      return res.result;
    }
    async getBlockSignatures(slot, commitment) {
      const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined, {
        transactionDetails: "signatures",
        rewards: false
      });
      const unsafeRes = await this._rpcRequest("getBlock", args);
      const res = create(unsafeRes, GetBlockSignaturesRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get block");
      }
      const result = res.result;
      if (!result) {
        throw new Error("Block " + slot + " not found");
      }
      return result;
    }
    async getConfirmedBlockSignatures(slot, commitment) {
      const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined, {
        transactionDetails: "signatures",
        rewards: false
      });
      const unsafeRes = await this._rpcRequest("getBlock", args);
      const res = create(unsafeRes, GetBlockSignaturesRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get confirmed block");
      }
      const result = res.result;
      if (!result) {
        throw new Error("Confirmed block " + slot + " not found");
      }
      return result;
    }
    async getConfirmedTransaction(signature, commitment) {
      const args = this._buildArgsAtLeastConfirmed([signature], commitment);
      const unsafeRes = await this._rpcRequest("getTransaction", args);
      const res = create(unsafeRes, GetTransactionRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get transaction");
      }
      const result = res.result;
      if (!result)
        return result;
      const message = new Message(result.transaction.message);
      const signatures = result.transaction.signatures;
      return {
        ...result,
        transaction: Transaction.populate(message, signatures)
      };
    }
    async getParsedConfirmedTransaction(signature, commitment) {
      const args = this._buildArgsAtLeastConfirmed([signature], commitment, "jsonParsed");
      const unsafeRes = await this._rpcRequest("getTransaction", args);
      const res = create(unsafeRes, GetParsedTransactionRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get confirmed transaction");
      }
      return res.result;
    }
    async getParsedConfirmedTransactions(signatures, commitment) {
      const batch = signatures.map((signature) => {
        const args = this._buildArgsAtLeastConfirmed([signature], commitment, "jsonParsed");
        return {
          methodName: "getTransaction",
          args
        };
      });
      const unsafeRes = await this._rpcBatchRequest(batch);
      const res = unsafeRes.map((unsafeRes2) => {
        const res2 = create(unsafeRes2, GetParsedTransactionRpcResult);
        if ("error" in res2) {
          throw new SolanaJSONRPCError(res2.error, "failed to get confirmed transactions");
        }
        return res2.result;
      });
      return res;
    }
    async getConfirmedSignaturesForAddress(address, startSlot, endSlot) {
      let options = {};
      let firstAvailableBlock = await this.getFirstAvailableBlock();
      while (!("until" in options)) {
        startSlot--;
        if (startSlot <= 0 || startSlot < firstAvailableBlock) {
          break;
        }
        try {
          const block = await this.getConfirmedBlockSignatures(startSlot, "finalized");
          if (block.signatures.length > 0) {
            options.until = block.signatures[block.signatures.length - 1].toString();
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes("skipped")) {
            continue;
          } else {
            throw err;
          }
        }
      }
      let highestConfirmedRoot = await this.getSlot("finalized");
      while (!("before" in options)) {
        endSlot++;
        if (endSlot > highestConfirmedRoot) {
          break;
        }
        try {
          const block = await this.getConfirmedBlockSignatures(endSlot);
          if (block.signatures.length > 0) {
            options.before = block.signatures[block.signatures.length - 1].toString();
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes("skipped")) {
            continue;
          } else {
            throw err;
          }
        }
      }
      const confirmedSignatureInfo = await this.getConfirmedSignaturesForAddress2(address, options);
      return confirmedSignatureInfo.map((info) => info.signature);
    }
    async getConfirmedSignaturesForAddress2(address, options, commitment) {
      const args = this._buildArgsAtLeastConfirmed([address.toBase58()], commitment, undefined, options);
      const unsafeRes = await this._rpcRequest("getConfirmedSignaturesForAddress2", args);
      const res = create(unsafeRes, GetConfirmedSignaturesForAddress2RpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get confirmed signatures for address");
      }
      return res.result;
    }
    async getSignaturesForAddress(address, options, commitment) {
      const args = this._buildArgsAtLeastConfirmed([address.toBase58()], commitment, undefined, options);
      const unsafeRes = await this._rpcRequest("getSignaturesForAddress", args);
      const res = create(unsafeRes, GetSignaturesForAddressRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, "failed to get signatures for address");
      }
      return res.result;
    }
    async getAddressLookupTable(accountKey, config) {
      const {
        context,
        value: accountInfo
      } = await this.getAccountInfoAndContext(accountKey, config);
      let value = null;
      if (accountInfo !== null) {
        value = new AddressLookupTableAccount({
          key: accountKey,
          state: AddressLookupTableAccount.deserialize(accountInfo.data)
        });
      }
      return {
        context,
        value
      };
    }
    async getNonceAndContext(nonceAccount, commitmentOrConfig) {
      const {
        context,
        value: accountInfo
      } = await this.getAccountInfoAndContext(nonceAccount, commitmentOrConfig);
      let value = null;
      if (accountInfo !== null) {
        value = NonceAccount.fromAccountData(accountInfo.data);
      }
      return {
        context,
        value
      };
    }
    async getNonce(nonceAccount, commitmentOrConfig) {
      return await this.getNonceAndContext(nonceAccount, commitmentOrConfig).then((x) => x.value).catch((e) => {
        throw new Error("failed to get nonce for account " + nonceAccount.toBase58() + ": " + e);
      });
    }
    async requestAirdrop(to, lamports) {
      const unsafeRes = await this._rpcRequest("requestAirdrop", [to.toBase58(), lamports]);
      const res = create(unsafeRes, RequestAirdropRpcResult);
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `airdrop to ${to.toBase58()} failed`);
      }
      return res.result;
    }
    async _blockhashWithExpiryBlockHeight(disableCache) {
      if (!disableCache) {
        while (this._pollingBlockhash) {
          await sleep(100);
        }
        const timeSinceFetch = Date.now() - this._blockhashInfo.lastFetch;
        const expired = timeSinceFetch >= BLOCKHASH_CACHE_TIMEOUT_MS;
        if (this._blockhashInfo.latestBlockhash !== null && !expired) {
          return this._blockhashInfo.latestBlockhash;
        }
      }
      return await this._pollNewBlockhash();
    }
    async _pollNewBlockhash() {
      this._pollingBlockhash = true;
      try {
        const startTime = Date.now();
        const cachedLatestBlockhash = this._blockhashInfo.latestBlockhash;
        const cachedBlockhash = cachedLatestBlockhash ? cachedLatestBlockhash.blockhash : null;
        for (let i3 = 0;i3 < 50; i3++) {
          const latestBlockhash = await this.getLatestBlockhash("finalized");
          if (cachedBlockhash !== latestBlockhash.blockhash) {
            this._blockhashInfo = {
              latestBlockhash,
              lastFetch: Date.now(),
              transactionSignatures: [],
              simulatedSignatures: []
            };
            return latestBlockhash;
          }
          await sleep(MS_PER_SLOT / 2);
        }
        throw new Error(`Unable to obtain a new blockhash after ${Date.now() - startTime}ms`);
      } finally {
        this._pollingBlockhash = false;
      }
    }
    async getStakeMinimumDelegation(config) {
      const {
        commitment,
        config: configArg
      } = extractCommitmentFromConfig(config);
      const args = this._buildArgs([], commitment, "base64", configArg);
      const unsafeRes = await this._rpcRequest("getStakeMinimumDelegation", args);
      const res = create(unsafeRes, jsonRpcResultAndContext(number()));
      if ("error" in res) {
        throw new SolanaJSONRPCError(res.error, `failed to get stake minimum delegation`);
      }
      return res.result;
    }
    async simulateTransaction(transactionOrMessage, configOrSigners, includeAccounts) {
      if ("message" in transactionOrMessage) {
        const versionedTx = transactionOrMessage;
        const wireTransaction2 = versionedTx.serialize();
        const encodedTransaction2 = Buffer2.from(wireTransaction2).toString("base64");
        if (Array.isArray(configOrSigners) || includeAccounts !== undefined) {
          throw new Error("Invalid arguments");
        }
        const config2 = configOrSigners || {};
        config2.encoding = "base64";
        if (!("commitment" in config2)) {
          config2.commitment = this.commitment;
        }
        if (configOrSigners && typeof configOrSigners === "object" && "innerInstructions" in configOrSigners) {
          config2.innerInstructions = configOrSigners.innerInstructions;
        }
        const args2 = [encodedTransaction2, config2];
        const unsafeRes2 = await this._rpcRequest("simulateTransaction", args2);
        const res2 = create(unsafeRes2, SimulatedTransactionResponseStruct);
        if ("error" in res2) {
          throw new Error("failed to simulate transaction: " + res2.error.message);
        }
        return res2.result;
      }
      let transaction;
      if (transactionOrMessage instanceof Transaction) {
        let originalTx = transactionOrMessage;
        transaction = new Transaction;
        transaction.feePayer = originalTx.feePayer;
        transaction.instructions = transactionOrMessage.instructions;
        transaction.nonceInfo = originalTx.nonceInfo;
        transaction.signatures = originalTx.signatures;
      } else {
        transaction = Transaction.populate(transactionOrMessage);
        transaction._message = transaction._json = undefined;
      }
      if (configOrSigners !== undefined && !Array.isArray(configOrSigners)) {
        throw new Error("Invalid arguments");
      }
      const signers = configOrSigners;
      if (transaction.nonceInfo && signers) {
        transaction.sign(...signers);
      } else {
        let disableCache = this._disableBlockhashCaching;
        for (;; ) {
          const latestBlockhash = await this._blockhashWithExpiryBlockHeight(disableCache);
          transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
          transaction.recentBlockhash = latestBlockhash.blockhash;
          if (!signers)
            break;
          transaction.sign(...signers);
          if (!transaction.signature) {
            throw new Error("!signature");
          }
          const signature = transaction.signature.toString("base64");
          if (!this._blockhashInfo.simulatedSignatures.includes(signature) && !this._blockhashInfo.transactionSignatures.includes(signature)) {
            this._blockhashInfo.simulatedSignatures.push(signature);
            break;
          } else {
            disableCache = true;
          }
        }
      }
      const message = transaction._compile();
      const signData = message.serialize();
      const wireTransaction = transaction._serialize(signData);
      const encodedTransaction = wireTransaction.toString("base64");
      const config = {
        encoding: "base64",
        commitment: this.commitment
      };
      if (includeAccounts) {
        const addresses = (Array.isArray(includeAccounts) ? includeAccounts : message.nonProgramIds()).map((key) => key.toBase58());
        config["accounts"] = {
          encoding: "base64",
          addresses
        };
      }
      if (signers) {
        config.sigVerify = true;
      }
      if (configOrSigners && typeof configOrSigners === "object" && "innerInstructions" in configOrSigners) {
        config.innerInstructions = configOrSigners.innerInstructions;
      }
      const args = [encodedTransaction, config];
      const unsafeRes = await this._rpcRequest("simulateTransaction", args);
      const res = create(unsafeRes, SimulatedTransactionResponseStruct);
      if ("error" in res) {
        let logs;
        if ("data" in res.error) {
          logs = res.error.data.logs;
          if (logs && Array.isArray(logs)) {
            const traceIndent = `
    `;
            const logTrace = traceIndent + logs.join(traceIndent);
            console.error(res.error.message, logTrace);
          }
        }
        throw new SendTransactionError({
          action: "simulate",
          signature: "",
          transactionMessage: res.error.message,
          logs
        });
      }
      return res.result;
    }
    async sendTransaction(transaction, signersOrOptions, options) {
      if ("version" in transaction) {
        if (signersOrOptions && Array.isArray(signersOrOptions)) {
          throw new Error("Invalid arguments");
        }
        const wireTransaction2 = transaction.serialize();
        return await this.sendRawTransaction(wireTransaction2, signersOrOptions);
      }
      if (signersOrOptions === undefined || !Array.isArray(signersOrOptions)) {
        throw new Error("Invalid arguments");
      }
      const signers = signersOrOptions;
      if (transaction.nonceInfo) {
        transaction.sign(...signers);
      } else {
        let disableCache = this._disableBlockhashCaching;
        for (;; ) {
          const latestBlockhash = await this._blockhashWithExpiryBlockHeight(disableCache);
          transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
          transaction.recentBlockhash = latestBlockhash.blockhash;
          transaction.sign(...signers);
          if (!transaction.signature) {
            throw new Error("!signature");
          }
          const signature = transaction.signature.toString("base64");
          if (!this._blockhashInfo.transactionSignatures.includes(signature)) {
            this._blockhashInfo.transactionSignatures.push(signature);
            break;
          } else {
            disableCache = true;
          }
        }
      }
      const wireTransaction = transaction.serialize();
      return await this.sendRawTransaction(wireTransaction, options);
    }
    async sendRawTransaction(rawTransaction, options) {
      const encodedTransaction = toBuffer(rawTransaction).toString("base64");
      const result = await this.sendEncodedTransaction(encodedTransaction, options);
      return result;
    }
    async sendEncodedTransaction(encodedTransaction, options) {
      const config = {
        encoding: "base64"
      };
      const skipPreflight = options && options.skipPreflight;
      const preflightCommitment = skipPreflight === true ? "processed" : options && options.preflightCommitment || this.commitment;
      if (options && options.maxRetries != null) {
        config.maxRetries = options.maxRetries;
      }
      if (options && options.minContextSlot != null) {
        config.minContextSlot = options.minContextSlot;
      }
      if (skipPreflight) {
        config.skipPreflight = skipPreflight;
      }
      if (preflightCommitment) {
        config.preflightCommitment = preflightCommitment;
      }
      const args = [encodedTransaction, config];
      const unsafeRes = await this._rpcRequest("sendTransaction", args);
      const res = create(unsafeRes, SendTransactionRpcResult);
      if ("error" in res) {
        let logs = undefined;
        if ("data" in res.error) {
          logs = res.error.data.logs;
        }
        throw new SendTransactionError({
          action: skipPreflight ? "send" : "simulate",
          signature: "",
          transactionMessage: res.error.message,
          logs
        });
      }
      return res.result;
    }
    _wsOnOpen() {
      this._rpcWebSocketConnected = true;
      this._rpcWebSocketHeartbeat = setInterval(() => {
        (async () => {
          try {
            await this._rpcWebSocket.notify("ping");
          } catch {}
        })();
      }, 5000);
      this._updateSubscriptions();
    }
    _wsOnError(err) {
      this._rpcWebSocketConnected = false;
      console.error("ws error:", err.message);
    }
    _wsOnClose(code2) {
      this._rpcWebSocketConnected = false;
      this._rpcWebSocketGeneration = (this._rpcWebSocketGeneration + 1) % Number.MAX_SAFE_INTEGER;
      if (this._rpcWebSocketIdleTimeout) {
        clearTimeout(this._rpcWebSocketIdleTimeout);
        this._rpcWebSocketIdleTimeout = null;
      }
      if (this._rpcWebSocketHeartbeat) {
        clearInterval(this._rpcWebSocketHeartbeat);
        this._rpcWebSocketHeartbeat = null;
      }
      if (code2 === 1000) {
        this._updateSubscriptions();
        return;
      }
      this._subscriptionCallbacksByServerSubscriptionId = {};
      Object.entries(this._subscriptionsByHash).forEach(([hash, subscription]) => {
        this._setSubscription(hash, {
          ...subscription,
          state: "pending"
        });
      });
    }
    _setSubscription(hash, nextSubscription) {
      const prevState = this._subscriptionsByHash[hash]?.state;
      this._subscriptionsByHash[hash] = nextSubscription;
      if (prevState !== nextSubscription.state) {
        const stateChangeCallbacks = this._subscriptionStateChangeCallbacksByHash[hash];
        if (stateChangeCallbacks) {
          stateChangeCallbacks.forEach((cb) => {
            try {
              cb(nextSubscription.state);
            } catch {}
          });
        }
      }
    }
    _onSubscriptionStateChange(clientSubscriptionId, callback) {
      const hash = this._subscriptionHashByClientSubscriptionId[clientSubscriptionId];
      if (hash == null) {
        return () => {};
      }
      const stateChangeCallbacks = this._subscriptionStateChangeCallbacksByHash[hash] ||= new Set;
      stateChangeCallbacks.add(callback);
      return () => {
        stateChangeCallbacks.delete(callback);
        if (stateChangeCallbacks.size === 0) {
          delete this._subscriptionStateChangeCallbacksByHash[hash];
        }
      };
    }
    async _updateSubscriptions() {
      if (Object.keys(this._subscriptionsByHash).length === 0) {
        if (this._rpcWebSocketConnected) {
          this._rpcWebSocketConnected = false;
          this._rpcWebSocketIdleTimeout = setTimeout(() => {
            this._rpcWebSocketIdleTimeout = null;
            try {
              this._rpcWebSocket.close();
            } catch (err) {
              if (err instanceof Error) {
                console.log(`Error when closing socket connection: ${err.message}`);
              }
            }
          }, 500);
        }
        return;
      }
      if (this._rpcWebSocketIdleTimeout !== null) {
        clearTimeout(this._rpcWebSocketIdleTimeout);
        this._rpcWebSocketIdleTimeout = null;
        this._rpcWebSocketConnected = true;
      }
      if (!this._rpcWebSocketConnected) {
        this._rpcWebSocket.connect();
        return;
      }
      const activeWebSocketGeneration = this._rpcWebSocketGeneration;
      const isCurrentConnectionStillActive = () => {
        return activeWebSocketGeneration === this._rpcWebSocketGeneration;
      };
      await Promise.all(Object.keys(this._subscriptionsByHash).map(async (hash) => {
        const subscription = this._subscriptionsByHash[hash];
        if (subscription === undefined) {
          return;
        }
        switch (subscription.state) {
          case "pending":
          case "unsubscribed":
            if (subscription.callbacks.size === 0) {
              delete this._subscriptionsByHash[hash];
              if (subscription.state === "unsubscribed") {
                delete this._subscriptionCallbacksByServerSubscriptionId[subscription.serverSubscriptionId];
              }
              await this._updateSubscriptions();
              return;
            }
            await (async () => {
              const {
                args,
                method
              } = subscription;
              try {
                this._setSubscription(hash, {
                  ...subscription,
                  state: "subscribing"
                });
                const serverSubscriptionId = await this._rpcWebSocket.call(method, args);
                this._setSubscription(hash, {
                  ...subscription,
                  serverSubscriptionId,
                  state: "subscribed"
                });
                this._subscriptionCallbacksByServerSubscriptionId[serverSubscriptionId] = subscription.callbacks;
                await this._updateSubscriptions();
              } catch (e) {
                console.error(`Received ${e instanceof Error ? "" : "JSON-RPC "}error calling \`${method}\``, {
                  args,
                  error: e
                });
                if (!isCurrentConnectionStillActive()) {
                  return;
                }
                this._setSubscription(hash, {
                  ...subscription,
                  state: "pending"
                });
                await this._updateSubscriptions();
              }
            })();
            break;
          case "subscribed":
            if (subscription.callbacks.size === 0) {
              await (async () => {
                const {
                  serverSubscriptionId,
                  unsubscribeMethod
                } = subscription;
                if (this._subscriptionsAutoDisposedByRpc.has(serverSubscriptionId)) {
                  this._subscriptionsAutoDisposedByRpc.delete(serverSubscriptionId);
                } else {
                  this._setSubscription(hash, {
                    ...subscription,
                    state: "unsubscribing"
                  });
                  this._setSubscription(hash, {
                    ...subscription,
                    state: "unsubscribing"
                  });
                  try {
                    await this._rpcWebSocket.call(unsubscribeMethod, [serverSubscriptionId]);
                  } catch (e) {
                    if (e instanceof Error) {
                      console.error(`${unsubscribeMethod} error:`, e.message);
                    }
                    if (!isCurrentConnectionStillActive()) {
                      return;
                    }
                    this._setSubscription(hash, {
                      ...subscription,
                      state: "subscribed"
                    });
                    await this._updateSubscriptions();
                    return;
                  }
                }
                this._setSubscription(hash, {
                  ...subscription,
                  state: "unsubscribed"
                });
                await this._updateSubscriptions();
              })();
            }
            break;
        }
      }));
    }
    _handleServerNotification(serverSubscriptionId, callbackArgs) {
      const callbacks = this._subscriptionCallbacksByServerSubscriptionId[serverSubscriptionId];
      if (callbacks === undefined) {
        return;
      }
      callbacks.forEach((cb) => {
        try {
          cb(...callbackArgs);
        } catch (e) {
          console.error(e);
        }
      });
    }
    _wsOnAccountNotification(notification) {
      const {
        result,
        subscription
      } = create(notification, AccountNotificationResult);
      this._handleServerNotification(subscription, [result.value, result.context]);
    }
    _makeSubscription(subscriptionConfig, args) {
      const clientSubscriptionId = this._nextClientSubscriptionId++;
      const hash = fastStableStringify([subscriptionConfig.method, args]);
      const existingSubscription = this._subscriptionsByHash[hash];
      if (existingSubscription === undefined) {
        this._subscriptionsByHash[hash] = {
          ...subscriptionConfig,
          args,
          callbacks: new Set([subscriptionConfig.callback]),
          state: "pending"
        };
      } else {
        existingSubscription.callbacks.add(subscriptionConfig.callback);
      }
      this._subscriptionHashByClientSubscriptionId[clientSubscriptionId] = hash;
      this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId] = async () => {
        delete this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId];
        delete this._subscriptionHashByClientSubscriptionId[clientSubscriptionId];
        const subscription = this._subscriptionsByHash[hash];
        assert2(subscription !== undefined, `Could not find a \`Subscription\` when tearing down client subscription #${clientSubscriptionId}`);
        subscription.callbacks.delete(subscriptionConfig.callback);
        await this._updateSubscriptions();
      };
      this._updateSubscriptions();
      return clientSubscriptionId;
    }
    onAccountChange(publicKey2, callback, commitmentOrConfig) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([publicKey2.toBase58()], commitment || this._commitment || "finalized", "base64", config);
      return this._makeSubscription({
        callback,
        method: "accountSubscribe",
        unsubscribeMethod: "accountUnsubscribe"
      }, args);
    }
    async removeAccountChangeListener(clientSubscriptionId) {
      await this._unsubscribeClientSubscription(clientSubscriptionId, "account change");
    }
    _wsOnProgramAccountNotification(notification) {
      const {
        result,
        subscription
      } = create(notification, ProgramAccountNotificationResult);
      this._handleServerNotification(subscription, [{
        accountId: result.value.pubkey,
        accountInfo: result.value.account
      }, result.context]);
    }
    onProgramAccountChange(programId, callback, commitmentOrConfig, maybeFilters) {
      const {
        commitment,
        config
      } = extractCommitmentFromConfig(commitmentOrConfig);
      const args = this._buildArgs([programId.toBase58()], commitment || this._commitment || "finalized", "base64", config ? config : maybeFilters ? {
        filters: applyDefaultMemcmpEncodingToFilters(maybeFilters)
      } : undefined);
      return this._makeSubscription({
        callback,
        method: "programSubscribe",
        unsubscribeMethod: "programUnsubscribe"
      }, args);
    }
    async removeProgramAccountChangeListener(clientSubscriptionId) {
      await this._unsubscribeClientSubscription(clientSubscriptionId, "program account change");
    }
    onLogs(filter, callback, commitment) {
      const args = this._buildArgs([typeof filter === "object" ? {
        mentions: [filter.toString()]
      } : filter], commitment || this._commitment || "finalized");
      return this._makeSubscription({
        callback,
        method: "logsSubscribe",
        unsubscribeMethod: "logsUnsubscribe"
      }, args);
    }
    async removeOnLogsListener(clientSubscriptionId) {
      await this._unsubscribeClientSubscription(clientSubscriptionId, "logs");
    }
    _wsOnLogsNotification(notification) {
      const {
        result,
        subscription
      } = create(notification, LogsNotificationResult);
      this._handleServerNotification(subscription, [result.value, result.context]);
    }
    _wsOnSlotNotification(notification) {
      const {
        result,
        subscription
      } = create(notification, SlotNotificationResult);
      this._handleServerNotification(subscription, [result]);
    }
    onSlotChange(callback) {
      return this._makeSubscription({
        callback,
        method: "slotSubscribe",
        unsubscribeMethod: "slotUnsubscribe"
      }, []);
    }
    async removeSlotChangeListener(clientSubscriptionId) {
      await this._unsubscribeClientSubscription(clientSubscriptionId, "slot change");
    }
    _wsOnSlotUpdatesNotification(notification) {
      const {
        result,
        subscription
      } = create(notification, SlotUpdateNotificationResult);
      this._handleServerNotification(subscription, [result]);
    }
    onSlotUpdate(callback) {
      return this._makeSubscription({
        callback,
        method: "slotsUpdatesSubscribe",
        unsubscribeMethod: "slotsUpdatesUnsubscribe"
      }, []);
    }
    async removeSlotUpdateListener(clientSubscriptionId) {
      await this._unsubscribeClientSubscription(clientSubscriptionId, "slot update");
    }
    async _unsubscribeClientSubscription(clientSubscriptionId, subscriptionName) {
      const dispose = this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId];
      if (dispose) {
        await dispose();
      } else {
        console.warn("Ignored unsubscribe request because an active subscription with id " + `\`${clientSubscriptionId}\` for '${subscriptionName}' events ` + "could not be found.");
      }
    }
    _buildArgs(args, override, encoding, extra) {
      const commitment = override || this._commitment;
      if (commitment || encoding || extra) {
        let options = {};
        if (encoding) {
          options.encoding = encoding;
        }
        if (commitment) {
          options.commitment = commitment;
        }
        if (extra) {
          options = Object.assign(options, extra);
        }
        args.push(options);
      }
      return args;
    }
    _buildArgsAtLeastConfirmed(args, override, encoding, extra) {
      const commitment = override || this._commitment;
      if (commitment && !["confirmed", "finalized"].includes(commitment)) {
        throw new Error("Using Connection with default commitment: `" + this._commitment + "`, but method requires at least `confirmed`");
      }
      return this._buildArgs(args, override, encoding, extra);
    }
    _wsOnSignatureNotification(notification) {
      const {
        result,
        subscription
      } = create(notification, SignatureNotificationResult);
      if (result.value !== "receivedSignature") {
        this._subscriptionsAutoDisposedByRpc.add(subscription);
      }
      this._handleServerNotification(subscription, result.value === "receivedSignature" ? [{
        type: "received"
      }, result.context] : [{
        type: "status",
        result: result.value
      }, result.context]);
    }
    onSignature(signature, callback, commitment) {
      const args = this._buildArgs([signature], commitment || this._commitment || "finalized");
      const clientSubscriptionId = this._makeSubscription({
        callback: (notification, context) => {
          if (notification.type === "status") {
            callback(notification.result, context);
            try {
              this.removeSignatureListener(clientSubscriptionId);
            } catch (_err) {}
          }
        },
        method: "signatureSubscribe",
        unsubscribeMethod: "signatureUnsubscribe"
      }, args);
      return clientSubscriptionId;
    }
    onSignatureWithOptions(signature, callback, options) {
      const {
        commitment,
        ...extra
      } = {
        ...options,
        commitment: options && options.commitment || this._commitment || "finalized"
      };
      const args = this._buildArgs([signature], commitment, undefined, extra);
      const clientSubscriptionId = this._makeSubscription({
        callback: (notification, context) => {
          callback(notification, context);
          try {
            this.removeSignatureListener(clientSubscriptionId);
          } catch (_err) {}
        },
        method: "signatureSubscribe",
        unsubscribeMethod: "signatureUnsubscribe"
      }, args);
      return clientSubscriptionId;
    }
    async removeSignatureListener(clientSubscriptionId) {
      await this._unsubscribeClientSubscription(clientSubscriptionId, "signature result");
    }
    _wsOnRootNotification(notification) {
      const {
        result,
        subscription
      } = create(notification, RootNotificationResult);
      this._handleServerNotification(subscription, [result]);
    }
    onRootChange(callback) {
      return this._makeSubscription({
        callback,
        method: "rootSubscribe",
        unsubscribeMethod: "rootUnsubscribe"
      }, []);
    }
    async removeRootChangeListener(clientSubscriptionId) {
      await this._unsubscribeClientSubscription(clientSubscriptionId, "root change");
    }
  }

  class Keypair {
    constructor(keypair) {
      this._keypair = undefined;
      this._keypair = keypair ?? generateKeypair();
    }
    static generate() {
      return new Keypair(generateKeypair());
    }
    static fromSecretKey(secretKey, options) {
      if (secretKey.byteLength !== 64) {
        throw new Error("bad secret key size");
      }
      const publicKey2 = secretKey.slice(32, 64);
      if (!options || !options.skipValidation) {
        const privateScalar = secretKey.slice(0, 32);
        const computedPublicKey = getPublicKey(privateScalar);
        for (let ii = 0;ii < 32; ii++) {
          if (publicKey2[ii] !== computedPublicKey[ii]) {
            throw new Error("provided secretKey is invalid");
          }
        }
      }
      return new Keypair({
        publicKey: publicKey2,
        secretKey
      });
    }
    static fromSeed(seed) {
      const publicKey2 = getPublicKey(seed);
      const secretKey = new Uint8Array(64);
      secretKey.set(seed);
      secretKey.set(publicKey2, 32);
      return new Keypair({
        publicKey: publicKey2,
        secretKey
      });
    }
    get publicKey() {
      return new PublicKey(this._keypair.publicKey);
    }
    get secretKey() {
      return new Uint8Array(this._keypair.secretKey);
    }
  }
  var LOOKUP_TABLE_INSTRUCTION_LAYOUTS = Object.freeze({
    CreateLookupTable: {
      index: 0,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), u64("recentSlot"), BufferLayout.u8("bumpSeed")])
    },
    FreezeLookupTable: {
      index: 1,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    },
    ExtendLookupTable: {
      index: 2,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), u64(), BufferLayout.seq(publicKey(), BufferLayout.offset(BufferLayout.u32(), -8), "addresses")])
    },
    DeactivateLookupTable: {
      index: 3,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    },
    CloseLookupTable: {
      index: 4,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    }
  });
  class AddressLookupTableProgram {
    constructor() {}
    static createLookupTable(params) {
      const [lookupTableAddress, bumpSeed] = PublicKey.findProgramAddressSync([params.authority.toBuffer(), import_bigint_buffer.toBufferLE(BigInt(params.recentSlot), 8)], this.programId);
      const type2 = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.CreateLookupTable;
      const data = encodeData(type2, {
        recentSlot: BigInt(params.recentSlot),
        bumpSeed
      });
      const keys = [{
        pubkey: lookupTableAddress,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: params.authority,
        isSigner: true,
        isWritable: false
      }, {
        pubkey: params.payer,
        isSigner: true,
        isWritable: true
      }, {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false
      }];
      return [new TransactionInstruction({
        programId: this.programId,
        keys,
        data
      }), lookupTableAddress];
    }
    static freezeLookupTable(params) {
      const type2 = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.FreezeLookupTable;
      const data = encodeData(type2);
      const keys = [{
        pubkey: params.lookupTable,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: params.authority,
        isSigner: true,
        isWritable: false
      }];
      return new TransactionInstruction({
        programId: this.programId,
        keys,
        data
      });
    }
    static extendLookupTable(params) {
      const type2 = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.ExtendLookupTable;
      const data = encodeData(type2, {
        addresses: params.addresses.map((addr) => addr.toBytes())
      });
      const keys = [{
        pubkey: params.lookupTable,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: params.authority,
        isSigner: true,
        isWritable: false
      }];
      if (params.payer) {
        keys.push({
          pubkey: params.payer,
          isSigner: true,
          isWritable: true
        }, {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false
        });
      }
      return new TransactionInstruction({
        programId: this.programId,
        keys,
        data
      });
    }
    static deactivateLookupTable(params) {
      const type2 = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.DeactivateLookupTable;
      const data = encodeData(type2);
      const keys = [{
        pubkey: params.lookupTable,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: params.authority,
        isSigner: true,
        isWritable: false
      }];
      return new TransactionInstruction({
        programId: this.programId,
        keys,
        data
      });
    }
    static closeLookupTable(params) {
      const type2 = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.CloseLookupTable;
      const data = encodeData(type2);
      const keys = [{
        pubkey: params.lookupTable,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: params.authority,
        isSigner: true,
        isWritable: false
      }, {
        pubkey: params.recipient,
        isSigner: false,
        isWritable: true
      }];
      return new TransactionInstruction({
        programId: this.programId,
        keys,
        data
      });
    }
  }
  AddressLookupTableProgram.programId = new PublicKey("AddressLookupTab1e1111111111111111111111111");
  var COMPUTE_BUDGET_INSTRUCTION_LAYOUTS = Object.freeze({
    RequestUnits: {
      index: 0,
      layout: BufferLayout.struct([BufferLayout.u8("instruction"), BufferLayout.u32("units"), BufferLayout.u32("additionalFee")])
    },
    RequestHeapFrame: {
      index: 1,
      layout: BufferLayout.struct([BufferLayout.u8("instruction"), BufferLayout.u32("bytes")])
    },
    SetComputeUnitLimit: {
      index: 2,
      layout: BufferLayout.struct([BufferLayout.u8("instruction"), BufferLayout.u32("units")])
    },
    SetComputeUnitPrice: {
      index: 3,
      layout: BufferLayout.struct([BufferLayout.u8("instruction"), u64("microLamports")])
    }
  });

  class ComputeBudgetProgram {
    constructor() {}
    static requestUnits(params) {
      const type2 = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestUnits;
      const data = encodeData(type2, params);
      return new TransactionInstruction({
        keys: [],
        programId: this.programId,
        data
      });
    }
    static requestHeapFrame(params) {
      const type2 = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestHeapFrame;
      const data = encodeData(type2, params);
      return new TransactionInstruction({
        keys: [],
        programId: this.programId,
        data
      });
    }
    static setComputeUnitLimit(params) {
      const type2 = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitLimit;
      const data = encodeData(type2, params);
      return new TransactionInstruction({
        keys: [],
        programId: this.programId,
        data
      });
    }
    static setComputeUnitPrice(params) {
      const type2 = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitPrice;
      const data = encodeData(type2, {
        microLamports: BigInt(params.microLamports)
      });
      return new TransactionInstruction({
        keys: [],
        programId: this.programId,
        data
      });
    }
  }
  ComputeBudgetProgram.programId = new PublicKey("ComputeBudget111111111111111111111111111111");
  var PRIVATE_KEY_BYTES$1 = 64;
  var PUBLIC_KEY_BYTES$1 = 32;
  var SIGNATURE_BYTES = 64;
  var ED25519_INSTRUCTION_LAYOUT = BufferLayout.struct([BufferLayout.u8("numSignatures"), BufferLayout.u8("padding"), BufferLayout.u16("signatureOffset"), BufferLayout.u16("signatureInstructionIndex"), BufferLayout.u16("publicKeyOffset"), BufferLayout.u16("publicKeyInstructionIndex"), BufferLayout.u16("messageDataOffset"), BufferLayout.u16("messageDataSize"), BufferLayout.u16("messageInstructionIndex")]);

  class Ed25519Program {
    constructor() {}
    static createInstructionWithPublicKey(params) {
      const {
        publicKey: publicKey2,
        message,
        signature,
        instructionIndex
      } = params;
      assert2(publicKey2.length === PUBLIC_KEY_BYTES$1, `Public Key must be ${PUBLIC_KEY_BYTES$1} bytes but received ${publicKey2.length} bytes`);
      assert2(signature.length === SIGNATURE_BYTES, `Signature must be ${SIGNATURE_BYTES} bytes but received ${signature.length} bytes`);
      const publicKeyOffset = ED25519_INSTRUCTION_LAYOUT.span;
      const signatureOffset = publicKeyOffset + publicKey2.length;
      const messageDataOffset = signatureOffset + signature.length;
      const numSignatures = 1;
      const instructionData = Buffer2.alloc(messageDataOffset + message.length);
      const index = instructionIndex == null ? 65535 : instructionIndex;
      ED25519_INSTRUCTION_LAYOUT.encode({
        numSignatures,
        padding: 0,
        signatureOffset,
        signatureInstructionIndex: index,
        publicKeyOffset,
        publicKeyInstructionIndex: index,
        messageDataOffset,
        messageDataSize: message.length,
        messageInstructionIndex: index
      }, instructionData);
      instructionData.fill(publicKey2, publicKeyOffset);
      instructionData.fill(signature, signatureOffset);
      instructionData.fill(message, messageDataOffset);
      return new TransactionInstruction({
        keys: [],
        programId: Ed25519Program.programId,
        data: instructionData
      });
    }
    static createInstructionWithPrivateKey(params) {
      const {
        privateKey,
        message,
        instructionIndex
      } = params;
      assert2(privateKey.length === PRIVATE_KEY_BYTES$1, `Private key must be ${PRIVATE_KEY_BYTES$1} bytes but received ${privateKey.length} bytes`);
      try {
        const keypair = Keypair.fromSecretKey(privateKey);
        const publicKey2 = keypair.publicKey.toBytes();
        const signature = sign(message, keypair.secretKey);
        return this.createInstructionWithPublicKey({
          publicKey: publicKey2,
          message,
          signature,
          instructionIndex
        });
      } catch (error) {
        throw new Error(`Error creating instruction; ${error}`);
      }
    }
  }
  Ed25519Program.programId = new PublicKey("Ed25519SigVerify111111111111111111111111111");
  var ecdsaSign = (msgHash, privKey) => {
    const signature = secp256k1.sign(msgHash, privKey);
    return [signature.toCompactRawBytes(), signature.recovery];
  };
  secp256k1.utils.isValidPrivateKey;
  var publicKeyCreate = secp256k1.getPublicKey;
  var PRIVATE_KEY_BYTES = 32;
  var ETHEREUM_ADDRESS_BYTES = 20;
  var PUBLIC_KEY_BYTES = 64;
  var SIGNATURE_OFFSETS_SERIALIZED_SIZE = 11;
  var SECP256K1_INSTRUCTION_LAYOUT = BufferLayout.struct([BufferLayout.u8("numSignatures"), BufferLayout.u16("signatureOffset"), BufferLayout.u8("signatureInstructionIndex"), BufferLayout.u16("ethAddressOffset"), BufferLayout.u8("ethAddressInstructionIndex"), BufferLayout.u16("messageDataOffset"), BufferLayout.u16("messageDataSize"), BufferLayout.u8("messageInstructionIndex"), BufferLayout.blob(20, "ethAddress"), BufferLayout.blob(64, "signature"), BufferLayout.u8("recoveryId")]);

  class Secp256k1Program {
    constructor() {}
    static publicKeyToEthAddress(publicKey2) {
      assert2(publicKey2.length === PUBLIC_KEY_BYTES, `Public key must be ${PUBLIC_KEY_BYTES} bytes but received ${publicKey2.length} bytes`);
      try {
        return Buffer2.from(keccak_256(toBuffer(publicKey2))).slice(-ETHEREUM_ADDRESS_BYTES);
      } catch (error) {
        throw new Error(`Error constructing Ethereum address: ${error}`);
      }
    }
    static createInstructionWithPublicKey(params) {
      const {
        publicKey: publicKey2,
        message,
        signature,
        recoveryId,
        instructionIndex
      } = params;
      return Secp256k1Program.createInstructionWithEthAddress({
        ethAddress: Secp256k1Program.publicKeyToEthAddress(publicKey2),
        message,
        signature,
        recoveryId,
        instructionIndex
      });
    }
    static createInstructionWithEthAddress(params) {
      const {
        ethAddress: rawAddress,
        message,
        signature,
        recoveryId,
        instructionIndex = 0
      } = params;
      let ethAddress;
      if (typeof rawAddress === "string") {
        if (rawAddress.startsWith("0x")) {
          ethAddress = Buffer2.from(rawAddress.substr(2), "hex");
        } else {
          ethAddress = Buffer2.from(rawAddress, "hex");
        }
      } else {
        ethAddress = rawAddress;
      }
      assert2(ethAddress.length === ETHEREUM_ADDRESS_BYTES, `Address must be ${ETHEREUM_ADDRESS_BYTES} bytes but received ${ethAddress.length} bytes`);
      const dataStart = 1 + SIGNATURE_OFFSETS_SERIALIZED_SIZE;
      const ethAddressOffset = dataStart;
      const signatureOffset = dataStart + ethAddress.length;
      const messageDataOffset = signatureOffset + signature.length + 1;
      const numSignatures = 1;
      const instructionData = Buffer2.alloc(SECP256K1_INSTRUCTION_LAYOUT.span + message.length);
      SECP256K1_INSTRUCTION_LAYOUT.encode({
        numSignatures,
        signatureOffset,
        signatureInstructionIndex: instructionIndex,
        ethAddressOffset,
        ethAddressInstructionIndex: instructionIndex,
        messageDataOffset,
        messageDataSize: message.length,
        messageInstructionIndex: instructionIndex,
        signature: toBuffer(signature),
        ethAddress: toBuffer(ethAddress),
        recoveryId
      }, instructionData);
      instructionData.fill(toBuffer(message), SECP256K1_INSTRUCTION_LAYOUT.span);
      return new TransactionInstruction({
        keys: [],
        programId: Secp256k1Program.programId,
        data: instructionData
      });
    }
    static createInstructionWithPrivateKey(params) {
      const {
        privateKey: pkey,
        message,
        instructionIndex
      } = params;
      assert2(pkey.length === PRIVATE_KEY_BYTES, `Private key must be ${PRIVATE_KEY_BYTES} bytes but received ${pkey.length} bytes`);
      try {
        const privateKey = toBuffer(pkey);
        const publicKey2 = publicKeyCreate(privateKey, false).slice(1);
        const messageHash = Buffer2.from(keccak_256(toBuffer(message)));
        const [signature, recoveryId] = ecdsaSign(messageHash, privateKey);
        return this.createInstructionWithPublicKey({
          publicKey: publicKey2,
          message,
          signature,
          recoveryId,
          instructionIndex
        });
      } catch (error) {
        throw new Error(`Error creating instruction; ${error}`);
      }
    }
  }
  Secp256k1Program.programId = new PublicKey("KeccakSecp256k11111111111111111111111111111");
  var _Lockup;
  var STAKE_CONFIG_ID = new PublicKey("StakeConfig11111111111111111111111111111111");
  class Lockup {
    constructor(unixTimestamp, epoch, custodian) {
      this.unixTimestamp = undefined;
      this.epoch = undefined;
      this.custodian = undefined;
      this.unixTimestamp = unixTimestamp;
      this.epoch = epoch;
      this.custodian = custodian;
    }
  }
  _Lockup = Lockup;
  Lockup.default = new _Lockup(0, 0, PublicKey.default);
  var STAKE_INSTRUCTION_LAYOUTS = Object.freeze({
    Initialize: {
      index: 0,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), authorized(), lockup()])
    },
    Authorize: {
      index: 1,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("newAuthorized"), BufferLayout.u32("stakeAuthorizationType")])
    },
    Delegate: {
      index: 2,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    },
    Split: {
      index: 3,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), BufferLayout.ns64("lamports")])
    },
    Withdraw: {
      index: 4,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), BufferLayout.ns64("lamports")])
    },
    Deactivate: {
      index: 5,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    },
    Merge: {
      index: 7,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    },
    AuthorizeWithSeed: {
      index: 8,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("newAuthorized"), BufferLayout.u32("stakeAuthorizationType"), rustString("authoritySeed"), publicKey("authorityOwner")])
    }
  });
  var StakeAuthorizationLayout = Object.freeze({
    Staker: {
      index: 0
    },
    Withdrawer: {
      index: 1
    }
  });

  class StakeProgram {
    constructor() {}
    static initialize(params) {
      const {
        stakePubkey,
        authorized: authorized2,
        lockup: maybeLockup
      } = params;
      const lockup2 = maybeLockup || Lockup.default;
      const type2 = STAKE_INSTRUCTION_LAYOUTS.Initialize;
      const data = encodeData(type2, {
        authorized: {
          staker: toBuffer(authorized2.staker.toBuffer()),
          withdrawer: toBuffer(authorized2.withdrawer.toBuffer())
        },
        lockup: {
          unixTimestamp: lockup2.unixTimestamp,
          epoch: lockup2.epoch,
          custodian: toBuffer(lockup2.custodian.toBuffer())
        }
      });
      const instructionData = {
        keys: [{
          pubkey: stakePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false
        }],
        programId: this.programId,
        data
      };
      return new TransactionInstruction(instructionData);
    }
    static createAccountWithSeed(params) {
      const transaction = new Transaction;
      transaction.add(SystemProgram.createAccountWithSeed({
        fromPubkey: params.fromPubkey,
        newAccountPubkey: params.stakePubkey,
        basePubkey: params.basePubkey,
        seed: params.seed,
        lamports: params.lamports,
        space: this.space,
        programId: this.programId
      }));
      const {
        stakePubkey,
        authorized: authorized2,
        lockup: lockup2
      } = params;
      return transaction.add(this.initialize({
        stakePubkey,
        authorized: authorized2,
        lockup: lockup2
      }));
    }
    static createAccount(params) {
      const transaction = new Transaction;
      transaction.add(SystemProgram.createAccount({
        fromPubkey: params.fromPubkey,
        newAccountPubkey: params.stakePubkey,
        lamports: params.lamports,
        space: this.space,
        programId: this.programId
      }));
      const {
        stakePubkey,
        authorized: authorized2,
        lockup: lockup2
      } = params;
      return transaction.add(this.initialize({
        stakePubkey,
        authorized: authorized2,
        lockup: lockup2
      }));
    }
    static delegate(params) {
      const {
        stakePubkey,
        authorizedPubkey,
        votePubkey
      } = params;
      const type2 = STAKE_INSTRUCTION_LAYOUTS.Delegate;
      const data = encodeData(type2);
      return new Transaction().add({
        keys: [{
          pubkey: stakePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: votePubkey,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: SYSVAR_CLOCK_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: STAKE_CONFIG_ID,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: authorizedPubkey,
          isSigner: true,
          isWritable: false
        }],
        programId: this.programId,
        data
      });
    }
    static authorize(params) {
      const {
        stakePubkey,
        authorizedPubkey,
        newAuthorizedPubkey,
        stakeAuthorizationType,
        custodianPubkey
      } = params;
      const type2 = STAKE_INSTRUCTION_LAYOUTS.Authorize;
      const data = encodeData(type2, {
        newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
        stakeAuthorizationType: stakeAuthorizationType.index
      });
      const keys = [{
        pubkey: stakePubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: SYSVAR_CLOCK_PUBKEY,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: authorizedPubkey,
        isSigner: true,
        isWritable: false
      }];
      if (custodianPubkey) {
        keys.push({
          pubkey: custodianPubkey,
          isSigner: true,
          isWritable: false
        });
      }
      return new Transaction().add({
        keys,
        programId: this.programId,
        data
      });
    }
    static authorizeWithSeed(params) {
      const {
        stakePubkey,
        authorityBase,
        authoritySeed,
        authorityOwner,
        newAuthorizedPubkey,
        stakeAuthorizationType,
        custodianPubkey
      } = params;
      const type2 = STAKE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed;
      const data = encodeData(type2, {
        newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
        stakeAuthorizationType: stakeAuthorizationType.index,
        authoritySeed,
        authorityOwner: toBuffer(authorityOwner.toBuffer())
      });
      const keys = [{
        pubkey: stakePubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: authorityBase,
        isSigner: true,
        isWritable: false
      }, {
        pubkey: SYSVAR_CLOCK_PUBKEY,
        isSigner: false,
        isWritable: false
      }];
      if (custodianPubkey) {
        keys.push({
          pubkey: custodianPubkey,
          isSigner: true,
          isWritable: false
        });
      }
      return new Transaction().add({
        keys,
        programId: this.programId,
        data
      });
    }
    static splitInstruction(params) {
      const {
        stakePubkey,
        authorizedPubkey,
        splitStakePubkey,
        lamports
      } = params;
      const type2 = STAKE_INSTRUCTION_LAYOUTS.Split;
      const data = encodeData(type2, {
        lamports
      });
      return new TransactionInstruction({
        keys: [{
          pubkey: stakePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: splitStakePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: authorizedPubkey,
          isSigner: true,
          isWritable: false
        }],
        programId: this.programId,
        data
      });
    }
    static split(params, rentExemptReserve) {
      const transaction = new Transaction;
      transaction.add(SystemProgram.createAccount({
        fromPubkey: params.authorizedPubkey,
        newAccountPubkey: params.splitStakePubkey,
        lamports: rentExemptReserve,
        space: this.space,
        programId: this.programId
      }));
      return transaction.add(this.splitInstruction(params));
    }
    static splitWithSeed(params, rentExemptReserve) {
      const {
        stakePubkey,
        authorizedPubkey,
        splitStakePubkey,
        basePubkey,
        seed,
        lamports
      } = params;
      const transaction = new Transaction;
      transaction.add(SystemProgram.allocate({
        accountPubkey: splitStakePubkey,
        basePubkey,
        seed,
        space: this.space,
        programId: this.programId
      }));
      if (rentExemptReserve && rentExemptReserve > 0) {
        transaction.add(SystemProgram.transfer({
          fromPubkey: params.authorizedPubkey,
          toPubkey: splitStakePubkey,
          lamports: rentExemptReserve
        }));
      }
      return transaction.add(this.splitInstruction({
        stakePubkey,
        authorizedPubkey,
        splitStakePubkey,
        lamports
      }));
    }
    static merge(params) {
      const {
        stakePubkey,
        sourceStakePubKey,
        authorizedPubkey
      } = params;
      const type2 = STAKE_INSTRUCTION_LAYOUTS.Merge;
      const data = encodeData(type2);
      return new Transaction().add({
        keys: [{
          pubkey: stakePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: sourceStakePubKey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: SYSVAR_CLOCK_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: authorizedPubkey,
          isSigner: true,
          isWritable: false
        }],
        programId: this.programId,
        data
      });
    }
    static withdraw(params) {
      const {
        stakePubkey,
        authorizedPubkey,
        toPubkey,
        lamports,
        custodianPubkey
      } = params;
      const type2 = STAKE_INSTRUCTION_LAYOUTS.Withdraw;
      const data = encodeData(type2, {
        lamports
      });
      const keys = [{
        pubkey: stakePubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: toPubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: SYSVAR_CLOCK_PUBKEY,
        isSigner: false,
        isWritable: false
      }, {
        pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
        isSigner: false,
        isWritable: false
      }, {
        pubkey: authorizedPubkey,
        isSigner: true,
        isWritable: false
      }];
      if (custodianPubkey) {
        keys.push({
          pubkey: custodianPubkey,
          isSigner: true,
          isWritable: false
        });
      }
      return new Transaction().add({
        keys,
        programId: this.programId,
        data
      });
    }
    static deactivate(params) {
      const {
        stakePubkey,
        authorizedPubkey
      } = params;
      const type2 = STAKE_INSTRUCTION_LAYOUTS.Deactivate;
      const data = encodeData(type2);
      return new Transaction().add({
        keys: [{
          pubkey: stakePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: SYSVAR_CLOCK_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: authorizedPubkey,
          isSigner: true,
          isWritable: false
        }],
        programId: this.programId,
        data
      });
    }
  }
  StakeProgram.programId = new PublicKey("Stake11111111111111111111111111111111111111");
  StakeProgram.space = 200;
  var VOTE_INSTRUCTION_LAYOUTS = Object.freeze({
    InitializeAccount: {
      index: 0,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), voteInit()])
    },
    Authorize: {
      index: 1,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), publicKey("newAuthorized"), BufferLayout.u32("voteAuthorizationType")])
    },
    Withdraw: {
      index: 3,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), BufferLayout.ns64("lamports")])
    },
    UpdateValidatorIdentity: {
      index: 4,
      layout: BufferLayout.struct([BufferLayout.u32("instruction")])
    },
    AuthorizeWithSeed: {
      index: 10,
      layout: BufferLayout.struct([BufferLayout.u32("instruction"), voteAuthorizeWithSeedArgs()])
    }
  });
  var VoteAuthorizationLayout = Object.freeze({
    Voter: {
      index: 0
    },
    Withdrawer: {
      index: 1
    }
  });

  class VoteProgram {
    constructor() {}
    static initializeAccount(params) {
      const {
        votePubkey,
        nodePubkey,
        voteInit: voteInit2
      } = params;
      const type2 = VOTE_INSTRUCTION_LAYOUTS.InitializeAccount;
      const data = encodeData(type2, {
        voteInit: {
          nodePubkey: toBuffer(voteInit2.nodePubkey.toBuffer()),
          authorizedVoter: toBuffer(voteInit2.authorizedVoter.toBuffer()),
          authorizedWithdrawer: toBuffer(voteInit2.authorizedWithdrawer.toBuffer()),
          commission: voteInit2.commission
        }
      });
      const instructionData = {
        keys: [{
          pubkey: votePubkey,
          isSigner: false,
          isWritable: true
        }, {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: SYSVAR_CLOCK_PUBKEY,
          isSigner: false,
          isWritable: false
        }, {
          pubkey: nodePubkey,
          isSigner: true,
          isWritable: false
        }],
        programId: this.programId,
        data
      };
      return new TransactionInstruction(instructionData);
    }
    static createAccount(params) {
      const transaction = new Transaction;
      transaction.add(SystemProgram.createAccount({
        fromPubkey: params.fromPubkey,
        newAccountPubkey: params.votePubkey,
        lamports: params.lamports,
        space: this.space,
        programId: this.programId
      }));
      return transaction.add(this.initializeAccount({
        votePubkey: params.votePubkey,
        nodePubkey: params.voteInit.nodePubkey,
        voteInit: params.voteInit
      }));
    }
    static authorize(params) {
      const {
        votePubkey,
        authorizedPubkey,
        newAuthorizedPubkey,
        voteAuthorizationType
      } = params;
      const type2 = VOTE_INSTRUCTION_LAYOUTS.Authorize;
      const data = encodeData(type2, {
        newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
        voteAuthorizationType: voteAuthorizationType.index
      });
      const keys = [{
        pubkey: votePubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: SYSVAR_CLOCK_PUBKEY,
        isSigner: false,
        isWritable: false
      }, {
        pubkey: authorizedPubkey,
        isSigner: true,
        isWritable: false
      }];
      return new Transaction().add({
        keys,
        programId: this.programId,
        data
      });
    }
    static authorizeWithSeed(params) {
      const {
        currentAuthorityDerivedKeyBasePubkey,
        currentAuthorityDerivedKeyOwnerPubkey,
        currentAuthorityDerivedKeySeed,
        newAuthorizedPubkey,
        voteAuthorizationType,
        votePubkey
      } = params;
      const type2 = VOTE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed;
      const data = encodeData(type2, {
        voteAuthorizeWithSeedArgs: {
          currentAuthorityDerivedKeyOwnerPubkey: toBuffer(currentAuthorityDerivedKeyOwnerPubkey.toBuffer()),
          currentAuthorityDerivedKeySeed,
          newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
          voteAuthorizationType: voteAuthorizationType.index
        }
      });
      const keys = [{
        pubkey: votePubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: SYSVAR_CLOCK_PUBKEY,
        isSigner: false,
        isWritable: false
      }, {
        pubkey: currentAuthorityDerivedKeyBasePubkey,
        isSigner: true,
        isWritable: false
      }];
      return new Transaction().add({
        keys,
        programId: this.programId,
        data
      });
    }
    static withdraw(params) {
      const {
        votePubkey,
        authorizedWithdrawerPubkey,
        lamports,
        toPubkey
      } = params;
      const type2 = VOTE_INSTRUCTION_LAYOUTS.Withdraw;
      const data = encodeData(type2, {
        lamports
      });
      const keys = [{
        pubkey: votePubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: toPubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: authorizedWithdrawerPubkey,
        isSigner: true,
        isWritable: false
      }];
      return new Transaction().add({
        keys,
        programId: this.programId,
        data
      });
    }
    static safeWithdraw(params, currentVoteAccountBalance, rentExemptMinimum) {
      if (params.lamports > currentVoteAccountBalance - rentExemptMinimum) {
        throw new Error("Withdraw will leave vote account with insufficient funds.");
      }
      return VoteProgram.withdraw(params);
    }
    static updateValidatorIdentity(params) {
      const {
        votePubkey,
        authorizedWithdrawerPubkey,
        nodePubkey
      } = params;
      const type2 = VOTE_INSTRUCTION_LAYOUTS.UpdateValidatorIdentity;
      const data = encodeData(type2);
      const keys = [{
        pubkey: votePubkey,
        isSigner: false,
        isWritable: true
      }, {
        pubkey: nodePubkey,
        isSigner: true,
        isWritable: false
      }, {
        pubkey: authorizedWithdrawerPubkey,
        isSigner: true,
        isWritable: false
      }];
      return new Transaction().add({
        keys,
        programId: this.programId,
        data
      });
    }
  }
  VoteProgram.programId = new PublicKey("Vote111111111111111111111111111111111111111");
  VoteProgram.space = 3762;
  var VALIDATOR_INFO_KEY = new PublicKey("Va1idator1nfo111111111111111111111111111111");
  var InfoString = type({
    name: string(),
    website: optional(string()),
    details: optional(string()),
    iconUrl: optional(string()),
    keybaseUsername: optional(string())
  });
  var VOTE_PROGRAM_ID = new PublicKey("Vote111111111111111111111111111111111111111");
  var VoteAccountLayout = BufferLayout.struct([
    publicKey("nodePubkey"),
    publicKey("authorizedWithdrawer"),
    BufferLayout.u8("commission"),
    BufferLayout.nu64(),
    BufferLayout.seq(BufferLayout.struct([BufferLayout.nu64("slot"), BufferLayout.u32("confirmationCount")]), BufferLayout.offset(BufferLayout.u32(), -8), "votes"),
    BufferLayout.u8("rootSlotValid"),
    BufferLayout.nu64("rootSlot"),
    BufferLayout.nu64(),
    BufferLayout.seq(BufferLayout.struct([BufferLayout.nu64("epoch"), publicKey("authorizedVoter")]), BufferLayout.offset(BufferLayout.u32(), -8), "authorizedVoters"),
    BufferLayout.struct([BufferLayout.seq(BufferLayout.struct([publicKey("authorizedPubkey"), BufferLayout.nu64("epochOfLastAuthorizedSwitch"), BufferLayout.nu64("targetEpoch")]), 32, "buf"), BufferLayout.nu64("idx"), BufferLayout.u8("isEmpty")], "priorVoters"),
    BufferLayout.nu64(),
    BufferLayout.seq(BufferLayout.struct([BufferLayout.nu64("epoch"), BufferLayout.nu64("credits"), BufferLayout.nu64("prevCredits")]), BufferLayout.offset(BufferLayout.u32(), -8), "epochCredits"),
    BufferLayout.struct([BufferLayout.nu64("slot"), BufferLayout.nu64("timestamp")], "lastTimestamp")
  ]);

  // lunar-core.mjs
  var PROGRAM_ID = new PublicKey("HuBV5gmKwQJvJuGvHLSY58hq2DE76khJYMrCzz6ipFYk");
  var SYS = SystemProgram.programId;
  var DISC = {
    register_station: [64, 56, 98, 138, 166, 120, 109, 142],
    post_window: [61, 254, 94, 164, 12, 221, 227, 12],
    claim_window: [207, 241, 41, 204, 218, 73, 57, 96],
    confirm_contact: [29, 33, 183, 234, 67, 193, 47, 209]
  };
  var i32 = (n) => {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setInt32(0, n, true);
    return b;
  };
  var i64 = (n) => {
    const b = new Uint8Array(8);
    new DataView(b.buffer).setBigInt64(0, BigInt(n), true);
    return b;
  };
  var u642 = (n) => {
    const b = new Uint8Array(8);
    new DataView(b.buffer).setBigUint64(0, BigInt(n), true);
    return b;
  };
  var str = (s) => {
    const u = new TextEncoder().encode(s);
    const b = new Uint8Array(4 + u.length);
    new DataView(b.buffer).setUint32(0, u.length, true);
    b.set(u, 4);
    return b;
  };
  var cat = (...a) => {
    const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0));
    let p = 0;
    for (const x of a) {
      o.set(x, p);
      p += x.length;
    }
    return o;
  };
  var toBuf = (b) => typeof Buffer !== "undefined" ? Buffer.from(b) : b;
  var stationPda = (auth) => PublicKey.findProgramAddressSync([new TextEncoder().encode("station"), auth.toBuffer()], PROGRAM_ID)[0];
  var windowPda = (id) => PublicKey.findProgramAddressSync([new TextEncoder().encode("window"), u642(id)], PROGRAM_ID)[0];
  var ix = (disc, keys, data) => new TransactionInstruction({ programId: PROGRAM_ID, keys, data: toBuf(cat(new Uint8Array(disc), data)) });
  function demoHash(s) {
    const u = new TextEncoder().encode(s);
    const h = new Uint8Array(32);
    for (let i3 = 0;i3 < u.length; i3++)
      h[i3 % 32] = h[i3 % 32] * 31 + u[i3] & 255;
    return h;
  }
  async function runDemo({ url = "https://api.devnet.solana.com", keypair, win, onLog = console.log }) {
    const conn = new Connection(url, "confirmed");
    const auth = keypair.publicKey;
    const station = stationPda(auth);
    const windowAcc = windowPda(win.id);
    const sigs = {};
    const send = async (label, instruction) => {
      const tx = new Transaction().add(instruction);
      tx.feePayer = auth;
      tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
      tx.sign(keypair);
      const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false, maxRetries: 5 });
      for (let i3 = 0;i3 < 40; i3++) {
        const st = (await conn.getSignatureStatuses([sig])).value[0];
        if (st?.err)
          throw new Error(`${label} failed: ${JSON.stringify(st.err)}`);
        if (st && (st.confirmationStatus === "confirmed" || st.confirmationStatus === "finalized"))
          break;
        await new Promise((r) => setTimeout(r, 1500));
      }
      onLog(`${label} ✓ ${sig}`);
      return sig;
    };
    try {
      sigs.register_station = await send("register_station", ix(DISC.register_station, [
        { pubkey: station, isSigner: false, isWritable: true },
        { pubkey: auth, isSigner: true, isWritable: true },
        { pubkey: SYS, isSigner: false, isWritable: false }
      ], cat(i32(win.latE6), i32(win.lonE6), str("Demo Ground Station BR"))));
    } catch (e) {
      onLog("register_station: already registered (ok, reusing station)");
    }
    sigs.post_window = await send("post_window", ix(DISC.post_window, [
      { pubkey: windowAcc, isSigner: false, isWritable: true },
      { pubkey: auth, isSigner: true, isWritable: true },
      { pubkey: SYS, isSigner: false, isWritable: false }
    ], cat(u642(win.id), i64(win.startTs), i64(win.endTs), i32(win.latE6), i32(win.lonE6))));
    sigs.claim_window = await send("claim_window", ix(DISC.claim_window, [
      { pubkey: windowAcc, isSigner: false, isWritable: true },
      { pubkey: station, isSigner: false, isWritable: false },
      { pubkey: auth, isSigner: true, isWritable: false }
    ], new Uint8Array(0)));
    sigs.confirm_contact = await send("confirm_contact", ix(DISC.confirm_contact, [
      { pubkey: windowAcc, isSigner: false, isWritable: true },
      { pubkey: station, isSigner: false, isWritable: true },
      { pubkey: auth, isSigner: true, isWritable: false }
    ], demoHash(`v1|LUNAR-ROVER-01|DEPLOY_PANEL|${win.id}`)));
    return sigs;
  }

  // entry-browser.mjs
  globalThis.LunarSolana = { runDemo, PROGRAM_ID, Keypair, Connection, PublicKey };
})();
