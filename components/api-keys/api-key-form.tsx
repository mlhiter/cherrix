'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'

const ApiKeySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  apiKey: z.string().min(1, 'API Key is required'),
  baseUrl: z.string().min(1, 'Base URL is required'),
  modelId: z.string().min(1, 'Model ID is required'),
  isActive: z.boolean().default(true),
})

type ApiKeyFormProps = {
  onSuccess?: () => void
  defaultValues?: z.infer<typeof ApiKeySchema>
  isEditing?: boolean
}

export function ApiKeyForm({
  onSuccess,
  defaultValues,
  isEditing = false,
}: ApiKeyFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const form = useForm<z.infer<typeof ApiKeySchema>>({
    resolver: zodResolver(ApiKeySchema),
    defaultValues: defaultValues || {
      name: '',
      apiKey: '',
      baseUrl: '',
      modelId: '',
      isActive: true,
    },
  })

  const onSubmit = (values: z.infer<typeof ApiKeySchema>) => {
    setError('')
    setSuccess('')

    startTransition(async () => {
      try {
        const url =
          isEditing && defaultValues?.id
            ? `/api/api-key/${defaultValues.id}`
            : '/api/api-key'

        const response = await fetch(url, {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Something went wrong')
          return
        }

        setSuccess(data.success)
        onSuccess?.()
      } catch (error) {
        setError('Something went wrong')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input {...field} type="password" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base URL</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button type="submit" disabled={isPending}>
          {isEditing ? 'Update API Key' : 'Create API Key'}
        </Button>
      </form>
    </Form>
  )
}
