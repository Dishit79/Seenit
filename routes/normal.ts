import { cheerio } from "https://deno.land/x/cheerio/mod.ts";




export async function bitsearch(query: string) {
  let gatheredInfo = []

  const rawHtml = await fetch(`https://bitsearch.to/search?q=${query}`)
  const readableHtml = await rawHtml.text()

  const $ = cheerio.load(readableHtml)

  $("body > main > div.container.mt-2 > div > div.w3-col.s12.mt-1").find("li").each(function(i, link){
    gatheredInfo.push({name: $(link).find('h5 > a').text(), type: $(link).find('.category').text(), size: $(link).find('img[alt="example"]').attr("alt"), magnetLink: $(link).find('.dl-magnet').attr('href')})
  })

  return gatheredInfo
}
