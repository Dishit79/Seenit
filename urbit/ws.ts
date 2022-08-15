import { Router } from "https://deno.land/x/opine/mod.ts";
import { readLines } from "https://deno.land/std@0.104.0/io/mod.ts";
import { getConfig } from "https://gist.githubusercontent.com/Dishit79/65f0c7b8188557c86d68022dfa07f543/raw/47c86def8ebe51754eb17179eb844385ef31c8f5/config.ts";


export const ws = new Router
const config = await getConfig()


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
}

const handleSocket = async (socket: WebSocket, id: string) => {

  socket.addEventListener("close", () => {
  });

  socket.addEventListener("open", async () => {
    const check = await exists(id)

    if (check){
      await websocketStatus(id, socket)
    } else {
      socket.close()
    }
  })
}


ws.get("/ws/:id", async (req, res) => {
  if (req.headers.get("upgrade") === "websocket") {
    const socket = req.upgrade()
    handleSocket(socket, req.params.id)
  } else {
    res.send("Ok?")
  }
})
