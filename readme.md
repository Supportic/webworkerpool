# Readme

Spawns the maximum number of web workers and reuse them if more tasks are queued.

based on this article: http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool/

A blocking task is executing console logs while web workers executing their tasks in the background.

Either provide the traditional absolute URL path to the worker.js file where you take care of event handlers by yourself.
OR import the workerScript function from workerScript.js and it will be automatically wrapped into a web worker environment via blob generation.

```js
const workerURL = script.startsWith("http")
  ? script
  : window.URL.createObjectURL(new Blob([script]));

this.worker = new Worker(workerURL);
```

## API Usage

**define task option: 1**

```js
const pool = new WebworkerPool(maxPoolSize);

let evtHandler = (evt) => {
  // error handling
  console.log(evt.data.result);
};

let task = new WebworkerTask({
  script: "<http://host/path/to/worker.js>",
  callback: evtHandler, // handler of returning results from the web worker
  paramData: { param1: "", param2: "" },
});

pool.addTask(task);
```

**define task async**

```js
const pool = new WebworkerPool(maxPoolSize);

const call = (eventArgs) => {
  return new Promise((resolve, reject) => {
    const customHandler = (evt) => {
      //  error handling
      resolve(evt.data.result);
    };

    const task = new WebworkerTask(
      "<http://host/path/to/worker.js>",
      customHandler, // handler of returning results from the web worker
      eventArgs
    );

    pool.addTask(task);
  });
};

call({ param1: "", param2: "" })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    throw err;
  });
```

**define task option: 2**

```js
const pool = new WebworkerPool(maxPoolSize);
import { workerScript } from "./workerScript.js";

let evtHandler = (evt) => {
  // error handling
  console.log(evt.data.result);
};

let task = new WebworkerTask(workerScript, evtHandler, {
  param1: "",
  param2: "",
});
// queue task
pool.addTask(task);
```

## Installaton

Start server:
`docker-compose up`
...in the background:
`docker-compose up -d`

Open http://localhost and watch the console.

Remove containers and volume:
`docker-compose down -v`

**if npm is locally installed**:

`npm ci && npx serve -l 80 .`
