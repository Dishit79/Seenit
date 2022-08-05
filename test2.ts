async function getConfig() {
  try {
    const config = await Deno.readTextFile("./config.json");
    const configJson = JSON.parse(config)
    return(configJson);
  } catch (e) {
    //console.log(error)
    if (e instanceof Deno.errors.NotFound) {
      console.log("YOOOO");
    } else 

  }
}

let t = await getConfig()
//console.log(t.SERVER);





// import { parse } from "https://deno.land/std/encoding/jsonc.ts";
//
// async function getConfig() {
//   const config = JSON.parse(Deno.readTextFileSync("config.json"))
//   console.log(config);
// }
//
// await getConfig()
