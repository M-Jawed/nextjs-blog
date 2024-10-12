'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['paid','pending']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id:true, date:true,});

export async function createInvoices(formData: FormData) {
    
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

   try {
    await sql `
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amount}, ${status}, ${date})
`;
   } catch (error) {
    return {
        message: 'Database Error: Could not Create Invoices'
    }
   }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true});


export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql `
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;
    } catch (error) {
        return {
            message: 'Database Error: Could not Update Invoices'
        }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoiceButton(id: string) {
    throw new Error('Failed to delete invoice');
        try {
        await sql `
        DELETE FROM invoices WHERE id = ${id}
    `;
    } catch (error) {
        return {
            message: 'Database Error: Could not Delete Invoices'
        }
    }
    revalidatePath('/dashboard/invoices');
}
