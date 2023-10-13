const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*"];

const doc = {
  info: {
    version: "1.0.0",
    title: "Start-Up India API",
    description: "Start-Up India API Documentation",
  },
  host: process.env.HOST + ":443",
  basePath: "/",
  schemes: ["https"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./index.js");
});
