const vec3 = glMatrix.vec3
const mat4 = glMatrix.mat4
const quat = glMatrix.quat
function main(images) {

  document.body.removeChild(document.querySelector('canvas'));

  const canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  document.body.appendChild(canvas);

  const gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }

  var AMORTIZATION = 1;
  var drag = false;
  var old_x, old_y;
  var dX = 0, dY = 0;
  var mouseDown = function (e) {
    drag = true;
    old_x = e.pageX;
    old_y = e.pageY;

    e.preventDefault();
    return false;
  };

  var mouseUp = function (e) {
    drag = false;
  };

  var mouseMove = function (e) {
    if (!drag) return false;
    dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width;
    dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;
    THETA += dX;
    PHI += dY;
    old_x = e.pageX, old_y = e.pageY;

    // if (!drag) {
    //   dX *= AMORTIZATION;
    //   dY *= AMORTIZATION;
    // }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(198 / 255, 222 / 255, 183 / 255, 1);

    var degY = radToDeg(dY);
    var degX = radToDeg(dX);
    console.log(degY);
    quat.fromEuler(q, degY, degX, 0);
    mat4.fromQuat(newrot, q);
    mat4.multiply(model, newrot, model);

    var final = mat4.create();
    // mat4.multiply(final, pvm, model);

    gl.uniformMatrix4fv(u_matrix, false, model);
    // gl.uniformMatrix4fv(u_matrix, false, final);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    // gl.drawArrays(gl.TRIANGLES, 0, 48)

    e.preventDefault();
  };

  canvas.addEventListener('mousedown', mouseDown, false);
  canvas.addEventListener('mouseup', mouseUp, false);
  canvas.addEventListener('mouseout', mouseUp, false);
  canvas.addEventListener('mousemove', mouseMove, false);


  const vertexShaderSource = document.getElementById('2d-vertex-shader').text;
  const fragmentShaderSource = document.getElementById('2d-fragment-shader').text;

  const program = gl.createProgram();

  const vShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vShader, vertexShaderSource);
  gl.compileShader(vShader);

  const fShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fShader, fragmentShaderSource);
  gl.compileShader(fShader);

  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);

  gl.useProgram(program);

  var color = gl.getAttribLocation(program, 'color');
  var position = gl.getAttribLocation(program, 'position');
  var u_matrix = gl.getUniformLocation(program, 'u_matrix');
  gl.enableVertexAttribArray(color);
  gl.enableVertexAttribArray(position);

  var multiplier = 1;
  const width = canvas.clientWidth * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  var vertexData = [
    // x,    y,    z
    // front face (z: +1)
    .5, .5, .5, // top right
    -.5, .5, .5, // top left
    -.5, -.5, .5, // bottom left
    .5, -.5, .5, // bottom right
    // right face (x: +1)
    .5, .5, -.5, // top right
    .5, .5, .5, // top left
    .5, -.5, .5, // bottom left
    .5, -.5, -.5, // bottom right
    // top face (y: +1)
    .5, .5, -.5, // top right
    -.5, .5, -.5, // top left
    -.5, .5, .5, // bottom left
    .5, .5, .5, // bottom right
    // left face (x: -1)
    -.5, .5, .5, // top right
    -.5, .5, -.5, // top left
    -.5, -.5, -.5, // bottom left
    -.5, -.5, .5, // bottom right
    // bottom face (y: -1)
    .5, -.5, .5, // top right
    -.5, -.5, .5, // top left
    -.5, -.5, -.5, // bottom left
    .5, -.5, -.5, // bottom right
    // back face (z: -1)
    -.5, .5, -.5, // top right
    .5, .5, -.5, // top left
    .5, -.5, -.5, // bottom left
    -.5, -.5, -.5  // bottom right
  ];

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,

      1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,

      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,

      1.0, 0.5, 0.5,
      1.0, 0.5, 0.5,
      1.0, 0.5, 0.5,
      1.0, 0.5, 0.5,

      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 0.0, 1.0,

      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0
    ]),
    gl.STATIC_DRAW
  );

  var vertexIndexData = [
    0, 1, 2, 0, 2, 3,    // Front face
    4, 5, 6, 4, 6, 7,    // Back face
    8, 9, 10, 8, 10, 11,  // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23  // Left face
  ];
  var vertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndexData), gl.STATIC_DRAW);


  var fovy = degToRad(40);
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var near = 0.1;
  var far = -10;
  var radius = 10;
  var up = [0, 1, 0];
  var time_old = 0;
  var THETA = 0;
  var PHI = 0;

  var eye = vec3.fromValues(0, 5, radius * 1.5);
  var target = vec3.fromValues(0, 0, 0);
  var up = vec3.fromValues(0, 1, 0);
  var vm = mat4.create();
  var pvm = mat4.create();
  var q = quat.create();
  var newrot = mat4.create();
  var model = mat4.create();
  // mat4.translate(model, model, [0, 0, -12])

  // 1. perspective matrix
  // mat4.perspective(pvm, fovy, aspect, near, far);
  // 2. view matrix
  // mat4.lookAt(vm, eye, target, up);
  // mat4.multiply(pvm, pvm, vm);

  // requestAnimationFrame(render);
  render()

  // Draw the scene.
  function render(time) {
    // var dt = time - time_old;
    if (!drag) {
      dX *= AMORTIZATION;
      dY *= AMORTIZATION;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(198 / 255, 222 / 255, 183 / 255, 1);

    var degY = radToDeg(dY);
    var degX = radToDeg(dX);
    quat.fromEuler(q, degY, degX, 0);
    mat4.fromQuat(newrot, q);
    mat4.multiply(model, newrot, model);

    // var final = mat4.create();
    // mat4.multiply(final, pvm, model);

    gl.uniformMatrix4fv(u_matrix, false, model);
    // gl.uniformMatrix4fv(u_matrix, false, final);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    // gl.drawArrays(gl.TRIANGLES, 0, 36)
  }
}


function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

main();