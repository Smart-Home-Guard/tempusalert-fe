"use client"

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

const formSchema = z.object({
  email: z.string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  password: z.string()
    .min(6, { message: "The password must contain at least 6 characters"}),
});

export default function LoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Handle login request
    console.log(values)
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
      <CardContent className="py-14">
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
          </form>
        </Form>
      </CardContent>
    </Card>
  </div>
}
