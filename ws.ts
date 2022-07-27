import { opine, serveStatic, urlencoded, Router } from "https://deno.land/x/opine/mod.ts";
import { dirname, join } from "https://deno.land/x/opine/deps.ts";
import { TextLineStream } from "https://deno.land/std@0.144.0/streams/mod.ts";

import { WosninServer } from "./Wosnin/server.ts";


const app = opine()
const ws = new WosninServer()
const port = 5000

app.set("view cache", false)
app.set('trust proxy', true)
app.use(urlencoded())
const __dirname = dirname(import.meta.url)

app.get("/", (req,res) => {
  res.send("dipshit")
})

app.get("/ws", async (req, res) => {
  if (req.headers.get("upgrade") === "websocket") {
    const socket = req.upgrade()
    console.log("hit");
    ws.listen(socket)
  } else {
    res.send("Ok?")
  }
})


ws.route("/time", (req, sb) => {
  console.log(req.data);
  ws.send(sb, "cool")
})





app.listen(port);
console.log(`Opine started on localhost:${port}`)
