import { readLines } from "https://deno.land/std@0.104.0/io/mod.ts";
import { writeAll } from "https://deno.land/std@0.104.0/io/util.ts";


const file = await Deno.open(`./erewr34dsf2r32.txt`, {
  read: true,
  write: true,
  append: true,
  create: true,
});



async function pipeThrough(
  prefix: string,
  reader: Deno.Reader,
  writer: Deno.Writer,
  cat: any,
  ) {
    const encoder = new TextEncoder();
    for await (const line of readLines(reader)) {
      //await writeAll(writer, encoder.encode(`[${prefix}] ${line}\n`));
      let result = line.includes("100.00%");
      if (result){
        console.log(result);
        await cat.kill('SIGINT')
        return
      }
      await Deno.write(file.rid, new TextEncoder().encode(line));
      //file.write(new TextEncoder().encode(line))
    }
  }

const cat = Deno.run({
  cmd: ["./transmission/rqbit", "download", "-o", "Documents", 'magnet:?xt=urn:btih:a88fda5954e89178c372716a6a78b8180ed4dad3&dn=The+WIRED+CD+-+Rip.+Sample.+Mash.+Share&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fwired-cd.torrent'],
  stdout: "piped",
  stderr: "piped",
});


pipeThrough("docker", cat.stdout, Deno.stdout, cat);
pipeThrough("docker", cat.stderr, Deno.stderr, cat);
await cat.status();
console.log("Done!");
