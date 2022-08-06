export async function getConfig() {
  try {
    const config = await Deno.readTextFile("./config.json");
    const configJson = JSON.parse(config)
    return(configJson);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      throw 'Config file does not exist'
    } else if (e instanceof SyntaxError)
      throw 'Config file has a syntax error'
  }
}

export async function validateConfig(checks: any[]) {
  let config = await getConfig()
  checks.forEach(i => {
    if (!(config[i.name] && typeof config[i.name] ==  i.type)) {
      throw `"${i.name}" does not exist or does not have the correct type in the config file`
    }
  })
}
