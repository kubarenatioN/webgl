const mat4 = glMatrix.mat4
const quat = glMatrix.quat
const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')

const canvasState = {
  canvas,
  angle: {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0
  },
  mouse: {
    lastX: -1,
    lastY: -1
  },
  isDragging: false,
  delta: 2*Math.PI
}

const rotateBtnY = document.getElementById('rotateY')
const rotateRangeY = document.getElementById('rotateYrange')

if(!gl) throw new Error('Your browser not support WebGL ;(')

// PLAN
// vertexData = [...]

// create buffer
// load vertexData into buffer

// create vertex shader
// create fragment shader 
// create a program 
// attach shaders to the propgram 

// enable vertex attributes 

// draw


const vertexData = [

  // Front
  -.5, -.5, .5,
  0, .5, 0,
  .5, -.5, .5,

  // Left
  -.5, -.5, -.5,
  0, .5, 0,
  -.5, -.5, .5,

  // Right
  .5, -.5, .5,
  0, .5, 0,
  .5, -.5, -.5,

  // Back
  -.5, -.5, -.5,
  0, .5, 0,
  .5, -.5, -.5,

  // Bottom
  -.5, -.5, -.5,
  .5, -.5, -.5,
  .5, -.5, .5,

  -.5, -.5, -.5,
  .5, -.5, .5,
  -.5, -.5, .5,
]

function generateVertexColor(){
  return [Math.random(), Math.random(), Math.random()]
}

// filling faces with random colors
let colorData = []
for (let face = 0; face < 4; face++) {
  const faceColor = generateVertexColor()
  for (let j = 0; j < 3; j++) {
    colorData.push(...faceColor)
  }
}
const bottomColor = generateVertexColor()
for (let j = 0; j < 6; j++) {
  colorData.push(...bottomColor)
}

// create a buffer
const positionBuffer = gl.createBuffer()

// bind it to the context
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// load data into a buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

// create a color buffer
const colorBuffer = gl.createBuffer()
// bind it to the context
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
// load data into a buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW)



// write shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, `
precision mediump float;
attribute vec3 position;
attribute vec3 color;

varying vec3 vColor;

uniform mat4 matrix;
uniform vec2 u_rotation;

void main(){
  vColor = color;
  gl_Position = matrix * vec4(position, 1);
}
`)
gl.compileShader(vertexShader)

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 vColor;

void main(){
  gl_FragColor = vec4(vColor, 1);
}
`)
gl.compileShader(fragmentShader)


// create a program
const program = gl.createProgram()
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)


// enable attributes
const positionLocation = gl.getAttribLocation(program, `position`)
gl.enableVertexAttribArray(positionLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

const colorLocation = gl.getAttribLocation(program, `color`)
gl.enableVertexAttribArray(colorLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0)

gl.useProgram(program)
gl.enable(gl.DEPTH_TEST)

const uniformLocations = {
  matrix: gl.getUniformLocation(program, 'matrix'),
  u_rotation: gl.getUniformLocation(program, 'u_rotation')
}

// execute resizing
resizer()

InitListeners()

const q = quat.create()
const matrix = mat4.create()
// helper matrix for quaternions
const newrot = mat4.create()

mat4.scale(matrix, matrix, [1, 1, 1])
mat4.rotateX(matrix, matrix, degToRad(-10))
mat4.rotateY(matrix, matrix, degToRad(-20))
gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix)
// console.log(matrix);
gl.drawArrays(gl.TRIANGLES, 0, 18)


function animate(){
  requestAnimationFrame(animate);
  mat4.rotateZ(matrix, matrix, Math.PI / 720)
  mat4.rotateY(matrix, matrix, Math.PI / 180)
  gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix)
  gl.drawArrays(gl.TRIANGLES, 0, 18)
}
// animate()

function drawPyramid(degY, degX){
  mat4.rotateX(matrix, matrix, -degY / 100)
  mat4.rotateY(matrix, matrix, -degX / 100)

  gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix)
  gl.drawArrays(gl.TRIANGLES, 0, 18)
}

function InitListeners(){
  canvas.addEventListener('mousedown', mousedown)
  canvas.addEventListener('mouseup', mouseup)
  canvas.addEventListener('mouseout', mouseup)
  canvas.addEventListener('mousemove', mousemove)
}

function mousedown(e){
  // mouse position on mousedown
  const x = e.clientX
  const y = e.clientY
  const rect = e.target.getBoundingClientRect()

  // if we mousedown within canvas 
  if(rect.left < x && x < rect.right && rect.top < y && y < rect.bottom){
    canvasState.mouse.lastX = x
    canvasState.mouse.lastY = y
    canvasState.isDragging = true
  }
}

function mouseup(){
  canvasState.isDragging = false
}

function mousemove(e){
  if (!canvasState.isDragging) return

  canvasState.angle.x = canvasState.delta * (e.clientX - canvasState.mouse.lastX) / canvas.width;
  canvasState.angle.y = canvasState.delta * (e.clientY - canvasState.mouse.lastY) / canvas.height;
  
  canvasState.mouse.lastX = e.clientX
  canvasState.mouse.lastY = e.clientY

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const degY = radToDeg(canvasState.angle.y);
  const degX = radToDeg(canvasState.angle.x);

  quat.fromEuler(q, -degY, -degX, 0);
  mat4.fromQuat(newrot, q);
  mat4.multiply(matrix, newrot, matrix);

  gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix)

  gl.drawArrays(gl.TRIANGLES, 0, 18)
  
  // drawPyramid(degY, degX)
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

// canvas size fixes
function resizer() {
  const size = Math.min(window.innerWidth, window.innerHeight)
  canvas.width = size
  canvas.height = size
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}
window.addEventListener('resize', resizer)

const m4 = {
  yRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  xRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

}

function rotateY(angle){
  mat4.rotateY(matrix, matrix, degToRad(angle))
  gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix)
  gl.drawArrays(gl.TRIANGLES, 0, 18)
}
function rotateYTo(angle){

  const matrix = m4.xRotation(degToRad(-10))
  const xRotMatrix = m4.yRotation(degToRad(angle))
  mat4.multiply(matrix, matrix, xRotMatrix)

  gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix)

  gl.drawArrays(gl.TRIANGLES, 0, 18)
}

rotateBtnY.addEventListener('click', () => rotateY(10))

rotateRangeY.addEventListener('input', () => rotateYTo(rotateRangeY.value))