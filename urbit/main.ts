import {opine,Router,serveStatic,urlencoded,} from "https://deno.land/x/opine/mod.ts";
import {readableStreamFromReader,writableStreamFromWriter,} from "https://deno.land/std/streams/conversion.ts";
import { mergeReadableStreams } from "https://deno.land/std/streams/merge.ts";
import { TextLineStream } from "https://deno.land/std@0.144.0/streams/mod.ts";
import { readLines } from "https://deno.land/std@0.104.0/io/mod.ts";
import { getConfig, validateConfig  } from "https://gist.githubusercontent.com/Dishit79/65f0c7b8188557c86d68022dfa07f543/raw/47c86def8ebe51754eb17179eb844385ef31c8f5/config.ts";

const checks = [{name:'server', type:"string"},{name:'unixName', type:"string"}]
await validateConfig(checks)
const config = await getConfig()

const app = opine();
const port = 5050;
app.use(urlencoded());

class Instance {
  id: string;
  torrent: string
  process: any;

  constructor(id: string, torrent:string) {
    console.log("created");
    this.id = id;
    this.torrent = torrent
  }

  async pipeThrough(reader: Deno.Reader,){
    const file = await Deno.open(`./${this.id}.txt`, {
      read: true,
      append: true,
      create: true,
    })
    const encoder = new TextEncoder();
    for await (const line of readLines(reader)) {
      let completed = line.includes("100.00%");
      if (completed){
        await this.process.kill('SIGINT')
        return
      }
       await file.write(new TextEncoder().encode(line + '\n'));
    }
  }

  async start() {

    console.log(this.torrent);
    this.process = Deno.run({
      cmd: ["./rqbit", "download", "-o", this.id, this.torrent],
      stdout: "piped",
      stderr: "piped",
    })

    this.pipeThrough(this.process.stdout);
    this.pipeThrough(this.process.stderr);
    await this.process.status();

    await Deno.remove(`${this.id}.txt`)

    //move file to desired loc

    //const move3 = Deno.run({cmd: ["mkdir",  `/home/nawaf/${this.id}`]})
    const move = Deno.run({cmd: ["mv", `${this.id}`, `/home/${config.unixName}/`]})

    console.log("Done!");
    await sendBack(this.id)
  }
};

async function sendBack(id:string) {

  let t = await fetch(`${config.server}/api/torrent/completed`, {
    method: "POST",
    body: new URLSearchParams({
      'id': id})
  })
}

app.post("/torrent/add", async (req, res) => {
  const id = req.body.id;
  const torrent = req.body.magnetLink;
  const location = req.body.location;

  const instance = new Instance(id, torrent)
  instance.start()
  res.send("started")
});



async function exists(filename: string) {
  try {
    await Deno.stat(`${filename}.txt`);
    return true;
  } catch (e) {
    if (e && e instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw e;
    }
  }
}

async function pipeThroughWebsocket(reader: Deno.Reader, process: Deno.Process, socket: WebSocket){

  const encoder = new TextEncoder();
  for await (const line of readLines(reader)) {
    if (socket.readyState == 1){
      socket.send(line)
    } else {
      await process.kill('SIGINT')
      return
    }
  }
}

async function websocketStatus(id: string, socket:WebSocket) {

  const process = Deno.run({
    cmd: ["tail", "-F", `${id}.txt`],
    stdout: "piped",
    stderr: "piped",
  })

  pipeThroughWebsocket(process.stdout, process, socket);
  pipeThroughWebsocket(process.stderr, process, socket);
  await process.status();
  console.log("Done websocket");
}

const handleSocket = async (socket: WebSocket, id: string) => {

  socket.addEventListener("close", () => {
    console.log("Socket closed");
  });

  socket.addEventListener("open", async () => {
    console.log("Connected");
    const check = await exists(id)

    if (check){
      await websocketStatus(id, socket)
    } else {
      socket.close()
    }
  })
}

//req.params.id
app.get("/ws/:id", async (req, res) => {
  if (req.headers.get("upgrade") === "websocket") {
    const socket = req.upgrade()
    console.log("hit")
    handleSocket(socket, req.params.id)
  } else {
    res.send("Ok?")
  }
})

app.listen(port);
console.log(`Opine started on localhost:${port}`);

//https://github.com/ikatson/rqbit
