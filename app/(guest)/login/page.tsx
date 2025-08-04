'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {authRepository} from "@/repository/auth";
import {useToast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";
import {TokenUtil} from "@/utils/token";
import {store} from "@/store";
import {useEffect} from "react";


export default function Login() {
    const router = useRouter()
    const { toast } = useToast();

    useEffect(() => {
        const refreshToken = async () => {
            if (TokenUtil.refreshToken) {
                const resp = await authRepository.api.refreshToken();
                if (resp.statusCode == '201') {
                    TokenUtil.setRefreshToken(resp?.data?.access_token)
                }
            }
        }
        refreshToken();
    }, []);

    const formSchema = z.object({
        email: z.string(),
        password: z.string()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const resp = await store.auth.login(values.email, values.password)
            toast({
                title: 'Login Success'
            });
            router.push('/')
            return;
        }catch (e: any) {
            toast({
                variant: 'destructive',
                title: e?.message,
            });
            return;
        }
        // console.log(resp)
        // if (resp.statusCode != 200 || resp.statusCode != 201) {
        //     toast({
        //         variant: 'destructive',
        //         title: resp?.message,
        //     });
        //     return;
        // } else if (resp.statusCode == 200) {
        //     toast({
        //         title: 'Login Success'
        //     });
        //     router.push('/home')
        //     return;
        // }
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <Card className="mx-auto max-w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>Enter your email and password to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField control={form.control} render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type={'email'} placeholder={'m@example.com'} required {...field}></Input>
                                    </FormControl>
                                </FormItem>
                            )} name={'email'}>
                            </FormField>
                            <FormField control={form.control} render={({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type={'password'} required {...field}></Input>
                                    </FormControl>
                                </FormItem>
                            )} name={'password'}>
                            </FormField>
                            <Button type={'submit'} className={'w-full mt-4'}>Login</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}