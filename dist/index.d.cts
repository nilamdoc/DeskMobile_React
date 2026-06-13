import React from 'react';

type DeskMobileStatus = "idle" | "creating" | "pending" | "approved" | "expired" | "cancelled" | "error";
type DeskMobileCreateResponse = {
    success: boolean;
    token?: string;
    qr_payload?: string;
    status?: DeskMobileStatus | string;
    expires_at?: string;
    message?: string;
};
type DeskMobileStatusResponse = {
    success: boolean;
    status: DeskMobileStatus | string;
    token?: string;
    user_id?: string | null;
    user_ref?: string | null;
    approved_at?: string | null;
    expires_at?: string | null;
    message?: string;
};
type UseDeskMobileLinkOptions = {
    baseUrl: string;
    pollIntervalMs?: number;
    autoCreate?: boolean;
    onApproved?: (data: DeskMobileStatusResponse) => void;
    onExpired?: (data: DeskMobileStatusResponse) => void;
    onCancelled?: (data: DeskMobileStatusResponse) => void;
    onError?: (error: unknown) => void;
};
type UseDeskMobileLinkResult = {
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
declare function useDeskMobileLink(options: UseDeskMobileLinkOptions): UseDeskMobileLinkResult;
type DeskMobileLinkProps = {
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
declare function DeskMobileLink(props: DeskMobileLinkProps): React.JSX.Element;
declare const deskMobileDefaultStyles = "\n.dm-wrapper {\n  min-height: 100vh;\n  font-family: Arial, Helvetica, sans-serif;\n  background:\n    radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 35%),\n    radial-gradient(circle at bottom right, rgba(22, 163, 74, 0.14), transparent 32%),\n    linear-gradient(135deg, #eef2ff, #f8fafc);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  color: #111827;\n}\n.dm-card {\n  width: 100%;\n  max-width: 460px;\n  background: #fff;\n  border-radius: 24px;\n  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.16);\n  padding: 30px;\n  text-align: center;\n  border: 1px solid #e5e7eb;\n}\n.dm-logo {\n  width: 64px;\n  height: 64px;\n  margin: 0 auto 18px;\n  border-radius: 20px;\n  background: linear-gradient(135deg, #2563eb, #16a34a);\n  color: #fff;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 900;\n  font-size: 18px;\n}\n.dm-title {\n  margin: 0;\n  font-size: 27px;\n  font-weight: 900;\n  color: #111827;\n}\n.dm-subtitle {\n  margin: 8px auto 0;\n  color: #6b7280;\n  font-size: 15px;\n  line-height: 1.5;\n  max-width: 340px;\n}\n.dm-qr-box {\n  width: 284px;\n  height: 284px;\n  margin: 28px auto 18px;\n  background: #fff;\n  border: 1px solid #e5e7eb;\n  border-radius: 22px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 18px;\n}\n.dm-placeholder {\n  color: #6b7280;\n  font-size: 14px;\n}\n.dm-status {\n  margin-top: 18px;\n  padding: 14px;\n  border-radius: 16px;\n  background: #f9fafb;\n  border: 1px solid #e5e7eb;\n  font-size: 14px;\n  font-weight: 800;\n  color: #374151;\n}\n.dm-success {\n  background: #ecfdf5;\n  color: #166534;\n  border-color: #bbf7d0;\n}\n.dm-warning {\n  background: #fff7ed;\n  color: #9a3412;\n  border-color: #fed7aa;\n}\n.dm-error {\n  background: #fee2e2;\n  color: #991b1b;\n  border-color: #fecaca;\n}\n.dm-actions {\n  display: grid;\n  gap: 10px;\n  margin-top: 16px;\n}\n.dm-btn {\n  width: 100%;\n  height: 48px;\n  border: 0;\n  border-radius: 14px;\n  background: #2563eb;\n  color: #fff;\n  font-size: 15px;\n  font-weight: 900;\n  cursor: pointer;\n}\n.dm-btn:hover {\n  background: #1d4ed8;\n}\n.dm-btn-light {\n  background: #e5e7eb;\n  color: #111827;\n}\n.dm-btn-light:hover {\n  background: #d1d5db;\n}\n.dm-payload {\n  margin-top: 12px;\n  font-size: 12px;\n  color: #9ca3af;\n  word-break: break-all;\n}\n";

export { type DeskMobileCreateResponse, DeskMobileLink, type DeskMobileLinkProps, type DeskMobileStatus, type DeskMobileStatusResponse, type UseDeskMobileLinkOptions, type UseDeskMobileLinkResult, deskMobileDefaultStyles, useDeskMobileLink };
