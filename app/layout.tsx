import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/layout";
import { ProgressProvider } from "@/components/progress-provider";
import { SoundProvider } from "@/hooks/use-sound";
import { ThemeProvider } from "@/hooks/use-theme";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SuperKids - Học Tập Toàn Diện",
  description: "Ứng dụng luyện toán lớp 2 theo trình độ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ProgressProvider>
            <SoundProvider>
              <Suspense fallback={null}>
                <Layout>{children}</Layout>
              </Suspense>
              <Toaster position="top-center" reverseOrder={false} />
            </SoundProvider>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
