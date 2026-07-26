import { AuthPage } from "@/components/ui/auth-page";
export default function Page() {
  return (
    <AuthPage
      mode="recover"
      title="Recupere seu acesso."
      text="Enviaremos um link seguro para redefinir sua senha."
    />
  );
}
