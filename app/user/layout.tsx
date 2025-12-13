import { UserSidebar } from "./components/user-sidebar";
import "./globals.css";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="user-body user-container">
      <UserSidebar />
      <main className="user-main">
        <div className="user-content">
          {children}
        </div>
      </main>
    </div>
  );
}

