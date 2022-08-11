

async function getFiles() {

  const allFileNames: string[] = [];
  for await (const files of Deno.readDir(`/home/nawaf/Media/`)){
    allFileNames.push(files.name)
  }
  for await (const dirEntry of Deno.readDir('/home/nawaf/Media/')) {
    if (dirEntry.isDirectory) {
      for await (const files of Deno.readDir(`/home/nawaf/Media/${dirEntry.name}`)) {
        if (files.isFile) {
          allFileNames.push(files.name)
          const move = Deno.run({cmd: ["mv", `/home/nawaf/Media/${dirEntry.name}/${files.name}`, `/home/nawaf/Media/`]})
          await move.close()
        }
      }
    }
  }
  return allFileNames;
}

async function deleteFiles(allFileNames: string[], filesToDelete: string[]) {

  allFileNames.forEach(async e => {
    for (let i = 0; i < filesToDelete.length; i++) {
      const file = filesToDelete[i];
      if (e == file) {
        console.log(e);
        await Deno.remove(`/home/nawaf/Media/${e}`)
      }
    }
  });
}



let fileNames = await getFiles()

await deleteFiles(fileNames,[ "1.mkv", "3.mp4", "2.png" ] )

// loop thorugh them to bring every file to the parent dir


//delete unwanted files
