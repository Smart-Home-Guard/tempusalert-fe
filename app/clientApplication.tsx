"use client"

import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/apiClient";
import { urlBase64ToUint8Array } from "@/lib/utils";
import { useEmailStore, useInitStores, useJwtStore, useNotificationPushedStore } from "@/store";
import { useEffect } from "react";

export default function ClientApplication({ children }: PropsWithChildren<{}>) {
    useInitStores();

    const { toast } = useToast();
    const { email } = useEmailStore();
    const { jwt } = useJwtStore();
    const { notificationPushed, setNotificationPushed } = useNotificationPushedStore();

    async function pushNotificationRegister() {
        const permission = await window.Notification.requestPermission();
        const applicationServerKey = urlBase64ToUint8Array(await apiClient.GET("/api/push-credential/public-key").then(({ data }) => data!));
        if (permission === "granted") {
            const registration = await navigator.serviceWorker.register("/push-notification-listener.js")
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey,
            });
            const { data, error } = await apiClient.POST("/api/push-credential/{email}", {
                params: { path: { email } },
                body: {
                    credential: {
                        email,
                        endpoint: subscription.endpoint,
                        key: {
                            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))),
                            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))),
                        }
                    }
                },
                headers: {
                    jwt,
                }
            });

            if (data) {
                toast({
                    title: "Successful push subscription",
                    description: data.message,
                    variant: "safe",
                });
                setNotificationPushed(true);
            } else {
                toast({
                    title: "Failed push subscription",
                    description: error.message,
                    variant: "destructive",
                });
            }
        }
    }

    useEffect(() => {
        if (email && !notificationPushed) {
            pushNotificationRegister();
        }
    }, [email, notificationPushed]);

    return <> { children } </>
}