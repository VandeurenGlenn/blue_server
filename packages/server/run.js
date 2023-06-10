import { readFile } from "fs/promises"

const data = JSON.parse((await readFile('./data.json')).toString())
console.log(data[0].github.repos);