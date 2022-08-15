import { Router } from "https://deno.land/x/opine/mod.ts";
import { bitsearch, bitsearchInfo} from "./normal.ts";
import { getConfig } from "../utils/config.ts"

const config = await getConfig()

export const api = new Router

async function parseInput(name:string) {
  console.log("POG");
}

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

api.get("/imdb/:title", async (req,res) => {
  const imdbRes = await fetch(`https://imdb-api.com/en/API/SearchTitle/${config.imdbKey}/${req.params.title}`)
  const id = await imdbRes.json()
  const imdbDataRaw = await fetch(`https://imdb-api.com/en/API/Title/${config.imdbKey}/${id.results[0].id}`)
  const imdbData = await imdbDataRaw.json()
  res.send(imdbData)
})
