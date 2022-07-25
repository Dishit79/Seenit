import { opine, serveStatic, urlencoded, Router } from "https://deno.land/x/opine/mod.ts";
import { dirname, join } from "https://deno.land/x/opine/deps.ts";
import { TextLineStream } from "https://deno.land/std@0.144.0/streams/mod.ts";
import { bitsearch } from "./routes/normal.ts"


const app = opine()
const port = 5000

app.set("view cache", false)
app.set('trust proxy', true)
app.use(urlencoded())
const __dirname = dirname(import.meta.url)

app.get("/", (req,res) => {
  res.send("dipshit")
})

async function autoSend(socket: WebSocket) {
  const lines = process.stdout!.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  for await (const line of lines) {
    socket.send(line);
  }
}

const handleSocket = async (socket: WebSocket) => {

  socket.addEventListener("close", () => {
    console.log("Socket closed");
  });

  socket.addEventListener("open", () => {
    console.log("[server]: ping");
    socket.send("ping");
    //autoSend(socket)
  });

  socket.addEventListener("message", async (e) => {
    if (e.data === "ping") {
      console.log("[server]: pong");
      socket.send("pong");
    } else if (e.data === "pong") {
      socket.close();
    } else {
      let d = await bitsearch(e.data)
      socket.send(JSON.stringify(d))
    }
  })
}

app.get("/ws", async (req, res) => {
  if (req.headers.get("upgrade") === "websocket") {
    const socket = req.upgrade()
    console.log("recived?");
    handleSocket(socket)
  } else {
    res.send("Ok?")
  }
})


app.listen(port);
console.log(`Opine started on localhost:${port}`)
