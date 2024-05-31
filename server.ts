import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

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

const STATIC_PATH = path.join(process.cwd(), "./static");

const toBool = [() => true, () => false];
 // @ts-ignore
const prepareFile = async (url) => {
  const paths = [STATIC_PATH, url];
  if (url.endsWith("/")) {
    paths.push("index.html")
  };
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + "/404.html";
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

const router = (url: string) => {
  switch (url) {
    case '/':
      return '<html><body><h1>Welcome to the Home Page</h1></body></html>';
    case '/about':
      return '<html><body><h1>About Us</h1></body></html>';
    default:
      return null;
  }
}


http.createServer(async (req, res) => {

  if(!req.url) return;

  const routeResponse = router(req.url);

  if (routeResponse !== null) {
    res.writeHead(200, { "Content-Type": MIME_TYPES.html });
    res.end(routeResponse);
  } else {
    const file = await prepareFile(req.url);
    const statusCode = file.found ? 200 : 404;
    // @ts-ignore
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
    res.writeHead(statusCode, { "Content-Type": mimeType });
    file.stream.pipe(res);
  }

  console.log(`${req.method} ${req.url} ${routeResponse !== null ? 200 : 404}`);
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
