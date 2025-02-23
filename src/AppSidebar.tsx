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
	bgLoadedAtom,
	bodiesAtom,
	bodyRefAtom,
	colorChangerAtom,
	findImportTime,
	focusAtom,
	loadPreset,
	planetTextures,
	preset,
	settingsAtom,
	store,
	version,
} from "./atoms";
import { init } from "./simulationLoop";
import { Checkbox } from "./components/ui/checkbox";
import {
	DropdownMenuGroup,
	DropdownMenuLabel,
	Label,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "./components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./components/ui/alert-dialog";
import { Textarea } from "./components/ui/textarea";
import { Slider } from "./components/ui/slider";
let change: any = null;
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
const quality = ["Low", "Medium", "High"];
function AppSidebar({ open }: { open: boolean }) {
	const [space, setSpace] = useState(0);
	const [anchor, setAnchor] = useAtom(focusAtom);
	const [bodies, setBodies] = useAtom(bodiesAtom);
	const [openArr, setOpenArr] = useState(Array(bodies.length).fill(true));
	const [settings, setSettings] = useAtom(settingsAtom);
	function setSettingsItem(key: string, value: any) {
		setSettings((prev) => {
			return { ...prev, [key]: value };
		});
		init();
	}
	const G = settings.gravitationalConstant;
	const DT = settings.timeStep;
	const E = settings.elasticitiy;
	const forecastLimit = settings.forecastLimit;
	const trailLimit = settings.trailLimit;
	const bg = settings.background;
	const bgQ = settings.textureQuality;
	const [_, setColorChange] = useAtom(colorChangerAtom);
	const [__, setLoaded] = useAtom(bgLoadedAtom);

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
										setSettingsItem(
											"timeStep",
											Math.max(0, value)
										);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										let value = parseFloat(
											e.currentTarget.value
										);
										if (!isNaN(value) && value !== DT) {
											setSettingsItem(
												"timeStep",
												Math.max(0, value)
											);
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
										setSettingsItem(
											"gravitationalConstant",
											value
										);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										let value = parseFloat(
											e.currentTarget.value
										);
										if (!isNaN(value) && value !== G) {
											setSettingsItem(
												"gravitationalConstant",
												value
											);
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
										setSettingsItem(
											"elasticitiy",
											Math.min(1, Math.max(0, value))
										);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										let value = parseFloat(
											e.currentTarget.value
										);
										if (!isNaN(value) && value !== E) {
											setSettingsItem(
												"elasticitiy",
												Math.min(1, Math.max(0, value))
											);
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
										setSettingsItem(
											"forecastLimit",
											Math.max(0, value)
										);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										let value = parseFloat(
											e.currentTarget.value
										);
										if (!isNaN(value)) {
											setSettingsItem(
												"forecastLimit",
												Math.max(0, value)
											);
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
										setSettingsItem(
											"trailLimit",
											Math.max(0, value)
										);
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										let value = parseFloat(
											e.currentTarget.value
										);
										if (
											!isNaN(value) &&
											value !== trailLimit
										) {
											setSettingsItem(
												"trailLimit",
												Math.max(0, value)
											);
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
														setSettingsItem(
															"background",
															p.code
														);
														findImportTime(bgQ);
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
									<label>{quality[bgQ]}</label>
								</CollapsibleTrigger>
								<CollapsibleContent className=" flex w-full py-2 gap-1">
									{quality.map((p, i) => {
										return (
											<SidebarMenuSubButton
												key={i}
												className="cursor-pointer w-full rounded-sm  flex items-center justify-center border"
												onClick={() => {
													setSettingsItem(
														"textureQuality",
														i
													);
													findImportTime(i);
													setLoaded(false);
												}}
												style={{
													borderColor:
														i == bgQ
															? "#fff1"
															: "transparent",
												}}>
												{p}
											</SidebarMenuSubButton>
										);
									})}
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
						<SidebarMenuSubItem className="w-full flex my-2 items-center justify-between text-start">
							<label>Ambient Lighting</label>
							<Checkbox
								checked={settings.ambientLight}
								onCheckedChange={(e: boolean) => {
									setSettingsItem("ambientLight", e);
								}}
							/>
						</SidebarMenuSubItem>
						<SidebarMenuSubItem className="w-full flex  my-2 items-center justify-between text-start">
							<label>Bloom</label>
							<Checkbox
								checked={settings.bloom}
								onCheckedChange={(e: boolean) => {
									setSettingsItem("bloom", e);
								}}
							/>
						</SidebarMenuSubItem>
						<SidebarMenuSubItem className="w-full flex flex-col mt-2 mb-4  justify-between text-start">
							<label>Ambient Lighting Intensity</label>
							<div className="w-full mt-4 flex gap-1">
								<Slider
									defaultValue={[
										settings.ambientLightIntensity,
									]}
									onValueChange={(e) => {
										if (change != null) {
											clearTimeout(change);
										}
										change = setTimeout(() => {
											setSettingsItem(
												"ambientLightIntensity",
												e
											);
										}, 100);
									}}
									step={1}
									min={0}
									max={100}
								/>
							</div>
						</SidebarMenuSubItem>
						<SidebarMenuSubItem className="w-full flex flex-col mt-2 mb-4  justify-between text-start">
							<label>Bloom Intensity</label>
							<div className="w-full mt-4 flex gap-1">
								<Slider
									defaultValue={[settings.bloomIntensity]}
									onValueChange={(e) => {
										if (change != null) {
											clearTimeout(change);
										}
										change = setTimeout(() => {
											setSettingsItem(
												"bloomIntensity",
												e
											);
										}, 100);
									}}
									step={0.1}
									min={0}
									max={10}
								/>
							</div>
						</SidebarMenuSubItem>
						<SidebarMenuSubItem className="w-full flex flex-col mt-2 mb-4 justify-between text-start">
							<label>Emmissive Light Decay</label>
							<Slider
								className="w-full mt-4 flex gap-1"
								defaultValue={[settings.emmissiveLightDecay]}
								onValueChange={(e) => {
									if (change != null) {
										clearTimeout(change);
									}
									change = setTimeout(() => {
										setSettingsItem(
											"emmissiveLightDecay",
											e
										);
									}, 100);
								}}
								step={0.01}
								min={0}
								max={1}
							/>
						</SidebarMenuSubItem>
						<SidebarMenuSubItem className="w-full flex flex-col mt-2 mb-4  justify-between text-start">
							<label>Emmisive Light Multiplier </label>
							<div className="w-full mt-4 flex gap-1">
								<Slider
									defaultValue={[
										settings.emmissiveLightMultiplier,
									]}
									onValueChange={(e) => {
										if (change != null) {
											clearTimeout(change);
										}
										change = setTimeout(() => {
											setSettingsItem(
												"emmissiveLightMultiplier",
												e
											);
										}, 100);
									}}
									step={1}
									min={1}
									max={100}
								/>
							</div>
						</SidebarMenuSubItem>
						<SidebarMenuItem className="w-full gap-1 flex flex-col ">
							<Label>Data</Label>
							<div className="w-full gap-1 flex ">
								<SidebarMenuButton className="w-full  h-10  border rounded-sm items-center justify-center">
									Save Preset
								</SidebarMenuButton>
								<DropdownMenu>
									<DropdownMenuTrigger
										onFocus={(e) => {
											e.currentTarget.blur();
										}}
										className="w-115/100">
										<SidebarMenuButton
											className="w-full h-10  bg-background text-foreground hover:bg-foreground hover:text-primary-foreground duration-300    items-center justify-center border"
											style={{
												transitionProperty:
													"width, color, background-color",
											}}>
											{open ? "Export" : "Exp"}
										</SidebarMenuButton>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-56 mb-2 ml -80 justify-center items-center flex flex-col bg-background border rounded-md">
										<DropdownMenuLabel className="text-center">
											Export Data
										</DropdownMenuLabel>
										{separator}
										<DropdownMenuGroup className="py-2">
											<div className=" border rounded-md  mb-1">
												<Input
													type="text"
													id="filename"
													className="w-full h-8 text-end"
													defaultValue="config.json"
													onChange={(e) => {
														let filename: any =
															e.target.value.split(
																"."
															);
														if (
															filename.length >
																1 &&
															filename[
																filename.length -
																	1
															].toLowerCase() !=
																"json"
														) {
															filename.pop();
															filename =
																filename.join(
																	"."
																) + ".json";
															e.target.value =
																filename;
														}
													}}
												/>
											</div>
											<div className="flex gap-2">
												<Button
													className="w-1/2 bg-background border text-accent-foreground hover:bg-accent-foreground hover:text-primary-foreground duration-300 transition-colors"
													onClick={() => {
														let data =
															JSON.stringify({
																version:
																	version,
																dt: DT,
																G: G,
																e: E,
																anchor: anchor,
																bodies: bodies,
															});
														navigator.clipboard.writeText(
															data
														);
													}}>
													Copy
												</Button>
												<Button
													className="w-1/2 bg-background border text-accent-foreground hover:bg-accent-foreground hover:text-primary-foreground duration-300 transition-colors"
													onClick={() => {
														let data =
															JSON.stringify({
																version:
																	version,
																dt: DT,
																G: G,
																e: E,
																anchor: anchor,
																bodies: bodies,
															});
														let filename: any =
															document.getElementById(
																"filename"
															) as HTMLInputElement;
														filename =
															filename.value.split(
																"."
															);
														if (
															filename.length > 1
														) {
															filename.pop();
															filename =
																filename.join(
																	"."
																) + ".json";
														} else if (
															filename.length == 1
														) {
															filename =
																filename[0] +
																".json";
														} else {
															filename =
																"config.json";
														}
														let file = new Blob(
															[data],
															{
																type: "application/json",
															}
														);
														let a =
															document.createElement(
																"a"
															);
														a.href =
															URL.createObjectURL(
																file
															);
														a.download = filename;
														a.click();
													}}>
													Download
												</Button>
											</div>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
								<AlertDialog>
									<AlertDialogTrigger className="w-115/100">
										<SidebarMenuButton
											className="w-full h-10 bg-background text-accent-foreground hover:bg-accent-foreground hover:text-primary-foreground duration-300  items-center justify-center border"
											style={{
												transitionProperty:
													"width, color, background-color",
											}}>
											{open ? "Import" : "Imp"}
										</SidebarMenuButton>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle className="text-center mb-4">
												Import Data
											</AlertDialogTitle>
											<AlertDialogDescription className="flex  flex-col items-center">
												<Textarea
													placeholder="Paste text or file here..."
													autoFocus={true}
													id="pastebox"
													onPaste={(e) => {
														if (
															e.clipboardData
																.files.length >
															0
														) {
															e.preventDefault();
															let file =
																e.clipboardData
																	.files[0];
															console.log(
																file.type
															);
															if (
																file.type ==
																"application/json"
															) {
																let filebox =
																	document.getElementById(
																		"filebox"
																	) as HTMLInputElement;
																let label =
																	document.getElementById(
																		"filelabel"
																	) as HTMLLabelElement;
																filebox.files =
																	e.clipboardData.files;
																label.innerText =
																	file.name;
															}
														}
													}}
													className="w-[29rem] border-dashed py-3 h-40 resize-none"
												/>
												<Input
													type="file"
													id="filebox"
													className="hidden"
													accept="application/JSON"
													onChange={(e) => {
														let label =
															document.getElementById(
																"filelabel"
															) as HTMLLabelElement;
														if (
															e.target.files !=
															null
														) {
															label.innerText =
																e.target.files[0].name;
														} else {
															label.innerText =
																"Choose File";
														}
													}}
												/>
												<label
													htmlFor="filebox"
													id="filelabel"
													className="cursor-pointer p-2 rounded-sm border self-end bg-background border-dashed -mt-9 h-9 items-center justify-center flex">
													Choose File
												</label>
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className="mr-1 bg-background w-24 rounded-md text-nord-aurora-red hover:bg-nord-aurora-red hover:text-primary-foreground duration-300 transition-colors">
												Cancel
											</AlertDialogCancel>
											<AlertDialogAction
												className="  w-24 bg-background border text-accent-foreground hover:bg-accent-foreground hover:text-primary-foreground duration-300 transition-colors"
												onClick={() => {
													let pastebox =
														document.getElementById(
															"pastebox"
														) as HTMLTextAreaElement;
													let filebox =
														document.getElementById(
															"filebox"
														) as HTMLInputElement;
													if (
														filebox.files &&
														filebox.files.length > 0
													) {
														let file =
															filebox.files[0];
														if (file == null)
															return;
														let reader =
															new FileReader();
														reader.onload = (e) => {
															let data =
																JSON.parse(
																	e.target
																		?.result as string
																);
															loadPreset(
																-1,
																data
															);
															// setImportedData(
															// 	data
															// );
															// setCenter({
															// 	x:
															// 		window.innerWidth /
															// 		2,
															// 	y:
															// 		window.innerHeight /
															// 		2,
															// });
														};
														reader.readAsText(file);
													} else {
														try {
															let data =
																JSON.parse(
																	pastebox.value
																);

															loadPreset(
																-1,
																data
															);

															// setImportedData(
															// 	data
															// );
															// setCenter({
															// 	x:
															// 		window.innerWidth /
															// 		2,
															// 	y:
															// 		window.innerHeight /
															// 		2,
															// });
														} catch (e) {
															alert(
																"Invalid JSON"
															);
														}
													}
												}}>
												Import
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</SidebarMenuItem>
					</SidebarMenu>
					<SidebarMenu className="w-full pr-2 pb-4 overflow-y-auto ">
						{bodies.map((body, index) => (
							<>
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
											className="  focus-within:cursor-text "
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
											<SidebarMenuSubItem className="w-full flex items-center my-2 justify-between text-start">
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
											<SidebarMenuSubItem className="w-full flex items-center  my-2 justify-between text-start">
												<label>Emmissive</label>
												<Checkbox
													checked={body.emmissive}
													onCheckedChange={(
														checked: boolean
													) => {
														setBodies((prev) => {
															let temp = [
																...prev,
															];
															temp[
																index
															].emmissive =
																checked;
															return temp;
														});
														setColorChange(
															"#ee1"+index+""+checked
														);
													}}
												/>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem className="w-full flex items-center  mb-1 justify-between text-start">
												<label>Texture</label>
												<DropdownMenu>
													<div className="w-1/2 flex items-center">
														<DropdownMenuTrigger
															className="w-full"
															asChild>
															<SidebarMenuButton className="w-full  ">
																<label className="w-full  text-end">
																	{planetTextures.map(
																		(p) => {
																			return p.key ==
																				body.texture
																				? p.name
																				: "";
																		}
																	)}
																</label>
															</SidebarMenuButton>
														</DropdownMenuTrigger>
													</div>
													<DropdownMenuContent className="w-[10rem]">
														{planetTextures.map(
															(p) => (
																<DropdownMenuItem
																	onClick={() => {
																		setBodies(
																			(
																				prev
																			) => {
																				let temp =
																					[
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
																				)
																		);
																		findImportTime(
																			bgQ
																		);

																		setLoaded(
																			false
																		);
																	}}>
																	<span>
																		{p.name}
																	</span>
																</DropdownMenuItem>
															)
														)}
													</DropdownMenuContent>
												</DropdownMenu>
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
												<label>Emmission Color</label>
												<Input
													type="color"
													className="w-[7rem]"
													value={body.emmissionColor}
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
															].emmissionColor =
																e.target.value;
															return temp;
														});
														setColorChange(
															"ee2"+index+""+e.target.value
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
											{/* <SidebarMenuSubItem className="w-full flex items-center justify-between text-start">
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
											</SidebarMenuSubItem> */}
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
											<SidebarMenuSubItem className="w-full flex flex-col mt-2 mb-4  justify-between text-start">
												<label>Emmission Intensity</label>
												<div className="w-full mt-4 flex gap-1">
													<Slider
														defaultValue={[
															body.emmissionIntensity,
														]}
														onValueChange={(e) => {
															
															if (
																change != null
															) {
																clearTimeout(
																	change
																);
															}
															change = setTimeout(
																() => {
																	setBodies((prev) => {
																		let temp = [
																			...prev,
																		];
																		temp[
																			index
																		].emmissionIntensity =
																			e[0];
																		return temp;
																	});
																	setColorChange(
																		"#ee3"+index+""+e[0]
																	);
																},
																100
															);
														}}
														step={0.01}
														min={0}
														max={10}
													/>
												</div>
											</SidebarMenuSubItem>
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
							{separator}
							</>
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
