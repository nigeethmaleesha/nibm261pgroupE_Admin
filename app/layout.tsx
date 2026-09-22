import type { Metadata } from "next";
import "./globals.css";
import { InternalAuthProvider } from "@/src/shared/auth/InternalAuthProvider";
import { ToastProvider } from "@/src/shared/ui/ToastProvider";

export const metadata: Metadata = {
  title: {
    default: "RepairFlow Staff Portal",
    template: "%s | RepairFlow Staff Portal",
  },
  description: "Secure Owner/Staff and Technician portal for RepairFlow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <InternalAuthProvider>{children}</InternalAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
