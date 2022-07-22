'use strict';
import WebworkerPool from './Webworker/WebworkerPool.js';
import WebworkerTask from './Webworker/WebworkerTask.js';
import { workerScript } from './workerScript.js';

/**
 * Handler who handles the results coming from the web worker script.
 *
 * @param {MessageEvent} evt
 */
let evtHandler = (evt) => {
  if (evt instanceof ErrorEvent) {
    console.error(new Error(evt.message));
    return;
  } else if (evt instanceof Error) {
    console.error(evt);
    return;
  } else if (evt.data['error']) {
    console.error(evt.data.error);
    return;
  }

  console.log(evt.data.result);
  console.timeLog('blocked');
};

function main() {
  setInterval(() => {
    console.log('Non blocking task executing synchronously...');
  }, 2000);

  // only available in Modules (https://dmitripavlutin.com/javascript-import-meta/)
  let dirURL = import.meta.url;
  dirURL = dirURL.substring(0, dirURL.lastIndexOf('/'));

  const workerScriptURL = dirURL
    ? dirURL + '/worker.js'
    : window.location.origin + '/scripts/worker.js';

  console.time('blocked');

  const maxPoolSize = navigator.hardwareConcurrency || 1;
  const pool = new WebworkerPool(maxPoolSize);

  /** Object parameters
   *********************************/
  let task = new WebworkerTask({
    script: workerScriptURL,
    callback: evtHandler,
    paramData: { ms: 10 * 1000 },
  });
  pool.addTask(task);

  /** External imported web worker script
   *********************************/
  task = new WebworkerTask(workerScript, evtHandler, { ms: 12 * 1000 });
  pool.addTask(task);

  /** Promise with custom handler
   *********************************/
  const call = (eventArgs) => {
    return new Promise((resolve, reject) => {
      const customHandler = (evt) => {
        if (evt instanceof ErrorEvent) {
          reject(new Error(evt.message));
          return;
        } else if (evt instanceof Error) {
          reject(evt);
          return;
        } else if (evt.data['error']) {
          reject(evt.data.error);
          return;
        }

        resolve(evt.data.result);
      };

      const task = new WebworkerTask(workerScriptURL, customHandler, eventArgs);
      pool.addTask(task);
    });
  };

  call({ ms: 14 * 1000 })
    .then((res) => {
      console.log(res);
      console.timeLog('blocked');
    })
    .catch((err) => {
      throw err;
    });

  /** Async/await
   *********************************/
  task = new WebworkerTask(
    workerScriptURL,
    null, // gets replaced
    { ms: 16 * 1000 }
  );

  (async () => {
    try {
      const evt = await pool.addTaskAsync(task);
      console.log(evt.data.result);
      console.timeEnd('blocked');
    } catch (err) {
      throw err;
    }
  })();
}

function contentLoadedHandler(evt) {
  window.removeEventListener('DOMContentLoaded', contentLoadedHandler);
  main.call(this);
}

if (typeof window != 'undefined') {
  window.addEventListener('DOMContentLoaded', contentLoadedHandler);
} else main();
