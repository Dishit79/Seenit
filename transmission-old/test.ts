const process = Deno.run({cmd: ["./rqbit" ,"server", "start", "/"], stdout: "piped",
  stdin: "piped",});

const lines = process.stdout!.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream());

async function iterate() {
  console.log("called");

  for await (const line of lines) {
    sono.emit(line);
  }
}


class InstanceHandler {
   queue: { [key: string]: any } = {}
   currentInstance: string

  constructor() {
  }

  createInstance()




}
