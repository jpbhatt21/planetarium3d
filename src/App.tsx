import { useEffect, useState } from "react";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import Three from "./Three";
import "./App.css";
import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { svg } from "./vectors";
import { useAtom } from "jotai";
import { bgAtom, bgLoadedAtom, bgQual } from "./atoms";
let init:any=new Date().getTime()
function App() {
	const [open, setOpen] = useState(true);
  const [loaded] = useAtom(bgLoadedAtom)
  const [bg]=useAtom(bgAtom)
  const [bgQ]=useAtom(bgQual)
  useEffect(() => {
   
    if(loaded){
      let now = new Date().getTime()
      let diff = now-init
    console.log("Loading took ",diff,"ms")
    }
    else{
      init=new Date().getTime()
    }
  }
  ,[loaded])
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
								files={"/"+bg+""+bgQ+".hdr"}
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
					<div className="fixed w-full flex flex-col pointer-events-none duration-200 transition-opacity  ease-linear gap-2 items-center justify-center h-full z-10 bg-background"
          style={{
            opacity: loaded?0:1,
            pointerEvents: loaded?"none":"all"
          }}
          >
						<div
							className=" flex overflow-hidden my-2 w-64 flex-row mts  ease-linear gap-2 text-xl justify-center items-center"
							>
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
                <label className="min-w-fit mts">Loading Assets</label>
                <div className="w-full border"></div>
              </div>
					</div>
				</SidebarProvider>
			</div>
		</>
	);
}

export default App;
