import { Body } from "./atoms";

function add(
	a: [number, number, number],
	b: [number, number, number]
): [number, number, number] {
	return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subtract(
	a: [number, number, number],
	b: [number, number, number]
): [number, number, number] {
	return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function multiply(
	vec: [number, number, number],
	scalar: number
): [number, number, number] {
	return [vec[0] * scalar, vec[1] * scalar, vec[2] * scalar];
}

function dot(a: [number, number, number], b: [number, number, number]): number {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function magnitude(vec: [number, number, number]): number {
	return Math.sqrt(dot(vec, vec));
}

function normalize(vec: [number, number, number]): [number, number, number] {
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

export function distanceBetween(
	a: [number, number, number],
	b: [number, number, number]
) {
	return Math.sqrt(
		(a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
	);
}
function newtonianGravity(
	A: Body,
	B: Body,
	G: number
): [number, number, number] {
	const dx = B.position[0] - A.position[0];
	const dy = B.position[1] - A.position[1];
	const dz = B.position[2] - A.position[2];

	const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
	const force = (G * A.mass * B.mass) / (r * r);

	// Normalize and multiply by force
	return [(dx / r) * force, (dy / r) * force, (dz / r) * force];
}
interface CollisionResultBody {
	deltaV: [number, number, number];
	deltaR: number;
	deltaM: number;
	deltaP: [number, number, number];
}
interface CollisionResult {
	A: CollisionResultBody;
	B: CollisionResultBody;
}
const init = {
	A: {
		deltaV: [0, 0, 0] as [number, number, number],
		deltaR: 0,
		deltaM: 0,
		deltaP: [0, 0, 0] as [number, number, number],
	},
	B: {
		deltaV: [0, 0, 0] as [number, number, number],
		deltaR: 0,
		deltaM: 0,
		deltaP: [0, 0, 0] as [number, number, number],
	},
};
function calculateCollisionForce(A: Body, B: Body, e: number): CollisionResult {
	let n = vec3.subtract(A.position, B.position);
	let dist = vec3.magnitude(n);
	let nHat = vec3.normalize(n);
	let penetration = A.radius + B.radius - dist;
	let invMassSum = 1 / A.mass + 1 / B.mass;
	let R = A.radius > B.radius ? A.radius : B.radius;
	let r = R == B.radius ? A.radius : B.radius;
	if (penetration > 0) {
		let changes = JSON.parse(JSON.stringify(init));
		let correction = vec3.multiply(nHat, penetration / invMassSum);
		let aVel = A.static
			? ([0, 0, 0] as [number, number, number])
			: A.velocity;
		let bVel = B.static
			? ([0, 0, 0] as [number, number, number])
			: B.velocity;
		let relVel = vec3.subtract(aVel, bVel);
		let relVelAlongNormal = vec3.dot(relVel, nHat);
		if (relVelAlongNormal > 0) return JSON.parse(JSON.stringify(init));
		let jImpulse = (-(1 + e) * relVelAlongNormal) / invMassSum;
		let impulse = vec3.multiply(nHat, jImpulse);
		if (!A.static && !B.static) {
			changes.A.deltaP = vec3.multiply(correction, 1 / A.mass);
			changes.B.deltaP = vec3.multiply(correction, 1 / B.mass);
			changes.A.deltaV = vec3.multiply(impulse, 1 / A.mass);
			changes.B.deltaV = vec3.multiply(impulse, 1 / B.mass);
		} else if (A.static && !B.static) {
			changes.B.deltaP = vec3.add(
				vec3.multiply(correction, 1 / B.mass),
				vec3.multiply(correction, 1 / A.mass)
			);
			changes.B.deltaV = vec3.multiply(impulse, invMassSum);
		} else if (!A.static && B.static) {
			changes.A.deltaP = vec3.add(
				vec3.multiply(correction, 1 / B.mass),
				vec3.multiply(correction, 1 / A.mass)
			);
			changes.A.deltaV = vec3.multiply(impulse, invMassSum);
		}

		if (A.mass > B.mass) {
			changes.A.deltaM = B.mass * (1 - e);
			changes.B.deltaM = B.mass * (1 - e);
			let aVolume = Math.pow(A.radius, 3);
			let bVolume = Math.pow(B.radius, 3);
			changes.A.deltaR =
				Math.cbrt(aVolume + bVolume * (1 - e)) - A.radius;
			changes.B.deltaR = B.radius - Math.cbrt(bVolume * e);
			if (
				B.mass - changes.B.deltaM < 0.001 ||
				B.radius - changes.B.deltaR < 0.001 ||
				dist <= R - r
			) {
				changes.A.deltaP = [0, 0, 0];
				changes.A.deltaV = vec3.multiply(impulse, invMassSum);
				changes.A.deltaM = B.mass;
				changes.B.deltaM = B.mass;
				changes.A.deltaR = Math.cbrt(aVolume + bVolume) - A.radius;
				changes.B.deltaR = B.radius;
			}
		} else {
			changes.B.deltaM = -A.mass * (1 - e);
			changes.A.deltaM = -A.mass * (1 - e);
			let aVolume = Math.pow(A.radius, 3);
			let bVolume = Math.pow(B.radius, 3);
			changes.B.deltaR =
				-Math.cbrt(bVolume + aVolume * (1 - e)) + B.radius;
			changes.A.deltaR = -A.radius + Math.cbrt(aVolume * e);
			if (
				A.mass - changes.A.deltaM < 0.001 ||
				A.radius + changes.A.deltaR < 0.001 ||
				dist <= R - r
			) {
				changes.B.deltaP = [0, 0, 0];
				changes.B.deltaV = vec3.multiply(impulse, invMassSum);
				changes.B.deltaM = -A.mass;
				changes.A.deltaM = -A.mass;
				changes.B.deltaR = -Math.cbrt(bVolume + aVolume) + B.radius;
				changes.A.deltaR = -A.radius;
			}
		}
		return changes;
	} else return JSON.parse(JSON.stringify(init));
}
export function getNextBodyState(
	bodies: Body[],
	G: number,
	dt: number,
	e: number
): Body[] {
	let forces: [number, number, number][] = bodies.map(() => [0, 0, 0]);
	for (let i = 0; i < bodies.length; i++) {
		let A = bodies[i];
		if (A.mass == 0) continue;
		for (let j = i + 1; j < bodies.length; j++) {
			let B = bodies[j];
			if (B.mass == 0 || (A.static && B.static)) continue;
			let force = newtonianGravity(A, B, G);
			if (!A.static) forces[i] = vec3.add(forces[i], force);
			if (!B.static) forces[j] = vec3.subtract(forces[j], force);
		}
	}
	bodies = bodies.map((body, index) => {
		if (body.static) return body;
		let force = forces[index];
		let acceleration = vec3.multiply(force, 1 / body.mass);
		let velocity = vec3.add(body.velocity, vec3.multiply(acceleration, dt));
		let position = vec3.add(body.position, vec3.multiply(velocity, dt));
		return { ...body, velocity, position };
	});
	let changes = bodies.map(() => JSON.parse(JSON.stringify(init.A)));
	for (let i = 0; i < bodies.length; i++) {
		let A = bodies[i];
		if (A.radius == 0) continue;
		for (let j = i + 1; j < bodies.length; j++) {
			let B = bodies[j];
			if (B.radius == 0 || (A.static && B.static)) continue;
			let changePair = calculateCollisionForce(A, B, e);
			changes[i] = {
				deltaV: vec3.add(changes[i].deltaV, changePair.A.deltaV),
				deltaR: changes[i].deltaR + changePair.A.deltaR,
				deltaM: changes[i].deltaM + changePair.A.deltaM,
				deltaP: vec3.add(changes[i].deltaP, changePair.A.deltaP),
			};
			changes[j] = {
				deltaV: vec3.subtract(changes[j].deltaV, changePair.B.deltaV),
				deltaR: changes[j].deltaR - changePair.B.deltaR,
				deltaM: changes[j].deltaM - changePair.B.deltaM,
				deltaP: vec3.subtract(changes[j].deltaP, changePair.B.deltaP),
			};
		}
	}

	return bodies.map((body, index) => {
		let change = changes[index];
		let velocity = vec3.add(body.velocity, change.deltaV);
		let position = vec3.add(body.position, change.deltaP);
		let mass = body.mass + change.deltaM;
		let sttic = body.static;
		if (mass == 0) {
			sttic = true;
		}
		let radius = body.radius + change.deltaR;
		return { ...body, velocity, position, mass, radius, static: sttic };
	});
}
