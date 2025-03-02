import express from "express";
import bodyParser from "body-parser";
//import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import stockRoutes from "./routes/trending.js";
import axios from 'axios';


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
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ROUTES */

const PORT = process.env.PORT || 9000;

app.use("/trending", stockRoutes);

app.get('/api/news', async (req, res) => {
  try {
      const apiKey = "v63Jt7pHuDB9vTsuRYrk8rHFsbhaBhF9vTtmNhwU";
      const page = req.query.page || 1;
      
      const response = await axios.get('https://api.marketaux.com/v1/news/all', {
          params: {
              api_token: apiKey,
              countries: 'us',
              filter_entities: 'true',
              limit: 10,
              page: page
          }
      });

      const articles = response.data.data;
      res.json(articles);
  } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
  }
});

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

app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
