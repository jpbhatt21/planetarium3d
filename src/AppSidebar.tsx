import { useEffect, useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
} from "./components/ui/sidebar";
import { svg } from "./vectors";
import { ChevronDown } from "lucide-react";
import { Input } from "./components/ui/input";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./components/ui/collapsible";
import { useAtom } from "jotai";
import {
	bodiesAtom,
	elasticitiyAtom,
	focusAtom,
	forecastLimitAtom,
	gravitationalConstantAtom,
	timeStepAtom,
    trailLimitAtom,
} from "./atoms";
import { init } from "./simulationLoop";
const spaces = ["Universal Settings", "Bodies", "Presets"];
const separator = (
	<div className="border-t border-primary-foreground w-9/10 self-center mt-1 fadein"></div>
);
function AppSidebar({ open }: { open: boolean }) {
	const [space, setSpace] = useState(0);
	const [anchor, setAnchor] = useAtom(focusAtom);
	const [bodies] = useAtom(bodiesAtom);
	const [G, setG] = useAtom(gravitationalConstantAtom);
	const [DT, setDT] = useAtom(timeStepAtom);
	const [E, setE] = useAtom(elasticitiyAtom);
    const [forecastLimit, setForecastLimit] = useAtom(forecastLimitAtom);
    const [trailLimit, setTrailLimit] = useAtom(trailLimitAtom);
	const [gRef, dtRef, eRef,foreRef,trailRef] = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
	];
	useEffect(() => {
		if (gRef.current) {
			gRef.current.value = G.toExponential(4);
		}
		if (dtRef.current) {
			dtRef.current.value = DT.toString();
		}
		if (eRef.current) {
			eRef.current.value = E.toString();
		}
		console.log(G.toExponential(4));
	}, [G, DT, E,forecastLimit,trailLimit]);
	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader className="flex w-full flex-col justify-center mt-1  items-center">
				{
					<>
						<div
							className=" flex overflow-hidden my-2 flex-row mts duration-200 ease-linear fadein text-xl justify-center"
							style={{
								gap: open ? "0.5rem" : "1px",
							}}>
							{svg.logo({
								height: "30px",
								width: "30px",
							})}
							<label
								className=" duration-200 ease-linear"
								style={{
									opacity: open ? 1 : 0,
									width: open ? "8rem" : "0px",
								}}>
								{" "}
								Planetarium
							</label>
							{/* <label className=" tracking-wider"> Playground</label> */}
						</div>
						{separator}
						<SidebarMenu
							className="w-[18rem] duration-200 ease-linear"
							style={{
								opacity: open ? 1 : 0,
								scale: open ? 1 : 0,
							}}>
							<SidebarMenuItem className="w-full">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuButton className="w-full">
											<label className="min-w-[15rem]">
												{" "}
												{spaces[space]}
											</label>
											<ChevronDown className="ml-auto" />
										</SidebarMenuButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-[18rem]">
										{spaces.map((space, index) => (
											<DropdownMenuItem
												onSelect={() =>
													setSpace(index)
												}>
												<span>{space}</span>
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
						{open && separator}
					</>
				}
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu className="w-full p-2">
					<SidebarMenuItem className="w-full flex items-center justify-between">
						Time Step
						<Input ref={dtRef}
							type="number"
							className="text-end"
							defaultValue={DT}
							onBlur={(e) => {
								let value = parseFloat(e.target.value);
								if (!isNaN(value) && value !== DT) {
									setDT(Math.max(0, value));
									init();
								}
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									let value = parseFloat(
										e.currentTarget.value
									);
									if (!isNaN(value)) {
										setDT(Math.max(0, value));
										init();
									}
								}
							}} />
					</SidebarMenuItem>
					<SidebarMenuItem className="w-full flex items-center justify-between">
						Gravitational Constant
						<Input
							ref={gRef}
							type="number"
							className="text-end"
							defaultValue={G}
							onBlur={(e) => {
								let value = parseFloat(e.target.value);
								if (!isNaN(value) && value !== G) {
									setG(value);
									init();
								}
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									let value = parseFloat(
										e.currentTarget.value
									);
									if (!isNaN(value)) {
										setG(value);
										init();
									}
								}
							}}
						/>
					</SidebarMenuItem>
					<SidebarMenuItem className="w-full flex items-center justify-between">
						Elasticity
						<Input
							type="number"
							className="text-end"
							defaultValue={E}
							ref={eRef}
							onBlur={(e) => {
								let value = parseFloat(e.target.value);
								if (!isNaN(value) && value !== E) {
									setE(Math.min(1, Math.max(0, value)));
									init();
								}
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									let value = parseFloat(
										e.currentTarget.value
									);
									if (!isNaN(value)) {
										setE(Math.min(1, Math.max(0, value)));
										init();
									}
								}
							}}
						/>
					</SidebarMenuItem>
					<SidebarMenuItem className="w-full flex items-center justify-between">
						Forecast Limit
						<Input type="number" className="text-end" ref={foreRef} defaultValue={forecastLimit}
                        onBlur={(e) => {
                            let value = parseFloat(e.target.value);
                            if (!isNaN(value)&&value!==forecastLimit) {
                                setForecastLimit( Math.max(0, value));
                                init();
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                let value = parseFloat(
                                    e.currentTarget.value
                                );
                                if (!isNaN(value)) {
                                    setForecastLimit( Math.max(0, value));
                                    init();
                                }
                            }
                        }}
                        />
					</SidebarMenuItem>
					<SidebarMenuItem className="w-full flex items-center justify-between">
						Trail Limit
						<Input type="number" className="text-end" ref={trailRef} defaultValue={trailLimit}
                        onBlur={(e) => {
                            let value = parseFloat(e.target.value);
                            if (!isNaN(value) && value!==trailLimit) {
                                setTrailLimit( Math.max(0, value));
                                init();
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                let value = parseFloat(
                                    e.currentTarget.value
                                );
                                if (!isNaN(value)) {
                                    setTrailLimit( Math.max(0, value));
                                    init();
                                }
                            }
                        }} />
					</SidebarMenuItem>
					<Collapsible className="mt-1 mb-2" defaultOpen={true}>
						<SidebarMenuItem className="flex flex-col">
							<CollapsibleTrigger className="w-full flex justify-between pr-3 items-center text-start">
								Anchor{" "}
								<label>
									{anchor >= 0 ? bodies[anchor].name : "Free"}
								</label>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub className="py-1 gap-1">
									{/* <SidebarMenuSubButton
										key={-1}
										className="cursor-pointer border"
										onClick={() => {
											
										}}
										style={{
											borderColor:
												0 == anchor
													? "#fff1"
													: "transparent",
										}}>
										{"[Free]"}
									</SidebarMenuSubButton> */}
									{bodies.map((p, i) => {
										return (
											<SidebarMenuSubButton
												key={i}
												className="cursor-pointer border"
												onClick={() => {
													// setVars.anchor(i + 1);
													// setCenter({
													// 	x:
													// 		window.innerWidth /
													// 		2,
													// 	y:
													// 		window.innerHeight /
													// 		2,
													// });
													if(anchor===i){
                                                        setAnchor(-1)
                                                    }
                                                    else{
                                                        setAnchor(i)
                                                    }
												}}
												style={{
													borderColor:
														i == anchor
															? "#fff1"
															: "transparent",
												}}>
												{p.name}
											</SidebarMenuSubButton>
										);
									})}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}

export default AppSidebar;
