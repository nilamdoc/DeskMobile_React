````bash
cd /home/dev/DeskMobile_React

cat > README.md <<'EOF'
# DeskMobile React

Generic React SDK for desktop and mobile QR linking using DeskMobile Laravel API.

## Install

```bash
npm install @nilamdoc/deskmobile-react
````

## Usage

```tsx
import { DeskMobileLink } from "@nilamdoc/deskmobile-react";

export default function LinkPage() {
  return (
    <DeskMobileLink
      baseUrl="https://your-domain.com/api/deskmobile"
      onApproved={() => {
        window.location.href = "/dashboard";
      }}
      showPayload
    />
  );
}
```

## Hook Usage

```tsx
import { useDeskMobileLink } from "@nilamdoc/deskmobile-react";

export default function CustomLinkPage() {
  const {
    qrPayload,
    status,
    message,
    createLink,
    cancelLink,
  } = useDeskMobileLink({
    baseUrl: "https://your-domain.com/api/deskmobile",
  });

  return (
    <div>
      <p>Status: {status}</p>
      <p>{message}</p>

      {qrPayload && <p>{qrPayload}</p>}

      <button type="button" onClick={createLink}>
        Generate QR
      </button>

      <button type="button" onClick={cancelLink}>
        Cancel
      </button>
    </div>
  );
}
```

## Props

| Prop             | Type       | Default                  | Description                              |
| ---------------- | ---------- | ------------------------ | ---------------------------------------- |
| `baseUrl`        | `string`   | Required                 | DeskMobile Laravel API base URL.         |
| `title`          | `string`   | `Link Desktop`           | Page or card title.                      |
| `subtitle`       | `string`   | Default instruction text | Description shown under title.           |
| `logoText`       | `string`   | `DM`                     | Logo text shown in the card.             |
| `size`           | `number`   | `240`                    | QR code size.                            |
| `pollIntervalMs` | `number`   | `2000`                   | Status polling interval in milliseconds. |
| `showPayload`    | `boolean`  | `false`                  | Show QR payload text below the QR.       |
| `onApproved`     | `function` | Optional                 | Called when mobile approves the QR link. |
| `onExpired`      | `function` | Optional                 | Called when QR expires.                  |
| `onCancelled`    | `function` | Optional                 | Called when link request is cancelled.   |
| `onError`        | `function` | Optional                 | Called when API or browser error occurs. |

## Backend Required

Install the Laravel backend package:

```bash
composer require nilamdoc/deskmobile:^1.0
```

Publish config:

```bash
php artisan vendor:publish --tag=deskmobile-config
php artisan optimize:clear
```

## Required Backend Endpoints

```text
POST /api/deskmobile/link/create
GET  /api/deskmobile/link/status/{token}
POST /api/deskmobile/link/approve
POST /api/deskmobile/link/cancel
GET  /api/deskmobile/scan/{token}
```

## Example With Real Domain

```tsx
import { DeskMobileLink } from "@nilamdoc/deskmobile-react";

export default function DeviceLink() {
  return (
    <DeskMobileLink
      baseUrl="https://images.ruchidoctor.com/api/deskmobile"
      onApproved={() => {
        window.location.href = "/dashboard";
      }}
      showPayload
    />
  );
}
```

## Package Links

```text
NPM Package: @nilamdoc/deskmobile-react
Laravel Backend Package: nilamdoc/deskmobile
```

## License

MIT License

Copyright (c) 2026 Nilam Doctor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
````
