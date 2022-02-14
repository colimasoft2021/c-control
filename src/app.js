import express from "express";
import cors from "cors";
import morgan from "morgan";
import config from "./config";
import beneficioRoutes from "./routes/beneficio.routes";

const app = express();

//setings 
app.set('port', config.port);

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(beneficioRoutes);

export default app;