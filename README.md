# co-authy

An Authy client for node.js using generators via [co](https://github.com/visionmedia/co).

## Status

[![Build Status](https://travis-ci.org/seegno/co-authy.svg)](https://travis-ci.org/seegno/co-authy) [![NPM version](https://badge.fury.io/js/co-authy.svg)](http://badge.fury.io/js/co-authy)


## Installation

```
$ npm install co-authy
```

  To use `co-authy` you must be running __node 0.11.9__ or higher for generator support and node must be ran with the `--harmony` flag.

## API

### AuthyClient(apiKey, apiUrl)

Initialize a new Authy Client.

 * `apiKey` Required.
 * `apiUrl` Defaults to production endpoint (`https://api.authy.com`).

### registerUser(email, cellphone, countryCode)

Enable two-factor authentication on a user. You should store the returned `authy_id` in your database for subsequent calls.

Cellphone numbers are validated against a lenient validator to make sure only possible number are sent to the Authy API.

The `countryCode`can be one of the following:

* A valid calling code (e.g. 351);
* An ISO 3166-1 alpha-2 code (e.g. PT);
* An ISO 3166-1 alpha-3 code (e.g. PTR);

The library automatically converts conforming country codes to the corresponding calling code. For instance, if the `countryCode` passed is `PT`, then the calling code will be set to `351` without requiring extra work from the developer. Defaults to US (`1`) if omitted.

The list of countries is sourced from the awesome [countries project](https://github.com/mledoze/countries) by [@mdledoze](https://github.com/mledoze) with added support for special International Networks codes +882 and +883.

### verifyToken(authyId, token, options)

Verify a token entered by the user. Enable the `force` parameter to verify the token regardless of the user login status.

The token format is verified through an TOTP token validator.

### requestSms(authyId, options)

Request an SMS with a token for users that don't own a smartphone. If the Authy app is in use by the user, this request is ignored. Pass `force` to send an SMS regardless of this. You can also use the `shortcode` option to send the SMS using short code (available in US and Canada).

Available options: ['force', 'shortcode']

### requestCall(authyId, options)

Request a call with a token for users that don't own a smartphone or are having trouble with SMS. If the Authy app is in use by the user, this request is ignored. Pass `force` to call the user regardless of this.

### deleteUser(authyId)

Delete an user from the application.

### getUserStatus(authyId)

Retrieve an user status.

### registerActivity(authyId, type, ip, data)

Register an user activity.

### getApplicationDetails()

Retrieves the application details.

### getApplicationStatistics()

Retrieves the application statistics.


## Usage

A basic example on how to register a user using the Authy client via the sandbox API. To use this example, you should register on Authy and then pass your own API secret key via the `AUTHY_KEY` environment variable.

```js
var assert = require('assert');
var client = require('co-authy')(process.env.AUTHY_KEY, 'http://sandbox-api.authy.com');
var co = require('co');

co(function *() {
  var response = yield client.registerUser('rui.marinho@seegno.com', '123456789', '351');

  assert('number' === typeof response.user.id);

  console.log('AuthyID:', response.user.id);
})();
```

```
$ AUTHY_KEY=<secret key> node --harmony index.js
```

## Tests

All public method are unit tested using `nock` for mocked responses.

```
$ npm test
```

If you wish to run the tests by hitting the actual URLs, you may disable `nock` entirely and pass your own API secret key via the `AUTHY_KEY` environment variable. The sandbox API is often reset which means tests may fail when running against the actual sandbox API endpoints.

```
$ NOCK_OFF=true AUTHY_KEY=<secret key> npm test
```

## Author

[Rui Marinho](https://github.com/ruimarinho)

## License

MIT