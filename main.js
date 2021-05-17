const mat4 = glMatrix.mat4
const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')

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
  0,   1,  0,
  1,  -1,  0,
  -1, -1,  0,
]

const colorData = [
  1, 0, 1,
  0, 1, 0,
  0, 1, 1,
]

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

const uniformLocations = {
  matrix: gl.getUniformLocation(program, 'matrix')
}

const matrix = mat4.create()
mat4.scale(matrix, matrix, [.5, .5, .5])

function animate(){
  requestAnimationFrame(animate);
  mat4.rotateZ(matrix, matrix, Math.PI / 360)
  gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

animate()

// mat4.translate(matrix, matrix, [.4, .1, .3])
// mat4.rotateZ(matrix, matrix, Math.PI/2*1)
// mat4.scale(matrix, matrix, [.3, .8, 1])

// gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix)

// gl.drawArrays(gl.TRIANGLES, 0, 3)