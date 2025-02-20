import {
    animationKeyAtom,
	bodiesAtom,
	Body,
	elasticitiyAtom,
	forecastBodyStateAtom,
	forecastLimitAtom,
	forecastPositionAtom,
	gravitationalConstantAtom,
	store,
	timeStepAtom,
	trailsAtom,
} from "./atoms";
import {
	distanceBetween,
	resolveSimultaneousCollisions,
	simulateGravity,
} from "./helper";

export function init() {
	let bodies = store.get(bodiesAtom);
	
	let G = store.get(gravitationalConstantAtom);
	let dt = store.get(timeStepAtom);
	let e = store.get(elasticitiyAtom);
	store.set(
		trailsAtom,
		bodies.map((body) => {
			return [body.position];
		})
	);
	let temp = bodies.map((body) => [body]);
	let forecastLimit = store.get(forecastLimitAtom);
	for (let i = 0; i < forecastLimit; i++) {
		bodies = simulateGravity(resolveSimultaneousCollisions(bodies, 10,e), G, dt);
		temp.forEach((body, index) => {
			body.push(bodies[index]);
		});
	}
	store.set(forecastBodyStateAtom, temp);
	store.set(
		forecastPositionAtom,
		temp.map((body) => {
			let prev = body[0].position;
			let remove: number[] = [];
			return body.map((state, i) => {
				if (distanceBetween(prev, state.position) < 1) {
					remove.push(i);
				} else {
					prev = state.position;
				}
				return state.position;
			});
		})
	);
	
}
export function getNextState(cur: Body[]): Body[] {
	let G = store.get(gravitationalConstantAtom);
	let dt = store.get(timeStepAtom);
	let e = store.get(elasticitiyAtom);
	store.set(trailsAtom, (prevTrails) => {
		return cur.map((body, index) => {
			if (
				distanceBetween(
					prevTrails[index][prevTrails[index].length - 1],
					body.position
				) > 1
			) {
				if (prevTrails[index].length > 10000) {
					prevTrails[index].shift();
				}
				return [...prevTrails[index], body.position];
			}
			return prevTrails[index];
		});
	});
	let returnVal = [] as Body[];
	let forecastLimit = store.get(forecastLimitAtom);
	store.set(forecastBodyStateAtom, (prev) => {
		let latest = [] as Body[];
		let temp = prev.map((body) => {
			returnVal.push(body[0]);
			latest.push(body[forecastLimit]);
			return body.slice(1);
		});
		let next = simulateGravity(resolveSimultaneousCollisions(latest, 10,e), G, dt);
		temp.forEach((body, index) => {
			body.push(next[index]);
		});
		store.set(forecastPositionAtom, (prev) => {
			let temp = prev.map((body, i) => {
				body.push(next[i].position);
				return body.slice(1);
			});
			return temp;
		});

		return temp;
	});

	return returnVal;
}
export function playSimulation() {
    
	function updateState() {
		store.set(bodiesAtom, getNextState(store.get(bodiesAtom)));
		store.set(animationKeyAtom,window.requestAnimationFrame(updateState))
	}
	window.requestAnimationFrame(updateState);
}
export function pauseSimulation() {
    window.cancelAnimationFrame(store.get(animationKeyAtom));
    store.set(animationKeyAtom,-1)
}
export function toggleSimulationPlayState(){
    if(store.get(animationKeyAtom)!=-1){
        pauseSimulation()
    }else{
        playSimulation()
    }
}
