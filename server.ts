import * as http from "node:http";
import * as path from "path";
import * as fs from "fs";
import { MIME_TYPES, PORT } from "./constants";
import { createElement } from "react";
// @ts-ignore
import { renderToReadableStream } from 'react-dom/server.browser';

const clientComponentMap = {};

const router = async (url: string) => {
  const filePath = `./static/_build/pages/${url}/page.js`.replace(/\/\//g, '/');

  try {
    const Page = await import(filePath);
    const element = createElement(Page.default);
    const stream = await renderToReadableStream(element, clientComponentMap);
    return {
      status: 200,
      stream
    };
  } catch (e) {
    console.error(e);
    const status = (e as Error).message.includes('Cannot find module') ? 404 : 500;
    return {
      status,
      stream: null
    };
  }
};

const serveStaticFile = (url: string, res: http.ServerResponse) => {
  const filePath = path.join(__dirname, 'static', url);
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
};

http.createServer(async (req, res) => {
  if (!req.url) return;

  const url = req.url;
  const isStatic = /\./.test(url);

  if (isStatic) {
    serveStaticFile(url, res);
    return;
  }

  const { stream, status } = await router(url);

  if (stream) {
    res.writeHead(status, { "Content-Type": MIME_TYPES.html });
    const reader = stream.getReader();

    const decoder = new TextDecoder();

    const streamToResponse = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    };

    streamToResponse();
  } else {
    res.writeHead(status, { "Content-Type": MIME_TYPES.html });
    const message = status === 404 ? 'Page Not Found!' : 'Internal Server Error =/';
    res.end(message);
  }
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
