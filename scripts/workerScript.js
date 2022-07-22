/**
 *  Web Worker script to communicate with the main thread.
 */
export const workerScript = () => {
  /** @param {MessageEvent} msgEvent */
  const messageEventHandler = (msgEvent) => {
    const data = msgEvent.data;

    const now = new Date().getTime();
    let result = 0;
    while (true) {
      result += Math.random() * Math.random();
      if (new Date().getTime() > now + data.ms) break;
    }
    data.result = 'done';

    // communicate errors via postMessage, don't use throw
    // const error = new Error('on purpose triggered error in workerScript');
    // self.postMessage({ error });
    // throw error;

    self.postMessage(data);

    // close this worker
    self.close();
  };

  /**
   * Use this handler only for clean up operations. Cannot communicate to main thread.
   * @param {ErrorEvent} errorEvent
   */
  const errorEventHandler = (errorEvent) => {
    // console.error(new Error(errorEvent.message));
  };

  self.addEventListener('message', messageEventHandler, false);
  self.addEventListener('error', errorEventHandler, false);
};
