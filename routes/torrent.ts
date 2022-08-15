import { Router } from "https://deno.land/x/opine/mod.ts";
import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { logger, generateId } from "../utils.ts"
import { getConfig } from "../utils/config.ts"


export const torrent = new Router
const config = await getConfig()

const api = config.server
const ws = config.wsServer

interface Mag {
    id: string
    uri: string
    downloadLocation: string
    filesToDelete: string[]
    downloaded: number
}

// Initialization
const db = new Database<Mag>('torrents.json');

export class MagnetObject {
  id: string
  uri: string
  downloadLocation: string
  filesToDelete: string[]
  downloaded = 0

  constructor(uri: string, downloadLocation: string, filesToDelete: string[], id:string | null = null) {
    if (!id){
      this.id = generateId()
    } else {
      this.id = id
    }
    this.uri = uri
    this.downloadLocation = downloadLocation
    this.filesToDelete = filesToDelete
  }
}

async function addMag(mag:MagnetObject) {
  await db.insertOne(mag)
}

async function updateMagStatus(id: string, status: number) {
  await db.updateOne({ id: id }, { downloaded: status });
}

async function getRunningMag() {
  return await db.findOne({ downloaded:  1 });
}

async function getIdleMag() {
  return await db.findOne({ downloaded:  0 });
}

async function downloadHandler(magnet:MagnetObject) {
  const torrentRunning = await getRunningMag()
  if (!torrentRunning){
    await fetch(`${api}/torrent/add`, {
      method: "POST",
      body: new URLSearchParams({
        'id': magnet.id,
        'magnetLink': magnet.uri,
        'filesToDelete': magnet.filesToDelete.toString(),
        'downloadLocation': magnet.downloadLocation })
    })
    await updateMagStatus(magnet.id, 1)
    logger("Torrent added to server");
  }
}

async function downloadNext() {
  const idleTorrent = await getIdleMag()
  if (idleTorrent){
    const mag = new MagnetObject(idleTorrent.uri, idleTorrent.downloadLocation, idleTorrent.filesToDelete, idleTorrent.id)
    await downloadHandler(mag)
  }
}

torrent.get("/queue", async (req,res) => {
  const currentTorrent = await getRunningMag()
  const queueTorrents = await db.findMany({ downloaded:  0 });
   res.send({currentTorrent: currentTorrent, queueTorrents: queueTorrents})
})

torrent.post("/add", async (req,res) => {

  logger("huh?")
  const uri = req.body.magnetLink
  const downloadLocation = req.body.downloadLocation
  const filesToDelete = () => {
    let files = req.body.filesToDelete.split(',')
    let filesToDelete: string[] = []
    files.forEach((file: any) => {
      filesToDelete.push(file.replace(/ - [0-9].*/g,""))
    })
    return filesToDelete
  }

  let magnet = new MagnetObject(uri, downloadLocation, filesToDelete())
  console.log(magnet);

  await addMag(magnet)
  await downloadHandler(magnet)
  logger("Torrent added Urbit server")
  res.send("added to queue")
})

torrent.post("/completed", async (req,res) => {
   console.log(req.body.id);
   await updateMagStatus(req.body.id, 2)
   await downloadNext()
   res.send("Thank you ")
})

torrent.post("/reset", async (req,res) => {
  const currentTorrent = await getRunningMag()
  if (currentTorrent){
    await updateMagStatus(currentTorrent.id, 0)
  }

  try {
    await fetch(`${api}/reset`, {
      method: "POST"})
  } catch (e) {
    logger(e)
  }
  await downloadNext()
  res.send("Thank you ")
})

torrent.get("/current", async (req,res) => {
  const currentTorrent = await getRunningMag()
  res.send(currentTorrent)
})

torrent.get("/current/ws", async (req,res) => {
  const currentTorrent = await getRunningMag()
  const result = {id: currentTorrent!.id, websocketLink: `ws://${ws}/ws/${currentTorrent!.id}`, apiLink: api }
  res.send(result)
})

torrent.get("/current/status", async (req,res) => {
  try {
    const dataRaw = await fetch(`${api}/status`)
    const data = await dataRaw.json()
    res.send(data)
  } catch (e) {
    res.send({active: false})
  }
})
