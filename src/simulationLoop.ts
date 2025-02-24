import {  Vector3Tuple } from "three";
import {
	bodiesAtom,
	Body,
	playingAtom,
	settingsAtom,
	store,
} from "./atoms";
import {
	distanceBetween,
	getNextBodyState,
} from "./helper";
let bodies = [] as Body[];
let trails = [] as Vector3Tuple[][];
let forecast = [] as Body[][];
let forecastPosition = [] as Vector3Tuple[][];
export function getTrails(){
	return trails
}
export function getForecastPosition(){
	return forecastPosition
}
export function updateBodies(){
	bodies = store.get(bodiesAtom);
}
let trailLimit= 10000
let G = 0;
let dt = 10;
let e = 1;
let playing = false;
let settings:any={}
export function init(colorChange: boolean = false,force:boolean=false) {
	let prevPlaying = !!store.get(playingAtom)
	store.set(playingAtom,false)

	trailLimit= settings.trailLimit
	bodies = store.get(bodiesAtom);
	settings=store.get(settingsAtom)
	G = settings.gravitationalConstant
	dt = settings.timeStep
	e = settings.elasticitiy

	if (!colorChange) {
		trails = bodies.map((body) => {
			return [body.position];
		});
		let tempBodies = [...bodies];
		let temp = tempBodies.map((body) => [body]);

		let forecastLimit = settings.forecastLimit;
		for (let i = 0; i < forecastLimit; i++) {
			tempBodies = getNextBodyState(
				tempBodies,
				G,
				dt,e
			);
			temp.forEach((body, index) => {
				body.push(tempBodies[index]);
			});
		}
		forecast = temp;

		forecastPosition = temp.map((body) => {
			return body.map((state) => {
				return state.position;
			});
		});
	}

	if(!force)
	store.set(playingAtom,prevPlaying)
}
// async function initFuturePos() {
// 	let forecastRef = store.get(forecastRefAtom);
// 	while (!forecastRef.current[0]) {
// 		// console.log(store.get(forecastRefAtom));
// 		forecastRef = store.get(forecastRefAtom);
// 		await new Promise((resolve) => setTimeout(resolve, 100));
// 	}
// 	// console.log(forecastRef);
// 	forecastRef.current.forEach((body: any, index: number) => {
// 		body.geometry.dispose();
// 		body.geometry = new THREE.BufferGeometry().setFromPoints([
// 			...forecastPosition[index].map((x) => new Vector3(...x)),
// 		]);
// 	});
// }
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function setNextState() {
	let latest = [] as Body[];
	let forecastLimit = settings.forecastLimit;
	forecast = forecast.map((body) => {
		latest.push(body[body.length - 1]);
		return body;
	});
	let waitTime = 10;
	playing=store.get(playingAtom)
	while (playing) {
		console.log("setting next state");
		latest = getNextBodyState(
			latest,
			G,
			dt,e
		);
		latest.forEach((body, index) => {
			forecast[index].push(body);
		});

		forecastPosition.forEach((body, index) => {
			body.push(forecast[index][forecast[index].length - 1].position);
		});
		if(forecast[0].length< forecastLimit && waitTime>1)
			waitTime--;
		else if(forecast[0].length> forecastLimit && waitTime<10)
			waitTime++;
		await sleep(waitTime);
		playing=store.get(playingAtom)
	}
}
export function getNextState(): Body[] {
	if (forecast.length > 0) {
		trails = bodies.map((body, index) => {
			if (
				distanceBetween(
					trails[index][trails[index].length - 1],
					body.position
				) > 0.1
			) {
				while (trails[index].length > trailLimit) {
					trails[index].shift();
				}
				return [...trails[index], body.position];
			}
			return trails[index];
		});
		forecastPosition.forEach((body) => {
			body.shift();
		});
		forecast = forecast.map((body) => {
			body.shift();
			return body; 
		});
		
		forecast.forEach((body,index) => {
			bodies[index].position = body[0].position;
			bodies[index].velocity = body[0].velocity;
			bodies[index].radius = body[0].radius;
		});

	}
	return bodies;
}

