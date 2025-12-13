import Header from "@/components/header";
import Footer from "@/components/footer";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <ScrollArea className="h-screen"> */}
      <Header />
      {children}
      <Footer />
      {/* </ScrollArea> */}
    </>
  );
}
