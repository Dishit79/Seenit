import { opine, serveStatic, urlencoded, Router } from "https://deno.land/x/opine/mod.ts";
import { dirname, join } from "https://deno.land/x/opine/deps.ts";
import { api } from "./routes/api.ts"


const app = opine()
const port = 5000
app.set("view cache", false)
app.set('trust proxy', true)
const __dirname = dirname(import.meta.url)
app.use("/api", api)

app.get("/", (req,res)=> {
  res.send("send hi")
})

app.listen(port);
console.log(`Opine started on localhost:${port}`)


//https://github.com/ikatson/rqbit
