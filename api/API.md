# Lantern API

The API is served by the backend on `SERVER_PORT` (default `3001`). REST request and response bodies use JSON. There is no API version prefix.

## REST endpoints

### Lights

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/lights` | List lights, ordered by position (`x`) and then ID. |
| `GET` | `/api/lights/{lightID}` | Get one light. Returns `404` with `"Light not found"` if it does not exist. |
| `POST` | `/api/lights/{lightID}` | Set a light's color. |
| `POST` | `/api/lights/{lightID}/position` | Set a light's horizontal position. |
| `POST` | `/api/lights/{lightID}/delete` | Remove a light. |

`lightID` is the numeric ID of the light.

#### Set a light's color

`POST /api/lights/{lightID}`

```json
{ "color": "FF0000" }
```

`color` is a six-character hexadecimal RGB color. On success, the response body is `{}`. Invalid colors return `400`; a missing light returns `404`.

#### Set a light's position

`POST /api/lights/{lightID}/position`

```json
{ "x": 12 }
```

`x` is parsed as an integer. On success, the response body is `{}`. A missing light returns `404`.

#### Remove a light

`POST /api/lights/{lightID}/delete`

No request fields are required. On success, the response body is `{}`. A missing light returns `404`.

### Display

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/display/color` | Set all lights to one color. |
| `POST` | `/api/display/all` | Set colors for a list of lights. |

Both endpoints return `{}` on success. Colors use the six-character hexadecimal RGB format.

#### Set all lights to one color

`POST /api/display/color`

```json
{ "color": "00FF00" }
```

An invalid color returns `400`.

#### Set colors for selected lights

`POST /api/display/all`

```json
{
  "lights": [
    { "id": 1, "color": "FF0000" },
    { "id": 2, "color": "0000FF" }
  ]
}
```

Each item contains a light `id` and its `color`. The handler starts an update for each item and returns `{}`. Its current asynchronous implementation may return before those updates finish; errors raised during individual updates may not be returned as HTTP error responses.

## Light response object

Light list and detail responses contain objects with this shape:

```json
{
  "id": 1,
  "address": "light-address",
  "color": "FF0000",
  "x": 12,
  "lastUpdated": "2026-01-01T12:00:00.000Z"
}
```

`lastUpdated` is a serialized date-time. The exact date value and light address depend on the stored light.

## WebSocket

The client connects to `ws://{host}/api/lights` (use `wss://` when the service is behind TLS). On connection, the server sends the current light list:

```json
{
  "instruction": "ALL_LIGHTS",
  "data": {
    "lights": []
  }
}
```

Subsequent messages use `UPDATE_LIGHT`, `ADD_LIGHT`, or `REMOVE_LIGHT` as the `instruction`. For these messages, `data` is a JSON-encoded light object (a string), rather than a nested object:

```json
{
  "instruction": "UPDATE_LIGHT",
  "data": "{\"id\":1,\"address\":\"light-address\",\"color\":\"FF0000\",\"x\":12}"
}
```

## Notes

- The server does not configure authentication for these routes.
- Color validation currently checks for a six-character hexadecimal substring rather than requiring the entire value to match.
