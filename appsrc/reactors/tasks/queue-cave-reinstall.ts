
import {Watcher} from "../watcher";
import * as actions from "../../actions";

import {findWhere} from "underscore";

import {getGlobalMarket, getUserMarket} from "../market";

import {startTask} from "./start-task";

import pathmaker from "../../util/pathmaker";
import fetch from "../../util/fetch";

import {startDownload} from "./start-download";

export default function (watcher: Watcher) {
  watcher.on(actions.queueCaveReinstall, async (store, action) => {
    const {caveId} = action.payload;
    const cave = getGlobalMarket().getEntity("caves", caveId);
    if (!cave) {
      // can't reinstall without a valid cave!
      return;
    }

    const credentials = store.getState().session.credentials;
    const game = await fetch.gameLazily(getUserMarket(), credentials, cave.gameId);
    if (!game) {
      // no valid game
      return;
    }

    if (!cave.uploadId || !cave.uploads) {
      // no uploads in cave
      return;
    }

    const uploadResponse = await startTask(store, {
      name: "find-upload",
      gameId: game.id,
      game: game,
    });
    const upload = uploadResponse.result.uploads[0];

    if (!upload) {
      // couldn't find an upload
      return;
    }

    const archivePath = pathmaker.downloadPath(upload);

    const findDownloadKey = () => {
      return findWhere(getUserMarket().getEntities("downloadKeys"), {gameId: game.id});
    };

    await startDownload(store, {
      game,
      gameId: game.id,
      upload,
      totalSize: upload.size,
      destPath: archivePath,
      downloadKey: cave.downloadKey || findDownloadKey(),
      reason: "reinstall",
    });

    await startTask(store, {
      name: "install",
      reinstall: true,
      upload,
      gameId: game.id,
      game,
      cave,
      archivePath,
    });
  });
}
