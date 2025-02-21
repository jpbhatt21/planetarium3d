import { Vector3, Vector3Tuple } from "three";
import {
	animationKeyAtom,
	bodiesAtom,
	Body,
	bodyRefAtom,
	elasticitiyAtom,
	forecastLimitAtom,
	forecastRefAtom,
	gravitationalConstantAtom,
	store,
	timeStepAtom,
	trailRefAtom,
} from "./atoms";
import {
	distanceBetween,
	resolveSimultaneousCollisions,
	simulateGravity,
} from "./helper";
import * as THREE from "three";
let bodies = [] as Body[];
let trails = [] as Vector3Tuple[][];
let forecast = [] as Body[][];
let forecastPosition = [] as Vector3Tuple[][];
let G = 0;
let dt = 10;
let e = 1;
let playing = false;
export function init(colorChange: boolean = false) {
	let prevPlaying = !!playing;
	playing = false;
	bodies = store.get(bodiesAtom);
	G = store.get(gravitationalConstantAtom);
	dt = store.get(timeStepAtom);
	e = store.get(elasticitiyAtom);

	if (!colorChange) {
		trails = bodies.map((body) => {
			return [body.position];
		});
		let tempBodies = [...bodies];
		let temp = tempBodies.map((body) => [body]);

		let forecastLimit = store.get(forecastLimitAtom);
		for (let i = 0; i < forecastLimit; i++) {
			tempBodies = simulateGravity(
				resolveSimultaneousCollisions(tempBodies, 10, e),
				G,
				dt
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
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
async function setNextState() {
	let latest = [] as Body[];
	let forecastLimit = store.get(forecastLimitAtom);
	forecast = forecast.map((body) => {
		latest.push(body[body.length - 1]);
		return body;
	});
	let waitTime = 10;
	while (playing) {
		latest = simulateGravity(
			resolveSimultaneousCollisions(latest, 10, e),
			G,
			dt
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
				if (trails[index].length > 10000) {
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
	function updateState() {
		getNextState().map((body, index) => {
			if (bodyRefs.current[index]) {
				bodyRefs.current[index].position.set(...body.position);
			}

			if (trailRefs.current[index]) {
				trailRefs.current[index].geometry.dispose();
				trailRefs.current[index].geometry =
					new THREE.BufferGeometry().setFromPoints([
						...trails[index].map((x) => new Vector3(...x)),
						new Vector3(...body.position),
					]);
			}

			if (forecastRefs.current[index]) {
				forecastRefs.current[index].geometry.dispose();
				forecastRefs.current[index].geometry =
					new THREE.BufferGeometry().setFromPoints([
						...forecastPosition[index].map(
							(x) => new Vector3(...x)
						),
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
