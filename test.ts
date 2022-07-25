import { cheerio } from "https://deno.land/x/cheerio/mod.ts";

let gatheredInfo = []

const link = "https://bitsearch.to/torrents/silicon-valley-s01-s06-e17ba/5f2919b14762a02dd6f62e57/"

const rawHtml = await fetch(link)
const readableHtml = await rawHtml.text()

const $ = cheerio.load(readableHtml)

$("body > main > div.container.details-page-layout > div.meta-box > div.w3-tabs > div.tab.view-box.show.files.primary-text > div > div").find(".file-list").each(function(i, link){
  let t = $(link).find('.file-name').each(function(i2, link2){
    gatheredInfo.push($(link2).text())
  })
})

console.log(gatheredInfo);
