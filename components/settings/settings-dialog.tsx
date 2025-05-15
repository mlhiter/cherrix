'use client'

import * as z from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { ApiKey, UserRole } from '@prisma/client'
import { useDebounceCallback } from 'usehooks-ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, SettingsIcon, Upload } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FormError } from '@/components/form-error'
import { ChangePasswordDialog } from './change-password-dialog'
import { ApiKeyForm } from '@/components/api-keys/api-key-form'
import { ApiKeyList } from '@/components/api-keys/api-key-list'
import { FormControl, FormField, Form } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { SettingsSchema } from '@/schemas'
import { useCurrentUser } from '@/hooks/use-current-user'

export const SettingsDialog = () => {
  const user = useCurrentUser()
  const [error, setError] = useState<string | undefined>()
  const { update } = useSession()
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || '',
      role: user?.role || UserRole.USER,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
      image: user?.image || '',
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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
          const newValues = { ...form.getValues(), image: data.url }
          form.setValue('image', data.url)
          handleSettingChange(newValues)
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

  const handleSettingChange = async (values: z.infer<typeof SettingsSchema>) => {
    console.log('handleSettingChange')
    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        return
      }

      update()
    } catch (error) {
      setError('Failed to update settings')
    }
  }
  const debouncedSettingChange = useDebounceCallback(handleSettingChange, 2000)

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
              <div className="space-y-4">
                {/* avatar */}
                <div className="flex items-center gap-x-6 py-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.image || ''} />
                    <AvatarFallback className="text-lg">{user?.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-y-1">
                    <h4 className="text-sm font-medium">Profile Picture</h4>
                    <p className="text-xs text-muted-foreground">Change your profile picture</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => document.getElementById('avatar-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? 'Uploading...' : 'Upload'}
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

                {/* username */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">User Name</label>
                      <p className="text-xs text-muted-foreground">This is your username</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            placeholder="Name"
                            className="max-w-[200px]"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              debouncedSettingChange(form.getValues())
                            }}
                          />
                        </FormControl>
                      )}
                    />
                  </div>

                  {/* email */}
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-xs text-muted-foreground">Your email address</p>
                    </div>
                    <Input value={user?.email || ''} disabled className="max-w-[200px] bg-muted" />
                  </div>

                  {/* password */}
                  {user?.isOAuth === false && (
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Password</label>
                        <p className="text-xs text-muted-foreground">Change your password</p>
                      </div>
                      <ChangePasswordDialog />
                    </div>
                  )}

                  {/* role */}
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Role</label>
                      <p className="text-xs text-muted-foreground">Your account role</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <Select
                          defaultValue={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleSettingChange(form.getValues())
                          }}>
                          <FormControl>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select a Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                            <SelectItem value={UserRole.USER}>User</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* two factor authentication */}
                  {user?.isOAuth === false && (
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Two Factor Authentication</label>
                        <p className="text-xs text-muted-foreground">
                          Enable two factor authentication for your account
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="isTwoFactorEnabled"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                handleSettingChange(form.getValues())
                              }}
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                  )}
                </div>
                <FormError message={error} />
              </div>
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
