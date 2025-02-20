import { Canvas } from "@react-three/fiber";
import { useAtom } from "jotai";
import {
	bodiesAtom,
	Body,
	focusAtom,
	forecastPositionAtom,
	trailsAtom,
} from "./atoms";
import { useEffect, useRef } from "react";
import { Line, OrbitControls } from "@react-three/drei";
import { toggleSimulationPlayState } from "./simulationLoop";
import { Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

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
			position={props.position}>
			<sphereGeometry args={[props.radius, 32, 32]} />
			{/* <meshStandardMaterial color={props.color} /> */}
			<meshToonMaterial color={props.color} />
		</mesh>
	);
}

let altFocus = [0, 0, 0];

function Three() {
	const [bodies] = useAtom(bodiesAtom);
	const [focus, setFocus] = useAtom(focusAtom);
	const [trails] = useAtom(trailsAtom);
	const [forecast] = useAtom(forecastPositionAtom);
	const camRef = useRef<OrbitControlsImpl>(null);
	useEffect(() => {
		if (camRef.current) {
			camRef.current.target =
				focus >= 0 && focus < bodies.length
					? new Vector3(...bodies[focus].position)
					: new Vector3(...altFocus);
			if (focus >= 0 && focus < bodies.length) {
				camRef.current.maxDistance = bodies[focus].radius * 8;

				camRef.current.minDistance = bodies[focus].radius * 2;
				setTimeout(() => {
					if (camRef.current) {
						camRef.current.maxDistance = 100000000;
					}
				}, 10);
			}
		} else {
			let fun = async () => {
				while (!camRef.current) {
					await new Promise((r) => setTimeout(r, 100));
				}
				setFocus(0);
			};
			fun();
		}
		if (focus >= 0 && focus < bodies.length) {
			altFocus = [...bodies[focus].position];
			altFocus[1] += 1;
		}
	}, [focus]);
	useEffect(() => {
		document.addEventListener("keydown", (e) => {
			if (e.key === " ") {
				toggleSimulationPlayState();
			}
			// if (e.key==="r"){

			// 	camRef.current.maxDistance=500
			// 	setTimeout(()=>{
			// 		camRef.current.maxDistance=100000000
			// 	},10)
			// }
			// if (e.key==="f"){
			// 	setFocus((prev)=>{
			// 		let rad=(store.get(bodiesAtom)[prev].radius)
			// 		camRef.current.maxDistance=rad*5
			// 		return prev
			// 	})
			// }
			// if (e.key==="Escape"){
			// 	camRef.current.maxDistance=100000000
			// }
		});
	}, []);
	// if(camRef.current){
	// 	console.log(camRef.current)
	// }
	return (
		<Canvas
			camera={{ far: 100000000, near: 0.1 }}
			className="w-full h-full "
			style={{
				backgroundImage:
					"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" +
					150 +
					"' height='" +
					150 +
					"' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%231b1b1b' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
				backgroundColor: "#09090b",
			}}>
			{bodies.length > 0 && <OrbitControls ref={camRef} enableDamping />}
			{/* <Sky sunPosition={[1,1, 25]} /> */}
			{/* <axesHelper /> */}
			{/* <gridHelper /> */}
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
			{trails.map((trail, index) => {
				return (
					<Line
						points={trail}
						lineWidth={3}
						color={bodies[index].trailColor}
					/>
				);
			})}
			{forecast.map((forecast, index) => {
				return (
					<Line
						points={forecast}
						lineWidth={3}
						color={bodies[index].forecastColor}
					/>
				);
			})}

			{bodies.map((body, index) => renderSphere(body, index, setFocus,focus))}
		</Canvas>
	);
}

export default Three;
