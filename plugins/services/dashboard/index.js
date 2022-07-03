const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

var folder = path.join(__dirname, "public");
console.log(folder);
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: folder });
});

app.listen(port, () => {
  console.log(`started on port: ${port}`);
});
