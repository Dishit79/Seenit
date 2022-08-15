import { opine, serveStatic, urlencoded, Router } from "https://deno.land/x/opine/mod.ts";
import { dirname, join } from "https://deno.land/x/opine/deps.ts";
import { renderFile } from "https://deno.land/x/eta/mod.ts";
import { api } from "./routes/api.ts"
import { torrent } from "./routes/torrent.ts"
import { logger } from "./utils.ts"
import { validateConfig } from "./utils/config.ts"

const checks = [{name:'server', type:"string"},{name:'wsServer', type:"string"},{name:'port', type:"number"},{name:'downloadLocation', type:"object"}]
const config = await validateConfig(checks)

const app = opine()
const port = config.port
const downloadLocation = config.downloadLocation

app.engine(".html", renderFile);
app.set("view engine", "html");

app.set("view cache", false)
app.set('trust proxy', true)
app.use(urlencoded());
app.use("/api", api)
app.use("/api/torrent", torrent)


app.get("/", async (req,res) => {
  const queue = await fetch(`http://localhost:${port}/api/torrent/queue`)
  res.render("index", { queue: await queue.json() })
})

app.get("/dash", async (req,res) => {

  if (!req.query.q) {
      res.setStatus(400).send({status:400, error:'no valid search query'})
      }
  const search = await fetch(`http://localhost:${port}/api/search?q=${req.query.q}`)
  res.render("dashboard", { searchResult: await search.json(), downloadLocation: downloadLocation })
})

app.get("/con", (req,res) => {
  res.render("console")
})

app.listen(port);
console.log(`Opine started on localhost:${port}`)


//https://github.com/ikatson/rqbit
