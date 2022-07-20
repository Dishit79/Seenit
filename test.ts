import { cheerio } from "https://deno.land/x/cheerio/mod.ts";

const rawHtml = await fetch('https://bitsearch.to/search?q=silicon valley')
const readableHtml = await rawHtml.text()
//console.log(readableHtml)

const $ = cheerio.load(readableHtml)



$("body > main > div.container.mt-2 > div > div.w3-col.s12.mt-1").find("li").each(function(i, link){
    console.log($(link).find('img[alt="Size"]').prev())
})
