import {opine,Router,serveStatic,urlencoded,} from "https://deno.land/x/opine/mod.ts";
import {readableStreamFromReader,writableStreamFromWriter,} from "https://deno.land/std/streams/conversion.ts";
import { mergeReadableStreams } from "https://deno.land/std/streams/merge.ts";
import { TextLineStream } from "https://deno.land/std@0.144.0/streams/mod.ts";
import { readLines } from "https://deno.land/std@0.104.0/io/mod.ts";
import { getConfig, validateConfig  } from "https://gist.githubusercontent.com/Dishit79/65f0c7b8188557c86d68022dfa07f543/raw/47c86def8ebe51754eb17179eb844385ef31c8f5/config.ts";
import { handleFiles } from "./files.ts"
import { ws } from "./ws.ts"


const checks = [{name:'version', type:"string"},{name:'server', type:"string"},{name:'unixName', type:"string"}]
await validateConfig(checks)
const config = await getConfig()

const app = opine();
const port = 5050;
app.use(urlencoded());
app.use("/", ws)

const startTime = Date.now()

class Instance {
  id: string;
  torrent: string
  downloadLocation: string
  process: any

  constructor(id: string, torrent:string, downloadLocation:string) {
    console.log("created");
    this.id = id;
    this.torrent = torrent
    this.downloadLocation = downloadLocation
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

  async start(filesToDelete: string[]) {

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

    await handleFiles(this.id, filesToDelete, this.downloadLocation)

    console.log("Done!");
    await sendBack(this.id)
  }
};

async function sendBack(id: string) {

  let t = await fetch(`${config.server}/api/torrent/completed`, {
    method: "POST",
    body: new URLSearchParams({
      'id': id})
  })
}

app.post("/torrent/add", async (req, res) => {
  const id = req.body.id;
  const torrent = req.body.magnetLink;
  const downloadLocation = req.body.downloadLocation;
  const filesToDeleteRaw = req.body.filesToDelete;
  const filesToDelete = filesToDeleteRaw.split(',')

  const instance = new Instance(id, torrent, downloadLocation)
  instance.start(filesToDelete)
  res.send("started")
})

app.get("/status", async (req, res) => {
  const version = config.version
  const uptime = Date.now() - startTime
  const storage = null
  const ram = Deno.memoryUsage()
  const cpu = navigator.hardwareConcurrency
  const ip = async () => {
    let tmp = await fetch('https://api.ipify.org/')
    return await tmp.text()
  }
  res.send({version: version, uptime: uptime, storage:storage, ram:ram, cpu:cpu, ip: await ip()})
});


app.listen(port);
console.log(`Opine started on localhost:${port}`);

//https://github.com/ikatson/rqbit
