//import { MagnetObject } from "./main.ts"
import { v4 } from "https://deno.land/std/uuid/mod.ts";


import { readableStreamFromReader, writableStreamFromWriter } from "https://deno.land/std/streams/conversion.ts";
import { mergeReadableStreams } from "https://deno.land/std@0.144.0/streams/merge.ts";
import { TextLineStream } from "https://deno.land/std@0.144.0/streams/mod.ts";

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

class Instance {
  id: string
  torrent: MagnetObject
  process: any
  state = 'idle'

  constructor(id: string, torrent: MagnetObject) {
    this.id = id
    this.torrent = torrent
  }

  create() {
    this.process = Deno.run({cmd: ["./rqbit" ,"server", "start", "media"], stdout: "piped",stdin: "piped",});
    this.state = 'active'
  }
}

class InstanceHandler {
   queue: { [key: string]: Instance } = {}
   currentInstance: string

  constructor() {
    this.currentInstance = "test"
    this.start()
  }

  createInstance(mag: MagnetObject){
    const id = generateId()
    const instance = new Instance(id, mag)
    this.queue[id] = instance
  }

  dictateInstance(){
    const states = this.checkState()

    if (states == false){
      let instance = Object.keys(this.queue)[0]
      console.log("WORKED");
        this.queue[instance].create()
    }
  }

  checkState() {
    let currentState = false
    for (const i in this.queue){
      let state = this.queue[i].state
      console.log(state);
      if (state == 'active') {
        this.currentInstance = i
        currentState = true
      }
    }
    console.log(currentState);
    return currentState;
  }

  start(){
    setInterval(()=>{ this.dictateInstance() }, 20000)
  }
}


const t = ('magnet:?xt=urn:btih:8607FD4EB951496780FAAA6DFB95FE74753B2F05&tr=udp%3A%2F%2Ftracker.bitsearch.to%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.moeking.me%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&dn=%5BBitsearch.to%5D+Monster+Inc+2001+BRRip+720p')
const test = new InstanceHandler()
let magnet = new MagnetObject(t, '~/Documents/GitHub/torrenter')
test.createInstance(magnet)
test.createInstance(magnet)
test.createInstance(magnet)

console.log(test.currentInstance);

setInterval(()=>{ console.log(test.currentInstance); }, 20000 )
