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
import { useEffect, useState, useTransition } from "react";
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEmailStore, useJwtStore, useLoggedInStore, useNotificationPushedStore } from "@/store";

const formSchema = z.object({
  email: z.string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  password: z.string()
    .min(6, { message: "The password must contain at least 6 characters"}),
});

export default function LoginPage() {
  const { setJwt, removeJwt } = useJwtStore();
  const { setEmail, removeEmail } = useEmailStore();
  const { ready, loggedIn, setLoggedIn, removeLoggedIn } = useLoggedInStore();
  const { removeNotificationPushed } = useNotificationPushedStore();
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (ready && loggedIn) {
      startTransition(() => redirect("/home"));
    }
  }, [ready, loggedIn])

  // redirect can not be called asynchronously without being wrapped in startTransition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoggedInFailed, setIsLoggedInFailed] = useState(false);
  const [logInErrorMessage, setLogInErrorMessage] = useState("");

  async function onSubmit(credentials: z.infer<typeof formSchema>) {
    const response = await apiClient.POST("/auth/web/", { body: credentials });
    if (response.error) {
      removeJwt();
      removeEmail();
      removeLoggedIn();
      removeNotificationPushed();
      form.setValue('password', '', { shouldDirty: true });
      setIsLoggedInFailed(true);
      setLogInErrorMessage(response.error.message);
    } else {
      setJwt((response.data.token as any).Some);
      setLoggedIn(true);
      setEmail(credentials.email);
      setIsLoggedInFailed(false);
      setLogInErrorMessage("");
      startTransition(() => redirect("/home"));
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
          <span className="text-primary-slightly-dark">Login</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-16">
        {
          isLoggedInFailed &&
          <Alert className="bg-danger-very-light" variant="danger">
            <AlertCircle className="h-24 w-16"/>
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>
              {logInErrorMessage}
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
            <Button variant="confirm" size="lg" className="w-full" type="submit">Login</Button>
            <Link href="/signup" className="text-center pt-12 block text-neutral-dark">No account? Signup</Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  </div>
}
