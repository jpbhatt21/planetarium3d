import { Vector3Tuple } from "three";
import { Body } from "./atoms";

function add(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
	return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subtract(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
	return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function multiply(vec: Vector3Tuple, scalar: number): Vector3Tuple {
	return [vec[0] * scalar, vec[1] * scalar, vec[2] * scalar];
}

function dot(a: Vector3Tuple, b: Vector3Tuple): number {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function magnitude(vec: Vector3Tuple): number {
	return Math.sqrt(dot(vec, vec));
}

function normalize(vec: Vector3Tuple): Vector3Tuple {
	let mag = magnitude(vec);
	return mag === 0 ? [0, 0, 0] : multiply(vec, 1 / mag);
}
export const vec3 = {
	add,
	subtract,
	multiply,
	dot,
	magnitude,
	normalize,
};
export function simulateGravity(bodies: Body[],G:number,dt:number): Body[] {
	let accelerations: Vector3Tuple[] = Array.from(
		{ length: bodies.length },
		() => [0, 0, 0]
	);
	const newBodies: Body[] = bodies.map((body, index) => {
		if ( body.mass > 0) {
			for (
				let otherIndex = index + 1;
				otherIndex < bodies.length;
				otherIndex++
			) {
				let otherBody = bodies[otherIndex];
				if (index !== otherIndex && otherBody.mass > 0) {
					const distance = distanceBetween(
						body.position,
						otherBody.position
					);
					if (distance > 0.1) {
						const force =
							(G * body.mass * otherBody.mass) / distance ** 2;
						const direction: Vector3Tuple = [
							(otherBody.position[0] - body.position[0]) /
								distance,
							(otherBody.position[1] - body.position[1]) /
								distance,
							(otherBody.position[2] - body.position[2]) /
								distance,
						];
						if(!body.static)
						{accelerations[index] = vec3.add(
							accelerations[index],
							vec3.multiply(direction, force / body.mass)
						);}
						if(!otherBody.static)
						accelerations[otherIndex] = vec3.subtract(
							accelerations[otherIndex],
							vec3.multiply(direction, force / otherBody.mass)
						);
					}
				}
			}
			if(body.static)
				return body;
			return {
				...body,
				velocity: [
					body.velocity[0] + accelerations[index][0] * dt,
					body.velocity[1] + accelerations[index][1] * dt,
					body.velocity[2] + accelerations[index][2] * dt,
				],
				position: [
					body.position[0] + body.velocity[0] * dt,
					body.position[1] + body.velocity[1] * dt,
					body.position[2] + body.velocity[2] * dt,
				],
			};
		}
		return body;
	});
	return newBodies;
}
export function distanceBetween(
	a: [number, number, number],
	b: [number, number, number]
) {
	return Math.sqrt(
		(a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
	);
}
export function resolveSimultaneousCollisions(
	bodies: Body[],
	iterations: number,e:number
) {	let save = JSON.parse(JSON.stringify(bodies));
	bodies.forEach((body) => {
		if (body.static) 
			body.velocity = [0, 0, 0];
	}
	);
	// We use a fixed number of iterations to approximate simultaneous resolution.
	for (let iter = 0; iter < iterations; iter++) {
		// Detect all collision contacts for this time step.
		let contacts = [];
		for (let i = 0; i < bodies.length; i++) {
			if (bodies[i].mass == 0) continue;

			for (let j = i + 1; j < bodies.length; j++) {
				if (bodies[j].mass == 0) continue;
				let A = bodies[i];
				let B = bodies[j];
				let n = vec3.subtract(A.position, B.position);
				let dist = vec3.magnitude(n);
				let penetration = A.radius + B.radius - dist;
				if (penetration > 0) {
					// Collision detected
					let nHat = vec3.normalize(n);
					contacts.push({ i, j, n: nHat, penetration, dist });
				}
			}
		}

		// Process each contact.
		// Note: if a merge occurs, we break out and restart detection because the bodies array has changed.
		let merged = false;
		for (let contact of contacts) {
			let A = bodies[contact.i];
			let B = bodies[contact.j];
			let nHat = contact.n;

			// Correct positions so that the spheres just touch.
			// Distribute the correction based on inverse mass.
			let invMassSum = 1 / A.mass + 1 / B.mass;
			let correction = vec3.multiply(
				nHat,
				contact.penetration / invMassSum
			);
			A.position = vec3.add(
				A.position,
				vec3.multiply(correction, 1 / A.mass)
			);
			B.position = vec3.subtract(
				B.position,
				vec3.multiply(correction, 1 / B.mass)
			);

			// Relative velocity along normal.
			let relVel = vec3.subtract(A.velocity, B.velocity);
			let relVelAlongNormal = vec3.dot(relVel, nHat);

			// If bodies are separating, skip.
			if (relVelAlongNormal > 0) continue;

			// Compute impulse scalar:
			let jImpulse = (-(1 + e) * relVelAlongNormal) / invMassSum;

			// Update velocities.
			let impulse = vec3.multiply(nHat, jImpulse);
			A.velocity = vec3.add(
				A.velocity,
				vec3.multiply(impulse, 1 / A.mass)
			);
			B.velocity = vec3.subtract(
				B.velocity,
				vec3.multiply(impulse, 1 / B.mass)
			);
			let m1 = A.mass;
			let m2 = B.mass;
            let mul=1
			if (m1 > m2) {
				A.mass = m1 + m2 * (1 - e);
				B.mass = m2 * e;
                if(B.mass<0.1||B.radius<0.1)
                {   A.mass+=B.mass;
                    B.mass=0;
                    mul=0;
                }
				let aVolume = Math.pow(A.radius, 3);
				let bVolume = Math.pow(B.radius, 3);
				A.radius = Math.cbrt(aVolume + bVolume * (1 - e*mul));
				B.radius = Math.cbrt(bVolume * e*mul);;
			} else {
				B.mass = m2 + m1 * (1 - e);
				A.mass = m1 * e;

                if(A.mass<0.1||A.radius<0.1)
                {   B.mass+=A.mass;
                    A.mass=0;
                    mul=0;
                }
				let aVolume = Math.pow(A.radius, 3);
				let bVolume = Math.pow(B.radius, 3);
				B.radius = Math.cbrt(bVolume + aVolume * (1 - e*mul));
				A.radius = Math.cbrt(aVolume * e*mul);
			}
		}
		if (merged) {
			iter--; // Restart detection
			continue;
		}
	}
	return save.map((body:Body, index:number) => {
		if(body.static)
			return body;
		return bodies[index];
	});
}
