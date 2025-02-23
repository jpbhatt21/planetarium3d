import { useFrame, useLoader } from "@react-three/fiber";
import { useAtom } from "jotai";
import {
	bgLoadedAtom,
	Body,
	bodyRefAtom,
	colorChangerAtom,
	con,
	focusAtom,
	forecastRefAtom,
	loadPreset,
	playingAtom,
	settingsAtom,
	trailRefAtom,
} from "./atoms";
import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { toggleSimulationPlayState } from "./simulationLoop";
import { TextureLoader, Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
	EffectComposer,
	Bloom,
	ToneMapping,
} from "@react-three/postprocessing";
// let prevFocus = -1;
// let prevFocusPos = [0, 0, 0];

let bodies = [] as Body[];
export function setBodies(b: Body[]) {
	bodies = b;
}
let loadChange = true;
let bfrefs = Array(bodies.length).fill(null);
let prevPos = [0, 0, 0];
let bodyLoaded = [] as boolean[];
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
	useEffect(() => {
		if (!loaded && loadChange) {
			bodyLoaded = Array.from({ length: bodies.length }, () => false);
			loadChange = false;
		}
		if (loaded) loadChange = loaded;
	}, [loaded]);
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
		const texture = {} as any;
		if (!props.emmissive) {
			const diff = useLoader(
				TextureLoader,
				"/textures/" +
					name +
					(name == "earth" ? "" : quality + 1) +
					"/diff.jpg"
			);
			const disp = useLoader(
				TextureLoader,
				"/textures/" +
					name +
					(name == "earth" ? "" : quality + 1) +
					"/disp.jpg"
			);
			texture["map"] = diff;
			texture["displacementMap"] = disp;
			if (name !== "earth") {
				const normal = useLoader(
					TextureLoader,
					"/textures/" + props.texture + (quality + 1) + "/nor.jpg"
				);
				const arm = useLoader(
					TextureLoader,
					"/textures/" + props.texture + (quality + 1) + "/arm.jpg"
				);
				texture["normalMap"] = normal;
				texture["roughnessMap"] = arm;
				texture["metalnessMap"] = arm;
				texture["aoMap"] = arm;
			}
		}

		return (
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
					if (bodyLoaded[index] ) return;
					else {
						con.log("Load: Body (" + props.name+")");
						bodyLoaded[index] = true;
					}
				}}
				scale={props.radius}
				position={props.position}>
				<icosahedronGeometry args={[1, 128]} />
				{!props.emmissive ? (
					<meshStandardMaterial
						{...texture}
						displacementScale={0.1}
					/>
				) : (
					<>
						<meshStandardMaterial
							color={props.color}
							emissive={props.emmissionColor}
							emissiveIntensity={props.emmissionIntensity}
						/>

						<pointLight
							position={props.position}
							decay={settings.emmissiveLightDecay}
							intensity={
								props.emmissionIntensity *
								settings.emmissiveLightMultiplier
							}
						/>
					</>
				)}
			</mesh>
		);
	}

	function Cam({ focus }: { focus: number }) {
		// let interaction = false
		let maxDistance = bodies[focus] ? bodies[focus].radius * 20 : 100000000;
		let minDistance = bodies[focus] ? bodies[focus].radius * 1.25 : 0;
		useFrame(() => {
			if (
				focus >= 0 &&
				focus < bodies.length &&
				bfrefs[focus] != null &&
				camRef.current
			) {
				// if(!interaction)
				// 	camRef.current.maxDistance = 100000000
				// else
				// 	camRef.current.maxDistance = maxDistance
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
							// console.log("in")
						}}
						maxDistance={maxDistance}
						minDistance={minDistance}
						// onStart={()=>{interaction=true}}
						// onEnd={()=>{interaction=false}}
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
		document.addEventListener("keydown", (e) => {
			if (e.key === " ") {
				setPlaying(toggleSimulationPlayState());
			}
			if (e.key === "f") {
				loadPreset(0);
				// setFocus((prev)=>{
				// 	let rad=(store.get(bodiesAtom)[prev].radius)
				// 	if(camRef.current)
				// 		camRef.current.maxDistance=rad*8
				// 	return prev
				// })
			}
			if (e.key === "Escape") {
				if (camRef.current) camRef.current.maxDistance = 100000000;
			}
		});
	}, []);
	//console.log("render",playing);
	return (
		<>
			<Cam focus={focus} />
			{settings.ambientLight && (
				<ambientLight intensity={settings.ambientLightIntensity} />
			)}

			{/* <spotLight
				position={[10, 10, 10]}
				angle={0.15}
				penumbra={1}
				decay={0}
				intensity={Math.PI}
			/>
			<pointLight
				position={[-10, -10, -10]}
				decay={0}
				intensity={Math.PI}
			/> */}
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

			{/* <directionalLight
				intensity={Math.PI}
				position={[4, 0, 2]}
				castShadow={true}
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				shadow-camera-left={-2}
				shadow-camera-right={2}
				shadow-camera-top={-2}
				shadow-camera-bottom={2}
				shadow-camera-near={0.1}
				shadow-camera-far={7}
			/> */}

			{bodies.map((body, index) => {
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

			{bodies.map((body, index) =>
				renderSphere(body, index, setFocus, focus)
			)}
			{!playing &&
				bodies.map((body, index) => {
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
