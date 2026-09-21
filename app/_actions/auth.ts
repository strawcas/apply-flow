"use server";

import { createClient } from "@/app/_lib/supabase";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email");
    const password = formData.get("password");
    const fullName = formData.get("fullName");

    if (typeof email !== "string" || typeof password !== "string" || typeof fullName !== "string") {
        throw new Error("Invalid form data");
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                fullName,
            },
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    console.log(data.user);

    redirect("/confirm-email");
}
