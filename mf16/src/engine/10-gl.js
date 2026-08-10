/* ============================================================================
   MF3D · GL — a micro WebGL renderer, written for this one job.
   ----------------------------------------------------------------------------
   Why hand-rolled instead of three.js: CLAUDE.md RULE 3 and RULE 8. The built
   artifact must open offline from a double-click and be interactive in under
   2.5s on a mid-tier Android over mobile data. three + drei + react is roughly
   900 KB of parse before a single triangle. Everything the four approved scenes
   need is boxes, spheres, cylinders, tori and instancing, which is ~30 KB here.

   Renders WebGL2 when available, WebGL1 + ANGLE_instanced_arrays otherwise,
   and reports failure so SceneFrame can fall back to Lite mode.
   ========================================================================== */
(function (root) {
  'use strict';

  /* ------------------------------------------------------------ mat4 / vec3 */

  var M4 = {
    create: function () {
      var m = new Float32Array(16);
      m[0] = m[5] = m[10] = m[15] = 1;
      return m;
    },
    identity: function (o) {
      o[0] = 1; o[1] = 0; o[2] = 0; o[3] = 0;
      o[4] = 0; o[5] = 1; o[6] = 0; o[7] = 0;
      o[8] = 0; o[9] = 0; o[10] = 1; o[11] = 0;
      o[12] = 0; o[13] = 0; o[14] = 0; o[15] = 1;
      return o;
    },
    perspective: function (o, fovy, aspect, near, far) {
      var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
      o[0] = f / aspect; o[1] = 0; o[2] = 0; o[3] = 0;
      o[4] = 0; o[5] = f; o[6] = 0; o[7] = 0;
      o[8] = 0; o[9] = 0; o[10] = (far + near) * nf; o[11] = -1;
      o[12] = 0; o[13] = 0; o[14] = 2 * far * near * nf; o[15] = 0;
      return o;
    },
    lookAt: function (o, eye, at, up) {
      var z0 = eye[0] - at[0], z1 = eye[1] - at[1], z2 = eye[2] - at[2];
      var l = Math.hypot(z0, z1, z2) || 1;
      z0 /= l; z1 /= l; z2 /= l;
      var x0 = up[1] * z2 - up[2] * z1, x1 = up[2] * z0 - up[0] * z2, x2 = up[0] * z1 - up[1] * z0;
      l = Math.hypot(x0, x1, x2);
      if (!l) { x0 = 1; x1 = 0; x2 = 0; } else { x0 /= l; x1 /= l; x2 /= l; }
      var y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
      o[0] = x0; o[1] = y0; o[2] = z0; o[3] = 0;
      o[4] = x1; o[5] = y1; o[6] = z1; o[7] = 0;
      o[8] = x2; o[9] = y2; o[10] = z2; o[11] = 0;
      o[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
      o[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
      o[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
      o[15] = 1;
      return o;
    },
    multiply: function (o, a, b) {
      var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
          a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
          a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
          a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      for (var i = 0; i < 4; i++) {
        var b0 = b[i * 4], b1 = b[i * 4 + 1], b2 = b[i * 4 + 2], b3 = b[i * 4 + 3];
        o[i * 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        o[i * 4 + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        o[i * 4 + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        o[i * 4 + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      }
      return o;
    },
    /* TRS with Euler XYZ. Rotation is applied Z then Y then X. */
    compose: function (o, px, py, pz, rx, ry, rz, sx, sy, sz) {
      var cx = Math.cos(rx), sxr = Math.sin(rx),
          cy = Math.cos(ry), syr = Math.sin(ry),
          cz = Math.cos(rz), szr = Math.sin(rz);
      var m00 = cy * cz, m01 = cy * szr, m02 = -syr;
      var m10 = sxr * syr * cz - cx * szr, m11 = sxr * syr * szr + cx * cz, m12 = sxr * cy;
      var m20 = cx * syr * cz + sxr * szr, m21 = cx * syr * szr - sxr * cz, m22 = cx * cy;
      o[0] = m00 * sx; o[1] = m01 * sx; o[2] = m02 * sx; o[3] = 0;
      o[4] = m10 * sy; o[5] = m11 * sy; o[6] = m12 * sy; o[7] = 0;
      o[8] = m20 * sz; o[9] = m21 * sz; o[10] = m22 * sz; o[11] = 0;
      o[12] = px; o[13] = py; o[14] = pz; o[15] = 1;
      return o;
    },
    invert: function (o, m) {
      var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3],
          a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7],
          a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11],
          a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
      var b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10,
          b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11,
          b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12,
          b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30,
          b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31,
          b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) return null;
      det = 1 / det;
      o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return o;
    }
  };

  /* Aim a unit-height +Y cylinder/box from point a to point b. */
  function aimEuler(ax, ay, az, bx, by, bz) {
    var dx = bx - ax, dy = by - ay, dz = bz - az;
    var len = Math.hypot(dx, dy, dz) || 1e-6;
    // Rotation that takes +Y to the direction (dx,dy,dz), Euler XYZ order.
    var ry = Math.atan2(dx, dz);
    var rx = Math.atan2(Math.hypot(dx, dz), dy);
    return { len: len, rx: rx, ry: ry, mx: (ax + bx) / 2, my: (ay + by) / 2, mz: (az + bz) / 2 };
  }

  /* ----------------------------------------------------------------- colour */

  function hex(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }
  /* RULE 5 — 3D materials use the token palette. Nothing else is permitted. */
  var PAL = {
    bg: hex('#0b0a08'), bg2: hex('#131110'), bg3: hex('#1a1712'), bg4: hex('#221d17'),
    border: hex('#2a2520'), borderStrong: hex('#3a342c'),
    text: hex('#e8e3db'), dim: hex('#a8a196'), dimmer: hex('#6b6560'),
    gold: hex('#c9a961'), goldBright: hex('#e5c88a'), goldDeep: hex('#8a7340'),
    warn: hex('#d08770'), info: hex('#7ca69a'), success: hex('#9cb37a')
  };

  /* --------------------------------------------------------------- geometry */

  function geo(pos, nrm, idx) {
    return { position: new Float32Array(pos), normal: new Float32Array(nrm), index: new Uint16Array(idx) };
  }

  function box() {
    var p = [], n = [], i = [];
    var faces = [
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 1, 0], [0, 0, -1]],
      [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [0, 0, -1], [1, 0, 0]],
      [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]]
    ];
    faces.forEach(function (f, k) {
      var nn = f[0], u = f[1], v = f[2];
      for (var s = 0; s < 4; s++) {
        var a = (s === 0 || s === 3) ? -0.5 : 0.5;
        var b = (s < 2) ? -0.5 : 0.5;
        p.push(nn[0] * 0.5 + u[0] * a + v[0] * b, nn[1] * 0.5 + u[1] * a + v[1] * b, nn[2] * 0.5 + u[2] * a + v[2] * b);
        n.push(nn[0], nn[1], nn[2]);
      }
      var o = k * 4;
      i.push(o, o + 1, o + 2, o, o + 2, o + 3);
    });
    return geo(p, n, i);
  }

  function sphere(seg, ring) {
    seg = seg || 18; ring = ring || 12;
    var p = [], n = [], i = [];
    for (var y = 0; y <= ring; y++) {
      var v = y / ring, phi = v * Math.PI;
      for (var x = 0; x <= seg; x++) {
        var u = x / seg, th = u * Math.PI * 2;
        var nx = Math.sin(phi) * Math.cos(th), ny = Math.cos(phi), nz = Math.sin(phi) * Math.sin(th);
        p.push(nx * 0.5, ny * 0.5, nz * 0.5);
        n.push(nx, ny, nz);
      }
    }
    for (var yy = 0; yy < ring; yy++) {
      for (var xx = 0; xx < seg; xx++) {
        var a = yy * (seg + 1) + xx, b = a + seg + 1;
        i.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return geo(p, n, i);
  }

  /* Unit cylinder: height 1 on Y, diameter 1. */
  function cylinder(seg, capped) {
    seg = seg || 24;
    if (capped === undefined) capped = true;
    var p = [], n = [], i = [];
    for (var x = 0; x <= seg; x++) {
      var th = (x / seg) * Math.PI * 2, cx = Math.cos(th), cz = Math.sin(th);
      p.push(cx * 0.5, 0.5, cz * 0.5); n.push(cx, 0, cz);
      p.push(cx * 0.5, -0.5, cz * 0.5); n.push(cx, 0, cz);
    }
    for (var x2 = 0; x2 < seg; x2++) {
      var a = x2 * 2;
      i.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    if (capped) {
      [1, -1].forEach(function (dir) {
        var base = p.length / 3;
        p.push(0, dir * 0.5, 0); n.push(0, dir, 0);
        for (var x3 = 0; x3 <= seg; x3++) {
          var th2 = (x3 / seg) * Math.PI * 2;
          p.push(Math.cos(th2) * 0.5, dir * 0.5, Math.sin(th2) * 0.5);
          n.push(0, dir, 0);
        }
        for (var x4 = 0; x4 < seg; x4++) {
          if (dir > 0) i.push(base, base + 1 + x4, base + 2 + x4);
          else i.push(base, base + 2 + x4, base + 1 + x4);
        }
      });
    }
    return geo(p, n, i);
  }

  function cone(seg) {
    seg = seg || 20;
    var p = [], n = [], i = [];
    for (var x = 0; x < seg; x++) {
      var t0 = (x / seg) * Math.PI * 2, t1 = ((x + 1) / seg) * Math.PI * 2;
      var c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
      var mx = (c0 + c1) / 2, mz = (s0 + s1) / 2, ml = Math.hypot(mx, mz) || 1;
      var nx = mx / ml * 0.85, nz = mz / ml * 0.85, ny = 0.5;
      var b = p.length / 3;
      p.push(0, 0.5, 0, c0 * 0.5, -0.5, s0 * 0.5, c1 * 0.5, -0.5, s1 * 0.5);
      n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
      i.push(b, b + 1, b + 2);
      var b2 = p.length / 3;
      p.push(0, -0.5, 0, c1 * 0.5, -0.5, s1 * 0.5, c0 * 0.5, -0.5, s0 * 0.5);
      n.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
      i.push(b2, b2 + 1, b2 + 2);
    }
    return geo(p, n, i);
  }

  /* Torus lying in the XZ plane, outer radius 0.5. */
  function torus(tube, seg, ring) {
    tube = tube || 0.08; seg = seg || 40; ring = ring || 10;
    var R = 0.5 - tube, p = [], n = [], i = [];
    for (var j = 0; j <= seg; j++) {
      var u = (j / seg) * Math.PI * 2, cu = Math.cos(u), su = Math.sin(u);
      for (var k = 0; k <= ring; k++) {
        var v = (k / ring) * Math.PI * 2, cv = Math.cos(v), sv = Math.sin(v);
        p.push((R + tube * cv) * cu, tube * sv, (R + tube * cv) * su);
        n.push(cv * cu, sv, cv * su);
      }
    }
    for (var j2 = 0; j2 < seg; j2++) {
      for (var k2 = 0; k2 < ring; k2++) {
        var a = j2 * (ring + 1) + k2, b = a + ring + 1;
        i.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return geo(p, n, i);
  }

  var GEOM = null;
  function geometries() {
    if (!GEOM) {
      GEOM = {
        box: box(), sphere: sphere(18, 12), sphereLo: sphere(12, 8),
        cyl: cylinder(24, true), tube: cylinder(16, false),
        cone: cone(18), torus: torus(0.05, 48, 8)
      };
    }
    return GEOM;
  }

  /* ---------------------------------------------------------------- shaders */

  var VS = [
    'precision highp float;',
    'attribute vec3 a_pos; attribute vec3 a_nrm;',
    'attribute vec4 a_m0; attribute vec4 a_m1; attribute vec4 a_m2; attribute vec4 a_m3;',
    'attribute vec4 a_col; attribute vec4 a_ext;',
    'uniform mat4 u_vp; uniform vec3 u_cam;',
    'varying vec3 v_n; varying vec3 v_v; varying vec4 v_c; varying vec3 v_e; varying float v_d;',
    'void main(){',
    '  mat4 M = mat4(a_m0,a_m1,a_m2,a_m3);',
    '  vec4 wp = M * vec4(a_pos,1.0);',
    '  vec3 sc = vec3(length(M[0].xyz), length(M[1].xyz), length(M[2].xyz));',
    '  vec3 nn = a_nrm / max(sc, vec3(1e-4));',
    '  v_n = normalize(mat3(M[0].xyz, M[1].xyz, M[2].xyz) * nn);',
    '  v_v = normalize(u_cam - wp.xyz);',
    '  v_c = a_col; v_e = a_ext.xyz;',
    '  v_d = distance(u_cam, wp.xyz);',
    '  gl_Position = u_vp * wp;',
    '}'
  ].join('\n');

  var FS = [
    'precision highp float;',
    'varying vec3 v_n; varying vec3 v_v; varying vec4 v_c; varying vec3 v_e; varying float v_d;',
    'uniform vec3 u_fog; uniform vec2 u_fogr; uniform float u_alpha;',
    'const vec3 KEY = vec3(0.4174, 0.6957, 0.5843);',
    'const vec3 FILLD = vec3(-0.6860, 0.2286, -0.6907);',
    'void main(){',
    '  vec3 N = normalize(v_n); vec3 V = normalize(v_v);',
    '  if (!gl_FrontFacing) N = -N;',
    '  float ndl = max(dot(N, KEY), 0.0);',
    '  float ndf = max(dot(N, FILLD), 0.0);',
    '  vec3 amb = vec3(0.150, 0.140, 0.128);',
    '  vec3 lit = v_c.rgb * (amb + vec3(1.00,0.94,0.83) * ndl * 0.92 + vec3(0.29,0.41,0.39) * ndf * 0.50);',
    '  vec3 H = normalize(KEY + V);',
    '  lit += vec3(1.0,0.96,0.88) * pow(max(dot(N,H),0.0), 40.0) * 0.30 * (1.0 - v_e.y);',
    '  float rim = pow(1.0 - max(dot(N,V),0.0), 2.6);',
    '  vec3 rimCol = mix(vec3(0.788,0.663,0.381), v_c.rgb * 1.25, v_e.z);',
    '  lit += rimCol * rim * (0.42 + v_e.y);',
    '  lit += v_c.rgb * v_e.x;',
    '  float f = smoothstep(u_fogr.x, u_fogr.y, v_d);',
    '  lit = mix(lit, u_fog, f * 0.9);',
    '  gl_FragColor = vec4(lit, v_c.a * u_alpha);',
    '}'
  ].join('\n');

  /* ----------------------------------------------------------------- meshes */

  var STRIDE = 24; // floats per instance: mat4(16) + rgba(4) + ext(4)

  function Mesh(rd, geometry, capacity, opts) {
    opts = opts || {};
    this.rd = rd;
    this.g = geometry;
    this.cap = capacity;
    this.count = 0;
    this.transparent = !!opts.transparent;
    this.data = new Float32Array(capacity * STRIDE);
    this.visible = true;
    this.depthWrite = opts.depthWrite !== undefined ? opts.depthWrite : !this.transparent;
    this._tmp = M4.create();
    var gl = rd.gl;
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.position, gl.STATIC_DRAW);
    this.nbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normal, gl.STATIC_DRAW);
    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.index, gl.STATIC_DRAW);
    this.inst = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.inst);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    this.nIndex = geometry.index.length;
  }

  Mesh.prototype.clear = function () { this.count = 0; return this; };

  /* One instance. Angles in radians, colour as [r,g,b] 0..1. */
  Mesh.prototype.push = function (px, py, pz, sx, sy, sz, rx, ry, rz, col, alpha, glow, rimBoost, rimTint) {
    if (this.count >= this.cap) return this;
    var o = this.count * STRIDE;
    M4.compose(this._tmp, px, py, pz, rx || 0, ry || 0, rz || 0, sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz);
    this.data.set(this._tmp, o);
    this.data[o + 16] = col[0]; this.data[o + 17] = col[1]; this.data[o + 18] = col[2];
    this.data[o + 19] = alpha === undefined ? 1 : alpha;
    this.data[o + 20] = glow || 0;
    this.data[o + 21] = rimBoost || 0;
    this.data[o + 22] = rimTint || 0;
    this.count++;
    return this;
  };

  /* Aim a unit shape from a to b (used for beams, rails, edges). */
  Mesh.prototype.link = function (a, b, thick, col, alpha, glow, rimBoost, rimTint) {
    var t = aimEuler(a[0], a[1], a[2], b[0], b[1], b[2]);
    return this.push(t.mx, t.my, t.mz, thick, t.len, thick, t.rx, t.ry, 0, col, alpha, glow, rimBoost, rimTint);
  };

  /* Point along a quadratic bezier — the arc every flowing thing here follows. */
  function bez(a, c, b, t) {
    var u = 1 - t;
    return [
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
      u * u * a[2] + 2 * u * t * c[2] + t * t * b[2]
    ];
  }

  Mesh.prototype.upload = function () {
    var gl = this.rd.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.inst);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data.subarray(0, this.count * STRIDE));
  };

  /* Back-to-front sort for the transparent pass. */
  Mesh.prototype.sortByDepth = function (cam) {
    var n = this.count;
    if (n < 2) return;
    var order = [];
    for (var i = 0; i < n; i++) {
      var o = i * STRIDE;
      var dx = this.data[o + 12] - cam[0], dy = this.data[o + 13] - cam[1], dz = this.data[o + 14] - cam[2];
      order.push([dx * dx + dy * dy + dz * dz, i]);
    }
    order.sort(function (a, b) { return b[0] - a[0]; });
    var out = new Float32Array(n * STRIDE);
    for (var k = 0; k < n; k++) out.set(this.data.subarray(order[k][1] * STRIDE, order[k][1] * STRIDE + STRIDE), k * STRIDE);
    this.data.set(out, 0);
  };

  Mesh.prototype.dispose = function () {
    var gl = this.rd.gl;
    [this.vbo, this.nbo, this.inst].forEach(function (b) { gl.deleteBuffer(b); });
    gl.deleteBuffer(this.ibo);
    this.data = null;
  };

  /* --------------------------------------------------------------- renderer */

  function detectSoftware(gl) {
    try {
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (!ext) return false;
      var r = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
      return /swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(r);
    } catch (e) { return false; }
  }

  function Renderer(canvas, opts) {
    opts = opts || {};
    var attrs = { antialias: opts.antialias !== false, alpha: true, depth: true, stencil: false,
      premultipliedAlpha: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false };
    var gl = canvas.getContext('webgl2', attrs);
    this.v2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    if (!gl) throw new Error('WebGL unavailable');
    /* A canvas whose context was lost hands the same dead context back, and a
       dead context links shaders that never work. Refuse it here so the caller
       can rebuild on a fresh canvas. */
    if (gl.isContextLost && gl.isContextLost()) throw new Error('WebGL context lost');
    this.gl = gl;
    this.canvas = canvas;
    this.software = detectSoftware(gl);

    if (this.v2) {
      this.divisor = gl.vertexAttribDivisor.bind(gl);
      this.drawInst = gl.drawElementsInstanced.bind(gl);
    } else {
      var ext = gl.getExtension('ANGLE_instanced_arrays');
      if (!ext) throw new Error('instancing unavailable');
      this.divisor = ext.vertexAttribDivisorANGLE.bind(ext);
      this.drawInst = ext.drawElementsInstancedANGLE.bind(ext);
    }

    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VS); gl.compileShader(vs);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FS); gl.compileShader(fs);
    var pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      throw new Error('shader link failed: ' + (gl.getShaderInfoLog(vs) || '') + (gl.getShaderInfoLog(fs) || '') + gl.getProgramInfoLog(pr));
    }
    gl.deleteShader(vs); gl.deleteShader(fs);
    this.prog = pr;
    this.loc = {
      pos: gl.getAttribLocation(pr, 'a_pos'), nrm: gl.getAttribLocation(pr, 'a_nrm'),
      m0: gl.getAttribLocation(pr, 'a_m0'), m1: gl.getAttribLocation(pr, 'a_m1'),
      m2: gl.getAttribLocation(pr, 'a_m2'), m3: gl.getAttribLocation(pr, 'a_m3'),
      col: gl.getAttribLocation(pr, 'a_col'), ext: gl.getAttribLocation(pr, 'a_ext'),
      vp: gl.getUniformLocation(pr, 'u_vp'), cam: gl.getUniformLocation(pr, 'u_cam'),
      fog: gl.getUniformLocation(pr, 'u_fog'), fogr: gl.getUniformLocation(pr, 'u_fogr'),
      alpha: gl.getUniformLocation(pr, 'u_alpha')
    };
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    this.meshes = [];
    this.vp = M4.create();
    this.proj = M4.create();
    this.view = M4.create();
    this.invVP = M4.create();
    this.fog = PAL.bg.slice();
    this.fogRange = [14, 46];
    this.width = 1; this.height = 1; this.dpr = 1;
  }

  Renderer.prototype.mesh = function (geometry, capacity, opts) {
    var m = new Mesh(this, geometry, capacity, opts);
    this.meshes.push(m);
    return m;
  };

  Renderer.prototype.resize = function (w, h, dpr) {
    this.dpr = dpr;
    this.width = w; this.height = h;
    var cw = Math.max(1, Math.round(w * dpr)), ch = Math.max(1, Math.round(h * dpr));
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw; this.canvas.height = ch;
    }
    this.gl.viewport(0, 0, cw, ch);
  };

  /* Scenes are framed for a wide stage. On a phone the stage is nearly square,
     so widen the vertical field instead of letting the sides fall off the
     canvas — the whole scene stays on screen, just smaller. */
  var REF_ASPECT = 1.75;
  Renderer.prototype.setCamera = function (eye, at, fov, near, far) {
    var aspect = this.width / Math.max(1, this.height);
    var f = (fov || 42) * Math.PI / 180;
    if (aspect < REF_ASPECT) {
      f = 2 * Math.atan(Math.tan(f / 2) * Math.min(REF_ASPECT / aspect, 1.55));
    }
    M4.perspective(this.proj, f, aspect, near || 0.1, far || 200);
    M4.lookAt(this.view, eye, at, [0, 1, 0]);
    M4.multiply(this.vp, this.proj, this.view);
    M4.invert(this.invVP, this.vp);
    this.eye = eye;
  };

  Renderer.prototype._bind = function (m) {
    var gl = this.gl, L = this.loc;
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
    gl.enableVertexAttribArray(L.pos);
    gl.vertexAttribPointer(L.pos, 3, gl.FLOAT, false, 0, 0);
    this.divisor(L.pos, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.nbo);
    gl.enableVertexAttribArray(L.nrm);
    gl.vertexAttribPointer(L.nrm, 3, gl.FLOAT, false, 0, 0);
    this.divisor(L.nrm, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.inst);
    var slots = [L.m0, L.m1, L.m2, L.m3, L.col, L.ext];
    for (var i = 0; i < 6; i++) {
      gl.enableVertexAttribArray(slots[i]);
      gl.vertexAttribPointer(slots[i], 4, gl.FLOAT, false, STRIDE * 4, i * 16);
      this.divisor(slots[i], 1);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo);
  };

  Renderer.prototype.render = function () {
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.loc.vp, false, this.vp);
    gl.uniform3fv(this.loc.cam, this.eye);
    gl.uniform3fv(this.loc.fog, this.fog);
    gl.uniform2fv(this.loc.fogr, this.fogRange);
    gl.uniform1f(this.loc.alpha, 1);

    var i, m;
    gl.depthMask(true);
    for (i = 0; i < this.meshes.length; i++) {
      m = this.meshes[i];
      if (m.transparent || !m.visible || !m.count) continue;
      m.upload(); this._bind(m);
      this.drawInst(gl.TRIANGLES, m.nIndex, gl.UNSIGNED_SHORT, 0, m.count);
    }
    for (i = 0; i < this.meshes.length; i++) {
      m = this.meshes[i];
      if (!m.transparent || !m.visible || !m.count) continue;
      m.sortByDepth(this.eye);
      gl.depthMask(m.depthWrite);
      m.upload(); this._bind(m);
      this.drawInst(gl.TRIANGLES, m.nIndex, gl.UNSIGNED_SHORT, 0, m.count);
    }
    gl.depthMask(true);
  };

  /* World point → CSS pixels. Returns null when behind the camera. */
  Renderer.prototype.project = function (p) {
    var v = this.vp;
    var x = v[0] * p[0] + v[4] * p[1] + v[8] * p[2] + v[12];
    var y = v[1] * p[0] + v[5] * p[1] + v[9] * p[2] + v[13];
    var w = v[3] * p[0] + v[7] * p[1] + v[11] * p[2] + v[15];
    if (w <= 0.0001) return null;
    return { x: (x / w * 0.5 + 0.5) * this.width, y: (0.5 - y / w * 0.5) * this.height, w: w };
  };

  /* CSS pixels → world ray {o, d}. */
  Renderer.prototype.ray = function (cx, cy) {
    var nx = (cx / this.width) * 2 - 1, ny = 1 - (cy / this.height) * 2;
    var m = this.invVP;
    function un(z) {
      var x = m[0] * nx + m[4] * ny + m[8] * z + m[12];
      var y = m[1] * nx + m[5] * ny + m[9] * z + m[13];
      var w2 = m[2] * nx + m[6] * ny + m[10] * z + m[14];
      var w = m[3] * nx + m[7] * ny + m[11] * z + m[15];
      return [x / w, y / w, w2 / w];
    }
    var a = un(-1), b = un(1);
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    var l = Math.hypot(d[0], d[1], d[2]) || 1;
    return { o: a, d: [d[0] / l, d[1] / l, d[2] / l] };
  };

  Renderer.prototype.dispose = function () {
    var gl = this.gl;
    this.meshes.forEach(function (m) { m.dispose(); });
    this.meshes.length = 0;
    gl.deleteProgram(this.prog);
    try {
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    } catch (e) { /* nothing useful to do */ }
    this.gl = null;
  };

  /* Ray/sphere test used for picking scene features on the CPU. */
  function hitSphere(ray, c, r) {
    var ox = ray.o[0] - c[0], oy = ray.o[1] - c[1], oz = ray.o[2] - c[2];
    var b = ox * ray.d[0] + oy * ray.d[1] + oz * ray.d[2];
    var cc = ox * ox + oy * oy + oz * oz - r * r;
    var disc = b * b - cc;
    if (disc < 0) return -1;
    var t = -b - Math.sqrt(disc);
    return t >= 0 ? t : -1;
  }

  /* ----------------------------------------------------------------- camera */

  function Orbit(rd, host) {
    this.rd = rd;
    this.host = host;
    this.goal = { tx: 0, ty: 0, tz: 0, dist: 12, theta: 0.6, phi: 1.15, fov: 42 };
    this.cur = Object.assign({}, this.goal);
    this.user = false;
    this._bind(host);
  }
  Orbit.prototype.set = function (g, instant) {
    for (var k in g) if (g.hasOwnProperty(k)) this.goal[k] = g[k];
    if (instant) this.cur = Object.assign({}, this.goal);
    this.user = false;
  };
  Orbit.prototype.recentre = function () { this.user = false; };
  Orbit.prototype.update = function (dt) {
    var k = 1 - Math.exp(-6.5 * Math.min(dt, 0.1));
    var g = this.goal, c = this.cur;
    c.tx += (g.tx - c.tx) * k; c.ty += (g.ty - c.ty) * k; c.tz += (g.tz - c.tz) * k;
    c.fov += (g.fov - c.fov) * k;
    if (!this.user) {
      c.dist += (g.dist - c.dist) * k;
      var dth = ((g.theta - c.theta + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      c.theta += dth * k;
      c.phi += (g.phi - c.phi) * k;
    }
    var sp = Math.sin(c.phi), cp = Math.cos(c.phi);
    var eye = [
      c.tx + c.dist * sp * Math.sin(c.theta),
      c.ty + c.dist * cp,
      c.tz + c.dist * sp * Math.cos(c.theta)
    ];
    this.rd.setCamera(eye, [c.tx, c.ty, c.tz], c.fov, 0.1, Math.max(60, c.dist * 6));
    this.eye = eye;
  };
  Orbit.prototype.dispose = function () {
    var el = this.host, h = this._handlers || {};
    for (var k in h) if (h.hasOwnProperty(k)) el.removeEventListener(k.split('#')[0], h[k]);
    this._handlers = {};
  };
  Orbit.prototype._bind = function (el) {
    var self = this, pts = {}, n = 0, last = null, pinch = 0;
    var H = this._handlers = {};
    function on(type, fn, opts) { H[type + '#' + Object.keys(H).length] = fn; el.addEventListener(type, fn, opts); }
    function pos(e) { return { x: e.clientX, y: e.clientY }; }
    on('pointerdown', function (e) {
      pts[e.pointerId] = pos(e); n++;
      last = pos(e);
      if (n === 2) { var k = Object.keys(pts); pinch = dist2(pts[k[0]], pts[k[1]]); }
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* not fatal */ }
    });
    function dist2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    on('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      var p = pos(e);
      if (n >= 2) {
        var k = Object.keys(pts);
        pts[e.pointerId] = p;
        var d = dist2(pts[k[0]], pts[k[1]]);
        if (pinch) {
          self.cur.dist = clamp(self.cur.dist * (pinch / (d || 1)), 3, 60);
          self.user = true;
        }
        pinch = d;
        e.preventDefault();
        return;
      }
      pts[e.pointerId] = p;
      var dx = p.x - last.x, dy = p.y - last.y;
      last = p;
      if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) return;
      self.cur.theta -= dx * 0.007;
      /* Touch keeps vertical drags for page scroll (touch-action: pan-y), so
         only a mouse or pen may change pitch with one pointer. */
      if (e.pointerType !== 'touch') self.cur.phi = clamp(self.cur.phi - dy * 0.006, 0.18, Math.PI - 0.18);
      self.user = true;
    });
    function up(e) { if (pts[e.pointerId]) { delete pts[e.pointerId]; n = Math.max(0, n - 1); } if (n < 2) pinch = 0; }
    on('pointerup', up);
    on('pointercancel', up);
    on('pointerleave', up);
    on('wheel', function (e) {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      self.cur.dist = clamp(self.cur.dist * (1 + Math.sign(e.deltaY) * 0.12), 3, 60);
      self.user = true;
    }, { passive: false });
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOut5(t) { return 1 - Math.pow(1 - t, 5); }
  /* A small overshoot on arrival — things settle rather than stop dead. */
  function back(t) {
    if (t <= 0) return 0; if (t >= 1) return 1;
    var c = 1.70158, c3 = c + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }
  /* Damped spring settle, for lids clamping shut and liquid finding its level. */
  function settle(t, freq, damp) {
    if (t <= 0) return 0; if (t >= 1) return 1;
    return 1 - Math.exp(-(damp || 6) * t) * Math.cos((freq || 11) * t);
  }
  function sat(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  /* Stagger helper: element i of n over [0,1], each taking `span` of the window. */
  function stag(t, i, n, span) {
    span = span || 0.45;
    var start = (n <= 1) ? 0 : (i / (n - 1)) * (1 - span);
    return sat((t - start) / span);
  }
  /* Deterministic pseudo-random: same scene every reload, no surprises. */
  function rnd(i, s) {
    var x = Math.sin((i + 1) * 127.1 + (s || 0) * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function mixc(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

  /* ----------------------------------------------------------------- labels */

  function Labels(layer) { this.layer = layer; this.items = []; }
  Labels.prototype.add = function (text, cls) {
    var el = document.createElement('div');
    el.className = 'l3d ' + (cls || '');
    el.innerHTML = text;
    this.layer.appendChild(el);
    var it = { el: el, p: [0, 0, 0], on: true, off: [0, 0], scaleFade: true };
    this.items.push(it);
    return it;
  };
  Labels.prototype.update = function (rd) {
    var avoid = [];
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      it._vis = false;
      if (!it.on) { it.el.style.opacity = '0'; it.el.style.visibility = 'hidden'; continue; }
      var s = rd.project(it.p);
      if (!s) { it.el.style.opacity = '0'; it.el.style.visibility = 'hidden'; continue; }
      it._x = s.x + it.off[0];
      it._y = s.y + it.off[1];
      it._o = it.scaleFade ? sat(1.25 - s.w / 46) : 1;
      it._vis = true;
      if (it.avoid) {
        if (!it._w) it._w = Math.max(40, it.el.offsetWidth || 60);
        avoid.push(it);
      }
    }
    /* Stack overlapping labels downward, nearest-to-top first. Nine fund names
       in one cloud are unreadable piled on each other, and a dozen pixels of
       nudge costs nothing. */
    if (avoid.length > 1) {
      avoid.sort(function (a, b) { return a._y - b._y; });
      for (var k = 1; k < avoid.length; k++) {
        var cur = avoid[k];
        for (var j = 0; j < k; j++) {
          var prev = avoid[j];
          if (Math.abs(cur._x - prev._x) > (cur._w + prev._w) * 0.5) continue;
          if (cur._y - prev._y >= 16) continue;
          cur._y = prev._y + 16;
        }
      }
    }
    for (var m = 0; m < this.items.length; m++) {
      var q = this.items[m];
      if (!q._vis) continue;
      q.el.style.visibility = 'visible';
      q.el.style.transform = 'translate3d(' + q._x.toFixed(1) + 'px,' + q._y.toFixed(1) + 'px,0) translate(-50%,-50%)';
      q.el.style.opacity = String(q._o);
    }
  };
  /* Widths are cached; call this when a label's text changes shape. */
  Labels.prototype.remeasure = function () {
    for (var i = 0; i < this.items.length; i++) this.items[i]._w = 0;
  };
  Labels.prototype.dispose = function () {
    this.items.forEach(function (i) { if (i.el.parentNode) i.el.parentNode.removeChild(i.el); });
    this.items.length = 0;
  };

  root.MF3D = root.MF3D || {};
  root.MF3D.gl = {
    M4: M4, PAL: PAL, geometries: geometries, Renderer: Renderer, Orbit: Orbit,
    Labels: Labels, hitSphere: hitSphere, aimEuler: aimEuler,
    clamp: clamp, lerp: lerp, ease: ease, easeOut: easeOut, easeOut5: easeOut5,
    back: back, settle: settle, stag: stag, bez: bez, sat: sat, rnd: rnd, mixc: mixc,
    hex: hex
  };
})(window);
