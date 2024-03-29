Oratorium Commenting
====================

**Oratorium** is stand-alone commenting service that you could attach by
including javascript on any page.

This was initially constructed because [Ghost](https://ghost.org/) has no built
in commenting functionality and I don't want ads funded commenting, nor tie it
to one specific social platform.

Commenters must authenticate via the
[OpenID Connect](https://openid.net/connect/) protocol (supported by
e.g. Google).  (Anonymous commenting removed.)

I'm using this repo to try out architectures and language solutions.  It will
contain more than one implementation of the backend.  Currently, a monolithic
Node.js version is the only one.

Backend uses event sourcing, jwt access tokens and openid connect
authentication protocol.  See more in [HACKING.md](./HACKING.md).


Frontend setup
--------------

```bash
cd client
yarn install ; or npm install
```

Link the client directory so it is reachable from your frontend (in https if
that's what your frontend uses).  In Ghost (blog), I've added this for the post
page (linking the clients directory into the theme's assets):

```html
<link href="{{asset "comments/comments.css"}}" rel="stylesheet" />

...

<div class="comments" id="comments"></div>
<script src="{{asset "comments/node_modules/markdown/lib/markdown.js"}}"></script>
<script src="{{asset "comments/node_modules/preact/dist/preact.dev.js"}}"></script>
<script src="{{asset "comments/client.js"}}"></script>
<script>
  SomeComments('https://fredrik.liljegren.org/comments')
    .comments('{{id}}')
    .mount(document.getElementById('comments'))
</script>
</script>
```

Naturally, you might want to use non-dev preact etc in a production environment.


Server setup
------------

1. Setup [EventStore](https://eventstore.org/).
2. See respective server for setup instructions.
   * [Node.js monolithic service](./backends/nodejs-monolith).


Work in progress
----------------

This is a hobby project, getting just occational focus when I have time over.
It does work for my purposes, but there's much wanting.

Todo:

* Check identity async - get user identity from `/users/me` endpoint to
  pre-show already logged in user picture.
* Subscription - add anyone commenting as subscriber.  Make endpoint to
  unsubscribe from page.  Need page url to ID relation.
* Delete comment - authenticated user deleting her own comment, site admin
  deleting any comment. (includes adding site admin)
* User separation
  * Keep users separate in client
  * Return list of users in get comments `{ comments, users }`
* User overview
  * GDPR compliant
  * Delete Me function
* Backends in other languages/styles
  * Python
  * Golang
  * Haskell
  * Typescript
  * Microservice node.js - one service per endpoint, fat read sides
  * Serverless kubernetes/istio/...
* Comment voting
  * Default quality 1
  * Vote up / down
  * hide/show bad (quality < 0) comments
* Reputation
  * Gather votes on user's all comments
  * Make reputation affect votes, or affect default comment quality?

Architecture
------------

### Models

#### Site

#### Page

#### User

Using no internal ID, the user is identified by `sub` and `iss`, due to how OpenID Connect works.


#### Comment


### Endpoints


### Events


### Data flow


Changelog
---------

### 1.0.0

Forking off of my old [Some Comments](https://github.com/fiddur/some-comments),
making some new proof-of-concept backends, using event sourcing with
[EventStore](https://eventstore.org/) as backend.

Yes, I know that this is more cumbersome to quickly setup than just using
sqlite, but using event sourcing is a relevant part of the architectural PoCs
I'm making.


License ([GNU AGPLv3](http://www.gnu.org/licenses/agpl-3.0.html))
-----------------------------------------------------------------

Copyright (C) 2021 Fredrik Liljegren <fredrik@liljegren.org>

Oratorium is free software: you can redistribute it and/or modify it under the
terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

See COPYING.
