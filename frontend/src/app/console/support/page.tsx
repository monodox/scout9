import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { HelpCircle, MessageSquare, Book, FileQuestion, Mail, Github, MessageCircle } from 'lucide-react'

export default function Support() {
  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground mt-1">
            Get help and support for Scout9
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Contact Support</h2>
              </div>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="How can we help?"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select id="category" className="mt-2" required>
                    <option value="">Select a category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="inquiry">General Inquiry</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select id="priority" className="mt-2">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Describe your issue or question in detail..."
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="mt-2"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll use this to respond to your request
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Submit Support Request
                </Button>
              </form>
            </Card>

            {/* FAQ Section */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <HelpCircle className="w-5 h-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-3 hover:bg-accent rounded-lg">
                    <span className="font-medium">How do I get started with Scout9?</span>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2 p-3">
                    Start by configuring your GRID API key in Settings, then navigate to the Scout page to run your first analysis.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-3 hover:bg-accent rounded-lg">
                    <span className="font-medium">How do I configure the GRID API?</span>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2 p-3">
                    Go to Settings → API Configuration and enter your GRID API key. You can obtain a key from the GRID website.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-3 hover:bg-accent rounded-lg">
                    <span className="font-medium">Can I export reports?</span>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2 p-3">
                    Yes! Reports can be exported in PDF, CSV, or JSON formats from the Reports page.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-3 hover:bg-accent rounded-lg">
                    <span className="font-medium">How often is data updated?</span>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2 p-3">
                    Data is updated in real-time through the GRID API. Analysis runs fetch the latest available match data.
                  </p>
                </details>
              </div>
            </Card>
          </div>

          {/* Resources Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-start space-x-3 p-3 hover:bg-accent rounded-lg transition-colors">
                  <Book className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Documentation</div>
                    <div className="text-sm text-muted-foreground">
                      Complete guides and tutorials
                    </div>
                  </div>
                </a>
                <a href="#" className="flex items-start space-x-3 p-3 hover:bg-accent rounded-lg transition-colors">
                  <FileQuestion className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">API Reference</div>
                    <div className="text-sm text-muted-foreground">
                      Technical API documentation
                    </div>
                  </div>
                </a>
                <a href="#" className="flex items-start space-x-3 p-3 hover:bg-accent rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Community Forums</div>
                    <div className="text-sm text-muted-foreground">
                      Connect with other users
                    </div>
                  </div>
                </a>
                <a href="#" className="flex items-start space-x-3 p-3 hover:bg-accent rounded-lg transition-colors">
                  <Github className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">GitHub</div>
                    <div className="text-sm text-muted-foreground">
                      Report issues and contribute
                    </div>
                  </div>
                </a>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">support@scout9.com</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Response Time</div>
                    <div className="text-muted-foreground">Within 24 hours</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Need Help?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Our support team is here to assist you with any questions or issues.
              </p>
              <Button variant="outline" className="w-full">
                Chat with Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  )
}
