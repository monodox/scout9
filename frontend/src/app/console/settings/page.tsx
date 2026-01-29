import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@/components/ui/select'
import { User, Bell, Key, Database, Palette, Globe } from 'lucide-react'

export default function Settings() {
  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and application settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your display name"
                  className="mt-2 max-w-md"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="mt-2 max-w-md"
                />
              </div>
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  type="text"
                  placeholder="Your team name"
                  className="mt-2 max-w-md"
                />
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox id="emailNotifications" className="mt-1" />
                <div>
                  <Label htmlFor="emailNotifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about scouting runs and reports
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="reportAlerts" className="mt-1" />
                <div>
                  <Label htmlFor="reportAlerts" className="font-medium">
                    Report Completion Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when analysis reports are ready
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="weeklyDigest" className="mt-1" />
                <div>
                  <Label htmlFor="weeklyDigest" className="font-medium">
                    Weekly Digest
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary of insights and trends
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Palette className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select id="theme" className="mt-2 max-w-xs">
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="compactMode" className="mt-1" />
                <div>
                  <Label htmlFor="compactMode" className="font-medium">
                    Compact Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing for more content density
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* API Configuration */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Database className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">API Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gridApiKey">GRID API Key</Label>
                <Input
                  id="gridApiKey"
                  type="password"
                  placeholder="Enter your GRID API key"
                  className="mt-2 max-w-md"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Required for accessing official match data
                </p>
              </div>
              <div>
                <Label htmlFor="apiRegion">API Region</Label>
                <Select id="apiRegion" className="mt-2 max-w-xs">
                  <option value="global">Global</option>
                  <option value="na">North America</option>
                  <option value="eu">Europe</option>
                  <option value="asia">Asia</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Language & Region */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Globe className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Language & Region</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select id="language" className="mt-2 max-w-xs">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ko">한국어</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select id="timezone" className="mt-2 max-w-xs">
                  <option value="utc">UTC</option>
                  <option value="est">EST (UTC-5)</option>
                  <option value="pst">PST (UTC-8)</option>
                  <option value="cet">CET (UTC+1)</option>
                  <option value="kst">KST (UTC+9)</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Key className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Button variant="outline">Change Password</Button>
              </div>
              <div>
                <Button variant="outline">Enable Two-Factor Authentication</Button>
              </div>
              <div>
                <Button variant="outline">View Active Sessions</Button>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button>Save Changes</Button>
            <Button variant="outline">Reset to Defaults</Button>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  )
}
