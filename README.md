c# api-comicstrips

Principal backend for Comicstrips NYC.

### Architecture & Design

The Comicstrips backend is an event-driven architecture. This backend is built on Node.js and uses streams of Promises to manage the asynchronicity of dozens of events firing in real time.

Publishing of and subscription to events is facilitated by Node's native `EventEmitter`. The Comicstrips backend augements the native `EventEmitter` such that emitted events can return Promises with data and use a native Promise's `then` for improved management of async data. 

All application modules export a function which wraps that module's business logic and takes an `$imports` argument that can be used to import module dependencies at runtime. 

The Comicstrips backend runs in a Docker container. The deploy target is Heroku's container infrastructure.


### Development

Build the Docker image from the Dockerfile in this repo.

`$ docker build -t api-comicstrips:<tag-name>  .`

Start the docker container with the customized shell script.

`$ ./start.sh`

Inside the docker container do an: `$ npm install`.

Once dependencies are installed do: `npm run debug` start the Express server with `nodemon` watching for file changes in .js files.
 
### Documentation
Detailed documentaion of API endpoints and example requests and responses is outlined [here](https://documenter.getpostman.com/view/347225/api-comicstrips/RVftjX3E
).

#### Sequences of Events

Below is an overview of the throughline of events published as result of a request to a given API endpoint.

* `[POST] /api/v1/booking/create`
  * db/booking:createBooking
  * db/talent:bookingCreated
  * sms:onBookingCreated 
  
*  `[POST] /api/v1/booking-offer`
    * mailer:bookingConfirmed
    * db/mailer:onBookingConfirmed
    * mailer:bookingCreated
  
