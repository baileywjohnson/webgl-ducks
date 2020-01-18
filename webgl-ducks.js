"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;
var instanceMatrix;
var modelViewMatrixLoc;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

var lightPosition = vec4(-1.0, -1.0, 3.0, 0.0 );
var lightAmbient = vec4(0.9, 0.9, 0.9, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 0.0, 1.0 );

//"copper"
var materialAmbient = vec4( 0.19125, 0.0735, 0.0225, 1.0 );
var materialDiffuse = vec4( 0.7038, 0.27048, 0.0828, 1.0);
var materialSpecular = vec4( 0.628281, 0.555802, 0.366065, 1.0 );
var materialShininess = 10.0;

//"white plastic"
var materialAmbient_dbody = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse_dbody = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular_dbody = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess_dbody = 15.0;


var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

//Human Dimensions
var torsoHeight = 5.0;
var torsoWidth  = 2.0;
var upperArmHeight = 2.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.7;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.7;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth  = 1.0;

//Duck Dimensions
var torsoHeight_d1 = 2.0;
var torsoWidth_d1  = 1.0;
var upperArmHeight_d1 = 0.7;
var lowerArmHeight_d1 = 0.7;
var upperArmWidth_d1  = 0.3;
var lowerArmWidth_d1  = 0.3;
var upperLegWidth_d1  = 0;
var lowerLegWidth_d1  = 0;
var lowerLegHeight_d1 = 0;
var upperLegHeight_d1 = 0;
var headHeight_d1 = 0.8;
var headWidth_d1  = 1.0;

var numNodes = 10;
var numAngles = 11;

//Human
var theta = [-60, 195, 180, 0, 180, 0, 180, 0, 180, 0, 0];
var stack = [];
var figure = [];

//Duck 1
var theta_d1 = [75, 0, -90, 0, -90, 0, -90, 0, -90, 0, 0];
var stack_d1 = [];
var figure_d1 = [];

//Duck 2
var theta_d2 = [75, 0, -90, 0, -90, 0, -90, 0, -90, 0, 0];
var stack_d2 = [];
var figure_d2 = [];

//Duck 3
var theta_d3 = [75, 0, -90, 0, -90, 0, -90, 0, -90, 0, 0];
var stack_d3 = [];
var figure_d3 = [];

//Human
for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);
//Duck 1
for( var i=0; i<numNodes; i++) figure_d1[i] = createNode(null, null, null, null);
//Duck 2
for( var i=0; i<numNodes; i++) figure_d2[i] = createNode(null, null, null, null);
//Duck 3
for( var i=0; i<numNodes; i++) figure_d3[i] = createNode(null, null, null, null);

var vBuffer, nBuffer;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];

var call = false;
var feed = false;
var shoo = false;
var scare = false;
var run = false;

var frame_count = 0;

var human_x = 6.5;
var human_y = -5;
var human_tilt = 0;
var duck_tilt = 90;

//Duck 1 Position
var d1_x = -8;
var d1_y = -8.25;

//Duck 2 Position
var d2_x = -8.95;
var d2_y = -5.85;

//Duck 3 Position
var d3_x = -8;
var d3_y = -3.35;

var ambientProduct;
var diffuseProduct;
var specularProduct;

var ambientProduct_dbody;
var diffuseProduct_dbody;
var specularProduct_dbody;


//-------------------------------------------
function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}
//--------------------------------------------

function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}

//Human
function initNodes(Id) {

    var m = mat4();

    switch(Id) {

        case torsoId:
            //m = translate(human_x, human_y, 0.0);
            m = translate(human_x, human_y, 0.0);
    		m = mult(m, rotate(theta[torsoId], 0, 1, 0 ));
            m = mult(m, rotate(human_tilt, 1, 0, 0 ));
    		figure[torsoId] = createNode( m, torso, null, headId );
        break;

        case headId:
        case head1Id:
        case head2Id:
    		m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
    		m = mult(m, rotate(theta[head1Id], 1, 0, 0))
    		m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    		m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    		figure[headId] = createNode( m, head, leftUpperArmId, null);
        break;

        case leftUpperArmId:
    		m = translate(-(torsoWidth/1.75), 0.95*torsoHeight, 0.0);
    		m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
    		figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
        break;

        case rightUpperArmId:
    		m = translate(torsoWidth/1.75, 0.95*torsoHeight, 0.0);
    		m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
    		figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
        break;

        case leftUpperLegId:
    		m = translate(-(torsoWidth/2.0), 0.1*upperLegHeight, 0.0);
    		m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
    		figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
        break;

        case rightUpperLegId:
    		m = translate(torsoWidth/2.0, 0.1*upperLegHeight, 0.0);
    		m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    		figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
        break;

        case leftLowerArmId:
    		m = translate(0.0, upperArmHeight, 0.0);
    		m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    		figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
        break;

        case rightLowerArmId:
    		m = translate(0.0, upperArmHeight, 0.0);
    		m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    		figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
        break;

        case leftLowerLegId:
    		m = translate(0.0, upperLegHeight, 0.0);
    		m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    		figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
        break;

        case rightLowerLegId:
    		m = translate(0.0, upperLegHeight, 0.0);
    		m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    		figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
        break;

    }
}

//Duck 1
function initNodes_d1(Id){
    var m = mat4();

    switch(Id) {

        case torsoId:
            //m = translate(human_x, human_y, 0.0);
            m = translate(d1_x, d1_y, 0.0);
            m = mult(m, rotate(theta_d1[torsoId], 0, 1, 0 ));
            m = mult(m, rotate(180, 0, 0, 1 ));
            m = mult(m, rotate(duck_tilt, 1, 0, 0 ));
            figure_d1[torsoId] = createNode( m, torso_d1, null, headId );
        break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight_d1+0.5*headHeight_d1, 0.0);
            m = mult(m, rotate(theta_d1[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta_d1[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5*headHeight_d1, 0.5));
            figure_d1[headId] = createNode( m, head_d1, leftUpperArmId, null);
        break;

        case leftUpperArmId:
            m = translate(-(torsoWidth_d1/1.75), 0.95*torsoHeight_d1, 0.0);
            m = mult(m, rotate(theta_d1[leftUpperArmId], 1, 0, 0));
            m = mult(m, translate(0.0, 0.0, -0.75));
            figure_d1[leftUpperArmId] = createNode( m, leftUpperArm_d1, rightUpperArmId, leftLowerArmId );
        break;

        case rightUpperArmId:
            m = translate(torsoWidth_d1/1.75, 0.95*torsoHeight_d1, 0.0);
            m = mult(m, rotate(theta_d1[rightUpperArmId], 1, 0, 0));
            m = mult(m, translate(0.0, 0.0, -0.75));
            figure_d1[rightUpperArmId] = createNode( m, rightUpperArm_d1, leftUpperLegId, rightLowerArmId );
        break;

        case leftUpperLegId:
            m = translate(-(torsoWidth_d1/2.0), 0.1*upperLegHeight_d1, 0.0);
            m = mult(m , rotate(theta_d1[leftUpperLegId], 1, 0, 0));
            figure_d1[leftUpperLegId] = createNode( m, leftUpperLeg_d1, rightUpperLegId, leftLowerLegId );
        break;

        case rightUpperLegId:
            m = translate(torsoWidth_d1/2.0, 0.1*upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d1[rightUpperLegId], 1, 0, 0));
            figure_d1[rightUpperLegId] = createNode( m, rightUpperLeg_d1, null, rightLowerLegId );
        break;

        case leftLowerArmId:
            m = translate(0.0, upperArmHeight_d1, 0.0);
            m = mult(m, rotate(theta_d1[leftLowerArmId], 1, 0, 0));
            figure_d1[leftLowerArmId] = createNode( m, leftLowerArm_d1, null, null );
        break;

        case rightLowerArmId:
            m = translate(0.0, upperArmHeight_d1, 0.0);
            m = mult(m, rotate(theta_d1[rightLowerArmId], 1, 0, 0));
            figure_d1[rightLowerArmId] = createNode( m, rightLowerArm_d1, null, null );
        break;

        case leftLowerLegId:
            m = translate(0.0, upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d1[leftLowerLegId], 1, 0, 0));
            figure_d1[leftLowerLegId] = createNode( m, leftLowerLeg_d1, null, null );
        break;

        case rightLowerLegId:
            m = translate(0.0, upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d1[rightLowerLegId], 1, 0, 0));
            figure_d1[rightLowerLegId] = createNode( m, rightLowerLeg_d1, null, null );
        break;

    }
}
//Duck 2
function initNodes_d2(Id){
    var m = mat4();

    switch(Id) {

        case torsoId:
            //m = translate(human_x, human_y, 0.0);
            m = translate(d2_x, d2_y, 0.0);
            m = mult(m, rotate(theta_d2[torsoId], 0, 1, 0 ));
            m = mult(m, rotate(180, 0, 0, 1 ));
            m = mult(m, rotate(duck_tilt, 1, 0, 0 ));
            figure_d2[torsoId] = createNode( m, torso_d1, null, headId );
        break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight_d1+0.5*headHeight_d1, 0.0);
            m = mult(m, rotate(theta_d2[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta_d2[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5*headHeight_d1, 0.5));
            figure_d2[headId] = createNode( m, head_d1, leftUpperArmId, null);
        break;

        case leftUpperArmId:
            m = translate(-(torsoWidth_d1/1.75), 0.95*torsoHeight_d1, 0.0);
            m = mult(m, rotate(theta_d2[leftUpperArmId], 1, 0, 0));
            m = mult(m, translate(0.0, 0.0, -0.75));
            figure_d2[leftUpperArmId] = createNode( m, leftUpperArm_d1, rightUpperArmId, leftLowerArmId );
        break;

        case rightUpperArmId:
            m = translate(torsoWidth_d1/1.75, 0.95*torsoHeight_d1, 0.0);
            m = mult(m, rotate(theta_d2[rightUpperArmId], 1, 0, 0));
            m = mult(m, translate(0.0, 0.0, -0.75));
            figure_d2[rightUpperArmId] = createNode( m, rightUpperArm_d1, leftUpperLegId, rightLowerArmId );
        break;

        case leftUpperLegId:
            m = translate(-(torsoWidth_d1/2.0), 0.1*upperLegHeight_d1, 0.0);
            m = mult(m , rotate(theta_d2[leftUpperLegId], 1, 0, 0));
            figure_d2[leftUpperLegId] = createNode( m, leftUpperLeg_d1, rightUpperLegId, leftLowerLegId );
        break;

        case rightUpperLegId:
            m = translate(torsoWidth_d1/2.0, 0.1*upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d2[rightUpperLegId], 1, 0, 0));
            figure_d2[rightUpperLegId] = createNode( m, rightUpperLeg_d1, null, rightLowerLegId );
        break;

        case leftLowerArmId:
            m = translate(0.0, upperArmHeight_d1, 0.0);
            m = mult(m, rotate(theta_d2[leftLowerArmId], 1, 0, 0));
            figure_d2[leftLowerArmId] = createNode( m, leftLowerArm_d1, null, null );
        break;

        case rightLowerArmId:
            m = translate(0.0, upperArmHeight_d1, 0.0);
            m = mult(m, rotate(theta_d2[rightLowerArmId], 1, 0, 0));
            figure_d2[rightLowerArmId] = createNode( m, rightLowerArm_d1, null, null );
        break;

        case leftLowerLegId:
            m = translate(0.0, upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d2[leftLowerLegId], 1, 0, 0));
            figure_d2[leftLowerLegId] = createNode( m, leftLowerLeg_d1, null, null );
        break;

        case rightLowerLegId:
            m = translate(0.0, upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d2[rightLowerLegId], 1, 0, 0));
            figure_d2[rightLowerLegId] = createNode( m, rightLowerLeg_d1, null, null );
        break;

    }
}
//Duck 3
function initNodes_d3(Id){
    var m = mat4();

    switch(Id) {

        case torsoId:
            m = translate(d3_x, d3_y, 0.0);
            m = mult(m, rotate(theta_d3[torsoId], 0, 1, 0 ));
            m = mult(m, rotate(180, 0, 0, 1 ));
            m = mult(m, rotate(duck_tilt, 1, 0, 0 ));
            figure_d3[torsoId] = createNode( m, torso_d1, null, headId );
        break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(0.0, torsoHeight_d1+0.5*headHeight_d1, 0.0);
            m = mult(m, rotate(theta_d3[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta_d3[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5*headHeight_d1, 0.5));
            figure_d3[headId] = createNode( m, head_d1, leftUpperArmId, null);
        break;

        case leftUpperArmId:
            m = translate(-(torsoWidth_d1/1.75), 0.95*torsoHeight_d1, 0.0);
            m = mult(m, rotate(theta_d3[leftUpperArmId], 1, 0, 0));
            m = mult(m, translate(0.0, 0.0, -0.75));
            figure_d3[leftUpperArmId] = createNode( m, leftUpperArm_d1, rightUpperArmId, leftLowerArmId );
        break;

        case rightUpperArmId:
            m = translate(torsoWidth_d1/1.75, 0.95*torsoHeight_d1, 0.0);
            m = mult(m, rotate(theta_d3[rightUpperArmId], 1, 0, 0));
            m = mult(m, translate(0.0, 0.0, -0.75));
            figure_d3[rightUpperArmId] = createNode( m, rightUpperArm_d1, leftUpperLegId, rightLowerArmId );
        break;

        case leftUpperLegId:
            m = translate(-(torsoWidth_d1/2.0), 0.1*upperLegHeight_d1, 0.0);
            m = mult(m , rotate(theta_d3[leftUpperLegId], 1, 0, 0));
            figure_d3[leftUpperLegId] = createNode( m, leftUpperLeg_d1, rightUpperLegId, leftLowerLegId );
        break;

        case rightUpperLegId:
            m = translate(torsoWidth_d1/2.0, 0.1*upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d3[rightUpperLegId], 1, 0, 0));
            figure_d3[rightUpperLegId] = createNode( m, rightUpperLeg_d1, null, rightLowerLegId );
        break;

        case leftLowerArmId:
            m = translate(0.0, upperArmHeight_d1, 0.0);
            m = mult(m, rotate(theta_d3[leftLowerArmId], 1, 0, 0));
            figure_d3[leftLowerArmId] = createNode( m, leftLowerArm_d1, null, null );
        break;

        case rightLowerArmId:
            m = translate(0.0, upperArmHeight_d1, 0.0);
            m = mult(m, rotate(theta_d3[rightLowerArmId], 1, 0, 0));
            figure_d3[rightLowerArmId] = createNode( m, rightLowerArm_d1, null, null );
        break;

        case leftLowerLegId:
            m = translate(0.0, upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d3[leftLowerLegId], 1, 0, 0));
            figure_d3[leftLowerLegId] = createNode( m, leftLowerLeg_d1, null, null );
        break;

        case rightLowerLegId:
            m = translate(0.0, upperLegHeight_d1, 0.0);
            m = mult(m, rotate(theta_d3[rightLowerLegId], 1, 0, 0));
            figure_d3[rightLowerLegId] = createNode( m, rightLowerLeg_d1, null, null );
        break;

    }
}

//Human
function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
   modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}
//Duck 1
function traverse_d1(Id){
   if(Id == null){
    return;
   }
   stack_d1.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure_d1[Id].transform);
   figure_d1[Id].render();
   if(figure_d1[Id].child != null){
        traverse_d1(figure_d1[Id].child);
   }
   modelViewMatrix = stack_d1.pop();
   if(figure_d1[Id].sibling != null){
        traverse_d1(figure_d1[Id].sibling);
   }
}
//Duck 2
function traverse_d2(Id){
   if(Id == null) return;
   stack_d2.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure_d2[Id].transform);
   figure_d2[Id].render();
   if(figure_d2[Id].child != null) traverse_d2(figure_d2[Id].child);
   modelViewMatrix = stack_d2.pop();
   if(figure_d2[Id].sibling != null) traverse_d2(figure_d2[Id].sibling);
}
//Duck 3
function traverse_d3(Id){
   if(Id == null) return;
   stack_d3.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure_d3[Id].transform);
   figure_d3[Id].render();
   if(figure_d3[Id].child != null) traverse_d3(figure_d3[Id].child);
   modelViewMatrix = stack_d3.pop();
   if(figure_d3[Id].sibling != null) traverse_d3(figure_d3[Id].sibling);
}


function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function torso_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth_d1, torsoHeight_d1, torsoWidth_d1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight_d1, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth_d1, headHeight_d1, headWidth_d1) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth_d1, upperArmHeight_d1, upperArmWidth_d1) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth_d1, lowerArmHeight_d1, lowerArmWidth_d1) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth_d1, upperArmHeight_d1, upperArmWidth_d1) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth_d1, lowerArmHeight_d1, lowerArmWidth_d1) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth_d1, upperLegHeight_d1, upperLegWidth_d1) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg_d1() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth_d1, lowerLegHeight_d1, lowerLegWidth_d1) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth_d1, upperLegHeight_d1, upperLegWidth_d1) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg_d1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight_d1, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth_d1, lowerLegHeight_d1, lowerLegWidth_d1) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
	 
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
	 pointsArray.push(vertices[b]);
     normalsArray.push(normal);
	 pointsArray.push(vertices[c]);
     normalsArray.push(normal);
	 pointsArray.push(vertices[d]);
     normalsArray.push(normal);
}

function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( .529, .808, .922, 1.0 );

	gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube();

    //Create and Bind Buffer for Normals
	nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    ambientProduct_dbody = mult(lightAmbient, materialAmbient_dbody);
    diffuseProduct_dbody = mult(lightDiffuse, materialDiffuse_dbody);
    specularProduct_dbody = mult(lightSpecular, materialSpecular_dbody);

	//CALL
	document.getElementById("Button1").onclick = function(){
        if(call){
            call = false;

            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);

            theta[leftUpperArmId ] = 180;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = 180;
            initNodes(rightUpperArmId);
            theta[leftLowerArmId ] = 0;
            initNodes(leftLowerArmId);
            theta[rightLowerArmId ] = 0;
            initNodes(rightLowerArmId);

            theta_d1[leftUpperArmId] = -90;
            initNodes_d1(leftUpperArmId);
            theta_d1[rightUpperArmId] = -90;
            initNodes_d1(rightUpperArmId);

            theta_d2[leftUpperArmId] = -90;
            initNodes_d2(leftUpperArmId);
            theta_d2[rightUpperArmId] = -90;
            initNodes_d2(rightUpperArmId);

            theta_d3[leftUpperArmId] = -90;
            initNodes_d3(leftUpperArmId);
            theta_d3[rightUpperArmId] = -90;
            initNodes_d3(rightUpperArmId);

            human_y = -5;
            human_tilt = 0;
            duck_tilt = 90;
            d1_y = -8.25;
            d2_y = -5.85;
            d3_y = -3.35;

            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
            initNodes(torsoId);
        }
        else{
            feed = false;
            scare = false;
            shoo = false;

            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);
            theta[leftUpperArmId ] = 180;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = 180;
            initNodes(rightUpperArmId);
            theta[leftLowerArmId ] = 0;
            initNodes(leftLowerArmId);
            theta[rightLowerArmId ] = 0;
            initNodes(rightLowerArmId);

            human_y = -5;
            human_tilt = 0;
            duck_tilt = 90;
            d1_y = -8.25;
            d2_y = -5.85;
            d3_y = -3.35;
            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
            initNodes(torsoId);

            call = true;
        }
	};
	//FEED
	document.getElementById("Button2").onclick = function(){
        if(feed){
            feed = false;

            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);
            theta[leftUpperArmId ] = 180;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = 180;
            initNodes(rightUpperArmId);
            theta[leftLowerArmId ] = 0;
            initNodes(leftLowerArmId);
            theta[rightLowerArmId ] = 0;
            initNodes(rightLowerArmId);

            human_y = -5;
            human_tilt = 0;
            duck_tilt = 90;
            d1_y = -8.25;
            d2_y = -5.85;
            d3_y = -3.35;
            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
            initNodes(torsoId);
        }
        else{
            call = false;
            scare = false;
            shoo = false;

            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);
            theta[leftUpperArmId ] = 180;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = 180;
            initNodes(rightUpperArmId);
            theta[leftLowerArmId ] = 0;
            initNodes(leftLowerArmId);
            theta[rightLowerArmId ] = 0;
            initNodes(rightLowerArmId);

            human_y = -5;
            human_tilt = 0;
            duck_tilt = 90;
            d1_y = -8.25;
            d2_y = -5.85;
            d3_y = -3.35;
            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
            initNodes(torsoId);

            feed = true;
        }
	};
	//SHOO
	document.getElementById("Button3").onclick = function(){
        if(shoo){
            shoo = false;

            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);
            theta[leftUpperArmId ] = 180;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = 180;
            initNodes(rightUpperArmId);
            theta[leftLowerArmId ] = 0;
            initNodes(leftLowerArmId);
            theta[rightLowerArmId ] = 0;
            initNodes(rightLowerArmId);

            human_y = -5;
            human_tilt = 0;
            duck_tilt = 90;
            d1_y = -8.25;
            d2_y = -5.85;
            d3_y = -3.35;
            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
            initNodes(torsoId);
        }
        else{
            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);

            call = false;
            feed = false;
            scare = false;
            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);
            theta[leftUpperArmId ] = 180;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = 180;
            initNodes(rightUpperArmId);
            theta[leftLowerArmId ] = 0;
            initNodes(leftLowerArmId);
            theta[rightLowerArmId ] = 0;
            initNodes(rightLowerArmId);
            //human_x = 6.5;

            human_y = -5;
            human_tilt = 0;
            duck_tilt = 90;
            d1_y = -8.25;
            d2_y = -5.85;
            d3_y = -3.35;
            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
            initNodes(torsoId);
            shoo = true;
        }
	};
    //SCARE
    document.getElementById("Button4").onclick = function(){
        if(scare){
            scare = false;

            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);
            theta[leftUpperArmId ] = 180;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = 180;
            initNodes(rightUpperArmId);
            theta[leftLowerArmId ] = 0;
            initNodes(leftLowerArmId);
            theta[rightLowerArmId ] = 0;
            initNodes(rightLowerArmId);

            human_y = -5;
            human_tilt = 0;
            duck_tilt = 90;
            d1_y = -8.25;
            d2_y = -5.85;
            d3_y = -3.35;
            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
            initNodes(torsoId);
        }
        else{
            call = false;
            feed = false;
            shoo = false;

            theta[leftLowerLegId ] = 0;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId ] = 0;
            initNodes(rightLowerLegId);
            theta[leftUpperLegId ] = 180;
            initNodes(leftUpperLegId);
            theta[rightUpperLegId ] = 180;
            initNodes(rightUpperLegId);
            theta[leftUpperArmId ] = 180;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = 180;
            initNodes(rightUpperArmId);
            theta[leftLowerArmId ] = 0;
            initNodes(leftLowerArmId);
            theta[rightLowerArmId ] = 0;
            initNodes(rightLowerArmId);
            //human_x = 6.5;

            human_y = -5;
            human_tilt = 0;
            duck_tilt = 90;
            d1_y = -8.25;
            d2_y = -5.85;
            d3_y = -3.35;
            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
            initNodes(torsoId);
            scare = true;
        }
    };
    //RESET
	document.getElementById("Button5").onclick = function(){
	   call = false;
       feed = false;
       shoo = false;
       scare = false;

       human_x = 6.5;
       human_y = -5;
       human_tilt = 0;

       d1_x = -8;
       d2_x = -8.95;
       d3_x = -8;
       d1_y = -8.25;
       d2_y = -5.85;
       d3_y = -3.35;

       theta[leftLowerLegId ] = 0;
       initNodes(leftLowerLegId);
       theta[rightLowerLegId ] = 0;
       initNodes(rightLowerLegId);
       theta[leftUpperLegId ] = 180;
       initNodes(leftUpperLegId);
       theta[rightUpperLegId ] = 180;
       initNodes(rightUpperLegId);
       theta[leftUpperArmId ] = 180;
       initNodes(leftUpperArmId);
       theta[rightUpperArmId ] = 180;
       initNodes(rightUpperArmId);
       theta[leftLowerArmId ] = 0;
       initNodes(leftLowerArmId);
       theta[rightLowerArmId ] = 0;
       initNodes(rightLowerArmId);

       theta_d1[leftUpperArmId] = -90;
       initNodes_d1(leftUpperArmId);
       theta_d1[rightUpperArmId] = -90;
       initNodes_d1(rightUpperArmId);
       theta_d1[torsoId ] = 75;
       initNodes_d1(leftUpperArmId);

       theta_d2[leftUpperArmId] = -90;
       initNodes_d2(leftUpperArmId);
       theta_d2[rightUpperArmId] = -90;
       initNodes_d2(rightUpperArmId);
       theta_d2[torsoId ] = 75;
       initNodes_d2(leftUpperArmId);

       theta_d3[leftUpperArmId] = -90;
       initNodes_d3(leftUpperArmId);
       theta_d3[rightUpperArmId] = -90;
       initNodes_d3(rightUpperArmId);
       theta_d3[torsoId ] = 75;
       initNodes_d3(leftUpperArmId);

       initNodes(torsoId);
       initNodes_d1(torsoId);
       initNodes_d2(torsoId);
       initNodes_d3(torsoId);
	};

    //Human
    for(i=0; i<numNodes; i++) initNodes(i);

    //Duck 1
    for(i=0; i<numNodes; i++) initNodes_d1(i);
    //Duck 2
    for(i=0; i<numNodes; i++) initNodes_d2(i);
    //Duck 3
    for(i=0; i<numNodes; i++) initNodes_d3(i);

	render();
}

var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if(call){
            if(human_x < 6.5){
                frame_count += 0.2;
                human_x += 0.2;
                theta[leftLowerLegId ] = 40;
                initNodes(leftLowerLegId);
                theta[rightLowerLegId ] = 40;
                initNodes(rightLowerLegId);
                theta[leftUpperLegId ] = (-Math.sin(frame_count) * 9) + 180;
                initNodes(leftUpperLegId);
                theta[rightUpperLegId ] = (Math.sin(frame_count) * 9) + 180;
                initNodes(rightUpperLegId);
                initNodes(torsoId);
            }
            else{
                frame_count += 0.2;

                theta[leftLowerLegId ] = 0;
                initNodes(leftLowerLegId);
                theta[rightLowerLegId ] = 0;
                initNodes(rightLowerLegId);
                theta[leftUpperLegId ] = 180;
                initNodes(leftUpperLegId);
                theta[rightUpperLegId ] = 180;
                initNodes(rightUpperLegId);

                theta[leftUpperArmId ] = 130;
                initNodes(leftUpperArmId);
                theta[rightUpperArmId ] = 130;
                initNodes(rightUpperArmId);
                theta[leftLowerArmId ] = (Math.sin(frame_count) * 18) - 30;
                initNodes(leftLowerArmId);
                theta[rightLowerArmId ] = (Math.sin(frame_count) * 18) - 30;
                initNodes(rightLowerArmId);
                initNodes(torsoId);


                if(d1_x < -2){
                    d1_x += 0.1;
                    d2_x += 0.1;
                    d3_x += 0.1;
                    theta_d1[leftUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                    initNodes_d1(leftUpperArmId);
                    theta_d1[rightUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                    initNodes_d1(rightUpperArmId);
                    theta_d2[leftUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                    initNodes_d2(leftUpperArmId);
                    theta_d2[rightUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                    initNodes_d2(rightUpperArmId);
                    theta_d3[leftUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                    initNodes_d3(leftUpperArmId);
                    theta_d3[rightUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                    initNodes_d3(rightUpperArmId);
                }

                initNodes(torsoId);
                initNodes_d1(torsoId);
                initNodes_d2(torsoId);
                initNodes_d3(torsoId);
            }
        }
        if(feed){
            if(human_x < 6.5){
                frame_count += 0.2;
                human_x += 0.2;

                theta[leftLowerLegId ] = 40;
                initNodes(leftLowerLegId);
                theta[rightLowerLegId ] = 40;
                initNodes(rightLowerLegId);
                theta[leftUpperLegId ] = (-Math.sin(frame_count) * 9) + 180;
                initNodes(leftUpperLegId);
                theta[rightUpperLegId ] = (Math.sin(frame_count) * 9) + 180;
                initNodes(rightUpperLegId);
                initNodes(torsoId);
            }
            else{
                frame_count += 0.2;
                human_y = -5.5;
                human_tilt = 12;

                theta[leftLowerLegId ] = 40;
                initNodes(leftLowerLegId);
                theta[rightLowerLegId ] = 40;
                initNodes(rightLowerLegId);
                theta[leftUpperLegId ] = 150;
                initNodes(leftUpperLegId);
                theta[rightUpperLegId ] = 150;
                initNodes(rightUpperLegId);

                theta[leftUpperArmId] = (Math.sin(frame_count) * 5) + 150;
                initNodes(leftUpperArmId);

                initNodes(torsoId);

                if(d1_x > -3){
                    duck_tilt = (Math.sin(frame_count) * 2) + 80;
                }

                initNodes_d1(torsoId);
                initNodes_d2(torsoId);
                initNodes_d3(torsoId);
            }
        }
        if(shoo){
            if(human_x < 6.5){
                frame_count += 0.2;
                human_x += 0.2;

                theta[leftLowerLegId ] = 40;
                initNodes(leftLowerLegId);
                theta[rightLowerLegId ] = 40;
                initNodes(rightLowerLegId);
                theta[leftUpperLegId ] = (-Math.sin(frame_count) * 9) + 180;
                initNodes(leftUpperLegId);
                theta[rightUpperLegId ] = (Math.sin(frame_count) * 9) + 180;
                initNodes(rightUpperLegId);
                initNodes(torsoId);
            }
            else{
                frame_count += 0.2;

                theta[leftLowerLegId ] = 0;
                initNodes(leftLowerLegId);
                theta[rightLowerLegId ] = 0;
                initNodes(rightLowerLegId);
                theta[leftUpperLegId ] = 180;
                initNodes(leftUpperLegId);
                theta[rightUpperLegId ] = 180;
                initNodes(rightUpperLegId);

                theta[leftUpperArmId ] = (Math.sin(frame_count) * 15) + 100;
                initNodes(leftUpperArmId);
                theta[rightUpperArmId ] = (Math.sin(frame_count) * 15) + 100;
                initNodes(rightUpperArmId);
                theta[leftLowerArmId ] = (Math.sin(frame_count+0.2) * 25) + 50;
                initNodes(leftLowerArmId);
                theta[rightLowerArmId ] = (Math.sin(frame_count+0.2) * 25) + 50;
                initNodes(rightLowerArmId);
                initNodes(torsoId);

                if(d1_x > -8){
                    d1_x -= 0.1;
                    theta_d1[leftUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                    initNodes_d1(leftUpperArmId);
                    theta_d1[rightUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                    initNodes_d1(rightUpperArmId);
                    initNodes_d1(torsoId);

                    d2_x -= 0.1;
                    theta_d2[leftUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                    initNodes_d2(leftUpperArmId);
                    theta_d2[rightUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                    initNodes_d2(rightUpperArmId);
                    initNodes_d2(torsoId);

                    d3_x -= 0.1;
                    theta_d3[leftUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                    initNodes_d3(leftUpperArmId);
                    theta_d3[rightUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                    initNodes_d3(rightUpperArmId);
                    initNodes_d3(torsoId);
                }
            }
        }
        if(scare){
            frame_count += 0.3;
            
            theta[leftUpperArmId ] = (Math.sin(frame_count) * 15) + 30;
            initNodes(leftUpperArmId);
            theta[rightUpperArmId ] = (-Math.sin(frame_count) * 15) - 30;
            initNodes(rightUpperArmId);

            if(human_x > -2){
                human_x -= 0.3;

                theta[leftLowerLegId ] = 40;
                initNodes(leftLowerLegId);
                theta[rightLowerLegId ] = 40;
                initNodes(rightLowerLegId);
                theta[leftUpperLegId ] = (Math.sin(frame_count) * 9) + 180;
                initNodes(leftUpperLegId);
                theta[rightUpperLegId ] = (-Math.sin(frame_count) * 9) + 180;
                initNodes(rightUpperLegId);
            }
            else{
                theta[leftUpperLegId ] = 180;
                initNodes(leftUpperLegId);
                theta[rightUpperLegId ] = 180;
                initNodes(rightUpperLegId);
                theta[leftLowerLegId ] = 0;
                initNodes(leftLowerLegId);
                theta[rightLowerLegId ] = 0;
                initNodes(rightLowerLegId);
            }

            if(d1_x > -8){
                d1_x -= 0.2;

                theta_d1[leftUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                initNodes_d1(leftUpperArmId);
                theta_d1[rightUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                initNodes_d1(rightUpperArmId);

                d2_x -= 0.2;

                theta_d2[leftUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                initNodes_d2(leftUpperArmId);
                theta_d2[rightUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                initNodes_d2(rightUpperArmId);

                d3_x -= 0.2;

                theta_d3[leftUpperArmId] = (-Math.sin(frame_count) * 5) - 90;
                initNodes_d3(leftUpperArmId);
                theta_d3[rightUpperArmId] = (Math.sin(frame_count) * 5) - 90;
                initNodes_d3(rightUpperArmId);
            }

            initNodes(torsoId);

            d1_y = Math.sin(frame_count) - 7.25;
            d2_y = Math.sin(frame_count) - 4.85;
            d3_y = Math.sin(frame_count) - 2.25;

            initNodes_d1(torsoId);
            initNodes_d2(torsoId);
            initNodes_d3(torsoId);
        }
        
        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct));
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct));
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition));
        gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);
        
        //Human
		traverse(torsoId);
        
        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct_dbody));
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct_dbody));
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct_dbody));
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition));
        gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess_dbody);
        
        //Duck 1
        traverse_d1(torsoId);
        //Duck 2
        traverse_d2(torsoId);
        //Duck 3
        traverse_d3(torsoId);

        requestAnimFrame(render);
}
