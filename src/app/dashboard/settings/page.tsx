import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail, Shield, ShieldAlert, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const { name, email, role } = session.user;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
          Cài đặt tài khoản
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500">
          Quản lý thông tin hồ sơ cá nhân và phân quyền tài khoản của bạn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: General Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-slate-200/50 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-sm md:text-base font-semibold text-slate-800">
                Thông tin cá nhân
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Thông tin được đồng bộ trực tiếp từ tài khoản Google của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-600">
                  Họ và tên
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    value={name || ""}
                    disabled
                    className="pl-10 text-slate-700 bg-slate-50/50 font-medium border-slate-200/60 text-xs md:text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-600">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    value={email || ""}
                    disabled
                    className="pl-10 text-slate-700 bg-slate-50/50 font-medium border-slate-200/60 text-xs md:text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Role & Status Info Card */}
        <div className="space-y-6">
          <Card className="border border-slate-200/50 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-sm md:text-base font-semibold text-slate-800">
                Trạng thái tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Role badge and info */}
              <div className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50/40 rounded-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600 border border-violet-100/50">
                  {role === "ADMIN" ? (
                    <ShieldAlert className="h-5 w-5" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                </div>
                <h4 className="mt-3 text-xs md:text-sm font-bold text-slate-800">Phân quyền vai trò</h4>
                <div className="mt-1">
                  <Badge className="bg-violet-600 text-white hover:bg-violet-700 border-none font-semibold text-[10px]">
                    {role === "ADMIN" ? "Quản trị viên (Admin)" : "Học viên (Student)"}
                  </Badge>
                </div>
              </div>

              {/* Extra Security Info */}
              <div className="rounded-xl border border-slate-100 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-violet-600" />
                  <span className="text-xs font-semibold text-slate-800">VietLearn Member</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Tài khoản của bạn đã được xác minh thành công. Hãy bảo mật thông tin tài khoản Google liên kết để đảm bảo an toàn lộ trình học.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
