"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  DeskMobileLink: () => DeskMobileLink,
  deskMobileDefaultStyles: () => deskMobileDefaultStyles,
  useDeskMobileLink: () => useDeskMobileLink
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
var import_qrcode = require("qrcode.react");
var import_jsx_runtime = require("react/jsx-runtime");
function cleanBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, "");
}
async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 300)}`);
  }
}
function useDeskMobileLink(options) {
  const {
    baseUrl,
    pollIntervalMs = 2e3,
    autoCreate = true,
    onApproved,
    onExpired,
    onCancelled,
    onError
  } = options;
  const apiBase = (0, import_react.useMemo)(() => cleanBaseUrl(baseUrl), [baseUrl]);
  const [token, setToken] = (0, import_react.useState)(null);
  const [qrPayload, setQrPayload] = (0, import_react.useState)(null);
  const [expiresAt, setExpiresAt] = (0, import_react.useState)(null);
  const [status, setStatus] = (0, import_react.useState)("idle");
  const [message, setMessage] = (0, import_react.useState)("Ready to create link session.");
  const [error, setError] = (0, import_react.useState)(null);
  const intervalRef = (0, import_react.useRef)(null);
  const tokenRef = (0, import_react.useRef)(null);
  const clearPolling = (0, import_react.useCallback)(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  const checkStatus = (0, import_react.useCallback)(async () => {
    const currentToken = tokenRef.current;
    if (!currentToken) {
      return;
    }
    try {
      const response = await fetch(`${apiBase}/link/status/${encodeURIComponent(currentToken)}`, {
        headers: {
          Accept: "application/json"
        }
      });
      const data = await readJson(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to check link status.");
      }
      const nextStatus = data.status;
      setStatus(nextStatus);
      if (nextStatus === "approved") {
        clearPolling();
        setMessage("Desktop linked successfully.");
        onApproved?.(data);
      }
      if (nextStatus === "expired") {
        clearPolling();
        setMessage("QR code expired. Please generate a new one.");
        onExpired?.(data);
      }
      if (nextStatus === "cancelled") {
        clearPolling();
        setMessage("Link request cancelled.");
        onCancelled?.(data);
      }
      if (nextStatus === "pending") {
        setMessage("Waiting for mobile approval...");
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Unable to check status.";
      setError(errMessage);
      setStatus("error");
      setMessage(errMessage);
      clearPolling();
      onError?.(err);
    }
  }, [apiBase, clearPolling, onApproved, onCancelled, onError, onExpired]);
  const startPolling = (0, import_react.useCallback)(() => {
    clearPolling();
    intervalRef.current = window.setInterval(() => {
      void checkStatus();
    }, pollIntervalMs);
  }, [checkStatus, clearPolling, pollIntervalMs]);
  const createLink = (0, import_react.useCallback)(async () => {
    clearPolling();
    setStatus("creating");
    setMessage("Creating secure link session...");
    setError(null);
    setToken(null);
    setQrPayload(null);
    setExpiresAt(null);
    tokenRef.current = null;
    try {
      const response = await fetch(`${apiBase}/link/create`, {
        method: "POST",
        headers: {
          Accept: "application/json"
        }
      });
      const data = await readJson(response);
      if (!response.ok || !data.success || !data.token || !data.qr_payload) {
        throw new Error(data.message || "Unable to create QR session.");
      }
      setToken(data.token);
      setQrPayload(data.qr_payload);
      setExpiresAt(data.expires_at || null);
      setStatus("pending");
      setMessage("Waiting for mobile approval...");
      tokenRef.current = data.token;
      startPolling();
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Unable to create QR session.";
      setError(errMessage);
      setStatus("error");
      setMessage(errMessage);
      onError?.(err);
    }
  }, [apiBase, clearPolling, onError, startPolling]);
  const cancelLink = (0, import_react.useCallback)(async () => {
    const currentToken = tokenRef.current;
    if (!currentToken) {
      return;
    }
    try {
      await fetch(`${apiBase}/link/cancel`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: currentToken
        })
      });
      clearPolling();
      setStatus("cancelled");
      setMessage("Link request cancelled.");
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Unable to cancel link.";
      setError(errMessage);
      setStatus("error");
      setMessage(errMessage);
      onError?.(err);
    }
  }, [apiBase, clearPolling, onError]);
  (0, import_react.useEffect)(() => {
    if (autoCreate) {
      void createLink();
    }
    return () => {
      clearPolling();
    };
  }, []);
  return {
    token,
    qrPayload,
    expiresAt,
    status,
    message,
    loading: status === "creating",
    error,
    createLink,
    cancelLink,
    checkStatus
  };
}
function DeskMobileLink(props) {
  const {
    baseUrl,
    title = "Link Desktop",
    subtitle = "Open your mobile app and scan this QR code to link your account.",
    logoText = "DM",
    size = 240,
    pollIntervalMs = 2e3,
    onApproved,
    onExpired,
    onCancelled,
    onError,
    className,
    showPayload = false
  } = props;
  const {
    qrPayload,
    status,
    message,
    error,
    createLink,
    cancelLink
  } = useDeskMobileLink({
    baseUrl,
    pollIntervalMs,
    autoCreate: true,
    onApproved,
    onExpired,
    onCancelled,
    onError
  });
  const statusClass = status === "approved" ? "dm-status dm-success" : status === "expired" || status === "cancelled" ? "dm-status dm-warning" : status === "error" ? "dm-status dm-error" : "dm-status";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dm-wrapper ${className || ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: deskMobileDefaultStyles }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dm-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dm-logo", children: logoText }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "dm-title", children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dm-subtitle", children: subtitle }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dm-qr-box", children: qrPayload ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_qrcode.QRCodeCanvas, { value: qrPayload, size }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dm-placeholder", children: status === "creating" ? "Creating QR..." : "No QR available" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: statusClass, children: error || message }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dm-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dm-btn", onClick: createLink, children: "Generate New QR" }),
        status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dm-btn dm-btn-light", onClick: cancelLink, children: "Cancel" })
      ] }),
      showPayload && qrPayload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dm-payload", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "QR Payload:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
        qrPayload
      ] })
    ] })
  ] });
}
var deskMobileDefaultStyles = `
.dm-wrapper {
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 35%),
    radial-gradient(circle at bottom right, rgba(22, 163, 74, 0.14), transparent 32%),
    linear-gradient(135deg, #eef2ff, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #111827;
}
.dm-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.16);
  padding: 30px;
  text-align: center;
  border: 1px solid #e5e7eb;
}
.dm-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #2563eb, #16a34a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
}
.dm-title {
  margin: 0;
  font-size: 27px;
  font-weight: 900;
  color: #111827;
}
.dm-subtitle {
  margin: 8px auto 0;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.5;
  max-width: 340px;
}
.dm-qr-box {
  width: 284px;
  height: 284px;
  margin: 28px auto 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.dm-placeholder {
  color: #6b7280;
  font-size: 14px;
}
.dm-status {
  margin-top: 18px;
  padding: 14px;
  border-radius: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 800;
  color: #374151;
}
.dm-success {
  background: #ecfdf5;
  color: #166534;
  border-color: #bbf7d0;
}
.dm-warning {
  background: #fff7ed;
  color: #9a3412;
  border-color: #fed7aa;
}
.dm-error {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}
.dm-actions {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}
.dm-btn {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: #2563eb;
  color: #fff;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}
.dm-btn:hover {
  background: #1d4ed8;
}
.dm-btn-light {
  background: #e5e7eb;
  color: #111827;
}
.dm-btn-light:hover {
  background: #d1d5db;
}
.dm-payload {
  margin-top: 12px;
  font-size: 12px;
  color: #9ca3af;
  word-break: break-all;
}
`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DeskMobileLink,
  deskMobileDefaultStyles,
  useDeskMobileLink
});
