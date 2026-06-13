# DeskMobile React

Generic React SDK for desktop and mobile QR linking using DeskMobile Laravel API.

## Install

```bash
npm install @nilamdoc/deskmobile-react
```

## DeskMobile_React

## Usage
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

## Hook Usage
import { useDeskMobileLink } from "@nilamdoc/deskmobile-react";

const {
  qrPayload,
  status,
  message,
  createLink,
  cancelLink
} = useDeskMobileLink({
  baseUrl: "https://your-domain.com/api/deskmobile",
});

## Backend Required

Install Laravel package:

composer require nilamdoc/deskmobile:^1.0

endpoints:

POST /api/deskmobile/link/create
GET  /api/deskmobile/link/status/{token}
POST /api/deskmobile/link/approve
POST /api/deskmobile/link/cancel
GET  /api/deskmobile/scan/{token}

## 6. Create LICENSE

```bash
nano LICENSE
```
Paste:

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


