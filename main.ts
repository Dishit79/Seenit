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

app.listen(port);
console.log(`Opine started on localhost:${port}`)


//https://github.com/ikatson/rqbit
