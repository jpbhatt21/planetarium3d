import { Vector3, Vector3Tuple } from "three";
import {
	animationKeyAtom,
	bodiesAtom,
	Body,
	bodyRefAtom,
	forecastRefAtom,
	settingsAtom,
	store,
	trailRefAtom,
} from "./atoms";
import {
	distanceBetween,
	getNextBodyState,
} from "./helper";
import * as THREE from "three";
let bodies = [] as Body[];
let trails = [] as Vector3Tuple[][];
let forecast = [] as Body[][];
let forecastPosition = [] as Vector3Tuple[][];
let trailLimit= 10000
let G = 0;
let dt = 10;
let e = 1;
let playing = false;
let settings:any={}
export function init(colorChange: boolean = false,force:boolean=false) {
	let prevPlaying = !!playing;
	trailLimit= settings.trailLimit
	playing = false;
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

	initFuturePos();
	if(!force)
	playing = prevPlaying;
}
async function initFuturePos() {
	let forecastRef = store.get(forecastRefAtom);
	while (!forecastRef.current[0]) {
		// console.log(store.get(forecastRefAtom));
		forecastRef = store.get(forecastRefAtom);
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	// console.log(forecastRef);
	forecastRef.current.forEach((body: any, index: number) => {
		body.geometry.dispose();
		body.geometry = new THREE.BufferGeometry().setFromPoints([
			...forecastPosition[index].map((x) => new Vector3(...x)),
		]);
	});
}
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
async function setNextState() {
	let latest = [] as Body[];
	let forecastLimit = settings.forecastLimit;
	forecast = forecast.map((body) => {
		latest.push(body[body.length - 1]);
		return body;
	});
	let waitTime = 10;
	while (playing) {
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
		let returnVal = [] as Body[];
		forecast.forEach((body) => {
			returnVal.push(body[0]);
		});
		bodies = [...returnVal];

		return returnVal;
	}
	return bodies;
}
export function playSimulation() {
	playing = true;
	const bodyRefs = store.get(bodyRefAtom);
	const trailRefs = store.get(trailRefAtom);
	const forecastRefs = store.get(forecastRefAtom);
	let initialRadii = bodies.map((body) => body.radius);
	
	function updateState() {
		getNextState().map((body, index) => {
			if (bodyRefs.current[index]) {
				bodyRefs.current[index].position.set(...body.position);
				
				if(body.radius!=initialRadii[index]){
					// bodyRefs.current[index].geometry.dispose();
					// bodyRefs.current[index].geometry = new THREE.SphereGeometry(
					// 	body.radius,
					// 	32,
					// 	32
					// );
					// initialRadii[index]=body.radius
					
					bodyRefs.current[index].scale.set(body.radius,body.radius,body.radius)
				}
			}

			if (trailRefs.current[index]) {
				trailRefs.current[index].geometry.dispose();
				trailRefs.current[index].geometry =
					new THREE.BufferGeometry().setFromPoints([
						...trails[index].map((x) => new Vector3(...x)),
						new Vector3(...body.position),
					]);
			}

			if (forecastRefs.current[index] && !(body.static||(body.mass==0&&body.radius==0))) {
				forecastRefs.current[index].geometry.dispose();
				forecastRefs.current[index].geometry =
					new THREE.BufferGeometry().setFromPoints([
						...forecastPosition[index].map(
							(x) => new Vector3(...x)
						),
					]);
			}
			else if(forecastRefs.current[index]){
				forecastRefs.current[index].geometry.dispose();
				forecastRefs.current[index].geometry =
					new THREE.BufferGeometry().setFromPoints([
						new Vector3(0,0,0)
					]);
			}
		});
		store.set(bodiesAtom, bodies);
		store.set(animationKeyAtom, window.requestAnimationFrame(updateState));
	}
	setNextState();
	window.requestAnimationFrame(updateState);
}
export function pauseSimulation() {
	playing = false;
	window.cancelAnimationFrame(store.get(animationKeyAtom));
	store.set(animationKeyAtom, -1);
	initFuturePos();
}
export function toggleSimulationPlayState() {
	if (store.get(animationKeyAtom) != -1) {
		pauseSimulation();
		return false;
	} else {
		playSimulation();
		return true;
	}
}
