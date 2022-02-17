import express from "express";
import cors from "cors";
import morgan from "morgan";
import config from "./config";
import routes from "./routes/routes";

const app = express();

//setings 
app.set('port', config.port);

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(routes);

export default app;