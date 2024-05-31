import * as http from "node:http";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

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

const router = async (url: string) => {
  switch (url) {
    case '/':
      // @ts-ignore
      const Page = await import('./build/page.js');
      const html = renderToString(Page.default());
      // const html = renderToString(createElement(Page.default()));
      return html
    case '/about':
      return '<html><body><h1>About Us</h1></body></html>';
    default:
      return null;
  }
}


http.createServer(async (req, res) => {

  if(!req.url) return;

  const routeResponse = await router(req.url);

  if (routeResponse !== null) {
    res.writeHead(200, { "Content-Type": MIME_TYPES.html });
    res.end(routeResponse);
  } else {
    res.writeHead(404, { "Content-Type": MIME_TYPES.html });
    res.end('Not found!')
  }
  
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
