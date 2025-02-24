import { useFrame, useLoader } from "@react-three/fiber";
import { useAtom } from "jotai";
import {
	bgLoadedAtom,
	bodiesAtom,
	Body,
	bodyRefAtom,
	colorChangerAtom,
	con,
	focusAtom,
	forecastRefAtom,
	playingAtom,
	settingsAtom,
	trailRefAtom,
} from "./atoms";
import { useEffect, useRef } from "react";
import { OrbitControls, Shadow, Stats } from "@react-three/drei";
import {
	getForecastPosition,
	getNextState,
	getTrails,
	setNextState,
	updateBodies,
} from "./simulationLoop";
import { TextureLoader, Vector3, Vector3Tuple } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
	EffectComposer,
	Bloom,
	ToneMapping,
} from "@react-three/postprocessing";
import * as THREE from "three";

let bodies = [] as Body[];
export function setBodies(b: Body[]) {
	bodies = b;
}
let loadChange = true;
let bfrefs = Array(bodies.length).fill(null);
let prevPos = [0, 0, 0];
let bodyLoaded = [] as boolean[];
let pl = false;
let trails = [] as Vector3Tuple[][];
let forecastPosition = [] as Vector3Tuple[][];
const lightRef = {
	current: {},
} as React.MutableRefObject<any>;
let used:string[] = [];
let textures: any = {
	diff: {},
	disp: {},
	arm: {},
	nor:{}
};
function getTexture(name: string, quality: number, last: boolean = false) {
	if (!textures.diff[name + quality]) {
		textures.diff[name + quality] = useLoader(
			TextureLoader,
			"/files/textures/" +
				name +
				(name == "earth" ? "" : quality + 1) +
				"/diff.jpg"
		);
		
	}
	if (!textures.disp[name + quality]) {
		textures.disp[name + quality] = useLoader(
			TextureLoader,
			"/files/textures/" +
				name +
				(name == "earth" ? "" : quality + 1) +
				"/disp.jpg"
		);
	}
	if(name != "earth"){
		if (!textures.nor[name + quality]) {
			textures.nor[name + quality] = useLoader(
				TextureLoader,
				"/files/textures/" + name + (quality + 1) + "/nor.jpg"
			);
		}
		if (!textures.arm[name + quality]) {
			textures.arm[name + quality] = useLoader(
				TextureLoader,
				"/files/textures/" +  name + (quality + 1) + "/arm.jpg"
			);
		}
	}
	used.push((name +""+ quality).toString());
	if (last) {
		Object.keys(textures.diff).forEach((key) => {
			if (!used.includes(key)) {
				try{
				textures.diff[key].dispose();
				textures.disp[key].dispose();
				}
				catch(e){}
				delete textures.diff[key];
				delete textures.disp[key];
				if(textures.nor[key]) {
					try{
					textures.nor[key].dispose();
					textures.arm[key].dispose();
					}
					catch(e){}
					delete textures.nor[key];
				 delete textures.arm[key];}
			}});
		used = [];
		
	}
		
	return {
		map: textures.diff[name + quality],
		displacementMap: textures.disp[name + quality],
		normalMap: textures.nor[name + quality],
		aoMap: textures.arm[name + quality],
		roughnessMap: textures.arm[name + quality],
		metalnessMap: textures.arm[name + quality],
	}

}
function Three() {
	const [colorChange] = useAtom(colorChangerAtom);
	useEffect(() => {
		if (colorChange) {
		}
	}, [colorChange]);
	const [loaded, setLoaded] = useAtom(bgLoadedAtom);
	const [settings] = useAtom(settingsAtom);
	const quality = settings.textureQuality;
	const [playing, setPlaying] = useAtom(playingAtom);
	const [focus, setFocus] = useAtom(focusAtom);
	const [bodies2, setBodies2] = useAtom(bodiesAtom);
	useEffect(() => {
		if (!loaded && loadChange) {
			bodyLoaded = Array.from({ length: bodies.length }, () => false);
			loadChange = false;
		}
		if (loaded) loadChange = loaded;
	}, [loaded]);
	useEffect(() => {
		bodies = [...bodies2];
		updateBodies();
		used = [];
	}, [bodies2]);
	const [bodyRefs] = useAtom(bodyRefAtom);
	const [trailRefs] = useAtom(trailRefAtom);
	const [forecastRefs] = useAtom(forecastRefAtom);
	con.log("Refresh: Scene");
	const camRef = useRef<OrbitControlsImpl>(null);
	function renderSphere(
		props: Body,
		index: number,
		setFocus: CallableFunction,
		focus: number
	) {
		const name = props.texture;
		
		return (
			<>
				<mesh
					onClick={() => {
						if (index !== focus) setFocus(index);
						else setFocus(-1);
					}}
					castShadow
					
					receiveShadow
					ref={(ref) => {
						bodyRefs.current[index] = ref;
						bfrefs[index] = ref;
						if (bodyLoaded[index]) return;
						else {
							con.log("Load: Body (" + props.name + ")");
							bodyLoaded[index] = true;
						}
					}}
					scale={props.radius}
					position={props.position}>
					<icosahedronGeometry  args={[1, 128]} />
					{!props.emmissive ? (
						<meshStandardMaterial
							{...getTexture(name, quality, index == bodies.length - 1)}
							displacementScale={0.1}
						/>
					) : (
						<>
							<meshStandardMaterial
							
								color={props.color}
								emissive={props.emmissionColor}
								emissiveIntensity={props.emmissionIntensity}
							/>
						</>
					)}
				</mesh>
				{props.emmissive && (
					<pointLight
						position={[...props.position]}
						ref={(ref) => {
							lightRef.current[index] = ref;
						}}
						castShadow
						decay={settings.emmissiveLightDecay}
						intensity={
							props.emmissionIntensity *
							settings.emmissiveLightMultiplier
						}
						color={props.emmissionColor}
					>
						<Shadow
							color={props.emmissionColor}
						
						/>
						</pointLight>
				)}
			</>
		);
	}

	function Cam({ focus }: { focus: number }) {
		let maxDistance = bodies[focus] ? bodies[focus].radius * 20 : 100000000;
		let minDistance = bodies[focus] ? bodies[focus].radius * 1.25 : 0;
		useFrame(() => {
			if (playing) {
				trails = getTrails();
				bodies = getNextState();
				bodies.map((body, index) => {
					if (bodyRefs.current[index]) {
						bodyRefs.current[index].position.set(...body.position);

						bodyRefs.current[index].scale.set(
							body.radius,
							body.radius,
							body.radius
						);
					}
					if (body.emmissive && lightRef.current[index]) {
						lightRef.current[index].position.set(...body.position);
					}
					if (trailRefs.current[index]) {
						trailRefs.current[index].geometry.dispose();
						trailRefs.current[index].geometry =
							new THREE.BufferGeometry().setFromPoints([
								...trails[index].map((x) => new Vector3(...x)),
								new Vector3(...body.position),
							]);
					}
				});
			} else {
				forecastPosition = getForecastPosition();
				bodies.map((body, index) => {
					if (
						forecastRefs.current[index] &&
						!(body.static || (body.mass == 0 && body.radius == 0))
					) {
						forecastRefs.current[index].geometry.dispose();
						forecastRefs.current[index].geometry =
							new THREE.BufferGeometry().setFromPoints([
								...forecastPosition[index].map(
									(x) => new Vector3(...x)
								),
							]);
					}
				});
			}
			if (
				focus >= 0 &&
				focus < bodies.length &&
				bfrefs[focus] != null &&
				camRef.current
			) {
				camRef.current.target = new Vector3(...bfrefs[focus].position);
				prevPos = bfrefs[focus].position;
			}
		});
		return (
			<>
				{bodies.length > 0 && (
					<OrbitControls
						ref={(ref) => {
							camRef.current = ref;
							if (!loaded) {
								setLoaded(true);
								con.log("Load: Environment");
							}
						}}
						maxDistance={maxDistance}
						minDistance={minDistance}
						
						target={
							focus >= 0 &&
							focus < bodies.length &&
							bfrefs[focus] != null
								? new Vector3(...bfrefs[focus].position)
								: new Vector3(...prevPos)
						}
						enablePan={focus < 0 || focus >= bodies.length}
					/>
				)}
			</>
		);
	}
	useEffect(() => {
		pl = playing;
	}, [playing]);
	useEffect(() => {
		document.addEventListener("keydown", (e) => {
			if (e.key === " ") {
				setPlaying(!pl);
				pl = !pl;
				if (!pl) {
					setBodies2(bodies);
				} else {
					setNextState();
				}
			}
			if (e.key === "Escape") {
				if (camRef.current) camRef.current.maxDistance = 100000000;
			}
		});
	}, []);
	return (
		<>
			<Stats />
			<Cam focus={focus} />
			{settings.ambientLight && (
				<ambientLight intensity={settings.ambientLightIntensity} />
			)}
			{settings.bloom && (
				<EffectComposer>
					<Bloom
						mipmapBlur
						luminanceThreshold={1}
						levels={8}
						intensity={settings.bloomIntensity}
					/>
					<ToneMapping />
				</EffectComposer>
			)}
			{bodies2.map((body, index) => {
				return (
					<line
						key={index}
						ref={(ref) => {
							trailRefs.current[index] = ref;
						}}>
						<bufferGeometry />
						<lineBasicMaterial color={body.trailColor} />
					</line>
				);
			})}
			{bodies2.map((body, index) =>
				renderSphere(body, index, setFocus, focus)
			)}
			{!playing &&
				bodies2.map((body, index) => {
					return (
						<line
							key={index}
							ref={(ref) => {
								forecastRefs.current[index] = ref;
								// console.log("test")
							}}>
							<bufferGeometry />
							<lineBasicMaterial color={body.forecastColor} />
						</line>
					);
				})}
		</>
	);
}

export default Three;
