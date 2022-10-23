import { format } from "https://deno.land/std/datetime/mod.ts";
//import { v4 } from "https://deno.land/std/uuid/mod.ts";


export function generateId() {
  return crypto.randomUUID();
}

export async function logger(message:string) {
  let currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss")
  console.log(`[${currentTime}] - ${message}`);
}
