const ip = async () => {
  let tmp = await fetch('https://api.ipify.org/')
  return await tmp.text()
}
console.log(await  ip());
