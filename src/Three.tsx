import {  useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import {
	bgLoadedAtom,
	bodiesAtom,
	Body,
	bodyRefAtom,
	colorChangerAtom,
	focusAtom,
	forecastRefAtom,
	store,
	trailRefAtom,
} from "./atoms";
import { useEffect, useRef, useState } from "react";
import {OrbitControls } from "@react-three/drei";
import { toggleSimulationPlayState } from "./simulationLoop";
import { Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
// let prevFocus = -1;
// let prevFocusPos = [0, 0, 0];


let bodies= store.get(bodiesAtom);
let bfrefs = Array(bodies.length).fill(null);
let bgLoaded=store.get(bgLoadedAtom)
function Three() {
	const [colorChange] = useAtom(colorChangerAtom);
	console.log("colorChange", colorChange);
	const [playing, setPlaying] = useState(false);
	const [focus, setFocus] = useAtom(focusAtom);
	const [bodyRefs] = useAtom(bodyRefAtom);
	const [trailRefs] = useAtom(trailRefAtom);
	const [forecastRefs] = useAtom(forecastRefAtom);
	
	const camRef = useRef<OrbitControlsImpl>(null);
	function renderSphere(
		props: Body,
		index: number,
		setFocus: CallableFunction,
		focus: number
	) {
		return (
			<mesh
				onClick={() => {
					if (index !== focus) setFocus(index);
					else setFocus(-1);
				}}
				ref={(ref) => {
					bodyRefs.current[index] = ref;
					bfrefs[index] = ref;
				}}
				position={props.position}>
				<sphereGeometry args={[props.radius, 32, 32]} />
				<meshToonMaterial color={props.color} />
			</mesh>
		);
	}
	
	function Cam({ focus }: { focus: number }) {
		// let interaction = false
		let maxDistance =bodies[focus]?bodies[focus].radius*20:100000000
		let minDistance =bodies[focus]?bodies[focus].radius*2:0
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

			}
			
		});
		return (
			<>
				{bodies.length > 0 && (
					<OrbitControls
						ref={(ref)=>{
							camRef.current = ref
							if(!bgLoaded){
								bgLoaded=true
								store.set(bgLoadedAtom,true)
							}
							console.log("in")
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
								: bodies.length > 0
								? new Vector3(...bodies[0].position)
								: new Vector3(0, 0, 0)
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
				setPlaying(toggleSimulationPlayState())
				
				
			}
			if (e.key === "f") {
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
	console.log("render",playing);
	return (
		<>
			<Cam focus={focus} />
			<ambientLight intensity={Math.PI / 2} />
			<spotLight
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
			/>

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
			{!playing&&bodies.map((body, index) => {
				return (
					<line
						key={index}
						ref={(ref) => {
							forecastRefs.current[index] = ref;
							console.log("test")
							
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
