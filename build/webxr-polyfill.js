/**
 * @license
 * webxr-polyfill
 * Copyright (c) 2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * cardboard-vr-display
 * Copyright (c) 2015-2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * webvr-polyfill-dpdb 
 * Copyright (c) 2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * wglu-preserve-state
 * Copyright (c) 2016, Brandon Jones.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @license
 * nosleep.js
 * Copyright (c) 2017, Rich Tibbett
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.WebXRPolyfill = factory());
}(this, (function () { 'use strict';

const _global = typeof global !== 'undefined' ? global :
                typeof self !== 'undefined' ? self :
                typeof window !== 'undefined' ? window : {};

const PRIVATE = Symbol('@@webxr-polyfill/EventTarget');
class EventTarget {
  constructor() {
    this[PRIVATE] = {
      listeners: new Map(),
    };
  }
  addEventListener(type, listener) {
    if (typeof type !== 'string') { throw new Error('`type` must be a string'); }
    if (typeof listener !== 'function') { throw new Error('`listener` must be a function'); }
    const typedListeners = this[PRIVATE].listeners.get(type) || [];
    typedListeners.push(listener);
    this[PRIVATE].listeners.set(type, typedListeners);
  }
  removeEventListener(type, listener) {
    if (typeof type !== 'string') { throw new Error('`type` must be a string'); }
    if (typeof listener !== 'function') { throw new Error('`listener` must be a function'); }
    const typedListeners = this[PRIVATE].listeners.get(type) || [];
    for (let i = typedListeners.length; i >= 0; i--) {
      if (typedListeners[i] === listener) {
        typedListeners.pop();
      }
    }
  }
  dispatchEvent(type, event) {
    const typedListeners = this[PRIVATE].listeners.get(type) || [];
    const queue = [];
    for (let i = 0; i < typedListeners.length; i++) {
      queue[i] = typedListeners[i];
    }
    for (let listener of queue) {
      listener(event);
    }
    if (typeof this[`on${type}`] === 'function') {
      this[`on${type}`](event);
    }
  }
}

const EPSILON = 0.000001;
let ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;


const degree = Math.PI / 180;

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

function invert(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}


function multiply(out, a, b) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  return out;
}












function fromRotationTranslation(out, q, v) {
  let x = q[0], y = q[1], z = q[2], w = q[3];
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let xy = x * y2;
  let xz = x * z2;
  let yy = y * y2;
  let yz = y * z2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}

function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}

function getRotation(out, mat) {
  let trace = mat[0] + mat[5] + mat[10];
  let S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (mat[6] - mat[9]) / S;
    out[1] = (mat[8] - mat[2]) / S;
    out[2] = (mat[1] - mat[4]) / S;
  } else if ((mat[0] > mat[5]) && (mat[0] > mat[10])) {
    S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
    out[3] = (mat[6] - mat[9]) / S;
    out[0] = 0.25 * S;
    out[1] = (mat[1] + mat[4]) / S;
    out[2] = (mat[8] + mat[2]) / S;
  } else if (mat[5] > mat[10]) {
    S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
    out[3] = (mat[8] - mat[2]) / S;
    out[0] = (mat[1] + mat[4]) / S;
    out[1] = 0.25 * S;
    out[2] = (mat[6] + mat[9]) / S;
  } else {
    S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
    out[3] = (mat[1] - mat[4]) / S;
    out[0] = (mat[8] + mat[2]) / S;
    out[1] = (mat[6] + mat[9]) / S;
    out[2] = 0.25 * S;
  }
  return out;
}

function create$1() {
  let out = new ARRAY_TYPE(3);
  if(ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}

function length(a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  return Math.sqrt(x*x + y*y + z*z);
}
function fromValues$1(x, y, z) {
  let out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}


















function normalize(out, a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let len = x*x + y*y + z*z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
  }
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  let ax = a[0], ay = a[1], az = a[2];
  let bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}



















const len = length;

const forEach = (function() {
  let vec = create$1();
  return function(a, stride, offset, count, fn, arg) {
    let i, l;
    if(!stride) {
      stride = 3;
    }
    if(!offset) {
      offset = 0;
    }
    if(count) {
      l = Math.min((count * stride) + offset, a.length);
    } else {
      l = a.length;
    }
    for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
    }
    return a;
  };
})();

function create$2() {
  let out = new ARRAY_TYPE(9);
  if(ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

function create$3() {
  let out = new ARRAY_TYPE(4);
  if(ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}

function fromValues$3(x, y, z, w) {
  let out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}



















function normalize$1(out, a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let w = a[3];
  let len = x*x + y*y + z*z + w*w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
  }
  return out;
}















const forEach$1 = (function() {
  let vec = create$3();
  return function(a, stride, offset, count, fn, arg) {
    let i, l;
    if(!stride) {
      stride = 4;
    }
    if(!offset) {
      offset = 0;
    }
    if(count) {
      l = Math.min((count * stride) + offset, a.length);
    } else {
      l = a.length;
    }
    for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
    }
    return a;
  };
})();

function create$4() {
  let out = new ARRAY_TYPE(4);
  if(ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  let s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}






function slerp(out, a, b, t) {
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  let omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if ( cosom < 0.0 ) {
    cosom = -cosom;
    bx = - bx;
    by = - by;
    bz = - bz;
    bw = - bw;
  }
  if ( (1.0 - cosom) > EPSILON ) {
    omega  = Math.acos(cosom);
    sinom  = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1.0 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}



function fromMat3(out, m) {
  let fTrace = m[0] + m[4] + m[8];
  let fRoot;
  if ( fTrace > 0.0 ) {
    fRoot = Math.sqrt(fTrace + 1.0);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5/fRoot;
    out[0] = (m[5]-m[7])*fRoot;
    out[1] = (m[6]-m[2])*fRoot;
    out[2] = (m[1]-m[3])*fRoot;
  } else {
    let i = 0;
    if ( m[4] > m[0] )
      i = 1;
    if ( m[8] > m[i*3+i] )
      i = 2;
    let j = (i+1)%3;
    let k = (i+2)%3;
    fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
    out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
    out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
  }
  return out;
}



const fromValues$4 = fromValues$3;











const normalize$2 = normalize$1;


const rotationTo = (function() {
  let tmpvec3 = create$1();
  let xUnitVec3 = fromValues$1(1,0,0);
  let yUnitVec3 = fromValues$1(0,1,0);
  return function(out, a, b) {
    let dot$$1 = dot(a, b);
    if (dot$$1 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001)
        cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot$$1 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot$$1;
      return normalize$2(out, out);
    }
  };
})();
const sqlerp = (function () {
  let temp1 = create$4();
  let temp2 = create$4();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}());
const setAxes = (function() {
  let matr = create$2();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
})();

const PRIVATE$1 = Symbol('@@webxr-polyfill/XRRigidTransform');
class XRRigidTransform$1 {
  constructor() {
    this[PRIVATE$1] = {
      matrix: null,
      position: null,
      orientation: null,
      inverse: null,
    };
    if (arguments.length === 0) {
      this[PRIVATE$1].matrix = identity(new Float32Array(16));
    } else if (arguments.length === 1) {
      if (arguments[0] instanceof Float32Array) {
        this[PRIVATE$1].matrix = arguments[0];
      } else {
        this[PRIVATE$1].position = this._getPoint(arguments[0]);
        this[PRIVATE$1].orientation = DOMPointReadOnly.fromPoint({
            x: 0, y: 0, z: 0, w: 1
        });
      }
    } else if (arguments.length === 2) {
      this[PRIVATE$1].position = this._getPoint(arguments[0]);
      this[PRIVATE$1].orientation = this._getPoint(arguments[1]);
    } else {
      throw new Error("Too many arguments!");
    }
    if (this[PRIVATE$1].matrix) {
        let position = create$1();
        getTranslation(position, this[PRIVATE$1].matrix);
        this[PRIVATE$1].position = DOMPointReadOnly.fromPoint({
            x: position[0],
            y: position[1],
            z: position[2]
        });
        let orientation = create$4();
        getRotation(orientation, this[PRIVATE$1].matrix);
        this[PRIVATE$1].orientation = DOMPointReadOnly.fromPoint({
          x: orientation[0],
          y: orientation[1],
          z: orientation[2],
          w: orientation[3]
        });
    } else {
        this[PRIVATE$1].matrix = identity(new Float32Array(16));
        fromRotationTranslation(
          this[PRIVATE$1].matrix,
          fromValues$4(
            this[PRIVATE$1].orientation.x,
            this[PRIVATE$1].orientation.y,
            this[PRIVATE$1].orientation.z,
            this[PRIVATE$1].orientation.w),
          fromValues$1(
            this[PRIVATE$1].position.x,
            this[PRIVATE$1].position.y,
            this[PRIVATE$1].position.z)
        );
    }
  }
  _getPoint(arg) {
    if (arg instanceof DOMPointReadOnly) {
      return arg;
    }
    return DOMPointReadOnly.fromPoint(arg);
  }
  get matrix() { return this[PRIVATE$1].matrix; }
  get position() { return this[PRIVATE$1].position; }
  get orientation() { return this[PRIVATE$1].orientation; }
  get inverse() {
    if (this[PRIVATE$1].inverse === null) {
      let invMatrix = identity(new Float32Array(16));
      invert(invMatrix, this[PRIVATE$1].matrix);
      this[PRIVATE$1].inverse = new XRRigidTransform$1(invMatrix);
      this[PRIVATE$1].inverse[PRIVATE$1].inverse = this;
    }
    return this[PRIVATE$1].inverse;
  }
}

const PRIVATE$2 = Symbol('@@webxr-polyfill/XRSpace');

class XRSpace {
  constructor(specialType = null, inputSource = null) {
    this[PRIVATE$2] = {
      specialType,
      inputSource,
      baseMatrix: null,
      inverseBaseMatrix: null,
      lastFrameId: -1
    };
  }
  get _specialType() {
    return this[PRIVATE$2].specialType;
  }
  get _inputSource() {
    return this[PRIVATE$2].inputSource;
  }
  _ensurePoseUpdated(device, frameId) {
    if (frameId == this[PRIVATE$2].lastFrameId) return;
    this[PRIVATE$2].lastFrameId = frameId;
    this._onPoseUpdate(device);
  }
  _onPoseUpdate(device) {
    if (this[PRIVATE$2].specialType == 'viewer') {
      this._baseMatrix = device.getBasePoseMatrix();
    }
  }
  set _baseMatrix(matrix) {
    this[PRIVATE$2].baseMatrix = matrix;
    this[PRIVATE$2].inverseBaseMatrix = null;
  }
  get _baseMatrix() {
    if (!this[PRIVATE$2].baseMatrix) {
      if (this[PRIVATE$2].inverseBaseMatrix) {
        this[PRIVATE$2].baseMatrix = new Float32Array(16);
        invert(this[PRIVATE$2].baseMatrix, this[PRIVATE$2].inverseBaseMatrix);
      }
    }
    return this[PRIVATE$2].baseMatrix;
  }
  set _inverseBaseMatrix(matrix) {
    this[PRIVATE$2].inverseBaseMatrix = matrix;
    this[PRIVATE$2].baseMatrix = null;
  }
  get _inverseBaseMatrix() {
    if (!this[PRIVATE$2].inverseBaseMatrix) {
      if (this[PRIVATE$2].baseMatrix) {
        this[PRIVATE$2].inverseBaseMatrix = new Float32Array(16);
        invert(this[PRIVATE$2].inverseBaseMatrix, this[PRIVATE$2].baseMatrix);
      }
    }
    return this[PRIVATE$2].inverseBaseMatrix;
  }
  _getSpaceRelativeTransform(space) {
    if (!this._inverseBaseMatrix || !space._baseMatrix) {
      return null;
    }
    let out = new Float32Array(16);
    multiply(out, this._inverseBaseMatrix, space._baseMatrix);
    return new XRRigidTransform$1(out);
  }
}

const DEFAULT_EMULATION_HEIGHT = 1.6;
const PRIVATE$3 = Symbol('@@webxr-polyfill/XRReferenceSpace');
const XRReferenceSpaceTypes = [
  'viewer',
  'local',
  'local-floor',
  'bounded-floor',
  'unbounded'
];
function isFloor(type) {
  return type === 'bounded-floor' || type === 'local-floor';
}
class XRReferenceSpace extends XRSpace {
  constructor(type, transform = null) {
    if (!XRReferenceSpaceTypes.includes(type)) {
      throw new Error(`XRReferenceSpaceType must be one of ${XRReferenceSpaceTypes}`);
    }
    super(type);
    if (type === 'bounded-floor' && !transform) {
      throw new Error(`XRReferenceSpace cannot use 'bounded-floor' type if the platform does not provide the floor level`);
    }
    if (isFloor(type) && !transform) {
      transform = identity(new Float32Array(16));
      transform[13] = DEFAULT_EMULATION_HEIGHT;
    }
    this._inverseBaseMatrix = transform || identity(new Float32Array(16));
    this[PRIVATE$3] = {
      type,
      originOffset : identity(new Float32Array(16)),
    };
  }
  _onPoseUpdate(device) {
    switch(this[PRIVATE$3].type) {
      case 'viewer':
        this._baseMatrix = device.getBasePoseMatrix();
        break;
      default:
        break;
    }
  }
  _transformBasePoseMatrix(out, pose) {
    multiply(out, this._inverseBaseMatrix, pose);
  }
  _originOffsetMatrix() {
    return this[PRIVATE$3].originOffset;
  }
  _adjustForOriginOffset(transformMatrix) {
    let inverseOriginOffsetMatrix = new Float32Array(16);
    invert(inverseOriginOffsetMatrix, this[PRIVATE$3].originOffset);
    multiply(transformMatrix, inverseOriginOffsetMatrix, transformMatrix);
  }
  _getSpaceRelativeTransform(space) {
    let transform = super._getSpaceRelativeTransform(space);
    this._adjustForOriginOffset(transform.matrix);
    return new XRRigidTransform(transform.matrix);
  }
  getOffsetReferenceSpace(additionalOffset) {
    let newSpace = new XRReferenceSpace(
      this[PRIVATE$3].type,
      this[PRIVATE$3].transform,
      this[PRIVATE$3].bounds);
    multiply(newSpace[PRIVATE$3].originOffset, this[PRIVATE$3].originOffset, additionalOffset.matrix);
    return newSpace;
  }
}

const PRIVATE$4 = Symbol('@@webxr-polyfill/XR');
const XRSessionModes = ['inline', 'immersive-vr', 'immersive-ar'];
const DEFAULT_SESSION_OPTIONS = {
  'inline': {
    requiredFeatures: ['viewer'],
    optionalFeatures: [],
  },
  'immersive-vr': {
    requiredFeatures: ['viewer', 'local'],
    optionalFeatures: [],
  },
  'immersive-ar': {
    requiredFeatures: ['viewer', 'local'],
    optionalFeatures: [],
  }
};
const POLYFILL_REQUEST_SESSION_ERROR =
`Polyfill Error: Must call navigator.xr.isSessionSupported() with any XRSessionMode
or navigator.xr.requestSession('inline') prior to requesting an immersive
session. This is a limitation specific to the WebXR Polyfill and does not apply
to native implementations of the API.`;
class XR extends EventTarget {
  constructor(devicePromise) {
    super();
    this[PRIVATE$4] = {
      device: null,
      devicePromise,
      immersiveSession: null,
      inlineSessions: new Set(),
    };
    devicePromise.then((device) => { this[PRIVATE$4].device = device; });
  }
  async isSessionSupported(mode) {
    if (!this[PRIVATE$4].device) {
      await this[PRIVATE$4].devicePromise;
    }
    if (mode != 'inline') {
      return Promise.resolve(this[PRIVATE$4].device.isSessionSupported(mode));
    }
    return Promise.resolve(true);
  }
  async requestSession(mode, options) {
    if (!this[PRIVATE$4].device) {
      if (mode != 'inline') {
        throw new Error(POLYFILL_REQUEST_SESSION_ERROR);
      } else {
        await this[PRIVATE$4].devicePromise;
      }
    }
    if (!XRSessionModes.includes(mode)) {
      throw new TypeError(
          `The provided value '${mode}' is not a valid enum value of type XRSessionMode`);
    }
    const defaultOptions = DEFAULT_SESSION_OPTIONS[mode];
    const requiredFeatures = defaultOptions.requiredFeatures.concat(
        options && options.requiredFeatures ? options.requiredFeatures : []);
    const optionalFeatures = defaultOptions.optionalFeatures.concat(
        options && options.optionalFeatures ? options.optionalFeatures : []);
    const enabledFeatures = new Set();
    let requirementsFailed = false;
    for (let feature of requiredFeatures) {
      if (!this[PRIVATE$4].device.isFeatureSupported(feature)) {
        console.error(`The required feature '${feature}' is not supported`);
        requirementsFailed = true;
      } else {
        enabledFeatures.add(feature);
      }
    }
    if (requirementsFailed) {
      throw new DOMException('Session does not support some required features', 'NotSupportedError');
    }
    for (let feature of optionalFeatures) {
      if (!this[PRIVATE$4].device.isFeatureSupported(feature)) {
        console.log(`The optional feature '${feature}' is not supported`);
      } else {
        enabledFeatures.add(feature);
      }
    }
    const sessionId = await this[PRIVATE$4].device.requestSession(mode, enabledFeatures);
    const session = new XRSession(this[PRIVATE$4].device, mode, sessionId);
    if (mode == 'inline') {
      this[PRIVATE$4].inlineSessions.add(session);
    } else {
      this[PRIVATE$4].immersiveSession = session;
    }
    const onSessionEnd = () => {
      if (mode == 'inline') {
        this[PRIVATE$4].inlineSessions.delete(session);
      } else {
        this[PRIVATE$4].immersiveSession = null;
      }
      session.removeEventListener('end', onSessionEnd);
    };
    session.addEventListener('end', onSessionEnd);
    return session;
  }
}

let now;
if ('performance' in _global === false) {
  let startTime = Date.now();
  now = () => Date.now() - startTime;
} else {
  now = () => performance.now();
}
var now$1 = now;

const PRIVATE$5 = Symbol('@@webxr-polyfill/XRPose');
class XRPose$1 {
  constructor(transform, emulatedPosition) {
    this[PRIVATE$5] = {
      transform,
      emulatedPosition,
    };
  }
  get transform() { return this[PRIVATE$5].transform; }
  get emulatedPosition() { return this[PRIVATE$5].emulatedPosition; }
}

const PRIVATE$6 = Symbol('@@webxr-polyfill/XRViewerPose');
class XRViewerPose extends XRPose$1 {
  constructor(transform, views, emulatedPosition = false) {
    super(transform, emulatedPosition);
    this[PRIVATE$6] = {
      views
    };
  }
  get views() {
    return this[PRIVATE$6].views;
  }
}

const PRIVATE$7 = Symbol('@@webxr-polyfill/XRViewport');
class XRViewport {
  constructor(target) {
    this[PRIVATE$7] = { target };
  }
  get x() { return this[PRIVATE$7].target.x; }
  get y() { return this[PRIVATE$7].target.y; }
  get width() { return this[PRIVATE$7].target.width; }
  get height() { return this[PRIVATE$7].target.height; }
}

const XREyes = ['left', 'right', 'none'];
const PRIVATE$8 = Symbol('@@webxr-polyfill/XRView');
class XRView {
  constructor(device, transform, eye, sessionId) {
    if (!XREyes.includes(eye)) {
      throw new Error(`XREye must be one of: ${XREyes}`);
    }
    const temp = Object.create(null);
    const viewport = new XRViewport(temp);
    this[PRIVATE$8] = {
      device,
      eye,
      viewport,
      temp,
      sessionId,
      transform,
    };
  }
  get eye() { return this[PRIVATE$8].eye; }
  get projectionMatrix() { return this[PRIVATE$8].device.getProjectionMatrix(this.eye); }
  get transform() { return this[PRIVATE$8].transform; }
  _getViewport(layer) {
    if (this[PRIVATE$8].device.getViewport(this[PRIVATE$8].sessionId,
                                           this.eye,
                                           layer,
                                           this[PRIVATE$8].temp)) {
      return this[PRIVATE$8].viewport;
    }
    return undefined;
  }
}

var EPSILON$1 = 0.000001;
var ARRAY_TYPE$1 = typeof Float32Array !== 'undefined' ? Float32Array : Array;


var degree$1 = Math.PI / 180;

function create$7() {
  var out = new ARRAY_TYPE$1(9);
  if (ARRAY_TYPE$1 != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

function create$9() {
  var out = new ARRAY_TYPE$1(3);
  if (ARRAY_TYPE$1 != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}

function length$3(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function fromValues$9(x, y, z) {
  var out = new ARRAY_TYPE$1(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}


















function normalize$3(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
  }
  return out;
}
function dot$3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross$1(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}



















var len$3 = length$3;

var forEach$2 = function () {
  var vec = create$9();
  return function (a, stride, offset, count, fn, arg) {
    var i = void 0,
        l = void 0;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];
    }
    return a;
  };
}();

function create$10() {
  var out = new ARRAY_TYPE$1(4);
  if (ARRAY_TYPE$1 != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}





















function normalize$4(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
  }
  return out;
}















var forEach$3 = function () {
  var vec = create$10();
  return function (a, stride, offset, count, fn, arg) {
    var i = void 0,
        l = void 0;
    if (!stride) {
      stride = 4;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];a[i + 3] = vec[3];
    }
    return a;
  };
}();

function create$11() {
  var out = new ARRAY_TYPE$1(4);
  if (ARRAY_TYPE$1 != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}

function setAxisAngle$1(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}






function slerp$1(out, a, b, t) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega = void 0,
      cosom = void 0,
      sinom = void 0,
      scale0 = void 0,
      scale1 = void 0;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1.0 - cosom > EPSILON$1) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1.0 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}



function fromMat3$1(out, m) {
  var fTrace = m[0] + m[4] + m[8];
  var fRoot = void 0;
  if (fTrace > 0.0) {
    fRoot = Math.sqrt(fTrace + 1.0);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}















var normalize$5 = normalize$4;


var rotationTo$1 = function () {
  var tmpvec3 = create$9();
  var xUnitVec3 = fromValues$9(1, 0, 0);
  var yUnitVec3 = fromValues$9(0, 1, 0);
  return function (out, a, b) {
    var dot = dot$3(a, b);
    if (dot < -0.999999) {
      cross$1(tmpvec3, xUnitVec3, a);
      if (len$3(tmpvec3) < 0.000001) cross$1(tmpvec3, yUnitVec3, a);
      normalize$3(tmpvec3, tmpvec3);
      setAxisAngle$1(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross$1(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize$5(out, out);
    }
  };
}();
var sqlerp$1 = function () {
  var temp1 = create$11();
  var temp2 = create$11();
  return function (out, a, b, c, d, t) {
    slerp$1(temp1, a, d, t);
    slerp$1(temp2, b, c, t);
    slerp$1(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
var setAxes$1 = function () {
  var matr = create$7();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$5(out, fromMat3$1(out, matr));
  };
}();

function create$13() {
  var out = new ARRAY_TYPE$1(2);
  if (ARRAY_TYPE$1 != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
}










































var forEach$4 = function () {
  var vec = create$13();
  return function (a, stride, offset, count, fn, arg) {
    var i = void 0,
        l = void 0;
    if (!stride) {
      stride = 2;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];a[i + 1] = vec[1];
    }
    return a;
  };
}();

const PRIVATE$9 = Symbol('@@webxr-polyfill/XRFrame');
const NON_ACTIVE_MSG = "XRFrame access outside the callback that produced it is invalid.";
const NON_ANIMFRAME_MSG = "getViewerPose can only be called on XRFrame objects passed to XRSession.requestAnimationFrame callbacks.";
let NEXT_FRAME_ID = 0;
class XRFrame {
  constructor(device, session, sessionId) {
    this[PRIVATE$9] = {
      id: ++NEXT_FRAME_ID,
      active: false,
      animationFrame: false,
      device,
      session,
      sessionId
    };
  }
  get session() { return this[PRIVATE$9].session; }
  getViewerPose(referenceSpace) {
    if (!this[PRIVATE$9].animationFrame) {
      throw new DOMException(NON_ANIMFRAME_MSG, 'InvalidStateError');
    }
    if (!this[PRIVATE$9].active) {
      throw new DOMException(NON_ACTIVE_MSG, 'InvalidStateError');
    }
    const device = this[PRIVATE$9].device;
    const session = this[PRIVATE$9].session;
    session[PRIVATE$15].viewerSpace._ensurePoseUpdated(device, this[PRIVATE$9].id);
    referenceSpace._ensurePoseUpdated(device, this[PRIVATE$9].id);
    let viewerTransform = referenceSpace._getSpaceRelativeTransform(session[PRIVATE$15].viewerSpace);
    const views = [];
    for (let viewSpace of session[PRIVATE$15].viewSpaces) {
      viewSpace._ensurePoseUpdated(device, this[PRIVATE$9].id);
      let viewTransform = referenceSpace._getSpaceRelativeTransform(viewSpace);
      let view = new XRView(device, viewTransform, viewSpace.eye, this[PRIVATE$9].sessionId);
      views.push(view);
    }
    let viewerPose = new XRViewerPose(viewerTransform, views, false                             );
    return viewerPose;
  }
  getPose(space, baseSpace) {
    if (!this[PRIVATE$9].active) {
      throw new DOMException(NON_ACTIVE_MSG, 'InvalidStateError');
    }
    const device = this[PRIVATE$9].device;
    if (space._specialType === "target-ray" || space._specialType === "grip") {
      return device.getInputPose(
        space._inputSource, baseSpace, space._specialType);
    } else {
      space._ensurePoseUpdated(device, this[PRIVATE$9].id);
      baseSpace._ensurePoseUpdated(device, this[PRIVATE$9].id);
      let transform = baseSpace._getSpaceRelativeTransform(space);
      if (!transform) { return null; }
      return new XRPose(transform, false                             );
    }
    return null;
  }
}

const PRIVATE$10 = Symbol('@@webxr-polyfill/XRRenderState');
const XRRenderStateInit = Object.freeze({
  depthNear: 0.1,
  depthFar: 1000.0,
  inlineVerticalFieldOfView: null,
  baseLayer: null
});
class XRRenderState {
  constructor(stateInit = {}) {
    const config = Object.assign({}, XRRenderStateInit, stateInit);
    this[PRIVATE$10] = { config };
  }
  get depthNear() { return this[PRIVATE$10].config.depthNear; }
  get depthFar() { return this[PRIVATE$10].config.depthFar; }
  get inlineVerticalFieldOfView() { return this[PRIVATE$10].config.inlineVerticalFieldOfView; }
  get baseLayer() { return this[PRIVATE$10].config.baseLayer; }
}

const POLYFILLED_XR_COMPATIBLE = Symbol('@@webxr-polyfill/polyfilled-xr-compatible');
const XR_COMPATIBLE = Symbol('@@webxr-polyfill/xr-compatible');

const PRIVATE$11 = Symbol('@@webxr-polyfill/XRWebGLLayer');
const XRWebGLLayerInit = Object.freeze({
  antialias: true,
  depth: false,
  stencil: false,
  alpha: true,
  multiview: false,
  ignoreDepthValues: false,
  framebufferScaleFactor: 1.0,
});
class XRWebGLLayer {
  constructor(session, context, layerInit={}) {
    const config = Object.assign({}, XRWebGLLayerInit, layerInit);
    if (!(session instanceof XRSession$1)) {
      throw new Error('session must be a XRSession');
    }
    if (session.ended) {
      throw new Error(`InvalidStateError`);
    }
    if (context[POLYFILLED_XR_COMPATIBLE]) {
      if (context[XR_COMPATIBLE] !== true) {
        throw new Error(`InvalidStateError`);
      }
    }
    const framebuffer = context.getParameter(context.FRAMEBUFFER_BINDING);
    this[PRIVATE$11] = {
      context,
      config,
      framebuffer,
      session,
    };
  }
  get context() { return this[PRIVATE$11].context; }
  get antialias() { return this[PRIVATE$11].config.antialias; }
  get ignoreDepthValues() { return true; }
  get framebuffer() { return this[PRIVATE$11].framebuffer; }
  get framebufferWidth() { return this[PRIVATE$11].context.drawingBufferWidth; }
  get framebufferHeight() { return this[PRIVATE$11].context.drawingBufferHeight; }
  get _session() { return this[PRIVATE$11].session; }
  getViewport(view) {
    return view._getViewport(this);
  }
}

const PRIVATE$12 = Symbol('@@webxr-polyfill/XRInputSourceEvent');
class XRInputSourceEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this[PRIVATE$12] = {
      frame: eventInitDict.frame,
      inputSource: eventInitDict.inputSource
    };
  }
  get frame() { return this[PRIVATE$12].frame; }
  get inputSource() { return this[PRIVATE$12].inputSource; }
}

const PRIVATE$13 = Symbol('@@webxr-polyfill/XRSessionEvent');
class XRSessionEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this[PRIVATE$13] = {
      session: eventInitDict.session
    };
  }
  get session() { return this[PRIVATE$13].session; }
}

const PRIVATE$14 = Symbol('@@webxr-polyfill/XRInputSourcesChangeEvent');
class XRInputSourcesChangeEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this[PRIVATE$14] = {
      session: eventInitDict.session,
      added: eventInitDict.added,
      removed: eventInitDict.removed
    };
  }
  get session() { return this[PRIVATE$14].session; }
  get added() { return this[PRIVATE$14].added; }
  get removed() { return this[PRIVATE$14].removed; }
}

const PRIVATE$15 = Symbol('@@webxr-polyfill/XRSession');
class XRViewSpace extends XRSpace {
  constructor(eye) {
    super(eye);
  }
  get eye() {
    return this._specialType;
  }
  _onPoseUpdate(device) {
    this._inverseBaseMatrix = device.getBaseViewMatrix(this._specialType);
  }
}
class XRSession$1 extends EventTarget {
  constructor(device, mode, id) {
    super();
    let immersive = mode != 'inline';
    let initialRenderState = new XRRenderState({
      inlineVerticalFieldOfView: immersive ? null : Math.PI * 0.5
    });
    this[PRIVATE$15] = {
      device,
      mode,
      immersive,
      ended: false,
      suspended: false,
      frameCallbacks: [],
      currentFrameCallbacks: null,
      frameHandle: 0,
      deviceFrameHandle: null,
      id,
      activeRenderState: initialRenderState,
      pendingRenderState: null,
      viewerSpace: new XRReferenceSpace("viewer"),
      viewSpaces: [],
      currentInputSources: []
    };
    if (immersive) {
      this[PRIVATE$15].viewSpaces.push(new XRViewSpace('left'),
                                    new XRViewSpace('right'));
    } else {
      this[PRIVATE$15].viewSpaces.push(new XRViewSpace('none'));
    }
    this[PRIVATE$15].onDeviceFrame = () => {
      if (this[PRIVATE$15].ended || this[PRIVATE$15].suspended) {
        return;
      }
      this[PRIVATE$15].deviceFrameHandle = null;
      this[PRIVATE$15].startDeviceFrameLoop();
      if (this[PRIVATE$15].pendingRenderState !== null) {
        this[PRIVATE$15].activeRenderState = new XRRenderState(this[PRIVATE$15].pendingRenderState);
        this[PRIVATE$15].pendingRenderState = null;
        if (this[PRIVATE$15].activeRenderState.baseLayer) {
          this[PRIVATE$15].device.onBaseLayerSet(
            this[PRIVATE$15].id,
            this[PRIVATE$15].activeRenderState.baseLayer);
        }
      }
      if (this[PRIVATE$15].activeRenderState.baseLayer === null) {
        return;
      }
      const frame = new XRFrame(device, this, this[PRIVATE$15].id);
      const callbacks = this[PRIVATE$15].currentFrameCallbacks = this[PRIVATE$15].frameCallbacks;
      this[PRIVATE$15].frameCallbacks = [];
      frame[PRIVATE$9].active = true;
      frame[PRIVATE$9].animationFrame = true;
      this[PRIVATE$15].device.onFrameStart(this[PRIVATE$15].id, this[PRIVATE$15].activeRenderState);
      this._checkInputSourcesChange();
      const rightNow = now$1();
      for (let i = 0; i < callbacks.length; i++) {
        try {
          if (!callbacks[i].cancelled && typeof callbacks[i].callback === 'function') {
            callbacks[i].callback(rightNow, frame);
          }
        } catch(err) {
          console.error(err);
        }
      }
      this[PRIVATE$15].currentFrameCallbacks = null;
      frame[PRIVATE$9].active = false;
      this[PRIVATE$15].device.onFrameEnd(this[PRIVATE$15].id);
    };
    this[PRIVATE$15].startDeviceFrameLoop = () => {
      if (this[PRIVATE$15].deviceFrameHandle === null) {
        this[PRIVATE$15].deviceFrameHandle = this[PRIVATE$15].device.requestAnimationFrame(
          this[PRIVATE$15].onDeviceFrame
        );
      }
    };
    this[PRIVATE$15].stopDeviceFrameLoop = () => {
      const handle = this[PRIVATE$15].deviceFrameHandle;
      if (handle !== null) {
        this[PRIVATE$15].device.cancelAnimationFrame(handle);
        this[PRIVATE$15].deviceFrameHandle = null;
      }
    };
    this[PRIVATE$15].onPresentationEnd = sessionId => {
      if (sessionId !== this[PRIVATE$15].id) {
        this[PRIVATE$15].suspended = false;
        this[PRIVATE$15].startDeviceFrameLoop();
        this.dispatchEvent('focus', { session: this });
        return;
      }
      this[PRIVATE$15].ended = true;
      this[PRIVATE$15].stopDeviceFrameLoop();
      device.removeEventListener('@webvr-polyfill/vr-present-end', this[PRIVATE$15].onPresentationEnd);
      device.removeEventListener('@webvr-polyfill/vr-present-start', this[PRIVATE$15].onPresentationStart);
      device.removeEventListener('@@webvr-polyfill/input-select-start', this[PRIVATE$15].onSelectStart);
      device.removeEventListener('@@webvr-polyfill/input-select-end', this[PRIVATE$15].onSelectEnd);
      this.dispatchEvent('end', new XRSessionEvent('end', { session: this }));
    };
    device.addEventListener('@@webxr-polyfill/vr-present-end', this[PRIVATE$15].onPresentationEnd);
    this[PRIVATE$15].onPresentationStart = sessionId => {
      if (sessionId === this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].suspended = true;
      this[PRIVATE$15].stopDeviceFrameLoop();
      this.dispatchEvent('blur', { session: this });
    };
    device.addEventListener('@@webxr-polyfill/vr-present-start', this[PRIVATE$15].onPresentationStart);
    this[PRIVATE$15].onSelectStart = evt => {
      if (evt.sessionId !== this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].dispatchInputSourceEvent('selectstart',  evt.inputSource);
    };
    device.addEventListener('@@webxr-polyfill/input-select-start', this[PRIVATE$15].onSelectStart);
    this[PRIVATE$15].onSelectEnd = evt => {
      if (evt.sessionId !== this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].dispatchInputSourceEvent('selectend',  evt.inputSource);
      this[PRIVATE$15].dispatchInputSourceEvent('select',  evt.inputSource);
    };
    device.addEventListener('@@webxr-polyfill/input-select-end', this[PRIVATE$15].onSelectEnd);
    this[PRIVATE$15].onSqueezeStart = evt => {
      if (evt.sessionId !== this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].dispatchInputSourceEvent('squeezestart',  evt.inputSource);
    };
    device.addEventListener('@@webxr-polyfill/input-squeeze-start', this[PRIVATE$15].onSqueezeStart);
    this[PRIVATE$15].onSqueezeEnd = evt => {
      if (evt.sessionId !== this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].dispatchInputSourceEvent('squeezeend',  evt.inputSource);
      this[PRIVATE$15].dispatchInputSourceEvent('squeeze',  evt.inputSource);
    };
    device.addEventListener('@@webxr-polyfill/input-squeeze-end', this[PRIVATE$15].onSqueezeEnd);
    this[PRIVATE$15].dispatchInputSourceEvent = (type, inputSource) => {
      const frame = new XRFrame(device, this, this[PRIVATE$15].id);
      const event = new XRInputSourceEvent(type, { frame, inputSource });
      frame[PRIVATE$9].active = true;
      this.dispatchEvent(type, event);
      frame[PRIVATE$9].active = false;
    };
    this[PRIVATE$15].startDeviceFrameLoop();
    this.onblur = undefined;
    this.onfocus = undefined;
    this.onresetpose = undefined;
    this.onend = undefined;
    this.onselect = undefined;
    this.onselectstart = undefined;
    this.onselectend = undefined;
  }
  get renderState() { return this[PRIVATE$15].activeRenderState; }
  get environmentBlendMode() {
    return this[PRIVATE$15].device.environmentBlendMode || 'opaque';
  }
  async requestReferenceSpace(type) {
    if (this[PRIVATE$15].ended) {
      return;
    }
    if (!XRReferenceSpaceTypes.includes(type)) {
      throw new TypeError(`XRReferenceSpaceType must be one of ${XRReferenceSpaceTypes}`);
    }
    if (!this[PRIVATE$15].device.doesSessionSupportReferenceSpace(this[PRIVATE$15].id, type)) {
      throw new DOMException(`The ${type} reference space is not supported by this session.`, 'NotSupportedError');
    }
    if (type === 'viewer') {
      return this[PRIVATE$15].viewerSpace;
    }
    let transform = await this[PRIVATE$15].device.requestFrameOfReferenceTransform(type);
    if (type === 'bounded-floor') {
      if (!transform) {
        throw new DOMException(`${type} XRReferenceSpace not supported by this device.`, 'NotSupportedError');
      }
      let bounds = this[PRIVATE$15].device.requestStageBounds();
      if (!bounds) {
        throw new DOMException(`${type} XRReferenceSpace not supported by this device.`, 'NotSupportedError');
      }
      throw new DOMException(`The WebXR polyfill does not support the ${type} reference space yet.`, 'NotSupportedError');
    }
    return new XRReferenceSpace(type, transform);
  }
  requestAnimationFrame(callback) {
    if (this[PRIVATE$15].ended) {
      return;
    }
    const handle = ++this[PRIVATE$15].frameHandle;
    this[PRIVATE$15].frameCallbacks.push({
      handle,
      callback,
      cancelled: false
    });
    return handle;
  }
  cancelAnimationFrame(handle) {
    let callbacks = this[PRIVATE$15].frameCallbacks;
    let index = callbacks.findIndex(d => d && d.handle === handle);
    if (index > -1) {
      callbacks[index].cancelled = true;
      callbacks.splice(index, 1);
    }
    callbacks = this[PRIVATE$15].currentFrameCallbacks;
    if (callbacks) {
      index = callbacks.findIndex(d => d && d.handle === handle);
      if (index > -1) {
        callbacks[index].cancelled = true;
      }
    }
  }
  get inputSources() {
    return this[PRIVATE$15].device.getInputSources();
  }
  async end() {
    if (this[PRIVATE$15].ended) {
      return;
    }
    if (this.immersive) {
      this[PRIVATE$15].ended = true;
      this[PRIVATE$15].device.removeEventListener('@@webvr-polyfill/vr-present-start',
                                                 this[PRIVATE$15].onPresentationStart);
      this[PRIVATE$15].device.removeEventListener('@@webvr-polyfill/vr-present-end',
                                                 this[PRIVATE$15].onPresentationEnd);
      this[PRIVATE$15].device.removeEventListener('@@webvr-polyfill/input-select-start',
                                                 this[PRIVATE$15].onSelectStart);
      this[PRIVATE$15].device.removeEventListener('@@webvr-polyfill/input-select-end',
                                                 this[PRIVATE$15].onSelectEnd);
      this.dispatchEvent('end', new XRSessionEvent('end', { session: this }));
    }
    this[PRIVATE$15].stopDeviceFrameLoop();
    return this[PRIVATE$15].device.endSession(this[PRIVATE$15].id);
  }
  updateRenderState(newState) {
    if (this[PRIVATE$15].ended) {
      const message = "Can't call updateRenderState on an XRSession " +
                      "that has already ended.";
      throw new Error(message);
    }
    if (newState.baseLayer && (newState.baseLayer._session !== this)) {
      const message = "Called updateRenderState with a base layer that was " +
                      "created by a different session.";
      throw new Error(message);
    }
    const fovSet = (newState.inlineVerticalFieldOfView !== null) &&
                   (newState.inlineVerticalFieldOfView !== undefined);
    if (fovSet) {
      if (this[PRIVATE$15].immersive) {
        const message = "inlineVerticalFieldOfView must not be set for an " +
                        "XRRenderState passed to updateRenderState for an " +
                        "immersive session.";
        throw new Error(message);
      } else {
        newState.inlineVerticalFieldOfView = Math.min(
          3.13, Math.max(0.01, newState.inlineVerticalFieldOfView));
      }
    }
    if (this[PRIVATE$15].pendingRenderState === null) {
      const activeRenderState = this[PRIVATE$15].activeRenderState;
      this[PRIVATE$15].pendingRenderState = {
        depthNear: activeRenderState.depthNear,
        depthFar: activeRenderState.depthFar,
        inlineVerticalFieldOfView: activeRenderState.inlineVerticalFieldOfView,
        baseLayer: activeRenderState.baseLayer
      };
    }
    Object.assign(this[PRIVATE$15].pendingRenderState, newState);
  }
  _checkInputSourcesChange() {
    const added = [];
    const removed = [];
    const newInputSources = this.inputSources;
    const oldInputSources = this[PRIVATE$15].currentInputSources;
    for (const newInputSource of newInputSources) {
      if (!oldInputSources.includes(newInputSource)) {
        added.push(newInputSource);
      }
    }
    for (const oldInputSource of oldInputSources) {
      if (!newInputSources.includes(oldInputSource)) {
        removed.push(oldInputSource);
      }
    }
    if (added.length > 0 || removed.length > 0) {
      this.dispatchEvent('inputsourceschange', new XRInputSourcesChangeEvent('inputsourceschange', {
        session: this,
        added: added,
        removed: removed
      }));
    }
    this[PRIVATE$15].currentInputSources.length = 0;
    for (const newInputSource of newInputSources) {
      this[PRIVATE$15].currentInputSources.push(newInputSource);
    }
  }
}

const PRIVATE$16 = Symbol('@@webxr-polyfill/XRInputSource');
class XRInputSource {
  constructor(impl) {
    this[PRIVATE$16] = {
      impl,
      gripSpace: new XRSpace("grip", this),
      targetRaySpace: new XRSpace("target-ray", this)
    };
  }
  get handedness() { return this[PRIVATE$16].impl.handedness; }
  get targetRayMode() { return this[PRIVATE$16].impl.targetRayMode; }
  get gripSpace() {
    let mode = this[PRIVATE$16].impl.targetRayMode;
    if (mode === "gaze" || mode === "screen") {
      return null;
    }
    return this[PRIVATE$16].gripSpace;
  }
  get targetRaySpace() { return this[PRIVATE$16].targetRaySpace; }
  get profiles() { return this[PRIVATE$16].impl.profiles; }
  get gamepad() { return this[PRIVATE$16].impl.gamepad; }
}

const PRIVATE$17 = Symbol('@@webxr-polyfill/XRReferenceSpaceEvent');
class XRReferenceSpaceEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this[PRIVATE$17] = {
      referenceSpace: eventInitDict.referenceSpace,
      transform: eventInitDict.transform || null
    };
  }
  get referenceSpace() { return this[PRIVATE$17].referenceSpace; }
  get transform() { return this[PRIVATE$17].transform; }
}

var API = {
  XR,
  XRSession: XRSession$1,
  XRSessionEvent,
  XRFrame,
  XRView,
  XRViewport,
  XRViewerPose,
  XRWebGLLayer,
  XRSpace,
  XRReferenceSpace,
  XRReferenceSpaceEvent,
  XRInputSource,
  XRInputSourceEvent,
  XRInputSourcesChangeEvent,
  XRRenderState,
  XRRigidTransform: XRRigidTransform$1,
  XRPose: XRPose$1,
};

const polyfillMakeXRCompatible = Context => {
  if (typeof Context.prototype.makeXRCompatible === 'function') {
    return false;
  }
  Context.prototype.makeXRCompatible = function () {
    this[XR_COMPATIBLE] = true;
    return Promise.resolve();
  };
  return true;
};
const polyfillGetContext = (Canvas) => {
  const getContext = Canvas.prototype.getContext;
  Canvas.prototype.getContext = function (contextType, glAttribs) {
    const ctx = getContext.call(this, contextType, glAttribs);
    if (ctx) {
      ctx[POLYFILLED_XR_COMPATIBLE] = true;
      if (glAttribs && ('xrCompatible' in glAttribs)) {
        ctx[XR_COMPATIBLE] = glAttribs.xrCompatible;
      }
    }
    return ctx;
  };
};

const requestXRDevice = async function (global, config) {
};

const CONFIG_DEFAULTS = {
  global: _global,
  webvr: true,
  cardboard: true,
  cardboardConfig: null,
  allowCardboardOnDesktop: false,
};
const partials = ['navigator', 'HTMLCanvasElement', 'WebGLRenderingContext'];
class WebXRPolyfill {
  constructor(config={}) {
    this.config = Object.freeze(Object.assign({}, CONFIG_DEFAULTS, config));
    this.global = this.config.global;
    this.nativeWebXR = 'xr' in this.global.navigator;
    this.injected = false;
    if (!this.nativeWebXR) {
      this._injectPolyfill(this.global);
    } else {
      this._injectCompatibilityShims(this.global);
    }
  }
  _injectPolyfill(global) {
    if (!partials.every(iface => !!global[iface])) {
      throw new Error(`Global must have the following attributes : ${partials}`);
    }
    for (const className of Object.keys(API)) {
      if (global[className] !== undefined) {
        console.warn(`${className} already defined on global.`);
      } else {
        global[className] = API[className];
      }
    }
    {
      const polyfilledCtx = polyfillMakeXRCompatible(global.WebGLRenderingContext);
      if (polyfilledCtx) {
        polyfillGetContext(global.HTMLCanvasElement);
        if (global.OffscreenCanvas) {
          polyfillGetContext(global.OffscreenCanvas);
        }
        if (global.WebGL2RenderingContext){
          polyfillMakeXRCompatible(global.WebGL2RenderingContext);
        }
      }
    }
    this.injected = true;
    this._patchNavigatorXR();
  }
  _patchNavigatorXR() {
    let devicePromise = requestXRDevice(this.global, this.config);
    this.xr = new API.XR(devicePromise);
    Object.defineProperty(this.global.navigator, 'xr', {
      value: this.xr,
      configurable: true,
    });
  }
  _injectCompatibilityShims(global) {
    if (!partials.every(iface => !!global[iface])) {
      throw new Error(`Global must have the following attributes : ${partials}`);
    }
    if (global.navigator.xr &&
        'supportsSession' in global.navigator.xr &&
        !('isSessionSupported' in global.navigator.xr)) {
      let originalSupportsSession = global.navigator.xr.supportsSession;
      global.navigator.xr.isSessionSupported = function(mode) {
        return originalSupportsSession.call(this, mode).then(() => {
          return true;
        }).catch(() => {
          return false;
        });
      };
      global.navigator.xr.supportsSession = function(mode) {
        console.warn("navigator.xr.supportsSession() is deprecated. Please " +
        "call navigator.xr.isSessionSupported() instead and check the boolean " +
        "value returned when the promise resolves.");
        return originalSupportsSession.call(this, mode);
      };
    }
    if (global.XRWebGLLayer) {
      let originalRequestSession = global.navigator.xr.requestSession;
      global.navigator.xr.requestSession = function(mode, options) {
        return originalRequestSession.call(this, mode, options).then((session) => {
          session._session_mode = mode;
          return session;
        });
      };
      var originalXRLayer = global.XRWebGLLayer;
      global.XRWebGLLayer = function(session, gl, options) {
        if (!options) {
          options = {};
        }
        options.compositionDisabled = (session._session_mode === "inline");
        return new originalXRLayer(session, gl, options);
      };
    }
  }
}

return WebXRPolyfill;

})));
