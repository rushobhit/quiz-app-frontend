import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function StudentLayout() {
  return (
    <div className="student-layout">
      <Header />
      <main className="student-layout__main">
        <Outlet />
      </main>
    </div>
  );
}