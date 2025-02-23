import { useEffect, useRef, useState } from "react";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import Three from "./Three";
import WebGL from 'three/addons/capabilities/WebGL.js';

import "./App.css";
import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { svg } from "./vectors";
import { useAtom } from "jotai";
import {
	bgLoadedAtom,
	con,
	consoleText,
	findImportTime,
	settingsAtom,
	speedAtom,
	store,
	timeAtom,
} from "./atoms";
import { Textarea } from "./components/ui/textarea";
let init: any = new Date().getTime();
let init2: any = new Date().getTime();
fetch("/files/1mb.txt",{
	cache: "no-store"
}).then(() => {
	let now = new Date().getTime();
	let diff = now - init2;
	let speed = 1 / (diff / 1024);
	store.set(speedAtom, speed);
	con.log("Connection Speed: ", (speed/8).toFixed(2), "  MB/s (est.)");
	con.log("Load Time: ", (findImportTime(1)*1000).toFixed(0), " ms (est.)");
});
const isWebGLAvailable = WebGL.isWebGL2Available();
let loaderInterval: any = null;
function App() {
	if(!isWebGLAvailable){
		return <div
		className="fixed w-full flex flex-col pointer-events-none duration-200 transition-opacity  ease-linear gap-2 items-center justify-center h-full z-10 bg-background"
		>
		<div className=" flex overflow-hidden my-2 w-64 flex-row mts  ease-linear gap-2 text-xl justify-center items-center">
			{svg.logo({
				height: "50px",
				width: "50px",
			})}
			<label className=" duration-200 text-3xl ease-linear">
				{" "}
				Planetarium
			</label>
			
			{/* <label className=" tracking-wider"> Playground</label> */}
		</div>
		<label>WebGL support not found</label>
			<label>Turn Hardware/GPU acceleration ON</label>
			<label>or update/switch your browser</label>
		</div>
	}
	const [open, setOpen] = useState(true);
	const [conText]= useAtom(consoleText)
	const cons = useRef<HTMLDivElement>(null);
	const [loaded] = useAtom(bgLoadedAtom);
	const loader = useRef<HTMLDivElement>(null);
	const timeRemaining = useRef<HTMLLabelElement>(null);
	const [settings] = useAtom(settingsAtom);
	const bg = settings.background
	const bgQ = settings.textureQuality
	const [time] = useAtom(timeAtom);
	const [showConsole, setShowConsole] = useState(false);
	useEffect(()=>{
		if(cons.current){
			cons.current.scrollTop = cons.current.scrollHeight
		}
	},[conText.length])
	useEffect(() => {

		if(time<0)
			return
		if (loaded) {
			let now = new Date().getTime();
			let diff = now - init;
			con.log("Loading took ", diff, " ms");
			clearInterval(loaderInterval);
			if (loader.current) loader.current.style.width = "100%";
		} else {
			init = new Date().getTime();
			loaderInterval = setInterval(() => {
				if (loader.current) {
					let perct = (new Date().getTime() - init) / (10 * time);
					loader.current.style.width =
						(perct >= 98 ? 98 : perct) + "%";
					
				}
				if (timeRemaining.current) {
					let timeLeft = time*1 - (new Date().getTime() - init) / 1000;
					if (timeLeft > 0) {
						timeRemaining.current.innerText =
							"Time Remaining: " + timeLeft.toFixed(0) + "s";
					} else {
						timeRemaining.current.innerText = "Almost There";
					}
				}
			}, 100);
		}
	}, [loaded, time]);
	useEffect(() => {
		window.addEventListener("keydown", (e) => {
			if (e.key === "`") {
				setShowConsole((prev) => !prev);
			}
		}
		);
	}, []);
	if(time<0)
		return <></>
	return (
		<>
			<div className="fixed h-full w-full flex items-center justify-center text-white flex-col">
				<SidebarProvider
					style={
						{
							["--sidebar-width" as string]: "20rem",
							["--sidebar-width-mobile" as string]: "20rem",
						} as React.CSSProperties
					}
					onOpenChange={(isOpen) => setOpen(isOpen)}
					open={open}>
					<AppSidebar open={open} />
					<div className="fixed duration -300 w-full h-full top-0 ">
						<Canvas
							camera={{ far: 100000000, near: 0.1, fov: 75 }}
							className="w-full h-full "
							style={{
								backgroundColor: "#09090b",
							}}>
							<Environment
								files={"/files/" + bg + "" + (bgQ+1) + ".hdr"}
								background
								
								environmentIntensity={1}
							/>
							<Three />
						</Canvas>
					</div>
					<div
						className="fixed duration-300 top-2"
						style={{
							left: open ? "20rem" : "4rem",
						}}>
						<SidebarTrigger id="sidebarTrig" className=" " />
					</div>
					<div
						className="fixed w-full flex flex-col pointer-events-none duration-200 transition-opacity  ease-linear gap-2 items-center justify-center h-full z-10 bg-background"
						style={{
							opacity: loaded ? 0 : 1,
							pointerEvents: loaded ? "none" : "all",
						}}>
						<div className=" flex overflow-hidden my-2 w-64 flex-row mts  ease-linear gap-2 text-xl justify-center items-center">
							{svg.logo({
								height: "50px",
								width: "50px",
							})}
							<label className=" duration-200 text-3xl ease-linear">
								{" "}
								Planetarium
							</label>
							{/* <label className=" tracking-wider"> Playground</label> */}
						</div>
						<div className="flex items-center gap-1 text-muted-foreground  justify-center w-64">
							<div className="w-full border"></div>
							<label className="min-w-fit mts">
								Loading Assets
							</label>
							<div className="w-full border"></div>
						</div>
						<div className="w-64 h-2 border rounded-full overflow-hidden">
							<div
								ref={loader}
								className="w-0 duration-100 h-full bg-border"></div>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground mt-1  justify-center w-64">
							<div className="w-full border"></div>
							<label
								ref={timeRemaining}
								className="min-w-fit text-muted-foreground mts text-xs">
								Time Remaining: 0s
							</label>
							<div className="w-full border"></div>
						</div>
					</div>
					<div ref={cons} className="fixed flex flex-col z-20 bottom-2 right-2 w-96  overflow-y-scroll overflow-x-hidden outline rounded-sm p-2 max-h-80 resize-none bg-background"
					style={{
						opacity: showConsole ? 1 : 0,
						pointerEvents: showConsole ? "all" : "none",
						transition: "opacity 0.3s"
					}}
					>
						
							
						{
							conText.map((text, i) => (
								
								
									<>
									<div className="w-full flex items-center gap-1">
									<label key={i} className="text-xs w-10 text-end text-muted-foreground">{text.split("|||")[0]}</label>
									<Textarea value={text.split("|||")[1]} readOnly className="w-80 border-0 align-text-top resize-none min-h-fit max-h-fit cursor-default" /></div>
									</>
								
							))
						}

					</div>
				</SidebarProvider>
			</div>
		</>
	);
}

export default App;
