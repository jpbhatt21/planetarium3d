import { atom, createStore } from "jotai";
import { theme } from "./theme";
import { Vector3Tuple } from "three";
import { init } from "./simulationLoop";

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
}
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
					static: false,
					fixedColor: true,
					color: "#5e81ac",
					trail: true,
					trailColor: "#8fbcbb",
					forecast: true,
					forecastColor: "#81a1c1",
				},
			],
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
					trailColor: "#4c566a",
					forecast: true,
					forecastColor: "#a3be8c",
				},
			],
		},
	},
];

//Atoms
export const store = createStore();
export const bodiesAtom = atom([] as Body[]);
export const focusAtom = atom(-2);
export const trailsAtom = atom([] as Vector3Tuple[][]);
export const forecastBodyStateAtom = atom([] as Body[][]);
export const forecastPositionAtom = atom([] as Vector3Tuple[][]);
export const forecastLimitAtom = atom(10000);
export const trailLimitAtom = atom(10000);
export const animationKeyAtom = atom(-1);
export const gravitationalConstantAtom = atom(6.6743e-5);
export const timeStepAtom = atom(10);
export const elasticitiyAtom = atom(0.8);

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
		forecast: false,
		forecastColor: Object.values(theme.nord.frost)[
			Math.floor(Math.random() * 4)
		],
		...props,
	};
}

function main() {
	store.set(bodiesAtom, preset[4].data.bodies as Body[]);
    init();
	
	return;
}

main();
