"use client"

import { redirect } from "next/navigation";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/use-toast"
import { useLoggedInStore } from "@/store";

const formSchema = z.object({
  email: z.string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  password: z.string()
    .min(6, { message: "The password must contain at least 6 characters"}),
  confirmPassword: z.string(),
}).refine(({ password, confirmPassword }) => confirmPassword === password, { message: "Mismatched passwords", path: ["confirmPassword"] });

export default function SignupPage() {
  const { loggedIn } = useLoggedInStore();
  if (loggedIn) {
    redirect("/home");
  }
  // redirect needs to be wrapped inside startTransition to be able to be called in setTimeout
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const [isRegisteredFailed, setIsRegisteredFailed] = useState(false);
  const [registerErrorMessage, setRegisterErrorMessage] = useState("");

  async function onSubmit(credentials: z.infer<typeof formSchema>) {
    const response = await apiClient.POST("/auth/register/", { body: { email: credentials.email, password: credentials.password } });
    if (response.error) {
      form.setValue("password", "", { shouldDirty: true });
      form.setValue("confirmPassword", "", { shouldDirty: true });
      form.setValue("email", "", { shouldDirty: true });
      setIsRegisteredFailed(true);
      setRegisterErrorMessage(response.error.message);
    } else {
      setIsRegisteredFailed(false);
      setRegisterErrorMessage("");
      toast({
        title: "Register successfully",
        description: "Redirecting to login page...",
        variant: "safe",
      });
      setTimeout(() => startTransition(() => redirect("/login")), 2000);
    }
    return false;
  }

  return <div className="flex flex-row min-h-screen justify-center items-center">
    <Card className="p-16 w-384">
      <CardHeader>
        <CardTitle className="flex flex-col items-center">
          <Image
            src="/brand-logo.png"
            width={500}
            height={500}
            className="w-96 h-96"
            alt="Brand logo"
          />
          <span className="text-primary-slightly-dark">Signup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-16">
        {
          isRegisteredFailed &&
          <Alert className="bg-danger-very-light" variant="danger">
            <AlertCircle className="h-24 w-16"/>
            <AlertTitle>Register Failed</AlertTitle>
            <AlertDescription>
              {registerErrorMessage}
            </AlertDescription>
          </Alert>
        }
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-16">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@domain.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-16">Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-16">Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="confirm" size="lg" className="w-full" type="submit">Signup</Button>
            <Link href="/login" className="text-center pt-12 block text-neutral-dark">Already have an account? Login</Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  </div>
}
