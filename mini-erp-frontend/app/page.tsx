import { redirect } from "next/navigation";

export default function OldLoginPage() {
  // Bắt bất kỳ ai truy cập vào route cũ này và đẩy thẳng sang route mới
  redirect("/auth/login");
}