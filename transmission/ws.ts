// Create WebSocket connection.
//const socket = new WebSocket('wss://demo.piesocket.com/v3/channel_1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self')


class Wosnin{
  routes: { [key: string]: any } = {}
  host: string
  socket: WebSocket
  socketOpen = false


  constructor(host: string) {
    this.host = host
    this.socket = new WebSocket(host)

    this.socket.onopen = () => this.onConnected();
    this.socket.onmessage = (event) => this.onMessage(event);
    this.socket.onclose = () => {console.log("dishited")};
    this.socket.onerror = (error) => {console.log(error)};
  }

  route(endpoint: string,  callback: (socket: WebSocket) => void ) {
    if (this.routes[endpoint]){
      throw `Endpoint "${endpoint}" already in use`
    }
    this.routes[endpoint] = callback
  }

  onConnected(){
    console.log(`Connected to ${this.host}`);
    this.socketOpen = true
  }

  onMessage(event:MessageEvent){
    try {
      const req = JSON.parse(event.data)
      if (this.routes[req.route]){
        console.log('called');
        this.routes[req.route](this.socket)
      } else {
        console.log(req);
      }
    } catch{
      console.log('non Wosnin');
      return
    }

  }

  send(message:string){
    console.log(this.socketOpen);
    if (this.socketOpen){
      this.socket.send("test")
    }
  }
}


let tt = new Wosnin('ws://localhost:5000/ws')
//tt.start()

tt.route("/help", (ws)=> {
  ws.send("cool")
})


setInterval(()=>{ tt.send('r') }, 1000 )
