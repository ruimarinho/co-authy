# co-authy

An Authy client for node.js using generators via [co](https://github.com/visionmedia/co).

## Status

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

## Installation

```
$ npm install co-authy
```

  To use `co-authy` you must be running __node 0.11.9__ or higher for generator support and node must be ran with the `--harmony` flag.

**NOTE: this module does not have a stable API yet. Use with precaution and at your own risk in production environments. Version 1.0.0 will be released once the API has been finalized.**

## API

### AuthyClient(apiKey, options)

Initialize a new Authy Client.

 * `apiKey`
 * `options` (Optional)
    * `host` Defaults to production endpoint (`https://api.authy.com`).

### registerUser(email, cellphone, code)

Enable two-factor authentication on a user. You should store the returned `authy_id` in your database for subsequent calls.

The `code`can be one of the following:

* An ISO 3166-1 alpha-2 code (e.g. PT) (**recommended**);
* An ISO 3166-1 alpha-3 code (e.g. PTR);
* A valid calling code (e.g. 351);

The library automatically converts conforming country codes to the corresponding calling code. For instance, if the `code` passed is `PT`, then the calling code will be set to `351` without requiring extra work from the developer. Defaults to US (`1`) if omitted.

The list of countries is sourced from the awesome [countries project](https://github.com/mledoze/countries) by [@mdledoze](https://github.com/mledoze) with added support for special International Networks codes +882 and +883.

### verifyToken(authyId, token, options)

Verify a token entered by the user. Enable the `force` parameter to verify the token regardless of the user login status.

The token format is verified through an TOTP token validator.

### requestSms(authyId, options)

Request an SMS with a token for users that don't own a smartphone. If the Authy app is in use by the user, this request is ignored and a push notification is sent instead. Pass `force` to send an SMS regardless of this. You can also use the `shortcode` option to send the SMS using short code (available in US and Canada).

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

### How phone validation works

Authy documentation is not clear on how their phone number validation works, but if their javascript version is any indication, they use a [generic regular expression](https://github.com/authy/authy-form-helpers/blob/master/src/form.authy.js) that matches almost all possible phone combinations.

In general, this approach is fine for most applications, but sometimes a more precise control is needed to avoid programmer errors and also to provide a better UX to users. For instance, if a number is invalid for a region but apparently correct for the naked eye, Authy will report a success status when requesting an SMS, even thought the message will never reach the destiny. This will leave the end-user wondering why your service does not work properly.

This library uses the full-featured phone number validation library [libphonenumber](https://github.com/seegno/libphonenumber) created by Google to power everything phone number-related on its Android 4.0 platform. There is also evidence that the same code is used to enable the phone validation check on their *2-Step Verification* process. While validating phone numbers is a daunting task with many quirks and intricacies, the line of thinking is that if it works for Google, it should work for us too.

By using such a comprehensive library, one can provide out-of-box true phone number validation including region validation, i.e., making sure a phone number is valid for a specific country. This is common in the North American Numbering Plan (NANP), where a number like `+1 408-550-3542` is a valid United States phone number but not a Canada one, even though they share the same country calling code (`+1`).

To take advantage of all the validation features, you should pass an ISO 3166-1 alpha-2 or ISO 3166-1 alpha-3 code to `#registerUser` instead of a country calling code (e.g. 351), because there are cases where a country calling code matches multiple countries and validation becomes less useful. The country code will be automatically converted to a matching country calling code if it is supported, so no other changes are required.

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

[npm-image]: https://img.shields.io/npm/v/co-authy.svg?style=flat
[npm-url]: https://npmjs.org/package/co-authy
[travis-image]: https://img.shields.io/travis/seegno/co-authy.svg?style=flat
[travis-url]: https://travis-ci.org/seegno/co-authy
