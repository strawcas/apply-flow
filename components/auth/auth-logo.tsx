import Image from "next/image";
import logo from "@/public/logo.png";

export function AuthLogo({ className }: { className?: string }) {
  return <Image src={logo} alt="" className={className} sizes="64px" />;
}
