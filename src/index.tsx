import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export type DeskMobileStatus =
  | "idle"
  | "creating"
  | "pending"
  | "approved"
  | "expired"
  | "cancelled"
  | "error";

export type DeskMobileCreateResponse = {
  success: boolean;
  token?: string;
  qr_payload?: string;
  status?: DeskMobileStatus | string;
  expires_at?: string;
  message?: string;
};

export type DeskMobileStatusResponse = {
  success: boolean;
  status: DeskMobileStatus | string;
  token?: string;
  user_id?: string | null;
  user_ref?: string | null;
  approved_at?: string | null;
  expires_at?: string | null;
  message?: string;
};

export type UseDeskMobileLinkOptions = {
  baseUrl: string;
  pollIntervalMs?: number;
  autoCreate?: boolean;
  onApproved?: (data: DeskMobileStatusResponse) => void;
  onExpired?: (data: DeskMobileStatusResponse) => void;
  onCancelled?: (data: DeskMobileStatusResponse) => void;
  onError?: (error: unknown) => void;
};

export type UseDeskMobileLinkResult = {
  token: string | null;
  qrPayload: string | null;
  expiresAt: string | null;
  status: DeskMobileStatus;
  message: string;
  loading: boolean;
  error: string | null;
  createLink: () => Promise<void>;
  cancelLink: () => Promise<void>;
  checkStatus: () => Promise<void>;
};

function cleanBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 300)}`);
  }
}

export function useDeskMobileLink(options: UseDeskMobileLinkOptions): UseDeskMobileLinkResult {
  const {
    baseUrl,
    pollIntervalMs = 2000,
    autoCreate = true,
    onApproved,
    onExpired,
    onCancelled,
    onError,
  } = options;

  const apiBase = useMemo(() => cleanBaseUrl(baseUrl), [baseUrl]);

  const [token, setToken] = useState<string | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [status, setStatus] = useState<DeskMobileStatus>("idle");
  const [message, setMessage] = useState("Ready to create link session.");
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const tokenRef = useRef<string | null>(null);

  const clearPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkStatus = useCallback(async () => {
    const currentToken = tokenRef.current;

    if (!currentToken) {
      return;
    }

    try {
      const response = await fetch(`${apiBase}/link/status/${encodeURIComponent(currentToken)}`, {
        headers: {
          Accept: "application/json",
        },
      });

      const data = await readJson<DeskMobileStatusResponse>(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to check link status.");
      }

      const nextStatus = data.status as DeskMobileStatus;

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

  const startPolling = useCallback(() => {
    clearPolling();

    intervalRef.current = window.setInterval(() => {
      void checkStatus();
    }, pollIntervalMs);
  }, [checkStatus, clearPolling, pollIntervalMs]);

  const createLink = useCallback(async () => {
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
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await readJson<DeskMobileCreateResponse>(response);

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

  const cancelLink = useCallback(async () => {
    const currentToken = tokenRef.current;

    if (!currentToken) {
      return;
    }

    try {
      await fetch(`${apiBase}/link/cancel`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: currentToken,
        }),
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

  useEffect(() => {
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
    checkStatus,
  };
}

export type DeskMobileLinkProps = {
  baseUrl: string;
  title?: string;
  subtitle?: string;
  logoText?: string;
  size?: number;
  pollIntervalMs?: number;
  onApproved?: (data: DeskMobileStatusResponse) => void;
  onExpired?: (data: DeskMobileStatusResponse) => void;
  onCancelled?: (data: DeskMobileStatusResponse) => void;
  onError?: (error: unknown) => void;
  className?: string;
  showPayload?: boolean;
};

export function DeskMobileLink(props: DeskMobileLinkProps) {
  const {
    baseUrl,
    title = "Link Desktop",
    subtitle = "Open your mobile app and scan this QR code to link your account.",
    logoText = "DM",
    size = 240,
    pollIntervalMs = 2000,
    onApproved,
    onExpired,
    onCancelled,
    onError,
    className,
    showPayload = false,
  } = props;

  const {
    qrPayload,
    status,
    message,
    error,
    createLink,
    cancelLink,
  } = useDeskMobileLink({
    baseUrl,
    pollIntervalMs,
    autoCreate: true,
    onApproved,
    onExpired,
    onCancelled,
    onError,
  });

  const statusClass =
    status === "approved"
      ? "dm-status dm-success"
      : status === "expired" || status === "cancelled"
        ? "dm-status dm-warning"
        : status === "error"
          ? "dm-status dm-error"
          : "dm-status";

  return (
    <div className={`dm-wrapper ${className || ""}`}>
      <style>{deskMobileDefaultStyles}</style>

      <div className="dm-card">
        <div className="dm-logo">{logoText}</div>

        <h1 className="dm-title">{title}</h1>

        <p className="dm-subtitle">{subtitle}</p>

        <div className="dm-qr-box">
          {qrPayload ? (
            <QRCodeCanvas value={qrPayload} size={size} />
          ) : (
            <div className="dm-placeholder">
              {status === "creating" ? "Creating QR..." : "No QR available"}
            </div>
          )}
        </div>

        <div className={statusClass}>
          {error || message}
        </div>

        <div className="dm-actions">
          <button type="button" className="dm-btn" onClick={createLink}>
            Generate New QR
          </button>

          {status === "pending" && (
            <button type="button" className="dm-btn dm-btn-light" onClick={cancelLink}>
              Cancel
            </button>
          )}
        </div>

        {showPayload && qrPayload && (
          <div className="dm-payload">
            <strong>QR Payload:</strong>
            <br />
            {qrPayload}
          </div>
        )}
      </div>
    </div>
  );
}

export const deskMobileDefaultStyles = `
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
