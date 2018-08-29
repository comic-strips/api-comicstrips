# api-comicstrips

Principal backend for Comicstrips NYC.

### Architecture & Design

The Comic Strips backend is an event-driven architecture. This backend is built on Node.js and uses streams of Promises to manage the asynchronicity of dozens of events firing in real time.

Publishing of and subscription to events is facilitated by Node's native `EventEmitter`. 

All application modules export a function which wraps that module's business logic and takes an `$imports` argument that can be used to import module dependencies at runtime. 

The Comic Strips backend runs in a Docker container. The deploy target is Heroku's container infrastructure.


### Development

Build the Docker image from the Dockerfile in this repo.

`$ docker build -t api-comicstrips:<tag-name>  .`

Start the docker container with the customized shell script.

`$ ./start.sh`

Inside the docker container do an: `$ npm install`.

Once dependencies are installed do: `npm run debug` start the Express server with `nodemon` watching for file changes in .js files.

### Testing

Run API integration tests.

1. `$ npm run test:integration` 
2. WAIT! It will take a few seconds to spin up the Express server before the test suite runs.
3. View the test report in the command line.
 
### Documentation
Detailed documentaion of API endpoints and example requests and responses is outlined [here](https://documenter.getpostman.com/view/347225/api-comicstrips/RVftjX3E
).

#### Events 

##### Event Manifest

Below is a list of applications events along with the modules that produce these events, the modules that listen for these events.

| Event         | Producer      | Consumer(s)  |
| ------------- |:-------------:| :-----:|
| inbound-bookreq-acknowledged  | booking-pipline | mailer, talent-pipeline |
| outbound-talent-request| talent-pipeline | sms |
| booking-offer-accepted | offer-pipeline | payments |
| booking-confirmed | payments | mailer |
| outbound-booking-confirmation | payments | mailer
| found-payment-error | payments | mailer |

