require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const mongodb = require("./mongodb");
var mdb;
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const cronJobs = require("./routes/jobs");

var options = {
  key: fs.readFileSync("./certs/ssl-key.pem"),
  cert: fs.readFileSync("./certs/ssl-cert.pem"),
};

// defining the Express app
const app = express();
const indexRouter = express.Router();

// Mongo DB connection
/*
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("opne", () => console.error("Connected to DB"));
*/

// adding Helmet to enhance your API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());



// Connecting mongo without orm
mongodb.connectToServer((err, result) => {
  if (err) throw err;
  console.log("Connected to DB..");
});
mdb = mongodb.getDb();

// adding morgan to log HTTP requests
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router and routes
const landingRouter = require("./routes/landing");
app.use("/startup", landingRouter);
const datatableRouter = require("./routes/datatable");
app.use("/data", datatableRouter);
const staticDataRouter = require("./routes/staticData");
app.use("/static", staticDataRouter);
const insightsRouter = require("./routes/insights");
app.use("/insight", insightsRouter);
const policyRouter = require("./routes/policy");
app.use("/policy", policyRouter);
const jobsRouter = require("./routes/jobs");
const { request } = require("http");
app.use("/jobs", jobsRouter);

// Starting the server
https.createServer(options, app).listen(8443, () => {
  console.log("listening on port 8443");
  /*
	request(
    "http://localhost:443/jobs/triggerCron",
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      console.log(
        "Response after triggering all crons - " + JSON.stringify(body)
      );
    }
  );
	*/
});

/*
app.listen(80, () => {
  console.log("HTTP server running on port 80");
});
*/

// Swagger endpoint - /doc
app.use("/maps/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Redirect basepath to Swagger
app.get("/", (req, res) => {
  res.redirect("/doc");
});

app.get("/maps/health", (req, res) => {
	res.send({'status':'UP'});
});

app.get(
  "/.well-known/acme-challenge/Bk36vQraWCLb2GiQZajzxWn4zLGMqXHru9pHWhbGKNc",
  (req, res) => {
    res.send(
      "Bk36vQraWCLb2GiQZajzxWn4zLGMqXHru9pHWhbGKNc.Sf7xyyKDbj8yEV1xrNYuEB4ZC-MjgZbliBF3ncDYYMY"
    );
  }
);

app.use(config.baseUrl, indexRouter);



