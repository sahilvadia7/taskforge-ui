"use client";

import { use, useState, useEffect } from "react";
import { FormBuilder } from "@/features/forms/components/form-builder";
import { useFormStore } from "@/store/use-form-store";
import { useRouter } from "next/navigation";

interface EditFormPageProps {
    params: Promise<{
        projectId: string;
        formId: string;
    }>;
}

export default function EditFormPage({ params }: EditFormPageProps) {
    const { formId } = use(params);
    const { getForm } = useFormStore();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // We get the form data directly from the store
    const form = getForm(formId);

    // Provide effect to redirect if not found, but only after mount to avoid server redirects
    useEffect(() => {
        if (isMounted && !form) {
            router.push("..");
        }
    }, [isMounted, form, router]);

    if (!isMounted) return null;
    if (!form) return null;

    return <FormBuilder initialData={form} />;
}
