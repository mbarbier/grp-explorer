
import { App } from "./App";
import { tjsx } from "./ui/TrueJsx";
import './ui/Style.scss'

tjsx.init();

const app = new App(document.getElementById("root"));
app.run();