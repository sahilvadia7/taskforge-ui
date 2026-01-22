import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FormQuestion {
    id: string;
    type: string;
    title: string;
    required: boolean;
    options?: string[];
}

export interface Form {
    id: string;
    title: string;
    description?: string;
    questions: FormQuestion[];
    createdAt: string;
    updatedAt: string;
    status: 'Draft' | 'Active';
    responses: number;
}

interface FormStore {
    forms: Form[];
    addForm: (form: Form) => void;
    updateForm: (id: string, updates: Partial<Form>) => void;
    deleteForm: (id: string) => void;
    getForm: (id: string) => Form | undefined;
}

export const useFormStore = create<FormStore>()(
    persist(
        (set, get) => ({
            forms: [],
            addForm: (form) => set((state) => ({ forms: [form, ...state.forms] })),
            updateForm: (id, updates) =>
                set((state) => ({
                    forms: state.forms.map((f) =>
                        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
                    ),
                })),
            deleteForm: (id) =>
                set((state) => ({ forms: state.forms.filter((f) => f.id !== id) })),
            getForm: (id) => get().forms.find((f) => f.id === id),
        }),
        {
            name: 'taskforge-forms',
        }
    )
);
