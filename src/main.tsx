import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "jotai";
import { store } from "./atoms.ts";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { svg } from "./vectors.tsx";

createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<div
				className="fixed w-full flex flex-col pointer-events-none duration-200 transition-opacity  ease-linear gap-2 items-center justify-center h-full bg-background"
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
				<div className="flex items-center gap-1 text-muted-foreground  justify-center w-64">
					<div className="w-full border"></div>
					<label className="min-w-fit mts">Loading Assets</label>
					<div className="w-full border"></div>
				</div>
			</div>
			<App />
		</ThemeProvider>
	</Provider>
);
