import { opine, serveStatic, urlencoded, Router } from "https://deno.land/x/opine/mod.ts";
import { dirname, join } from "https://deno.land/x/opine/deps.ts";
import { renderFile } from "https://deno.land/x/eta/mod.ts";
import { api } from "./routes/api.ts"
import { torrent } from "./routes/torrent.ts"
import { logger } from "./utils.ts"
import { validateConfig, getConfig } from "./utils/config.ts"


const app = opine()
const port = 5000
const __dirname = dirname(import.meta.url)

app.engine(".html", renderFile);
app.use('/assets', serveStatic(join(__dirname, "assets")));
app.set("view engine", "html");

app.set("view cache", false)
app.set('trust proxy', true)
app.use(urlencoded());
app.use("/api", api)
app.use("/api/torrent", torrent)


const checks = [{name:'server', type:"string"}]
await validateConfig(checks)


app.get("/", (req,res)=> {
  res.render("dashboard")
})

app.get("/search", async (req,res)=> {

  if (!req.query.q) {
      res.setStatus(400).send({status:400, error:'no valid search query'})
    }

  const search = await fetch(`http://localhost:5000/api/search?q=${req.query.q}`)

  logger("Search endpoint hit")

  res.render("dashboard", { searchResult: await search.json()})

})


app.listen(port);
console.log(`Opine started on localhost:${port}`)


//https://github.com/ikatson/rqbit
