import { atom, createStore } from "jotai";
import { theme } from "./theme";
import { Vector3, Vector3Tuple } from "three";
import { init } from "./simulationLoop";
import { setBodies } from "./Three";
import * as THREE from "three";
//Interfaces
export interface Body {
	name: string;
	mass: number;
	radius: number;
	position: [number, number, number];
	velocity: [number, number, number];
	static: boolean;
	fixedColor: boolean;
	color: string;
	trail: boolean;
	trailColor: string;
	forecast: boolean;
	forecastColor: string;
	texture: string;
}

export const planetTextures = [
	{
		name: "Aeropolis",
		key: "aer",
	},
	{
		name: "Aspectra",
		key: "aspt",
	},
	{
		name: "Cyclowake",
		key: "ccw",
	},
	{
		name: "Consortia Winds",
		key: "conw",
	},
	{
		name: "Cragoth",
		key: "crg",
	},
	{
		name: "Caesaria",
		key: "csr",
	},
	{
		name: "Defacto Prime",
		key: "dcf",
	},
	{
		name: "Defacto Secondary",
		key: "dcf2",
	},
	{
		name: "Earth",
		key: "earth",
	},
	{
		name: "Gravifold",
		key: "gf",
	},
	{
		name: "Gasandra",
		key: "gs",
	},
	{
		name: "Heliocroft",
		key: "hcf",
	},
	{
		name: "Pulsarwind",
		key: "psw",
	},
];
export let preset = [
	{
		name: "Star",
		data: {
			version: "1.1.0",
			speed: 0,
			G: 0.0667,
			collisionEnergyLoss: 0.01,
			scale: 0.5,
			anchor: 1,
			bodies: [
				{
					name: "planet",
					mass: 10000,
					radius: 50,
					position: [500, 500, 0],
					velocity: [0.1, 0.1, 0],
					static: true,
					fixedColor: true,
					color: "#5e81ac",
					trail: true,
					texture: "hcf",
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				},
				{
					name: "planet",
					mass: 10000,
					radius: 50,
					position: [0, 0, 0],
					velocity: [-0.1, -0.1, 0],
					static: false,
					fixedColor: true,
					color: "#5e81ac",
					trail: true,
					texture: "hcf",
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				},
			],
		},
	},
	{
		name: "Star",
		data: {
			version: "1.1.0",
			speed: 0,
			G: 0.0667,
			collisionEnergyLoss: 0.01,
			scale: 0.5,
			anchor: 1,
			bodies: planetTextures.map((texture, index) => {
				return {
					name: "planet",
					mass: 10000,
					radius: 50,
					position: [100 * index, 100 * index, 0],
					velocity: [0.1, 0.1, 0],
					static: true,
					fixedColor: true,
					color: "#5e81ac",
					trail: true,
					texture: texture.key,
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				};
			}),
		},
	},
	{
		name: "Star & Planet",
		data: {
			version: "1.1.0",
			speed: 0,
			G: 0.0667,
			collisionEnergyLoss: 0.01,
			scale: 0.5,
			anchor: 1,
			bodies: [
				{
					name: "planet",
					mass: 10000,
					radius: 50,
					position: [500, 500, 0],
					velocity: [0.1, 0.1, 0],
					static: false,
					fixedColor: true,
					color: "#5e81ac",
					trail: true,
					texture: "hcf",
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				},
				{
					name: "body 2",
					mass: 100,
					radius: 10,
					position: [100, 100, 0],
					velocity: [1, 0, 0],
					static: false,
					fixedColor: false,
					color: "#a3be8c",
					trail: true,
					texture: "hcf",
					trailColor: "#3b4252",
					forecast: true,
					forecastColor: "#d08770",
				},
			],
		},
	},
	{
		name: "Star-Planet-Moon",
		data: {
			version: "1.1.0",
			speed: 0,
			G: 0.0667,
			collisionEnergyLoss: 0.01,
			scale: 1,
			anchor: 1,
			bodies: [
				{
					name: "planet",
					mass: 10000,
					radius: 50,
					position: [500, 500, 0],
					velocity: [0.1, 0.1, 0],
					static: true,
					fixedColor: true,
					color: "#5e81ac",
					trail: true,
					texture: "hcf",
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				},
				{
					name: "body 2",
					mass: 1000,
					radius: 10,
					position: [500, 250, 0],
					velocity: [0.065, 0, 0],
					static: false,
					fixedColor: false,
					color: "#a3be8c",
					trail: true,
					texture: "hcf",
					trailColor: "#3b4252",
					forecast: true,
					forecastColor: "#d08770",
				},
			],
		},
	},
	{
		name: "Planetary System",
		data: {
			version: "1.1.0",
			speed: 0,
			G: 0.0667,
			collisionEnergyLoss: 0.01,
			scale: 0.1,
			anchor: 1,
			bodies: [
				{
					name: "sun",
					mass: 3330000,
					radius: 500,
					position: [0, 0, 0],
					velocity: [0, 0, 0],
					static: true,
					fixedColor: true,
					color: "#d3a645",
					trail: true,
					texture: "hcf",
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				},
				{
					name: "mercury",
					mass: 1,
					radius: 20,
					position: [0, -554, 0],
					velocity: [20, 0, 0],
					static: false,
					fixedColor: true,
					color: "#a6943a",
					trail: true,
					texture: "hcf",
					trailColor: "#2e3440",
					forecast: true,
					forecastColor: "#868446",
				},
				{
					name: "venus",
					mass: 8,
					radius: 57,
					position: [0, -1074, 0],
					velocity: [15, 0, 0],
					static: false,
					fixedColor: true,
					color: "#ebcb8b",
					trail: true,
					texture: "hcf",
					trailColor: "#3b4252",
					forecast: true,
					forecastColor: "#ebcb8b",
				},
				{
					name: "earth",
					mass: 10,
					radius: 60,
					position: [0, -1478, 0],
					velocity: [13, 0, 0],
					static: false,
					fixedColor: true,
					color: "#629bd0",
					trail: true,
					texture: "hcf",
					trailColor: "#434c5e",
					forecast: true,
					forecastColor: "#8d9cbf",
				},
				{
					name: "mars",
					mass: 1,
					radius: 32,
					position: [0, -2280, 0],
					velocity: [10.5, 0, 0],
					static: false,
					fixedColor: true,
					color: "#e05252",
					trail: true,
					texture: "hcf",
					trailColor: "#4c566a",
					forecast: true,
					forecastColor: "#c86f6f",
				},
				{
					name: "jupiter",
					mass: 3180,
					radius: 150,
					position: [0, -7624, 0],
					velocity: [5.5, 0, 0],
					static: false,
					fixedColor: true,
					color: "#dfd1b3",
					trail: true,
					texture: "hcf",
					trailColor: "#434c5e",
					forecast: true,
					forecastColor: "#bcad8f",
				},
			],
		},
	},
	{
		name: "5 Bodies",
		data: {
			version: "1.1.0",
			speed: 0,
			G: 0.0667,
			collisionEnergyLoss: 0.01,
			scale: 0.5,
			anchor: 1,
			bodies: [
				{
					name: "planet",
					mass: 10000,
					radius: 50,
					position: [500, 500, 0],
					velocity: [0.1, 0.1, 0],
					static: true,
					fixedColor: true,
					color: "#5e81ac",
					trail: true,
					texture: "hcf",
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				},
				{
					name: "body 2",
					mass: 100,
					radius: 10,
					position: [0, 0, 1000],
					velocity: [0.015, 0, 0],
					static: false,
					fixedColor: true,
					color: "#bf616a",
					trail: true,
					texture: "hcf",
					trailColor: "#2e3440",
					forecast: true,
					forecastColor: "#bf616a",
				},
				{
					name: "body 3",
					mass: 100,
					radius: 10,
					position: [1000, 0, -1000],
					velocity: [0.015, 0, 0],
					static: false,
					fixedColor: true,
					color: "#d08770",
					trail: true,
					texture: "hcf",
					trailColor: "#3b4252",
					forecast: true,
					forecastColor: "#d08770",
				},
				{
					name: "body 4",
					mass: 100,
					radius: 10,
					position: [0, 1000, 1000],
					velocity: [-0.015, 0, 0],
					static: false,
					fixedColor: true,
					color: "#ebcb8b",
					trail: true,
					texture: "hcf",
					trailColor: "#434c5e",
					forecast: true,
					forecastColor: "#ebcb8b",
				},
				{
					name: "body 5",
					mass: 100,
					radius: 10,
					position: [1000, 1000, -1000],
					velocity: [-0.015, 0, 0],
					static: false,
					fixedColor: true,
					color: "#a3be8c",
					trail: true,
					texture: "hcf",
					trailColor: "#4c566a",
					forecast: true,
					forecastColor: "#a3be8c",
				},
			],
		},
	},
];
export const textureSizes = [
	{
		q: 6.42,
		s: 6.42,
		aer: 2.32,
		aspt: 2.38,
		ccw: 2.82,
		conw: 2.08,
		crg: 2.84,
		csr: 3.16,
		dcf: 1.61,
		dcf2: 2.06,
		earth: 2.26,
		gf: 2.17,
		gs: 3.49,
		hcf: 2.29,
		psw: 2.63,
	},
	{
		q: 24.6,
		s: 24.6,
		aer: 8.07,
		aspt: 10.3,
		ccw: 11.4,
		conw: 8.71,
		crg: 10.5,
		csr: 11.5,
		dcf: 6.49,
		dcf2: 8.36,
		earth: 2.26,
		gf: 8.85,
		gs: 14.3,
		hcf: 9.3,
		psw: 10,
	},
	{
		q: 64.2,
		s: 59.3,
		aer: 26.1,
		aspt: 41.6,
		ccw: 44.4,
		conw: 35.3,
		crg: 39.2,
		csr: 38.1,
		dcf: 24.7,
		dcf2: 33.1,
		earth: 2.26,
		gf: 35.7,
		gs: 55.2,
		hcf: 36,
		psw: 37.4,
	},
];
let previouslyLoaded = [] as string[];
export function findImportTime(qual:number) {
	let size = 0;
	let bg = store.get(bgAtom) as keyof (typeof textureSizes)[0];
	let textures = store
		.get(bodiesAtom)
		.map((body) => body.texture as keyof (typeof textureSizes)[0]);
	textures = textures.filter(
		(texture, index) => textures.indexOf(texture) === index
	);
	if (!previouslyLoaded.includes(bg + qual)) {
		size += textureSizes[qual][bg];
		previouslyLoaded.push(bg + qual);
	}
	textures.forEach((texture) => {
		if (!previouslyLoaded.includes(texture + qual)) {
			size += textureSizes[qual][texture];
			previouslyLoaded.push(texture + qual);
		}
	});
	console.log("Import size is ", size, "MB");
	store.set(timeAtom, Math.round((size * 8) / store.get(speedAtom)))
	return Math.round((size * 8) / store.get(speedAtom));
}
//Atoms
export const playingAtom = atom(false);
export const store = createStore();
export const bodiesAtom = atom([] as Body[]);
export const focusAtom = atom(0);
export const trailsAtom = atom([] as Vector3Tuple[][]);
export const forecastBodyStateAtom = atom([] as Body[][]);
export const forecastPositionAtom = atom([] as Vector3Tuple[][]);
export const forecastLimitAtom = atom(10000);
export const trailLimitAtom = atom(10000);
export const animationKeyAtom = atom(-1);
export const gravitationalConstantAtom = atom(6.6743e-2);
export const timeStepAtom = atom(1);
export const elasticitiyAtom = atom(0.8);
export const bodyRefAtom = atom({ current: [] } as React.MutableRefObject<any>);
export const radiusRefAtom = atom({
	current: [],
} as React.MutableRefObject<any>);
export const trailRefAtom = atom({
	current: [],
} as React.MutableRefObject<any>);
export const forecastRefAtom = atom({
	current: [],
} as React.MutableRefObject<any>);
export const colorChangerAtom = atom("#-1");
export const bgLoadedAtom = atom(false);
export const bgAtom = atom("q");
export const bgQual = atom("2");
export const speedAtom = atom(1);
export const timeAtom = atom(1);
//Functions
export function makeDefaultBody(props: object = {}): Body {
	return {
		name: "Body" + store.get(bodiesAtom).length,
		mass: 1000,
		radius: 1,
		position: [0, 0, 0],
		velocity: [0, 0, 0],
		static: false,
		fixedColor: false,
		color: Object.values(theme.nord.aurora)[Math.floor(Math.random() * 5)],
		trail: false,
		trailColor: Object.values(theme.nord.dark)[
			Math.floor(Math.random() * 4)
		],
		texture: "hcf",
		forecast: false,
		forecastColor: Object.values(theme.nord.frost)[
			Math.floor(Math.random() * 4)
		],
		...props,
	};
}
export async function loadPreset(index: number) {
	store.set(playingAtom, false);
	window.cancelAnimationFrame(store.get(animationKeyAtom));
	store.set(animationKeyAtom, -1);
	let trailRefs = store.get(trailRefAtom);
	let forecastRefs = store.get(forecastRefAtom);

	for (let index = 0; index < store.get(bodiesAtom).length; index++) {
		if (trailRefs.current[index]) {
			trailRefs.current[index].geometry.dispose();
			trailRefs.current[index].geometry =
				new THREE.BufferGeometry().setFromPoints([
					new Vector3(0, 0, 0),
				]);
		}

		if (forecastRefs.current[index]) {
			forecastRefs.current[index].geometry.dispose();
			forecastRefs.current[index].geometry =
				new THREE.BufferGeometry().setFromPoints([
					new Vector3(0, 0, 0),
				]);
		}
	}
	store.set(trailRefAtom, { current: [] });
	store.set(bodyRefAtom, { current: [] });
	store.set(forecastRefAtom, { current: [] });
	store.set(forecastBodyStateAtom, []);
	store.set(trailsAtom, []);
	store.set(bodiesAtom, preset[index].data.bodies as Body[]);
	setBodies(preset[index].data.bodies as Body[]);
	init(false, true);
	store.set(colorChangerAtom, "#preset" + index);
}

function main() {
	store.set(bodiesAtom, preset[0].data.bodies as Body[]);
	setBodies(preset[0].data.bodies as Body[]);

	init();
	store.set(colorChangerAtom, "#preset" + 4);

	return;
}

main();
