import AdminShell from "../components/AdminShell";
import "../globals.css";

export const metadata = {
  title: "Admin - OKPUPS",
};

export default function AdminLayout({ children }) {
  return (
    <>
      <div className="bg-transparent">
        <AdminShell />

        <div className="mx-auto max-w-6xl p-6">{children}</div>

        
      </div>
    </>
  );
}
