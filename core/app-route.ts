import { createElement } from "react";
// @ts-ignore
import { renderToReadableStream } from 'react-dom/server.browser';
import { MIME_TYPES } from "./constants";
import { HTTP } from "./types";

const clientComponentMap = {};

const router = async (url: string) => {
  const filePath = `../static/_build/pages/${url}/page.js`.replace(/\/\//g, '/');

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

export const appRoute = async (url: string, res: HTTP['res']) => {

  const  { response, status } = await router(url);

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
}