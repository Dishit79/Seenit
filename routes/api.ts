import { Router } from "https://deno.land/x/opine/mod.ts";
import { bitsearch, bitsearchInfo} from "./normal.ts";
import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { v4 } from "https://deno.land/std/uuid/mod.ts";

const API = "10.0.0.140:5050"

function generateId() {
  return v4.generate();
}

export const api = new Router

async function parseInput(name:string) {
  console.log("POG");
}

//main endpoint to get lyrics
api.get("/search", async (req,res) => {

  if (!req.query.q) {
    res.setStatus(400).send({status:400, error:'no valid search query'})
  }

  let ans = await bitsearch(req.query.q)
  res.send(ans)
})

api.get("/info", async (req,res) => {

  if (!req.query.q) {
    res.setStatus(400).send({status:400, error:'no valid search query'})
  }

  let ans = await bitsearchInfo(req.query.q)
  res.send(ans)
})



interface Mag {
    id: string
    uri: string
    downloadLocation: string
    downloaded: number
}

// Initialization
const db = new Database<Mag>('storage.json');

export class MagnetObject {
  id: string
  uri: string
  downloadLocation: string
  downloaded = 0

  constructor(uri: string, downloadLocation: string, id:string = null) {
    if (!id){
      this.id = generateId()
    } else {
      this.id = id
    }

    this.uri = uri
    this.downloadLocation = downloadLocation
  }
}

async function addMag(mag:MagnetObject) {
  await db.insertOne(mag)
}

async function updateMag(id: string, status: number) {
  await db.updateOne({ id: id }, { downloaded: status });
}


async function downloadHandler(magnet:MagnetObject) {

  let t = await db.findOne({ downloaded:  1 });
  if (!t){
    await fetch(`${API}/torrent/add`, {
      method: "POST",
      body: new URLSearchParams({
        'id': magnet.id,
        'magnetLink': magnet.uri,
        'loaction': 'movie'})
    })
    await updateMag(magnet.id, 1)
    console.log("ADDED THE  TORRENT TO SERVER");
  }
}


api.post("/torrent/add", async (req,res) => {
   console.log(req.body.magnetLink);
   const uri = req.body.magnetLink
   let magnet = new MagnetObject(uri, '/Documents/')
   await addMag(magnet)
   await downloadHandler(magnet)
   res.send("added to queue")
})


api.post("/torrent/completed", async (req,res) => {
   console.log(req.body.id);
   await updateMag(req.body.id, 2)
   await downloadNext()
   res.send("Thank you ")
})


async function downloadNext() {
  let t = await db.findOne({ downloaded:  0 });
  if (t){
    const mag = new MagnetObject(t.uri, t.downloadLocation, t.id)
    await downloadHandler(mag)
  }
}
