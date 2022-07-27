
export class WosninClient{
  routes: { [key: string]: any } = {}
  host: string
  socket: WebSocket


  constructor(host: string) {
    this.host = host
    this.socket = new WebSocket(host)

    this.socket.onopen = () => this.onConnected();
    this.socket.onmessage = (event) => this.onMessage(event);
    //this.socket.onclose = () => {console.log("dishited")};
    //this.socket.onerror = (error) => {console.log(error)};
  }

  route(endpoint: string,  callback: (event: any) => void ) {
    if (this.routes[endpoint]){
      throw `Wosnin endpoint "${endpoint}" already in use`
    }
    this.routes[endpoint] = callback
  }

  onConnected(){
    console.log(`Connected to ${this.host}`);
  }

  onMessage(event:MessageEvent){
    try {
      const req = JSON.parse(event.data)

      if (req.error) {
        console.log(req);
        return
      }

      if (this.routes[req.route]){
        this.routes[req.route](req)
      } else {
        console.log(req)
        this.send('{ "error": "No route specified"}')
      }
    } catch{
      this.send('{ "route": "Wosnin", "error": "Not a Wosnin Server"}')
      return
    }
  }


  send(message:any){
    if (this.socket.readyState == 1){
      this.socket.send(message)
    }
  }
}
