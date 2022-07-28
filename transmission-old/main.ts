import { Database } from 'https://deno.land/x/aloedb/mod.ts';
import { v4 } from "https://deno.land/std/uuid/mod.ts";

// Structure of stored documents
interface Mag {
    id: string
    uri: string
    downloadLocation: string
}


function generateId() {
  return v4.generate();
}

export class MagnetObject {
  id: string
  uri: string
  downloadLocation: string

  constructor(uri: string, downloadLocation: string) {
    this.id = generateId()
    this.uri = uri
    this.downloadLocation = downloadLocation
  }
}


// Initialization
const db = new Database<Mag>('storage.json');


async function addObject(mag:MagnetObject) {
  await db.insertOne(mag)
}

async function receiveMag(uri:string) {
  let magnet = new MagnetObject(uri, '~/Documents/GitHub/torrenter')
  await addObject(magnet)
}




//await receiveMag('magnet:?xt=urn:btih:8607FD4EB951496780FAAA6DFB95FE74753B2F05&tr=udp%3A%2F%2Ftracker.bitsearch.to%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.moeking.me%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&dn=%5BBitsearch.to%5D+Monster+Inc+2001+BRRip+720p')
