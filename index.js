const rp = require('request-promise');
const cheer = require('cheerio');
const $ = cheer.load("html");
const fs = require("fs");
const newLine = "\r\n";
const cors = require("cors");
const dm = ",";
const path = require("path");
var list =[];
var Object = "";
var express = require("express");
const { eq } = require('cheerio/lib/api/traversing');
var port = process.env.PORT || 9890;
var app = express();

//middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

//get method
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
})

//post methoed
app.post("/", async (req, res) => {
  await getUrls(list,req).then(async () => {
    var commonfilename = (Math.random() * 10000).toString(36).substr(0, 10).replace(/\./ig, "_");
    var filepath = __dirname + "/public/data/" + commonfilename + ".csv";
    var urlSetup = req.headers.origin + "/data/" + commonfilename + ".csv";
    // console.log(Object);
    try {
      await fs.writeFileSync(filepath, Object);
      await res.send(JSON.stringify({ file: urlSetup }));
    }
    catch (e) {
      res.end(JSON.stringify({ error: e }));
    }

  })


})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
})

async function getUrls(list,req) {
  list = [...req.body.weblist.toString().split("\n").filter((value) =>value != "")];
  Object = "List" + dm + req.body.selector+ ((req.body.attribute? "-"+req.body.attribute:"")) + newLine;

  for (const url of list) {
    console.log(url);
    await rp(url)
      .then(async function (html) {

        await $(req.body.selector, html).each(async(x, y) => {
        if(req.body.attribute.toString().trim()==""){
          console.log($(y).text())

           Object += "\""+url +"\""+ dm +"\""+ $(y).text().replace(/\,/ig,"\,")+"\""+ newLine;
        }
        else{

          Object += url +"\""+ dm + "\""+$(y).attr(req.body.attribute) + "\""+newLine;
        }
        })
      })
      .catch(function (err) {
      });
  }
}



