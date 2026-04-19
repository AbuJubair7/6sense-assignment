import { routes, controllers } from "./main";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const server = express();

const inititalizeApp = () => {
  // middlewares
  server.use(cors());
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // activate routes
  Object.entries(routes).forEach(([route, router]) => {
    server.use(route, router);
  });

  // activate controllers
  Object.values(controllers).forEach((controller) => {
    controller.activateRoutes();
  });

  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
};

inititalizeApp();
