import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Wisey Tutors — Your next breakthrough starts here", template: "%s | Wisey Tutors" },
  description: "Personalized tutoring for curious minds. Find the right support, build confidence, and make learning click with Wisey Tutors.",
  openGraph: { title: "Wisey Tutors — Your next breakthrough starts here", description: "Personalized tutoring for curious minds.", siteName: "Wisey Tutors", type: "website" },
  twitter: { card: "summary_large_image", title: "Wisey Tutors", description: "Personalized tutoring for curious minds." },
};
export const viewport: Viewport = { themeColor: "#070b12", colorScheme: "dark" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
