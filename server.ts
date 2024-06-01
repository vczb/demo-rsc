import * as http from "node:http";
import { createElement } from "react";
// @ts-ignore
import { renderToReadableStream } from 'react-dom/server.browser';

const PORT = 8000;

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const clientComponentMap = {};

const router = async (url: string) => {
  const filePath = `./build/pages/${url}/page.js`.replace('//', '/');

  try {
    const Page = await import(filePath)
    const element = createElement(Page.default);
    const stream = await renderToReadableStream(element, clientComponentMap);
    return {
      status: 200,
      response: new Response(stream, {
        headers: { 'content-type': 'text/html' },
      })
    }
  } catch (e) {
    console.error(e);
    // @ts-ignore
    const status = e.message.includes('Cannot find module') ? 404 : 500
    return {
      status,
      response: null
    };
  }
};

http.createServer(async (req, res) => {
  if (!req.url) return;

  const  { response, status } = await router(req.url);

  if (response !== null) {
    res.writeHead(status, { "Content-Type": MIME_TYPES.html });

    const readableStream = response.body as ReadableStream;
    const reader = readableStream.getReader();

    const streamToResponse = async () => {
      const decoder = new TextDecoder();
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
    const message = status === 404 ? 'Page Not Found!' : 'Internal Server Error =/'
    res.end(message);
  }
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
