import * as http from "node:http";


import { PORT } from "./core/constants";
import { clientRoute } from "./core/client-route";
import { staticFiles } from "./core/static-files";


http.createServer(async (req, res) => {
  if (!req.url) return;

  const url = req.url
 
  const isStatic = /\./;

  if (isStatic.test(url)) {
    await staticFiles(url, res);
  } else {
    await clientRoute(url, res);
  }
  
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
