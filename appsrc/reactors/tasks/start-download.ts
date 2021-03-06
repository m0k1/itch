
import {Watcher} from "../watcher";
import * as actions from "../../actions";

import * as uuid from "node-uuid";

import {log, opts} from "./log";

import {IStore, IStartDownloadOpts} from "../../types";

let orderSeed = 0;

export async function startDownload (store: IStore, downloadOpts: IStartDownloadOpts) {
  downloadOpts.order = orderSeed++;

  const downloadsState = store.getState().downloads;

  const existing = downloadsState.downloadsByGameId[downloadOpts.game.id];
  if (existing && !existing.finished) {
    log(opts, `Not starting another download for ${downloadOpts.game.title}`);
    store.dispatch(actions.navigate("downloads"));
    return;
  }

  const {upload, downloadKey} = downloadOpts;
  log(opts, `Should download ${upload.id}, has dl key ? ${!!downloadKey}`);

  const id = uuid.v4();
  // FIXME: wasteful but easy
  store.dispatch(actions.downloadStarted(Object.assign({}, downloadOpts, {id, downloadOpts})));
}

export default function (watcher: Watcher) {
  watcher.on(actions.queueDownload, async (store, action) => {
    const downloadOpts = action.payload;
    await startDownload(store, downloadOpts);
  });

  watcher.on(actions.retryDownload, async (store, action) => {
    startDownload(store, action.payload.downloadOpts);
  });
}
