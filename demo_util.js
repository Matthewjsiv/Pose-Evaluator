/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licnses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
// import * as tf from '@tensorflow/tfjs-core';
// import * as posenet from '../src';

const color = 'aqua';
const lineWidth = 2.5;

function toTuple({ y, x }) {
  return [y, x];
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(toTuple(keypoints[0].position),
      toTuple(keypoints[1].position), color, scale, ctx);
  });
}

/**
 * Draw pose keypoints onto a canvas
 */
function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  let numPoints = 0;
  let numFacePoints = 0;
  let numSholds = 0;
  let numHips = 0;
  let leftEye = -10;
  let rightEye = -10;
  let leftShold = -10;
  let rightShold = -10;
  let leftElbow = -10;
  let rightElbow = -10;
  let leftHip = -10;
  let rightHip = -10;
  
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }
	numPoints++; //increment score for each keypoint
	
	const { y, x } = keypoint.position;
    ctx.beginPath();
    ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI);
    
    //ctx.fillStyle = 'yellow';
    //ctx.fillText(x.toFixed(3), 10, 200);
    if(i % 2 == 0)
    {
    	ctx.fillStyle = 'yellow';
    }
    else
    {
    	ctx.fillStyle = color;
    }
	
	if(i<5)
	{
		numPoints++; //increment again for facial features
		numFacePoints++;
		if(i == 1)
		{
			leftEye = x;
		}
		else if(i == 2)
		{
			rightEye = x;
		}
	}
    else if(i == 5)
    {
    	leftShold = x;
    	numSholds++;
    }
    else if(i == 6)
    {
    	rightShold = x;
    	numSholds++;
    }
    else if(i == 7)
    {
    	leftElbow = x;
    }
    else if(i == 8)
    {
    	rightElbow = x;
    }
    else if(i == 11)
    {
    	leftHip = x;
    	numHips++;
    }
    else if(i == 12)
    {
    	rightHip = x;
    	numHips++;
    }
    
    ctx.fill();
  }
  
  ctx.font = '48px serif';
  /*
  if(keypoints[3].score < minConfidence)
  {
  	ctx.font = '48px serif';
  	ctx.fillText('Can not see left ear', 10, 50);
  }
  else
  {
  	ctx.font = '48px serif';
  	ctx.fillText('Can see left ear', 10, 50);
  }*/
  
  
  
  let score = numPoints;
  
  //adjust score based on horizontal shoulder distance
  if(keypoints[5].score > minConfidence && keypoints[6].score > minConfidence)
  {
  /*
	const { y, x } = keypoints[5].position;
	let x1 = x.toFixed(2);
	
	//const { y, x } = keypoints[6].position;
	//let x2 = x.toFixed(2);
	
	{ y, x } = keypoints[6].position;
	let x3 = x2.toFixed(2);
	
	//let distance = Math.abs(x1 - x2);
	*/
	
	let distance = Math.abs(rightShold - leftShold);
	distance = distance / 10;
	distance = Math.trunc(distance);
	
	score += distance;
	
	//ctx.fillText(distance, 10, 200);
  }
  
  /*
  //adjust score based on horizontal elbow distance
  if(keypoints[7].score > minConfidence && keypoints[8].score > minConfidence)
  {
  
	let distance = Math.abs(rightElbow - leftElbow);
	distance = distance / 10;
	distance = Math.trunc(distance);
	
	score += distance;
	
	//ctx.fillText(distance, 10, 200);
  }*/
  
  //adjust score based on horizontal hip distance
  if(keypoints[11].score > minConfidence && keypoints[12].score > minConfidence)
  {
  
	let distance = Math.abs(rightHip - leftHip);
	distance = distance / 10;
	distance = Math.trunc(distance);
	
	score += distance;
	
	//ctx.fillText(distance, 10, 200);
  }
  
  //adjust score based on horizontal eye distance
  if(keypoints[1].score > minConfidence && keypoints[2].score > minConfidence)
  {
  
	let distance = Math.abs(rightEye - leftEye);
	distance = distance / 20;
	distance = Math.trunc(distance);
	
	score += distance;
	
	//ctx.fillText(distance, 10, 200);
  }
  
  if(numHips == 2)
  {
  	score = score*1.7;
  }
  
  if(numSholds == 2)
  {
  	score = score*1.3;
  }
  //double score for 4/5 face features, triple for all
  if(numFacePoints == 3)
  {
  	score = score*1.8;
  }
  else if(numFacePoints == 4)
  {
  	score = score*2.3;
  }
  else if(numFacePoints == 5)
  {
  	score = score*2.5;
  }
  
  score = score - 110;
  score = score/80;
  
  score = 1/(1+Math.pow(Math.E, -1*score));
  score = score*10;
  
  ctx.fillStyle = color; 
  ctx.fillText(score.toFixed(2), 10, 380);
  
  /*
  // Wall
  ctx.fillStyle = color;
  ctx.strokeStyle = 'blue';
ctx.strokeRect(75, 140, 150, 110);

// Door
ctx.fillRect(130, 190, 40, 60);

// Roof
ctx.moveTo(50, 140);
ctx.lineTo(150, 60);
ctx.lineTo(250, 140);
ctx.closePath();
ctx.stroke();
*/
  
}

/**
 * Draw the bounding box of a pose. For example, for a whole person standing
 * in an image, the bounding box will begin at the nose and extend to one of
 * ankles
 */
function drawBoundingBox(keypoints, ctx) {
  const boundingBox = posenet.getBoundingBox(keypoints);

  ctx.rect(boundingBox.minX, boundingBox.minY,
    boundingBox.maxX - boundingBox.minX, boundingBox.maxY - boundingBox.minY);

  ctx.stroke();
}

/**
 * Converts an arary of pixel data into an ImageData object
 */
async function renderToCanvas(a, ctx) {
  const [height, width] = a.shape;
  const imageData = new ImageData(width, height);

  const data = await a.data();

  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    const k = i * 3;

    imageData.data[j + 0] = data[k + 0];
    imageData.data[j + 1] = data[k + 1];
    imageData.data[j + 2] = data[k + 2];
    imageData.data[j + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw an image on a canvas
 */
function renderImageToCanvas(image, size, canvas) {
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
}

/**
 * Draw heatmap values, one of the model outputs, on to the canvas
 * Read our blog post for a description of PoseNet's heatmap outputs
 * https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
 */
function drawHeatMapValues(heatMapValues, outputStride, canvas) {
  const ctx = canvas.getContext('2d');
  const radius = 5;
  const scaledValues = heatMapValues.mul(tf.scalar(outputStride, 'int32'));

  drawPoints(ctx, scaledValues, radius, color);
}

/**
 * Used by the drawHeatMapValues method to draw heatmap points on to
 * the canvas
 */
function drawPoints(ctx, points, radius, color) {
  const data = points.buffer().values;

  for (let i = 0; i < data.length; i += 2) {
    const pointY = data[i];
    const pointX = data[i + 1];

    if (pointX !== 0 && pointY !== 0) {
      ctx.beginPath();
      ctx.arc(pointX, pointY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}

/**
 * Draw offset vector values, one of the model outputs, on to the canvas
 * Read our blog post for a description of PoseNet's offset vector outputs
 * https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
 */
function drawOffsetVectors(
  heatMapValues, offsets, outputStride, scale = 1, ctx) {
  const offsetPoints = posenet.singlePose.getOffsetPoints(
    heatMapValues, outputStride, offsets);

  const heatmapData = heatMapValues.buffer().values;
  const offsetPointsData = offsetPoints.buffer().values;

  for (let i = 0; i < heatmapData.length; i += 2) {
    const heatmapY = heatmapData[i] * outputStride;
    const heatmapX = heatmapData[i + 1] * outputStride;
    const offsetPointY = offsetPointsData[i];
    const offsetPointX = offsetPointsData[i + 1];

    drawSegment([heatmapY, heatmapX], [offsetPointY, offsetPointX],
      color, scale, ctx);
  }
}
