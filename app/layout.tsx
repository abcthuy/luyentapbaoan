import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout";
import { ProgressProvider } from "@/components/progress-provider";
import { SoundProvider } from "@/hooks/use-sound";
import { ThemeProvider } from "@/hooks/use-theme";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "SuperKids - Học Tập Toàn Diện",
  description: "Ứng dụng luyện tập lớp 2 theo trình độ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.className} ${beVietnamPro.variable} antialiased`} suppressHydrationWarning>
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
