import { getConfig } from "https://gist.githubusercontent.com/Dishit79/65f0c7b8188557c86d68022dfa07f543/raw/47c86def8ebe51754eb17179eb844385ef31c8f5/config.ts";

const config = await getConfig()


async function getFiles(id: string) {

  const allFileNames: string[] = [];
  for await (const files of Deno.readDir(`/home/${config.unixName}/Media/${id}/`)){
    allFileNames.push(files.name)
  }
  for await (const dirEntry of Deno.readDir(`/home/${config.unixName}/Media/${id}/`)) {
    if (dirEntry.isDirectory) {
      for await (const files of Deno.readDir(`/home/${config.unixName}/Media/${id}/${dirEntry.name}`)) {
        if (files.isFile) {
          allFileNames.push(files.name)
          const move = Deno.run({cmd: ["mv", `/home/${config.unixName}/Media/${id}/${dirEntry.name}/${files.name}`, `/home/${config.unixName}/Media/${id}/`]})
          await move.close()
        }
      }
    }
  }
  return allFileNames;
}

async function deleteFiles(id: string, allFileNames: string[], filesToDelete: string[]) {

  allFileNames.forEach(async e => {
    for (let i = 0; i < filesToDelete.length; i++) {
      const file = filesToDelete[i];
      if (e == file) {
        console.log(e);
        await Deno.remove(`/home/${config.unixName}/Media/${id}/${e}`)
      }
    }
  });
}

async function moveFiles(id: string, downloadLocation: string) {

  console.log("hi");


  for await (const file of Deno.readDir(`/home/${config.unixName}/Media/${id}/`)) {
    if (file.isFile) {
      const move = Deno.run({cmd: ["mv", `/home/${config.unixName}/Media/${id}/${file.name}`, `/home/${config.unixName}/Media/${downloadLocation}`]})
      await move.status()
      await move.close()
      console.log(file.name);

      }
    }
  await Deno.remove(`/home/${config.unixName}/Media/${id}/`)
}

export async function handleFiles(id: string, filesToDelete: string[], downloadLocation:string ) {

  const move = Deno.run({cmd: ["mv", `${id}`, `/home/${config.unixName}/Media/`]})
  await move.status()
  await move.close()

  const fileNames = await getFiles(id)
  await deleteFiles(id, fileNames, filesToDelete)
  await moveFiles(id,downloadLocation)

}
