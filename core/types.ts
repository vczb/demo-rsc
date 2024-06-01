import { IncomingMessage, ServerResponse } from "http";

export type HTTP = {
  req: IncomingMessage;
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  }
}