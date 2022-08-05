async function getConfig() {
  try {
    const config = await Deno.readTextFile("./config.json");
    const configJson = JSON.parse(config)
    return(configJson);
  } catch (e) {
    //console.log(error)
    if (e instanceof Deno.errors.NotFound) {
      console.log("ttt");
    } else if (e instanceof SyntaxError)
      console.log(e);
  }
}

let t = await getConfig()
