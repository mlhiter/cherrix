'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiKey, UserRole } from '@prisma/client'
import { Plus, SettingsIcon, Upload } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'
import { ApiKeyForm } from '@/components/api-keys/api-key-form'
import { ApiKeyList } from '@/components/api-keys/api-key-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, Form, FormMessage, FormDescription } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { SettingsSchema } from '@/schemas'
import { settings } from '@/actions/settings'
import { useCurrentUser } from '@/hooks/use-current-user'

export const SettingsDialog = () => {
  const user = useCurrentUser()
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const { update } = useSession()
  const [isPending, startTransition] = useTransition()
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      newPassword: '',
      isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
      role: user?.role || UserRole.USER,
    },
  })

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-key')
      if (!response.ok) throw new Error('Failed to fetch API keys')
      const data = await response.json()
      setApiKeys(data.apiKeys)
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error)
          }
          if (data.success) {
            update()
            setSuccess(data.success)
          }
        })
        .catch(() => {
          setError('Something went wrong')
        })
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', e.target.files[0])

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.details || 'Upload failed')
        }

        const data = await response.json()
        if (data.success) {
          form.setValue('image', data.url)
          setSuccess('Avatar uploaded successfully')
          update()
        } else {
          throw new Error(data.details || 'Upload failed')
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to upload avatar')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex w-full items-center gap-x-4">
          <SettingsIcon className="h-4 w-4" />
          Settings
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-y-4">
                        <FormLabel>Avatar</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-x-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={field.value || user?.image || ''} />
                              <AvatarFallback className="text-lg">
                                {user?.name?.[0]?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isUploading}
                                onClick={() => document.getElementById('avatar-upload')?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploading ? 'Uploading...' : 'Upload Avatar'}
                              </Button>
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {user?.isOAuth === false && (
                    <>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Email" type="email" />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="******" type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="******" type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                            <SelectItem value={UserRole.USER}>User</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {user?.isOAuth === false && (
                    <FormField
                      control={form.control}
                      name="isTwoFactorEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Two Factor Authentication</FormLabel>
                            <FormDescription>Enable two factor authentication for your account</FormDescription>
                          </div>
                          <FormControl>
                            <Switch disabled={isPending} checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <FormError message={error} />
                <FormSuccess message={success} />
                <Button type="submit">Save</Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="api-keys">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsApiKeyDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add API Key
                </Button>
              </div>
              <ApiKeyList fetchApiKeys={fetchApiKeys} apiKeys={apiKeys} isLoading={isLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API Key</DialogTitle>
          </DialogHeader>
          <ApiKeyForm
            onSuccess={() => {
              setIsApiKeyDialogOpen(false)
              fetchApiKeys()
            }}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
