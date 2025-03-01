import express from "express";
import bodyParser from "body-parser";
//import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import stockRoutes from "./routes/trending.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:5173", // Your Vite dev server port
    credentials: true,
  })
);

/* ROUTES */

app.use("/trending", stockRoutes);

/* MONGOOSE SETUP */
// const PORT = process.env.PORT || 9000;
// mongoose
//   .connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(async () => {
//     app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

//     /*ADD DATA ONE TIME ONLY*/
//     // await mongoose.connection.db.dropDatabase();
//     // KPI.insertMany(kpis);
//     // Product.insertMany(products);
//   })
//   .catch((error) => console.log(`${error} did not connect`));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server Port: ${PORT}`));