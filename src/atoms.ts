import { atom, createStore } from "jotai";
import { theme } from "./theme";

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

//Atoms
export const store = createStore()
export const bodiesAtom = atom([] as Body[]);

//Functions
export function makeDefaultBody(props:object={}): Body {
    return {
        name: "Body"+store.get(bodiesAtom).length ,
        mass: 1,
        radius: 1,
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        static: false,
        fixedColor: false,
        color: Object.values(theme.nord.aurora)[Math.floor(Math.random() * 5)],
        trail: false,
        trailColor:Object.values(theme.nord.dark)[Math.floor(Math.random() * 4)],
        forecast: false,
        forecastColor: Object.values(theme.nord.frost)[Math.floor(Math.random() * 4)],
        ...props
    };
}

function main() {
    store.set(bodiesAtom, [makeDefaultBody()]);
}

main();

