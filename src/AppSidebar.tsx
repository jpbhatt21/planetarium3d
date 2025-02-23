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
	SidebarMenuSubItem,
} from "./components/ui/sidebar";
import { svg } from "./vectors";
import { ChevronDown, Copy, Delete } from "lucide-react";
import { Input } from "./components/ui/input";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./components/ui/collapsible";
import { useAtom } from "jotai";
import {
	bgAtom,
	bgLoadedAtom,
	bgQual,
	bodiesAtom,
	bodyRefAtom,
	colorChangerAtom,
	elasticitiyAtom,
	findImportTime,
	focusAtom,
	forecastLimitAtom,
	gravitationalConstantAtom,
	loadPreset,
	planetTextures,
	preset,
	store,
	timeStepAtom,
	trailLimitAtom,
} from "./atoms";
import { init } from "./simulationLoop";
import { Checkbox } from "./components/ui/checkbox";
const spaces = ["Universal Settings", "Bodies", "Presets"];
const separator = (
	<div className="border-t border-primary-foreground w-9/10 self-center mt-1 fadein"></div>
);
const bgNames = [
	{
		name: "Space",
		code: "q",
	},
	{
		name: "Nebula",
		code: "s",
	},
];
const quality = [
	{
		level: "Low",
		code: "1",
	},
	{
		level: "Medium",
		code: "2",
	},
	{
		level: "High",
		code: "3",
	},
];
function AppSidebar({ open }: { open: boolean }) {
	const [space, setSpace] = useState(0);
	const [anchor, setAnchor] = useAtom(focusAtom);
	const [bodies, setBodies] = useAtom(bodiesAtom);
	const [openArr, setOpenArr] = useState(Array(bodies.length).fill(true));
	const [G, setG] = useAtom(gravitationalConstantAtom);
	const [DT, setDT] = useAtom(timeStepAtom);
	const [E, setE] = useAtom(elasticitiyAtom);
	const [forecastLimit, setForecastLimit] = useAtom(forecastLimitAtom);
	const [trailLimit, setTrailLimit] = useAtom(trailLimitAtom);
	const [_, setColorChange] = useAtom(colorChangerAtom);
	const [__, setLoaded] = useAtom(bgLoadedAtom);
	const [bg, setBG] = useAtom(bgAtom);
	const [bgQ, setBGQ] = useAtom(bgQual);
	const [gRef, dtRef, eRef, foreRef, trailRef] = [
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
		// console.log(G.toExponential(4));
	}, [G, DT, E, forecastLimit, trailLimit]);
	return (
		<Sidebar
			collapsible="icon"
			variant="floating"
			className="overflow-hidden">
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
							<SidebarMenuItem className="w-full flex">
								<SidebarMenuButton
									className="w-fit pl-1"
									onClick={() => {
										setSpace((prev) => {
											return (
												(prev + spaces.length - 1) %
												spaces.length
											);
										});
									}}>
									<ChevronDown className="rotate-90" />
								</SidebarMenuButton>
								<DropdownMenu>
									<div className="w-full flex items-center">
										<DropdownMenuTrigger
											className="w-full"
											asChild>
											<SidebarMenuButton className="w-full  ">
												<label className="w-full text-center">
													{spaces[space]}
												</label>
											</SidebarMenuButton>
										</DropdownMenuTrigger>
									</div>
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
								<SidebarMenuButton
									className="w-fit pl-1 rotate-180"
									onClick={() => {
										setSpace((prev) => {
											return (prev + 1) % spaces.length;
										});
									}}>
									<ChevronDown className="rotate-90" />
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
						{open && separator}
					</>
				}
			</SidebarHeader>
			<div className="w-full overflow-hidden">
				<SidebarContent
					className="w-[300%] h-full text-nord-light-300 flex flex-row  overflow-hidden "
					style={{
						width: `${spaces.length * 100}%`,
						transform: `translateX(${
							(space * -100) / spaces.length
						}%)`,
						transition: "transform 0.3s ease-in-out",
					}}>
					<SidebarMenu className="w-full p-2 overflow-y-auto">
						<SidebarMenuItem className="w-full flex items-center justify-between">
							Time Step
							<Input
								ref={dtRef}
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
								}}
							/>
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
											setE(
												Math.min(1, Math.max(0, value))
											);
											init();
										}
									}
								}}
							/>
						</SidebarMenuItem>
						<SidebarMenuItem className="w-full flex items-center justify-between">
							Forecast Limit
							<Input
								type="number"
								className="text-end"
								ref={foreRef}
								defaultValue={forecastLimit}
								onBlur={(e) => {
									let value = parseFloat(e.target.value);
									if (
										!isNaN(value) &&
										value !== forecastLimit
									) {
										setForecastLimit(Math.max(0, value));
										init();
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										let value = parseFloat(
											e.currentTarget.value
										);
										if (!isNaN(value)) {
											setForecastLimit(
												Math.max(0, value)
											);
											init();
										}
									}
								}}
							/>
						</SidebarMenuItem>
						<SidebarMenuItem className="w-full flex items-center justify-between">
							Trail Limit
							<Input
								type="number"
								className="text-end"
								ref={trailRef}
								defaultValue={trailLimit}
								onBlur={(e) => {
									let value = parseFloat(e.target.value);
									if (!isNaN(value) && value !== trailLimit) {
										setTrailLimit(Math.max(0, value));
										init();
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										let value = parseFloat(
											e.currentTarget.value
										);
										if (!isNaN(value)) {
											setTrailLimit(Math.max(0, value));
											init();
										}
									}
								}}
							/>
						</SidebarMenuItem>
						<Collapsible className="mt-1 mb-2" defaultOpen={true}>
							<SidebarMenuItem className="flex flex-col">
								<CollapsibleTrigger className="w-full flex justify-between pr-3 items-center text-start">
									Anchor{" "}
									<label>
										{anchor >= 0
											? bodies[anchor].name
											: "Free"}
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
														if (anchor === i) {
															setAnchor(-1);
														} else {
															setAnchor(i);
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
						<Collapsible className="mt-1 mb-2" defaultOpen={true}>
							<SidebarMenuItem className="flex flex-col">
								<CollapsibleTrigger className="w-full flex justify-between pr-3 items-center text-start">
									Background{" "}
									<label>
										{bgNames.map((x) => {
											return x.code == bg ? x.name : "";
										})}
									</label>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub className="py-1 gap-1">
										{bgNames.map((p, i) => {
											return (
												<SidebarMenuSubButton
													key={i}
													className="cursor-pointer border"
													onClick={() => {
														setBG(p.code);
														findImportTime(parseInt(bgQ)-1)
														setLoaded(false);
													}}
													style={{
														borderColor:
															p.code == bg
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
						<Collapsible className="mt-1 mb-2" defaultOpen={true}>
							<SidebarMenuItem className="flex flex-col">
								<CollapsibleTrigger className="w-full flex justify-between pr-3 items-center text-start">
									Texture Quality{" "}
									<label>
										{quality.map((x) => {
											return x.code == bgQ ? x.level : "";
										})}
									</label>
								</CollapsibleTrigger>
								<CollapsibleContent className=" flex w-full py-2 gap-1">
									{quality.map((p, i) => {
										return (
											<SidebarMenuSubButton
												key={i}
												className="cursor-pointer w-full rounded-sm  flex items-center justify-center border"
												onClick={() => {
													setBGQ(p.code);
													findImportTime(parseInt(p.code)-1)
													setLoaded(false);
												}}
												style={{
													borderColor:
														p.code == bgQ
															? "#fff1"
															: "transparent",
												}}>
												{p.level}
											</SidebarMenuSubButton>
										);
									})}
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					</SidebarMenu>
					<SidebarMenu className="w-full pr-2 pb-4 overflow-y-auto ">
						{bodies.map((body, index) => (
							<Collapsible
								key={index}
								open={openArr[index]}
								onOpenChange={(isOpen) =>
									setOpenArr((prev) => {
										let temp = [...prev];
										temp[index] = isOpen;
										return temp;
									})
								}>
								<SidebarMenuItem className="flex flex-col">
									<div className="w-full flex justify-between  items-center text-start">
										<Input
											type="text"
											value={body.name}
											className=" cursor-default focus-within:cursor-text "
											style={{
												outline: "none",
												border: "none",
												boxShadow: "none",
											}}
											id={"nameInput" + index}
											onClick={() => {
												// e.currentTarget.blur();
											}}
											onChange={(e) => {
												setBodies((prev) => {
													let temp = [...prev];
													temp[index].name =
														e.target.value;
													return temp;
												});
											}}
										/>
										<div className="flex items-center gap-1">
											<SidebarMenuButton
												className=" items-center justify-center w-5 h-5"
												onClick={(e) => {
													e.preventDefault();
													//dupe
												}}>
												<Copy className=" text-nord-aurora-green scale-75" />
											</SidebarMenuButton>
											<SidebarMenuButton
												className="w-5 h-5  items-center justify-center "
												onClick={(e) => {
													e.preventDefault();
													//delete
												}}>
												<Delete className=" text-nord-aurora-red scale-90" />
											</SidebarMenuButton>
											<SidebarMenuButton
												className="w-5 h-5  items-center justify-center "
												onClick={() => {
													setOpenArr((prev) => {
														let temp = [...prev];
														temp[index] =
															!temp[index];
														return temp;
													});
												}}>
												<ChevronDown
													className=" scale-75 duration-200"
													style={{
														transform: openArr[
															index
														]
															? "rotate(-180deg)"
															: "rotate(-90deg)",
													}}
												/>
											</SidebarMenuButton>
										</div>
									</div>
									<CollapsibleContent>
										<SidebarMenuSub>
											<SidebarMenuSubItem className="w-full flex justify-between  items-center text-start">
												<label>Mass</label>
												<Input
													type="number"
													className="text-end"
													value={body.mass}
													onChange={(e) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[index].mass =
																parseFloat(
																	e.target
																		.value
																);
															return temp;
														});
														init();
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex justify-between  items-center text-start">
												<label>Radius</label>
												<Input
													type="number"
													className="text-end"
													value={body.radius}
													onChange={(e) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[index].radius =
																parseFloat(
																	e.target
																		.value
																);

															return temp;
														});
														setColorChange(
															"#" +
																Math.floor(
																	Math.random() *
																		16777215
																).toString(16)
														);
														init();
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex flex-col justify-between text-start">
												<label>Position</label>
												<div className="flex gap-1 flex-col">
													<div className="flex text-xs gap-1 text-muted-foreground ">
														<label className="w-1/3 text-center">
															x
														</label>
														<label className="w-1/3 text-center">
															y
														</label>
														<label className="w-1/3 text-center">
															z
														</label>
													</div>
													<div className="flex gap-1">
														<Input
															type="number"
															className="text-end"
															value={
																body.position[0]
															}
															step={
																body.radius / 10
															}
															onChange={(e) => {
																setBodies(
																	(prev) => {
																		let temp =
																			[
																				...prev,
																			];
																		temp[
																			index
																		].position[0] =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		let bodyRef =
																			store.get(
																				bodyRefAtom
																			);
																		let pos =
																			bodyRef
																				.current[
																				index
																			]
																				.position;
																		pos.x =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		bodyRef.current[
																			index
																		].position.set(
																			...[
																				pos.x,
																				pos.y,
																				pos.z,
																			]
																		);
																		return temp;
																	}
																);
																init();
															}}
														/>
														<Input
															type="number"
															className="text-end"
															value={
																body.position[1]
															}
															step={
																body.radius / 10
															}
															onChange={(e) => {
																setBodies(
																	(prev) => {
																		let temp =
																			[
																				...prev,
																			];
																		temp[
																			index
																		].position[1] =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		let bodyRef =
																			store.get(
																				bodyRefAtom
																			);
																		let pos =
																			bodyRef
																				.current[
																				index
																			]
																				.position;
																		pos.y =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		bodyRef.current[
																			index
																		].position.set(
																			...[
																				pos.x,
																				pos.y,
																				pos.z,
																			]
																		);
																		return temp;
																	}
																);
																init();
															}}
														/>
														<Input
															type="number"
															className="text-end"
															value={
																body.position[2]
															}
															step={
																body.radius / 10
															}
															onChange={(e) => {
																setBodies(
																	(prev) => {
																		let temp =
																			[
																				...prev,
																			];
																		temp[
																			index
																		].position[2] =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		console.log(
																			e
																				.target
																				.value
																		);
																		let bodyRef =
																			store.get(
																				bodyRefAtom
																			);
																		let pos =
																			bodyRef
																				.current[
																				index
																			]
																				.position;
																		pos.z =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		bodyRef.current[
																			index
																		].position.set(
																			...[
																				pos.x,
																				pos.y,
																				pos.z,
																			]
																		);
																		return temp;
																	}
																);
																init();
															}}
														/>
													</div>
												</div>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex flex-col justify-between text-start">
												<label>Velocity</label>
												<div className="flex gap-1 flex-col">
													<div className="flex text-xs gap-1 text-muted-foreground ">
														<label className="w-1/3 text-center">
															x
														</label>
														<label className="w-1/3 text-center">
															y
														</label>
														<label className="w-1/3 text-center">
															z
														</label>
													</div>
													<div className="flex gap-1">
														<Input
															type="number"
															className="text-end"
															value={
																body.velocity[0]
															}
															step={0.1}
															onChange={(e) => {
																setBodies(
																	(prev) => {
																		let temp =
																			[
																				...prev,
																			];
																		temp[
																			index
																		].velocity[0] =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		return temp;
																	}
																);
																init();
															}}
														/>
														<Input
															type="number"
															className="text-end"
															value={
																body.velocity[1]
															}
															step={0.1}
															onChange={(e) => {
																setBodies(
																	(prev) => {
																		let temp =
																			[
																				...prev,
																			];
																		temp[
																			index
																		].velocity[1] =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		return temp;
																	}
																);
																init();
															}}
														/>
														<Input
															type="number"
															className="text-end"
															step={0.1}
															value={
																body.velocity[2]
															}
															onChange={(e) => {
																setBodies(
																	(prev) => {
																		let temp =
																			[
																				...prev,
																			];
																		temp[
																			index
																		].velocity[2] =
																			parseFloat(
																				e
																					.target
																					.value
																			);
																		return temp;
																	}
																);
																init();
															}}
														/>
													</div>
												</div>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
												<label>Satic Body</label>
												<Checkbox
													checked={body.static}
													onCheckedChange={(
														checked: boolean
													) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[index].static =
																checked;
															return temp;
														});
														init();
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
												<label>Texture</label>
												<DropdownMenu>
													<div className="w-1/2 flex items-center">
														<DropdownMenuTrigger
															className="w-full"
															asChild>
															<SidebarMenuButton className="w-full  ">
																<label className="w-full  text-end">
																	{
																	
																	planetTextures.map(
																		(p) => {
																			return p.key ==
																				body.texture
																				? p.name
																				: "";
																		})
																		}
																</label>
															</SidebarMenuButton>
														</DropdownMenuTrigger>
													</div>
													<DropdownMenuContent className="w-[10rem]">
														{
															planetTextures.map(
																(p) => (
																	<DropdownMenuItem
																		onClick={() => {
																			
																			setBodies(
																				(
																					prev
																				) => {
																					let temp = [
																						...prev,
																					];
																					temp[
																						index
																					].texture =
																						p.key;
																					return temp;
																				}
																			);
																			setColorChange(
																				"#" +
																					Math.floor(
																						Math.random() *
																							16777215
																					).toString(
																						16
																					));
																					findImportTime(parseInt(bgQ)-1)

																			setLoaded(
																				false)
																		}}
																		>
																		<span>
																			{p.name}
																		</span>
																	</DropdownMenuItem>
																)
															)
														}
													</DropdownMenuContent>
												</DropdownMenu>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
												<label>Static Color</label>
												<Checkbox
													checked={body.fixedColor}
													onCheckedChange={(
														e: boolean
													) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[
																index
															].fixedColor = e;
															return temp;
														});

														setColorChange(
															e ? "#1" : "#2"
														);
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
												<label>Color</label>
												<Input
													type="color"
													className="w-[7rem]"
													value={body.color}
													onFocus={() =>
														setColorChange("#0")
													}
													onChange={(e) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[index].color =
																e.target.value;
															return temp;
														});
														setColorChange(
															e.target.value
														);
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
												<label>Trail</label>
												<Checkbox
													checked={body.trail}
													onCheckedChange={(
														e: boolean
													) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[index].trail =
																e;
															return temp;
														});
														setColorChange(
															e ? "#3" : "#4"
														);
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
												<label>Trail Color</label>
												<Input
													type="color"
													className="w-[7rem]"
													value={body.trailColor}
													onFocus={() =>
														setColorChange("#0")
													}
													onChange={(e) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[
																index
															].trailColor =
																e.target.value;
															return temp;
														});
														setColorChange(
															e.target.value
														);
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
												<label>Forecast</label>
												<Checkbox
													checked={body.forecast}
													onCheckedChange={(
														e: boolean
													) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[
																index
															].forecast = e;
															return temp;
														});
														setColorChange(
															e ? "#5" : "#6"
														);
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
												<label>Forecast Color</label>
												<Input
													type="color"
													className="w-[7rem]"
													value={body.forecastColor}
													onFocus={() =>
														setColorChange("#0")
													}
													onChange={(e) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[
																index
															].forecastColor =
																e.target.value;
															return temp;
														});
														setColorChange(
															e.target.value
														);
													}}
												/>
											</SidebarMenuSubItem>
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						))}
					</SidebarMenu>
					<SidebarMenu className="w-full p-2">
						{preset.map((p, i) => {
							return (
								<SidebarMenuItem key={i} className="w-full">
									<SidebarMenuButton
										className="w-full "
										onClick={() => {
											loadPreset(i);
										}}>
										<label>{p.name}</label>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarContent>
			</div>
		</Sidebar>
	);
}

export default AppSidebar;
