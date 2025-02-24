import { atom, createStore } from "jotai";
import { theme } from "./theme";
import { Vector3, Vector3Tuple } from "three";
import { init, sleep } from "./simulationLoop";
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
	emmissive: boolean;
	emmissionColor: string;
	emmissionIntensity: number;
}
export const version = "1.1.0";
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
			dt: 1,
			G: 0.0667,
			e: 0.99,
			scale: 0.5,
			anchor: 0,
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
			dt: 1,
			G: 0.0667,
			e: 0.99,
			scale: 0.5,
			anchor: 0,
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
			dt: 1,
			G: 0.0667,
			e: 0.99,
			scale: 0.5,
			anchor: 0,
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
					emmissionIntensity: 4,
					emmissive: !false,
					emmissionColor: "#b2b2b2",
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
			dt: 1,
			G: 0.0667,
			e: 0.99,
			scale: 1,
			anchor: 0,
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
			dt: 75.75,
			G: 0.00000154,
			e: 0.036,
			anchor: 3,
			bodies: [
				{
					name: "sun",
					mass: 33300000,
					radius: 1090,
					position: [0, 0, 0],
					velocity: [0, 0, 0],
					static: true,
					fixedColor: true,
					color: "#d3a645",
					trail: true,
					emmissionIntensity: 3,
					emmissive: true,
					emmissionColor: "#d3a645",
					texture: "hcf",
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				},
				{
					name: "mercury",
					mass: 5.5,
					radius: 3.83,
					position: [0, 0, 9092],
					velocity: [0.0737, 0, 0],
					static: false,
					fixedColor: true,
					color: "#a6943a",
					trail: true,
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
					texture: "gs",
					trailColor: "#2e3440",
					forecast: true,
					forecastColor: "#868446",
				},
				{
					name: "venus",
					mass: 81.5,
					radius: 9.49,
					position: [0, 0, 16985],
					velocity: [0.0549, 0, 0],
					static: false,
					fixedColor: true,
					color: "#ebcb8b",
					trail: true,
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
					texture: "conw",
					trailColor: "#3b4252",
					forecast: true,
					forecastColor: "#ebcb8b",
				},
				{
					name: "earth",
					mass: 100,
					radius: 10,
					position: [0, 0, 23480],
					velocity: [0.0467, 0, 0],
					static: false,
					fixedColor: true,
					color: "#629bd0",
					trail: true,
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
					texture: "earth",
					trailColor: "#434c5e",
					forecast: true,
					forecastColor: "#8d9cbf",
				},
				{
					name: "moon",
					mass: 1.23,
					radius: 2.72,
					position: [0, 0, 23540.26],
					velocity: [0.0467, 0.0014, 0.00015],
					static: false,
					fixedColor: true,
					color: "#629bd0",
					trail: true,
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
					texture: "hcf",
					trailColor: "#434c5e",
					forecast: true,
					forecastColor: "#8d9cbf",
				},
				{
					name: "mars",
					mass: 10.7,
					radius: 5,
					position: [0, 0, 35772],
					velocity: [0.0376, 0, 0],
					static: false,
					fixedColor: true,
					color: "#e05252",
					trail: true,
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
					texture: "crg",
					trailColor: "#4c566a",
					forecast: true,
					forecastColor: "#c86f6f",
				},
				{
					name: "jupiter",
					mass: 317800,
					radius: 110,
					position: [0, 0, 122223],
					velocity: [0.0205, 0, 0],
					static: false,
					fixedColor: true,
					color: "#dfd1b3",
					trail: true,
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
					texture: "gf",
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
			dt: 1,
			G: 0.0667,
			e: 0.99,
			scale: 0.5,
			anchor: 0,
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
					emmissionIntensity: 4,
					emmissive: false,
					emmissionColor: "#b2b2b2",
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
function measureSpeed() {
	let init2: any = new Date().getTime();
	fetch("/files/1mb.txt", {
		cache: "no-store",
	}).then(() => {
		let now = new Date().getTime();
		let diff = (now - init2) / 1000;
		let speed = 1 / diff;
		console.log(speed);
		con.log("Est. Conn. ", speed.toFixed(2), " MB/s");
		store.set(speedAtom, speed);
	});
}
export async function findImportTime(
	qual: number = store.get(settingsAtom).textureQuality
) {
	measureSpeed();
	let speed = store.get(speedAtom);
	if (speed < 0) {
		await sleep(100);
		speed = store.get(speedAtom);
	}
	let size = 0;
	let bg = store.get(settingsAtom)
		.background as keyof (typeof textureSizes)[0];
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
	con.log("Texture Size ", size.toFixed(2), "MB");
	let time = size / speed;
	store.set(timeAtom, Math.round(time));
	con.log("Est. Load ", time.toFixed(2), "s");
}
//Atoms
export const settingsAtom = atom({
	timeStep: 1,
	gravitationalConstant: 6.6743e-2,
	elasticitiy: 0.8,
	forecastLimit: 10000,
	trailLimit: 10000,
	background: "q",
	textureQuality: 0,
	bloom: true,
	bloomIntensity: 0.3,
	ambientLight: true,
	ambientLightIntensity: 4,
	emmissiveLightMultiplier: 10,
	emmissiveLightDecay: 0.1,
	preset: 4,
});
export const consoleText = atom(["|||Welcome to Planetarium!"]);
let prevLine = {
	content: "Welcome to Planetarium!",
	count: 1,
};
export const con = {
	log: (...text: any) => {
		text = text.join("");
		let conText = store.get(consoleText);
		if (prevLine.content == text) {
			prevLine.count++;
			conText[conText.length - 1] =
				new Date().toLocaleTimeString() +
				"|||" +
				prevLine.content +
				" (" +
				prevLine.count +
				")";
		} else {
			prevLine = { content: text, count: 1 };
			conText.push(new Date().toLocaleTimeString() + "|||" + text);
		}
		store.set(consoleText, conText);
	},
};
export const playingAtom = atom(false);
export const store = createStore();
export const bodiesAtom = atom([] as Body[]);
export const focusAtom = atom(0);
export const trailsAtom = atom([] as Vector3Tuple[][]);
export const forecastBodyStateAtom = atom([] as Body[][]);
export const forecastPositionAtom = atom([] as Vector3Tuple[][]);
export const bodyRefAtom = atom({ current: [] } as React.MutableRefObject<any>);
export const trailRefAtom = atom({
	current: [],
} as React.MutableRefObject<any>);
export const forecastRefAtom = atom({
	current: [],
} as React.MutableRefObject<any>);
export const colorChangerAtom = atom("#-1");
export const bgLoadedAtom = atom(false);
export const speedAtom = atom(-1);
export const timeAtom = atom(-1);

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
		trail: true,
		emmissionIntensity: 4,
		emmissive: false,
		emmissionColor: "#b2b2b2",
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
export async function loadPreset(index: number, data: any = null) {
	store.set(playingAtom, false);
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
	let select = preset[0].data;
	if (data) {
		select = data;
	} else {
		select = preset[index].data;
	}
	store.set(bodiesAtom, select.bodies as Body[]);
	setBodies(select.bodies as Body[]);
	store.set(settingsAtom, (prev) => ({
		...prev,
		timeStep: select.dt,
		gravitationalConstant: select.G,
		elasticitiy: select.e,
	}));
	store.set(focusAtom, select.anchor);
	init(false, true);
	store.set(colorChangerAtom, "#preset" + index);
}
export function addNewBody(body: Body) {
	let bodies = store.get(bodiesAtom);
	store.set(playingAtom, false);
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
	bodies.push(body);
	store.set(bodiesAtom, bodies);
	setBodies(bodies);
	init(false, true);
}
function main() {
	loadPreset(store.get(settingsAtom).preset);

	init();
	// store.set(colorChangerAtom, "#preset" + 0);

	return;
}
findImportTime();
main();
