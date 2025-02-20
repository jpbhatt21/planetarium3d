import { useState } from "react"
import AppSidebar from "./AppSidebar"
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar"
import Three from "./Three"
import "./App.css"

function App() {
  const [open, setOpen] = useState(true)
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
      open={open}
      >
      <AppSidebar open={open} />
      <div
				className="fixed duration -300 w-full h-full top-0 ">

      <Three  />
        </div>
        <div
				className="fixed duration-300 top-2"
				style={{
					left: open ? "20rem" : "4rem",
				}}>
				<SidebarTrigger id="sidebarTrig" className=" " />
			</div>
      </SidebarProvider>
     </div>
    </>
  )
}

export default App
