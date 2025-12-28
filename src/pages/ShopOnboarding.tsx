import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

const COMMON_SERVICES = [
  'Black & White Printing', 'Color Printing', 'Spiral Binding', 'Hard Binding', 'Lamination',
  'Stapling', 'Folding', 'Cutting / Trimming', 'Large Format (Poster/Banner)', 'ID Card Printing',
  'Scanning', 'Photocopy', 'Thesis Binding', 'Booklet Making',
]

const COMMON_RESOURCES = [
  'A4 Paper', 'A3 Paper', 'A5 Paper', 'Legal Size', 'Letter Size', 'Glossy Paper', 'Matte Paper',
  'Card Stock', 'Sticker Paper', 'Color Printer', 'B/W Printer', 'High-Speed Printer', 'Laser Printer', 'Inkjet Printer',
]

export default function ShopOnboarding() {
  const navigate = useNavigate()

  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedResources, setSelectedResources] = useState<string[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const toggleService = (service: string) => {
    setSelectedServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service])
  }

  const toggleResource = (resource: string) => {
    setSelectedResources(prev => prev.includes(resource) ? prev.filter(r => r !== resource) : [...prev, resource])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopName.trim() || !phone.trim() || !location.trim() || selectedServices.length === 0) {
      alert('Please fill required fields')
      return
    }

    console.log('Shop Data:', { shopName, phone, location, imagePreview, services: selectedServices, resources: selectedResources })
    alert('Shop registered! Redirecting to dashboard...')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Complete Your Shop Profile</CardTitle>
          <CardDescription className="text-center text-lg">
            Tell us about your print shop so students can find you!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={imagePreview || ''} />
                <AvatarFallback className="text-2xl">Shop</AvatarFallback>
              </Avatar>
              <Label htmlFor="shop-image" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>Upload Shop Photo (Optional)</span>
                </Button>
                <Input id="shop-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </Label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop Name *</Label>
                <Input id="shop-name" placeholder="e.g. QuickPrint Hub" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Shop Location / Address *</Label>
              <Textarea id="location" placeholder="Full address..." rows={3} value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>

            <div className="space-y-4">
              <Label>Services You Offer * (select all that apply)</Label>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMMON_SERVICES.map(service => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox id={`service-${service}`} checked={selectedServices.includes(service)} onCheckedChange={() => toggleService(service)} />
                      <label htmlFor={`service-${service}`} className="text-sm font-medium cursor-pointer">{service}</label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-4">
              <Label>Resources & Printers Available</Label>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMMON_RESOURCES.map(resource => (
                    <div key={resource} className="flex items-center space-x-2">
                      <Checkbox id={`resource-${resource}`} checked={selectedResources.includes(resource)} onCheckedChange={() => toggleResource(resource)} />
                      <label htmlFor={`resource-${resource}`} className="text-sm font-medium cursor-pointer">{resource}</label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <CardFooter className="flex justify-end pt-6">
              <Button type="submit" size="lg" className="w-full md:w-auto px-10">Complete Setup & Go to Dashboard</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}