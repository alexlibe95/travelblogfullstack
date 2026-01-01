import Parse from 'parse/node.js';

console.log('Cloud Code loaded');

Parse.Cloud.define('hello', () => {
  return 'Hi';
});

Parse.Cloud.define('helloAsyncFunction', async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 'Hi async';
});
