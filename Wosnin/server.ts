



export class WosninServer{
  routes: { [key: string]: any } = {}

  constructor() {
    console.log('A new WosninServer instance created');
  }

  listen(socket: WebSocket) {
    socket.onopen = () => this.onOpen();
    socket.onclose = () => this.onClose();
    socket.onmessage = (event) => this.onMessage(socket,event);
    //socket.onerror = (error) => handleError(e);
  }

  route(endpoint: string,  callback: (event: any, sb: WebSocket) => void ) {
    if (this.routes[endpoint]){
      throw `Wosnin endpoint "${endpoint}" already in use`
    }
    this.routes[endpoint] = callback
  }

  onOpen(){
    console.log(`Connected to a client`);
  }
  onClose(){
    console.log(`Client disconnected`);
  }

  onMessage(socket: WebSocket, event:MessageEvent){

    try {
      const req = JSON.parse(event.data)

      if (req.error) {
        console.log(req);
        return
      }
      
      if (this.routes[req.route]){
        this.routes[req.route](req,socket)
      } else {
        console.log(req)
        this.send(socket, '{ "error": "No route specified"}')
      }
    } catch{
      this.send(socket, '{ "route": "Wosnin", "error": "Not a Wosnin client"}')
      return
      }
    }

  send(socket: WebSocket, message:string){
    if (socket.readyState == 1){
      socket.send((message))
    }
  }
}
