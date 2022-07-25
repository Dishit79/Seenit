import { opine, serveStatic, urlencoded, Router } from "https://deno.land/x/opine/mod.ts";
import { dirname, join } from "https://deno.land/x/opine/deps.ts";
import { renderFile } from "https://deno.land/x/eta/mod.ts";
import { api } from "./routes/api.ts"


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

app.get("/", (req,res)=> {
  res.render("dashboard")
})

app.get("/search", async (req,res)=> {

  if (!req.query.q) {
      res.setStatus(400).send({status:400, error:'no valid search query'})
    }

  //const imdbRes = await fetch(`https://imdb-api.com/en/API/SearchTitle/k_l3xhyg33/${req.query.q}`)
  //const id = await imdbRes.json()
  //const imdbData = await fetch(`https://imdb-api.com/en/API/Title/k_l3xhyg33/${id.results[0].id}`)


  const search = await fetch(`http://localhost:5000/api/search?q=${req.query.q}`)
  console.log(search);


  //res.render("dashboard", { searchResult: await search.json(), imdbData: await imdbData.json() })
  res.render("dashboard", { searchResult: await search.json()})

})

app.listen(port);
console.log(`Opine started on localhost:${port}`)


//https://github.com/ikatson/rqbit
