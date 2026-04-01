import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Email de redefinição enviado. Verifique sua caixa de entrada.");
        setIsForgot(false);
      }
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Conta criada! Verifique seu email para confirmar o cadastro.");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Email ou senha inválidos.");
    } else {
      navigate("/");
    }
  };

  const title = isForgot ? "Redefinir Senha" : isSignUp ? "Criar Conta" : "Entrar";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Sucesso do Cliente +A</h1>
          <p className="text-sm text-muted-foreground mt-1">OPM</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">{title}</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {isSignUp && !isForgot && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            {!isForgot && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Aguarde..." : title}
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            {!isForgot && (
              <button
                type="button"
                onClick={() => setIsForgot(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueceu a senha?
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsForgot(false);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? "Já tem conta? Entrar" : "Não tem conta? Cadastre-se"}
            </button>
            {isForgot && (
              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
