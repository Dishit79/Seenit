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
    filesToDelete: array[string]
    downloaded: number
}

// Initialization
const db = new Database<Mag>('torrents.json');

export class MagnetObject {
  id: string
  uri: string
  downloadLocation: string
  filesToDelete: array[string]
  downloaded = 0

  constructor(uri: string, downloadLocation: string, filesToDelete: array[string], id:string | null = null) {
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
        'loaction': 'movie'})
    })
    await updateMagStatus(magnet.id, 1)
    console.log("Torrent added to server");
  }
}

async function downloadNext() {
  const idleTorrent = await getIdleMag()
  if (idleTorrent){
    const mag = new MagnetObject(idleTorrent.uri, idleTorrent.downloadLocation, idleTorrent.filesToDelete, idleTorrent.id)
    await downloadHandler(mag)
  }
}

torrent.post("/add", async (req,res) => {

   const uri = req.body.magnetLink
   const filesToDelete = req.body.filesToDelete

   let magnet = new MagnetObject('ewrwerwe', '/Documents/', filesToDelete.split(',').replace(/ - [0-9].*/g,""))
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


torrent.get("/current", async (req,res) => {
  const currentTorrent = await getRunningMag()
  res.send(currentTorrent)
})

torrent.get("/current/ws/", async (req,res) => {
  const currentTorrent = await getRunningMag()
  const result = {id: currentTorrent.id, websocketLink: `ws://${ws}/ws/${currentTorrent.id}`}
  res.send(result)
})
