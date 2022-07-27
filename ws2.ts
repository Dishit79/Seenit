import { WosninClient } from "./Wosnin/client.ts";


let ws = new WosninClient('ws://localhost:5000/ws')


ws.route("/help", (req: any)=> {
  ws.send(req)
})


setInterval(()=>{ ws.send("{'route': "time"}") }, 1000 )
