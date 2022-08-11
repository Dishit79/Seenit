

// list all the directory in directory
async function findDir() {

  const dirNames: string[] = [];
  for await (const dirEntry of Deno.readDir('/home/nawaf/Media/')) {
    if (dirEntry.isDirectory) {
      dirNames.push(dirEntry.name);
    }
  }

  dirNames.forEach(dir => {
    console.log( `/home/nawaf/Media/${dir}/*`);
    const move = Deno.run({cmd: ["stat", `/home/nawaf/Media/Movies/*`]})
  });
}





await findDir()

// loop thorugh them to bring every file to the parent dir


//delete unwanted files
