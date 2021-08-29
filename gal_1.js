// We will put our WebGL code here
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
	throw new Error('WebGL not supported');
}        

//vertices
//GOOD IDEA TO KEEP THESE TYPES GENERIC THEN USE FLOAT32ARRY ON THEM IN BUFFER DATA SPECIFIERS below
//fucking javascript i swear

// const verticesData = [
	// 0, 1, 0, // First vertex
	// 1, -1, 0, // Second vertex
	// -1, -1, 0  // Third vertex
// ];

const verticesData = [

	//SHAMELESSCOPYPASTE from https://github.com/invent-box/Learn-WebGL/blob/master/06-Box/public/main.js
    // Front
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, -.5, 0.5,

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Bottom
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,


];

//color data in rgb
// const colorData = [
	// 1,0,0, //this is just r then g then b
	// 0,1,0, //each vertex is going to get one triplet of values in array that are rbg values
	// 0,0,1,
// ];

function randomColor(){
	return [Math.random(),Math.random(),Math.random()];
	
}

//color data with random function
// let colorData = [
	// ...randomColor(),
	// ...randomColor(),
	// ...randomColor(),
// ];

//randomize color for cube vertexes
let colorData = []; //weird JS array nonsense

for (let face = 0; face < 6; face++){
	let faceColor = randomColor();
	//this is overwriting two vertices color twice
	//6 vertices
	//*		**
	//	 
	//**	*
	for(let vertex = 0; vertex < 6; vertex++){
		colorData.push(...faceColor);
		
	}
	
}




//set up buffers

// Create the GPU array buffer with the vertices
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);          
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesData), gl.STATIC_DRAW);


// Create the GPU array buffer with color data for the vertices
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);           
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);




//declare shaders
const vs = gl.createShader(gl.VERTEX_SHADER);


//varying can be shared between vertex and fragmentShader
//uniforms are global vars

//to update during run, feed data into uniform
const vertexShaderText = `
	precision mediump float;
	attribute vec3 position;
	attribute vec3 color;
	varying vec3 vColor;
	
	uniform mat4 matrix;
	
	void main() {
		vColor = color;
		gl_Position = matrix * vec4(position,1);
	}`;
	
//gl_Position is output of vertex shader

const fs = gl.createShader(gl.FRAGMENT_SHADER);
const fragmentShaderText = `
	precision mediump float;
	varying vec3 vColor;
	void main() {
		gl_FragColor = vec4(vColor,1);
	}`;


//compile shaders
//shader source takes in string containing GLSL code


gl.shaderSource(vs, vertexShaderText);
gl.compileShader(vs);
console.log(gl.getShaderInfoLog(vs));


gl.shaderSource(fs, fragmentShaderText);
gl.compileShader(fs);
console.log(gl.getShaderInfoLog(fs));

//shaders must be compiled, and then linked to active gl program
// Create and initialize the WebGL program
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
//shaders have been attached to program

//https://docs.gl/gl4/glLinkProgram
//linking vertex and shader functions to program
gl.linkProgram(program);


// Shader attribute variable for position
//matches position attribute in vertex shader
const positionLocation = gl.getAttribLocation(program, `position`);
//attribute comes disabled
//must enable it with the location
gl.enableVertexAttribArray(positionLocation);
//opengl has generic attributes that your customer attributes
//must be attached to through the ___AttribPointer commands
//must bindBuffer again before running gl.vertexAttrib
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);        
//set pointer for vertices
gl.vertexAttribPointer(
	positionLocation, // Target
	3,        // Chunk size (send the values 3 by 3)
	gl.FLOAT, // Type
	false,    // Normalize
	0,        // Stride
	0         // Offset
);


//do same thing for color attribs
const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);       
//bind buffer again as current array buffer
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);        
//set pointer for colors
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);



//https://docs.gl/gl4/glUseProgram
//installs program into current rendering state
//creates the executable program on the GPU
gl.useProgram(program);

//enable depth testing
gl.enable(gl.DEPTH_TEST);




/// **NOW** is when we can feed in data for rotation 


const uniformLocations = {
	matrix: gl.getUniformLocation(program, `matrix`),
};

// const iDmatrix = [1,0,0,0
//                    0,1,0,0
//                   0,0,1,0
//                   0,0,0,0]; //this literally does nothing 
				  
//screw linear algebra, that stuff is for nerds
//use glMatrix https://glmatrix.net/docs/
//make 4D matrix
//mat4translate(out, in, vector)
//mat4translate(output, input, [x,y,z] vector)
//out gets the data of acting upon your input matrix with  your vector
//must call using glMatrix. prefix

const modelMatrix = glMatrix.mat4.create();
const viewMatrix = glMatrix.mat4.create();
//perspective
const projectionMatrix = glMatrix.mat4.create();

//intermediate model-view matrix
const mvMatrix = glMatrix.mat4.create();

//final matrix that prior transformation operations are combined into
//model-view-projection Matrix
const mvpMatrix = glMatrix.mat4.create();



glMatrix.mat4.perspective(projectionMatrix,
	(75 / 180) * Math.PI, //v fov in radians
	canvas.width / canvas.height, //aspect ratio
	1e-4, //near cull plane / distance at which object can get close before they clip out, this is exponential notation
	1e4	//far cull plane, this is draw distance a-la PS1 silent hill
)


//shift modelMatrix away with translation
glMatrix.mat4.translate(modelMatrix, modelMatrix,[-.5,-0.5,-1.5]);

//use diffferent transformations
//make it fit in the window
glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);

//translate view matrix
//shift modelMatrix away with translation
glMatrix.mat4.translate(viewMatrix, viewMatrix, [1,1,1]);
glMatrix.mat4.invert(viewMatrix,viewMatrix);






//renderloop
function renderLoop() {
	requestAnimationFrame(renderLoop);
	
	//set background color
	// Set the clear color
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Clear canvas
	// clears out background
	gl.clear(gl.COLOR_BUFFER_BIT);		
	
	//rotation
	//glMatrix.mat4.rotateZ(matrix,matrix, 2/ 360);
	//glMatrix.mat4.rotateX(matrix,matrix, 2/ 360);
	glMatrix.mat4.rotateY(modelMatrix,modelMatrix, 2/ 720);
	console.log(modelMatrix);
	
	glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
	
	
	// apply tranformation from two other matrices to final matrix
	glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
	
	gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
	
	// Render
	gl.drawArrays(
		gl.TRIANGLES, // Mode
		0,            // Start
		verticesData.length / 3 //changed so this autocomputes number of triangles
	);
					// we have X elements in our array,
					//when COUNT = 3
					//that means we take 0 for x, 1 for y, 2 for z, then start overflow
					//so (arraysize) / count = # of vertexes
					
				


}

//run renderLoop

renderLoop();



