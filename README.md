# Project BEAMS Backend

## Overview
Node-Express implementation of Project BEAMS web server deployed in Heroku. Project BEAMS was designed for real-time structural seismic monitoring and analysis using 3-dimensional acceleration readings in both time and frequency domain.

## Usage
- Run `npm install` to install dependencies
- Create `nodemon.json` in root folder with the following structure <br>
`{`<br/>
`"env": {`<br/>
` "PORT": 8000,`<br/>
` "MONGO_USER": "Your mongoDB Atlas user",`<br/>
` "MONGO_PASSWORD": "Your mongoDB Atlas password",`<br/>
` "MONGO_DEFAULT_DATABASE": "Your mongoDB Atlas database name",`<br/>
` "SECRET_KEY": "Your secret key",`<br/>
` "TOKEN_EXPIRATION": "Your token expiration",`<br/>
` "GMAIL_EMAIL": "Your gmail email",`<br/>
` "GMAIL_PASSWORD": "Your gmail password",`<br/>
` "SERVER_URL": "Server URL",`<br/>
` "WEBAPP_URL": "Web app URL"`<br/>
`}`<br/>
`}`<br/>
- Run `npm start:dev` to start local server
- Run `npm dummy` to execute python script that would simulate a Node sensor

## API Endpoints

### Authentication-related endpoints

- POST /auth/user/signup

  - **Usage:** For facilitator registration
  - **Headers:** None
  - **Request Body:** `{firstname: String, lastname: String, email: String, password: String}`
  - **Response:** `{message: String}`
  - **Query parameters:** None
  - **Accessibility:** Public

- POST /auth/user/login

  - **Usage:** For facilitator login
  - **Headers:** None
  - **Request Body:** `{email: String, password: String}`
  - **Response:** `{message: String, data: {token: String, userId: String, firstname: String, lastname: String, accountType: String}}`
  - **Query parameters:** None
  - **Accessibility:** Public

- GET /auth/user/verify/:verificationToken (SSR-related endpoint)

  - **Usage:** For verifying attached token in verification link
  - **Headers:** None
  - **Request Body:** None
  - **Response:** HTML Template
  - **Query parameters:** None
  - **Accessibility:** Public

- GET /auth/user/resetPasswordForm/:uid (SSR-related endpoint)

  - **Usage:** For reseting user password
  - **Headers:** None
  - **Request Body:** `{newPassword: String, confirmPassword: String}`
  - **Response:** HTML Template
  - **Query parameters:** None
  - **Accessibility:** Public

- POST /auth/user/resetPassword/:uid (SSR-related endpoint)

  - **Usage:** For serving Password reset form
  - **Headers:** None
  - **Request Body:** None
  - **Response:** HTML Template
  - **Query parameters:** None
  - **Accessibility:** Public

- POST /auth/user/sendResetPassword

  - **Usage:** For requesting password reset form to email
  - **Headers:** None
  - **Request Body:** `{email: String}`
  - **Response:** `{message: String}`
  - **Query parameters:** None
  - **Accessibility:** Public

- POST /auth/user/sendVerification

  - **Usage:** For requesting verification link to email
  - **Headers:** None
  - **Request Body:** `{email: String}`
  - **Response:** `{message: String}`
  - **Query parameters:** None
  - **Accessibility:** Public

### User-related endpoints

- GET /users

  - **Usage:** For retrieving list of Users
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** None
  - **Response:** `{message: String, users: [User], totalItems: Number}`
  - **Query parameters:** `query`, `page`, and `queryTarget`
  - **Accessibility:** Admin

- GET /users/:userId

  - **Usage:** For retrieving sepecific User
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** None
  - **Response:** `{message: String, users: User}`
  - **Query parameters:** None
  - **Accessibility:** Admin and User (Owner)

- PATCH /users/changePassword/:userId

  - **Usage:** For changing user password
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** `{password: String}`
  - **Response:** `{message: String}`
  - **Query parameters:** None
  - **Accessibility:** User (Owner)

- PATCH /users/:userId

  - **Usage:** For changing user information
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** `{firstname: String, lastname: String, contactNo: String, profileUri: String}`
  - **Response:** `{message: String, user: User}`
  - **Query parameters:** None
  - **Accessibility:** User (Owner)

- DELETE /users/:userId

  - **Usage:** For deleting user
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** None
  - **Response:** `{message: String}`
  - **Query parameters:** None
  - **Accessibility:** User (Owner)

### Structure-related endpoints

- GET /structures

  - **Usage:** For retrieving list of Structures
  - **Headers:** None
  - **Request Body:** None
  - **Response:** `{message: String, structures: [Structure], totalItems: Number}`
  - **Query parameters:** `query`
  - **Accessibility:** Public

- GET /structures/:structureId

  - **Usage:** For retrieving sepecific Structure
  - **Headers:** None
  - **Request Body:** None
  - **Response:** `{message: String, structure: Structure}`
  - **Query parameters:** None
  - **Accessibility:** Public

- POST /structures

  - **Usage:** For creating Structure
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** `{name: String, description: String, location: String, imageUri: String}`
  - **Response:** `{message: String, structure: Structure}`
  - **Query parameters:** None
  - **Accessibility:** Facilitator

- PATCH /structures/:structureId

  - **Usage:** For editing Structure
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** `{name: String, description: String, location: String, imageUri: String}`
  - **Response:** `{message: String, structure: Structure}`
  - **Query parameters:** None
  - **Accessibility:** Facilitator

- DELETE /structures/:structureId

  - **Usage:** For deleting Structure
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** None
  - **Response:** `{message: String}`
  - **Query parameters:** None
  - **Accessibility:** Facilitator

### Node-related endpoints

- GET /nodes

  - **Usage:** For retrieving list of Nodes
  - **Headers:** None
  - **Request Body:** None
  - **Response:** `{message: String, nodes: [Node], totalItems: Number}`
  - **Query parameters:** none
  - **Accessibility:** Public

- GET /nodes/:nodeId

  - **Usage:** For retrieving sepecific Node
  - **Headers:** None
  - **Request Body:** None
  - **Response:** `{message: String, node: Node}`
  - **Query parameters:** None
  - **Accessibility:** Public

- POST /nodes

  - **Usage:** For creating Node
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** `{name: String, description: String, serialKey: String, imageUri: String}`
  - **Response:** `{message: String, node: Node}`
  - **Query parameters:** None
  - **Accessibility:** Facilitator

- PATCH /nodes/:nodeId

  - **Usage:** For editing Node
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** `{name: String, description: String, serialKey: String, imageUri: String}`
  - **Response:** `{message: String, node: Node}`
  - **Query parameters:** None
  - **Accessibility:** Facilitator

- DELETE /nodes/:nodeId

  - **Usage:** For deleting Node
  - **Headers:** `{Authorization: Bearer token}`
  - **Request Body:** None
  - **Response:** `{message: String}`
  - **Query parameters:** None
  - **Accessibility:** Facilitator

### Reading-related endpoints

- GET /readings/reading

  - **Usage:** For retrieving sequence of Readings
  - **Headers:** None
  - **Request Body:** None
  - **Response:** `{readings: [Reading]}`
  - **Query parameters:** `datetime`
  - **Accessibility:** Public

- GET /readings/:serialKey

  - **Usage:** For retrieving sepecific Reading
  - **Headers:** None
  - **Request Body:** None
  - **Response:** `reading: Reading}`
  - **Query parameters:** None
  - **Accessibility:** Public

- POST /readings

  - **Usage:** For receiving Node sensor readings
  - **Headers:** None
  - **Request Body:** `{serialKey: String, rawX: [Number], rawY: [Number], rawZ: [], fftX: [Number], fftY: [Number], fftZ: [Number], rawDatetime: [Date], fftFrequency: [Number], datetime: Date}`
  - **Response:** `{success: Boolean}`
  - **Query parameters:** None
  - **Accessibility:** Node Sensor

## Web Sockets

- **Usage:** For real time acquisition of reading snapshots
- **Channel:** `Node.serialKey`
- **Payload:** `{newReading: Reading}`

## Entities and Schema

- User<br/>
  `{`<br/>
  ` firstname: [String, NN],`<br/>
  ` lastname: [String, NN],`<br/>
  ` email: [String, NN, UQ],`<br/>
  ` password: [String, NN],`<br/>
  ` isVerified: [Boolean, NN, Default = false],`<br/>
  ` createdAt: [Date, NN],`<br/>
  ` modifiedAt: [Date, NN]`<br/>
  `}`<br/>

- Structure<br/>
  `{`<br/>
  ` name: [String, NN, UQ],`<br/>
  ` description: [String, NN],`<br/>
  ` location: [String, NN],`<br/>
  ` imageUri: [String],`<br/>
  ` nodes: [Array of Node._id, FK],`<br/>
  ` createdAt: [Date, NN],`<br/>
  ` modifiedAt: [Date, NN]`<br/>
  `}`<br/>

- Node<br/>
  `{`<br/>
  ` serialKey: [String, NN, UQ],`<br/>
  ` name: [String, NN],`<br/>
  ` description: [String, NN],`<br/>
  ` location: [String, NN],`<br/>
  ` imageUri: [String],`<br/>
  ` structure: [Structure._id, NN, FK],`<br/>
  ` createdAt: [Date, NN],`<br/>
  ` modifiedAt: [Date, NN]`<br/>
  `}`<br/>

- Reading<br/>
  `{`<br/>
  ` serialKey: [String, NN],`<br/>
  ` rawX: [[Number]],`<br/>
  ` rawY: [[Number]],`<br/>
  ` rawZ: [[Number]],`<br/>
  ` fftX: [[Number]],`<br/>
  ` fftY: [[Number]],`<br/>
  ` fftZ: [[Number]],`<br/>
  ` rawDatetime: [[Date]],`<br/>
  ` fftFrequency: [[Number]],`<br/>
  ` datetime: [Date, NN]`<br/>
  `}`<br/>
