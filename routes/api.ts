import { Router } from "https://deno.land/x/opine/mod.ts";
import { bitsearch, bitsearchInfo} from "./normal.ts";


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
