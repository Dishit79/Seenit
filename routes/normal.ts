import { cheerio } from "https://deno.land/x/cheerio@1.0.6/mod.ts";


export async function bitsearch(query: string) {
  let gatheredInfo:object[] = []

  const rawHtml = await fetch(`https://bitsearch.to/search?q=${query}`)
  const readableHtml = await rawHtml.text()

  // @ts-ignore
  const $ = cheerio.load(readableHtml);

  $("body > main > div.container.mt-2 > div > div.w3-col.s12.mt-1").find("li").each(function(i:any, link: any){
    gatheredInfo.push({name: $(link).find('h5 > a').text(), links: $(link).find('h5 > a').attr("href") , type: $(link).find('.category').text(), size: $(link).find('img[alt="Size"]').parent("div").text(), seeders: $(link).find('img[alt="Seeder"]').parent("div").text().replace(/\s/g,""),  magnetLink: $(link).find('.dl-magnet').attr('href')})
  })

  return gatheredInfo
}

export async function bitsearchInfo(link: string) {
  let gatheredInfo:string[] = []

  const rawHtml = await fetch(`https://bitsearch.to${link}`)
  const readableHtml = await rawHtml.text()

  // @ts-ignore
  const $ = cheerio.load(readableHtml);

  $("body > main > div.container.details-page-layout > div.meta-box > div.w3-tabs > div.tab.view-box.show.files.primary-text > div > div").find(".file-list").each(function(i:any, link: any){
    let t = $(link).find('.file-name').each(function(i2: any, link2: any){
      gatheredInfo.push($(link2).text())
    })
  })
  const magnetLink = $('body > main > div.container.details-page-layout > div.details-box.view-box > div.dl-links > a:nth-child(2)').attr("href")

  return {gatheredInfo: gatheredInfo, magnetLink: magnetLink}
}
