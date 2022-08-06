import {opine,Router,serveStatic,urlencoded,} from "https://deno.land/x/opine/mod.ts";
import {readableStreamFromReader,writableStreamFromWriter,} from "https://deno.land/std/streams/conversion.ts";
import { mergeReadableStreams } from "https://deno.land/std/streams/merge.ts";
import { TextLineStream } from "https://deno.land/std@0.144.0/streams/mod.ts";
import { readLines } from "https://deno.land/std@0.104.0/io/mod.ts";


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

  async pipeThrough(reader: Deno.Reader, writer: Deno.Writer,){
    const file = await Deno.open(`./${this.id}.txt`, {
      read: true,
      write: true,
      create: true,
    })
    const encoder = new TextEncoder();
    for await (const line of readLines(reader)) {
      let completed = line.includes("100.00%");
      if (completed){
        await this.process.kill('SIGINT')
        return
      }
      await Deno.write(file.rid, new TextEncoder().encode(line));
    }
  }

  async start() {

    console.log(this.torrent);
    this.process = Deno.run({
      cmd: ["./rqbit", "download", "-o", this.id, this.torrent],
      stdout: "piped",
      stderr: "piped",
    })

    this.pipeThrough(this.process.stdout, Deno.stdout);
    this.pipeThrough(this.process.stderr, Deno.stderr);
    await this.process.status();
    //delete file
    console.log("Done!");
    await sendBack(this.id)
  }
};

async function sendBack(id:string) {

  let t = await fetch("http://127.0.0.1:5000/api/torrent/completed", {
    method: "POST",
    body: new URLSearchParams({
      'id': id})
  })

  console.log();
}

app.post("/torrent/add", async (req, res) => {
  const id = req.body.id;
  const torrent = req.body.magnetLink;
  const location = req.body.location;

  const instance = new Instance(id, torrent)
  instance.start()
  res.send("started")
});


app.get("/ws/:id", async (req, res) => {
  if (req.headers.get("upgrade") === "websocket") {
    const socket = req.upgrade()
    console.log("hit");
    ws.listen(socket)
  } else {
    res.send("Ok?")
  }
})

app.listen(port);
console.log(`Opine started on localhost:${port}`);

//https://github.com/ikatson/rqbit
