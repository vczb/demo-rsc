import * as path from "path";
import * as fs from "fs";
import { MIME_TYPES } from "./constants";
import { HTTP } from "./types";

export const staticFiles = (url: string, res: HTTP['res']) => {

  const filePath = path.join(__dirname, '..', 'static', url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": MIME_TYPES.html });
      res.end('File Not Found');
    } else {
      const ext = path.extname(filePath).slice(1);
      // @ts-ignore
      const mimeType = MIME_TYPES[ext] || MIME_TYPES.default;
      res.writeHead(200, { "Content-Type": mimeType });
      res.end(data);
    }
  });

  return; // Exit early since we are handling the static file request
  
}